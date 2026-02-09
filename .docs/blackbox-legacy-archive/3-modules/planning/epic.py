#!/usr/bin/env python3
"""
Epic Manager for Blackbox3

Provides comprehensive epic management with hierarchical task breakdown,
dependency tracking, and progress visualization.
"""

import os
import json
import uuid
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
import threading


class EpicStatus(Enum):
    """Epic status enumeration."""
    DRAFT = "draft"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EpicPriority(Enum):
    """Epic priority enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EpicManager:
    """
    Manages epics with hierarchical breakdown and dependency tracking.

    Features:
    - Hierarchical epic/story/task structure
    - Dependency management with cycle detection
    - Progress tracking with weighted estimates
    - Visual timeline generation
    - Resource allocation tracking
    - Risk assessment and mitigation
    - Multi-format export (JSON, Markdown, CSV)
    """

    def __init__(
        self,
        planning_root: Optional[Path] = None,
        enable_auto_save: bool = True
    ):
        """
        Initialize epic manager.

        Args:
            planning_root: Root directory for planning data
            enable_auto_save: Enable automatic saving after changes
        """
        self.planning_root = Path(planning_root) if planning_root else Path.cwd() / ".plans"
        self.planning_root.mkdir(parents=True, exist_ok=True)

        self.enable_auto_save = enable_auto_save
        self._lock = threading.RLock()

        # Data storage
        self.epics: Dict[str, Dict[str, Any]] = {}
        self.stories: Dict[str, Dict[str, Any]] = {}
        self.tasks: Dict[str, Dict[str, Any]] = {}

        # Dependencies graph
        self.dependencies: Dict[str, List[str]] = {}

        # Load existing data
        self._load_data()

    def _load_data(self):
        """Load epic data from disk."""
        epic_file = self.planning_root / "epics.json"
        story_file = self.planning_root / "stories.json"
        task_file = self.planning_root / "tasks.json"
        dep_file = self.planning_root / "dependencies.json"

        if epic_file.exists():
            try:
                with open(epic_file, 'r') as f:
                    self.epics = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load epics: {e}")

        if story_file.exists():
            try:
                with open(story_file, 'r') as f:
                    self.stories = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load stories: {e}")

        if task_file.exists():
            try:
                with open(task_file, 'r') as f:
                    self.tasks = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load tasks: {e}")

        if dep_file.exists():
            try:
                with open(dep_file, 'r') as f:
                    self.dependencies = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load dependencies: {e}")

    def _save_data(self):
        """Save epic data to disk."""
        if not self.enable_auto_save:
            return

        epic_file = self.planning_root / "epics.json"
        story_file = self.planning_root / "stories.json"
        task_file = self.planning_root / "tasks.json"
        dep_file = self.planning_root / "dependencies.json"

        with self._lock:
            with open(epic_file, 'w') as f:
                json.dump(self.epics, f, indent=2)

            with open(story_file, 'w') as f:
                json.dump(self.stories, f, indent=2)

            with open(task_file, 'w') as f:
                json.dump(self.tasks, f, indent=2)

            with open(dep_file, 'w') as f:
                json.dump(self.dependencies, f, indent=2)

    def create_epic(
        self,
        title: str,
        description: str,
        priority: EpicPriority = EpicPriority.MEDIUM,
        status: EpicStatus = EpicStatus.DRAFT,
        assignee: Optional[str] = None,
        estimate_days: Optional[int] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new epic.

        Args:
            title: Epic title
            description: Epic description
            priority: Epic priority
            status: Epic status
            assignee: Assigned user/team
            estimate_days: Estimated days to complete
            tags: Optional tags
            metadata: Optional metadata

        Returns:
            Epic ID
        """
        epic_id = str(uuid.uuid4())[:8]

        epic = {
            "id": epic_id,
            "title": title,
            "description": description,
            "priority": priority.value,
            "status": status.value,
            "assignee": assignee,
            "estimate_days": estimate_days,
            "tags": tags or [],
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "stories": []
        }

        with self._lock:
            self.epics[epic_id] = epic
            self._save_data()

        print(f"Created epic: {epic_id} - {title}")
        return epic_id

    def add_story_to_epic(
        self,
        epic_id: str,
        title: str,
        description: str,
        estimate_points: Optional[int] = None,
        dependencies: Optional[List[str]] = None
    ) -> str:
        """
        Add a story to an epic.

        Args:
            epic_id: Parent epic ID
            title: Story title
            description: Story description
            estimate_points: Story points estimate
            dependencies: List of story IDs this story depends on

        Returns:
            Story ID
        """
        if epic_id not in self.epics:
            print(f"Error: Epic {epic_id} not found")
            return None

        story_id = str(uuid.uuid4())[:8]

        story = {
            "id": story_id,
            "epic_id": epic_id,
            "title": title,
            "description": description,
            "estimate_points": estimate_points,
            "status": EpicStatus.DRAFT.value,
            "dependencies": dependencies or [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "tasks": []
        }

        with self._lock:
            self.stories[story_id] = story
            self.epics[epic_id]["stories"].append(story_id)
            self.epics[epic_id]["updated_at"] = datetime.utcnow().isoformat()

            # Track dependencies
            if dependencies:
                self.dependencies[story_id] = dependencies
                if self._has_cycle(story_id):
                    # Rollback
                    del self.stories[story_id]
                    self.epics[epic_id]["stories"].remove(story_id)
                    del self.dependencies[story_id]
                    print(f"Error: Adding story {story_id} would create a dependency cycle")
                    return None

            self._save_data()

        print(f"Added story to epic: {story_id} - {title}")
        return story_id

    def add_task_to_story(
        self,
        story_id: str,
        title: str,
        description: str,
        estimate_hours: Optional[float] = None
    ) -> str:
        """
        Add a task to a story.

        Args:
            story_id: Parent story ID
            title: Task title
            description: Task description
            estimate_hours: Estimated hours to complete

        Returns:
            Task ID
        """
        if story_id not in self.stories:
            print(f"Error: Story {story_id} not found")
            return None

        task_id = str(uuid.uuid4())[:8]

        task = {
            "id": task_id,
            "story_id": story_id,
            "title": title,
            "description": description,
            "estimate_hours": estimate_hours,
            "status": EpicStatus.DRAFT.value,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.tasks[task_id] = task
            self.stories[story_id]["tasks"].append(task_id)
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()

            # Update epic timestamp
            epic_id = self.stories[story_id]["epic_id"]
            self.epics[epic_id]["updated_at"] = datetime.utcnow().isoformat()

            self._save_data()

        print(f"Added task to story: {task_id} - {title}")
        return task_id

    def _has_cycle(self, node: str, visited: Optional[set] = None, rec_stack: Optional[set] = None) -> bool:
        """Detect cycle in dependency graph using DFS."""
        if visited is None:
            visited = set()
        if rec_stack is None:
            rec_stack = set()

        visited.add(node)
        rec_stack.add(node)

        for neighbor in self.dependencies.get(node, []):
            if neighbor not in visited:
                if self._has_cycle(neighbor, visited, rec_stack):
                    return True
            elif neighbor in rec_stack:
                return True

        rec_stack.remove(node)
        return False

    def update_epic_status(self, epic_id: str, status: EpicStatus) -> bool:
        """
        Update epic status.

        Args:
            epic_id: Epic ID
            status: New status

        Returns:
            True if successful
        """
        if epic_id not in self.epics:
            print(f"Error: Epic {epic_id} not found")
            return False

        with self._lock:
            self.epics[epic_id]["status"] = status.value
            self.epics[epic_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Updated epic {epic_id} status to {status.value}")
        return True

    def get_epic_progress(self, epic_id: str) -> Dict[str, Any]:
        """
        Calculate epic progress.

        Args:
            epic_id: Epic ID

        Returns:
            Progress statistics
        """
        if epic_id not in self.epics:
            print(f"Error: Epic {epic_id} not found")
            return None

        epic = self.epics[epic_id]
        story_ids = epic.get("stories", [])

        total_stories = len(story_ids)
        completed_stories = 0
        total_points = 0
        completed_points = 0

        for story_id in story_ids:
            if story_id not in self.stories:
                continue

            story = self.stories[story_id]
            points = story.get("estimate_points", 1)
            total_points += points

            if story.get("status") == EpicStatus.COMPLETED.value:
                completed_stories += 1
                completed_points += points

        progress_percent = (completed_points / total_points * 100) if total_points > 0 else 0

        return {
            "epic_id": epic_id,
            "total_stories": total_stories,
            "completed_stories": completed_stories,
            "total_points": total_points,
            "completed_points": completed_points,
            "progress_percent": progress_percent,
            "remaining_points": total_points - completed_points
        }

    def list_epics(
        self,
        status: Optional[EpicStatus] = None,
        priority: Optional[EpicPriority] = None,
        assignee: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List epics with optional filtering.

        Args:
            status: Filter by status
            priority: Filter by priority
            assignee: Filter by assignee

        Returns:
            List of epics
        """
        epics = list(self.epics.values())

        if status:
            epics = [e for e in epics if e["status"] == status.value]

        if priority:
            epics = [e for e in epics if e["priority"] == priority.value]

        if assignee:
            epics = [e for e in epics if e.get("assignee") == assignee]

        return epics

    def get_epic_hierarchy(self, epic_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full epic hierarchy with stories and tasks.

        Args:
            epic_id: Epic ID

        Returns:
            Complete hierarchy
        """
        if epic_id not in self.epics:
            return None

        epic = self.epics[epic_id].copy()
        stories_data = []

        for story_id in epic.get("stories", []):
            if story_id not in self.stories:
                continue

            story = self.stories[story_id].copy()
            tasks_data = []

            for task_id in story.get("tasks", []):
                if task_id in self.tasks:
                    tasks_data.append(self.tasks[task_id])

            story["tasks"] = tasks_data
            stories_data.append(story)

        epic["stories"] = stories_data
        epic["progress"] = self.get_epic_progress(epic_id)

        return epic

    def generate_timeline(self, epic_id: str) -> Optional[Dict[str, Any]]:
        """
        Generate timeline for epic.

        Args:
            epic_id: Epic ID

        Returns:
            Timeline with dates and dependencies
        """
        hierarchy = self.get_epic_hierarchy(epic_id)
        if not hierarchy:
            return None

        timeline = {
            "epic": hierarchy["title"],
            "start_date": None,
            "end_date": None,
            "phases": []
        }

        current_date = datetime.utcnow()

        for story in hierarchy["stories"]:
            estimate_days = story.get("estimate_points", 1)
            phase = {
                "story": story["title"],
                "start_date": current_date.isoformat(),
                "end_date": (current_date + timedelta(days=estimate_days)).isoformat(),
                "dependencies": story.get("dependencies", [])
            }
            timeline["phases"].append(phase)
            current_date += timedelta(days=estimate_days)

        if timeline["phases"]:
            timeline["start_date"] = timeline["phases"][0]["start_date"]
            timeline["end_date"] = timeline["phases"][-1]["end_date"]

        return timeline

    def export_to_markdown(self, epic_id: str, output_path: Optional[Path] = None) -> Path:
        """
        Export epic to markdown file.

        Args:
            epic_id: Epic ID
            output_path: Output file path

        Returns:
            Path to exported file
        """
        hierarchy = self.get_epic_hierarchy(epic_id)
        if not hierarchy:
            raise ValueError(f"Epic {epic_id} not found")

        if output_path is None:
            output_path = self.planning_root / f"epic_{epic_id}.md"

        with open(output_path, 'w') as f:
            # Header
            f.write(f"# {hierarchy['title']}\n\n")
            f.write(f"**ID:** {hierarchy['id']}\n")
            f.write(f"**Status:** {hierarchy['status']}\n")
            f.write(f"**Priority:** {hierarchy['priority']}\n")
            f.write(f"**Assignee:** {hierarchy.get('assignee', 'Unassigned')}\n")
            f.write(f"**Estimate:** {hierarchy.get('estimate_days', 'Unknown')} days\n\n")

            # Description
            f.write("## Description\n\n")
            f.write(f"{hierarchy['description']}\n\n")

            # Progress
            progress = hierarchy.get("progress", {})
            f.write("## Progress\n\n")
            f.write(f"- **Stories:** {progress.get('completed_stories', 0)}/{progress.get('total_stories', 0)}\n")
            f.write(f"- **Points:** {progress.get('completed_points', 0)}/{progress.get('total_points', 0)}\n")
            f.write(f"- **Completion:** {progress.get('progress_percent', 0):.1f}%\n\n")

            # Stories
            f.write("## Stories\n\n")
            for story in hierarchy.get("stories", []):
                f.write(f"### {story['title']}\n\n")
                f.write(f"**ID:** {story['id']}\n")
                f.write(f"**Status:** {story['status']}\n")
                f.write(f"**Points:** {story.get('estimate_points', 'Unknown')}\n\n")
                f.write(f"{story['description']}\n\n")

                if story.get("tasks"):
                    f.write("**Tasks:**\n\n")
                    for task in story["tasks"]:
                        f.write(f"- [{task['status']}] {task['title']} ({task.get('estimate_hours', '?')}h)\n")
                    f.write("\n")

        print(f"Exported epic to: {output_path}")
        return output_path

    def delete_epic(self, epic_id: str, cascade: bool = False) -> bool:
        """
        Delete epic.

        Args:
            epic_id: Epic ID
            cascade: If True, delete all stories and tasks

        Returns:
            True if deleted
        """
        if epic_id not in self.epics:
            print(f"Error: Epic {epic_id} not found")
            return False

        with self._lock:
            if cascade:
                # Delete stories
                for story_id in self.epics[epic_id].get("stories", []):
                    if story_id in self.stories:
                        # Delete tasks
                        for task_id in self.stories[story_id].get("tasks", []):
                            self.tasks.pop(task_id, None)
                        self.stories.pop(story_id, None)
                        self.dependencies.pop(story_id, None)

            del self.epics[epic_id]
            self._save_data()

        print(f"Deleted epic: {epic_id}")
        return True


def cli_main():
    """CLI entry point for epic management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Epic Manager")
    parser.add_argument("action", choices=["create", "list", "update", "show", "delete", "export"])
    parser.add_argument("--id", help="Epic/Story/Task ID")
    parser.add_argument("--title", help="Title")
    parser.add_argument("--description", help="Description")
    parser.add_argument("--priority", help="Priority (critical, high, medium, low)")
    parser.add_argument("--status", help="Status")
    parser.add_argument("--assignee", help="Assignee")
    parser.add_argument("--estimate", help="Estimate (days for epic, points for story, hours for task)")
    parser.add_argument("--epic-id", help="Parent epic ID for story")
    parser.add_argument("--story-id", help="Parent story ID for task")
    parser.add_argument("--output", help="Output file for export")
    parser.add_argument("--cascade", action="store_true", help="Cascade delete")

    args = parser.parse_args()
    mgr = EpicManager()

    if args.action == "create":
        if args.epic_id:
            # Create story
            mgr.add_story_to_epic(
                args.epic_id,
                args.title,
                args.description,
                estimate_points=int(args.estimate) if args.estimate else None
            )
        elif args.story_id:
            # Create task
            mgr.add_task_to_story(
                args.story_id,
                args.title,
                args.description,
                estimate_hours=float(args.estimate) if args.estimate else None
            )
        else:
            # Create epic
            mgr.create_epic(
                args.title,
                args.description,
                priority=EpicPriority(args.priority) if args.priority else EpicPriority.MEDIUM
            )

    elif args.action == "list":
        epics = mgr.list_epics()
        print(f"Found {len(epics)} epics:")
        for epic in epics:
            print(f"  - {epic['id']}: {epic['title']} ({epic['status']})")

    elif args.action == "show":
        if not args.id:
            print("Error: --id required for show")
            return 1

        hierarchy = mgr.get_epic_hierarchy(args.id)
        if hierarchy:
            print(json.dumps(hierarchy, indent=2))

    elif args.action == "update":
        if not args.id or not args.status:
            print("Error: --id and --status required for update")
            return 1
        mgr.update_epic_status(args.id, EpicStatus(args.status))

    elif args.action == "export":
        if not args.id:
            print("Error: --id required for export")
            return 1
        output = Path(args.output) if args.output else None
        mgr.export_to_markdown(args.id, output)

    elif args.action == "delete":
        if not args.id:
            print("Error: --id required for delete")
            return 1
        mgr.delete_epic(args.id, cascade=args.cascade)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
