# Task Management System - Implementation Plan

**Created:** 2026-01-18
**Status:** Ready to Start
**Priority:** HIGH - This is what connects everything together

---

## Executive Summary

**Problem**: We have great documentation and a working spec-driven pipeline (PRD → Epic → Tasks), but the **Task Management System** that ties it all together is NOT functional.

**Solution**: Implement the missing pieces to make the documented workflow actually work:
1. Local Task Database (capture ideas, issues, maintenance)
2. Adaptive Workflow Router (auto-classify tasks by complexity)
3. Integration layer (connect local DB → spec-driven pipeline → development)

**Time to MVP**: 3-5 days of focused development

---

## Current State Analysis

### What Works ✅
```
.blackbox5/engine/interface/spec_driven/
├── prd_agent.py      (643 lines) - Creates PRDs
├── epic_agent.py     (1314 lines) - Generates Epics from PRDs
└── task_agent.py     (857 lines) - Breaks down Epics into Tasks
```

### What's Missing ❌
```
.blackbox5/engine/task_management/    (DOESN'T EXIST)
├── local_database.py                 (Need this)
├── workflow_router.py                (Need this)
└── task_sync.py                      (Need this)
```

### CLI Commands - Partial ✅
```
.blackbox5/cli/commands/
└── task_commands.py (492 lines) - Has task:create, validate, list, show
```

But missing:
- Local task commands (`tasks:add`, `tasks:list`, `tasks:promote`)
- Development commands (`dev:start`, `dev:test`, `dev:complete`)

---

## Implementation Phases

### Phase 1: Local Task Database (Day 1)
**Goal**: Capture tasks in 4 local databases before committing to PRD flow

**Files to Create**:
```
.blackbox5/engine/task_management/
├── __init__.py
├── models.py          # TaskCategory, LocalTask, TaskStatus
├── database.py        # LocalTaskDatabase class
└── repository.py      # TaskRepository for JSON persistence
```

**Implementation**:

```python
# models.py
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Any

class TaskCategory(Enum):
    LONG_TERM_GOAL = "long_term_goal"    # PDR documents
    FEATURE_IDEA = "feature_idea"        # Concepts to implement
    ISSUE = "issue"                      # Bug reports
    MAINTENANCE = "maintenance"          # Ongoing tasks

class TaskStatus(Enum):
    IDEA = "idea"                        # Just captured
    PROPOSED = "proposed"                # Ready for review
    APPROVED = "approved"                # Approved for PRD
    IN_PROGRESS = "in_progress"          # In development
    DONE = "done"                        # Complete
    DEFERRED = "deferred"                # Not pursuing now

@dataclass
class LocalTask:
    id: str
    title: str
    description: str
    category: TaskCategory
    status: TaskStatus
    priority: str  # critical, high, medium, low
    created_at: str
    updated_at: str
    tags: List[str]
    metadata: Dict[str, Any]

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category.value,
            "status": self.status.value,
            "priority": self.priority,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "tags": self.tags,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'LocalTask':
        return cls(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            category=TaskCategory(data["category"]),
            status=TaskStatus(data["status"]),
            priority=data["priority"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            tags=data.get("tags", []),
            metadata=data.get("metadata", {})
        )
```

