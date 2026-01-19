"""
Vibe Kanban Integration for Ralph Runtime

Handles:
- Task detection from Vibe Kanban
- PRD generation from Vibe tasks
- Progress reporting back to Vibe
- Autonomous task triggering
"""

import asyncio
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import re


class VibeIntegration:
    """Integration between Vibe Kanban and Ralph Runtime"""

    def __init__(self, workspace_path: Path):
        """
        Initialize Vibe Kanban integration.

        Args:
            workspace_path: Root workspace directory
        """
        self.workspace_path = Path(workspace_path)
        self.blackbox_path = self.workspace_path / ".blackbox"
        self.vibe_work_path = self.blackbox_path / ".plans" / "active" / "vibe-kanban-work"
        self.ralph_runtime_path = self.workspace_path / ".blackbox5" / "engine" / "runtime" / "ralph"

        # Ensure directories exist
        self.vibe_work_path.mkdir(parents=True, exist_ok=True)

    def is_autonomous_task(self, task: Dict) -> bool:
        """
        Check if task should run autonomously.

        Args:
            task: Task dictionary from Vibe Kanban

        Returns:
            True if task has autonomous tag
        """
        title = task.get('title', '').lower()
        description = task.get('description', '').lower()

        # Tags that trigger autonomous mode
        autonomous_tags = ['[auto]', '[autonomous]', '[ralph]', '[loop]']

        # Check title and description
        for tag in autonomous_tags:
            if tag in title or tag in description:
                return True

        return False

    def generate_prd_from_task(self, task: Dict) -> Dict:
        """
        Generate Ralph PRD from Vibe Kanban task.

        Args:
            task: Task dictionary from Vibe Kanban

        Returns:
            PRD dictionary for Ralph Runtime
        """
        title = task['title']
        description = task.get('description', '')
        task_id = task.get('id', 'unknown')

        # Clean title (remove autonomous tags)
        clean_title = self._clean_title(title)

        # Generate user stories
        stories = self._generate_stories(clean_title, description, task_id)

        # Create PRD
        prd = {
            "branchName": f"ralph/{self._slugify(clean_title)}",
            "userStories": stories,
            "metadata": {
                "vibeTaskId": task_id,
                "originalTitle": title,
                "generatedAt": datetime.now().isoformat()
            }
        }

        return prd

    def _clean_title(self, title: str) -> str:
        """Remove autonomous tags from title"""
        clean = title
        for tag in ['[auto]', '[autonomous]', '[ralph]', '[loop]']:
            clean = clean.replace(tag, '', -1).strip()
        return clean

    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        # Convert to lowercase and replace spaces with hyphens
        slug = text.lower().replace(' ', '-')
        # Remove special characters except hyphens
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        # Remove multiple consecutive hyphens
        slug = re.sub(r'-+', '-', slug)
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        return slug

    def _generate_stories(self, title: str, description: str, task_id: str) -> List[Dict]:
        """Generate user stories based on task type"""
        task_type = self._classify_task(title, description)

        if task_type == 'feature':
            return self._generate_feature_stories(title, description)
        elif task_type == 'bugfix':
            return self._generate_bugfix_stories(title, description)
        elif task_type == 'refactor':
            return self._generate_refactor_stories(title, description)
        else:
            return self._generate_generic_stories(title, description)

    def _classify_task(self, title: str, description: str) -> str:
        """Classify task type"""
        title_lower = title.lower()
        desc_lower = description.lower()

        # Bug fix patterns
        bug_keywords = ['fix', 'bug', 'error', 'issue', 'broken']
        if any(kw in title_lower or kw in desc_lower for kw in bug_keywords):
            return 'bugfix'

        # Refactor patterns
        refactor_keywords = ['refactor', 'cleanup', 'reorganize', 'improve code']
        if any(kw in title_lower or kw in desc_lower for kw in refactor_keywords):
            return 'refactor'

        # Default to feature
        return 'feature'

    def _generate_feature_stories(self, title: str, description: str) -> List[Dict]:
        """Generate stories for feature development"""
        return [
            {
                "id": "US-001",
                "title": f"Design: {title}",
                "priority": 1,
                "passes": False,
                "agent": "architect",
                "context": {
                    "description": description,
                    "phase": "design"
                }
            },
            {
                "id": "US-002",
                "title": f"Implement: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"],
                "context": {
                    "description": description,
                    "phase": "implementation"
                }
            },
            {
                "id": "US-003",
                "title": f"Test: {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test", "lint"],
                "context": {
                    "description": description,
                    "phase": "testing"
                }
            },
            {
                "id": "US-004",
                "title": f"Document: {title}",
                "priority": 4,
                "passes": False,
                "agent": "writer",
                "context": {
                    "description": description,
                    "phase": "documentation"
                }
            }
        ]

    def _generate_bugfix_stories(self, title: str, description: str) -> List[Dict]:
        """Generate stories for bug fixes"""
        return [
            {
                "id": "US-001",
                "title": f"Investigate: {title}",
                "priority": 1,
                "passes": False,
                "agent": "researcher",
                "context": {
                    "description": description,
                    "phase": "investigation"
                }
            },
            {
                "id": "US-002",
                "title": f"Fix: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"],
                "context": {
                    "description": description,
                    "phase": "fix"
                }
            },
            {
                "id": "US-003",
                "title": f"Verify fix: {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test"],
                "context": {
                    "description": description,
                    "phase": "verification"
                }
            }
        ]

    def _generate_refactor_stories(self, title: str, description: str) -> List[Dict]:
        """Generate stories for refactoring"""
        return [
            {
                "id": "US-001",
                "title": f"Analyze: {title}",
                "priority": 1,
                "passes": False,
                "agent": "architect",
                "context": {
                    "description": description,
                    "phase": "analysis"
                }
            },
            {
                "id": "US-002",
                "title": f"Refactor: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"],
                "context": {
                    "description": description,
                    "phase": "refactoring"
                }
            },
            {
                "id": "US-003",
                "title": f"Verify refactoring: {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test", "lint"],
                "context": {
                    "description": description,
                    "phase": "verification"
                }
            }
        ]

    def _generate_generic_stories(self, title: str, description: str) -> List[Dict]:
        """Generate generic stories"""
        return [
            {
                "id": "US-001",
                "title": f"Analyze: {title}",
                "priority": 1,
                "passes": False,
                "agent": "researcher",
                "context": {
                    "description": description
                }
            },
            {
                "id": "US-002",
                "title": f"Execute: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"],
                "context": {
                    "description": description
                }
            },
            {
                "id": "US-003",
                "title": f"Verify: {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test"],
                "context": {
                    "description": description
                }
            }
        ]

    async def trigger_ralph_runtime(self, task: Dict, max_iterations: int = 100) -> bool:
        """
        Trigger Ralph Runtime for a Vibe Kanban task.

        Args:
            task: Task dictionary from Vibe Kanban
            max_iterations: Maximum iterations for Ralph

        Returns:
            True if Ralph started successfully
        """
        task_id = task.get('id', 'unknown')
        title = task['title']

        print(f"🤖 Triggering Ralph Runtime for task: {title}")

        # Generate PRD
        prd = self.generate_prd_from_task(task)

        # Save PRD to workspace
        prd_path = self.workspace_path / f"prd-{task_id}.json"
        with open(prd_path, 'w') as f:
            json.dump(prd, f, indent=2)

        print(f"📋 PRD generated: {prd_path}")

        # Create progress file
        progress_file = self.vibe_work_path / f"task-{task_id}-ralph-progress.md"

        with open(progress_file, 'w') as f:
            f.write(f"# Ralph Runtime Progress: {title}\n\n")
            f.write(f"**Task ID:** {task_id}\n")
            f.write(f"**Started:** {datetime.now().isoformat()}\n")
            f.write(f"**PRD:** {prd_path}\n")
            f.write(f"**Status:** 🔄 Starting...\n\n")
            f.write("## Stories\n\n")
            for story in prd['userStories']:
                f.write(f"### {story['id']}: {story['title']}\n")
                f.write(f"- **Priority:** {story['priority']}\n")
                f.write(f"- **Agent:** {story.get('agent', 'auto')}\n")
                f.write(f"- **Status:** ⏳ Pending\n\n")

        # Start Ralph Runtime
        try:
            print(f"🚀 Starting Ralph Runtime...")

            # Run Ralph as subprocess
            cmd = [
                'python', '-m', 'blackbox5.engine.runtime.ralph',
                '--workspace', str(self.workspace_path),
                '--prd', str(prd_path),
                '--max-iterations', str(max_iterations)
            ]

            # Start Ralph in background
            process = subprocess.Popen(
                cmd,
                cwd=self.workspace_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # Update progress file
            with open(progress_file, 'a') as f:
                f.write(f"\n## Ralph Runtime Started\n\n")
                f.write(f"**Process ID:** {process.pid}\n")
                f.write(f"**Command:** {' '.join(cmd)}\n")
                f.write(f"**Max Iterations:** {max_iterations}\n\n")
                f.write(" Ralph is now working autonomously...\n\n")

            print(f"✅ Ralph Runtime started (PID: {process.pid})")
            return True

        except Exception as e:
            print(f"❌ Failed to start Ralph Runtime: {e}")

            # Update progress file with error
            with open(progress_file, 'a') as f:
                f.write(f"\n## ❌ Error\n\n")
                f.write(f"**Error:** {str(e)}\n")
                f.write(f"**Time:** {datetime.now().isoformat()}\n")

            return False

    def report_story_complete(self, task_id: str, story_id: str, story_title: str, success: bool):
        """Report story completion to Vibe Kanban progress"""
        progress_file = self.vibe_work_path / f"task-{task_id}-ralph-progress.md"

        with open(progress_file, 'a') as f:
            status = "✅ Complete" if success else "❌ Failed"
            f.write(f"\n### {story_id}: {story_title}\n")
            f.write(f"**Status:** {status}\n")
            f.write(f"**Completed:** {datetime.now().isoformat()}\n\n")

    def report_task_complete(self, task_id: str, success: bool):
        """Report task completion to Vibe Kanban"""
        progress_file = self.vibe_work_path / f"task-{task_id}-ralph-progress.md"

        with open(progress_file, 'a') as f:
            f.write(f"\n## Task Complete\n\n")
            f.write(f"**Status:** {'✅ Success' if success else '❌ Failed'}\n")
            f.write(f"**Completed:** {datetime.now().isoformat()}\n\n")

        # Also update completed tasks file
        completed_file = self.vibe_work_path / "completed-tasks.md"

        with open(completed_file, 'a') as f:
            status_icon = "✅" if success else "❌"
            f.write(f"\n## {status_icon} Ralph Runtime Task: {task_id}\n")
            f.write(f"- **Completed:** {datetime.now().isoformat()}\n")
            f.write(f"- **Status:** {'Success' if success else 'Failed'}\n")
            f.write(f"- **Progress:** {progress_file}\n\n")


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

async def handle_vibe_task(task: Dict, workspace_path: Path) -> bool:
    """
    Handle a Vibe Kanban task - trigger Ralph if autonomous.

    Args:
        task: Task dictionary from Vibe Kanban
        workspace_path: Root workspace directory

    Returns:
        True if task was handled (either autonomous or ignored)
    """
    integration = VibeIntegration(workspace_path)

    # Check if task should run autonomously
    if integration.is_autonomous_task(task):
        print(f"🤖 Autonomous task detected: {task['title']}")

        # Trigger Ralph Runtime
        success = await integration.trigger_ralph_runtime(task)

        return success
    else:
        # Not an autonomous task, ignore
        return True
