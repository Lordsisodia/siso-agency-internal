# Blackbox4 Native TUI

A modern, native terminal-based User Interface for Blackbox4 operations.

## Features

- **Split-Panel Layout**
  - Left panel: Hierarchical task list with status indicators
  - Right panel: Real-time execution log with color-coded levels

- **Real-Time Progress Tracking**
  - Live task execution monitoring
  - Progress bars for in-progress tasks
  - Session statistics (completed/failed tasks, duration, success rate)

- **Keyboard Navigation**
  - Arrow keys for navigation
  - Multiple control schemes (default, VIM, Emacs)
  - Context-sensitive actions

- **Color-Coded Status Indicators**
  - Task status icons (pending, in-progress, completed, failed, blocked)
  - Priority indicators (critical, high, medium, low)
  - Log level colors (debug, info, success, warning, error, critical)

- **Session Management**
  - Session information header
  - Task hierarchy support
  - Session export to JSON

## Installation

The TUI requires the `blessed` library:

```bash
pip install blessed
```

## Usage

### Basic Usage

```python
from pathlib import Path
from core.tui import BlackboxTUI

# Create TUI instance
tui = BlackboxTUI(
    prd_path=Path("path/to/prd.json"),
    blackbox_root=Path.cwd(),
)

# Run TUI
exit_code = tui.run()
```

### Creating Tasks Programmatically

```python
from core.tui import Task, Priority

# Create a task
task = Task(
    title="Implement Feature",
    description="Add new feature to the system",
    priority=Priority.HIGH,
    expected_output="Working feature",
)

# Add to TUI
tui.add_task(task)
```

### Adding Log Entries

```python
from core.tui import LogLevel

# Add log entry
tui.log(
    level=LogLevel.INFO,
    message="Task started",
    task_id=task.id,
    source="executor"
)
```

### Updating Task Progress

```python
# Set current task
tui.set_current_task(task.id)

# Update progress
tui.update_progress(task.id, 50)

# Complete task
tui.complete_task(task.id, success=True, output="Task completed successfully")
```

## Control Schemes

### Default Scheme

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate tasks |
| `Enter` | Select/Execute |
| `p` | Pause/Resume |
| `s` | Skip current task |
| `r` | Retry failed task |
| `l` | Focus log panel |
| `t` | Focus task panel |
| `q` | Quit |
| `Q` | Force quit |
| `h` | Help |

### VIM Scheme

| Key | Action |
|-----|--------|
| `j/k` | Navigate down/up |
| `o` | Select/Execute |
| `p` | Pause/Resume |
| `s` | Skip current task |
| `u/d` | Scroll up/down |
| `G` | Go to bottom |
| `g` | Go to top |
| `/` | Search |
| `q` | Quit |
| `Esc` | Normal mode |

### Emacs Scheme

| Key | Action |
|-----|--------|
| `C-n/C-p` | Navigate down/up |
| `Enter` | Select/Execute |
| `C-x s` | Pause/Resume |
| `C-s` | Search |
| `C-v` | Page down |
| `M-v` | Page up |
| `C-x C-c` | Quit |
| `C-g` | Cancel |

## Components

### BlackboxTUI

Main TUI class that manages the terminal interface.

```python
class BlackboxTUI:
    def __init__(self, prd_path, blackbox_root, control_scheme, auto_start)
    def load_prd(self, prd_path) -> bool
    def run(self) -> int
    def add_task(self, task)
    def update_task(self, task_id, **updates)
    def log(self, level, message, task_id, source, metadata)
    def set_current_task(self, task_id)
    def complete_task(self, task_id, success, output)
    def update_progress(self, task_id, progress)
    def export_session(self, output_path) -> Path
```

### TaskListPanel

Panel component for displaying the task list.

```python
class TaskListPanel:
    def __init__(self, term, width, height)
    def render(self, tasks, current_task_id) -> str
    def scroll_up(self)
    def scroll_down(self, max_lines)
```

