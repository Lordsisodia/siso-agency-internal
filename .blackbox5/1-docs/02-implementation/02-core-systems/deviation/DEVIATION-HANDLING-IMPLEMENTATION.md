# 4-Rule Deviation Handling Implementation

**Component 4 of the GSD (General Software Development) Framework**

## Overview

The 4-Rule Deviation Handling system provides autonomous error recovery for BlackBox5 task execution. It detects common failure patterns and applies pre-planned recovery strategies without human intervention.

## The 4 Rules

1. **Bug Fix Rule**: Fix code bugs (test failures, runtime errors)
2. **Missing Dependency Rule**: Install missing packages
3. **Task Blockage Rule**: Unblock external dependencies
4. **Critical Addition Rule**: Add missing critical features

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Orchestrator                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Deviation Handler                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ ││
│  │  │   Detect    │  │  Classify   │  │    Recover      │ ││
│  │  │  Deviation  │  │     By      │  │   Autonomously  │ ││
│  │  │             │  │     Type    │  │                 │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    Recovery Actions     │
              │  • Fix code bugs        │
              │  • Install packages     │
              │  • Retry with backoff   │
              │  • Add missing fields   │
              └─────────────────────────┘
```

## Implementation Files

### Core Module

**File**: `.blackbox5/engine/core/deviation_handler.py`

Main deviation handling implementation with:
- `DeviationType` enum: Classification of error types
- `Deviation` dataclass: Represents detected deviations
- `DeviationHandler` class: Detection and recovery logic

### Integration

**File**: `.blackbox5/engine/core/orchestrator_deviation_integration.py`

Integration code for adding deviation handling to Orchestrator:
- Modified `__init__` method
- New `_execute_with_recovery` method
- Updated `parallel_execute` method
- Statistics and monitoring methods

### Tests

**File**: `.blackbox5/tests/test_deviation_handling.py`

Comprehensive test suite covering:
- Deviation detection from various error types
- Fix suggestion generation
- Recovery strategy execution
- Attempt limiting and statistics
- Pattern matching and heuristics

## Deviation Types

### 1. Bug (BUG)

**Detection Patterns**:
- AssertionError
- TestFailed
- Traceback errors
- NameError
- AttributeError
- TypeError
- ValueError

**Recovery Strategy**:
1. Parse error for file location and line number
2. Read problematic file
3. Apply heuristic fixes based on error type
4. Write fixed content back
5. Retry task

**Examples**:
```python
# NameError
NameError: name 'x' is not defined
→ Adds: x = None

# AttributeError
AttributeError: 'NoneType' object has no attribute 'data'
→ Adds: if obj is not None:
```

### 2. Missing Dependency (MISSING_DEPENDENCY)

**Detection Patterns**:
- ImportError
- ModuleNotFoundError
- "No module named"
- "cannot import"

**Recovery Strategy**:
1. Parse error for package name
2. Run `pip install <package>`
3. Verify installation
4. Retry task

**Examples**:
```python
ModuleNotFoundError: No module named 'requests'
→ Runs: pip install requests

ImportError: cannot import name 'xyz' from 'module'
→ Suggests: pip install module
```

### 3. Blockage (BLOCKAGE)

**Detection Patterns**:
- Timeout errors
- Connection refused
- Network unreachable
- API errors
- HTTP 5xx errors
- Read/Connect timeout

**Recovery Strategy**:
1. Identify blockage type
2. Log suggested fixes
3. Return False (requires orchestrator-level retry)

**Examples**:
```python
TimeoutError: Connection timeout after 30 seconds
→ Suggests: Increase timeout value

ConnectionRefusedError: Connection refused
→ Suggests: Check if service is running

HTTP 500 Internal Server Error
→ Suggests: Retry later, check service status
```

### 4. Critical Missing (CRITICAL_MISSING)

**Detection Patterns**:
- ValidationError
- "required field"
- "missing required"
- KeyError with required
- NotFound errors

**Recovery Strategy**:
1. Identify missing component
2. Log suggested additions
3. Return False (requires human design)

**Examples**:
```python
ValueError: required field 'user_id' is missing
→ Suggests: Add required field: user_id

KeyError: 'required_field'
→ Suggests: Add missing key: required_field
```

## Usage

### Basic Setup

```python
from engine.core import create_orchestrator

