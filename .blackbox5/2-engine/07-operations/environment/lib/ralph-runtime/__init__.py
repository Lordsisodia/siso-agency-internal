#!/usr/bin/env python3
"""
Ralph Runtime - Autonomous Execution Engine for Blackbox4

This module provides autonomous agent execution capabilities with self-correction,
progress monitoring, error recovery, and intelligent decision-making.

Integration with Blackbox4:
- Phase 1: Context Variables for runtime state
- Phase 2: Hierarchical Tasks execution
- Phase 3: Spec-driven autonomous decisions
- Phase 4: Autonomous runtime capabilities
"""

from .ralph_runtime import RalphRuntime, RuntimeState
from .autonomous_agent import AutonomousAgent, AgentConfidence
from .decision_engine import DecisionEngine, DecisionContext, DecisionResult
from .progress_tracker import ProgressTracker, SessionProgress, ProgressMilestone
from .error_recovery import ErrorRecovery, ErrorClassification, RecoveryStrategy

__version__ = "1.0.0"
__author__ = "Blackbox4 Team"

# Configuration constants
DEFAULT_MAX_RETRIES = 3
DEFAULT_CONFIDENCE_THRESHOLD = 0.7
DEFAULT_TIMEOUT_SECONDS = 300
DEFAULT_SESSION_TIMEOUT = 3600

# Human intervention modes
HUMAN_INTERVENTION_NEVER = "never"
HUMAN_INTERVENTION_ASK_FIRST = "ask_first"
HUMAN_INTERVENTION_ON_ERROR = "on_error"
HUMAN_INTERVENTION_ON_LOW_CONFIDENCE = "on_low_confidence"

# Runtime states
STATE_IDLE = "idle"
STATE_RUNNING = "running"
STATE_PAUSED = "paused"
STATE_COMPLETED = "completed"
STATE_ERROR = "error"

# Error types
ERROR_TYPE_VALIDATION = "validation"
ERROR_TYPE_EXECUTION = "execution"
ERROR_TYPE_RESOURCE = "resource"
ERROR_TYPE_PERMISSION = "permission"
ERROR_TYPE_NETWORK = "network"
ERROR_TYPE_UNKNOWN = "unknown"

# Recovery strategies
RECOVERY_RETRY = "retry"
RECOVERY_ALTERNATIVE = "alternative"
RECOVERY_SKIP = "skip"
RECOVERY_ESCALATE = "escalate"
RECOVERY_ABORT = "abort"

__all__ = [
    # Main classes
    "RalphRuntime",
    "RuntimeState",
    "AutonomousAgent",
    "AgentConfidence",
    "DecisionEngine",
    "DecisionContext",
    "DecisionResult",
    "ProgressTracker",
    "SessionProgress",
    "ProgressMilestone",
    "ErrorRecovery",
    "ErrorClassification",
    "RecoveryStrategy",
    # Constants
    "__version__",
    "DEFAULT_MAX_RETRIES",
    "DEFAULT_CONFIDENCE_THRESHOLD",
    "DEFAULT_TIMEOUT_SECONDS",
    "DEFAULT_SESSION_TIMEOUT",
    "HUMAN_INTERVENTION_NEVER",
    "HUMAN_INTERVENTION_ASK_FIRST",
    "HUMAN_INTERVENTION_ON_ERROR",
    "HUMAN_INTERVENTION_ON_LOW_CONFIDENCE",
    "STATE_IDLE",
    "STATE_RUNNING",
    "STATE_PAUSED",
    "STATE_COMPLETED",
    "STATE_ERROR",
    "ERROR_TYPE_VALIDATION",
    "ERROR_TYPE_EXECUTION",
    "ERROR_TYPE_RESOURCE",
    "ERROR_TYPE_PERMISSION",
    "ERROR_TYPE_NETWORK",
    "ERROR_TYPE_UNKNOWN",
    "RECOVERY_RETRY",
    "RECOVERY_ALTERNATIVE",
    "RECOVERY_SKIP",
    "RECOVERY_ESCALATE",
    "RECOVERY_ABORT",
]
