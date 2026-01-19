# BlackBox 5 Event Bus System

A production-ready, Redis-based event bus for distributed agent communication and system coordination in BlackBox 5.

## Features

- **Redis Pub/Sub**: High-performance pub/sub messaging
- **Thread-Safe**: Safe concurrent access from multiple threads
- **Pattern Matching**: Subscribe to topics with wildcards (`agent.*`)
- **Automatic Reconnection**: Handles connection failures gracefully
- **Event Validation**: Type-safe event schemas with validation
- **Priority Support**: Critical, high, normal, and low priority events
- **Event Correlation**: Track event flow with correlation and causation IDs
- **Circuit Breaker Integration**: Monitor and react to service health
- **Comprehensive Error Handling**: Detailed exceptions with context

## Installation

### Requirements

```bash
# Install Redis
# macOS
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Install Python Redis client
pip install redis
```

### Start Redis

Use the provided startup script:

```bash
# Start Redis with defaults
.blackbox5/engine/runtime/start-redis.sh

# Start Redis on custom port
REDIS_PORT=6380 .blackbox5/engine/runtime/start-redis.sh

# Check Redis status
.blackbox5/engine/runtime/start-redis.sh status

# Stop Redis
.blackbox5/engine/runtime/start-redis.sh stop
```

## Quick Start

### Basic Usage

```python
from blackbox5.engine.core.event_bus import get_event_bus
from blackbox5.engine.core.events import TaskEvent, EventType

# Get the global event bus instance
bus = get_event_bus()

# Subscribe to events
def handle_task(channel, event):
    print(f"Task {event.data['task_id']}: {event.data['status']}")

bus.subscribe("agent.tasks", handle_task)

# Publish an event
event = TaskEvent.create(
    event_type=EventType.TASK_CREATED,
    task_id="task-123",
    agent_id="agent-456",
    status="pending"
)
bus.publish("agent.tasks", event)
```

### Using the Event Builder

```python
from blackbox5.engine.core.events import EventBuilder, EventType, Priority

# Build events with fluent API
event = (EventBuilder()
         .with_event_type(EventType.AGENT_STARTED)
         .with_source("system.scheduler")
         .with_priority(Priority.HIGH)
         .with_correlation_id("workflow-789")
         .with_data(
             agent_id="agent-456",
             agent_type="TaskAgent",
             capabilities=["task_execution", "monitoring"]
         )
         .build())

bus.publish("agent.status", event)
```

### Pattern-Based Subscription

```python
# Subscribe to all agent events
def handle_all_agent_events(channel, event):
    print(f"Agent event: {event.metadata.event_type}")

bus.psubscribe("agent.*", handle_all_agent_events)

# This will receive events from:
# - agent.tasks
# - agent.status
# - agent.errors
# etc.
```

## Event Types

### Base Event

All events inherit from `BaseEvent` and include:

- **metadata**: Event metadata (ID, type, timestamp, priority, source, etc.)
- **data**: Event-specific data payload

### Task Events

```python
from blackbox5.engine.core.events import TaskEvent, EventType

# Task lifecycle events
TaskEvent.create(EventType.TASK_CREATED, task_id, agent_id, status)
TaskEvent.create(EventType.TASK_STARTED, task_id, agent_id, "running")
TaskEvent.create(EventType.TASK_COMPLETED, task_id, agent_id, "completed")
TaskEvent.create(EventType.TASK_FAILED, task_id, agent_id, "failed")
```

### Agent Events

```python
from blackbox5.engine.core.events import AgentEvent, EventType

# Agent lifecycle events
AgentEvent.create(EventType.AGENT_STARTED, agent_id, agent_type)
AgentEvent.create(EventType.AGENT_STOPPED, agent_id, agent_type)
AgentEvent.create(EventType.AGENT_HEARTBEAT, agent_id, agent_type)
AgentEvent.create(EventType.AGENT_ERROR, agent_id, agent_type)
```

### System Events

