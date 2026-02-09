"""
First Principles Engine
Main FP reasoning engine for decomposition, constraint mapping, and reconstruction
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class ConstraintType(Enum):
    """Types of constraints"""
    HARD = "hard"      # Physics, law, math (cannot violate)
    SOFT = "soft"      # Preferences, conventions (can negotiate)


@dataclass
class Constraint:
    """A constraint (limitation or requirement)"""
    text: str
    type: ConstraintType
    source: str = "unknown"  # Where did this constraint come from?


@dataclass
class Assumption:
    """An assumption (belief without evidence)"""
    text: str
    confidence: str  # high, medium, low
    test: str = ""  # How to validate


@dataclass
class Component:
    """A fundamental component of a problem"""
    name: str
    description: str
    type: str  # resource, constraint, objective, variable


@dataclass
class Hypothesis:
    """A potential solution hypothesis"""
    name: str
    type: str  # conservative, novel, radical
    approach: str
    rationale: str
    assumptions: List[str]
    pros: List[str]
    cons: List[str]
    risks: List[str]


class FirstPrinciplesEngine:
    """Main FP reasoning engine"""

    def __init__(self):
        self.components: List[Component] = []
        self.constraints: List[Constraint] = []
        self.assumptions: List[Assumption] = []
        self.hypotheses: List[Hypothesis] = []

    def decompose(self, problem: str, context: Dict[str, Any] = None) -> List[Component]:
        """
        Decompose a problem to fundamental components

        Args:
            problem: The problem statement
            context: Additional context

        Returns:
            List of fundamental components
        """

        components = []

        # Extract nouns/phrases that represent components
        # This is a simplified implementation - AI would do this more intelligently
        words = problem.split()
        for word in words:
            if len(word) > 3:  # Filter out short words
                components.append(Component(
                    name=word.lower(),
                    description=f"Component from: {problem}",
                    type="variable"
                ))

        # In production, this would use AI to intelligently decompose
        # For now, return the list
        return components

    def map_constraints(
        self,
        constraints_input: List[str],
        hard_keywords: List[str] = None,
        soft_keywords: List[str] = None
    ) -> List[Constraint]:
        """
        Map and classify constraints as hard or soft

        Args:
            constraints_input: List of constraint descriptions
            hard_keywords: Keywords indicating hard constraints
            soft_keywords: Keywords indicating soft constraints

        Returns:
            List of classified Constraint objects
        """

        if hard_keywords is None:
            hard_keywords = ['must', 'shall', 'required', 'cannot', 'must not',
                          'law', 'legal', 'regulation', 'compliance', 'security']

        if soft_keywords is None:
            soft_keywords = ['should', 'prefer', 'ideally', 'desired', 'nice to have',
                          'typical', 'conventional', 'standard', 'best practice']

        constraints = []

        for constraint_text in constraints_input:
            # Determine if hard or soft
            constraint_lower = constraint_text.lower()

            # Check for hard constraint indicators
            if any(keyword in constraint_lower for keyword in hard_keywords):
                constraint_type = ConstraintType.HARD
            # Check for soft constraint indicators
            elif any(keyword in constraint_lower for keyword in soft_keywords):
                constraint_type = ConstraintType.SOFT
            else:
                # Default to soft if unclear
                constraint_type = ConstraintType.SOFT

            constraints.append(Constraint(
                text=constraint_text,
                type=constraint_type,
                source="user_input"
            ))

        return constraints

    def ground_assumptions(
        self,
        assumptions_input: List[str]
    ) -> List[Assumption]:
        """
        Convert assumptions to testable form

        Args:
            assumptions_input: List of assumption descriptions

        Returns:
            List of Assumption objects
        """

        assumptions = []

        for assumption_text in assumptions_input:
            # Default confidence to medium if not specified
            assumptions.append(Assumption(
                text=assumption_text,
                confidence="medium",
                test="TODO: Design validation test"
            ))

        return assumptions

    def reconstruct(
        self,
        components: List[Component],
        constraints: List[Constraint],
        objectives: List[str]
    ) -> List[Hypothesis]:
        """
        Reconstruct solutions from fundamental components

        Args:
            components: Fundamental components
            constraints: Constraints (hard and soft)
            objectives: Goals to optimize for

        Returns:
            List of solution hypotheses
        """

        hypotheses = []

        # In production, AI would generate these intelligently
        # For now, create a basic framework

        # Conservative hypothesis (minimal change)
        if len(components) > 0:
            hypotheses.append(Hypothesis(
                name="Conservative Approach",
                type="conservative",
                approach="Minimal change to existing solution",
                rationale="Lowest risk, proven path",
                assumptions=[c.name for c in components[:3]],
                pros=["Low risk", "Quick implementation", "Proven"],
                cons=["May not optimize well", "Limited innovation"],
                risks=["May miss optimization opportunities"]
            ))

        # Novel hypothesis (new approach)
        if len(components) > 1:
            hypotheses.append(Hypothesis(
                name="Novel Approach",
                type="novel",
                approach="New architecture addressing fundamentals",
                rationale="Balanced innovation and risk",
                assumptions=["New approach is feasible", "Team can adapt"],
                pros=["Better optimization", "Learning opportunity"],
                cons=["Higher risk", "Longer timeline"],
                risks=["Uncertainty in new approach", "May encounter unknown issues"]
            ))

        # Radical hypothesis (complete rethink)
        if len(components) > 2:
            hypotheses.append(Hypothesis(
                name="Radical Redesign",
                type="radical",
                approach="Complete rethinking from first principles",
                rationale="Maximum optimization without legacy constraints",
                assumptions=["Can rebuild from scratch", "Resources available"],
                pros=["Maximum optimization", "No legacy debt"],
                cons=["Highest risk", "Longest timeline", "Resource intensive"],
                risks=["May not be feasible", "Could fail completely"]
            ))

        return hypotheses

    def validate_plan(
        self,
        hypothesis: Hypothesis,
        constraints: List[Constraint]
    ) -> Tuple[bool, List[str]]:
        """
        Validate a hypothesis against constraints

        Args:
            hypothesis: The hypothesis to validate
            constraints: List of constraints

        Returns:
            Tuple of (is_valid, list_of_violations)
        """

        violations = []

        # Check against hard constraints
        for constraint in constraints:
            if constraint.type == ConstraintType.HARD:
                # In production, this would do actual validation logic
                # For now, just document what should be checked
                pass

        is_valid = len(violations) == 0
        return is_valid, violations

    def generate_tests(
        self,
        hypothesis: Hypothesis
    ) -> List[str]:
        """
        Generate validation tests for a hypothesis

        Args:
            hypothesis: The hypothesis to test

        Returns:
            List of test descriptions
        """

        tests = []

        # Test from assumptions
        for assumption in hypothesis.assumptions:
            tests.append(f"Validate assumption: {assumption}")

        # Test from risks
        for risk in hypothesis.risks:
            tests.append(f"Mitigate risk: {risk}")

        # General validation test
        tests.append(f"Proof of concept: {hypothesis.approach}")

        return tests

    def cost_analysis(
        self,
        components: List[Component],
        time_period: str = "1-year"
    ) -> Dict[str, Any]:
        """
        Perform cost decomposition on components

        Args:
            components: Components to analyze
            time_period: Time period for costs

        Returns:
            Dictionary with cost breakdown
        """

        costs = {
            'time_period': time_period,
            'components': {},
            'total_estimated': 0
        }

        # In production, this would do actual cost calculation
        # For now, provide framework

        for component in components:
            costs['components'][component.name] = {
                'development_time': 'TODO',
                'maintenance_time': 'TODO',
                'complexity': 'TODO'
            }

        return costs


def main():
    """CLI interface for FP engine"""

    import argparse
    import json

    parser = argparse.ArgumentParser(
        description="First Principles Reasoning Engine"
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Decompose command
    decompose_parser = subparsers.add_parser('decompose', help='Decompose a problem')
    decompose_parser.add_argument('--problem', required=True, help='Problem statement')

    # Map constraints command
    constraints_parser = subparsers.add_parser('map-constraints', help='Map and classify constraints')
    constraints_parser.add_argument('--constraints', nargs='+', required=True, help='Constraint descriptions')

    # Reconstruct command
    reconstruct_parser = subparsers.add_parser('reconstruct', help='Reconstruct solutions')
    reconstruct_parser.add_argument('--components', nargs='+', help='Component names')
    reconstruct_parser.add_argument('--objectives', nargs='+', help='Objectives to optimize for')

    args = parser.parse_args()

    engine = FirstPrinciplesEngine()

    if args.command == 'decompose':
        components = engine.decompose(args.problem)
        print("Components:")
        for comp in components:
            print(f"  - {comp.name}: {comp.description}")

    elif args.command == 'map-constraints':
        constraints = engine.map_constraints(args.constraints)
        print("\nConstraints:")
        hard = [c for c in constraints if c.type == ConstraintType.HARD]
        soft = [c for c in constraints if c.type == ConstraintType.SOFT]
        print(f"\n  Hard ({len(hard)}):")
        for c in hard:
            print(f"    - {c.text}")
        print(f"\n  Soft ({len(soft)}):")
        for c in soft:
            print(f"    - {c.text}")

    elif args.command == 'reconstruct':
        # Convert component names to Component objects
        components = [
            Component(name=name, description="", type="variable")
            for name in args.components
        ]
        hypotheses = engine.reconstruct(components, [], args.objectives)
        print("\nHypotheses:")
        for hyp in hypotheses:
            print(f"\n  {hyp.name} ({hyp.type}):")
            print(f"    Approach: {hyp.approach}")
            print(f"    Rationale: {hyp.rationale}")

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
