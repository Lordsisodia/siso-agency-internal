# STATE.md Management System

A human-readable workflow progress tracking system for BlackBox5.

## Overview

The STATE.md Management System creates and maintains a markdown file (`STATE.md`) that tracks workflow progress in a format that is:
- **Human-readable**: Easy to understand at a glance
- **Git-friendly**: Can be committed and version controlled
- **Resumable**: Allows workflows to resume after interruptions
- **Informative**: Shows completed, in-progress, and pending tasks

## Features

- **Workflow Initialization**: Create new workflows with task breakdown
- **Progress Tracking**: Update state as tasks complete
- **Wave-based Organization**: Group tasks into waves/phases
- **Commit Integration**: Track git commit hashes for completed tasks
- **Notes & Metadata**: Add contextual information
- **Resumption**: Resume interrupted workflows from where they left off
- **Atomic Writes**: Safe file updates with no corruption risk

## Quick Start

```python
from pathlib import Path
from .state_manager import StateManager

# Create a state manager
state_manager = StateManager(state_path=Path("STATE.md"))

# Initialize a new workflow
waves = [
    [
        {"task_id": "planner", "description": "Create plan"},
        {"task_id": "researcher", "description": "Research requirements"}
    ],
    [
        {"task_id": "developer", "description": "Implement feature"}
    ]
]

state_manager.initialize(
    workflow_id="wf_001",
    workflow_name="Feature Development",
    total_waves=len(waves),
    all_waves=waves
)

# Update after completing wave 1
state_manager.update(
    workflow_id="wf_001",
    workflow_name="Feature Development",
    wave_id=1,
    total_waves=2,
    completed_tasks=[
        {
            "task_id": "planner",
            "description": "Create plan",
            "wave_id": 1,
            "result": {"success": True, "files_modified": ["PLAN.md"]},
            "commit_hash": "abc123"
        }
    ],
    current_wave_tasks=[],
    pending_waves=waves[1:]
)
```

## STATE.md Format

The generated STATE.md file looks like:

```markdown
# Workflow: Feature Development

**Workflow ID:** `wf_001`
**Status:** Wave 1/2
**Started:** 2025-01-15 10:00:00
**Updated:** 2025-01-15 11:00:00

---

**Progress:** `████████░░░░░░░░░░░░` 50%

## ✅ Completed (1 tasks)

### Wave 1
- [x] **planner**: Create plan
  - Commit: `abc123`
  - Files: PLAN.md

## 🔄 In Progress (1 tasks)

- [~] **researcher**: Research requirements

## 📋 Pending (1 tasks)

### Wave 2
- [ ] **developer**: Implement feature

## Notes
- All planning tasks completed successfully
- Requirements validated with stakeholders
```

## API Reference

### StateManager Class

#### `__init__(state_path: Optional[Path] = None)`

Initialize the state manager.

- **state_path**: Path to STATE.md file (default: `./STATE.md`)

#### `initialize(workflow_id, workflow_name, total_waves, all_waves, metadata=None)`

Initialize a new STATE.md file for a workflow.

- **workflow_id**: Unique workflow identifier
- **workflow_name**: Human-readable workflow name
- **total_waves**: Total number of waves
- **all_waves**: List of waves, each containing task definitions
- **metadata**: Optional metadata dictionary

#### `update(workflow_id, workflow_name, wave_id, total_waves, completed_tasks, current_wave_tasks, pending_waves, commit_hash=None, notes=None, metadata=None)`

Update STATE.md with current workflow status.

- **workflow_id**: Workflow identifier
- **workflow_name**: Human-readable workflow name
- **wave_id**: Current wave number (1-indexed)
- **total_waves**: Total number of waves
- **completed_tasks**: Tasks from completed waves
- **current_wave_tasks**: Tasks in current wave
- **pending_waves**: Tasks in pending waves
- **commit_hash**: Optional git commit hash for current wave
- **notes**: Optional notes to add
- **metadata**: Optional metadata to include

#### `load_state() -> Optional[WorkflowState]`

Load workflow state from STATE.md.

Returns `WorkflowState` if file exists, `None` otherwise.

#### `parse_state(content: str) -> Optional[WorkflowState]`

Parse STATE.md content and return WorkflowState.

- **content**: STATE.md file content

#### `get_resume_info() -> Optional[Dict[str, Any]]`

Get information needed to resume a workflow.

Returns dictionary with:
- `workflow_id`: Workflow identifier
- `workflow_name`: Workflow name
- `current_wave`: Current wave number
- `resume_wave`: Wave to resume from
- `total_waves`: Total number of waves
- `completed_tasks`: List of completed task IDs
- `failed_tasks`: List of failed task IDs
- `pending_tasks`: List of pending task IDs

#### `add_note(note: str)`

Add a note to the current state.

- **note**: Note text to add

#### `clear()`

Clear the STATE.md file.

### Data Classes

#### `TaskState`

State of a single task.

- **task_id** (str): Task identifier
- **description** (str): Task description
- **status** (str): One of "pending", "in_progress", "completed", "failed"
- **wave_id** (int): Wave number
- **files_modified** (List[str]): Files modified by this task
- **commit_hash** (Optional[str]): Git commit hash
- **error** (Optional[str]): Error message if failed

#### `WorkflowState`

Complete workflow state from STATE.md.

