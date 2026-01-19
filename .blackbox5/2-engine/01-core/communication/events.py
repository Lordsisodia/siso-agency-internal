"""
Event schemas and types for BlackBox 5 event bus.

This module defines the core event types and schemas used throughout
the BlackBox 5 system for agent communication and system events.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import uuid4
import json


class EventType(str, Enum):
    """Standard event types for BlackBox 5."""

    # Task events
    TASK_CREATED = "task.created"
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    TASK_CANCELLED = "task.cancelled"
    TASK_UPDATED = "task.updated"

    # Agent events
    AGENT_STARTED = "agent.started"
    AGENT_STOPPED = "agent.stopped"
    AGENT_ERROR = "agent.error"
    AGENT_HEARTBEAT = "agent.heartbeat"
    AGENT_STATUS_CHANGED = "agent.status_changed"

    # System events
    SYSTEM_STARTUP = "system.startup"
    SYSTEM_SHUTDOWN = "system.shutdown"
    SYSTEM_ERROR = "system.error"
    SYSTEM_READY = "system.ready"

    # Circuit breaker events
    CIRCUIT_OPENED = "circuit.opened"
    CIRCUIT_CLOSED = "circuit.closed"
    CIRCUIT_HALF_OPEN = "circuit.half_open"

    # Custom events
    CUSTOM = "custom"


class Priority(str, Enum):
    """Event priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


