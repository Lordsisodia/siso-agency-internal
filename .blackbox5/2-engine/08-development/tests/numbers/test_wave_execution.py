"""
Comprehensive tests for Wave-Based Execution Orchestrator.

Tests the wave-based parallel execution feature that organizes tasks into waves
based on dependencies for optimal parallelization.

Test Cases:
- Simple linear chain: A → B → C (3 waves of 1 task each)
- Diamond pattern: A → [B,C] → D (3 waves: [A], [B,C], [D])
- Complex DAG with multiple levels
- Circular dependency detection (should raise error)
- Empty task list
- Single task (no dependencies)
- Independent tasks (1 wave with all tasks)
"""

import asyncio
import pytest
from datetime import datetime
from typing import List

import sys
from pathlib import Path

# Add parent directory to path to import from engine
sys.path.insert(0, str(Path(__file__).parent.parent))

from engine.core.Orchestrator import (
    AgentOrchestrator,
    WorkflowStep,
    WorkflowResult,
    WaveResult,
    WorkflowState,
)


class TestDependencyGraph:
    """Test dependency graph construction."""

    def test_build_dependency_graph_no_deps(self):
        """Build graph with tasks that have no dependencies."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(agent_type="developer", task="Task A", agent_id="task_a"),
            WorkflowStep(agent_type="developer", task="Task B", agent_id="task_b"),
            WorkflowStep(agent_type="tester", task="Task C", agent_id="task_c"),
        ]

        graph = orchestrator._build_dependency_graph(tasks)

        assert graph == {
            "task_a": [],
            "task_b": [],
            "task_c": [],
        }

    def test_build_dependency_graph_with_deps(self):
        """Build graph with tasks that have dependencies."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Setup DB",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Build API",
                agent_id="task_b",
                depends_on=["task_a"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="Test API",
                agent_id="task_c",
                depends_on=["task_b"]
            ),
        ]

        graph = orchestrator._build_dependency_graph(tasks)

        assert graph == {
            "task_a": [],
            "task_b": ["task_a"],
            "task_c": ["task_b"],
        }

    def test_build_dependency_graph_auto_ids(self):
        """Build graph with auto-generated task IDs."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(agent_type="developer", task="Task A"),  # task_0
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                depends_on=["task_0"]
            ),  # task_1
        ]

        graph = orchestrator._build_dependency_graph(tasks)

        assert graph == {
            "task_0": [],
            "task_1": ["task_0"],
        }

    def test_build_dependency_graph_diamond(self):
        """Build diamond dependency graph."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(agent_type="developer", task="Base", agent_id="base"),
            WorkflowStep(
                agent_type="developer",
                task="Feature A",
                agent_id="feature_a",
                depends_on=["base"]
            ),
            WorkflowStep(
                agent_type="developer",
                task="Feature B",
                agent_id="feature_b",
                depends_on=["base"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="Integration",
                agent_id="integration",
                depends_on=["feature_a", "feature_b"]
            ),
        ]

        graph = orchestrator._build_dependency_graph(tasks)

        assert graph == {
            "base": [],
            "feature_a": ["base"],
            "feature_b": ["base"],
            "integration": ["feature_a", "feature_b"],
        }


class TestTopologicalSort:
    """Test topological sort with wave organization."""

    def test_linear_chain(self):
        """Test linear chain: A → B → C."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": [],
            "task_b": ["task_a"],
            "task_c": ["task_b"],
        }

        waves = orchestrator._topological_sort_with_waves(graph)

        assert len(waves) == 3
        assert waves == [["task_a"], ["task_b"], ["task_c"]]

    def test_diamond_pattern(self):
        """Test diamond pattern: A → [B,C] → D."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": [],
            "task_b": ["task_a"],
            "task_c": ["task_a"],
            "task_d": ["task_b", "task_c"],
        }

        waves = orchestrator._topological_sort_with_waves(graph)

        assert len(waves) == 3
        # Wave 1: task_a (no dependencies)
        assert set(waves[0]) == {"task_a"}
        # Wave 2: task_b and task_c (both depend only on task_a)
        assert set(waves[1]) == {"task_b", "task_c"}
        # Wave 3: task_d (depends on both task_b and task_c)
        assert set(waves[2]) == {"task_d"}

    def test_independent_tasks(self):
        """Test independent tasks (should be 1 wave)."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": [],
            "task_b": [],
            "task_c": [],
        }

        waves = orchestrator._topological_sort_with_waves(graph)

        assert len(waves) == 1
        assert set(waves[0]) == {"task_a", "task_b", "task_c"}

    def test_complex_dag(self):
        """Test complex DAG with multiple levels."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": [],  # Level 0
            "task_b": [],  # Level 0
            "task_c": ["task_a"],  # Level 1
            "task_d": ["task_a", "task_b"],  # Level 1
            "task_e": ["task_c"],  # Level 2
            "task_f": ["task_d"],  # Level 2
            "task_g": ["task_e", "task_f"],  # Level 3
        }

        waves = orchestrator._topological_sort_with_waves(graph)

        assert len(waves) == 4
        assert set(waves[0]) == {"task_a", "task_b"}
        assert set(waves[1]) == {"task_c", "task_d"}
        assert set(waves[2]) == {"task_e", "task_f"}
        assert set(waves[3]) == {"task_g"}

    def test_circular_dependency(self):
        """Test circular dependency detection."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": ["task_b"],
            "task_b": ["task_c"],
            "task_c": ["task_a"],  # Circular!
        }

        with pytest.raises(ValueError) as exc_info:
            orchestrator._topological_sort_with_waves(graph)

        assert "Circular dependency detected" in str(exc_info.value)

    def test_self_dependency(self):
        """Test task that depends on itself."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": ["task_a"],  # Self-dependency
        }

        with pytest.raises(ValueError) as exc_info:
            orchestrator._topological_sort_with_waves(graph)

        assert "Circular dependency detected" in str(exc_info.value)

    def test_empty_graph(self):
        """Test empty graph."""
        orchestrator = AgentOrchestrator()

        graph = {}

        waves = orchestrator._topological_sort_with_waves(graph)

        assert waves == []

    def test_single_task(self):
        """Test single task with no dependencies."""
        orchestrator = AgentOrchestrator()

        graph = {
            "task_a": [],
        }

        waves = orchestrator._topological_sort_with_waves(graph)

        assert len(waves) == 1
        assert waves[0] == ["task_a"]


