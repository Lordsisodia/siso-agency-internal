"""
Logarithmic Complexity Analyzer - Analyze task complexity using log₁₀ scales

Complexity has 6 sub-dimensions, each contributing to overall magnitude.
Uses logarithmic scoring to handle power-law distribution of tasks.
"""

from typing import Dict
from .utils import log_score


class LogComplexityAnalyzer:
    """Analyze task complexity using logarithmic scales"""

    def analyze(self, task) -> Dict:
        """
        Analyze task complexity across 6 dimensions.

        Returns:
            Dict with:
            - overall_score: 0-100 (log₁₀ scale)
            - overall_magnitude: Complexity multiplier
            - tier: "tiny", "small", "medium", "large", "xlarge", "massive"
            - sub_scores: Dict of individual dimension scores
            - multipliers: Dict of individual dimension multipliers
        """
        # Score each dimension
        scope = self._score_scope(task)
        technical = self._score_technical(task)
        dependencies = self._score_dependencies(task)
        risk = self._score_risk(task)
        uncertainty = self._score_uncertainty(task)
        cross_domain = self._score_cross_domain(task)

        # Calculate multipliers for each dimension
        scope_mult = self._scope_multiplier(scope['score'])
        tech_mult = self._technical_multiplier(technical['score'])
        dep_mult = self._dependency_multiplier(dependencies['score'])
        risk_mult = self._risk_multiplier(risk['score'])
        unc_mult = self._uncertainty_multiplier(uncertainty['score'])
        cross_mult = self._cross_domain_multiplier(cross_domain['score'])

        # Calculate overall magnitude (product of multipliers)
        overall_magnitude = (
            scope_mult *
            tech_mult *
            dep_mult *
            risk_mult *
            unc_mult *
            cross_mult
        )

        # Convert magnitude to log score
        overall_score = log_score(overall_magnitude, min_val=1, max_val=10**10)

        # Determine tier
        tier = self._determine_tier(overall_score)

        return {
            'overall_score': overall_score,
            'overall_magnitude': overall_magnitude,
            'tier': tier,
            'sub_scores': {
                'scope': scope,
                'technical': technical,
                'dependencies': dependencies,
                'risk': risk,
                'uncertainty': uncertainty,
                'cross_domain': cross_domain,
            },
            'multipliers': {
                'scope': scope_mult,
                'technical': tech_mult,
                'dependencies': dep_mult,
                'risk': risk_mult,
                'uncertainty': unc_mult,
                'cross_domain': cross_mult,
            }
        }

    def _score_scope(self, task) -> Dict:
        """
        Score scope complexity (lines of code, files affected).

        Indicators:
        - Single file (1x)
        - Multiple files (10x)
        - Module/domain (100x)
        - Cross-domain (1000x)
        - System-wide (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Keywords indicating scope
        scope_indicators = [
            ("single file", 10),
            ("one file", 10),
            ("simple", 10),
            ("multiple files", 30),
            ("several files", 30),
            ("module", 45),
            ("component", 40),
            ("domain", 55),
            ("cross-domain", 70),
            ("cross domain", 70),
            ("multiple domains", 75),
            ("system-wide", 90),
            ("system wide", 90),
            ("entire system", 95),
            ("architecture", 65),
            ("refactor", 50),
            ("rewrite", 85),
        ]

        for keyword, points in scope_indicators:
            if keyword in text:
                score = max(score, points)

        # Check tech stack breadth
        if task.tech_stack:
            if len(task.tech_stack) == 1:
                score = max(score, 20)
            elif len(task.tech_stack) <= 3:
                score = max(score, 40)
            elif len(task.tech_stack) <= 5:
                score = max(score, 60)
            else:
                score = max(score, 80)

        # Check domain
        if task.domain:
            domains = ["frontend", "backend", "database", "infrastructure", "devops"]
            if any(d in text for d in domains):
                score = max(score, 50)

        return {
            'score': min(score, 100),
            'indicators': 'scope_keywords'
        }

    def _score_technical(self, task) -> Dict:
        """
        Score technical complexity (algorithms, data structures, patterns).

        Indicators:
        - Simple CRUD (1x)
        - Business logic (10x)
        - Algorithms/data structures (100x)
        - System design (1000x)
        - Distributed systems (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        tech_keywords = [
            # Simple
            ("crud", 15),
            ("simple", 10),
            ("basic", 10),
            ("create", 15),
            ("update", 15),
            # Business logic
            ("business logic", 35),
            ("validation", 30),
            ("workflow", 35),
            ("process", 30),
            # Algorithms
            ("algorithm", 60),
            ("optimization", 55),
            ("performance", 50),
            ("data structure", 65),
            # System design
            ("architecture", 70),
            ("design pattern", 60),
            ("scalability", 65),
            ("design system", 55),
            # Distributed
            ("distributed", 90),
            ("microservices", 85),
            ("async", 70),
            ("concurrent", 75),
            ("parallel", 70),
            ("caching", 60),
            ("message queue", 75),
            ("event-driven", 70),
        ]

        for keyword, points in tech_keywords:
            if keyword in text:
                score = max(score, points)

        # Check tech stack for complexity
        complex_tech = [
            "kubernetes", "redis", "kafka", "graphql",
            "websocket", "tensorflow", "pytorch"
        ]
        if any(tech in str(task.tech_stack).lower() for tech in complex_tech):
            score = max(score, 70)

        return {
            'score': min(score, 100),
            'indicators': 'technical_keywords'
        }

    def _score_dependencies(self, task) -> Dict:
        """
        Score dependency complexity.

        Indicators:
        - No dependencies (1x)
        - 1-3 dependencies (10x)
        - 4-10 dependencies (100x)
        - 10+ dependencies (1000x)
        - External services (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Check explicit dependency fields
        if task.depends_on:
            if len(task.depends_on) == 0:
                score = 10
            elif len(task.depends_on) <= 3:
                score = 30
            elif len(task.depends_on) <= 10:
                score = 60
            else:
                score = 85
        else:
            score = 20  # Assume low if not specified

        # Keywords indicating external dependencies
        dep_keywords = [
            ("api integration", 70),
            ("third-party", 75),
            ("external service", 80),
            ("webhook", 65),
            ("sdk", 60),
            ("library", 50),
            ("package", 40),
            ("depends on", 50),
            ("requires", 45),
            ("prerequisite", 55),
        ]

        for keyword, points in dep_keywords:
            if keyword in text:
                score = max(score, points)

        return {
            'score': min(score, 100),
            'indicators': 'dependency_count_and_keywords'
        }

    def _score_risk(self, task) -> Dict:
        """
        Score risk complexity.

        Indicators:
        - Low risk (1x)
        - Medium risk (10x)
        - High risk (100x)
        - Critical risk (1000x)
        - Safety/security (10000x)
        """
        # Start with explicit risk_level
        risk_mapping = {
            'low': 20,
            'medium': 50,
            'high': 75,
            'critical': 90
        }
        score = risk_mapping.get(task.risk_level.lower(), 50)

        text = f"{task.title} {task.description} {task.content}".lower()

        # Risk keywords
        risk_keywords = [
            ("security", 85),
            ("authentication", 75),
            ("authorization", 75),
            ("encryption", 80),
            ("payment", 90),
            ("financial", 85),
            ("personal data", 80),
            ("pii", 85),
            ("gdpr", 85),
            ("production", 70),
            ("data loss", 90),
            ("downtime", 75),
            ("critical", 85),
            ("urgent", 65),
            ("safety", 95),
            ("compliance", 80),
        ]

        for keyword, points in risk_keywords:
            if keyword in text:
                score = max(score, points)

        return {
            'score': min(score, 100),
            'indicators': 'risk_level_and_keywords'
        }

    def _score_uncertainty(self, task) -> Dict:
        """
        Score uncertainty (unknowns, research needed).

        Indicators:
        - Well-defined (1x)
        - Some unknowns (10x)
        - Many unknowns (100x)
        - Research needed (1000x)
        - Experimental (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        uncertainty_keywords = [
            ("unknown", 50),
            ("uncertain", 55),
            ("figure out", 60),
            ("investigate", 65),
            ("research", 70),
            ("explore", 60),
            ("prototype", 65),
            ("proof of concept", 70),
            ("poc", 65),
            ("experimental", 85),
            ("trial", 60),
            ("test approach", 55),
            ("may need", 45),
            ("might need", 45),
            ("unclear", 60),
            ("tbd", 50),
            ("to be determined", 55),
        ]

        for keyword, points in uncertainty_keywords:
            if keyword in text:
                score = max(score, points)

        # Check confidence
        if task.confidence < 0.3:
            score = max(score, 80)
        elif task.confidence < 0.5:
            score = max(score, 60)
        elif task.confidence < 0.7:
            score = max(score, 40)

        # If no uncertainty indicators, assume well-defined
        if score == 0:
            score = 20

        return {
            'score': min(score, 100),
            'indicators': 'uncertainty_keywords_and_confidence'
        }

    def _score_cross_domain(self, task) -> Dict:
        """
        Score cross-domain complexity.

        Indicators:
        - Single domain (1x)
        - 2 domains (10x)
        - 3-4 domains (100x)
        - 5+ domains (1000x)
        - Full-stack (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()
        tech_text = str(task.tech_stack).lower()
        domain_text = task.domain.lower()

        # Count domains mentioned
        domains = [
            "frontend", "backend", "database", "api",
            "infrastructure", "devops", "mobile",
            "ui", "ux", "design"
        ]

        domain_count = sum(1 for d in domains if d in text or d in tech_text or d in domain_text)

        if domain_count == 0:
            score = 20
        elif domain_count == 1:
            score = 30
        elif domain_count == 2:
            score = 50
        elif domain_count <= 4:
            score = 70
        else:
            score = 90

        # Full-stack indicators
        fullstack_keywords = [
            ("full-stack", 95),
            ("full stack", 95),
            ("end-to-end", 90),
            ("end to end", 90),
        ]

        for keyword, points in fullstack_keywords:
            if keyword in text:
                score = max(score, points)

        return {
            'score': min(score, 100),
            'indicators': 'domain_count_and_keywords'
        }

    # Multiplier calculators

    def _scope_multiplier(self, score: float) -> float:
        """Convert scope score to magnitude multiplier (1-10000x)"""
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

    def _technical_multiplier(self, score: float) -> float:
        """Convert technical score to magnitude multiplier (1-10000x)"""
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

    def _dependency_multiplier(self, score: float) -> float:
        """Convert dependency score to magnitude multiplier (1-10000x)"""
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

    def _risk_multiplier(self, score: float) -> float:
        """Convert risk score to magnitude multiplier (1-10000x)"""
        if score < 30:
            return 1
        elif score < 50:
            return 10
        elif score < 70:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _uncertainty_multiplier(self, score: float) -> float:
        """Convert uncertainty score to magnitude multiplier (1-10000x)"""
        if score < 30:
            return 1
        elif score < 50:
            return 10
        elif score < 70:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _cross_domain_multiplier(self, score: float) -> float:
        """Convert cross-domain score to magnitude multiplier (1-10000x)"""
        if score < 30:
            return 1
        elif score < 50:
            return 10
        elif score < 70:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _determine_tier(self, score: float) -> str:
        """Determine complexity tier from log score"""
        if score < 20:
            return "tiny"
        elif score < 40:
            return "small"
        elif score < 60:
            return "medium"
        elif score < 80:
            return "large"
        elif score < 90:
            return "xlarge"
        else:
            return "massive"
