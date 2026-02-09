#!/usr/bin/env python3
"""
Handoff to Spec Integration
Integrates spec creation with agent handoff system

This script enables specs to be created, updated, and passed between
agents during the handoff process, ensuring spec continuity across
agent workflows.
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import Dict, Optional, Any
from datetime import datetime

# Add lib to path
SCRIPT_DIR = Path(__file__).parent.parent
LIB_DIR = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB_DIR / "spec-creation"))
sys.path.insert(0, str(LIB_DIR / "context-variables"))

from spec_types import StructuredSpec
from handoff_context import HandoffContext


class HandoffSpecManager:
    """Manage specs during agent handoffs."""

    def __init__(self, handoff_dir: Optional[str] = None):
        self.handoff_dir = Path(handoff_dir) if handoff_dir else None
        self.spec: Optional[StructuredSpec] = None

    def create_spec_during_handoff(
        self,
        from_agent: str,
        to_agent: str,
        project_name: str,
        handoff_context: Dict[str, Any]
    ) -> StructuredSpec:
        """Create a new spec during agent handoff."""
        spec = StructuredSpec(project_name=project_name)

        # Add handoff metadata
        spec.metadata.update({
            'handoff_created': True,
            'from_agent': from_agent,
            'to_agent': to_agent,
            'handoff_timestamp': datetime.now().isoformat(),
            'handoff_context': handoff_context
        })

        # Extract overview from handoff message
        if 'message' in handoff_context:
            spec.overview = f"Created during handoff: {handoff_context['message']}"

        # Extract user stories from handoff work
        if 'work_products' in handoff_context:
            for idx, product in enumerate(handoff_context['work_products'], 1):
                if 'description' in product:
                    from spec_types import UserStory
                    story = UserStory(
                        id=f"US-{idx:03d}",
                        as_a=to_agent,
                        i_want=product['description'],
                        so_that=f"I can continue the work from {from_agent}"
                    )
                    spec.user_stories.append(story)

        return spec

    def update_spec_from_agent_response(
        self,
        spec: StructuredSpec,
        agent_name: str,
        response_data: Dict[str, Any]
    ) -> StructuredSpec:
        """Update spec based on agent response."""
        # Add response metadata
        if 'handoff_history' not in spec.metadata:
            spec.metadata['handoff_history'] = []

        spec.metadata['handoff_history'].append({
            'agent': agent_name,
            'timestamp': datetime.now().isoformat(),
            'response_summary': response_data.get('summary', ''),
            'updates_made': response_data.get('updates', [])
        })

        # Extract clarifications from response
        if 'clarifications' in response_data:
            for q_and_a in response_data['clarifications']:
                spec.add_clarification(
                    question=q_and_a.get('question', ''),
                    answer=q_and_a.get('answer', '')
                )

        # Extract new user stories from response
        if 'new_stories' in response_data:
            from spec_types import UserStory
            for story_data in response_data['new_stories']:
                story = UserStory(
                    id=story_data.get('id', f"US-{len(spec.user_stories) + 1:03d}"),
                    as_a=story_data.get('as_a', agent_name),
                    i_want=story_data.get('i_want', ''),
                    so_that=story_data.get('so_that', ''),
                    acceptance_criteria=story_data.get('acceptance_criteria', [])
                )
                spec.user_stories.append(story)

        return spec

    def package_spec_for_handoff(
        self,
        spec: StructuredSpec,
        from_agent: str,
        to_agent: str,
        message: str = "Handing off spec"
    ) -> Dict[str, Any]:
        """Package spec for agent handoff."""
        handoff_package = {
            'type': 'spec_handoff',
            'spec_name': spec.project_name,
            'from_agent': from_agent,
            'to_agent': to_agent,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'spec_data': {
                'overview': spec.overview,
                'user_story_count': len(spec.user_stories),
                'requirement_count': len(spec.functional_requirements),
                'metadata': spec.metadata
            },
            'context_variables': {
                'spec_path': str(self.spec_path(spec)) if self.spec_path(spec) else None,
                'spec_version': spec.metadata.get('version', '1.0.0'),
                'last_updated': spec.metadata.get('updated_at', spec.created_at)
            }
        }

        return handoff_package

    def spec_path(self, spec: StructuredSpec) -> Optional[Path]:
        """Determine spec path from metadata."""
        if 'spec_path' in spec.metadata:
            return Path(spec.metadata['spec_path'])
        return None

    def execute_spec_handoff(
        self,
        spec: StructuredSpec,
        from_agent: str,
        to_agent: str,
        message: str = "Handing off spec",
        context_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute handoff with spec."""
        # Package spec for handoff
        package = self.package_spec_for_handoff(spec, from_agent, to_agent, message)

        # Create handoff context
        handoff = HandoffContext(
            from_agent=from_agent,
            to_agent=to_agent,
            context_vars=package['context_variables'],
            message=message
        )

        # Save spec to handoff directory if provided
        if self.handoff_dir:
            handoff_id = f"{datetime.now().strftime('%Y%m%d%H%M%S')}-{from_agent}-to-{to_agent}"
            spec_dir = self.handoff_dir / handoff_id
            spec_dir.mkdir(parents=True, exist_ok=True)

            spec_path = spec_dir / f"{spec.project_name}-spec.json"
            spec.save(str(spec_path))

            package['context_variables']['spec_path'] = str(spec_path)

        # Execute handoff via bash script
        result = handoff.execute_handoff(context_dir=context_dir)

        # Add handoff result to package
        package['handoff_result'] = result

        return package

    def load_spec_from_handoff(self, handoff_file: str) -> Optional[StructuredSpec]:
        """Load spec from handoff package."""
        try:
            with open(handoff_file, 'r') as f:
                handoff_data = json.load(f)

            # Check if this is a spec handoff
            if handoff_data.get('type') != 'spec_handoff':
                print(f"⚠️  Not a spec handoff: {handoff_file}")
                return None

            # Load spec from path if available
            spec_path = handoff_data.get('context_variables', {}).get('spec_path')
            if spec_path and Path(spec_path).exists():
                spec = StructuredSpec.load(spec_path)

                # Update metadata with handoff info
                spec.metadata['received_from_handoff'] = handoff_file
                spec.metadata['handoff_source'] = handoff_data.get('from_agent')

                return spec
            else:
                print(f"⚠️  Spec file not found: {spec_path}")
                return None

        except Exception as e:
            print(f"❌ Error loading spec from handoff: {e}")
            return None

    def create_spec_continuation(
        self,
        previous_spec: StructuredSpec,
        new_agent: str,
        continuation_reason: str
    ) -> StructuredSpec:
        """Create a continuation spec for the next agent."""
        # Create new spec based on previous
        new_spec = StructuredSpec(
            project_name=previous_spec.project_name,
            overview=f"Continuation of {previous_spec.project_name}: {continuation_reason}"
        )

        # Copy constitution
        new_spec.constitution = previous_spec.constitution

        # Copy clarifications
        new_spec.clarifications = previous_spec.clarifications.copy()

        # Add continuation metadata
        new_spec.metadata.update({
            'continuation_of': previous_spec.metadata.get('spec_path', ''),
            'previous_agent': previous_spec.metadata.get('to_agent', ''),
            'current_agent': new_agent,
            'continuation_reason': continuation_reason,
            'continuation_timestamp': datetime.now().isoformat()
        })

        # Copy incomplete user stories
        from spec_types import UserStory
        for story in previous_spec.user_stories:
            # Check if story is marked as complete
            if not story.metadata.get('complete', False):
                new_story = UserStory(
                    id=story.id,
                    as_a=new_agent,
                    i_want=story.i_want,
                    so_that=f"{story.so_that} (continued from previous agent)",
                    acceptance_criteria=story.acceptance_criteria.copy(),
                    priority=story.priority,
                    tags=story.tags.copy() + ['continuation']
                )
                new_spec.user_stories.append(new_story)

        return new_spec


