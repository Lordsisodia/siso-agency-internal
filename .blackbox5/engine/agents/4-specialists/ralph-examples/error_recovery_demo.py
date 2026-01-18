#!/usr/bin/env python3
"""
Error Recovery Demonstration Example

This example demonstrates Ralph Runtime's comprehensive error handling and
recovery mechanisms. It shows error detection, automatic recovery strategies,
human escalation, and resumption after recovery.

Expected Output:
- Various error scenarios
- Automatic error detection
- Recovery strategy selection
- Automatic recovery attempts
- Human escalation triggers
- Recovery completion
- Resume after recovery
- Error logs and metrics
"""

import sys
import os
import json
import asyncio
import time
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


class ErrorType(Enum):
    """Types of errors that can occur during execution."""
    NETWORK_ERROR = "network_error"
    TIMEOUT_ERROR = "timeout_error"
    VALIDATION_ERROR = "validation_error"
    RESOURCE_ERROR = "resource_error"
    DEPENDENCY_ERROR = "dependency_error"
    PERMISSION_ERROR = "permission_error"
    DATA_ERROR = "data_error"
    UNKNOWN_ERROR = "unknown_error"


class ErrorSeverity(Enum):
    """Severity levels for errors."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorRecoveryDemo:
    """
    Demonstrates error detection and recovery in Ralph Runtime.

    Shows:
    - Various error scenarios
    - Automatic error detection
    - Recovery strategy selection
    - Automatic recovery attempts
    - Human escalation triggers
    - Recovery completion
    - Resume after recovery
    """

    def __init__(self):
        """Initialize the error recovery demo."""
        self.runtime = None
        self.plan = None
        self.results = None
        self.error_log = []

    def create_error_prone_plan(self) -> Dict[str, Any]:
        """
        Create a plan with tasks that may trigger errors.

        Returns:
            Dict containing the error-prone plan structure
        """
        print("\n=== Creating Error-Prone Plan ===")

        plan = {
            "plan_id": "error-recovery-demo-001",
            "name": "Error Recovery Demo",
            "description": "Demonstrates error handling and recovery",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate error recovery"
            },
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Normal Operation",
                    "type": "normal",
                    "priority": "high",
                    "agent": "executor",
                    "spec": {
                        "action": "normal_operation",
                        "parameters": {}
                    },
                    "dependencies": [],
                    "status": "pending",
                    "error_scenarios": []
                },
                {
                    "task_id": "task-2",
                    "name": "Network Error Operation",
                    "type": "risky",
                    "priority": "high",
                    "agent": "executor",
                    "spec": {
                        "action": "network_operation",
                        "parameters": {
                            "simulate_error": True,
                            "error_type": ErrorType.NETWORK_ERROR.value,
                            "error_probability": 0.7
                        }
                    },
                    "dependencies": ["task-1"],
                    "status": "pending",
                    "error_scenarios": [ErrorType.NETWORK_ERROR.value]
                },
                {
                    "task_id": "task-3",
                    "name": "Timeout Operation",
                    "type": "risky",
                    "priority": "medium",
                    "agent": "executor",
                    "spec": {
                        "action": "slow_operation",
                        "parameters": {
                            "simulate_error": True,
                            "error_type": ErrorType.TIMEOUT_ERROR.value,
                            "delay": 10  # Will timeout if timeout < 10s
                        }
                    },
                    "dependencies": ["task-2"],
                    "status": "pending",
                    "error_scenarios": [ErrorType.TIMEOUT_ERROR.value]
                },
                {
                    "task_id": "task-4",
                    "name": "Validation Error Operation",
                    "type": "risky",
                    "priority": "medium",
                    "agent": "executor",
                    "spec": {
                        "action": "validate_data",
                        "parameters": {
                            "simulate_error": True,
                            "error_type": ErrorType.VALIDATION_ERROR.value,
                            "invalid_data": True
                        }
                    },
                    "dependencies": ["task-3"],
                    "status": "pending",
                    "error_scenarios": [ErrorType.VALIDATION_ERROR.value]
                },
                {
                    "task_id": "task-5",
                    "name": "Resource Error Operation",
                    "type": "risky",
                    "priority": "high",
                    "agent": "executor",
                    "spec": {
                        "action": "resource_operation",
                        "parameters": {
                            "simulate_error": True,
                            "error_type": ErrorType.RESOURCE_ERROR.value,
                            "resource_exhausted": True
                        }
                    },
                    "dependencies": ["task-4"],
                    "status": "pending",
                    "error_scenarios": [ErrorType.RESOURCE_ERROR.value]
                },
                {
                    "task_id": "task-6",
                    "name": "Critical Error Operation",
                    "type": "critical",
                    "priority": "high",
                    "agent": "executor",
                    "spec": {
                        "action": "critical_operation",
                        "parameters": {
                            "simulate_error": True,
                            "error_type": ErrorType.UNKNOWN_ERROR.value,
                            "error_severity": ErrorSeverity.CRITICAL.value
                        }
                    },
                    "dependencies": ["task-5"],
                    "status": "pending",
                    "error_scenarios": [ErrorType.UNKNOWN_ERROR.value]
                },
                {
                    "task_id": "task-7",
                    "name": "Recovery Operation",
                    "type": "recovery",
                    "priority": "high",
                    "agent": "recovery-agent",
                    "spec": {
                        "action": "attempt_recovery",
                        "parameters": {
                            "max_attempts": 3
                        }
                    },
                    "dependencies": ["task-6"],
                    "status": "pending",
                    "error_scenarios": []
                },
                {
                    "task_id": "task-8",
                    "name": "Final Normal Operation",
                    "type": "normal",
                    "priority": "medium",
                    "agent": "executor",
                    "spec": {
                        "action": "normal_operation",
                        "parameters": {}
                    },
                    "dependencies": ["task-7"],
                    "status": "pending",
                    "error_scenarios": []
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 2,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "error_handling": {
                    "enabled": True,
                    "auto_recovery": True,
                    "max_retry_attempts": 3,
                    "escalation_threshold": 2,
                    "human_intervention_required": ["critical"]
                },
                "log_level": "debug"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Error-prone tasks: 5")
        print(f"✓ Error handling: enabled")
        print(f"✓ Auto-recovery: enabled")

        # Show error scenarios
        print("\nConfigured Error Scenarios:")
        error_counts = {}
        for task in plan['tasks']:
            for scenario in task.get('error_scenarios', []):
                error_counts[scenario] = error_counts.get(scenario, 0) + 1

        for error_type, count in error_counts.items():
            print(f"  - {error_type}: {count} task(s)")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with error handling configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with error handling config
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
                    "max_retries": 3,
                    "retry_delay": 2,
                    "timeout": 5
                },
                "error_handling": {
                    "enabled": True,
                    "detection_enabled": True,
                    "auto_recovery_enabled": True,
                    "recovery_strategies": {
                        ErrorType.NETWORK_ERROR.value: ["retry", "fallback", "escalate"],
                        ErrorType.TIMEOUT_ERROR.value: ["retry_with_backoff", "escalate"],
                        ErrorType.VALIDATION_ERROR.value: ["fix_and_retry", "escalate"],
                        ErrorType.RESOURCE_ERROR.value: ["wait_and_retry", "escalate"],
                        ErrorType.DEPENDENCY_ERROR.value: ["resolve_dependencies", "retry"],
                        ErrorType.PERMISSION_ERROR.value: ["escalate"],
                        ErrorType.DATA_ERROR.value: ["clean_data", "retry"],
                        ErrorType.UNKNOWN_ERROR.value: ["escalate"]
                    },
                    "escalation_threshold": 2,
                    "human_intervention_triggers": [
                        ErrorSeverity.CRITICAL.value
                    ]
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print("✓ Error detection: enabled")
        print("✓ Auto-recovery: enabled")
        print("✓ Human escalation: enabled for critical errors")

        return self.runtime

    def execute_with_error_recovery(self) -> Dict[str, Any]:
        """
        Execute plan with error recovery mechanisms.

        Returns:
            Execution results dictionary
        """
        print("\n=== Executing with Error Recovery ===")

        # Load plan
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Execute with error recovery
        print("\nStarting execution with error recovery...")
        print("-" * 70)

        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._error_recovery_callback
            )
        )

        print("-" * 70)
        print("✓ Execution completed")

        return self.results

    def _error_recovery_callback(self, progress: Dict[str, Any]):
        """
        Callback function for error recovery updates.

        Args:
            progress: Progress update dictionary
        """
        task_id = progress.get('task_id', 'unknown')
        status = progress.get('status', 'unknown')

        # Normal progress
        if 'error' not in progress:
            print(f"[Progress] Task {task_id}: {status}")
            return

        # Error detected
        error = progress['error']
        error_type = error.get('type', 'unknown')
        error_message = error.get('message', 'No message')
        severity = error.get('severity', 'unknown')

        print(f"\n[✗ ERROR] Task {task_id}")
        print(f"  Type: {error_type}")
        print(f"  Severity: {severity}")
        print(f"  Message: {error_message}")

        # Log error
        self.error_log.append({
            'timestamp': datetime.now().isoformat(),
            'task_id': task_id,
            'error': error
        })

        # Check for recovery action
        if 'recovery' in progress:
            recovery = progress['recovery']
            recovery_strategy = recovery.get('strategy', 'unknown')
            recovery_status = recovery.get('status', 'unknown')

            print(f"\n[RECOVERY] {recovery_strategy.upper()}")
            print(f"  Status: {recovery_status}")

            if recovery_status == 'attempting':
                attempt = recovery.get('attempt', 1)
                max_attempts = recovery.get('max_attempts', 3)
                print(f"  Attempt: {attempt}/{max_attempts}")

            elif recovery_status == 'success':
                print(f"  ✓ Recovery successful")

            elif recovery_status == 'failed':
                print(f"  ✗ Recovery failed")

        # Check for escalation
        if 'escalation' in progress:
            escalation = progress['escalation']
            escalation_type = escalation.get('type', 'unknown')
            escalation_reason = escalation.get('reason', 'unknown')

            print(f"\n[⚠ ESCALATION] {escalation_type.upper()}")
            print(f"  Reason: {escalation_reason}")

            if escalation_type == 'human_intervention':
                print(f"  Action Required: Human intervention needed")
                print(f"  Instructions: {escalation.get('instructions', 'N/A')}")

    def demonstrate_error_detection(self):
        """
        Demonstrate automatic error detection.
        """
        print("\n=== Error Detection Demonstration ===")

        if not self.error_log:
            print("No errors detected during execution")
            return

        print(f"\nErrors Detected: {len(self.error_log)}")

        # Group errors by type
        error_types = {}
        for log_entry in self.error_log:
            error_type = log_entry['error'].get('type', 'unknown')
            if error_type not in error_types:
                error_types[error_type] = []
            error_types[error_type].append(log_entry)

        # Show errors by type
        for error_type, errors in error_types.items():
            print(f"\n{error_type.upper()}: {len(errors)} occurrence(s)")

            for error in errors:
                task_id = error['task_id']
                timestamp = error['timestamp']
                severity = error['error'].get('severity', 'unknown')

                print(f"  - Task: {task_id}")
                print(f"    Time: {timestamp}")
                print(f"    Severity: {severity}")

    def demonstrate_recovery_strategies(self):
        """
        Demonstrate recovery strategy selection and execution.
        """
        print("\n=== Recovery Strategies Demonstration ===")

        if not self.results or 'recoveries' not in self.results:
            print("No recovery attempts recorded")
            return

        recoveries = self.results['recoveries']

        print(f"\nTotal Recovery Attempts: {len(recoveries)}")

        for i, recovery in enumerate(recoveries, 1):
            task_id = recovery.get('task_id', 'unknown')
            error_type = recovery.get('error_type', 'unknown')
            strategy = recovery.get('strategy', 'unknown')
            status = recovery.get('status', 'unknown')
            attempts = recovery.get('attempts', 0)

            print(f"\n{i}. Task: {task_id}")
            print(f"   Error Type: {error_type}")
            print(f"   Strategy: {strategy}")
            print(f"   Status: {status}")
            print(f"   Attempts: {attempts}")

            if 'fallback_used' in recovery:
                print(f"   Fallback: {recovery['fallback_used']}")

    def demonstrate_human_escalation(self):
        """
        Demonstrate human escalation triggers and handling.
        """
        print("\n=== Human Escalation Demonstration ===")

        if not self.results or 'escalations' not in self.results:
            print("No escalations occurred")
            return

        escalations = self.results['escalations']

        print(f"\nTotal Escalations: {len(escalations)}")

        for i, escalation in enumerate(escalations, 1):
            task_id = escalation.get('task_id', 'unknown')
            escalation_type = escalation.get('type', 'unknown')
            reason = escalation.get('reason', 'unknown')
            status = escalation.get('status', 'unknown')

            print(f"\n{i}. Task: {task_id}")
            print(f"   Type: {escalation_type}")
            print(f"   Reason: {reason}")
            print(f"   Status: {status}")

            if escalation_type == 'human_intervention':
                instructions = escalation.get('instructions', 'No instructions')
                print(f"   Instructions: {instructions}")

                # Show if intervention was provided
                if 'intervention' in escalation:
                    intervention = escalation['intervention']
                    print(f"   Intervention Provided: {intervention}")

    def demonstrate_resume_after_recovery(self):
        """
        Demonstrate resuming execution after recovery.
        """
        print("\n=== Resume After Recovery Demonstration ===")

        if not self.results:
            print("⚠ No results available")
            return

        # Show recovery completion
        if 'recovery_summary' in self.results:
            summary = self.results['recovery_summary']

            print(f"\nRecovery Summary:")
            print(f"  Errors Encountered: {summary.get('errors_encountered', 0)}")
            print(f"  Recoveries Attempted: {summary.get('recoveries_attempted', 0)}")
            print(f"  Successful Recoveries: {summary.get('successful_recoveries', 0)}")
            print(f"  Failed Recoveries: {summary.get('failed_recoveries', 0)}")
            print(f"  Escalations: {summary.get('escalations', 0)}")

        # Show resume status
        status = self.results.get('status', 'unknown')
        print(f"\nFinal Status: {status}")

        if status == 'completed':
            print("✓ Execution resumed and completed successfully after recovery")
        elif status == 'partial':
            print("⚠ Execution partially completed after recovery")
            print("  Some tasks may have been skipped due to unrecoverable errors")
        else:
            print(f"✗ Execution could not be recovered: {status}")

    def show_error_metrics(self):
        """
        Display error handling metrics.
        """
        print("\n=== Error Metrics ===")

        if not self.results:
            print("⚠ No results available")
            return

        metrics = self.results.get('error_metrics', {})

        print(f"\nTotal Errors: {metrics.get('total_errors', 0)}")
        print(f"Errors by Type:")

        for error_type, count in metrics.get('errors_by_type', {}).items():
            print(f"  {error_type}: {count}")

        print(f"\nRecovery Success Rate: {metrics.get('recovery_success_rate', 0):.1%}")
        print(f"Average Recovery Time: {metrics.get('avg_recovery_time', 0):.2f}s")
        print(f"Total Downtime: {metrics.get('total_downtime', 0):.2f}s")

    def save_results(self, output_path: str = None):
        """
        Save error recovery results including error logs.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "error_recovery_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Add error log to results
        self.results['error_log'] = self.error_log

        # Save to JSON
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
    Main execution function for error recovery demonstration.
    """
    print("=" * 70)
    print("Error Recovery Demonstration Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create demo instance
    demo = ErrorRecoveryDemo()

    try:
        # Step 1: Create error-prone plan
        demo.plan = demo.create_error_prone_plan()

        # Step 2: Initialize runtime
        demo.initialize_runtime()

        # Step 3: Execute with error recovery
        demo.execute_with_error_recovery()

        # Step 4: Demonstrate error detection
        demo.demonstrate_error_detection()

        # Step 5: Demonstrate recovery strategies
        demo.demonstrate_recovery_strategies()

        # Step 6: Demonstrate human escalation
        demo.demonstrate_human_escalation()

        # Step 7: Demonstrate resume after recovery
        demo.demonstrate_resume_after_recovery()

        # Step 8: Show error metrics
        demo.show_error_metrics()

        # Step 9: Save results
        demo.save_results()

        print("\n" + "=" * 70)
        print("✓ Error recovery demonstration completed successfully")
        print("=" * 70)

    except Exception as e:
        print(f"\n✗ Error during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        demo.cleanup()


if __name__ == "__main__":
    main()