```python
from blackbox5.engine.core.events import SystemEvent, EventType

# System-level events
SystemEvent.create(EventType.SYSTEM_STARTUP, component, message)
SystemEvent.create(EventType.SYSTEM_SHUTDOWN, component, message)
SystemEvent.create(EventType.SYSTEM_READY, component, message)
```

### Circuit Breaker Events

```python
from blackbox5.engine.core.events import CircuitBreakerEvent, EventType

# Circuit breaker state changes
CircuitBreakerEvent.create(
    EventType.CIRCUIT_OPENED,
    service="database",
    state="OPEN",
    failure_count=5
)
```

## Standard Topics

```python
from blackbox5.engine.core.events import Topics

# Agent topics
Topics.AGENT_ALL              # "agent.*"
Topics.AGENT_TASKS            # "agent.tasks"
Topics.AGENT_STATUS           # "agent.status"
Topics.AGENT_ERRORS           # "agent.errors"

# System topics
Topics.SYSTEM_ALL             # "system.*"
Topics.SYSTEM_STATUS          # "system.status"
Topics.SYSTEM_ERRORS          # "system.errors"

# Dynamic topics
Topics.agent_topic("agent-123")       # "agent.agent-123"
Topics.task_topic("task-456")         # "task.task-456"
Topics.circuit_breaker_topic("db")    # "circuit_breaker.db"
```

## Configuration

### Default Configuration

```python
from blackbox5.engine.core.event_bus import EventBusConfig, RedisEventBus

config = EventBusConfig(
    host="localhost",
    port=6379,
    db=0,
    password=None,
    socket_timeout=5.0,
    socket_connect_timeout=5.0,
    connection_pool_size=10,
    max_retries=3,
    retry_delay=1.0,
    pubsub_timeout=1.0,
    enable_reconnection=True,
    reconnection_delay=2.0,
    max_reconnection_attempts=10
)

bus = RedisEventBus(config)
bus.connect()
```

### Using Environment Variables

```bash
# Redis configuration
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_password

# Event bus configuration
export REDIS_DB=0
export REDIS_CONNECTION_POOL_SIZE=20
```

## Advanced Features

### Event Correlation

Track event flow through the system:

```python
# Start a workflow
correlation_id = "workflow-2026-01-18-001"

# First event
event1 = (EventBuilder()
          .with_event_type(EventType.TASK_CREATED)
          .with_correlation_id(correlation_id)
          .with_data(task_id="task-1")
          .build())

# Subsequent event (caused by first)
event2 = (EventBuilder()
          .with_event_type(EventType.TASK_STARTED)
          .with_correlation_id(correlation_id)
          .with_causation_id(event1.metadata.event_id)  # Links to event1
          .with_data(task_id="task-1")
          .build())
```

### Priority Handling

```python
from blackbox5.engine.core.events import Priority

critical_event = (EventBuilder()
                  .with_event_type(EventType.SYSTEM_ERROR)
                  .with_priority(Priority.CRITICAL)
                  .with_data(message="Critical failure")
                  .build())

# Handle based on priority
def handle_event(channel, event):
    if event.metadata.priority == Priority.CRITICAL:
        # Handle immediately
        alert_team(event)
    else:
        # Queue for normal processing
        queue_event(event)
```

### Auto-Reconnection Context Manager

```python
# Automatically handles connection and reconnection
with bus.auto_reconnect():
    bus.publish(topic, event)
    # If connection is lost, it will reconnect and retry
```

### Error Handling

```python
from blackbox5.engine.core.exceptions import (
    EventBusError,
    RedisConnectionError,
    EventValidationError,
    format_exception
)

try:
    bus.publish(topic, event)
except RedisConnectionError as e:
    print(f"Connection error: {e.details}")
except EventValidationError as e:
    print(f"Invalid event: {e.details}")
except EventBusError as e:
    error_dict = format_exception(e)
    print(f"Event bus error: {error_dict}")
```

## Testing

