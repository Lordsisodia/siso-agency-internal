# Ralph Autonomous Loop Integration Plan for Blackbox5

**Date:** 2026-01-18
**Sources:**
- https://github.com/snarktank/ralph (Original Ralph)
- https://github.com/frankbria/ralph-claude-code (Claude Code integration)

---

## What Ralph Actually Is

**Ralph is an autonomous coding agent loop** that:

1. **Reads a PRD** (Product Requirements Document) with user stories
2. **Picks the highest priority incomplete story**
3. **Implements that story**
4. **Runs quality checks** (tests, lint, typecheck)
5. **Commits the changes**
6. **Updates progress**
7. **Repeats until all stories complete**

## The Core Loop

```bash
for i in $(seq 1 $MAX_ITERATIONS); do
    # 1. Read PRD and progress
    # 2. Pick highest priority story where passes=false
    # 3. Implement that story
    # 4. Run quality checks
    # 5. Commit if checks pass
    # 6. Update PRD to mark passes=true
    # 7. Append to progress.txt
    # 8. If all stories complete, output "COMPLETE" and exit
done
```

## Key Files

### PRD (prd.json)
```json
{
  "branchName": "ralph/feature-x",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add priority field",
      "priority": 1,
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Implement filtering",
      "priority": 2,
      "passes": false
    }
  ]
}
```

### Progress (progress.txt)
```markdown
## Codebase Patterns
- Use X for Y
- Always do Z

## 2026-01-18 - US-001
- What: Added priority field
- Files: models.py, views.py
- Learnings:
  - Database uses migrations
  - Must update both model and view
```

## How It Works

### Decision Making
1. **Read progress.txt** - Learn from previous iterations
2. **Read PRD** - See what stories exist
3. **Filter** - Find stories where `passes: false`
4. **Sort** - By priority (lowest number = highest priority)
5. **Pick** - The first one (highest priority incomplete)
6. **Implement** - Just that one story
7. **Verify** - Run quality checks
8. **Commit** - If checks pass
9. **Update** - Mark `passes: true` in PRD
10. **Document** - Append to progress.txt

### Stop Condition
When ALL stories have `passes: true`, output `COMPLETE` and the loop exits.

## Why This Is Brilliant

**Simple but powerful:**
- ✅ **Fresh context each iteration** - No context pollution
- ✅ **Persistent memory** - Via progress.txt and git history
- ✅ **Quality gates** - Must pass checks to commit
- ✅ **Incremental progress** - One story at a time
- ✅ **Self-documenting** - Progress.txt accumulates learnings
- ✅ **Fault tolerant** - Commits only what passes checks

## Integrating Ralph into Blackbox5

### What Blackbox5 Has

**Already:**
- ✅ Agent system (BaseAgent, AgentLoader)
- ✅ Event bus (Redis)
- ✅ Task router (complexity analysis)
- ✅ Brain system (PostgreSQL + Neo4j)
- ✅ Manifest system (operation tracking)
- ✅ Circuit breaker (fault tolerance)

**Needs:**
- ❌ Ralph autonomous loop
- ❌ PRD management
- ❌ Progress tracking
- ❌ Story-based task selection
- ❌ Quality check integration

### Integration Architecture