# Create orchestrator with deviation handling enabled
orchestrator = create_orchestrator(
    max_recovery_attempts=3,
    enable_deviation_handling=True
)
```

### Executing Workflows

```python
# Define workflow
workflow = [
    {
        "agent_type": "developer",
        "task": "Implement user authentication",
        "agent_id": "dev_auth"
    },
    {
        "agent_type": "tester",
        "task": "Run authentication tests",
        "agent_id": "test_auth",
        "depends_on": ["dev_auth"]
    }
]

# Execute with automatic error recovery
result = await orchestrator.execute_wave_based(workflow)

# Check result
if result.state == WorkflowState.COMPLETED:
    print("Workflow completed successfully")
else:
    print(f"Workflow failed: {result.errors}")
```

### Monitoring Recovery Attempts

```python
# Get deviation statistics
stats = orchestrator.get_deviation_statistics()
print(f"Total recovery attempts: {stats['total_attempts']}")
print(f"By type: {stats['by_type']}")

# Get recent recoveries
recent = orchestrator.get_recent_recoveries(limit=10)
for recovery in recent:
    print(f"{recovery['timestamp']}: {recovery['deviation_type']}")
```

### Full Statistics

```python
# Get comprehensive statistics
stats = orchestrator.get_statistics()

print(f"Deviation handling: {stats['deviation_handling']}")
print(f"Total agents: {stats['total_agents']}")
print(f"Completed workflows: {stats['completed_workflows']}")
```

## Configuration Options

### Orchestrator Initialization

```python
orchestrator = AgentOrchestrator(
    event_bus=event_bus,
    task_router=task_router,
    memory_base_path=Path(".blackbox5/agent_memory"),
    max_concurrent_agents=5,
    enable_checkpoints=True,
    checkpoint_frequency=1,
    checkpoint_retention=5,
    enable_atomic_commits=True,
    # Deviation handling options
    max_recovery_attempts=3,        # Max recovery attempts per task
    enable_deviation_handling=True  # Enable/disable autonomous recovery
)
```

### Deviation Handler Configuration

```python
from engine.core.deviation_handler import DeviationHandler

handler = DeviationHandler(
    max_recovery_attempts=3  # Maximum attempts per deviation type
)
```

## Recovery Attempt Limits

The system prevents infinite recovery loops by tracking attempts per task and deviation type:

```python
# Maximum attempts per task and deviation type
max_recovery_attempts = 3

# Example: If a task fails with the same deviation type 3 times,
# the 4th attempt will not be recovered automatically
```

## Error Pattern Matching

The system uses regex patterns to classify errors:

```python
# Bug patterns
self.bug_patterns = [
    re.compile(r"AssertionError", re.IGNORECASE),
    re.compile(r"TestFailed", re.IGNORECASE),
    re.compile(r"Traceback.*Error", re.IGNORECASE),
    # ... more patterns
]

# Dependency patterns
self.dependency_patterns = [
    re.compile(r"ImportError", re.IGNORECASE),
    re.compile(r"ModuleNotFoundError", re.IGNORECASE),
    # ... more patterns
]
```

## Heuristic Bug Fixes

The system applies simple heuristic fixes for common errors:

### NameError
```python
# Error: NameError: name 'x' is not defined
# Fix: Add variable definition before the line
x = None  # Auto-fixed
```

### None Attribute Error
```python
# Error: AttributeError: 'NoneType' object has no attribute 'data'
# Fix: Add None check before accessing attribute
if obj is not None:
    obj.data  # Original line
```

## Testing

### Run Tests

```bash
# Run all deviation handling tests
pytest .blackbox5/tests/test_deviation_handling.py -v

# Run specific test class
pytest .blackbox5/tests/test_deviation_handling.py::TestDeviationDetection -v

