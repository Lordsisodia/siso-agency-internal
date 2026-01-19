# Porting RALF TUI to Blackbox5 - Implementation Plan

**Date:** 2026-01-18
**Source:** Blackbox4 .ralph-tui/
**Goal:** Port and improve RALF TUI for Blackbox5

---

## Executive Summary

**We will directly port Blackbox4's RALF TUI code and adapt it for Blackbox5's architecture.** This is faster than building from scratch and gives us a production-tested foundation.

---

## Part 1: What We're Porting

### Core Files from Blackbox4

1. **`tui_logger.py`** (544 lines) - COMPLETE
   - `TUILogger` class - Session lifecycle logging
   - `ExecutionResult` dataclass - Task execution results
   - `SessionSummary` dataclass - Session summary
   - `ArtifactManager` - Artifact storage system

2. **`dashboard_client.py`** (364 lines) - COMPLETE
   - `DashboardClient` class - WebSocket dashboard integration
   - `DashboardEvent` dataclass - Event structure
   - Event emission methods
   - Graceful degradation without socketio

3. **`config.toml`** - COMPLETE
   - Agent settings
   - Error handling strategy
   - Subagent tracing detail

### Files to Create/Adapt

1. **`blackbox5_tui.py`** - Main TUI application
2. **`panels.py`** - UI panel components
3. **`controls.py`** - Input handling
4. **`models.py`** - Data models
5. **`session.py`** - Session management

---

## Part 2: File Structure

```
.blackbox5/engine/runtime/tui/
├── __init__.py
├── blackbox5_tui.py      # Main TUI app (adapted from blackbox_tui.py)
├── models.py              # Data models (port from Blackbox4)
├── panels.py              # UI panels (port from Blackbox4)
├── controls.py            # Input handling (port from Blackbox4)
├── observability/         # Observability layer
│   ├── __init__.py
│   ├── tui_logger.py      # Port from Blackbox4
│   └── dashboard_client.py # Port from Blackbox4
└── config/
    ├── __init__.py
    └── default.toml       # Adapted from config.toml
```

---

## Part 3: Porting Plan

### Step 1: Copy Observability Layer (Day 1)

**Copy directly from Blackbox4:**
- `tui_logger.py` → `.blackbox5/engine/runtime/tui/observability/`
- `dashboard_client.py` → `.blackbox5/engine/runtime/tui/observability/`

**Adaptations needed:**
```python
# Update imports
# OLD:
import sys
runtime_path = Path(__file__).parent.parent.parent / "4-scripts" / "python"
sys.path.insert(0, str(runtime_path))
from core.runtime.manifest import ManifestManager
from core.runtime.goal_tracking import GoalTracker

# NEW:
from blackbox5.engine.core import ManifestSystem
from blackbox5.engine.runtime.goal_tracking import GoalTracker
```

**Actions:**
```bash
# Create directory
mkdir -p .blackbox5/engine/runtime/tui/observability

# Copy files
curl -o .blackbox5/engine/runtime/tui/observability/tui_logger.py \
  https://raw.githubusercontent.com/Lordsisodia/blackbox4/main/.ralph-tui/observability/tui_logger.py

curl -o .blackbox5/engine/runtime/tui/observability/dashboard_client.py \
  https://raw.githubusercontent.com/Lordsisodia/blackbox4/main/.ralph-tui/observability/dashboard_client.py
```

### Step 2: Create Data Models (Day 1)

**Port from Blackbox4:**

```python
# .blackbox5/engine/runtime/tui/models.py
from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    PAUSED = "paused"
    SKIPPED = "skipped"

class Priority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class LogLevel(Enum):
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

@dataclass
class Task:
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    dependencies: List[str] = None
    parent_id: Optional[str] = None
    children: List[str] = None
    progress: float = 0.0
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error: Optional[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.children is None:
            self.children = []
        if not self.id:
            self.id = str(uuid.uuid4())

@dataclass
class LogEntry:
    task_id: str
    level: LogLevel
    message: str
    timestamp: datetime
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class SessionInfo:
    session_id: str
    prd: Dict[str, Any]
    start_time: datetime
    end_time: Optional[datetime] = None
    current_iteration: int = 0
    total_iterations: int = 0
    tasks_completed: int = 0
    tasks_failed: int = 0
    tokens_used: int = 0
    cost_usd: float = 0.0

    def __post_init__(self):
        if not self.session_id:
            self.session_id = str(uuid.uuid4())
        if self.start_time is None:
            self.start_time = datetime.now()
```