```python
# Blackbox5 Ralph Runtime

class RalphRuntime:
    """
    Autonomous agent loop using Ralph pattern
    """

    def __init__(self, workspace_path: Path):
        self.workspace_path = workspace_path
        self.prd_file = workspace_path / "prd.json"
        self.progress_file = workspace_path / "progress.txt"

        # Blackbox5 services
        self.agent_loader = AgentLoader()
        self.task_router = TaskRouter()
        self.event_bus = get_event_bus()
        self.manifest_system = ManifestSystem()
        self.brain = BrainService()

        # Ralph-specific
        self.max_iterations = 100
        self.quality_checks = ["test", "lint", "typecheck"]

    async def run_autonomous_loop(self):
        """Main Ralph loop"""
        for iteration in range(1, self.max_iterations + 1):
            print(f"\n{'='*60}")
            print(f" Ralph Iteration {iteration}/{self.max_iterations}")
            print(f"{'='*60}\n")

            # 1. Load PRD and progress
            prd = self.load_prd()
            progress = self.load_progress()

            # 2. Get next story
            story = self.get_next_story(prd)
            if not story:
                print("✓ All stories complete!")
                self.complete_session()
                break

            print(f"Working on: {story['id']} - {story['title']}")

            # 3. Create manifest for this iteration
            manifest = self.manifest_system.create_manifest(
                f"ralph_iteration_{iteration}",
                {"story_id": story['id'], "iteration": iteration}
            )

            # 4. Select appropriate agent
            agent = await self.select_agent_for_story(story)

            # 5. Execute story through agent
            try:
                result = await self.execute_story(story, agent, manifest)

                # 6. Run quality checks
                if await self.run_quality_checks():
                    # 7. Commit changes
                    await self.commit_changes(story)

                    # 8. Update PRD
                    self.update_story_status(story['id'], passes=True)

                    # 9. Document progress
                    self.document_progress(story, result)

                    print(f"✓ Completed: {story['id']}")
                else:
                    print(f"✗ Quality checks failed for {story['id']}")

            except Exception as e:
                print(f"✗ Error executing {story['id']}: {e}")
                self.document_error(story, e)

            # 10. Check if complete
            if self.all_stories_complete(prd):
                print("\n✓ ALL STORIES COMPLETE!")
                self.complete_session()
                break

    def get_next_story(self, prd: Dict) -> Optional[Dict]:
        """Get highest priority incomplete story"""
        incomplete = [
            s for s in prd['userStories']
            if not s.get('passes', False)
        ]

        if not incomplete:
            return None

        # Sort by priority (lowest number = highest priority)
        incomplete.sort(key=lambda s: s.get('priority', 999))

        return incomplete[0]

    async def select_agent_for_story(self, story: Dict) -> BaseAgent:
        """Select appropriate agent based on story type"""
        # Use task router to analyze complexity
        task = Task(
            id=story['id'],
            description=story['title'],
            context=story
        )

        # Get routing decision
        routing = await self.task_router.route_task(task)

        # Load and return appropriate agent
        agents = await self.agent_loader.load_all()

        if routing.type == 'single':
            return agents.get(routing.agent)
        else:
            # For complex tasks, return manager agent
            return agents.get('manager')

    async def execute_story(self, story: Dict, agent: BaseAgent, manifest) -> Dict:
        """Execute story through agent"""
        # Execute via agent
        result = await agent.execute({
            'id': story['id'],
            'description': story['title'],
            'context': story
        })

        return result

    async def run_quality_checks(self) -> bool:
        """Run quality checks (test, lint, typecheck)"""
        checks = {
            'test': self.run_tests,
            'lint': self.run_lint,
            'typecheck': self.run_typecheck
        }

        for check_name, check_func in checks.items():
            if not await check_func():
                print(f"✗ {check_name} failed")
                return False

        return True

    def document_progress(self, story: Dict, result: Dict):
        """Append to progress.txt"""
        with open(self.progress_file, 'a') as f:
            f.write(f"\n## {datetime.now().strftime('%Y-%m-%d')} - {story['id']}\n")
            f.write(f"Thread: {result.get('thread_url', 'N/A')}\n")
            f.write(f"- Implemented: {story['title']}\n")
            f.write(f"- Files: {', '.join(result.get('files_changed', []))}\n")
            f.write(f"- Learnings:\n")
            f.write(f"  {result.get('learnings', 'None')}\n")
            f.write(f"---\n")
```

## Implementation Plan

### Phase 1: Core Ralph Loop (Day 1-2)

