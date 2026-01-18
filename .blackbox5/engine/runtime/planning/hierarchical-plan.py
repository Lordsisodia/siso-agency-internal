#!/usr/bin/env python3
"""
Hierarchical Plan Management
Extends checklist.md with parent-child task relationships
"""

import sys
import os
import json
import re
from pathlib import Path
from typing import List, Dict, Optional

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib', 'hierarchical-tasks'))
from hierarchical_task import HierarchicalTask


class HierarchicalPlanManager:
    """Manage hierarchical plans in Blackbox4."""

    def __init__(self, plan_dir: str):
        self.plan_dir = Path(plan_dir)
        self.checklist_path = self.plan_dir / "checklist.md"
        self.tasks: List[HierarchicalTask] = []
        self.root_tasks: List[HierarchicalTask] = []

    def load_from_checklist(self) -> List[HierarchicalTask]:
        """Load and parse hierarchical tasks from checklist.md"""
        if not self.checklist_path.exists():
            return []

        tasks = []
        task_stack = []  # Stack for tracking parent tasks

        with open(self.checklist_path) as f:
            for line in f:
                # Skip empty lines and headers
                if not line.strip() or line.strip().startswith('#'):
                    continue

                # Parse indentation level
                indent = len(line) - len(line.lstrip())
                depth = indent // 2  # 2 spaces per level

                # Parse task line: "- [ ] Task description" or "- [x] Completed task"
                task_match = re.match(r'^[\s]*-\s*\[\s*([x\s])\s*\](.+)', line)
                if task_match:
                    status_char = task_match.group(1).strip()
                    description = task_match.group(2).strip()
                    completed = (status_char == 'x')

                    # Create task
                    task = HierarchicalTask(
                        description=description,
                        completed=completed,
                        metadata={'checklist_line': line.rstrip()}
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

                    tasks.append(task)

        self.tasks = tasks
        self.root_tasks = [t for t in tasks if t.parent_task is None]
        return tasks

    def save_to_checklist(self, tasks: Optional[List[HierarchicalTask]] = None):
        """Save hierarchical tasks to checklist.md"""
        tasks = tasks or self.tasks

        with open(self.checklist_path, 'w') as f:
            # Write header
            f.write(f"# Tasks\n\n")

            # Write tasks hierarchically
            def write_task(task: HierarchicalTask, level=0):
                indent = "  " * level
                status = "x" if task.completed else " "
                f.write(f"{indent}- [{status}] {task.description}\n")

                # Write children
                for child in task.children:
                    write_task(child, level + 1)

            for root_task in self.root_tasks:
                write_task(root_task)

    def add_task(self, description: str, parent_id: Optional[str] = None, expected_output: str = ""):
        """Add a new task to the plan."""
        # Find parent if specified
        parent = None
        if parent_id:
            for task in self.tasks:
                if task.id == parent_id:
                    parent = task
                    break

        # Create new task
        new_task = HierarchicalTask(
            description=description,
            expected_output=expected_output,
            parent_task=parent
        )

        self.tasks.append(new_task)
        if not parent:
            self.root_tasks.append(new_task)

        return new_task

    def get_task_by_id(self, task_id: str) -> Optional[HierarchicalTask]:
        """Find a task by ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def mark_complete(self, task_id: str, complete: bool = True):
        """Mark a task as complete/incomplete."""
        task = self.get_task_by_id(task_id)
        if task:
            task.completed = complete

    def get_execution_order(self) -> List[HierarchicalTask]:
        """Get tasks in execution order (parents before children)."""
        visited = set()
        order = []

        def visit(task: HierarchicalTask):
            if task.id in visited:
                return
            visited.add(task.id)

            # Visit dependencies first
            for dep in task.context:
                visit(dep)

            order.append(task)

        for task in self.tasks:
            visit(task)

        return order

    def validate_hierarchy(self) -> Dict[str, any]:
        """Validate task hierarchy and return report."""
        issues = []
        warnings = []

        # Check for orphaned tasks (should have parent or be root)
        orphan_count = sum(1 for t in self.tasks if t.parent_task is None and t not in self.root_tasks)
        if orphan_count > 0:
            issues.append(f"Found {orphan_count} orphaned tasks")

        # Check for circular dependencies
        visited = set()
        for task in self.tasks:
            if task.id in visited:
                continue
            path = set()
            current = task
            while current:
                if current.id in path:
                    issues.append(f"Circular dependency detected: {current.description}")
                    break
                path.add(current.id)
                visited.add(current.id)
                current = current.parent_task

        # Check depth
        max_depth = max((t.get_depth() for t in self.tasks), default=0)
        if max_depth > 5:
            warnings.append(f"Maximum depth is {max_depth} (consider flattening)")

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'warnings': warnings,
            'stats': {
                'total_tasks': len(self.tasks),
                'root_tasks': len(self.root_tasks),
                'max_depth': max_depth,
                'completed': sum(1 for t in self.tasks if t.completed)
            }
        }

    def export_json(self, output_file: str):
        """Export plan to JSON format."""
        data = {
            'plan_dir': str(self.plan_dir),
            'tasks': [task.to_dict() for task in self.tasks],
            'root_tasks': [t.id for t in self.root_tasks]
        }

        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)

    def import_json(self, input_file: str):
        """Import plan from JSON format."""
        with open(input_file) as f:
            data = json.load(f)

        # Reconstruct tasks (simplified - would need full implementation)
        self.tasks = []
        self.root_tasks = []

        for task_data in data['tasks']:
            task = HierarchicalTask(
                description=task_data['description'],
                expected_output=task_data.get('expected_output', ''),
                completed=task_data.get('completed', False),
                metadata=task_data.get('metadata', {})
            )
            self.tasks.append(task)

        self.root_tasks = [t for t in self.tasks if t.id in data['root_tasks']]


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Hierarchical plan management')
    parser.add_argument('plan_dir', help='Path to plan directory')

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Load command
    subparsers.add_parser('load', help='Load plan from checklist.md')

    # Validate command
    subparsers.add_parser('validate', help='Validate task hierarchy')

    # Add task command
    add_parser = subparsers.add_parser('add', help='Add a new task')
    add_parser.add_argument('--description', required=True, help='Task description')
    add_parser.add_argument('--parent', help='Parent task ID')
    add_parser.add_argument('--output', help='Expected output')

    # Complete command
    complete_parser = subparsers.add_parser('complete', help='Mark task complete')
    complete_parser.add_argument('--task-id', required=True, help='Task ID')
    complete_parser.add_argument('--undo', action='store_true', help='Mark as incomplete')

    # Export command
    export_parser = subparsers.add_parser('export', help='Export to JSON')
    export_parser.add_argument('--output', required=True, help='Output JSON file')

    # Import command
    import_parser = subparsers.add_parser('import', help='Import from JSON')
    import_parser.add_argument('--input', required=True, help='Input JSON file')

    args = parser.parse_args()

    # Create manager
    manager = HierarchicalPlanManager(args.plan_dir)

    if args.command == 'load':
        tasks = manager.load_from_checklist()
        print(f"Loaded {len(tasks)} tasks, {len(manager.root_tasks)} root tasks")
        for task in tasks:
            print(task.to_checklist_item())

    elif args.command == 'validate':
        manager.load_from_checklist()
        report = manager.validate_hierarchy()

        print(f"Validation: {'✅ VALID' if report['valid'] else '❌ INVALID'}")
        print(f"Statistics:")
        print(f"  Total tasks: {report['stats']['total_tasks']}")
        print(f"  Root tasks: {report['stats']['root_tasks']}")
        print(f"  Max depth: {report['stats']['max_depth']}")
        print(f"  Completed: {report['stats']['completed']}")

        if report['issues']:
            print(f"\nIssues:")
            for issue in report['issues']:
                print(f"  ❌ {issue}")

        if report['warnings']:
            print(f"\nWarnings:")
            for warning in report['warnings']:
                print(f"  ⚠️  {warning}")

    elif args.command == 'add':
        manager.load_from_checklist()
        new_task = manager.add_task(
            description=args.description,
            parent_id=args.parent,
            expected_output=args.output or ""
        )
        manager.save_to_checklist()
        print(f"✅ Added task: {new_task.description} (ID: {new_task.id})")

    elif args.command == 'complete':
        manager.load_from_checklist()
        manager.mark_complete(args.task_id, complete=not args.undo)
        manager.save_to_checklist()
        status = "completed" if not args.undo else "uncompleted"
        print(f"✅ Task {args.task_id} marked as {status}")

    elif args.command == 'export':
        manager.load_from_checklist()
        manager.export_json(args.output)
        print(f"✅ Exported to {args.output}")

    elif args.command == 'import':
        manager.import_json(args.input)
        manager.save_to_checklist()
        print(f"✅ Imported from {args.input}")


if __name__ == '__main__':
    main()
