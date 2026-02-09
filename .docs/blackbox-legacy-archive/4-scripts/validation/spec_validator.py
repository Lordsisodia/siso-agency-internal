#!/usr/bin/env python3
"""
Enhanced Spec Validator for Blackbox4
Extends base validation.py with comprehensive validation capabilities
"""

import sys
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

from validation import SpecValidator, ValidationResult, ValidationError
from spec_types import StructuredSpec, UserStory, FunctionalRequirement


class EnhancedSpecValidator(SpecValidator):
    """Enhanced validator with comprehensive validation rules."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize validator with optional configuration."""
        super().__init__()
        self.config = config or {}
        self.scores = {
            'completeness': 0.0,
            'consistency': 0.0,
            'quality': 0.0,
            'overall': 0.0
        }

    def validate_spec(self, spec: StructuredSpec) -> ValidationResult:
        """
        Main validation entry point.
        Performs comprehensive validation and returns detailed report.
        """
        result = ValidationResult(is_valid=True)

        # Run all validation checks
        self.validate_completeness(spec, result)
        self.validate_consistency(spec, result)
        self.validate_quality(spec, result)

        # Calculate scores
        self._calculate_scores(result)

        return result

    def validate_completeness(self, spec: StructuredSpec, result: ValidationResult) -> None:
        """
        Check all required fields are present and populated.
        """
        completeness_score = 0.0
        total_checks = 0
        passed_checks = 0

        # Check project metadata
        total_checks += 1
        if spec.project_name:
            passed_checks += 1
        else:
            result.add_error('critical', 'metadata',
                           'Project name is missing',
                           'Add a project name to identify this specification')

        total_checks += 1
        if spec.created_at:
            passed_checks += 1
        else:
            result.add_error('warning', 'metadata',
                           'Creation timestamp is missing',
                           'Timestamp should be auto-generated')

        # Check overview
        total_checks += 1
        if spec.overview and len(spec.overview) >= 50:
            passed_checks += 1
        elif spec.overview:
            result.add_error('warning', 'overview',
                           f'Overview is too short ({len(spec.overview)} chars, min 50)',
                           'Expand the overview with more details about the project')
        else:
            result.add_error('critical', 'overview',
                           'Overview is missing',
                           'Add a comprehensive overview describing the project')

        # Check user stories
        total_checks += 1
        if spec.user_stories and len(spec.user_stories) >= 1:
            passed_checks += 1
        else:
            result.add_error('critical', 'user_stories',
                           'No user stories defined',
                           'Add at least one user story to describe user goals')

        # Validate each user story completeness
        for i, story in enumerate(spec.user_stories):
            if not story.id:
                result.add_error('warning', 'user_stories',
                               f'Story #{i+1} missing ID',
                               f'Assign ID like US-{i+1:03d}')

            if not story.as_a:
                result.add_error('warning', 'user_stories',
                               f'Story {story.id or i+1} missing "as a" role',
                               'Specify who the user is')

            if not story.i_want:
                result.add_error('warning', 'user_stories',
                               f'Story {story.id or i+1} missing "I want" goal',
                               'Specify what the user wants')

            if not story.so_that:
                result.add_error('info', 'user_stories',
                               f'Story {story.id or i+1} missing "so that" benefit',
                               'Specify why the user wants this')

            if not story.acceptance_criteria:
                result.add_error('warning', 'user_stories',
                               f'Story {story.id or i+1} has no acceptance criteria',
                               'Add acceptance criteria to define completion')

        # Check functional requirements
        total_checks += 1
        if spec.functional_requirements and len(spec.functional_requirements) >= 1:
            passed_checks += 1
        else:
            result.add_error('info', 'requirements',
                           'No functional requirements defined',
                           'Consider adding functional requirements for clarity')

        # Check constitution
        total_checks += 1
        if spec.constitution:
            passed_checks += 1
            if spec.constitution:
                if not spec.constitution.vision:
                    result.add_error('info', 'constitution',
                                   'No vision statement in constitution',
                                   'Add a vision to guide the project')
                if not spec.constitution.tech_stack:
                    result.add_error('info', 'constitution',
                                   'No tech stack specified',
                                   'Document technology choices')
        else:
            result.add_error('info', 'constitution',
                           'No project constitution defined',
                           'Consider adding a constitution for project guidance')

        # Calculate completeness score
        if total_checks > 0:
            completeness_score = (passed_checks / total_checks) * 100

        self.scores['completeness'] = completeness_score
        result.metadata = {'completeness_score': completeness_score}

    def validate_consistency(self, spec: StructuredSpec, result: ValidationResult) -> None:
        """
        Check internal consistency of the specification.
        """
        consistency_score = 0.0
        total_checks = 0
        passed_checks = 0

        # Check user story ID uniqueness
        total_checks += 1
        story_ids = [s.id for s in spec.user_stories if s.id]
        if len(story_ids) == len(set(story_ids)):
            passed_checks += 1
        else:
            duplicates = [id for id in story_ids if story_ids.count(id) > 1]
            result.add_error('critical', 'user_stories',
                           f'Duplicate story IDs found: {set(duplicates)}',
                           'Ensure each story has a unique ID')

        # Check requirement ID uniqueness
        total_checks += 1
        req_ids = [r.id for r in spec.functional_requirements if r.id]
        if len(req_ids) == len(set(req_ids)):
            passed_checks += 1
        else:
            duplicates = [id for id in req_ids if req_ids.count(id) > 1]
            result.add_error('critical', 'requirements',
                           f'Duplicate requirement IDs found: {set(duplicates)}',
                           'Ensure each requirement has a unique ID')

        # Check story ID format
        total_checks += 1
        invalid_ids = [s.id for s in spec.user_stories if s.id and not re.match(r'^US-\d+$', str(s.id))]
        if not invalid_ids:
            passed_checks += 1
        else:
            result.add_error('warning', 'user_stories',
                           f'Invalid story ID formats: {invalid_ids[:3]}',
                           'Use format US-001, US-002, etc.')

        # Check requirement ID format
        total_checks += 1
        invalid_req_ids = [r.id for r in spec.functional_requirements
                          if r.id and not re.match(r'^FR-\d+$', str(r.id))]
        if not invalid_req_ids:
            passed_checks += 1
        else:
            result.add_error('warning', 'requirements',
                           f'Invalid requirement ID formats: {invalid_req_ids[:3]}',
                           'Use format FR-001, FR-002, etc.')

        # Check priority consistency
        total_checks += 1
        valid_priorities = {'must', 'should', 'could', 'wont'}
        stories_with_priority = [s for s in spec.user_stories if hasattr(s, 'priority') and s.priority]
        if stories_with_priority:
            invalid_priorities = [s.priority for s in stories_with_priority if s.priority not in valid_priorities]
            if not invalid_priorities:
                passed_checks += 1
            else:
                result.add_error('warning', 'user_stories',
                               f'Invalid priority values: {set(invalid_priorities)}',
                               f'Use priorities: {", ".join(valid_priorities)}')

        # Check for circular references in dependencies
        total_checks += 1
        if self._check_circular_dependencies(spec):
            result.add_error('critical', 'dependencies',
                           'Circular dependencies detected',
                           'Resolve circular dependencies in stories/requirements')
        else:
            passed_checks += 1

        # Calculate consistency score
        if total_checks > 0:
            consistency_score = (passed_checks / total_checks) * 100

        self.scores['consistency'] = consistency_score
        if hasattr(result, 'metadata'):
            result.metadata['consistency_score'] = consistency_score

    def validate_quality(self, spec: StructuredSpec, result: ValidationResult) -> None:
        """
        Check quality of content.
        """
        quality_score = 0.0
        total_checks = 0
        passed_checks = 0

        # Check overview quality
        total_checks += 1
        if spec.overview:
            word_count = len(spec.overview.split())
            if word_count >= 20:
                passed_checks += 1
            else:
                result.add_error('warning', 'overview',
                               f'Overview too brief ({word_count} words)',
                               'Expand overview to provide better context')

        # Check for vague terms in user stories
        total_checks += 1
        vague_terms = ['etc', 'various', 'multiple', 'several', 'some', 'maybe', 'might']
        vague_found = []
        for story in spec.user_stories:
            text = f"{story.as_a} {story.i_want} {story.so_that}".lower()
            for term in vague_terms:
                if term in text and term not in vague_found:
                    vague_found.append(term)

        if not vague_found:
            passed_checks += 1
        else:
            result.add_error('info', 'user_stories',
                           f'Vague terms found: {", ".join(vague_found[:5])}',
                           'Be specific in user stories - avoid vague language')

        # Check acceptance criteria quality
        total_checks += 1
        stories_with_ac = [s for s in spec.user_stories if s.acceptance_criteria]
        if stories_with_ac:
            avg_ac = sum(len(s.acceptance_criteria) for s in stories_with_ac) / len(stories_with_ac)
            if avg_ac >= 2:
                passed_checks += 1
            else:
                result.add_error('info', 'user_stories',
                               f'Low average acceptance criteria ({avg_ac:.1f} per story)',
                               'Add more acceptance criteria for better definition')

        # Check for SMART goals in user stories
        total_checks += 1
        measurable_stories = 0
        for story in spec.user_stories:
            if story.acceptance_criteria and len(story.acceptance_criteria) >= 2:
                measurable_stories += 1

        if spec.user_stories and measurable_stories / len(spec.user_stories) >= 0.5:
            passed_checks += 1
        else:
            ratio = measurable_stories / len(spec.user_stories) if spec.user_stories else 0
            result.add_error('info', 'user_stories',
                           f'Only {ratio*100:.0f}% stories have measurable criteria',
                           'Add acceptance criteria to make stories measurable')

        # Calculate quality score
        if total_checks > 0:
            quality_score = (passed_checks / total_checks) * 100

        self.scores['quality'] = quality_score
        if hasattr(result, 'metadata'):
            result.metadata['quality_score'] = quality_score

    def _calculate_scores(self, result: ValidationResult) -> None:
        """
        Calculate overall score from individual scores.
        """
        completeness = self.scores.get('completeness', 0)
        consistency = self.scores.get('consistency', 0)
        quality = self.scores.get('quality', 0)

        # Weighted average (completeness is most important)
        overall = (completeness * 0.4 + consistency * 0.3 + quality * 0.3)
        self.scores['overall'] = overall

        if hasattr(result, 'metadata'):
            result.metadata['overall_score'] = overall

    def _check_circular_dependencies(self, spec: StructuredSpec) -> bool:
        """
        Check for circular dependencies in user stories.
        Returns True if circular dependencies found.
        """
        # Build dependency graph
        graph = {}
        for story in spec.user_stories:
            if story.id:
                graph[story.id] = story.dependencies if hasattr(story, 'dependencies') and story.dependencies else []

        # Detect cycles using DFS
        visited = set()
        rec_stack = set()

        def dfs(node):
            visited.add(node)
            rec_stack.add(node)

            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True

            rec_stack.remove(node)
            return False

        for node in graph:
            if node not in visited:
                if dfs(node):
                    return True

        return False

    def get_scores(self) -> Dict[str, float]:
        """
        Get validation scores.
        """
        return self.scores.copy()

    def get_report_summary(self, result: ValidationResult) -> Dict[str, Any]:
        """
        Get a summary of the validation report.
        """
        critical = len(result.get_errors_by_level('critical'))
        warnings = len(result.get_errors_by_level('warning'))
        info = len(result.get_errors_by_level('info'))

        return {
            'is_valid': result.is_valid,
            'total_issues': len(result.errors),
            'critical': critical,
            'warnings': warnings,
            'info': info,
            'scores': self.get_scores(),
            'categories': self._get_category_breakdown(result)
        }

    def _get_category_breakdown(self, result: ValidationResult) -> Dict[str, int]:
        """
        Get issue count by category.
        """
        categories = {}
        for error in result.errors:
            categories[error.category] = categories.get(error.category, 0) + 1
        return categories