```python
# .blackbox5/engine/runtime/ralph.py

class RalphRuntime:
    """Autonomous agent loop"""

    async def run(self, prd_path: Path, max_iterations: int = 100):
        """Run autonomous loop"""
        # Load PRD
        # Loop:
        #   - Get next story
        #   - Select agent
        #   - Execute
        #   - Quality checks
        #   - Commit if pass
        #   - Update PRD
        #   - Document progress
        #   - Check complete
```

### Phase 2: PRD Management (Day 2-3)

```python
# .blackbox5/engine/runtime/ralph/prd.py

class PRDManager:
    """Manage PRD files"""

    def load_prd(self, path: Path) -> Dict:
        """Load and validate PRD"""

    def update_story(self, story_id: str, passes: bool):
        """Update story status"""

    def get_incomplete_stories(self) -> List[Dict]:
        """Get stories where passes=false"""
```

### Phase 3: Progress Tracking (Day 3)

```python
# .blackbox5/engine/runtime/ralph/progress.py

class ProgressTracker:
    """Track progress and learnings"""

    def append(self, story_id: str, result: Dict):
        """Append to progress.txt"""

    def get_patterns(self) -> List[str]:
        """Get codebase patterns from progress.txt"""
```

### Phase 4: Quality Checks (Day 4)

```python
# .blackbox5/engine/runtime/ralph/quality.py

class QualityChecker:
    """Run quality checks"""

    async def run_all(self) -> bool:
        """Run test, lint, typecheck"""

    async def run_tests(self) -> bool:
        """Run test suite"""

    async def run_lint(self) -> bool:
        """Run linter"""

    async def run_typecheck(self) -> bool:
        """Run type checker"""
```

### Phase 5: CLI (Day 5)

```bash
# .blackbox5/engine/runtime/start-ralph.sh

#!/bin/bash
# Start Ralph autonomous loop

BLACKBOX5_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$BLACKBOX5_ROOT/prd.json"
MAX_ITERATIONS=${1:-100}

python -m blackbox5.engine.runtime.ralph \
    --prd "$PRD_FILE" \
    --max-iterations $MAX_ITERATIONS
```

## Quick Start Example

### 1. Create PRD

```json
{
  "branchName": "feature/auth",
  "userStories": [
    {
      "id": "US-001",
      "title": "Create user model",
      "priority": 1,
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Implement login",
      "priority": 2,
      "passes": false
    },
    {
      "id": "US-003",
      "title": "Add logout",
      "priority": 3,
      "passes": false
    }
  ]
}
```

### 2. Start Ralph

```bash
cd /path/to/project
python -m blackbox5.engine.runtime.ralph --prd prd.json
```

### 3. Watch It Work

```
============================================================
 Ralph Iteration 1/100
============================================================

Working on: US-001 - Create user model

Loading agents...
Selecting agent: coder
Executing story...
Running tests... ✓
Running lint... ✓
Running typecheck... ✓
Committing changes...
Updating PRD...
Documenting progress...

✓ Completed: US-001

============================================================
 Ralph Iteration 2/100
============================================================

Working on: US-002 - Implement login

... (continues until all stories complete)
```

## Key Benefits

1. **Autonomous** - Runs without human intervention
2. **Incremental** - One story at a time
3. **Quality-gated** - Only commits what passes checks
4. **Self-documenting** - Progress.txt accumulates learnings
5. **Fault-tolerant** - Graceful error handling
6. **Flexible** - Works with any agent system

## Next Steps

**This is what we should ACTUALLY build:**

1. ✅ Ralph runtime loop
2. ✅ PRD management
3. ✅ Progress tracking
4. ✅ Quality checks
5. ✅ Agent integration

**NOT more infrastructure, more docs, more plans.**

---

**This is the point:** An autonomous loop that actually implements features, one story at a time, with quality checks and progress tracking.

**Status:** Ready to implement ✅
**Next:** Create RalphRuntime class
