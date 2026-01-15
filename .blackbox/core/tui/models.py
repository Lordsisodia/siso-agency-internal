"""
Data models for Blackbox4 TUI

Defines task structures, log entries, and status enumerations
for the terminal user interface.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
import uuid


class TaskStatus(Enum):
    """Task execution status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"
    PAUSED = "paused"


class LogLevel(Enum):
    """Log entry severity levels."""
    DEBUG = "debug"
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class Priority(Enum):
    """Task priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Task:
    """
    Represents a task in the Blackbox4 TUI.

    Attributes:
        id: Unique task identifier
        title: Task title/name
        description: Detailed task description
        status: Current execution status
        priority: Task priority level
        expected_output: Expected result
        actual_output: Actual result (after completion)
        parent_id: Parent task ID (for hierarchy)
        children: List of child task IDs
        dependencies: List of task IDs this depends on
        metadata: Additional task information
        created_at: Task creation timestamp
        started_at: Task start timestamp
        completed_at: Task completion timestamp
        progress: Progress percentage (0-100)
        error_message: Error message if failed
    """

    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str = ""
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    expected_output: str = ""
    actual_output: str = ""
    parent_id: Optional[str] = None
    children: list = field(default_factory=list)
    dependencies: list = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: int = 0
    error_message: Optional[str] = None

    def __post_init__(self):
        """Validate task data after initialization."""
        if not self.title:
            raise ValueError("Task title is required")
        if self.progress < 0 or self.progress > 100:
            raise ValueError("Progress must be between 0 and 100")

    @property
    def duration(self) -> Optional[float]:
        """Calculate task execution duration in seconds."""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

    @property
    def is_running(self) -> bool:
        """Check if task is currently running."""
        return self.status == TaskStatus.IN_PROGRESS

    @property
    def is_completed(self) -> bool:
        """Check if task is completed successfully."""
        return self.status == TaskStatus.COMPLETED

    @property
    def is_failed(self) -> bool:
        """Check if task has failed."""
        return self.status == TaskStatus.FAILED

    @property
    def is_blocked(self) -> bool:
        """Check if task is blocked."""
        return self.status == TaskStatus.BLOCKED

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary for serialization."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.value,
            'priority': self.priority.value,
            'expected_output': self.expected_output,
            'actual_output': self.actual_output,
            'parent_id': self.parent_id,
            'children': self.children,
            'dependencies': self.dependencies,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'progress': self.progress,
            'error_message': self.error_message,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Task':
        """Create task from dictionary."""
        status = TaskStatus(data.get('status', TaskStatus.PENDING.value))
        priority = Priority(data.get('priority', Priority.MEDIUM.value))

        task = cls(
            id=data.get('id', str(uuid.uuid4())[:8]),
            title=data.get('title', ''),
            description=data.get('description', ''),
            status=status,
            priority=priority,
            expected_output=data.get('expected_output', ''),
            actual_output=data.get('actual_output', ''),
            parent_id=data.get('parent_id'),
            children=data.get('children', []),
            dependencies=data.get('dependencies', []),
            metadata=data.get('metadata', {}),
            progress=data.get('progress', 0),
            error_message=data.get('error_message'),
        )

        if data.get('created_at'):
            task.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('started_at'):
            task.started_at = datetime.fromisoformat(data['started_at'])
        if data.get('completed_at'):
            task.completed_at = datetime.fromisoformat(data['completed_at'])

        return task


@dataclass
class LogEntry:
    """
    Represents a log entry in the execution log.

    Attributes:
        timestamp: Log entry timestamp
        level: Log severity level
        message: Log message
        task_id: Associated task ID
        source: Log source (e.g., "executor", "agent", "system")
        metadata: Additional log information
    """

    timestamp: datetime = field(default_factory=datetime.now)
    level: LogLevel = LogLevel.INFO
    message: str = ""
    task_id: Optional[str] = None
    source: str = "system"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        """Validate log entry after initialization."""
        if not self.message:
            raise ValueError("Log message is required")

    def to_dict(self) -> Dict[str, Any]:
        """Convert log entry to dictionary for serialization."""
        return {
            'timestamp': self.timestamp.isoformat(),
            'level': self.level.value,
            'message': self.message,
            'task_id': self.task_id,
            'source': self.source,
            'metadata': self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LogEntry':
        """Create log entry from dictionary."""
        level = LogLevel(data.get('level', LogLevel.INFO.value))

        entry = cls(
            level=level,
            message=data.get('message', ''),
            task_id=data.get('task_id'),
            source=data.get('source', 'system'),
            metadata=data.get('metadata', {}),
        )

        if data.get('timestamp'):
            entry.timestamp = datetime.fromisoformat(data['timestamp'])

        return entry

    def format_for_display(self, width: int = 80) -> str:
        """
        Format log entry for terminal display.

        Args:
            width: Maximum width for formatting

        Returns:
            Formatted log entry string
        """
        time_str = self.timestamp.strftime("%H:%M:%S")
        level_str = self.level.value.upper().ljust(8)

        # Format: [HH:MM:SS] LEVEL   [task_id] message
        prefix = f"[{time_str}] {level_str}"
        if self.task_id:
            prefix += f" [{self.task_id}]"

        # Truncate message if too long
        available_width = width - len(prefix) - 1
        if len(self.message) > available_width:
            message = self.message[:available_width-3] + "..."
        else:
            message = self.message

        return f"{prefix} {message}"


@dataclass
class SessionInfo:
    """
    Information about the current TUI session.

    Attributes:
        session_id: Unique session identifier
        prd_path: Path to PRD file
        blackbox_root: Path to Blackbox root directory
        started_at: Session start timestamp
        total_tasks: Total number of tasks
        completed_tasks: Number of completed tasks
        failed_tasks: Number of failed tasks
        current_task_id: Currently executing task ID
    """

    session_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    prd_path: Optional[str] = None
    blackbox_root: Optional[str] = None
    started_at: datetime = field(default_factory=datetime.now)
    total_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    current_task_id: Optional[str] = None

    @property
    def progress_percent(self) -> float:
        """Calculate overall session progress."""
        if self.total_tasks == 0:
            return 0.0
        return (self.completed_tasks / self.total_tasks) * 100

    @property
    def success_rate(self) -> float:
        """Calculate task success rate."""
        completed_and_failed = self.completed_tasks + self.failed_tasks
        if completed_and_failed == 0:
            return 0.0
        return (self.completed_tasks / completed_and_failed) * 100

    @property
    def duration(self) -> float:
        """Calculate session duration in seconds."""
        return (datetime.now() - self.started_at).total_seconds()

    def format_duration(self) -> str:
        """Format session duration as human-readable string."""
        duration = self.duration
        hours = int(duration // 3600)
        minutes = int((duration % 3600) // 60)
        seconds = int(duration % 60)

        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
