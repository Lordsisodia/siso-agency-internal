#!/usr/bin/env python3
"""
Gap Analysis for Blackbox4 Questioning System
Identifies missing information and areas needing clarification
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import sys
import os

# Add parent lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

try:
    from spec_types import StructuredSpec, UserStory, FunctionalRequirement
except ImportError:
    print("Warning: spec_types module not found")
    # Create placeholder classes
    StructuredSpec = object
    UserStory = object
    FunctionalRequirement = object


class GapSeverity(Enum):
    """Severity levels for gaps."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class GapCategory(Enum):
    """Categories of gaps."""
    MISSING_CONTENT = "missing_content"
    INSUFFICIENT_DETAIL = "insufficient_detail"
    INCONSISTENCY = "inconsistency"
    AMBIGUITY = "ambiguity"
    FEASIBILITY_CONCERN = "feasibility_concern"
    TESTABILITY_ISSUE = "testability_issue"


@dataclass
class Gap:
    """Represents a gap in the specification."""
    area: str
    category: GapCategory
    severity: GapSeverity
    description: str
    recommendation: str
    location: str = ""
    context: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'area': self.area,
            'category': self.category.value,
            'severity': self.severity.value,
            'description': self.description,
            'recommendation': self.recommendation,
            'location': self.location,
            'context': self.context or {}
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Gap':
        """Create from dictionary."""
        return cls(
            area=data['area'],
            category=GapCategory(data['category']),
            severity=GapSeverity(data['severity']),
            description=data['description'],
            recommendation=data['recommendation'],
            location=data.get('location', ''),
            context=data.get('context', {})
        )


