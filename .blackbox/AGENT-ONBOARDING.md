# 🤖 Agent Onboarding: How to Use .blackbox

## 🎯 Welcome, AI Agent!

You are working in the **SISO-INTERNAL** codebase. This project uses a **.blackbox memory system** to track all work, progress, and context.

**This is your guide to using .blackbox effectively.**

---

## 📁 What is .blackbox?

`.blackbox` is our **memory system** - it tracks everything that happens in this codebase:
- Active work and plans
- Progress on tasks
- Completed work history
- Artifacts and outputs
- Long-term memory

Think of it as the project's "brain" - everything important is stored here.

---

## 🗂️ Key .blackbox Locations

### 1. Active Work
```
.blackbox/.plans/active/
```
**What's here:** Current projects, tasks in progress, active plans

**Key files:**
- `vibe-kanban-work/active-tasks.md` - Tasks currently being worked on
- `vibe-kanban-work/completed-tasks.md` - Task history
- `vibe-kanban-work/queue-status.md` - Current queue state
- `vibe-kanban-work/task-{ID}-progress.md` - Individual task progress

### 2. Incoming Artifacts
```
.blackbox/9-brain/incoming/
```
**What's here:** New artifacts, completed work, recent outputs

**Key directories:**
- `vibe-kanban-tasks/` - Completed task artifacts
- `git-commits/` - Commit tracking

### 3. Extended Memory
```
.blackbox/9-brain/memory/extended/
```
**What's here:** Long-term storage, archives, permanent records

---

## 📋 Your Workflow with .blackbox

### When You Start a Task:

1. **Read Context**
   ```bash
   # Check what's already in progress
   cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

   # Check recent completed work
   cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
   ```

