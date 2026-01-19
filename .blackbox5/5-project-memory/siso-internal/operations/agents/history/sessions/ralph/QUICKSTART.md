# Vibe Kanban + Ralph Runtime Integration

**Autonomous REPL loops triggered by task creation**

---

## 🎯 What This Does

When you create a task in Vibe Kanban with the `[auto]` tag (or `[ralph]`, `[loop]`, `[autonomous]`), it automatically:

1. **Detects the autonomous tag** via webhook/monitor
2. **Generates a PRD** with appropriate user stories
3. **Starts Ralph Runtime** in autonomous mode
4. **Executes stories** via Blackbox5 agents
5. **Runs quality checks** (test, lint, typecheck)
6. **Commits changes** when quality gates pass
7. **Reports progress** back to Vibe Kanban
8. **Marks task complete** when all stories done

---

## 🚀 Quick Start

### 1. Test the Integration

```bash
# Run integration tests
.blackbox5/engine/runtime/ralph/test-vibe-integration.sh
```

This will:
- Load the VibeIntegration module
- Test autonomous task detection
- Test PRD generation
- Create example PRD files

### 2. Create an Autonomous Task

In Vibe Kanban, create a task:

```
Title: [auto] Add dark mode toggle

Description:
Add a dark mode toggle to settings page:
- Persist in localStorage
- Apply theme globally
- Show current mode
- Keyboard accessible
```

**Autonomous tags:**
- `[auto]` - Short form
- `[ralph]` - Explicit Ralph Runtime
- `[loop]` - Start autonomous loop
- `[autonomous]` - Full word

### 3. Watch It Work

When the task is created:

```
┌─────────────────────────────────────────────────────────┐
│ VIBE KANBAN                                             │
│  Task created: [auto] Add dark mode toggle             │
│  → Webhook sent                                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ WEBHOOK SERVER                                         │
│  Detected autonomous tag: [auto]                        │
│  → Triggering Ralph Runtime...                         │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ RALPH RUNTIME                                          │
│  Generated PRD: 4 stories                               │
│    1. Design: Add dark mode toggle (architect)          │
│    2. Implement: Add dark mode toggle (coder)           │
│    3. Test: Add dark mode toggle (tester)               │
│    4. Document: Add dark mode toggle (writer)           │
│                                                         │
│  Starting autonomous loop...                            │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ BLACKBOX5 AGENTS                                       │
│  Executing stories autonomously...                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Example PRDs Generated

### Feature Development

**Task:** `[auto] Add dark mode toggle`

**Generated PRD:**
```json
{
  "branchName": "ralph/add-dark-mode-toggle",
  "userStories": [
    {
      "id": "US-001",
      "title": "Design: Add dark mode toggle",
      "priority": 1,
      "agent": "architect"
    },
    {
      "id": "US-002",
      "title": "Implement: Add dark mode toggle",
      "priority": 2,
      "agent": "coder",
      "tools": ["write_code"]
    },
    {
      "id": "US-003",
      "title": "Test: Add dark mode toggle",
      "priority": 3,
      "agent": "tester",
      "tools": ["test", "lint"]
    },
    {
      "id": "US-004",
      "title": "Document: Add dark mode toggle",
      "priority": 4,
      "agent": "writer"
    }
  ]
}
```

### Bug Fix

**Task:** `[ralph] Fix login authentication error`

**Generated PRD:**
```json
{
  "branchName": "ralph/fix-login-authentication-error",
  "userStories": [
    {
      "id": "US-001",
      "title": "Investigate: Fix login authentication error",
      "priority": 1,
      "agent": "researcher"
    },
    {
      "id": "US-002",
      "title": "Fix: Fix login authentication error",
      "priority": 2,
      "agent": "coder",
      "tools": ["write_code"]
    },
    {
      "id": "US-003",
      "title": "Verify fix: Fix login authentication error",
      "priority": 3,
      "agent": "tester",
      "tools": ["test"]
    }
  ]
}
```

### Refactoring

**Task:** `[loop] Refactor user service`

**Generated PRD:**
```json
{
  "branchName": "ralph/refactor-user-service",
  "userStories": [
    {
      "id": "US-001",
      "title": "Analyze: Refactor user service",
      "priority": 1,
      "agent": "architect"
    },
    {
      "id": "US-002",
      "title": "Refactor: Refactor user service",
      "priority": 2,
      "agent": "coder",
      "tools": ["write_code"]
    },
    {
      "id": "US-003",
      "title": "Verify refactoring: Refactor user service",
      "priority": 3,
      "agent": "tester",
      "tools": ["test", "lint"]
    }
  ]
}
```

---

## 🔧 How It Works

### 1. Task Detection

**Method A: Webhook Server**

```python
# In .blackbox/4-scripts/integrations/vibe-kanban/webhook-server.py
def handle_task_created(task):
    # Check for autonomous tag
    if vibe_integration.is_autonomous_task(task):
        # Trigger Ralph Runtime
        asyncio.run(vibe_integration.trigger_ralph_runtime(task))
