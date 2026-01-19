"""
Tests for Multi-Agent Orchestrator
===================================

Tests the AgentOrchestrator's ability to:
- Start agents with unique IDs
- Manage agent lifecycle
- Execute workflows sequentially
- Execute tasks in parallel
- Manage persistent memory per agent
- Coordinate and aggregate results
"""

import asyncio
import pytest
import tempfile
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "engine"))

from core.Orchestrator import (
    AgentOrchestrator,
    AgentState,
    WorkflowState,
    AgentConfig,
    AgentInstance,
    WorkflowStep,
    WorkflowResult,
    ParallelTaskResult,
    create_orchestrator
)
from core.exceptions import ValidationError


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def temp_memory_path(tmp_path):
    """Create a temporary directory for agent memory."""
    memory_path = tmp_path / "agent_memory"
    memory_path.mkdir()
    return memory_path


@pytest.fixture
def mock_event_bus():
    """Create a mock event bus."""
    event_bus = Mock()
    event_bus.publish = Mock()
    return event_bus


@pytest.fixture
def mock_task_router():
    """Create a mock task router."""
    task_router = Mock()
    return task_router


@pytest.fixture
def orchestrator(temp_memory_path, mock_event_bus, mock_task_router):
    """Create an orchestrator instance with mocked dependencies."""
    return AgentOrchestrator(
        event_bus=mock_event_bus,
        task_router=mock_task_router,
        memory_base_path=temp_memory_path,
        max_concurrent_agents=3
    )


@pytest.fixture
def minimal_orchestrator(temp_memory_path):
    """Create an orchestrator without dependencies for minimal tests."""
    return AgentOrchestrator(
        event_bus=None,
        task_router=None,
        memory_base_path=temp_memory_path,
        max_concurrent_agents=3
    )


# =============================================================================
# AGENT LIFECYCLE TESTS
# =============================================================================

class TestAgentLifecycle:
    """Tests for agent lifecycle management."""

    def test_start_agent_generates_unique_id(self, orchestrator):
        """Test that starting agents generates unique IDs."""
        agent_id_1 = orchestrator.start_agent("developer", task="Build feature")
        agent_id_2 = orchestrator.start_agent("developer", task="Fix bug")
        agent_id_3 = orchestrator.start_agent("tester", task="Test feature")

        assert agent_id_1 == "developer_1"
        assert agent_id_2 == "developer_2"
        assert agent_id_3 == "tester_1"
        assert agent_id_1 != agent_id_2

    def test_start_agent_with_custom_id(self, orchestrator):
        """Test starting an agent with a custom ID."""
        agent_id = orchestrator.start_agent(
            "developer",
            task="Build feature",
            agent_id="my_custom_agent"
        )

        assert agent_id == "my_custom_agent"

    def test_start_agent_registers_agent(self, orchestrator):
        """Test that starting an agent registers it."""
        agent_id = orchestrator.start_agent("developer", task="Build feature")

        assert agent_id in orchestrator._agents
        agent = orchestrator._agents[agent_id]
        assert isinstance(agent, AgentInstance)
        assert agent.config.agent_type == "developer"
        assert agent.config.task == "Build feature"

    def test_start_agent_enforces_concurrent_limit(self, orchestrator):
        """Test that concurrent agent limit is enforced."""
        # Start max concurrent agents
        orchestrator.start_agent("developer_1", task="Task 1")
        orchestrator.start_agent("developer_2", task="Task 2")
        orchestrator.start_agent("developer_3", task="Task 3")

        # Try to start one more - should fail
        with pytest.raises(ValidationError) as exc_info:
            orchestrator.start_agent("developer_4", task="Task 4")

        assert "Maximum concurrent agents" in str(exc_info.value)

    def test_start_agent_prevents_duplicate_ids(self, orchestrator):
        """Test that duplicate agent IDs are prevented."""
        agent_id = orchestrator.start_agent("developer", task="Task 1")

        with pytest.raises(ValidationError) as exc_info:
            orchestrator.start_agent("tester", task="Task 2", agent_id=agent_id)

        assert "already exists" in str(exc_info.value)

    def test_stop_agent(self, orchestrator):
        """Test stopping a running agent."""
        agent_id = orchestrator.start_agent("developer", task="Build feature")
        agent = orchestrator._agents[agent_id]

        # Agent starts in STARTING state
        assert agent.state == AgentState.STARTING

        # Stop the agent
        result = orchestrator.stop_agent(agent_id)

        assert result is True
        assert agent.state == AgentState.STOPPED
        assert agent.completed_at is not None

    def test_stop_nonexistent_agent(self, orchestrator):
        """Test stopping a non-existent agent."""
        result = orchestrator.stop_agent("nonexistent_agent")
        assert result is False

    def test_stop_completed_agent(self, orchestrator):
        """Test stopping an already completed agent."""
        agent_id = orchestrator.start_agent("developer", task="Task")
        agent = orchestrator._agents[agent_id]

        # Mark as completed
        agent.state = AgentState.COMPLETED
        agent.completed_at = datetime.now()

        # Stop should succeed but not change state
        result = orchestrator.stop_agent(agent_id)
        assert result is True
        assert agent.state == AgentState.COMPLETED

    def test_get_agent_status(self, orchestrator):
        """Test getting agent status."""
        agent_id = orchestrator.start_agent(
            "developer",
            task="Build feature",
            model="claude-opus-4-5-20250929"
        )

        status = orchestrator.get_agent_status(agent_id)

        assert status is not None
        assert status["agent_id"] == agent_id
        assert status["agent_type"] == "developer"
        assert status["state"] == AgentState.STARTING.value
        assert status["memory_enabled"] is True

    def test_get_agent_status_nonexistent(self, orchestrator):
        """Test getting status of non-existent agent."""
        status = orchestrator.get_agent_status("nonexistent")
        assert status is None