class TestWaveBasedExecution:
    """Test wave-based execution end-to-end."""

    @pytest.mark.asyncio
    async def test_empty_task_list(self):
        """Test execution with empty task list."""
        orchestrator = AgentOrchestrator()

        result = await orchestrator.execute_wave_based([])

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 0
        assert result.steps_completed == 0
        assert result.waves_completed == 0

    @pytest.mark.asyncio
    async def test_single_task(self):
        """Test execution with single task."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Build feature",
                agent_id="task_1"
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 1
        assert result.steps_completed == 1
        assert result.waves_completed == 1
        assert len(result.wave_details) == 1

        # Check wave details
        wave = result.wave_details[0]
        assert wave.wave_number == 1
        assert wave.task_ids == ["task_1"]
        assert wave.success_count == 1
        assert wave.failure_count == 0

    @pytest.mark.asyncio
    async def test_linear_chain_execution(self):
        """Test execution of linear chain."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Setup DB",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Build API",
                agent_id="task_b",
                depends_on=["task_a"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="Test API",
                agent_id="task_c",
                depends_on=["task_b"]
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 3
        assert result.steps_completed == 3
        assert result.waves_completed == 3
        assert len(result.wave_details) == 3

        # Verify wave structure
        assert result.wave_details[0].task_ids == ["task_a"]
        assert result.wave_details[1].task_ids == ["task_b"]
        assert result.wave_details[2].task_ids == ["task_c"]

        # All should succeed
        for wave in result.wave_details:
            assert wave.success_count == 1
            assert wave.failure_count == 0

    @pytest.mark.asyncio
    async def test_diamond_pattern_execution(self):
        """Test execution of diamond pattern."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Setup",
                agent_id="base"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Feature A",
                agent_id="feature_a",
                depends_on=["base"]
            ),
            WorkflowStep(
                agent_type="developer",
                task="Feature B",
                agent_id="feature_b",
                depends_on=["base"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="Integration",
                agent_id="integration",
                depends_on=["feature_a", "feature_b"]
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 4
        assert result.steps_completed == 4
        assert result.waves_completed == 3
        assert len(result.wave_details) == 3

        # Verify wave structure
        assert result.wave_details[0].task_ids == ["base"]
        assert set(result.wave_details[1].task_ids) == {"feature_a", "feature_b"}
        assert result.wave_details[2].task_ids == ["integration"]

        # Verify wave 1 has 2 tasks in parallel
        assert result.wave_details[1].success_count == 2
        assert result.wave_details[1].failure_count == 0

    @pytest.mark.asyncio
    async def test_independent_tasks_execution(self):
        """Test execution of independent tasks (single wave)."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                agent_id="task_b"
            ),
            WorkflowStep(
                agent_type="tester",
                task="Task C",
                agent_id="task_c"
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 3
        assert result.steps_completed == 3
        assert result.waves_completed == 1
        assert len(result.wave_details) == 1

        # All 3 tasks should be in wave 1
        wave = result.wave_details[0]
        assert set(wave.task_ids) == {"task_a", "task_b", "task_c"}
        assert wave.success_count == 3
        assert wave.failure_count == 0

    @pytest.mark.asyncio
    async def test_circular_dependency_detection(self):
        """Test that circular dependencies are detected and reported."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a",
                depends_on=["task_c"]  # Creates cycle
            ),
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                agent_id="task_b",
                depends_on=["task_a"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="Task C",
                agent_id="task_c",
                depends_on=["task_b"]
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.FAILED
        assert "circular_dependency" in result.errors
        assert "Circular dependency detected" in result.errors["circular_dependency"]

    @pytest.mark.asyncio
    async def test_workflow_id_custom(self):
        """Test custom workflow ID."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
        ]

        result = await orchestrator.execute_wave_based(
            tasks,
            workflow_id="custom_workflow"
        )

        assert result.workflow_id == "custom_workflow"

    @pytest.mark.asyncio
    async def test_workflow_id_auto_generated(self):
        """Test auto-generated workflow ID."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.workflow_id.startswith("workflow_")
        assert len(result.workflow_id) == len("workflow_") + 8  # 8 hex chars

    @pytest.mark.asyncio
    async def test_wave_result_timing(self):
        """Test that wave timing is recorded correctly."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                agent_id="task_b",
                depends_on=["task_a"]
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        # Check timing information
        for wave in result.wave_details:
            assert wave.started_at is not None
            assert wave.completed_at is not None
            assert wave.completed_at >= wave.started_at

        # Check overall timing
        assert result.started_at is not None
        assert result.completed_at is not None
        assert result.completed_at >= result.started_at

    @pytest.mark.asyncio
    async def test_complex_dag_execution(self):
        """Test execution of complex DAG with multiple levels."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(agent_type="dev", task="A", agent_id="task_a"),
            WorkflowStep(agent_type="dev", task="B", agent_id="task_b"),
            WorkflowStep(
                agent_type="dev",
                task="C",
                agent_id="task_c",
                depends_on=["task_a"]
            ),
            WorkflowStep(
                agent_type="dev",
                task="D",
                agent_id="task_d",
                depends_on=["task_a", "task_b"]
            ),
            WorkflowStep(
                agent_type="dev",
                task="E",
                agent_id="task_e",
                depends_on=["task_c"]
            ),
            WorkflowStep(
                agent_type="dev",
                task="F",
                agent_id="task_f",
                depends_on=["task_d"]
            ),
            WorkflowStep(
                agent_type="tester",
                task="G",
                agent_id="task_g",
                depends_on=["task_e", "task_f"]
            ),
        ]

        result = await orchestrator.execute_wave_based(tasks)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_total == 7
        assert result.steps_completed == 7
        assert result.waves_completed == 4

        # Verify wave structure
        assert set(result.wave_details[0].task_ids) == {"task_a", "task_b"}
        assert set(result.wave_details[1].task_ids) == {"task_c", "task_d"}
        assert set(result.wave_details[2].task_ids) == {"task_e", "task_f"}
        assert result.wave_details[3].task_ids == ["task_g"]


class TestWaveResultDataclass:
    """Test WaveResult dataclass."""

    def test_wave_result_creation(self):
        """Test creating a WaveResult."""
        now = datetime.now()

        wave_result = WaveResult(
            wave_number=1,
            task_ids=["task_a", "task_b"],
            results=[],
            started_at=now,
            completed_at=now,
            success_count=2,
            failure_count=0
        )

        assert wave_result.wave_number == 1
        assert wave_result.task_ids == ["task_a", "task_b"]
        assert wave_result.results == []
        assert wave_result.started_at == now
        assert wave_result.completed_at == now
        assert wave_result.success_count == 2
        assert wave_result.failure_count == 0


class TestIntegrationWithExistingAPI:
    """Test integration with existing orchestrator API."""

    @pytest.mark.asyncio
    async def test_parallel_execute_still_works(self):
        """Test that parallel_execute still works after adding wave execution."""
        orchestrator = AgentOrchestrator()

        tasks = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                agent_id="task_b"
            ),
        ]

        results = await orchestrator.parallel_execute(tasks)

        assert len(results) == 2
        assert all(r.success for r in results)

    @pytest.mark.asyncio
    async def test_execute_workflow_still_works(self):
        """Test that execute_workflow still works after adding wave execution."""
        orchestrator = AgentOrchestrator()

        workflow = [
            WorkflowStep(
                agent_type="developer",
                task="Task A",
                agent_id="task_a"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Task B",
                agent_id="task_b"
            ),
        ]

        result = orchestrator.execute_workflow(workflow)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_completed == 2

    def test_agent_lifecycle_unchanged(self):
        """Test that agent lifecycle methods are unchanged."""
        orchestrator = AgentOrchestrator()

        # Start agent
        agent_id = orchestrator.start_agent(
            agent_type="developer",
            task="Build feature"
        )

        assert agent_id in orchestrator._agents

        # Get status
        status = orchestrator.get_agent_status(agent_id)
        assert status is not None
        assert status["agent_id"] == agent_id

        # Stop agent
        stopped = orchestrator.stop_agent(agent_id)
        assert stopped is True


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "-s"])
