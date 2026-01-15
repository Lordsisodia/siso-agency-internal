# Agent Protocol & Behavior Instructions

**Purpose:** Standardized instructions for ALL agents to ensure consistent task management, timeline tracking, and context preservation.

**Status:** ✅ **CRITICAL** - This is what's missing for full automation

---

## Overview

**Problem:** Agents don't know HOW to use the task management system.
**Solution:** This protocol document that ALL agents must follow.

**Enforcement:** Agents are instructed to read this file on startup.

---

## Agent Startup Protocol (MANDATORY)

### Every Agent MUST Do This On Startup:

```bash
# 1. Read this protocol
cat /path/to/blackbox4/.docs/1-getting-started/AGENT-BEHAVIOR-PROTOCOL.md

# 2. Check active tasks
cat .memory/working/shared/work-queue.json

# 3. Read timeline to understand context
cat .memory/working/shared/timeline.md

# 4. Write startup entry to timeline
```

---

## Universal Agent Behavior Rules

### Rule 1: Timeline Logging (MANDATORY)

**When:** Every agent startup, phase change, completion, error

**What to write:**
```markdown
## [TIMESTAMP] - Agent [AGENT_NAME] [ACTION]

**Task ID:** [task_id from work-queue.json]
**Agent:** [agent_name]
**Action:** [STARTED | PHASE_CHANGE | COMPLETED | ERROR | HANDOFF]
**Phase:** [ideation | research | planning | implementation | testing]
**Subtask:** [current subtask being worked on]
**Context:**
  - Previous work: [summary of what was done before]
  - Current focus: [what I'm doing now]
  - Dependencies: [what I need from others]
  - Artifacts: [files I'm creating/modifying]
**Next Steps:** [what should happen next]
```

**Where:** `.memory/working/shared/timeline.md`

### Rule 2: Task State Updates (MANDATORY)

**When:** Starting work, completing subtasks, changing phases

**What to update:** `.memory/working/shared/work-queue.json`

```json
{
  "id": "task_001",
  "title": "Continue improving SISO internal",
  "status": "in_progress",
  "current_agent": "architect",
  "current_phase": "planning",
  "subtasks": [
    {
      "id": "sub_001",
      "title": "Improving specific pages",
      "status": "in_progress",
      "phase": "planning",
      "assigned_to": "architect",
      "started_at": "2026-01-15T10:00:00Z"
    }
  ],
  "context": {
    "conversation_history": [...],
    "decisions_made": [...],
    "artifacts_created": [...],
    "blocking_issues": []
  }
}
```

### Rule 3: Context Preservation (MANDATORY)

**When:** Before any handoff or shutdown

**What to save:**
1. Conversation history (last 50 messages)
2. Decisions made (with reasoning)
3. Artifacts created (file paths and descriptions)
4. Current state (what's complete, what's pending)
5. Next steps (what should happen next)

**Where:** `.memory/working/shared/task-context/[task_id].json`

### Rule 4: Handoff Protocol (MANDATORY)

**When:** Task requires different agent, phase change, agent completion

**Process:**
1. **Package context** (see Rule 3)
2. **Write handoff entry** to timeline
3. **Update work-queue.json** with new agent
4. **Call handoff script:** `./4-scripts/agents/agent-handoff.sh`

**Handoff entry format:**
```markdown
## [TIMESTAMP] - HANDOFF: [FROM_AGENT] → [TO_AGENT]

**Task ID:** [task_id]
**Reason:** [why handoff is needed]
**Context Package:** [location of context file]
**Completion:** [what was accomplished]
**Remaining:** [what still needs to be done]
**Dependencies:** [what next agent needs]
**Confidence:** [how confident are we in the work so far]
```

### Rule 5: Subtask Breakdown (MANDATORY for Planning Phase)

**When:** Agent receives new task or enters planning phase

**Process:**
1. **Read task** from work-queue.json
2. **Break down** using BMAD methodology:
   - Ideation: What are we trying to achieve?
   - Research: What do we need to learn?
   - Planning: How will we implement it?
   - Implementation: What are the specific steps?
   - Testing: How do we verify it works?
3. **Update work-queue.json** with subtasks
4. **Write timeline entry** documenting breakdown

**Subtask template:**
```json
{
  "id": "sub_[unique]",
  "title": "[specific action]",
  "phase": "[ideation|research|planning|implementation|testing]",
  "status": "pending",
  "checklist": [
    "[ ] [specific sub-subtask]",
    "[ ] [specific sub-subtask]"
  ],
  "dependencies": [],
  "estimated_effort": "[time estimate]",
  "assigned_to": "[agent_name or null]"
}
```

### Rule 6: Error Handling (MANDATORY)

**When:** Agent encounters error or blocker

**Process:**
1. **Write error entry** to timeline
2. **Update task status** to "blocked"
3. **Document blocking issue** in work-queue.json
4. **Attempt recovery** (max 3 retries)
5. **Hand off** to specialist if unrecoverable

**Error entry format:**
```markdown
## [TIMESTAMP] - ERROR: Agent [AGENT_NAME]

**Task ID:** [task_id]
**Error Type:** [syntax|logic|api|dependency|unknown]
**Error Message:** [what went wrong]
**Attempted Recovery:** [what we tried]
**Retry Count:** [current retry attempt]
**Action Required:** [what needs to happen next]
**Handoff To:** [specialist agent, if needed]
```

### Rule 7: Completion Reporting (MANDATORY)

**When:** Agent completes task or subtask

**Process:**
1. **Verify completion** against checklist
2. **Write completion entry** to timeline
3. **Update task status** in work-queue.json
4. **Create/update artifacts** documenting results
5. **Recommend next action** (next phase, handoff, testing)

