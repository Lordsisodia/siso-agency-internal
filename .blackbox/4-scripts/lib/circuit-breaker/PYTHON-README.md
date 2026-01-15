# Circuit Breaker System for Ralph Runtime (Python)

Enhanced circuit breaker implementation with comprehensive failsafe detection, metrics tracking, and seamless Ralph Runtime integration for Blackbox4 Phase 4.

## Overview

This Python circuit breaker system protects autonomous agent execution from cascading failures by automatically detecting failures, pausing execution when dangerous conditions are detected, and recovering when safe. It integrates directly with Ralph Runtime to provide real-time monitoring and protection.

**Note:** This is the Python implementation that complements the existing bash-based circuit breaker. For bash usage, see the main README.md.

## Features

- **Automatic Failure Detection**: Detects failures using sliding window and consecutive failure tracking
- **State Management**: Automatic transitions between Closed, Open, and Half-Open states
- **Failsafe Detection**: Monitors CPU, memory, disk usage, error rates, and stuck tasks
- **Ralph Runtime Integration**: Protects agent execution, detects handoff loops, and monitors confidence
- **Comprehensive Metrics**: Tracks success rates, failure rates, durations, and state transitions
- **Flexible Configuration**: Presets for different scenarios (conservative, moderate, aggressive)
- **Auto-Recovery**: Automatically resumes execution when conditions improve
- **Export Formats**: JSON and Prometheus metrics export

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ralph Runtime                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         RalphCircuitBreaker                          │   │
│  │  - Agent monitoring                                  │   │
│  │  - Handoff detection                                 │   │
│  │  - Confidence tracking                               │   │
│  │  - Pause/Resume control                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         CircuitBreaker                               │   │
│  │  - State management (Closed/Open/Half-Open)          │   │
│  │  - Failure tracking                                  │   │
│  │  - Automatic transitions                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         FailsafeDetector                             │   │
│  │  - Resource monitoring (CPU/Memory/Disk)             │   │
│  │  - Error rate checking                               │   │
│  │  - Stuck task detection                              │   │
│  │  - Confidence validation                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Metrics                                      │   │
│  │  - Call tracking                                     │   │
│  │  - Statistics aggregation                            │   │
│  │  - Export (JSON/Prometheus)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

The circuit breaker system is included in Blackbox4 Phase 4. Ensure you have the required dependencies:

```bash
pip install psutil
```

## Quick Start

### Basic Circuit Breaker

```python
from circuit_breaker import CircuitBreaker, circuit_breaker_protected

# Create circuit breaker
breaker = CircuitBreaker(
    name="external-api",
    failure_threshold=5,
    timeout_ms=60000
)

# Protect a call
try:
    result = breaker.call(lambda: external_api_call())
except CircuitBreakerOpenError:
    print("Circuit is open - using fallback")
    result = get_fallback_data()

# Or use as decorator
@circuit_breaker_protected("external-api", failure_threshold=5)
def call_external_api():
    return external_api_call()

result = call_external_api()
```

### Ralph Runtime Integration

```python
from circuit_breaker import (
    RalphCircuitBreaker,
    AgentExecutionContext
)

# Initialize Ralph circuit breaker
ralph_breaker = RalphCircuitBreaker()

# Create agent context
context = AgentExecutionContext(
    agent_id="research-agent-1",
    agent_name="ResearchAgent",
    session_id="session-123",
    task_id="task-456"
)

# Monitor agent
ralph_breaker.monitor_agent(context)

# Execute agent with protection
try:
    result = ralph_breaker.execute_agent(
        "research-agent-1",
        agent_function,
        arg1, arg2,
        kwarg1=value1
    )
except AgentPausedError:
    print("Agent paused - waiting for recovery")
except FailsafeTriggeredError:
    print("Failsafe triggered - escalation needed")
```

### Advanced Configuration

```python
from circuit_breaker import create_custom_config, CircuitBreaker

# Create custom configuration
config = create_custom_config(
    preset="conservative",
    failure_threshold=3,
    timeout_ms=120000,
    retry_enabled=True
)

# Use custom configuration
breaker = CircuitBreaker("critical-service", config)
```

## Configuration

### Presets

The system includes several configuration presets:

- **conservative**: Quick to trip, slow to recover (3 failures, 3 successes)
- **moderate**: Balanced approach (5 failures, 2 successes) - **default**
- **aggressive**: Slow to trip, quick to recover (10 failures, 1 success)
- **critical_service**: Extra conservative for critical systems
- **external_api**: Optimized for external API calls
- **database**: Optimized for database operations
- **agent_execution**: Optimized for agent execution

### Configuration Options

```python
from circuit_breaker import RalphCircuitBreakerConfig

config = RalphCircuitBreakerConfig(
    # Agent thresholds
    agent_failure_threshold=3,
    handoff_threshold=5,
    low_confidence_threshold=0.3,
    stuck_task_threshold=10,

    # Recovery settings
    auto_resume_enabled=True,
    auto_resume_delay_ms=30000,
    max_recovery_attempts=3,

    # Failsafe thresholds
    cpu_threshold=90.0,
    memory_threshold=90.0,
    disk_threshold=90.0,

    # Escalation
    escalation_timeout_ms=120000
)
```

## Circuit Breaker States

### Closed
- Normal operation
- All calls allowed through
- Failures are counted
- Transitions to Open when failure threshold reached

### Open
- Circuit has tripped
- All calls are rejected immediately
- Waits for timeout duration
- Transitions to Half-Open after timeout

### Half-Open
- Testing if system has recovered
- Limited number of calls allowed
- Success leads to Closed
- Failure returns to Open

## Failsafe Detection

The system continuously monitors for dangerous conditions:

### Resource Monitoring
- **CPU Usage**: Alerts when usage exceeds threshold
- **Memory Usage**: Alerts when usage exceeds threshold
- **Disk Usage**: Alerts when usage exceeds threshold

### Error Rate Monitoring
- **High Error Rate**: Alerts when error rate exceeds threshold
- **Consecutive Errors**: Alerts on consecutive failures
- **Sliding Window**: Tracks errors over time window

### Task Monitoring
- **Max Iterations**: Detects excessive iterations
- **Max Duration**: Detects long-running tasks
- **Stuck Detection**: Detects tasks making no progress

### Agent-Specific Monitoring
- **Handoff Loops**: Detects excessive agent handoffs
- **Low Confidence**: Detects low confidence scores
- **Agent Failures**: Tracks agent-specific failures

## Metrics and Monitoring

### Accessing Statistics

```python
# Get circuit breaker statistics
stats = breaker.get_statistics()
print(f"Success rate: {stats['success_rate']}%")
print(f"Total calls: {stats['total_calls']}")

# Get Ralph circuit breaker status
status = ralph_breaker.get_agent_status("agent-id")
print(f"Status: {status['status']}")
print(f"Circuit breaker: {status['circuit_breaker']}")
```

### Exporting Metrics

```python
# Export as JSON
json_metrics = breaker.get_metrics().export_json(include_history=True)

# Export as Prometheus
prometheus_metrics = breaker.get_metrics().export_prometheus()

# Get health status
health = breaker.get_metrics().get_health_status()
print(f"Healthy: {health['healthy']}")
```

### Time Series Data

```python
# Get recent time series data
metrics = breaker.get_metrics()
duration_series = metrics.get_time_series('duration_ms', minutes=5)
```

## Best Practices

### 1. Choose Appropriate Thresholds

```python
# For critical systems - use conservative
breaker = CircuitBreaker(
    "payment-gateway",
    failure_threshold=2,  # Trip quickly
    timeout_ms=180000     # Longer recovery
)

# For non-critical - use aggressive
breaker = CircuitBreaker(
    "cache-service",
    failure_threshold=10,  # Trip slowly
    timeout_ms=30000       # Quick recovery
)
```

### 2. Implement Fallbacks

```python
try:
    result = breaker.call(risky_operation)
except CircuitBreakerOpenError:
    # Use fallback
    result = get_cached_result()
```

### 3. Monitor Metrics

```python
# Regularly check metrics
stats = breaker.get_statistics()
if stats['success_rate'] < 80:
    alert_team(f"Low success rate: {stats['success_rate']}%")
```

### 4. Use Ralph Integration for Agents

