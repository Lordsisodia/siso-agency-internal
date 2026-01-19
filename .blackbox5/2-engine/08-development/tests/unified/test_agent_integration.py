"""
BlackBox5 Agent Integration Tests

Comprehensive integration tests for:
- Multi-agent workflows
- Agent coordination (Planner → Developer → Tester)
- Memory persistence across executions
- External integrations (GitHub, Vibe Kanban) with mocks
- Full lifecycle testing

Run with:
    python .blackbox5/tests/test_agent_integration.py
    or
    pytest .blackbox5/tests/test_agent_integration.py -v
"""

import asyncio
import json
import sys
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import dataclasses

# Add engine directory to path
engine_root = Path(__file__).parent.parent / "engine"
sys.path.insert(0, str(engine_root))
sys.path.insert(0, str(engine_root / ".agents" / "core"))
sys.path.insert(0, str(engine_root / "core"))
sys.path.insert(0, str(engine_root / "modules"))

# Import core components
try:
    from core.kernel import EngineKernel, ServiceConfig, RunLevel, SystemStatus
    from core.event_bus import EventBusConfig, RedisEventBus
    from modules.context.manager import ContextManager, ContextStorage
    from modules.context.snapshot import ContextSnapshot
except ImportError as e:
    print(f"⚠️  Import warning: {e}")
    print("Some tests may be skipped if dependencies are missing")


# ============================================================================
# MOCK AGENT IMPLEMENTATIONS
# ============================================================================

@dataclasses.dataclass
class AgentConfig:
    """Simple agent configuration for testing"""
    name: str
    full_name: str
    role: str
    category: str = "test"
    icon: str = "🤖"
    description: str = ""
    capabilities: List[str] = dataclasses.field(default_factory=list)
    context_budget: Optional[int] = None


@dataclasses.dataclass
class Task:
    """Task representation for testing"""
    id: str
    description: str
    type: str = "test"
    complexity: str = "simple"
    context: Dict[str, Any] = dataclasses.field(default_factory=dict)
    inputs: Dict[str, Any] = dataclasses.field(default_factory=dict)
    dependencies: List[str] = dataclasses.field(default_factory=list)
    priority: int = 100


@dataclasses.dataclass
class AgentResult:
    """Result from agent execution"""
    success: bool
    agent: str
    task_id: str
    output: Any = None
    artifacts: List[str] = dataclasses.field(default_factory=list)
    metadata: Dict[str, Any] = dataclasses.field(default_factory=dict)
    error: Optional[str] = None
    duration: float = 0.0
    timestamp: datetime = dataclasses.field(default_factory=datetime.now)


class MockPlannerAgent:
    """Mock Planner agent for testing"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self._initialized = False
        self.executed_tasks = []
        self.memory = {}

    async def initialize(self):
        """Initialize the agent"""
        await asyncio.sleep(0.01)  # Simulate initialization
        self._initialized = True
        print(f"✅ {self.config.name} initialized")

    async def execute(self, task: Task) -> AgentResult:
        """Execute a planning task"""
        start_time = datetime.now()

        # Simulate planning work
        await asyncio.sleep(0.05)

        plan = {
            "task_id": task.id,
            "steps": [
                {"step": 1, "action": "analyze_requirements"},
                {"step": 2, "action": "create_design"},
                {"step": 3, "action": "implement"},
                {"step": 4, "action": "test"}
            ],
            "estimated_complexity": task.complexity
        }

        self.executed_tasks.append(task.id)

        duration = (datetime.now() - start_time).total_seconds()

        return AgentResult(
            success=True,
            agent=self.config.name,
            task_id=task.id,
            output=plan,
            artifacts=["plan.json"],
            metadata={"phase": "planning"},
            duration=duration
        )


class MockDeveloperAgent:
    """Mock Developer agent for testing"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self._initialized = False
        self.executed_tasks = []
        self.code_artifacts = []

    async def initialize(self):
        """Initialize the agent"""
        await asyncio.sleep(0.01)
        self._initialized = True
        print(f"✅ {self.config.name} initialized")

    async def execute(self, task: Task) -> AgentResult:
        """Execute a development task"""
        start_time = datetime.now()

        # Simulate development work
        await asyncio.sleep(0.1)

        implementation = {
            "task_id": task.id,
            "files_created": [
                "src/components/TestComponent.tsx",
                "src/hooks/useTest.ts"
            ],
            "lines_of_code": 150,
            "tests_written": 5
        }

        self.executed_tasks.append(task.id)
        self.code_artifacts.extend(implementation["files_created"])

        duration = (datetime.now() - start_time).total_seconds()

        return AgentResult(
            success=True,
            agent=self.config.name,
            task_id=task.id,
            output=implementation,
            artifacts=implementation["files_created"],
            metadata={"phase": "development"},
            duration=duration
        )


