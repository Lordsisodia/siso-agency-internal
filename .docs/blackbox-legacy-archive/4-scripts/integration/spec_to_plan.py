#!/usr/bin/env python3
"""
Spec to Plan Converter
Converts structured specifications to hierarchical plans

This script converts user stories and functional requirements from a spec
into hierarchical task structures in checklist.md format, preserving
dependencies and metadata.
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime

# Add lib to path
SCRIPT_DIR = Path(__file__).parent.parent
LIB_DIR = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB_DIR / "spec-creation"))
sys.path.insert(0, str(LIB_DIR / "hierarchical-tasks"))

from spec_types import StructuredSpec, UserStory, FunctionalRequirement
from hierarchical_task import HierarchicalTask


class SpecToPlanConverter:
    """Convert structured specs to hierarchical plans."""

    def __init__(self, spec_path: str, plan_dir: str):
        self.spec_path = Path(spec_path)
        self.plan_dir = Path(plan_dir)
        self.spec: Optional[StructuredSpec] = None
        self.tasks: List[HierarchicalTask] = []

    def load_spec(self) -> bool:
        """Load the structured spec from JSON file."""
        if not self.spec_path.exists():
            print(f"❌ Spec file not found: {self.spec_path}")
            return False

        try:
            self.spec = StructuredSpec.load(str(self.spec_path))
            print(f"✅ Loaded spec: {self.spec.project_name}")
            return True
        except Exception as e:
            print(f"❌ Error loading spec: {e}")
            return False

    def convert_user_stories_to_tasks(self) -> List[HierarchicalTask]:
        """Convert user stories to parent tasks."""
        story_tasks = []

        for story in self.spec.user_stories:
            # Create parent task from user story
            task = HierarchicalTask(
                description=f"[{story.id}] {story.i_want}",
                metadata={
                    'type': 'user_story',
                    'story_id': story.id,
                    'as_a': story.as_a,
                    'i_want': story.i_want,
                    'so_that': story.so_that,
                    'priority': story.priority,
                    'story_points': story.story_points,
                    'tags': story.tags
                }
            )
            story_tasks.append(task)

        print(f"✅ Converted {len(story_tasks)} user stories to tasks")
        return story_tasks

    def convert_requirements_to_subtasks(self, parent_tasks: List[HierarchicalTask]) -> None:
        """Convert functional requirements to child subtasks."""
        requirement_map: Dict[str, HierarchicalTask] = {}

        for req in self.spec.functional_requirements:
            # Create subtask for requirement
            subtask = HierarchicalTask(
                description=f"[{req.id}] {req.title}",
                metadata={
                    'type': 'requirement',
                    'req_id': req.id,
                    'title': req.title,
                    'description': req.description,
                    'priority': req.priority,
                    'dependencies': req.dependencies,
                    'acceptance_tests': req.acceptance_tests
                }
            )
            requirement_map[req.id] = subtask

            # Attach to parent task based on dependencies or tags
            parent = self._find_parent_task(req, parent_tasks)
            if parent:
                parent.add_child(subtask)
            else:
                # No parent found, add as root task
                self.tasks.append(subtask)

        print(f"✅ Converted {len(requirement_map)} requirements to subtasks")

    def _find_parent_task(self, req: FunctionalRequirement, parent_tasks: List[HierarchicalTask]) -> Optional[HierarchicalTask]:
        """Find appropriate parent task for a requirement."""
        # Strategy 1: Check if requirement ID references a story ID
        for parent in parent_tasks:
            story_id = parent.metadata.get('story_id', '')
            if req.id.startswith(story_id) or story_id in req.id:
                return parent

        # Strategy 2: Check dependencies
        for dep_id in req.dependencies:
            for parent in parent_tasks:
                if parent.metadata.get('story_id') == dep_id:
                    return parent

        # Strategy 3: Match by tags/keywords
        req_keywords = set(req.title.lower().split())
        best_parent = None
        best_score = 0

        for parent in parent_tasks:
            parent_keywords = set(parent.metadata.get('i_want', '').lower().split())
            score = len(req_keywords & parent_keywords)
            if score > best_score:
                best_score = score
                best_parent = parent

        return best_parent if best_score > 0 else None

    def create_plan_metadata(self) -> Dict[str, Any]:
        """Create plan.json with spec metadata."""
        return {
            'plan_name': self.spec.project_name,
            'created_from_spec': str(self.spec_path),
            'created_at': datetime.now().isoformat(),
            'spec_overview': self.spec.overview,
            'spec_metadata': self.spec.metadata,
            'user_story_count': len(self.spec.user_stories),
            'requirement_count': len(self.spec.functional_requirements),
            'has_constitution': self.spec.constitution is not None
        }

    def generate_checklist(self) -> str:
        """Generate checklist.md content."""
        lines = [
            f"# Tasks: {self.spec.project_name}",
            "",
            f"**Created from spec:** {self.spec_path.name}",
            f"**Created at:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
            "## Overview",
            "",
            self.spec.overview or "No overview provided.",
            ""
        ]

        # Add constitution if present
        if self.spec.constitution:
            lines.extend([
                "## Constitution",
                "",
                f"**Vision:** {self.spec.constitution.vision}",
                ""
            ])
            if self.spec.constitution.tech_stack:
                lines.extend([
                    "**Tech Stack:**",
                    ""
                ])
                for tech, choice in self.spec.constitution.tech_stack.items():
                    lines.append(f"- {tech}: {choice}")
                lines.append("")

        lines.extend([
            "## Tasks",
            ""
        ])

        # Add tasks hierarchically
        def write_task(task: HierarchicalTask, level: int = 0) -> None:
            indent = "  " * level
            status = "x" if task.completed else " "
            lines.append(f"{indent}- [{status}] {task.description}")

            # Write metadata as comments
            if task.metadata.get('type') == 'requirement':
                lines.append(f"{indent}  <!-- Priority: {task.metadata.get('priority', 'medium')} -->")

            # Write children
            for child in task.children:
                write_task(child, level + 1)

        # Write all root tasks
        root_tasks = [t for t in self.tasks if t.parent_task is None]
        for task in root_tasks:
            write_task(task)

        return '\n'.join(lines)

    def convert(self) -> bool:
        """Execute the full conversion process."""
        if not self.load_spec():
            return False

        # Create plan directory
        self.plan_dir.mkdir(parents=True, exist_ok=True)

        # Convert user stories to tasks
        parent_tasks = self.convert_user_stories_to_tasks()
        self.tasks.extend(parent_tasks)

        # Convert requirements to subtasks
        self.convert_requirements_to_subtasks(parent_tasks)

        # Generate checklist.md
        checklist_path = self.plan_dir / "checklist.md"
        with open(checklist_path, 'w') as f:
            f.write(self.generate_checklist())
        print(f"✅ Created checklist: {checklist_path}")

        # Create plan.json
        plan_json_path = self.plan_dir / "plan.json"
        with open(plan_json_path, 'w') as f:
            json.dump(self.create_plan_metadata(), f, indent=2)
        print(f"✅ Created plan.json: {plan_json_path}")

        # Copy spec to plan directory for reference
        spec_copy_path = self.plan_dir / self.spec_path.name
        import shutil
        shutil.copy2(self.spec_path, spec_copy_path)
        print(f"✅ Copied spec: {spec_copy_path}")

        return True


def main():
    parser = argparse.ArgumentParser(
        description='Convert structured spec to hierarchical plan',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert spec to plan
  %(prog)s .specs/my-project-spec.json .plans/my-project

  # Convert with verbose output
  %(prog)s --verbose spec.json plan-dir

  # Dry run (show what would be created)
  %(prog)s --dry-run spec.json plan-dir
        """
    )

    parser.add_argument('spec', help='Path to spec JSON file')
    parser.add_argument('plan_dir', help='Output plan directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Show what would be done')

    args = parser.parse_args()

    converter = SpecToPlanConverter(args.spec, args.plan_dir)

    if args.dry_run:
        print("🔍 Dry run mode - showing conversion plan:")
        if converter.load_spec():
            print(f"\nWould create plan in: {converter.plan_dir}")
            print(f"User stories: {len(converter.spec.user_stories)}")
            print(f"Requirements: {len(converter.spec.functional_requirements)}")
        return 0

    success = converter.convert()
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
