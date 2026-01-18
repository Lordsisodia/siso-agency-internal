#!/usr/bin/env python3
"""
PRD Generator for Blackbox4
Command-line tool to generate PRDs from spec data.
"""

import argparse
import json
import os
import sys
from typing import Dict, Any, Optional
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from prd_helpers import (
    load_spec_from_json,
    load_spec_from_directory,
    generate_project_context,
    extract_user_stories,
    extract_requirements,
    extract_success_metrics,
    build_tech_stack_section
)


class PRDGenerator:
    """Generate PRD documents from templates and spec data."""

    def __init__(self, template_dir: Optional[str] = None):
        """
        Initialize PRD Generator.

        Args:
            template_dir: Directory containing template files
        """
        if template_dir is None:
            # Default to templates subdirectory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            template_dir = os.path.join(script_dir, 'templates')

        self.template_dir = template_dir
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, str]:
        """Load all available templates from template directory."""
        templates = {}

        if not os.path.exists(self.template_dir):
            print(f"Warning: Template directory not found: {self.template_dir}")
            return templates

        template_files = {
            'web-app': 'web-app-prd.md',
            'mobile-app': 'mobile-app-prd.md',
            'api-service': 'api-service-prd.md',
            'fullstack': 'fullstack-prd.md'
        }

        for key, filename in template_files.items():
            filepath = os.path.join(self.template_dir, filename)
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    templates[key] = f.read()
            else:
                print(f"Warning: Template file not found: {filepath}")

        return templates

    def list_templates(self) -> None:
        """Print available templates."""
        print("\nAvailable PRD Templates:")
        print("=" * 50)

        if not self.templates:
            print("No templates found.")
            return

        for key in self.templates.keys():
            print(f"  - {key}")

        print("\nUse --template <name> to select a template")

    def generate(
        self,
        spec_source: str,
        template_name: str,
        output_path: str,
        custom_vars: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Generate PRD from spec and template.

        Args:
            spec_source: Path to spec JSON file or directory
            template_name: Name of template to use
            output_path: Path to output PRD file
            custom_vars: Optional custom variables for template

        Returns:
            True if successful, False otherwise
        """
        # Validate template
        if template_name not in self.templates:
            print(f"Error: Template '{template_name}' not found.")
            print(f"Available templates: {', '.join(self.templates.keys())}")
            return False

        # Load spec data
        try:
            if os.path.isfile(spec_source):
                if spec_source.endswith('.json'):
                    spec_data = load_spec_from_json(spec_source)
                else:
                    print("Error: Spec file must be JSON format")
                    return False
            elif os.path.isdir(spec_source):
                spec_data = load_spec_from_directory(spec_source)
            else:
                print(f"Error: Spec source not found: {spec_source}")
                return False
        except Exception as e:
            print(f"Error loading spec: {e}")
            return False

        # Generate context
        context = generate_project_context(spec_data)

        # Add custom variables
        if custom_vars:
            context.update(custom_vars)

        # Get template
        template = self.templates[template_name]

        # Fill template
        prd_content = self._fill_template(template, context)

        # Write output
        try:
            os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
            with open(output_path, 'w') as f:
                f.write(prd_content)
            print(f"✓ PRD generated successfully: {output_path}")
            return True
        except Exception as e:
            print(f"Error writing PRD: {e}")
            return False

    def _fill_template(self, template: str, context: Dict[str, str]) -> str:
        """
        Fill template with context variables.

        Args:
            template: Template string with placeholders
            context: Dictionary of variable values

        Returns:
            Filled template string
        """
        result = template

        for key, value in context.items():
            placeholder = '{{' + key + '}}'
            result = result.replace(placeholder, str(value))

        # Warn about unfilled placeholders
        unfilled = [p[2:-2] for p in result.split('{{') if '}}' in p]
        if unfilled:
            print(f"Warning: Unfilled placeholders: {', '.join(set(unfilled))}")

        return result

    def validate(self, spec_source: str) -> bool:
        """
        Validate spec data for PRD generation.

        Args:
            spec_source: Path to spec JSON file or directory

        Returns:
            True if valid, False otherwise
        """
        print(f"\nValidating spec: {spec_source}")
        print("=" * 50)

        try:
            # Load spec
            if os.path.isfile(spec_source):
                if spec_source.endswith('.json'):
                    spec_data = load_spec_from_json(spec_source)
                else:
                    print("✗ Spec file must be JSON format")
                    return False
            elif os.path.isdir(spec_source):
                spec_data = load_spec_from_directory(spec_source)
            else:
                print(f"✗ Spec source not found: {spec_source}")
                return False

            # Validate required fields
            required_fields = ['name', 'description']
            missing_fields = []

            for field in required_fields:
                if not spec_data.get(field):
                    missing_fields.append(field)

            if missing_fields:
                print(f"✗ Missing required fields: {', '.join(missing_fields)}")
                return False

            # Check optional fields
            print("\n✓ Required fields present")

            user_stories = extract_user_stories(spec_data)
            if user_stories:
                print(f"✓ User stories found: {len(user_stories)}")
            else:
                print("⚠ No user stories found")

            requirements = extract_requirements(spec_data)
            if requirements['core']:
                print(f"✓ Requirements found: {len(requirements['core'])} core")
            else:
                print("⚠ No requirements found")

            if spec_data.get('tech_stack'):
                print("✓ Tech stack defined")
            else:
                print("⚠ No tech stack defined")

            print("\n✓ Spec is valid for PRD generation")
            return True

        except Exception as e:
            print(f"✗ Validation error: {e}")
            return False


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Generate PRDs from spec data using templates',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List available templates
  %(prog)s template-list

  # Validate a spec
  %(prog)s validate --spec .plans/my-project/spec.json

  # Generate a PRD
  %(prog)s generate --spec .plans/my-project/spec.json --template web-app --output prd.md

  # Generate with custom variables
  %(prog)s generate --spec spec.json --template fullstack --output prd.md \\
    --var "STATUS=In Progress" --var "VERSION=2.0.0"
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate PRD from spec')
    generate_parser.add_argument(
        '--spec', '-s',
        required=True,
        help='Path to spec JSON file or directory'
    )
    generate_parser.add_argument(
        '--template', '-t',
        required=True,
        help='Template name (web-app, mobile-app, api-service, fullstack)'
    )
    generate_parser.add_argument(
        '--output', '-o',
        required=True,
        help='Output PRD file path'
    )
    generate_parser.add_argument(
        '--var',
        action='append',
        help='Custom template variable (KEY=VALUE)'
    )

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate spec for PRD generation')
    validate_parser.add_argument(
        '--spec', '-s',
        required=True,
        help='Path to spec JSON file or directory'
    )

    # Template list command
    subparsers.add_parser('template-list', help='List available templates')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Initialize generator
    generator = PRDGenerator()

    # Execute command
    if args.command == 'generate':
        # Parse custom variables
        custom_vars = {}
        if args.var:
            for var in args.var:
                if '=' in var:
                    key, value = var.split('=', 1)
                    custom_vars[key] = value
                else:
                    print(f"Warning: Invalid variable format: {var}")

        success = generator.generate(
            spec_source=args.spec,
            template_name=args.template,
            output_path=args.output,
            custom_vars=custom_vars if custom_vars else None
        )
        return 0 if success else 1

    elif args.command == 'validate':
        success = generator.validate(args.spec)
        return 0 if success else 1

    elif args.command == 'template-list':
        generator.list_templates()
        return 0

    return 0


if __name__ == '__main__':
    sys.exit(main())