# =============================================================================
# AGENT LISTING TESTS
# =============================================================================

class TestAgentListing:
    """Tests for agent listing and filtering."""

    def test_list_all_agents(self, orchestrator):
        """Test listing all agents."""
        orchestrator.start_agent("developer", task="Task 1")
        orchestrator.start_agent("tester", task="Task 2")
        orchestrator.start_agent("developer", task="Task 3")

        agents = orchestrator.list_agents()

        assert len(agents) == 3

    def test_list_agents_by_type(self, orchestrator):
        """Test filtering agents by type."""
        orchestrator.start_agent("developer", task="Task 1")
        orchestrator.start_agent("tester", task="Task 2")
        orchestrator.start_agent("developer", task="Task 3")

        developers = orchestrator.list_agents(agent_type="developer")
        testers = orchestrator.list_agents(agent_type="tester")

        assert len(developers) == 2
        assert len(testers) == 1

    def test_list_agents_by_state(self, orchestrator):
        """Test filtering agents by state."""
        agent_id_1 = orchestrator.start_agent("developer", task="Task 1")
        agent_id_2 = orchestrator.start_agent("tester", task="Task 2")

        # Stop one agent
        orchestrator.stop_agent(agent_id_1)

        starting = orchestrator.list_agents(state=AgentState.STARTING)
        stopped = orchestrator.list_agents(state=AgentState.STOPPED)

        assert len(starting) == 1
        assert len(stopped) == 1


# =============================================================================
# WORKFLOW EXECUTION TESTS
# =============================================================================

