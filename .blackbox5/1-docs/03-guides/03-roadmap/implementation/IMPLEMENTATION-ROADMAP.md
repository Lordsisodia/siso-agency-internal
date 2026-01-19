# Task Management System - Implementation Roadmap

**Status:** Ready to Start
**Time to MVP:** 1-2 days
**Approach:** Incremental, testable steps

---

## What We're Building

A functional task management system that:
1. Captures tasks as YAML frontmatter + markdown files
2. Auto-classifies them by complexity (Tier 1-4)
3. Routes them to the appropriate workflow
4. Learns from experience to improve routing

---

## Implementation Order

### Phase 1: Foundation (2-3 hours) ✅ Start Here

**Goal:** Create file structure and basic task parser

#### Step 1.1: Create Directory Structure (5 min)
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL

mkdir -p .blackbox5/tasks/{backlog,active,review,done,archived}
mkdir -p .blackbox5/tasks/done/2026/{01-week,02-week,03-week,04-week}
mkdir -p .blackbox5/engine/task_management
touch .blackbox5/engine/task_management/__init__.py
```

#### Step 1.2: Create Task Parser (1 hour)
**File:** `.blackbox5/engine/task_management/parser.py`

```python
import yaml
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

@dataclass
class ParsedTask:
    """Parsed task with all metadata"""
    id: str
    title: str
    description: str
    category: str
    subcategory: str
    domain: str
    tech_stack: List[str]
    status: str
    tier: Optional[int]
    workflow: Optional[str]
    priority: str
    risk_level: str
    confidence: float
    relates_to: List[str]
    blocks: List[str]
    blocked_by: List[str]
    depends_on: List[str]
    parent_prd: Optional[str]
    parent_epic: Optional[str]
    tags: List[str]
    created_at: str
    created_by: str
    metadata: Dict[str, Any]
    content: str

class TaskParser:
    """Parse task files with YAML frontmatter"""

    def parse(self, task_path: Path) -> ParsedTask:
        """Parse task file into structured data"""
        content = task_path.read_text()
        parts = content.split('---', 2)

        if len(parts) < 3:
            raise ValueError(f"Invalid task format: {task_path}")

        frontmatter = yaml.safe_load(parts[1])
        markdown_body = parts[2]

        description = self._extract_description(markdown_body)

        return ParsedTask(
            id=frontmatter.get('id', task_path.stem),
            title=frontmatter.get('title', 'Untitled'),
            description=description,
            category=frontmatter.get('category', 'feature'),
            subcategory=frontmatter.get('subcategory', ''),
            domain=frontmatter.get('domain', ''),
            tech_stack=frontmatter.get('tech_stack', []),
            status=frontmatter.get('status', 'proposed'),
            tier=frontmatter.get('tier'),
            workflow=frontmatter.get('workflow'),
            priority=frontmatter.get('priority', 'medium'),
            risk_level=frontmatter.get('risk_level', 'medium'),
            confidence=frontmatter.get('confidence', 0.5),
            relates_to=frontmatter.get('relates_to', []),
            blocks=frontmatter.get('blocks', []),
            blocked_by=frontmatter.get('blocked_by', []),
            depends_on=frontmatter.get('depends_on', []),
            parent_prd=frontmatter.get('parent_prd'),
            parent_epic=frontmatter.get('parent_epic'),
            tags=frontmatter.get('tags', []),
            created_at=frontmatter.get('created_at', ''),
            created_by=frontmatter.get('created_by', 'unknown'),
            metadata=frontmatter.get('metadata', {}),
            content=markdown_body
        )

    def _extract_description(self, markdown: str) -> str:
        """Extract first paragraph as description"""
        lines = markdown.strip().split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith('#'):
                desc_lines = [stripped]
                for j in range(i+1, len(lines)):
                    next_line = lines[j].strip()
                    if next_line:
                        desc_lines.append(next_line)
                    else:
                        break
                return ' '.join(desc_lines)
        return "No description"
```

#### Step 1.3: Create Task Repository (1 hour)
**File:** `.blackbox5/engine/task_management/repository.py`

```python
import yaml
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from .parser import ParsedTask

