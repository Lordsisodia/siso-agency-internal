"""
First Principles Decision Gateway
Classifies decisions by complexity and recommends approach
"""

import argparse
import json
import sys
from datetime import datetime
from typing import List, Dict, Any
from enum import Enum


class DecisionComplexity(Enum):
    """Decision complexity levels"""
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    CRITICAL = "critical"


class DecisionGateway:
    """Classifies decisions and recommends next steps"""

    def __init__(self):
        self.complexity_thresholds = {
            'goals': {
                'simple': 1,
                'moderate': 2,
                'complex': 3,
                'critical': 4
            },
            'constraints': {
                'simple': 1,
                'moderate': 3,
                'complex': 5,
                'critical': 7
            },
            'stakeholders': {
                'simple': 1,
                'moderate': 3,
                'complex': 5,
                'critical': 10
            }
        }

    def assess_decision(
        self,
        title: str,
        description: str,
        goals: List[str],
        constraints: List[str],
        stakeholders: int = 1,
        timeframe_hours: float = 0.0,
        risk_level: str = "low"
    ) -> Dict[str, Any]:
        """
        Assess a decision and return classification with recommendations

        Args:
            title: Decision title
            description: One-line description
            goals: List of goals/objectives
            constraints: List of constraints
            stakeholders: Number of stakeholders (default: 1)
            timeframe_hours: Expected time to decide (default: 0)
            risk_level: Risk level (low/medium/high/critical)

        Returns:
            Dictionary with complexity classification and recommendations
        """

        # Count factors
        goal_count = len(goals)
        constraint_count = len(constraints)

        # Calculate complexity score
        complexity_score = self._calculate_complexity(
            goal_count,
            constraint_count,
            stakeholders,
            timeframe_hours,
            risk_level
        )

        # Determine complexity level
        complexity = self._determine_complexity(complexity_score)

        # Generate recommendations
        recommendations = self._generate_recommendations(
            complexity,
            goal_count,
            constraint_count,
            risk_level
        )

        # Create result
        result = {
            'title': title,
            'description': description,
            'complexity': complexity.value,
            'complexity_score': complexity_score,
            'requires_adi': complexity in [DecisionComplexity.COMPLEX, DecisionComplexity.CRITICAL],
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat()
        }

        return result

    def _calculate_complexity(
        self,
        goals: int,
        constraints: int,
        stakeholders: int,
        timeframe_hours: float,
        risk_level: str
    ) -> int:
        """Calculate complexity score from factors"""

        score = 0

        # Goals contribution
        if goals >= 4:
            score += 4
        elif goals >= 3:
            score += 3
        elif goals >= 2:
            score += 2
        elif goals >= 1:
            score += 1

        # Constraints contribution
        if constraints >= 7:
            score += 4
        elif constraints >= 5:
            score += 3
        elif constraints >= 3:
            score += 2
        elif constraints >= 1:
            score += 1

        # Stakeholders contribution
        if stakeholders >= 7:
            score += 4
        elif stakeholders >= 5:
            score += 3
        elif stakeholders >= 3:
            score += 2
        elif stakeholders >= 2:
            score += 1

        # Timeframe contribution
        if timeframe_hours >= 8:
            score += 4
        elif timeframe_hours >= 4:
            score += 3
        elif timeframe_hours >= 2:
            score += 2
        elif timeframe_hours >= 0.5:
            score += 1

        # Risk contribution
        risk_scores = {'low': 0, 'medium': 1, 'high': 2, 'critical': 4}
        score += risk_scores.get(risk_level.lower(), 0)

        return score

    def _determine_complexity(self, score: int) -> DecisionComplexity:
        """Determine complexity level from score"""

        if score <= 3:
            return DecisionComplexity.SIMPLE
        elif score <= 7:
            return DecisionComplexity.MODERATE
        elif score <= 12:
            return DecisionComplexity.COMPLEX
        else:
            return DecisionComplexity.CRITICAL

    def _generate_recommendations(
        self,
        complexity: DecisionComplexity,
        goals: int,
        constraints: int,
        risk_level: str
    ) -> List[str]:
        """Generate recommendations based on complexity"""

        recommendations = []

        if complexity == DecisionComplexity.SIMPLE:
            recommendations = [
                "Document reasoning directly in your notes",
                "No formal FP process needed",
                "Quick validation (checklist) sufficient",
                f"Expected time: < 5 minutes"
            ]

        elif complexity == DecisionComplexity.MODERATE:
            recommendations = [
                "Use FP Decomposition framework (see .docs/first-principles/README.md)",
                "Document constraints explicitly",
                "Generate 2-3 options before deciding",
                "Create quick validation plan",
                f"Expected time: 5-30 minutes",
                "Consider using: prompts/fp/decompose.md"
            ]

        elif complexity == DecisionComplexity.COMPLEX:
            recommendations = [
                "Use full FP Decomposition with documentation",
                "Generate 3-5 hypotheses (Conservative, Novel, Radical)",
                "Design validation tests for each hypothesis",
                "Create formal Decision Record in data/decisions/records/",
                f"Expected time: 30 minutes - 2 hours",
                "Use prompts: q1_abduct.md, q2_deduct.md, q3_induct.md",
                "Consider multi-agent review (analyst, architect)"
            ]

        else:  # CRITICAL
            recommendations = [
                "FULL ADI Cycle required (see prompts/fp/)",
                "Multiple stakeholder review mandatory",
                "Extensive validation with formal tests",
                "Formal Decision Record with review date",
                f"Expected time: > 2 hours",
                "Schedule follow-up review (30-90 days)",
                "Document all hypotheses and rejections",
                "Use orchestrator agent for coordination"
            ]

        # Risk-specific recommendations
        if risk_level.lower() in ['high', 'critical']:
            recommendations.append("⚠️  High risk - ensure thorough validation")
            recommendations.append("Schedule review date regardless of outcome")

        return recommendations