### Mock Event Bus for Testing

```python
from unittest.mock import Mock, MagicMock
from blackbox5.engine.core.event_bus import RedisEventBus

# Create mock event bus
mock_bus = Mock(spec=RedisEventBus)
mock_bus.is_connected = True
mock_bus.publish = MagicMock(return_value=1)

# Use in tests
mock_bus.publish("test.topic", test_event)
assert mock_bus.publish.called
```

## Best Practices

### 1. Use Specific Topics

```python
# Good - specific topic
bus.subscribe("agent.agent-123.tasks", handler)

# Avoid - too broad
bus.subscribe("agent.*", handler)
```

### 2. Handle Errors in Callbacks

```python
def safe_handler(channel, event):
    try:
        process_event(event)
    except Exception as e:
        logger.error(f"Error in handler: {e}")
        # Don't let exceptions propagate
```

### 3. Use Correlation IDs for Workflows

```python
correlation_id = f"workflow-{timestamp}-{uuid}"

# All events in workflow use same correlation_id
event1 = builder.with_correlation_id(correlation_id).build()
event2 = builder.with_correlation_id(correlation_id).build()
```

### 4. Clean Up Subscriptions

```python
# Store subscription references
subscriptions = []

# Subscribe
bus.subscribe(topic, handler)
subscriptions.append((topic, handler))

# Cleanup later
for topic, handler in subscriptions:
    bus.unsubscribe(topic, handler)
```

### 5. Use Appropriate Priorities

```python
# Critical: System failures, security issues
Priority.CRITICAL

# High: Important business events
Priority.HIGH

# Normal: Regular operations
Priority.NORMAL

# Low: Debugging, analytics
Priority.LOW
```

## Troubleshooting

### Connection Issues

```bash
# Check if Redis is running
.blackbox5/engine/runtime/start-redis.sh status

# Check Redis logs
tail -f /tmp/redis-blackbox5/redis.log

# Test connection
redis-cli ping
```

### Event Not Received

1. Verify topic matching (exact vs pattern)
2. Check event listener thread is running
3. Validate event structure
4. Check callback exceptions in logs

### Performance Issues

1. Increase connection pool size
2. Use topic patterns judiciously
3. Monitor Redis memory usage
4. Consider event batching for high-volume

## API Reference

### RedisEventBus

Main event bus class.

**Methods:**
- `connect()` - Establish Redis connection
- `disconnect()` - Close connection and cleanup
- `publish(topic, event)` - Publish event to topic
- `subscribe(topic, callback)` - Subscribe to topic
- `psubscribe(pattern, callback)` - Subscribe to pattern
- `unsubscribe(topic, callback)` - Unsubscribe from topic
- `unsubscribe_all()` - Unsubscribe from all topics

**Properties:**
- `state` - Current connection state
- `is_connected` - Whether connected to Redis

### Event Classes

- `BaseEvent` - Base event class
- `TaskEvent` - Task-related events
- `AgentEvent` - Agent-related events
- `SystemEvent` - System-related events
- `CircuitBreakerEvent` - Circuit breaker events

### EventBuilder

Fluent API for building events.

**Methods:**
- `with_event_type(type)` - Set event type
- `with_source(source)` - Set event source
- `with_priority(priority)` - Set priority
- `with_correlation_id(id)` - Set correlation ID
- `with_causation_id(id)` - Set causation ID
- `with_data(**kwargs)` - Add event data
- `build()` - Build BaseEvent
- `build_task_event()` - Build TaskEvent
- `build_agent_event()` - Build AgentEvent

## Examples

See `event_bus_examples.py` for comprehensive examples including:

1. Basic pub/sub
2. Event builder usage
3. Pattern-based subscription
4. Circuit breaker events
5. Event correlation
6. Custom configuration
7. Error handling
8. Priority-based handling

Run examples:

```bash
python -m blackbox5.engine.core.event_bus_examples
```

## License

Internal use - BlackBox 5 Engine