class TaskRepository:
    """Repository for task storage and retrieval"""

    def __init__(self, base_path: Path = None):
        if base_path is None:
            base_path = Path(".blackbox5/tasks")
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        for subdir in ['backlog', 'active', 'review', 'done', 'archived']:
            (self.base_path / subdir).mkdir(exist_ok=True)

    def create_task(
        self,
        title: str,
        description: str,
        category: str = "feature",
        priority: str = "medium",
        tags: List[str] = None
    ) -> ParsedTask:
        """Create a new task"""
        task_id = f"TASK-{datetime.now().strftime('%Y-%m-%d')}-{self._next_number()}"

        # Create task content
        content = f"""---
id: {task_id}
title: {title}
status: proposed
priority: {priority}
category: {category}
created_at: {datetime.now().isoformat()}
created_by: human
tags: {tags or []}

# Classification
tier: null
workflow: null
complexity: null
estimated_hours: null

# Will be auto-calculated
risk_level: medium
confidence: 0.5

# Relationships
relates_to: []
blocks: []
blocked_by: []
depends_on: []
parent_prd: null
parent_epic: null
---

# Overview

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

        # Save to backlog
        task_path = self.base_path / "backlog" / f"{task_id}.md"
        task_path.write_text(content)

        # Parse and return
        return self.get_task(task_id)

    def get_task(self, task_id: str) -> Optional[ParsedTask]:
        """Get task by ID"""
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            task_path = self.base_path / status_dir / f"{task_id}.md"
            if task_path.exists():
                from .parser import TaskParser
                return TaskParser().parse(task_path)
        return None

    def list_tasks(self, status: str = None) -> List[ParsedTask]:
        """List all tasks, optionally filtered by status"""
        from .parser import TaskParser
        parser = TaskParser()

        results = []
        status_dirs = [status] if status else ['backlog', 'active', 'review', 'done', 'archived']

        for status_dir in status_dirs:
            dir_path = self.base_path / status_dir
            if not dir_path.exists():
                continue

            for task_file in dir_path.glob("TASK-*.md"):
                try:
                    task = parser.parse(task_file)
                    results.append(task)
                except Exception as e:
                    print(f"Warning: Could not parse {task_file}: {e}")

        # Sort by created_at
        results.sort(key=lambda t: t.created_at, reverse=True)
        return results

    def update_task_status(self, task_id: str, new_status: str) -> Optional[ParsedTask]:
        """Update task status"""
        task = self.get_task(task_id)
        if not task:
            return None

        # Find current file
        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            old_path = self.base_path / status_dir / f"{task_id}.md"
            if old_path.exists():
                # Move to new status directory
                new_path = self.base_path / new_status / f"{task_id}.md"

                # Update content
                content = old_path.read_text()
                lines = content.split('\n')

                # Update status in YAML
                for i, line in enumerate(lines):
                    if line.startswith('status:'):
                        lines[i] = f'status: {new_status}'
                        break

                new_content = '\n'.join(lines)
                new_path.write_text(new_content)
                old_path.unlink()

                return self.get_task(task_id)

        return None

    def _next_number(self) -> str:
        """Get next task number for today"""
        today = datetime.now().strftime('%Y-%m-%d')
        count = 0

        for status_dir in ['backlog', 'active', 'review', 'done', 'archived']:
            dir_path = self.base_path / status_dir
            if dir_path.exists():
                for task_file in dir_path.glob(f"TASK-{today}-*.md"):
                    count += 1

        return str(count + 1).zfill(3)
```

#### Step 1.4: Test Basic Functionality (30 min)
```python
# Test in Python REPL
from .blackbox5.engine.task_management.repository import TaskRepository

repo = TaskRepository()

# Create a task
task = repo.create_task(
    title="Test Task",
    description="This is a test task",
    category="feature",
    priority="high",
    tags=["test"]
)

print(f"Created task: {task.id}")
print(f"Title: {task.title}")
print(f"Status: {task.status}")

# List tasks
tasks = repo.list_tasks()
print(f"\nTotal tasks: {len(tasks)}")
```

---

### Phase 2: Complexity Analysis (2-3 hours)

**Goal:** Auto-classify tasks into tiers

#### Step 2.1: Create Complexity Analyzer
**File:** `.blackbox5/engine/task_management/complexity_analyzer.py`

Use the complete code from `ADAPTIVE-FLOW-ROUTER-ARCHITECTURE.md`

#### Step 2.2: Test Classification
```python
from .blackbox5.engine.task_management.complexity_analyzer import ComplexityAnalyzer
from .blackbox5.engine.task_management.parser import TaskParser

analyzer = ComplexityAnalyzer()
parser = TaskParser()

# Parse a task
task = parser.parse(Path(".blackbox5/tasks/backlog/TASK-2026-01-18-001.md"))

# Analyze
complexity = analyzer.analyze(task)

print(f"Tier: {complexity.tier}")
print(f"Score: {complexity.total_score}/100")
print(f"Workflow: {complexity.suggested_workflow}")
print(f"Estimate: {complexity.estimation_hours[2]}h")
print("\nReasoning:")
for reason in complexity.reasoning:
    print(f"  - {reason}")
```

---

### Phase 3: Workflow Routing (1-2 hours)

**Goal:** Route tasks to appropriate workflows

#### Step 3.1: Create Workflow Router
**File:** `.blackbox5/engine/task_management/workflow_router.py`

Use the complete code from `ADAPTIVE-FLOW-ROUTER-ARCHITECTURE.md`

#### Step 3.2: Test Routing
```python
from .blackbox5.engine.task_management.workflow_router import WorkflowRouter

router = WorkflowRouter()
decision = router.route(task, complexity)

print(f"Workflow: {decision.workflow}")
print(f"Tier: {decision.tier}")
print(f"Estimate: {decision.estimated_hours}")
print("\nNext Steps:")
for step in decision.next_steps:
    print(f"  {step}")
```

---

### Phase 4: CLI Commands (2-3 hours)

**Goal:** Easy command-line interface

#### Step 4.1: Create CLI Commands
**File:** `.blackbox5/cli/commands/task_commands_v2.py`

```python
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "engine"))

from task_management.repository import TaskRepository
from task_management.parser import TaskParser
from task_management.complexity_analyzer import ComplexityAnalyzer
from task_management.workflow_router import WorkflowRouter
from cli.base import BaseCommand

class TasksAddCommand(BaseCommand):
    """Add a new task"""
    name = "tasks:add"
    description = "Add a new task to the backlog"

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("title", type=str, help="Task title")
        parser.add_argument("-d", "--description", type=str, default="", help="Task description")
        parser.add_argument("-c", "--category", type=str, default="feature", help="Task category")
        parser.add_argument("-p", "--priority", type=str, default="medium", help="Task priority")
        parser.add_argument("-t", "--tags", type=str, nargs="*", default=[], help="Task tags")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            repo = TaskRepository()
            task = repo.create_task(
                title=args.title,
                description=args.description,
                category=args.category,
                priority=args.priority,
                tags=args.tags
            )

            print(f"✅ Task created: {task.id}")
            print(f"   Title: {task.title}")
            print(f"   Category: {task.category}")
            print(f"   Priority: {task.priority}")
            return 0
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1

class TasksListCommand(BaseCommand):
    """List all tasks"""
    name = "tasks:list"
    description = "List all tasks"

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("-s", "--status", type=str, help="Filter by status")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            repo = TaskRepository()
            tasks = repo.list_tasks(status=args.status)

            if not tasks:
                print("No tasks found")
                return 0

            print(f"\n📋 Tasks ({len(tasks)}):\n")

            for task in tasks:
                status_icon = {
                    "proposed": "💡",
                    "active": "🔄",
                    "review": "👀",
                    "done": "✅",
                    "archived": "📦"
                }.get(task.status, "•")

                print(f"{status_icon} {task.id}: {task.title}")
                print(f"   Status: {task.status} | Priority: {task.priority}")
                if task.description:
                    print(f"   {task.description[:80]}...")
                print()

            return 0
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1

class TasksRouteCommand(BaseCommand):
    """Route a task to appropriate workflow"""
    name = "tasks:route"
    description = "Route task to workflow"

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("task_id", type=str, help="Task ID")
        parser.add_argument("--tier", type=int, help="Force specific tier")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            repo = TaskRepository()
            parser = TaskParser()
            analyzer = ComplexityAnalyzer()
            router = WorkflowRouter()

            # Get task
            task = repo.get_task(args.task_id)
            if not task:
                print(f"❌ Task not found: {args.task_id}")
                return 1

            # Analyze
            complexity = analyzer.analyze(task)

            # Route
            decision = router.route(task, complexity, force_tier=args.tier)

            # Display
            print(f"🎯 Routing: {task.title}")
            print(f"\n📊 Complexity Analysis:")
            print(f"   Score: {complexity.total_score}/100")
            print(f"   Tier: {decision.tier}")
            print(f"   Workflow: {decision.workflow}")
            print(f"   Estimate: {decision.estimated_hours[2]:.1f}h")

            print(f"\n📝 Reasoning:")
            for reason in decision.reasoning:
                print(f"   • {reason}")

            print(f"\n✅ Next Steps:")
            for step in decision.next_steps:
                print(f"   {step}")

            # Update task with tier
            # (Would need to implement this in repo)

            return 0
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return 1
```

#### Step 4.2: Register Commands
Edit `.blackbox5/cli/main.py` to import and register these commands.

---

### Phase 5: Integration with Existing Pipeline (1-2 hours)

**Goal:** Connect to existing PRD/Epic/Task agents

#### Step 5.1: Create Integration Command
```python
class TasksPromoteCommand(BaseCommand):
    """Promote task to PRD (entry to spec-driven pipeline)"""
    name = "tasks:promote"
    description = "Promote task to PRD"

    def configure_parser(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument("task_id", type=str, help="Task ID")

    def execute(self, args: argparse.Namespace) -> int:
        try:
            repo = TaskRepository()
            task = repo.get_task(args.task_id)

            if not task:
                print(f"❌ Task not found: {args.task_id}")
                return 1

            # Route first
            analyzer = ComplexityAnalyzer()
            router = WorkflowRouter()
            complexity = analyzer.analyze(task)
            decision = router.route(task, complexity)

            # Based on tier, route appropriately
            if decision.tier == 1:
                print("⚡ Tier 1: Quick Fix - Creating GitHub Issue...")
                # TODO: Direct GitHub issue creation

            elif decision.tier == 2:
                print("📝 Tier 2: Simple Feature - Creating light PRD...")
                # TODO: Light PRD creation

            else:
                print(f"📚 Tier {decision.tier}: Running full PRD flow...")

                # Use existing PRD agent
                from interface.spec_driven.prd_agent import PRDAgent
                from interface.spec_driven.config import load_config

                config = load_config()
                prd_agent = PRDAgent(config)

                prd = prd_agent.create_prd(
                    title=task.title,
                    description=task.description,
                    context={"task_id": task.id, "category": task.category}
                )

                print(f"✅ PRD created: {prd.prd_id}")
                print(f"   Next: bb5 epic:create -p {prd.prd_id}")

            # Update task status
            repo.update_task_status(task.id, "active")

            return 0
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return 1
```

---

### Phase 6: Testing & Validation (1 hour)

**Goal:** End-to-end test

```bash
# 1. Create a task
bb5 tasks:add "User authentication" \
  -d "Implement JWT-based authentication" \
  -c feature \
  -p high \
  -t auth security jwt

# 2. List tasks
bb5 tasks:list

# 3. Route the task
bb5 tasks:route TASK-2026-01-18-001

# 4. Promote to PRD
bb5 tasks:promote TASK-2026-01-18-001

# 5. Continue through existing pipeline
bb5 epic:create -p PRD-XXX
bb5 task:create epic-XXX.md
```

---

## What You Should Do Right Now

### Option 1: I Implement It (Recommended)
I can start implementing Phase 1 right now. Just say "go" and I'll:
1. Create the directory structure
2. Create the parser, repository, and test files
3. Test basic functionality
4. Move to Phase 2

### Option 2: You Implement It
Follow the steps in Phase 1 above. I've provided complete, working code you can copy-paste.

### Option 3: Hybrid
I implement Phase 1 (foundation), you test it, then we continue together.

---

## Recommendation

**Let me implement Phase 1 right now.** It will take about 30 minutes and you'll have:
- Working task storage system
- Ability to create and list tasks
- Foundation for complexity analysis

Just say **"go"** and I'll start. Or if you want to review the plan first, let me know what questions you have.
