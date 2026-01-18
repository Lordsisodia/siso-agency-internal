#!/usr/bin/env python3
"""
Think-Rail Validator - Hierarchical oversight for agent actions
Implements "smart agents supervise dumb agents" pattern
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import random
from dataclasses import dataclass
from enum import Enum


class ValidationLevel(Enum):
    """Validation levels"""
    ALWAYS = "always"  # Always validate (low-complexity agents)
    SPOT_CHECK = "spot_check"  # Random 30% validation (medium agents)
    TRUSTED = "trusted"  # No validation (high-complexity agents)


@dataclass
class ValidationResult:
    """Result of validation"""
    approved: bool
    feedback: Optional[str] = None
    confidence: float = 1.0
    suggestions: List[str] = None

    def __post_init__(self):
        if self.suggestions is None:
            self.suggestions = []


class ThinkRailValidator:
    """
    Think-rail system for hierarchical oversight

    Core Principle:
    - HQ model (GLM-4/Opus) validates and oversees
    - Low-complexity agents: Always validated
    - Medium-complexity agents: 30% spot-checking
    - High-complexity agents: Trusted (but can request validation)

    This ensures efficiency while maintaining safety
    """

    def __init__(self,
                 hq_model_config: Optional[Dict[str, Any]] = None,
                 spot_check_rate: float = 0.3):
        """
        Initialize think-rail validator

        Args:
            hq_model_config: Configuration for HQ model
            spot_check_rate: Probability of spot-checking medium agents (default: 0.3)
        """
        self.hq_model_config = hq_model_config or {}
        self.spot_check_rate = spot_check_rate

        # Agent complexity levels
        self.agent_complexity = {
            "simple": ValidationLevel.ALWAYS,
            "module": ValidationLevel.ALWAYS,
            "expert": ValidationLevel.SPOT_CHECK,
            "orchestrator": ValidationLevel.TRUSTED
        }

        # Action risk levels
        self.action_risk = {
            "file_write": "medium",
            "file_delete": "high",
            "git_push": "high",
            "command_execution": "high",
            "analysis": "low",
            "code_generation": "medium",
            "validation": "low"
        }

    def should_validate(self,
                       agent_type: str,
                       action: Dict[str, Any],
                       context: Optional[Dict[str, Any]] = None) -> bool:
        """
        Determine if action should be validated

        Args:
            agent_type: Type of agent (simple, expert, orchestrator, etc.)
            action: Action being performed
            context: Additional context

        Returns:
            True if validation is needed
        """
        # Get agent validation level
        agent_level = self.agent_complexity.get(agent_type, ValidationLevel.SPOT_CHECK)

        # Always validate low-complexity agents
        if agent_level == ValidationLevel.ALWAYS:
            return True

        # Spot-check medium-complexity agents
        if agent_level == ValidationLevel.SPOT_CHECK:
            return random.random() < self.spot_check_rate

        # Check action risk for trusted agents
        if agent_level == ValidationLevel.TRUSTED:
            action_type = action.get("type", "")
            risk_level = self.action_risk.get(action_type, "low")

            # Always validate high-risk actions
            if risk_level == "high":
                return True

            # Spot-check medium-risk actions
            if risk_level == "medium":
                return random.random() < (self.spot_check_rate / 2)

        # Trusted agents with low-risk actions don't need validation
        return False

    def validate_before(self,
                       agent_type: str,
                       action: Dict[str, Any],
                       context: Optional[Dict[str, Any]] = None) -> ValidationResult:
        """
        Validate action BEFORE execution

        Args:
            agent_type: Type of agent
            action: Action to validate
            context: Execution context

        Returns:
            ValidationResult with approval decision
        """
        action_type = action.get("type", "")
        description = action.get("description", "")

        # Pre-validation checks
        checks = [
            self._check_safety,
            self._check_relevance,
            self._check_efficiency
        ]

        for check in checks:
            result = check(action, context)
            if not result.approved:
                return ValidationResult(
                    approved=False,
                    feedback=result.feedback,
                    suggestions=result.suggestions
                )

        # For high-risk actions, require explicit confirmation
        if self.action_risk.get(action_type) == "high":
            return ValidationResult(
                approved=False,
                feedback=f"High-risk action '{action_type}' requires explicit confirmation",
                suggestions=[
                    "1. Review the action carefully",
                    f"2. Confirm this is the correct approach for: {description}",
                    "3. Consider safer alternatives"
                ]
            )

        # Approved
        return ValidationResult(approved=True)

    def validate_after(self,
                      agent_type: str,
                      result: Dict[str, Any],
                      context: Optional[Dict[str, Any]] = None) -> ValidationResult:
        """
        Validate result AFTER execution

        Args:
            agent_type: Type of agent
            result: Result to validate
            context: Execution context

        Returns:
            ValidationResult with approval decision
        """
        # Check if result makes sense
        checks = [
            self._check_completeness,
            self._check_correctness,
            self._check_quality
        ]

        issues = []

        for check in checks:
            check_result = check(result, context)
            if not check_result.approved:
                issues.append({
                    "check": check.__name__,
                    "reason": check_result.feedback,
                    "suggestions": check_result.suggestions
                })

        if issues:
            return ValidationResult(
                approved=False,
                feedback="Validation found issues with the result",
                suggestions=[f"Issue: {i['reason']}" for i in issues]
            )

        return ValidationResult(approved=True)

    def _check_safety(self,
                     action: Dict[str, Any],
                     context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check if action is safe"""
        action_type = action.get("type", "")

        # Dangerous actions
        dangerous = ["delete", "remove", "destroy", "drop"]

        if any(danger in action_type.lower() for danger in dangerous):
            return ValidationResult(
                approved=False,
                feedback=f"Dangerous action detected: {action_type}",
                suggestions=["Consider safer alternative", "Add confirmation step"]
            )

        return ValidationResult(approved=True)

    def _check_relevance(self,
                       action: Dict[str, Any],
                       context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check if action is relevant to goal"""
        if not context:
            return ValidationResult(approved=True)

        goal = context.get("goal", "")
        action_desc = action.get("description", "")

        # Simple relevance check
        if goal and action_desc:
            # Check if action description relates to goal
            goal_words = set(goal.lower().split())
            action_words = set(action_desc.lower().split())

            overlap = goal_words & action_words

            if len(overlap) == 0:
                return ValidationResult(
                    approved=False,
                    feedback=f"Action may not be relevant to goal: {goal}",
                    suggestions=["Ensure action aligns with current goal"]
                )

        return ValidationResult(approved=True)

    def _check_efficiency(self,
                        action: Dict[str, Any],
                        context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check if action is efficient"""
        action_type = action.get("type", "")

        # Inefficient patterns
        inefficient = [
            ("read_file", "Consider caching or reading once"),
            ("loop", "Check if there's a more efficient approach")
        ]

        for pattern, suggestion in inefficient:
            if pattern in action_type:
                return ValidationResult(
                    approved=False,
                    feedback=f"Potentially inefficient: {action_type}",
                    suggestions=[suggestion]
                )

        return ValidationResult(approved=True)

    def _check_completeness(self,
                          result: Dict[str, Any],
                          context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check if result is complete"""
        if "outputs" in result:
            outputs = result["outputs"]

            if not outputs or len(outputs) == 0:
                return ValidationResult(
                    approved=False,
                    feedback="No outputs generated",
                    suggestions=["Ensure action produces tangible outputs"]
                )

        return ValidationResult(approved=True)

    def _check_correctness(self,
                          result: Dict[str, Any],
                          context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check if result appears correct"""
        # Check for error indicators
        if "error" in result:
            return ValidationResult(
                approved=False,
                feedback=f"Action produced error: {result['error']}",
                suggestions=["Review and fix the error"]
            )

        if "status" in result and result["status"] == "failed":
            return ValidationResult(
                approved=False,
                feedback="Action failed",
                suggestions=["Review failure reason and retry"]
            )

        return ValidationResult(approved=True)

    def _check_quality(self,
                     result: Dict[str, Any],
                     context: Optional[Dict[str, Any]]) -> ValidationResult:
        """Check result quality"""
        # Basic quality checks
        if "artifacts" in result:
            artifacts = result["artifacts"]

            # Check if artifacts are empty
            for artifact in artifacts:
                if isinstance(artifact, dict):
                    if "content" in artifact and not artifact["content"]:
                        return ValidationResult(
                            approved=False,
                            feedback="Empty artifact detected",
                            suggestions=["Ensure artifacts have meaningful content"]
                        )

        return ValidationResult(approved=True)

    def get_validation_summary(self,
                              agent_type: str,
                              total_actions: int,
                              validated_actions: int,
                              approved_actions: int) -> Dict[str, Any]:
        """Get validation summary statistics"""
        validation_rate = validated_actions / total_actions if total_actions > 0 else 0
        approval_rate = approved_actions / validated_actions if validated_actions > 0 else 0

        return {
            "agent_type": agent_type,
            "total_actions": total_actions,
            "validated_actions": validated_actions,
            "approved_actions": approved_actions,
            "validation_rate": f"{validation_rate:.1%}",
            "approval_rate": f"{approval_rate:.1%}",
            "efficiency_gain": f"{1.0 - validation_rate:.1%}"  # Actions that skipped validation
        }


# Singleton instance
_validator_instance = None

def get_validator() -> ThinkRailValidator:
    """Get singleton validator instance"""
    global _validator_instance
    if _validator_instance is None:
        _validator_instance = ThinkRailValidator()
    return _validator_instance