```python
# Always use RalphCircuitBreaker for agents
ralph_breaker = RalphCircuitBreaker()
context = AgentExecutionContext(
    agent_id=agent_id,
    agent_name=agent_name,
    session_id=session_id
)
ralph_breaker.monitor_agent(context)
```

### 5. Handle Failsafes Appropriately

```python
try:
    result = ralph_breaker.execute_agent(agent_id, func)
except FailsafeTriggeredError as e:
    # Check severity and handle
    conditions = ralph_breaker.detect_failsafe(agent_id)
    if any(c.severity == "high" for c in conditions):
        escalate_to_human()
    else:
        log_warning(str(e))
```

## Integration with Ralph Runtime

### Agent Handoff Protection

The circuit breaker prevents infinite handoff loops by tracking handoff counts and escalating when thresholds are exceeded.

```python
# Update context during execution
ralph_breaker.update_context(
    agent_id,
    handoff_count=current_count + 1
)

# Circuit breaker will detect and pause if too many
```

### Confidence Tracking

Monitor agent confidence and pause when it drops too low.

```python
# Update confidence
ralph_breaker.update_context(
    agent_id,
    confidence=agent_confidence_score
)

# Auto-pause if confidence < threshold
```

### Error Recovery

Automatic error recovery with configurable strategies.

```python
config = RalphCircuitBreakerConfig(
    auto_resume_enabled=True,
    auto_resume_delay_ms=30000,
    max_recovery_attempts=3
)
```

## Troubleshooting

### Circuit Keeps Opening

- Lower failure threshold
- Increase timeout duration
- Check for systemic issues
- Review error logs

### Agent Won't Resume

- Check failsafe conditions
- Verify resource availability
- Manually reset if needed
- Review recovery attempts

### High Memory Usage

- Reduce sliding window size
- Limit history retention
- Export and clear metrics regularly

## API Reference

### CircuitBreaker

```python
class CircuitBreaker:
    def __init__(self, name: str, config: CircuitBreakerConfig)
    def call(self, func: Callable, *args, **kwargs) -> Any
    def record_success(self, duration_ms: float = 0) -> None
    def record_failure(self, error: Exception, duration_ms: float = 0) -> None
    def get_state(self) -> CircuitBreakerState
    def reset(self) -> None
    def get_metrics(self) -> CircuitBreakerMetrics
    def get_statistics(self) -> Dict
```

### RalphCircuitBreaker

```python
class RalphCircuitBreaker:
    def __init__(self, config: RalphCircuitBreakerConfig)
    def monitor_agent(self, context: AgentExecutionContext) -> None
    def execute_agent(self, agent_id: str, func: Callable, *args, **kwargs) -> Any
    def detect_failsafe(self, agent_id: str) -> List[FailsafeCondition]
    def trigger_pause(self, agent_id: str, reason: str) -> None
    def auto_resume(self, agent_id: str) -> bool
    def update_context(self, agent_id: str, **updates) -> None
    def get_agent_status(self, agent_id: str) -> Dict
    def reset_agent(self, agent_id: str) -> None
```

### FailsafeDetector

```python
class FailsafeDetector:
    def check_all(self) -> List[FailsafeCondition]
    def check_resource_limits(self) -> List[FailsafeCondition]
    def check_error_rate(self) -> List[FailsafeCondition]
    def check_stuck_tasks(self) -> List[FailsafeCondition]
    def check_confidence(self, confidence: float) -> List[FailsafeCondition]
```

## Examples

See the `examples/` directory for complete examples:

- `basic_usage.py`: Basic circuit breaker usage
- `ralph_integration.py`: Ralph Runtime integration
- `custom_configuration.py`: Custom configuration examples
- `metrics_export.py`: Metrics collection and export

## File Structure

```
4-scripts/lib/circuit-breaker/
├── __init__.py                    # Package exports
├── circuit_breaker.py             # Core circuit breaker implementation
├── ralph_circuit_breaker.py       # Ralph Runtime integration
├── failsafe_detector.py           # Failsafe condition detection
├── circuit_breaker_config.py      # Configuration management
├── metrics.py                     # Metrics tracking and export
├── README.md                      # This file
└── config.yaml                    # Bash circuit breaker config
```

## License

Part of Blackbox4 Phase 4 for Ralph Runtime integration.

## Support

For issues and questions, refer to the main Blackbox4 documentation.
