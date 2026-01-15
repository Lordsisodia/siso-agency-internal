#!/usr/bin/env python3
"""
Blackbox4 TUI Demo

Demonstrates the TUI functionality with sample data.
"""

import sys
import time
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from core.tui import (
    BlackboxTUI,
    Task,
    LogEntry,
    TaskStatus,
    LogLevel,
    Priority,
)


def create_sample_tasks() -> list:
    """Create sample tasks for demonstration."""
    tasks = [
        Task(
            title="Analyze Requirements",
            description="Review and analyze project requirements",
            priority=Priority.HIGH,
            expected_output="Requirements document",
        ),
        Task(
            title="Design Architecture",
            description="Design system architecture and components",
            priority=Priority.HIGH,
            expected_output="Architecture diagram",
        ),
        Task(
            title="Implement Core Features",
            description="Implement core functionality",
            priority=Priority.CRITICAL,
            expected_output="Working core module",
        ),
        Task(
            title="Write Tests",
            description="Create unit and integration tests",
            priority=Priority.MEDIUM,
            expected_output="Test suite",
        ),
        Task(
            title="Documentation",
            description="Write user and API documentation",
            priority=Priority.LOW,
            expected_output="Documentation files",
        ),
        Task(
            title="Deploy to Production",
            description="Deploy application to production environment",
            priority=Priority.HIGH,
            expected_output="Live application",
        ),
    ]

    # Add hierarchical relationships
    for i in range(1, len(tasks)):
        tasks[i].parent_id = tasks[i-1].id
        tasks[i-1].children.append(tasks[i].id)

    return tasks


def create_sample_logs() -> list:
    """Create sample log entries."""
    logs = [
        LogEntry(
            level=LogLevel.INFO,
            message="Blackbox4 TUI initialized",
            source="system",
        ),
        LogEntry(
            level=LogLevel.SUCCESS,
            message="Loaded 6 tasks from PRD",
            source="system",
        ),
        LogEntry(
            level=LogLevel.INFO,
            message="Starting task execution",
            source="executor",
        ),
    ]

    return logs


def run_demo():
    """Run the TUI demo."""
    from blessed import Terminal

    term = Terminal()

    print(term.clear + term.bold + term.cyan)
    print("=" * 80)
    print("BLACKBOX4 TUI DEMO".center(80))
    print("=" * 80)
    print(term.normal)

    print("\nThis demo will show the Blackbox4 TUI with sample data.")
    print("\nFeatures demonstrated:")
    print("  • Split-panel layout (task list + execution log)")
    print("  • Color-coded status indicators")
    print("  • Hierarchical task display")
    print("  • Real-time progress tracking")
    print("  • Session information header")
    print("  • Keyboard controls footer")

    print("\n" + term.yellow + "Press Enter to continue..." + term.normal)
    input()

    # Create TUI instance
    tui = BlackboxTUI(
        prd_path=None,
        blackbox_root=Path.cwd(),
        auto_start=False,
    )

    # Add sample tasks
    tasks = create_sample_tasks()
    for task in tasks:
        tui.add_task(task)

    # Add sample logs
    logs = create_sample_logs()
    for log in logs:
        tui.logs.append(log)
        tui.log_panel.append(log)

    # Simulate task execution
    print(term.clear + "Starting demo execution...")
    time.sleep(1)

    # Start first task
    tui.set_current_task(tasks[0].id)
    tui.render()
    time.sleep(2)

    # Update progress
    tui.update_progress(tasks[0].id, 50)
    tui.log(LogLevel.INFO, "Processing requirements...", task_id=tasks[0].id, source="executor")
    tui.render()
    time.sleep(2)

    # Complete first task
    tui.complete_task(tasks[0].id, success=True, output="Requirements analyzed successfully")
    tui.log(LogLevel.SUCCESS, "Requirements analysis complete", task_id=tasks[0].id, source="executor")
    tui.render()
    time.sleep(2)

    # Start second task
    tui.set_current_task(tasks[1].id)
    tui.log(LogLevel.INFO, "Designing system architecture...", task_id=tasks[1].id, source="executor")
    tui.render()
    time.sleep(2)

    # Simulate an error
    tui.fail_task(tasks[2].id, "Missing dependency: database module not found")
    tui.log(LogLevel.ERROR, "Failed to start core implementation", task_id=tasks[2].id, source="executor")
    tui.render()
    time.sleep(2)

    # Continue with remaining tasks
    for i in range(3, len(tasks)):
        tui.set_current_task(tasks[i].id)
        tui.update_progress(tasks[i].id, 75)
        tui.render()
        time.sleep(1)

        tui.complete_task(tasks[i].id, success=True)
        tui.log(LogLevel.SUCCESS, f"Completed: {tasks[i].title}", task_id=tasks[i].id, source="executor")
        tui.render()
        time.sleep(1)

    # Final render
    tui.log(LogLevel.SUCCESS, "Demo execution complete!", source="system")
    tui.render()

    # Wait for user input
    print("\n" + term.yellow + "Demo complete! Press Enter to exit..." + term.normal)
    input()

    # Display summary
    print(term.clear)
    tui.display_summary()


def run_interactive_demo():
    """Run an interactive demo with full TUI controls."""
    from core.tui.models import SessionInfo

    # Create TUI with auto-start disabled for interactive demo
    tui = BlackboxTUI(
        prd_path=None,
        blackbox_root=Path.cwd(),
        auto_start=False,
    )

    # Add sample tasks
    tasks = create_sample_tasks()
    for task in tasks:
        tui.add_task(task)

    # Add sample logs
    logs = create_sample_logs()
    for log in logs:
        tui.logs.append(log)
        tui.log_panel.append(log)

    # Run the TUI
    print("\n" + "=" * 80)
    print("BLACKBOX4 INTERACTIVE TUI DEMO")
    print("=" * 80)
    print("\nControls:")
    print("  ↑/↓    - Navigate tasks")
    print("  Enter  - Select task")
    print("  p      - Pause/Resume")
    print("  s      - Skip task")
    print("  l/t    - Switch panel focus")
    print("  q      - Quit")
    print("\n" + "=" * 80)
    print("\nPress Enter to start TUI...")
    input()

    exit_code = tui.run()
    tui.display_summary()

    return exit_code


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox4 TUI Demo")
    parser.add_argument(
        "--mode",
        choices=["auto", "interactive"],
        default="auto",
        help="Demo mode (auto or interactive)",
    )

    args = parser.parse_args()

    if args.mode == "auto":
        run_demo()
    else:
        sys.exit(run_interactive_demo())


if __name__ == "__main__":
    main()
