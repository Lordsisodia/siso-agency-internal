"""
.blackbox v3 - Workflow Executor
Execute workflows using micro-file architecture
"""

import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime


class WorkflowExecutor:
    """Execute workflows with micro-file architecture (B-MAD pattern)"""

    def __init__(self, blackbox_root: Path):
        """
        Initialize workflow executor

        Args:
            blackbox_root: Path to .blackbox3 directory
        """
        self.blackbox_root = Path(blackbox_root)

    def execute_workflow(self, workflow_id: str, inputs: Dict[str, Any],
                        agent_context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute workflow by ID

        Args:
            workflow_id: Workflow ID (e.g., "modules/context/workflows/show-context")
            inputs: Workflow input parameters
            agent_context: Optional agent context for execution

        Returns:
            Workflow execution state

        Example:
            executor = WorkflowExecutor(".blackbox3")
            result = executor.execute_workflow(
                "modules/context/workflows/show-context",
                {"level": "project"}
            )
        """
        workflow_path = self._resolve_workflow_path(workflow_id)

        # Load workflow config
        workflow_config = self._load_workflow_config(workflow_path)

        # Initialize state
        state = {
            'workflow': workflow_config,
            'inputs': inputs,
            'agent_context': agent_context or {},
            'current_step': 1,
            'output': [],
            'started_at': datetime.now().isoformat(),
            'completed_at': None
        }

        # Get workflow steps
        steps_path = workflow_path / "steps"
        if not steps_path.exists():
            # Simple workflow without steps
            state = self._execute_simple_workflow(workflow_path, state)
        else:
            # Multi-step workflow
            step_files = self._get_step_files(steps_path)

            for step_file in step_files:
                step_num = self._extract_step_number(step_file.name)

                # Load step
                with open(step_file, 'r') as f:
                    step_content = f.read()

                # Execute step
                print(f"\n{'='*60}")
                print(f"Executing Step {step_num}: {step_file.stem}")
                print(f"{'='*60}\n")

                state = self._execute_step(step_content, state)

                # Check if workflow should continue
                if not state.get('continue', True):
                    print(f"\nWorkflow paused at step {step_num}")
                    break

        state['completed_at'] = datetime.now().isoformat()

        # Update project status
        self._update_status(workflow_id, state)

        return state

    def _resolve_workflow_path(self, workflow_id: str) -> Path:
        """Resolve workflow ID to directory path"""
        workflow_path = self.blackbox_root / workflow_id

        if not workflow_path.exists():
            raise FileNotFoundError(f"Workflow not found: {workflow_id}")

        return workflow_path

    def _load_workflow_config(self, workflow_path: Path) -> Dict[str, Any]:
        """Load workflow configuration from workflow.md"""
        workflow_file = workflow_path / "workflow.md"

        if workflow_file.exists():
            with open(workflow_file, 'r') as f:
                content = f.read()

            # Parse frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 2:
                    frontmatter = parts[1]
                    return yaml.safe_load(frontmatter)

        return {
            'name': workflow_path.name,
            'description': 'Workflow description'
        }

    def _get_step_files(self, steps_path: Path) -> List[Path]:
        """Get sorted step files"""
        step_files = list(steps_path.glob("step-*.md"))
        step_files.sort(key=lambda f: self._extract_step_number(f.name))
        return step_files

    def _extract_step_number(self, filename: str) -> int:
        """Extract step number from filename"""
        try:
            # Format: step-01-init.md
            parts = filename.replace('step-', '').split('-')
            return int(parts[0])
        except (ValueError, IndexError):
            return 999

    def _execute_step(self, step_content: str, state: Dict) -> Dict:
        """
        Execute a single workflow step

        In production, this would:
        1. Parse step instructions
        2. Execute with AI agent
        3. Capture output
        4. Update state

        For now, we simulate the execution
        """
        # Add step content to output
        state['output'].append({
            'step': state['current_step'],
            'content': step_content[:200] + '...' if len(step_content) > 200 else step_content,
            'timestamp': datetime.now().isoformat()
        })

        state['current_step'] += 1
        state['continue'] = True  # In production, ask user

        return state

    def _execute_simple_workflow(self, workflow_path: Path, state: Dict) -> Dict:
        """Execute workflow without steps (single file)"""
        workflow_file = workflow_path / "workflow.md"

        if workflow_file.exists():
            with open(workflow_file, 'r') as f:
                content = f.read()

            state['output'].append({
                'content': content,
                'timestamp': datetime.now().isoformat()
            })

        return state

    def _update_status(self, workflow_id: str, state: Dict):
        """Update project status after workflow execution"""
        status_file = self.blackbox_root / "project-status.yaml"

        with open(status_file, 'r') as f:
            status = yaml.safe_load(f)

        # Add to recent activity
        status['recent_activity'].append({
            'timestamp': datetime.now().isoformat(),
            'action': 'workflow_executed',
            'workflow': workflow_id,
            'status': 'completed' if state['completed_at'] else 'paused'
        })

        # Update statistics
        status['statistics']['total_workflows_executed'] += 1

        # Write back
        with open(status_file, 'w') as f:
            yaml.dump(status, f)

    def list_workflows(self, module: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all available workflows

        Args:
            module: Optional module filter

        Returns:
            List of workflow metadata
        """
        workflows = []

        # List core workflows
        if module == "core" or module is None:
            core_workflows = self.blackbox_root / "core/workflows"
            if core_workflows.exists():
                for workflow_dir in core_workflows.iterdir():
                    if workflow_dir.is_dir():
                        info = self._parse_workflow_info(workflow_dir)
                        if info:
                            workflows.append(info)

        # List module workflows
        if module is None or (module and module != "core"):
            modules_dir = self.blackbox_root / "modules"
            if modules_dir.exists():
                for module_dir in modules_dir.iterdir():
                    if module_dir.is_dir():
                        workflows_dir = module_dir / "workflows"
                        if workflows_dir.exists():
                            for workflow_dir in workflows_dir.iterdir():
                                if workflow_dir.is_dir():
                                    info = self._parse_workflow_info(workflow_dir)
                                    if info:
                                        workflows.append(info)

        return workflows

    def _parse_workflow_info(self, workflow_dir: Path) -> Optional[Dict[str, Any]]:
        """Parse workflow metadata from workflow.md"""
        workflow_file = workflow_dir / "workflow.md"

        if not workflow_file.exists():
            return None

        try:
            with open(workflow_file, 'r') as f:
                content = f.read()

            # Parse frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 2:
                    frontmatter = parts[1]
                    config = yaml.safe_load(frontmatter)
                    return {
                        'id': str(workflow_dir.relative_to(self.blackbox_root)),
                        'name': config.get('name', workflow_dir.name),
                        'description': config.get('description', ''),
                        'phase': config.get('phase', 'unknown')
                    }

            return {
                'id': str(workflow_dir.relative_to(self.blackbox_root)),
                'name': workflow_dir.name,
                'description': 'Workflow'
            }
        except Exception as e:
            print(f"Warning: Could not parse workflow {workflow_dir}: {e}")
            return None


if __name__ == "__main__":
    # Test workflow executor
    executor = WorkflowExecutor(".blackbox3")

    # List workflows
    print("Available Workflows:")
    print("=" * 50)
    workflows = executor.list_workflows()
    for workflow in workflows:
        print(f"📋 {workflow['name']}")
        print(f"   Description: {workflow['description']}")
        print(f"   ID: {workflow['id']}")
        print()