### Step 3: Create Configuration (Day 1)

```toml
# .blackbox5/engine/runtime/tui/config/default.toml
# Blackbox5 TUI Configuration

[general]
# Default tracker and agent
tracker = "json"
agent = "claude"

# Execution limits
maxIterations = 10

# Agent-specific options
[agentOptions]
model = "sonnet"

# Error handling
[errorHandling]
strategy = "skip"
maxRetries = 3
retryDelayMs = 5000
continueOnNonZeroExit = false

# Subagent tracing detail level
# off | minimal | moderate | full
subagentTracingDetail = "full"

# UI settings
[ui]
refreshRate = 100  # milliseconds
maxLogLines = 1000
taskPanelWidth = 40
logPanelWidth = 60

# Colors
[colors]
pending = "gray"
inProgress = "yellow"
completed = "green"
failed = "red"
blocked = "blue"

# Key bindings
[keyBindings]
scheme = "default"  # default | vim | emacs
```

### Step 4: Port UI Panels (Day 2-3)

**Create panels adapted from Blackbox4:**

```python
# .blackbox5/engine/runtime/tui/panels.py
from blessed import Terminal
from typing import List, Dict, Any

class TaskListPanel:
    """Task list panel showing hierarchical tasks."""

    def __init__(self, term: Terminal, width: int = 40):
        self.term = term
        self.width = width
        self.tasks = []
        self.scroll_offset = 0
        self.expanded_tasks = set()

    def render(self, tasks: List[Task]) -> str:
        """Render task list."""
        lines = []
        lines.append(self.term.bold("TASKS"))
        lines.append(self.term.move_down)

        for i, task in enumerate(tasks[self.scroll_offset:]):
            lines.extend(self._render_task(task, indent=0))

        return "\n".join(lines)

    def _render_task(self, task: Task, indent: int) -> List[str]:
        """Render single task with children."""
        icon = self._get_status_icon(task.status)
        priority = self._get_priority_icon(task.priority)
        prefix = "  " * indent

        line = f"{prefix}{icon} {priority} {task.description[:self.width - indent * 2 - 5]}"

        lines = [line]

        # Render children if expanded
        if task.id in self.expanded_tasks:
            for child_id in task.children:
                child = self._get_task_by_id(child_id)
                if child:
                    lines.extend(self._render_task(child, indent + 1))

        return lines

    def _get_status_icon(self, status: TaskStatus) -> str:
        icons = {
            TaskStatus.PENDING: "○",
            TaskStatus.IN_PROGRESS: "◉",
            TaskStatus.COMPLETED: "✓",
            TaskStatus.FAILED: "✗",
            TaskStatus.BLOCKED: "◌",
            TaskStatus.PAUSED: "⏸",
            TaskStatus.SKIPPED: "⊘"
        }
        return icons.get(status, "?")

    def _get_priority_icon(self, priority: Priority) -> str:
        icons = {
            Priority.CRITICAL: "!",
            Priority.HIGH: "+",
            Priority.MEDIUM: "•",
            Priority.LOW: "-"
        }
        return icons.get(priority, "•")

class ExecutionLogPanel:
    """Execution log panel showing real-time logs."""

    def __init__(self, term: Terminal, width: int = 60, max_lines: int = 1000):
        self.term = term
        self.width = width
        self.max_lines = max_lines
        self.logs = []
        self.auto_scroll = True

    def add_log(self, entry: LogEntry):
        """Add log entry."""
        self.logs.append(entry)
        if len(self.logs) > self.max_lines:
            self.logs = self.logs[-self.max_lines:]

    def render(self) -> str:
        """Render logs."""
        lines = []
        lines.append(self.term.bold("EXECUTION LOG"))
        lines.append(self.term.move_down)

        # Show last N lines
        visible_logs = self.logs[-self.max_lines:]

        for log_entry in visible_logs:
            color = self._get_log_color(log_entry.level)
            timestamp = log_entry.timestamp.strftime("%H:%M:%S")
            line = f"{timestamp} [{color}]{log_entry.level.value}[/color] {log_entry.message}"
            lines.append(line)

        return "\n".join(lines)

    def _get_log_color(self, level: LogLevel) -> str:
        colors = {
            LogLevel.DEBUG: "blue",
            LogLevel.INFO: "white",
            LogLevel.WARNING: "yellow",
            LogLevel.ERROR: "red",
            LogLevel.SUCCESS: "green"
        }
        return colors.get(level, "white")

class SessionHeaderPanel:
    """Session header showing progress and stats."""

    def __init__(self, term: Terminal):
        self.term = term

    def render(self, session: SessionInfo) -> str:
        """Render session header."""
        duration = self._calculate_duration(session)
        progress = self._calculate_progress(session)

        lines = [
            self.term.bold(f"Session: {session.session_id[:8]}"),
            f"Progress: {self._render_progress_bar(progress)}",
            f"Tasks: {session.tasks_completed}/{session.total_iterations}",
            f"Duration: {duration}",
            f"Tokens: {session.tokens_used:,} | Cost: ${session.cost_usd:.2f}"
        ]

        return "\n".join(lines)

    def _render_progress_bar(self, progress: float, width: int = 30) -> str:
        """Render progress bar."""
        filled = int(width * progress)
        bar = "█" * filled + "░" * (width - filled)
        return f"[{bar}] {progress * 100:.1f}%"
```

