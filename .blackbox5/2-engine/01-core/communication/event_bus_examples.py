"""
Examples and usage patterns for the BlackBox 5 event bus.

This file demonstrates common patterns for using the event bus
in agent applications and system integrations.
"""

import time
from typing import Dict, Any

from .event_bus import RedisEventBus, EventBusConfig, get_event_bus
from .events import (
    BaseEvent,
    TaskEvent,
    AgentEvent,
    SystemEvent,
    CircuitBreakerEvent,
    EventBuilder,
    Topics,
    EventType,
    Priority
)


# Example 1: Basic event publishing and subscribing
def example_basic_pubsub():
    """Basic example of publishing and subscribing to events."""
    print("=== Example 1: Basic Pub/Sub ===\n")

    # Get event bus instance
    bus = get_event_bus()

    # Define a callback for handling events
    def handle_task_event(channel: str, event: BaseEvent):
        print(f"Received event on channel '{channel}'")
        print(f"  Type: {event.metadata.event_type}")
        print(f"  Task ID: {event.data.get('task_id')}")
        print(f"  Status: {event.data.get('status')}")
        print()

    # Subscribe to task events
    bus.subscribe("agent.tasks", handle_task_event)

    # Publish a task event
    task_event = TaskEvent.create(
        event_type=EventType.TASK_CREATED,
        task_id="task-123",
        agent_id="agent-456",
        status="pending"
    )

    bus.publish("agent.tasks", task_event)

    # Give the listener time to process
    time.sleep(0.5)

    # Cleanup
    bus.unsubscribe("agent.tasks", handle_task_event)


# Example 2: Using the EventBuilder
def example_event_builder():
    """Example using the fluent EventBuilder API."""
    print("=== Example 2: Event Builder ===\n")

    bus = get_event_bus()

    # Build an event with the fluent API
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

    def handle_event(channel: str, event: BaseEvent):
        print(f"Built event received:")
        print(f"  Event ID: {event.metadata.event_id}")
        print(f"  Priority: {event.metadata.priority}")
        print(f"  Correlation ID: {event.metadata.correlation_id}")
        print(f"  Data: {event.data}")
        print()

    bus.subscribe("agent.status", handle_event)
    bus.publish("agent.status", event)

    time.sleep(0.5)
    bus.unsubscribe("agent.status", handle_event)


# Example 3: Pattern-based subscription
def example_pattern_subscription():
    """Example of subscribing to event patterns."""
    print("=== Example 3: Pattern Subscription ===\n")

    bus = get_event_bus()

    # Callback for all agent events
    def handle_all_agent_events(channel: str, event: BaseEvent):
        print(f"Agent event on '{channel}': {event.metadata.event_type}")

    # Subscribe to all agent.* events
    bus.psubscribe("agent.*", handle_all_agent_events)

    # Publish to different agent topics
    bus.publish("agent.tasks", TaskEvent.create(
        EventType.TASK_STARTED, "task-1", "agent-1", "running"
    ))

    bus.publish("agent.status", AgentEvent.create(
        EventType.AGENT_HEARTBEAT, "agent-1", "TaskAgent"
    ))

    bus.publish("agent.errors", AgentEvent.create(
        EventType.AGENT_ERROR, "agent-1", "TaskAgent"
    ))

    time.sleep(0.5)

    # Cleanup
    bus.unsubscribe_all()


# Example 4: Circuit breaker events
def example_circuit_breaker():
    """Example of circuit breaker event handling."""
    print("=== Example 4: Circuit Breaker Events ===\n")

    bus = get_event_bus()

    def monitor_circuit_breaker(channel: str, event: BaseEvent):
        print(f"Circuit breaker state change:")
        print(f"  Service: {event.data.get('service')}")
        print(f"  State: {event.data.get('state')}")
        print(f"  Failures: {event.data.get('failure_count')}")
        print()

    # Monitor circuit breaker state
    bus.subscribe(
        Topics.circuit_breaker_topic("database"),
        monitor_circuit_breaker
    )

    # Publish circuit breaker events
    bus.publish(
        Topics.circuit_breaker_topic("database"),
        CircuitBreakerEvent.create(
            EventType.CIRCUIT_OPENED,
            service="database",
            state="OPEN",
            failure_count=5,
            last_failure="2026-01-18T10:30:00Z"
        )
    )

    time.sleep(0.5)

    # Cleanup
    bus.unsubscribe(Topics.circuit_breaker_topic("database"))