def main():
    """Command-line interface for spec validation."""
    import argparse

    parser = argparse.ArgumentParser(description='Enhanced Spec Validator')
    parser.add_argument('spec_file', help='Path to spec JSON file')
    parser.add_argument('--format', '-f', choices=['text', 'json'],
                       default='text', help='Output format')
    parser.add_argument('--output', '-o', help='Output file for report')

    args = parser.parse_args()

    # Load spec
    spec_path = Path(args.spec_file)
    if not spec_path.exists():
        print(f"Error: Spec file not found: {spec_path}")
        sys.exit(1)

    # Create spec object
    spec = StructuredSpec.load(str(spec_path))

    # Validate
    validator = EnhancedSpecValidator()
    result = validator.validate_spec(spec)

    # Generate report
    summary = validator.get_report_summary(result)

    if args.format == 'json':
        import json
        report = {
            'summary': summary,
            'errors': [e.__dict__ for e in result.errors]
        }
        output = json.dumps(report, indent=2)
    else:
        output = f"""
Validation Report for: {spec.project_name}
{'=' * 60}

Overall Score: {summary['scores']['overall']:.1f}%
  - Completeness: {summary['scores']['completeness']:.1f}%
  - Consistency: {summary['scores']['consistency']:.1f}%
  - Quality: {summary['scores']['quality']:.1f}%

Issues Found:
  Critical: {summary['critical']}
  Warnings: {summary['warnings']}
  Info: {summary['info']}

Details:
"""
        for error in result.errors:
            output += f"\n  [{error.level.upper()}] {error.category}\n"
            output += f"    {error.message}\n"
            if error.suggestion:
                output += f"    Suggestion: {error.suggestion}\n"

    # Output report
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Report saved to: {args.output}")
    else:
        print(output)

    # Exit with appropriate code
    sys.exit(0 if result.is_valid else 1)


if __name__ == '__main__':
    main()
