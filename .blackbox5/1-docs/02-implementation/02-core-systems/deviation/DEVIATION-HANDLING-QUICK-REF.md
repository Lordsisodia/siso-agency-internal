# Deviation Handling Quick Reference

## TL;DR

Autonomous error recovery for BlackBox5 using 4 rules:
1. **Bug Fix**: Fix code errors automatically
2. **Missing Dependency**: Install packages automatically
3. **Task Blockage**: Detect and suggest fixes for external issues
4. **Critical Missing**: Detect and report missing required fields

## Quick Start

```python
# 1. Enable deviation handling
orchestrator = create_orchestrator(
    max_recovery_attempts=3,
    enable_deviation_handling=True
)

# 2. Execute workflow (automatic recovery happens)
result = await orchestrator.execute_wave_based(workflow)

# 3. Check recovery statistics
stats = orchestrator.get_deviation_statistics()
print(f"Recovery attempts: {stats['total_attempts']}")
```

## The 4 Rules in One Glance

| Rule | Detects | Recovers |
|------|---------|----------|
| Bug Fix | AssertionError, NameError, TypeError, etc. | Edits code files with fixes |
| Missing Dependency | ImportError, ModuleNotFoundError | Runs `pip install` |
| Task Blockage | Timeout, Connection errors | Logs suggestions for retry |
| Critical Missing | ValidationError, missing fields | Logs suggestions for addition |

## Common Error Patterns

```python
# Bug errors → Automatic fix
NameError: name 'x' is not defined
AttributeError: 'NoneType' object has no attribute 'data'
TypeError: 'str' object is not callable

# Dependency errors → Automatic install
ModuleNotFoundError: No module named 'requests'
ImportError: cannot import name 'xyz' from 'module'

# Blockage errors → Suggestions logged
TimeoutError: Connection timeout
ConnectionRefusedError: Connection refused
HTTP 500 Internal Server Error

# Critical errors → Suggestions logged
ValueError: required field 'user_id' is missing
KeyError: 'required_field'
```

## Configuration

```python
# Orchestrator config
orchestrator = AgentOrchestrator(
    # ... other configs ...
    max_recovery_attempts=3,        # Max attempts per task
    enable_deviation_handling=True  # Enable/disable
)

# Direct handler config
from engine.core.deviation_handler import DeviationHandler
handler = DeviationHandler(max_recovery_attempts=3)
```

## Key Methods

### Orchestrator Methods

```python
# Execute with automatic recovery
result = await orchestrator.execute_wave_based(workflow)
result = await orchestrator.parallel_execute(tasks)

# Get recovery statistics
stats = orchestrator.get_deviation_statistics()
# Returns: {
#   'total_attempts': 10,
#   'by_type': {
#     'bug': 5,
#     'missing_dep': 3,
#     'blockage': 2,
#     'critical_missing': 0
#   },
#   'max_attempts_per_type': 3
# }

# Get recent recoveries
recent = orchestrator.get_recent_recoveries(limit=10)
# Returns: [
#   {
#     'timestamp': '2025-01-19T10:30:00',
#     'deviation_type': 'bug',
#     'error_message': 'NameError: ...',
#     'task_id': 'dev_1'
#   },
#   ...
# ]

# Full statistics
stats = orchestrator.get_statistics()
# Includes deviation_handling section
```

### DeviationHandler Methods

```python
from engine.core.deviation_handler import DeviationHandler

handler = DeviationHandler(max_recovery_attempts=3)

# Detect deviation from error
deviation = handler.detect_deviation(error, task_context)
# Returns: Deviation object or None

# Attempt recovery
success = await handler.recover_from_deviation(deviation, task, tools)
# Returns: bool

# Get statistics
stats = handler.get_recovery_statistics()

# Get recent recoveries
recent = handler.get_recent_recoveries(limit=10)

# Clear history
handler.clear_recovery_history()
```

## Deviation Object

```python
@dataclass
class Deviation:
    deviation_type: DeviationType      # BUG, MISSING_DEPENDENCY, etc.
    error_message: str                 # Full error message
    error_type: str                    # Exception class name
    context: Dict[str, Any]            # Task context
    suggested_fixes: List[str]         # List of fix suggestions
    timestamp: datetime                # When detected

    def to_dict(self) -> Dict[str, Any]:
        # Serialize to dictionary
```

## Recovery Flow

