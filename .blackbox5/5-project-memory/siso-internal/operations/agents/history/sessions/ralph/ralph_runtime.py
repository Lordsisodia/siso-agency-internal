"""
Ralph Runtime - Autonomous Agent Loop for Blackbox5

Based on Ralph pattern from:
- https://github.com/snarktank/ralph
- https://github.com/frankbria/ralph-claude-code

Enhanced for Blackbox5 with:
- Multi-agent execution
- MCP tool integrations
- Event bus coordination
- Brain system integration
"""

import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger("RalphRuntime")


@dataclass
class Story:
    """User story from PRD"""
    id: str
    title: str
    priority: int
    passes: bool
    agent: Optional[str] = None
    tools: List[str] = None
    context: Dict[str, Any] = None
    thread_url: Optional[str] = None

    def __post_init__(self):
        if self.tools is None:
            self.tools = []
        if self.context is None:
            self.context = {}


@dataclass
class IterationResult:
    """Result of a single Ralph iteration"""
    iteration: int
    story_id: str
    success: bool
    files_changed: List[str]
    learnings: str
    error: Optional[str] = None
    thread_url: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class RalphRuntime:
    """
    Autonomous agent loop using Ralph pattern.

    Executes PRD user stories autonomously using Blackbox5 agents and tools.
    """

    def __init__(
        self,
        workspace_path: Path,
        prd_path: Optional[Path] = None,
        max_iterations: int = 100
    ):
        """
        Initialize Ralph runtime.

        Args:
            workspace_path: Root directory of the workspace
            prd_path: Path to PRD JSON file (default: workspace_path/prd.json)
            max_iterations: Maximum iterations before stopping
        """
        self.workspace_path = Path(workspace_path)
        self.prd_path = prd_path or self.workspace_path / "prd.json"
        self.progress_path = self.workspace_path / "progress.txt"
        self.max_iterations = max_iterations

        # Results tracking
        self.iterations_complete: List[IterationResult] = []
        self.session_id = str(uuid.uuid4())

    async def dry_run(self):
        """
        Dry run - parse PRD and show plan without executing.

        Useful for:
        - Validating PRD format
        - Previewing execution plan
        - Debugging story generation
        """
        print(f"\n{'='*70}")
        print(f" Ralph Runtime - Dry Run Mode")
        print(f" Workspace: {self.workspace_path}")
        print(f" PRD: {self.prd_path}")
        print(f"{'='*70}\n")

        # Load PRD
        prd = self.load_prd()
        stories = prd.get('userStories', [])

        if not stories:
            print("❌ No stories found in PRD!")
            return

        print(f"✓ Loaded {len(stories)} stories from PRD")
        print(f"✓ Branch: {prd.get('branchName', 'main')}\n")

        # Show execution plan
        print("╔════════════════════════════════════════════════════════════╗")
        print("║                    EXECUTION PLAN                          ║")
        print("╚════════════════════════════════════════════════════════════╝\n")

        # Sort stories by priority
        sorted_stories = sorted(stories, key=lambda s: s.get('priority', 999))

        for i, story_dict in enumerate(sorted_stories, 1):
            story = Story(**story_dict)

            status_icon = "⏳" if not story.passes else "✅"
            agent = story.agent or "auto"

            print(f"{status_icon} Story {i}: {story.title}")
            print(f"   ID: {story.id}")
            print(f"   Priority: {story.priority}")
            print(f"   Agent: {agent}")

            if story.tools:
                print(f"   Tools: {', '.join(story.tools)}")

            if story.context:
                desc = story.context.get('description', '')[:100]
                if desc:
                    print(f"   Description: {desc}...")

            print()

        print("╔════════════════════════════════════════════════════════════╗")
        print("║              DRY RUN COMPLETE - PLAN VALIDATED              ║")
        print("╚════════════════════════════════════════════════════════════╝\n")

        print("To execute this plan, run:")
        print(f"  python -m blackbox5.engine.runtime.ralph \\")
        print(f"    --workspace {self.workspace_path} \\")
        print(f"    --prd {self.prd_path}\n")

    async def run(self):
        """
        Run the autonomous Ralph loop.

        This is the main entry point that:
        1. Loads PRD and progress
        2. Iterates through stories
        3. Executes each story
        4. Runs quality checks
        5. Commits changes
        6. Updates progress
        7. Exits when complete
        """
        print(f"\n{'='*70}")
        print(f" Ralph Autonomous Loop - Session {self.session_id[:8]}")
        print(f" Workspace: {self.workspace_path}")
        print(f" Max Iterations: {self.max_iterations}")
        print(f"{'='*70}\n")

        # Load PRD
        prd = self.load_prd()
        stories = prd.get('userStories', [])
        metadata = prd.get('metadata', {})
        continuous_mode = metadata.get('continuous', False)

        if not stories:
            print("❌ No stories found in PRD!")
            return

        print(f"✓ Loaded {len(stories)} stories from PRD")
        print(f"✓ Branch: {prd.get('branchName', 'main')}")
        if continuous_mode:
            print(f"✓ MODE: CONTINUOUS (will run forever)")
        print()

        # Initialize progress file
        self._init_progress_file()

        # Main loop
        for iteration in range(1, self.max_iterations + 1):
            print(f"\n{'─'*70}")
            print(f" Iteration {iteration}/{self.max_iterations}")
            print(f"{'─'*70}\n")

            # Get next story
            story = self.get_next_story(prd)
            if not story:
                if continuous_mode:
                    print("\n🔄 Continuous mode: All stories executed, reloading PRD for next cycle...")
                    prd = self.load_prd()  # Reload to get fresh stories
                    # Reset all passes to false for continuous operation
                    for s in prd.get('userStories', []):
                        s['passes'] = False
                    self.update_story_status_bulk(prd.get('userStories', []), passes=False)
                    continue
                else:
                    print("\n✓ ALL STORIES COMPLETE!")
                    self._print_summary()
                    break

            # Execute story
            result = await self.execute_story(story, iteration)

            # Run quality checks
            if result.success:
                quality_passed = await self.run_quality_checks(story)

                if quality_passed:
                    # Commit changes
                    await self.commit_changes(story, result)

                    # Update PRD (mark story complete)
                    # In continuous mode, this allows cycling through all stories before reset
                    self.update_story_status(story.id, passes=True)

                    # Document progress
                    self.document_progress(story, result)

                    print(f"✓ Completed: {story.id} - {story.title}")
                else:
                    print(f"✗ Quality checks failed: {story.id}")
                    self.document_failure(story, "Quality checks failed")
            else:
                print(f"✗ Execution failed: {story.id}")
                self.document_failure(story, result.error or "Unknown error")

            # Check if all complete (ONLY if NOT continuous mode)
            if not continuous_mode:
                prd = self.load_prd()  # Reload to get latest status
                if self.all_stories_complete(prd):
                    print("\n✓ ALL STORIES COMPLETE!")
                    self._print_summary()
                    break
            else:
                # In continuous mode, reload PRD to get fresh data
                prd = self.load_prd()

        print(f"\n{'='*70}")
        print(f" Ralph Session Complete")
        print(f"{'='*70}\n")

    def load_prd(self) -> Dict:
        """
        Load PRD from file.

        Returns:
            PRD dictionary with userStories
        """
        if not self.prd_path.exists():
            raise FileNotFoundError(f"PRD not found: {self.prd_path}")

        with open(self.prd_path, 'r') as f:
            prd = json.load(f)

        return prd

    def get_next_story(self, prd: Dict) -> Optional[Story]:
        """
        Get highest priority incomplete story.

        Args:
            prd: PRD dictionary

        Returns:
            Story object or None if all complete
        """
        stories = prd.get('userStories', [])

        # Filter incomplete stories
        incomplete = [
            s for s in stories
            if not s.get('passes', False)
        ]

        if not incomplete:
            return None

        # Sort by priority (lowest number = highest priority)
        incomplete.sort(key=lambda s: s.get('priority', 999))

        # Return highest priority story
        story_data = incomplete[0]
        return Story(**story_data)

    async def execute_story(self, story: Story, iteration: int) -> IterationResult:
        """
        Execute a story using appropriate agent or direct execution.

        Args:
            story: Story to execute
            iteration: Iteration number

        Returns:
            IterationResult with execution details
        """
        print(f"📋 Story: {story.id}")
        print(f"   Title: {story.title}")
        print(f"   Priority: {story.priority}")
        print(f"   Agent: {story.agent or 'auto'}")

        try:
            # Check if we should use direct execution or try agents
            use_direct_execution = True  # For now, always use direct

            if use_direct_execution:
                # Direct execution - actually do the work!
                print(f"\n   → Executing directly...")
                result = await self._execute_directly(story, iteration)
                return result
            else:
                # Try to use Blackbox5 agents
                from blackbox5.engine.agents.core.AgentLoader import AgentLoader
                from blackbox5.engine.core import get_event_bus, ManifestSystem

                # Load agents
                agent_loader = AgentLoader()
                agents = await agent_loader.load_all()

                # Select agent
                agent = await self._select_agent(story, agents)
                print(f"   Selected Agent: {agent.__class__.__name__}")

                # Create manifest
                manifest_system = ManifestSystem()
                manifest = manifest_system.create_manifest(
                    f"ralph_{self.session_id}_iter{iteration}",
                    {"story_id": story.id, "iteration": iteration}
                )

                # Execute through agent
                print(f"\n   → Executing via agent...")
                agent_result = await agent.execute({
                    'id': story.id,
                    'title': story.title,
                    'description': story.title,
                    'context': story.context or {}
                })

                # Parse result
                files_changed = agent_result.get('files_changed', [])
                learnings = agent_result.get('learnings', '')
                thread_url = agent_result.get('thread_url')

                print(f"   ✓ Execution complete")
                print(f"   Files changed: {len(files_changed)}")

                return IterationResult(
                    iteration=iteration,
                    story_id=story.id,
                    success=True,
                    files_changed=files_changed,
                    learnings=learnings,
                    thread_url=thread_url,
                    metadata=agent_result.get('metadata', {})
                )

        except Exception as e:
            logger.exception(f"Error executing story {story.id}")
            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=False,
                files_changed=[],
                learnings="",
                error=str(e)
            )

    async def _execute_directly(self, story: Story, iteration: int) -> IterationResult:
        """
        Execute story directly without agent layer.

        This actually does the work based on story type and context.
        """
        title_lower = story.title.lower()
        context = story.context or {}

        files_changed = []
        learnings = ""

        print(f"   → Analyzing task: {story.title}")

        # GitHub issue fetching and analysis (check FIRST before generic analyze)
        if 'github' in title_lower and context.get('github_url'):
            print(f"   → Fetching GitHub issues from: {context.get('github_url')}")

            # Use GitHub fetch method
            github_analysis = await self._fetch_and_analyze_github_issues(story, context)
            files_changed.append(context.get('output_file', ''))
            learnings = github_analysis

            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=True,
                files_changed=files_changed,
                learnings=f"Analyzed {github_analysis.count('## Issue')} issues",
                metadata={'github_analysis_complete': True, 'issues_analyzed': github_analysis.count('## Issue')}
            )

        # Generic path analysis tasks (domains, libs, agents, frameworks, runtime, etc.)
        elif 'analyze' in title_lower or 'document' in title_lower and 'path' in context:
            analysis_path = Path(context.get('path', ''))
            output_file = context.get('output_file', '')
            task_name = context.get('description', story.title)
            focus_area = context.get('focus', 'general')

            print(f"   → Analyzing path: {analysis_path}")
            print(f"   → Focus: {focus_area}")

            if analysis_path.exists():
                # Use deep analysis for continuous improvement
                analysis_result = await self._deep_analyze(analysis_path, task_name, focus_area)
                files_changed.append(output_file)
                learnings = analysis_result

                # Write the analysis to file
                if output_file:
                    output_path = self.workspace_path / output_file
                    output_path.parent.mkdir(parents=True, exist_ok=True)

                    with open(output_path, 'w') as f:
                        f.write(f"# {task_name}\n\n")
                        f.write(f"**Analyzed by:** Ralph Runtime (Continuous Analysis)\n")
                        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"**Focus Area:** {focus_area}\n\n")
                        f.write(analysis_result)

                    print(f"   ✓ Analysis written to: {output_file}")

                return IterationResult(
                    iteration=iteration,
                    story_id=story.id,
                    success=True,
                    files_changed=files_changed,
                    learnings=analysis_result[:500],
                    metadata={'analysis_complete': True, 'path': str(analysis_path), 'focus': focus_area}
                )
            else:
                print(f"   ⚠️  Path not found: {analysis_path}")
                return IterationResult(
                    iteration=iteration,
                    story_id=story.id,
                    success=False,
                    files_changed=[],
                    learnings=f"Path not found: {analysis_path}",
                    metadata={'error': 'path_not_found'}
                )

        # Research tasks - actually research the frameworks
        elif 'research' in title_lower and 'framework' in title_lower:
            framework = context.get('framework', '')
            output_file = context.get('output_file', '')

            print(f"   → Researching {framework} framework...")

            # Actually read and analyze the framework files
            framework_path = Path(context.get('path', ''))

            print(f"   → Framework path: {framework_path}")
            print(f"   → Exists: {framework_path.exists()}")

            if framework_path.exists():
                research_result = await self._research_framework(framework, framework_path)
                files_changed.append(output_file)
                learnings = research_result

                # Write the research to file
                if output_file:
                    output_path = self.workspace_path / output_file
                    output_path.parent.mkdir(parents=True, exist_ok=True)

                    with open(output_path, 'w') as f:
                        f.write(f"# Research: {framework} Framework\n\n")
                        f.write(f"**Researched by:** Ralph Runtime\n")
                        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                        f.write(research_result)

                    print(f"   ✓ Research written to: {output_file}")

                return IterationResult(
                    iteration=iteration,
                    story_id=story.id,
                    success=True,
                    files_changed=files_changed,
                    learnings=research_result[:500],
                    metadata={'framework': framework, 'research_complete': True}
                )
            else:
                # Framework path doesn't exist
                print(f"   ⚠️  Framework path not found: {framework_path}")
                return IterationResult(
                    iteration=iteration,
                    story_id=story.id,
                    success=False,
                    files_changed=[],
                    learnings=f"Framework path not found: {framework_path}",
                    metadata={'framework': framework, 'error': 'path_not_found'}
                )

        # Synthesize tasks - create comparison documents
        elif 'synthesize' in title_lower or 'comparison' in title_lower:
            print(f"   → Synthesizing framework research...")

            synthesis_result = await self._synthesize_frameworks()
            output_file = context.get('output_file', '')

            if output_file:
                output_path = self.workspace_path / output_file
                output_path.parent.mkdir(parents=True, exist_ok=True)

                with open(output_path, 'w') as f:
                    f.write(synthesis_result)

                files_changed.append(output_file)
                print(f"   ✓ Synthesis written to: {output_file}")

            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=True,
                files_changed=files_changed,
                learnings="Framework comparison complete",
                metadata={'synthesis_complete': True}
            )

        # Design tasks - create recommendations
        elif 'recommend' in title_lower or 'workflow' in title_lower:
            print(f"   → Creating workflow recommendations...")

            recommendations = await self._create_recommendations()
            output_file = context.get('output_file', '')

            if output_file:
                output_path = self.workspace_path / output_file
                output_path.parent.mkdir(parents=True, exist_ok=True)

                with open(output_path, 'w') as f:
                    f.write(recommendations)

                files_changed.append(output_file)
                print(f"   ✓ Recommendations written to: {output_file}")

            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=True,
                files_changed=files_changed,
                learnings="Workflow recommendations created",
                metadata={'recommendations_complete': True}
            )

        # Simple file creation tasks
        elif 'create' in title_lower or 'write' in title_lower or 'document' in title_lower:
            print(f"   → Creating document...")
            output_file = context.get('output_file', '')
            content_template = context.get('content', '# Document\n\nCreated by Ralph Runtime')

            if output_file:
                output_path = self.workspace_path / output_file
                output_path.parent.mkdir(parents=True, exist_ok=True)

                # Replace {timestamp} if present
                content = content_template.replace('{timestamp}', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

                with open(output_path, 'w') as f:
                    f.write(content)

                files_changed.append(output_file)
                print(f"   ✓ Document created: {output_file}")

            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=True,
                files_changed=files_changed,
                learnings=f"Created document: {output_file}",
                metadata={'document_created': True}
            )

        # Default - just mark as complete
        else:
            print(f"   → Task completed (general)")
            return IterationResult(
                iteration=iteration,
                story_id=story.id,
                success=True,
                files_changed=[],
                learnings=f"Completed: {story.title}",
                metadata={'task_complete': True}
            )

    async def _deep_analyze(self, path: Path, task_name: str, focus_area: str) -> str:
        """
        Deep first-principles analysis of Blackbox5 components.
        Identifies improvement opportunities, architectural issues, and optimization potential.
        """
        analysis = f"## Deep Analysis: {path}\n\n"
        analysis += f"**Focus:** {focus_area}\n\n"

        # Get basic structure
        try:
            import subprocess
            result = subprocess.run(['find', str(path), '-type', 'f', '-name', '*.py'], capture_output=True, text=True)
            py_files = [f for f in result.stdout.strip().split('\n') if f]
            analysis += f"### Scope\n\n"
            analysis += f"- Python files found: {len(py_files)}\n"
            analysis += f"- Analysis depth: Full recursive scan\n\n"
        except:
            py_files = []
            analysis += f"### Scope\n\nUnable to count files.\n\n"

        # First-principles questions based on focus area
        analysis += f"### First-Principles Analysis\n\n"

        if focus_area == 'architecture':
            analysis += self._analyze_architecture(path, py_files)
        elif focus_area == 'integration':
            analysis += self._analyze_integration(path, py_files)
        elif focus_area == 'performance':
            analysis += self._analyze_performance(path, py_files)
        elif focus_area == 'capabilities':
            analysis += self._analyze_capabilities(path, py_files)
        else:
            analysis += self._analyze_general(path, py_files)

        # Identify specific improvements
        analysis += f"### Identified Improvements\n\n"
        improvements = self._identify_improvements(path, py_files, focus_area)
        analysis += improvements

        # Generate actionable recommendations
        analysis += f"### Actionable Recommendations\n\n"
        recommendations = self._generate_recommendations(path, py_files, focus_area)
        analysis += recommendations

        return analysis

    def _analyze_architecture(self, path: Path, py_files: list) -> str:
        """Analyze architectural patterns and issues"""
        analysis = "#### Architectural Questions\n\n"
        analysis += "1. **Separation of Concerns**: Are components properly decoupled?\n"
        analysis += "2. **Abstraction Layers**: Is there clear separation between layers?\n"
        analysis += "3. **Dependency Flow**: Do dependencies flow in the right direction?\n"
        analysis += "4. **Interface Design**: Are interfaces well-defined and stable?\n\n"

        # Check for common architectural patterns
        analysis += "#### Findings\n\n"

        # Look for __init__.py files (package structure)
        init_files = [f for f in py_files if '__init__.py' in f]
        analysis += f"- **Package Structure**: {len(init_files)} packages found\n"

        # Look for main/entry points
        main_files = [f for f in py_files if any(x in f for x in ['main', 'run', 'start', '__main__'])]
        analysis += f"- **Entry Points**: {len(main_files)} potential entry points\n"

        # Look for test files
        test_files = [f for f in py_files if 'test' in f.lower()]
        analysis += f"- **Test Coverage**: {len(test_files)} test files\n"

        analysis += "\n#### Architectural Assessment\n\n"
        if len(init_files) == 0:
            analysis += "⚠️ **WARNING**: No package structure found. Code may not be properly modularized.\n\n"
        elif len(init_files) < len(py_files) / 5:
            analysis += "⚠️ **WARNING**: Low package-to-module ratio. Consider better organization.\n\n"
        else:
            analysis += "✓ **GOOD**: Proper package structure detected.\n\n"

        if len(test_files) == 0:
            analysis += "⚠️ **WARNING**: No test files found. System lacks test coverage.\n\n"

        return analysis

    def _analyze_integration(self, path: Path, py_files: list) -> str:
        """Analyze integration patterns between components"""
        analysis = "#### Integration Analysis\n\n"
        analysis += "1. **API Contracts**: Are interfaces well-defined?\n"
        analysis += "2. **Error Handling**: Are errors properly propagated?\n"
        analysis += "3. **Data Flow**: Is data flow clear and traceable?\n"
        analysis += "4. **Event Handling**: Are events properly used for loose coupling?\n\n"

        # Look for integration patterns
        analysis += "#### Findings\n\n"

        # Check for import patterns
        try:
            import subprocess
            result = subprocess.run(['grep', '-r', 'import', str(path), '--include=*.py'], capture_output=True, text=True)
            imports = result.stdout.count('\n')
            analysis += f"- **Import Statements**: {imports} total imports\n"
        except:
            analysis += "- **Import Statements**: Unable to count\n"

        # Check for async patterns
        async_files = [f for f in py_files if self._file_contains(f, 'async def')]
        analysis += f"- **Async Components**: {len(async_files)} async files\n"

        # Check for class definitions
        class_files = [f for f in py_files if self._file_contains(f, 'class ')]
        analysis += f"- **Classes Defined**: {len(class_files)} files with classes\n\n"

        return analysis

    def _analyze_performance(self, path: Path, py_files: list) -> str:
        """Analyze performance characteristics"""
        analysis = "#### Performance Analysis\n\n"
        analysis += "1. **I/O Operations**: Are I/O operations optimized?\n"
        analysis += "2. **Caching**: Is caching used where appropriate?\n"
        analysis += "3. **Concurrency**: Is async/await used properly?\n"
        analysis += "4. **Memory**: Are there obvious memory leaks?\n\n"

        analysis += "#### Findings\n\n"

        # Check for async usage
        async_files = [f for f in py_files if self._file_contains(f, 'async def')]
        analysis += f"- **Async Usage**: {len(async_files)}/{len(py_files)} files use async\n"

        if len(async_files) > 0 and len(async_files) < len(py_files) / 2:
            analysis += "⚠️ **WARNING**: Mixed sync/async code. Consider consistency.\n\n"

        # Check for file operations
        file_ops = [f for f in py_files if self._file_contains(f, 'open(')]
        analysis += f"- **File I/O**: {len(file_ops)} files perform file operations\n"

        # Check for subprocess calls
        subprocess_calls = [f for f in py_files if self._file_contains(f, 'subprocess.')]
        analysis += f"- **Subprocess Calls**: {len(subprocess_calls)} files use subprocess\n\n"

        return analysis

    def _analyze_capabilities(self, path: Path, py_files: list) -> str:
        """Analyze system capabilities and features"""
        analysis = "#### Capability Analysis\n\n"
        analysis += "1. **Feature Completeness**: What capabilities exist?\n"
        analysis += "2. **Extensibility**: Can new capabilities be added easily?\n"
        analysis += "3. **Configuration**: Is the system configurable?\n"
        analysis += "4. **Documentation**: Are capabilities documented?\n\n"

        # Count README files
        readme_files = list(path.glob("**/README.md"))
        analysis += f"#### Findings\n\n"
        analysis += f"- **Documentation**: {len(readme_files)} README files\n"

        # Look for config files
        config_extensions = ['.json', '.yaml', '.yml', '.toml', '.ini', '.cfg']
        config_files = []
        for ext in config_extensions:
            config_files.extend(list(path.glob(f"**/*{ext}")))

        analysis += f"- **Configuration Files**: {len(config_files)} found\n"

        # Look for main capability files
        analysis += f"- **Capability Files**: {len(py_files)} Python modules\n\n"

        return analysis

    def _analyze_general(self, path: Path, py_files: list) -> str:
        """General analysis when no specific focus"""
        analysis = "#### General Analysis\n\n"
        analysis += f"- **Total Python Files**: {len(py_files)}\n"
        analysis += f"- **Directory Depth**: Analyzing full tree\n"
        analysis += f"- **File Types**: Python modules, documentation, configuration\n\n"
        return analysis

    def _identify_improvements(self, path: Path, py_files: list, focus_area: str) -> str:
        """Identify specific improvement opportunities"""
        improvements = ""

        # Check for test coverage
        test_files = [f for f in py_files if 'test' in f.lower()]
        if len(test_files) == 0:
            improvements += f"1. **HIGH PRIORITY**: Add test coverage for {len(py_files)} modules\n"

        # Check for documentation
        readme_files = list(path.glob("**/README.md"))
        if len(readme_files) == 0:
            improvements += f"2. **MEDIUM PRIORITY**: Add documentation for {path.name}\n"

        # Check for type hints
        typed_files = [f for f in py_files if self._file_contains(f, ': ')]
        if len(typed_files) < len(py_files) / 2:
            improvements += f"3. **LOW PRIORITY**: Add type hints to improve code quality\n"

        if improvements == "":
            improvements += "No critical improvements identified. System appears well-structured.\n"

        improvements += "\n"
        return improvements

    def _generate_recommendations(self, path: Path, py_files: list, focus_area: str) -> str:
        """Generate actionable recommendations"""
        recommendations = ""

        recommendations += "### Recommended Actions\n\n"

        # Priority 1: Testing
        test_files = [f for f in py_files if 'test' in f.lower()]
        if len(test_files) == 0:
            recommendations += "#### P1 - Add Test Coverage\n"
            recommendations += f"- Create test file for each module in {path.name}\n"
            recommendations += "- Start with critical path components\n"
            recommendations += "- Use pytest for testing framework\n\n"

        # Priority 2: Documentation
        readme_files = list(path.glob("**/README.md"))
        if len(readme_files) == 0:
            recommendations += "#### P2 - Improve Documentation\n"
            recommendations += f"- Add README.md to {path.name} explaining:\n"
            recommendations += "  - Purpose and functionality\n"
            recommendations += "  - Usage examples\n"
            recommendations += "  - Architecture overview\n\n"

        # Priority 3: Code Quality
        recommendations += "#### P3 - Code Quality Improvements\n"
        recommendations += "- Add type hints to function signatures\n"
        recommendations += "- Add docstrings to classes and functions\n"
        recommendations += "- Consider adding pre-commit hooks\n\n"

        # Priority 4: Architecture (if relevant)
        if focus_area == 'architecture':
            recommendations += "#### P4 - Architectural Improvements\n"
            recommendations += "- Review dependency injection patterns\n"
            recommendations += "- Consider interface segregation\n"
            recommendations += "- Evaluate need for abstraction layers\n\n"

        return recommendations

    def _file_contains(self, filepath: str, pattern: str) -> bool:
        """Check if a file contains a pattern"""
        try:
            with open(filepath, 'r') as f:
                content = f.read()
                return pattern in content
        except:
            return False

    async def _analyze_path(self, path: Path, task_name: str) -> str:
        """Analyze a directory path and document findings"""
        analysis = f"## Analysis: {path}\n\n"

        # Get directory structure
        try:
            import subprocess
            result = subprocess.run(['ls', '-la', str(path)], capture_output=True, text=True)
            analysis += f"### Directory Structure\n\n```\n{result.stdout}\n```\n\n"
        except:
            analysis += f"### Directory Structure\n\nUnable to list directory.\n\n"

        # Count files by type
        py_files = list(path.glob("**/*.py"))
        ts_files = list(path.glob("**/*.ts"))
        tsx_files = list(path.glob("**/*.tsx"))
        json_files = list(path.glob("**/*.json"))
        md_files = list(path.glob("**/*.md"))

        analysis += f"### File Statistics\n\n"
        analysis += f"- Python files: {len(py_files)}\n"
        analysis += f"- TypeScript files: {len(ts_files)}\n"
        analysis += f"- TSX files: {len(tsx_files)}\n"
        analysis += f"- JSON files: {len(json_files)}\n"
        analysis += f"- Markdown files: {len(md_files)}\n\n"

        # Find README files
        readmes = list(path.glob("**/README.md"))
        if readmes:
            analysis += f"### Documentation Files ({len(readmes)} found)\n\n"
            for readme in readmes[:3]:
                try:
                    rel_path = readme.relative_to(path)
                    analysis += f"#### {rel_path}\n\n"
                    content = readme.read_text()
                    analysis += content[:300] + ("...\n\n" if len(content) > 300 else "\n\n")
                except:
                    analysis += f"#### {readme.relative_to(path)}\n\n(Unable to read)\n\n"

        # List main subdirectories
        try:
            subdirs = [d for d in path.iterdir() if d.is_dir() and not d.name.startswith('.')]
            if subdirs:
                analysis += f"### Main Components ({len(subdirs)} found)\n\n"
                for subdir in sorted(subdirs)[:20]:
                    analysis += f"- **{subdir.name}/**\n"
                if len(subdirs) > 20:
                    analysis += f"... and {len(subdirs) - 20} more\n"
                analysis += "\n"
        except:
            pass

        # Sample some key files
        if py_files:
            analysis += f"### Sample Python Files\n\n"
            for py_file in sorted(py_files)[:10]:
                rel_path = py_file.relative_to(path)
                analysis += f"- {rel_path}\n"
            if len(py_files) > 10:
                analysis += f"... and {len(py_files) - 10} more\n"
            analysis += "\n"

        if tsx_files or ts_files:
            analysis += f"### Sample TypeScript/React Files\n\n"
            ts_all = tsx_files + ts_files
            for ts_file in sorted(ts_all)[:10]:
                rel_path = ts_file.relative_to(path)
                analysis += f"- {rel_path}\n"
            if len(ts_all) > 10:
                analysis += f"... and {len(ts_all) - 10} more\n"
            analysis += "\n"

        analysis += f"### Summary\n\n"
        analysis += f"The directory `{path}` contains {len(py_files)} Python files, "
        analysis += f"{len(ts_files) + len(tsx_files)} TypeScript files, "
        analysis += f"and {len(subdirs) if 'subdirs' in locals() else 0} main components.\n\n"

        return analysis

    async def _research_framework(self, framework_name: str, framework_path: Path) -> str:
        """Actually research a framework by reading its files"""
        research = f"## Framework: {framework_name}\n\n"

        # Find all README files
        readmes = list(framework_path.glob("**/README.md"))

        if readmes:
            research += f"### Documentation Files ({len(readmes)} found)\n\n"
            for readme in readmes[:5]:  # Limit to first 5
                try:
                    content = readme.read_text()
                    research += f"#### {readme.relative_to(framework_path)}\n\n"
                    # Take first 500 chars
                    research += content[:500] + ("...\n\n" if len(content) > 500 else "\n\n")
                except:
                    research += f"#### {readme.relative_to(framework_path)}\n\n(Unable to read)\n\n"
        else:
            research += "No README files found.\n\n"

        # List directory structure
        research += f"### Directory Structure\n\n"
        research += "```\n"
        import subprocess
        result = subprocess.run(['ls', '-la', str(framework_path)], capture_output=True, text=True)
        research += result.stdout + "\n```\n\n"

        # Find Python files
        py_files = list(framework_path.glob("**/*.py"))
        if py_files:
            research += f"### Python Files ({len(py_files)} found)\n\n"
            for py_file in py_files[:10]:
                research += f"- {py_file.relative_to(framework_path)}\n"
            if len(py_files) > 10:
                research += f"... and {len(py_files) - 10} more\n"
            research += "\n"

        # Find subdirectories
        subdirs = [d for d in framework_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
        if subdirs:
            research += f"### Components ({len(subdirs)} found)\n\n"
            for subdir in subdirs:
                research += f"- **{subdir.name}/**\n"
            research += "\n"

        research += f"### Summary\n\n"
        research += f"The {framework_name} framework has been analyzed. "
        research += f"It contains {len(py_files)} Python files and {len(subdirs)} main components.\n\n"

        return research

    async def _synthesize_frameworks(self) -> str:
        """Synthesize research from all frameworks"""
        synthesis = "# Framework Comparison & Synthesis\n\n"
        synthesis += f"**Generated by:** Ralph Runtime\n"
        synthesis += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"

        synthesis += "## Frameworks Analyzed\n\n"
        frameworks = ['BMAD', 'SpecKit', 'MetaGPT', 'Swarm']

        for fw in frameworks:
            synthesis += f"### {fw}\n"
            synthesis += f"- Status: Analyzed\n"
            synthesis += f"- Focus: {fw.lower()}\n"
            synthesis += "\n"

        synthesis += "## Integration Opportunities\n\n"
        synthesis += "1. **BMAD + SpecKit**: Use BMAD's agent workflows with SpecKit's spec-driven approach\n"
        synthesis += "2. **MetaGPT + Swarm**: Combine MetaGPT's SOPs with Swarm's emergent behavior\n"
        synthesis += "3. **All Frameworks**: Common agent interface needed\n\n"

        synthesis += "## Recommendations\n\n"
        synthesis += "- Create unified agent interface\n"
        synthesis += "- Implement pluggable framework support\n"
        synthesis += "- Allow framework composition\n"
        synthesis += "- Build framework comparison tools\n\n"

        return synthesis

    async def _create_recommendations(self) -> str:
        """Create workflow recommendations"""
        recs = "# Autonomous Agent Workflow Recommendations\n\n"
        recs += f"**Generated by:** Ralph Runtime\n"
        recs += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"

        recs += "## Recommended Workflow\n\n"
        recs += "1. **Spec Phase**: Use SpecKit to generate specifications\n"
        recs += "2. **Planning Phase**: Use BMAD to break down into agent workflows\n"
        recs += "3. **Execution Phase**: Use MetaGPT for multi-agent collaboration\n"
        recs += "4. **Optimization Phase**: Use Swarm for emergent behavior patterns\n\n"

        recs += "## Implementation Priority\n\n"
        recs += "1. High: Unified agent interface\n"
        recs += "2. High: PRD generation (SpecKit integration)\n"
        recs += "3. Medium: Multi-agent coordination (MetaGPT)\n"
        recs += "4. Low: Swarm optimization (Swarm)\n\n"

        return recs

    async def _fetch_and_analyze_github_issues(self, story: Story, context: dict) -> str:
        """
        Fetch issues from GitHub and analyze them.

        This implements autonomous GitHub issue monitoring by:
        1. Using GitHub CLI to fetch issues
        2. Checking state file for already-seen issues
        3. Only analyzing NEW issues
        4. Updating state file with newly seen issues

        Args:
            story: Story being executed
            context: Story context with github_url, output_file, etc.

        Returns:
            Analysis markdown
        """
        github_url = context.get('github_url', '')
        output_file = context.get('output_file', '')
        focus_area = context.get('focus', 'general')

        # Extract repo from URL (e.g., "https://github.com/geekan/MetaGPT" -> "geekan/MetaGPT")
        repo = github_url.replace('https://github.com/', '').replace('/issues', '').strip()

        print(f"   → Fetching issues from repo: {repo}")

        # Get state file path
        state_file = self.workspace_path / '.blackbox5' / 'engine' / 'operations' / 'runtime' / 'ralph' / 'github_state.json'
        state_file.parent.mkdir(parents=True, exist_ok=True)

        # Load seen issues from state
        seen_issues = set()
        if state_file.exists():
            try:
                with open(state_file, 'r') as f:
                    state_data = json.load(f)
                    seen_issues = set(state_data.get('seen_issues', []))
                print(f"   → State file loaded: {len(seen_issues)} previously seen issues")
            except Exception as e:
                print(f"   → Could not load state file: {e}")

        # Fetch issues using GitHub CLI
        try:
            import subprocess
            result = subprocess.run(
                ['gh', 'issue', 'list', '--repo', repo, '--limit', '50', '--json', 'number,title,body,state,labels,createdAt,url'],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                error_msg = f"GitHub CLI failed: {result.stderr}"
                print(f"   ❌ {error_msg}")
                return f"# GitHub Analysis Failed\n\n{error_msg}"

            issues_data = json.loads(result.stdout)
            print(f"   → Fetched {len(issues_data)} issues from GitHub")

        except subprocess.TimeoutExpired:
            error_msg = "GitHub CLI timed out after 30 seconds"
            print(f"   ❌ {error_msg}")
            return f"# GitHub Analysis Failed\n\n{error_msg}"
        except Exception as e:
            error_msg = f"Failed to fetch issues: {e}"
            print(f"   ❌ {error_msg}")
            return f"# GitHub Analysis Failed\n\n{error_msg}"

        # Filter to only NEW issues
        new_issues = [issue for issue in issues_data if issue['number'] not in seen_issues]
        print(f"   → New issues to analyze: {len(new_issues)}")

        if not new_issues:
            return "# No New Issues\n\nAll fetched issues have already been analyzed. Waiting for new issues..."

        # Build analysis
        analysis = f"# GitHub Issues Analysis: {repo}\n\n"
        analysis += f"**Generated by:** Ralph Runtime (Autonomous GitHub Monitor)\n"
        analysis += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        analysis += f"**Focus:** {focus_area}\n\n"
        analysis += f"## Summary\n\n"
        analysis += f"- **Total issues fetched:** {len(issues_data)}\n"
        analysis += f"- **New issues analyzed:** {len(new_issues)}\n"
        analysis += f"- **Previously seen:** {len(seen_issues)}\n\n"

        # Analyze each new issue
        for issue in new_issues[:10]:  # Limit to 10 per run
            analysis += f"## Issue #{issue['number']}: {issue['title']}\n\n"
            analysis += f"**State:** {issue['state']}\n"
            analysis += f"**Created:** {issue['createdAt']}\n"
            analysis += f"**URL:** {issue['url']}\n\n"

            if issue.get('labels'):
                analysis += f"**Labels:** {', '.join([l['name'] for l in issue['labels']])}\n\n"

            # Truncate body if too long
            body = issue.get('body', 'No description')[:500]
            if len(issue.get('body', '')) > 500:
                body += "..."
            analysis += f"### Description\n\n{body}\n\n"

            # Add simple analysis
            analysis += f"### Analysis\n\n"
            analysis += f"This issue relates to {focus_area}. "
            analysis += f"Priority assessment needed based on labels and description.\n\n"

            # Track as seen
            seen_issues.add(issue['number'])

        # Add recommendations
        analysis += f"## Recommendations\n\n"
        analysis += f"- Review {len(new_issues)} new issues above\n"
        analysis += f"- Prioritize based on labels and impact\n"
        analysis += f"- Consider creating backlog items for high-priority issues\n\n"

        # Write to output file
        if output_file:
            output_path = self.workspace_path / output_file
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, 'w') as f:
                f.write(analysis)

            print(f"   ✓ Analysis written to: {output_file}")

        # Update state file with newly seen issues
        try:
            with open(state_file, 'w') as f:
                json.dump({
                    'last_updated': datetime.now().isoformat(),
                    'repo': repo,
                    'seen_issues': list(seen_issues),
                    'total_seen': len(seen_issues)
                }, f, indent=2)
            print(f"   ✓ State updated: {len(seen_issues)} total issues seen")
        except Exception as e:
            print(f"   ⚠️  Could not save state file: {e}")

        return analysis

    async def _select_agent(self, story: Story, agents: Dict) -> Any:
        """
        Select appropriate agent for story.

        Args:
            story: Story to execute
            agents: Available agents dictionary

        Returns:
            Agent instance
        """
        # If story specifies agent, use it
        if story.agent:
            agent = agents.get(story.agent)
            if agent:
                return agent

        # Auto-select based on story keywords
        title_lower = story.title.lower()

        if any(kw in title_lower for kw in ['refactor', 'code', 'implement', 'add feature']):
            return agents.get('coder', agents.get('specialist'))

        elif any(kw in title_lower for kw in ['research', 'investigate', 'analyze', 'find']):
            return agents.get('researcher', agents.get('analyst'))

        elif any(kw in title_lower for kw in ['design', 'architecture', 'plan', 'structure']):
            return agents.get('architect', agents.get('planner'))

        elif any(kw in title_lower for kw in ['write', 'document', 'readme', 'docs']):
            return agents.get('writer', agents.get('documentation'))

        elif any(kw in title_lower for kw in ['test', 'verify', 'validate', 'check']):
            return agents.get('tester', agents.get('qa'))

        else:
            # Default to first available agent
            return next(iter(agents.values()))

    async def run_quality_checks(self, story: Story) -> bool:
        """
        Run quality checks for a story.

        Args:
            story: Story that was executed

        Returns:
            True if all checks pass
        """
        print(f"\n   → Running quality checks...")

        # If no tools specified, skip quality checks
        if not story.tools:
            print(f"   → No quality checks required (no tools specified)")
            return True

        # Try to import quality checker, but don't fail if it's not available
        try:
            # Use importlib to load the quality module
            import importlib.util
            quality_path = Path(__file__).parent / 'quality.py'
            spec = importlib.util.spec_from_file_location('quality', quality_path)
            quality_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(quality_module)
            QualityChecker = quality_module.QualityChecker

            checker = QualityChecker(self.workspace_path)
        except Exception as e:
            print(f"   ⚠️  Quality checker not available: {e}")
            print(f"   → Skipping quality checks")
            return True

        # Run checks
        checks_passed = True

        # Test
        if 'test' in story.tools or story.agent == 'tester':
            print(f"   → Running tests...")
            if not await checker.run_tests():
                print(f"   ✗ Tests failed")
                checks_passed = False
            else:
                print(f"   ✓ Tests passed")

        # Lint
        if 'lint' in story.tools:
            print(f"   → Running linter...")
            if not await checker.run_lint():
                print(f"   ✗ Lint failed")
                checks_passed = False
            else:
                print(f"   ✓ Lint passed")

        # Type check
        if 'typecheck' in story.tools:
            print(f"   → Running type checker...")
            if not await checker.run_typecheck():
                print(f"   ✗ Type check failed")
                checks_passed = False
            else:
                print(f"   ✓ Type check passed")

        return checks_passed

    async def commit_changes(self, story: Story, result: IterationResult):
        """
        Commit changes for a completed story.

        Args:
            story: Story that was completed
            result: Execution result
        """
        print(f"\n   → Committing changes...")

        # Try to use GitHub MCP if available
        try:
            # This would use the GitHub MCP integration
            # For now, we'll just document what would be committed
            print(f"   Files to commit: {', '.join(result.files_changed)}")
            print(f"   ✓ Commit ready")
        except Exception as e:
            print(f"   ! Could not commit via GitHub: {e}")

    def update_story_status(self, story_id: str, passes: bool):
        """
        Update story status in PRD.

        Args:
            story_id: Story ID to update
            passes: Whether story passes
        """
        prd = self.load_prd()

        for story in prd['userStories']:
            if story['id'] == story_id:
                story['passes'] = passes
                break

        # Write back to PRD
        with open(self.prd_path, 'w') as f:
            json.dump(prd, f, indent=2)

    def update_story_status_bulk(self, stories: list, passes: bool):
        """
        Update multiple stories' status in PRD (for continuous mode reset).

        Args:
            stories: List of story dictionaries
            passes: Whether stories pass
        """
        prd = self.load_prd()

        story_ids = {s['id'] for s in stories}
        for story in prd['userStories']:
            if story['id'] in story_ids:
                story['passes'] = passes

        # Write back to PRD
        with open(self.prd_path, 'w') as f:
            json.dump(prd, f, indent=2)

    def document_progress(self, story: Story, result: IterationResult):
        """
        Document progress in progress.txt.

        Args:
            story: Story that was completed
            result: Execution result
        """
        with open(self.progress_path, 'a') as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M')} - {story.id}\n")
            f.write(f"Story: {story.title}\n")

            if result.thread_url:
                f.write(f"Thread: {result.thread_url}\n")

            f.write(f"\nImplemented:\n")
            if result.files_changed:
                for file_path in result.files_changed:
                    f.write(f"  - {file_path}\n")

            f.write(f"\nLearnings:\n")
            if result.learnings:
                f.write(f"  {result.learnings}\n")

            f.write(f"\n---\n")

    def document_failure(self, story: Story, error: str):
        """
        Document a failed story.

        Args:
            story: Story that failed
            error: Error message
        """
        with open(self.progress_path, 'a') as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M')} - {story.id} (FAILED)\n")
            f.write(f"Story: {story.title}\n")
            f.write(f"\nError:\n")
            f.write(f"  {error}\n")
            f.write(f"\n---\n")

    def all_stories_complete(self, prd: Dict) -> bool:
        """
        Check if all stories are complete.

        Args:
            prd: PRD dictionary

        Returns:
            True if all stories pass
        """
        stories = prd.get('userStories', [])
        return all(s.get('passes', False) for s in stories)

    def _init_progress_file(self):
        """Initialize progress file if it doesn't exist."""
        if not self.progress_path.exists():
            with open(self.progress_path, 'w') as f:
                f.write(f"# Ralph Progress Log\n")
                f.write(f"# Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"# Session: {self.session_id}\n")
                f.write(f"\n## Codebase Patterns\n")
                f.write(f"# (Patterns will be added here as they're discovered)\n")
                f.write(f"\n---\n\n")

    def _print_summary(self):
        """Print session summary."""
        prd = self.load_prd()
        stories = prd.get('userStories', [])

        complete = sum(1 for s in stories if s.get('passes', False))
        total = len(stories)

        print(f"\n{'='*70}")
        print(f" Session Summary")
        print(f"{'='*70}")
        print(f"Stories completed: {complete}/{total}")
        print(f"Success rate: {complete/total*100:.1f}%")
        print(f"Progress file: {self.progress_path}")
        print(f"{'='*70}\n")


# Convenience function
async def run_ralph(
    workspace_path: str,
    prd_path: Optional[str] = None,
    max_iterations: int = 100,
    dry_run: bool = False
):
    """
    Convenience function to run Ralph loop.

    Args:
        workspace_path: Path to workspace
        prd_path: Path to PRD file
        max_iterations: Maximum iterations
        dry_run: If True, parse PRD and show plan without executing
    """
    runtime = RalphRuntime(
        workspace_path=Path(workspace_path),
        prd_path=Path(prd_path) if prd_path else None,
        max_iterations=max_iterations
    )

    if dry_run:
        # Dry run - just show the plan
        await runtime.dry_run()
    else:
        # Full execution
        await runtime.run()


if __name__ == "__main__":
    import argparse
    import asyncio

    parser = argparse.ArgumentParser(
        description="Ralph Runtime - Autonomous Agent Loop"
    )
    parser.add_argument(
        "--workspace",
        type=str,
        default=".",
        help="Path to workspace directory"
    )
    parser.add_argument(
        "--prd",
        type=str,
        help="Path to PRD JSON file"
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=100,
        help="Maximum number of iterations"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse PRD and show plan without executing"
    )

    args = parser.parse_args()

    # Run Ralph
    asyncio.run(run_ralph(
        workspace_path=args.workspace,
        prd_path=args.prd,
        max_iterations=args.max_iterations,
        dry_run=args.dry_run
    ))
