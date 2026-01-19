"""
Base Agent Class for Blackbox 5

This module defines the BaseAgent abstract class that all agents must inherit from.
Provides the foundational interface and common functionality for all agents.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class AgentStatus(Enum):
    """Agent execution status."""
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    OFFLINE = "offline"


@dataclass
class AgentConfig:
    """Configuration for an agent."""
    name: str
    full_name: str
    role: str
    category: str
    description: str
    capabilities: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    temperature: float = 0.7
    max_tokens: int = 4096
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentTask:
    """A task to be executed by an agent."""
    id: str
    description: str
    type: str = "general"
    complexity: str = "medium"
    context: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class AgentResult:
    """Result from an agent execution."""
    success: bool
    output: str
    artifacts: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    duration: float = 0.0
    thinking_steps: List[str] = field(default_factory=list)


class BaseAgent(ABC):
    """
    Abstract base class for all Blackbox 5 agents.

    All agents must inherit from this class and implement the required methods.
    The base class provides common functionality and enforces the agent interface.
    """

    def __init__(self, config: AgentConfig):
        """
        Initialize the agent with its configuration.

        Args:
            config: Agent configuration
        """
        self.config = config
        self.name = config.name
        self.role = config.role
        self.category = config.category
        self.status = AgentStatus.IDLE
        self._execution_count = 0
        self._last_execution: Optional[datetime] = None

        # Skills that this agent can use
        self._skills: List[str] = []

        logger.info(f"Initialized agent: {self.name} ({self.role})")

    @property
    def is_available(self) -> bool:
        """Check if the agent is available for task execution."""
        return self.status == AgentStatus.IDLE

    @property
    def execution_count(self) -> int:
        """Get the number of tasks executed by this agent."""
        return self._execution_count

    @property
    def last_execution(self) -> Optional[datetime]:
        """Get the timestamp of the last execution."""
        return self._last_execution

    @abstractmethod
    async def execute(self, task: AgentTask) -> AgentResult:
        """
        Execute a task.

        This is the main entry point for agent execution. All agents must
        implement this method to handle their specific task types.

        Args:
            task: The task to execute

        Returns:
            AgentResult containing the execution outcome

        Raises:
            Exception: If execution fails
        """
        pass

    @abstractmethod
    async def think(self, task: AgentTask) -> List[str]:
        """
        Perform thinking/reasoning steps for the task.

        This method should return a list of thinking steps that the agent
        will go through to solve the task. This is useful for transparency
        and debugging.

        Args:
            task: The task to think about

        Returns:
            List of thinking step descriptions
        """
        pass

    async def validate_task(self, task: AgentTask) -> bool:
        """
        Validate that the agent can handle this task.

        Args:
            task: The task to validate

        Returns:
            True if the agent can handle the task, False otherwise
        """
        # Check if task type matches agent capabilities
        if task.type and task.type not in ["general"] + self.config.capabilities:
            return False
        return True

    async def before_execution(self, task: AgentTask) -> None:
        """
        Hook called before task execution.

        Override this method to add pre-execution logic.

        Args:
            task: The task about to be executed
        """
        self.status = AgentStatus.BUSY
        logger.debug(f"Agent {self.name} starting task {task.id}")

    async def after_execution(self, task: AgentTask, result: AgentResult) -> None:
        """
        Hook called after task execution.

        Override this method to add post-execution logic.

        Args:
            task: The task that was executed
            result: The execution result
        """
        self.status = AgentStatus.IDLE
        self._execution_count += 1
        self._last_execution = datetime.now()
        logger.debug(f"Agent {self.name} completed task {task.id}")

    async def execute_with_hooks(self, task: AgentTask) -> AgentResult:
        """
        Execute task with before/after hooks.

        This is the recommended way to execute tasks as it ensures
        all hooks are called properly.

        Args:
            task: The task to execute

        Returns:
            AgentResult containing the execution outcome
        """
        # Validate task
        if not await self.validate_task(task):
            return AgentResult(
                success=False,
                output="",
                error=f"Task type '{task.type}' not supported by agent {self.name}"
            )

        # Call before hook
        await self.before_execution(task)

        # Execute task
        try:
            result = await self.execute(task)
        except Exception as e:
            logger.error(f"Agent {self.name} failed to execute task {task.id}: {e}")
            result = AgentResult(
                success=False,
                output="",
                error=str(e)
            )

        # Call after hook
        await self.after_execution(task, result)

        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Get agent capabilities and metadata.

        Returns:
            Dictionary containing agent capabilities
        """
        return {
            "name": self.name,
            "full_name": self.config.full_name,
            "role": self.role,
            "category": self.category,
            "description": self.config.description,
            "capabilities": self.config.capabilities,
            "tools": self.config.tools,
            "status": self.status.value,
            "execution_count": self._execution_count,
            "last_execution": self._last_execution.isoformat() if self._last_execution else None,
        }

    def attach_skill(self, skill_name: str) -> None:
        """
        Attach a skill to this agent.

        Args:
            skill_name: Name of the skill to attach
        """
        if skill_name not in self._skills:
            self._skills.append(skill_name)
            logger.debug(f"Attached skill '{skill_name}' to agent {self.name}")

    def get_skills(self) -> List[str]:
        """
        Get list of skills attached to this agent.

        Returns:
            List of skill names
        """
        return self._skills.copy()

    def __repr__(self) -> str:
        """String representation of the agent."""
        return f"Agent({self.name}, role={self.role}, status={self.status.value})"


class SimpleAgent(BaseAgent):
    """
    A simple implementation of BaseAgent for testing and basic use cases.

    This agent can be used as a starting point for more complex implementations
    or for simple tasks that don't require specialized logic.
    """

    async def execute(self, task: AgentTask) -> AgentResult:
        """
        Execute the task with simple processing.

        Args:
            task: The task to execute

        Returns:
            AgentResult with a simple response
        """
        thinking_steps = await self.think(task)

        # Simple processing - in a real implementation, this would
        # call an LLM or perform actual work
        response = f"Processed task '{task.description}' using {self.config.full_name}"

        return AgentResult(
            success=True,
            output=response,
            thinking_steps=thinking_steps,
            metadata={
                "agent_name": self.name,
                "agent_role": self.role,
                "task_type": task.type,
            }
        )

    async def think(self, task: AgentTask) -> List[str]:
        """
        Generate thinking steps for the task.

        Args:
            task: The task to think about

        Returns:
            List of thinking step descriptions
        """
        return [
            f"Understanding task: {task.description}",
            f"Analyzing requirements based on {self.role} expertise",
            f"Formulating response using {self.config.full_name}",
            f"Validating output against {self.category} standards",
        ]