class MockTesterAgent:
    """Mock Tester agent for testing"""

    def __init__(self, config: AgentConfig):
        self.config = config
        self._initialized = False
        self.executed_tasks = []
        self.test_results = []

    async def initialize(self):
        """Initialize the agent"""
        await asyncio.sleep(0.01)
        self._initialized = True
        print(f"✅ {self.config.name} initialized")

    async def execute(self, task: Task) -> AgentResult:
        """Execute a testing task"""
        start_time = datetime.now()

        # Simulate testing work
        await asyncio.sleep(0.08)

        results = {
            "task_id": task.id,
            "tests_run": 5,
            "tests_passed": 5,
            "tests_failed": 0,
            "coverage": 95.0,
            "status": "all_passed"
        }

        self.executed_tasks.append(task.id)
        self.test_results.append(results)

        duration = (datetime.now() - start_time).total_seconds()

        return AgentResult(
            success=True,
            agent=self.config.name,
            task_id=task.id,
            output=results,
            artifacts=["test_report.json"],
            metadata={"phase": "testing"},
            duration=duration
        )


# ============================================================================
# AGENT ORCHESTRATOR
# ============================================================================

class AgentOrchestrator:
    """
    Orchestrates multiple agents in workflows.

    Features:
    - Agent lifecycle management
    - Workflow execution
    - Memory persistence
    - External integrations
    """

    def __init__(self, project_dir: Optional[Path] = None):
        """
        Initialize the orchestrator.

        Args:
            project_dir: Project directory for memory storage
        """
        self.project_dir = Path(project_dir) if project_dir else Path.cwd()
        self.agents: Dict[str, Any] = {}
        self.context_manager = None
        self.workflow_history: List[Dict[str, Any]] = []
        self._initialized = False

    async def initialize(self, enable_memory: bool = True):
        """
        Initialize the orchestrator.

        Args:
            enable_memory: Enable memory persistence
        """
        print("🚀 Initializing Agent Orchestrator...")

        # Setup memory/context
        if enable_memory:
            memory_path = self.project_dir / ".memory" / "sessions"
            memory_path.mkdir(parents=True, exist_ok=True)
            self.context_manager = ContextManager(
                context_root=memory_path,
                max_size_mb=10.0
            )
            print(f"✅ Memory initialized at {memory_path}")

        self._initialized = True
        print("✅ Orchestrator initialized\n")

    async def start_agent(
        self,
        agent_id: str,
        agent_type: str,
        config: Optional[AgentConfig] = None
    ) -> bool:
        """
        Start an agent.

        Args:
            agent_id: Unique ID for the agent
            agent_type: Type of agent (planner, developer, tester)
            config: Optional agent configuration

        Returns:
            True if agent started successfully
        """
        if agent_id in self.agents:
            print(f"⚠️  Agent {agent_id} already exists")
            return False

        # Create config if not provided
        if not config:
            config = AgentConfig(
                name=agent_id,
                full_name=agent_id.replace("_", " ").title(),
                role=agent_type,
                category="test"
            )

        # Create agent based on type
        agent_classes = {
            "planner": MockPlannerAgent,
            "developer": MockDeveloperAgent,
            "tester": MockTesterAgent
        }

        agent_class = agent_classes.get(agent_type, MockDeveloperAgent)
        agent = agent_class(config)

        # Initialize agent
        await agent.initialize()

        # Store agent
        self.agents[agent_id] = agent

        # Save to memory
        if self.context_manager:
            self.context_manager.add_context(
                key=f"agent_{agent_id}",
                value={
                    "id": agent_id,
                    "type": agent_type,
                    "config": {
                        "name": config.name,
                        "role": config.role
                    },
                    "started_at": datetime.now().isoformat()
                },
                tags=["agent", agent_type]
            )

        return True

    async def execute_workflow(
        self,
        workflow: List[Dict[str, Any]]
    ) -> List[AgentResult]:
        """
        Execute a workflow across multiple agents.

        Args:
            workflow: List of workflow steps
                [{"agent": "agent_id", "task": {...}}, ...]

        Returns:
            List of agent results
        """
        print(f"\n🔄 Executing workflow with {len(workflow)} steps...")

        results = []
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        for step_num, step in enumerate(workflow, 1):
            agent_id = step.get("agent")
            task_data = step.get("task")

            if not agent_id or not task_data:
                print(f"⚠️  Skipping invalid step {step_num}")
                continue

            # Get agent
            agent = self.agents.get(agent_id)
            if not agent:
                print(f"❌ Agent {agent_id} not found")
                results.append(AgentResult(
                    success=False,
                    agent=agent_id,
                    task_id=task_data.get("id", "unknown"),
                    error=f"Agent {agent_id} not found"
                ))
                continue

            # Create task
            task = Task(
                id=task_data.get("id", f"{workflow_id}_step_{step_num}"),
                description=task_data.get("description", "Execute task"),
                type=task_data.get("type", "general"),
                complexity=task_data.get("complexity", "medium"),
                context=task_data.get("context", {}),
                inputs=task_data.get("inputs", {})
            )

            print(f"  {step_num}. {agent_id}: {task.description}")

            # Execute task
            try:
                result = await agent.execute(task)
                results.append(result)

                # Save to memory
                if self.context_manager and result.success:
                    self.context_manager.add_context(
                        key=f"task_{task.id}",
                        value={
                            "task_id": task.id,
                            "agent": agent_id,
                            "success": result.success,
                            "output": result.output,
                            "artifacts": result.artifacts,
                            "duration": result.duration
                        },
                        tags=["task", agent_id, workflow_id]
                    )

                status = "✅" if result.success else "❌"
                print(f"     {status} Completed in {result.duration:.3f}s")

            except Exception as e:
                print(f"     ❌ Error: {e}")
                results.append(AgentResult(
                    success=False,
                    agent=agent_id,
                    task_id=task.id,
                    error=str(e)
                ))

        # Save workflow to history
        self.workflow_history.append({
            "workflow_id": workflow_id,
            "steps": len(workflow),
            "timestamp": datetime.now().isoformat(),
            "results": [
                {
                    "agent": r.agent,
                    "task_id": r.task_id,
                    "success": r.success,
                    "duration": r.duration
                }
                for r in results
            ]
        })

        # Save workflow to memory
        if self.context_manager:
            self.context_manager.add_context(
                key=workflow_id,
                value={
                    "workflow_id": workflow_id,
                    "steps": workflow,
                    "results": [
                        {
                            "agent": r.agent,
                            "task_id": r.task_id,
                            "success": r.success,
                            "duration": r.duration
                        }
                        for r in results
                    ],
                    "timestamp": datetime.now().isoformat()
                },
                tags=["workflow"]
            )

        print(f"\n✅ Workflow completed: {sum(1 for r in results if r.success)}/{len(results)} steps successful\n")

        return results

    def get_memory_summary(self) -> Dict[str, Any]:
        """Get memory/context summary"""
        if not self.context_manager:
            return {"memory_enabled": False}

        return self.context_manager.get_context_summary()

    def get_workflow_history(self) -> List[Dict[str, Any]]:
        """Get workflow execution history"""
        return self.workflow_history

    async def shutdown(self):
        """Shutdown the orchestrator and cleanup"""
        print("\n🛑 Shutting down orchestrator...")

        # Export context if enabled
        if self.context_manager:
            export_path = self.context_manager.export_context()
            print(f"✅ Context exported to {export_path}")

        print("✅ Orchestrator shutdown complete")


