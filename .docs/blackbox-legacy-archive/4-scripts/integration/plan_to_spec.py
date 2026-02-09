#!/usr/bin/env python3
"""
Plan to Spec Converter
Converts existing hierarchical plans to structured specifications

This script reverse-engineers a structured spec from an existing plan,
extracting tasks as user stories and subtasks as requirements.
"""

import sys
import os
import json
import argparse
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime

# Add lib to path
SCRIPT_DIR = Path(__file__).parent.parent
LIB_DIR = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB_DIR / "spec-creation"))
sys.path.insert(0, str(LIB_DIR / "hierarchical-tasks"))

from spec_types import StructuredSpec, UserStory, FunctionalRequirement, ProjectConstitution
from hierarchical_task import HierarchicalTask


class PlanToSpecConverter:
    """Convert hierarchical plans to structured specs."""

    def __init__(self, plan_dir: str, output_dir: str):
        self.plan_dir = Path(plan_dir)
        self.output_dir = Path(output_dir)
        self.checklist_path = self.plan_dir / "checklist.md"
        self.plan_json_path = self.plan_dir / "plan.json"
        self.tasks: List[HierarchicalTask] = []

    def load_plan(self) -> bool:
        """Load plan from checklist.md."""
        if not self.checklist_path.exists():
            print(f"❌ Checklist not found: {self.checklist_path}")
            return False

        print(f"📋 Loading plan from: {self.checklist_path}")

        # Parse checklist.md
        task_stack = []
        task_id = 1

        with open(self.checklist_path, 'r') as f:
            for line_num, line in enumerate(f, 1):
                # Skip empty lines and headers
                if not line.strip() or line.strip().startswith('#'):
                    continue

                # Parse indentation level
                indent = len(line) - len(line.lstrip())
                depth = indent // 2

                # Parse task line: "- [ ] Task description" or "- [x] Completed task"
                task_match = re.match(r'^[\s]*-\s*\[\s*([x\s])\s*\](.+)', line)
                if task_match:
                    status_char = task_match.group(1).strip()
                    description = task_match.group(2).strip()
                    completed = (status_char == 'x')

                    # Clean description (remove comments)
                    description = re.sub(r'\s*<!--.*?-->', '', description).strip()

                    # Create task
                    task = HierarchicalTask(
                        description=description,
                        completed=completed,
                        metadata={
                            'line_number': line_num,
                            'depth': depth
                        }
                    )

                    # Set parent based on depth
                    if depth > 0 and depth <= len(task_stack):
                        task.parent_task = task_stack[depth - 1]
                        task.parent_task.add_child(task)

                    # Update stack
                    if depth < len(task_stack):
                        task_stack[depth] = task
                    else:
                        task_stack.append(task)

                    self.tasks.append(task)

        print(f"✅ Loaded {len(self.tasks)} tasks from checklist")
        return True

    def infer_user_stories(self) -> List[UserStory]:
        """Infer user stories from top-level tasks."""
        stories = []
        root_tasks = [t for t in self.tasks if t.parent_task is None]

        for idx, task in enumerate(root_tasks, 1):
            # Try to parse user story pattern from description
            # Pattern: [ID] description or just description
            description = task.description

            # Extract ID if present
            story_id = f"US-{idx:03d}"
            if description.startswith('['):
                id_match = re.match(r'\[([^\]]+)\]\s*(.+)', description)
                if id_match:
                    story_id = id_match.group(1)
                    description = id_match.group(2)

            # Try to parse "As a... I want... So that..." pattern
            as_a = "user"
            i_want = description
            so_that = "I can achieve the project goals"

            # Look for user story patterns in description
            as_match = re.search(r'as an?\s+([^,]+)', description, re.IGNORECASE)
            if as_match:
                as_a = as_match.group(1).strip()

            want_match = re.search(r'i want\s+([^,.]+)', description, re.IGNORECASE)
            if want_match:
                i_want = want_match.group(1).strip()

            that_match = re.search(r'so that\s+([^.]+)', description, re.IGNORECASE)
            if that_match:
                so_that = that_match.group(1).strip()

            story = UserStory(
                id=story_id,
                as_a=as_a,
                i_want=i_want,
                so_that=so_that,
                priority="medium",
                tags=["inferred"]
            )

            # Add acceptance criteria from child tasks
            for child in task.children:
                if child.metadata.get('type') != 'requirement':
                    story.acceptance_criteria.append(child.description)

            stories.append(story)

        print(f"✅ Inferred {len(stories)} user stories")
        return stories

    def infer_requirements(self) -> List[FunctionalRequirement]:
        """Infer functional requirements from child tasks."""
        requirements = []
        req_id = 1

        for task in self.tasks:
            # Skip root tasks (those are user stories)
            if task.parent_task is None:
                continue

            # Extract ID if present
            description = task.description
            req_id_str = f"FR-{req_id:03d}"

            if description.startswith('['):
                id_match = re.match(r'\[([^\]]+)\]\s*(.+)', description)
                if id_match:
                    req_id_str = id_match.group(1)
                    description = id_match.group(2)

            # Create requirement
            req = FunctionalRequirement(
                id=req_id_str,
                title=description,
                description=f"Implement: {description}",
                priority=task.metadata.get('priority', 'medium'),
                dependencies=[],
                acceptance_tests=[]
            )

            # Add acceptance tests from metadata if present
            if 'acceptance_tests' in task.metadata:
                req.acceptance_tests = task.metadata['acceptance_tests']

            requirements.append(req)
            req_id += 1

        print(f"✅ Inferred {len(requirements)} requirements")
        return requirements

    def infer_constitution(self) -> Optional[ProjectConstitution]:
        """Infer project constitution from plan context."""
        # Check if plan.json exists
        if self.plan_json_path.exists():
            try:
                with open(self.plan_json_path, 'r') as f:
                    plan_data = json.load(f)

                # Extract constitution data if present
                if 'constitution' in plan_data:
                    return ProjectConstitution(**plan_data['constitution'])
            except Exception as e:
                print(f"⚠️  Could not load plan.json: {e}")

        # Check for context.md or other constitution files
        context_path = self.plan_dir / "context.md"
        if context_path.exists():
            try:
                with open(context_path, 'r') as f:
                    content = f.read()

                # Try to extract vision, tech stack, etc.
                vision = "Inferred from plan context"
                tech_stack = {}

                # Look for tech stack patterns
                tech_match = re.search(r'tech stack?:?\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
                if tech_match:
                    # Parse simple key:value pairs
                    for line in tech_match.group(1).split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            tech_stack[key.strip()] = value.strip()

                return ProjectConstitution(
                    vision=vision,
                    tech_stack=tech_stack,
                    quality_standards=["Inferred from plan"],
                    architectural_principles=[]
                )
            except Exception as e:
                print(f"⚠️  Could not load context.md: {e}")

        return None

    def extract_overview(self) -> str:
        """Extract overview from checklist or plan metadata."""
        # Try plan.json first
        if self.plan_json_path.exists():
            try:
                with open(self.plan_json_path, 'r') as f:
                    plan_data = json.load(f)
                if 'overview' in plan_data:
                    return plan_data['overview']
                if 'spec_overview' in plan_data:
                    return plan_data['spec_overview']
            except Exception:
                pass

        # Parse overview from checklist
        with open(self.checklist_path, 'r') as f:
            lines = f.readlines()

        in_overview = False
        overview_lines = []

        for line in lines:
            if line.strip().startswith('## Overview'):
                in_overview = True
                continue
            if in_overview:
                if line.strip().startswith('##'):
                    break
                if line.strip():
                    overview_lines.append(line.strip())

        return '\n'.join(overview_lines) if overview_lines else "Inferred from existing plan"

    def convert(self) -> bool:
        """Execute the full conversion process."""
        if not self.load_plan():
            return False

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Infer spec components
        project_name = self.plan_dir.name.replace('-', ' ').replace('_', ' ').title()
        overview = self.extract_overview()
        user_stories = self.infer_user_stories()
        requirements = self.infer_requirements()
        constitution = self.infer_constitution()

        # Create spec
        spec = StructuredSpec(
            project_name=project_name,
            overview=overview,
            user_stories=user_stories,
            functional_requirements=requirements,
            constitution=constitution,
            metadata={
                'inferred_from_plan': str(self.plan_dir),
                'inferred_at': datetime.now().isoformat(),
                'original_task_count': len(self.tasks)
            }
        )

        # Save spec
        spec_path = self.output_dir / f"{project_name.lower().replace(' ', '_')}-spec.json"
        prd_path = spec.save(str(spec_path))

        print(f"\n✅ Spec created successfully!")
        print(f"   JSON: {spec_path}")
        print(f"   PRD: {prd_path}")
        print(f"\n📝 Note: This is an initial spec inferred from your plan.")
        print(f"   Please review and refine the spec before using it.")

        return True


def main():
    parser = argparse.ArgumentParser(
        description='Convert hierarchical plan to structured spec',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert plan to spec
  %(prog)s .plans/my-project .specs

  # Convert with custom output
  %(prog)s plan-dir output-dir

  # Dry run (show what would be created)
  %(prog)s --dry-run plan-dir output-dir
        """
    )

    parser.add_argument('plan_dir', help='Path to plan directory')
    parser.add_argument('output_dir', help='Output spec directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Show what would be done')

    args = parser.parse_args()

    converter = PlanToSpecConverter(args.plan_dir, args.output_dir)

    if args.dry_run:
        print("🔍 Dry run mode - showing conversion plan:")
        if converter.load_plan():
            print(f"\nWould create spec in: {converter.output_dir}")
            print(f"Root tasks (user stories): {len([t for t in converter.tasks if t.parent_task is None])}")
            print(f"Child tasks (requirements): {len([t for t in converter.tasks if t.parent_task is not None])}")
        return 0

    success = converter.convert()
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