```

**Method B: Database Monitor**

```python
# In .blackbox/4-scripts/integrations/vibe-kanban/vibe-monitor.py
def sync_task_to_blackbox(task, attempts, state):
    # Check for autonomous tag
    if is_autonomous_task(task):
        trigger_ralph_runtime(task)
```

### 2. PRD Generation

```python
# In .blackbox5/engine/runtime/ralph/vibe_integration.py
def generate_prd_from_task(task):
    # Clean title (remove tags)
    clean_title = clean_title(task['title'])

    # Classify task type
    task_type = classify_task(clean_title, description)

    # Generate stories based on type
    stories = generate_stories(clean_title, description, task_type)

    # Create PRD
    return {
        "branchName": f"ralph/{slugify(clean_title)}",
        "userStories": stories
    }
```

### 3. Ralph Runtime Execution

```python
# Ralph Runtime autonomous loop
async def run():
    for iteration in range(1, max_iterations + 1):
        # 1. Get next story
        story = get_next_story(prd)

        # 2. Execute via agent
        result = await execute_story(story, agent)

        # 3. Run quality checks
        if await run_quality_checks():
            # 4. Commit changes
            await commit_changes(story, result)

            # 5. Update PRD
            update_story_status(story.id, passes=True)

            # 6. Document progress
            document_progress(story, result)
```

---

## 📁 Files

### Integration Layer
- `.blackbox5/engine/runtime/ralph/vibe_integration.py` - Main integration
- `.blackbox5/engine/runtime/ralph/ralph_runtime.py` - Ralph Runtime
- `.blackbox5/engine/runtime/ralph/quality.py` - Quality checker

### Vibe Kanban Integration
- `.blackbox/4-scripts/integrations/vibe-kanban/webhook-server.py` - Webhook handler
- `.blackbox/4-scripts/integrations/vibe-kanban/vibe-monitor.py` - Database monitor

### Documentation
- `.blackbox5/engine/runtime/ralph/VIBE-KANBAN-INTEGRATION.md` - Full architecture
- `.blackbox5/engine/runtime/ralph/README.md` - Ralph Runtime docs

### Scripts
- `.blackbox5/engine/runtime/ralph/start-ralph.sh` - Start Ralph manually
- `.blackbox5/engine/runtime/ralph/test-vibe-integration.sh` - Test integration

---

## 🎯 Task Types

### Feature Development

**Trigger words:** add, implement, create, build

**Stories:**
1. Architect - Design the feature
2. Coder - Implement the feature
3. Tester - Test the feature
4. Writer - Document the feature

### Bug Fix

**Trigger words:** fix, bug, error, issue

**Stories:**
1. Researcher - Investigate the bug
2. Coder - Fix the bug
3. Tester - Verify the fix

### Refactoring

**Trigger words:** refactor, cleanup, reorganize

**Stories:**
1. Architect - Analyze code
2. Coder - Refactor code
3. Tester - Verify refactoring

---

## 🚦 Usage Examples

### Example 1: Add Feature

```
Title: [auto] Add user profile page