# ============================================================================
# MOCK EXTERNAL INTEGRATIONS
# ============================================================================

class MockGitHubIntegration:
    """Mock GitHub integration for testing"""

    def __init__(self):
        self.issues_created = []
        self.prs_created = []

    async def create_issue(self, repo: str, title: str, body: str) -> str:
        """Create a GitHub issue"""
        issue_id = f"GH-{len(self.issues_created) + 1}"
        self.issues_created.append({
            "id": issue_id,
            "repo": repo,
            "title": title,
            "body": body
        })
        return issue_id

    async def create_pr(
        self,
        repo: str,
        title: str,
        body: str,
        source_branch: str,
        target_branch: str = "main"
    ) -> str:
        """Create a GitHub pull request"""
        pr_id = f"PR-{len(self.prs_created) + 1}"
        self.prs_created.append({
            "id": pr_id,
            "repo": repo,
            "title": title,
            "body": body,
            "source": source_branch,
            "target": target_branch
        })
        return pr_id

    def get_activity(self) -> Dict[str, Any]:
        """Get GitHub activity summary"""
        return {
            "issues_created": len(self.issues_created),
            "prs_created": len(self.prs_created),
            "recent_issues": self.issues_created[-5:],
            "recent_prs": self.prs_created[-5:]
        }


