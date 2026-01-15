# Quick Start: Task Management in Blackbox4

**Get started in 10 minutes**

---

## Step 1: Initialize the System (2 minutes)

```bash
cd .blackbox4

# Create timeline
cat > .memory/working/shared/timeline.md <<'EOF'
# Blackbox4 System Timeline

This timeline tracks all agent activity.

## Timeline Entries

*(Agents will add entries automatically)*

---
**Created:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

# Create work queue with your SISO task
cat > .memory/working/shared/work-queue.json <<'EOF'
[
  {
    "id": "task_001",
    "title": "Continue improving SISO internal",
    "description": "Improve and push to GitHub for testing",
    "priority": "high",
    "status": "ready",
    "created_at": "2026-01-15T10:00:00Z",
    "subtasks": [
      {
        "id": "sub_001",
        "title": "Improving specific pages",
        "phase": "ideation",
        "status": "pending",
        "checklist": [
          "[ ] Brainstorm improvements",
          "[ ] Research best practices",
          "[ ] Create design mockups",
          "[ ] Plan implementation",
          "[ ] Implement changes",
          "[ ] Test functionality"
        ]
      },
      {
        "id": "sub_002",
        "title": "Adding new features",
        "phase": "ideation",
        "status": "pending",
        "checklist": [
          "[ ] Identify feature gaps",
          "[ ] Research solutions",
          "[ ] Design architecture",
          "[ ] Plan implementation",
          "[ ] Implement features",
          "[ ] Test functionality"
        ]
      }
    ],
    "context": {
      "conversation_history": [],
      "decisions_made": [],
      "artifacts_created": [],
      "blocking_issues": []
    }
  }
]
EOF

echo "✅ System initialized!"
```

---

## Step 2: Update Your Agent Prompts (5 minutes)

**Add this to the TOP of every agent prompt file:**

```markdown
# BLACKBOX4 AGENT PROTOCOL

You are part of the Blackbox4 autonomous task management system.

## MANDATORY BEHAVIOR

You MUST follow the agent behavior protocol at:
`.docs/1-getting-started/AGENT-BEHAVIOR-PROTOCOL.md`

## STARTUP CHECKLIST

On startup, you MUST:

1. Read the protocol file
2. Load: `.memory/working/shared/work-queue.json`
3. Read: `.memory/working/shared/timeline.md`
4. Write your startup entry to timeline.md
5. Update task status to "in_progress"
6. Begin execution

## TIMELINE LOGGING

You MUST write to timeline.md:
- When you START work
- Every 5-10 minutes of PROGRESS
- When you COMPLETE work
- When you ERROR
- When you HANDOFF to another agent

## CONTEXT PRESERVATION

Before shutdown or handoff, you MUST:
1. Save all conversation history
2. Document all decisions made
3. List all artifacts created
4. Specify next steps
5. Save to: `.memory/working/shared/task-context/[task_id].json`

## NON-NEGOTIABLE

- Log ALL actions to timeline.md
- Update work-queue.json on status changes
- Save context before shutdown
- Follow handoff protocol for task transfers

---
**END OF PROTOCOL**
```

**Agent files to update:**
- `1-agents/2-bmad/modules/*.agent.yaml`
- `1-agents/4-specialists/ralph-agent/protocol.md`
- Any custom agent prompts

---

## Step 3: Test the System (3 minutes)

```bash
# Create a simple plan
./4-scripts/planning/new-plan.sh "Test task management system"

# Edit the plan
cd .plans/active/$(ls -t .plans/active/ | head -1)/

# Add to checklist.md
cat > checklist.md <<'EOF'
# Task Checklist

## Setup
- [x] Initialize timeline.md
- [x] Create work-queue.json
- [ ] Update agent prompts
- [ ] Test agent execution

## Test
- [ ] Start agent on task
- [ ] Verify timeline logging
- [ ] Verify work queue updates
- [ ] Test agent handoff
EOF

# Check status
cat ../../.memory/working/shared/timeline.md
cat ../../.memory/working/shared/work-queue.json | jq '.'
```

---

## Step 4: Monitor Progress (Ongoing)

```bash
# View timeline
tail -50 .memory/working/shared/timeline.md

# View work queue
cat .memory/working/shared/work-queue.json | jq '.'

# View active tasks
cat .memory/working/shared/work-queue.json | jq '.[] | select(.status == "in_progress")'

# View completed tasks
cat .memory/working/shared/work-queue.json | jq '.[] | select(.status == "complete")'
```

---

## Example Agent Session

### Agent Startup:

