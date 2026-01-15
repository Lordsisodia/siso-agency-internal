"""
UI Panel Components for Blackbox4 TUI

Provides reusable panel components for the terminal interface:
- TaskListPanel: Displays task list with status indicators
- ExecutionLogPanel: Shows real-time execution logs
- SessionHeaderPanel: Session information header
- ControlsFooterPanel: Keyboard controls help footer
"""

from typing import List, Optional, Tuple
from datetime import datetime
from blessed import Terminal

from .models import Task, LogEntry, SessionInfo, TaskStatus, LogLevel


class TaskListPanel:
    """
    Panel component for displaying the task list.

    Features:
    - Hierarchical task display with indentation
    - Color-coded status indicators
    - Progress bars for in-progress tasks
    - Current task highlighting
    - Scrollable content
    """

    def __init__(self, term: Terminal, width: int = 40, height: int = 20):
        """
        Initialize task list panel.

        Args:
            term: Blessed Terminal instance
            width: Panel width
            height: Panel height
        """
        self.term = term
        self.width = width
        self.height = height
        self.scroll_offset = 0
        self.selected_task_id: Optional[str] = None

    def render(self, tasks: List[Task], current_task_id: Optional[str] = None) -> str:
        """
        Render the task list panel.

        Args:
            tasks: List of tasks to display
            current_task_id: ID of currently executing task

        Returns:
            Rendered panel string
        """
        lines = []

        # Header
        header = self._render_header()
        lines.append(header)
        lines.append(self.term.bold + "─" * self.width + self.term.normal)

        # Task list
        task_lines = self._render_tasks(tasks, current_task_id)

        # Apply scrolling
        visible_tasks = task_lines[self.scroll_offset:self.scroll_offset + self.height - 3]

        lines.extend(visible_tasks)

        # Footer
        if len(task_lines) > self.height - 3:
            scroll_indicator = f"▼ {len(task_lines) - (self.scroll_offset + self.height - 3)} more"
            lines.append(self.term.dim + scroll_indicator + self.term.normal)

        return "\n".join(lines)

    def _render_header(self) -> str:
        """Render panel header."""
        return (
            self.term.bold + self.term.cyan +
            f"{'TASK LIST':^{self.width}}" +
            self.term.normal
        )

    def _render_tasks(self, tasks: List[Task], current_task_id: Optional[str]) -> List[str]:
        """
        Render tasks as formatted lines.

        Args:
            tasks: List of tasks
            current_task_id: Current task ID for highlighting

        Returns:
            List of rendered task lines
        """
        lines = []
        task_dict = {task.id: task for task in tasks}

        # Sort tasks: pending first, then by priority
        sorted_tasks = sorted(
            tasks,
            key=lambda t: (
                t.status != TaskStatus.PENDING,
                t.priority.value != 'critical',
                t.priority.value != 'high',
                t.created_at
            )
        )

        for task in sorted_tasks:
            line = self._render_task_line(task, current_task_id, task_dict)
            lines.append(line)

            # Add children if parent is expanded
            if task.children:
                for child_id in task.children:
                    if child_id in task_dict:
                        child_task = task_dict[child_id]
                        child_line = self._render_task_line(
                            child_task, current_task_id, task_dict, indent=2
                        )
                        lines.append(child_line)

        return lines

    def _render_task_line(
        self,
        task: Task,
        current_task_id: Optional[str],
        task_dict: dict,
        indent: int = 0
    ) -> str:
        """
        Render a single task line.

        Args:
            task: Task to render
            current_task_id: Current task ID
            task_dict: Dictionary of all tasks
            indent: Indentation level

        Returns:
            Rendered task line
        """
        # Status icon
        status_icon = self._get_status_icon(task.status)

        # Priority indicator
        priority_str = self._get_priority_indicator(task.priority)

        # Task title (truncated)
        max_title_length = self.width - indent - len(status_icon) - len(priority_str) - 5
        if len(task.title) > max_title_length:
            title = task.title[:max_title_length-3] + "..."
        else:
            title = task.title

        # Highlight if current task
        if task.id == current_task_id:
            line = self.term.reverse + " " * indent + status_icon + " " + priority_str + " " + title
            line += " " * (self.width - len(line)) + self.term.normal
        elif task.id == self.selected_task_id:
            line = self.term.bright_black + " " * indent + status_icon + " " + priority_str + " " + title
            line += " " * (self.width - len(line)) + self.term.normal
        else:
            line = " " * indent + status_icon + " " + priority_str + " " + title
            line += " " * (self.width - len(line))

        return line

    def _get_status_icon(self, status: TaskStatus) -> str:
        """Get status icon with color."""
        icons = {
            TaskStatus.PENDING: "○",
            TaskStatus.IN_PROGRESS: "◉",
            TaskStatus.COMPLETED: "✓",
            TaskStatus.FAILED: "✗",
            TaskStatus.BLOCKED: "⊘",
            TaskStatus.SKIPPED: "⊝",
            TaskStatus.PAUSED: "⏸",
        }

        colors = {
            TaskStatus.PENDING: self.term.white,
            TaskStatus.IN_PROGRESS: self.term.yellow,
            TaskStatus.COMPLETED: self.term.green,
            TaskStatus.FAILED: self.term.red,
            TaskStatus.BLOCKED: self.term.bright_red,
            TaskStatus.SKIPPED: self.term.bright_black,
            TaskStatus.PAUSED: self.term.yellow,
        }

        icon = icons.get(status, "?")
        color = colors.get(status, self.term.white)

        return color + icon + self.term.normal

    def _get_priority_indicator(self, priority) -> str:
        """Get priority indicator."""
        indicators = {
            "critical": self.term.red + "!" + self.term.normal,
            "high": self.term.yellow + "+" + self.term.normal,
            "medium": self.term.blue + "•" + self.term.normal,
            "low": self.term.bright_black + "-" + self.term.normal,
        }
        return indicators.get(priority.value, "•")

    def scroll_down(self, max_lines: int):
        """Scroll down the task list."""
        if self.scroll_offset + self.height - 3 < max_lines:
            self.scroll_offset += 1

    def scroll_up(self):
        """Scroll up the task list."""
        if self.scroll_offset > 0:
            self.scroll_offset -= 1


