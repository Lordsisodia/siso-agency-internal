"""
Black Box 5 Engine - Base Agent Class

Provides the foundation for all agents in the system.
Implements the agent interface used by BMAD, GSD, and specialist agents.
"""

import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger("BaseAgent")


@dataclass
class AgentConfig:
    """Agent configuration"""
    name: str
    full_name: str
    role: str
    category: str  # bmad, gsd, specialist, core, research
    icon: str = "🤖"
    description: str = ""
    capabilities: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    artifacts: List[str] = field(default_factory=list)

    # Agent behavior
    communication_style: str = "professional"
    context_budget: Optional[int] = None  # Tokens, None = unlimited
    parallel_execution: bool = False

    # Paths
    base_path: Optional[Path] = None
    prompt_path: Optional[Path] = None
    templates_path: Optional[Path] = None


@dataclass
class Task:
    """A task to be executed by an agent"""
    id: str
    description: str
    type: str  # analysis, architecture, implementation, research, etc.
    complexity: str  # simple, medium, complex
    context: Dict[str, Any] = field(default_factory=dict)
    inputs: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    wave: Optional[int] = None
    priority: int = 100


@dataclass
class AgentResult:
    """Result from agent execution"""
    success: bool
    agent: str
    task_id: str
    output: Any = None
    artifacts: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    duration: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ExecutionContext:
    """Execution context for an agent"""
    task: Task
    config: AgentConfig
    tools: Dict[str, Callable] = field(default_factory=dict)
    context_budget: Optional[int] = None
    brain_context: Dict[str, Any] = field(default_factory=dict)
    handoff_context: Optional[Dict[str, Any]] = None

    # State tracking
    steps_completed: List[str] = field(default_factory=list)
    artifacts_created: List[str] = field(default_factory=list)
    tokens_used: int = 0


class BaseAgent(ABC):
    """
    Base class for all agents.

    All agents (BMAD, GSD, specialists) inherit from this class
    and implement the required methods.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self._initialized = False
        self._tools: Dict[str, Callable] = {}
        self._skills: List[str] = []

    @property
    def name(self) -> str:
        return self.config.name

    @property
    def role(self) -> str:
        return self.config.role

    @property
    def category(self) -> str:
        return self.config.category

    @abstractmethod
    async def initialize(self) -> None:
        """
        Initialize the agent.

        Called once when the agent is first loaded.
        Load prompts, skills, and set up tools.
        """
        pass

    @abstractmethod
    async def execute(self, task: Task) -> AgentResult:
        """
        Execute a task.

        Args:
            task: The task to execute

        Returns:
            AgentResult with output, artifacts, metadata
        """
        pass

    async def handoff(self, to_agent: 'BaseAgent', context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handoff context to another agent.

        Args:
            to_agent: The agent to handoff to
            context: The context to handoff

        Returns:
            Updated context for the receiving agent
        """
        logger.info(f"Handing off from {self.name} to {to_agent.name}")

        # Prepare handoff package
        handoff_package = {
            "from_agent": self.name,
            "to_agent": to_agent.name,
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "artifacts": self._get_artifacts(),
            "steps_completed": self._get_steps_completed(),
        }

        # Save handoff to memory if available
        await self._save_handoff(handoff_package)

        return handoff_package

    def use_tool(self, tool_name: str, **kwargs) -> Any:
        """
        Use a tool.

        Args:
            tool_name: Name of the tool
            **kwargs: Tool arguments

        Returns:
            Tool result
        """
        if tool_name not in self._tools:
            raise ValueError(f"Tool not available: {tool_name}")

        tool = self._tools[tool_name]
        return tool(**kwargs)

    def verify(self, output: Any, criteria: Dict[str, Any]) -> bool:
        """
        Verify output meets criteria.

        Args:
            output: The output to verify
            criteria: Verification criteria

        Returns:
            True if output passes verification
        """
        # Default verification - override in subclasses
        return True

    async def recover(self, error: Exception) -> bool:
        """
        Attempt to recover from an error.

        Args:
            error: The error that occurred

        Returns:
            True if recovery successful
        """
        logger.warning(f"Attempting recovery for {self.name}: {error}")

        # Default recovery - log and retry
        return False

    def _get_artifacts(self) -> List[str]:
        """Get list of artifacts created by this agent"""
        return []

    def _get_steps_completed(self) -> List[str]:
        """Get list of steps completed by this agent"""
        return []

    async def _save_handoff(self, handoff_package: Dict[str, Any]) -> None:
        """Save handoff package to memory"""
        # TODO: Implement handoff storage
        pass

    def load_prompt(self) -> str:
        """
        Load the agent's system prompt.

        Returns:
            The prompt text
        """
        if self.config.prompt_path and self.config.prompt_path.exists():
            return self.config.prompt_path.read_text()

        # Return default prompt
        return f"""You are {self.config.full_name}, a {self.config.role}.

Your role is to {self.config.description}.

Capabilities: {', '.join(self.config.capabilities)}

Always communicate in a {self.config.communication_style} style."""