### ExecutionLogPanel

Panel component for displaying execution logs.

```python
class ExecutionLogPanel:
    def __init__(self, term, width, height)
    def render(self) -> str
    def append(self, log)
    def scroll_up(self)
    def scroll_down(self)
```

### SessionHeaderPanel

Panel component for displaying session information.

```python
class SessionHeaderPanel:
    def __init__(self, term, width)
    def render(self, session, current_task) -> str
```

### ControlsFooterPanel

Panel component for displaying keyboard controls.

```python
class ControlsFooterPanel:
    def __init__(self, term, width)
    def render(self, controls) -> str
```

## Data Models

### Task

Represents a task in the TUI.

```python
@dataclass
class Task:
    id: str                          # Unique identifier
    title: str                       # Task title
    description: str                 # Detailed description
    status: TaskStatus               # Execution status
    priority: Priority               # Task priority
    expected_output: str             # Expected result
    actual_output: str               # Actual result
    parent_id: Optional[str]         # Parent task ID
    children: list                   # Child task IDs
    dependencies: list               # Dependency task IDs
    metadata: Dict[str, Any]         # Additional info
    created_at: datetime             # Creation time
    started_at: Optional[datetime]   # Start time
    completed_at: Optional[datetime] # Completion time
    progress: int                    # Progress (0-100)
    error_message: Optional[str]     # Error if failed
```

### LogEntry

Represents a log entry.

```python
@dataclass
class LogEntry:
    timestamp: datetime           # Entry timestamp
    level: LogLevel               # Log level
    message: str                  # Log message
    task_id: Optional[str]        # Associated task ID
    source: str                   # Log source
    metadata: Dict[str, Any]      # Additional info
```

### SessionInfo

Information about the current TUI session.

```python
@dataclass
class SessionInfo:
    session_id: str              # Session identifier
    prd_path: Optional[str]      # Path to PRD file
    blackbox_root: Optional[str] # Blackbox root directory
    started_at: datetime         # Session start time
    total_tasks: int             # Total task count
    completed_tasks: int         # Completed task count
    failed_tasks: int            # Failed task count
    current_task_id: Optional[str] # Current task ID
```

## Running the Demo

### Auto Demo (Automated)

```bash
python core/tui/demo.py --mode auto
```

### Interactive Demo

```bash
python core/tui/demo.py --mode interactive
```

## CLI Usage

```bash
# Run with PRD file
python -m core.tui.blackbox_tui --prd path/to/prd.json

# Specify control scheme
python -m core.tui.blackbox_tui --control-scheme vim

# Disable auto-start
python -m core.tui.blackbox_tui --no-auto-start
```

## Integration with Executor

The TUI can be integrated with an executor for automated task execution:

```python
class MyExecutor:
    def execute_task(self, task, tui):
        # Execute task
        tui.log(LogLevel.INFO, f"Executing {task.title}", task_id=task.id)

        try:
            # Do work
            result = do_work(task)

            # Update progress
            tui.update_progress(task.id, 100)

            # Complete task
            tui.complete_task(task.id, success=True, output=result)

        except Exception as e:
            # Fail task
            tui.fail_task(task.id, str(e))

# Connect executor to TUI
tui.executor = MyExecutor()
tui.run()
```

## Session Export

Export session data to JSON for later analysis:

```python
# Export session
output_path = tui.export_session()

# Or specify custom path
tui.export_session(Path("custom/path/session.json"))
```

## Architecture

```
core/tui/
├── __init__.py           # Package exports
├── blackbox_tui.py       # Main TUI class
├── models.py             # Data models (Task, LogEntry, SessionInfo)
├── panels.py             # UI panel components
├── controls.py           # Keyboard controls
├── demo.py               # Demo script
└── README.md             # This file
```

## Requirements

- Python 3.7+
- blessed
- pathlib (standard library)
- typing (standard library)
- dataclasses (standard library)

## License

MIT License - See LICENSE file for details
