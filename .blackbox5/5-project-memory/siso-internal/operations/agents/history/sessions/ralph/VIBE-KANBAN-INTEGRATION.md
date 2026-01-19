# Vibe Kanban + Ralph Runtime Integration

**Autonomous REPL Loop Triggered by Task Creation**

---

## 🎯 Vision

When you add a task to Vibe Kanban, it should automatically trigger Ralph Runtime to start an autonomous coding loop that:
1. Picks up the task from Vibe Kanban
2. Breaks it down into user stories
3. Executes each story autonomously
4. Reports progress back to Vibe Kanban
5. Commits work when quality checks pass
6. Marks task complete

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VIBE KANBAN                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. User creates task "Add dark mode toggle"         │  │
│  │    → task.created event triggered                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              WEBHOOK/MONITOR LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ VibeMonitor detects new task                        │  │
│  │ → Checks if task marked for autonomous execution   │  │
│  │ → Triggers Ralph Runtime                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 RALPH RUNTIME                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Generate PRD from task                           │  │
│  │ 2. Create user stories                              │  │
│  │ 3. Execute stories via Blackbox5 agents             │  │
│  │ 4. Run quality checks                               │  │
│  │ 5. Commit changes                                   │  │
│  │ 6. Report progress back to Vibe Kanban              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BLACKBOX5 AGENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Coder   │  │Researcher│  │Architect │  │ Tester   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Integration Points

### 1. Task Creation Detection

**Method A: Webhook (Preferred)**

```python
# In webhook-server.py
def handle_task_created(task):
    """Handle task creation from Vibe Kanban"""

    # Check if task should be autonomous
    if is_autonomous_task(task):
        # Trigger Ralph Runtime
        trigger_ralph_runtime(task)

def is_autonomous_task(task):
    """Check if task should run autonomously"""

    # Check for special tag in title
    title = task.get('title', '').lower()

    # Tags that trigger autonomous mode
    autonomous_tags = [
        '[auto]',
        '[autonomous]',
        '[ralph]',
        '[loop]'
    ]

    return any(tag in title for tag in autonomous_tags)

def trigger_ralph_runtime(task):
    """Start Ralph Runtime for this task"""

    # Generate PRD from task
    prd = generate_prd_from_task(task)

    # Save PRD to workspace
    prd_path = save_prd(prd)

    # Start Ralph Runtime
    start_ralph(prd_path)
```

**Method B: Database Monitor**

```python
# In vibe-monitor.py
def sync_task_to_blackbox(task, attempts, state):
    """Sync task and trigger Ralph if needed"""

    task_id = task['id']

    # Check if new task
    is_new = task_id not in state['tasks_seen']

    if is_new:
        # Check for autonomous tag
        if is_autonomous_task(task):
            print(f"🤖 Autonomous task detected: {task['title']}")
            trigger_ralph_runtime(task)

        state['tasks_seen'].append(task_id)
```

### 2. PRD Generation from Task

```python
def generate_prd_from_task(task):
    """Generate Ralph PRD from Vibe Kanban task"""

    title = task['title']
    description = task.get('description', '')

    # Extract tags from title
    # Remove [auto], [ralph], etc.
    clean_title = title
    for tag in ['[auto]', '[autonomous]', '[ralph]', '[loop]']:
        clean_title = clean_title.replace(tag, '').strip()

    # Generate user stories based on task type
    stories = generate_stories(clean_title, description)

    # Create PRD
    prd = {
        "branchName": f"ralph/{slugify(clean_title)}",
        "userStories": stories
    }

    return prd

def generate_stories(title, description):
    """Generate user stories for task"""

    stories = []

    # Analyze task type
    task_type = classify_task(title, description)

    if task_type == 'feature':
        stories = [
            {
                "id": "US-001",
                "title": f"Design {title}",
                "priority": 1,
                "passes": False,
                "agent": "architect",
                "context": {
                    "description": description
                }
            },
            {
                "id": "US-002",
                "title": f"Implement {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"]
            },
            {
                "id": "US-003",
                "title": f"Test {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test", "lint"]
            }
        ]

    elif task_type == 'bugfix':
        stories = [
            {
                "id": "US-001",
                "title": f"Investigate: {title}",
                "priority": 1,
                "passes": False,
                "agent": "researcher"
            },
            {
                "id": "US-002",
                "title": f"Fix: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"]
            },
            {
                "id": "US-003",
                "title": f"Verify fix for {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test"]
            }
        ]

    elif task_type == 'refactor':
        stories = [
            {
                "id": "US-001",
                "title": f"Analyze code for: {title}",
                "priority": 1,
                "passes": False,
                "agent": "architect"
            },
            {
                "id": "US-002",
                "title": f"Refactor: {title}",
                "priority": 2,
                "passes": False,
                "agent": "coder",
                "tools": ["write_code"]
            },
            {
                "id": "US-003",
                "title": f"Verify refactoring: {title}",
                "priority": 3,
                "passes": False,
                "agent": "tester",
                "tools": ["test"]
            }
        ]

    return stories

def classify_task(title, description):
    """Classify task type"""

    title_lower = title.lower()
    desc_lower = description.lower()

    # Bug fix patterns
    bug_keywords = ['fix', 'bug', 'error', 'issue', 'broken']
    if any(kw in title_lower or kw in desc_lower for kw in bug_keywords):
        return 'bugfix'

    # Refactor patterns
    refactor_keywords = ['refactor', 'cleanup', 'reorganize', 'improve']
    if any(kw in title_lower or kw in desc_lower for kw in refactor_keywords):
        return 'refactor'

    # Default to feature
    return 'feature'
```