class MockVibeKanbanIntegration:
    """Mock Vibe Kanban integration for testing"""

    def __init__(self):
        self.tasks_created = []
        self.columns = {
            "backlog": [],
            "todo": [],
            "in_progress": [],
            "done": []
        }

    async def create_task(
        self,
        title: str,
        description: str,
        column: str = "backlog",
        priority: str = "medium"
    ) -> str:
        """Create a Kanban task"""
        task_id = f"TASK-{len(self.tasks_created) + 1}"

        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "column": column,
            "priority": priority,
            "created_at": datetime.now().isoformat()
        }

        self.tasks_created.append(task)
        if column in self.columns:
            self.columns[column].append(task)

        return task_id

    async def move_task(self, task_id: str, to_column: str) -> bool:
        """Move a task to a different column"""
        for column_name, tasks in self.columns.items():
            for task in tasks:
                if task["id"] == task_id:
                    self.columns[column_name].remove(task)
                    self.columns[to_column].append(task)
                    task["column"] = to_column
                    return True
        return False

    def get_board_status(self) -> Dict[str, Any]:
        """Get Kanban board status"""
        return {
            "total_tasks": len(self.tasks_created),
            "columns": {
                name: len(tasks)
                for name, tasks in self.columns.items()
            },
            "recent_tasks": self.tasks_created[-5:]
        }


# ============================================================================
# TEST SUITES
# ============================================================================

class TestRunner:
    """Test runner with colored output"""

    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests_run = 0

    def print_header(self, text: str):
        """Print a section header"""
        print("\n" + "=" * 70)
        print(f"  {text}")
        print("=" * 70 + "\n")

    def print_success(self, text: str):
        """Print success message"""
        print(f"✅ PASS: {text}")
        self.passed += 1

    def print_failure(self, text: str, error: str = ""):
        """Print failure message"""
        print(f"❌ FAIL: {text}")
        if error:
            print(f"   Error: {error}")
        self.failed += 1

    def print_info(self, text: str):
        """Print info message"""
        print(f"ℹ️  {text}")

    def summary(self):
        """Print test summary"""
        self.tests_run = self.passed + self.failed
        print("\n" + "=" * 70)
        print("  TEST SUMMARY")
        print("=" * 70)
        print(f"  Total:  {self.tests_run}")
        print(f"  Passed: {self.passed} ✅")
        print(f"  Failed: {self.failed} ❌")
        print(f"  Success Rate: {(self.passed/self.tests_run*100):.1f}%")
        print("=" * 70 + "\n")

        return self.failed == 0