### Step 5: Port Main TUI (Day 3-4)

```python
# .blackbox5/engine/runtime/tui/blackbox5_tui.py
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from blessed import Terminal

from blackbox5.engine.core import (
    get_event_bus,
    TaskRouter,
    ManifestSystem
)
from blackbox5.engine.runtime.tui.models import Task, TaskStatus, SessionInfo
from blackbox5.engine.runtime.tui.panels import TaskListPanel, ExecutionLogPanel, SessionHeaderPanel
from blackbox5.engine.runtime.tui.observability.tui_logger import TUILogger
from blackbox5.engine.runtime.tui.controls import KeyboardController

class Blackbox5TUI:
    """Main TUI application for Blackbox5."""

    def __init__(self, config_path: Optional[Path] = None):
        self.term = Terminal()
        self.session_id = str(uuid.uuid4())

        # Core services
        self.event_bus = get_event_bus()
        self.task_router = TaskRouter()
        self.manifest_system = ManifestSystem()

        # Observability
        self.logger = TUILogger(
            session_id=self.session_id,
            blackbox_root=Path.cwd()
        )

        # UI components
        self.task_panel = TaskListPanel(self.term, width=40)
        self.log_panel = ExecutionLogPanel(self.term, width=60)
        self.header_panel = SessionHeaderPanel(self.term)
        self.controls = KeyboardController()

        # State
        self.session: Optional[SessionInfo] = None
        self.running = False
        self.current_task: Optional[Task] = None

    def start(self, prd: Dict[str, Any], task_executor: Callable):
        """Start TUI session."""
        # Initialize session
        self.session = SessionInfo(
            session_id=self.session_id,
            prd=prd,
            start_time=datetime.now()
        )

        # Log session start
        self.logger.log_session_start(prd)

        # Parse tasks from PRD
        tasks = self._parse_tasks(prd)

        # Subscribe to events
        self.event_bus.subscribe("task.*", self._handle_task_event)

        # Start UI loop
        self.running = True
        self._run_ui_loop(tasks, task_executor)

    def _run_ui_loop(self, tasks: List[Task], executor: Callable):
        """Main UI loop."""
        with self.term.fullscreen():
            while self.running:
                # Render UI
                self._render(tasks)

                # Handle input (with timeout)
                try:
                    key = self.term.inkey(timeout=0.1)
                    self._handle_keypress(key, tasks, executor)
                except:
                    pass

                # Execute next task if available
                self._execute_next_task(tasks, executor)

    def _render(self, tasks: List[Task]):
        """Render all UI panels."""
        # Clear screen
        print(self.term.clear)

        # Calculate layout
        term_width = self.term.width
        term_height = self.term.height

        # Render header (top)
        header = self.header_panel.render(self.session)
        print(header)
        print(self.term.move_down)

        # Split view: tasks (left) + logs (right)
        task_output = self.task_panel.render(tasks)
        log_output = self.log_panel.render()

        # Print side by side
        task_lines = task_output.split("\n")
        log_lines = log_output.split("\n")

        max_lines = max(len(task_lines), len(log_lines))
        for i in range(max_lines):
            task_line = task_lines[i] if i < len(task_lines) else ""
            log_line = log_lines[i] if i < len(log_lines) else ""

            # Truncate to fit
            task_line = task_line[:40]
            log_line = log_line[:term_width - 45]

            print(f"{task_line:40} │ {log_line}")

    def _execute_next_task(self, tasks: List[Task], executor: Callable):
        """Execute next available task."""
        if self.current_task:
            return  # Task already running

        # Find next pending task with satisfied dependencies
        for task in tasks:
            if task.status == TaskStatus.PENDING:
                if self._dependencies_satisfied(task, tasks):
                    self.current_task = task
                    task.status = TaskStatus.IN_PROGRESS
                    task.start_time = datetime.now()

                    # Execute asynchronously
                    self._execute_task(task, executor)
                    break

    def _execute_task(self, task: Task, executor: Callable):
        """Execute single task."""
        try:
            # Call executor (injected from outside)
            result = executor(task, self)

            # Update task
            task.status = TaskStatus.COMPLETED if result.success else TaskStatus.FAILED
            task.end_time = datetime.now()
            task.progress = 1.0

            # Log completion
            self.logger.log_iteration(
                iteration=self.session.current_iteration,
                task=task.__dict__,
                result=result
            )

            # Update session stats
            self.session.tasks_completed += 1
            self.session.tokens_used += result.tokens_used
            self.session.cost_usd += result.cost_usd

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.end_time = datetime.now()

            self.log_panel.add_log(LogEntry(
                task_id=task.id,
                level=LogLevel.ERROR,
                message=f"Task failed: {str(e)}"
            ))

        finally:
            self.current_task = None
            self.session.current_iteration += 1

    def _dependencies_satisfied(self, task: Task, tasks: List[Task]) -> bool:
        """Check if task dependencies are satisfied."""
        for dep_id in task.dependencies:
            dep_task = self._get_task_by_id(dep_id, tasks)
            if not dep_task or dep_task.status != TaskStatus.COMPLETED:
                return False
        return True

    def _get_task_by_id(self, task_id: str, tasks: List[Task]) -> Optional[Task]:
        """Get task by ID."""
        for task in tasks:
            if task.id == task_id:
                return task
        return None

    def _parse_tasks(self, prd: Dict[str, Any]) -> List[Task]:
        """Parse tasks from PRD."""
        tasks = []
        for i, task_desc in enumerate(prd.get("tasks", [])):
            task = Task(
                id=f"task-{i}",
                description=task_desc
            )
            tasks.append(task)

        self.session.total_iterations = len(tasks)
        return tasks

    def _handle_task_event(self, event):
        """Handle task event from event bus."""
        if event.type == "task.progress":
            # Update progress
            if self.current_task:
                self.current_task.progress = event.data.get("progress", 0.0)

        elif event.type == "task.log":
            # Add log entry
            self.log_panel.add_log(LogEntry(
                task_id=event.data.get("task_id"),
                level=LogLevel(event.data.get("level", "info")),
                message=event.data.get("message", "")
            ))

    def _handle_keypress(self, key, tasks, executor):
        """Handle keyboard input."""
        if key == "q":
            # Quit
            self.running = False
            self._end_session()

        elif key == "p":
            # Pause/resume
            self.running = not self.running

        elif key.key == "up":
            # Scroll tasks up
            self.task_panel.scroll_offset = max(0, self.task_panel.scroll_offset - 1)

        elif key.key == "down":
            # Scroll tasks down
            self.task_panel.scroll_offset += 1

    def _end_session(self):
        """End TUI session."""
        if self.session:
            self.session.end_time = datetime.now()

            # Create session summary
            summary = self.logger.log_session_end({
                "success_rate": self.session.tasks_completed / max(1, self.session.total_iterations),
                "goal_achieved": self.session.tasks_completed == self.session.total_iterations
            })

            # Print summary
            print(self.term.clear)
            print(f"Session Complete: {self.session.session_id}")
            print(f"Tasks: {self.session.tasks_completed}/{self.session.total_iterations}")
            print(f"Duration: {self.session.end_time - self.session.start_time}")
            print(f"Tokens: {self.session.tokens_used:,}")
            print(f"Cost: ${self.session.cost_usd:.2f}")

# Convenience function
def run_tui(prd: Dict[str, Any], task_executor: Callable):
    """Run TUI with given PRD and executor."""
    tui = Blackbox5TUI()
    tui.start(prd, task_executor)
```