- **workflow_id** (str): Workflow identifier
- **workflow_name** (str): Workflow name
- **current_wave** (int): Current wave number
- **total_waves** (int): Total number of waves
- **tasks** (Dict[str, TaskState]): All tasks
- **started_at** (datetime): Workflow start time
- **updated_at** (datetime): Last update time
- **notes** (List[str]): Workflow notes
- **metadata** (Dict[str, Any]): Additional metadata

## Integration with Orchestrator

The `StateManager` is integrated with `AgentOrchestrator` for automatic STATE.md updates:

```python
orchestrator = AgentOrchestrator(
    event_bus=event_bus,
    task_router=task_router,
    enable_state_management=True  # Enable STATE.md updates
)

# STATE.md is automatically updated as waves complete
result = await orchestrator.execute_wave_workflow(
    workflow_id="wf_001",
    workflow_name="My Workflow",
    waves=waves
)
```

The orchestrator:
1. Initializes STATE.md when workflow starts
2. Updates after each wave completes
3. Includes commit hashes from atomic commits
4. Tracks failed and completed tasks
5. Maintains notes and metadata

## Use Cases

### 1. Progress Tracking

Track multi-step workflows with clear visual progress:

```python
# Create long-running workflow
manager.initialize(
    workflow_id="migration_001",
    workflow_name="Database Migration",
    total_waves=5,
    all_waves=migration_waves
)

# Update as each phase completes
manager.update(...)
```

### 2. Workflow Resumption

Resume interrupted workflows without losing progress:

```python
# Load existing state
state = manager.load_state()

# Get resume information
resume_info = manager.get_resume_info()
if resume_info:
    wave_to_resume = resume_info['resume_wave']
    # Resume from that wave
```

### 3. Team Collaboration

Share progress with team through version control:

```bash
# Commit STATE.md to track progress
git add STATE.md
git commit -m "Progress: Wave 2/5 completed"
```

### 4. Audit Trail

Maintain history of workflow execution:

```python
# Add notes for important events
manager.add_note("Validated with stakeholders")
manager.add_note("Performance benchmarks met")
```

## Best Practices

1. **Initialize Early**: Create STATE.md at workflow start
2. **Update Frequently**: Update after each wave/phase
3. **Add Context**: Use notes to document decisions
4. **Include Metadata**: Track project info in metadata
5. **Version Control**: Commit STATE.md to git
6. **Handle Failures**: Track failed tasks for retry
7. **Clear When Done**: Remove STATE.md after workflow completion

## Testing

Comprehensive tests are available in `test_state_manager.py`:

```bash
# Run all tests
pytest .blackbox5/engine/core/test_state_manager.py -v

# Run specific test class
pytest .blackbox5/engine/core/test_state_manager.py::TestStateManager -v

# Run integration tests
pytest .blackbox5/engine/core/test_state_manager.py::TestIntegrationScenarios -v
```

Test coverage:
- ✅ TaskState creation and markdown conversion
- ✅ WorkflowState creation and rendering
- ✅ StateManager initialization
- ✅ Workflow updates
- ✅ State parsing and loading
- ✅ Resume information extraction
- ✅ Note management
- ✅ Failed task handling
- ✅ Full workflow lifecycle
- ✅ Workflow resumption

## Demo

Run the demo script to see STATE.md in action:

```bash
python .blackbox5/engine/core/state_manager_demo.py
```

The demo shows:
- Basic workflow creation
- Wave-by-wave progress updates
- Workflow resumption after interruption
- Handling failed tasks
- Manual state operations

## Examples

See `state_manager_demo.py` for complete examples of:
- Creating workflows with multiple waves
- Updating progress through workflow lifecycle
- Resuming interrupted workflows
- Handling task failures
- Managing notes and metadata

## Architecture

```
StateManager
    ├── TaskState (dataclass)
    │   └── to_markdown() → markdown string
    ├── WorkflowState (dataclass)
    │   └── to_markdown() → STATE.md content
    └── StateManager (class)
        ├── initialize() → Create STATE.md
        ├── update() → Update STATE.md
        ├── load_state() → Load from file
        ├── parse_state() → Parse content
        ├── get_resume_info() → Extract resume data
        ├── add_note() → Add note
        └── clear() → Remove file
```

## Error Handling

The system handles various error conditions:

- **Missing STATE.md**: Returns `None` from `load_state()`
- **Parse Errors**: Returns `None` from `parse_state()`
- **File Write Errors**: Uses atomic writes with temp files
- **Invalid Data**: Gracefully handles missing fields

## Performance

- **Atomic Writes**: No file corruption risk
- **Incremental Updates**: Only rewrites changed content
- **Efficient Parsing**: Fast state loading
- **Minimal Memory**: Small footprint for large workflows

## Future Enhancements

Potential improvements:
- [ ] Support for custom templates
- [ ] Multiple STATE.md files per project
- [ ] HTML/PDF export
- [ ] Integration with issue trackers
- [ ] Progress analytics and metrics
- [ ] Web-based UI for viewing state

## Contributing

When contributing to the STATE.md system:

1. Add tests for new features
2. Update documentation
3. Follow existing code style
4. Ensure backward compatibility
5. Test with real workflows

## License

Part of the BlackBox5 Engine.

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
**Status**: Production Ready