class TestWorkflowExecution:
    """Tests for workflow execution."""

    def test_execute_workflow_sequentially(self, orchestrator):
        """Test executing a workflow sequentially."""
        workflow = [
            WorkflowStep(
                agent_type="planner",
                task="Create implementation plan"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Implement feature"
            ),
            WorkflowStep(
                agent_type="tester",
                task="Run tests"
            ),
        ]

        result = orchestrator.execute_workflow(workflow)

        assert isinstance(result, WorkflowResult)
        assert result.state == WorkflowState.COMPLETED
        assert result.steps_completed == 3
        assert result.steps_total == 3
        assert len(result.results) == 3
        assert len(result.errors) == 0

    def test_execute_workflow_with_dict_steps(self, orchestrator):
        """Test executing workflow with dictionary steps."""
        workflow = [
            {
                "agent_type": "planner",
                "task": "Create plan"
            },
            {
                "agent_type": "developer",
                "task": "Implement"
            }
        ]

        result = orchestrator.execute_workflow(workflow)

        assert result.state == WorkflowState.COMPLETED
        assert result.steps_completed == 2

    def test_execute_workflow_with_custom_agent_ids(self, orchestrator):
        """Test workflow with custom agent IDs."""
        workflow = [
            WorkflowStep(
                agent_type="planner",
                task="Plan",
                agent_id="custom_planner"
            ),
            WorkflowStep(
                agent_type="developer",
                task="Implement",
                agent_id="custom_developer"
            )
        ]

        result = orchestrator.execute_workflow(workflow)

        assert "custom_planner" in result.results
        assert "custom_developer" in result.results

    def test_execute_workflow_generates_workflow_id(self, orchestrator):
        """Test that workflow ID is auto-generated."""
        workflow = [
            WorkflowStep(agent_type="planner", task="Plan")
        ]

        result = orchestrator.execute_workflow(workflow)

        assert result.workflow_id.startswith("workflow_")
        assert len(result.workflow_id) > len("workflow_")

    def test_execute_workflow_with_custom_id(self, orchestrator):
        """Test workflow with custom ID."""
        workflow = [
            WorkflowStep(agent_type="planner", task="Plan")
        ]

        result = orchestrator.execute_workflow(workflow, workflow_id="my_workflow")

        assert result.workflow_id == "my_workflow"

    def test_get_workflow_status(self, orchestrator):
        """Test retrieving workflow status."""
        workflow = [
            WorkflowStep(agent_type="planner", task="Plan")
        ]

        result = orchestrator.execute_workflow(workflow, workflow_id="test_workflow")
        status = orchestrator.get_workflow_status("test_workflow")

        assert status is not None
        assert status.workflow_id == "test_workflow"
        assert status.state == WorkflowState.COMPLETED

    def test_get_nonexistent_workflow_status(self, orchestrator):
        """Test getting status of non-existent workflow."""
        status = orchestrator.get_workflow_status("nonexistent")
        assert status is None


# =============================================================================
# PARALLEL EXECUTION TESTS
# =============================================================================

class TestParallelExecution:
    """Tests for parallel task execution."""

    @pytest.mark.asyncio
    async def test_parallel_execute(self, orchestrator):
        """Test executing tasks in parallel."""
        tasks = [
            WorkflowStep(agent_type="developer", task="Build API"),
            WorkflowStep(agent_type="developer", task="Build UI"),
            WorkflowStep(agent_type="tester", task="Write tests"),
        ]

        results = await orchestrator.parallel_execute(tasks)

        assert len(results) == 3
        assert all(isinstance(r, ParallelTaskResult) for r in results)

        # Check all succeeded
        succeeded = [r for r in results if r.success]
        assert len(succeeded) == 3

    @pytest.mark.asyncio
    async def test_parallel_execute_with_dict_tasks(self, orchestrator):
        """Test parallel execution with dictionary tasks."""
        tasks = [
            {"agent_type": "developer", "task": "Task 1"},
            {"agent_type": "developer", "task": "Task 2"},
        ]

        results = await orchestrator.parallel_execute(tasks)

        assert len(results) == 2
        assert all(r.success for r in results)

    @pytest.mark.asyncio
    async def test_parallel_execute_respects_concurrent_limit(self, orchestrator):
        """Test that parallel execution respects concurrent limit."""
        # Orchestrator has max_concurrent=3
        tasks = [
            WorkflowStep(agent_type="developer", task=f"Task {i}")
            for i in range(5)
        ]

        results = await orchestrator.parallel_execute(tasks)

        # All should complete, but limited to 3 concurrent
        assert len(results) == 5
        assert all(isinstance(r, ParallelTaskResult) for r in results)

    @pytest.mark.asyncio
    async def test_parallel_execute_generates_unique_agent_ids(self, orchestrator):
        """Test that parallel tasks get unique agent IDs."""
        tasks = [
            WorkflowStep(agent_type="developer", task=f"Task {i}")
            for i in range(3)
        ]

        results = await orchestrator.parallel_execute(tasks)

        agent_ids = [r.agent_id for r in results]
        assert len(agent_ids) == len(set(agent_ids))  # All unique


# =============================================================================
# MEMORY MANAGEMENT TESTS
# =============================================================================

