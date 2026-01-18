#!/usr/bin/env python3
"""
Context-Aware Spec Management
Integrates Phase 1 context variables with spec creation

This script extends spec creation to include tenant-specific context,
environment variables, and runtime configuration in spec metadata.
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

# Add lib to path
SCRIPT_DIR = Path(__file__).parent.parent
LIB_DIR = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB_DIR / "spec-creation"))
sys.path.insert(0, str(LIB_DIR / "context-variables"))

from spec_types import StructuredSpec
from context import context_var


class ContextAwareSpecManager:
    """Manage specs with Phase 1 context integration."""

    def __init__(self, spec_path: Optional[str] = None):
        self.spec_path = Path(spec_path) if spec_path else None
        self.spec: Optional[StructuredSpec] = None
        self.context_vars: Dict[str, Any] = {}

    def collect_phase1_context(self) -> Dict[str, Any]:
        """Collect Phase 1 context variables."""
        context = {}

        # Environment context
        context['environment'] = {
            'tenant_id': os.environ.get('TENANT_ID', 'default'),
            'environment': os.environ.get('ENVIRONMENT', 'development'),
            'region': os.environ.get('REGION', 'us-east-1'),
            'workspace_root': os.environ.get('WORKSPACE_ROOT', str(Path.cwd()))
        }

        # Blackbox4 runtime context
        bb4_root = SCRIPT_DIR.parent.parent
        context['blackbox4'] = {
            'version': '4.0',
            'root': str(bb4_root),
            'scripts_dir': str(bb4_root / '4-scripts'),
            'agents_dir': str(bb4_root / '1-agents'),
            'templates_dir': str(bb4_root / '5-templates')
        }

        # Project context
        context['project'] = {
            'created_at': datetime.now().isoformat(),
            'created_by': os.environ.get('USER', 'unknown'),
            'hostname': os.environ.get('HOSTNAME', 'unknown')
        }

        # Git context (if in git repo)
        try:
            import subprocess
            git_dir = subprocess.check_output(
                ['git', 'rev-parse', '--git-dir'],
                cwd=bb4_root,
                stderr=subprocess.DEVNULL
            ).decode().strip()

            if git_dir:
                context['git'] = {
                    'branch': subprocess.check_output(
                        ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
                        cwd=bb4_root,
                        stderr=subprocess.DEVNULL
                    ).decode().strip(),
                    'commit': subprocess.check_output(
                        ['git', 'rev-parse', 'HEAD'],
                        cwd=bb4_root,
                        stderr=subprocess.DEVNULL
                    ).decode().strip()[:8]
                }
        except Exception:
            context['git'] = None

        return context

    def create_tenant_spec(
        self,
        project_name: str,
        tenant_id: str,
        tenant_config: Dict[str, Any]
    ) -> StructuredSpec:
        """Create a tenant-specific spec."""
        spec = StructuredSpec(project_name=project_name)

        # Add tenant context to metadata
        spec.metadata.update({
            'tenant_id': tenant_id,
            'tenant_config': tenant_config,
            'context_aware': True,
            'phase1_compatible': True
        })

        # Add environment-specific context
        context = self.collect_phase1_context()
        context['environment']['tenant_id'] = tenant_id
        spec.metadata['context'] = context

        return spec

    def filter_spec_by_context(
        self,
        spec: StructuredSpec,
        context_filter: Dict[str, Any]
    ) -> StructuredSpec:
        """Filter spec content based on context variables."""
        filtered_spec = StructuredSpec(
            project_name=spec.project_name,
            overview=spec.overview,
            constitution=spec.constitution,
            metadata=spec.metadata.copy()
        )

        # Filter user stories by context
        for story in spec.user_stories:
            if self._matches_context(story, context_filter):
                filtered_spec.user_stories.append(story)

        # Filter requirements by context
        for req in spec.functional_requirements:
            if self._matches_context(req, context_filter):
                filtered_spec.functional_requirements.append(req)

        return filtered_spec

    def _matches_context(self, item: Any, context_filter: Dict[str, Any]) -> bool:
        """Check if item matches context filter."""
        if not hasattr(item, 'tags'):
            return True

        # Check if item has tenant-specific tags
        tags = item.tags or []

        # If filter requires specific tenant
        if 'tenant_id' in context_filter:
            required_tenant = context_filter['tenant_id']
            tenant_tags = [t for t in tags if t.startswith('tenant:')]
            if tenant_tags and f"tenant:{required_tenant}" not in tenant_tags:
                return False

        # If filter requires specific environment
        if 'environment' in context_filter:
            required_env = context_filter['environment']
            env_tags = [t for t in tags if t.startswith('env:')]
            if env_tags and f"env:{required_env}" not in env_tags:
                return False

        return True

    def validate_context_compatibility(self, spec: StructuredSpec) -> Dict[str, Any]:
        """Validate spec against Phase 1 context requirements."""
        report = {
            'valid': True,
            'warnings': [],
            'errors': [],
            'context_coverage': {}
        }

        # Check if spec has context metadata
        if 'context' not in spec.metadata:
            report['warnings'].append('No context variables in spec metadata')
            report['valid'] = False
        else:
            context = spec.metadata['context']

            # Check for required context keys
            required_keys = ['environment', 'blackbox4', 'project']
            for key in required_keys:
                if key in context:
                    report['context_coverage'][key] = 'present'
                else:
                    report['context_coverage'][key] = 'missing'
                    report['warnings'].append(f'Missing context key: {key}')

        # Check if spec has tenant info
        if 'tenant_id' not in spec.metadata:
            report['warnings'].append('No tenant_id in spec metadata')

        # Check if user stories have environment tags
        env_tagged_stories = sum(
            1 for story in spec.user_stories
            if any(tag.startswith('env:') for tag in story.tags)
        )
        report['context_coverage']['env_tagged_stories'] = env_tagged_stories

        return report

    def enhance_spec_with_context(
        self,
        spec: StructuredSpec,
        additional_context: Dict[str, Any]
    ) -> StructuredSpec:
        """Enhance existing spec with additional context."""
        # Collect Phase 1 context
        phase1_context = self.collect_phase1_context()

        # Merge with existing metadata
        if 'context' not in spec.metadata:
            spec.metadata['context'] = phase1_context
        else:
            spec.metadata['context'].update(phase1_context)

        # Add additional context
        spec.metadata['context'].update(additional_context)

        # Mark as context-aware
        spec.metadata['context_aware'] = True
        spec.metadata['phase1_compatible'] = True

        return spec

    def save_context_aware_spec(self, spec: StructuredSpec, output_path: str) -> str:
        """Save spec with context validation."""
        # Validate before saving
        report = self.validate_context_compatibility(spec)

        if not report['valid']:
            print("⚠️  Context validation warnings:")
            for warning in report['warnings']:
                print(f"  - {warning}")

        # Save spec
        result_path = spec.save(output_path)

        print(f"✅ Context-aware spec saved: {result_path}")
        print(f"   Context coverage: {report['context_coverage']}")

        return result_path


def main():
    parser = argparse.ArgumentParser(
        description='Context-aware spec management',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create tenant-specific spec
  %(prog)s create-spec --project my-app --tenant tenant-1

  # Validate spec context
  %(prog)s validate .specs/my-spec.json

  # Filter spec by environment
  %(prog)s filter .specs/my-spec.json --environment production

  # Enhance spec with context
  %(prog)s enhance .specs/my-spec.json --add-context '{"region": "eu-west-1"}'
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Create spec command
    create_parser = subparsers.add_parser('create-spec', help='Create context-aware spec')
    create_parser.add_argument('--project', required=True, help='Project name')
    create_parser.add_argument('--tenant', default='default', help='Tenant ID')
    create_parser.add_argument('--output', help='Output directory')

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate spec context')
    validate_parser.add_argument('spec', help='Path to spec file')

    # Filter command
    filter_parser = subparsers.add_parser('filter', help='Filter spec by context')
    filter_parser.add_argument('spec', help='Path to spec file')
    filter_parser.add_argument('--tenant', help='Tenant ID filter')
    filter_parser.add_argument('--environment', help='Environment filter')
    filter_parser.add_argument('--output', required=True, help='Output file')

    # Enhance command
    enhance_parser = subparsers.add_parser('enhance', help='Enhance spec with context')
    enhance_parser.add_argument('spec', help='Path to spec file')
    enhance_parser.add_argument('--add-context', help='Additional context as JSON')
    enhance_parser.add_argument('--output', help='Output file (default: overwrite)')

    args = parser.parse_args()

    manager = ContextAwareSpecManager()

    if args.command == 'create-spec':
        # Create tenant-specific spec
        tenant_config = {
            'tenant_id': args.tenant,
            'settings': {}
        }

        spec = manager.create_tenant_spec(
            project_name=args.project,
            tenant_id=args.tenant,
            tenant_config=tenant_config
        )

        output_dir = args.output or f".specs/{args.project}"
        output_path = f"{output_dir}/{args.project}-spec.json"

        manager.save_context_aware_spec(spec, output_path)

    elif args.command == 'validate':
        # Load and validate spec
        from spec_types import StructuredSpec

        spec = StructuredSpec.load(args.spec)
        report = manager.validate_context_compatibility(spec)

        print(f"\nContext Validation Report")
        print(f"Valid: {'✅ Yes' if report['valid'] else '❌ No'}")
        print(f"\nContext Coverage:")
        for key, status in report['context_coverage'].items():
            print(f"  {key}: {status}")

        if report['warnings']:
            print(f"\nWarnings:")
            for warning in report['warnings']:
                print(f"  ⚠️  {warning}")

        return 0 if report['valid'] else 1

    elif args.command == 'filter':
        # Load and filter spec
        from spec_types import StructuredSpec

        spec = StructuredSpec.load(args.spec)

        context_filter = {}
        if args.tenant:
            context_filter['tenant_id'] = args.tenant
        if args.environment:
            context_filter['environment'] = args.environment

        filtered_spec = manager.filter_spec_by_context(spec, context_filter)

        # Save filtered spec
        filtered_spec.save(args.output)

        print(f"✅ Filtered spec saved: {args.output}")
        print(f"   Original stories: {len(spec.user_stories)}")
        print(f"   Filtered stories: {len(filtered_spec.user_stories)}")

    elif args.command == 'enhance':
        # Load and enhance spec
        from spec_types import StructuredSpec

        spec = StructuredSpec.load(args.spec)

        additional_context = {}
        if args.add_context:
            additional_context = json.loads(args.add_context)

        enhanced_spec = manager.enhance_spec_with_context(spec, additional_context)

        output_path = args.output or args.spec
        manager.save_context_aware_spec(enhanced_spec, output_path)

    else:
        parser.print_help()
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
