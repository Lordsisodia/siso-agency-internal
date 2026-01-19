"""
Logarithmic Compute Analyzer - Analyze task compute requirements using log₁₀ scales

Compute requirements have 4 sub-dimensions, each contributing to overall magnitude.
Uses logarithmic scoring to handle power-law distribution of compute needs.
"""

from typing import Dict
from .utils import log_score, TokenBudget


class LogComputeAnalyzer:
    """Analyze task compute requirements using logarithmic scales"""

    def analyze(self, task, complexity_score: float) -> Dict:
        """
        Analyze task compute requirements across 4 dimensions.

        Args:
            task: ParsedTask to analyze
            complexity_score: Overall complexity score (0-100) from complexity analyzer

        Returns:
            Dict with:
            - overall_score: 0-100 (log₁₀ scale)
            - overall_magnitude: Compute multiplier
            - token_budget: TokenBudget with tier and estimates
            - sub_scores: Dict of individual dimension scores
            - multipliers: Dict of individual dimension multipliers
        """
        # Score each dimension
        processing = self._score_processing_type(task)
        tokens = self._score_token_budget(task, complexity_score)
        model = self._score_model_requirements(task)
        parallel = self._score_parallelization(task)

        # Calculate multipliers
        processing_mult = self._processing_multiplier(processing['score'])
        tokens_mult = self._token_multiplier(tokens['score'])
        model_mult = self._model_multiplier(model['score'])
        parallel_mult = self._parallelization_multiplier(parallel['score'])

        # Overall magnitude (product of multipliers)
        overall_magnitude = (
            processing_mult *
            tokens_mult *
            model_mult *
            parallel_mult
        )

        # Convert to log score
        overall_score = log_score(overall_magnitude, min_val=1, max_val=10**10)

        # Determine tier and token budget
        tier = self._determine_tier(overall_score)
        token_budget = self._calculate_token_budget(overall_score, complexity_score)

        return {
            'overall_score': overall_score,
            'overall_magnitude': overall_magnitude,
            'tier': tier,
            'token_budget': token_budget,
            'sub_scores': {
                'processing_type': processing,
                'token_budget': tokens,
                'model_requirements': model,
                'parallelization': parallel,
            },
            'multipliers': {
                'processing_type': processing_mult,
                'token_budget': tokens_mult,
                'model_requirements': model_mult,
                'parallelization': parallel_mult,
            }
        }

    def _score_processing_type(self, task) -> Dict:
        """
        Score processing type complexity.

        Indicators:
        - Simple CRUD (1x)
        - Business logic (10x)
        - Analysis/processing (100x)
        - Complex reasoning (1000x)
        - Creative synthesis (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        processing_keywords = [
            # Simple CRUD
            ("crud", 15),
            ("create", 15),
            ("update", 15),
            ("delete", 15),
            ("simple", 15),
            ("basic", 15),
            # Business logic
            ("business logic", 35),
            ("validation", 35),
            ("workflow", 40),
            ("process", 35),
            ("transform", 35),
            # Analysis/processing
            ("analyze", 55),
            ("analysis", 55),
            ("extract", 50),
            ("parse", 50),
            ("process", 50),
            ("calculate", 50),
            # Complex reasoning
            ("reasoning", 75),
            ("problem solving", 75),
            ("debug", 70),
            ("investigate", 70),
            ("troubleshoot", 70),
            ("optimize", 65),
            # Creative synthesis
            ("design", 85),
            ("architecture", 85),
            ("creative", 85),
            ("innovative", 85),
            ("synthesize", 90),
            ("brainstorm", 90),
            ("strategic", 85),
        ]

        for keyword, points in processing_keywords:
            if keyword in text:
                score = max(score, points)

        # Check task type from metadata
        if 'task_type' in task.metadata:
            task_type = task.metadata['task_type'].lower()
            if task_type in ['research', 'planning', 'brainstorming']:
                score = max(score, 80)
            elif task_type in ['ui', 'refactor', 'implementation']:
                score = max(score, 50)

        # Default to business logic if no indicators
        if score == 0:
            score = 35

        return {
            'score': min(score, 100),
            'indicators': 'processing_keywords_and_task_type'
        }

    def _score_token_budget(self, task, complexity_score: float) -> Dict:
        """
        Score token budget requirements.

        Indicators:
        - Minimal (1K-10K tokens) (1x)
        - Low (10K-50K tokens) (10x)
        - Medium (50K-200K tokens) (100x)
        - High (200K-1M tokens) (1000x)
        - Massive (1M+ tokens) (10000x)
        """
        # Base score on complexity
        base_score = complexity_score * 0.6  # 60% weight from complexity

        text = f"{task.title} {task.description} {task.content}".lower()

        # Keywords indicating token intensity
        token_keywords = [
            # Minimal
            ("quick fix", 10),
            ("small change", 10),
            ("tweak", 10),
            # Low
            ("feature", 30),
            ("implement", 30),
            ("add", 25),
            # Medium
            ("refactor", 50),
            ("module", 50),
            ("component", 45),
            # High
            ("system", 70),
            ("architecture", 75),
            ("domain", 65),
            # Massive
            ("full-stack", 90),
            ("end-to-end", 90),
            ("complete rewrite", 95),
        ]

        keyword_bonus = 0
        for keyword, points in token_keywords:
            if keyword in text:
                keyword_bonus = max(keyword_bonus, points)

        # Combine base score with keyword bonus
        score = min(base_score + keyword_bonus * 0.4, 100)

        return {
            'score': score,
            'indicators': 'complexity_and_keywords'
        }

    def _score_model_requirements(self, task) -> Dict:
        """
        Score model requirements.

        Indicators:
        - Basic model sufficient (1x)
        - Standard model (10x)
        - Advanced model (100x)
        - Specialized model (1000x)
        - Multi-model ensemble (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        model_keywords = [
            # Basic model sufficient
            ("simple", 15),
            ("basic", 15),
            ("straightforward", 15),
            # Standard model
            ("standard", 35),
            ("typical", 35),
            ("regular", 30),
            # Advanced model
            ("complex", 60),
            ("advanced", 65),
            ("sophisticated", 65),
            # Specialized model
            ("specialized", 80),
            ("domain expert", 85),
            ("technical", 75),
            ("architecture", 80),
            # Multi-model ensemble
            ("multi-step", 90),
            ("collaborative", 90),
            ("team", 85),
            ("ensemble", 95),
        ]

        for keyword, points in model_keywords:
            if keyword in text:
                score = max(score, points)

        # Check tech stack for specialized requirements
        specialized_tech = [
            "kubernetes", "tensorflow", "pytorch", "blockchain",
            "cryptography", "security"
        ]
        if any(tech in str(task.tech_stack).lower() for tech in specialized_tech):
            score = max(score, 75)

        # Default to standard model if no indicators
        if score == 0:
            score = 35

        return {
            'score': min(score, 100),
            'indicators': 'model_keywords_and_tech_stack'
        }

    def _score_parallelization(self, task) -> Dict:
        """
        Score parallelization potential.

        Indicators:
        - Single-threaded (1x)
        - Low parallelization (10x)
        - Medium parallelization (100x)
        - High parallelization (1000x)
        - Massively parallel (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        parallel_keywords = [
            # Single-threaded
            ("sequential", 15),
            ("linear", 15),
            ("single", 15),
            # Low parallelization
            ("independent", 35),
            ("separate", 30),
            ("individual", 30),
            # Medium parallelization
            ("modular", 55),
            ("component", 50),
            ("parallel", 60),
            ("concurrent", 60),
            # High parallelization
            ("distributed", 80),
            ("microservices", 80),
            ("multi-thread", 75),
            ("async", 70),
            # Massively parallel
            ("map reduce", 95),
            ("batch", 90),
            ("multi-process", 90),
            ("scalable", 85),
        ]

        for keyword, points in parallel_keywords:
            if keyword in text:
                score = max(score, points)

        # Check if multiple domains (implies parallelization potential)
        domains = ["frontend", "backend", "database", "infrastructure"]
        domain_count = sum(1 for d in domains if d in text or d in str(task.domain).lower())
        if domain_count > 1:
            score = max(score, 60 + domain_count * 5)

        # Default to low parallelization if no indicators
        if score == 0:
            score = 30

        return {
            'score': min(score, 100),
            'indicators': 'parallel_keywords_and_domains'
        }

    # Multiplier calculators

    def _processing_multiplier(self, score: float) -> float:
        """Convert processing type score to magnitude multiplier"""
        if score < 25:
            return 1
        elif score < 45:
            return 10
        elif score < 65:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _token_multiplier(self, score: float) -> float:
        """Convert token budget score to magnitude multiplier"""
        if score < 20:
            return 1
        elif score < 40:
            return 10
        elif score < 60:
            return 100
        elif score < 80:
            return 1000
        else:
            return 10000

    def _model_multiplier(self, score: float) -> float:
        """Convert model requirements score to magnitude multiplier"""
        if score < 25:
            return 1
        elif score < 45:
            return 10
        elif score < 65:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _parallelization_multiplier(self, score: float) -> float:
        """Convert parallelization score to magnitude multiplier"""
        if score < 25:
            return 1
        elif score < 45:
            return 10
        elif score < 65:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _determine_tier(self, score: float) -> str:
        """Determine compute tier from log score"""
        if score < 20:
            return "minimal"
        elif score < 40:
            return "low"
        elif score < 60:
            return "medium"
        elif score < 80:
            return "high"
        elif score < 90:
            return "xhigh"
        else:
            return "massive"

    def _calculate_token_budget(self, compute_score: float, complexity_score: float) -> TokenBudget:
        """
        Calculate token budget based on compute and complexity scores.

        Token ranges:
        - minimal: 1K-10K
        - low: 10K-50K
        - medium: 50K-200K
        - high: 200K-1M
        - xhigh: 1M-5M
        - massive: 5M+
        """
        # Combine scores (70% compute, 30% complexity)
        combined_score = compute_score * 0.7 + complexity_score * 0.3

        if combined_score < 20:
            return TokenBudget(
                tier="minimal",
                min=1000,
                max=10000,
                estimated=5000
            )
        elif combined_score < 40:
            return TokenBudget(
                tier="low",
                min=10000,
                max=50000,
                estimated=25000
            )
        elif combined_score < 60:
            return TokenBudget(
                tier="medium",
                min=50000,
                max=200000,
                estimated=100000
            )
        elif combined_score < 80:
            return TokenBudget(
                tier="high",
                min=200000,
                max=1000000,
                estimated=500000
            )
        elif combined_score < 90:
            return TokenBudget(
                tier="xhigh",
                min=1000000,
                max=5000000,
                estimated=2500000
            )
        else:
            return TokenBudget(
                tier="massive",
                min=5000000,
                max=10000000,
                estimated=7500000
            )