def main():
    """CLI interface for decision gateway"""

    parser = argparse.ArgumentParser(
        description="First Principles Decision Gateway"
    )

    parser.add_argument(
        '--title',
        required=True,
        help="Decision title"
    )

    parser.add_argument(
        '--description',
        required=True,
        help="One-line description of the decision"
    )

    parser.add_argument(
        '--goals',
        nargs='+',
        default=[],
        help="List of goals/objectives"
    )

    parser.add_argument(
        '--constraints',
        nargs='+',
        default=[],
        help="List of constraints"
    )

    parser.add_argument(
        '--stakeholders',
        type=int,
        default=1,
        help="Number of stakeholders (default: 1)"
    )

    parser.add_argument(
        '--timeframe',
        type=float,
        default=0.0,
        help="Expected time to decide in hours (default: 0)"
    )

    parser.add_argument(
        '--risk',
        choices=['low', 'medium', 'high', 'critical'],
        default='low',
        help="Risk level (default: low)"
    )

    parser.add_argument(
        '--json',
        action='store_true',
        help="Output as JSON"
    )

    args = parser.parse_args()

    # Assess decision
    gateway = DecisionGateway()
    result = gateway.assess_decision(
        title=args.title,
        description=args.description,
        goals=args.goals,
        constraints=args.constraints,
        stakeholders=args.stakeholders,
        timeframe_hours=args.timeframe,
        risk_level=args.risk
    )

    # Output result
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print("=" * 60)
        print("DECISION ASSESSMENT")
        print("=" * 60)
        print()
        print(f"Title: {result['title']}")
        print(f"Description: {result['description']}")
        print()
        print(f"Complexity: {result['complexity'].upper()}")
        print(f"Score: {result['complexity_score']}")
        print(f"Requires ADI Cycle: {'Yes' if result['requires_adi'] else 'No'}")
        print()
        print("RECOMMENDATIONS:")
        print("-" * 40)
        for i, rec in enumerate(result['recommendations'], 1):
            print(f"{i}. {rec}")
        print()
        print("=" * 60)

    # Return exit code based on complexity
    if result['complexity'] in [DecisionComplexity.COMPLEX, DecisionComplexity.CRITICAL]:
        return 2  # High complexity
    elif result['complexity'] == DecisionComplexity.MODERATE:
        return 1  # Medium complexity
    else:
        return 0  # Simple


if __name__ == '__main__':
    sys.exit(main())
