"""
Logarithmic Speed Analyzer - Analyzes speed priority with log₁₀ scoring

Scores 4 dimensions:
- Deadline (35%): Time pressure, due dates
- Blocking (30%): Is this blocking other work?
- Priority (20%): Stated priority level
- Value (15%): Higher value = should be done sooner
"""

import re
from datetime import datetime
from typing import Dict
from .utils import log_score


class LogSpeedAnalyzer:
    """Analyze task speed priority using logarithmic scoring"""

    def __init__(self, value_analyzer=None):
        """
        Initialize analyzer.

        Args:
            value_analyzer: LogValueAnalyzer instance
        """
        self.value_analyzer = value_analyzer

    def analyze(self, task, value_result=None) -> Dict:
        """
        Analyze task speed priority.

        Args:
            task: Task to analyze
            value_result: Pre-computed value result (optional)

        Returns:
            Dict with:
                - magnitude: Total speed magnitude
                - score: Overall speed score (0-100)
                - deadline_factor: Deadline pressure (1-1000x)
                - blocking_factor: Blocking factor (1-100x)
                - priority_factor: Priority level (1-100x)
                - value_factor: Business value (1-10,000x)
        """
        # Calculate each dimension
        deadline_factor = self._calculate_deadline_factor(task)
        blocking_factor = self._calculate_blocking_factor(task)
        priority_factor = self._calculate_priority_factor(task)

        # Get value factor
        if value_result:
            value_factor = value_result['magnitude']
        elif self.value_analyzer:
            value_result = self.value_analyzer.analyze(task)
            value_factor = value_result['magnitude']
        else:
            value_factor = 100

        # Total magnitude (multiplicative)
        magnitude = (
            deadline_factor *
            blocking_factor *
            priority_factor *
            max(value_factor / 100, 1)  # Normalize value to 1-100 range
        )

        # Convert to score (0-100)
        # Max reasonable magnitude: 1000 * 100 * 100 * 100 = 10^9
        score = log_score(magnitude, min_val=1, max_val=10**9)

        return {
            "magnitude": magnitude,
            "score": score,
            "deadline_factor": deadline_factor,
            "blocking_factor": blocking_factor,
            "priority_factor": priority_factor,
            "value_factor": value_factor,
        }

    def _calculate_deadline_factor(self, task) -> float:
        """
        Calculate deadline pressure factor (1-1000x)

        Factors:
        - Explicit deadlines
        - Time pressure indicators
        - Urgency keywords
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Deadline keywords with timeframes
        deadline_keywords = {
            # Critical - immediate (500-1000x)
            "asap": 1000,
            "immediately": 1000,
            "right now": 1000,
            "urgent": 900,
            "emergency": 1000,
            "today": 800,
            "end of day": 700,
            "eod": 700,

            # High - this week (200-400x)
            "tomorrow": 500,
            "this week": 300,
            "by friday": 400,
            "by eod": 600,

            # Medium - this sprint (50-150x)
            "this sprint": 150,
            "sprint": 100,
            "deadline": 200,
            "due": 150,
            "time-sensitive": 180,

            # Lower - future (10-40x)
            "next week": 40,
            "next sprint": 50,
            "soon": 30,
            "upcoming": 20,
            "eventually": 5,

            # No pressure (1-5x)
            "when possible": 3,
            "backlog": 2,
            "later": 5,
            "nice to have": 1,
        }

        for keyword, deadline_mult in deadline_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, deadline_mult)

        # Check for date patterns
        # Look for dates like "2025-01-20", "Jan 20", "01/20"
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # ISO date
            r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}',  # Jan 20
            r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY
        ]

        for pattern in date_patterns:
            if re.search(pattern, text):
                multiplier = max(multiplier, 100)
                break

        # Check for explicit deadline field
        if hasattr(task, 'deadline') and task.deadline:
            try:
                deadline_date = datetime.fromisoformat(task.deadline)
                days_until = (deadline_date - datetime.now()).days

                if days_until <= 0:
                    multiplier = max(multiplier, 1000)
                elif days_until <= 1:
                    multiplier = max(multiplier, 800)
                elif days_until <= 3:
                    multiplier = max(multiplier, 500)
                elif days_until <= 7:
                    multiplier = max(multiplier, 300)
                elif days_until <= 14:
                    multiplier = max(multiplier, 100)
                elif days_until <= 30:
                    multiplier = max(multiplier, 50)
                else:
                    multiplier = max(multiplier, 10)
            except:
                pass

        return min(multiplier, 1000)

    def _calculate_blocking_factor(self, task) -> float:
        """
        Calculate blocking factor (1-100x)

        Factors:
        - Number of tasks blocked
        - Critical path
        - Dependencies
        """
        multiplier = 1.0
        text = f"{task.title} {task.description} {task.content}".lower()

        # Blocking keywords
        blocking_keywords = {
            # Critical blocking (50-100x)
            "blocking": 80,
            "blocked by": 70,
            "depends on": 60,
            "dependency": 50,
            "critical path": 90,
            "unblocking": 100,

            # Medium blocking (20-40x)
            " prerequisite": 30,
            "must complete": 35,
            "before": 25,
            "enables": 40,
        }

        for keyword, blocking_mult in blocking_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, blocking_mult)

        # Check for actual blocking relationships
        if hasattr(task, 'blocks') and task.blocks:
            # Each blocked task adds urgency
            multiplier *= (1 + len(task.blocks) * 20)

        if hasattr(task, 'blocked_by') and task.blocked_by:
            # Being blocked reduces urgency (can't start yet)
            multiplier *= 0.5

        return min(multiplier, 100)

    def _calculate_priority_factor(self, task) -> float:
        """
        Calculate priority factor (1-100x)

        Factors:
        - Stated priority
        - Category-based priority
        - Tier-based priority
        """
        multiplier = 1.0

        # Check priority field
        if hasattr(task, 'priority'):
            priority_multipliers = {
                "critical": 100,
                "urgent": 90,
                "high": 70,
                "medium": 30,
                "low": 10,
                "backlog": 5,
            }
            multiplier = priority_multipliers.get(task.priority.lower(), 30)

        # Check category for implicit priority
        text = f"{task.title} {task.description} {task.content}".lower() if hasattr(task, 'content') else ""

        if hasattr(task, 'category'):
            category_multipliers = {
                "hotfix": 100,
                "bug": 60,
                "critical": 100,
                "feature": 40,
                "enhancement": 30,
                "refactor": 20,
                "technical debt": 25,
                "documentation": 10,
                "research": 35,
            }
            cat_multiplier = category_multipliers.get(task.category.lower(), 30)
            multiplier = max(multiplier, cat_multiplier)

        # Check tier
        if hasattr(task, 'tier'):
            # Higher tier = more strategic, but not necessarily more urgent
            # This is subtle - tier 4 (complex) might be less urgent than tier 1 (quick fix)
            # So we don't boost multiplier based on tier
            pass

        # Check for priority keywords in text
        priority_keywords = {
            "critical": 100,
            "urgent": 90,
            "important": 50,
            "high priority": 70,
            "priority": 40,
            "must have": 80,
            "should have": 40,
            "could have": 15,
            "won't have": 5,
        }

        for keyword, priority_mult in priority_keywords.items():
            if keyword in text:
                multiplier = max(multiplier, priority_mult)

        return min(multiplier, 100)
