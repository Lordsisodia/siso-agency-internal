#!/usr/bin/env python3
"""
Auto-Fix Module for Blackbox4 Validation
Automatically fixes common validation issues
"""

import sys
import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'spec-creation'))

from validation import ValidationError, ValidationResult
from spec_types import StructuredSpec, UserStory


class AutoFixer:
    """Automatically fixes common validation issues."""

    def __init__(self, dry_run: bool = False):
        """
        Initialize auto-fixer.
        dry_run: If True, don't actually make changes, just report what would be done
        """
        self.dry_run = dry_run
        self.fixes_applied: List[Dict[str, Any]] = []
        self.fixes_skipped: List[Dict[str, Any]] = []

    def fix_spec(self, spec: StructuredSpec, validation_result: ValidationResult) -> Tuple[StructuredSpec, List[Dict[str, Any]]]:
        """
        Apply all applicable fixes to a spec.
        Returns fixed spec and list of applied fixes.
        """
        self.fixes_applied = []
        self.fixes_skipped = []

        # Group errors by category
        errors_by_category = {}
        for error in validation_result.errors:
            if error.category not in errors_by_category:
                errors_by_category[error.category] = []
            errors_by_category[error.category].append(error)

        # Apply fixes by category
        for category, errors in errors_by_category.items():
            if category == 'metadata':
                self._fix_metadata(spec, errors)
            elif category == 'user_stories':
                self._fix_user_stories(spec, errors)
            elif category == 'requirements':
                self._fix_requirements(spec, errors)
            elif category == 'overview':
                self._fix_overview(spec, errors)

        return spec, self.fixes_applied

    def fix_missing_ids(self, spec: StructuredSpec) -> List[str]:
        """
        Add missing IDs to user stories and requirements.
        Returns list of fixed IDs.
        """
        fixed_ids = []

        # Fix user story IDs
        for i, story in enumerate(spec.user_stories):
            if not story.id:
                new_id = f"US-{i+1:03d}"
                if not self.dry_run:
                    story.id = new_id
                fixed_ids.append(new_id)
                self._record_fix('user_story', f'Added ID: {new_id}', f'Story #{i+1}')

        # Fix requirement IDs
        for i, req in enumerate(spec.functional_requirements):
            if not req.id:
                new_id = f"FR-{i+1:03d}"
                if not self.dry_run:
                    req.id = new_id
                fixed_ids.append(new_id)
                self._record_fix('requirement', f'Added ID: {new_id}', f'Requirement #{i+1}')

        return fixed_ids

    def fix_formatting(self, content: str) -> str:
        """
        Fix common formatting issues.
        Returns fixed content.
        """
        if not content:
            return content

        fixed_content = content

        # Fix multiple consecutive spaces
        fixed_content = re.sub(r'  +', ' ', fixed_content)

        # Fix multiple consecutive newlines (limit to 2)
        fixed_content = re.sub(r'\n\n\n+', '\n\n', fixed_content)

        # Fix spacing around punctuation
        fixed_content = re.sub(r'(\w)\s+([.,!?:;])', r'\1\2', fixed_content)

        # Fix spacing after opening parenthesis and before closing
        fixed_content = re.sub(r'\(\s+', '(', fixed_content)
        fixed_content = re.sub(r'\s+\)', ')', fixed_content)

        # Fix trailing whitespace on lines
        lines = fixed_content.split('\n')
        lines = [line.rstrip() for line in lines]
        fixed_content = '\n'.join(lines)

        return fixed_content

    def normalize_priorities(self, spec: StructuredSpec) -> Dict[str, str]:
        """
        Normalize priority values to standard format.
        Returns mapping of old to new priority values.
        """
        priority_map = {
            'must-have': 'must',
            'musthave': 'must',
            'high': 'must',
            'should-have': 'should',
            'shouldhave': 'should',
            'medium': 'should',
            'could-have': 'could',
            'couldhave': 'could',
            'low': 'could',
            'won\'t': 'wont',
            'wont': 'wont',
            'never': 'wont'
        }

        normalized = {}
        valid_priorities = {'must', 'should', 'could', 'wont'}

        # Normalize user story priorities
        for story in spec.user_stories:
            if hasattr(story, 'priority') and story.priority:
                old_priority = story.priority
                new_priority = priority_map.get(old_priority.lower(), old_priority.lower())

                if new_priority in valid_priorities:
                    if not self.dry_run:
                        story.priority = new_priority
                    normalized[story.id] = f'{old_priority} -> {new_priority}'
                    self._record_fix('priority', f'Normalized priority: {old_priority} -> {new_priority}', story.id)

        return normalized

    def suggest_fixes(self, validation_result: ValidationResult) -> List[Dict[str, str]]:
        """
        Suggest fixes for non-auto-fixable issues.
        Returns list of suggestions.
        """
        suggestions = []

        for error in validation_result.errors:
            suggestion = {
                'issue': error.message,
                'category': error.category,
                'level': error.level,
                'suggestion': error.suggestion or 'Manual review required'
            }

            # Add specific guidance based on category
            if error.category == 'overview' and 'too short' in error.message.lower():
                suggestion['guidance'] = """
                Expand your overview to include:
                1. Project purpose and goals
                2. Target users or audience
                3. Key features or capabilities
                4. Business value or outcomes
                Aim for at least 50-100 words.
                """

            elif error.category == 'user_stories' and 'missing' in error.message.lower():
                suggestion['guidance'] = """
                Complete user stories using the format:
                As a <role>
                I want <goal>
                So that <benefit>

                Add acceptance criteria with:
                Given <context>
                When <action>
                Then <outcome>
                """

            elif error.category == 'constitution' and 'missing' in error.message.lower():
                suggestion['guidance'] = """
                Add a project constitution with:
                1. Vision statement (2-3 sentences)
                2. Tech stack decisions with rationale
                3. Quality standards (code quality, testing, documentation)
                4. Architectural principles (SOLID, DRY, etc.)
                """

            suggestions.append(suggestion)

        return suggestions

    # Private methods

    def _fix_metadata(self, spec: StructuredSpec, errors: List[ValidationError]) -> None:
        """Fix metadata issues."""
        for error in errors:
            if 'timestamp' in error.message.lower():
                if not self.dry_run:
                    spec.created_at = datetime.now().isoformat()
                self._record_fix('metadata', 'Added creation timestamp', 'spec')

    def _fix_user_stories(self, spec: StructuredSpec, errors: List[ValidationError]) -> None:
        """Fix user story issues."""
        for error in errors:
            if 'missing an ID' in error.message.lower():
                # Extract story index
                match = re.search(r'Story #(\d+)', error.message)
                if match:
                    index = int(match.group(1)) - 1
                    if 0 <= index < len(spec.user_stories):
                        new_id = f"US-{index+1:03d}"
                        if not self.dry_run:
                            spec.user_stories[index].id = new_id
                        self._record_fix('user_story', f'Added ID: {new_id}', f'Story #{index+1}')

    def _fix_requirements(self, spec: StructuredSpec, errors: List[ValidationError]) -> None:
        """Fix requirement issues."""
        for error in errors:
            if 'missing ID' in error.message.lower():
                # Extract requirement index
                match = re.search(r'Requirement #(\d+)', error.message)
                if match:
                    index = int(match.group(1)) - 1
                    if 0 <= index < len(spec.functional_requirements):
                        new_id = f"FR-{index+1:03d}"
                        if not self.dry_run:
                            spec.functional_requirements[index].id = new_id
                        self._record_fix('requirement', f'Added ID: {new_id}', f'Requirement #{index+1}')

    def _fix_overview(self, spec: StructuredSpec, errors: List[ValidationError]) -> None:
        """Fix overview issues."""
        for error in errors:
            if 'formatting' in error.message.lower() or 'spacing' in error.message.lower():
                if spec.overview:
                    fixed = self.fix_formatting(spec.overview)
                    if not self.dry_run:
                        spec.overview = fixed
                    self._record_fix('overview', 'Fixed formatting', 'overview')

    def _record_fix(self, category: str, action: str, target: str) -> None:
        """Record a fix that was applied."""
        self.fixes_applied.append({
            'category': category,
            'action': action,
            'target': target,
            'timestamp': datetime.now().isoformat()
        })

    def _record_skip(self, category: str, reason: str, target: str) -> None:
        """Record a fix that was skipped."""
        self.fixes_skipped.append({
            'category': category,
            'reason': reason,
            'target': target,
            'timestamp': datetime.now().isoformat()
        })

    def get_fix_report(self) -> Dict[str, Any]:
        """Get a report of all fixes applied and skipped."""
        return {
            'applied': self.fixes_applied,
            'skipped': self.fixes_skipped,
            'summary': {
                'total_applied': len(self.fixes_applied),
                'total_skipped': len(self.fixes_skipped),
                'categories_affected': list(set(f['category'] for f in self.fixes_applied))
            }
        }


