#!/usr/bin/env python3
"""
Decision Engine - AI Decision Making

The DecisionEngine class provides intelligent decision-making capabilities
for autonomous execution, including context evaluation, action selection,
and risk assessment.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class DecisionType(Enum):
    """Types of decisions"""
    EXECUTE = "execute"
    SKIP = "skip"
    DELEGATE = "delegate"
    WAIT = "wait"
    ESCALATE = "escalate"
    RETRY = "retry"


@dataclass
class DecisionContext:
    """Context for making a decision"""
    current_task: str = ""
    current_agent: str = ""
    target_agent: str = ""
    context_variables: Dict[str, Any] = field(default_factory=dict)
    available_actions: List[str] = field(default_factory=list)
    available_agents: List[str] = field(default_factory=list)
    risk_tolerance: float = 0.5
    time_constraint: Optional[int] = None
    resource_constraints: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "current_task": self.current_task,
            "current_agent": self.current_agent,
            "target_agent": self.target_agent,
            "context_variables": self.context_variables,
            "available_actions": self.available_actions,
            "available_agents": self.available_agents,
            "risk_tolerance": self.risk_tolerance,
            "time_constraint": self.time_constraint,
            "resource_constraints": self.resource_constraints
        }


@dataclass
class DecisionResult:
    """Result of a decision"""
    action: str
    confidence: float
    rationale: str
    risk_assessment: Dict[str, float] = field(default_factory=dict)
    alternative_actions: List[Dict[str, Any]] = field(default_factory=list)
    delegate_to: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "action": self.action,
            "confidence": self.confidence,
            "rationale": self.rationale,
            "risk_assessment": self.risk_assessment,
            "alternative_actions": self.alternative_actions,
            "delegate_to": self.delegate_to,
            "timestamp": self.timestamp.isoformat()
        }


class DecisionEngine:
    """
    AI-powered decision-making engine.

    Evaluates context, assesses risks, and selects optimal actions
    for autonomous execution.
    """

    def __init__(self, default_confidence_threshold: float = 0.7):
        """
        Initialize the decision engine.

        Args:
            default_confidence_threshold: Default threshold for autonomous decisions
        """
        self.default_confidence_threshold = default_confidence_threshold
        self._decision_history: List[Dict[str, Any]] = []
        self._decision_patterns: Dict[str, float] = {}

    def evaluate_context(self, context: DecisionContext) -> DecisionResult:
        """
        Evaluate current context and provide assessment.

        Args:
            context: Decision context

        Returns:
            Decision result with assessment
        """
        logger.info(f"Evaluating context for task: {context.current_task}")

        # Collect context factors
        factors = self._collect_context_factors(context)

        # Calculate overall situational confidence
        confidence = self._calculate_situational_confidence(factors, context)

        # Generate rationale
        rationale = self._generate_context_rationale(factors, confidence)

        # Assess risks
        risks = self.assess_risk(context)

        result = DecisionResult(
            action="evaluate",
            confidence=confidence,
            rationale=rationale,
            risk_assessment=risks
        )

        self._log_decision("context_evaluation", context, result)
        return result

    def choose_action(self, context: DecisionContext) -> DecisionResult:
        """
        Select the best action from available options.

        Args:
            context: Decision context

        Returns:
            Decision result with selected action
        """
        logger.info(f"Choosing action for task: {context.current_task}")

        if not context.available_actions:
            return DecisionResult(
                action="wait",
                confidence=0.0,
                rationale="No available actions"
            )

        # Score each available action
        action_scores = []
        for action in context.available_actions:
            score = self._score_action(action, context)
            action_scores.append((action, score))

        # Sort by score
        action_scores.sort(key=lambda x: x[1]["score"], reverse=True)

        # Select best action
        best_action, best_score = action_scores[0]

        # Check if confidence meets threshold
        if best_score["score"] < self.default_confidence_threshold:
            # Consider escalation or waiting
            if "escalate" in context.available_actions:
                best_action = "escalate"
            elif "wait" in context.available_actions:
                best_action = "wait"

        # Generate alternatives
        alternatives = [
            {"action": action, **score}
            for action, score in action_scores[1:4]
        ]

        result = DecisionResult(
            action=best_action,
            confidence=best_score["score"],
            rationale=best_score["rationale"],
            risk_assessment=best_score["risks"],
            alternative_actions=alternatives
        )

        # Set delegate target if delegating
        if best_action == "delegate" and context.available_agents:
            result.delegate_to = self._select_delegation_target(context)

        self._log_decision("action_selection", context, result)
        return result

    def assess_risk(self, context: DecisionContext) -> Dict[str, float]:
        """
        Assess risks associated with current context.

        Args:
            context: Decision context

        Returns:
            Dictionary of risk categories and scores (0-1, higher = riskier)
        """
        risks = {
            "execution": 0.0,
            "resource": 0.0,
            "dependency": 0.0,
            "permission": 0.0,
            "time": 0.0
        }

        # Assess execution risk
        error_count = sum(
            1 for k, v in context.context_variables.items()
            if k.endswith("_result") and isinstance(v, dict) and v.get("status") == "error"
        )
        risks["execution"] = min(error_count * 0.2, 1.0)

        # Assess resource risk
        if "memory_available" in context.resource_constraints:
            risks["resource"] = 1.0 - context.resource_constraints["memory_available"]
        if "disk_available" in context.resource_constraints:
            risks["resource"] = max(
                risks["resource"],
                1.0 - context.resource_constraints["disk_available"]
            )

        # Assess dependency risk
        task_dependencies = context.context_variables.get("dependencies", [])
        if task_dependencies:
            missing = sum(
                1 for dep in task_dependencies
                if dep not in context.context_variables
            )
            risks["dependency"] = missing / len(task_dependencies) if task_dependencies else 0.0

        # Assess permission risk
        if "sudo_required" in context.context_variables:
            risks["permission"] = 0.7
        if "api_keys_required" in context.context_variables:
            risks["permission"] = max(risks["permission"], 0.3)

        # Assess time risk
        if context.time_constraint:
            estimated_time = self._estimate_execution_time(context)
            if estimated_time > context.time_constraint:
                risks["time"] = (estimated_time - context.time_constraint) / context.time_constraint
                risks["time"] = min(risks["time"], 1.0)

        return risks

    def calculate_confidence(
        self,
        context: DecisionContext,
        action: str
    ) -> float:
        """
        Calculate confidence score for a specific action.

        Args:
            context: Decision context
            action: Action to evaluate

        Returns:
            Confidence score (0-1)
        """
        score_data = self._score_action(action, context)
        return score_data["score"]

    def get_decision_history(self) -> List[Dict[str, Any]]:
        """Get decision history"""
        return self._decision_history.copy()

    def get_decision_patterns(self) -> Dict[str, float]:
        """Get learned decision patterns"""
        return self._decision_patterns.copy()

    def _collect_context_factors(self, context: DecisionContext) -> Dict[str, Any]:
        """Collect factors from context for evaluation"""
        factors = {
            "task_clarity": self._assess_task_clarity(context),
            "resource_availability": self._assess_resource_availability(context),
            "dependency_satisfaction": self._assess_dependencies(context),
            "permission_status": self._assess_permissions(context),
            "historical_success": self._assess_historical_success(context)
        }
        return factors

    def _assess_task_clarity(self, context: DecisionContext) -> float:
        """Assess how clear the task is"""
        # Check for task description
        if not context.current_task:
            return 0.0

        # Check for required parameters
        task_params = context.context_variables.get("task_parameters", {})
        if task_params:
            completeness = sum(
                1 for v in task_params.values()
                if v is not None and v != ""
            )
            return completeness / len(task_params)

        return 0.5

    def _assess_resource_availability(self, context: DecisionContext) -> float:
        """Assess resource availability"""
        if not context.resource_constraints:
            return 1.0

        scores = []
        for resource, availability in context.resource_constraints.items():
            if isinstance(availability, (int, float)):
                scores.append(min(max(availability, 0.0), 1.0))

        return sum(scores) / len(scores) if scores else 0.5

    def _assess_dependencies(self, context: DecisionContext) -> float:
        """Assess if dependencies are satisfied"""
        dependencies = context.context_variables.get("dependencies", [])
        if not dependencies:
            return 1.0

        satisfied = sum(
            1 for dep in dependencies
            if dep in context.context_variables
        )
        return satisfied / len(dependencies)

    def _assess_permissions(self, context: DecisionContext) -> float:
        """Assess permission status"""
        # Check for known permission issues
        if "permission_denied" in str(context.context_variables):
            return 0.0

        # Check for authentication
        if "authenticated" in context.context_variables:
            return 1.0 if context.context_variables["authenticated"] else 0.3

        return 0.7  # Assume okay if no issues

    def _assess_historical_success(self, context: DecisionContext) -> float:
        """Assess based on historical success patterns"""
        task_type = context.context_variables.get("task_type", "unknown")
        pattern_key = f"{task_type}_success_rate"

        if pattern_key in self._decision_patterns:
            return self._decision_patterns[pattern_key]

        return 0.5  # Neutral if no history

    def _calculate_situational_confidence(
        self,
        factors: Dict[str, float],
        context: DecisionContext
    ) -> float:
        """Calculate overall confidence from factors"""
        weights = {
            "task_clarity": 0.3,
            "resource_availability": 0.2,
            "dependency_satisfaction": 0.2,
            "permission_status": 0.15,
            "historical_success": 0.15
        }

        weighted_score = sum(
            factors.get(f, 0.5) * weights.get(f, 0.2)
            for f in weights.keys()
        )

        return weighted_score

    def _generate_context_rationale(
        self,
        factors: Dict[str, float],
        confidence: float
    ) -> str:
        """Generate rationale for context evaluation"""
        parts = []

        for factor, value in factors.items():
            if value < 0.5:
                parts.append(f"{factor} is low ({value:.2f})")
            elif value > 0.8:
                parts.append(f"{factor} is good ({value:.2f})")

        if not parts:
            parts.append("All factors within acceptable range")

        return f"Confidence {confidence:.2f}. " + "; ".join(parts) + "."

    def _score_action(
        self,
        action: str,
        context: DecisionContext
    ) -> Dict[str, Any]:
        """Score a specific action"""
        # Base scores for different actions
        base_scores = {
            "execute": 0.7,
            "skip": 0.3,
            "delegate": 0.5,
            "wait": 0.4,
            "escalate": 0.2,
            "retry": 0.6
        }

        base_score = base_scores.get(action, 0.5)

        # Calculate risks
        risks = self.assess_risk(context)
        overall_risk = sum(risks.values()) / len(risks)

        # Adjust score based on risk tolerance
        risk_adjustment = (context.risk_tolerance - overall_risk) * 0.3
        adjusted_score = base_score + risk_adjustment

        # Action-specific adjustments
        if action == "execute":
            # Prefer execution if resources are good
            if risks["resource"] < 0.3:
                adjusted_score += 0.1
            # Reduce if dependencies not met
            if risks["dependency"] > 0.5:
                adjusted_score -= 0.2

        elif action == "delegate":
            # Prefer delegation if specialized agents available
            if len(context.available_agents) > 1:
                adjusted_score += 0.2

        elif action == "skip":
            # Only skip if low risk
            if overall_risk < 0.2:
                adjusted_score += 0.1

        # Clamp to valid range
        adjusted_score = max(min(adjusted_score, 1.0), 0.0)

        # Generate rationale
        rationale = self._generate_action_rationale(action, adjusted_score, risks, context)

        return {
            "score": adjusted_score,
            "rationale": rationale,
            "risks": risks
        }

    def _generate_action_rationale(
        self,
        action: str,
        score: float,
        risks: Dict[str, float],
        context: DecisionContext
    ) -> str:
        """Generate rationale for action selection"""
        rationale_parts = [f"Action '{action}' scored {score:.2f}"]

        # Add risk information
        high_risks = [k for k, v in risks.items() if v > 0.6]
        if high_risks:
            rationale_parts.append(f"High risks: {', '.join(high_risks)}")

        # Add context-specific info
        if action == "execute" and risks["dependency"] > 0.5:
            rationale_parts.append("Some dependencies not met")
        elif action == "delegate" and context.available_agents:
            rationale_parts.append(f"Can delegate to {len(context.available_agents)} agents")

        return ". ".join(rationale_parts)

    def _select_delegation_target(self, context: DecisionContext) -> str:
        """Select best agent for delegation"""
        if not context.available_agents:
            return context.current_agent

        # Simple strategy: prefer different agent
        if len(context.available_agents) > 1:
            return context.available_agents[1]

        return context.available_agents[0]

    def _estimate_execution_time(self, context: DecisionContext) -> int:
        """Estimate execution time for time risk assessment"""
        # Base time estimation
        base_time = 60

        # Check for historical data
        task_type = context.context_variables.get("task_type", "default")
        history_key = f"{task_type}_avg_time"

        if history_key in self._decision_patterns:
            return int(self._decision_patterns[history_key])

        return base_time

    def _log_decision(
        self,
        decision_type: str,
        context: DecisionContext,
        result: DecisionResult
    ) -> None:
        """Log decision to history"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "type": decision_type,
            "context": context.to_dict(),
            "result": result.to_dict()
        }
        self._decision_history.append(log_entry)

        # Update patterns
        if decision_type == "action_selection":
            action = result.action
            pattern_key = f"{context.current_task}_{action}"
            current_count = self._decision_patterns.get(f"{pattern_key}_count", 0)
            self._decision_patterns[f"{pattern_key}_count"] = current_count + 1
            self._decision_patterns[f"{pattern_key}_confidence"] = result.confidence

        logger.debug(f"Decision logged: {decision_type} -> {result.action}")
