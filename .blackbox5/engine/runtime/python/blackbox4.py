#!/usr/bin/env python3
"""
Blackbox3 CLI
Command-line interface for BMAD pipeline system
"""

import argparse
import sys
from pathlib import Path
from typing import Optional
import yaml

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.runtime.pipeline import TwoPhasePipeline
from core.runtime.manifest import ManifestManager
from core.blueprints.loader import BlueprintLoader, BlueprintGenerator
from core.scaffolder.scaffolder import TemplateScaffolder


class Blackbox3CLI:
    """Blackbox3 Command-Line Interface"""

    def __init__(self, blackbox_root: Optional[Path] = None):
        """
        Initialize CLI

        Args:
            blackbox_root: Path to Blackbox3 root (default: current directory)
        """
        self.blackbox_root = Path(blackbox_root) if blackbox_root else Path.cwd()

        # Find blackbox3 root if not specified
        if not (self.blackbox_root / "core").exists():
            self.blackbox_root = self._find_blackbox_root()

        self.pipeline = TwoPhasePipeline(self.blackbox_root)
        self.manifest_manager = ManifestManager(self.blackbox_root)
        self.blueprint_loader = BlueprintLoader(self.blackbox_root)
        self.blueprint_generator = BlueprintGenerator(self.blackbox_root)
        self.scaffolder = TemplateScaffolder(self.blackbox_root)

    def _find_blackbox_root(self) -> Path:
        """Find Blackbox3 root directory"""
        current = Path.cwd()

        # Search upward for blackbox3 directory
        for parent in [current, *current.parents]:
            if (parent / "core" / "runtime" / "pipeline.py").exists():
                return parent
            if (parent / ".blackbox3").exists():
                return parent / ".blackbox3"

        # Fallback to current directory
        return current

    def plan(self, requirements: Path, name: Optional[str] = None) -> int:
        """
        Execute plan phase

        Args:
            requirements: Path to requirements file
            name: Optional blueprint name

        Returns:
            Exit code
        """
        try:
            blueprint = self.pipeline.execute_plan_phase(requirements, name)
            print(f"\n✅ Blueprint created successfully")
            return 0
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return 1

    def build(self, blueprint: Path, output: Optional[Path] = None) -> int:
        """
        Execute build phase

        Args:
            blueprint: Path to blueprint file
            output: Optional output directory

        Returns:
            Exit code
        """
        try:
            artifacts = self.pipeline.execute_build_phase(blueprint, output)
            print(f"\n✅ Build completed successfully")
            return 0
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return 1

    def run(self, requirements: Path, name: Optional[str] = None,
           output: Optional[Path] = None) -> int:
        """
        Execute full pipeline (plan + build)

        Args:
            requirements: Path to requirements file
            name: Optional blueprint name
            output: Optional output directory

        Returns:
            Exit code
        """
        try:
            result = self.pipeline.execute_full_pipeline(requirements, name, output)
            blueprint_path = result.get('blueprint_path')
            artifacts = result.get('artifacts')

            print(f"\n✅ Full pipeline completed successfully")
            print(f"Blueprint: {blueprint_path}")
            if artifacts:
                print(f"Output: {artifacts.get('output_dir', 'N/A')}")
            return 0
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return 1

    def runs_list(self, agent: Optional[str] = None,
                  phase: Optional[str] = None) -> int:
        """
        List run manifests

        Args:
            agent: Optional agent filter
            phase: Optional phase filter

        Returns:
            Exit code
        """
        manifests = self.manifest_manager.list_manifests(agent, phase)

        if not manifests:
            print("No runs found")
            return 0

        print(f"\n{'='*60}")
        print(f"📊 RUN HISTORY ({len(manifests)} runs)")
        print(f"{'='*60}\n")

        for manifest in manifests[:20]:  # Show last 20
            status = "✅" if manifest.get('success') else "❌"
            print(f"{status} {manifest['run_id']}")
            print(f"   Agent: {manifest['agent']}, Phase: {manifest['phase']}")
            print(f"   Profile: {manifest['model_profile']}")
            print(f"   Started: {manifest.get('started_at', 'N/A')}")
            print(f"   Duration: {manifest.get('duration_seconds', 0):.1f}s")
            print(f"   Cost: ${manifest.get('estimated_cost', 0.0):.4f}")
            print()

        return 0

    def runs_show(self, run_id: str) -> int:
        """
        Show run details

        Args:
            run_id: Run ID

        Returns:
            Exit code
        """
        manifest_data = self.manifest_manager.get_manifest(run_id)

        if not manifest_data:
            print(f"❌ Run not found: {run_id}")
            return 1

        manifest = manifest_data.get('manifest', {})

        print(f"\n{'='*60}")
        print(f"📋 RUN DETAILS: {run_id}")
        print(f"{'='*60}\n")

        # Metadata
        print("📋 Metadata:")
        print(f"   Agent: {manifest.get('agent', 'N/A')}")
        print(f"   Phase: {manifest.get('phase', 'N/A')}")
        print(f"   Model Profile: {manifest.get('model_profile', 'N/A')}")
        print()

        # Timestamps
        timestamps = manifest.get('timestamps', {})
        print("⏰ Timestamps:")
        print(f"   Started: {timestamps.get('started_at', 'N/A')}")
        print(f"   Completed: {timestamps.get('completed_at', 'N/A')}")
        print(f"   Duration: {timestamps.get('duration_seconds', 0):.1f}s")
        print()

        # Metrics
        metrics = manifest.get('metrics', {})
        print("📊 Metrics:")
        print(f"   Total Tokens: {metrics.get('total_tokens', 0):,}")
        print(f"   Input Tokens: {metrics.get('input_tokens', 0):,}")
        print(f"   Output Tokens: {metrics.get('output_tokens', 0):,}")
        print(f"   Estimated Cost: ${metrics.get('estimated_cost', 0.0):.4f}")
        print(f"   Operations: {metrics.get('operations_count', 0)}")
        print(f"   Files Accessed: {metrics.get('files_accessed', 0)}")
        print()

        # Steps
        steps = manifest.get('steps', [])
        if steps:
            print("🔄 Steps:")
            for i, step in enumerate(steps, 1):
                status_icon = "✅" if step.get('status') == 'success' else "❌"
                print(f"   {i}. {status_icon} {step.get('action', 'unknown')}")
                print(f"      Status: {step.get('status')}")
                print(f"      Duration: {step.get('duration_ms', 0)}ms")
                if step.get('input_tokens'):
                    print(f"      Tokens: {step.get('input_tokens', 0)} in → {step.get('output_tokens', 0)} out")
            print()

        # Validation
        validation = manifest.get('validation', {})
        print("✅ Validation:")
        print(f"   Success: {validation.get('success', False)}")
        print(f"   Checks Passed: {validation.get('checks_passed', 0)}")
        print(f"   Checks Failed: {validation.get('checks_failed', 0)}")
        if validation.get('errors'):
            print("   Errors:")
            for error in validation.get('errors', [])[:3]:
                print(f"      - {error}")
        print()

        # Replay info
        print("🔄 Replay:")
        replay_cmd = manifest.get('replay', {}).get('replay_command', 'N/A')
        print(f"   Command: {replay_cmd}")
        print()

        return 0

    def blueprints_list(self, blueprint_type: Optional[str] = None) -> int:
        """
        List blueprints

        Args:
            blueprint_type: Optional type filter

        Returns:
            Exit code
        """
        generator = BlueprintGenerator(self.blackbox_root)
        blueprints = generator.list_blueprints(blueprint_type)

        if not blueprints:
            print("No blueprints found")
            return 0

        print(f"\n{'='*60}")
        print(f"📚 BLUEPRINTS ({len(blueprints)} total)")
        print(f"{'='*60}\n")

        for bp in blueprints:
            icon = {"feature": "✨", "bugfix": "🐛", "refactor": "🔧", "research": "🔬"}
            type_icon = icon.get(bp['type'], "📄")

            print(f"{type_icon} {bp['name']} ({bp['type'].upper()})")
            print(f"   File: {Path(bp['file']).name}")
            print(f"   Priority: {bp['priority']}, Complexity: {bp['complexity']}")
            print()

        return 0

    def blueprints_generate(self, blueprint_type: str,
                           title: str,
                           interactive: bool = False) -> int:
        """
        Generate blueprint interactively

        Args:
            blueprint_type: Type of blueprint
            title: Blueprint title
            interactive: Use interactive mode

        Returns:
            Exit code
        """
        if interactive:
            return self._blueprints_generate_interactive(blueprint_type, title)
        else:
            print("❌ Non-interactive mode not yet implemented")
            return 1

    def _blueprints_generate_interactive(self, blueprint_type: str, title: str) -> int:
        """Interactive blueprint generation"""
        print(f"\n{'='*60}")
        print(f"📝 GENERATE {blueprint_type.upper()} BLUEPRINT")
        print(f"{'='*60}\n")

        # Collect information based on type
        if blueprint_type == "feature":
            print("Creating feature blueprint...")
            description = input("Description: ")
            print("\nEnter user stories (format: 'title|as_a|i_want|so_that|priority')")
            print("Empty line to finish\n")

            user_stories = []
            while True:
                story_input = input("User story: ")
                if not story_input:
                    break
                parts = story_input.split('|')
                if len(parts) >= 4:
                    user_stories.append({
                        'title': parts[0].strip(),
                        'as_a': parts[1].strip(),
                        'i_want': parts[2].strip(),
                        'so_that': parts[3].strip(),
                        'priority': parts[4].strip() if len(parts) > 4 else 'medium'
                    })

            blueprint = self.blueprint_generator.generate_feature_blueprint(
                title=title,
                description=description,
                user_stories=user_stories
            )

        elif blueprint_type == "bugfix":
            print("Creating bugfix blueprint...")
            description = input("Bug description: ")
            severity = input("Severity (low|medium|high|critical): ")
            environment = input("Environment: ")

            blueprint = self.blueprint_generator.generate_bugfix_blueprint(
                title=title,
                bug_report={
                    'title': title,
                    'description': description,
                    'severity': severity,
                    'environment': environment
                }
            )

        else:
            print(f"❌ Interactive generation for '{blueprint_type}' not yet implemented")
            return 1

        # Save blueprint
        saved_path = self.blueprint_generator.save_blueprint(blueprint)

        print(f"\n✅ Blueprint saved: {saved_path}")
        return 0

    def agents_scaffold(self, name: str, agent_type: str = "simple",
                       domain: Optional[str] = None) -> int:
        """
        Scaffold new agent

        Args:
            name: Agent name
            agent_type: Type of agent
            domain: Optional domain (for expert agents)

        Returns:
            Exit code
        """
        options = {}
        if domain:
            options['domain'] = domain

        result = self.scaffolder.scaffold_agent(name, agent_type, options)

        if result['success']:
            print(f"\n✅ Agent created: {result['agent_name']}")
            print(f"   Type: {result['agent_type']}")
            print(f"   Directory: {result['directory']}")
            print(f"   Files: {len(result['files_created'])}")
            return 0
        else:
            print(f"\n❌ Error: {result.get('error')}")
            return 1

    def agents_list(self) -> int:
        """
        List available agent templates

        Returns:
            Exit code
        """
        templates = self.scaffolder.list_agent_templates()

        print(f"\n{'='*60}")
        print(f"🤖 AGENT TEMPLATES ({len(templates)} available)")
        print(f"{'='*60}\n")

        for template in templates:
            sidecar_icon = "📚" if template['sidecar'] else ""
            print(f"{sidecar_icon} {template['name'].lower()} ({template['type']})")
            print(f"   {template['description']}")
            print(f"   Complexity: {template['complexity']}")
            print()

        return 0

    def projects_scaffold(self, name: str, project_type: str = "minimal") -> int:
        """
        Scaffold new project

        Args:
            name: Project name
            project_type: Type of project

        Returns:
            Exit code
        """
        result = self.scaffolder.scaffold_project(name, project_type)

        if result['success']:
            print(f"\n✅ Project created: {result['project_name']}")
            print(f"   Type: {result['project_type']}")
            print(f"   Directory: {result['directory']}")
            print(f"   Files: {len(result['files_created'])}")
            return 0
        else:
            print(f"\n❌ Error: {result.get('error')}")
            return 1

    def projects_list(self) -> int:
        """
        List all projects

        Returns:
            Exit code
        """
        projects = self.scaffolder.list_projects()

        if not projects:
            print("No projects found")
            return 0

        print(f"\n{'='*60}")
        print(f"📁 PROJECTS ({len(projects)} total)")
        print(f"{'='*60}\n")

        for project in projects:
            type_icon = {"minimal": "📄", "standard": "📁", "multi_repo": "🔗"}
            icon = type_icon.get(project['type'], "📦")

            print(f"{icon} {project['name']} ({project['type']})")
            print(f"   Directory: {project['directory']}")
            print(f"   Created: {project.get('created_at', 'N/A')[:10]}")
            print()

        return 0

    def status(self) -> int:
        """
        Show system status

        Returns:
            Exit code
        """
        print(f"\n{'='*60}")
        print(f"📊 BLACKBOX3 STATUS")
        print(f"{'='*60}\n")

        # System info
        print("🖥️  System:")
        print(f"   Root: {self.blackbox_root}")
        print(f"   Python: {sys.version.split()[0]}")
        print()

        # Pipeline status
        print("🔄 Pipeline:")
        print(f"   Status: Ready")
        print(f"   Artifacts dir: {self.blackbox_root / '.blackbox3' / 'artifacts'}")
        print()

        # Manifests
        manifests = self.manifest_manager.list_manifests()
        stats = self.manifest_manager.get_statistics()

        print("📋 Runs:")
        print(f"   Total runs: {stats['total_runs']}")
        print(f"   Successful: {stats['successful_runs']}")
        print(f"   Failed: {stats['failed_runs']}")
        print(f"   Success rate: {stats['success_rate']:.1%}")
        print()

        # Blueprints
        blueprints = self.blueprint_generator.list_blueprints()
        print("📚 Blueprints:")
        print(f"   Total: {len(blueprints)}")
        by_type = {}
        for bp in blueprints:
            bp_type = bp['type']
            by_type[bp_type] = by_type.get(bp_type, 0) + 1
        for bp_type, count in by_type.items():
            print(f"   {bp_type}: {count}")
        print()

        # Projects
        projects = self.scaffolder.list_projects()
        print("📁 Projects:")
        print(f"   Total: {len(projects)}")
        for project in projects[:3]:
            print(f"   - {project['name']} ({project['type']})")
        print()

        return 0


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Blackbox3 CLI - BMAD Pipeline System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create blueprint from requirements
  blackbox3 plan requirements.yaml

  # Build from blueprint
  blackbox3 build blueprint.yaml

  # Run full pipeline
  blackbox3 run requirements.yaml

  # List runs
  blackbox3 runs list

  # Show run details
  blackbox3 runs show 2026-01-12_1400_orchestrator-plan_feature

  # List blueprints
  blackbox3 blueprints list

  # Scaffold agent
  blackbox3 agents scaffold my-agent --type expert

  # Scaffold project
  blackbox3 projects scaffold my-project --type standard

  # Show status
  blackbox3 status
        """
    )

    # Initialize CLI
    cli = Blackbox3CLI()

    # Subcommands
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Plan command
    plan_parser = subparsers.add_parser('plan', help='Execute plan phase')
    plan_parser.add_argument('requirements', type=Path, help='Path to requirements file')
    plan_parser.add_argument('--name', type=str, help='Blueprint name')

    # Build command
    build_parser = subparsers.add_parser('build', help='Execute build phase')
    build_parser.add_argument('blueprint', type=Path, help='Path to blueprint file')
    build_parser.add_argument('--output', type=Path, help='Output directory')

    # Run command
    run_parser = subparsers.add_parser('run', help='Execute full pipeline')
    run_parser.add_argument('requirements', type=Path, help='Path to requirements file')
    run_parser.add_argument('--name', type=str, help='Blueprint name')
    run_parser.add_argument('--output', type=Path, help='Output directory')

    # Runs commands
    runs_parser = subparsers.add_parser('runs', help='Manage runs')
    runs_subparsers = runs_parser.add_subparsers(dest='runs_command', help='Runs commands')

    runs_list_parser = runs_subparsers.add_parser('list', help='List runs')
    runs_list_parser.add_argument('--agent', type=str, help='Filter by agent')
    runs_list_parser.add_argument('--phase', type=str, help='Filter by phase')

    runs_show_parser = runs_subparsers.add_parser('show', help='Show run details')
    runs_show_parser.add_argument('run_id', type=str, help='Run ID')

    # Blueprints commands
    blueprints_parser = subparsers.add_parser('blueprints', help='Manage blueprints')
    blueprints_subparsers = blueprints_parser.add_subparsers(dest='blueprints_command', help='Blueprints commands')

    blueprints_list_parser = blueprints_subparsers.add_parser('list', help='List blueprints')
    blueprints_list_parser.add_argument('--type', type=str, help='Filter by type')

    blueprints_generate_parser = blueprints_subparsers.add_parser('generate', help='Generate blueprint')
    blueprints_generate_parser.add_argument('type', type=str, help='Blueprint type')
    blueprints_generate_parser.add_argument('title', type=str, help='Blueprint title')
    blueprints_generate_parser.add_argument('--interactive', action='store_true', help='Interactive mode')

    # Agents commands
    agents_parser = subparsers.add_parser('agents', help='Manage agents')
    agents_subparsers = agents_parser.add_subparsers(dest='agents_command', help='Agents commands')

    agents_list_parser = agents_subparsers.add_parser('list', help='List agent templates')

    agents_scaffold_parser = agents_subparsers.add_parser('scaffold', help='Scaffold agent')
    agents_scaffold_parser.add_argument('name', type=str, help='Agent name')
    agents_scaffold_parser.add_argument('--type', type=str, default='simple', help='Agent type')
    agents_scaffold_parser.add_argument('--domain', type=str, help='Domain (for expert agents)')

    # Projects commands
    projects_parser = subparsers.add_parser('projects', help='Manage projects')
    projects_subparsers = projects_parser.add_subparsers(dest='projects_command', help='Projects commands')

    projects_list_parser = projects_subparsers.add_parser('list', help='List projects')

    projects_scaffold_parser = projects_subparsers.add_parser('scaffold', help='Scaffold project')
    projects_scaffold_parser.add_argument('name', type=str, help='Project name')
    projects_scaffold_parser.add_argument('--type', type=str, default='minimal', help='Project type')

    # Status command
    subparsers.add_parser('status', help='Show system status')

    # Parse args
    args = parser.parse_args()

    # Execute command
    if args.command == 'plan':
        return cli.plan(args.requirements, args.name)

    elif args.command == 'build':
        return cli.build(args.blueprint, args.output)

    elif args.command == 'run':
        return cli.run(args.requirements, args.name, args.output)

    elif args.command == 'runs':
        if args.runs_command == 'list':
            return cli.runs_list(args.agent, args.phase)
        elif args.runs_command == 'show':
            return cli.runs_show(args.run_id)
        else:
            runs_parser.print_help()
            return 1

    elif args.command == 'blueprints':
        if args.blueprints_command == 'list':
            return cli.blueprints_list(args.type)
        elif args.blueprints_command == 'generate':
            return cli.blueprints_generate(args.type, args.title, args.interactive)
        else:
            blueprints_parser.print_help()
            return 1

    elif args.command == 'agents':
        if args.agents_command == 'list':
            return cli.agents_list()
        elif args.agents_command == 'scaffold':
            return cli.agents_scaffold(args.name, args.type, args.domain)
        else:
            agents_parser.print_help()
            return 1

    elif args.command == 'projects':
        if args.projects_command == 'list':
            return cli.projects_list()
        elif args.projects_command == 'scaffold':
            return cli.projects_scaffold(args.name, args.type)
        else:
            projects_parser.print_help()
            return 1

    elif args.command == 'status':
        return cli.status()

    else:
        parser.print_help()
        return 1


if __name__ == '__main__':
    sys.exit(main())
