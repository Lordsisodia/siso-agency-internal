#!/usr/bin/env python3
"""
Expectation Validator - Validate responses against expectations

This module provides validation capabilities to ensure agent responses
meet specified requirements and constraints.
"""

from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import re


@dataclass
class ValidationResult:
    """Result of validation"""
    is_valid: bool
    violations: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    satisfied_requirements: List[str] = field(default_factory=list)
    unsatisfied_requirements: List[str] = field(default_factory=list)
    compliance_score: float = 0.0


@dataclass
class Expectation:
    """Expectation specification"""
    required_keywords: List[str] = field(default_factory=list)
    required_patterns: List[str] = field(default_factory=list)
    excluded_keywords: List[str] = field(default_factory=list)
    excluded_patterns: List[str] = field(default_factory=list)
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    required_structure: List[str] = field(default_factory=list)
    custom_validators: List[str] = field(default_factory=list)


class ExpectationValidator:
    """
    Validate responses against expectations.

    Ensures agent responses meet specified requirements, constraints,
    and quality expectations.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize expectation validator.

        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.validation_history: List[Dict[str, Any]] = []

    def validate_output(self,
                       response: str,
                       expectation: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate output against expectations.

        Args:
            response: The response to validate
            expectation: Expectation specification

        Returns:
            Tuple of (is_valid, list of issues)
        """
        issues = []
        is_valid = True

        # Check requirements
        requirements_met, missing_requirements = self.check_requirements(
            response, expectation
        )

        if not requirements_met:
            is_valid = False
            issues.extend([f"Missing requirement: {req}" for req in missing_requirements])

        # Check constraints
        constraints_satisfied, constraint_violations = self.verify_constraints(
            response, expectation
        )

        if not constraints_satisfied:
            is_valid = False
            issues.extend([f"Constraint violated: {violation}" for violation in constraint_violations])

        return is_valid, issues

    def check_requirements(self,
                          response: str,
                          expectation: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Check requirements are met.

        Args:
            response: The response to check
            expectation: Expectation specification

        Returns:
            Tuple of (all_met, list of missing requirements)
        """
        missing = []

        # Check required keywords
        if 'required_keywords' in expectation:
            for keyword in expectation['required_keywords']:
                if keyword.lower() not in response.lower():
                    missing.append(f"Required keyword: {keyword}")

        # Check required patterns
        if 'required_patterns' in expectation:
            for pattern in expectation['required_patterns']:
                if not re.search(pattern, response, re.IGNORECASE):
                    missing.append(f"Required pattern: {pattern}")

        # Check required structure
        if 'required_structure' in expectation:
            for structure in expectation['required_structure']:
                if structure == 'code_blocks':
                    if '```' not in response:
                        missing.append("Required code blocks")
                elif structure == 'headers':
                    if not re.search(r'^#+\s', response, re.MULTILINE):
                        missing.append("Required headers")
                elif structure == 'lists':
                    if not re.search(r'(?:^|\n)[\-\*]\s', response):
                        missing.append("Required lists")
                elif structure == 'paragraphs':
                    if response.count('\n\n') < 2:
                        missing.append("Required paragraphs")

        return len(missing) == 0, missing

    def verify_constraints(self,
                          response: str,
                          expectation: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Verify constraints are satisfied.

        Args:
            response: The response to verify
            expectation: Expectation specification

        Returns:
            Tuple of (all_satisfied, list of violations)
        """
        violations = []

        # Check excluded keywords
        if 'excluded_keywords' in expectation:
            for keyword in expectation['excluded_keywords']:
                if keyword.lower() in response.lower():
                    violations.append(f"Excluded keyword found: {keyword}")

        # Check excluded patterns
        if 'excluded_patterns' in expectation:
            for pattern in expectation['excluded_patterns']:
                if re.search(pattern, response, re.IGNORECASE):
                    violations.append(f"Excluded pattern matched: {pattern}")

        # Check length constraints
        if 'min_length' in expectation:
            if len(response) < expectation['min_length']:
                violations.append(f"Response too short: {len(response)} < {expectation['min_length']}")

        if 'max_length' in expectation:
            if len(response) > expectation['max_length']:
                violations.append(f"Response too long: {len(response)} > {expectation['max_length']}")

        # Check file operation constraints
        if 'max_file_operations' in expectation:
            file_ops = response.count('file(') + response.count('open(') + response.count('write(')
            if file_ops > expectation['max_file_operations']:
                violations.append(f"Too many file operations: {file_ops} > {expectation['max_file_operations']}")

        # Check command execution constraints
        if 'allow_commands' in expectation and not expectation['allow_commands']:
            command_patterns = [
                r'os\.system',
                r'subprocess\.',
                r'exec\(',
                r'eval\(',
            ]
            for pattern in command_patterns:
                if re.search(pattern, response):
                    violations.append(f"Disallowed command pattern: {pattern}")

        return len(violations) == 0, violations

    def report_violations(self,
                         validation_result: ValidationResult,
                         response: str) -> str:
        """
        Generate a violation report.

        Args:
            validation_result: The validation result
            response: The response that was validated

        Returns:
            Formatted violation report
        """
        lines = [
            "# Validation Report",
            "",
            f"Valid: {validation_result.is_valid}",
            f"Compliance Score: {validation_result.compliance_score:.1%}",
            "",
        ]

        if validation_result.violations:
            lines.extend([
                "## Violations",
                ""
            ])
            for violation in validation_result.violations:
                lines.append(f"- {violation}")
            lines.append("")

        if validation_result.warnings:
            lines.extend([
                "## Warnings",
                ""
            ])
            for warning in validation_result.warnings:
                lines.append(f"- {warning}")
            lines.append("")

        if validation_result.unsatisfied_requirements:
            lines.extend([
                "## Unsatisfied Requirements",
                ""
            ])
            for req in validation_result.unsatisfied_requirements:
                lines.append(f"- {req}")
            lines.append("")

        if validation_result.satisfied_requirements:
            lines.extend([
                "## Satisfied Requirements",
                ""
            ])
            for req in validation_result.satisfied_requirements:
                lines.append(f"- {req}")
            lines.append("")

        return "\n".join(lines)

    def validate_comprehensive(self,
                               response: str,
                               expectation: Expectation) -> ValidationResult:
        """
        Perform comprehensive validation.

        Args:
            response: The response to validate
            expectation: Expectation object

        Returns:
            ValidationResult with full details
        """
        result = ValidationResult(
            is_valid=True,
            compliance_score=0.0
        )

        total_requirements = 0
        satisfied_count = 0

        # Check required keywords
        for keyword in expectation.required_keywords:
            total_requirements += 1
            if keyword.lower() in response.lower():
                result.satisfied_requirements.append(f"Keyword: {keyword}")
                satisfied_count += 1
            else:
                result.unsatisfied_requirements.append(f"Keyword: {keyword}")
                result.violations.append(f"Missing required keyword: {keyword}")

        # Check required patterns
        for pattern in expectation.required_patterns:
            total_requirements += 1
            if re.search(pattern, response, re.IGNORECASE):
                result.satisfied_requirements.append(f"Pattern: {pattern}")
                satisfied_count += 1
            else:
                result.unsatisfied_requirements.append(f"Pattern: {pattern}")
                result.violations.append(f"Missing required pattern: {pattern}")

        # Check excluded keywords
        for keyword in expectation.excluded_keywords:
            if keyword.lower() in response.lower():
                result.violations.append(f"Found excluded keyword: {keyword}")

        # Check excluded patterns
        for pattern in expectation.excluded_patterns:
            if re.search(pattern, response, re.IGNORECASE):
                result.violations.append(f"Found excluded pattern: {pattern}")

        # Check length constraints
        if expectation.min_length and len(response) < expectation.min_length:
            result.violations.append(f"Response too short: {len(response)} < {expectation.min_length}")

        if expectation.max_length and len(response) > expectation.max_length:
            result.violations.append(f"Response too long: {len(response)} > {expectation.max_length}")

        # Check required structure
        for structure in expectation.required_structure:
            total_requirements += 1
            if structure == 'code_blocks' and '```' in response:
                result.satisfied_requirements.append(f"Structure: {structure}")
                satisfied_count += 1
            elif structure == 'headers' and re.search(r'^#+\s', response, re.MULTILINE):
                result.satisfied_requirements.append(f"Structure: {structure}")
                satisfied_count += 1
            elif structure == 'lists' and re.search(r'(?:^|\n)[\-\*]\s', response):
                result.satisfied_requirements.append(f"Structure: {structure}")
                satisfied_count += 1
            else:
                result.unsatisfied_requirements.append(f"Structure: {structure}")

        # Calculate compliance score
        if total_requirements > 0:
            result.compliance_score = satisfied_count / total_requirements
        else:
            result.compliance_score = 1.0

        # Determine overall validity
        result.is_valid = (
            len(result.violations) == 0 and
            result.compliance_score >= 0.8
        )

        # Add warnings for partial compliance
        if 0.5 <= result.compliance_score < 0.8:
            result.warnings.append("Partial compliance - some requirements not met")

        # Store in history
        self.validation_history.append({
            'timestamp': self._get_timestamp(),
            'is_valid': result.is_valid,
            'compliance_score': result.compliance_score,
            'violations_count': len(result.violations),
        })

        return result

    def get_validation_stats(self) -> Dict[str, Any]:
        """Get statistics from validation history"""
        if not self.validation_history:
            return {'message': 'No validation history available'}

        recent = self.validation_history[-100:]  # Last 100 validations

        return {
            'total_validations': len(self.validation_history),
            'valid_rate': sum(1 for v in recent if v['is_valid']) / len(recent),
            'avg_compliance': sum(v['compliance_score'] for v in recent) / len(recent),
            'avg_violations': sum(v['violations_count'] for v in recent) / len(recent),
        }

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

    def create_expectation(self,
                          required_keywords: Optional[List[str]] = None,
                          required_patterns: Optional[List[str]] = None,
                          excluded_keywords: Optional[List[str]] = None,
                          excluded_patterns: Optional[List[str]] = None,
                          min_length: Optional[int] = None,
                          max_length: Optional[int] = None,
                          required_structure: Optional[List[str]] = None) -> Expectation:
        """
        Create an Expectation object.

        Args:
            required_keywords: Keywords that must be present
            required_patterns: Regex patterns that must match
            excluded_keywords: Keywords that must not be present
            excluded_patterns: Regex patterns that must not match
            min_length: Minimum response length
            max_length: Maximum response length
            required_structure: Required structural elements

        Returns:
            Expectation object
        """
        return Expectation(
            required_keywords=required_keywords or [],
            required_patterns=required_patterns or [],
            excluded_keywords=excluded_keywords or [],
            excluded_patterns=excluded_patterns or [],
            min_length=min_length,
            max_length=max_length,
            required_structure=required_structure or [],
        )