class GapAnalyzer:
    """Analyze specs for gaps and missing information."""

    def __init__(self):
        """Initialize the gap analyzer."""
        self.gaps: List[Gap] = []
        self.completeness_thresholds = {
            'overview_min_length': 100,
            'user_stories_min_count': 3,
            'requirements_min_count': 5,
            'acceptance_criteria_min_count': 2
        }

    def analyze_completeness(self, spec: StructuredSpec) -> float:
        """
        Calculate spec completeness score (0-100).

        Args:
            spec: The spec to analyze

        Returns:
            Completeness score as percentage
        """
        scores = []

        # Overview completeness (20 points)
        if spec.overview:
            overview_score = min(len(spec.overview) / 200, 1.0) * 20
        else:
            overview_score = 0
        scores.append(overview_score)

        # User stories completeness (25 points)
        if spec.user_stories:
            stories_with_criteria = sum(
                1 for s in spec.user_stories
                if s.acceptance_criteria and len(s.acceptance_criteria) >= 2
            )
            stories_score = (stories_with_criteria / max(len(spec.user_stories), 1)) * 25
        else:
            stories_score = 0
        scores.append(stories_score)

        # Functional requirements completeness (25 points)
        if spec.functional_requirements:
            reqs_with_tests = sum(
                1 for r in spec.functional_requirements
                if r.acceptance_tests and len(r.acceptance_tests) >= 1
            )
            reqs_score = (reqs_with_tests / max(len(spec.functional_requirements), 1)) * 25
        else:
            reqs_score = 0
        scores.append(reqs_score)

        # Constitution completeness (15 points)
        if spec.constitution:
            constitution_items = sum([
                1 if spec.constitution.vision else 0,
                1 if spec.constitution.tech_stack else 0,
                1 if spec.constitution.quality_standards else 0,
                1 if spec.constitution.architectural_principles else 0
            ])
            constitution_score = (constitution_items / 4) * 15
        else:
            constitution_score = 0
        scores.append(constitution_score)

        # Clarifications completeness (15 points)
        if spec.clarifications:
            clarifications_score = min(len(spec.clarifications) / 5, 1.0) * 15
        else:
            clarifications_score = 0
        scores.append(clarifications_score)

        return round(sum(scores), 1)

    def identify_missing_sections(self, spec: StructuredSpec) -> List[Gap]:
        """
        Find sections that need information.

        Args:
            spec: The spec to analyze

        Returns:
            List of gaps for missing sections
        """
        gaps = []

        # Check overview
        if not spec.overview or len(spec.overview.strip()) < self.completeness_thresholds['overview_min_length']:
            gaps.append(Gap(
                area='overview',
                category=GapCategory.MISSING_CONTENT,
                severity=GapSeverity.HIGH,
                description=f'Overview is missing or too brief (current: {len(spec.overview) if spec.overview else 0} chars)',
                recommendation=f'Add a comprehensive overview (at least {self.completeness_thresholds["overview_min_length"]} characters) describing the project purpose, goals, and scope',
                location='spec.overview'
            ))

        # Check user stories
        if not spec.user_stories:
            gaps.append(Gap(
                area='user_stories',
                category=GapCategory.MISSING_CONTENT,
                severity=GapSeverity.CRITICAL,
                description='No user stories defined',
                recommendation='Add user stories following the "As a... I want... So that..." format to capture user needs',
                location='spec.user_stories'
            ))
        elif len(spec.user_stories) < self.completeness_thresholds['user_stories_min_count']:
            gaps.append(Gap(
                area='user_stories',
                category=GapCategory.INSUFFICIENT_DETAIL,
                severity=GapSeverity.HIGH,
                description=f'Insufficient user stories (current: {len(spec.user_stories)}, minimum: {self.completeness_thresholds["user_stories_min_count"]})',
                recommendation=f'Add more user stories to cover all major use cases. Aim for at least {self.completeness_thresholds["user_stories_min_count"]} stories.',
                location='spec.user_stories'
            ))

        # Check functional requirements
        if not spec.functional_requirements:
            gaps.append(Gap(
                area='functional_requirements',
                category=GapCategory.MISSING_CONTENT,
                severity=GapSeverity.CRITICAL,
                description='No functional requirements defined',
                recommendation='Break down user stories into specific, testable functional requirements',
                location='spec.functional_requirements'
            ))
        elif len(spec.functional_requirements) < self.completeness_thresholds['requirements_min_count']:
            gaps.append(Gap(
                area='functional_requirements',
                category=GapCategory.INSUFFICIENT_DETAIL,
                severity=GapSeverity.HIGH,
                description=f'Insufficient functional requirements (current: {len(spec.functional_requirements)}, minimum: {self.completeness_thresholds["requirements_min_count"]})',
                recommendation=f'Add more functional requirements. Aim for at least {self.completeness_thresholds["requirements_min_count"]} requirements.',
                location='spec.functional_requirements'
            ))

        # Check constitution
        if not spec.constitution:
            gaps.append(Gap(
                area='constitution',
                category=GapCategory.MISSING_CONTENT,
                severity=GapSeverity.MEDIUM,
                description='No project constitution defined',
                recommendation='Add a project constitution with vision, tech stack, quality standards, and architectural principles',
                location='spec.constitution'
            ))
        else:
            # Check constitution components
            if not spec.constitution.vision:
                gaps.append(Gap(
                    area='constitution.vision',
                    category=GapCategory.MISSING_CONTENT,
                    severity=GapSeverity.MEDIUM,
                    description='No project vision defined',
                    recommendation='Add a clear, inspiring vision statement for the project',
                    location='spec.constitution.vision'
                ))

            if not spec.constitution.tech_stack:
                gaps.append(Gap(
                    area='constitution.tech_stack',
                    category=GapCategory.MISSING_CONTENT,
                    severity=GapSeverity.HIGH,
                    description='No tech stack defined',
                    recommendation='Specify the technology stack (frontend, backend, database, etc.)',
                    location='spec.constitution.tech_stack'
                ))

        return gaps

    def identify_detail_gaps(self, spec: StructuredSpec) -> List[Gap]:
        """
        Find gaps in detail and quality.

        Args:
            spec: The spec to analyze

        Returns:
            List of gaps for insufficient detail
        """
        gaps = []

        # Check user stories for acceptance criteria
        for story in spec.user_stories:
            if not story.acceptance_criteria or len(story.acceptance_criteria) < self.completeness_thresholds['acceptance_criteria_min_count']:
                gaps.append(Gap(
                    area='user_stories',
                    category=GapCategory.INSUFFICIENT_DETAIL,
                    severity=GapSeverity.MEDIUM,
                    description=f'User story "{story.id}" lacks sufficient acceptance criteria',
                    recommendation=f'Add at least {self.completeness_thresholds["acceptance_criteria_min_count"]} acceptance criteria for story "{story.id}"',
                    location=f'spec.user_stories.{story.id}',
                    context={'story_id': story.id}
                ))

        # Check functional requirements for acceptance tests
        for req in spec.functional_requirements:
            if not req.acceptance_tests or len(req.acceptance_tests) == 0:
                gaps.append(Gap(
                    area='functional_requirements',
                    category=GapCategory.TESTABILITY_ISSUE,
                    severity=GapSeverity.MEDIUM,
                    description=f'Functional requirement "{req.id}" lacks acceptance tests',
                    recommendation=f'Add acceptance tests for requirement "{req.id}" to make it testable',
                    location=f'spec.functional_requirements.{req.id}',
                    context={'requirement_id': req.id}
                ))

        # Check for vague language in overview
        vague_terms = ['some', 'various', 'multiple', 'several', 'etc.', 'things', 'stuff']
        for term in vague_terms:
            if spec.overview and term in spec.overview.lower():
                gaps.append(Gap(
                    area='overview',
                    category=GapCategory.AMBIGUITY,
                    severity=GapSeverity.LOW,
                    description=f'Vague term "{term}" found in overview',
                    recommendation=f'Replace "{term}" with specific, quantifiable details',
                    location='spec.overview',
                    context={'term': term}
                ))

        return gaps

    def prioritize_gaps(self, gaps: List[Gap]) -> List[Gap]:
        """
        Prioritize which gaps to fill first.

        Args:
            gaps: List of gaps to prioritize

        Returns:
            Sorted list of gaps by priority
        """
        # Define severity order
        severity_order = {
            GapSeverity.CRITICAL: 0,
            GapSeverity.HIGH: 1,
            GapSeverity.MEDIUM: 2,
            GapSeverity.LOW: 3
        }

        # Sort by severity
        return sorted(gaps, key=lambda g: severity_order[g.severity])

    def suggest_questions(self, gaps: List[Gap]) -> List[Dict[str, Any]]:
        """
        Suggest questions for addressing gaps.

        Args:
            gaps: List of gaps to address

        Returns:
            List of suggested questions
        """
        questions = []

        for gap in gaps:
            question = {
                'gap': gap.to_dict(),
                'question': self._generate_question_for_gap(gap),
                'priority': gap.severity.value,
                'area': gap.area,
                'category': gap.category.value
            }
            questions.append(question)

        return questions

    def _generate_question_for_gap(self, gap: Gap) -> str:
        """Generate a question to address a specific gap."""
        if gap.category == GapCategory.MISSING_CONTENT:
            return f"What information should we add to address: {gap.description}?"

        elif gap.category == GapCategory.INSUFFICIENT_DETAIL:
            return f"What additional details can we provide for: {gap.description}?"

        elif gap.category == GapCategory.INCONSISTENCY:
            return f"How can we resolve this inconsistency: {gap.description}?"

        elif gap.category == GapCategory.AMBIGUITY:
            return f"Can you clarify this ambiguous statement: {gap.description}?"

        elif gap.category == GapCategory.FEASIBILITY_CONCERN:
            return f"What feasibility concerns exist for: {gap.description}?"

        elif gap.category == GapCategory.TESTABILITY_ISSUE:
            return f"How can we make this testable: {gap.description}?"

        else:
            return f"Please address: {gap.description}"

    def analyze(self, spec: StructuredSpec) -> Dict[str, Any]:
        """
        Perform comprehensive gap analysis.

        Args:
            spec: The spec to analyze

        Returns:
            Analysis results with gaps and recommendations
        """
        # Reset gaps
        self.gaps = []

        # Identify all gaps
        missing_gaps = self.identify_missing_sections(spec)
        detail_gaps = self.identify_detail_gaps(spec)

        self.gaps.extend(missing_gaps)
        self.gaps.extend(detail_gaps)

        # Prioritize gaps
        prioritized_gaps = self.prioritize_gaps(self.gaps)

        # Calculate completeness
        completeness_score = self.analyze_completeness(spec)

        # Generate questions
        suggested_questions = self.suggest_questions(prioritized_gaps)

        return {
            'completeness_score': completeness_score,
            'total_gaps': len(self.gaps),
            'gaps_by_severity': self._count_gaps_by_severity(),
            'gaps_by_category': self._count_gaps_by_category(),
            'prioritized_gaps': [g.to_dict() for g in prioritized_gaps],
            'suggested_questions': suggested_questions
        }

    def _count_gaps_by_severity(self) -> Dict[str, int]:
        """Count gaps by severity level."""
        counts = {severity.value: 0 for severity in GapSeverity}
        for gap in self.gaps:
            counts[gap.severity.value] += 1
        return counts

    def _count_gaps_by_category(self) -> Dict[str, int]:
        """Count gaps by category."""
        counts = {category.value: 0 for category in GapCategory}
        for gap in self.gaps:
            counts[gap.category.value] += 1
        return counts