def main():
    parser = argparse.ArgumentParser(
        description='Spec handoff integration',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create spec during handoff
  %(prog)s create --from agent-1 --to agent-2 --project my-app

  # Package spec for handoff
  %(prog)s package .specs/my-spec.json --from agent-1 --to agent-2

  # Load spec from handoff
  %(prog)s load .memory/handoffs/handoff-123.json

  # Create continuation spec
  %(prog)s continue .specs/my-spec.json --agent agent-3 --reason "Implementation phase"
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Create command
    create_parser = subparsers.add_parser('create', help='Create spec during handoff')
    create_parser.add_argument('--from', dest='from_agent', required=True, help='Source agent')
    create_parser.add_argument('--to', dest='to_agent', required=True, help='Target agent')
    create_parser.add_argument('--project', required=True, help='Project name')
    create_parser.add_argument('--context', help='Handoff context as JSON')
    create_parser.add_argument('--output', help='Output spec file')

    # Package command
    package_parser = subparsers.add_parser('package', help='Package spec for handoff')
    package_parser.add_argument('spec', help='Path to spec file')
    package_parser.add_argument('--from', dest='from_agent', required=True, help='Source agent')
    package_parser.add_argument('--to', dest='to_agent', required=True, help='Target agent')
    package_parser.add_argument('--message', default='Handing off spec', help='Handoff message')
    package_parser.add_argument('--output', help='Output package file')

    # Load command
    load_parser = subparsers.add_parser('load', help='Load spec from handoff')
    load_parser.add_argument('handoff', help='Path to handoff file')
    load_parser.add_argument('--output', help='Output spec file')

    # Continue command
    continue_parser = subparsers.add_parser('continue', help='Create continuation spec')
    continue_parser.add_argument('spec', help='Path to previous spec')
    continue_parser.add_argument('--agent', required=True, help='New agent name')
    continue_parser.add_argument('--reason', required=True, help='Continuation reason')
    continue_parser.add_argument('--output', help='Output spec file')

    args = parser.parse_args()

    manager = HandoffSpecManager()

    if args.command == 'create':
        # Create spec during handoff
        context = json.loads(args.context) if args.context else {}

        spec = manager.create_spec_during_handoff(
            from_agent=args.from_agent,
            to_agent=args.to_agent,
            project_name=args.project,
            handoff_context=context
        )

        output_path = args.output or f".specs/{args.project}-handoff-spec.json"
        spec.save(output_path)

        print(f"✅ Spec created during handoff: {output_path}")

    elif args.command == 'package':
        # Package spec for handoff
        from spec_types import StructuredSpec

        spec = StructuredSpec.load(args.spec)
        package = manager.package_spec_for_handoff(
            spec=spec,
            from_agent=args.from_agent,
            to_agent=args.to_agent,
            message=args.message
        )

        if args.output:
            with open(args.output, 'w') as f:
                json.dump(package, f, indent=2)
            print(f"✅ Spec packaged: {args.output}")
        else:
            print(json.dumps(package, indent=2))

    elif args.command == 'load':
        # Load spec from handoff
        spec = manager.load_spec_from_handoff(args.handoff)

        if spec:
            output_path = args.output or f".specs/{spec.project_name}-from-handoff.json"
            spec.save(output_path)
            print(f"✅ Spec loaded from handoff: {output_path}")
        else:
            return 1

    elif args.command == 'continue':
        # Create continuation spec
        from spec_types import StructuredSpec

        previous_spec = StructuredSpec.load(args.spec)
        new_spec = manager.create_spec_continuation(
            previous_spec=previous_spec,
            new_agent=args.agent,
            continuation_reason=args.reason
        )

        output_path = args.output or f".specs/{new_spec.project_name}-continuation.json"
        new_spec.save(output_path)

        print(f"✅ Continuation spec created: {output_path}")

    else:
        parser.print_help()
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
