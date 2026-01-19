"""
Validation Module for Structured Specs
Provides cross-artifact validation and consistency checking
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from pathlib import Path
import re


@dataclass
class ValidationError:
    """Represents a validation error."""
    level: str  # 'critical', 'warning', 'info'
    category: str  # 'overview', 'user_stories', 'constitution', etc.
    message: str
    suggestion: str = ""
    location: str = ""  # File or section where error was found


@dataclass
class ValidationResult:
    """Result of spec validation."""
    is_valid: bool
    errors: List[ValidationError] = field(default_factory=list)

    def add_error(self, level: str, category: str, message: str, suggestion: str = "", location: str = ""):
        """Add a validation error."""
        self.errors.append(ValidationError(
            level=level,
            category=category,
            message=message,
            suggestion=suggestion,
            location=location
        ))

        if level == 'critical':
            self.is_valid = False

    def get_errors_by_level(self, level: str) -> List[ValidationError]:
        """Get all errors of a specific level."""
        return [e for e in self.errors if e.level == level]

    def get_errors_by_category(self, category: str) -> List[ValidationError]:
        """Get all errors of a specific category."""
        return [e for e in self.errors if e.category == category]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'is_valid': self.is_valid,
            'errors': [
                {
                    'level': e.level,
                    'category': e.category,
                    'message': e.message,
                    'suggestion': e.suggestion,
                    'location': e.location
                }
                for e in self.errors
            ]
        }


class SpecValidator:
    """Validator for structured specifications."""

    def __init__(self):
        self.rules = {
            'overview_min_length': 50,
            'min_user_stories': 1,
            'require_acceptance_criteria': True,
            'require_constitution': False
        }

    def validate(self, spec: 'StructuredSpec') -> ValidationResult:
        """Validate a structured spec."""
        result = ValidationResult(is_valid=True)

        # Validate overview
        self._validate_overview(spec, result)

        # Validate user stories
        self._validate_user_stories(spec, result)

        # Validate constitution
        self._validate_constitution(spec, result)

        # Validate metadata
        self._validate_metadata(spec, result)

        return result

    def _validate_overview(self, spec: 'StructuredSpec', result: ValidationResult):
        """Validate project overview."""
        if not spec.overview:
            result.add_error(
                'critical',
                'overview',
                'Project overview is missing',
                'Add a brief project overview describing what the project does and its goals.'
            )
        elif len(spec.overview) < self.rules['overview_min_length']:
            result.add_error(
                'warning',
                'overview',
                f'Project overview is too short (minimum {self.rules["overview_min_length"]} characters)',
                'Expand the overview to provide more context about the project.'
            )

    def _validate_user_stories(self, spec: 'StructuredSpec', result: ValidationResult):
        """Validate user stories."""
        if len(spec.user_stories) < self.rules['min_user_stories']:
            result.add_error(
                'critical',
                'user_stories',
                f'No user stories defined (minimum {self.rules["min_user_stories"]})',
                'Add user stories to describe what users want to accomplish.'
            )

        for i, story in enumerate(spec.user_stories):
            # Check story ID
            if not story.id:
                result.add_error(
                    'warning',
                    'user_stories',
                    f'Story #{i+1} is missing an ID',
                    f'Assign a unique ID like US-{i+1:03d}'
                )

            # Check story components
            if not story.as_a:
                result.add_error(
                    'warning',
                    'user_stories',
                    f'Story {story.id or i+1} is missing the "as a" role',
                    'Specify who the user is'
                )

            if not story.i_want:
                result.add_error(
                    'warning',
                    'user_stories',
                    f'Story {story.id or i+1} is missing the "I want" goal',
                    'Specify what the user wants'
                )

            if not story.so_that:
                result.add_error(
                    'info',
                    'user_stories',
                    f'Story {story.id or i+1} is missing the "so that" benefit',
                    'Specify why the user wants this (provides context)'
                )

            # Check acceptance criteria
            if self.rules['require_acceptance_criteria'] and not story.acceptance_criteria:
                result.add_error(
                    'warning',
                    'user_stories',
                    f'Story {story.id or i+1} has no acceptance criteria',
                    'Add acceptance criteria to define when the story is complete'
                )

    def _validate_constitution(self, spec: 'StructuredSpec', result: ValidationResult):
        """Validate project constitution."""
        if not spec.constitution:
            result.add_error(
                'info',
                'constitution',
                'No project constitution defined',
                'Consider adding a constitution to define vision, tech stack, and principles'
            )
            return

        if not spec.constitution.vision:
            result.add_error(
                'warning',
                'constitution',
                'Constitution is missing a vision statement',
                'Add a vision statement to guide the project'
            )

        if not spec.constitution.tech_stack:
            result.add_error(
                'info',
                'constitution',
                'Tech stack not specified in constitution',
                'Document the technology choices for the project'
            )

        if not spec.constitution.quality_standards:
            result.add_error(
                'info',
                'constitution',
                'No quality standards defined in constitution',
                'Define quality standards to ensure consistent code quality'
            )

    def _validate_metadata(self, spec: 'StructuredSpec', result: ValidationResult):
        """Validate spec metadata."""
        if not spec.created_at:
            result.add_error(
                'warning',
                'metadata',
                'Creation timestamp is missing',
                'This should be auto-generated'
            )

    def validate_prd_vs_user_stories(self, prd_file: str, stories_file: str) -> List[ValidationError]:
        """
        Validate consistency between PRD and user stories.

        Args:
            prd_file: Path to PRD markdown file
            stories_file: Path to user stories markdown file

        Returns:
            List of validation errors
        """
        errors = []

        # Check if files exist
        prd_path = Path(prd_file)
        stories_path = Path(stories_file)

        if not prd_path.exists():
            errors.append(ValidationError(
                level='critical',
                category='file',
                message=f'PRD file not found: {prd_file}',
                suggestion='Create the PRD file or check the path',
                location=prd_file
            ))

        if not stories_path.exists():
            errors.append(ValidationError(
                level='critical',
                category='file',
                message=f'User stories file not found: {stories_file}',
                suggestion='Create the user stories file or check the path',
                location=stories_file
            ))

        if not prd_path.exists() or not stories_path.exists():
            return errors

        # Read files
        prd_content = prd_path.read_text()
        stories_content = stories_path.read_text()

        # Extract story IDs from user stories file
        story_ids = re.findall(r'(?:US|Story)[- ]?(\d+)', stories_content, re.IGNORECASE)

        # Check if PRD mentions user stories
        if 'User Stories' not in prd_content and 'user stories' not in prd_content.lower():
            errors.append(ValidationError(
                level='warning',
                category='consistency',
                message='PRD does not mention user stories',
                suggestion='Add a user stories section to the PRD',
                location=prd_file
            ))

        # Check if story IDs in PRD match those in stories file
        for story_id in story_ids:
            if story_id not in prd_content:
                errors.append(ValidationError(
                    level='info',
                    category='consistency',
                    message=f'Story {story_id} not mentioned in PRD',
                    suggestion=f'Add reference to story {story_id} in the PRD',
                    location=prd_file
                ))

        return errors

    def validate_requirements_vs_constitution(
        self,
        requirements_file: str,
        constitution_file: str
    ) -> List[ValidationError]:
        """
        Validate that requirements align with constitution.

        Args:
            requirements_file: Path to requirements markdown file
            constitution_file: Path to constitution markdown file

        Returns:
            List of validation errors
        """
        errors = []

        # Check if files exist
        req_path = Path(requirements_file)
        const_path = Path(constitution_file)

        if not req_path.exists():
            errors.append(ValidationError(
                level='critical',
                category='file',
                message=f'Requirements file not found: {requirements_file}',
                suggestion='Create the requirements file or check the path',
                location=requirements_file
            ))

        if not const_path.exists():
            errors.append(ValidationError(
                level='critical',
                category='file',
                message=f'Constitution file not found: {constitution_file}',
                suggestion='Create the constitution file or check the path',
                location=constitution_file
            ))

        if not req_path.exists() or not const_path.exists():
            return errors

        # Read files
        req_content = req_path.read_text()
        const_content = const_path.read_text()

        # Extract tech stack from constitution
        tech_stack_match = re.search(r'Tech Stack[:\s]*\n((?:-.*\n)*)', const_content, re.IGNORECASE)
        tech_stack = []
        if tech_stack_match:
            tech_stack = re.findall(r'-\s*\*\*([^*]+)\*\*:\s*([^\n]+)', tech_stack_match.group(1))

        # Check if requirements mention tech stack choices
        for tech, choice in tech_stack:
            if tech.lower() not in req_content.lower() and choice.lower() not in req_content.lower():
                errors.append(ValidationError(
                    level='info',
                    category='consistency',
                    message=f'Requirements do not mention {tech}: {choice}',
                    suggestion=f'Consider if requirements need to reference the use of {choice}',
                    location=requirements_file
                ))

        # Check if constitution quality standards are addressed in requirements
        quality_match = re.search(r'Quality Standards[:\s]*\n((?:-.*\n)*)', const_content, re.IGNORECASE)
        if quality_match:
            quality_standards = quality_match.group(1)
            if 'test' not in req_content.lower() and 'testing' not in req_content.lower():
                errors.append(ValidationError(
                    level='warning',
                    category='consistency',
                    message='Requirements do not mention testing',
                    suggestion='Add testing requirements to align with quality standards',
                    location=requirements_file
                ))

        return errors

    def validate_traceability(self, spec_dir: str) -> List[ValidationError]:
        """
        Validate traceability across all spec artifacts.

        Args:
            spec_dir: Path to directory containing spec files

        Returns:
            List of validation errors
        """
        errors = []
        spec_path = Path(spec_dir)

        if not spec_path.exists():
            errors.append(ValidationError(
                level='critical',
                category='file',
                message=f'Spec directory not found: {spec_dir}',
                suggestion='Create the spec directory or check the path',
                location=spec_dir
            ))
            return errors

        # Find all markdown files
        md_files = list(spec_path.glob('**/*.md'))

        if not md_files:
            errors.append(ValidationError(
                level='warning',
                category='completeness',
                message=f'No markdown files found in {spec_dir}',
                suggestion='Add spec artifacts (PRD, user stories, etc.)',
                location=spec_dir
            ))
            return errors

        # Collect all IDs and references from files
        all_ids = {}
        all_references = {}

        for md_file in md_files:
            content = md_file.read_text()

            # Extract story IDs
            story_ids = re.findall(r'(?:US|Story)[- ]?(\d+)', content, re.IGNORECASE)
            for story_id in story_ids:
                all_ids[f'US-{story_id}'] = str(md_file)

            # Extract requirement IDs
            req_ids = re.findall(r'(?:FR|Req|Requirement)[- ]?(\d+)', content, re.IGNORECASE)
            for req_id in req_ids:
                all_ids[f'FR-{req_id}'] = str(md_file)

            # Extract references
            references = re.findall(r'(?:US|FR|Story|Req)[-\s]?(\d+)', content, re.IGNORECASE)
            all_references[str(md_file)] = references

        # Check for orphaned references
        for file_path, refs in all_references.items():
            for ref in refs:
                ref_id = f'US-{ref}' if 'US' in ref.upper() else f'FR-{ref}'
                if ref_id not in all_ids:
                    errors.append(ValidationError(
                        level='warning',
                        category='traceability',
                        message = f'Orphaned reference to {ref_id}',
                        suggestion=f'Ensure {ref_id} is defined or remove the reference',
                        location=file_path
                    ))

        return errors

    def find_inconsistencies(self, spec: 'StructuredSpec') -> List[ValidationError]:
        """
        Find inconsistencies within the spec.

        Args:
            spec: StructuredSpec to validate

        Returns:
            List of validation errors
        """
        errors = []

        # Check if user stories have corresponding requirements
        story_ids = {story.id for story in spec.user_stories}
        req_ids = {req.id for req in spec.functional_requirements}

        # Check for orphaned requirements (no user story)
        for req in spec.functional_requirements:
            if req.dependencies:
                for dep in req.dependencies:
                    if dep not in story_ids and dep not in req_ids:
                        errors.append(ValidationError(
                            level='warning',
                            category='consistency',
                            message=f'Requirement {req.id} depends on undefined ID: {dep}',
                            suggestion=f'Ensure {dep} is defined or remove the dependency',
                            location=f'FR-{req.id}'
                        ))

        # Check tech stack consistency
        if spec.constitution and spec.constitution.tech_stack:
            # Check for contradictory tech choices
            backend = spec.constitution.tech_stack.get('backend', '').lower()
            frontend = spec.constitution.tech_stack.get('frontend', '').lower()

            if 'python' in backend and 'node' in frontend:
                # This is fine, just noting it
                pass

        return errors

    def generate_validation_report(self, spec: 'StructuredSpec' = None) -> str:
        """
        Generate a comprehensive validation report.

        Args:
            spec: Optional spec to validate

        Returns:
            Markdown formatted report
        """
        report = "# Validation Report\n\n"
        report += f"**Generated:** {spec.created_at if spec else 'N/A'}\n\n"

        if spec:
            result = self.validate(spec)

            report += f"## Summary\n\n"
            report += f"- Status: {'Valid' if result.is_valid else 'Invalid'}\n"
            report += f"- Total Issues: {len(result.errors)}\n"
            report += f"- Critical: {len(result.get_errors_by_level('critical'))}\n"
            report += f"- Warnings: {len(result.get_errors_by_level('warning'))}\n"
            report += f"- Info: {len(result.get_errors_by_level('info'))}\n\n"

            if result.errors:
                report += "## Issues\n\n"

                # Group by level
                for level in ['critical', 'warning', 'info']:
                    level_errors = result.get_errors_by_level(level)
                    if level_errors:
                        icon = "🔴" if level == 'critical' else "⚠️" if level == 'warning' else "ℹ️"
                        report += f"### {icon} {level.title()} Issues\n\n"

                        for error in level_errors:
                            report += f"**{error.category.title()}**\n"
                            report += f"- {error.message}\n"
                            if error.suggestion:
                                report += f"- *Suggestion:* {error.suggestion}\n"
                            if error.location:
                                report += f"- *Location:* {error.location}\n"
                            report += "\n"
            else:
                report += "No issues found!\n\n"

        return report

    def save_report(self, filepath: str, spec: 'StructuredSpec' = None) -> str:
        """
        Save validation report to file.

        Args:
            filepath: Path to save report
            spec: Optional spec to validate

        Returns:
            Path to saved report
        """
        report = self.generate_validation_report(spec)

        report_path = Path(filepath)
        report_path.parent.mkdir(parents=True, exist_ok=True)

        report_path.write_text(report)

        return str(report_path)

    def set_rule(self, rule_name: str, value: Any):
        """Set a validation rule."""
        if rule_name in self.rules:
            self.rules[rule_name] = value
        else:
            raise ValueError(f"Unknown rule: {rule_name}")

    def get_rule(self, rule_name: str) -> Any:
        """Get a validation rule value."""
        return self.rules.get(rule_name)
