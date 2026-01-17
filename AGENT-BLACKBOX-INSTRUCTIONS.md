# 🤖 Agent Instructions: .blackbox Integration

## 💡 The Simple Approach

**Instead of complex monitoring systems, just tell Vibe Kanban agents to update .blackbox!**

Since agents have direct access to the local codebase (which includes `.blackbox`), they can:
- Read existing .blackbox files for context
- Update progress as they work
- Log completions when done
- Store artifacts in the correct locations

---

## 📝 Agent System Prompt Template

Add this to your Vibe Kanban agent configuration or task descriptions:

```
You are working on a task in the SISO-INTERNAL codebase. This codebase includes a .blackbox folder which is our memory system.

### .blackbox Structure:
- .blackbox/.plans/active/ - Active work and plans
- .blackbox/9-brain/incoming/ - New artifacts and completed work
- .blackbox/9-brain/memory/extended/ - Long-term memory

### Your Responsibilities:

1. **BEFORE STARTING WORK:**
   - Read .blackbox/.plans/active/active-context.md to understand current priorities
   - Check .blackbox/.plans/active/vibe-kanban-work/active-tasks.md to see what's already in progress
   - Update .blackbox/.plans/active/vibe-kanban-work/active-tasks.md with this task

2. **WHILE WORKING:**
   - Create/update .blackbox/.plans/active/vibe-kanban-work/task-{TASK_ID}-progress.md
   - Log your progress as you work
   - Note any decisions you make
   - Record files you create or modify

3. **WHEN COMPLETE:**
   - Move task to .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
   - Create summary in .blackbox/9-brain/incoming/vibe-kanban-tasks/{TASK_ID}.md
   - Update .blackbox/.plans/active/vibe-kanban-work/queue-status.md
   - Log any git commits you made

### File Templates:

**active-tasks.md entry:**
```markdown
## {TASK_TITLE}
- **ID:** {TASK_ID}
- **Agent:** {YOUR_NAME}
- **Started:** {TIMESTAMP}
- **Status:** In Progress
- **Description:** {TASK_DESCRIPTION}
```

**progress.md:**
```markdown
# Task Progress: {TASK_TITLE}

**ID:** {TASK_ID}
**Agent:** {YOUR_NAME}
**Started:** {TIMESTAMP}
**Status:** In Progress

## Task Description
{TASK_DESCRIPTION}

## Progress Log

### {TIMESTAMP} - Started
- Initial analysis complete
- Approach determined
```

**completed-tasks.md entry:**
```markdown
## ✅ {TASK_TITLE}
- **ID:** {TASK_ID}
- **Agent:** {YOUR_NAME}
- **Completed:** {TIMESTAMP}
- **Files Modified:** {LIST}
- **Success:** True
```

IMPORTANT: Always update .blackbox files as you work. This is how we track everything!
```

---

## 🎯 Quick Task Templates

### Template 1: Feature Development

```
Task: Implement {FEATURE_NAME}

Instructions:
1. Read .blackbox/.plans/active/active-context.md for context
2. Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
3. Implement the feature
4. Update progress as you work
5. When done, move to completed-tasks.md and create artifact summary
```

### Template 2: Bug Fix

```
Task: Fix {BUG_DESCRIPTION}

Instructions:
1. Read .blackbox/.plans/active/vibe-kanban-work/active-tasks.md for context
2. Create progress file and log investigation
3. Document the root cause in progress file
4. Fix the bug
5. Update completed-tasks.md with resolution details
```

### Template 3: Refactoring

```
Task: Refactor {CODE_AREA}

Instructions:
1. Check .blackbox for existing context about this code
2. Create progress file with refactoring plan
3. Log each change as you make it
4. Document why changes were made
5. Store before/after comparison in .blackbox/9-brain/incoming/
```

### Template 4: Documentation