```python
# database.py
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional

class LocalTaskDatabase:
    """Local JSON-based storage for tasks before PRD flow"""

    def __init__(self, base_path: Path = None):
        if base_path is None:
            base_path = Path(".blackbox5/tasks")

        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

        # Category files
        self.files = {
            TaskCategory.LONG_TERM_GOAL: self.base_path / "long-term-goals.json",
            TaskCategory.FEATURE_IDEA: self.base_path / "feature-ideas.json",
            TaskCategory.ISSUE: self.base_path / "issues.json",
            TaskCategory.MAINTENANCE: self.base_path / "maintenance.json"
        }

    def add_task(
        self,
        title: str,
        description: str,
        category: TaskCategory,
        priority: str = "medium",
        tags: List[str] = None,
        metadata: dict = None
    ) -> LocalTask:
        """Add a new task to local database"""
        task = LocalTask(
            id=str(uuid.uuid4())[:8],
            title=title,
            description=description,
            category=category,
            status=TaskStatus.IDEA,
            priority=priority,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            tags=tags or [],
            metadata=metadata or {}
        )

        # Load existing tasks
        tasks = self._load_category(category)

        # Add new task
        tasks.append(task.to_dict())

        # Save
        self._save_category(category, tasks)

        return task

    def get_task(self, task_id: str) -> Optional[LocalTask]:
        """Get task by ID"""
        for category in TaskCategory:
            tasks = self._load_category(category)
            for task_data in tasks:
                if task_data["id"] == task_id:
                    return LocalTask.from_dict(task_data)
        return None

    def list_tasks(
        self,
        category: Optional[TaskCategory] = None,
        status: Optional[TaskStatus] = None
    ) -> List[LocalTask]:
        """List tasks with optional filtering"""
        results = []

        categories = [category] if category else TaskCategory

        for cat in categories:
            tasks = self._load_category(cat)
            for task_data in tasks:
                if status and TaskStatus(task_data["status"]) != status:
                    continue
                results.append(LocalTask.from_dict(task_data))

        # Sort by created_at (newest first)
        results.sort(key=lambda t: t.created_at, reverse=True)
        return results

    def update_task(
        self,
        task_id: str,
        title: str = None,
        description: str = None,
        status: TaskStatus = None,
        priority: str = None,
        tags: List[str] = None
    ) -> Optional[LocalTask]:
        """Update an existing task"""
        # Find and update
        for category in TaskCategory:
            tasks = self._load_category(category)
            for i, task_data in enumerate(tasks):
                if task_data["id"] == task_id:
                    # Update fields
                    if title is not None:
                        task_data["title"] = title
                    if description is not None:
                        task_data["description"] = description
                    if status is not None:
                        task_data["status"] = status.value
                    if priority is not None:
                        task_data["priority"] = priority
                    if tags is not None:
                        task_data["tags"] = tags

                    task_data["updated_at"] = datetime.now().isoformat()

                    # Save
                    self._save_category(category, tasks)

                    return LocalTask.from_dict(task_data)

        return None

    def delete_task(self, task_id: str) -> bool:
        """Delete a task"""
        for category in TaskCategory:
            tasks = self._load_category(category)
            original_length = len(tasks)

            # Filter out the task
            tasks = [t for t in tasks if t["id"] != task_id]

            if len(tasks) < original_length:
                self._save_category(category, tasks)
                return True

        return False

    def search_tasks(self, query: str) -> List[LocalTask]:
        """Search tasks by title/description"""
        results = []
        query_lower = query.lower()

        for category in TaskCategory:
            tasks = self._load_category(category)
            for task_data in tasks:
                if (query_lower in task_data["title"].lower() or
                    query_lower in task_data["description"].lower()):
                    results.append(LocalTask.from_dict(task_data))

        return results

    def _load_category(self, category: TaskCategory) -> List[dict]:
        """Load tasks for a category"""
        file_path = self.files[category]

        if not file_path.exists():
            return []

        with open(file_path, 'r') as f:
            return json.load(f)

    def _save_category(self, category: TaskCategory, tasks: List[dict]) -> None:
        """Save tasks for a category"""
        file_path = self.files[category]

        with open(file_path, 'w') as f:
            json.dump(tasks, f, indent=2)
```

**Time Estimate**: 2-3 hours

---

### Phase 2: Local Task CLI Commands (Day 1)
**Goal**: Interact with local database from command line

**File**: `.blackbox5/cli/commands/local_task_commands.py`

