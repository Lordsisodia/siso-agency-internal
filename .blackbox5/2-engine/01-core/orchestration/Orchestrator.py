"""
Agent Orchestrator for Blackbox5

Coordinates multi-agent workflows and complex task execution.
"""

import logging
import asyncio
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable, Awaitable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

from agents.core.base_agent import BaseAgent, AgentTask, AgentResult
from state.event_bus import EventBus, Event, EventType

logger = logging.getLogger(__name__)


class WorkflowStatus(str, Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class WorkflowStep:
    """
    Represents a step in a workflow.

    Attributes:
        id: Unique step identifier
        name: Human-readable step name
        agent_name: Name of agent to execute this step
        task: Task to execute
        depends_on: List of step IDs this step depends on
        timeout: Maximum execution time in seconds
        retry_count: Number of retries on failure
        status: Current status of the step
        result: Result of step execution
        error: Error if step failed
        started_at: When step started
        completed_at: When step completed
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    agent_name: str = ""
    task: Optional[AgentTask] = None
    depends_on: List[str] = field(default_factory=list)
    timeout: float = 300.0
    retry_count: int = 0
    max_retries: int = 3
    status: WorkflowStatus = WorkflowStatus.PENDING
    result: Optional[AgentResult] = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert step to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "agent_name": self.agent_name,
            "depends_on": self.depends_on,
            "timeout": self.timeout,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "status": self.status.value,
            "error": self.error,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
        }


@dataclass
class Workflow:
    """
    Represents a multi-agent workflow.

    Attributes:
        id: Unique workflow identifier
        name: Human-readable workflow name
        description: Workflow description
        steps: List of workflow steps
        status: Current workflow status
        created_at: When workflow was created
        started_at: When workflow started
        completed_at: When workflow completed
        metadata: Additional workflow metadata
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    steps: List[WorkflowStep] = field(default_factory=list)
    status: WorkflowStatus = WorkflowStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class AgentOrchestrator:
    """
    Orchestrates multi-agent workflows.

    Features:
    - Execute workflows with multiple agents
    - Handle dependencies between steps
    - Retry failed steps
    - Track workflow progress
    - Emit events for monitoring
    """

    def __init__(
        self,
        event_bus: Optional[EventBus] = None,
        task_router: Optional[Any] = None,
        memory_base_path: Optional[Path] = None,
        max_concurrent_agents: int = 5,
        enable_checkpoints: bool = True,
        enable_state_management: bool = True
    ):
        """
        Initialize the orchestrator.

        Args:
            event_bus: Optional event bus for emitting events
            task_router: Optional task router for agent selection
            memory_base_path: Optional path for agent memory
            max_concurrent_agents: Maximum concurrent agents
            enable_checkpoints: Enable workflow checkpoints
            enable_state_management: Enable state management
        """
        self.event_bus = event_bus
        self._task_router = task_router
        self._memory_base_path = memory_base_path
        self._max_concurrent_agents = max_concurrent_agents
        self._enable_checkpoints = enable_checkpoints
        self._enable_state_management = enable_state_management
        self._agents: Dict[str, BaseAgent] = {}
        self._workflows: Dict[str, Workflow] = {}
        self._lock = asyncio.Lock()

    async def register_agent(self, agent: BaseAgent) -> None:
        """
        Register an agent for orchestration.

        Args:
            agent: Agent to register
        """
        async with self._lock:
            self._agents[agent.name] = agent

        logger.info(f"Orchestrator registered agent: {agent.name}")

    async def unregister_agent(self, agent_name: str) -> None:
        """
        Unregister an agent.

        Args:
            agent_name: Name of agent to unregister
        """
        async with self._lock:
            if agent_name in self._agents:
                del self._agents[agent_name]

        logger.info(f"Orchestrator unregistered agent: {agent_name}")

    async def execute_workflow(self, workflow: Workflow) -> Workflow:
        """
        Execute a workflow.

        Args:
            workflow: Workflow to execute

        Returns:
            Completed workflow with results
        """
        logger.info(f"Starting workflow: {workflow.name}")

        workflow.status = WorkflowStatus.RUNNING
        workflow.started_at = datetime.now().isoformat()

        try:
            await self._emit_event(
                Event(
                    type=EventType.TASK_STARTED,
                    data={
                        "workflow_id": workflow.id,
                        "workflow_name": workflow.name,
                    },
                    source="orchestrator",
                )
            )

            # Execute steps in dependency order
            completed_steps = set()
            failed = False

            while len(completed_steps) < len(workflow.steps) and not failed:
                progress_made = False

                for step in workflow.steps:
                    if step.id in completed_steps:
                        continue

                    # Check if dependencies are met
                    if not all(dep_id in completed_steps for dep_id in step.depends_on):
                        continue

                    # Execute step
                    try:
                        result = await self._execute_step(step)
                        step.status = WorkflowStatus.COMPLETED
                        step.result = result
                        step.completed_at = datetime.now().isoformat()
                        completed_steps.add(step.id)
                        progress_made = True

                    except Exception as e:
                        logger.error(f"Step {step.name} failed: {e}")
                        step.status = WorkflowStatus.FAILED
                        step.error = str(e)
                        step.completed_at = datetime.now().isoformat()

                        # Check if we should retry
                        if step.retry_count < step.max_retries:
                            step.retry_count += 1
                            step.status = WorkflowStatus.PENDING
                            logger.info(f"Retrying step {step.name} (attempt {step.retry_count})")
                        else:
                            failed = True
                            progress_made = True

                if not progress_made and not failed:
                    # Circular dependency or stuck
                    raise RuntimeError("Workflow stuck - no progress made")

            if failed:
                workflow.status = WorkflowStatus.FAILED
            else:
                workflow.status = WorkflowStatus.COMPLETED

            workflow.completed_at = datetime.now().isoformat()

        except Exception as e:
            logger.error(f"Workflow {workflow.name} failed: {e}")
            workflow.status = WorkflowStatus.FAILED
            workflow.completed_at = datetime.now().isoformat()

        await self._emit_event(
            Event(
                type=EventType.TASK_COMPLETED if workflow.status == WorkflowStatus.COMPLETED else EventType.TASK_FAILED,
                data={
                    "workflow_id": workflow.id,
                    "workflow_name": workflow.name,
                    "status": workflow.status.value,
                },
                source="orchestrator",
            )
        )

        return workflow

    async def _execute_step(self, step: WorkflowStep) -> AgentResult:
        """
        Execute a single workflow step.

        Args:
            step: Step to execute

        Returns:
            Agent result from execution

        Raises:
            ValueError: Agent not found
            asyncio.TimeoutError: Step execution timeout
        """
        if step.agent_name not in self._agents:
            raise ValueError(f"Agent not found: {step.agent_name}")

        agent = self._agents[step.agent_name]
        step.status = WorkflowStatus.RUNNING
        step.started_at = datetime.now().isoformat()

        await self._emit_event(
            Event(
                type=EventType.AGENT_STARTED,
                data={
                    "agent": step.agent_name,
                    "step_id": step.id,
                    "step_name": step.name,
                },
                source="orchestrator",
            )
        )

        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                agent.execute(step.task),
                timeout=step.timeout
            )

            await self._emit_event(
                Event(
                    type=EventType.AGENT_COMPLETED,
                    data={
                        "agent": step.agent_name,
                        "step_id": step.id,
                        "success": result.success,
                    },
                    source="orchestrator",
                )
            )

            return result

        except asyncio.TimeoutError:
            logger.error(f"Step {step.name} timed out after {step.timeout}s")
            raise

    async def create_parallel_workflow(
        self,
        tasks: Dict[str, AgentTask],
        agent_mapping: Dict[str, str],
    ) -> Workflow:
        """
        Create a workflow with parallel tasks.

        Args:
            tasks: Dictionary of task_id -> AgentTask
            agent_mapping: Dictionary of task_id -> agent_name

        Returns:
            Workflow ready to execute
        """
        steps = []

        for task_id, task in tasks.items():
            agent_name = agent_mapping.get(task_id)
            if not agent_name:
                raise ValueError(f"No agent specified for task: {task_id}")

            step = WorkflowStep(
                name=f"Task {task_id}",
                agent_name=agent_name,
                task=task,
            )
            steps.append(step)

        return Workflow(
            name="Parallel Workflow",
            description="Execute multiple tasks in parallel",
            steps=steps,
        )

    async def create_sequential_workflow(
        self,
        task_sequence: List[tuple],
    ) -> Workflow:
        """
        Create a workflow with sequential tasks.

        Args:
            task_sequence: List of (task, agent_name) tuples

        Returns:
            Workflow ready to execute
        """
        steps = []
        prev_step_id = None

        for task, agent_name in task_sequence:
            step = WorkflowStep(
                name=f"Sequential Step {len(steps) + 1}",
                agent_name=agent_name,
                task=task,
            )

            if prev_step_id:
                step.depends_on = [prev_step_id]

            prev_step_id = step.id
            steps.append(step)

        return Workflow(
            name="Sequential Workflow",
            description="Execute tasks in sequence",
            steps=steps,
        )

    async def _emit_event(self, event: Event) -> None:
        """Emit an event if event bus is available."""
        if self.event_bus:
            await self.event_bus.publish(event)

    async def get_statistics(self) -> Dict[str, Any]:
        """Get orchestrator statistics."""
        async with self._lock:
            return {
                "total_agents": len(self._agents),
                "total_workflows": len(self._workflows),
                "agent_names": list(self._agents.keys()),
            }
