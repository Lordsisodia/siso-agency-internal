# Black Box + Vibe Kanban Agent Integration - Implementation Summary

## Overview

This document summarizes the complete plan for making Claude Code agents automatically aware of and use the Black Box system when working on tasks from Vibe Kanban.

## What We've Created

### 1. Complete Integration Plan
**File**: `docs/VIBE-KANBAN-BLACKBOX-AGENT-INTEGRATION.md`

A comprehensive 200+ line document covering:
- Solution architecture
- 6-phase implementation plan
- Agent prompt templates
- Vibe Kanban task templates
- Automated context injection
- Memory Bank auto-sync
- Testing & validation
- Troubleshooting guide

### 2. Agent Context Template
**File**: `.blackbox5/templates/agent-context-template.md`

A universal template that includes:
- What is the Black Box
- Core principles
- Required workflows (before/during/after work)
- Memory Bank file structure
- Domain knowledge structure
- Key skills to use
- MCP tools available
- Critical rules
- Quick start checklist
- Example workflows

### 3. Memory Bank Management Skill
**File**: `.blackbox5/engine/.agents/.skills/core-infrastructure/memory-bank-management/SKILL.md`

A comprehensive skill covering:
- When to use the skill
- Required pre-work
- 5 usage patterns (start, update, log, complete, context)
- MCP integration examples
- Search patterns
- Real-world examples
- Troubleshooting
- Best practices
- Quick reference

### 4. Memory Bank Setup Script
**File**: `.blackbox5/scripts/setup-memory-bank.sh`

Automated setup that creates:
- `active-context.md` - Current working context
- `progress.md` - Task progress tracking
- `decision-log.md` - Architecture decisions
- `product-context.md` - Product knowledge
- `system-patterns.md` - Reusable patterns

## How It Works

### The Architecture

```
Vibe Kanban (Task Source)
    ↓ assigns task
Claude Code Agent
    ↓ loads context
Black Box System
    ├── Memory Bank (persistent memory)
    ├── Domain Knowledge (organized docs)
    ├── Skills (40+ reusable patterns)
    └── MCP Tools (external integrations)
```

### The Agent Workflow

1. **Pre-Work** (Mandatory)
   - Load active context from Memory Bank
   - Check progress for related work
   - Review recent decisions
   - Search domain knowledge
   - Find relevant skills

2. **During Work**
   - Update progress tracking continuously
   - Document architectural decisions
   - Use existing skills when available
   - Update active context as things change

3. **Post-Work** (Mandatory)
   - Mark task complete in progress.md
   - Document outcomes and next steps
   - Update active context
   - Update Vibe Kanban task status

## Next Steps to Implement

### Step 1: Set Up Memory Bank (Do Now)

Run the setup script:

```bash
./.blackbox5/scripts/setup-memory-bank.sh
```

This will create all necessary Memory Bank files with proper templates.

### Step 2: Configure Vibe Kanban Agent Profile

