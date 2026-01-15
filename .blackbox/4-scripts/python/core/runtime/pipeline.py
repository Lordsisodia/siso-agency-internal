#!/usr/bin/env python3
"""
Two-Phase Pipeline for Blackbox3
Separates Planning (Analyst → PM → Architect) from Building (Dev → QA)

Based on BMAD-METHOD: https://github.com/bmad-code-org/BMAD-METHOD
"""

from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
import yaml
import json

from .phases.plan_phase import PlanPhase
from .phases.build_phase import BuildPhase
from ..validation.blueprint_validator import BlueprintValidator
from .manifest import ManifestManager
from ..integrations.github import GitHubAutoPush


class TwoPhasePipeline:
    """
    Orchestrates the two-phase BMAD pipeline:

    Phase 1: PLAN (Analyst → PM → Architect)
      - Input: User requirements
      - Process: Analysis → Stories → Architecture
      - Output: Deterministic Blueprint artifact

    Phase 2: BUILD (Dev → QA)
      - Input: Blueprint artifact
      - Process: Implementation → Validation
      - Output: Working code + test results

    Key Benefits:
    - No prompt drift (blueprint is deterministic)
    - Clear separation of concerns
    - Replayable and debuggable
    - Each phase can be optimized independently
    """

    def __init__(self, blackbox_root: Path, enable_tracking: bool = True):
        self.blackbox_root = Path(blackbox_root)
        self.artifacts_dir = self.blackbox_root / ".blackbox3" / "artifacts"
        self.blueprints_dir = self.artifacts_dir / "blueprints"

        # Ensure directories exist
        self.blueprints_dir.mkdir(parents=True, exist_ok=True)

        # Initialize phases
        self.plan_phase = PlanPhase(blackbox_root)
        self.build_phase = BuildPhase(blackbox_root)

        # Blueprint validator
        self.validator = BlueprintValidator(blackbox_root)

        # Run manifest tracking
        self.enable_tracking = enable_tracking
        if enable_tracking:
            self.manifest_manager = ManifestManager(blackbox_root)
            self.github = GitHubAutoPush(blackbox_root, enabled=True)
        else:
            self.manifest_manager = None
            self.github = None

    def execute_plan_phase(self,
                          requirements_path: Path,
                          blueprint_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute Phase 1: Planning

        Sequence:
        1. Load requirements
        2. Analyst: Requirements analysis
        3. PM: User stories + roadmap
        4. Architect: Technical design
        5. Validate blueprint completeness
        6. Save blueprint artifact

        Args:
            requirements_path: Path to requirements document
            blueprint_name: Optional name for blueprint

        Returns:
            Blueprint dictionary
        """
        print(f"\n{'='*60}")
        print(f"🎯 PHASE 1: PLAN")
        print(f"{'='*60}\n")

        # Create manifest for tracking
        manifest = None
        if self.enable_tracking:
            task_name = requirements_path.stem
            manifest = self.manifest_manager.create_manifest(
                agent="orchestrator",
                phase="plan",
                model_profile="balanced",
                task_name=task_name
            )
            manifest.set_input("requirements", str(requirements_path))
            manifest.log_step("plan_phase_start", "success", 0)

        # Load requirements
        requirements = self._load_requirements(requirements_path)
        print(f"✅ Requirements loaded: {requirements_path}")

        # Execute plan phase
        blueprint = self.plan_phase.execute(requirements)

        # Validate blueprint
        print("\n🔍 Validating blueprint...")
        validation_result = self.validator.validate(blueprint)

        if not validation_result['valid']:
            print(f"⚠️  Blueprint validation failed:")
            for error in validation_result['errors']:
                print(f"   - {error}")
            raise ValueError("Blueprint validation failed")

        print(f"✅ Blueprint validated successfully")

        # Save blueprint
        if blueprint_name is None:
            blueprint_name = f"{datetime.now().strftime('%Y-%m-%d_%H%M')}_blueprint"

        blueprint_path = self.blueprints_dir / f"{blueprint_name}.yaml"
        self._save_blueprint(blueprint, blueprint_path)
        print(f"✅ Blueprint saved: {blueprint_path}")

        # Create human-readable summary
        self._create_blueprint_summary(blueprint, blueprint_path)

        # Finalize manifest
        if manifest:
            manifest.add_output("files_created", str(blueprint_path))
            manifest.add_output("documentation", str(blueprint_path.with_suffix('.md')))
            manifest.set_validation_results(True, len(validation_result.get('errors', [])), 0)
            manifest.finalize()

            # Sync to GitHub if enabled
            if self.github and self.github.is_enabled():
                print("\n📤 Syncing to GitHub...")
                sync_result = self.github.sync_run(
                    run_id=manifest.run_id,
                    manifest_data=manifest.data,
                    manifest_path=self.manifest_manager.manifest_dir / f"{manifest.run_id}.yaml",
                    push=True,
                    tag=True
                )

                if sync_result.get("success"):
                    print(f"✅ Synced to GitHub: {self.github.get_repo_url()}")
                else:
                    print(f"⚠️  GitHub sync failed: {sync_result.get('push_error', 'Unknown error')}")

        print(f"\n{'='*60}")
        print(f"✅ PHASE 1 COMPLETE: Blueprint created")
        if manifest:
            print(f"📊 Run ID: {manifest.run_id}")
        print(f"{'='*60}\n")

        return blueprint

    def execute_build_phase(self,
                          blueprint_path: Path,
                          output_dir: Optional[Path] = None) -> Dict[str, Any]:
        """
        Execute Phase 2: Build

        Sequence:
        1. Load blueprint
        2. Validate blueprint integrity
        3. Dev: Implementation from blueprint
        4. QA: Validation against blueprint
        5. Save artifacts

        Args:
            blueprint_path: Path to blueprint YAML
            output_dir: Optional output directory for artifacts

        Returns:
            Build artifacts dictionary
        """
        print(f"\n{'='*60}")
        print(f"🔨 PHASE 2: BUILD")
        print(f"{'='*60}\n")

        # Load blueprint
        blueprint = self._load_blueprint(blueprint_path)
        print(f"✅ Blueprint loaded: {blueprint_path}")

        # Validate blueprint
        print("\n🔍 Validating blueprint integrity...")
        validation_result = self.validator.validate(blueprint)

        if not validation_result['valid']:
            print(f"⚠️  Blueprint validation failed:")
            for error in validation_result['errors']:
                print(f"   - {error}")
            raise ValueError("Invalid blueprint")

        print(f"✅ Blueprint validated successfully")

        # Execute build phase
        artifacts = self.build_phase.execute(blueprint, output_dir)

        print(f"\n{'='*60}")
        print(f"✅ PHASE 2 COMPLETE: Artifacts created")
        print(f"{'='*60}\n")

        return artifacts

    def execute_full_pipeline(self,
                            requirements_path: Path,
                            blueprint_name: Optional[str] = None,
                            output_dir: Optional[Path] = None) -> Dict[str, Any]:
        """
        Execute complete two-phase pipeline

        Sequence:
        1. Execute Plan Phase → Blueprint
        2. Execute Build Phase → Artifacts

        Args:
            requirements_path: Path to requirements
            blueprint_name: Optional blueprint name
            output_dir: Optional output directory

        Returns:
            Dictionary with blueprint and artifacts
        """
        print(f"\n{'='*60}")
        print(f"🚀 FULL PIPELINE: Plan → Build")
        print(f"{'='*60}\n")

        # Phase 1: Plan
        blueprint = self.execute_plan_phase(requirements_path, blueprint_name)

        # Find the blueprint file
        if blueprint_name:
            blueprint_path = self.blueprints_dir / f"{blueprint_name}.yaml"
        else:
            # Find most recent blueprint
            blueprint_path = max(self.blueprints_dir.glob("*.yaml"), key=lambda p: p.stat().st_mtime)

        # Phase 2: Build
        artifacts = self.execute_build_phase(blueprint_path, output_dir)

        print(f"\n{'='*60}")
        print(f"🎉 FULL PIPELINE COMPLETE")
        print(f"{'='*60}")
        print(f"Blueprint: {blueprint_path}")
        print(f"Artifacts: {artifacts.get('output_dir', 'N/A')}")
        print(f"{'='*60}\n")

        return {
            "blueprint": blueprint,
            "blueprint_path": blueprint_path,
            "artifacts": artifacts
        }

    def _load_requirements(self, requirements_path: Path) -> Dict[str, Any]:
        """Load requirements from file"""
        if requirements_path.suffix == '.yaml':
            with open(requirements_path, 'r') as f:
                return yaml.safe_load(f)
        elif requirements_path.suffix == '.json':
            with open(requirements_path, 'r') as f:
                return json.load(f)
        else:
            # Assume markdown, parse frontmatter
            return self._parse_markdown_requirements(requirements_path)

    def _parse_markdown_requirements(self, md_path: Path) -> Dict[str, Any]:
        """Parse requirements from markdown file"""
        content = md_path.read_text()

        # Simple parsing - look for key sections
        requirements = {
            "title": "",
            "description": "",
            "user_stories": [],
            "constraints": [],
            "acceptance_criteria": []
        }

        lines = content.split('\n')
        current_section = None

        for line in lines:
            if line.startswith('# '):
                requirements['title'] = line[2:].strip()
            elif line.startswith('## Description'):
                current_section = 'description'
            elif line.startswith('## User Stories'):
                current_section = 'user_stories'
            elif line.startswith('## Constraints'):
                current_section = 'constraints'
            elif line.startswith('## Acceptance Criteria'):
                current_section = 'acceptance_criteria'
            elif line.strip().startswith('- '):
                item = line.strip()[2:]
                if current_section and current_section in requirements:
                    if isinstance(requirements[current_section], list):
                        requirements[current_section].append(item)
            elif current_section == 'description' and line.strip():
                if requirements['description']:
                    requirements['description'] += '\n' + line.strip()
                else:
                    requirements['description'] = line.strip()

        return requirements

    def _load_blueprint(self, blueprint_path: Path) -> Dict[str, Any]:
        """Load blueprint from YAML file"""
        with open(blueprint_path, 'r') as f:
            return yaml.safe_load(f)

    def _save_blueprint(self, blueprint: Dict[str, Any], blueprint_path: Path):
        """Save blueprint to YAML file"""
        with open(blueprint_path, 'w') as f:
            yaml.dump(blueprint, f, default_flow_style=False, sort_keys=False)

    def _create_blueprint_summary(self, blueprint: Dict[str, Any], blueprint_path: Path):
        """Create human-readable summary of blueprint"""
        summary_path = blueprint_path.with_suffix('.md')

        metadata = blueprint.get('blueprint', {}).get('metadata', {})
        requirements = blueprint.get('blueprint', {}).get('requirements', {})
        design = blueprint.get('blueprint', {}).get('design', {})
        validation = blueprint.get('blueprint', {}).get('validation', {})

        summary = f"""# Blueprint Summary

## Metadata
- **Name**: {metadata.get('name', 'N/A')}
- **Type**: {metadata.get('blueprint_type', 'N/A')}
- **Created By**: {metadata.get('created_by', 'N/A')}
- **Created At**: {metadata.get('created_at', 'N/A')}

## Requirements
### User Stories
{self._format_user_stories(requirements.get('user_stories', []))}

### Constraints
{self._format_list(requirements.get('constraints', []))}

## Design
### Architecture
{design.get('architecture', {}).get('overview', 'N/A')}

### Files to Create
{self._format_list(design.get('file_structure', {}).get('create', []))}

### Files to Modify
{self._format_list(design.get('file_structure', {}).get('modify', []))}

## Implementation
### Dependencies
{self._format_dependencies(blueprint.get('blueprint', {}).get('implementation', {}).get('dependencies', []))}

### Tasks
{self._format_tasks(blueprint.get('blueprint', {}).get('implementation', {}).get('tasks', []))}

## Validation
### Success Criteria
{self._format_list(validation.get('success_criteria', []))}

### Test Cases
{self._format_test_cases(validation.get('test_cases', []))}
"""

        summary_path.write_text(summary)
        print(f"✅ Blueprint summary created: {summary_path}")

    def _format_user_stories(self, stories: list) -> str:
        if not stories:
            return "No user stories defined."
        return "\n".join([
            f"- **{s.get('id', '')}: {s.get('title', '')}** (Priority: {s.get('priority', 'N/A')})"
            for s in stories
        ])

    def _format_list(self, items: list) -> str:
        if not items:
            return "None."
        return "\n".join([f"- {item}" for item in items])

    def _format_dependencies(self, deps: list) -> str:
        if not deps:
            return "No dependencies."
        return "\n".join([
            f"- **{dep.get('name', '')}** ({dep.get('version', 'any')}) - {dep.get('purpose', '')}"
            for dep in deps
        ])

    def _format_tasks(self, tasks: list) -> str:
        if not tasks:
            return "No tasks defined."
        return "\n".join([
            f"{i+1}. **{task.get('title', '')}** ({task.get('complexity', 'N/A')}) - {task.get('estimated_time', 'N/A')}"
            for i, task in enumerate(tasks)
        ])

    def _format_test_cases(self, cases: list) -> str:
        if not cases:
            return "No test cases defined."
        return "\n".join([
            f"**{case.get('scenario', '')}**\n  - Given: {case.get('given', '')}\n  - When: {case.get('when', '')}\n  - Then: {case.get('then', '')}"
            for case in cases
        ])


def main():
    """CLI entry point for pipeline"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Blackbox3 Two-Phase Pipeline"
    )
    parser.add_argument(
        "command",
        choices=["plan", "build", "run"],
        help="Command to execute"
    )
    parser.add_argument(
        "--requirements",
        type=Path,
        help="Path to requirements file (for plan/run)"
    )
    parser.add_argument(
        "--blueprint",
        type=Path,
        help="Path to blueprint file (for build)"
    )
    parser.add_argument(
        "--name",
        type=str,
        help="Blueprint name"
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output directory"
    )
    parser.add_argument(
        "--blackbox",
        type=Path,
        default=Path.cwd(),
        help="Path to Blackbox3 root"
    )

    args = parser.parse_args()

    pipeline = TwoPhasePipeline(args.blackbox)

    if args.command == "plan":
        if not args.requirements:
            parser.error("--requirements required for plan command")
        pipeline.execute_plan_phase(args.requirements, args.name)

    elif args.command == "build":
        if not args.blueprint:
            parser.error("--blueprint required for build command")
        pipeline.execute_build_phase(args.blueprint, args.output)

    elif args.command == "run":
        if not args.requirements:
            parser.error("--requirements required for run command")
        pipeline.execute_full_pipeline(args.requirements, args.name, args.output)


if __name__ == "__main__":
    main()
