# Blackbox4 Observability Layer

Comprehensive logging, manifest management, goal tracking, and dashboard integration for the Native TUI system.

## Overview

The Observability Layer provides full integration with Blackbox4's existing logging, manifest, and dashboard systems. It enables:

- **Session Lifecycle Logging**: Track TUI sessions from start to finish
- **Manifest Integration**: Automatic execution tracking via ManifestManager
- **Goal Tracking**: Progress monitoring via GoalTracker
- **Artifact Storage**: Persistent storage of execution artifacts
- **Dashboard Integration**: Real-time WebSocket updates (optional)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TUILogger                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Management                                  │  │
│  │  - log_session_start(prd)                            │  │
│  │  - log_iteration(iteration, task, result)            │  │
│  │  - log_session_end(summary)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ├─────────────────┬──────────────┤  │
│                          ▼                 ▼              ▼  │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ ManifestManager  │ │ GoalTracker  │ │ArtifactManager│   │
│  └──────────────────┘ └──────────────┘ └──────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              DashboardClient (Optional)               │  │
│  │  - WebSocket events to dashboard                      │  │
│  │  - Real-time updates                                  │  │
│  │  - Graceful degradation if unavailable                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### TUILogger

Main logger class that orchestrates all observability features.

```python
from core.observability import TUILogger

logger = TUILogger(
    session_id="my-session-001",
    blackbox_root=Path("/path/to/blackbox")
)

# Log session start
prd = {
    "goal": "Build user authentication system",
    "sub_goals": ["Design schema", "Implement backend", "Create UI"],
    "tasks": ["Task 1", "Task 2", "Task 3"]
}
logger.log_session_start(prd)

# Log iterations
for i in range(1, 4):
    task = {"id": f"task-{i}", "description": f"Task {i}"}
    result = ExecutionResult(
        success=True,
        status="complete",
        duration_ms=1000,
        tokens_used=1500,
        cost_usd=0.015
    )
    logger.log_iteration(i, task, result)

# Log session end
summary = logger.log_session_end({
    "success_rate": 1.0,
    "goal_achieved": True,
    "final_goal_progress": 1.0
})
```

### ExecutionResult

Dataclass for execution results.

```python
from core.observability import ExecutionResult

result = ExecutionResult(
    success=True,                    # Execution succeeded
    status="complete",               # Status string
    duration_ms=1500,                # Duration in milliseconds
    tokens_used=2000,                # Total tokens
    cost_usd=0.02,                   # Estimated cost
    output="Task completed",         # Output message
    error=None,                      # Error if failed
    metadata={                       # Additional metadata
        "input_tokens": 800,
        "output_tokens": 1200,
        "model": "claude-3-opus"
    }
)
```

### DashboardClient

WebSocket client for real-time dashboard updates (optional).

```python
from core.observability import DashboardClient

dashboard = DashboardClient(ws_url="ws://localhost:8000")

# Emit events
dashboard.emit_session_start(session_id, prd)
dashboard.emit_iteration_complete(iteration, task, result)
dashboard.emit_session_end(summary)

# Check availability
if dashboard.is_available():
    print("Dashboard integration available")

if dashboard.is_connected():
    print("Connected to dashboard")
```

## Artifact Storage

Artifacts are stored in `.blackbox4/artifacts/{session_id}/`:

```
.blackbox4/artifacts/
└── {session_id}/
    ├── manifest.json          # Full execution manifest
    ├── progress.json          # Current progress state
    ├── summary.json           # Session summary
    ├── tasks/                 # Task artifacts
    │   ├── {task_id}-context.json
    │   └── {task_id}-result.json
    └── iterations/            # Iteration artifacts
        └── {iteration:04d}/
            ├── prompt.txt
            ├── response.txt
            └── metadata.json
```

## Manifest Integration

The TUILogger automatically creates and updates a RunManifest via ManifestManager:

- **Session Start**: Creates manifest with session info
- **Iterations**: Logs each step with tokens, duration, status
- **Session End**: Finalizes manifest with validation results

Manifest includes:
- Run metadata (agent, phase, model profile)
- Timestamps (start, end, duration)
- Input/output files
- Execution steps
- Metrics (tokens, cost, operations)
- Validation results
- Environment information

## Goal Tracking

Integrated with GoalTracker for progress monitoring:

- **Goal Setting**: Sets primary goal and sub-goals from PRD
- **Plan Creation**: Creates execution plan from tasks
- **Progress Updates**: Updates action status on each iteration
- **Completion**: Marks goal achieved when session succeeds

Goal status available via:
```python
status = logger.get_current_status()
print(status['goal_status']['current_goal']['progress'])
```

## Dashboard Events

Real-time events sent to dashboard:

| Event | Data | Description |
|-------|------|-------------|
| `session_start` | session_id, prd | New session started |
| `iteration_start` | iteration, task | Iteration started |
| `iteration_complete` | iteration, task, result | Iteration succeeded |
| `iteration_failed` | iteration, task, result | Iteration failed |
| `session_update` | session_id, status, progress | Progress update |
| `session_end` | summary | Session completed |
| `log` | session_id, level, message | Log message |
| `metric` | session_id, metric_name, value | Metric update |

## Session Status

Get current session status at any time:

```python
status = logger.get_current_status()

# Returns:
{
    "session_id": "my-session-001",
    "duration_seconds": 45.2,
    "iterations_completed": 10,
    "total_tasks": 15,
    "successful_tasks": 12,
    "success_rate": 0.8,
    "total_tokens": 25000,
    "total_cost": 0.25,
    "goal_status": {...},
    "artifacts": {...}
}
```

## Testing

Run the test suite to verify functionality:

```bash
cd /path/to/blackbox4
python3 .ralph-tui/observability/test_observability.py
```

Test output:
```
============================================================
Blackbox4 Observability Layer Test
============================================================
Test 1: Dashboard Client ✓
Test 2: TUI Logger Initialization ✓
Test 3: Session Start ✓
Test 4: Log Iterations ✓
Test 5: Artifact Verification ✓
Test 6: Current Session Status ✓
Test 7: Session End ✓
Test 8: Manifest Verification ✓
Test 9: Summary Verification ✓

All Tests: ✓ PASSED
```

## Optional Dependencies

The dashboard integration requires `python-socketio`:

```bash
pip install python-socketio
```

If not available, the observability layer gracefully degrades:
- DashboardClient becomes unavailable
- No WebSocket events sent
- All other functionality works normally

## Integration with Existing Systems

### ManifestManager

Located at `4-scripts/python/core/runtime/manifest.py`:

- `RunManifest`: Tracks complete execution context
- `ManifestManager`: Manages manifest lifecycle

### GoalTracker

Located at `4-scripts/python/core/runtime/goal_tracking.py`:

- Goal-Plan-Action framework
- Progress tracking
- Status summaries

## Files

- `__init__.py`: Package initialization
- `tui_logger.py`: TUILogger, ExecutionResult, SessionSummary, ArtifactManager
- `dashboard_client.py`: DashboardClient, DashboardEvent
- `test_observability.py`: Test suite
- `README.md`: This documentation

## Usage Example

```python
#!/usr/bin/env python3
from pathlib import Path
from core.observability import TUILogger, ExecutionResult

# Initialize logger
logger = TUILogger(
    session_id="user-auth-001",
    blackbox_root=Path("/path/to/blackbox4")
)

# Start session
prd = {
    "goal": "Implement user authentication",
    "sub_goals": [
        "Design database schema",
        "Implement backend API",
        "Create login UI"
    ],
    "tasks": [
        "Design user table schema",
        "Create registration endpoint",
        "Create login endpoint",
        "Design login form",
        "Implement form validation"
    ]
}
logger.log_session_start(prd)

# Execute tasks
tasks = [...]
for i, task in enumerate(tasks, 1):
    # Execute task...
    result = execute_task(task)

    # Log result
    logger.log_iteration(i, task, result)

    # Check status
    status = logger.get_current_status()
    print(f"Progress: {status['success_rate']:.1%}")

# End session
summary = logger.log_session_end({
    "success_rate": status['success_rate'],
    "goal_achieved": status['success_rate'] >= 0.8,
    "final_goal_progress": status['goal_status']['current_goal']['progress']
})

print(f"Session complete: {summary.session_id}")
print(f"Total cost: ${summary.total_cost:.4f}")
print(f"Artifacts: {summary.artifacts_created[0]}")
```

## License

Part of Blackbox4 Native TUI System.
