"""
Logarithmic Value Analyzer - Analyzes task business value with log₁₀ scoring

Scores 5 dimensions:
- Business (30%): Revenue, cost savings, business impact
- User (25%): User experience, satisfaction, retention
- Strategic (20%): Alignment with goals, competitive advantage
- Urgency (15%): Time-sensitivity, deadlines
- Impact (10%): Scale of impact, number of users affected
"""

import re
from typing import Dict
from .utils import log_score


class LogValueAnalyzer:
    """Analyze task value using logarithmic scoring"""

    def __init__(self):
        """Initialize analyzer"""
        pass

    def analyze(self, task) -> Dict:
        """
        Analyze task value across all dimensions.

        Returns:
            Dict with:
                - magnitude: Total value magnitude (multiplicative)
                - score: Overall value score (0-100)
                - business_multiplier: Business value (1-10,000x)
                - user_multiplier: User value (1-100x)
                - strategic_multiplier: Strategic value (1-100x)
                - urgency_multiplier: Urgency (1-100x)
                - impact_multiplier: Impact scale (1-10x)
        """
        # Calculate each dimension
        business_mult = self._calculate_business_multiplier(task)
        user_mult = self._calculate_user_multiplier(task)
        strategic_mult = self._calculate_strategic_multiplier(task)
        urgency_mult = self._calculate_urgency_multiplier(task)
        impact_mult = self._calculate_impact_multiplier(task)

        # Total magnitude (multiplicative)
        magnitude = (
            business_mult *
            user_mult *
            strategic_mult *
            urgency_mult *
            impact_mult
        )

        # Convert to score (0-100)
        # Max reasonable magnitude: 10,000 * 100 * 100 * 100 * 10 = 10^12
        score = log_score(magnitude, min_val=1, max_val=10**12)

        return {
            "magnitude": magnitude,
            "score": score,
            "business_multiplier": business_mult,
            "user_multiplier": user_mult,
            "strategic_multiplier": strategic_mult,
            "urgency_multiplier": urgency_mult,
            "impact_multiplier": impact_mult,
        }

    def _calculate_business_multiplier(self, task) -> float:
        """
        Calculate business value multiplier (1-10,000x)

        Factors:
        - Revenue impact
        - Cost savings
        - Business metrics
        - Market impact
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Business value keywords
        business_keywords = {
            # Critical business value (500-10,000x)
            "revenue": 1000,
            "monetization": 800,
            "sales": 600,
            "conversion": 500,
            "cost savings": 800,
            "reduce cost": 700,
            "profit": 1000,
            "roi": 900,

            # High business value (100-400x)
            "business": 200,
            "market": 150,
            "customer": 150,
            "client": 120,
            "enterprise": 200,
            "scalability": 150,
            "performance": 100,

            # Medium business value (20-80x)
            "efficiency": 50,
            "productivity": 60,
            "automation": 80,
            "optimize": 40,
            "streamline": 30,

            # Lower business value (5-15x)
            "improve": 10,
            "enhance": 8,
            "update": 5,
            "fix": 5,
        }

        for keyword, business_mult in business_keywords.items():
            if keyword in text:
                multiplier *= business_mult

        # Check for monetary values
        # Look for $, K, M, B indicators
        money_pattern = r'\$[\d,]+(?:k|m|b)?|\d+(?:k|m|b)?\s*(?:dollars?|usd)'
        money_matches = re.findall(money_pattern, text, re.IGNORECASE)
        if money_matches:
            # Money mentioned increases business value
            multiplier *= 500

        return min(multiplier, 10000)

    def _calculate_user_multiplier(self, task) -> float:
        """
        Calculate user value multiplier (1-100x)

        Factors:
        - User experience
        - User satisfaction
        - User retention
        - User feedback
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # User value keywords
        user_keywords = {
            # Critical user value (50-100x)
            "user experience": 80,
            "ux": 70,
            "usability": 70,
            "accessibility": 80,
            "user satisfaction": 90,
            "retention": 80,
            "churn": 70,

            # High user value (25-45x)
            "user feedback": 40,
            "complaint": 50,
            "friction": 45,
            "pain point": 40,
            "user journey": 35,
            "onboarding": 40,

            # Medium user value (10-20x)
            "user": 10,
            "customer experience": 20,
            "interface": 15,
            "navigation": 12,
            "responsive": 15,

            # Lower user value (3-8x)
            "improve": 5,
            "enhance": 5,
            "update": 3,
            "visual": 5,
        }

        for keyword, user_mult in user_keywords.items():
            if keyword in text:
                multiplier *= user_mult

        # Check priority field
        if hasattr(task, 'priority'):
            priority_multipliers = {
                "critical": 80,
                "high": 50,
                "medium": 20,
                "low": 5,
            }
            multiplier *= priority_multipliers.get(task.priority, 20)

        return min(multiplier, 100)

    def _calculate_strategic_multiplier(self, task) -> float:
        """
        Calculate strategic value multiplier (1-100x)

        Factors:
        - Strategic alignment
        - Competitive advantage
        - Long-term impact
        - Innovation
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Strategic value keywords
        strategic_keywords = {
            # Critical strategic value (60-100x)
            "strategic": 80,
            "strategy": 70,
            "vision": 70,
            "competitive advantage": 100,
            "differentiator": 80,
            "innovation": 70,
            "breakthrough": 90,

            # High strategic value (30-50x)
            "market position": 40,
            "leadership": 50,
            "first-mover": 60,
            "proprietary": 40,
            "technology": 35,
            "architecture": 40,

            # Medium strategic value (15-25x)
            "scalable": 25,
            "future-proof": 30,
            "modernize": 20,
            "migrate": 15,
            "upgrade": 15,

            # Lower strategic value (5-10x)
            "improve": 5,
            "update": 5,
            "enhance": 5,
            "maintain": 3,
        }

        for keyword, strategic_mult in strategic_keywords.items():
            if keyword in text:
                multiplier *= strategic_mult

        # Check if tied to PRD or Epic (strategic initiatives)
        if hasattr(task, 'parent_prd') and task.parent_prd:
            multiplier *= 50

        if hasattr(task, 'parent_epic') and task.parent_epic:
            multiplier *= 30

        return min(multiplier, 100)

    def _calculate_urgency_multiplier(self, task) -> float:
        """
        Calculate urgency multiplier (1-100x)

        Factors:
        - Time sensitivity
        - Deadlines
        - Blocking issues
        - Hotfix/critical
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Urgency keywords
        urgency_keywords = {
            # Critical urgency (70-100x)
            "urgent": 90,
            "asap": 100,
            "immediately": 95,
            "critical": 80,
            "emergency": 100,
            "hotfix": 90,
            "production down": 100,
            "sev1": 100,

            # High urgency (40-60x)
            "deadline": 50,
            "time-sensitive": 60,
            "blocking": 60,
            "blocked": 55,
            "high priority": 45,
            "today": 50,

            # Medium urgency (15-30x)
            "soon": 25,
            "priority": 20,
            "important": 15,
            "this sprint": 25,
            "this week": 20,

            # Lower urgency (3-10x)
            "eventually": 3,
            "later": 5,
            "backlog": 5,
            "nice to have": 3,
        }

        for keyword, urgency_mult in urgency_keywords.items():
            if keyword in text:
                multiplier *= urgency_mult

        # Check if blocking other tasks
        if hasattr(task, 'blocks') and task.blocks:
            multiplier *= len(task.blocks) * 20

        # Check priority field
        if hasattr(task, 'priority'):
            if task.priority == "critical":
                multiplier *= 80
            elif task.priority == "high":
                multiplier *= 40

        return min(multiplier, 100)

    def _calculate_impact_multiplier(self, task) -> float:
        """
        Calculate impact scale multiplier (1-10x)

        Factors:
        - Number of users affected
        - Scale of deployment
        - Visibility
        - Frequency of use
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Impact keywords
        impact_keywords = {
            # Critical impact (8-10x)
            "all users": 10,
            "everyone": 9,
            "global": 10,
            "company-wide": 9,
            "entire": 8,

            # High impact (5-7x)
            "most users": 6,
            "majority": 5,
            "production": 7,
            "customer-facing": 6,
            "public": 7,

            # Medium impact (3-4x)
            "many users": 4,
            "multiple": 3,
            "several": 3,
            "team": 3,

            # Lower impact (1-2x)
            "some users": 2,
            "few": 1,
            "internal": 2,
            "admin": 2,
        }

        for keyword, impact_mult in impact_keywords.items():
            if keyword in text:
                multiplier *= impact_mult

        # Check for specific numbers
        # Look for patterns like "1000 users", "50% of users"
        number_pattern = r'(\d+(?:k|m|b)?)\s*(?:users?|customers?|people)'
        number_matches = re.findall(number_pattern, text, re.IGNORECASE)
        if number_matches:
            # Number mentioned indicates impact
            multiplier *= 5

        # Check tier
        if hasattr(task, 'tier'):
            tier_multipliers = {
                1: 2,      # Quick fix - limited impact
                2: 3,      # Simple - moderate impact
                3: 6,      # Standard - high impact
                4: 10,     # Complex - very high impact
            }
            multiplier *= tier_multipliers.get(task.tier, 6)

        return min(multiplier, 10)