class BMADAgent(BaseAgent):
    """
    Base class for BMAD methodology agents.

    BMAD agents follow the 4-phase methodology:
    Elicitation → Analysis → Solutioning → Implementation
    """

    def __init__(self, config: AgentConfig):
        super().__init__(config)
        self.current_phase: Optional[str] = None
        self.artifacts: Dict[str, Any] = {}

    async def execute(self, task: Task) -> AgentResult:
        """
        Execute a BMAD task.

        BMAD agents follow structured workflows with artifact-based outputs.
        """
        start_time = datetime.now()

        try:
            # Determine phase based on task type
            self.current_phase = self._determine_phase(task)

            # Execute phase-specific workflow
            result = await self._execute_phase(task)

            duration = (datetime.now() - start_time).total_seconds()

            return AgentResult(
                success=True,
                agent=self.name,
                task_id=task.id,
                output=result,
                artifacts=list(self.artifacts.keys()),
                metadata={
                    "phase": self.current_phase,
                    "methodology": "bmad"
                },
                duration=duration
            )

        except Exception as e:
            logger.error(f"BMAD agent {self.name} failed: {e}")
            return AgentResult(
                success=False,
                agent=self.name,
                task_id=task.id,
                error=str(e)
            )

    def _determine_phase(self, task: Task) -> str:
        """Determine which BMAD phase this task belongs to"""
        phase_map = {
            "research": "elicitation",
            "analysis": "analysis",
            "architecture": "solutioning",
            "implementation": "implementation"
        }
        return phase_map.get(task.type, "implementation")

    async def _execute_phase(self, task: Task) -> Any:
        """Execute the phase-specific workflow"""
        # Override in subclasses
        return None


class GSDAgent(BaseAgent):
    """
    Base class for GSD methodology agents.

    GSD agents focus on:
    - Context engineering (fresh 200k tokens per agent)
    - Atomic task execution
    - Goal-backward verification
    """

    def __init__(self, config: AgentConfig):
        # Set default context budget for GSD agents
        if not config.context_budget:
            config.context_budget = 200000  # 200k tokens
        super().__init__(config)

    async def execute(self, task: Task) -> AgentResult:
        """
        Execute a GSD task.

        GSD agents get fresh context and execute atomically.
        """
        start_time = datetime.now()

        try:
            # GSD agents get fresh context
            context = await self._get_fresh_context(task)

            # Execute with fresh context
            result = await self._execute_with_context(task, context)

            # Verify outcome (goal-backward)
            verified = await self._verify_outcome(task, result)

            duration = (datetime.now() - start_time).total_seconds()

            return AgentResult(
                success=verified,
                agent=self.name,
                task_id=task.id,
                output=result,
                metadata={
                    "context_tokens": self.config.context_budget,
                    "verified": verified,
                    "methodology": "gsd"
                },
                duration=duration
            )

        except Exception as e:
            logger.error(f"GSD agent {self.name} failed: {e}")
            return AgentResult(
                success=False,
                agent=self.name,
                task_id=task.id,
                error=str(e)
            )

    async def _get_fresh_context(self, task: Task) -> Dict[str, Any]:
        """Get fresh context for this task"""
        # GSD agents start with minimal context
        return {
            "task": task.description,
            "type": task.type,
            "fresh": True
        }

    async def _execute_with_context(self, task: Task, context: Dict[str, Any]) -> Any:
        """Execute with the given context"""
        # Override in subclasses
        return None

    async def _verify_outcome(self, task: Task, result: Any) -> bool:
        """Verify the outcome (goal-backward verification)"""
        # Default verification
        return True


class SpecialistAgent(BaseAgent):
    """
    Base class for specialist agents (Ralph, custom specialists, etc.).

    Specialist agents have deep domain expertise.
    """

    def __init__(self, config: AgentConfig):
        super().__init__(config)
        self.domain: Optional[str] = None

    async def execute(self, task: Task) -> AgentResult:
        """
        Execute a specialist task.

        Specialists apply domain expertise to solve specific problems.
        """
        start_time = datetime.now()

        try:
            # Apply specialist knowledge
            result = await self._apply_specialist_knowledge(task)

            duration = (datetime.now() - start_time).total_seconds()

            return AgentResult(
                success=True,
                agent=self.name,
                task_id=task.id,
                output=result,
                metadata={
                    "domain": self.domain,
                    "type": "specialist"
                },
                duration=duration
            )

        except Exception as e:
            logger.error(f"Specialist agent {self.name} failed: {e}")
            return AgentResult(
                success=False,
                agent=self.name,
                task_id=task.id,
                error=str(e)
            )

    async def _apply_specialist_knowledge(self, task: Task) -> Any:
        """Apply domain specialist knowledge"""
        # Override in subclasses
        return None


# Agent factory

def create_agent(agent_type: str, config: AgentConfig) -> BaseAgent:
    """
    Factory function to create agents.

    Args:
        agent_type: Type of agent (bmad, gsd, specialist)
        config: Agent configuration

    Returns:
        Instantiated agent
    """
    agent_classes = {
        "bmad": BMADAgent,
        "gsd": GSDAgent,
        "specialist": SpecialistAgent
    }

    agent_class = agent_classes.get(agent_type, BaseAgent)
    return agent_class(config)