```python
import argparse
import sys
from pathlib import Path

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "engine"))

from task_management.database import LocalTaskDatabase
from task_management.models import TaskCategory, TaskStatus
from cli.base import BaseCommand

class TasksAddCommand(BaseCommand):
    """Add a task to local database"""

    name = "tasks:add"
    description = "Add a task to local database"
    aliases = ["ta", "task-add"]

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("title", type=str, help="Task title")
        parser.add_argument("-d", "--description", type=str, default="", help="Task description")
        parser.add_argument(
            "-c", "--category",
            type=str,
            choices=["long-term-goal", "feature-idea", "issue", "maintenance"],
            default="feature-idea",
            help="Task category"
        )
        parser.add_argument(
            "-p", "--priority",
            type=str,
            choices=["critical", "high", "medium", "low"],
            default="medium",
            help="Task priority"
        )
        parser.add_argument("-t", "--tags", type=str, nargs="*", default=[], help="Task tags")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            db = LocalTaskDatabase()

            # Map category string to enum
            category_map = {
                "long-term-goal": TaskCategory.LONG_TERM_GOAL,
                "feature-idea": TaskCategory.FEATURE_IDEA,
                "issue": TaskCategory.ISSUE,
                "maintenance": TaskCategory.MAINTENANCE
            }

            task = db.add_task(
                title=args.title,
                description=args.description,
                category=category_map[args.category],
                priority=args.priority,
                tags=args.tags
            )

            print(f"✅ Task created: {task.id}")
            print(f"   Title: {task.title}")
            print(f"   Category: {task.category.value}")
            print(f"   Status: {task.status.value}")

            return 0

        except Exception as e:
            print(f"❌ Error: {e}")
            return 1


class TasksListCommand(BaseCommand):
    """List local tasks"""

    name = "tasks:list"
    description = "List local tasks"
    aliases = ["tl", "task-list"]

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "-c", "--category",
            type=str,
            choices=["long-term-goal", "feature-idea", "issue", "maintenance", "all"],
            default="all",
            help="Filter by category"
        )
        parser.add_argument(
            "-s", "--status",
            type=str,
            help="Filter by status"
        )

    def execute(self, args: argparse.Namespace) -> int:
        try:
            db = LocalTaskDatabase()

            # Parse filters
            category = None
            if args.category != "all":
                category_map = {
                    "long-term-goal": TaskCategory.LONG_TERM_GOAL,
                    "feature-idea": TaskCategory.FEATURE_IDEA,
                    "issue": TaskCategory.ISSUE,
                    "maintenance": TaskCategory.MAINTENANCE
                }
                category = category_map[args.category]

            status = None
            if args.status:
                status = TaskStatus(args.status)

            # List tasks
            tasks = db.list_tasks(category=category, status=status)

            if not tasks:
                print("No tasks found")
                return 0

            # Group by category
            by_category = {}
            for task in tasks:
                cat = task.category.value
                if cat not in by_category:
                    by_category[cat] = []
                by_category[cat].append(task)

            # Display
            for cat, cat_tasks in by_category.items():
                print(f"\n{cat.replace('_', ' ').title()} ({len(cat_tasks)})")
                print("=" * 60)

                for task in cat_tasks:
                    status_icon = {
                        "idea": "💡",
                        "proposed": "📋",
                        "approved": "✅",
                        "in_progress": "🔄",
                        "done": "✓",
                        "deferred": "⏸️"
                    }.get(task.status.value, "•")

                    print(f"{status_icon} {task.id}: {task.title}")
                    print(f"   Status: {task.status.value} | Priority: {task.priority}")
                    if task.description:
                        print(f"   {task.description[:80]}...")
                    print()

            return 0

        except Exception as e:
            print(f"❌ Error: {e}")
            return 1


class TasksPromoteCommand(BaseCommand):
    """Promote a local task to PRD (entry to spec-driven pipeline)"""

    name = "tasks:promote"
    description = "Promote task to PRD"
    aliases = ["tp", "task-promote"]

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("task_id", type=str, help="Task ID to promote")
        parser.add_argument("--tier", type=str, choices=["1", "2", "3", "4"], help="Force workflow tier")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            db = LocalTaskDatabase()

            # Get task
            task = db.get_task(args.task_id)
            if not task:
                print(f"❌ Task not found: {args.task_id}")
                return 1

            print(f"📋 Promoting task: {task.title}")
            print(f"   Category: {task.category.value}")
            print(f"   ID: {task.id}")

            # Classify complexity (or use forced tier)
            if args.tier:
                tier = int(args.tier)
            else:
                from task_management.workflow_router import WorkflowRouter
                router = WorkflowRouter()
                tier = router.classify_task(task)

            tier_names = {
                1: "Quick Fix (< 1hr)",
                2: "Simple Feature (1-4hr)",
                3: "Standard Feature (4-16hr)",
                4: "Complex Project (16hr+)"
            }

            print(f"\n🎯 Classified as Tier {tier}: {tier_names[tier]}")

            # Route based on tier
            if tier == 1:
                print("\n⚡ Quick Fix - Creating GitHub Issue directly...")
                # TODO: Implement direct GitHub issue creation
                print("   (GitHub integration not yet implemented)")
            elif tier == 2:
                print("\n📝 Simple Feature - Creating light PRD...")
                # TODO: Implement light PRD creation
                print("   (Light PRD creation not yet implemented)")
            else:
                print(f"\n📚 Tier {tier} - Running full PRD flow...")
                # Use existing PRD agent
                from interface.spec_driven.prd_agent import PRDAgent
                from interface.spec_driven.config import load_config

                config = load_config()
                prd_agent = PRDAgent(config)

                prd = prd_agent.create_prd(
                    title=task.title,
                    description=task.description,
                    context={"task_id": task.id, "category": task.category.value}
                )

                print(f"   PRD created: {prd.prd_id}")

                # Update task status
                db.update_task(task.id, status=TaskStatus.APPROVED)

                print(f"\n✅ Task promoted to PRD: {prd.prd_id}")
                print(f"   Next: bb5 epic:create -p {prd.prd_id}")

            return 0

        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return 1
```

