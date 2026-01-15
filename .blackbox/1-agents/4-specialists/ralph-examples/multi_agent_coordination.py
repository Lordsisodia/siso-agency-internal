#!/usr/bin/env python3
"""
Multi-Agent Autonomous Coordination Example

This example demonstrates how Ralph Runtime coordinates multiple agents
autonomously during execution. It shows agent handoffs, conflict resolution,
progress tracking, and completion detection.

Expected Output:
- Multi-agent plan creation
- Agent assignment and handoffs
- Autonomous coordination between agents
- Conflict detection and resolution
- Progress tracking across agents
- Completion detection
- Coordination metrics
"""

import sys
import os
import json
import asyncio
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


class AgentRole(Enum):
    """Agent roles in multi-agent coordination."""
    PLANNER = "planner"
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    TESTER = "tester"
    REVIEWER = "reviewer"
    ORCHESTRATOR = "orchestrator"


class MultiAgentCoordination:
    """
    Demonstrates multi-agent autonomous coordination with Ralph Runtime.

    Shows:
    - Multi-agent plan creation
    - Agent role assignment
    - Autonomous handoffs between agents
    - Conflict detection and resolution
    - Progress tracking across agents
    - Completion detection
    """

    def __init__(self):
        """Initialize the multi-agent coordination example."""
        self.runtime = None
        self.plan = None
        self.results = None
        self.agent_states = {}

    def create_multi_agent_plan(self) -> Dict[str, Any]:
        """
        Create a plan requiring multiple agents.

        Returns:
            Dict containing the multi-agent plan structure
        """
        print("\n=== Creating Multi-Agent Plan ===")

        plan = {
            "plan_id": "multi-agent-coord-001",
            "name": "Multi-Agent Coordination Demo",
            "description": "Demonstrates autonomous multi-agent coordination",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate multi-agent coordination"
            },
            "agents": [
                {
                    "agent_id": "agent-planner",
                    "role": AgentRole.PLANNER.value,
                    "name": "Planning Agent",
                    "capabilities": ["task_breakdown", "dependency_analysis"],
                    "capacity": 5
                },
                {
                    "agent_id": "agent-architect",
                    "role": AgentRole.ARCHITECT.value,
                    "name": "Architecture Agent",
                    "capabilities": ["design", "technical_spec"],
                    "capacity": 3
                },
                {
                    "agent_id": "agent-developer",
                    "role": AgentRole.DEVELOPER.value,
                    "name": "Development Agent",
                    "capabilities": ["implementation", "coding"],
                    "capacity": 8
                },
                {
                    "agent_id": "agent-tester",
                    "role": AgentRole.TESTER.value,
                    "name": "Testing Agent",
                    "capabilities": ["testing", "qa"],
                    "capacity": 4
                },
                {
                    "agent_id": "agent-reviewer",
                    "role": AgentRole.REVIEWER.value,
                    "name": "Review Agent",
                    "capabilities": ["review", "validation"],
                    "capacity": 3
                }
            ],
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Break Down Requirements",
                    "type": "planning",
                    "priority": "high",
                    "agent": "agent-planner",
                    "spec": {
                        "action": "breakdown",
                        "parameters": {
                            "requirements": [
                                "User authentication",
                                "Data persistence",
                                "API endpoints"
                            ]
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "handoffs": []  # Will be populated dynamically
                },
                {
                    "task_id": "task-2",
                    "name": "Design Architecture",
                    "type": "architecture",
                    "priority": "high",
                    "agent": "agent-architect",
                    "spec": {
                        "action": "design",
                        "parameters": {
                            "components": ["auth", "database", "api"]
                        }
                    },
                    "dependencies": ["task-1"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-3",
                    "name": "Implement Authentication",
                    "type": "development",
                    "priority": "high",
                    "agent": "agent-developer",
                    "spec": {
                        "action": "implement",
                        "parameters": {
                            "feature": "authentication",
                            "complexity": "medium"
                        }
                    },
                    "dependencies": ["task-2"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-4",
                    "name": "Implement Database",
                    "type": "development",
                    "priority": "high",
                    "agent": "agent-developer",
                    "spec": {
                        "action": "implement",
                        "parameters": {
                            "feature": "database",
                            "complexity": "high"
                        }
                    },
                    "dependencies": ["task-2"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-5",
                    "name": "Implement API",
                    "type": "development",
                    "priority": "medium",
                    "agent": "agent-developer",
                    "spec": {
                        "action": "implement",
                        "parameters": {
                            "feature": "api",
                            "complexity": "medium"
                        }
                    },
                    "dependencies": ["task-3", "task-4"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-6",
                    "name": "Test Authentication",
                    "type": "testing",
                    "priority": "high",
                    "agent": "agent-tester",
                    "spec": {
                        "action": "test",
                        "parameters": {
                            "component": "authentication",
                            "test_types": ["unit", "integration"]
                        }
                    },
                    "dependencies": ["task-3"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-7",
                    "name": "Test Database",
                    "type": "testing",
                    "priority": "high",
                    "agent": "agent-tester",
                    "spec": {
                        "action": "test",
                        "parameters": {
                            "component": "database",
                            "test_types": ["unit", "integration"]
                        }
                    },
                    "dependencies": ["task-4"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-8",
                    "name": "Test API",
                    "type": "testing",
                    "priority": "medium",
                    "agent": "agent-tester",
                    "spec": {
                        "action": "test",
                        "parameters": {
                            "component": "api",
                            "test_types": ["unit", "integration", "e2e"]
                        }
                    },
                    "dependencies": ["task-5"],
                    "status": "pending",
                    "handoffs": []
                },
                {
                    "task_id": "task-9",
                    "name": "Review Implementation",
                    "type": "review",
                    "priority": "medium",
                    "agent": "agent-reviewer",
                    "spec": {
                        "action": "review",
                        "parameters": {
                            "scope": "full",
                            "criteria": ["quality", "security", "performance"]
                        }
                    },
                    "dependencies": ["task-6", "task-7", "task-8"],
                    "status": "pending",
                    "handoffs": []
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 3,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "coordination": {
                    "enabled": True,
                    "conflict_resolution": "automatic",
                    "handoff_strategy": "autonomous"
                },
                "log_level": "info"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of agents: {len(plan['agents'])}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Coordination: enabled")

        # Show agent assignments
        print("\nAgent Assignments:")
        for agent in plan['agents']:
            print(f"  - {agent['name']} ({agent['role']}): {agent['capacity']} task capacity")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with multi-agent configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with multi-agent config
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
                },
                "coordination": {
                    "enabled": True,
                    "max_parallel_agents": 3,
                    "conflict_detection": True,
                    "auto_handoff": True
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print("✓ Multi-agent coordination: enabled")
        print("✓ Conflict detection: enabled")
        print("✓ Auto handoff: enabled")

        return self.runtime

    def execute_multi_agent_coordination(self) -> Dict[str, Any]:
        """
        Execute plan with multi-agent coordination.

        Returns:
            Execution results dictionary
        """
        print("\n=== Executing Multi-Agent Coordination ===")

        # Load plan
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Execute with multi-agent coordination
        print("\nStarting multi-agent execution...")
        print("-" * 70)

        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._coordination_callback
            )
        )

        print("-" * 70)
        print("✓ Execution completed")

        return self.results

    def _coordination_callback(self, progress: Dict[str, Any]):
        """
        Callback function for coordination updates.

        Args:
            progress: Progress update dictionary
        """
        task_id = progress.get('task_id', 'unknown')
        status = progress.get('status', 'unknown')
        agent = progress.get('agent', 'unknown')

        # Track agent states
        if agent and agent not in self.agent_states:
            self.agent_states[agent] = {
                'tasks_completed': 0,
                'tasks_failed': 0,
                'handoffs_initiated': 0,
                'handoffs_received': 0
            }

        # Update agent state
        if agent and status == 'completed':
            self.agent_states[agent]['tasks_completed'] += 1
        elif agent and status == 'failed':
            self.agent_states[agent]['tasks_failed'] += 1

        # Show agent activity
        if agent:
            print(f"[{agent.upper()}] Task {task_id}: {status}")

        # Show handoffs
        if 'handoff' in progress:
            handoff = progress['handoff']
            from_agent = handoff.get('from_agent', 'unknown')
            to_agent = handoff.get('to_agent', 'unknown')
            reason = handoff.get('reason', 'unknown')

            print(f"\n[HANDOFF] {from_agent} -> {to_agent}")
            print(f"  Reason: {reason}")
            print(f"  Task: {task_id}")

            # Update handoff counts
            if from_agent in self.agent_states:
                self.agent_states[from_agent]['handoffs_initiated'] += 1
            if to_agent in self.agent_states:
                self.agent_states[to_agent]['handoffs_received'] += 1

        # Show conflicts
        if 'conflict' in progress:
            conflict = progress['conflict']
            conflict_type = conflict.get('type', 'unknown')
            resolution = conflict.get('resolution', 'pending')

            print(f"\n[⚠ CONFLICT] {conflict_type.upper()}")
            print(f"  Resolution: {resolution}")

    def track_agent_handoffs(self):
        """
        Track and display agent handoffs.
        """
        print("\n=== Agent Handoff Tracking ===")

        if not self.results or 'handoffs' not in self.results:
            print("No handoff data available")
            return

        handoffs = self.results['handoffs']

        print(f"\nTotal Handoffs: {len(handoffs)}")

        # Show handoff chain
        print("\nHandoff Chain:")
        for i, handoff in enumerate(handoffs, 1):
            from_agent = handoff.get('from_agent', 'unknown')
            to_agent = handoff.get('to_agent', 'unknown')
            task_id = handoff.get('task_id', 'unknown')
            timestamp = handoff.get('timestamp', 'unknown')
            reason = handoff.get('reason', 'unknown')

            print(f"\n  {i}. {timestamp}")
            print(f"     {from_agent} -> {to_agent}")
            print(f"     Task: {task_id}")
            print(f"     Reason: {reason}")

    def detect_and_resolve_conflicts(self) -> List[Dict[str, Any]]:
        """
        Detect and resolve conflicts between agents.

        Returns:
            List of resolved conflicts
        """
        print("\n=== Conflict Detection and Resolution ===")

        conflicts = []

        # Simulate conflict detection
        if self.results and 'conflicts' in self.results:
            conflicts = self.results['conflicts']
        else:
            # Simulated conflicts for demo
            conflicts = [
                {
                    "conflict_id": "conflict-1",
                    "type": "resource_contention",
                    "agents": ["agent-developer", "agent-tester"],
                    "resource": "database_connection",
                    "detected_at": datetime.now().isoformat(),
                    "resolution": "priority_based",
                    "resolved_by": "orchestrator",
                    "resolution_time": "2s"
                },
                {
                    "conflict_id": "conflict-2",
                    "type": "dependency_cycle",
                    "agents": ["task-3", "task-4"],
                    "description": "Circular dependency detected",
                    "detected_at": datetime.now().isoformat(),
                    "resolution": "reorder_tasks",
                    "resolved_by": "planner",
                    "resolution_time": "5s"
                }
            ]

        print(f"\nConflicts Detected: {len(conflicts)}")

        for conflict in conflicts:
            print(f"\n  Conflict: {conflict.get('type', 'unknown')}")
            print(f"  Agents: {', '.join(conflict.get('agents', []))}")
            print(f"  Resolution: {conflict.get('resolution', 'pending')}")
            print(f"  Resolved By: {conflict.get('resolved_by', 'unknown')}")
            print(f"  Resolution Time: {conflict.get('resolution_time', 'unknown')}")

        return conflicts

    def track_progress_across_agents(self):
        """
        Track progress across all agents.
        """
        print("\n=== Progress Tracking Across Agents ===")

        if not self.results:
            print("⚠ No results available")
            return

        # Overall progress
        total_tasks = self.results.get('total_tasks', 0)
        completed_tasks = self.results.get('completed_tasks', 0)
        progress_percent = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        print(f"\nOverall Progress: {completed_tasks}/{total_tasks} ({progress_percent:.1f}%)")

        # Per-agent progress
        if 'agent_progress' in self.results:
            print("\nPer-Agent Progress:")
            for agent_id, agent_progress in self.results['agent_progress'].items():
                assigned = agent_progress.get('assigned', 0)
                completed = agent_progress.get('completed', 0)
                failed = agent_progress.get('failed', 0)
                in_progress = agent_progress.get('in_progress', 0)

                print(f"\n  {agent_id}:")
                print(f"    Assigned: {assigned}")
                print(f"    Completed: {completed}")
                print(f"    Failed: {failed}")
                print(f"    In Progress: {in_progress}")

    def detect_completion(self):
        """
        Detect completion of multi-agent execution.
        """
        print("\n=== Completion Detection ===")

        if not self.results:
            print("⚠ No results available")
            return

        status = self.results.get('status', 'unknown')
        print(f"Execution Status: {status}")

        # Check if all tasks completed
        if 'tasks' in self.results:
            all_completed = all(
                task.get('status') == 'completed'
                for task in self.results['tasks'].values()
            )

            if all_completed:
                print("✓ All tasks completed successfully")
            else:
                # Show incomplete tasks
                print("\nIncomplete Tasks:")
                for task_id, task_result in self.results['tasks'].items():
                    if task_result.get('status') != 'completed':
                        print(f"  {task_id}: {task_result.get('status', 'unknown')}")

        # Check agent completion
        if 'agents' in self.results:
            print("\nAgent Completion Status:")
            for agent_id, agent_status in self.results['agents'].items():
                state = agent_status.get('state', 'unknown')
                print(f"  {agent_id}: {state}")

    def show_coordination_metrics(self):
        """
        Display coordination metrics.
        """
        print("\n=== Coordination Metrics ===")

        if not self.results:
            print("⚠ No results available")
            return

        metrics = self.results.get('coordination_metrics', {})

        print(f"\nTotal Handoffs: {metrics.get('total_handoffs', 0)}")
        print(f"Conflicts Detected: {metrics.get('conflicts_detected', 0)}")
        print(f"Conflicts Resolved: {metrics.get('conflicts_resolved', 0)}")
        print(f"Resolution Rate: {metrics.get('resolution_rate', 0):.1%}")

        if 'handoff_matrix' in metrics:
            print("\nHandoff Matrix:")
            matrix = metrics['handoff_matrix']
            for from_agent, to_agents in matrix.items():
                for to_agent, count in to_agents.items():
                    if count > 0:
                        print(f"  {from_agent} -> {to_agent}: {count}")

    def show_agent_states(self):
        """
        Display final agent states.
        """
        print("\n=== Agent States ===")

        for agent_id, state in self.agent_states.items():
            print(f"\n{agent_id}:")
            print(f"  Tasks Completed: {state['tasks_completed']}")
            print(f"  Tasks Failed: {state['tasks_failed']}")
            print(f"  Handoffs Initiated: {state['handoffs_initiated']}")
            print(f"  Handoffs Received: {state['handoffs_received']}")

    def save_results(self, output_path: str = None):
        """
        Save multi-agent coordination results.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "multi_agent_coordination_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Add agent states to results
        self.results['agent_states'] = self.agent_states

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
    Main execution function for multi-agent coordination example.
    """
    print("=" * 70)
    print("Multi-Agent Autonomous Coordination Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create coordination instance
    coordination = MultiAgentCoordination()

    try:
        # Step 1: Create multi-agent plan
        coordination.plan = coordination.create_multi_agent_plan()

        # Step 2: Initialize runtime
        coordination.initialize_runtime()

        # Step 3: Execute with coordination
        coordination.execute_multi_agent_coordination()

        # Step 4: Track agent handoffs
        coordination.track_agent_handoffs()

        # Step 5: Detect and resolve conflicts
        coordination.detect_and_resolve_conflicts()

        # Step 6: Track progress across agents
        coordination.track_progress_across_agents()

        # Step 7: Detect completion
        coordination.detect_completion()

        # Step 8: Show coordination metrics
        coordination.show_coordination_metrics()

        # Step 9: Show agent states
        coordination.show_agent_states()

        # Step 10: Save results
        coordination.save_results()

        print("\n" + "=" * 70)
        print("✓ Multi-agent coordination completed successfully")
        print("=" * 70)

    except Exception as e:
        print(f"\n✗ Error during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        # Cleanup
        coordination.cleanup()


if __name__ == "__main__":
    main()
