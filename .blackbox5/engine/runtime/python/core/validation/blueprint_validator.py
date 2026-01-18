#!/usr/bin/env python3
"""
Blueprint Validator
Validates blueprint artifacts for completeness and correctness
"""

from pathlib import Path
from typing import Dict, Any, List


class BlueprintValidator:
    """Validates blueprint artifacts"""

    def __init__(self, blackbox_root: Path):
        self.blackbox_root = Path(blackbox_root)
        self.schema_path = self.blackbox_root / "shared" / "schemas" / "blueprint.yaml"

    def validate(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate blueprint against schema

        Returns:
            {
                "valid": bool,
                "errors": List[str],
                "warnings": List[str]
            }
        """
        errors = []
        warnings = []

        # Check top-level structure
        if 'blueprint' not in blueprint:
            errors.append("Missing top-level 'blueprint' key")
            return {"valid": False, "errors": errors, "warnings": warnings}

        bp = blueprint['blueprint']

        # Validate required sections
        required_sections = ['metadata', 'requirements', 'design', 'implementation', 'validation']
        for section in required_sections:
            if section not in bp:
                errors.append(f"Missing required section: {section}")

        # Validate metadata
        if 'metadata' in bp:
            metadata = bp['metadata']
            required_metadata = ['version', 'blueprint_type', 'name', 'created_by', 'created_at']
            for field in required_metadata:
                if field not in metadata:
                    errors.append(f"Missing metadata field: {field}")

            # Validate blueprint_type
            valid_types = ['feature', 'bugfix', 'refactor', 'research']
            if metadata.get('blueprint_type') not in valid_types:
                errors.append(f"Invalid blueprint_type: {metadata.get('blueprint_type')}. Must be one of {valid_types}")

        # Validate requirements
        if 'requirements' in bp:
            requirements = bp['requirements']

            # Check user stories
            if 'user_stories' in requirements:
                for i, story in enumerate(requirements['user_stories']):
                    if not isinstance(story, dict):
                        errors.append(f"User story {i} is not a dictionary")
                        continue

                    required_story_fields = ['id', 'title', 'priority']
                    for field in required_story_fields:
                        if field not in story:
                            errors.append(f"User story {i} missing field: {field}")

                    # Validate priority
                    valid_priorities = ['high', 'medium', 'low']
                    if story.get('priority') not in valid_priorities:
                        warnings.append(f"User story {story.get('id', i)} has invalid priority: {story.get('priority')}")
            else:
                warnings.append("No user stories defined")

            # Check constraints
            if 'constraints' not in requirements or not requirements['constraints']:
                warnings.append("No constraints defined")

        # Validate design
        if 'design' in bp:
            design = bp['design']

            # Check architecture
            if 'architecture' not in design:
                warnings.append("No architecture defined")
            elif not isinstance(design['architecture'], dict):
                errors.append("Architecture must be a dictionary")
            else:
                if 'overview' not in design['architecture']:
                    warnings.append("Architecture overview missing")

            # Check file structure
            if 'file_structure' in design:
                file_structure = design['file_structure']

                if 'create' not in file_structure and 'modify' not in file_structure:
                    warnings.append("File structure defined but no files to create or modify")

                # Validate file paths
                for path in file_structure.get('create', []):
                    if not isinstance(path, str) or not path.strip():
                        errors.append(f"Invalid file path in create: {path}")

                for path in file_structure.get('modify', []):
                    if not isinstance(path, str) or not path.strip():
                        errors.append(f"Invalid file path in modify: {path}")

        # Validate implementation
        if 'implementation' in bp:
            implementation = bp['implementation']

            # Check tasks
            if 'tasks' in implementation:
                for i, task in enumerate(implementation['tasks']):
                    if not isinstance(task, dict):
                        errors.append(f"Task {i} is not a dictionary")
                        continue

                    if 'id' not in task:
                        errors.append(f"Task {i} missing id")
                    if 'title' not in task:
                        errors.append(f"Task {i} missing title")

            else:
                warnings.append("No implementation tasks defined")

        # Validate validation section
        if 'validation' in bp:
            validation = bp['validation']

            # Check success criteria
            if 'success_criteria' not in validation or not validation['success_criteria']:
                warnings.append("No success criteria defined")

            # Check test cases
            if 'test_cases' not in validation or not validation['test_cases']:
                warnings.append("No test cases defined")
            else:
                for i, test in enumerate(validation['test_cases']):
                    if not isinstance(test, dict):
                        errors.append(f"Test case {i} is not a dictionary")
                        continue

                    required_test_fields = ['scenario', 'given', 'when', 'then']
                    for field in required_test_fields:
                        if field not in test:
                            warnings.append(f"Test case {i} missing field: {field}")

        # Determine overall validity
        valid = len(errors) == 0

        return {
            "valid": valid,
            "errors": errors,
            "warnings": warnings
        }

    def validate_against_schema(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate blueprint against schema file

        Returns:
            Validation result with errors and warnings
        """
        if not self.schema_path.exists():
            return {
                "valid": False,
                "errors": [f"Schema file not found: {self.schema_path}"],
                "warnings": []
            }

        # Load schema
        import yaml
        with open(self.schema_path, 'r') as f:
            schema = yaml.safe_load(f)

        # For now, just use basic validation
        # TODO: Implement full schema validation
        return self.validate(blueprint)

    def get_validation_report(self, blueprint: Dict[str, Any]) -> str:
        """Get human-readable validation report"""
        result = self.validate(blueprint)

        report = ["Blueprint Validation Report", "=" * 50, ""]

        if result['valid']:
            report.append("✅ VALIDATION PASSED")
        else:
            report.append("❌ VALIDATION FAILED")

        report.append("")

        if result['errors']:
            report.append(f"Errors ({len(result['errors'])}):")
            for error in result['errors']:
                report.append(f"  ❌ {error}")
            report.append("")

        if result['warnings']:
            report.append(f"Warnings ({len(result['warnings'])}):")
            for warning in result['warnings']:
                report.append(f"  ⚠️  {warning}")
            report.append("")

        if result['valid'] and not result['warnings']:
            report.append("✅ Blueprint is complete and ready for build phase")

        return "\n".join(report)
