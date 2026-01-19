# RALF TUI Runtime Analysis & Blackbox5 Integration Plan

**Date:** 2026-01-18
**Source:** Blackbox4 .ralph-tui/
**Purpose:** Deep analysis of RALF TUI and integration strategy for Blackbox5

---

## Executive Summary

**RALF TUI is NOT a library** - it's Blackbox4's native terminal UI built with the `blessed` library. It provides a sophisticated task execution interface with real-time monitoring, session management, and comprehensive observability.

**Key Finding:** RALF is well-architected but uses older patterns. Blackbox5 can do better with modern frameworks like `textual` and async/await.

---

## Part 1: RALF Architecture

### Core Components

```
RALF TUI Runtime
├── Main TUI (blackbox_tui.py) - 637 lines
│   ├── Session Management
│   ├── Task Lifecycle
│   ├── State Management
│   └── Execution Control
├── UI Components (panels.py) - 635 lines
│   ├── TaskListPanel (40 chars wide)
│   ├── ExecutionLogPanel (60 chars wide)
│   ├── SessionHeaderPanel
│   └── SplitLayout Manager
├── Input System (controls.py) - 479 lines
│   ├── KeyboardController
│   ├── ActionController
│   └── Control Schemes (DEFAULT, VIM, EMACS)
├── Data Models (models.py) - 313 lines
│   ├── Task (UUID, status, priority, dependencies)
│   ├── LogEntry (severity levels)
│   ├── SessionInfo
│   └── Enumerations
├── Observability (tui_logger.py) - 544 lines
│   ├── Session Lifecycle Logging
│   ├── ManifestManager Integration
│   ├── GoalTracker Integration
│   └── WebSocket Dashboard (optional)
└── Configuration (config.toml)
    ├── Agent Settings
    ├── Error Handling
    └── Subagent Tracing
```

### Task Execution Flow

```python
1. Load PRD → Parse tasks → Build dependency graph
2. Start next task (checks dependencies)
3. Set task status to IN_PROGRESS
4. Execute via injected executor
5. Update progress and logs in real-time
6. Mark COMPLETED/FAILED with timestamp
7. Start next available task
8. Auto-export session on completion
```

### Task States

```
PENDING → IN_PROGRESS → COMPLETED
                     ↘ FAILED
                     ↘ BLOCKED
                     ↘ PAUSED
                     ↘ SKIPPED
```

### UI Framework: `blessed` Library

**Why blessed?**
- Cross-platform terminal rendering
- No external UI dependencies
- Works on any terminal with basic support
- Fallback modes for limited terminals

**Features:**
- Color-coded status icons (○ ◉ ✓ ✗)
- Priority indicators (! + • -)
- Split-panel layout (40/60 ratio)
- Auto-scrolling logs
- Hierarchical task display

### Control Schemes

**DEFAULT:**
- Arrow keys for navigation
- Enter to select task
- p to pause
- q to quit

**VIM:**
- j/k for navigation
- o to execute
- h/l for expand/collapse

**EMACS:**
- C-n/C-p for navigation
- C-x chord commands

---

## Part 2: Observability System

### TUILogger Architecture

```python
TUILogger
├── Session Management
│   ├── log_session_start(prd)
│   ├── log_iteration(iteration, task, result)
│   └── log_session_end(summary)
├── ManifestManager Integration
│   ├── Create manifest on session start
│   ├── Update manifest on each iteration
│   └── Finalize manifest on session end
├── GoalTracker Integration
│   ├── Set goal from PRD
│   ├── Update progress on iterations
│   └── Mark achieved on completion
├── ArtifactManager
│   └── Store artifacts in .blackbox4/artifacts/
└── DashboardClient (Optional)
    ├── WebSocket events
    └── Real-time updates
```

### ExecutionResult Data Structure

```python
@dataclass
class ExecutionResult:
    success: bool              # Execution succeeded
    status: str               # Status string
    duration_ms: int          # Duration in milliseconds
    tokens_used: int          # Total tokens
    cost_usd: float           # Estimated cost
    output: str               # Output message
    error: Optional[str]      # Error if failed
    metadata: Dict[str, Any]  # Additional metadata
```

### Artifact Storage Structure