**Time Estimate**: 2-3 hours

---

### Phase 3: Adaptive Workflow Router (Day 2)
**Goal**: Auto-classify tasks by complexity for appropriate workflow

**File**: `.blackbox5/engine/task_management/workflow_router.py`

```python
from typing import Dict, Any
from enum import Enum
from .models import LocalTask

class WorkflowTier(Enum):
    TIER_1_QUICK_FIX = 1  # < 1 hour
    TIER_2_SIMPLE = 2      # 1-4 hours
    TIER_3_STANDARD = 3    # 4-16 hours
    TIER_4_COMPLEX = 4     # 16+ hours

class WorkflowRouter:
    """Route tasks to appropriate workflow tier based on complexity"""

    def __init__(self):
        # Complexity indicators with weights
        self.indicators = {
            "database": 2,
            "authentication": 3,
            "multiple_services": 3,
            "api": 2,
            "security": 3,
            "migration": 4,
            "payment": 4,
            "external_integration": 2,
            "file_upload": 1,
            "email": 1,
            "notification": 1,
        }

    def classify_task(self, task: LocalTask) -> int:
        """
        Classify task into workflow tier (1-4)

        Returns:
            int: Workflow tier (1=Quick Fix, 2=Simple, 3=Standard, 4=Complex)
        """
        score = 0

        # Analyze task description
        text = f"{task.title} {task.description}".lower()

        # Check complexity indicators
        if self._requires_database_change(text):
            score += 2
        if self._requires_authentication(text):
            score += 3
        if self._involves_multiple_services(text):
            score += 3
        if self._requires_api_changes(text):
            score += 2
        if self._has_security_implications(text):
            score += 3
        if self._requires_migration(text):
            score += 4
        if self._affects_payment_flow(text):
            score += 4
        if self._external_integration(text):
            score += 2

        # Consider tags
        for tag in task.tags:
            tag_lower = tag.lower()
            if tag_lower in ["security", "auth", "database"]:
                score += 2

        # Consider category
        if task.category.value == "maintenance":
            score = min(score, 3)  # Cap maintenance at tier 3

        # Route to tier
        if score <= 2:
            return 1
        elif score <= 4:
            return 2
        elif score <= 7:
            return 3
        else:
            return 4

    def _requires_database_change(self, text: str) -> bool:
        """Check if task requires database changes"""
        keywords = [
            "database", "schema", "migration", "sql",
            "add field", "add column", "new table", "store data"
        ]
        return any(kw in text for kw in keywords)

    def _requires_authentication(self, text: str) -> bool:
        """Check if task involves authentication"""
        keywords = [
            "auth", "login", "logout", "signup", "password",
            "jwt", "session", "oauth", "permission", "role"
        ]
        return any(kw in text for kw in keywords)

    def _involves_multiple_services(self, text: str) -> bool:
        """Check if task spans multiple services"""
        keywords = [
            "microservice", "service to service", "api integration",
            "webhook", "event", "message queue", "kafka"
        ]
        return any(kw in text for kw in keywords)

    def _requires_api_changes(self, text: str) -> bool:
        """Check if task requires API changes"""
        keywords = [
            "endpoint", "api", "rest", "graphql", "route",
            "controller", "handler", "request", "response"
        ]
        return any(kw in text for kw in keywords)

    def _has_security_implications(self, text: str) -> bool:
        """Check if task has security implications"""
        keywords = [
            "security", "vulnerability", "xss", "csrf", "injection",
            "encrypt", "decrypt", "hash", "token", "certificate"
        ]
        return any(kw in text for kw in keywords)

    def _requires_migration(self, text: str) -> bool:
        """Check if task is a migration"""
        keywords = [
            "migrate", "migration", "transfer", "move data",
            "convert", "transform data"
        ]
        return any(kw in text for kw in keywords)

    def _affects_payment_flow(self, text: str) -> bool:
        """Check if task affects payment processing"""
        keywords = [
            "payment", "checkout", "stripe", "paypal",
            "refund", "transaction", "billing", "invoice"
        ]
        return any(kw in text for kw in keywords)

    def _external_integration(self, text: str) -> bool:
        """Check if task integrates with external service"""
        keywords = [
            "integration", "api client", "third party",
            "external service", "webhook"
        ]
        return any(kw in text for kw in keywords)
```