```
Task: Document {FEATURE}

Instructions:
1. Read existing .blackbox documentation
2. Create progress file
3. Write/update documentation
4. Store documentation artifacts in .blackbox/9-brain/incoming/
5. Update completed-tasks.md
```

---

## 🚀 How to Use in Vibe Kanban

### Option 1: Add to Task Description

When creating a task in Vibe Kanban, append the instructions:

```
Title: Add user authentication

Description:
Implement JWT-based user authentication with login, logout, and token refresh.

IMPORTANT: Follow .blackbox tracking protocol:
1. Read .blackbox/.plans/active/active-context.md before starting
2. Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
3. Log all progress as you work
4. Move to completed-tasks.md when done
5. Store artifacts in .blackbox/9-brain/incoming/
```

### Option 2: Configure Agent Profile

In Vibe Kanban Settings → Agent Profiles, create a custom profile with the system prompt included.

### Option 3: Project-Level Instructions

Add to Vibe Kanban Project Settings → Default Task Description:

```
All tasks should:
- Update .blackbox/.plans/active/vibe-kanban-work/active-tasks.md when starting
- Create progress file and log work
- Move to completed-tasks.md when done
- Store artifacts in .blackbox/9-brain/incoming/
```

---

## 📊 Example Agent Workflow

```
1. Agent receives task: "Fix navigation bug"

2. Agent reads .blackbox:
   - Checks active-tasks.md
   - Reads existing context

3. Agent creates progress file:
   .blackbox/.plans/active/vibe-kanban-work/task-123-progress.md

4. Agent works and logs progress:
   - "10:30 - Investigating issue..."
   - "10:45 - Found bug in Navigation.tsx line 45"
   - "11:00 - Fix implemented"

5. Agent completes:
   - Moves to completed-tasks.md
   - Creates artifact summary
   - Updates queue-status.md

Result: Complete audit trail in .blackbox!
```

---

## 🎁 Benefits

### ✅ Simple
- No complex monitoring systems
- No webhooks or databases
- Just instructions to the agent

### ✅ Reliable
- Agent has direct file access
- Updates happen as part of work
- No separate services to maintain

### ✅ Complete
- Agent logs context and decisions
- Progress tracking built-in
- Artifacts stored automatically

### ✅ Flexible
- Can customize instructions per task
- Agents can adapt to needs
- Easy to modify workflow

---

## 🧪 Test It

Create this task in Vibe Kanban:

```
Title: Test .blackbox integration

Description:
Test the .blackbox integration by:

1. Read .blackbox/.plans/active/vibe-kanban-work/active-tasks.md
2. Create a progress file: .blackbox/.plans/active/vibe-kanban-work/task-test-001-progress.md
3. In the progress file, log:
   - When you started
   - What you're doing
   - When you complete
4. Create a simple test file in src/test-blackbox.txt with "Integration test successful"
5. Move this task to completed-tasks.md
6. Create artifact summary in .blackbox/9-brain/incoming/

This proves the agent can read/write .blackbox files!
```

---

## 💪 Pro Tips

1. **Be Explicit:** Always include .blackbox instructions in task description
2. **Use Templates:** Copy-paste the templates above
3. **Check Progress:** Monitor .blackbox files to see agent progress
4. **Iterate:** Adjust instructions based on what works best
5. **Trust the Agent:** Agents are good at following instructions!

---

## 🎯 Summary

**Instead of building complex monitoring systems:**

❌ Old way: Database monitor, webhook server, polling, etc.
✅ New way: Just tell the agent to update .blackbox!

**Works because:**
- Agent has direct file access to .blackbox
- Agent can read/write files as part of its work
- Updates happen automatically with the task
- Zero infrastructure needed!

**Just add this to your task descriptions:**

```
IMPORTANT: Update .blackbox as you work:
- Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
- Log your progress
- Move to completed-tasks.md when done
- Store artifacts in .blackbox/9-brain/incoming/
```

That's it! The agent handles everything! 🎉