def main():
    """CLI entry point for gap analysis."""
    import argparse
    import json

    parser = argparse.ArgumentParser(
        description='Analyze specs for gaps and missing information'
    )
    parser.add_argument(
        'spec_file',
        help='Path to spec JSON file'
    )
    parser.add_argument(
        '--output',
        '-o',
        help='Output analysis file (JSON)'
    )
    parser.add_argument(
        '--questions',
        '-q',
        action='store_true',
        help='Generate suggested questions'
    )

    args = parser.parse_args()

    # Load spec
    spec = StructuredSpec.load(args.spec_file)

    # Analyze gaps
    analyzer = GapAnalyzer()
    analysis = analyzer.analyze(spec)

    # Print summary
    print(f"Gap Analysis for: {spec.project_name}")
    print(f"Completeness Score: {analysis['completeness_score']}%")
    print(f"Total Gaps: {analysis['total_gaps']}")
    print()
    print("Gaps by Severity:")
    for severity, count in analysis['gaps_by_severity'].items():
        if count > 0:
            print(f"  {severity.capitalize()}: {count}")
    print()
    print("Gaps by Category:")
    for category, count in analysis['gaps_by_category'].items():
        if count > 0:
            print(f"  {category.replace('_', ' ').title()}: {count}")

    # Save output if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(analysis, f, indent=2)
        print(f"\nAnalysis saved to: {args.output}")

    # Print questions if requested
    if args.questions:
        print("\nSuggested Questions:")
        for i, q in enumerate(analysis['suggested_questions'], 1):
            print(f"\n{i}. {q['question']}")
            print(f"   Priority: {q['priority'].capitalize()}")
            print(f"   Area: {q['area']}")


if __name__ == '__main__':
    main()
