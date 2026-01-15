#!/usr/bin/env python3
"""
Progress Monitoring Demonstration Example

This example demonstrates Ralph Runtime's comprehensive progress monitoring
capabilities. It shows real-time tracking, milestone detection, status reporting,
dashboard output, and completion prediction.

Expected Output:
- Real-time progress tracking
- Milestone detection and logging
- Status reporting at multiple levels
- Dashboard output with visual indicators
- Completion prediction with confidence
- Progress metrics and analytics
- Performance trends
"""

import sys
import os
import json
import asyncio
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from enum import Enum

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from agents.ralph_agent.runtime import RalphRuntime
from agents.ralph_agent.circuit_breaker import CircuitBreaker
from agents.ralph_agent.response_analyzer import ResponseAnalyzer
from agents.ralph_agent.progress_monitor import ProgressMonitor, Milestone


class ProgressMonitoringDemo:
    """
    Demonstrates progress monitoring in Ralph Runtime.

    Shows:
    - Real-time progress tracking
    - Milestone detection
    - Status reporting
    - Dashboard output
    - Completion prediction
    - Performance metrics
    """

    def __init__(self):
        """Initialize the progress monitoring demo."""
        self.runtime = None
        self.plan = None
        self.results = None
        self.progress_updates = []

    def create_multi_stage_plan(self) -> Dict[str, Any]:
        """
        Create a multi-stage plan for progress monitoring.

        Returns:
            Dict containing the multi-stage plan structure
        """
        print("\n=== Creating Multi-Stage Plan ===")

        plan = {
            "plan_id": "progress-monitoring-demo-001",
            "name": "Progress Monitoring Demo",
            "description": "Demonstrates progress monitoring capabilities",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate progress monitoring"
            },
            "milestones": [
                {
                    "milestone_id": "ms-1",
                    "name": "Initialization Complete",
                    "criteria": {
                        "tasks_completed": ["task-1", "task-2"]
                    }
                },
                {
                    "milestone_id": "ms-2",
                    "name": "Halfway Point",
                    "criteria": {
                        "percent_complete": 50
                    }
                },
                {
                    "milestone_id": "ms-3",
                    "name": "Core Features Complete",
                    "criteria": {
                        "tasks_completed": ["task-3", "task-4", "task-5"]
                    }
                },
                {
                    "milestone_id": "ms-4",
                    "name": "Final Stage",
                    "criteria": {
                        "percent_complete": 80
                    }
                },
                {
                    "milestone_id": "ms-5",
                    "name": "Complete",
                    "criteria": {
                        "percent_complete": 100
                    }
                }
            ],
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Initialize System",
                    "type": "setup",
                    "priority": "high",
                    "agent": "setup-agent",
                    "estimated_duration": 5,
                    "spec": {
                        "action": "initialize",
                        "parameters": {}
                    },
                    "dependencies": [],
                    "status": "pending"
                },
                {
                    "task_id": "task-2",
                    "name": "Load Configuration",
                    "type": "setup",
                    "priority": "high",
                    "agent": "setup-agent",
                    "estimated_duration": 3,
                    "spec": {
                        "action": "load_config",
                        "parameters": {}
                    },
                    "dependencies": [],
                    "status": "pending"
                },
                {
                    "task_id": "task-3",
                    "name": "Process Data",
                    "type": "processing",
                    "priority": "high",
                    "agent": "processor",
                    "estimated_duration": 10,
                    "spec": {
                        "action": "process",
                        "parameters": {
                            "batch_size": 100
                        }
                    },
                    "dependencies": ["task-1", "task-2"],
                    "status": "pending"
                },
                {
                    "task_id": "task-4",
                    "name": "Validate Results",
                    "type": "validation",
                    "priority": "high",
                    "agent": "validator",
                    "estimated_duration": 8,
                    "spec": {
                        "action": "validate",
                        "parameters": {}
                    },
                    "dependencies": ["task-3"],
                    "status": "pending"
                },
                {
                    "task_id": "task-5",
                    "name": "Generate Report",
                    "type": "reporting",
                    "priority": "medium",
                    "agent": "reporter",
                    "estimated_duration": 7,
                    "spec": {
                        "action": "generate_report",
                        "parameters": {
                            "format": "detailed"
                        }
                    },
                    "dependencies": ["task-4"],
                    "status": "pending"
                },
                {
                    "task_id": "task-6",
                    "name": "Cleanup",
                    "type": "cleanup",
                    "priority": "low",
                    "agent": "cleanup-agent",
                    "estimated_duration": 2,
                    "spec": {
                        "action": "cleanup",
                        "parameters": {}
                    },
                    "dependencies": ["task-5"],
                    "status": "pending"
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 2,
                "circuit_breaker_enabled": True,
                "progress_monitoring": {
                    "enabled": True,
                    "update_interval": 1.0,
                    "milestone_detection": True,
                    "prediction_enabled": True,
                    "dashboard_output": True
                },
                "log_level": "info"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Number of milestones: {len(plan['milestones'])}")
        print(f"✓ Total estimated duration: {sum(t.get('estimated_duration', 0) for t in plan['tasks'])}s")
        print(f"✓ Progress monitoring: enabled")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with progress monitoring configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with progress monitoring config
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
                    "milestone_detection": True,
                    "prediction_enabled": True,
                    "dashboard_output": True,
                    "detailed_logging": True
                },
                "execution": {
                    "max_retries": 2,
                    "retry_delay": 5,
                    "timeout": 300
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print("✓ Progress monitoring: enabled")
        print("✓ Milestone detection: enabled")
        print("✓ Completion prediction: enabled")
        print("✓ Dashboard output: enabled")

        return self.runtime

    def execute_with_progress_monitoring(self) -> Dict[str, Any]:
        """
        Execute plan with progress monitoring.

        Returns:
            Execution results dictionary
        """
        print("\n=== Executing with Progress Monitoring ===")

        # Load plan
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Execute with progress monitoring
        print("\nStarting execution with progress monitoring...")
        print("-" * 70)

        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._progress_callback
            )
        )

        print("-" * 70)
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

        # Store progress update
        self.progress_updates.append({
            'timestamp': datetime.now().isoformat(),
            'progress': progress
        })

        # Display progress
        progress_bar = self._create_progress_bar(percent)
        print(f"\r[{progress_bar}] {percent}% - Task {task_id}: {status}", end='')

        # Show milestone if reached
        if 'milestone' in progress:
            milestone = progress['milestone']
            print(f"\n\n★ MILESTONE REACHED: {milestone.get('name', 'Unknown')}")
            print(f"  Reached at: {datetime.now().strftime('%H:%M:%S')}")
            print(f"  Progress: {percent}%")

        # Show ETA if available
        if 'eta' in progress:
            eta = progress['eta']
            print(f"\n  ETA: {eta}")

    def _create_progress_bar(self, percent: int, width: int = 40) -> str:
        """
        Create a visual progress bar.

        Args:
            percent: Completion percentage
            width: Width of the progress bar

        Returns:
            Progress bar string
        """
        filled = int(width * percent / 100)
        bar = '█' * filled + '░' * (width - filled)
        return bar

    def show_real_time_tracking(self):
        """
        Display real-time progress tracking information.
        """
        print("\n\n=== Real-Time Progress Tracking ===")

        if not self.progress_updates:
            print("No progress updates available")
            return

        # Calculate overall progress
        latest_update = self.progress_updates[-1]['progress']
        overall_percent = latest_update.get('percent_complete', 0)

        print(f"\nOverall Progress: {overall_percent}%")
        print(f"Tasks Completed: {latest_update.get('completed_tasks', 0)}/{latest_update.get('total_tasks', 0)}")
        print(f"Elapsed Time: {latest_update.get('elapsed_time', 0):.1f}s")

        # Show progress over time
        print("\nProgress Over Time:")
        print("Time    | Progress | Active Tasks")
        print("-" * 40)

        # Sample every 10th update to avoid clutter
        for i, update in enumerate(self.progress_updates[::10]):
            timestamp = update['timestamp']
            progress = update['progress']
            percent = progress.get('percent_complete', 0)
            active_tasks = progress.get('active_tasks', 0)

            time_str = datetime.fromisoformat(timestamp).strftime('%H:%M:%S')
            print(f"{time_str} | {percent:3d}%     | {active_tasks}")

    def show_milestone_detection(self):
        """
        Display detected milestones.
        """
        print("\n\n=== Milestone Detection ===")

        if not self.results or 'milestones' not in self.results:
            print("No milestone data available")
            return

        milestones = self.results['milestones']

        print(f"\nTotal Milestones: {len(milestones)}")

        for i, milestone in enumerate(milestones, 1):
            name = milestone.get('name', 'Unknown')
            status = milestone.get('status', 'unknown')
            reached_at = milestone.get('reached_at', 'N/A')
            progress = milestone.get('progress_at_reach', 0)

            print(f"\n{i}. {name}")
            print(f"   Status: {status}")
            print(f"   Reached At: {reached_at}")
            print(f"   Progress: {progress}%")

            if status == 'reached':
                # Show time between milestones
                if i > 1:
                    prev_milestone = milestones[i - 2]
                    if 'reached_at' in prev_milestone and 'reached_at' in milestone:
                        prev_time = datetime.fromisoformat(prev_milestone['reached_at'])
                        curr_time = datetime.fromisoformat(milestone['reached_at'])
                        duration = (curr_time - prev_time).total_seconds()
                        print(f"   Time from Previous: {duration:.1f}s")

    def show_status_reporting(self):
        """
        Display status reports at multiple levels.
        """
        print("\n\n=== Status Reporting ===")

        if not self.results:
            print("⚠ No results available")
            return

        # Overall status
        overall_status = self.results.get('status', 'unknown')
        print(f"\nOverall Status: {overall_status.upper()}")

        # Task-level status
        if 'tasks' in self.results:
            print("\nTask-Level Status:")
            for task_id, task_result in self.results['tasks'].items():
                status = task_result.get('status', 'unknown')
                duration = task_result.get('duration', 0)
                print(f"  {task_id}: {status} ({duration:.1f}s)")

        # Agent-level status
        if 'agents' in self.results:
            print("\nAgent-Level Status:")
            for agent_id, agent_status in self.results['agents'].items():
                state = agent_status.get('state', 'unknown')
                tasks_completed = agent_status.get('tasks_completed', 0)
                print(f"  {agent_id}: {state} ({tasks_completed} tasks)")

        # Resource-level status
        if 'resources' in self.results:
            print("\nResource-Level Status:")
            resources = self.results['resources']
            for resource_name, resource_status in resources.items():
                usage = resource_status.get('usage', 0)
                capacity = resource_status.get('capacity', 0)
                percent = (usage / capacity * 100) if capacity > 0 else 0
                print(f"  {resource_name}: {usage}/{capacity} ({percent:.1f}%)")

    def show_dashboard_output(self):
        """
        Display dashboard output with visual indicators.
        """
        print("\n\n=== Dashboard Output ===")

        if not self.progress_updates:
            print("No progress data available for dashboard")
            return

        # Create dashboard
        dashboard = self._create_dashboard()
        print(dashboard)

    def _create_dashboard(self) -> str:
        """
        Create a visual dashboard.

        Returns:
            Dashboard string
        """
        latest = self.progress_updates[-1]['progress']
        percent = latest.get('percent_complete', 0)
        completed = latest.get('completed_tasks', 0)
        total = latest.get('total_tasks', 0)
        elapsed = latest.get('elapsed_time', 0)

        dashboard = f"""
╔════════════════════════════════════════════════════════════╗
║           RALPH RUNTIME PROGRESS DASHBOARD                 ║
╠════════════════════════════════════════════════════════════╣
║ Progress: {self._create_progress_bar(percent, 45)} {percent:3d}%     ║
║                                                            ║
║ Tasks:     {completed:3d} / {total:3d} completed                                 ║
║ Time:      {elapsed:6.1f}s elapsed                                      ║
║                                                            ║
║ Status:    {latest.get('status', 'unknown').upper():20}                              ║
╚════════════════════════════════════════════════════════════╝
"""
        return dashboard

    def show_completion_prediction(self):
        """
        Display completion prediction with confidence.
        """
        print("\n\n=== Completion Prediction ===")

        if not self.results or 'prediction' not in self.results:
            print("No prediction data available")
            return

        prediction = self.results['prediction']

        # Estimated completion time
        estimated_completion = prediction.get('estimated_completion', 'N/A')
        if estimated_completion != 'N/A':
            completion_time = datetime.fromisoformat(estimated_completion)
            print(f"\nEstimated Completion: {completion_time.strftime('%Y-%m-%d %H:%M:%S')}")

            # Time remaining
            now = datetime.now()
            time_remaining = (completion_time - now).total_seconds()
            print(f"Time Remaining: {time_remaining:.1f}s ({time_remaining/60:.1f} minutes)")

        # Confidence level
        confidence = prediction.get('confidence', 0.0)
        print(f"\nPrediction Confidence: {confidence:.2%}")

        # Confidence level indicator
        if confidence >= 0.9:
            level = "Very High"
        elif confidence >= 0.7:
            level = "High"
        elif confidence >= 0.5:
            level = "Medium"
        elif confidence >= 0.3:
            level = "Low"
        else:
            level = "Very Low"
        print(f"Confidence Level: {level}")

        # Factors affecting prediction
        factors = prediction.get('factors', [])
        if factors:
            print("\nFactors Affecting Prediction:")
            for factor in factors:
                name = factor.get('name', 'unknown')
                impact = factor.get('impact', 'unknown')
                print(f"  - {name}: {impact}")

    def show_performance_trends(self):
        """
        Display performance trends and metrics.
        """
        print("\n\n=== Performance Trends ===")

        if not self.progress_updates:
            print("No progress data available for trend analysis")
            return

        # Calculate average task completion time
        if self.results and 'tasks' in self.results:
            tasks = self.results['tasks']
            durations = [
                task.get('duration', 0)
                for task in tasks.values()
                if task.get('status') == 'completed'
            ]

            if durations:
                avg_duration = sum(durations) / len(durations)
                print(f"\nAverage Task Duration: {avg_duration:.1f}s")
                print(f"Fastest Task: {min(durations):.1f}s")
                print(f"Slowest Task: {max(durations):.1f}s")

        # Show progress velocity
        if len(self.progress_updates) > 1:
            first_update = self.progress_updates[0]['progress']
            last_update = self.progress_updates[-1]['progress']

            first_percent = first_update.get('percent_complete', 0)
            last_percent = last_update.get('percent_complete', 0)
            first_time = datetime.fromisoformat(self.progress_updates[0]['timestamp'])
            last_time = datetime.fromisoformat(self.progress_updates[-1]['timestamp'])

            time_diff = (last_time - first_time).total_seconds()
            progress_diff = last_percent - first_percent

            if time_diff > 0:
                velocity = progress_diff / time_diff
                print(f"\nProgress Velocity: {velocity:.2f}% per second")

                # Estimate remaining time based on velocity
                if velocity > 0:
                    remaining_percent = 100 - last_percent
                    estimated_remaining = remaining_percent / velocity
                    print(f"Estimated Remaining Time: {estimated_remaining:.1f}s")

    def save_results(self, output_path: str = None):
        """
        Save progress monitoring results.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "progress_monitoring_results.json"

        print(f"\n\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Add progress updates to results
        self.results['progress_updates'] = self.progress_updates

        # Save to JSON
        with open(output_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"✓ Results saved to {output_path}")

    def cleanup(self):
        """
        Clean up resources.
        """
        print("\n\n=== Cleanup ===")

        if self.runtime:
            self.runtime.shutdown()
            print("✓ Runtime shutdown complete")


def main():
    """
    Main execution function for progress monitoring demonstration.
    """
    print("=" * 70)
    print("Progress Monitoring Demonstration Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create demo instance
    demo = ProgressMonitoringDemo()

    try:
        # Step 1: Create multi-stage plan
        demo.plan = demo.create_multi_stage_plan()

        # Step 2: Initialize runtime
        demo.initialize_runtime()

        # Step 3: Execute with progress monitoring
        demo.execute_with_progress_monitoring()

        # Step 4: Show real-time tracking
        demo.show_real_time_tracking()

        # Step 5: Show milestone detection
        demo.show_milestone_detection()

        # Step 6: Show status reporting
        demo.show_status_reporting()

        # Step 7: Show dashboard output
        demo.show_dashboard_output()

        # Step 8: Show completion prediction
        demo.show_completion_prediction()

        # Step 9: Show performance trends
        demo.show_performance_trends()

        # Step 10: Save results
        demo.save_results()

        print("\n\n" + "=" * 70)
        print("✓ Progress monitoring demonstration completed successfully")
        print("=" * 70)

    except Exception as e:
        print(f"\n\n✗ Error during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        demo.cleanup()


if __name__ == "__main__":
    main()