async def test_multi_agent_workflow():
    """Test 1: Multi-agent workflow execution"""
    runner = TestRunner()
    runner.print_header("TEST 1: Multi-Agent Workflow Execution")

    try:
        # Create orchestrator
        with tempfile.TemporaryDirectory() as tmpdir:
            orch = AgentOrchestrator(project_dir=Path(tmpdir))
            await orch.initialize()

            # Start agents
            runner.print_info("Starting agents...")
            success = await orch.start_agent("planner_1", "planner")
            if success:
                runner.print_success("Planner agent started")

            success = await orch.start_agent("developer_1", "developer")
            if success:
                runner.print_success("Developer agent started")

            success = await orch.start_agent("tester_1", "tester")
            if success:
                runner.print_success("Tester agent started")

            # Execute workflow
            runner.print_info("Executing Planner → Developer → Tester workflow...")
            workflow = [
                {
                    "agent": "planner_1",
                    "task": {
                        "id": "plan_feature",
                        "description": "Create implementation plan for new feature",
                        "type": "planning",
                        "complexity": "medium"
                    }
                },
                {
                    "agent": "developer_1",
                    "task": {
                        "id": "implement_feature",
                        "description": "Implement the feature according to plan",
                        "type": "development",
                        "complexity": "medium"
                    }
                },
                {
                    "agent": "tester_1",
                    "task": {
                        "id": "test_feature",
                        "description": "Test the implemented feature",
                        "type": "testing",
                        "complexity": "simple"
                    }
                }
            ]

            results = await orch.execute_workflow(workflow)

            # Verify results
            runner.print_info("Verifying results...")

            if len(results) == 3:
                runner.print_success("All 3 workflow steps executed")
            else:
                runner.print_failure(f"Expected 3 results, got {len(results)}")

            all_successful = all(r.success for r in results)
            if all_successful:
                runner.print_success("All tasks completed successfully")
            else:
                runner.print_failure("Some tasks failed")

            # Check planner output
            planner_result = results[0]
            if planner_result.success and planner_result.output:
                if "steps" in planner_result.output:
                    runner.print_success("Planner created execution plan")
                else:
                    runner.print_failure("Planner output missing steps")

            # Check developer output
            dev_result = results[1]
            if dev_result.success and dev_result.output:
                if "files_created" in dev_result.output:
                    runner.print_success("Developer created files")
                else:
                    runner.print_failure("Developer output missing files")

            # Check tester output
            test_result = results[2]
            if test_result.success and test_result.output:
                if "tests_run" in test_result.output:
                    runner.print_success("Tester executed tests")
                else:
                    runner.print_failure("Tester output missing test results")

            # Cleanup
            await orch.shutdown()

    except Exception as e:
        runner.print_failure("Multi-agent workflow test", str(e))

    return runner.summary()


async def test_memory_persistence():
    """Test 2: Memory persistence across agent executions"""
    runner = TestRunner()
    runner.print_header("TEST 2: Memory Persistence")

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            project_dir = Path(tmpdir)

            # First execution
            runner.print_info("First execution: Creating agents and executing tasks...")
            orch1 = AgentOrchestrator(project_dir=project_dir)
            await orch1.initialize(enable_memory=True)

            await orch1.start_agent("developer_1", "developer")
            await orch1.start_agent("tester_1", "tester")

            workflow1 = [
                {
                    "agent": "developer_1",
                    "task": {
                        "id": "task_1",
                        "description": "Write feature code",
                        "type": "development"
                    }
                },
                {
                    "agent": "tester_1",
                    "task": {
                        "id": "task_2",
                        "description": "Write tests",
                        "type": "testing"
                    }
                }
            ]

            await orch1.execute_workflow(workflow1)

            # Check memory
            memory_summary = orch1.get_memory_summary()
            if memory_summary.get("total_items", 0) > 0:
                runner.print_success(
                    f"Memory persisted: {memory_summary['total_items']} items stored"
                )
            else:
                runner.print_failure("No items in memory")

            # Verify specific items
            if orch1.context_manager:
                agent_data = orch1.context_manager.get_context("agent_developer_1")
                if agent_data:
                    runner.print_success("Agent data persisted in memory")
                else:
                    runner.print_failure("Agent data not found in memory")

            await orch1.shutdown()

            # Second execution - verify memory still exists
            runner.print_info("Second execution: Loading from existing memory...")
            orch2 = AgentOrchestrator(project_dir=project_dir)
            await orch2.initialize(enable_memory=True)

            memory_summary2 = orch2.get_memory_summary()
            if memory_summary2.get("total_items", 0) > 0:
                runner.print_success(
                    f"Memory persisted across executions: {memory_summary2['total_items']} items"
                )
            else:
                runner.print_failure("Memory not persisted across executions")

            # Verify previous data accessible
            if orch2.context_manager:
                agent_data2 = orch2.context_manager.get_context("agent_developer_1")
                if agent_data2:
                    runner.print_success("Previous agent data accessible")
                else:
                    runner.print_failure("Previous agent data not accessible")

            await orch2.shutdown()

    except Exception as e:
        runner.print_failure("Memory persistence test", str(e))

    return runner.summary()