```
Task Execution
    │
    ├─→ Success → Return Result
    │
    └─→ Exception
          │
          ├─→ Detect Deviation Type
          │     │
          │     ├─→ Bug → Fix Code → Retry
          │     ├─→ Missing Dep → Install → Retry
          │     ├─→ Blockage → Log Suggestion → Return Error
          │     └─→ Critical → Log Suggestion → Return Error
          │
          ├─→ Recovery Successful → Retry Task
          │
          └─→ Recovery Failed → Return Error
```

## Testing

```bash
# Run tests
pytest .blackbox5/tests/test_deviation_handling.py -v

# Run specific test
pytest .blackbox5/tests/test_deviation_handling.py::TestDeviationDetection -v

# With coverage
pytest .blackbox5/tests/test_deviation_handling.py --cov=engine.core.deviation_handler
```

## Common Use Cases

### Use Case 1: Development Workflow

```python
# Developer runs workflow
orchestrator = create_orchestrator(enable_deviation_handling=True)

# Missing dependency detected and installed automatically
workflow = [{"agent_type": "developer", "task": "Import pandas and analyze data"}]
result = await orchestrator.execute_wave_based(workflow)
# Automatically runs: pip install pandas
```

### Use Case 2: CI/CD Pipeline

```python
# CI/CD with automatic recovery
orchestrator = create_orchestrator(max_recovery_attempts=2)

# Test failures trigger automatic fixes
workflow = [
    {"agent_type": "developer", "task": "Implement feature"},
    {"agent_type": "tester", "task": "Run tests"}
]
result = await orchestrator.execute_wave_based(workflow)

# Check if recovery happened
stats = orchestrator.get_deviation_statistics()
if stats['total_attempts'] > 0:
    print(f"Recovered from {stats['total_attempts']} errors automatically")
```

### Use Case 3: Monitoring

```python
# Monitor recovery attempts in production
orchestrator = create_orchestrator(enable_deviation_handling=True)

# Execute workflow
result = await orchestrator.execute_wave_based(workflow)

# Alert on high recovery rate
stats = orchestrator.get_deviation_statistics()
if stats['by_type']['bug'] > 5:
    send_alert(f"High bug recovery rate: {stats['by_type']['bug']} attempts")
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No recovery happening | Check `enable_deviation_handling=True` |
| Infinite retries | Reduce `max_recovery_attempts` |
| Wrong deviation type | Add custom patterns |
| Fix not applied | Check file permissions |

## Performance Tips

1. **Limit Attempts**: Use `max_recovery_attempts=2` for faster failure
2. **Monitor History**: Clear history periodically with `clear_recovery_history()`
3. **Pattern Order**: More specific patterns first for accurate detection
4. **Async Operations**: Recovery strategies are async for non-blocking execution

## Best Practices

✅ **DO**:
- Enable in production for autonomous recovery
- Monitor recovery statistics regularly
- Review suggested fixes to improve code
- Use with checkpoints for crash recovery
- Test recovery strategies in dev

❌ **DON'T**:
- Set `max_recovery_attempts` too high (causes loops)
- Ignore recovery statistics
- Rely solely on autonomous recovery
- Use with untrusted code (security risk)
- Disable without monitoring

## File Locations

```
.blackbox5/
├── engine/
│   └── core/
│       ├── deviation_handler.py          # Main implementation
│       └── orchestrator_deviation_integration.py  # Integration code
├── tests/
│   └── test_deviation_handling.py        # Test suite
└── docs/
    ├── DEVIATION-HANDLING-IMPLEMENTATION.md  # Full documentation
    └── DEVIATION-HANDLING-QUICK-REF.md        # This file
```

## Quick API Reference

### Classes

- `DeviationType` - Enum of deviation types
- `Deviation` - Dataclass for detected deviations
- `DeviationHandler` - Main detection and recovery class

### Functions

- `create_orchestrator()` - Create orchestrator with deviation handling

### Methods

- `detect_deviation(error, context)` - Detect deviation from exception
- `recover_from_deviation(deviation, task, tools)` - Attempt recovery
- `get_recovery_statistics()` - Get recovery stats
- `get_recent_recoveries(limit)` - Get recent attempts
- `clear_recovery_history()` - Clear history

## See Also

- [Full Implementation Guide](./DEVIATION-HANDLING-IMPLEMENTATION.md)
- [GSD Framework](./GSD-FRAMEWORK.md)
- [Orchestrator Docs](./ORCHESTRATOR.md)

---

**Version**: 1.0.0 | **Last Updated**: 2025-01-19
