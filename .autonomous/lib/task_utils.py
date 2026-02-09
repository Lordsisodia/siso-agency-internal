#!/usr/bin/env python3
"""
Task Utilities for SISO-Internal Autonomous System

Provides task management, parsing, and state transition functionality.
Adapted from BlackBox5 RALF-Core task system.
"""

import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum


class TaskStatus(Enum):
    """Task lifecycle states."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    ABANDONED = "abandoned"


class TaskPriority(Enum):
    """Task priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Task:
    """Represents a single task."""
    id: str
    title: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    created: datetime = field(default_factory=datetime.now)
    started: Optional[datetime] = None
    completed: Optional[datetime] = None
    description: str = ""
    success_criteria: List[str] = field(default_factory=list)
    context: str = ""
    approach: List[str] = field(default_factory=list)
    risk_level: str = "low"
    rollback_strategy: str = ""
    file_path: Optional[Path] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "status": self.status.value,
            "priority": self.priority.value,
            "created": self.created.isoformat() if self.created else None,
            "started": self.started.isoformat() if self.started else None,
            "completed": self.completed.isoformat() if self.completed else None,
            "description": self.description,
            "success_criteria": self.success_criteria,
            "context": self.context,
            "approach": self.approach,
            "risk_level": self.risk_level,
            "rollback_strategy": self.rollback_strategy,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        """Create task from dictionary."""
        return cls(
            id=data.get("id", ""),
            title=data.get("title", ""),
            status=TaskStatus(data.get("status", "pending")),
            priority=TaskPriority(data.get("priority", "medium")),
            created=datetime.fromisoformat(data["created"]) if data.get("created") else None,
            started=datetime.fromisoformat(data["started"]) if data.get("started") else None,
            completed=datetime.fromisoformat(data["completed"]) if data.get("completed") else None,
            description=data.get("description", ""),
            success_criteria=data.get("success_criteria", []),
            context=data.get("context", ""),
            approach=data.get("approach", []),
            risk_level=data.get("risk_level", "low"),
            rollback_strategy=data.get("rollback_strategy", ""),
            metadata=data.get("metadata", {}),
        )


