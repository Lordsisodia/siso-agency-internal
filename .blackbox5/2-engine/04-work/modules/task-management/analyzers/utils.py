"""
Utility functions for logarithmic scoring.

Provides log₁₀-based scoring for natural task distribution.
"""

import math
from typing import Tuple
from dataclasses import dataclass


def log_score(value: float, min_val: float = 1, max_val: float = 10**10) -> float:
    """
    Convert linear value to log₁₀ score (0-100).

    Formula:
        score = 100 * (log₁₀(value) - log₁₀(min_val)) / (log₁₀(max_val) - log₁₀(min_val))

    This maps:
    - min_val → 0
    - max_val → 100
    - Each 100x increase → +20 points (when using decade ranges)

    Args:
        value: Linear value to convert
        min_val: Minimum value (maps to 0)
        max_val: Maximum value (maps to 100)

    Returns:
        Logarithmic score (0-100)
    """
    if value <= min_val:
        return 0.0

    if value >= max_val:
        return 100.0

    log_value = math.log10(value)
    log_min = math.log10(min_val)
    log_max = math.log10(max_val)

    score = 100 * (log_value - log_min) / (log_max - log_min)

    return score


def log_to_value(score: float, min_val: float = 1, max_val: float = 10**10) -> float:
    """
    Convert log₁₀ score back to linear value.

    Args:
        score: Logarithmic score (0-100)
        min_val: Minimum value
        max_val: Maximum value

    Returns:
        Linear value
    """
    if score <= 0:
        return min_val

    if score >= 100:
        return max_val

    log_min = math.log10(min_val)
    log_max = math.log10(max_val)

    log_value = log_min + (score / 100) * (log_max - log_min)

    return 10 ** log_value


@dataclass
class TokenBudget:
    """Token budget estimate"""
    tier: str  # "small", "medium", "large", "xlarge"
    min: int
    max: int
    estimated: int


@dataclass
class ExecutionPlan:
    """Execution plan"""
    strategy: str  # "direct", "sequential", "parallel", "phased"
    steps: list[str]
    estimated_duration_minutes: int


@dataclass
class TaskTypeResult:
    """Task type detection result"""
    type: str  # Task type enum value
    confidence: float  # 0-1
    all_scores: dict  # All type scores


class TaskType:
    """Task types with different execution strategies"""
    UI = "ui"
    REFACTOR = "refactor"
    RESEARCH = "research"
    PLANNING = "planning"
    BRAINSTORMING = "brainstorming"
    IMPLEMENTATION = "implementation"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    INFRASTRUCTURE = "infrastructure"
    DATA = "data"