# Example 5: Event correlation and causation
def example_event_correlation():
    """Example of using correlation and causation IDs."""
    print("=== Example 5: Event Correlation ===\n")

    bus = get_event_bus()

    # Start a workflow with correlation ID
    correlation_id = "workflow-2026-01-18-001"

    # First event
    event1 = (EventBuilder()
              .with_event_type(EventType.TASK_CREATED)
              .with_source("system.scheduler")
              .with_correlation_id(correlation_id)
              .with_data(task_id="task-1", description="Initial task")
              .build())

    # Second event (caused by first)
    event2 = (EventBuilder()
              .with_event_type(EventType.TASK_STARTED)
              .with_source("agent.task-processor")
              .with_correlation_id(correlation_id)
              .with_causation_id(event1.metadata.event_id)
              .with_data(task_id="task-1", status="running")
              .build())

    def trace_workflow(channel: str, event: BaseEvent):
        print(f"Workflow step:")
        print(f"  Event: {event.metadata.event_type}")
        print(f"  Correlation: {event.metadata.correlation_id}")
        print(f"  Causation: {event.metadata.causation_id}")
        print()

    bus.subscribe("workflow.trace", trace_workflow)

    bus.publish("workflow.trace", event1)
    bus.publish("workflow.trace", event2)

    time.sleep(0.5)
    bus.unsubscribe("workflow.trace", trace_workflow)


# Example 6: Custom configuration
def example_custom_config():
    """Example with custom event bus configuration."""
    print("=== Example 6: Custom Configuration ===\n")

    # Create custom config
    config = EventBusConfig(
        host="localhost",
        port=6379,
        db=1,  # Use different database
        connection_pool_size=20,
        pubsub_timeout=2.0,
        enable_reconnection=True,
        max_reconnection_attempts=20
    )

    # Create event bus with custom config
    bus = RedisEventBus(config)

    print(f"Event bus state: {bus.state}")
    print(f"Is connected: {bus.is_connected}")

    # Connect
    bus.connect()
    print(f"After connect - State: {bus.state}")

    # Use auto-reconnect context manager
    with bus.auto_reconnect():
        event = SystemEvent.create(
            EventType.SYSTEM_STARTUP,
            component="event-bus-example",
            message="System starting up"
        )
        bus.publish("system.status", event)

    time.sleep(0.5)

    # Cleanup
    bus.disconnect()
    print(f"After disconnect - State: {bus.state}")


# Example 7: Error handling
def example_error_handling():
    """Example of proper error handling."""
    print("=== Example 7: Error Handling ===\n")

    from .exceptions import (
        EventBusError,
        EventValidationError,
        format_exception
    )

    bus = get_event_bus()

    # Handle connection errors
    try:
        # This would fail if Redis isn't running
        event = SystemEvent.create(
            EventType.SYSTEM_STARTUP,
            component="test",
            message="Test"
        )
        bus.publish("test", event)
        print("Event published successfully")
    except EventBusError as e:
        error_dict = format_exception(e)
        print(f"Event bus error: {error_dict}")

    # Handle validation errors
    try:
        # Create invalid event (missing required fields)
        invalid_event = BaseEvent(
            metadata=None,  # Invalid!
            data={}
        )
        bus.publish("test", invalid_event)
    except EventValidationError as e:
        print(f"Validation error: {e}")
        print(f"Details: {e.details}")


# Example 8: Priority-based event handling
def example_priority_handling():
    """Example of handling events by priority."""
    print("=== Example 8: Priority Handling ===\n")

    bus = get_event_bus()

    def handle_critical_events(channel: str, event: BaseEvent):
        if event.metadata.priority == Priority.CRITICAL:
            print(f"CRITICAL: {event.metadata.event_type}")
            print(f"  Data: {event.data}")

    def handle_all_events(channel: str, event: BaseEvent):
        print(f"Normal: {event.metadata.event_type} (Priority: {event.metadata.priority})")

    # Subscribe with different handlers
    bus.subscribe("system.alerts", handle_critical_events)
    bus.subscribe("system.alerts", handle_all_events)

    # Publish events with different priorities
    critical_event = (EventBuilder()
                      .with_event_type(EventType.SYSTEM_ERROR)
                      .with_source("system.monitor")
                      .with_priority(Priority.CRITICAL)
                      .with_data(message="Critical system failure", error_code="ERR-001")
                      .build())

    normal_event = (EventBuilder()
                    .with_event_type(EventType.SYSTEM_STARTUP)
                    .with_source("system.scheduler")
                    .with_priority(Priority.NORMAL)
                    .with_data(message="System starting")
                    .build())

    bus.publish("system.alerts", critical_event)
    bus.publish("system.alerts", normal_event)

    time.sleep(0.5)

    # Cleanup
    bus.unsubscribe_all()


def run_all_examples():
    """Run all examples."""
    print("=" * 60)
    print("BlackBox 5 Event Bus Examples")
    print("=" * 60)
    print()

    try:
        example_basic_pubsub()
        example_event_builder()
        example_pattern_subscription()
        example_circuit_breaker()
        example_event_correlation()
        example_custom_config()
        example_error_handling()
        example_priority_handling()

        print("=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\nExample failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_examples()
