#!/usr/bin/env python3
"""
Autonomous Agent - Self-Directing Agent Implementation

The AutonomousAgent class provides self-direction capabilities including
planning, completion evaluation, and learning from feedback.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class AgentConfidence:
    """Confidence score for agent decisions"""
    score: float
    rationale: str
    factors: Dict[str, float] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "score": self.score,
            "rationale": self.rationale,
            "factors": self.factors,
            "timestamp": self.timestamp.isoformat()
        }


@dataclass
class NextStep:
    """Planned next step"""
    action: str
    description: str
    priority: int
    estimated_duration: Optional[int] = None
    dependencies: List[str] = field(default_factory=list)
    confidence: float = 0.8

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "action": self.action,
            "description": self.description,
            "priority": self.priority,
            "estimated_duration": self.estimated_duration,
            "dependencies": self.dependencies,
            "confidence": self.confidence
        }


class AutonomousAgent:
    """
    Self-directing agent with autonomous capabilities.

    This agent can plan next steps, evaluate completion, request help,
    and learn from feedback - enabling true autonomous execution.
    """

    def __init__(self, learning_rate: float = 0.1):
        """
        Initialize the autonomous agent.

        Args:
            learning_rate: Rate at which agent learns from feedback
        """
        self.learning_rate = learning_rate
        self._feedback_history: List[Dict[str, Any]] = []
        self._performance_metrics: Dict[str, float] = {
            "successful_decisions": 0.0,
            "failed_decisions": 0.0,
            "help_requests": 0.0,
            "corrections_received": 0.0
        }

    def plan_next_steps(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> List[NextStep]:
        """
        Plan upcoming actions based on current task and context.

        Args:
            task: Current task to plan for
            context: Current execution context

        Returns:
            List of planned next steps
        """
        logger.info(f"Planning next steps for task: {task.get('id')}")

        steps = []

        # Analyze task requirements
        task_type = task.get("type", "default")
        task_dependencies = task.get("dependencies", [])

        # Step 1: Validate prerequisites
        if task_dependencies:
            steps.append(NextStep(
                action="validate_prerequisites",
                description="Check that all dependencies are satisfied",
                priority=1,
                dependencies=[],
                confidence=self._calculate_prerequisite_confidence(context, task_dependencies)
            ))

        # Step 2: Prepare execution environment
        steps.append(NextStep(
            action="prepare_environment",
            description="Set up execution environment with required resources",
            priority=2,
            dependencies=["validate_prerequisites"] if task_dependencies else [],
            confidence=0.9
        ))

        # Step 3: Execute primary task
        steps.append(NextStep(
            action="execute_task",
            description=f"Execute {task.get('description', 'task')}",
            priority=3,
            dependencies=["prepare_environment"],
            confidence=self._calculate_execution_confidence(task, context)
        ))

        # Step 4: Validate results
        steps.append(NextStep(
            action="validate_results",
            description="Validate execution results against requirements",
            priority=4,
            dependencies=["execute_task"],
            confidence=0.85
        ))

        # Step 5: Update context
        steps.append(NextStep(
            action="update_context",
            description="Update context with execution results",
            priority=5,
            dependencies=["validate_results"],
            confidence=0.95
        ))

        # Sort by priority and filter low-confidence steps
        filtered_steps = [s for s in steps if s.confidence >= 0.5]
        sorted_steps = sorted(filtered_steps, key=lambda x: x.priority)

        logger.info(f"Planned {len(sorted_steps)} steps")
        return sorted_steps

    def evaluate_completion(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> AgentConfidence:
        """
        Assess if task is complete and meets requirements.

        Args:
            task: Task to evaluate
            context: Current execution context

        Returns:
            Confidence assessment
        """
        logger.info(f"Evaluating completion for task: {task.get('id')}")

        factors = {}

        # Factor 1: Task execution status
        task_result = context.get(f"task_{task.get('id')}_result", {})
        execution_status = task_result.get("status", "unknown")
        factors["execution_status"] = 1.0 if execution_status == "completed" else 0.3

        # Factor 2: Result validation
        if task_result.get("validated"):
            factors["validation"] = 1.0
        else:
            factors["validation"] = 0.5

        # Factor 3: Context completeness
        required_keys = task.get("required_context_keys", [])
        if required_keys:
            present_keys = sum(1 for k in required_keys if k in context)
            factors["context_completeness"] = present_keys / len(required_keys)
        else:
            factors["context_completeness"] = 1.0

        # Factor 4: Error check
        if "error" in task_result:
            factors["error_free"] = 0.0
        else:
            factors["error_free"] = 1.0

        # Factor 5: Performance history
        success_rate = self._calculate_success_rate()
        factors["historical_success"] = success_rate

        # Calculate overall confidence
        weights = {
            "execution_status": 0.4,
            "validation": 0.2,
            "context_completeness": 0.2,
            "error_free": 0.15,
            "historical_success": 0.05
        }

        weighted_score = sum(
            factors.get(f, 0.5) * weights.get(f, 0.2)
            for f in weights.keys()
        )

        # Generate rationale
        rationale_parts = []
        if factors["execution_status"] < 0.5:
            rationale_parts.append("Task not yet completed")
        if factors["validation"] < 0.8:
            rationale_parts.append("Results not fully validated")
        if factors["context_completeness"] < 0.8:
            rationale_parts.append("Context missing required keys")
        if factors["error_free"] < 0.5:
            rationale_parts.append("Errors detected in execution")

        if not rationale_parts:
            rationale = "Task appears complete with all requirements met"
        else:
            rationale = "; ".join(rationale_parts)

        confidence = AgentConfidence(
            score=weighted_score,
            rationale=rationale,
            factors=factors
        )

        logger.info(f"Completion confidence: {confidence.score:.2f} - {rationale}")
        return confidence

    def request_help(
        self,
        task: Dict[str, Any],
        issue: str,
        context: Dict[str, Any],
        urgency: str = "medium"
    ) -> Dict[str, Any]:
        """
        Request human intervention when needed.

        Args:
            task: Task requiring help
            issue: Description of the issue
            context: Current execution context
            urgency: Urgency level (low, medium, high, critical)

        Returns:
            Help request result
        """
        logger.warning(f"Requesting help for task {task.get('id')}: {issue}")

        self._performance_metrics["help_requests"] += 1.0

        help_request = {
            "timestamp": datetime.now().isoformat(),
            "task_id": task.get("id"),
            "task_description": task.get("description"),
            "issue": issue,
            "urgency": urgency,
            "context_snapshot": {
                k: str(v)[:100] for k, v in context.items()
            },
            "suggested_actions": self._generate_suggested_actions(task, issue, context),
            "status": "pending"
        }

        # In production, this would send notification to human
        # For now, log and return
        logger.info(f"Help request created: {help_request}")

        return help_request

    def learn_from_feedback(
        self,
        task: Dict[str, Any],
        feedback: Dict[str, Any],
        outcome: str
    ) -> None:
        """
        Learn from human corrections and feedback.

        Args:
            task: Task that received feedback
            feedback: Feedback content
            outcome: Result of applying feedback (success, failure, partial)
        """
        logger.info(f"Learning from feedback for task {task.get('id')}")

        self._performance_metrics["corrections_received"] += 1.0

        feedback_record = {
            "timestamp": datetime.now().isoformat(),
            "task_id": task.get("id"),
            "feedback": feedback,
            "outcome": outcome,
            "learning_rate": self.learning_rate
        }

        self._feedback_history.append(feedback_record)

        # Update performance metrics based on outcome
        if outcome == "success":
            self._performance_metrics["successful_decisions"] += 1.0
        elif outcome == "failure":
            self._performance_metrics["failed_decisions"] += 1.0

        # Apply learning to future decisions
        self._apply_learning(feedback, outcome)

        logger.info(f"Learning applied. Success rate: {self._calculate_success_rate():.2f}")

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        total = (
            self._performance_metrics["successful_decisions"] +
            self._performance_metrics["failed_decisions"]
        )

        return {
            **self._performance_metrics,
            "success_rate": self._calculate_success_rate(),
            "total_decisions": total,
            "feedback_count": len(self._feedback_history),
            "learning_rate": self.learning_rate
        }

    def reset_metrics(self) -> None:
        """Reset performance metrics"""
        self._performance_metrics = {
            "successful_decisions": 0.0,
            "failed_decisions": 0.0,
            "help_requests": 0.0,
            "corrections_received": 0.0
        }
        self._feedback_history = []
        logger.info("Performance metrics reset")

    def _calculate_prerequisite_confidence(
        self,
        context: Dict[str, Any],
        dependencies: List[str]
    ) -> float:
        """Calculate confidence in prerequisites being met"""
        if not dependencies:
            return 1.0

        met = sum(1 for dep in dependencies if dep in context)
        return met / len(dependencies)

    def _calculate_execution_confidence(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> float:
        """Calculate confidence in task execution"""
        base_confidence = 0.7

        # Adjust based on complexity
        complexity = task.get("complexity", "medium")
        if complexity == "low":
            base_confidence += 0.2
        elif complexity == "high":
            base_confidence -= 0.2

        # Adjust based on similar tasks in context
        similar_tasks = sum(
            1 for k, v in context.items()
            if k.startswith("task_") and isinstance(v, dict) and v.get("status") == "completed"
        )
        base_confidence += min(similar_tasks * 0.05, 0.2)

        return min(max(base_confidence, 0.0), 1.0)

    def _calculate_success_rate(self) -> float:
        """Calculate historical success rate"""
        successful = self._performance_metrics["successful_decisions"]
        failed = self._performance_metrics["failed_decisions"]
        total = successful + failed

        if total == 0:
            return 0.5  # Neutral when no history

        return successful / total

    def _generate_suggested_actions(
        self,
        task: Dict[str, Any],
        issue: str,
        context: Dict[str, Any]
    ) -> List[str]:
        """Generate suggested actions for human review"""
        suggestions = []

        # Suggest based on issue type
        if "error" in issue.lower():
            suggestions.append("Review error logs and stack traces")
            suggestions.append("Check resource availability")
            suggestions.append("Verify configuration settings")

        if "permission" in issue.lower():
            suggestions.append("Check file/directory permissions")
            suggestions.append("Verify authentication credentials")

        if "dependency" in issue.lower():
            suggestions.append("Install missing dependencies")
            suggestions.append("Update package versions")

        # Suggest based on task type
        task_type = task.get("type", "")
        if task_type == "file_operation":
            suggestions.append("Verify file paths and accessibility")
        elif task_type == "network":
            suggestions.append("Check network connectivity")
            suggestions.append("Verify API endpoints")

        # Default suggestions
        if not suggestions:
            suggestions.append("Review task requirements")
            suggestions.append("Check execution context")
            suggestions.append("Verify environment setup")

        return suggestions

    def _apply_learning(self, feedback: Dict[str, Any], outcome: str) -> None:
        """Apply learning from feedback to future decisions"""
        # Extract learning points from feedback
        corrections = feedback.get("corrections", [])
        preferences = feedback.get("preferences", {})

        # In a full implementation, this would update models/policies
        # For now, log the learning points
        logger.info(f"Applying {len(corrections)} corrections and {len(preferences)} preferences")

        # Adjust learning rate based on outcome
        if outcome == "success":
            # Reinforce successful patterns
            self.learning_rate = min(self.learning_rate * 1.1, 0.5)
        elif outcome == "failure":
            # Increase learning from failures
            self.learning_rate = max(self.learning_rate * 0.9, 0.01)

    def should_autonomously_proceed(
        self,
        task: Dict[str, Any],
        confidence: AgentConfidence,
        threshold: float = 0.7
    ) -> bool:
        """
        Decide if agent should proceed autonomously.

        Args:
            task: Task to evaluate
            confidence: Confidence assessment
            threshold: Minimum confidence threshold

        Returns:
            True if should proceed autonomously
        """
        # Check confidence threshold
        if confidence.score < threshold:
            return False

        # Check for critical issues
        if "critical" in task.get("risk_level", "").lower():
            return False

        # Check for missing required approvals
        if task.get("requires_approval", False):
            approval_key = f"approval_{task.get('id')}"
            if not task.get(approval_key, False):
                return False

        return True

    def estimate_completion_time(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> int:
        """
        Estimate time to complete task.

        Args:
            task: Task to estimate
            context: Execution context

        Returns:
            Estimated seconds to completion
        """
        base_time = 60  # Base 1 minute

        # Adjust based on complexity
        complexity = task.get("complexity", "medium")
        multipliers = {
            "low": 0.5,
            "medium": 1.0,
            "high": 2.0,
            "critical": 3.0
        }
        multiplier = multipliers.get(complexity, 1.0)

        # Adjust based on historical performance
        success_rate = self._calculate_success_rate()
        if success_rate < 0.5:
            multiplier *= 1.5  # Take more time if historically unsuccessful

        # Adjust based on similar past tasks
        similar_completion_times = [
            f.get("completion_time", base_time)
            for f in self._feedback_history
            if f.get("task_type") == task.get("type")
        ]

        if similar_completion_times:
            avg_time = sum(similar_completion_times) / len(similar_completion_times)
            return int(avg_time * multiplier)

        return int(base_time * multiplier)