async def test_external_integrations():
    """Test 3: External integrations (GitHub, Vibe Kanban)"""
    runner = TestRunner()
    runner.print_header("TEST 3: External Integrations (Mocked)")

    try:
        # GitHub Integration
        runner.print_info("Testing GitHub integration...")

        github = MockGitHubIntegration()

        # Create issue
        issue_id = await github.create_issue(
            repo="test/repo",
            title="Test Issue",
            body="This is a test issue"
        )

        if issue_id:
            runner.print_success(f"GitHub issue created: {issue_id}")
        else:
            runner.print_failure("Failed to create GitHub issue")

        # Create PR
        pr_id = await github.create_pr(
            repo="test/repo",
            title="Test PR",
            body="This is a test PR",
            source_branch="feature/test",
            target_branch="main"
        )

        if pr_id:
            runner.print_success(f"GitHub PR created: {pr_id}")
        else:
            runner.print_failure("Failed to create GitHub PR")

        # Check activity
        github_activity = github.get_activity()
        if github_activity["issues_created"] > 0:
            runner.print_success(
                f"GitHub activity tracked: {github_activity['issues_created']} issues"
            )
        else:
            runner.print_failure("GitHub activity not tracked")

        # Vibe Kanban Integration
        runner.print_info("Testing Vibe Kanban integration...")

        kanban = MockVibeKanbanIntegration()

        # Create tasks
        task1_id = await kanban.create_task(
            title="Implement feature",
            description="Add new feature to product",
            column="backlog",
            priority="high"
        )

        task2_id = await kanban.create_task(
            title="Write tests",
            description="Add unit tests for feature",
            column="todo",
            priority="medium"
        )

        if task1_id and task2_id:
            runner.print_success(f"Kanban tasks created: {task1_id}, {task2_id}")
        else:
            runner.print_failure("Failed to create Kanban tasks")

        # Move task
        moved = await kanban.move_task(task1_id, "in_progress")
        if moved:
            runner.print_success(f"Task moved to in_progress")
        else:
            runner.print_failure("Failed to move task")

        # Check board status
        board_status = kanban.get_board_status()
        if board_status["total_tasks"] == 2:
            runner.print_success(f"Kanban board status: {board_status['total_tasks']} tasks")
        else:
            runner.print_failure(f"Expected 2 tasks, got {board_status['total_tasks']}")

    except Exception as e:
        runner.print_failure("External integrations test", str(e))

    return runner.summary()


