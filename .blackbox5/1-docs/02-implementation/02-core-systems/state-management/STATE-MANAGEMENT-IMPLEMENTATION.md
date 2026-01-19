# STATE.md Management System - Implementation Documentation

## Overview

The STATE.md Management System is Component 6 of the GSD (Goal-Driven Software Development) framework. It provides human-readable workflow progress tracking through an auto-generated markdown file called `STATE.md`.

## Purpose

- **Human-Readable Progress**: Easy-to-read summary of workflow status
- **Quick Resumption**: Parse STATE.md to resume workflows after interruption
- **Git Integration**: Track commit hashes for each wave
- **Visual Progress**: Progress bars and emoji-based task status
- **Team Collaboration**: Share workflow status with team members

## Architecture

### Core Components

#### 1. TaskState
Dataclass representing a single task's state:
- `task_id`: Unique identifier
- `description`: Human-readable task description
- `status`: pending, in_progress, completed, or failed
- `wave_id`: Which wave this task belongs to
- `files_modified`: List of files changed by this task
- `commit_hash`: Git commit hash if atomic commits enabled
- `error`: Error message if task failed

#### 2. WorkflowState
Dataclass representing the entire workflow state:
- `workflow_id`: Unique workflow identifier
- `workflow_name`: Human-readable workflow name
- `current_wave`: Current wave number
- `total_waves`: Total number of waves
- `tasks`: Dictionary of TaskState objects
- `started_at`: Workflow start timestamp
- `updated_at`: Last update timestamp
- `notes`: List of notes/observations
- `metadata`: Additional workflow metadata

#### 3. StateManager
Main class for managing STATE.md file:
- `initialize()`: Create new STATE.md with all tasks
- `update()`: Update STATE.md after wave completion
- `load_state()`: Parse existing STATE.md file
- `get_resume_info()`: Extract information for resuming workflow
- `add_note()`: Add note to existing state
- `clear()`: Remove STATE.md file

## STATE.md Format

```markdown
# Workflow: {name}

**Workflow ID:** `{workflow_id}`
**Status:** Wave {current}/{total}
**Started:** 2025-01-15 10:00:00
**Updated:** 2025-01-15 12:00:00

---

**Progress:** `████████░░░░░░░░░░░░` 40%

## ✅ Completed (3 tasks)
### Wave 1
- [x] **task1**: Setup project structure
  - Commit: `abc123`
  - Files: main.py, config.py

- [x] **task2**: Initialize database
  - Commit: `def456`

## 🔄 In Progress (2 tasks)
- [~] **task3**: Implement authentication
- [~] **task4**: Design user interface

## 📋 Pending (5 tasks)
### Wave 3
- [ ] **task5**: Write unit tests
- [ ] **task6**: Create documentation

### Wave 4
- [ ] **task7**: Performance optimization
- [ ] **task8**: Security audit

## Notes
- Database migration took longer than expected
- Need to review authentication approach before Wave 3

## Metadata
- **version:** 1.0
- **author:** development-team
```

## Integration with Orchestrator

The StateManager is integrated into `AgentOrchestrator`:

### Initialization

```python
orchestrator = AgentOrchestrator(
    enable_state_management=True  # Default: True
)
```

### Automatic Updates

The orchestrator automatically:

1. **Initializes STATE.md** when wave-based workflow starts
   - Extracts workflow name from task metadata
   - Lists all tasks organized by wave
   - Records start timestamp

2. **Updates STATE.md** after each wave completes
   - Marks wave tasks as completed/in-progress/failed
   - Adds commit hashes from atomic commits
   - Updates progress bar
   - Shows remaining tasks in pending waves

3. **Handles failures gracefully**
   - Logs warnings if STATE.md updates fail
   - Doesn't interrupt workflow if state management fails

### Manual Operations

```python
# Load existing state
state = orchestrator.state_manager.load_state()

# Get resume information
resume_info = orchestrator.state_manager.get_resume_info()
# Returns: {
#     'workflow_id': 'wf_abc123',
#     'current_wave': 2,
#     'resume_wave': 3,
#     'total_waves': 5,
#     'completed_tasks': ['task1', 'task2'],
#     'pending_tasks': ['task3', 'task4', 'task5'],
#     ...
# }

# Add a note
orchestrator.state_manager.add_note("Discovered performance issue")

# Clear state (e.g., after workflow completes)
orchestrator.state_manager.clear()
```

