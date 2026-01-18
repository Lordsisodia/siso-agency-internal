# 📋 Vibe Kanban Task Templates with .blackbox Integration

## ⚡ Quick Copy-Paste Templates

### Template 1: Standard Task (Most Common)

```
Title: [YOUR TASK TITLE]

Description:
[YOUR TASK DESCRIPTION]

📍 .blackbox Integration:
When working on this task:
1. Read .blackbox/.plans/active/vibe-kanban-work/active-tasks.md for context
2. Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
3. Log your progress as you work (what you did, decisions made, files changed)
4. When complete, move entry to .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
5. Create artifact summary in .blackbox/9-brain/incoming/vibe-kanban-tasks/{ID}.md
```

### Template 2: Bug Fix

```
Title: Fix [BUG DESCRIPTION]

Description:
[Describe the bug and expected behavior]

📍 .blackbox Integration:
1. Create progress file and document your investigation
2. Log the root cause when found
3. Document the fix you implement
4. Move to completed-tasks.md with resolution details
```

### Template 3: Feature Development

```
Title: Implement [FEATURE NAME]

Description:
[Describe the feature to implement]

📍 .blackbox Integration:
1. Read existing .blackbox context for this area
2. Create progress file with implementation plan
3. Log each file you create/modify
4. Document key decisions
5. Store feature artifacts in .blackbox/9-brain/incoming/
```

### Template 4: Refactoring

```
Title: Refactor [CODE AREA]

Description:
[What needs refactoring and why]

📍 .blackbox Integration:
1. Check .blackbox for existing context about this code
2. Create progress file with refactoring plan
3. Log each change with reason
4. Document before/after state
5. Store refactoring notes in .blackbox/9-brain/incoming/
```

### Template 5: Documentation

```
Title: Document [FEATURE/COMPONENT]

Description:
[What needs to be documented]

📍 .blackbox Integration:
1. Read existing .blackbox documentation
2. Create progress file
3. Store documentation in appropriate .blackbox location
4. Update completed-tasks.md with documentation links
```

---

## 🎯 Super-Short Version (Add to Any Task)

Just add this to the end of any task description:

```
📍 .blackbox: Create progress file at .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md and log your work. When done, update completed-tasks.md.
```

---

## 💡 Example: Complete Task

```
Title: Add dark mode toggle to settings

Description:
Add a dark mode toggle switch to the settings page. The toggle should:
- Persist preference in localStorage
- Apply dark theme to entire app
- Show current mode status
- Be accessible with keyboard navigation

Implementation:
- Use existing theme context
- Add toggle component in SettingsPage.tsx
- Update CSS variables for dark theme
- Test toggle functionality

📍 .blackbox Integration:
When working on this task:
1. Read .blackbox/.plans/active/vibe-kanban-work/active-tasks.md for context
2. Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
3. Log your progress:
   - Files you modify
   - Decisions you make
   - Issues encountered
4. When complete:
   - Move entry to .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
   - Create artifact summary in .blackbox/9-brain/incoming/vibe-kanban-tasks/{ID}.md
   - List all files created/modified
```

---

## 🔧 Configure as Default in Vibe Kanban

### Option A: Project-Level Default

In Vibe Kanban Project Settings:

```
Default Task Instructions:
All tasks should:
- Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
- Log work as they progress
- Move to completed-tasks.md when done
- Store artifacts in .blackbox/9-brain/incoming/
```

### Option B: Agent Profile Instructions

In Vibe Kanban Settings → Agent Profiles → Create Profile:

```
Profile Name: .blackbox-Enabled Agent

System Prompt:
You are an AI coding agent working on the SISO-INTERNAL codebase. This codebase includes a .blackbox memory system.

IMPORTANT: Always update .blackbox files as you work:
1. Create progress file when starting
2. Log your progress as you work
3. Move to completed when done
4. Store artifacts appropriately

.blackbox locations:
- Active work: .blackbox/.plans/active/vibe-kanban-work/
- Artifacts: .blackbox/9-brain/incoming/
- Memory: .blackbox/9-brain/memory/extended/
```

---

## 📊 What Gets Logged

### Agent Should Log:

**In progress file:**
- When they started
- What they're doing
- Files they create/modify
- Decisions they make
- Problems they encounter
- When they complete

**In completed file:**
- Task ID and title
- Completion time
- Files modified
- Success/failure status
- Artifacts created

### Example Progress File:

```markdown
# Task Progress: Add dark mode toggle

**ID:** abc-123
**Agent:** Claude
**Started:** 2025-01-18 10:30:00
**Status:** Completed

## Task Description
Add dark mode toggle to settings page

## Progress Log

### 10:30 - Started
- Read active-tasks.md for context
- Found existing theme system
- Planned implementation approach

### 10:45 - Implementation
- Modified: src/components/SettingsPage.tsx
  - Added toggle component
  - Wired up theme context
- Modified: src/styles/theme.css
  - Added dark theme variables
- Created: src/hooks/useDarkMode.ts
  - Custom hook for dark mode logic

### 11:00 - Testing
- Tested toggle functionality
- Verified localStorage persistence
- Checked keyboard accessibility

### 11:15 - Complete
✅ All requirements met
✅ Files modified: 3
✅ Files created: 1
✅ Tests passing
```

---

## 🎁 Summary

**The Simple Approach:**

Instead of building complex monitoring systems, **just tell the agent to update .blackbox**!

✅ Agent has direct file access
✅ Updates happen with the work
✅ Zero infrastructure needed
✅ Complete audit trail

**Just add to any task:**

```
📍 .blackbox: Create progress file and log your work. When done, update completed-tasks.md.
```

That's it! 🎉