```
.blackbox4/artifacts/{session_id}/
├── manifest.json      # Full execution manifest
├── progress.json      # Current progress state
├── summary.json       # Session summary
├── tasks/            # Task artifacts
│   ├── {task_id}-context.json
│   └── {task_id}-result.json
└── iterations/       # Iteration artifacts
    └── {iteration:04d}/
        ├── prompt.txt
        ├── response.txt
        └── metadata.json
```

### Manifest Integration

**RunManifest includes:**
- Run metadata (agent, phase, model profile)
- Timestamps (start, end, duration)
- Input/output files
- Execution steps
- Metrics (tokens, cost, operations)
- Validation results
- Environment information

---

## Part 3: How RALF Works

### Session Lifecycle

```python
# 1. Initialize
tui = BlackboxTUI(
    prd=prd_data,
    executor=task_executor,
    config=config
)

# 2. Start session
tui.start()
# - Create session ID (UUID)
# - Log session start
# - Initialize manifest
# - Set goal tracker

# 3. Execute tasks
while tasks_remaining:
    # - Find next available task (dependencies met)
    # - Set status IN_PROGRESS
    # - Execute via executor
    # - Update progress in real-time
    # - Mark COMPLETED/FAILED
    # - Log iteration

# 4. End session
tui.end()
# - Log session end
# - Finalize manifest
# - Export artifacts
# - Update goal tracker
```

### Real-time Updates

```python
# Executor callback pattern
class TaskExecutor:
    def execute_task(self, task, tui):
        # Progress updates
        tui.update_progress(task.id, 0.5)
        tui.log(task.id, "Working...", LogLevel.INFO)

        # Execute
        result = self._execute(task)

        # Final update
        tui.update_progress(task.id, 1.0)
        tui.log(task.id, "Complete", LogLevel.SUCCESS)

        return result
```

### State Management

```python
class SessionState:
    tasks: List[Task]
    active_task: Optional[Task]
    completed_tasks: List[Task]
    failed_tasks: List[Task]
    logs: List[LogEntry]
    start_time: datetime
    end_time: Optional[datetime]
```

---

## Part 4: Integrating RALF into Blackbox5

### Integration Strategy

**Blackbox5 has better foundation:**
- ✅ Event bus (Redis-based)
- ✅ Task router (complexity-based)
- ✅ Circuit breaker (fault tolerance)
- ✅ Agent system (BaseAgent, AgentLoader)
- ✅ Brain system (PostgreSQL + Neo4j)

**What we need to add:**
- ❌ TUI runtime interface
- ❌ Session management
- ❌ Task queue visualization
- ❌ Real-time progress monitoring
- ❌ Observability integration

### Proposed Architecture

```python
# Blackbox5 TUI Runtime (Modern RALF)
class Blackbox5TUI:
    """
    Modern TUI runtime using Textual framework
    """
    def __init__(self):
        # Use Blackbox5 core services
        self.event_bus = get_event_bus()
        self.task_router = TaskRouter()
        self.agent_loader = AgentLoader()
        self.manifest_system = ManifestSystem()
        self.brain = BrainService()

        # UI components (Textual-based)
        self.workspace_panel = WorkspacePanel()
        self.task_panel = TaskPanel()
        self.execution_panel = ExecutionPanel()
        self.event_panel = EventPanel()
        self.metrics_panel = MetricsPanel()

        # Session management
        self.session = SessionManager()

        # Enhanced features
        self.live_debugging = True
        self.skill_progress = {}
        self.real_time_metrics = MetricsService()
```

### Key Improvements Over RALF

1. **Modern UI Framework - Textual**
   ```python
   from textual.app import App, ComposeResult
   from textual.widgets import Header, Footer, Static, ListView

   class Blackbox5App(App):
       CSS_PATH = "tui_styles.css"
       BINDINGS = [
           ("q", "quit", "Quit"),
           ("d", "toggle_dark", "Toggle dark mode"),
           ("r", "refresh", "Refresh")
       ]

       def compose(self) -> ComposeResult:
           yield Header()
           yield TaskPanel()
           yield ExecutionPanel()
           yield EventPanel()
           yield Footer()
   ```

2. **Async/Await Execution**
   ```python
   async def execute_task(self, task: Task):
       # Non-blocking execution
       async with self.task_progress:
           result = await self.agent.execute(task)
           return result
   ```

3. **Event Bus Integration**
   ```python
   # Subscribe to events
   self.event_bus.subscribe("task.started", self.on_task_started)
   self.event_bus.subscribe("task.progress", self.on_task_progress)
   self.event_bus.subscribe("task.completed", self.on_task_completed)
   ```