async def test_agent_coordination():
    """Test 4: Complex agent coordination scenarios"""
    runner = TestRunner()
    runner.print_header("TEST 4: Agent Coordination")

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            orch = AgentOrchestrator(project_dir=Path(tmpdir))
            await orch.initialize()

            # Start multiple agents of each type
            runner.print_info("Starting multiple agents...")

            await orch.start_agent("planner_1", "planner")
            await orch.start_agent("developer_1", "developer")
            await orch.start_agent("developer_2", "developer")
            await orch.start_agent("tester_1", "tester")

            runner.print_success("Started 4 agents (1 planner, 2 developers, 1 tester)")

            # Execute parallel development workflow
            runner.print_info("Executing parallel development workflow...")

            parallel_workflow = [
                {
                    "agent": "planner_1",
                    "task": {
                        "id": "plan_multi_feature",
                        "description": "Plan multiple related features",
                        "type": "planning"
                    }
                },
                {
                    "agent": "developer_1",
                    "task": {
                        "id": "implement_feature_a",
                        "description": "Implement Feature A",
                        "type": "development",
                        "context": {"feature": "A"}
                    }
                },
                {
                    "agent": "developer_2",
                    "task": {
                        "id": "implement_feature_b",
                        "description": "Implement Feature B",
                        "type": "development",
                        "context": {"feature": "B"}
                    }
                },
                {
                    "agent": "tester_1",
                    "task": {
                        "id": "test_all_features",
                        "description": "Test all implemented features",
                        "type": "testing"
                    }
                }
            ]

            results = await orch.execute_workflow(parallel_workflow)

            if len(results) == 4:
                runner.print_success("All 4 parallel tasks executed")
            else:
                runner.print_failure(f"Expected 4 results, got {len(results)}")

            # Verify coordination
            runner.print_info("Verifying agent coordination...")

            # Check that both developers created artifacts
            dev_artifacts = []
            for r in results:
                if "developer" in r.agent and r.success:
                    dev_artifacts.extend(r.artifacts)

            if len(dev_artifacts) >= 2:
                runner.print_success(
                    f"Multiple developers created artifacts: {len(dev_artifacts)} files"
                )
            else:
                runner.print_failure("Developer coordination failed")

            # Check workflow history
            history = orch.get_workflow_history()
            if len(history) > 0:
                runner.print_success(f"Workflow history tracked: {len(history)} workflows")
            else:
                runner.print_failure("Workflow history not tracked")

            await orch.shutdown()

    except Exception as e:
        runner.print_failure("Agent coordination test", str(e))

    return runner.summary()


async def test_error_handling():
    """Test 5: Error handling and recovery"""
    runner = TestRunner()
    runner.print_header("TEST 5: Error Handling")

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            orch = AgentOrchestrator(project_dir=Path(tmpdir))
            await orch.initialize()

            await orch.start_agent("developer_1", "developer")

            # Test with invalid agent
            runner.print_info("Testing error handling with invalid agent...")
            workflow = [
                {
                    "agent": "nonexistent_agent",
                    "task": {
                        "id": "fail_task",
                        "description": "This should fail"
                    }
                },
                {
                    "agent": "developer_1",
                    "task": {
                        "id": "success_task",
                        "description": "This should succeed",
                        "type": "development"
                    }
                }
            ]

            results = await orch.execute_workflow(workflow)

            # First should fail, second should succeed
            if not results[0].success and results[1].success:
                runner.print_success("Error handled gracefully, workflow continued")
            else:
                runner.print_failure("Error handling failed")

            await orch.shutdown()

    except Exception as e:
        runner.print_failure("Error handling test", str(e))

    return runner.summary()


# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

async def run_all_tests():
    """Run all integration tests"""
    print("\n")
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 68 + "║")
    print("║" + "  BLACKBOX5 AGENT INTEGRATION TEST SUITE".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("╚" + "=" * 68 + "╝")

    all_passed = True

    # Test 1: Multi-agent workflow
    passed = await test_multi_agent_workflow()
    all_passed = all_passed and passed

    # Test 2: Memory persistence
    passed = await test_memory_persistence()
    all_passed = all_passed and passed

    # Test 3: External integrations
    passed = await test_external_integrations()
    all_passed = all_passed and passed

    # Test 4: Agent coordination
    passed = await test_agent_coordination()
    all_passed = all_passed and passed

    # Test 5: Error handling
    passed = await test_error_handling()
    all_passed = all_passed and passed

    # Final summary
    print("\n")
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 68 + "║")
    if all_passed:
        print("║" + "  🎉 ALL TESTS PASSED! 🎉".center(68) + "║")
    else:
        print("║" + "  ⚠️  SOME TESTS FAILED ⚠️".center(68) + "║")
    print("║" + " " * 68 + "║")
    print("╚" + "=" * 68 + "╝")
    print("\n")

    return all_passed


def main():
    """Main entry point"""
    try:
        # Run tests
        result = asyncio.run(run_all_tests())

        # Exit with appropriate code
        sys.exit(0 if result else 1)

    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
