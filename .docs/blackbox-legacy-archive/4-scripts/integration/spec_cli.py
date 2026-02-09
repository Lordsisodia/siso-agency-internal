#!/usr/bin/env python3
"""
Unified Spec CLI
Command-line interface for all spec operations

This script provides a unified interface for spec creation, validation,
conversion, questioning, and generation, with tab completion support.
"""

import sys
import os
import argparse
import json
from pathlib import Path
from typing import Optional, List
from datetime import datetime

# Add lib to path
SCRIPT_DIR = Path(__file__).parent.parent
LIB_DIR = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB_DIR / "spec-creation"))

from spec_types import StructuredSpec


class SpecCLI:
    """Unified CLI for spec operations."""

    def __init__(self):
        self.parser = self._create_parser()

    def _create_parser(self) -> argparse.ArgumentParser:
        """Create the main argument parser."""
        parser = argparse.ArgumentParser(
            prog='spec-cli',
            description='Blackbox4 Spec Management CLI',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  # Create a new spec
  %(prog)s create my-project --interactive

  # Validate an existing spec
  %(prog)s validate .specs/my-project-spec.json

  # Convert spec to plan
  %(prog)s convert .specs/my-spec.json .plans/my-project

  # Convert plan to spec
  %(prog)s convert --reverse .plans/my-project .specs

  # Run questioning workflow
  %(prog)s question .specs/my-spec.json

  # Generate spec from requirement
  %(prog)s generate "Build a user authentication system" --project auth-system

  # List all specs
  %(prog)s list

  # Show spec info
  %(prog)s info .specs/my-spec.json

Commands:
  create       Create a new specification
  validate     Validate an existing specification
  convert      Convert between spec and plan formats
  question     Run questioning workflow on spec
  generate     Generate spec from requirement text
  list         List all specifications
  info         Show detailed information about a spec
  complete     Shell completion support

For more help on a command:
  %(prog)s <command> --help
            """
        )

        subparsers = parser.add_subparsers(
            dest='command',
            help='Available commands',
            metavar='COMMAND'
        )

        # Create command
        create_parser = subparsers.add_parser(
            'create',
            help='Create a new specification'
        )
        create_parser.add_argument(
            'project',
            help='Project name'
        )
        create_parser.add_argument(
            '--interactive', '-i',
            action='store_true',
            help='Interactive spec creation'
        )
        create_parser.add_argument(
            '--output', '-o',
            help='Output directory (default: .specs/)'
        )
        create_parser.add_argument(
            '--question', '-q',
            action='store_true',
            help='Run questioning workflow after creation'
        )
        create_parser.add_argument(
            '--template', '-t',
            choices=['basic', 'full'],
            default='basic',
            help='Spec template to use'
        )

        # Validate command
        validate_parser = subparsers.add_parser(
            'validate',
            help='Validate an existing specification'
        )
        validate_parser.add_argument(
            'spec',
            help='Path to spec file'
        )
        validate_parser.add_argument(
            '--context-aware',
            action='store_true',
            help='Validate context integration'
        )
        validate_parser.add_argument(
            '--verbose', '-v',
            action='store_true',
            help='Verbose output'
        )

        # Convert command
        convert_parser = subparsers.add_parser(
            'convert',
            help='Convert between spec and plan formats'
        )
        convert_parser.add_argument(
            'input',
            help='Input spec or plan directory'
        )
        convert_parser.add_argument(
            'output',
            help='Output directory'
        )
        convert_parser.add_argument(
            '--reverse', '-r',
            action='store_true',
            help='Convert plan to spec (default: spec to plan)'
        )
        convert_parser.add_argument(
            '--dry-run', '-n',
            action='store_true',
            help='Show what would be done'
        )

        # Question command
        question_parser = subparsers.add_parser(
            'question',
            help='Run questioning workflow on spec'
        )
        question_parser.add_argument(
            'spec',
            help='Path to spec file'
        )
        question_parser.add_argument(
            '--auto-clarify',
            action='store_true',
            help='Automatically add clarifications'
        )

        # Generate command
        generate_parser = subparsers.add_parser(
            'generate',
            help='Generate spec from requirement text'
        )
        generate_parser.add_argument(
            'requirement',
            help='Requirement description'
        )
        generate_parser.add_argument(
            '--project', '-p',
            required=True,
            help='Project name'
        )
        generate_parser.add_argument(
            '--output', '-o',
            help='Output directory'
        )

        # List command
        list_parser = subparsers.add_parser(
            'list',
            help='List all specifications'
        )
        list_parser.add_argument(
            '--directory', '-d',
            default='.specs',
            help='Spec directory to search'
        )
        list_parser.add_argument(
            '--verbose', '-v',
            action='store_true',
            help='Show detailed information'
        )

        # Info command
        info_parser = subparsers.add_parser(
            'info',
            help='Show detailed information about a spec'
        )
        info_parser.add_argument(
            'spec',
            help='Path to spec file'
        )
        info_parser.add_argument(
            '--format', '-f',
            choices=['text', 'json'],
            default='text',
            help='Output format'
        )

        # Complete command (for shell completion)
        complete_parser = subparsers.add_parser(
            'complete',
            help='Shell completion support'
        )
        complete_parser.add_argument(
            'type',
            choices=['commands', 'projects', 'specs'],
            help='Completion type'
        )

        return parser

    def run(self, args: Optional[List[str]] = None) -> int:
        """Run the CLI."""
        parsed_args = self.parser.parse_args(args)

        if not parsed_args.command:
            self.parser.print_help()
            return 0

        # Route to appropriate handler
        handlers = {
            'create': self._handle_create,
            'validate': self._handle_validate,
            'convert': self._handle_convert,
            'question': self._handle_question,
            'generate': self._handle_generate,
            'list': self._handle_list,
            'info': self._handle_info,
            'complete': self._handle_complete
        }

        handler = handlers.get(parsed_args.command)
        if handler:
            return handler(parsed_args)
        else:
            print(f"❌ Unknown command: {parsed_args.command}")
            return 1

    def _handle_create(self, args) -> int:
        """Handle create command."""
        from spec_create import create_spec_interactive

        output_dir = args.output or f".specs/{args.project}"
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        if args.interactive:
            spec = create_spec_interactive(args.project)
        else:
            spec = StructuredSpec(project_name=args.project)
            spec.overview = f"Specification for {args.project}"

        # Save spec
        spec_file = output_path / f"{args.project.lower().replace(' ', '_')}-spec.json"
        prd_file = spec.save(str(spec_file))

        print(f"✅ Spec created!")
        print(f"   JSON: {spec_file}")
        print(f"   PRD: {prd_file}")

        return 0

    def _handle_validate(self, args) -> int:
        """Handle validate command."""
        if not Path(args.spec).exists():
            print(f"❌ Spec file not found: {args.spec}")
            return 1

        spec = StructuredSpec.load(args.spec)

        print(f"✅ Valid spec: {spec.project_name}")
        print(f"   User stories: {len(spec.user_stories)}")
        print(f"   Requirements: {len(spec.functional_requirements)}")
        print(f"   Has constitution: {'Yes' if spec.constitution else 'No'}")
        print(f"   Clarifications: {len(spec.clarifications)}")

        if args.context_aware:
            # Import context_aware_spec
            sys.path.insert(0, str(Path(__file__).parent))
            from context_aware_spec import ContextAwareSpecManager

            manager = ContextAwareSpecManager(args.spec)
            report = manager.validate_context_compatibility(spec)

            print(f"\nContext Validation:")
            print(f"   Valid: {'Yes' if report['valid'] else 'No'}")
            print(f"   Coverage: {report['context_coverage']}")

            if report['warnings']:
                print(f"\nWarnings:")
                for warning in report['warnings']:
                    print(f"   ⚠️  {warning}")

        return 0

    def _handle_convert(self, args) -> int:
        """Handle convert command."""
        sys.path.insert(0, str(Path(__file__).parent))

        if args.reverse:
            # Convert plan to spec
            from plan_to_spec import PlanToSpecConverter

            converter = PlanToSpecConverter(args.input, args.output)

            if args.dry_run:
                print("🔍 Dry run mode - would convert plan to spec")
                if converter.load_plan():
                    print(f"   Input: {args.input}")
                    print(f"   Output: {args.output}")
                return 0
            else:
                success = converter.convert()
                return 0 if success else 1
        else:
            # Convert spec to plan
            from spec_to_plan import SpecToPlanConverter

            converter = SpecToPlanConverter(args.input, args.output)

            if args.dry_run:
                print("🔍 Dry run mode - would convert spec to plan")
                if converter.load_spec():
                    print(f"   Input: {args.input}")
                    print(f"   Output: {args.output}")
                return 0
            else:
                success = converter.convert()
                return 0 if success else 1

    def _handle_question(self, args) -> int:
        """Handle question command."""
        if not Path(args.spec).exists():
            print(f"❌ Spec file not found: {args.spec}")
            return 1

        # Import questioning engine
        sys.path.insert(0, str(LIB_DIR / 'spec-creation'))
        from questioning import QuestioningEngine

        spec = StructuredSpec.load(args.spec)

        print("🔍 Running questioning workflow...")
        engine = QuestioningEngine()
        report = engine.generate_questioning_report(spec)

        # Save report
        spec_dir = Path(args.spec).parent
        report_path = spec_dir / "questioning-report.md"

        with open(report_path, 'w') as f:
            f.write(report)

        print(f"✅ Questioning report saved: {report_path}")

        if args.auto_clarify:
            print("\n💡 Auto-clarify is enabled - would add clarifications")
            print("   (This feature requires LLM integration)")

        return 0

    def _handle_generate(self, args) -> int:
        """Handle generate command."""
        from spec_create import generate_spec_from_requirement

        output_dir = args.output or f".specs/{args.project}"
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        spec = generate_spec_from_requirement(args.requirement, args.project)

        # Save spec
        spec_file = output_path / f"{args.project.lower().replace(' ', '_')}-spec.json"
        prd_file = spec.save(str(spec_file))

        print(f"✅ Spec generated!")
        print(f"   JSON: {spec_file}")
        print(f"   PRD: {prd_file}")

        return 0

    def _handle_list(self, args) -> int:
        """Handle list command."""
        spec_dir = Path(args.directory)

        if not spec_dir.exists():
            print(f"❌ Spec directory not found: {args.directory}")
            return 1

        # Find all spec files
        spec_files = list(spec_dir.glob("**/*-spec.json"))

        if not spec_files:
            print(f"No specs found in {args.directory}")
            return 0

        print(f"📋 Found {len(spec_files)} spec(s):\n")

        for spec_file in spec_files:
            try:
                spec = StructuredSpec.load(str(spec_file))

                if args.verbose:
                    print(f"📄 {spec_file.name}")
                    print(f"   Project: {spec.project_name}")
                    print(f"   Stories: {len(spec.user_stories)}")
                    print(f"   Requirements: {len(spec.functional_requirements)}")
                    print(f"   Created: {spec.created_at}")
                    print()
                else:
                    print(f"  {spec.project_name} ({spec_file.relative_to(spec_dir)})")
            except Exception as e:
                print(f"  ⚠️  {spec_file.name} (error loading)")

        return 0

    def _handle_info(self, args) -> int:
        """Handle info command."""
        if not Path(args.spec).exists():
            print(f"❌ Spec file not found: {args.spec}")
            return 1

        spec = StructuredSpec.load(args.spec)

        if args.format == 'json':
            info = {
                'project_name': spec.project_name,
                'overview': spec.overview,
                'user_story_count': len(spec.user_stories),
                'requirement_count': len(spec.functional_requirements),
                'has_constitution': spec.constitution is not None,
                'clarification_count': len(spec.clarifications),
                'created_at': spec.created_at,
                'metadata': spec.metadata
            }
            print(json.dumps(info, indent=2, default=str))
        else:
            print(f"📄 Spec Information")
            print(f"\nProject: {spec.project_name}")
            print(f"Created: {spec.created_at}")
            print(f"\nOverview:")
            print(f"  {spec.overview or 'No overview'}")
            print(f"\nContent:")
            print(f"  User stories: {len(spec.user_stories)}")
            print(f"  Requirements: {len(spec.functional_requirements)}")
            print(f"  Constitution: {'Yes' if spec.constitution else 'No'}")
            print(f"  Clarifications: {len(spec.clarifications)}")

            if spec.metadata:
                print(f"\nMetadata:")
                for key, value in spec.metadata.items():
                    print(f"  {key}: {value}")

        return 0

    def _handle_complete(self, args) -> int:
        """Handle complete command (for shell completion)."""
        if args.type == 'commands':
            print("create validate convert question generate list info complete")
        elif args.type == 'projects':
            # List project names from .specs
            spec_dir = Path(".specs")
            if spec_dir.exists():
                for spec_file in spec_dir.glob("*-spec.json"):
                    try:
                        spec = StructuredSpec.load(str(spec_file))
                        print(spec.project_name)
                    except:
                        pass
        elif args.type == 'specs':
            # List spec file paths
            spec_dir = Path(".specs")
            if spec_dir.exists():
                for spec_file in spec_dir.glob("**/*-spec.json"):
                    print(spec_file)

        return 0


def main():
    """Main entry point."""
    cli = SpecCLI()
    sys.exit(cli.run())


if __name__ == '__main__':
    main()