4. **Real-time Collaboration**
   ```python
   # Multi-user session support
   @dataclass
   class Session:
       id: UUID
       users: List[User]
       shared_state: Dict[str, Any]
       events: List[Event]
   ```

5. **AI Assistance**
   ```python
   # Built-in AI for suggestions
   class AIAssistant:
       async def suggest_next_task(self, context):
           # Use brain to suggest
           pass

       async def debug_error(self, error):
           # Analyze and suggest fixes
           pass
   ```

---

## Part 5: Implementation Plan

### Phase 1: Core TUI (Week 1-2)

**Files to create:**
```python
# .blackbox5/engine/runtime/tui/
├── __init__.py
├── app.py              # Main Textual app
├── panels/             # UI panels
│   ├── __init__.py
│   ├── task_panel.py   # Task list panel
│   ├── execution_panel.py  # Execution logs
│   ├── event_panel.py  # Event stream
│   ├── metrics_panel.py    # Metrics display
│   └── workspace_panel.py  # Workspace overview
├── session/            # Session management
│   ├── __init__.py
│   ├── manager.py      # Session lifecycle
│   └── state.py        # State management
├── controls/           # Input handling
│   ├── __init__.py
│   └── keyboard.py     # Key bindings
└── styles/             # Styling
    ├── __init__.py
    └── default.css     # Default theme
```

**Key components:**

1. **Main App (app.py)**
   ```python
   from textual.app import App

   class Blackbox5TUI(App):
       TITLE = "Blackbox5 TUI"
       CSS_PATH = "styles/default.css"

       def __init__(self):
           super().__init__()
           self.event_bus = get_event_bus()
           self.task_router = TaskRouter()
           self.session = SessionManager()

       def on_mount(self):
           # Initialize panels
           # Subscribe to events
           # Load initial state
           pass
   ```

2. **Task Panel (task_panel.py)**
   ```python
   from textual.widgets import ListView

   class TaskPanel(ListView):
       def __init__(self, task_router):
           super().__init__()
           self.task_router = task_router
           self.tasks = []

       async def update_tasks(self):
           # Refresh task list from router
           pass
   ```

3. **Execution Panel (execution_panel.py)**
   ```python
   from textual.widgets import Log

   class ExecutionPanel(Log):
       def __init__(self):
           super().__init__()
           self.event_bus = get_event_bus()

       async def on_task_event(self, event):
           # Update log with event
           pass
   ```

### Phase 2: Integration (Week 2-3)

**Connect to Blackbox5 services:**

1. **Event Bus Integration**
   ```python
   # Subscribe to all task events
   self.event_bus.subscribe("task.*", self.handle_task_event)
   ```

2. **Task Router Integration**
   ```python
   # Get tasks from router
   tasks = await self.task_router.get_pending_tasks()
   ```

3. **Agent System Integration**
   ```python
   # Load agents
   agents = await self.agent_loader.load_all()
   ```

4. **Manifest System Integration**
   ```python
   # Create manifests for sessions
   manifest = self.manifest_system.create_manifest("tui_session")
   ```

### Phase 3: Enhanced Features (Week 3-4)

1. **Live Debugging**
   ```python
   class Debugger:
       async def set_breakpoint(self, task_id):
           pass

       async def step_execution(self):
           pass
   ```

2. **Real-time Metrics**
   ```python
   class MetricsService:
       async def collect_metrics(self):
           return {
               "tasks_completed": 10,
               "success_rate": 0.95,
               "avg_duration": 5000
           }
   ```

3. **Multi-user Sessions**
   ```python
   class Session:
       async def add_user(self, user):
           pass

       async def broadcast_event(self, event):
           pass
   ```

---

## Part 6: Comparison: RALF vs Blackbox5 TUI

### RALF (Blackbox4)

**Strengths:**
- ✅ Simple, focused design
- ✅ Cross-platform (blessed)
- ✅ Good observability
- ✅ Multiple control schemes

**Weaknesses:**
- ❌ Synchronous execution (blocks UI)
- ❌ No parallel task execution
- ❌ Limited error recovery
- ❌ Basic UI widgets
- ❌ No collaboration features

### Blackbox5 TUI (Proposed)