## Usage Examples

### Example 1: Basic Workflow

```python
from engine.core.Orchestrator import AgentOrchestrator, WorkflowStep

# Create orchestrator with state management
orchestrator = AgentOrchestrator(
    memory_base_path=Path(".blackbox5/agent_memory"),
    enable_state_management=True
)

# Define workflow with dependencies
tasks = [
    WorkflowStep(
        agent_type="developer",
        task="Setup project structure",
        agent_id="setup"
    ),
    WorkflowStep(
        agent_type="developer",
        task="Implement feature A",
        agent_id="feature_a",
        depends_on=["setup"]
    ),
    WorkflowStep(
        agent_type="tester",
        task="Test feature A",
        agent_id="test_a",
        depends_on=["feature_a"]
    ),
]

# Execute workflow (STATE.md auto-updated)
result = await orchestrator.execute_wave_based(tasks)

# STATE.md now contains:
# - Wave 1: setup (completed)
# - Wave 2: feature_a (completed)
# - Wave 3: test_a (completed)
```

### Example 2: Resume Interrupted Workflow

```python
# Load existing state
state_manager = StateManager(Path(".blackbox5/agent_memory/STATE.md"))
state = state_manager.load_state()

if state and state.current_wave < state.total_waves:
    resume_info = state_manager.get_resume_info()

    print(f"Resuming from wave {resume_info['resume_wave']}")
    print(f"Completed: {len(resume_info['completed_tasks'])} tasks")
    print(f"Pending: {len(resume_info['pending_tasks'])} tasks")

    # Create tasks for remaining waves
    remaining_tasks = create_tasks_from_state(resume_info)

    # Resume execution
    result = await orchestrator.execute_wave_based(remaining_tasks)
```

### Example 3: Custom Workflow Name

```python
tasks = [
    WorkflowStep(
        agent_type="developer",
        task="Build API",
        metadata={"name": "E-Commerce API Development"}  # Workflow name
    ),
    # ... more tasks
]

result = await orchestrator.execute_wave_based(tasks)

# STATE.md header: "# Workflow: E-Commerce API Development"
```

## Parsing STATE.md

The `parse_state()` method robustly parses STATE.md files:

```python
state_manager = StateManager()
state = state_manager.parse_state(state_md_content)

print(f"Workflow: {state.workflow_name}")
print(f"Progress: Wave {state.current_wave}/{state.total_waves}")
print(f"Tasks: {len(state.tasks)} total")

# Access individual tasks
for task_id, task in state.tasks.items():
    if task.status == 'completed':
        print(f"✓ {task.description}")
        if task.commit_hash:
            print(f"  Commit: {task.commit_hash}")
    elif task.status == 'failed':
        print(f"✗ {task.description}")
        print(f"  Error: {task.error}")
```

## Error Handling

The StateManager handles various error conditions:

### Missing STATE.md
```python
state = state_manager.load_state()
# Returns None if file doesn't exist
```

### Malformed STATE.md
```python
state = state_manager.parse_state(invalid_content)
# Returns WorkflowState with safe defaults
# Logs error with details
```

### Update Failures
```python
# Orchestrator logs warnings but continues workflow
# State manager failures don't interrupt execution
```

## Testing

Comprehensive test suite in `tests/test_state_manager.py`:

### Test Categories

1. **TaskState Tests**
   - Task creation and field validation
   - Markdown conversion for different statuses
   - Files, commit, and error handling

2. **WorkflowState Tests**
   - State creation and organization
   - Markdown formatting with progress bars
   - Task grouping by status and wave

3. **StateManager Tests**
   - File initialization and updates
   - State loading and parsing
   - Resume information extraction
   - Note adding and state clearing

4. **Integration Tests**
   - Orchestrator integration
   - Wave completion updates
   - Commit hash integration
   - Error recovery

5. **Edge Cases**
   - Empty task lists
   - No pending waves
   - Various description field formats
   - Unicode characters
   - Long description truncation

### Running Tests