In Vibe Kanban (http://localhost:3000):

1. Go to **Settings** → **Agent Profiles**
2. Create or edit the **Claude Code** profile
3. Add this to the **System Prompt**:

```markdown
You are a Claude Code agent working in the Black Box system.

Before starting any task:
1. Load active context from .blackbox5/engine/memory/memory-bank/active-context.md
2. Check progress from .blackbox5/engine/memory/memory-bank/progress.md
3. Review recent decisions from .blackbox5/engine/memory/memory-bank/decision-log.md
4. Search for relevant domain knowledge in .blackbox5/engine/domains/
5. Check for existing skills in .blackbox5/engine/.agents/.skills/

During work:
- Continuously update progress.md
- Document decisions in decision-log.md
- Use existing skills and patterns
- Update active-context.md with current state

After work:
- Mark task as complete in progress.md
- Document outcomes and next steps
- Update Vibe Kanban task status

See .blackbox5/templates/agent-context-template.md for full documentation.
```

### Step 3: Create Your First Black Box Aware Task

In Vibe Kanban:

1. Create a new task in the "SISO Internal" project
2. In the description, add:

```markdown
# Task: [Your Task Name]

## Black Box Integration
This task requires Black Box system awareness. Follow the workflow in:
.blackbox5/templates/agent-context-template.md

## Task Details
[Your task description here]

## Instructions
1. Load context from Memory Bank
2. Update progress as you work
3. Document any decisions
4. Use existing skills when possible
5. Mark complete when done
```

3. Assign to **Claude Code** executor
4. Start the task

### Step 4: Test the Integration

When the agent starts working, verify it:

- ✅ Loads context from Memory Bank
- ✅ Updates progress.md
- ✅ Documents decisions (if any)
- ✅ Uses existing skills
- ✅ Updates active context
- ✅ Marks task complete

### Step 5: Iterate and Refine

Based on agent behavior:

1. Adjust the agent prompt template if needed
2. Add more skills for common patterns
3. Refine Memory Bank structure
4. Update domain knowledge
5. Document new patterns

## Key Files Reference

| File | Purpose |
|------|---------|
| `docs/VIBE-KANBAN-BLACKBOX-AGENT-INTEGRATION.md` | Complete integration plan |
| `.blackbox5/templates/agent-context-template.md` | Universal agent context |
| `.blackbox5/engine/.agents/.skills/.../memory-bank-management/SKILL.md` | Memory Bank skill |
| `.blackbox5/scripts/setup-memory-bank.sh` | Setup Memory Bank files |
| `.blackbox5/engine/memory/memory-bank/active-context.md` | Current context |
| `.blackbox5/engine/memory/memory-bank/progress.md` | Progress tracking |
| `.blackbox5/engine/memory/memory-bank/decision-log.md` | Decision log |

## MCP Tools Available

The agent has access to these MCP servers:

- **memory-bank-siso**: Read/write Memory Bank files
- **vibe_kanban**: List projects, create/update tasks
- **siso-internal-supabase**: Database operations
- **filesystem**: File operations
- **playwright/chrome-devtools**: Browser automation
- **sequential-thinking**: Chain-of-thought reasoning

## Success Criteria

The integration is successful when:

1. ✅ Agents automatically load context before starting
2. ✅ Progress is tracked in progress.md
3. ✅ Decisions are logged in decision-log.md
4. ✅ Agents use existing skills when available
5. ✅ Context persists across agent sessions
6. ✅ Vibe Kanban tasks are updated automatically

## Troubleshooting

### Agent Not Loading Context

**Symptom**: Agent starts working without loading Memory Bank

**Solution**:
1. Check agent profile includes system prompt
2. Verify Memory Bank files exist
3. Check file permissions

### Progress Not Being Updated

**Symptom**: progress.md not being updated

**Solution**:
1. Verify Memory Bank MCP server is running
2. Check file permissions
3. Review agent logs for errors

### Context Not Persisting

**Symptom**: Changes lost between sessions

**Solution**:
1. Verify files are being saved
2. Check git status
3. Review Memory Bank MCP logs

## FAQ

**Q: Do all 6 agents need their own profile?**

A: No, use the same profile for all Claude Code instances. The Memory Bank provides shared context.

**Q: What if agents disagree on a decision?**

A: Document both perspectives in decision-log.md with clear rationales. The most recent decision wins.

**Q: How do I handle conflicts in progress.md?**

A: Use clear task IDs from Vibe Kanban. Each agent updates their own task section.

**Q: Can I use this with other agents (Gemini, Codex)?**

A: Yes! The template works with any agent. Just adjust the system prompt for each agent type.

**Q: What if the Memory Bank gets too large?**

A: Archive old entries. Keep active context focused on current work. Move old decisions to an archive file.

## What This Enables

With this integration, your 6 Claude agents will:

1. **Know what the Black Box is**: Built into their system prompt
2. **Always update Memory Bank**: Part of their workflow
3. **Track tasks properly**: Progress.md keeps everyone informed
4. **Follow through on decisions**: Decision log provides context
5. **Use existing patterns**: Skills system prevents reinventing the wheel
6. **Maintain context across sessions**: Memory persists between tasks

## Long-term Vision

This is the foundation for:

- **Multi-agent coordination**: Agents can see what others are working on
- **Persistent learning**: The system gets smarter over time
- **Onboarding**: New agents (and humans!) can quickly get up to speed
- **Decision tracking**: Full history of why things were done
- **Pattern library**: Reusable solutions to common problems

## Need Help?

1. **Setup issues**: Run the setup script again
2. **Agent behavior**: Check the agent prompt template
3. **MCP problems**: Verify MCP servers are running
4. **Context questions**: Read the agent context template
5. **Best practices**: Review the Memory Bank management skill

---

**Ready to get started? Run this:**

```bash
./.blackbox5/scripts/setup-memory-bank.sh
```

Then create your first Black Box aware task in Vibe Kanban!