**Improvements:**
- ✅ Async/await (non-blocking)
- ✅ Modern UI (Textual framework)
- ✅ Event-driven (Redis pub/sub)
- ✅ Parallel execution
- ✅ Live debugging
- ✅ Real-time metrics
- ✅ Multi-user sessions
- ✅ AI assistance
- ✅ Plugin architecture

---

## Part 7: Code Examples

### Basic TUI App

```python
# .blackbox5/engine/runtime/tui/app.py
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer

class Blackbox5TUI(App):
    TITLE = "Blackbox5 TUI Runtime"
    SUB_TITLE = "Multi-Agent Execution Environment"
    CSS_PATH = "styles/default.css"

    BINDINGS = [
        ("q", "quit", "Quit"),
        ("d", "toggle_dark", "Toggle Dark Mode"),
        ("r", "refresh_tasks", "Refresh Tasks"),
    ]

    def __init__(self):
        super().__init__()
        from blackbox5.engine.core import (
            get_event_bus,
            TaskRouter,
            ManifestSystem
        )
        self.event_bus = get_event_bus()
        self.task_router = TaskRouter()
        self.manifests = ManifestSystem()

    def on_mount(self) -> None:
        # Subscribe to events
        self.event_bus.subscribe("task.*", self.handle_task_event)
        # Initialize session
        self.session = self.manifests.create_manifest("tui_session")

    def compose(self) -> ComposeResult:
        yield Header()
        yield TaskPanel()
        yield ExecutionPanel()
        yield EventPanel()
        yield MetricsPanel()
        yield Footer()

    async def handle_task_event(self, event):
        # Update UI based on events
        pass
```

### Task Panel

```python
# .blackbox5/engine/runtime/tui/panels/task_panel.py
from textual.widgets import ListView, ListItem
from textual.reactive import reactive

class TaskPanel(ListView):
    tasks = reactive([])

    def __init__(self, task_router):
        super().__init__()
        self.task_router = task_router

    def watch_tasks(self, old_tasks, new_tasks):
        # Update list when tasks change
        self.clear()
        for task in new_tasks:
            item = ListItem(
                f"{task.icon} {task.id} - {task.description}"
            )
            self.append(item)

    async def update_tasks(self):
        # Fetch tasks from router
        self.tasks = await self.task_router.get_all_tasks()
```

### Execution Panel

```python
# .blackbox5/engine/runtime/tui/panels/execution_panel.py
from textual.widgets import Log
from textual.reactive import reactive

class ExecutionPanel(Log):
    current_task = reactive(None)

    def __init__(self, event_bus):
        super().__init__()
        self.event_bus = event_bus

    def watch_current_task(self, old_task, new_task):
        if new_task:
            self.write_line(f"Starting: {new_task.description}")

    async def on_task_event(self, event):
        if event.type == "task.progress":
            self.write_line(f"Progress: {event.progress}")
        elif event.type == "task.log":
            self.write_line(f"Log: {event.message}")
```

---

## Part 8: Quick Start Implementation

### Minimum Viable TUI (1 week)

```bash
# Install dependencies
pip install textual rich

# Create basic app
mkdir -p .blackbox5/engine/runtime/tui
cd .blackbox5/engine/runtime/tui

# Create files
touch __init__.py app.py styles/default.css
```

**app.py:**
```python
from textual.app import App
from textual.widgets import Header, Footer, Static

class MinimalTUI(App):
    TITLE = "Blackbox5"
    CSS = """
    Screen {
        background: #1a1a1a;
    }
    """

    def compose(self):
        yield Header()
        yield Static("Blackbox5 TUI - Ready")
        yield Footer()

if __name__ == "__main__":
    app = MinimalTUI()
    app.run()
```

**Run it:**
```bash
python .blackbox5/engine/runtime/tui/app.py
```

---

## Conclusion

**RALF is well-designed but dated. Blackbox5 can do better.**

**Key Takeaways:**
1. RALF uses `blessed` library (synchronous, blocking)
2. Blackbox5 should use `textual` (modern, async)
3. RALF has good observability patterns we should adopt
4. Blackbox5's event bus enables better real-time updates
5. We can add collaboration, debugging, and AI assistance

**Implementation Priority:**
1. Week 1-2: Core TUI with Textual
2. Week 2-3: Event bus integration
3. Week 3-4: Enhanced features

**Next Action:**
Create minimal Textual app (1 day effort)

---

**Status:** Analysis Complete ✅
**Next:** Create Blackbox5 TUI Implementation Plan