def main():
    """Command-line interface for auto-fix."""
    import argparse

    parser = argparse.ArgumentParser(description='Auto-Fix Validation Issues')
    parser.add_argument('spec_file', help='Path to spec JSON file')
    parser.add_argument('--dry-run', '-d', action='store_true',
                       help='Show what would be fixed without making changes')
    parser.add_argument('--output', '-o', help='Output file for fixed spec')
    parser.add_argument('--report', '-r', help='Output file for fix report')

    args = parser.parse_args()

    # Load spec
    spec_path = Path(args.spec_file)
    if not spec_path.exists():
        print(f"Error: Spec file not found: {spec_path}")
        sys.exit(1)

    with open(spec_path, 'r') as f:
        spec_data = json.load(f)

    spec = StructuredSpec.from_dict(spec_data)

    # Create auto-fixer
    fixer = AutoFixer(dry_run=args.dry_run)

    # Apply fixes
    print("Applying auto-fixes...")

    # Fix missing IDs
    fixed_ids = fixer.fix_missing_ids(spec)
    print(f"  Fixed {len(fixed_ids)} missing IDs")

    # Normalize priorities
    normalized = fixer.normalize_priorities(spec)
    print(f"  Normalized {len(normalized)} priorities")

    # Fix formatting in overview
    if spec.overview:
        original_overview = spec.overview
        spec.overview = fixer.fix_formatting(spec.overview)
        if spec.overview != original_overview:
            print(f"  Fixed formatting in overview")

    # Get fix report
    report = fixer.get_fix_report()

    print(f"\nSummary:")
    print(f"  Fixes applied: {report['summary']['total_applied']}")
    print(f"  Categories affected: {', '.join(report['summary']['categories_affected'])}")

    # Save fixed spec
    if not args.dry_run:
        output_path = args.output or spec_path
        spec.save(str(output_path))
        print(f"\nFixed spec saved to: {output_path}")

    # Save fix report
    if args.report:
        with open(args.report, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Fix report saved to: {args.report}")

    if args.dry_run:
        print("\n[DRY RUN] No changes were made")


if __name__ == '__main__':
    main()