**Timeline entry:**
```markdown
## 2026-01-15T10:00:00Z - Agent architect STARTED

**Task ID:** task_001_sub_001
**Agent:** architect
**Action:** STARTED
**Phase:** ideation
**Subtask:** Improving specific pages
**Context:**
  - Previous work: None (new task)
  - Current focus: Brainstorming improvements for key pages
  - Dependencies: None
  - Artifacts: Will create ideation document
**Next Steps:** Generate improvement ideas, then move to research phase
```

**Work queue update:**
```json
{
  "id": "sub_001",
  "status": "in_progress",
  "current_agent": "architect",
  "started_at": "2026-01-15T10:00:00Z"
}
```

### Agent Progress (5 minutes later):

**Timeline entry:**
```markdown
## 2026-01-15T10:05:00Z - Agent architect PROGRESS

**Task ID:** task_001_sub_001
**Progress:** Generated 10 improvement ideas for homepage
  - Simplify navigation
  - Add hero section
  - Improve color contrast
  - Add search functionality
  - Mobile responsive design
  - Performance optimization
  - A/B testing framework
  - User feedback widget
  - Analytics dashboard
  - Content personalization
**Next:** Research best practices for each idea
```

### Agent Completion:

**Timeline entry:**
```markdown
## 2026-01-15T11:30:00Z - Agent architect COMPLETED

**Task ID:** task_001_sub_001
**Duration:** 1.5 hours
**Checklist:**
  - [x] Brainstorm improvements
  - [x] Research best practices
  - [x] Create design mockups
**Artifacts Created:**
  - .plans/active/.../ideation-document.md
  - .plans/active/.../research-findings.md
  - .plans/active/.../design-mockups.md
**Verification:** Reviewed ideas against best practices
**Recommendation:** Move to implementation phase with dev agent
**Confidence:** High - Solid foundation for implementation
```

**Work queue update:**
```json
{
  "id": "sub_001",
  "status": "complete",
  "completed_at": "2026-01-15T11:30:00Z",
  "next_phase": "implementation",
  "next_agent": "dev"
}
```

### Agent Handoff:

**Timeline entry:**
```markdown
## 2026-01-15T11:31:00Z - HANDOFF: architect → dev

**Task ID:** task_001_sub_001
**Reason:** Ideation and research complete, ready for implementation
**Context Package:** .memory/working/shared/task-context/task_001_sub_001.json
**Completion:**
  - 10 improvement ideas generated
  - Best practices researched
  - Design mockups created
**Remaining:**
  - Implement homepage improvements
  - Add new features
  - Test functionality
**Dependencies:** Design mockups, research findings
**Confidence:** High - Ready for implementation
```

---

## Troubleshooting

### Issue: Timeline not being updated

**Check:**
```bash
# Does timeline.md exist?
ls -la .memory/working/shared/timeline.md

# Does agent have permission?
chmod 666 .memory/working/shared/timeline.md
```

### Issue: Work queue not being updated

**Check:**
```bash
# Is JSON valid?
cat .memory/working/shared/work-queue.json | jq '.'

# Fix if invalid:
cat .memory/working/shared/work-queue.json | python -m json.tool > /tmp/fixed.json
mv /tmp/fixed.json .memory/working/shared/work-queue.json
```

### Issue: Agent not following protocol

**Solution:**
1. Check agent prompt has protocol instructions
2. Verify protocol file exists at correct path
3. Test agent with simple task first
4. Check timeline for agent startup entry

---

## Next Steps

### Immediate (Today):

1. ✅ Initialize timeline and work queue
2. ✅ Add protocol to your agent prompts
3. ✅ Test with simple task
4. Monitor timeline and work queue

### Short-term (This Week):

1. Create Agent Lifecycle Manager
2. Build Auto-Task Breakdown Service
3. Implement Task Router
4. Add simple dashboard

### Long-term (This Month):

1. Semantic search integration
2. Progress prediction
3. Agent performance tracking
4. Recovery system

---

## Summary

**What you just did:**
1. ✅ Initialized timeline for tracking
2. ✅ Created work queue with your SISO task
3. ✅ Added protocol to agent prompts
4. ✅ Tested the system

**What happens now:**
- Agents log all activity to timeline
- Tasks tracked in work queue
- Context preserved for handoffs
- Full visibility into progress

**What you can do:**
- Brain dump more tasks to work queue
- Let agents work autonomously
- Monitor progress in timeline
- Handoff between agents seamlessly

**Result:** True autonomous task management! 🎉

---

**Quick Start Completed:** 2026-01-15
**Status:** ✅ Ready to use
**Next:** Add your tasks and start working!
