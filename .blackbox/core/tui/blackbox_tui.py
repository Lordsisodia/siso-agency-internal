"""
Blackbox4 Native TUI - Main Terminal User Interface

A native terminal-based TUI for Blackbox4 operations with:
- Split-panel layout (task list + execution log)
- Real-time progress tracking
- Keyboard navigation
- Color-coded status indicators
- Session management

Replaces the Ralph TUI with better logging integration.
"""

import sys
import json
import signal
from pathlib import Path
from typing import List, Optional, Dict, Any, Callable
from datetime import datetime
from blessed import Terminal

from .models import Task, LogEntry, SessionInfo, TaskStatus, LogLevel
from .panels import (
    TaskListPanel,
    ExecutionLogPanel,
    SessionHeaderPanel,
    ControlsFooterPanel,
    SplitLayout,
)
from .controls import KeyboardController, ActionController, ControlScheme


class BlackboxTUI:
    """
    Main TUI class for Blackbox4.

    Manages the terminal interface, task execution, and
    real-time display updates.
    """

    def __init__(
        self,
        prd_path: Optional[Path] = None,
        blackbox_root: Optional[Path] = None,
        control_scheme: ControlScheme = ControlScheme.DEFAULT,
        auto_start: bool = True,
    ):
        """
        Initialize Blackbox4 TUI.

        Args:
            prd_path: Path to PRD file
            blackbox_root: Path to Blackbox root directory
            control_scheme: Control scheme to use
            auto_start: Automatically start execution on load
        """
        # Initialize terminal
        self.term = Terminal()

        # Paths
        self.prd_path = prd_path
        self.blackbox_root = blackbox_root or Path.cwd()

        # State
        self.running = False
        self.paused = False
        self.auto_start = auto_start

        # Session
        self.session = SessionInfo(
            prd_path=str(prd_path) if prd_path else None,
            blackbox_root=str(self.blackbox_root),
        )

        # Data
        self.tasks: List[Task] = []
        self.logs: List[LogEntry] = []
        self.current_task_id: Optional[str] = None

        # Panels
        self.layout = SplitLayout(self.term)
        self.task_panel = TaskListPanel(
            self.term,
            width=self.layout.task_panel_width,
            height=self.layout.panel_height
        )
        self.log_panel = ExecutionLogPanel(
            self.term,
            width=self.layout.log_panel_width,
            height=self.layout.panel_height
        )

        # Controllers
        self.keyboard = KeyboardController(self.term, scheme=control_scheme)
        self.action_controller = ActionController(self.keyboard)

        # Executor (will be set externally)
        self.executor = None

        # Setup signal handlers
        self._setup_signal_handlers()

        # Setup callbacks
        self.action_controller.setup_default_callbacks(self)

    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        self.log(
            LogLevel.INFO,
            f"Received signal {signum}, shutting down...",
            source="system"
        )
        self.running = False

    def load_prd(self, prd_path: Optional[Path] = None) -> bool:
        """
        Load PRD from file.

        Args:
            prd_path: Path to PRD file (uses instance path if None)

        Returns:
            True if loaded successfully
        """
        prd_path = prd_path or self.prd_path

        if not prd_path or not prd_path.exists():
            self.log(
                LogLevel.ERROR,
                f"PRD file not found: {prd_path}",
                source="system"
            )
            return False

        try:
            with open(prd_path, 'r') as f:
                prd_data = json.load(f)

            # Extract tasks from PRD
            tasks_data = prd_data.get('tasks', [])
            self.tasks = self._parse_tasks(tasks_data)

            # Update session
            self.session.total_tasks = len(self.tasks)
            self.session.prd_path = str(prd_path)

            self.log(
                LogLevel.SUCCESS,
                f"Loaded PRD with {len(self.tasks)} tasks",
                source="system"
            )

            return True

        except Exception as e:
            self.log(
                LogLevel.ERROR,
                f"Failed to load PRD: {e}",
                source="system"
            )
            return False

    def _parse_tasks(self, tasks_data: List[Dict[str, Any]]) -> List[Task]:
        """
        Parse tasks from PRD data.

        Args:
            tasks_data: Raw task data from PRD

        Returns:
            List of Task objects
        """
        tasks = []
        task_map = {}

        # First pass: create all tasks
        for task_data in tasks_data:
            task = Task(
                title=task_data.get('title', ''),
                description=task_data.get('description', ''),
                metadata=task_data.get('metadata', {}),
            )
            tasks.append(task)
            task_map[task.id] = task

        # Second pass: link dependencies and hierarchy
        for i, task_data in enumerate(tasks_data):
            task = tasks[i]

            # Set parent
            if 'parent_id' in task_data:
                task.parent_id = task_data['parent_id']
                if task.parent_id in task_map:
                    parent = task_map[task.parent_id]
                    if task.id not in parent.children:
                        parent.children.append(task.id)

            # Set dependencies
            if 'dependencies' in task_data:
                task.dependencies = task_data['dependencies']

        return tasks

    def add_task(self, task: Task):
        """
        Add a task to the task list.

        Args:
            task: Task to add
        """
        self.tasks.append(task)
        self.session.total_tasks = len(self.tasks)

    def update_task(self, task_id: str, **updates):
        """
        Update a task.

        Args:
            task_id: ID of task to update
            **updates: Fields to update
        """
        task = next((t for t in self.tasks if t.id == task_id), None)
        if not task:
            return

        for key, value in updates.items():
            if hasattr(task, key):
                setattr(task, key, value)

        # Update session stats
        if task.status == TaskStatus.COMPLETED:
            if task_id not in [t.id for t in self.tasks if t.status == TaskStatus.COMPLETED and t.id != task_id]:
                self.session.completed_tasks += 1
        elif task.status == TaskStatus.FAILED:
            if task_id not in [t.id for t in self.tasks if t.status == TaskStatus.FAILED and t.id != task_id]:
                self.session.failed_tasks += 1

    def log(
        self,
        level: LogLevel,
        message: str,
        task_id: Optional[str] = None,
        source: str = "system",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add a log entry.

        Args:
            level: Log level
            message: Log message
            task_id: Associated task ID
            source: Log source
            metadata: Additional metadata
        """
        entry = LogEntry(
            level=level,
            message=message,
            task_id=task_id,
            source=source,
            metadata=metadata or {}
        )
        self.logs.append(entry)
        self.log_panel.append(entry)

    def set_current_task(self, task_id: Optional[str]):
        """
        Set the currently executing task.

        Args:
            task_id: Task ID or None
        """
        self.current_task_id = task_id
        self.session.current_task_id = task_id

        if task_id:
            task = next((t for t in self.tasks if t.id == task_id), None)
            if task:
                task.started_at = datetime.now()
                task.status = TaskStatus.IN_PROGRESS
                self.log(
                    LogLevel.INFO,
                    f"Starting task: {task.title}",
                    task_id=task_id,
                    source="executor"
                )

    def complete_task(self, task_id: str, success: bool = True, output: str = ""):
        """
        Mark a task as complete.

        Args:
            task_id: Task ID
            success: Whether task succeeded
            output: Task output
        """
        task = next((t for t in self.tasks if t.id == task_id), None)
        if not task:
            return

        task.completed_at = datetime.now()
        task.actual_output = output
        task.progress = 100

        if success:
            task.status = TaskStatus.COMPLETED
            self.session.completed_tasks += 1
            self.log(
                LogLevel.SUCCESS,
                f"Completed task: {task.title}",
                task_id=task_id,
                source="executor"
            )
        else:
            task.status = TaskStatus.FAILED
            task.error_message = output
            self.session.failed_tasks += 1
            self.log(
                LogLevel.ERROR,
                f"Failed task: {task.title} - {output}",
                task_id=task_id,
                source="executor"
            )

    def fail_task(self, task_id: str, error_message: str):
        """
        Mark a task as failed.

        Args:
            task_id: Task ID
            error_message: Error message
        """
        self.complete_task(task_id, success=False, output=error_message)

    def update_progress(self, task_id: str, progress: int):
        """
        Update task progress.

        Args:
            task_id: Task ID
            progress: Progress percentage (0-100)
        """
        task = next((t for t in self.tasks if t.id == task_id), None)
        if task:
            task.progress = max(0, min(100, progress))

    def render(self):
        """Render the TUI."""
        # Get controls for display
        controls = self.keyboard.get_controls_for_display()

        # Render full layout
        layout = self.layout.render_full_layout(
            session=self.session,
            tasks=self.tasks,
            logs=self.logs,
            current_task_id=self.current_task_id,
            controls=controls
        )

        # Print to terminal
        print(layout, end='', flush=True)

    def run(self) -> int:
        """
        Run the TUI main loop.

        Returns:
            Exit code (0 for success, non-zero for error)
        """
        self.running = True

        # Load PRD
        if self.prd_path:
            if not self.load_prd():
                return 1

        # Enter fullscreen mode
        with self.term.fullscreen():
            # Initial render
            self.render()

            # Main loop
            while self.running:
                try:
                    # Read input
                    with self.term.cbreak():
                        key = self.term.inkey(timeout=0.1)

                    if key:
                        # Handle input
                        action = self.keyboard.handle_input(str(key))

                        # Check for quit
                        if action == 'quit':
                            if self._confirm_quit():
                                break
                        elif action == 'quit_force':
                            break

                    # Update UI
                    self.render()

                    # Auto-start execution
                    if self.auto_start and not self.current_task_id:
                        self._start_next_task()

                    # Check completion
                    if self._is_complete():
                        self.log(
                            LogLevel.SUCCESS,
                            f"All tasks completed! {self.session.completed_tasks}/{self.session.total_tasks} successful",
                            source="system"
                        )
                        self.render()
                        self._wait_for_quit()
                        break

                except KeyboardInterrupt:
                    if self._confirm_quit():
                        break
                except Exception as e:
                    self.log(
                        LogLevel.ERROR,
                        f"Error in main loop: {e}",
                        source="system"
                    )
                    self.render()

        return 0 if self.session.failed_tasks == 0 else 1

    def _start_next_task(self):
        """Start the next pending task."""
        if self.paused:
            return

        # Find next pending task
        next_task = next(
            (
                t for t in self.tasks
                if t.status == TaskStatus.PENDING
                and all(
                    dep_id in [task.id for task in self.tasks if task.status == TaskStatus.COMPLETED]
                    for dep_id in t.dependencies
                )
            ),
            None
        )

        if next_task:
            self.set_current_task(next_task.id)

            # If executor is set, execute the task
            if self.executor:
                self.executor.execute_task(next_task, self)

    def _is_complete(self) -> bool:
        """Check if all tasks are complete."""
        return all(
            task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.SKIPPED]
            for task in self.tasks
        )

    def _confirm_quit(self) -> bool:
        """Confirm quit with user."""
        # For now, just return True
        # Could implement a confirmation dialog here
        return True

    def _wait_for_quit(self):
        """Wait for user to press quit key."""
        with self.term.cbreak():
            while True:
                key = self.term.inkey(timeout=None)
                action = self.keyboard.handle_input(str(key))
                if action in ['quit', 'quit_force']:
                    break

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        """
        Get a task by ID.

        Args:
            task_id: Task ID

        Returns:
            Task or None
        """
        return next((t for t in self.tasks if t.id == task_id), None)

    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """
        Get tasks with a specific status.

        Args:
            status: Task status

        Returns:
            List of tasks
        """
        return [t for t in self.tasks if t.status == status]

    def export_session(self, output_path: Optional[Path] = None) -> Path:
        """
        Export session data to JSON.

        Args:
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if output_path is None:
            output_path = self.blackbox_root / ".runtime" / "sessions" / f"session_{self.session.session_id}.json"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        session_data = {
            'session': {
                'session_id': self.session.session_id,
                'prd_path': self.session.prd_path,
                'blackbox_root': self.session.blackbox_root,
                'started_at': self.session.started_at.isoformat(),
                'total_tasks': self.session.total_tasks,
                'completed_tasks': self.session.completed_tasks,
                'failed_tasks': self.session.failed_tasks,
                'current_task_id': self.session.current_task_id,
            },
            'tasks': [task.to_dict() for task in self.tasks],
            'logs': [log.to_dict() for log in self.logs],
        }

        with open(output_path, 'w') as f:
            json.dump(session_data, f, indent=2)

        self.log(
            LogLevel.INFO,
            f"Exported session to: {output_path}",
            source="system"
        )

        return output_path

    def display_summary(self):
        """Display session summary."""
        print("\n" + "=" * 80)
        print("BLACKBOX4 SESSION SUMMARY")
        print("=" * 80)
        print(f"Session ID: {self.session.session_id}")
        print(f"Duration: {self.session.format_duration()}")
        print(f"Total Tasks: {self.session.total_tasks}")
        print(f"Completed: {self.session.completed_tasks}")
        print(f"Failed: {self.session.failed_tasks}")
        print(f"Success Rate: {self.session.success_rate():.1f}%")
        print("=" * 80)


def create_tui(
    prd_path: Optional[Path] = None,
    blackbox_root: Optional[Path] = None,
    control_scheme: ControlScheme = ControlScheme.DEFAULT,
) -> BlackboxTUI:
    """
    Factory function to create a Blackbox4 TUI instance.

    Args:
        prd_path: Path to PRD file
        blackbox_root: Path to Blackbox root directory
        control_scheme: Control scheme to use

    Returns:
        BlackboxTUI instance
    """
    return BlackboxTUI(
        prd_path=prd_path,
        blackbox_root=blackbox_root,
        control_scheme=control_scheme,
    )


def main():
    """CLI entry point for Blackbox4 TUI."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Blackbox4 Native TUI - Terminal User Interface"
    )
    parser.add_argument(
        "--prd",
        type=Path,
        help="Path to PRD file",
    )
    parser.add_argument(
        "--blackbox-root",
        type=Path,
        default=Path.cwd(),
        help="Path to Blackbox root directory",
    )
    parser.add_argument(
        "--control-scheme",
        choices=["default", "vim", "emacs"],
        default="default",
        help="Keyboard control scheme",
    )
    parser.add_argument(
        "--no-auto-start",
        action="store_true",
        help="Don't automatically start task execution",
    )

    args = parser.parse_args()

    # Create TUI
    tui = create_tui(
        prd_path=args.prd,
        blackbox_root=args.blackbox_root,
        control_scheme=ControlScheme(args.control_scheme),
    )
    tui.auto_start = not args.no_auto_start

    # Run TUI
    exit_code = tui.run()

    # Display summary
    tui.display_summary()

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