# Run with coverage
pytest .blackbox5/tests/test_deviation_handling.py --cov=engine.core.deviation_handler
```

### Test Coverage

The test suite covers:
- Deviation type detection (10+ test cases)
- Fix suggestion generation (8+ test cases)
- Recovery strategies (6+ test cases)
- Attempt limiting (3+ test cases)
- Statistics and history (4+ test cases)
- Pattern matching (5+ test cases)
- Bug fix heuristics (2+ test cases)

## Integration with Existing Systems

### Event Bus Integration

```python
# Deviation recovery events are emitted via event bus
event_bus.publish("deviation.detected", {
    "deviation_type": "bug",
    "error_type": "NameError",
    "task_id": "dev_1",
    "suggested_fixes": ["Define variable: x"]
})
```

### Checkpoint Integration

```python
# Recovery attempts are included in workflow checkpoints
checkpoint = orchestrator.load_checkpoint(checkpoint_id)
# checkpoint.metadata may include recovery history
```

### Atomic Commits Integration

```python
# Bug fixes are automatically committed
# If a bug is fixed during recovery, the fix is committed atomically
```

## Advanced Usage

### Custom Recovery Strategies

```python
from engine.core.deviation_handler import DeviationHandler

class CustomDeviationHandler(DeviationHandler):
    async def _recover_bug(self, deviation, task, tools):
        # Custom bug recovery logic
        # For example, use LLM to generate fix
        fix = await self._generate_fix_with_llm(deviation)
        await self._apply_fix(fix)
        return True
```

### Custom Error Patterns

```python
handler = DeviationHandler()

# Add custom pattern for your specific errors
handler.bug_patterns.append(
    re.compile(r"MyCustomError", re.IGNORECASE)
)
```

### Monitoring and Alerts

```python
# Set up monitoring for recovery attempts
def monitor_recoveries(orchestrator):
    while True:
        stats = orchestrator.get_deviation_statistics()
        if stats['total_attempts'] > threshold:
            send_alert(f"High recovery attempts: {stats['total_attempts']}")
        await asyncio.sleep(60)
```

## Best Practices

1. **Enable in Production**: Use deviation handling in production for autonomous recovery
2. **Monitor Recovery Rate**: Track recovery attempts to identify systematic issues
3. **Adjust Limits**: Increase `max_recovery_attempts` for flaky external dependencies
4. **Log Suggestions**: Review suggested fixes to improve codebase quality
5. **Test Recovery**: Test recovery strategies in development environment
6. **Combine with Checkpoints**: Use checkpoints to resume after failures
7. **Review Statistics**: Regularly review deviation statistics to improve patterns

## Troubleshooting

### Recovery Not Working

**Problem**: Tasks fail but no recovery attempted

**Solutions**:
1. Check if `enable_deviation_handling=True`
2. Verify error matches a known pattern
3. Check recovery attempt limit not reached
4. Review logs for detection errors

### Infinite Recovery Loop

**Problem**: Task keeps retrying without success

**Solutions**:
1. Reduce `max_recovery_attempts`
2. Check if bug fix is actually fixing the issue
3. Verify error classification is correct
4. Add custom patterns for your errors

### Wrong Deviation Type

**Problem**: Error classified as wrong type

**Solutions**:
1. Review pattern matching order
2. Add custom patterns for your errors
3. Check pattern specificity (more specific first)
4. Use `detect_deviation` return value to debug

## Performance Considerations

- **Recovery Overhead**: Each recovery attempt adds ~100-500ms
- **File Operations**: Bug fixes involve file I/O (read + write)
- **Network Operations**: Dependency installs require network
- **Memory**: Recovery history grows with each attempt (consider clearing periodically)

## Future Enhancements

1. **LLM-Based Fixes**: Use language models to generate more sophisticated fixes
2. **Learning System**: Learn from successful fixes over time
3. **Multi-Agent Recovery**: Use multiple agents to collaborate on fixes
4. **Predictive Detection**: Anticipate errors before they occur
5. **Rollback Integration**: Automatic rollback if fix causes issues
6. **Custom Strategies**: Plugin system for domain-specific recovery strategies

## Related Documentation

- [GSD Framework Overview](./GSD-FRAMEWORK.md)
- [Orchestrator Documentation](./ORCHESTRATOR.md)
- [Atomic Commits](./ATOMIC-COMMITS.md)
- [Checkpoint System](./CHECKPOINTS.md)

## Support

For issues or questions:
1. Check test cases for examples
2. Review logs for detailed error information
3. Use `get_deviation_statistics()` for debugging
4. Run tests to verify installation

## License

Part of the BlackBox5 GSD Framework.

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Production Ready
