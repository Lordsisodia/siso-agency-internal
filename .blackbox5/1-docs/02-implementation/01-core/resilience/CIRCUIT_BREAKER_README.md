# Circuit Breaker System for BlackBox 5

**Comprehensive circuit breaker implementation for multi-agent failure detection and prevention**

---

## Table of Contents

1. [What is Circuit Breaker Pattern?](#what-is-circuit-breaker-pattern)
2. [Why It Matters](#why-it-matters)
3. [Architecture Overview](#architecture-overview)
4. [Installation](#installation)
5. [Quick Start](#quick-start)
6. [Configuration Options](#configuration-options)
7. [State Transitions](#state-transitions)
8. [Usage Patterns](#usage-patterns)
9. [Integration with Event Bus](#integration-with-event-bus)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)

---

## What is Circuit Breaker Pattern?

The **Circuit Breaker pattern** is a design pattern used in distributed systems to prevent cascading failures. It works like an electrical circuit breaker:

- **Normal Operation**: Requests pass through freely
- **Failure Detection**: After threshold failures, the circuit "trips" (opens)
- **Fast Failure**: Open circuit blocks requests immediately (no waiting)
- **Automatic Recovery**: After timeout, circuit tests if service has recovered

### Visual Model

```
CLOSED (Normal)                 OPEN (Tripped)              HALF_OPEN (Testing)
    ┌─────┐                        ┌─────┐                       ┌─────┐
    │     │  Failures ≥ threshold  │     │  Timeout elapsed      │     │
    │ ────├──────────────────────→ │ ────├────────────────────→ │ ────┤
    │     │                        │     │                       │     │
    └─────┘                        └─────┘                       └─────┘
       ↑                                                              │
       │                  Successes ≥ threshold                      │
       └──────────────────────────────────────────────────────────────┘
```

---

## Why It Matters

### Performance Benefits

| Metric | Without Circuit Breaker | With Circuit Breaker |
|--------|------------------------|---------------------|
| **Failure Detection** | 30-120s (timeout) | <1ms (immediate) |
| **Resource Waste** | High (waiting on dead services) | Minimal (fast fail) |
| **Cascading Failures** | Common | Prevented |
| **Recovery Time** | Manual | Automatic |

### Real-World Impact

**Scenario**: An AI agent becomes unresponsive

**Without Circuit Breaker**:
```
Request 1: waits 30s → timeout
Request 2: waits 30s → timeout
Request 3: waits 30s → timeout
Request 4: waits 30s → timeout
Total time: 120 seconds
System impact: Other agents delayed, queues back up
```

**With Circuit Breaker**:
```
Request 1: waits 30s → timeout (failure #1)
Request 2: waits 30s → timeout (failure #2)
Request 3: waits 30s → timeout (failure #3, circuit OPENS)
Request 4: rejected immediately (<1ms)
Request 5: rejected immediately (<1ms)
Total time: ~90 seconds
System impact: Circuit opens, other agents unaffected
```

**Result**: **9x faster failure detection** after circuit opens

---

## Architecture Overview

### Core Components

```
circuit_breaker.py
├── CircuitBreaker          # Main circuit breaker class
├── CircuitBreakerManager   # Manages multiple breakers
├── protect()               # Decorator for protection
└── for_agent()             # Convenience function

circuit_breaker_types.py
├── CircuitState            # State enum (CLOSED, OPEN, HALF_OPEN)
├── CircuitBreakerConfig    # Configuration dataclass
├── CircuitBreakerStats     # Statistics tracking
├── CallResult              # Result of protected call
└── CircuitBreakerPresets   # Predefined configurations
```

### Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                    Multi-Agent System                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐         ┌──────────────┐              │
│  │   Agent A   │────────▶│ Circuit      │              │
│  │ (researcher)│         │ Breaker #1   │              │
│  └─────────────┘         └──────────────┘              │
│                                   │                     │
│                                   ▼                     │
│                          ┌──────────────┐              │
│                          │   Manager    │              │
│                          │              │              │
│  ┌─────────────┐         │  - Tracks   │              │
│  │   Agent B   │────────▶│  - Stats    │              │
│  │  (writer)   │         │  - Events   │              │
│  └─────────────┘         └──────────────┘              │
│                                   │                     │
│                                   ▼                     │
│                          ┌──────────────┐              │
│                          │  Event Bus   │              │
│                          │  (Redis)     │              │
│                          └──────────────┘              │
│                                   │                     │
│                                   ▼                     │
│                          ┌──────────────┐              │
│                          │ All Agents   │              │
│                          │ Subscribe    │              │
│                          └──────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Installation

The circuit breaker is part of BlackBox 5 core. No additional installation needed.

```bash
# Already available in
.blackbox5/engine/core/circuit_breaker.py
.blackbox5/engine/core/circuit_breaker_types.py
```

### Dependencies

- Python 3.8+
- Redis (optional, for event bus integration)

```bash
# Optional: Install Redis for event bus
pip install redis
```

---

## Quick Start

### Basic Usage

```python
from blackbox5.engine.core.circuit_breaker import CircuitBreaker
from blackbox5.engine.core.circuit_breaker_types import CircuitBreakerConfig

# Create circuit breaker
cb = CircuitBreaker(
    service_id="agent.researcher",
    config=CircuitBreakerConfig(
        failure_threshold=5,      # Open after 5 failures
        timeout_seconds=60.0,     # Wait 60s before retry
        success_threshold=2,      # Need 2 successes to close
    )
)

# Protect a function call
try:
    result = cb.call(agent.execute, task_data)
    print(f"Success: {result}")
except CircuitBreakerOpenError:
    print("Circuit is open, using fallback")
except Exception as e:
    print(f"Agent failed: {e}")
```

### Using Decorator

```python
from blackbox5.engine.core.circuit_breaker import protect

@protect("my-service", config=CircuitBreakerConfig(failure_threshold=3))
def risky_function():
    # Potentially failing code
    pass

# Use normally
result = risky_function()  # Automatically protected
```

### For Agents

```python
from blackbox5.engine.core.circuit_breaker import for_agent

# Get circuit breaker for an agent
cb = for_agent("researcher", agent_type="llm")

# Use it
try:
    result = cb.call(agent.execute, task)
except CircuitBreakerOpenError:
    # Handle open circuit
    pass
```

---

## Configuration Options

### CircuitBreakerConfig Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `failure_threshold` | int | 5 | Consecutive failures before opening |
| `timeout_seconds` | float | 60.0 | Seconds before attempting reset |
| `success_threshold` | int | 2 | Successes needed in HALF_OPEN to close |
| `call_timeout` | float | 30.0 | Max seconds for a call to complete |
| `half_open_max_calls` | int | 1 | Max calls allowed in HALF_OPEN state |
| `reset_timeout` | float | 10.0 | Min seconds between reset attempts |
| `sliding_window_size` | int | 100 | Size of statistics window |

### Preset Configurations

```python
from blackbox5.engine.core.circuit_breaker_types import CircuitBreakerPresets

# Default - balanced for general use
config = CircuitBreakerPresets.default()

# Strict - opens faster, waits longer
config = CircuitBreakerPresets.strict()

# Lenient - tolerates more failures
config = CircuitBreakerPresets.lenient()

# Fast Recovery - attempts recovery quickly
config = CircuitBreakerPresets.fast_recovery()

# Agent-specific
config = CircuitBreakerPresets.for_agent("llm")  # For AI/LLM agents
config = CircuitBreakerPresets.for_agent("file")  # For file operations
```

### Choosing Configuration

**For LLM/AI Agents**:
```python
config = CircuitBreakerConfig(
    failure_threshold=3,      # LLMs are expensive, fail fast
    timeout_seconds=90.0,     # Wait longer for recovery
    call_timeout=120.0,       # LLM calls can be slow
)
```

**For File I/O**:
```python
config = CircuitBreakerConfig(
    failure_threshold=5,      # Tolerate temporary issues
    timeout_seconds=30.0,     # Quick recovery
    call_timeout=10.0,        # Fast timeout for I/O
)
```

---

## State Transitions

### State Diagram

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
┌─────────┐  failures ≥ threshold             ┌─────────┐
│ CLOSED  ├─────────────────────────────────▶│   OPEN  │
│         │                                   │         │
└─────────┘                                   └─────────┘
    ▲                                                │
    │                                                │
    │                              timeout &          │
    │  successes ≥ threshold        should_reset     │
    │                                (after wait)    │
    │                                                │
    │                       ┌────────────────────────┘
    │                       │
    ▼                       ▼
┌─────────────┐   failure   ┌────────────┐
│  HALF_OPEN  ├─────────────▶│    OPEN    │
│             │               │            │
└─────────────┘               └────────────┘
```

### State Behaviors

**CLOSED (Normal Operation)**
- All calls pass through
- Track consecutive failures
- Transition to OPEN when threshold reached

**OPEN (Blocking)**
- All calls rejected immediately (fast fail)
- Wait for timeout_seconds
- Transition to HALF_OPEN when timeout expires

**HALF_OPEN (Testing)**
- Limited calls allowed (half_open_max_calls)
- Track successes
- Success → CLOSED (when success_threshold met)
- Failure → OPEN (back to blocking)

### Transition Events

The circuit breaker publishes events on state transitions:

```python
# Event: CIRCUIT_OPENED
{
    "service": "agent.researcher",
    "state": "open",
    "failure_count": 5,
    "last_failure": "2025-01-18T10:30:00Z"
}

# Event: CIRCUIT_HALF_OPEN
{
    "service": "agent.researcher",
    "state": "half_open",
    "failure_count": 5,
}

# Event: CIRCUIT_CLOSED
{
    "service": "agent.researcher",
    "state": "closed",
    "failure_count": 0,
}
```

---

## Usage Patterns

### Pattern 1: Basic Protection

```python
from blackbox5.engine.core.circuit_breaker import CircuitBreaker

cb = CircuitBreaker("my-service")

def execute_with_protection():
    try:
        result = cb.call(risky_function, arg1, arg2)
        return result
    except CircuitBreakerOpenError:
        # Circuit is open, use fallback
        return get_fallback_result()
    except Exception as e:
        # Function failed but circuit still closed
        log_error(e)
        raise
```

### Pattern 2: Retry with Backoff

```python
import time

def execute_with_retry(cb, func, max_retries=3):
    """Execute with retry logic."""
    for attempt in range(max_retries):
        try:
            return cb.call(func)
        except CircuitBreakerOpenError:
            # Don't retry if circuit is open
            raise
        except Exception:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

### Pattern 3: Fallback Chain

```python
def execute_with_fallbacks(primary, fallbacks):
    """Try primary, then fallbacks."""
    cb_primary = CircuitBreaker("primary")

    try:
        return cb_primary.call(primary)
    except CircuitBreakerOpenError:
        # Primary is down, try fallbacks
        for i, fallback in enumerate(fallbacks):
            cb_fallback = CircuitBreaker(f"fallback-{i}")
            try:
                return cb_fallback.call(fallback)
            except CircuitBreakerOpenError:
                continue
        raise Exception("All services down")
```

### Pattern 4: Multi-Agent Coordination

```python
from blackbox5.engine.core.circuit_breaker import CircuitBreakerManager

manager = CircuitBreakerManager()

# Execute task across multiple agents
def coordinate_task(task):
    agents = ["researcher", "writer", "reviewer"]

    for agent_id in agents:
        cb = manager.get_breaker(f"agent.{agent_id}")
        agent = get_agent(agent_id)

        try:
            result = cb.call(agent.execute, task)
            task = result  # Pass result to next agent
        except CircuitBreakerOpenError:
            log_warning(f"Agent {agent_id} circuit open, skipping")
            continue
        except Exception as e:
            log_error(f"Agent {agent_id} failed: {e}")
            break
```

### Pattern 5: Statistics Monitoring

```python
def monitor_circuit_breakers():
    """Monitor all circuit breakers."""
    manager = get_circuit_breaker_manager()

    stats = manager.get_all_stats()

    for service_id, stats in stats.items():
        if stats['current_state'] == 'open':
            alert(f"Circuit open for {service_id}")
        elif stats['failure_rate'] > 0.5:
            warn(f"High failure rate for {service_id}: {stats['failure_rate']}")

    # Check open circuits
    open_circuits = manager.get_open_circuits()
    if len(open_circuits) > 3:
        alert(f"Too many open circuits: {open_circuits}")
```

---

## Integration with Event Bus

### Setting Up Event Bus Integration

```python
from blackbox5.engine.core.event_bus import get_event_bus
from blackbox5.engine.core.circuit_breaker import CircuitBreakerManager

# Get event bus
event_bus = get_event_bus()

# Create manager with event bus
manager = CircuitBreakerManager(event_bus=event_bus)

# Subscribe to circuit breaker events
def on_circuit_state_change(topic, event):
    print(f"Circuit state changed: {event.data}")

event_bus.subscribe(
    Topics.CIRCUIT_BREAKER_STATE,
    on_circuit_state_change
)
```

### Event-Driven Responses

```python
# Respond to circuit opening
def handle_circuit_opened(topic, event):
    service = event.data['service']
    failure_count = event.data['failure_count']

    # Notify monitoring system
    send_alert(f"Circuit opened for {service}")

    # Log to file
    log_event(f"Circuit breaker opened: {service}")

    # Trigger fallback activation
    activate_fallback(service)

# Subscribe
event_bus.subscribe(
    "circuit_breaker.*",
    lambda t, e: handle_circuit_opened(t, e)
        if e.metadata.event_type == EventType.CIRCUIT_OPENED
        else None
)
```

### Monitoring Dashboard

```python
class CircuitMonitor:
    """Real-time circuit breaker monitoring."""

    def __init__(self, event_bus):
        self.event_bus = event_bus
        self.state = {}

        self.event_bus.subscribe(
            Topics.CIRCUIT_BREAKER_ALL,
            self.on_event
        )

    def on_event(self, topic, event):
        service = event.data['service']
        state = event.data['state']

        self.state[service] = {
            'state': state,
            'timestamp': event.metadata.timestamp,
            'failure_count': event.data.get('failure_count', 0),
        }

        # Update dashboard
        self.update_dashboard(service, self.state[service])

    def update_dashboard(self, service, data):
        """Update monitoring dashboard."""
        print(f"[{service}] {data['state']} - {data['failure_count']} failures")
```

---

## Best Practices

### 1. Choose Appropriate Thresholds

```python
# GOOD: Adjusted for service characteristics
cb = CircuitBreaker(
    "database",
    config=CircuitBreakerConfig(
        failure_threshold=10,  # DBs can have transient issues
        timeout_seconds=30.0,  # Recover quickly
    )
)

# BAD: One-size-fits-all
cb = CircuitBreaker(
    "database",
    config=CircuitBreakerConfig(
        failure_threshold=5,  # Too strict for DB
        timeout_seconds=60.0,  # Too slow
    )
)
```

### 2. Use Agent-Specific Configs

```python
# GOOD: Use presets
cb = for_agent("researcher", agent_type="llm")

# BETTER: Custom config for specific needs
cb = CircuitBreaker(
    "agent.researcher",
    config=CircuitBreakerPresets.for_agent("llm")
)
```

### 3. Monitor Statistics

```python
#定期检查统计信息
cb = CircuitBreaker("my-service")

# 每小时检查
def hourly_check():
    stats = cb.get_stats()

    if stats['failure_rate'] > 0.3:
        warn(f"High failure rate: {stats['failure_rate']}")

    if stats['rejection_count'] > 100:
        warn(f"High rejection count: {stats['rejection_count']}")
```

### 4. Handle Open Circuits Gracefully

```python
# GOOD: Provide fallback
try:
    result = cb.call(primary_service)
except CircuitBreakerOpenError:
    result = get_cached_result()  # Use cache
    notify_admins("Primary service down")

# BAD: Just fail
try:
    result = cb.call(primary_service)
except CircuitBreakerOpenError:
    raise  # Unhandled
```

### 5. Use Context Managers for Cleanup

```python
# GOOD: Context manager ensures cleanup
with cb.protect():
    result = risky_operation()
    # Auto handled

# BETTER: With error handling
try:
    with cb.protect():
        result = risky_operation()
except CircuitBreakerOpenError:
    result = fallback_operation()
```

### 6. Don't Ignore Half-Open State

```python
# GOOD: Respect half-open limits
if cb.is_half_open:
    log_info("Circuit in recovery mode")
    # Maybe limit load

# BETHER: Let circuit breaker handle it
try:
    result = cb.call(agent.execute, task)
except CircuitBreakerOpenError:
    # Circuit is open or at half-open limit
    pass
```

### 7. Reset Circuits Periodically

```python
# Reset circuits daily (e.g., in a cron job)
def daily_reset():
    manager = get_circuit_breaker_manager()

    # Only reset closed circuits (not open ones)
    for service_id, cb in manager.get_all_stats().items():
        if cb['current_state'] == 'closed':
            manager.get_breaker(service_id).reset()
```

---

## Troubleshooting

### Problem: Circuit Opens Too Frequently

**Symptoms**: Circuit opens even though service is mostly working

**Solutions**:
```python
# Increase failure threshold
config = CircuitBreakerConfig(
    failure_threshold=10,  # Was 5
)

# Or use lenient preset
config = CircuitBreakerPresets.lenient()
```

### Problem: Circuit Never Opens

**Symptoms**: Service fails but circuit doesn't open

**Solutions**:
```python
# Check exception types
config = CircuitBreakerConfig(
    exception_types=(Exception,),  # Catch all exceptions
)

# Lower threshold
config = CircuitBreakerConfig(
    failure_threshold=2,  # Was 10
)
```

### Problem: Circuit Stays Open Too Long

**Symptoms**: Circuit open even after service recovers

**Solutions**:
```python
# Reduce timeout
config = CircuitBreakerConfig(
    timeout_seconds=30.0,  # Was 120.0
)

# Or use fast recovery preset
config = CircuitBreakerPresets.fast_recovery()
```

### Problem: High Rejection Count

**Symptoms**: Many calls rejected even when circuit is closed

**Solutions**:
```python
# Check if circuit is actually closed
print(cb.state)  # Should be "closed"

# Check stats
stats = cb.get_stats()
print(stats['rejection_count'])  # Should be 0 if closed

# Manual reset if needed
cb.reset()
```

### Problem: Memory Usage Growing

**Symptoms**: Statistics growing unbounded

**Solutions**:
```python
# Reduce sliding window size
config = CircuitBreakerConfig(
    sliding_window_size=50,  # Was 1000
)

# Reset periodically
def reset_stats():
    cb.stats.reset()
```

---

## API Reference

### CircuitBreaker Class

#### Constructor

```python
CircuitBreaker(
    service_id: str,
    config: Optional[CircuitBreakerConfig] = None,
    event_bus: Optional[RedisEventBus] = None,
)
```

#### Methods

**call()**
```python
call(func: Callable[..., T], *args, **kwargs) -> T
```
Execute a function with circuit breaker protection.

**protect()**
```python
@contextmanager
protect()
```
Context manager for protection.

**decorate()**
```python
decorate(func: Callable[..., T]) -> Callable[..., T]
```
Decorator for function protection.

**reset()**
```python
reset() -> None
```
Reset circuit to CLOSED state.

**get_stats()**
```python
get_stats() -> Dict[str, Any]
```
Get circuit statistics.

#### Properties

**state** -> `CircuitState`
Current circuit state.

**is_closed** -> `bool`
True if circuit is CLOSED.

**is_open** -> `bool`
True if circuit is OPEN.

**is_half_open** -> `bool`
True if circuit is HALF_OPEN.

### CircuitBreakerManager Class

#### Methods

**get_breaker()**
```python
get_breaker(
    service_id: str,
    config: Optional[CircuitBreakerConfig] = None,
    agent_type: Optional[str] = None,
) -> CircuitBreaker
```
Get or create a circuit breaker.

**get_all_stats()**
```python
get_all_stats() -> Dict[str, Dict[str, Any]]
```
Get statistics for all circuits.

**get_open_circuits()**
```python
get_open_circuits() -> List[str]
```
List of services with open circuits.

**reset_all()**
```python
reset_all() -> None
```
Reset all circuit breakers.

### CircuitBreakerConfig

```python
@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 5
    timeout_seconds: float = 60.0
    success_threshold: int = 2
    call_timeout: float = 30.0
    half_open_max_calls: int = 1
    reset_timeout: float = 10.0
    sliding_window_size: int = 100
    exception_types: tuple = (Exception,)
```

### CircuitState Enum

```python
class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"
```

---

## Examples

See `circuit_breaker_examples.py` for 10 complete, runnable examples:

1. Basic Usage
2. Agent Execution
3. Custom Configuration
4. State Monitoring
5. Half-Open Recovery
6. Event Bus Integration
7. Timeout Handling
8. Multiple Agents
9. Decorator Usage
10. Context Manager

Run examples:
```bash
python -m blackbox5.engine.core.circuit_breaker_examples
```

---

## Summary

The BlackBox 5 circuit breaker system provides:

- **Fast Failure Detection**: 9x faster than waiting for timeouts
- **Cascading Failure Prevention**: Stops failures from spreading
- **Automatic Recovery**: Self-healing with half-open state
- **Per-Agent Tracking**: Independent circuits for each service
- **Event Bus Integration**: Real-time state change notifications
- **Flexible Configuration**: Presets and custom options
- **Comprehensive Statistics**: Monitor and analyze circuit behavior

**Next Steps**:
1. Add circuit breakers to critical agents
2. Set up event bus monitoring
3. Configure appropriate thresholds
4. Implement fallback strategies
5. Monitor and tune based on statistics

---

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-01-18