class TestMemoryManagement:
    """Tests for agent memory management."""

    def test_agent_memory_persistence(self, temp_memory_path):
        """Test that agent memory persists across sessions."""
        # Create orchestrator
        orchestrator = AgentOrchestrator(
            memory_base_path=temp_memory_path,
            event_bus=None,
            task_router=None
        )

        # Start agent and add to memory
        agent_id = orchestrator.start_agent(
            "developer",
            task="Build feature",
            memory_enabled=True
        )

        agent = orchestrator._agents[agent_id]
        agent.memory["pattern"] = "Use React hooks for state"
        agent.memory["gotcha"] = "Don't forget error handling"

        # Save memory
        orchestrator._save_agent_memory(agent_id, agent.memory)

        # Stop agent
        orchestrator.stop_agent(agent_id)

        # Create new orchestrator instance
        orchestrator2 = AgentOrchestrator(
            memory_base_path=temp_memory_path,
            event_bus=None,
            task_router=None
        )

        # Start agent with same ID
        agent_id_2 = orchestrator2.start_agent(
            "developer",
            task="Another task",
            agent_id=agent_id,
            memory_enabled=True
        )

        # Check memory was loaded
        agent_2 = orchestrator2._agents[agent_id_2]
        assert "pattern" in agent_2.memory
        assert agent_2.memory["pattern"] == "Use React hooks for state"

    def test_agent_memory_disabled(self, temp_memory_path):
        """Test agent with memory disabled."""
        orchestrator = AgentOrchestrator(
            memory_base_path=temp_memory_path,
            event_bus=None,
            task_router=None
        )

        agent_id = orchestrator.start_agent(
            "developer",
            task="Build feature",
            memory_enabled=False
        )

        agent = orchestrator._agents[agent_id]
        assert agent.config.memory_enabled is False
        assert agent.config.memory_path is None

        # Memory should not be saved
        orchestrator.stop_agent(agent_id)
        memory_file = temp_memory_path / f"{agent_id}_memory.json"
        assert not memory_file.exists()

    def test_memory_path_generation(self, orchestrator):
        """Test that memory path is generated correctly."""
        agent_id = orchestrator.start_agent("developer", task="Task")

        memory_path = orchestrator._get_agent_memory_path(agent_id)

        assert memory_path == orchestrator.memory_base_path / f"{agent_id}_memory.json"


# =============================================================================
# CLEANUP TESTS
# =============================================================================

class TestCleanup:
    """Tests for cleanup operations."""

    def test_cleanup_completed_agents(self, orchestrator):
        """Test cleaning up completed agents."""
        # Start and complete some agents
        agent_id_1 = orchestrator.start_agent("developer", task="Task 1")
        agent_id_2 = orchestrator.start_agent("developer", task="Task 2")

        # Complete them
        orchestrator._agents[agent_id_1].state = AgentState.COMPLETED
        orchestrator._agents[agent_id_1].completed_at = datetime.now()
        orchestrator._agents[agent_id_2].state = AgentState.COMPLETED
        orchestrator._agents[agent_id_2].completed_at = datetime.now()

        # Cleanup
        cleaned = orchestrator.cleanup_completed_agents(older_than_seconds=0)

        assert cleaned == 2
        assert agent_id_1 not in orchestrator._agents
        assert agent_id_2 not in orchestrator._agents

    def test_cleanup_respects_time_threshold(self, orchestrator):
        """Test that cleanup only removes old agents."""
        import time

        # Start an agent and complete it
        agent_id = orchestrator.start_agent("developer", task="Task")
        orchestrator._agents[agent_id].state = AgentState.COMPLETED
        orchestrator._agents[agent_id].completed_at = datetime.now()

        # Cleanup with threshold (should not remove recent agent)
        cleaned = orchestrator.cleanup_completed_agents(older_than_seconds=3600)

        assert cleaned == 0
        assert agent_id in orchestrator._agents


# =============================================================================
# STATISTICS TESTS
# =============================================================================

