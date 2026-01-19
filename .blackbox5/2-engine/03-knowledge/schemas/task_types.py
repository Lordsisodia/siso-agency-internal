"""
Task type definitions for BlackBox 5 task routing system.

This module defines the core data structures and types used
for task routing and complexity analysis in the multi-agent system.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set
from uuid import uuid4


class ExecutionStrategy(str, Enum):
    """Task execution strategy determines single vs multi-agent routing."""

    SINGLE_AGENT = "single_agent"
    """Route to a single agent for simple, focused tasks."""

    MULTI_AGENT = "multi_agent"
    """Route to multi-agent system for complex, multi-step tasks."""

    AUTO = "auto"
    """Automatically determine based on complexity analysis."""


class AgentType(str, Enum):
    """Types of agents in the system."""

    GENERALIST = "generalist"
    """Can handle a wide variety of tasks."""

    SPECIALIST = "specialist"
    """Expert in specific domains or technologies."""

    MANAGER = "manager"
    """Coordinates other agents and manages workflows."""

    ORCHESTRATOR = "orchestrator"
    """High-level task coordination and routing."""

    EXECUTOR = "executor"
    """Executes specific tasks."""


class TaskPriority(str, Enum):
    """Priority levels for tasks."""

    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


class TaskStatus(str, Enum):
    """Status of a task during execution."""

    PENDING = "pending"
    """Task is waiting to be executed."""

    IN_PROGRESS = "in_progress"
    """Task is currently being executed."""

    COMPLETED = "completed"
    """Task completed successfully."""

    FAILED = "failed"
    """Task failed."""

    CANCELLED = "cancelled"
    """Task was cancelled."""


@dataclass
class ComplexityScore:
    """
    Represents the complexity analysis of a task.

    Attributes:
        token_count: Estimated token count for the task
        tool_requirements: Set of tools required (normalized 0-1)
        domain_complexity: Domain-specific complexity (0-1)
        step_complexity: Number of execution steps required
        aggregate_score: Overall complexity (0-1, higher is more complex)
        confidence: Confidence in the analysis (0-1)
    """

    token_count: int
    tool_requirements: float  # 0-1
    domain_complexity: float  # 0-1
    step_complexity: int
    aggregate_score: float  # 0-1
    confidence: float  # 0-1
    analysis_timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'token_count': self.token_count,
            'tool_requirements': self.tool_requirements,
            'domain_complexity': self.domain_complexity,
            'step_complexity': self.step_complexity,
            'aggregate_score': self.aggregate_score,
            'confidence': self.confidence,
            'analysis_timestamp': self.analysis_timestamp.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ComplexityScore':
        """Create from dictionary."""
        if 'analysis_timestamp' in data:
            data['analysis_timestamp'] = datetime.fromisoformat(data['analysis_timestamp'])
        return cls(**data)


@dataclass
class RoutingDecision:
    """
    Represents a routing decision made by the TaskRouter.

    Attributes:
        task_id: Unique identifier for the task
        strategy: Execution strategy chosen
        agent_type: Type of agent(s) to route to
        recommended_agent: Specific agent recommended (if any)
        complexity: Complexity analysis result
        reasoning: Explanation for the routing decision
        estimated_duration: Estimated execution time in seconds
        confidence: Confidence in this routing decision (0-1)
        decision_timestamp: When the decision was made
    """

    task_id: str
    strategy: ExecutionStrategy
    agent_type: AgentType
    recommended_agent: Optional[str]
    complexity: ComplexityScore
    reasoning: str
    estimated_duration: float  # seconds
    confidence: float  # 0-1
    decision_timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'task_id': self.task_id,
            'strategy': self.strategy.value,
            'agent_type': self.agent_type.value,
            'recommended_agent': self.recommended_agent,
            'complexity': self.complexity.to_dict(),
            'reasoning': self.reasoning,
            'estimated_duration': self.estimated_duration,
            'confidence': self.confidence,
            'decision_timestamp': self.decision_timestamp.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RoutingDecision':
        """Create from dictionary."""
        if 'complexity' in data and isinstance(data['complexity'], dict):
            data['complexity'] = ComplexityScore.from_dict(data['complexity'])
        if 'decision_timestamp' in data:
            data['decision_timestamp'] = datetime.fromisoformat(data['decision_timestamp'])
        if 'strategy' in data and isinstance(data['strategy'], str):
            data['strategy'] = ExecutionStrategy(data['strategy'])
        if 'agent_type' in data and isinstance(data['agent_type'], str):
            data['agent_type'] = AgentType(data['agent_type'])
        return cls(**data)


@dataclass
class Task:
    """
    Represents a task to be routed and executed.

    Attributes:
        task_id: Unique identifier
        description: Natural language description of what needs to be done
        domain: Domain/category of the task (e.g., 'development', 'research')
        requirements: Specific requirements or constraints
        tools_required: List of tools needed for this task
        files: List of file paths involved (if any)
        context: Additional context or instructions
        priority: Task priority level
        created_at: When the task was created
        metadata: Additional metadata
    """

    task_id: str = field(default_factory=lambda: str(uuid4()))
    description: str = ""
    domain: str = "general"
    requirements: List[str] = field(default_factory=list)
    tools_required: List[str] = field(default_factory=list)
    files: List[str] = field(default_factory=list)
    context: Optional[str] = None
    priority: TaskPriority = TaskPriority.NORMAL
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'task_id': self.task_id,
            'description': self.description,
            'domain': self.domain,
            'requirements': self.requirements,
            'tools_required': self.tools_required,
            'files': self.files,
            'context': self.context,
            'priority': self.priority.value,
            'created_at': self.created_at.isoformat(),
            'metadata': self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Task':
        """Create from dictionary."""
        if 'created_at' in data:
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        if 'priority' in data and isinstance(data['priority'], str):
            data['priority'] = TaskPriority(data['priority'])
        return cls(**data)

    def estimate_token_count(self) -> int:
        """
        Estimate the token count for this task.

        Returns:
            Estimated number of tokens
        """
        # Rough estimate: 1 token ≈ 4 characters for English text
        total_chars = (
            len(self.description) +
            len(self.context or "") +
            sum(len(req) for req in self.requirements) +
            sum(len(tool) for tool in self.tools_required) +
            sum(len(file) for file in self.files)
        )
        # Add overhead for metadata and context
        total_chars += 500  # Base overhead
        # Divide by 4 for token estimate
        return max(100, total_chars // 4)


@dataclass
class AgentCapabilities:
    """
    Describes the capabilities of an agent.

    Attributes:
        agent_id: Unique identifier
        agent_type: Type of agent
        domains: Set of domains the agent can handle
        tools: Set of tools the agent can use
        max_complexity: Maximum complexity score this agent can handle
        avg_duration: Average execution time in seconds
        success_rate: Historical success rate (0-1)
    """

    agent_id: str
    agent_type: AgentType
    domains: Set[str]
    tools: Set[str]
    max_complexity: float  # 0-1
    avg_duration: float  # seconds
    success_rate: float  # 0-1

    def can_handle_task(self, task: Task, complexity: ComplexityScore) -> bool:
        """
        Check if this agent can handle the given task.

        Args:
            task: The task to check
            complexity: Complexity analysis of the task

        Returns:
            True if agent can handle this task
        """
        # Check domain compatibility
        if task.domain not in self.domains and "general" not in self.domains:
            return False

        # Check tool compatibility
        required_tools = set(task.tools_required)
        if not required_tools.issubset(self.tools):
            return False

        # Check complexity threshold
        if complexity.aggregate_score > self.max_complexity:
            return False

        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'agent_id': self.agent_id,
            'agent_type': self.agent_type.value,
            'domains': list(self.domains),
            'tools': list(self.tools),
            'max_complexity': self.max_complexity,
            'avg_duration': self.avg_duration,
            'success_rate': self.success_rate
        }


@dataclass
class RoutingConfig:
    """
    Configuration for the task router.

    Attributes:
        complexity_threshold: Threshold above which multi-agent is used (0-1)
        step_threshold: Maximum steps for single-agent routing
        token_threshold: Maximum tokens for single-agent routing
        default_agent_type: Default agent type to use
        enable_circuit_breaker: Whether to use circuit breaker
        enable_event_routing: Whether to emit routing events
    """

    complexity_threshold: float = 0.6
    step_threshold: int = 10
    token_threshold: int = 10000
    default_agent_type: AgentType = AgentType.GENERALIST
    enable_circuit_breaker: bool = True
    enable_event_routing: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'complexity_threshold': self.complexity_threshold,
            'step_threshold': self.step_threshold,
            'token_threshold': self.token_threshold,
            'default_agent_type': self.default_agent_type.value,
            'enable_circuit_breaker': self.enable_circuit_breaker,
            'enable_event_routing': self.enable_event_routing
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RoutingConfig':
        """Create from dictionary."""
        if 'default_agent_type' in data and isinstance(data['default_agent_type'], str):
            data['default_agent_type'] = AgentType(data['default_agent_type'])
        return cls(**data)
