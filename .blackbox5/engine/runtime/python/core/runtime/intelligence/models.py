"""
Intelligence Layer Data Models
Enhanced task model with dependencies, priorities, and routing metadata
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import IntEnum
from datetime import datetime


class TaskPriority(IntEnum):
    """Task priority levels (lower number = higher priority)"""
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


class TaskComplexity(str):
    """Task complexity levels"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


@dataclass
class Task:
    """
    Enhanced task model for intelligent routing and execution

    Attributes:
        id: Unique task identifier
        title: Short task title
        description: Detailed task description
        acceptance_criteria: List of acceptance criteria
        priority: Task priority (1=critical, 2=high, 3=medium, 4=low)
        complexity: Task complexity (simple, medium, complex)
        passes: Whether task passes initial validation
        depends_on: List of task IDs this task depends on
        domain: Optional domain specialization (e.g., "frontend", "backend", "devops")
        agent: Specific agent to route to (if None, auto-select)
        metadata: Additional task metadata
        created_at: Task creation timestamp
        status: Current task status
        execution_history: History of task execution attempts
    """
    id: str
    title: str
    description: str
    acceptance_criteria: List[str] = field(default_factory=list)
    priority: int = TaskPriority.MEDIUM
    complexity: str = TaskComplexity.MEDIUM
    passes: bool = True
    depends_on: List[str] = field(default_factory=list)
    domain: Optional[str] = None
    agent: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    status: str = "pending"
    execution_history: List[Dict[str, Any]] = field(default_factory=list)

    def __post_init__(self):
        """Validate task data"""
        if isinstance(self.priority, str):
            self.priority = TaskPriority[self.priority.upper()]

        if self.complexity not in [TaskComplexity.SIMPLE, TaskComplexity.MEDIUM, TaskComplexity.COMPLEX]:
            self.complexity = TaskComplexity.MEDIUM

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'acceptance_criteria': self.acceptance_criteria,
            'priority': self.priority,
            'complexity': self.complexity,
            'passes': self.passes,
            'depends_on': self.depends_on,
            'domain': self.domain,
            'agent': self.agent,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'execution_history': self.execution_history
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Task':
        """Create task from dictionary"""
        if 'created_at' in data and isinstance(data['created_at'], str):
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        return cls(**data)

    def add_execution_attempt(self, success: bool, agent: str, notes: str = ""):
        """Record an execution attempt"""
        self.execution_history.append({
            'timestamp': datetime.now().isoformat(),
            'success': success,
            'agent': agent,
            'notes': notes
        })

    @property
    def is_ready(self) -> bool:
        """Check if task is ready for execution (passes validation)"""
        return self.passes

    @property
    def has_dependencies(self) -> bool:
        """Check if task has dependencies"""
        return len(self.depends_on) > 0

    @property
    def priority_level(self) -> str:
        """Get priority level as string"""
        return TaskPriority(self.priority).name.lower()

    def __repr__(self) -> str:
        return f"Task(id={self.id}, title={self.title}, priority={self.priority_level}, status={self.status})"
