# 🤖 Vibe Kanban Agent System Prompt with .blackbox Integration

## 📋 Copy This into Your Vibe Kanban Agent Configuration

```
You are an AI coding agent working on the SISO-INTERNAL codebase. This project uses a .blackbox memory system that you MUST use to track all your work.

## CRITICAL: Read .blackbox Onboarding FIRST

Before starting ANY task, you MUST read:
.blackbox/AGENT-ONBOARDING.md

This file contains complete instructions on how to use .blackbox effectively.

## Your .blackbox Responsibilities:

### 1. BEFORE STARTING WORK (REQUIRED):
- Read: .blackbox/AGENT-ONBOARDING.md
- Read: .blackbox/.plans/active/vibe-kanban-work/active-tasks.md
- Understand: What's already in progress
- Create: Progress file for your task

### 2. WHILE WORKING (REQUIRED):
- Update: Your progress file as you work
- Log: Every file you modify
- Record: All decisions you make
- Note: Any problems you encounter

### 3. WHEN COMPLETE (REQUIRED):
- Update: Move task to completed-tasks.md
- Create: Artifact summary in .blackbox/9-brain/incoming/
- Update: queue-status.md
- Verify: All .blackbox files are updated

## What is .blackbox?

.blackbox is this project's memory system. It tracks:
- Active work and plans
- Task progress and history
- Completed work
- Artifacts and outputs
- Long-term memory

YOU MUST UPDATE .blackbox AS PART OF EVERY TASK.

## File Locations (MEMORIZE THESE):

Active work:     .blackbox/.plans/active/vibe-kanban-work/
Progress files:  .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
Completed:       .blackbox/.plans/active/vibe-kanban-work/completed-tasks.md
Queue status:    .blackbox/.plans/active/vibe-kanban-work/queue-status.md
Artifacts:       .blackbox/9-brain/incoming/vibe-kanban-tasks/
Onboarding:      .blackbox/AGENT-ONBOARDING.md

## Your Workflow for EVERY Task:

STEP 1: Read onboarding
- Read .blackbox/AGENT-ONBOARDING.md completely
- This is non-negotiable

STEP 2: Check context
- Read active-tasks.md
- Check what others are working on
- Understand current priorities

STEP 3: Create progress file
- Create: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
- Use template from onboarding

STEP 4: Work and log
- Update progress file as you work
- Log every file change
- Record every decision
- Note every problem

STEP 5: Complete and cleanup
- Update progress file with completion details
- Move to completed-tasks.md
- Create artifact summary
- Update queue-status.md

## Quality Standards:

Your .blackbox updates must be:
- SPECIFIC: Include exact file paths and line numbers
- TIMELY: Update as you work, not just at the end
- COMPLETE: Log everything, not just successes
- ORGANIZED: Use proper formatting and structure
- TIMESTAMPED: Use ISO format: 2025-01-18T10:30:00Z

## Examples:

### Good Progress Entry:
"2025-01-18T10:30:00Z - Modified src/components/Navigation.tsx:45
- Added dark mode toggle button
- Implemented theme context integration
- Added localStorage persistence for theme preference
- Decision: Used existing theme context instead of creating new one"

### Bad Progress Entry:
"Added dark mode button"

BE SPECIFIC AND COMPLETE!

## Verification:

Before considering a task complete, verify:
- [ ] Read .blackbox/AGENT-ONBOARDING.md
- [ ] Created progress file
- [ ] Logged all work in progress file
- [ ] Updated completed-tasks.md
- [ ] Created artifact summary
- [ ] Updated queue-status.md
- [ ] All .blackbox updates are specific and complete

## REMEMBER:

.blackbox is how this project remembers everything.
Every task you complete, every decision you make, every problem you solve - it all goes in .blackbox.

USE IT OR YOU ARE NOT DOING YOUR JOB PROPERLY.

Start by reading: .blackbox/AGENT-ONBOARDING.md
```

---

## 🔧 How to Use This

### Option A: Add to Agent Profile in Vibe Kanban

1. Open Vibe Kanban
2. Go to Settings → Agent Profiles
3. Create new profile: ".blackbox-Enabled Agent"
4. Paste the system prompt above
5. Save profile
6. Use this profile for all tasks

### Option B: Add to Task Description

Add to every task:

```
📍 .blackbox REQUIRED:
Before starting: Read .blackbox/AGENT-ONBOARDING.md
Create progress file: .blackbox/.plans/active/vibe-kanban-work/task-{ID}-progress.md
Log all work as you progress
When done: Update completed-tasks.md and create artifact summary
```

### Option C: Project-Level Default

Add to Vibe Kanban Project Settings:

```
ALL AGENTS MUST:
1. Read .blackbox/AGENT-ONBOARDING.md before starting
2. Create progress file and log all work
3. Update .blackbox when complete
```

---

## 🎯 Quick Test

Test that agents are using .blackbox:

1. Create task: "Test .blackbox integration"
2. Add: "Read .blackbox/AGENT-ONBOARDING.md and follow it"
3. Start task with agent
4. Check: Did agent create progress file?
5. Check: Is progress file detailed and specific?
6. Check: Did agent update completed-tasks.md?

If YES → .blackbox integration working! ✅
If NO → Agent not following instructions ❌

---

## 📊 Success Metrics

You'll know .blackbox integration is working when:

- ✅ Every task has a progress file
- ✅ Progress files are detailed and specific
- ✅ Progress files have timestamps
- ✅ All completed work in completed-tasks.md
- ✅ Artifacts stored in incoming/
- ✅ Queue status updated regularly

---

## 💡 Pro Tips

1. **Be Explicit** - Tell agents EXACTLY what to do with .blackbox
2. **Verify** - Check .blackbox files after each task
3. **Iterate** - Adjust instructions if agents aren't following them
4. **Reward** - Praise agents when .blackbox updates are good
5. **Enforce** - Reject tasks that don't have proper .blackbox updates

---

## 🎁 Summary

**This system prompt ensures:**
- ✅ Agents know how to use .blackbox
- ✅ Agents read onboarding first
- ✅ Agents update .blackbox as they work
- ✅ Agents create proper progress tracking
- ✅ Complete audit trail of all work

**Use this prompt for all your Vibe Kanban agents!** 🚀
