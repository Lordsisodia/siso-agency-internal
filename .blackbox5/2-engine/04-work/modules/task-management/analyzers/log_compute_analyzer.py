"""
Logarithmic Compute Analyzer - Analyzes computational requirements with log₁₀ scoring

Scores 4 dimensions:
- Complexity (40%): From complexity analyzer
- Type (25%): Task type requires different compute
- Uncertainty (20%): Unknowns require more iterations
- Parallelization (15%): Can work be parallelized?
"""

import re
from typing import Dict
from .utils import log_score, TaskType


class LogComputeAnalyzer:
    """Analyze task compute requirements using logarithmic scoring"""

    def __init__(self, complexity_analyzer=None, type_detector=None):
        """
        Initialize analyzer.

        Args:
            complexity_analyzer: LogComplexityAnalyzer instance
            type_detector: TaskTypeDetector instance
        """
        self.complexity_analyzer = complexity_analyzer
        self.type_detector = type_detector

    def analyze(self, task, complexity_result=None, type_result=None) -> Dict:
        """
        Analyze task compute requirements.

        Args:
            task: Task to analyze
            complexity_result: Pre-computed complexity result (optional)
            type_result: Pre-computed type result (optional)

        Returns:
            Dict with:
                - magnitude: Total compute magnitude
                - score: Overall compute score (0-100)
                - token_estimate: Estimated tokens needed
                - recommended_model: Model to use (opus/sonnet/haiku)
                - parallelization_factor: Can work be parallelized? (0.1-1.0)
                - complexity_factor: From complexity analysis (1-10^15)
                - type_factor: Task type multiplier (1-10x)
                - uncertainty_factor: Uncertainty multiplier (1-100x)
        """
        # Get or calculate complexity factor
        if complexity_result:
            complexity_factor = complexity_result['magnitude']
        elif self.complexity_analyzer:
            complexity_result = self.complexity_analyzer.analyze(task)
            complexity_factor = complexity_result['magnitude']
        else:
            complexity_factor = 100

        # Get or calculate type factor
        if type_result:
            type_factor = self._calculate_type_factor_from_result(type_result)
        elif self.type_detector:
            type_result = self.type_detector.detect(task)
            type_factor = self._calculate_type_factor_from_result(type_result)
        else:
            type_factor = self._calculate_type_factor(task)

        # Calculate other factors
        uncertainty_factor = self._calculate_uncertainty_factor(task)
        parallelization_factor = self._calculate_parallelization_factor(task)

        # Total magnitude (multiplicative)
        magnitude = (
            complexity_factor *
            type_factor *
            uncertainty_factor
        ) / parallelization_factor

        # Convert to score (0-100)
        # Max reasonable magnitude: 10^15 * 10 * 100 / 0.1 = 10^19
        score = log_score(magnitude, min_val=1, max_val=10**19)

        # Estimate tokens
        token_estimate = self._estimate_tokens(task, magnitude, type_result)

        # Recommend model
        recommended_model = self._recommend_model(score, token_estimate)

        return {
            "magnitude": magnitude,
            "score": score,
            "token_estimate": token_estimate,
            "recommended_model": recommended_model,
            "parallelization_factor": parallelization_factor,
            "complexity_factor": complexity_factor,
            "type_factor": type_factor,
            "uncertainty_factor": uncertainty_factor,
        }

    def _calculate_type_factor(self, task) -> float:
        """Calculate task type multiplier (1-10x)"""
        text = f"{task.title} {task.description} {task.content}".lower()

        # Type-based compute multipliers
        type_multipliers = {
            # High compute types (8-10x)
            "research": 10,
            "investigation": 9,
            "explore": 8,
            "brainstorm": 9,
            "ideate": 8,

            # Medium-high compute (5-7x)
            "architecture": 7,
            "design": 6,
            "planning": 6,
            "strategy": 7,

            # Medium compute (3-4x)
            "refactor": 4,
            "implement": 3,
            "build": 3,
            "develop": 3,

            # Lower compute (1-2x)
            "fix": 2,
            "bug": 2,
            "test": 2,
            "document": 1,
            "documentation": 1,
        }

        max_multiplier = 1.0
        for keyword, multiplier in type_multipliers.items():
            if keyword in text:
                max_multiplier = max(max_multiplier, multiplier)

        return max_multiplier

    def _calculate_type_factor_from_result(self, type_result) -> float:
        """Calculate type factor from detection result"""
        type_multipliers = {
            TaskType.RESEARCH: 10,
            TaskType.BRAINSTORMING: 9,
            TaskType.PLANNING: 6,
            TaskType.REFACTOR: 4,
            TaskType.IMPLEMENTATION: 3,
            TaskType.UI: 3,
            TaskType.TESTING: 2,
            TaskType.INFRASTRUCTURE: 3,
            TaskType.DATA: 4,
            TaskType.DOCUMENTATION: 1,
        }

        detected_type = type_result.type
        return type_multipliers.get(detected_type, 3)

    def _calculate_uncertainty_factor(self, task) -> float:
        """Calculate uncertainty multiplier (1-100x)"""
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Uncertainty indicators (require more iterations)
        uncertainty_keywords = {
            # High uncertainty (50-100x)
            "unknown": 80,
            "uncertain": 70,
            "figure out": 60,
            "research": 60,
            "investigate": 55,
            "explore": 50,
            "prototype": 60,
            "proof of concept": 70,

            # Medium uncertainty (20-40x)
            "evaluate": 30,
            "analyze": 25,
            "study": 30,
            "experiment": 35,

            # Lower uncertainty (5-15x)
            "implement": 10,
            "build": 8,
            "create": 8,
            "add": 5,
        }

        for keyword, uncertain_mult in uncertainty_keywords.items():
            if keyword in text:
                multiplier *= uncertain_mult

        return min(multiplier, 100)

    def _calculate_parallelization_factor(self, task) -> float:
        """
        Calculate parallelization factor (0.1-1.0)

        Lower = more parallelizable = less compute per path
        Higher = must be sequential = more compute
        """
        text = f"{task.title} {task.description} {task.content}".lower()

        # Sequential indicators (must be done in order)
        sequential_keywords = {
            "then": 0.3,
            "after": 0.4,
            "before": 0.5,
            "depends on": 0.3,
            "sequential": 0.2,
            "step by step": 0.4,
            "order": 0.5,
            "first": 0.6,
            "then": 0.3,
            "finally": 0.4,
        }

        factor = 1.0  # Default: fully parallelizable

        for keyword, reduction in sequential_keywords.items():
            if keyword in text:
                factor = min(factor, reduction)

        # Check dependency structure
        if hasattr(task, 'depends_on') and task.depends_on:
            factor = min(factor, 0.5)

        if hasattr(task, 'blocked_by') and task.blocked_by:
            factor = min(factor, 0.6)

        # Ensure minimum factor
        return max(factor, 0.1)

    def _estimate_tokens(self, task, magnitude: float, type_result=None) -> int:
        """
        Estimate token budget for task.

        Based on:
        - Magnitude of work
        - Task type
        - Content length
        """
        # Base token estimate from magnitude
        # Log scale: each 100x magnitude = 10x tokens
        import math

        if magnitude <= 1:
            base_tokens = 1000
        else:
            log_mag = math.log10(magnitude)
            base_tokens = int(1000 * (10 ** (log_mag / 2)))  # Sqrt of magnitude for tokens

        # Adjust by task type
        if type_result:
            type_adjustments = {
                TaskType.RESEARCH: 2.0,
                TaskType.BRAINSTORMING: 1.8,
                TaskType.PLANNING: 1.5,
                TaskType.REFACTOR: 1.2,
                TaskType.IMPLEMENTATION: 1.3,
                TaskType.UI: 1.2,
                TaskType.TESTING: 0.8,
                TaskType.DOCUMENTATION: 0.6,
                TaskType.INFRASTRUCTURE: 1.1,
                TaskType.DATA: 1.4,
            }
            adjustment = type_adjustments.get(type_result.type, 1.0)
            base_tokens = int(base_tokens * adjustment)

        # Content length adjustment
        content_length = len(task.content) if hasattr(task, 'content') else 0
        if content_length > 0:
            # More content = more tokens needed for analysis
            length_multiplier = 1 + (content_length / 10000)  # Up to 2x for very long content
            base_tokens = int(base_tokens * length_multiplier)

        # Cap at reasonable limits
        return min(max(base_tokens, 1000), 1000000)

    def _recommend_model(self, score: float, token_estimate: int) -> str:
        """
        Recommend model based on compute requirements.

        Args:
            score: Compute score (0-100)
            token_estimate: Estimated tokens needed

        Returns:
            Model recommendation: "opus", "sonnet", or "haiku"
        """
        # Model selection based on compute score and token estimate
        # Higher score/complexity = better model

        if score >= 70 or token_estimate > 100000:
            return "opus"  # Most capable for complex work
        elif score >= 40 or token_estimate > 30000:
            return "sonnet"  # Balanced for medium complexity
        else:
            return "haiku"  # Fast for simple tasks
