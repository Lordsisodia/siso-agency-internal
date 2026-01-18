#!/usr/bin/env python3
"""
Basic Autonomous Execution Example for Ralph Runtime

This example demonstrates the basic autonomous execution capabilities of Ralph Runtime.
It shows how to create a simple plan, execute it autonomously, monitor progress, and
handle completion.

Expected Output:
- Plan creation confirmation
- Task execution progress
- Autonomous decisions made
- Completion status
- Execution logs and results
"""

import sys
import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from agents.ralph_agent.runtime import RalphRuntime
from agents.ralph_agent.circuit_breaker import CircuitBreaker
from agents.ralph_agent.response_analyzer import ResponseAnalyzer
from agents.ralph_agent.progress_monitor import ProgressMonitor


class BasicAutonomousExecution:
    """
    Demonstrates basic autonomous execution workflow with Ralph Runtime.

    This class shows:
    - Plan creation and validation
    - Autonomous task execution
    - Progress monitoring
    - Completion handling
    - Result extraction
    """

    def __init__(self):
        """Initialize the autonomous execution example."""
        self.runtime = None
        self.plan = None
        self.results = None

    def create_simple_plan(self) -> Dict[str, Any]:
        """
        Create a simple plan for autonomous execution.

        Returns:
            Dict containing the plan structure
        """
        print("\n=== Creating Simple Plan ===")

        plan = {
            "plan_id": "basic-autonomous-001",
            "name": "Basic Autonomous Demo",
            "description": "Demonstrates basic autonomous execution",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate autonomous execution"
            },
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Initialize Context",
                    "type": "context",
                    "priority": "high",
                    "agent": "context-manager",
                    "spec": {
                        "action": "initialize",
                        "parameters": {
                            "workspace": ".blackbox4",
                            "modules": ["planning", "execution", "monitoring"]
                        }
                    },
                    "dependencies": [],
                    "status": "pending"
                },
                {
                    "task_id": "task-2",
                    "name": "Analyze Requirements",
                    "type": "analysis",
                    "priority": "high",
                    "agent": "analyst",
                    "spec": {
                        "action": "analyze",
                        "parameters": {
                            "requirements": [
                                "Autonomous execution",
                                "Progress monitoring",
                                "Error handling"
                            ]
                        }
                    },
                    "dependencies": ["task-1"],
                    "status": "pending"
                },
                {
                    "task_id": "task-3",
                    "name": "Execute Tasks",
                    "type": "execution",
                    "priority": "medium",
                    "agent": "executor",
                    "spec": {
                        "action": "execute",
                        "parameters": {
                            "strategy": "autonomous",
                            "timeout": 300
                        }
                    },
                    "dependencies": ["task-2"],
                    "status": "pending"
                },
                {
                    "task_id": "task-4",
                    "name": "Generate Report",
                    "type": "reporting",
                    "priority": "low",
                    "agent": "reporter",
                    "spec": {
                        "action": "generate",
                        "parameters": {
                            "format": "json",
                            "include_logs": True
                        }
                    },
                    "dependencies": ["task-3"],
                    "status": "pending"
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 2,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "log_level": "info"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Plan name: {plan['name']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Execution mode: {plan['execution_config']['mode']}")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with basic configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with basic config
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
                    "update_interval": 1.0,
                    "log_progress": True
                },
                "execution": {
                    "max_retries": 2,
                    "retry_delay": 5,
                    "timeout": 300
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print(f"✓ Workspace: {self.runtime.workspace_path}")
        print(f"✓ Circuit breaker: enabled")
        print(f"✓ Progress monitoring: enabled")

        return self.runtime

    def execute_autonomously(self) -> Dict[str, Any]:
        """
        Execute the plan autonomously.

        Returns:
            Execution results dictionary
        """
        print("\n=== Starting Autonomous Execution ===")

        # Load plan into runtime
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Start execution
        print("\nStarting autonomous execution...")
        print("-" * 50)

        # Execute autonomously (blocking until complete)
        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._progress_callback
            )
        )

        print("-" * 50)
        print("✓ Execution completed")

        return self.results

    def _progress_callback(self, progress: Dict[str, Any]):
        """
        Callback function for progress updates.

        Args:
            progress: Progress update dictionary
        """
        task_id = progress.get('task_id', 'unknown')
        status = progress.get('status', 'unknown')
        percent = progress.get('percent_complete', 0)

        # Print progress update
        print(f"[Progress] Task {task_id}: {status} ({percent}%)")

        # Print autonomous decisions if any
        if 'decision' in progress:
            decision = progress['decision']
            print(f"[Decision] {decision.get('type', 'unknown')}: {decision.get('description', '')}")

    def monitor_progress(self):
        """
        Monitor execution progress in real-time.
        """
        print("\n=== Monitoring Progress ===")

        if not self.runtime:
            print("⚠ Runtime not initialized")
            return

        # Get current progress
        progress = self.runtime.get_progress()

        print(f"Plan ID: {progress['plan_id']}")
        print(f"Status: {progress['status']}")
        print(f"Tasks Completed: {progress['completed_tasks']}/{progress['total_tasks']}")
        print(f"Progress: {progress['percent_complete']}%")
        print(f"Elapsed Time: {progress['elapsed_time']:.2f}s")

        # Show task statuses
        print("\nTask Statuses:")
        for task_id, task_status in progress['tasks'].items():
            print(f"  {task_id}: {task_status}")

    def handle_completion(self):
        """
        Handle completion of autonomous execution.
        """
        print("\n=== Handling Completion ===")

        if not self.results:
            print("⚠ No results available")
            return

        # Check completion status
        status = self.results.get('status', 'unknown')
        print(f"Completion Status: {status}")

        # Show task results
        if 'tasks' in self.results:
            print("\nTask Results:")
            for task_id, task_result in self.results['tasks'].items():
                task_status = task_result.get('status', 'unknown')
                print(f"  {task_id}: {task_status}")

                # Show errors if any
                if 'error' in task_result:
                    print(f"    Error: {task_result['error']}")

        # Show autonomous decisions made
        if 'decisions' in self.results:
            print("\nAutonomous Decisions Made:")
            for i, decision in enumerate(self.results['decisions'], 1):
                print(f"  {i}. {decision.get('type', 'unknown')}")
                print(f"     Description: {decision.get('description', '')}")
                print(f"     Confidence: {decision.get('confidence', 0):.2f}")

        # Show metrics
        if 'metrics' in self.results:
            print("\nExecution Metrics:")
            metrics = self.results['metrics']
            print(f"  Total Tasks: {metrics.get('total_tasks', 0)}")
            print(f"  Completed: {metrics.get('completed_tasks', 0)}")
            print(f"  Failed: {metrics.get('failed_tasks', 0)}")
            print(f"  Total Time: {metrics.get('total_time', 0):.2f}s")
            print(f"  Decisions Made: {metrics.get('decisions_made', 0)}")

    def show_logs(self):
        """
        Display execution logs.
        """
        print("\n=== Execution Logs ===")

        if not self.runtime:
            print("⚠ Runtime not initialized")
            return

        # Get logs from runtime
        logs = self.runtime.get_logs()

        if not logs:
            print("No logs available")
            return

        # Display logs
        for log_entry in logs:
            timestamp = log_entry.get('timestamp', 'unknown')
            level = log_entry.get('level', 'info')
            message = log_entry.get('message', '')

            print(f"[{timestamp}] {level.upper()}: {message}")

    def save_results(self, output_path: str = None):
        """
        Save execution results to file.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "basic_execution_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Save results to JSON file
        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)

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
    Main execution function for basic autonomous execution example.
    """
    print("=" * 60)
    print("Basic Autonomous Execution Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 60)

    # Create execution instance
    executor = BasicAutonomousExecution()

    try:
        # Step 1: Create plan
        plan = executor.create_simple_plan()
        executor.plan = plan

        # Step 2: Initialize runtime
        executor.initialize_runtime()

        # Step 3: Execute autonomously
        executor.execute_autonomously()

        # Step 4: Monitor progress
        executor.monitor_progress()

        # Step 5: Handle completion
        executor.handle_completion()

        # Step 6: Show logs
        executor.show_logs()

        # Step 7: Save results
        executor.save_results()

        print("\n" + "=" * 60)
        print("✓ Basic autonomous execution completed successfully")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ Error during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        executor.cleanup()


if __name__ == "__main__":
    main()