class ExecutionLogPanel:
    """
    Panel component for displaying execution logs.

    Features:
    - Real-time log streaming
    - Color-coded log levels
    - Task association
    - Auto-scrolling
    - Scrollable history
    """

    def __init__(self, term: Terminal, width: int = 60, height: int = 20):
        """
        Initialize execution log panel.

        Args:
            term: Blessed Terminal instance
            width: Panel width
            height: Panel height
        """
        self.term = term
        self.width = width
        self.height = height
        self.logs: List[LogEntry] = []
        self.scroll_offset = 0
        self.auto_scroll = True

    def append(self, log: LogEntry):
        """
        Append a log entry.

        Args:
            log: Log entry to append
        """
        self.logs.append(log)
        if self.auto_scroll:
            self.scroll_to_bottom()

    def render(self) -> str:
        """
        Render the execution log panel.

        Returns:
            Rendered panel string
        """
        lines = []

        # Header
        header = self._render_header()
        lines.append(header)
        lines.append(self.term.bold + "─" * self.width + self.term.normal)

        # Log entries
        visible_logs = self.logs[self.scroll_offset:self.scroll_offset + self.height - 3]

        for log in visible_logs:
            line = self._render_log_line(log)
            lines.append(line)

        # Fill empty space
        while len(lines) < self.height - 1:
            lines.append(" " * self.width)

        # Footer
        footer = self._render_footer()
        lines.append(footer)

        return "\n".join(lines)

    def _render_header(self) -> str:
        """Render panel header."""
        return (
            self.term.bold + self.term.cyan +
            f"{'EXECUTION LOG':^{self.width}}" +
            self.term.normal
        )

    def _render_log_line(self, log: LogEntry) -> str:
        """
        Render a single log line.

        Args:
            log: Log entry to render

        Returns:
            Rendered log line
        """
        color = self._get_log_color(log.level)
        formatted = log.format_for_display(self.width - 2)
        return color + formatted + self.term.normal

    def _get_log_color(self, level: LogLevel) -> str:
        """Get color for log level."""
        colors = {
            LogLevel.DEBUG: self.term.bright_black,
            LogLevel.INFO: self.term.white,
            LogLevel.SUCCESS: self.term.green,
            LogLevel.WARNING: self.term.yellow,
            LogLevel.ERROR: self.term.red,
            LogLevel.CRITICAL: self.term.bright_red,
        }
        return colors.get(level, self.term.white)

    def _render_footer(self) -> str:
        """Render panel footer."""
        return (
            self.term.bold + "─" * self.width + self.term.normal +
            f" {len(self.logs)} entries"
        )

    def scroll_up(self):
        """Scroll up in logs."""
        if self.scroll_offset > 0:
            self.scroll_offset -= 1
            self.auto_scroll = False

    def scroll_down(self):
        """Scroll down in logs."""
        if self.scroll_offset + self.height - 3 < len(self.logs):
            self.scroll_offset += 1
        else:
            self.auto_scroll = True

    def scroll_to_bottom(self):
        """Scroll to the bottom of logs."""
        self.scroll_offset = max(0, len(self.logs) - self.height + 3)
        self.auto_scroll = True