2. **Create Progress File**
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
   - Read active context
   - Understanding requirements
   - Planning approach
   ```

3. **Update Active Tasks**
   ```markdown
   ## Task: {TASK_TITLE}
   - **ID:** {TASK_ID}
   - **Agent:** {YOUR_NAME}
   - **Started:** {TIMESTAMP}
   - **Status:** In Progress
   ```

### While You Work:

4. **Log Progress Regularly**
   ```markdown
   ### {TIMESTAMP} - Progress Update
   - Modified: {file_path}
     - {description of changes}
   - Created: {file_path}
     - {description of new file}
   - Decision: {decision made and why}
   ```

5. **Record Decisions**
   ```markdown
   ### {TIMESTAMP} - Decision
   **Decision:** {what you decided}
   **Reason:** {why you decided this}
   **Alternatives Considered:** {other options}
   ```

6. **Note Problems**
   ```markdown
   ### {TIMESTAMP} - Issue Encountered
   **Problem:** {what went wrong}
   **Solution:** {how you're fixing it}
   **Status:** {resolved|in progress|blocked}
   ```

### When You Complete a Task:

7. **Update Progress File**
   ```markdown
   ## ✅ Task Completed

   **Completed:** {TIMESTAMP}
   **Duration:** {TIME_SPENT}
   **Status:** Success

   ### Files Modified
   - {file_path}: {changes made}
   - {file_path}: {changes made}

   ### Files Created
   - {file_path}: {purpose}
   - {file_path}: {purpose}

   ### Success Criteria
   - ✅ {criteria 1 met}
   - ✅ {criteria 2 met}
   - ✅ {criteria 3 met}

   ### Git Commits
   - {commit_hash}: {commit_message}
   ```

8. **Move to Completed**
   ```markdown
   ## ✅ {TASK_TITLE}
   - **ID:** {TASK_ID}
   - **Agent:** {YOUR_NAME}
   - **Completed:** {TIMESTAMP}
   - **Files Modified:** {count}
   - **Status:** Success
   ```

9. **Store Artifacts**
   ```
   Create: .blackbox/9-brain/incoming/vibe-kanban-tasks/{TASK_ID}.md
   ```

10. **Update Queue Status**
    ```markdown
    Update: .blackbox/.plans/active/vibe-kanban-work/queue-status.md
    ```

---

## 🔍 How to Read .blackbox

### Before Starting Work:
```bash
# 1. Check active context
cat .blackbox/.plans/active/active-context.md

# 2. Check what others are working on
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# 3. Check recent history
cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md | tail -50

# 4. Check for relevant plans
ls .blackbox/.plans/active/
```

### Finding Related Work:
```bash
# Search for keywords in .blackbox
grep -r "KEYWORD" .blackbox/.plans/active/

# Check memory for context
grep -r "KEYWORD" .blackbox/9-brain/memory/extended/
```

---

## 💾 Best Practices

### DO:
✅ **Update .blackbox as you work** - Don't wait until the end
✅ **Be specific** - Include file paths, line numbers, exact changes
✅ **Log decisions** - Explain why you made choices
✅ **Record problems** - Note issues and how you solved them
✅ **Timestamp everything** - Use ISO format: 2025-01-18T10:30:00Z
✅ **Keep it organized** - Use consistent formatting
✅ **Cross-reference** - Link to related files and tasks

### DON'T:
❌ **Update only at the end** - Log as you go
❌ **Be vague** - "Fixed some stuff" → "Fixed navigation bug in Navigation.tsx:45"
❌ **Skip context** - Explain the why, not just the what
❌ **Ignore failures** - Even failed tasks teach us something
❌ **Forget timestamps** - When matters as much as what

---

## 📊 File Templates

### Active Tasks Entry
```markdown
## {TASK_TITLE}

- **ID:** {TASK_ID}
- **Agent:** {AGENT_NAME}
- **Started:** {ISO_TIMESTAMP}
- **Status:** In Progress
- **Priority:** {HIGH|MEDIUM|LOW}
- **Description:** {BRIEF_DESCRIPTION}

---

```

### Progress File Structure
```markdown
# Task Progress: {TASK_TITLE}

**ID:** {TASK_ID}
**Agent:** {AGENT_NAME}
**Started:** {ISO_TIMESTAMP}
**Status:** {In Progress|Completed|Failed}
**Last Updated:** {ISO_TIMESTAMP}

## Task Description
{FULL_TASK_DESCRIPTION}

## Requirements
- {requirement 1}
- {requirement 2}
- {requirement 3}

## Context
{Relevant context from codebase or .blackbox}

## Progress Log

### {TIMESTAMP} - Investigation
- {what you did}
- {what you found}
- {next steps}

### {TIMESTAMP} - Implementation
- Modified: {file}
  - {changes made}
- Created: {file}
  - {purpose}

### {TIMESTAMP} - Testing
- {test performed}
- {result}

### {TIMESTAMP} - Completion
- {final status}
- {verification steps}
```

### Completed Tasks Entry
```markdown
## ✅ {TASK_TITLE}

- **ID:** {TASK_ID}
- **Agent:** {AGENT_NAME}
- **Started:** {START_TIME}
- **Completed:** {COMPLETION_TIME}
- **Duration:** {DURATION}
- **Status:** Success

### Changes Made
- **Files Modified:** {count}
  - {file}: {changes}
  - {file}: {changes}
- **Files Created:** {count}
  - {file}: {purpose}
- **Files Deleted:** {count}
  - {file}: {reason}

### Git Commits
- `{commit_hash}`: {commit_message}

### Success Criteria
- ✅ {criteria 1}
- ✅ {criteria 2}
- ✅ {criteria 3}

### Artifacts
- Stored in: `.blackbox/9-brain/incoming/vibe-kanban-tasks/{TASK_ID}.md`

---

```

---

## 🎯 Quick Reference

### Essential Commands:
```bash
# Read active tasks
cat .blackbox/.plans/active/vibe-kanban-work/active-tasks.md

# Read completed tasks
cat .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md

# Check queue status
cat .blackbox/.plans/active/vibe-kanban-work/queue-status.md

# Read specific progress
cat .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md

# Search .blackbox
grep -r "KEYWORD" .blackbox/
```

### File Paths:
```
Active work:     .blackbox/.plans/active/vibe-kanban-work/
Progress files:  .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
Artifacts:       .blackbox/9-brain/incoming/vibe-kanban-tasks/
Memory:          .blackbox/9-brain/memory/extended/
```

---

## 🚀 Getting Started

1. **First thing:** Read this file completely
2. **Second:** Check `.blackbox/.plans/active/vibe-kanban-work/active-tasks.md`
3. **Third:** Create your progress file
4. **Fourth:** Start working and log as you go
5. **Fifth:** Update .blackbox when complete

---

## 💡 Remember

**.blackbox is how this project remembers everything.**

Every task you complete, every decision you make, every problem you solve - it all goes in .blackbox.

This creates:
- ✅ Complete audit trail
- ✅ Context for future work
- ✅ Knowledge base for the team
- ✅ History of the codebase evolution

**Use it well, and you'll make this project better for everyone!** 🎉

---

## 📞 Need Help?

If you're unsure about .blackbox:
1. Check this file first
2. Look at examples in `active-tasks.md` and `completed-tasks.md`
3. Read existing progress files
4. Follow the templates above

**You've got this! Now go make something awesome!** 🚀
