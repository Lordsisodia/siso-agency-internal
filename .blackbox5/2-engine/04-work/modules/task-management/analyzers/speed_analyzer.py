"""
Logarithmic Speed Analyzer - Analyze task speed priority using log₁₀ scales

Speed priority has 4 sub-dimensions, each contributing to overall magnitude.
Uses logarithmic scoring to handle power-law distribution of urgency.
"""

from typing import Dict
from .utils import log_score


class LogSpeedAnalyzer:
    """Analyze task speed priority using logarithmic scales"""

    def analyze(self, task) -> Dict:
        """
        Analyze task speed priority across 4 dimensions.

        Returns:
            Dict with:
            - overall_score: 0-100 (log₁₀ scale)
            - overall_magnitude: Speed multiplier
            - tier: "whenever", "eventual", "standard", "priority", "urgent", "immediate"
            - sub_scores: Dict of individual dimension scores
            - multipliers: Dict of individual dimension multipliers
        """
        # Score each dimension
        urgency = self._score_urgency(task)
        blocking = self._score_blocking(task)
        time_sensitivity = self._score_time_sensitivity(task)
        stakeholder = self._score_stakeholder_pressure(task)

        # Calculate multipliers
        urgency_mult = self._urgency_multiplier(urgency['score'])
        blocking_mult = self._blocking_multiplier(blocking['score'])
        time_mult = self._time_sensitivity_multiplier(time_sensitivity['score'])
        stakeholder_mult = self._stakeholder_multiplier(stakeholder['score'])

        # Overall magnitude (product of multipliers)
        overall_magnitude = (
            urgency_mult *
            blocking_mult *
            time_mult *
            stakeholder_mult
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
                'urgency': urgency,
                'blocking': blocking,
                'time_sensitivity': time_sensitivity,
                'stakeholder_pressure': stakeholder,
            },
            'multipliers': {
                'urgency': urgency_mult,
                'blocking': blocking_mult,
                'time_sensitivity': time_mult,
                'stakeholder_pressure': stakeholder_mult,
            }
        }

    def _score_urgency(self, task) -> Dict:
        """
        Score urgency.

        Indicators:
        - No urgency (1x)
        - Low urgency (10x)
        - Standard urgency (100x)
        - High urgency (1000x)
        - Critical urgency (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        urgency_keywords = [
            # No urgency
            ("whenever", 10),
            ("eventually", 10),
            ("backlog", 15),
            ("nice to have", 15),
            # Low urgency
            ("soon", 25),
            ("upcoming", 25),
            ("next iteration", 30),
            # Standard urgency
            ("this sprint", 45),
            ("current", 45),
            ("in progress", 50),
            ("active", 45),
            # High urgency
            ("asap", 70),
            ("urgent", 75),
            ("priority", 65),
            ("important", 60),
            # Critical urgency
            ("critical", 90),
            ("immediate", 95),
            ("emergency", 95),
            ("blocker", 90),
            ("production issue", 95),
        ]

        for keyword, points in urgency_keywords:
            if keyword in text:
                score = max(score, points)

        # Check priority field
        priority_mapping = {
            'low': 20,
            'medium': 45,
            'high': 70,
            'critical': 90
        }
        if task.priority in priority_mapping:
            score = max(score, priority_mapping[task.priority])

        # Default to standard urgency if no indicators
        if score == 0:
            score = 45

        return {
            'score': min(score, 100),
            'indicators': 'urgency_keywords_and_priority'
        }

    def _score_blocking(self, task) -> Dict:
        """
        Score blocking impact.

        Indicators:
        - Not blocking (1x)
        - Blocking 1-2 tasks (10x)
        - Blocking 3-5 tasks (100x)
        - Blocking team (1000x)
        - Blocking organization (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Check explicit blocking relationships
        if task.blocks and len(task.blocks) > 0:
            if len(task.blocks) <= 2:
                score = 35
            elif len(task.blocks) <= 5:
                score = 60
            else:
                score = 80
        else:
            score = 15  # Not blocking

        blocking_keywords = [
            # Not blocking
            ("independent", 15),
            ("standalone", 15),
            # Blocking 1-2 tasks
            ("blocks", 35),
            ("blocking", 35),
            ("depends on this", 40),
            # Blocking 3-5 tasks
            ("blocks multiple", 65),
            ("blocking several", 65),
            # Blocking team
            ("blocks team", 80),
            ("team blocked", 80),
            ("blocking team", 85),
            # Blocking organization
            ("blocks organization", 95),
            ("company blocked", 95),
            ("blocks release", 90),
            ("blocks launch", 95),
        ]

        for keyword, points in blocking_keywords:
            if keyword in text:
                score = max(score, points)

        return {
            'score': min(score, 100),
            'indicators': 'blocking_count_and_keywords'
        }

    def _score_time_sensitivity(self, task) -> Dict:
        """
        Score time sensitivity.

        Indicators:
        - No time sensitivity (1x)
        - Date-based (10x)
        - Week-sensitive (100x)
        - Day-sensitive (1000x)
        - Hour-sensitive (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        time_keywords = [
            # No time sensitivity
            ("ongoing", 15),
            ("continuous", 15),
            ("evergreen", 15),
            # Date-based
            ("this quarter", 30),
            ("this month", 30),
            ("by end of", 35),
            ("deadline", 35),
            # Week-sensitive
            ("this week", 55),
            ("within week", 55),
            ("next week", 50),
            # Day-sensitive
            ("today", 75),
            ("tomorrow", 75),
            ("within days", 70),
            ("end of week", 75),
            # Hour-sensitive
            ("within hours", 95),
            ("asap", 90),
            ("immediately", 95),
            ("right now", 95),
        ]

        for keyword, points in time_keywords:
            if keyword in text:
                score = max(score, points)

        # Check metadata for deadlines
        if 'deadline' in task.metadata:
            score = max(score, 60)

        # Check tags for time sensitivity
        time_tags = ['urgent', 'deadline', 'time-sensitive', 'this-week', 'this-month']
        if any(tag in task.tags for tag in time_tags):
            score = max(score, 65)

        # Default to no time sensitivity if no indicators
        if score == 0:
            score = 20

        return {
            'score': min(score, 100),
            'indicators': 'time_keywords_and_metadata'
        }

    def _score_stakeholder_pressure(self, task) -> Dict:
        """
        Score stakeholder pressure.

        Indicators:
        - No pressure (1x)
        - Low pressure (10x)
        - Medium pressure (100x)
        - High pressure (1000x)
        - Executive pressure (10000x)
        """
        score = 0.0
        text = f"{task.title} {task.description} {task.content}".lower()

        stakeholder_keywords = [
            # No pressure
            ("internal", 15),
            ("team request", 20),
            # Low pressure
            ("requested by", 30),
            ("user request", 30),
            ("feedback", 30),
            # Medium pressure
            ("manager", 50),
            ("lead", 50),
            ("product manager", 55),
            ("pm", 50),
            ("stakeholder", 55),
            # High pressure
            ("director", 70),
            ("vp", 75),
            ("head of", 70),
            ("customer", 75),
            ("client", 75),
            # Executive pressure
            ("ceo", 95),
            ("cto", 95),
            ("executive", 90),
            ("board", 95),
            ("investor", 90),
        ]

        for keyword, points in stakeholder_keywords:
            if keyword in text:
                score = max(score, points)

        # Check risk level (higher risk = more stakeholder attention)
        if task.risk_level == 'critical':
            score = max(score, 80)
        elif task.risk_level == 'high':
            score = max(score, 65)

        # Check if linked to strategic initiatives
        if task.parent_prd or task.parent_epic:
            score = max(score, 60)

        # Default to low pressure if no indicators
        if score == 0:
            score = 25

        return {
            'score': min(score, 100),
            'indicators': 'stakeholder_keywords_and_risk'
        }

    # Multiplier calculators

    def _urgency_multiplier(self, score: float) -> float:
        """Convert urgency score to magnitude multiplier"""
        if score < 20:
            return 1
        elif score < 40:
            return 10
        elif score < 65:
            return 100
        elif score < 85:
            return 1000
        else:
            return 10000

    def _blocking_multiplier(self, score: float) -> float:
        """Convert blocking score to magnitude multiplier"""
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

    def _time_sensitivity_multiplier(self, score: float) -> float:
        """Convert time sensitivity score to magnitude multiplier"""
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

    def _stakeholder_multiplier(self, score: float) -> float:
        """Convert stakeholder pressure score to magnitude multiplier"""
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
        """Determine speed tier from log score"""
        if score < 20:
            return "whenever"
        elif score < 40:
            return "eventual"
        elif score < 60:
            return "standard"
        elif score < 80:
            return "priority"
        elif score < 90:
            return "urgent"
        else:
            return "immediate"
