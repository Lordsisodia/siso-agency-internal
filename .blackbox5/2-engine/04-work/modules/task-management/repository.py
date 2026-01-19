"""
Task Repository - Storage and retrieval of tasks

Manages task files stored as YAML frontmatter + markdown.
"""

import yaml
import re
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict

from .parser import TaskParser, ParsedTask


class TaskRepository:
    """
    Repository for task storage and retrieval.

    Stores tasks as:
    .blackbox5/tasks/
    ├── backlog/           # Not yet prioritized
    ├── active/            # Currently in progress
    ├── review/            # Awaiting review
    ├── done/              # Completed
    └── archived/          # Old/deferred
    """

    def __init__(self, base_path: Path = None):
        if base_path is None:
            base_path = Path(".blackbox5/tasks")

        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

        # Create status directories
        for status in ['backlog', 'active', 'review', 'done', 'archived']:
            (self.base_path / status).mkdir(exist_ok=True)

        self.parser = TaskParser()

    def create_task(
        self,
        title: str,
        description: str,
        category: str = "feature",
        priority: str = "medium",
        tags: List[str] = None,
        tech_stack: List[str] = None,
        domain: str = "",
        subcategory: str = "",
        risk_level: str = "medium",
        metadata: Dict = None
    ) -> ParsedTask:
        """
        Create a new task.

        Args:
            title: Task title
            description: Task description
            category: Task category (feature, bugfix, etc.)
            priority: Task priority (critical, high, medium, low)
            tags: Optional tags
            tech_stack: Technologies involved
            domain: Technical domain
            subcategory: Task subcategory
            risk_level: Risk level (critical, high, medium, low)
            metadata: Additional metadata

        Returns:
            Created ParsedTask
        """
        # Generate task ID
        task_id = self._generate_task_id()

        # Create YAML frontmatter
        frontmatter = {
            'id': task_id,
            'title': title,
            'status': 'proposed',
            'priority': priority,
            'category': category,
            'subcategory': subcategory,
            'domain': domain,
            'tech_stack': tech_stack or [],
            'risk_level': risk_level,
            'confidence': 0.5,
            'tags': tags or [],
            'created_at': datetime.now().isoformat(),
            'created_by': 'human',
            'metadata': metadata or {},

            # Will be calculated by analyzer
            'tier': None,
            'workflow': None,
            'complexity': None,
            'estimated_hours': None,

            # Relationships
            'relates_to': [],
            'blocks': [],
            'blocked_by': [],
            'depends_on': [],
            'parent_prd': None,
            'parent_epic': None,
        }

        # Create markdown body
        body = f"""# Overview

{description}

## Context

### Why This Task
[To be filled]

### Business Value
[To be filled]

## Technical Approach

[To be filled]

## Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]

## Implementation Notes
[To be filled]
"""

        # Combine frontmatter + body
        content = f"---\n{yaml.dump(frontmatter, default_flow_style=False)}---{body}"

        # Save to backlog
        task_path = self.base_path / "backlog" / f"{task_id}.md"
        task_path.write_text(content)

        # Parse and return
        return self.parser.parse(task_path)

    def get_task(self, task_id: str) -> Optional[ParsedTask]:
        """
        Get task by ID.

        Searches all status directories.

        Args:
            task_id: Task ID (e.g., TASK-2026-01-18-001)

        Returns:
            ParsedTask if found, None otherwise
        """
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            task_path = self.base_path / status_dir / f"{task_id}.md"
            if task_path.exists():
                return self.parser.parse(task_path)

        return None

    def list_tasks(
        self,
        status: str = None,
        category: str = None,
        priority: str = None,
        tags: List[str] = None
    ) -> List[ParsedTask]:
        """
        List tasks with optional filtering.

        Args:
            status: Filter by status (backlog, active, review, done, archived)
            category: Filter by category
            priority: Filter by priority
            tags: Filter by tags (any match)

        Returns:
            List of ParsedTask matching filters
        """
        results = []

        status_dirs = [status] if status else ['backlog', 'active', 'review', 'done', 'archived']

        for status_dir in status_dirs:
            dir_path = self.base_path / status_dir
            if not dir_path.exists():
                continue

            for task_file in dir_path.glob("TASK-*.md"):
                try:
                    task = self.parser.parse(task_file)

                    # Apply filters
                    if category and task.category != category:
                        continue
                    if priority and task.priority != priority:
                        continue
                    if tags and not any(tag in task.tags for tag in tags):
                        continue

                    results.append(task)

                except Exception as e:
                    print(f"Warning: Could not parse {task_file}: {e}")

        # Sort by created_at (newest first)
        results.sort(key=lambda t: t.created_at, reverse=True)

        return results

    def update_task(
        self,
        task_id: str,
        title: str = None,
        description: str = None,
        status: str = None,
        priority: str = None,
        tags: List[str] = None
    ) -> Optional[ParsedTask]:
        """
        Update task fields.

        Args:
            task_id: Task ID
            title: New title
            description: New description
            status: New status (will move file to appropriate directory)
            priority: New priority
            tags: New tags

        Returns:
            Updated ParsedTask if found, None otherwise
        """
        task = self.get_task(task_id)
        if not task:
            return None

        # Find current file
        old_path = None
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            path = self.base_path / status_dir / f"{task_id}.md"
            if path.exists():
                old_path = path
                break

        if not old_path:
            return None

        # If status changed, move file
        new_status = status or task.status
        new_path = self.base_path / new_status / f"{task_id}.md"

        # Build updates
        updates = {}
        if title is not None:
            updates['title'] = title
        if priority is not None:
            updates['priority'] = priority
        if tags is not None:
            updates['tags'] = tags
        if status is not None:
            updates['status'] = status

        # Update frontmatter
        self.parser.update_frontmatter(old_path, updates)

        # Move file if status changed
        if status and old_path.parent.name != status:
            old_path.rename(new_path)

        return self.get_task(task_id)

    def update_task_status(self, task_id: str, new_status: str) -> Optional[ParsedTask]:
        """
        Update task status and move to appropriate directory.

        Args:
            task_id: Task ID
            new_status: New status (backlog, active, review, done, archived)

        Returns:
            Updated ParsedTask if found, None otherwise
        """
        return self.update_task(task_id, status=new_status)

    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task.

        Args:
            task_id: Task ID

        Returns:
            True if deleted, False if not found
        """
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            task_path = self.base_path / status_dir / f"{task_id}.md"
            if task_path.exists():
                task_path.unlink()
                return True

        return False

    def search_tasks(self, query: str) -> List[ParsedTask]:
        """
        Search tasks by title, description, or tags.

        Args:
            query: Search query

        Returns:
            List of matching tasks
        """
        query_lower = query.lower()
        results = []

        for task in self.list_tasks():
            # Search in title
            if query_lower in task.title.lower():
                results.append(task)
                continue

            # Search in description
            if query_lower in task.description.lower():
                results.append(task)
                continue

            # Search in tags
            if any(query_lower in tag.lower() for tag in task.tags):
                results.append(task)
                continue

            # Search in content
            if query_lower in task.content.lower():
                results.append(task)

        return results

    def _generate_task_id(self) -> str:
        """Generate unique task ID."""
        today = datetime.now().strftime('%Y-%m-%d')

        # Count existing tasks for today
        count = 0
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            dir_path = self.base_path / status_dir
            if dir_path.exists():
                for task_file in dir_path.glob(f"TASK-{today}-*.md"):
                    count += 1

        # Generate ID
        number = str(count + 1).zfill(3)
        return f"TASK-{today}-{number}"