class TestStatistics:
    """Tests for orchestrator statistics."""

    def test_get_statistics(self, orchestrator):
        """Test getting orchestrator statistics."""
        # Start some agents
        orchestrator.start_agent("developer", task="Task 1")
        orchestrator.start_agent("tester", task="Task 2")

        # Execute workflow
        workflow = [WorkflowStep(agent_type="planner", task="Plan")]
        orchestrator.execute_workflow(workflow)

        stats = orchestrator.get_statistics()

        assert stats["total_agents"] >= 3
        assert "agents_by_state" in stats
        assert "agents_by_type" in stats
        assert stats["total_workflows"] >= 1
        assert stats["completed_workflows"] >= 1
        assert stats["max_concurrent_agents"] == 3

    def test_statistics_counts_by_state(self, orchestrator):
        """Test that statistics correctly count agents by state."""
        agent_id = orchestrator.start_agent("developer", task="Task")
        orchestrator._agents[agent_id].state = AgentState.RUNNING

        stats = orchestrator.get_statistics()

        assert stats["agents_by_state"]["running"] >= 1

    def test_statistics_counts_by_type(self, orchestrator):
        """Test that statistics correctly count agents by type."""
        orchestrator.start_agent("developer", task="Task 1")
        orchestrator.start_agent("developer", task="Task 2")
        orchestrator.start_agent("tester", task="Task 3")

        stats = orchestrator.get_statistics()

        assert stats["agents_by_type"]["developer"] >= 2
        assert stats["agents_by_type"]["tester"] >= 1


# =============================================================================
# CONVENIENCE FUNCTIONS TESTS
# =============================================================================

class TestConvenienceFunctions:
    """Tests for convenience functions."""

    def test_create_orchestrator(self, temp_memory_path):
        """Test creating orchestrator with convenience function."""
        orchestrator = create_orchestrator(
            event_bus=None,
            task_router=None,
            memory_base_path=temp_memory_path,
            max_concurrent_agents=5
        )

        assert isinstance(orchestrator, AgentOrchestrator)
        assert orchestrator.max_concurrent_agents == 5
        assert orchestrator.memory_base_path == temp_memory_path


# =============================================================================
# EVENT EMISSION TESTS
# =============================================================================

class TestEventEmission:
    """Tests for event emission."""

    def test_start_agent_emits_event(self, orchestrator, mock_event_bus):
        """Test that starting an agent emits an event."""
        orchestrator.start_agent("developer", task="Build feature")

        # Verify event was published
        assert mock_event_bus.publish.called

        # Get the event that was published
        call_args = mock_event_bus.publish.call_args
        event = call_args[0][1]  # Second argument is the event

        assert event.data["agent_type"] == "developer"
        assert "agent_id" in event.data

    def test_stop_agent_emits_event(self, orchestrator, mock_event_bus):
        """Test that stopping an agent emits an event."""
        agent_id = orchestrator.start_agent("developer", task="Task")
        mock_event_bus.publish.reset_mock()  # Clear previous calls

        orchestrator.stop_agent(agent_id)

        # Verify stop event was published
        assert mock_event_bus.publish.called


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

class TestIntegration:
    """Integration tests for complex scenarios."""

    def test_full_workflow_lifecycle(self, orchestrator):
        """Test complete workflow lifecycle."""
        # Create workflow
        workflow = [
            WorkflowStep(agent_type="planner", task="Create plan"),
            WorkflowStep(agent_type="developer", task="Implement"),
            WorkflowStep(agent_type="tester", task="Test"),
        ]

        # Execute workflow
        result = orchestrator.execute_workflow(workflow, workflow_id="full_test")

        # Verify workflow completed
        assert result.state == WorkflowState.COMPLETED
        assert result.steps_completed == 3

        # Check all agents exist
        assert "planner_1" in orchestrator._agents
        assert "developer_1" in orchestrator._agents
        assert "tester_1" in orchestrator._agents

        # Verify statistics
        stats = orchestrator.get_statistics()
        assert stats["total_agents"] >= 3
        assert stats["completed_workflows"] >= 1

    @pytest.mark.asyncio
    async def test_mixed_sequential_and_parallel(self, orchestrator):
        """Test combining sequential and parallel execution."""
        # Sequential phase
        workflow = [
            WorkflowStep(agent_type="planner", task="Plan")
        ]
        await orchestrator.execute_workflow(workflow)

        # Parallel phase
        tasks = [
            WorkflowStep(agent_type="developer", task="Feature 1"),
            WorkflowStep(agent_type="developer", task="Feature 2"),
        ]
        parallel_results = await orchestrator.parallel_execute(tasks)

        # All should complete successfully
        assert len(parallel_results) == 2
        assert all(r.success for r in parallel_results)


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-x"])
