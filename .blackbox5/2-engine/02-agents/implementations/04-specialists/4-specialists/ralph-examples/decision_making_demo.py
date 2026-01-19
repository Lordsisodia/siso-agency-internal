#!/usr/bin/env python3
"""
Decision-Making Engine Demonstration Example

This example demonstrates Ralph Runtime's autonomous decision-making capabilities.
It shows how the runtime makes decisions, calculates confidence scores, assesses
risks, logs decisions, and learns from feedback.

Expected Output:
- Autonomous decisions made during execution
- Confidence scoring for each decision
- Risk assessment analysis
- Decision logging with rationale
- Feedback integration
- Learning from outcomes
- Decision metrics and analytics
"""

import sys
import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import random

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from agents.ralph_agent.runtime import RalphRuntime
from agents.ralph_agent.circuit_breaker import CircuitBreaker
from agents.ralph_agent.response_analyzer import ResponseAnalyzer
from agents.ralph_agent.progress_monitor import ProgressMonitor


class DecisionType(Enum):
    """Types of decisions the runtime can make."""
    TASK_PRIORITY = "task_priority"
    AGENT_ASSIGNMENT = "agent_assignment"
    RETRY_STRATEGY = "retry_strategy"
    ERROR_HANDLING = "error_handling"
    RESOURCE_ALLOCATION = "resource_allocation"
    EXECUTION_PATH = "execution_path"
    CONFLICT_RESOLUTION = "conflict_resolution"
    HANDOFF_TRIGGER = "handoff_trigger"


class DecisionOutcome(Enum):
    """Possible outcomes of a decision."""
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    UNKNOWN = "unknown"