@dataclass
class EventMetadata:
    """Metadata attached to all events."""
    event_id: str = field(default_factory=lambda: str(uuid4()))
    event_type: str = ""
    timestamp: datetime = field(default_factory=datetime.utcnow)
    priority: Priority = Priority.NORMAL
    source: str = ""
    correlation_id: Optional[str] = None
    causation_id: Optional[str] = None
    version: str = "1.0"

    def to_dict(self) -> Dict[str, Any]:
        """Convert metadata to dictionary."""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['priority'] = self.priority.value
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EventMetadata':
        """Create metadata from dictionary."""
        if 'timestamp' in data and isinstance(data['timestamp'], str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        if 'priority' in data and isinstance(data['priority'], str):
            data['priority'] = Priority(data['priority'])
        return cls(**data)


@dataclass
class BaseEvent:
    """Base class for all events."""
    metadata: EventMetadata
    data: Dict[str, Any]

    def to_json(self) -> str:
        """Serialize event to JSON."""
        return json.dumps({
            'metadata': self.metadata.to_dict(),
            'data': self.data
        })

    @classmethod
    def from_json(cls, json_str: str) -> 'BaseEvent':
        """Deserialize event from JSON."""
        data = json.loads(json_str)
        return cls(
            metadata=EventMetadata.from_dict(data['metadata']),
            data=data['data']
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary."""
        return {
            'metadata': self.metadata.to_dict(),
            'data': self.data
        }


@dataclass
class TaskEvent(BaseEvent):
    """Event related to task operations."""

    @classmethod
    def create(
        cls,
        event_type: EventType,
        task_id: str,
        agent_id: str,
        status: str,
        **kwargs
    ) -> 'TaskEvent':
        """Create a new task event."""
        return cls(
            metadata=EventMetadata(
                event_type=event_type.value,
                source=f"agent.{agent_id}",
                **kwargs
            ),
            data={
                'task_id': task_id,
                'agent_id': agent_id,
                'status': status,
                **{k: v for k, v in kwargs.items() if k not in cls.__dataclass_fields__}
            }
        )


@dataclass
class AgentEvent(BaseEvent):
    """Event related to agent lifecycle and operations."""

    @classmethod
    def create(
        cls,
        event_type: EventType,
        agent_id: str,
        agent_type: str,
        **kwargs
    ) -> 'AgentEvent':
        """Create a new agent event."""
        return cls(
            metadata=EventMetadata(
                event_type=event_type.value,
                source=f"agent.{agent_id}",
                **kwargs
            ),
            data={
                'agent_id': agent_id,
                'agent_type': agent_type,
                **{k: v for k, v in kwargs.items() if k not in cls.__dataclass_fields__}
            }
        )


@dataclass
class SystemEvent(BaseEvent):
    """Event related to system-level operations."""

    @classmethod
    def create(
        cls,
        event_type: EventType,
        component: str,
        message: str,
        **kwargs
    ) -> 'SystemEvent':
        """Create a new system event."""
        return cls(
            metadata=EventMetadata(
                event_type=event_type.value,
                source=f"system.{component}",
                **kwargs
            ),
            data={
                'component': component,
                'message': message,
                **{k: v for k, v in kwargs.items() if k not in cls.__dataclass_fields__}
            }
        )


@dataclass
class CircuitBreakerEvent(BaseEvent):
    """Event related to circuit breaker state changes."""

    @classmethod
    def create(
        cls,
        event_type: EventType,
        service: str,
        state: str,
        failure_count: int = 0,
        last_failure: Optional[str] = None,
        **kwargs
    ) -> 'CircuitBreakerEvent':
        """Create a new circuit breaker event."""
        return cls(
            metadata=EventMetadata(
                event_type=event_type.value,
                source=f"circuit_breaker.{service}",
                priority=Priority.HIGH,
                **kwargs
            ),
            data={
                'service': service,
                'state': state,
                'failure_count': failure_count,
                'last_failure': last_failure,
                **{k: v for k, v in kwargs.items() if k not in cls.__dataclass_fields__}
            }
        )


# Event validation schemas
class EventSchemaError(Exception):
    """Raised when event validation fails."""
    pass


def validate_event(event: BaseEvent) -> bool:
    """
    Validate event structure and required fields.

    Args:
        event: The event to validate

    Returns:
        True if valid

    Raises:
        EventSchemaError: If validation fails
    """
    if not isinstance(event, BaseEvent):
        raise EventSchemaError(f"Event must be BaseEvent instance, got {type(event)}")

    if not event.metadata.event_type:
        raise EventSchemaError("Event must have event_type in metadata")

    if not event.metadata.source:
        raise EventSchemaError("Event must have source in metadata")

    if not event.metadata.event_id:
        raise EventSchemaError("Event must have event_id in metadata")

    return True


def validate_task_event(event: TaskEvent) -> bool:
    """
    Validate task event has required fields.

    Args:
        event: The task event to validate

    Returns:
        True if valid

    Raises:
        EventSchemaError: If validation fails
    """
    validate_event(event)

    required_fields = ['task_id', 'agent_id', 'status']
    for field_name in required_fields:
        if field_name not in event.data:
            raise EventSchemaError(f"Task event must have {field_name} in data")

    return True


def validate_agent_event(event: AgentEvent) -> bool:
    """
    Validate agent event has required fields.

    Args:
        event: The agent event to validate

    Returns:
        True if valid

    Raises:
        EventSchemaError: If validation fails
    """
    validate_event(event)

    required_fields = ['agent_id', 'agent_type']
    for field_name in required_fields:
        if field_name not in event.data:
            raise EventSchemaError(f"Agent event must have {field_name} in data")

    return True


# Event builder for convenient event creation
class EventBuilder:
    """Builder class for creating events with fluent interface."""

    def __init__(self):
        self._metadata: Dict[str, Any] = {}
        self._data: Dict[str, Any] = {}

    def with_event_type(self, event_type: Union[EventType, str]) -> 'EventBuilder':
        """Set the event type."""
        self._metadata['event_type'] = event_type.value if isinstance(event_type, EventType) else event_type
        return self

    def with_source(self, source: str) -> 'EventBuilder':
        """Set the event source."""
        self._metadata['source'] = source
        return self

    def with_priority(self, priority: Priority) -> 'EventBuilder':
        """Set the event priority."""
        self._metadata['priority'] = priority
        return self

    def with_correlation_id(self, correlation_id: str) -> 'EventBuilder':
        """Set the correlation ID for tracking."""
        self._metadata['correlation_id'] = correlation_id
        return self

    def with_causation_id(self, causation_id: str) -> 'EventBuilder':
        """Set the causation ID for event lineage."""
        self._metadata['causation_id'] = causation_id
        return self

    def with_data(self, **kwargs) -> 'EventBuilder':
        """Add data to the event."""
        self._data.update(kwargs)
        return self

    def build(self) -> BaseEvent:
        """Build the event."""
        if 'event_type' not in self._metadata:
            raise EventSchemaError("Event type is required")
        if 'source' not in self._metadata:
            raise EventSchemaError("Event source is required")

        return BaseEvent(
            metadata=EventMetadata(**self._metadata),
            data=self._data
        )

    def build_task_event(self) -> TaskEvent:
        """Build a task-specific event."""
        validate_task_event(
            TaskEvent(
                metadata=EventMetadata(**self._metadata),
                data=self._data
            )
        )
        return TaskEvent(
            metadata=EventMetadata(**self._metadata),
            data=self._data
        )

    def build_agent_event(self) -> AgentEvent:
        """Build an agent-specific event."""
        validate_agent_event(
            AgentEvent(
                metadata=EventMetadata(**self._metadata),
                data=self._data
            )
        )
        return AgentEvent(
            metadata=EventMetadata(**self._metadata),
            data=self._data
        )


# Standard topics for event routing
class Topics:
    """Standard topics for event bus communication."""

    # Agent topics
    AGENT_ALL = "agent.*"
    AGENT_TASKS = "agent.tasks"
    AGENT_STATUS = "agent.status"
    AGENT_ERRORS = "agent.errors"

    # System topics
    SYSTEM_ALL = "system.*"
    SYSTEM_STATUS = "system.status"
    SYSTEM_ERRORS = "system.errors"

    # Circuit breaker topics
    CIRCUIT_BREAKER_ALL = "circuit_breaker.*"
    CIRCUIT_BREAKER_STATE = "circuit_breaker.state"

    # Topic patterns
    def agent_topic(agent_id: str) -> str:
        """Get topic for specific agent."""
        return f"agent.{agent_id}"

    def task_topic(task_id: str) -> str:
        """Get topic for specific task."""
        return f"task.{task_id}"

    def circuit_breaker_topic(service: str) -> str:
        """Get topic for specific circuit breaker."""
        return f"circuit_breaker.{service}"