Description:
Create a user profile page with:
- Avatar upload
- Bio editing
- Social links
- Privacy settings
```

**Result:**
- Branch: `ralph/add-user-profile-page`
- 4 stories generated
- Ralph executes autonomously

### Example 2: Fix Bug

```
Title: [ralph] Fix navigation menu on mobile

Description:
The navigation menu doesn't open on mobile devices
when the hamburger button is tapped.
```

**Result:**
- Branch: `ralph/fix-navigation-menu-on-mobile`
- 3 stories generated
- Ralph investigates, fixes, verifies

### Example 3: Refactor Code

```
Title: [loop] Refactor authentication module

Description:
The authentication module has duplicate code
and needs to be reorganized for better maintainability.
```

**Result:**
- Branch: `ralph/refactor-authentication-module`
- 3 stories generated
- Ralph analyzes, refactors, verifies

---

## ⚙️ Configuration

### Adjust Max Iterations

```python
# In vibe_integration.py
await integration.trigger_ralph_runtime(task, max_iterations=50)
```

### Customize Story Generation

Edit `vibe_integration.py`:
```python
def _generate_feature_stories(self, title: str, description: str):
    # Customize stories for features
    return [
        # Your custom stories
    ]
```

### Add Quality Gates

Edit `quality.py`:
```python
async def run_all(self) -> bool:
    checks = {
        'test': self.run_tests,
        'lint': self.run_lint,
        'typecheck': self.run_typecheck,
        'custom_check': self.run_custom_check  # Add your own
    }
```

---

## 🔍 Monitoring Progress

### Check Progress File

```bash
# View Ralph's progress
cat .blackbox/.plans/active/vibe-kanban-work/task-{TASK_ID}-ralph-progress.md
```

### Check Active Tasks

```bash
# See all active tasks
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md
```

### Check Completed Tasks

```bash
# See completed work
cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
```

---

## 🛠️ Troubleshooting

### Ralph Won't Start

**Check:** Is VibeIntegration module loaded?

```bash
python3 -c "from ralph.vibe_integration import VibeIntegration; print('OK')"
```

### Autonomous Task Not Detected

**Check:** Does task have correct tag?

```bash
python3 << EOF
from ralph.vibe_integration import VibeIntegration
integration = VibeIntegration(Path.cwd())
task = {"title": "[auto] My task", "description": "Test"}
print(integration.is_autonomous_task(task))  # Should print True
EOF
```

### PRD Not Generated

**Check:** Task format

```bash
python3 << EOF
from ralph.vibe_integration import VibeIntegration
integration = VibeIntegration(Path.cwd()))
task = {"id": "test", "title": "[auto] Test", "description": "Test"}
prd = integration.generate_prd_from_task(task)
print(prd)
EOF
```

---

## 🎯 Success Criteria

✅ **Works when:**
- Task created with `[auto]` tag in Vibe Kanban
- Webhook/monitor detects autonomous tag
- Ralph Runtime starts automatically
- PRD generated with appropriate stories
- Stories executed via Blackbox5 agents
- Quality checks run
- Changes committed
- Task marked complete

✅ **Tested:**
- Feature development tasks
- Bug fix tasks
- Refactoring tasks
- Quality gates
- Progress reporting

---

## 🚀 Next Steps

### Current Status: ✅ MVP Complete

- ✅ Task detection works
- ✅ PRD generation works
- ✅ Ralph Runtime integration complete
- ✅ Webhook server updated
- ✅ Database monitor integration ready
- ✅ Progress reporting implemented
- ✅ All tests passing

### Future Enhancements

- [ ] Real-time progress updates in Vibe Kanban UI
- [ ] Multi-task queue support
- [ ] Priority-based execution
- [ ] Parallel task execution
- [ ] Error recovery and retry
- [ ] Manual intervention capability

---

**Ready for autonomous REPL loops triggered by Vibe Kanban tasks!** 🚀