class SessionHeaderPanel:
    """
    Panel component for displaying session information.

    Features:
    - Session progress
    - Task statistics
    - Duration display
    - Current task info
    """

    def __init__(self, term: Terminal, width: int = 100):
        """
        Initialize session header panel.

        Args:
            term: Blessed Terminal instance
            width: Panel width
        """
        self.term = term
        self.width = width

    def render(self, session: SessionInfo, current_task: Optional[Task] = None) -> str:
        """
        Render the session header.

        Args:
            session: Session information
            current_task: Currently executing task

        Returns:
            Rendered header string
        """
        lines = []

        # Top border
        lines.append(self.term.bold + "═" * self.width + self.term.normal)

        # Session info line
        info_line = self._render_session_info(session)
        lines.append(info_line)

        # Progress line
        progress_line = self._render_progress(session)
        lines.append(progress_line)

        # Current task line
        if current_task:
            task_line = self._render_current_task(current_task)
            lines.append(task_line)

        # Bottom border
        lines.append(self.term.bold + "═" * self.width + self.term.normal)

        return "\n".join(lines)

    def _render_session_info(self, session: SessionInfo) -> str:
        """Render session information line."""
        left = f" Session: {session.session_id}"
        center = f"Duration: {session.format_duration()}"
        right = f"{session.completed_tasks}/{session.total_tasks} tasks"

        return (
            self.term.cyan +
            left.ljust(self.width // 3) +
            center.center(self.width // 3) +
            right.rjust(self.width - 2 * (self.width // 3)) +
            " " +
            self.term.normal
        )

    def _render_progress(self, session: SessionInfo) -> str:
        """Render progress bar."""
        progress = session.progress_percent
        bar_width = self.width - 20

        filled = int(bar_width * progress / 100)
        empty = bar_width - filled

        bar = (
            self.term.green + "█" * filled +
            self.term.bright_black + "░" * empty +
            self.term.normal
        )

        return (
            self.term.bright_black +
            " Progress: " +
            self.term.normal +
            bar +
            f" {progress:.1f}% " +
            self._get_success_rate_badge(session)
        )

    def _get_success_rate_badge(self, session: SessionInfo) -> str:
        """Get success rate badge."""
        rate = session.success_rate
        if rate >= 80:
            return self.term.green + f"✓ {rate:.0f}% success" + self.term.normal
        elif rate >= 50:
            return self.term.yellow + f"⚠ {rate:.0f}% success" + self.term.normal
        else:
            return self.term.red + f"✗ {rate:.0f}% success" + self.term.normal

    def _render_current_task(self, task: Task) -> str:
        """Render current task line."""
        status_text = task.status.value.upper().replace("_", " ")

        return (
            self.term.bright_black +
            " Current: " +
            self.term.yellow +
            task.title +
            self.term.normal +
            " " +
            self.term.cyan +
            f"[{status_text}]" +
            self.term.normal +
            f" ({task.progress}%)"
        )


class ControlsFooterPanel:
    """
    Panel component for displaying keyboard controls.

    Features:
    - Control key bindings
    - Action descriptions
    - Mode indicators
    """

    def __init__(self, term: Terminal, width: int = 100):
        """
        Initialize controls footer panel.

        Args:
            term: Blessed Terminal instance
            width: Panel width
        """
        self.term = term
        self.width = width

    def render(self, controls: dict) -> str:
        """
        Render the controls footer.

        Args:
            controls: Dictionary of key -> description mappings

        Returns:
            Rendered footer string
        """
        lines = []

        # Top border
        lines.append(self.term.bold + "═" * self.width + self.term.normal)

        # Controls line
        controls_line = self._render_controls(controls)
        lines.append(controls_line)

        # Bottom border
        lines.append(self.term.bold + "═" * self.width + self.term.normal)

        return "\n".join(lines)

    def _render_controls(self, controls: dict) -> str:
        """Render controls help line."""
        parts = []

        for key, description in controls.items():
            key_str = self.term.bright_yellow + key + self.term.normal
            desc_str = self.term.bright_black + description + self.term.normal
            parts.append(f"{key_str} {desc_str}")

        line = " │ ".join(parts)

        # Center the line
        padding = (self.width - len(line)) // 2
        return " " * padding + line


class SplitLayout:
    """
    Layout manager for split-panel TUI.

    Manages the layout of multiple panels in the terminal.
    """

    def __init__(self, term: Terminal):
        """
        Initialize split layout.

        Args:
            term: Blessed Terminal instance
        """
        self.term = term
        self.width = term.width
        self.height = term.height

        # Panel widths (left panel for tasks, right for logs)
        self.task_panel_width = 40
        self.log_panel_width = self.width - self.task_panel_width - 3  # -3 for borders and spacing

        # Panel heights (leave space for header and footer)
        self.header_height = 5
        self.footer_height = 3
        self.panel_height = self.height - self.header_height - self.footer_height

    def render_full_layout(
        self,
        session: SessionInfo,
        tasks: List[Task],
        logs: List[LogEntry],
        current_task_id: Optional[str],
        controls: dict
    ) -> str:
        """
        Render the complete TUI layout.

        Args:
            session: Session information
            tasks: List of tasks
            logs: List of log entries
            current_task_id: Current task ID
            controls: Control bindings

        Returns:
            Complete rendered layout
        """
        output = []

        # Clear screen
        output.append(self.term.clear)

        # Header
        header_panel = SessionHeaderPanel(self.term, self.width)
        current_task = next((t for t in tasks if t.id == current_task_id), None)
        output.append(header_panel.render(session, current_task))

        # Split panel area
        output.append(self._render_split_panels(tasks, logs, current_task_id))

        # Footer
        footer_panel = ControlsFooterPanel(self.term, self.width)
        output.append(footer_panel.render(controls))

        return "\n".join(output)

    def _render_split_panels(
        self,
        tasks: List[Task],
        logs: List[LogEntry],
        current_task_id: Optional[str]
    ) -> str:
        """Render the split-panel area."""
        output = []

        # Top border
        output.append(self.term.bold + "║" + "═" * (self.width - 2) + "║" + self.term.normal)

        # Panel rows
        task_panel = TaskListPanel(self.term, self.task_panel_width, self.panel_height)
        log_panel = ExecutionLogPanel(self.term, self.log_panel_width, self.panel_height)

        task_lines = task_panel.render(tasks, current_task_id).split("\n")
        log_lines = log_panel.render().split("\n")

        for i in range(self.panel_height):
            task_line = task_lines[i] if i < len(task_lines) else " " * self.task_panel_width
            log_line = log_lines[i] if i < len(log_lines) else " " * self.log_panel_width

            output.append(
                self.term.bold + "║" + self.term.normal +
                task_line +
                self.term.bold + "║" + self.term.normal +
                log_line +
                self.term.bold + "║" + self.term.normal
            )

        # Bottom border
        output.append(self.term.bold + "║" + "═" * (self.width - 2) + "║" + self.term.normal)

        return "\n".join(output)
