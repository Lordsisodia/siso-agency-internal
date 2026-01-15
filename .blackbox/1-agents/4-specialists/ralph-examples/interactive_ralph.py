#!/usr/bin/env python3
"""
Interactive Ralph Runtime Demonstration Example

This example demonstrates interactive control of Ralph Runtime execution.
It shows how users can control execution, pause/resume, inspect state,
intervene when needed, and view logs and metrics in real-time.

Expected Output:
- Interactive command prompt
- Real-time status updates
- User control over execution
- State inspection capabilities
- Intervention triggers
- Live log streaming
- Metrics dashboard
"""

import sys
import os
import json
import asyncio
import time
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from enum import Enum

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from agents.ralph_agent.runtime import RalphRuntime
from agents.ralph_agent.circuit_breaker import CircuitBreaker
from agents.ralph_agent.response_analyzer import ResponseAnalyzer
from agents.ralph_agent.progress_monitor import ProgressMonitor


class CommandType(Enum):
    """Types of interactive commands."""
    START = "start"
    PAUSE = "pause"
    RESUME = "resume"
    STOP = "stop"
    STATUS = "status"
    INSPECT = "inspect"
    LOGS = "logs"
    METRICS = "metrics"
    HELP = "help"
    EXIT = "exit"


class InteractiveRalph:
    """
    Demonstrates interactive control of Ralph Runtime.

    Shows:
    - User control over execution
    - Pause/resume/stop capabilities
    - State inspection
    - Intervention mechanisms
    - Real-time log viewing
    - Metrics dashboard
    """

    def __init__(self):
        """Initialize the interactive Ralph demo."""
        self.runtime = None
        self.plan = None
        self.results = None
        self.execution_state = "idle"
        self.user_commands = []
        self.log_stream = []

    def create_interactive_plan(self) -> Dict[str, Any]:
        """
        Create a plan suitable for interactive execution.

        Returns:
            Dict containing the interactive plan structure
        """
        print("\n=== Creating Interactive Plan ===")

        plan = {
            "plan_id": "interactive-ralph-001",
            "name": "Interactive Ralph Demo",
            "description": "Demonstrates interactive control of Ralph Runtime",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate interactive control"
            },
            "intervention_points": [
                {
                    "point_id": "ip-1",
                    "name": "Pre-execution Check",
                    "description": "Review plan before execution",
                    "trigger": "before_task_1"
                },
                {
                    "point_id": "ip-2",
                    "name": "Mid-execution Review",
                    "description": "Review progress at 50%",
                    "trigger": "percent_50"
                },
                {
                    "point_id": "ip-3",
                    "name": "Critical Decision Point",
                    "description": "User approval required",
                    "trigger": "before_critical_task"
                }
            ],
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Initial Setup",
                    "type": "setup",
                    "priority": "high",
                    "agent": "setup-agent",
                    "spec": {
                        "action": "setup",
                        "parameters": {}
                    },
                    "dependencies": [],
                    "status": "pending",
                    "allow_intervention": True
                },
                {
                    "task_id": "task-2",
                    "name": "Data Processing",
                    "type": "processing",
                    "priority": "high",
                    "agent": "processor",
                    "spec": {
                        "action": "process",
                        "parameters": {
                            "batch_size": 50
                        }
                    },
                    "dependencies": ["task-1"],
                    "status": "pending",
                    "allow_intervention": True
                },
                {
                    "task_id": "task-3",
                    "name": "Critical Operation",
                    "type": "critical",
                    "priority": "high",
                    "agent": "executor",
                    "spec": {
                        "action": "critical_operation",
                        "parameters": {
                            "requires_approval": True
                        }
                    },
                    "dependencies": ["task-2"],
                    "status": "pending",
                    "allow_intervention": True,
                    "require_user_approval": True
                },
                {
                    "task_id": "task-4",
                    "name": "Validation",
                    "type": "validation",
                    "priority": "medium",
                    "agent": "validator",
                    "spec": {
                        "action": "validate",
                        "parameters": {}
                    },
                    "dependencies": ["task-3"],
                    "status": "pending",
                    "allow_intervention": True
                },
                {
                    "task_id": "task-5",
                    "name": "Finalization",
                    "type": "finalization",
                    "priority": "low",
                    "agent": "finalizer",
                    "spec": {
                        "action": "finalize",
                        "parameters": {}
                    },
                    "dependencies": ["task-4"],
                    "status": "pending",
                    "allow_intervention": False
                }
            ],
            "execution_config": {
                "mode": "interactive",
                "max_parallel_tasks": 1,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "interaction": {
                    "enabled": True,
                    "pause_on_intervention": True,
                    "allow_state_inspection": True,
                    "allow_log_streaming": True,
                    "real_time_updates": True
                },
                "log_level": "info"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Intervention points: {len(plan['intervention_points'])}")
        print(f"✓ Interactive mode: enabled")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with interactive configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with interactive config
        self.runtime = RalphRuntime(
            workspace_path=Path.cwd() / ".blackbox4",
            config={
                "circuit_breaker": {
                    "enabled": True,
                    "failure_threshold": 3,
                    "recovery_timeout": 60
                },
                "progress_monitoring": {
                    "enabled": True,
                    "update_interval": 0.5,
                    "log_progress": True
                },
                "execution": {
                    "max_retries": 2,
                    "retry_delay": 5,
                    "timeout": 300
                },
                "interaction": {
                    "enabled": True,
                    "pause_on_intervention": True,
                    "allow_state_inspection": True,
                    "allow_log_streaming": True,
                    "real_time_updates": True
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print("✓ Interactive controls: enabled")
        print("✓ State inspection: enabled")
        print("✓ Log streaming: enabled")

        return self.runtime

    def start_interactive_session(self):
        """
        Start the interactive command session.
        """
        print("\n" + "=" * 70)
        print("INTERACTIVE RALPH RUNTIME SESSION")
        print("=" * 70)
        print("\nType 'help' for available commands")
        print("Type 'start' to begin execution")
        print("-" * 70)

        # Start command loop
        self._command_loop()

    def _command_loop(self):
        """
        Main command processing loop.
        """
        while True:
            try:
                # Get user input
                command_input = input(f"\n[{self.execution_state.upper()}]> ").strip().lower()

                if not command_input:
                    continue

                # Parse command
                parts = command_input.split()
                command = parts[0]
                args = parts[1:] if len(parts) > 1 else []

                # Process command
                if command == CommandType.HELP.value:
                    self._show_help()
                elif command == CommandType.EXIT.value:
                    print("\nExiting interactive session...")
                    break
                elif command == CommandType.START.value:
                    self._handle_start()
                elif command == CommandType.PAUSE.value:
                    self._handle_pause()
                elif command == CommandType.RESUME.value:
                    self._handle_resume()
                elif command == CommandType.STOP.value:
                    self._handle_stop()
                elif command == CommandType.STATUS.value:
                    self._handle_status()
                elif command == CommandType.INSPECT.value:
                    self._handle_inspect(args)
                elif command == CommandType.LOGS.value:
                    self._handle_logs(args)
                elif command == CommandType.METRICS.value:
                    self._handle_metrics()
                else:
                    print(f"Unknown command: {command}. Type 'help' for available commands.")

            except KeyboardInterrupt:
                print("\n\nUse 'exit' to quit the session")
            except EOFError:
                print("\n\nExiting interactive session...")
                break

    def _show_help(self):
        """Display help information."""
        print("\n" + "=" * 70)
        print("AVAILABLE COMMANDS")
        print("=" * 70)
        print("\nExecution Control:")
        print("  start          - Start plan execution")
        print("  pause          - Pause execution")
        print("  resume         - Resume paused execution")
        print("  stop           - Stop execution")
        print("\nInformation:")
        print("  status         - Show execution status")
        print("  inspect [id]   - Inspect state (task/agent/all)")
        print("  logs [n]       - Show last n log entries (default: 10)")
        print("  metrics        - Show execution metrics")
        print("\nOther:")
        print("  help           - Show this help message")
        print("  exit           - Exit interactive session")
        print("=" * 70)

    def _handle_start(self):
        """Handle start command."""
        if self.execution_state != "idle":
            print("Execution already in progress")
            return

        print("\nStarting execution...")
        self.execution_state = "running"

        # Load plan
        if not self.plan:
            print("No plan loaded. Creating default plan...")
            self.plan = self.create_interactive_plan()

        self.runtime.load_plan(self.plan)

        # Start execution in background
        def execute():
            self.results = asyncio.run(
                self.runtime.execute_autonomous(
                    plan_id=self.plan['plan_id'],
                    callback=self._progress_callback
                )
            )
            self.execution_state = "completed"

        thread = threading.Thread(target=execute)
        thread.daemon = True
        thread.start()

        print("✓ Execution started")

    def _handle_pause(self):
        """Handle pause command."""
        if self.execution_state != "running":
            print("Cannot pause: execution not running")
            return

        print("\nPausing execution...")
        self.execution_state = "paused"

        # Pause runtime
        if self.runtime:
            self.runtime.pause()

        print("✓ Execution paused")

    def _handle_resume(self):
        """Handle resume command."""
        if self.execution_state != "paused":
            print("Cannot resume: execution not paused")
            return

        print("\nResuming execution...")
        self.execution_state = "running"

        # Resume runtime
        if self.runtime:
            self.runtime.resume()

        print("✓ Execution resumed")

    def _handle_stop(self):
        """Handle stop command."""
        if self.execution_state not in ["running", "paused"]:
            print("Cannot stop: execution not active")
            return

        print("\nStopping execution...")
        self.execution_state = "stopped"

        # Stop runtime
        if self.runtime:
            self.runtime.stop()

        print("✓ Execution stopped")

    def _handle_status(self):
        """Handle status command."""
        print("\n" + "=" * 70)
        print("EXECUTION STATUS")
        print("=" * 70)

        print(f"\nState: {self.execution_state.upper()}")

        if self.runtime:
            progress = self.runtime.get_progress()
            print(f"Progress: {progress.get('percent_complete', 0)}%")
            print(f"Tasks Completed: {progress.get('completed_tasks', 0)}/{progress.get('total_tasks', 0)}")
            print(f"Elapsed Time: {progress.get('elapsed_time', 0):.1f}s")

        print("=" * 70)

    def _handle_inspect(self, args):
        """
        Handle inspect command.

        Args:
            args: Command arguments
        """
        target = args[0] if args else "all"

        print("\n" + "=" * 70)
        print(f"STATE INSPECTION: {target.upper()}")
        print("=" * 70)

        if not self.runtime:
            print("Runtime not initialized")
            return

        if target in ["all", "plan"]:
            print("\n--- Plan State ---")
            if self.plan:
                print(f"Plan ID: {self.plan.get('plan_id', 'unknown')}")
                print(f"Name: {self.plan.get('name', 'unknown')}")
                print(f"Tasks: {len(self.plan.get('tasks', []))}")

        if target in ["all", "tasks"]:
            print("\n--- Task States ---")
            if self.plan:
                for task in self.plan.get('tasks', []):
                    task_id = task.get('task_id', 'unknown')
                    status = task.get('status', 'unknown')
                    print(f"  {task_id}: {status}")

        if target in ["all", "agents"]:
            print("\n--- Agent States ---")
            agents = self.runtime.get_agent_states()
            for agent_id, state in agents.items():
                print(f"  {agent_id}: {state.get('status', 'unknown')}")

        if target in ["all", "runtime"]:
            print("\n--- Runtime State ---")
            runtime_state = self.runtime.get_state()
            print(f"Active Threads: {runtime_state.get('active_threads', 0)}")
            print(f"Memory Usage: {runtime_state.get('memory_usage', 'unknown')}")
            print(f"CPU Usage: {runtime_state.get('cpu_usage', 'unknown')}")

        print("=" * 70)

    def _handle_logs(self, args):
        """
        Handle logs command.

        Args:
            args: Command arguments
        """
        count = int(args[0]) if args and args[0].isdigit() else 10

        print("\n" + "=" * 70)
        print(f"LOG ENTRIES (Last {count})")
        print("=" * 70)

        if not self.runtime:
            print("Runtime not initialized")
            return

        logs = self.runtime.get_logs(count=count)

        if not logs:
            print("No logs available")
            return

        for log in logs:
            timestamp = log.get('timestamp', 'unknown')
            level = log.get('level', 'info')
            message = log.get('message', '')

            print(f"\n[{timestamp}] {level.upper()}")
            print(f"  {message}")

        print("=" * 70)

    def _handle_metrics(self):
        """Handle metrics command."""
        print("\n" + "=" * 70)
        print("EXECUTION METRICS")
        print("=" * 70)

        if not self.results:
            print("No metrics available yet")
            return

        metrics = self.results.get('metrics', {})

        print(f"\nTasks: {metrics.get('total_tasks', 0)} total, {metrics.get('completed_tasks', 0)} completed")
        print(f"Time: {metrics.get('total_time', 0):.1f}s")
        print(f"Decisions: {metrics.get('decisions_made', 0)}")

        if 'errors' in metrics:
            print(f"Errors: {metrics['errors']}")

        print("=" * 70)

    def _progress_callback(self, progress: Dict[str, Any]):
        """
        Callback function for progress updates during execution.

        Args:
            progress: Progress update dictionary
        """
        task_id = progress.get('task_id', 'unknown')
        status = progress.get('status', 'unknown')

        # Check for intervention point
        if 'intervention' in progress:
            intervention = progress['intervention']
            print(f"\n⚠ INTERVENTION POINT: {intervention.get('name', 'Unknown')}")
            print(f"  {intervention.get('description', '')}")

            # Pause for user intervention
            self.execution_state = "awaiting_intervention"
            input("\nPress Enter to continue...")

            self.execution_state = "running"

        # Log the update
        self.log_stream.append({
            'timestamp': datetime.now().isoformat(),
            'task_id': task_id,
            'status': status
        })

        # Show progress if running
        if self.execution_state == "running":
            percent = progress.get('percent_complete', 0)
            print(f"\r[{task_id}] {status} - {percent}%", end='')

    def save_results(self, output_path: str = None):
        """
        Save interactive session results.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "interactive_ralph_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        results = {
            'session_type': 'interactive',
            'plan': self.plan,
            'execution_state': self.execution_state,
            'commands': self.user_commands,
            'log_stream': self.log_stream,
            'results': self.results
        }

        # Save to JSON
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        print(f"✓ Results saved to {output_path}")

    def cleanup(self):
        """
        Clean up resources.
        """
        print("\n=== Cleanup ===")

        if self.runtime:
            self.runtime.shutdown()
            print("✓ Runtime shutdown complete")


def main():
    """
    Main execution function for interactive Ralph demonstration.
    """
    print("=" * 70)
    print("Interactive Ralph Runtime Demonstration Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create interactive instance
    interactive = InteractiveRalph()

    try:
        # Step 1: Create interactive plan
        interactive.plan = interactive.create_interactive_plan()

        # Step 2: Initialize runtime
        interactive.initialize_runtime()

        # Step 3: Start interactive session
        interactive.start_interactive_session()

        # Step 4: Save results after session
        interactive.save_results()

        print("\n" + "=" * 70)
        print("✓ Interactive session completed successfully")
        print("=" * 70)

    except Exception as e:
        print(f"\n✗ Error during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        interactive.cleanup()


if __name__ == "__main__":
    main()
