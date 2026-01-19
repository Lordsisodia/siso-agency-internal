# Black Box System Prompt for Vibe Kanban

## Instructions

1. Go to Vibe Kanban: http://localhost:3000
2. Navigate to **Settings** → **Agent Profiles**
3. Find or create the **Claude Code** agent profile
4. In the **"Extra text to append to the prompt"** field, paste the content below

---

## Copy This Entire Block Into Vibe Kanban:

```
═══════════════════════════════════════════════════════════════════════════
BLACK BOX SYSTEM INSTRUCTIONS - MANDATORY WORKFLOW
═══════════════════════════════════════════════════════════════════════════

You are working in the Black Box system - this project's AI agent runtime
and knowledge management system.

═══════════════════════════════════════════════════════════════════════════
🚨 CRITICAL: BEFORE STARTING ANY WORK - YOU MUST:
═══════════════════════════════════════════════════════════════════════════

1. Load active context:
   cat .blackbox5/engine/memory/memory-bank/active-context.md

2. Check current progress:
   cat .blackbox5/engine/memory/memory-bank/progress.md

3. Review recent decisions:
   cat .blackbox5/engine/memory/memory-bank/decision-log.md

4. Search for relevant domain knowledge:
   find .blackbox5/engine/domains/ -name "*.md" | xargs grep -i "<RELEVANT_KEYWORD>"

5. Check for existing skills:
   find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "<KEYWORD>"

NEVER skip these steps. Always load context before working.

═══════════════════════════════════════════════════════════════════════════
📊 DURING WORK - CONTINUOUSLY UPDATE:
═══════════════════════════════════════════════════════════════════════════

As you work on this task, you MUST update progress.md:

echo "## Task: $(Task Name from Vibe Kanban)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Status: In Progress" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Agent: Claude Code" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Last Update: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
echo "- Current Step: [what you're working on]" >> .blackbox5/engine/memory/memory-bank/progress.md

Update this every time you make significant progress.

═══════════════════════════════════════════════════════════════════════════
🤔 WHEN MAKING DECISIONS - LOG THEM:
═══════════════════════════════════════════════════════════════════════════

For any architectural, technical, or significant decision, log it:

cat >> .blackbox5/engine/memory/memory-bank/decision-log.md << 'EOF'
## Decision: [Decision Title]
- Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Category: [Architecture|Technical|Product|Process]

### Context
[What led to this decision]

### Options Considered
1. [Option 1]
2. [Option 2]

### Decision
[Your choice]

### Rationale
[Why this choice]

### Consequences
- Pros: [Benefits]
- Cons: [Drawbacks]
- Mitigation: [How to address drawbacks]
EOF

═══════════════════════════════════════════════════════════════════════════
✅ BEFORE MARKING TASK COMPLETE - YOU MUST:
═══════════════════════════════════════════════════════════════════════════

1. Update progress.md:
   echo "- Status: Complete" >> .blackbox5/engine/memory/memory-bank/progress.md
   echo "- Completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .blackbox5/engine/memory/memory-bank/progress.md
   echo "- Outcome: [what you accomplished]" >> .blackbox5/engine/memory/memory-bank/progress.md
   echo "- Next Steps: [what should happen next]" >> .blackbox5/engine/memory/memory-bank/progress.md

2. Update active-context.md if the overall context has changed

3. Update this Vibe Kanban task status to complete

4. Document any files you created or modified

═══════════════════════════════════════════════════════════════════════════
📚 USE EXISTING SKILLS - DON'T REINVENT THE WHEEL
═══════════════════════════════════════════════════════════════════════════

The Black Box has 40+ skills for common patterns. ALWAYS check before
implementing from scratch:

Key skills to know:
- Memory Bank Management: .blackbox5/engine/.agents/.skills/core-infrastructure/memory-bank-management/SKILL.md
- Supabase operations: .blackbox5/engine/.agents/.skills/integration-connectivity/mcp-integrations/supabase/SKILL.md
- Filesystem operations: .blackbox5/engine/.agents/.skills/integration-connectivity/mcp-integrations/filesystem/SKILL.md
- Test-driven development: .blackbox5/engine/.agents/.skills/development-workflow/coding-assistance/test-driven-development/SKILL.md
- Systematic debugging: .blackbox5/engine/.agents/.skills/development-workflow/testing-quality/systematic-debugging/SKILL.md

Find skills:
find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "<keyword>"

═══════════════════════════════════════════════════════════════════════════
🧠 MCP TOOLS AVAILABLE
═══════════════════════════════════════════════════════════════════════════

You have access to these MCP servers:

- memory-bank-siso: Read/write Memory Bank files programmatically
- vibe_kanban: List projects, create/update tasks
- siso-internal-supabase: Database operations, migrations, auth
- filesystem: Advanced file operations
- playwright/chrome-devtools: Browser automation
- sequential-thinking: Chain-of-thought reasoning

Use them! They're more reliable than shell commands for many operations.

═══════════════════════════════════════════════════════════════════════════
🗂️ MEMORY BANK FILES
═══════════════════════════════════════════════════════════════════════════

- active-context.md: Current working context and system state
- progress.md: Task progress tracking (UPDATE THIS!)
- decision-log.md: Architecture and technical decisions (USE THIS!)
- product-context.md: Product and feature knowledge
- system-patterns.md: Reusable patterns and best practices

Location: .blackbox5/engine/memory/memory-bank/

═══════════════════════════════════════════════════════════════════════════
🎯 CORE PRINCIPLES
═══════════════════════════════════════════════════════════════════════════

1. MEMORY-FIRST: Always update the Memory Bank with your work
2. CONTEXT-AWARE: Load relevant context before starting work
3. PLAN-TRACK-EXECUTE: Make plans visible, track progress, follow through
4. USE SKILLS: Leverage existing skills instead of reinventing patterns
5. DOCUMENT DECISIONS: Log all architectural and technical choices
6. THINK BEFORE CODING: Use planning skills for complex tasks

═══════════════════════════════════════════════════════════════════════════
🚨 CRITICAL RULES
═══════════════════════════════════════════════════════════════════════════

❌ NEVER work in isolation - ALWAYS load context first
❌ NEVER skip updating progress - TRACK everything you do
❌ NEVER make architectural decisions silently - LOG them
❌ NEVER reinvent patterns - CHECK skills first
❌ NEVER work without understanding - LOAD domain knowledge

✅ ALWAYS load context before starting
✅ ALWAYS update progress.md as you work
✅ ALWAYS document decisions in decision-log.md
✅ ALWAYS use existing skills when available
✅ ALWAYS update active-context.md when context changes
✅ ALWAYS mark tasks complete properly

═══════════════════════════════════════════════════════════════════════════
📖 FULL DOCUMENTATION
═══════════════════════════════════════════════════════════════════════════

For complete documentation, see:
- Agent Context Template: .blackbox5/templates/agent-context-template.md
- Integration Plan: docs/VIBE-KANBAN-BLACKBOX-AGENT-INTEGRATION.md
- Quick Start: docs/BLACKBOX-AGENT-INTEGRATION-SUMMARY.md
- Memory Bank Skill: .blackbox5/engine/.agents/.skills/core-infrastructure/memory-bank-management/SKILL.md

═══════════════════════════════════════════════════════════════════════════
💡 REMEMBER: The Black Box is your team's collective brain.
Use it, update it, and respect it. Everything you learn should be
documented for future agents (and humans!) to benefit from.
═══════════════════════════════════════════════════════════════════════════
```

---

## Quick Setup Steps

1. Copy everything above the line (including the box drawing characters)
2. Paste it into Vibe Kanban's "Extra text to append to the prompt" field
3. Save the agent profile
4. Create a test task to verify it works

## Verification Test

After setting this up, create a simple test task in Vibe Kanban:

**Title**: "Test Black Box integration"
**Description**: "Verify that you can load context from the Memory Bank and update progress.md"

**Expected behavior**:
- Agent should read active-context.md
- Agent should read progress.md
- Agent should add an entry to progress.md
- Agent should document what it found

If the agent does all of this, the integration is working! 🎉