### 3. Progress Reporting Back to Vibe Kanban

```python
# In RalphRuntime
async def execute_story(self, story: Story, iteration: int):
    """Execute a story and report progress to Vibe Kanban"""

    # Execute via agent
    result = await self._execute_via_agent(story)

    # Report progress to Vibe Kanban
    await self._report_progress_to_vibe(story, result)

    return result

async def _report_progress_to_vibe(self, story: Story, result: IterationResult):
    """Report progress to Vibe Kanban"""

    # Update task progress file
    progress_file = self.vibe_work_path / f"task-{self.task_id}-progress.md"

    with open(progress_file, 'a') as f:
        f.write(f"\n### Story Completed: {story.title}\n")
        f.write(f"- **Status:** {'✅ Success' if result.success else '❌ Failed'}\n")
        f.write(f"- **Files Changed:** {len(result.files_changed)}\n")
        f.write(f"- **Learnings:** {result.learnings}\n")

    # If all stories complete, mark Vibe Kanban task as done
    if self.all_stories_complete():
        await self._mark_vibe_task_complete()
```

---

## 🚀 Usage

### Creating an Autonomous Task

In Vibe Kanban, create a task with the autonomous tag:

```
Title: [auto] Add dark mode toggle to settings

Description:
Add a dark mode toggle switch to the settings page. The toggle should:
- Persist preference in localStorage
- Apply dark theme to entire app
- Show current mode status
- Be accessible with keyboard navigation
```

**Tags that trigger autonomous mode:**
- `[auto]` - Short form
- `[autonomous]` - Explicit
- `[ralph]` - Use Ralph Runtime
- `[loop]` - Start autonomous loop

### What Happens Next

1. **Task Created** → Vibe Kanban creates task
2. **Webhook/Monitor Detects** → Se `[auto]` tag
3. **PRD Generated** → Creates user stories:
   - US-001: Design dark mode toggle
   - US-002: Implement dark mode toggle
   - US-003: Test dark mode toggle
4. **Ralph Runtime Starts** → Autonomous loop begins
5. **Stories Execute** → Blackbox5 agents do the work
6. **Progress Reported** → Updates `.blackbox/.plans/active/vibe-kanban-work/`
7. **Quality Checks** → Tests, lint, typecheck
8. **Commits Made** → Only if checks pass
9. **Task Complete** → Marked as done in Vibe Kanban

---

## 🔧 Implementation Plan

### Phase 1: Trigger System
- [ ] Add autonomous task detection to webhook-server.py
- [ ] Add autonomous task detection to vibe-monitor.py
- [ ] Create PRD generation from task
- [ ] Test task→PRD conversion

### Phase 2: Ralph Runtime Integration
- [ ] Modify RalphRuntime to accept Vibe task ID
- [ ] Add progress reporting to Vibe Kanban
- [ ] Add task completion callback
- [ ] Test end-to-end autonomous loop

### Phase 3: Advanced Features
- [ ] Multi-task queue support
- [ ] Priority-based task selection
- [ ] Parallel task execution
- [ ] Error recovery and retry

---

## 📊 File Structure

```
.blackbox5/engine/runtime/ralph/
├── __init__.py
├── ralph_runtime.py          # Main Ralph Runtime
├── quality.py                # Quality checker
├── vibe_integration.py       # NEW: Vibe Kanban integration
├── prd_generator.py          # NEW: PRD generation from task
├── start-ralph.sh
├── example-prd.json
├── README.md
└── VIBE-KANBAN-INTEGRATION.md
```

---

## 🎯 Success Criteria

**Minimum Viable Product:**
- [x] Vibe Kanban task created with `[auto]` tag
- [ ] Ralph Runtime automatically starts
- [ ] PRD generated from task
- [ ] Stories executed autonomously
- [ ] Progress reported to `.blackbox`
- [ ] Task marked complete when done

**Stretch Goals:**
- [ ] Real-time progress updates in Vibe Kanban UI
- [ ] Multiple autonomous tasks in queue
- [ ] Priority-based execution
- [ ] Error recovery and retry
- [ ] Manual intervention capability

---

## 🔗 Related Files

- `.blackbox/4-scripts/integrations/vibe-kanban/webhook-server.py`
- `.blackbox/4-scripts/integrations/vibe-kanban/vibe-monitor.py`
- `.blackbox5/engine/runtime/ralph/ralph_runtime.py`
- `.blackbox5/engine/runtime/ralph/quality.py`

---

**Ready to build autonomous REPL loops triggered by Vibe Kanban tasks!** 🚀
