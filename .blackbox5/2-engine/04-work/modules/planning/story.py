#!/usr/bin/env python3
"""
Story Manager for Blackbox3

Provides detailed story management with acceptance criteria,
task breakdown, and definition of done tracking.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
import threading


class StoryStatus(Enum):
    """Story status enumeration."""
    BACKLOG = "backlog"
    REFINED = "refined"
    ESTIMATED = "estimated"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"


class StoryType(Enum):
    """Story type enumeration."""
    FEATURE = "feature"
    BUGFIX = "bugfix"
    CHORE = "chore"
    SPIKE = "spike"
    REFACTOR = "refactor"


class StoryManager:
    """
    Manages user stories with acceptance criteria and technical details.

    Features:
    - Acceptance criteria tracking
    - Definition of done checklist
    - Story estimation and planning
    - Technical task breakdown
    - Story spike/research support
    - Peer review assignment
    - Test coverage tracking
    """

    def __init__(self, planning_root: Optional[Path] = None):
        """
        Initialize story manager.

        Args:
            planning_root: Root directory for planning data
        """
        self.planning_root = Path(planning_root) if planning_root else Path.cwd() / ".plans"
        self.planning_root.mkdir(parents=True, exist_ok=True)

        self._lock = threading.RLock()
        self.stories: Dict[str, Dict[str, Any]] = {}

        # Load existing stories
        self._load_stories()

    def _load_stories(self):
        """Load stories from disk."""
        story_file = self.planning_root / "stories_detailed.json"
        if story_file.exists():
            try:
                with open(story_file, 'r') as f:
                    self.stories = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load stories: {e}")

    def _save_stories(self):
        """Save stories to disk."""
        story_file = self.planning_root / "stories_detailed.json"
        with self._lock:
            with open(story_file, 'w') as f:
                json.dump(self.stories, f, indent=2)

    def create_story(
        self,
        title: str,
        description: str,
        story_type: StoryType = StoryType.FEATURE,
        acceptance_criteria: Optional[List[str]] = None,
        estimate_points: Optional[int] = None,
        assignee: Optional[str] = None,
        epic_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new story.

        Args:
            title: Story title
            description: User story description
            story_type: Type of story
            acceptance_criteria: List of acceptance criteria
            estimate_points: Story points estimate
            assignee: Assigned developer
            epic_id: Parent epic ID
            metadata: Additional metadata

        Returns:
            Story ID
        """
        story_id = str(uuid.uuid4())[:8]

        story = {
            "id": story_id,
            "title": title,
            "description": description,
            "type": story_type.value,
            "status": StoryStatus.BACKLOG.value,
            "acceptance_criteria": acceptance_criteria or [],
            "estimate_points": estimate_points,
            "assignee": assignee,
            "epic_id": epic_id,
            "tasks": [],
            "definition_of_done": [],
            "test_coverage": 0.0,
            "peer_reviewer": None,
            "spike_outcome": None,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.stories[story_id] = story
            self._save_stories()

        print(f"Created story: {story_id} - {title}")
        return story_id

    def add_acceptance_criteria(self, story_id: str, criteria: List[str]) -> bool:
        """
        Add acceptance criteria to story.

        Args:
            story_id: Story ID
            criteria: List of acceptance criteria

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            print(f"Error: Story {story_id} not found")
            return False

        with self._lock:
            self.stories[story_id]["acceptance_criteria"].extend(criteria)
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Added {len(criteria)} acceptance criteria to story {story_id}")
        return True

    def add_definition_of_done(self, story_id: str, checklist: List[str]) -> bool:
        """
        Add definition of done checklist to story.

        Args:
            story_id: Story ID
            checklist: List of DoD items

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            print(f"Error: Story {story_id} not found")
            return False

        with self._lock:
            self.stories[story_id]["definition_of_done"] = checklist
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Added definition of done to story {story_id}")
        return True

    def update_story_status(self, story_id: str, status: StoryStatus) -> bool:
        """
        Update story status.

        Args:
            story_id: Story ID
            status: New status

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            print(f"Error: Story {story_id} not found")
            return False

        with self._lock:
            self.stories[story_id]["status"] = status.value
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Updated story {story_id} status to {status.value}")
        return True

    def add_technical_task(
        self,
        story_id: str,
        title: str,
        description: str,
        estimate_hours: Optional[float] = None,
        dependencies: Optional[List[str]] = None
    ) -> str:
        """
        Add technical task to story.

        Args:
            story_id: Story ID
            title: Task title
            description: Task description
            estimate_hours: Estimated hours
            dependencies: Task dependencies

        Returns:
            Task ID
        """
        if story_id not in self.stories:
            print(f"Error: Story {story_id} not found")
            return None

        task_id = str(uuid.uuid4())[:8]

        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "estimate_hours": estimate_hours,
            "dependencies": dependencies or [],
            "status": StoryStatus.BACKLOG.value,
            "completed": False,
            "created_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.stories[story_id]["tasks"].append(task)
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Added technical task to story: {task_id} - {title}")
        return task_id

    def complete_task(self, story_id: str, task_id: str) -> bool:
        """
        Mark a technical task as complete.

        Args:
            story_id: Story ID
            task_id: Task ID

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            return False

        with self._lock:
            for task in self.stories[story_id]["tasks"]:
                if task["id"] == task_id:
                    task["completed"] = True
                    task["status"] = StoryStatus.DONE.value
                    self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
                    self._save_stories()
                    print(f"Completed task {task_id}")
                    return True

        print(f"Error: Task {task_id} not found in story {story_id}")
        return False

    def assign_peer_review(self, story_id: str, reviewer: str) -> bool:
        """
        Assign peer reviewer to story.

        Args:
            story_id: Story ID
            reviewer: Reviewer name/ID

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            return False

        with self._lock:
            self.stories[story_id]["peer_reviewer"] = reviewer
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Assigned peer reviewer {reviewer} to story {story_id}")
        return True

    def record_spike_outcome(self, story_id: str, outcome: Dict[str, Any]) -> bool:
        """
        Record spike/research outcome.

        Args:
            story_id: Story ID
            outcome: Spike outcome data

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            return False

        with self._lock:
            self.stories[story_id]["spike_outcome"] = outcome
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Recorded spike outcome for story {story_id}")
        return True

    def update_test_coverage(self, story_id: str, coverage_percent: float) -> bool:
        """
        Update test coverage for story.

        Args:
            story_id: Story ID
            coverage_percent: Test coverage percentage (0-100)

        Returns:
            True if successful
        """
        if story_id not in self.stories:
            return False

        with self._lock:
            self.stories[story_id]["test_coverage"] = coverage_percent
            self.stories[story_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_stories()

        print(f"Updated test coverage for story {story_id}: {coverage_percent}%")
        return True

    def get_story_readiness(self, story_id: str) -> Dict[str, Any]:
        """
        Check if story is ready for sprint.

        Args:
            story_id: Story ID

        Returns:
            Readiness assessment
        """
        if story_id not in self.stories:
            return None

        story = self.stories[story_id]

        checks = {
            "has_acceptance_criteria": len(story.get("acceptance_criteria", [])) > 0,
            "has_estimate": story.get("estimate_points") is not None,
            "has_tasks": len(story.get("tasks", [])) > 0,
            "has_assignee": story.get("assignee") is not None,
            "has_dod": len(story.get("definition_of_done", [])) > 0,
            "is_estimated": story["status"] in [StoryStatus.ESTIMATED.value, StoryStatus.REFINED.value]
        }

        all_passed = all(checks.values())
        passed_count = sum(checks.values())

        return {
            "story_id": story_id,
            "ready": all_passed,
            "checks": checks,
            "passed_count": passed_count,
            "total_checks": len(checks),
            "completion_percent": (passed_count / len(checks)) * 100
        }

    def list_stories(
        self,
        status: Optional[StoryStatus] = None,
        story_type: Optional[StoryType] = None,
        assignee: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List stories with optional filtering.

        Args:
            status: Filter by status
            story_type: Filter by type
            assignee: Filter by assignee

        Returns:
            List of stories
        """
        stories = list(self.stories.values())

        if status:
            stories = [s for s in stories if s["status"] == status.value]

        if story_type:
            stories = [s for s in stories if s["type"] == story_type.value]

        if assignee:
            stories = [s for s in stories if s.get("assignee") == assignee]

        return stories

    def export_story_to_markdown(self, story_id: str, output_path: Optional[Path] = None) -> Path:
        """
        Export story to markdown file.

        Args:
            story_id: Story ID
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if story_id not in self.stories:
            raise ValueError(f"Story {story_id} not found")

        story = self.stories[story_id]

        if output_path is None:
            output_path = self.planning_root / f"story_{story_id}.md"

        with open(output_path, 'w') as f:
            # Header
            f.write(f"# {story['title']}\n\n")
            f.write(f"**ID:** {story['id']}\n")
            f.write(f"**Type:** {story['type']}\n")
            f.write(f"**Status:** {story['status']}\n")
            f.write(f"**Points:** {story.get('estimate_points', 'Unestimated')}\n")
            f.write(f"**Assignee:** {story.get('assignee', 'Unassigned')}\n\n")

            # Description
            f.write("## User Story\n\n")
            f.write(f"{story['description']}\n\n")

            # Acceptance Criteria
            if story.get("acceptance_criteria"):
                f.write("## Acceptance Criteria\n\n")
                for i, criteria in enumerate(story["acceptance_criteria"], 1):
                    f.write(f"{i}. {criteria}\n")
                f.write("\n")

            # Definition of Done
            if story.get("definition_of_done"):
                f.write("## Definition of Done\n\n")
                for item in story["definition_of_done"]:
                    status = "✓" if True else " "  # Could track completion
                    f.write(f"- [{status}] {item}\n")
                f.write("\n")

            # Technical Tasks
            if story.get("tasks"):
                f.write("## Technical Tasks\n\n")
                for task in story["tasks"]:
                    status_icon = "✓" if task.get("completed") else " "
                    f.write(f"- [{status_icon}] **{task['title']}** ({task.get('estimate_hours', '?')}h)\n")
                    f.write(f"  - {task['description']}\n")
                f.write("\n")

            # Test Coverage
            f.write(f"## Test Coverage\n\n")
            f.write(f"**Current Coverage:** {story.get('test_coverage', 0)}%\n\n")

            # Spike Outcome (if applicable)
            if story.get("spike_outcome"):
                f.write("## Spike Outcome\n\n")
                f.write(f"```json\n{json.dumps(story['spike_outcome'], indent=2)}\n```\n\n")

        print(f"Exported story to: {output_path}")
        return output_path


def cli_main():
    """CLI entry point for story management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Story Manager")
    parser.add_argument("action", choices=["create", "list", "update", "show", "export", "task", "readiness"])
    parser.add_argument("--id", help="Story ID")
    parser.add_argument("--title", help="Story title")
    parser.add_argument("--description", help="Story description")
    parser.add_argument("--type", help="Story type (feature, bugfix, chore, spike, refactor)")
    parser.add_argument("--status", help="Story status")
    parser.add_argument("--points", help="Story points estimate")
    parser.add_argument("--assignee", help="Assignee")
    parser.add_argument("--epic", help="Epic ID")
    parser.add_argument("--task-title", help="Task title (for adding tasks)")
    parser.add_argument("--task-desc", help="Task description (for adding tasks)")
    parser.add_argument("--output", help="Output file for export")

    args = parser.parse_args()
    mgr = StoryManager()

    if args.action == "create":
        mgr.create_story(
            args.title,
            args.description,
            story_type=StoryType(args.type) if args.type else StoryType.FEATURE,
            estimate_points=int(args.points) if args.points else None,
            assignee=args.assignee,
            epic_id=args.epic
        )

    elif args.action == "list":
        stories = mgr.list_stories()
        print(f"Found {len(stories)} stories:")
        for story in stories:
            print(f"  - {story['id']}: {story['title']} ({story['status']})")

    elif args.action == "show":
        if not args.id:
            print("Error: --id required for show")
            return 1

        if args.id in mgr.stories:
            print(json.dumps(mgr.stories[args.id], indent=2))

    elif args.action == "update":
        if not args.id or not args.status:
            print("Error: --id and --status required for update")
            return 1
        mgr.update_story_status(args.id, StoryStatus(args.status))

    elif args.action == "task":
        if not args.id:
            print("Error: --id required for adding task")
            return 1
        mgr.add_technical_task(args.id, args.task_title, args.task_desc)

    elif args.action == "readiness":
        if not args.id:
            print("Error: --id required for readiness check")
            return 1
        readiness = mgr.get_story_readiness(args.id)
        print(json.dumps(readiness, indent=2))

    elif args.action == "export":
        if not args.id:
            print("Error: --id required for export")
            return 1
        output = Path(args.output) if args.output else None
        mgr.export_story_to_markdown(args.id, output)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
