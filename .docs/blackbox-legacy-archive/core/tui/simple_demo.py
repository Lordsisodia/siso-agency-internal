#!/usr/bin/env python3
"""
Blackbox4 TUI Simple Demo

Demonstrates the TUI layout without requiring user interaction.
"""

import sys
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from core.tui.models import Task, LogEntry, TaskStatus, LogLevel, Priority, SessionInfo
from core.tui.panels import TaskListPanel, ExecutionLogPanel, SessionHeaderPanel, ControlsFooterPanel
from blessed import Terminal


def main():
    term = Terminal()

    # Create sample data
    tasks = [
        Task(
            title="Setup Environment",
            description="Configure development environment",
            priority=Priority.HIGH,
            status=TaskStatus.COMPLETED
        ),
        Task(
            title="Design Architecture",
            description="Create system architecture design",
            priority=Priority.HIGH,
            status=TaskStatus.IN_PROGRESS,
            progress=65
        ),
        Task(
            title="Implement Core Features",
            description="Build core functionality modules",
            priority=Priority.CRITICAL,
            status=TaskStatus.PENDING
        ),
        Task(
            title="Write Tests",
            description="Create unit and integration tests",
            priority=Priority.MEDIUM,
            status=TaskStatus.PENDING
        ),
        Task(
            title="Documentation",
            description="Write API and user documentation",
            priority=Priority.LOW,
            status=TaskStatus.PENDING
        ),
        Task(
            title="Deploy to Production",
            description="Deploy application to production environment",
            priority=Priority.HIGH,
            status=TaskStatus.PENDING
        ),
    ]

    logs = [
        LogEntry(
            level=LogLevel.INFO,
            message="Blackbox4 TUI initialized",
            source="system"
        ),
        LogEntry(
            level=LogLevel.SUCCESS,
            message="Loaded 6 tasks from PRD",
            source="system"
        ),
        LogEntry(
            level=LogLevel.INFO,
            message="Starting task execution",
            source="executor"
        ),
        LogEntry(
            level=LogLevel.SUCCESS,
            message="Environment setup completed successfully",
            task_id=tasks[0].id,
            source="executor"
        ),
        LogEntry(
            level=LogLevel.INFO,
            message="Designing system architecture...",
            task_id=tasks[1].id,
            source="executor"
        ),
        LogEntry(
            level=LogLevel.WARNING,
            message="Review dependency requirements",
            task_id=tasks[1].id,
            source="executor"
        ),
    ]

    session = SessionInfo(
        total_tasks=len(tasks),
        completed_tasks=1,
        failed_tasks=0,
        current_task_id=tasks[1].id
    )

    # Create panels
    header_panel = SessionHeaderPanel(term, width=100)
    task_panel = TaskListPanel(term, width=40, height=15)
    log_panel = ExecutionLogPanel(term, width=58, height=15)
    footer_panel = ControlsFooterPanel(term, width=100)

    # Display demo
    print(term.clear)
    print(term.bold + term.cyan)
    print("=" * 100)
    print(("BLACKBOX4 TUI DEMO - Split-Panel Layout").center(100))
    print("=" * 100)
    print(term.normal)
    print()

    # Show the layout
    print(header_panel.render(session, tasks[1]))
    print()

    # Task and log panels side by side
    print("─" * 40 + "┬" + "─" * 58)
    for i in range(15):
        task_lines = task_panel.render(tasks, tasks[1].id).split("\n")
        log_lines = log_panel.render().split("\n")

        if i < len(task_lines):
            task_line = task_lines[i]
        else:
            task_line = " " * 40

        if i < len(log_lines):
            log_line = log_lines[i]
        else:
            log_line = " " * 58

        print(task_line + "│" + log_line)

    print("─" * 40 + "┴" + "─" * 58)
    print()

    # Footer
    controls = {
        '↑↓': 'Navigate',
        'Enter': 'Select',
        'p': 'Pause',
        's': 'Skip',
        'q': 'Quit',
        'l/t': 'Panel',
        'h': 'Help'
    }
    print(footer_panel.render(controls))

    print()
    print(term.bold + term.cyan + "FEATURES DEMONSTRATED:".center(100) + term.normal)
    print()
    print("  ✓ Split-panel layout (task list left, execution log right)")
    print("  ✓ Color-coded status indicators (○ pending, ◉ in-progress, ✓ completed)")
    print("  ✓ Priority indicators (! critical, + high, • medium, - low)")
    print("  ✓ Session header with progress bar")
    print("  ✓ Real-time execution log with timestamps and levels")
    print("  ✓ Keyboard controls help footer")
    print()

    # Show task details
    print(term.bold + "TASK DETAILS:".center(100) + term.normal)
    print()
    for task in tasks:
        status_icon = {
            TaskStatus.COMPLETED: "✓",
            TaskStatus.IN_PROGRESS: "◉",
            TaskStatus.PENDING: "○",
        }.get(task.status, "?")

        priority_color = {
            Priority.CRITICAL: term.red,
            Priority.HIGH: term.yellow,
            Priority.MEDIUM: term.blue,
            Priority.LOW: term.bright_black,
        }.get(task.priority, term.white)

        progress_str = f" ({task.progress}%)" if task.progress > 0 else ""

        print(f"  {status_icon} {priority_color}{task.title}{term.normal}{progress_str}")

    print()
    print(term.dim + "Demo complete! Press Ctrl+C to exit.".center(100) + term.normal)
    print()


if __name__ == "__main__":
    try:
        main()
        # Keep display for a moment
        time.sleep(5)
    except KeyboardInterrupt:
        print("\nExiting demo...")
