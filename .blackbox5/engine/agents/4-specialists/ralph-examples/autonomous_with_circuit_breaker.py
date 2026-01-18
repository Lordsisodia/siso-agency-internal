#!/usr/bin/env python3
"""
Autonomous Execution with Circuit Breaker Example

This example demonstrates how Ralph Runtime's circuit breaker pattern protects
against cascading failures during autonomous execution. It shows circuit breaker
configuration, triggering, state transitions, and auto-recovery.

Expected Output:
- Circuit breaker configuration
- Normal operation state
- Circuit breaker triggering on failures
- Circuit open state
- Recovery attempt
- Circuit half-open state
- Circuit closed (recovered)
- State transition logs
"""

import sys
import os
import json
import asyncio
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
from enum import Enum

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from agents.ralph_agent.runtime import RalphRuntime
from agents.ralph_agent.circuit_breaker import CircuitBreaker, CircuitState
from agents.ralph_agent.response_analyzer import ResponseAnalyzer
from agents.ralph_agent.progress_monitor import ProgressMonitor


class CircuitBreakerDemo:
    """
    Demonstrates circuit breaker pattern in autonomous execution.

    Shows:
    - Circuit breaker configuration
    - Failure detection and circuit opening
    - Auto-recovery mechanisms
    - State transitions (closed -> open -> half-open -> closed)
    - Request blocking during open state
    """

    def __init__(self):
        """Initialize the circuit breaker demo."""
        self.runtime = None
        self.circuit_breaker = None
        self.plan = None
        self.results = None

    def create_risky_plan(self) -> Dict[str, Any]:
        """
        Create a plan with potentially risky operations.

        Returns:
            Dict containing the plan structure
        """
        print("\n=== Creating Risky Plan ===")

        plan = {
            "plan_id": "circuit-breaker-demo-001",
            "name": "Circuit Breaker Demo",
            "description": "Demonstrates circuit breaker with risky operations",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate circuit breaker pattern"
            },
            "tasks": [
                {
                    "task_id": "safe-task-1",
                    "name": "Safe Operation",
                    "type": "safe",
                    "priority": "high",
                    "agent": "safe-agent",
                    "spec": {
                        "action": "safe_operation",
                        "parameters": {
                            "risk_level": "low"
                        }
                    },
                    "dependencies": [],
                    "status": "pending"
                },
                {
                    "task_id": "risky-task-1",
                    "name": "Risky Operation 1",
                    "type": "risky",
                    "priority": "high",
                    "agent": "risky-agent",
                    "spec": {
                        "action": "risky_operation",
                        "parameters": {
                            "risk_level": "high",
                            "failure_probability": 0.8  # 80% chance of failure
                        }
                    },
                    "dependencies": ["safe-task-1"],
                    "status": "pending"
                },
                {
                    "task_id": "risky-task-2",
                    "name": "Risky Operation 2",
                    "type": "risky",
                    "priority": "high",
                    "agent": "risky-agent",
                    "spec": {
                        "action": "risky_operation",
                        "parameters": {
                            "risk_level": "high",
                            "failure_probability": 0.9  # 90% chance of failure
                        }
                    },
                    "dependencies": ["risky-task-1"],
                    "status": "pending"
                },
                {
                    "task_id": "risky-task-3",
                    "name": "Risky Operation 3",
                    "type": "risky",
                    "priority": "high",
                    "agent": "risky-agent",
                    "spec": {
                        "action": "risky_operation",
                        "parameters": {
                            "risk_level": "high",
                            "failure_probability": 0.95  # 95% chance of failure
                        }
                    },
                    "dependencies": ["risky-task-2"],
                    "status": "pending"
                },
                {
                    "task_id": "recovery-task",
                    "name": "Recovery Operation",
                    "type": "recovery",
                    "priority": "medium",
                    "agent": "recovery-agent",
                    "spec": {
                        "action": "attempt_recovery",
                        "parameters": {
                            "max_attempts": 3
                        }
                    },
                    "dependencies": ["risky-task-3"],
                    "status": "pending"
                },
                {
                    "task_id": "safe-task-2",
                    "name": "Final Safe Operation",
                    "type": "safe",
                    "priority": "medium",
                    "agent": "safe-agent",
                    "spec": {
                        "action": "safe_operation",
                        "parameters": {
                            "risk_level": "low"
                        }
                    },
                    "dependencies": ["recovery-task"],
                    "status": "pending"
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 1,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "log_level": "debug"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Risky tasks: 3 (high failure probability)")
        print(f"✓ Circuit breaker: enabled")

        return plan

    def configure_circuit_breaker(self) -> CircuitBreaker:
        """
        Configure circuit breaker with specific thresholds.

        Returns:
            Configured CircuitBreaker instance
        """
        print("\n=== Configuring Circuit Breaker ===")

        # Create circuit breaker
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=3,  # Open after 3 failures
            recovery_timeout=5,   # Wait 5 seconds before recovery attempt
            expected_exception=Exception,
            name="demo-circuit-breaker"
        )

        print("✓ Circuit breaker configured:")
        print(f"  - Failure threshold: {self.circuit_breaker.failure_threshold}")
        print(f"  - Recovery timeout: {self.circuit_breaker.recovery_timeout}s")
        print(f"  - Initial state: {self.circuit_breaker.state.value}")

        return self.circuit_breaker

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with circuit breaker configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with circuit breaker config
        self.runtime = RalphRuntime(
            workspace_path=Path.cwd() / ".blackbox4",
            config={
                "circuit_breaker": {
                    "enabled": True,
                    "failure_threshold": 3,
                    "recovery_timeout": 5,
                    "half_open_max_calls": 2
                },
                "progress_monitoring": {
                    "enabled": True,
                    "update_interval": 0.5,
                    "log_progress": True
                },
                "execution": {
                    "max_retries": 1,
                    "retry_delay": 2,
                    "timeout": 300
                }
            }
        )

        # Inject our circuit breaker
        self.runtime.circuit_breaker = self.circuit_breaker

        print("✓ Ralph Runtime initialized")
        print("✓ Circuit breaker integrated")

        return self.runtime

    def execute_with_circuit_breaker(self) -> Dict[str, Any]:
        """
        Execute plan with circuit breaker protection.

        Returns:
            Execution results dictionary
        """
        print("\n=== Executing with Circuit Breaker ===")

        # Load plan
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Execute with circuit breaker monitoring
        print("\nStarting execution...")
        print("-" * 60)

        # Track circuit state changes
        previous_state = self.circuit_breaker.state

        def state_change_callback(old_state: CircuitState, new_state: CircuitState):
            print(f"\n[⚡ CIRCUIT STATE TRANSITION]")
            print(f"  {old_state.value} -> {new_state.value}")
            print(f"  Time: {datetime.now().strftime('%H:%M:%S')}")

            # Log state-specific information
            if new_state == CircuitState.OPEN:
                print("  Circuit OPEN - Blocking requests to prevent cascading failures")
            elif new_state == CircuitState.HALF_OPEN:
                print("  Circuit HALF-OPEN - Testing if service has recovered")
            elif new_state == CircuitState.CLOSED:
                print("  Circuit CLOSED - Normal operation resumed")

        # Set up state change callback
        self.circuit_breaker.state_change_callback = state_change_callback

        # Execute autonomously
        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._progress_callback
            )
        )

        print("-" * 60)
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

        # Check if circuit breaker is involved
        if 'circuit_state' in progress:
            circuit_state = progress['circuit_state']
            print(f"[Circuit] {circuit_state.upper()} - Task {task_id}: {status}")
        else:
            print(f"[Progress] Task {task_id}: {status}")

        # Show blocked requests
        if 'blocked' in progress and progress['blocked']:
            print(f"[⚠ BLOCKED] Request blocked - circuit is OPEN")

    def demonstrate_circuit_states(self):
        """
        Demonstrate circuit breaker state transitions.
        """
        print("\n=== Circuit State Transitions ===")

        print("\n1. CLOSED State (Normal Operation):")
        print("   - All requests pass through")
        print("   - Failures are counted")
        print("   - Circuit opens when threshold reached")

        print("\n2. OPEN State (Failure Detected):")
        print("   - Requests are blocked immediately")
        print("   - No actual calls to protected service")
        print("   - Prevents cascading failures")

        print("\n3. HALF-OPEN State (Recovery Attempt):")
        print("   - Limited requests allowed")
        print("   - Testing if service recovered")
        print("   - Transition to CLOSED or OPEN based on results")

        print("\n4. CLOSED State (Recovered):")
        print("   - Normal operation resumes")
        print("   - Failure counter reset")
        print("   - Full request capacity restored")

    def show_circuit_metrics(self):
        """
        Display circuit breaker metrics.
        """
        print("\n=== Circuit Breaker Metrics ===")

        if not self.circuit_breaker:
            print("⚠ Circuit breaker not initialized")
            return

        # Get current state
        current_state = self.circuit_breaker.state
        print(f"Current State: {current_state.value}")

        # Get failure count
        failure_count = self.circuit_breaker.failure_count
        print(f"Failure Count: {failure_count}/{self.circuit_breaker.failure_threshold}")

        # Get last failure time
        if hasattr(self.circuit_breaker, 'last_failure_time'):
            last_failure = self.circuit_breaker.last_failure_time
            if last_failure:
                print(f"Last Failure: {last_failure.strftime('%H:%M:%S')}")

        # Get state transition history
        if hasattr(self.circuit_breaker, 'state_history'):
            print("\nState Transition History:")
            for i, (old_state, new_state, timestamp) in enumerate(
                self.circuit_breaker.state_history, 1
            ):
                print(f"  {i}. {old_state.value} -> {new_state.value} at {timestamp.strftime('%H:%M:%S')}")

    def simulate_auto_recovery(self):
        """
        Simulate automatic recovery process.
        """
        print("\n=== Simulating Auto-Recovery ===")

        if not self.circuit_breaker:
            print("⚠ Circuit breaker not initialized")
            return

        # Check if circuit is open
        if self.circuit_breaker.state != CircuitState.OPEN:
            print("Circuit is not OPEN, no recovery needed")
            return

        print("Circuit is OPEN, initiating auto-recovery...")

        # Wait for recovery timeout
        wait_time = self.circuit_breaker.recovery_timeout
        print(f"Waiting {wait_time} seconds for recovery timeout...")

        for i in range(wait_time):
            time.sleep(1)
            print(f"  {i + 1}/{wait_time}s...")

        # Transition to half-open
        print("\nTransitioning to HALF-OPEN state...")

        # Simulate successful test call
        print("Testing service with limited call...")
        success = self._simulate_test_call()

        if success:
            print("✓ Test call successful - Closing circuit")
            # Circuit will close automatically
        else:
            print("✗ Test call failed - Reopening circuit")
            # Circuit will reopen automatically

    def _simulate_test_call(self) -> bool:
        """
        Simulate a test call during half-open state.

        Returns:
            True if call succeeds, False otherwise
        """
        # Simulate 70% success rate for demo
        import random
        return random.random() > 0.3

    def show_results(self):
        """
        Display execution results with circuit breaker information.
        """
        print("\n=== Execution Results ===")

        if not self.results:
            print("⚠ No results available")
            return

        # Overall status
        print(f"\nOverall Status: {self.results.get('status', 'unknown')}")

        # Circuit breaker information
        if 'circuit_breaker' in self.results:
            cb_info = self.results['circuit_breaker']
            print("\nCircuit Breaker:")
            print(f"  Times Opened: {cb_info.get('times_opened', 0)}")
            print(f"  Times Recovered: {cb_info.get('times_recovered', 0)}")
            print(f"  Requests Blocked: {cb_info.get('requests_blocked', 0)}")
            print(f"  Failures Prevented: {cb_info.get('failures_prevented', 0)}")

        # Task results
        if 'tasks' in self.results:
            print("\nTask Results:")
            for task_id, task_result in self.results['tasks'].items():
                status = task_result.get('status', 'unknown')
                blocked = task_result.get('blocked', False)
                print(f"  {task_id}: {status}")

                if blocked:
                    print(f"    [BLOCKED by circuit breaker]")

                if 'error' in task_result:
                    print(f"    Error: {task_result['error']}")

    def save_results(self, output_path: str = None):
        """
        Save execution results including circuit breaker metrics.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "circuit_breaker_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Add circuit breaker state to results
        if self.circuit_breaker:
            self.results['circuit_breaker_final_state'] = {
                'state': self.circuit_breaker.state.value,
                'failure_count': self.circuit_breaker.failure_count,
                'last_failure_time': (
                    self.circuit_breaker.last_failure_time.isoformat()
                    if hasattr(self.circuit_breaker, 'last_failure_time') and
                    self.circuit_breaker.last_failure_time
                    else None
                )
            }

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
    Main execution function for circuit breaker example.
    """
    print("=" * 70)
    print("Autonomous Execution with Circuit Breaker Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create demo instance
    demo = CircuitBreakerDemo()

    try:
        # Step 1: Create risky plan
        demo.plan = demo.create_risky_plan()

        # Step 2: Configure circuit breaker
        demo.configure_circuit_breaker()

        # Step 3: Initialize runtime
        demo.initialize_runtime()

        # Step 4: Execute with circuit breaker
        demo.execute_with_circuit_breaker()

        # Step 5: Demonstrate state transitions
        demo.demonstrate_circuit_states()

        # Step 6: Show circuit metrics
        demo.show_circuit_metrics()

        # Step 7: Simulate auto-recovery
        demo.simulate_auto_recovery()

        # Step 8: Show results
        demo.show_results()

        # Step 9: Save results
        demo.save_results()

        print("\n" + "=" * 70)
        print("✓ Circuit breaker demonstration completed successfully")
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