**Time Estimate**: 1-2 hours

---

## Quick Start: Get It Working Today

### Step 1: Create Directory Structure (5 min)
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
mkdir -p .blackbox5/engine/task_management
mkdir -p .blackbox5/tasks
touch .blackbox5/engine/task_management/__init__.py
```

### Step 2: Create the Files (2-3 hours)
Create these files with the code above:
1. `.blackbox5/engine/task_management/models.py`
2. `.blackbox5/engine/task_management/database.py`
3. `.blackbox5/engine/task_management/workflow_router.py`
4. `.blackbox5/cli/commands/local_task_commands.py`

### Step 3: Register Commands (5 min)
Edit `.blackbox5/cli/main.py` to include:
```python
from commands.local_task_commands import (
    TasksAddCommand,
    TasksListCommand,
    TasksPromoteCommand
)

# Register commands
cli.register(TasksAddCommand())
cli.register(TasksListCommand())
cli.register(TasksPromoteCommand())
```

### Step 4: Test It (10 min)
```bash
# Add a task
bb5 tasks:add "User authentication" \
  -d "Add login/logout with JWT tokens" \
  -c feature-idea \
  -p high \
  -t auth security

# List tasks
bb5 tasks:list

# Promote to PRD
bb5 tasks:promote <task-id>
```

---

## Success Criteria

### Phase 1 Complete When:
- [x] Can add task with `bb5 tasks:add`
- [x] Can list tasks with `bb5 tasks:list`
- [x] Can update task status
- [x] Can search tasks

### Phase 2 Complete When:
- [x] Can promote task to PRD with `bb5 tasks:promote`
- [x] Auto-classification works (Tier 1-4)
- [x] Integration with existing PRD agent

### Phase 3 Complete When:
- [x] End-to-end: Local Task → PRD → Epic → Tasks
- [x] All CLI commands working
- [x] Documentation updated

---

## Next Steps After MVP

Once the basic flow works, you can add:

1. **GitHub Integration** (Day 3)
   - Sync tasks to GitHub Issues
   - Auto-update status from Git

2. **Development Commands** (Day 4)
   - `bb5 dev:start` - Start development
   - `bb5 dev:test` - Run tests
   - `bb5 dev:complete` - Mark done

3. **Testing & Feedback Loop** (Day 5)
   - Automated testing
   - Feedback loop integration
   - Black Box Memory tracking

---

**Ready to implement!** Start with Phase 1 (Local Task Database) and you'll have a functional system in a few hours.
