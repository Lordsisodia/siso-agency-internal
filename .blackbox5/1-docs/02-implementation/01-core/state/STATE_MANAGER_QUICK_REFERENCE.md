# STATE.md Management System - Quick Reference

## Import and Initialize

```python
from .state_manager import StateManager
from pathlib import Path

# Create manager (default path: ./STATE.md)
manager = StateManager()
# OR specify custom path
manager = StateManager(state_path=Path("path/to/STATE.md"))
```

## Basic Operations

### Initialize Workflow

```python
manager.initialize(
    workflow_id="wf_001",
    workflow_name="My Workflow",
    total_waves=3,
    all_waves=[
        [{"task_id": "task_1", "description": "First"}],
        [{"task_id": "task_2", "description": "Second"}],
        [{"task_id": "task_3", "description": "Third"}]
    ]
)
```

### Update Progress

```python
manager.update(
    workflow_id="wf_001",
    workflow_name="My Workflow",
    wave_id=1,  # Current wave (1-indexed)
    total_waves=3,
    completed_tasks=[
        {
            "task_id": "task_1",
            "description": "First",
            "wave_id": 1,
            "result": {"success": True, "files_modified": ["file.py"]},
            "commit_hash": "abc123"
        }
    ],
    current_wave_tasks=[],
    pending_waves=[[...], [...]],  # Remaining waves
    commit_hash="abc123",  # Optional
    notes=["Note 1", "Note 2"],  # Optional
    metadata={"key": "value"}  # Optional
)
```

### Load State

```python
state = manager.load_state()
if state:
    print(f"Workflow: {state.workflow_name}")
    print(f"Wave: {state.current_wave}/{state.total_waves}")
    print(f"Tasks: {len(state.tasks)}")
```

### Resume Workflow

```python
resume_info = manager.get_resume_info()
if resume_info:
    wave_to_resume = resume_info['resume_wave']
    completed = resume_info['completed_tasks']
    pending = resume_info['pending_tasks']
```

### Add Note

```python
manager.add_note("Important observation")
```

### Clear State

```python
manager.clear()
```

## Orchestrator Integration

```python
from .orchestrator import AgentOrchestrator

orchestrator = AgentOrchestrator(
    event_bus=event_bus,
    task_router=task_router,
    enable_state_management=True  # Enable STATE.md
)

# STATE.md automatically updated during workflow execution
result = await orchestrator.execute_wave_workflow(
    workflow_id="wf_001",
    workflow_name="My Workflow",
    waves=[...]
)
```

## STATE.md Format

```markdown
# Workflow: My Workflow

**Workflow ID:** `wf_001`
**Status:** Wave 1/3
**Started:** 2025-01-15 10:00:00
**Updated:** 2025-01-15 11:00:00

---

**Progress:** `██████░░░░░░░░░░░░░░` 33%

## ✅ Completed (1 tasks)

- [x] **task_1**: First task
  - Commit: `abc123`
  - Files: file.py

## 🔄 In Progress (1 tasks)

- [~] **task_2**: Second task

## 📋 Pending (1 tasks)

### Wave 3
- [ ] **task_3**: Third task

## Notes
- Important note
```

## Task Status Values

- `"pending"`: Task not started
- `"in_progress"`: Task currently running
- `"completed"`: Task finished successfully
- `"failed"`: Task failed with error

## Key Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `initialize()` | Create new STATE.md | None |
| `update()` | Update workflow progress | None |
| `load_state()` | Load from file | WorkflowState or None |
| `parse_state()` | Parse markdown content | WorkflowState or None |
| `get_resume_info()` | Get resumption data | Dict or None |
| `add_note()` | Add note to state | None |
| `clear()` | Remove STATE.md | None |

## Common Patterns

### Pattern 1: Long-Running Workflow

```python
# Start
manager.initialize(workflow_id, name, total_waves, all_waves)

# After each wave
manager.update(
    workflow_id, name, wave_id, total_waves,
    completed_tasks, current_wave_tasks, pending_waves
)
```

### Pattern 2: Resume After Crash

```python
state = manager.load_state()
if state:
    resume_info = manager.get_resume_info()
    wave = resume_info['resume_wave']
    # Continue from wave
else:
    # Start new workflow
```

### Pattern 3: Track Failures

```python
manager.update(
    ...,
    current_wave_tasks=[
        {
            "task_id": "task_1",
            "description": "Failed task",
            "result": {"success": False, "error": "Error message"}
        }
    ],
    ...
)
```

### Pattern 4: Add Context

```python
manager.update(
    ...,
    notes=["Decision made", "Validated with team"],
    metadata={"project": "X", "version": "1.0"}
)
```

## Testing

```bash
# Run all tests
pytest .blackbox5/engine/core/test_state_manager.py -v

# Run specific test
pytest .blackbox5/engine/core/test_state_manager.py::TestStateManager::test_initialize_workflow -v

# Run demo
python .blackbox5/engine/core/state_manager_demo.py
```

## File Locations

- **Implementation**: `.blackbox5/engine/core/state_manager.py`
- **Tests**: `.blackbox5/engine/core/test_state_manager.py`
- **Demo**: `.blackbox5/engine/core/state_manager_demo.py`
- **Docs**: `.blackbox5/engine/core/STATE_MANAGER_README.md`

## Quick Tips

1. **Always initialize** before updating
2. **Use commit hashes** for traceability
3. **Add notes** for important decisions
4. **Check for existing state** before starting
5. **Commit STATE.md** to git for tracking
6. **Handle failed tasks** with error messages
7. **Use metadata** for project context

## Troubleshooting

**Problem**: STATE.md not updating
- **Solution**: Check `enable_state_management=True` in Orchestrator

**Problem**: Parse errors
- **Solution**: Ensure STATE.md format is valid markdown

**Problem**: Lost progress
- **Solution**: Always call `update()` after wave completion

**Problem**: Resume not working
- **Solution**: Check `get_resume_info()` returns valid data

## Best Practices

1. ✅ Initialize workflow at start
2. ✅ Update after each wave
3. ✅ Include commit hashes
4. ✅ Add notes for decisions
5. ✅ Track files modified
6. ✅ Handle failures gracefully
7. ✅ Commit STATE.md to git
8. ✅ Clear after completion

## Status Indicators

- ✅ Completed
- 🔄 In Progress
- 📋 Pending
- ❌ Failed

## Progress Bar

```
0%   ░░░░░░░░░░░░░░░░░░░░
25%  █████░░░░░░░░░░░░░░░
50%  ██████████░░░░░░░░░
75%  ███████████████░░░░░
100% █████████████████████
```

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Production Ready ✅