class DecisionMakingDemo:
    """
    Demonstrates autonomous decision-making in Ralph Runtime.

    Shows:
    - Autonomous decisions during execution
    - Confidence scoring
    - Risk assessment
    - Decision logging
    - Feedback integration
    - Learning from outcomes
    """

    def __init__(self):
        """Initialize the decision-making demo."""
        self.runtime = None
        self.plan = None
        self.results = None
        self.decisions = []

    def create_decision_intensive_plan(self) -> Dict[str, Any]:
        """
        Create a plan that requires many autonomous decisions.

        Returns:
            Dict containing the decision-intensive plan structure
        """
        print("\n=== Creating Decision-Intensive Plan ===")

        plan = {
            "plan_id": "decision-making-demo-001",
            "name": "Decision Making Demo",
            "description": "Demonstrates autonomous decision-making capabilities",
            "created_at": datetime.now().isoformat(),
            "context": {
                "project": "Blackbox4 Ralph Runtime Examples",
                "phase": "4",
                "goal": "Demonstrate decision-making"
            },
            "decision_points": [
                {
                    "point_id": "dp-1",
                    "type": DecisionType.TASK_PRIORITY.value,
                    "description": "Determine task execution priority",
                    "context": "Multiple tasks ready for execution"
                },
                {
                    "point_id": "dp-2",
                    "type": DecisionType.AGENT_ASSIGNMENT.value,
                    "description": "Assign tasks to available agents",
                    "context": "Multiple agents with different capacities"
                },
                {
                    "point_id": "dp-3",
                    "type": DecisionType.RETRY_STRATEGY.value,
                    "description": "Choose retry strategy after failure",
                    "context": "Task execution failed"
                },
                {
                    "point_id": "dp-4",
                    "type": DecisionType.RESOURCE_ALLOCATION.value,
                    "description": "Allocate limited resources",
                    "context": "Resource contention detected"
                },
                {
                    "point_id": "dp-5",
                    "type": DecisionType.EXECUTION_PATH.value,
                    "description": "Choose execution path",
                    "context": "Multiple valid execution paths available"
                }
            ],
            "tasks": [
                {
                    "task_id": "task-1",
                    "name": "Ambiguous Task 1",
                    "type": "ambiguous",
                    "priority": "medium",  # Will be decided autonomously
                    "agent": "auto",  # Agent will be assigned
                    "spec": {
                        "action": "ambiguous_operation",
                        "parameters": {
                            "requires_decision": True
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "decision_required": True
                },
                {
                    "task_id": "task-2",
                    "name": "Ambiguous Task 2",
                    "type": "ambiguous",
                    "priority": "medium",  # Will be decided autonomously
                    "agent": "auto",  # Agent will be assigned
                    "spec": {
                        "action": "ambiguous_operation",
                        "parameters": {
                            "requires_decision": True
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "decision_required": True
                },
                {
                    "task_id": "task-3",
                    "name": "High Priority Decision",
                    "type": "decision",
                    "priority": "high",
                    "agent": "auto",
                    "spec": {
                        "action": "make_decision",
                        "parameters": {
                            "decision_type": "critical",
                            "options": ["option_a", "option_b", "option_c"]
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "decision_required": True
                },
                {
                    "task_id": "task-4",
                    "name": "Resource Contention Task",
                    "type": "resource_intensive",
                    "priority": "medium",
                    "agent": "auto",
                    "spec": {
                        "action": "resource_intensive_operation",
                        "parameters": {
                            "resource_type": "cpu",
                            "amount": "high"
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "decision_required": True
                },
                {
                    "task_id": "task-5",
                    "name": "Path Selection Task",
                    "type": "branching",
                    "priority": "medium",
                    "agent": "auto",
                    "spec": {
                        "action": "branching_operation",
                        "parameters": {
                            "paths": ["fast", "reliable", "balanced"],
                            "criteria": ["speed", "reliability", "efficiency"]
                        }
                    },
                    "dependencies": [],
                    "status": "pending",
                    "decision_required": True
                }
            ],
            "execution_config": {
                "mode": "autonomous",
                "max_parallel_tasks": 3,
                "circuit_breaker_enabled": True,
                "progress_monitoring": True,
                "decision_making": {
                    "enabled": True,
                    "confidence_threshold": 0.7,
                    "risk_tolerance": "medium",
                    "learning_enabled": True,
                    "log_all_decisions": True
                },
                "log_level": "debug"
            }
        }

        print(f"✓ Plan created: {plan['plan_id']}")
        print(f"✓ Number of tasks: {len(plan['tasks'])}")
        print(f"✓ Decision points: {len(plan['decision_points'])}")
        print(f"✓ Decision-making: enabled")
        print(f"✓ Confidence threshold: {plan['execution_config']['decision_making']['confidence_threshold']}")
        print(f"✓ Risk tolerance: {plan['execution_config']['decision_making']['risk_tolerance']}")

        return plan

    def initialize_runtime(self) -> RalphRuntime:
        """
        Initialize Ralph Runtime with decision-making configuration.

        Returns:
            Configured RalphRuntime instance
        """
        print("\n=== Initializing Ralph Runtime ===")

        # Create runtime with decision-making config
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
                "decision_making": {
                    "enabled": True,
                    "confidence_threshold": 0.7,
                    "risk_tolerance": "medium",
                    "learning_enabled": True,
                    "log_all_decisions": True,
                    "decision_timeout": 10,
                    "max_alternatives": 3
                }
            }
        )

        print("✓ Ralph Runtime initialized")
        print("✓ Decision-making engine: enabled")
        print("✓ Learning: enabled")
        print("✓ Decision logging: enabled")

        return self.runtime

    def execute_with_decision_making(self) -> Dict[str, Any]:
        """
        Execute plan with autonomous decision-making.

        Returns:
            Execution results dictionary
        """
        print("\n=== Executing with Decision-Making ===")

        # Load plan
        print("Loading plan...")
        self.runtime.load_plan(self.plan)
        print("✓ Plan loaded")

        # Execute with decision-making
        print("\nStarting execution with autonomous decision-making...")
        print("-" * 70)

        self.results = asyncio.run(
            self.runtime.execute_autonomous(
                plan_id=self.plan['plan_id'],
                callback=self._decision_callback
            )
        )

        print("-" * 70)
        print("✓ Execution completed")

        return self.results

    def _decision_callback(self, progress: Dict[str, Any]):
        """
        Callback function for decision-making updates.

        Args:
            progress: Progress update dictionary
        """
        task_id = progress.get('task_id', 'unknown')
        status = progress.get('status', 'unknown')

        # Check for decision
        if 'decision' in progress:
            decision = progress['decision']
            self._log_decision(task_id, decision)

        # Normal progress
        if 'decision' not in progress:
            print(f"[Progress] Task {task_id}: {status}")

    def _log_decision(self, task_id: str, decision: Dict[str, Any]):
        """
        Log a decision made during execution.

        Args:
            task_id: ID of the task
            decision: Decision dictionary
        """
        decision_type = decision.get('type', 'unknown')
        decision_value = decision.get('value', 'unknown')
        confidence = decision.get('confidence', 0.0)
        risk = decision.get('risk_assessment', {})
        rationale = decision.get('rationale', '')

        print(f"\n[⚡ DECISION] Task {task_id}")
        print(f"  Type: {decision_type}")
        print(f"  Decision: {decision_value}")
        print(f"  Confidence: {confidence:.2%}")

        if risk:
            risk_level = risk.get('level', 'unknown')
            risk_score = risk.get('score', 0.0)
            print(f"  Risk Level: {risk_level}")
            print(f"  Risk Score: {risk_score:.2f}")

        if rationale:
            print(f"  Rationale: {rationale}")

        # Store decision
        self.decisions.append({
            'timestamp': datetime.now().isoformat(),
            'task_id': task_id,
            'decision': decision
        })

    def show_autonomous_decisions(self):
        """
        Display all autonomous decisions made.
        """
        print("\n=== Autonomous Decisions Made ===")

        if not self.decisions:
            print("No decisions were made during execution")
            return

        print(f"\nTotal Decisions: {len(self.decisions)}")

        # Group decisions by type
        decisions_by_type = {}
        for decision_log in self.decisions:
            decision_type = decision_log['decision'].get('type', 'unknown')
            if decision_type not in decisions_by_type:
                decisions_by_type[decision_type] = []
            decisions_by_type[decision_type].append(decision_log)

        # Show decisions by type
        for decision_type, decision_logs in decisions_by_type.items():
            print(f"\n{decision_type.upper().replace('_', ' ')}: {len(decision_logs)} decision(s)")

            for i, decision_log in enumerate(decision_logs, 1):
                timestamp = decision_log['timestamp']
                task_id = decision_log['task_id']
                decision = decision_log['decision']
                value = decision.get('value', 'unknown')

                print(f"\n  {i}. Task: {task_id}")
                print(f"     Time: {timestamp}")
                print(f"     Decision: {value}")

    def show_confidence_scoring(self):
        """
        Display confidence scoring for decisions.
        """
        print("\n=== Confidence Scoring ===")

        if not self.decisions:
            print("No decisions to analyze")
            return

        print(f"\nTotal Decisions Analyzed: {len(self.decisions)}")

        # Calculate confidence statistics
        confidences = [
            d['decision'].get('confidence', 0.0)
            for d in self.decisions
        ]

        if confidences:
            avg_confidence = sum(confidences) / len(confidences)
            min_confidence = min(confidences)
            max_confidence = max(confidences)

            print(f"\nConfidence Statistics:")
            print(f"  Average: {avg_confidence:.2%}")
            print(f"  Minimum: {min_confidence:.2%}")
            print(f"  Maximum: {max_confidence:.2%}")

            # Show high-confidence decisions
            high_confidence = [
                d for d in self.decisions
                if d['decision'].get('confidence', 0.0) >= 0.8
            ]
            print(f"\nHigh Confidence Decisions (≥80%): {len(high_confidence)}")

            # Show low-confidence decisions
            low_confidence = [
                d for d in self.decisions
                if d['decision'].get('confidence', 0.0) < 0.5
            ]
            print(f"Low Confidence Decisions (<50%): {len(low_confidence)}")

        # Show confidence distribution
        print("\nConfidence Distribution:")
        distribution = {
            'Very High (≥90%)': 0,
            'High (70-89%)': 0,
            'Medium (50-69%)': 0,
            'Low (30-49%)': 0,
            'Very Low (<30%)': 0
        }

        for decision_log in self.decisions:
            confidence = decision_log['decision'].get('confidence', 0.0)
            if confidence >= 0.9:
                distribution['Very High (≥90%)'] += 1
            elif confidence >= 0.7:
                distribution['High (70-89%)'] += 1
            elif confidence >= 0.5:
                distribution['Medium (50-69%)'] += 1
            elif confidence >= 0.3:
                distribution['Low (30-49%)'] += 1
            else:
                distribution['Very Low (<30%)'] += 1

        for category, count in distribution.items():
            if count > 0:
                percentage = (count / len(self.decisions)) * 100
                print(f"  {category}: {count} ({percentage:.1f}%)")

    def show_risk_assessment(self):
        """
        Display risk assessment for decisions.
        """
        print("\n=== Risk Assessment ===")

        if not self.decisions:
            print("No decisions to analyze")
            return

        # Group decisions by risk level
        risk_levels = {
            'low': [],
            'medium': [],
            'high': [],
            'critical': []
        }

        for decision_log in self.decisions:
            risk_assessment = decision_log['decision'].get('risk_assessment', {})
            risk_level = risk_assessment.get('level', 'unknown')
            if risk_level in risk_levels:
                risk_levels[risk_level].append(decision_log)

        print("\nDecisions by Risk Level:")
        for risk_level, decision_logs in risk_levels.items():
            if decision_logs:
                print(f"\n{risk_level.upper()} Risk: {len(decision_logs)} decision(s)")

                for decision_log in decision_logs[:3]:  # Show first 3
                    task_id = decision_log['task_id']
                    risk_score = decision_log['decision'].get('risk_assessment', {}).get('score', 0.0)
                    print(f"  - Task {task_id}: Risk Score {risk_score:.2f}")

                if len(decision_logs) > 3:
                    print(f"  ... and {len(decision_logs) - 3} more")

    def show_decision_logging(self):
        """
        Display detailed decision logs.
        """
        print("\n=== Decision Logging ===")

        if not self.decisions:
            print("No decisions logged")
            return

        print(f"\nTotal Logged Decisions: {len(self.decisions)}")

        # Show recent decisions
        print("\nRecent Decisions (Last 5):")
        for decision_log in self.decisions[-5:]:
            timestamp = decision_log['timestamp']
            task_id = decision_log['task_id']
            decision = decision_log['decision']
            decision_type = decision.get('type', 'unknown')
            value = decision.get('value', 'unknown')

            print(f"\n  [{timestamp}]")
            print(f"  Task: {task_id}")
            print(f"  Type: {decision_type}")
            print(f"  Decision: {value}")

            # Show rationale if available
            if 'rationale' in decision:
                print(f"  Rationale: {decision['rationale']}")

            # Show alternatives considered
            if 'alternatives' in decision:
                alternatives = decision['alternatives']
                print(f"  Alternatives Considered: {len(alternatives)}")

    def show_learning_from_feedback(self):
        """
        Display how the system learns from decision outcomes.
        """
        print("\n=== Learning from Feedback ===")

        if not self.results or 'decision_feedback' not in self.results:
            print("No feedback data available")
            return

        feedback = self.results['decision_feedback']

        print(f"\nTotal Decisions with Feedback: {feedback.get('total_feedback', 0)}")

        # Show outcomes
        outcomes = feedback.get('outcomes', {})
        print("\nDecision Outcomes:")
        for outcome, count in outcomes.items():
            print(f"  {outcome}: {count}")

        # Show learning metrics
        learning_metrics = feedback.get('learning_metrics', {})
        print("\nLearning Metrics:")
        print(f"  Improvement Rate: {learning_metrics.get('improvement_rate', 0):.2%}")
        print(f"  Accuracy Improvement: {learning_metrics.get('accuracy_improvement', 0):.2%}")
        print(f"  Decision Quality Trend: {learning_metrics.get('quality_trend', 'unknown')}")

        # Show specific learnings
        learnings = feedback.get('learnings', [])
        if learnings:
            print("\nKey Learnings:")
            for i, learning in enumerate(learnings[:5], 1):
                print(f"  {i}. {learning}")

    def show_decision_metrics(self):
        """
        Display decision-making metrics and analytics.
        """
        print("\n=== Decision Metrics ===")

        if not self.results:
            print("⚠ No results available")
            return

        metrics = self.results.get('decision_metrics', {})

        print(f"\nTotal Decisions: {metrics.get('total_decisions', 0)}")
        print(f"Decisions by Type:")

        for decision_type, count in metrics.get('decisions_by_type', {}).items():
            print(f"  {decision_type}: {count}")

        print(f"\nDecision Quality:")
        print(f"  Average Confidence: {metrics.get('avg_confidence', 0):.2%}")
        print(f"  High Confidence Rate: {metrics.get('high_confidence_rate', 0):.2%}")
        print(f"  Low Confidence Rate: {metrics.get('low_confidence_rate', 0):.2%}")

        print(f"\nDecision Performance:")
        print(f"  Success Rate: {metrics.get('success_rate', 0):.2%}")
        print(f"  Average Decision Time: {metrics.get('avg_decision_time', 0):.2f}s")
        print(f"  Correct Decisions: {metrics.get('correct_decisions', 0)}")

    def save_results(self, output_path: str = None):
        """
        Save decision-making results including all decisions.

        Args:
            output_path: Optional path to save results
        """
        if not output_path:
            output_path = "decision_making_results.json"

        print(f"\n=== Saving Results to {output_path} ===")

        if not self.results:
            print("⚠ No results to save")
            return

        # Add decisions to results
        self.results['decisions'] = self.decisions

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
    Main execution function for decision-making demonstration.
    """
    print("=" * 70)
    print("Decision-Making Engine Demonstration Example")
    print("Ralph Runtime - Blackbox4 Phase 4")
    print("=" * 70)

    # Create demo instance
    demo = DecisionMakingDemo()

    try:
        # Step 1: Create decision-intensive plan
        demo.plan = demo.create_decision_intensive_plan()

        # Step 2: Initialize runtime
        demo.initialize_runtime()

        # Step 3: Execute with decision-making
        demo.execute_with_decision_making()

        # Step 4: Show autonomous decisions
        demo.show_autonomous_decisions()

        # Step 5: Show confidence scoring
        demo.show_confidence_scoring()

        # Step 6: Show risk assessment
        demo.show_risk_assessment()

        # Step 7: Show decision logging
        demo.show_decision_logging()

        # Step 8: Show learning from feedback
        demo.show_learning_from_feedback()

        # Step 9: Show decision metrics
        demo.show_decision_metrics()

        # Step 10: Save results
        demo.save_results()

        print("\n" + "=" * 70)
        print("✓ Decision-making demonstration completed successfully")
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
