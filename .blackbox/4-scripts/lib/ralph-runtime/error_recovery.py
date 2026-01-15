#!/usr/bin/env python3
"""
Error Recovery - Error Detection and Recovery

The ErrorRecovery class handles error detection, classification, and
recovery strategies for robust autonomous execution.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class ErrorType(Enum):
    """Types of errors"""
    VALIDATION = "validation"
    EXECUTION = "execution"
    RESOURCE = "resource"
    PERMISSION = "permission"
    NETWORK = "network"
    DEPENDENCY = "dependency"
    UNKNOWN = "unknown"


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RecoveryStrategy(Enum):
    """Recovery strategies"""
    RETRY = "retry"
    ALTERNATIVE = "alternative"
    SKIP = "skip"
    ESCALATE = "escalate"
    ABORT = "abort"


@dataclass
class ErrorInfo:
    """Information about an error"""
    message: str
    error_type: ErrorType = ErrorType.UNKNOWN
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
    timestamp: datetime = field(default_factory=datetime.now)
    stack_trace: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "message": self.message,
            "error_type": self.error_type.value,
            "severity": self.severity.value,
            "timestamp": self.timestamp.isoformat(),
            "stack_trace": self.stack_trace,
            "context": self.context
        }


@dataclass
class ErrorClassification:
    """Classification of an error"""
    error_info: ErrorInfo
    error_type: ErrorType
    severity: ErrorSeverity
    is_recoverable: bool
    suggested_strategy: RecoveryStrategy
    confidence: float
    rationale: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "error_info": self.error_info.to_dict(),
            "error_type": self.error_type.value,
            "severity": self.severity.value,
            "is_recoverable": self.is_recoverable,
            "suggested_strategy": self.suggested_strategy.value,
            "confidence": self.confidence,
            "rationale": self.rationale
        }


@dataclass
class RecoveryAction:
    """A recovery action to attempt"""
    strategy: RecoveryStrategy
    description: str
    retry_delay: Optional[float] = None
    max_attempts: Optional[int] = None
    alternative_command: Optional[str] = None
    escalation_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "strategy": self.strategy.value,
            "description": self.description,
            "retry_delay": self.retry_delay,
            "max_attempts": self.max_attempts,
            "alternative_command": self.alternative_command,
            "escalation_message": self.escalation_message
        }


class ErrorRecovery:
    """
    Handle error detection, classification, and recovery.

    Provides intelligent error analysis and automated recovery strategies.
    """

    def __init__(self):
        """Initialize the error recovery system"""
        self._error_history: List[ErrorClassification] = []
        self._recovery_history: List[Dict[str, Any]] = []
        self._error_patterns: Dict[str, int] = {}

        # Register recovery handlers
        self._recovery_handlers: Dict[ErrorType, Callable] = {
            ErrorType.VALIDATION: self._handle_validation_error,
            ErrorType.EXECUTION: self._handle_execution_error,
            ErrorType.RESOURCE: self._handle_resource_error,
            ErrorType.PERMISSION: self._handle_permission_error,
            ErrorType.NETWORK: self._handle_network_error,
            ErrorType.DEPENDENCY: self._handle_dependency_error,
        }

    def detect_error(self, error_message: str) -> ErrorInfo:
        """
        Detect and parse error information.

        Args:
            error_message: Raw error message

        Returns:
            Error information
        """
        logger.error(f"Detecting error: {error_message}")

        error_info = ErrorInfo(message=error_message)
        error_info.error_type = self._detect_error_type(error_message)
        error_info.severity = self._assess_error_severity(error_message, error_info.error_type)

        # Extract additional context
        error_info.context = self._extract_error_context(error_message)

        # Track error patterns
        pattern_key = f"{error_info.error_type.value}_{error_info.severity.value}"
        self._error_patterns[pattern_key] = self._error_patterns.get(pattern_key, 0) + 1

        return error_info

    def classify_error(self, error_info: ErrorInfo) -> ErrorClassification:
        """
        Classify an error and determine recovery strategy.

        Args:
            error_info: Error information

        Returns:
            Error classification
        """
        logger.info(f"Classifying error: {error_info.error_type.value}")

        # Determine if recoverable
        is_recoverable = self._is_recoverable(error_info)

        # Suggest strategy
        suggested_strategy = self._suggest_recovery_strategy(error_info, is_recoverable)

        # Calculate confidence
        confidence = self._calculate_classification_confidence(error_info, suggested_strategy)

        # Generate rationale
        rationale = self._generate_classification_rationale(error_info, suggested_strategy, is_recoverable)

        classification = ErrorClassification(
            error_info=error_info,
            error_type=error_info.error_type,
            severity=error_info.severity,
            is_recoverable=is_recoverable,
            suggested_strategy=suggested_strategy,
            confidence=confidence,
            rationale=rationale
        )

        self._error_history.append(classification)
        return classification

    def attempt_recovery(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """
        Attempt recovery based on error classification.

        Args:
            classification: Error classification
            retry_count: Current retry count
            max_retries: Maximum retry attempts

        Returns:
            Recovery action to take
        """
        logger.info(f"Attempting recovery (attempt {retry_count + 1}/{max_retries})")

        # Get recovery handler for error type
        handler = self._recovery_handlers.get(
            classification.error_type,
            self._handle_unknown_error
        )

        # Get recovery action from handler
        action = handler(classification, retry_count, max_retries)

        # Log recovery attempt
        self._recovery_history.append({
            "timestamp": datetime.now().isoformat(),
            "classification": classification.to_dict(),
            "action": action.to_dict(),
            "retry_count": retry_count
        })

        return action

    def escalate_to_human(
        self,
        classification: ErrorClassification,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Escalate error to human intervention.

        Args:
            classification: Error classification
            context: Additional context

        Returns:
            Escalation information
        """
        logger.warning(f"Escalating error to human: {classification.error_info.message}")

        escalation = {
            "timestamp": datetime.now().isoformat(),
            "error": classification.error_info.to_dict(),
            "classification": classification.to_dict(),
            "context": context or {},
            "severity": classification.severity.value,
            "recommendation": self._generate_escalation_recommendation(classification)
        }

        return escalation

    def get_error_statistics(self) -> Dict[str, Any]:
        """Get error statistics"""
        if not self._error_history:
            return {"total_errors": 0}

        # Count by type
        type_counts = {}
        severity_counts = {}
        strategy_counts = {}

        for classification in self._error_history:
            type_counts[classification.error_type.value] = \
                type_counts.get(classification.error_type.value, 0) + 1
            severity_counts[classification.severity.value] = \
                severity_counts.get(classification.severity.value, 0) + 1
            strategy_counts[classification.suggested_strategy.value] = \
                strategy_counts.get(classification.suggested_strategy.value, 0) + 1

        return {
            "total_errors": len(self._error_history),
            "by_type": type_counts,
            "by_severity": severity_counts,
            "by_strategy": strategy_counts,
            "patterns": self._error_patterns.copy()
        }

    def _detect_error_type(self, error_message: str) -> ErrorType:
        """Detect error type from message"""
        message_lower = error_message.lower()

        # Permission errors
        if any(term in message_lower for term in ["permission", "denied", "unauthorized", "access denied"]):
            return ErrorType.PERMISSION

        # Network errors
        if any(term in message_lower for term in ["network", "connection", "timeout", "unreachable"]):
            return ErrorType.NETWORK

        # Resource errors
        if any(term in message_lower for term in ["out of memory", "disk space", "resource", "no space left"]):
            return ErrorType.RESOURCE

        # Dependency errors
        if any(term in message_lower for term in ["dependency", "not found", "missing", "import"]):
            return ErrorType.DEPENDENCY

        # Validation errors
        if any(term in message_lower for term in ["invalid", "validation", "malformed", "schema"]):
            return ErrorType.VALIDATION

        # Default to execution error
        return ErrorType.EXECUTION

    def _assess_error_severity(self, error_message: str, error_type: ErrorType) -> ErrorSeverity:
        """Assess error severity"""
        message_lower = error_message.lower()

        # Critical indicators
        if any(term in message_lower for term in ["fatal", "critical", "corruption", "data loss"]):
            return ErrorSeverity.CRITICAL

        # High severity
        if any(term in message_lower for term in ["failed", "error", "exception"]):
            if error_type in [ErrorType.RESOURCE, ErrorType.PERMISSION]:
                return ErrorSeverity.HIGH
            return ErrorSeverity.MEDIUM

        # Medium severity
        if any(term in message_lower for term in ["warning", "deprecated"]):
            return ErrorSeverity.MEDIUM

        # Default to medium
        return ErrorSeverity.MEDIUM

    def _extract_error_context(self, error_message: str) -> Dict[str, Any]:
        """Extract contextual information from error"""
        context = {}

        # Extract file paths
        import re
        file_paths = re.findall(r'[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+', error_message)
        if file_paths:
            context["file_paths"] = file_paths

        # Extract line numbers
        line_numbers = re.findall(r'line \d+', error_message)
        if line_numbers:
            context["line_numbers"] = line_numbers

        # Extract error codes
        error_codes = re.findall(r'\[E\d+\]', error_message)
        if error_codes:
            context["error_codes"] = error_codes

        return context

    def _is_recoverable(self, error_info: ErrorInfo) -> bool:
        """Determine if error is recoverable"""
        # Critical errors often not recoverable
        if error_info.severity == ErrorSeverity.CRITICAL:
            return False

        # Permission errors might be recoverable
        if error_info.error_type == ErrorType.PERMISSION:
            return True

        # Network errors often recoverable
        if error_info.error_type == ErrorType.NETWORK:
            return True

        # Resource errors might be recoverable
        if error_info.error_type == ErrorType.RESOURCE:
            return True

        # Validation errors usually recoverable
        if error_info.error_type == ErrorType.VALIDATION:
            return True

        # Default to recoverable
        return True

    def _suggest_recovery_strategy(
        self,
        error_info: ErrorInfo,
        is_recoverable: bool
    ) -> RecoveryStrategy:
        """Suggest recovery strategy"""
        if not is_recoverable:
            return RecoveryStrategy.ESCALATE

        # Strategy based on error type
        if error_info.error_type == ErrorType.NETWORK:
            return RecoveryStrategy.RETRY

        if error_info.error_type == ErrorType.RESOURCE:
            return RecoveryStrategy.RETRY

        if error_info.error_type == ErrorType.PERMISSION:
            return RecoveryStrategy.ESCALATE

        if error_info.error_type == ErrorType.DEPENDENCY:
            return RecoveryStrategy.ALTERNATIVE

        if error_info.error_type == ErrorType.VALIDATION:
            return RecoveryStrategy.SKIP

        # Default for execution errors
        return RecoveryStrategy.RETRY

    def _calculate_classification_confidence(
        self,
        error_info: ErrorInfo,
        strategy: RecoveryStrategy
    ) -> float:
        """Calculate confidence in classification"""
        base_confidence = 0.7

        # Higher confidence for clear error types
        if error_info.error_type != ErrorType.UNKNOWN:
            base_confidence += 0.1

        # Higher confidence if error has clear indicators
        if error_info.context:
            base_confidence += 0.1

        # Higher confidence for appropriate strategies
        if error_info.error_type == ErrorType.NETWORK and strategy == RecoveryStrategy.RETRY:
            base_confidence += 0.1

        return min(base_confidence, 1.0)

    def _generate_classification_rationale(
        self,
        error_info: ErrorInfo,
        strategy: RecoveryStrategy,
        is_recoverable: bool
    ) -> str:
        """Generate rationale for classification"""
        parts = []

        parts.append(f"Error classified as {error_info.error_type.value}")
        parts.append(f"with {error_info.severity.value} severity")

        if is_recoverable:
            parts.append(f"and is recoverable via {strategy.value}")
        else:
            parts.append("and is not recoverable")

        return ". ".join(parts) + "."

    def _generate_escalation_recommendation(self, classification: ErrorClassification) -> str:
        """Generate recommendation for human escalation"""
        recommendations = {
            ErrorType.PERMISSION: "Review and adjust permissions for the operation",
            ErrorType.RESOURCE: "Check system resources and availability",
            ErrorType.NETWORK: "Verify network connectivity and endpoints",
            ErrorType.DEPENDENCY: "Install or update missing dependencies",
            ErrorType.VALIDATION: "Review input data and validation rules",
            ErrorType.EXECUTION: "Review execution logs and stack trace",
            ErrorType.UNKNOWN: "Review error details and system state"
        }

        return recommendations.get(
            classification.error_type,
            "Review error details and determine appropriate action"
        )

    # Recovery handlers

    def _handle_validation_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle validation errors"""
        return RecoveryAction(
            strategy=RecoveryStrategy.SKIP,
            description="Validation error - skip or fix input data",
            alternative_command="Review and correct input data"
        )

    def _handle_execution_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle execution errors"""
        if retry_count < max_retries:
            return RecoveryAction(
                strategy=RecoveryStrategy.RETRY,
                description="Execution error - retrying",
                retry_delay=2.0 ** retry_count,  # Exponential backoff
                max_attempts=max_retries
            )
        else:
            return RecoveryAction(
                strategy=RecoveryStrategy.ESCALATE,
                description="Max retries reached - escalating",
                escalation_message="Execution failed after multiple attempts"
            )

    def _handle_resource_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle resource errors"""
        return RecoveryAction(
            strategy=RecoveryStrategy.RETRY,
            description="Resource error - wait and retry",
            retry_delay=5.0,
            max_attempts=2
        )

    def _handle_permission_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle permission errors"""
        return RecoveryAction(
            strategy=RecoveryStrategy.ESCALATE,
            description="Permission error - human intervention required",
            escalation_message="Permission denied - please review access rights"
        )

    def _handle_network_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle network errors"""
        if retry_count < max_retries:
            return RecoveryAction(
                strategy=RecoveryStrategy.RETRY,
                description="Network error - retrying with backoff",
                retry_delay=2.0 ** retry_count,
                max_attempts=max_retries
            )
        else:
            return RecoveryAction(
                strategy=RecoveryStrategy.SKIP,
                description="Network error - skipping after max retries"
            )

    def _handle_dependency_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle dependency errors"""
        return RecoveryAction(
            strategy=RecoveryStrategy.ALTERNATIVE,
            description="Dependency error - try alternative approach",
            alternative_command="Install missing dependencies or use alternative"
        )

    def _handle_unknown_error(
        self,
        classification: ErrorClassification,
        retry_count: int,
        max_retries: int
    ) -> RecoveryAction:
        """Handle unknown errors"""
        if retry_count < max_retries:
            return RecoveryAction(
                strategy=RecoveryStrategy.RETRY,
                description="Unknown error - attempting retry",
                retry_delay=1.0,
                max_attempts=max_retries
            )
        else:
            return RecoveryAction(
                strategy=RecoveryStrategy.ESCALATE,
                description="Unknown error - escalating after retries",
                escalation_message=f"Unknown error: {classification.error_info.message}"
            )