```bash
# Run all tests
pytest .blackbox5/tests/test_state_manager.py -v

# Run specific test class
pytest .blackbox5/tests/test_state_manager.py::TestStateManager -v

# Run with coverage
pytest .blackbox5/tests/test_state_manager.py --cov=.blackbox5/engine/core/state_manager
```

## File Locations

```
.blackbox5/
├── engine/
│   └── core/
│       ├── state_manager.py       # StateManager implementation
│       └── Orchestrator.py        # Orchestrator with state integration
├── tests/
│   └── test_state_manager.py      # Comprehensive test suite
├── docs/
│   └── STATE-MANAGEMENT-IMPLEMENTATION.md  # This file
└── agent_memory/
    └── STATE.md                   # Auto-generated workflow state
```

## Benefits

### For Developers
- **Quick Status Check**: See workflow progress at a glance
- **Easy Debugging**: Identify which tasks failed and why
- **Resume Support**: Quickly resume interrupted workflows
- **Commit Tracking**: See git commits for each wave

### For Teams
- **Progress Visibility**: Share workflow status with team
- **Handoff Support**: Clear status for developer handoffs
- **Documentation**: Automatic workflow documentation
- **Meeting Prep**: Quick status for standups

### For Automation
- **Parseable Format**: Easy to parse for monitoring tools
- **Git Tracked**: STATE.md can be committed to repository
- **CI/CD Integration**: Read STATE.md in CI pipelines
- **Status APIs**: Build status APIs from STATE.md

## Advanced Features

### Custom Metadata

```python
orchestrator.state_manager.update(
    workflow_id="wf1",
    workflow_name="Custom Workflow",
    wave_id=1,
    total_waves=3,
    completed_tasks=[...],
    current_wave_tasks=[...],
    pending_waves=[...],
    metadata={
        "version": "2.0",
        "priority": "high",
        "sprint": "Sprint 23",
        "team": "backend"
    }
)
```

### Notes and Observations

```python
# Add notes during execution
orchestrator.state_manager.add_note("Database migration completed successfully")
orchestrator.state_manager.add_note("Performance issue detected in Wave 2")

# Notes appear in STATE.md under ## Notes section
```

### Atomic Commits Integration

When atomic commits are enabled, STATE.md automatically includes:
- Commit hashes for each completed wave
- Files modified by each task
- Links to git history

```python
orchestrator = AgentOrchestrator(
    enable_atomic_commits=True,
    enable_state_management=True
)

# STATE.md will include:
# - [x] **task1**: Setup
#   - Commit: `abc123`
#   - Files: setup.py, config.json
```

## Best Practices

1. **Commit STATE.md**: Add STATE.md to git for workflow history
2. **Regular Updates**: STATE.md updates after every wave
3. **Parse Safely**: Always handle None from `load_state()`
4. **Clear on Complete**: Clear STATE.md after successful completion
5. **Add Notes**: Document important observations during execution
6. **Review Failed**: Check STATE.md after workflow failures

## Future Enhancements

Potential improvements for future versions:

1. **HTML Generation**: Convert STATE.md to HTML for web viewing
2. **Status Badges**: Generate status badges for README files
3. **Metrics Export**: Export progress metrics to monitoring tools
4. **Interactive Dashboard**: Web dashboard for workflow status
5. **Notification Integration**: Send notifications on state changes
6. **Diff Visualization**: Show changes between STATE.md versions

## Troubleshooting

### STATE.md Not Created
- Check `enable_state_management=True` in Orchestrator
- Verify memory_base_path directory exists
- Check file permissions

### STATE.md Not Updated
- Look for warning logs in orchestrator output
- Verify state_manager initialized successfully
- Check for exceptions in update logic

### Parse Errors
- Ensure STATE.md follows expected format
- Check for encoding issues (UTF-8)
- Verify markdown syntax is valid

### Resume Issues
- Check workflow_id matches
- Verify wave numbers align
- Ensure task IDs are consistent

## Summary

The STATE.md Management System provides:

✓ **Human-readable** workflow progress tracking
✓ **Automatic updates** after each wave
✓ **Easy resumption** of interrupted workflows
✓ **Git integration** with commit hashes
✓ **Comprehensive testing** for reliability
✓ **Orchestrator integration** for seamless operation

This completes Component 6 of the GSD framework, enabling teams to track, share, and resume complex multi-agent workflows with ease.
