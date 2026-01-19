"""
Logarithmic Value Analyzer - Analyze task value using log₁₀ scales

Value has 5 sub-dimensions, each contributing to overall magnitude.
Uses logarithmic scoring to handle power-law distribution of value.
"""

from typing import Dict
from .utils import log_score


class LogValueAnalyzer:
    """Analyze task value using logarithmic scales"""

    def analyze(self, task) -> Dict:
        """
        Analyze task value across 5 dimensions.

        Returns:
            Dict with:
            - overall_score: 0-100 (log₁₀ scale)
            - overall_magnitude: Value multiplier
            - tier: "minimal", "low", "moderate", "high", "critical", "transformative"
            - sub_scores: Dict of individual dimension scores
            - multipliers: Dict of individual dimension multipliers
        """
        # Score each dimension
        business = self._score_business_impact(task)
        user = self._score_user_value(task)
        strategic = self._score_strategic_alignment(task)
        revenue = self._score_revenue_impact(task)
        competitive = self._score_competitive_advantage(task)

        # Calculate multipliers
        business_mult = self._business_multiplier(business['score'])
        user_mult = self._user_multiplier(user['score'])
        strategic_mult = self._strategic_multiplier(strategic['score'])
        revenue_mult = self._revenue_multiplier(revenue['score'])
        competitive_mult = self._competitive_multiplier(competitive['score'])

        # Overall magnitude (product of multipliers)
        overall_magnitude = (
            business_mult *
            user_mult *
            strategic_mult *
            revenue_mult *
            competitive_mult
        )

        # Convert to log score
        overall_score = log_score(overall_magnitude, min_val=1, max_val=10**10)

        # Determine tier
        tier = self._determine_tier(overall_score)

        return {
            'overall_score': overall_score,
            'overall_magnitude': overall_magnitude,
            'tier': tier,
            'sub_scores': {
                'business_impact': business,
                'user_value': user,
                'strategic_alignment': strategic,
                'revenue_impact': revenue,
                'competitive_advantage': competitive,
            },
            'multipliers': {
                'business_impact': business_mult,
                'user_value': user_mult,
                'strategic_alignment': strategic_mult,
                'revenue_impact': revenue_mult,
                'competitive_advantage': competitive_mult,
            }
        }

    def _score_business_impact(self, task) -> Dict:
        """
        Score business impact.

        Indicators:
        - Minimal impact (1x)
        - Local improvement (10x)
        - Department impact (100x)
        - Company-wide impact (1000x)
        - Industry disruption (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        impact_keywords = [
            # Minimal
            ("nice to have", 15),
            ("polish", 20),
            ("minor", 15),
            ("tweak", 15),
            # Local improvement
            ("improve", 30),
            ("enhancement", 35),
            ("optimization", 35),
            ("better", 30),
            # Department impact
            ("team", 45),
            ("department", 50),
            ("workflow", 50),
            ("process", 45),
            ("productivity", 55),
            ("efficiency", 55),
            # Company-wide
            ("company", 70),
            ("organization", 70),
            ("business", 65),
            ("critical", 75),
            ("important", 60),
            ("strategic", 75),
            # Industry disruption
            ("disrupt", 95),
            ("revolutionary", 95),
            ("game-changer", 90),
            ("paradigm shift", 95),
            ("industry first", 90),
            ("market leader", 85),
        ]

        for keyword, points in impact_keywords:
            if keyword in text:
                score = max(score, points)

        # Check priority
        priority_mapping = {
            'low': 20,
            'medium': 40,
            'high': 65,
            'critical': 85
        }
        if task.priority in priority_mapping:
            score = max(score, priority_mapping[task.priority])

        # Default to moderate if no indicators
        if score == 0:
            score = 40

        return {
            'score': min(score, 100),
            'indicators': 'impact_keywords_and_priority'
        }

    def _score_user_value(self, task) -> Dict:
        """
        Score user value.

        Indicators:
        - Cosmetic (1x)
        - Convenience (10x)
        - Functional improvement (100x)
        - Enables new workflows (1000x)
        - Solves critical pain point (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        user_value_keywords = [
            # Cosmetic
            ("cosmetic", 15),
            ("visual", 20),
            ("aesthetic", 15),
            ("polish", 20),
            # Convenience
            ("convenience", 30),
            ("nice to have", 20),
            ("quality of life", 35),
            ("user experience", 40),
            ("ux", 35),
            # Functional improvement
            ("feature", 50),
            ("functionality", 55),
            ("capability", 55),
            ("enable", 50),
            ("allow", 45),
            ("improvement", 50),
            # New workflows
            ("workflow", 65),
            ("new way", 70),
            ("empower", 70),
            ("unlock", 75),
            ("enable users to", 65),
            # Critical pain point
            ("pain point", 90),
            ("critical need", 95),
            ("must have", 90),
            ("essential", 85),
            ("blocking", 85),
            ("urgent need", 90),
            ("solve problem", 80),
        ]

        for keyword, points in user_value_keywords:
            if keyword in text:
                score = max(score, points)

        # Check if in user-facing domain
        if task.domain and "frontend" in task.domain.lower():
            score = max(score, 45)

        # Default to functional improvement if no indicators
        if score == 0:
            score = 50

        return {
            'score': min(score, 100),
            'indicators': 'user_value_keywords_and_domain'
        }

    def _score_strategic_alignment(self, task) -> Dict:
        """
        Score strategic alignment.

        Indicators:
        - Tactical (1x)
        - Supports current roadmap (10x)
        - Key initiative (100x)
        - Strategic priority (1000x)
        - Vision-critical (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        strategic_keywords = [
            # Tactical
            ("maintenance", 20),
            ("tech debt", 25),
            ("cleanup", 20),
            ("refactor", 25),
            # Supports roadmap
            ("roadmap", 50),
            ("backlog", 45),
            ("planned", 50),
            ("scheduled", 50),
            ("iteration", 45),
            # Key initiative
            ("initiative", 65),
            ("milestone", 65),
            ("quarterly goal", 70),
            ("okr", 70),
            # Strategic priority
            ("strategic", 80),
            ("priority", 75),
            ("key objective", 85),
            ("focus area", 75),
            ("flagship", 80),
            # Vision-critical
            ("vision", 95),
            ("mission-critical", 95),
            ("company vision", 90),
            ("long-term", 85),
            ("future", 80),
        ]

        for keyword, points in strategic_keywords:
            if keyword in text:
                score = max(score, points)

        # Check if linked to PRD or Epic
        if task.parent_prd or task.parent_epic:
            score = max(score, 60)

        # Check tags for strategic indicators
        strategic_tags = ['strategic', 'roadmap', 'q1', 'q2', 'q3', 'q4', 'okr']
        if any(tag in task.tags for tag in strategic_tags):
            score = max(score, 65)

        # Default to tactical if no indicators
        if score == 0:
            score = 30

        return {
            'score': min(score, 100),
            'indicators': 'strategic_keywords_and_links'
        }

    def _score_revenue_impact(self, task) -> Dict:
        """
        Score revenue impact.

        Indicators:
        - No direct revenue (1x)
        - Cost savings (10x)
        - Revenue protection (100x)
        - Revenue generation (1000x)
        - Revenue multiplier (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        revenue_keywords = [
            # No direct revenue
            ("internal tool", 10),
            ("operational", 15),
            ("infrastructure", 15),
            # Cost savings
            ("cost saving", 40),
            ("reduce cost", 45),
            ("save money", 40),
            ("efficiency", 40),
            ("optimization", 40),
            # Revenue protection
            ("retention", 60),
            ("churn", 65),
            ("keep customers", 65),
            ("prevent loss", 60),
            ("protect revenue", 70),
            # Revenue generation
            ("monetization", 80),
            ("pricing", 75),
            ("upsell", 75),
            ("conversion", 75),
            ("sales", 70),
            ("revenue", 75),
            # Revenue multiplier
            ("growth engine", 95),
            ("scale revenue", 95),
            ("revenue multiplier", 95),
            ("10x revenue", 95),
            ("hockey stick", 90),
        ]

        for keyword, points in revenue_keywords:
            if keyword in text:
                score = max(score, points)

        # Check domain for revenue relevance
        revenue_domains = ["ecommerce", "payments", "billing", "sales"]
        if any(domain in str(task.domain).lower() for domain in revenue_domains):
            score = max(score, 70)

        # Default to no direct revenue if no indicators
        if score == 0:
            score = 20

        return {
            'score': min(score, 100),
            'indicators': 'revenue_keywords_and_domain'
        }

    def _score_competitive_advantage(self, task) -> Dict:
        """
        Score competitive advantage.

        Indicators:
        - Parity (1x)
        - Improvement over competitors (10x)
        - Best in class (100x)
        - Market leader (1000x)
        - Competitive moat (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        competitive_keywords = [
            # Parity
            ("standard", 20),
            ("expected", 20),
            ("table stakes", 25),
            ("basic", 20),
            # Improvement
            ("better than", 40),
            ("superior", 45),
            ("advantage", 50),
            ("edge", 45),
            ("competitive", 55),
            # Best in class
            ("best in class", 75),
            ("market leading", 75),
            ("industry standard", 70),
            ("state of the art", 75),
            ("cutting edge", 70),
            # Market leader
            ("market leader", 85),
            ("first to market", 85),
            ("innovation", 80),
            ("breakthrough", 85),
            ("unique", 80),
            # Competitive moat
            ("moat", 95),
            ("barrier to entry", 90),
            ("defensible", 90),
            ("proprietary", 85),
            ("secret sauce", 90),
            ("unfair advantage", 95),
        ]

        for keyword, points in competitive_keywords:
            if keyword in text:
                score = max(score, points)

        # Check for innovation keywords
        innovation_keywords = ["novel", "innovative", "first", "unique", "patent"]
        if any(kw in text for kw in innovation_keywords):
            score = max(score, 75)

        # Default to parity if no indicators
        if score == 0:
            score = 30

        return {
            'score': min(score, 100),
            'indicators': 'competitive_keywords'
        }

    # Multiplier calculators

    def _business_multiplier(self, score: float) -> float:
        """Convert business impact score to magnitude multiplier"""
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

    def _user_multiplier(self, score: float) -> float:
        """Convert user value score to magnitude multiplier"""
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

    def _strategic_multiplier(self, score: float) -> float:
        """Convert strategic alignment score to magnitude multiplier"""
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

    def _revenue_multiplier(self, score: float) -> float:
        """Convert revenue impact score to magnitude multiplier"""
        if score < 25:
            return 1
        elif score < 50:
            return 10
        elif score < 70:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _competitive_multiplier(self, score: float) -> float:
        """Convert competitive advantage score to magnitude multiplier"""
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
        """Determine value tier from log score"""
        if score < 20:
            return "minimal"
        elif score < 40:
            return "low"
        elif score < 60:
            return "moderate"
        elif score < 80:
            return "high"
        elif score < 90:
            return "critical"
        else:
            return "transformative"