class TaskManager:
    """Manages task lifecycle and storage."""

    def __init__(self, autonomous_root: Optional[Path] = None):
        """Initialize task manager."""
        if autonomous_root is None:
            autonomous_root = Path(__file__).parent.parent
        self.autonomous_root = Path(autonomous_root)
        self.tasks_dir = self.autonomous_root / "tasks"
        self.active_dir = self.tasks_dir / "active"
        self.completed_dir = self.tasks_dir / "completed"

    def _parse_task_file(self, file_path: Path) -> Optional[Task]:
        """Parse a task markdown file."""
        try:
            content = file_path.read_text()

            # Extract YAML frontmatter if present
            frontmatter = {}
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    try:
                        frontmatter = yaml.safe_load(parts[1]) or {}
                    except yaml.YAMLError:
                        pass

            # Parse task ID from filename
            task_id = file_path.stem

            # Extract title from first heading
            title_match = re.search(r"^#\s*(.+)$", content, re.MULTILINE)
            title = title_match.group(1) if title_match else task_id

            # Extract status
            status = TaskStatus.PENDING
            status_match = re.search(r"\*\*Status:\*\*\s*(\w+)", content, re.IGNORECASE)
            if status_match:
                status_str = status_match.group(1).lower()
                try:
                    status = TaskStatus(status_str.replace(" ", "_"))
                except ValueError:
                    pass

            # Extract priority
            priority = TaskPriority.MEDIUM
            priority_match = re.search(r"\*\*Priority:\*\*\s*(\w+)", content, re.IGNORECASE)
            if priority_match:
                priority_str = priority_match.group(1).lower()
                try:
                    priority = TaskPriority(priority_str)
                except ValueError:
                    pass

            # Extract success criteria
            success_criteria = []
            criteria_match = re.search(
                r"## Success Criteria\s*\n((?:- \[.\].*\n?)+)", content
            )
            if criteria_match:
                criteria_text = criteria_match.group(1)
                for line in criteria_text.split("\n"):
                    if line.strip().startswith("- ["):
                        criterion = re.sub(r"^- \[[ x]\]\s*", "", line.strip())
                        if criterion:
                            success_criteria.append(criterion)

            return Task(
                id=task_id,
                title=title,
                status=status,
                priority=priority,
                success_criteria=success_criteria,
                file_path=file_path,
                metadata=frontmatter,
            )

        except Exception as e:
            print(f"Error parsing task file {file_path}: {e}")
            return None

    def load_task(self, task_id: str) -> Optional[Task]:
        """Load a specific task by ID."""
        # Check active directory
        active_file = self.active_dir / f"{task_id}.md"
        if active_file.exists():
            return self._parse_task_file(active_file)

        # Check completed directory
        completed_file = self.completed_dir / f"{task_id}.md"
        if completed_file.exists():
            return self._parse_task_file(completed_file)

        return None

    def load_all_tasks(self) -> List[Task]:
        """Load all tasks from active and completed directories."""
        tasks = []

        # Load active tasks
        if self.active_dir.exists():
            for task_file in self.active_dir.glob("*.md"):
                if task_file.name not in ["index.md", "TEMPLATE.md", "README.md"]:
                    task = self._parse_task_file(task_file)
                    if task:
                        tasks.append(task)

        # Load completed tasks
        if self.completed_dir.exists():
            for task_file in self.completed_dir.glob("*.md"):
                task = self._parse_task_file(task_file)
                if task:
                    tasks.append(task)

        return tasks

    def load_active_tasks(self) -> List[Task]:
        """Load only active (pending/in_progress) tasks."""
        tasks = []
        if self.active_dir.exists():
            for task_file in self.active_dir.glob("*.md"):
                if task_file.name not in ["index.md", "TEMPLATE.md", "README.md"]:
                    task = self._parse_task_file(task_file)
                    if task and task.status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]:
                        tasks.append(task)
        return tasks

    def transition_status(self, task_id: str, new_status: TaskStatus) -> bool:
        """Transition a task to a new status."""
        task = self.load_task(task_id)
        if not task:
            return False

        # Update the file
        if task.file_path and task.file_path.exists():
            content = task.file_path.read_text()

            # Update status line
            old_status_str = task.status.value.replace("_", " ")
            new_status_str = new_status.value.replace("_", " ")

            content = re.sub(
                r"(\*\*Status:\*\*\s*)" + re.escape(old_status_str),
                r"\1" + new_status_str,
                content,
                flags=re.IGNORECASE,
            )

            task.file_path.write_text(content)

            # Move file between directories if needed
            if new_status == TaskStatus.COMPLETED and "active" in str(task.file_path):
                new_path = self.completed_dir / task.file_path.name
                task.file_path.rename(new_path)

            return True

        return False

    def get_next_task(self) -> Optional[Task]:
        """Get the next available task to work on."""
        active_tasks = self.load_active_tasks()

        # Filter to pending tasks only
        pending = [t for t in active_tasks if t.status == TaskStatus.PENDING]

        if not pending:
            return None

        # Sort by priority (critical > high > medium > low)
        priority_order = {
            TaskPriority.CRITICAL: 0,
            TaskPriority.HIGH: 1,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 3,
        }

        pending.sort(key=lambda t: priority_order.get(t.priority, 999))
        return pending[0]

    def create_task(self, task_id: str, title: str, **kwargs) -> Task:
        """Create a new task file from template."""
        task = Task(
            id=task_id,
            title=title,
            **kwargs,
        )

        # Generate task file content
        content = self._generate_task_content(task)

        # Write to active directory
        task_file = self.active_dir / f"{task_id}.md"
        task_file.write_text(content)
        task.file_path = task_file

        return task

    def _generate_task_content(self, task: Task) -> str:
        """Generate markdown content for a task."""
        lines = [
            f"# {task.id}: {task.title}",
            "",
            f"**Status:** {task.status.value}",
            f"**Priority:** {task.priority.value}",
            f"**Created:** {task.created.isoformat() if task.created else datetime.now().isoformat()}",
            "",
            "---",
            "",
            "## Objective",
            "",
            task.description or "Clear one-sentence goal.",
            "",
            "## Success Criteria",
            "",
        ]

        if task.success_criteria:
            for criterion in task.success_criteria:
                lines.append(f"- [ ] {criterion}")
        else:
            lines.extend([
                "- [ ] Criterion 1",
                "- [ ] Criterion 2",
            ])

        lines.extend([
            "",
            "## Context",
            "",
            task.context or "Background information needed to complete the task.",
            "",
            "## Approach",
            "",
        ])

        if task.approach:
            for i, step in enumerate(task.approach, 1):
                lines.append(f"{i}. {step}")
        else:
            lines.extend([
                "1. Step 1",
                "2. Step 2",
            ])

        lines.extend([
            "",
            "## Rollback Strategy",
            "",
            task.rollback_strategy or "How to undo if things go wrong.",
            "",
            "---",
            "",
            "## Completion",
            "",
            "**Completed:**",
            "**Run Folder:**",
            "**Agent:**",
            "**Path Used:**",
            "**Phase Gates:**",
            "**Decisions Recorded:**",
            "",
        ])

        return "\n".join(lines)


def get_task_manager() -> TaskManager:
    """Get the default task manager instance."""
    return TaskManager()


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    manager = get_task_manager()

    if len(sys.argv) < 2:
        print("Usage: python task_utils.py [list|next|status <task-id>]")
        sys.exit(1)

    command = sys.argv[1]

    if command == "list":
        tasks = manager.load_all_tasks()
        print(f"\n{'ID':<30} {'Status':<15} {'Priority':<10} Title")
        print("-" * 80)
        for task in sorted(tasks, key=lambda t: t.status.value):
            print(f"{task.id:<30} {task.status.value:<15} {task.priority.value:<10} {task.title}")
        print()

    elif command == "next":
        task = manager.get_next_task()
        if task:
            print(f"\nNext task: {task.id}")
            print(f"Title: {task.title}")
            print(f"Priority: {task.priority.value}")
            print(f"File: {task.file_path}")
        else:
            print("\nNo pending tasks found.")

    elif command == "status" and len(sys.argv) > 2:
        task_id = sys.argv[2]
        task = manager.load_task(task_id)
        if task:
            print(f"\nTask: {task.id}")
            print(f"Title: {task.title}")
            print(f"Status: {task.status.value}")
            print(f"Priority: {task.priority.value}")
            print(f"Success Criteria:")
            for criterion in task.success_criteria:
                print(f"  - {criterion}")
        else:
            print(f"Task {task_id} not found.")

    else:
        print(f"Unknown command: {command}")