**Completion entry format:**
```markdown
## [TIMESTAMP] - COMPLETED: Agent [AGENT_NAME]

**Task ID:** [task_id]
**Subtask:** [subtask_id if applicable]
**Duration:** [time spent]
**Checklist:** [x] all items complete
**Artifacts Created:**
  - [file_path]: [description]
  - [file_path]: [description]
**Verification:** [how we verified it works]
**Recommendation:** [what should happen next]
**Confidence:** [how confident in the work]
```

---

## Agent Lifecycle State Machine

```
[STARTUP]
    ↓
[READ PROTOCOL] ← Read this file
    ↓
[LOAD CONTEXT] ← Read work-queue.json, timeline.md
    ↓
[WRITE STARTUP ENTRY] ← Document agent start
    ↓
[EXECUTE TASK] ← Do the work
    ↓
    ├─→ [PROGRESS UPDATE] ← Write timeline entry every 5-10 mins
    ├─→ [ERROR?] ← Follow error handling protocol
    └─→ [COMPLETE?] ← Follow completion protocol
         ↓
    [HANDOFF NEEDED?] ← Check if task needs different agent
         ├─→ YES: [PACKAGE CONTEXT] → [WRITE HANDOFF ENTRY] → [UPDATE WORK-QUEUE]
         └─→ NO: [WRITE COMPLETION ENTRY] → [UPDATE WORK-QUEUE]
              ↓
         [SHUTDOWN] ← Final timeline entry
```

---

## File Locations (Quick Reference)

**Protocol (this file):**
```
.docs/1-getting-started/AGENT-BEHAVIOR-PROTOCOL.md
```

**Timeline:**
```
.memory/working/shared/timeline.md
```

**Work Queue:**
```
.memory/working/shared/work-queue.json
```

**Task Context:**
```
.memory/working/shared/task-context/[task_id].json
```

**Handoff Script:**
```
./4-scripts/agents/agent-handoff.sh
```

**Kanban Board:**
```
python -m modules.kanban.board
```

---

## Startup Checklist (MANDATORY)

Every agent startup MUST:

- [ ] Read this protocol file
- [ ] Check work-queue.json for assigned tasks
- [ ] Read timeline.md for recent context
- [ ] Load task context if continuing work
- [ ] Write startup entry to timeline
- [ ] Update task status to "in_progress"
- [ ] Begin execution

---

## Shutdown Checklist (MANDATORY)

Every agent shutdown MUST:

- [ ] Complete current subtask if possible
- [ ] Write completion/progress entry to timeline
- [ ] Save all context to task-context file
- [ ] Update work-queue.json with current state
- [ ] Recommend next action (continue, handoff, wait)
- [ ] Write shutdown entry to timeline

---

## Integration with Agent Prompts

**All agent prompts should include:**

```markdown
## Your Protocol

You are part of the Blackbox4 system. You MUST follow the agent behavior protocol:

1. Read: `.docs/1-getting-started/AGENT-BEHAVIOR-PROTOCOL.md`
2. Load: `.memory/working/shared/work-queue.json`
3. Read: `.memory/working/shared/timeline.md`
4. Write startup entry to timeline
5. Execute task following protocol rules
6. Write completion entry to timeline
7. Save context before shutdown

**Non-negotiable:** You MUST log all actions to timeline.md and update work-queue.json.
```

---

## Verification

**How to check if agents are following protocol:**

```bash
# Check timeline is being updated
tail -20 .memory/working/shared/timeline.md

# Check work queue is being updated
cat .memory/working/shared/work-queue.json | jq '.'

# Check context is being saved
ls -la .memory/working/shared/task-context/

# Check handoffs are happening
grep -r "HANDOFF:" .memory/working/shared/timeline.md
```

---

## Penalties for Non-Compliance

**Agents that don't follow protocol:**
1. First offense: Warning in timeline
2. Second offense: Reset and re-read protocol
3. Third offense: Handoff to compliance agent
4. Chronic: Agent redesign required

---

## Examples

### Example 1: Agent Starting Work

**Timeline entry:**
```markdown
## 2026-01-15T10:00:00Z - Agent architect STARTED

**Task ID:** task_001_sub_001
**Agent:** architect
**Action:** STARTED
**Phase:** planning
**Subtask:** Improving specific pages - Homepage redesign
**Context:**
  - Previous work: Brain dump completed, requirements gathered
  - Current focus: Designing homepage layout with improved navigation
  - Dependencies: None
  - Artifacts: Will create wireframes, component specs
**Next Steps:** Create homepage design document, then handoff to dev
```

### Example 2: Agent Handoff

**Timeline entry:**
```markdown
## 2026-01-15T11:45:00Z - HANDOFF: architect → dev

**Task ID:** task_001_sub_001
**Reason:** Planning phase complete, ready for implementation
**Context Package:** .memory/working/shared/task-context/task_001_sub_001.json
**Completion:**
  - Homepage design document created
  - Wireframes approved
  - Component specifications written
**Remaining:**
  - Implement homepage components
  - Add navigation logic
  - Responsive design
**Dependencies:** Design document, wireframes, Figma links
**Confidence:** High - Design is complete and reviewed
```

---

## Summary

**This protocol is MANDATORY for all agents.**

**Key Points:**
1. ✅ Always write to timeline
2. ✅ Always update work queue
3. ✅ Always save context before handoff/shutdown
4. ✅ Always follow subtask breakdown process
5. ✅ Always handle errors gracefully
6. ✅ Always verify completion before marking done

**Result:** Full context persistence, perfect handoffs, zero information loss.

---

**Protocol Version:** 1.0
**Last Updated:** 2026-01-15
**Status:** ✅ ACTIVE - ALL AGENTS MUST FOLLOW