---

## Part 4: Quick Start

### Day 1: Setup

```bash
# Create directory structure
mkdir -p .blackbox5/engine/runtime/tui/{observability,config}

# Copy observability files from Blackbox4
cd .blackbox5/engine/runtime/tui

# Get the files
curl -o observability/tui_logger.py \
  https://raw.githubusercontent.com/Lordsisodia/blackbox4/main/.ralph-tui/observability/tui_logger.py

curl -o observability/dashboard_client.py \
  https://raw.githubusercontent.com/Lordsisodia/blackbox4/main/.ralph-tui/observability/dashboard_client.py

# Create other files
# (Use code from Part 3 above)
```

### Day 2-3: Core TUI

```bash
# Create main files
touch models.py panels.py controls.py blackbox5_tui.py config/default.toml
```

### Day 4: Integration

```bash
# Test the TUI
python -c "
from blackbox5.engine.runtime.tui import Blackbox5TUI

# Example PRD
prd = {
    'goal': 'Test Blackbox5 TUI',
    'tasks': [
        'Task 1: Setup',
        'Task 2: Execute',
        'Task 3: Complete'
    ]
}

# Example executor
def executor(task, tui):
    from blackbox5.engine.runtime.tui.observability.tui_logger import ExecutionResult
    return ExecutionResult(
        success=True,
        status='complete',
        duration_ms=1000,
        output=f'Completed: {task.description}'
    )

# Run
Blackbox5TUI().start(prd, executor)
"
```

---

## Part 5: Integration Checklist

- [ ] Copy tui_logger.py and adapt imports
- [ ] Copy dashboard_client.py and adapt imports
- [ ] Create models.py with Task, LogEntry, SessionInfo
- [ ] Create panels.py with TaskListPanel, ExecutionLogPanel, SessionHeaderPanel
- [ ] Create blackbox5_tui.py main app
- [ ] Create controls.py for keyboard input
- [ ] Create config/default.toml
- [ ] Integrate with Blackbox5 event bus
- [ ] Integrate with Blackbox5 task router
- [ ] Integrate with Blackbox5 manifest system
- [ ] Test end-to-end

---

## Conclusion

**We're porting actual working code from Blackbox4, not building from scratch.**

This gives us:
- ✅ Production-tested code
- ✅ Faster implementation
- ✅ Proven architecture
- ✅ Known patterns

**Timeline:** 4 days to working TUI

**Next Action:** Start copying files from GitHub
