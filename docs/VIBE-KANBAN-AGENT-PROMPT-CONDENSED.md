# Condensed Black Box System Prompt for Vibe Kanban

## Instructions

1. Go to Vibe Kanban: http://localhost:3000
2. Navigate to **Settings** → **Agent Profiles**
3. Find or create the **Claude Code** agent profile
4. In the **"Extra text to append to the prompt"** field, paste the content below

---

## Condensed Version (Copy This):

```
═══════════════════════════════════════════════════════════════════════════
⚫ BLACK BOX SYSTEM - MANDATORY WORKFLOW
═══════════════════════════════════════════════════════════════════════════

🚨 BEFORE STARTING WORK (MANDATORY):
1. cat .blackbox5/engine/memory/memory-bank/active-context.md
2. cat .blackbox5/engine/memory/memory-bank/progress.md
3. cat .blackbox5/engine/memory/memory-bank/decision-log.md
4. find .blackbox5/engine/domains/ -name "*.md" | xargs grep -i "<KEYWORD>"
5. find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "<KEYWORD>"

📊 DURING WORK (CONTINUOUSLY):
Update .blackbox5/engine/memory/memory-bank/progress.md:
  ## Task: [Task Name]
  - Status: In Progress
  - Agent: Claude Code
  - Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)
  - Last Update: $(date -u +%Y-%m-%dT%H:%M:%SZ)
  - Current Step: [what you're working on]

🤔 FOR DECISIONS:
Log to .blackbox5/engine/memory/memory-bank/decision-log.md:
  ## Decision: [Title]
  - Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
  - Context: [context]
  - Options: [options]
  - Decision: [choice]
  - Rationale: [why]

✅ BEFORE COMPLETING TASK:
1. Update progress.md: Status: Complete, Outcome, Next Steps
2. Update active-context.md if context changed
3. Update Vibe Kanban task status
4. Document files created/modified

📚 USE EXISTING SKILLS:
- Memory Bank: .blackbox5/engine/.agents/.skills/core-infrastructure/memory-bank-management/SKILL.md
- Supabase: .blackbox5/engine/.agents/.skills/integration-connectivity/mcp-integrations/supabase/SKILL.md
- TDD: .blackbox5/engine/.agents/.skills/development-workflow/coding-assistance/test-driven-development/SKILL.md
- Debugging: .blackbox5/engine/.agents/.skills/development-workflow/testing-quality/systematic-debugging/SKILL.md

Find skills: find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "<keyword>"

🧠 MCP TOOLS AVAILABLE:
- memory-bank-siso: Read/write Memory Bank
- vibe_kanban: Task management
- siso-internal-supabase: Database operations
- filesystem: File operations
- playwright/chrome-devtools: Browser automation
- sequential-thinking: Chain-of-thought reasoning

⚫ CORE PRINCIPLES:
1. MEMORY-FIRST: Always update Memory Bank
2. CONTEXT-AWARE: Load context before working
3. PLAN-TRACK-EXECUTE: Make plans visible
4. USE SKILLS: Don't reinvent patterns
5. DOCUMENT DECISIONS: Log all choices

🚨 CRITICAL RULES:
❌ NEVER work without loading context
❌ NEVER skip updating progress.md
❌ NEVER make decisions silently
❌ NEVER reinvent existing patterns

✅ ALWAYS load context first
✅ ALWAYS update progress as you go
✅ ALWAYS log decisions
✅ ALWAYS use existing skills
✅ ALWAYS complete tasks properly

📖 FULL DOCS:
- .blackbox5/templates/agent-context-template.md
- docs/VIBE-KANBAN-BLACKBOX-AGENT-INTEGRATION.md
- docs/BLACKBOX-AGENT-INTEGRATION-SUMMARY.md

💡 The Black Box is your team's collective brain. Use it, update it, respect it!
═══════════════════════════════════════════════════════════════════════════
```

---

## Ultra-Short Version (If space is very limited):

```
⚫ BLACK BOX SYSTEM - MANDATORY:

BEFORE WORK:
1. cat .blackbox5/engine/memory/memory-bank/active-context.md
2. cat .blackbox5/engine/memory/memory-bank/progress.md
3. cat .blackbox5/engine/memory/memory-bank/decision-log.md

DURING WORK:
- Update .blackbox5/engine/memory/memory-bank/progress.md continuously
- Log decisions to .blackbox5/engine/memory/memory-bank/decision-log.md
- Use existing skills: find .blackbox5/engine/.agents/.skills/ -name "SKILL.md" | xargs grep -i "<keyword>"

BEFORE COMPLETE:
1. Mark complete in progress.md
2. Update active-context.md if needed
3. Update Vibe Kanban task status

CORE RULES:
- ALWAYS load context first
- ALWAYS update progress.md
- ALWAYS log decisions
- ALWAYS use existing skills

Full docs: .blackbox5/templates/agent-context-template.md
```

---

## Which Version Should You Use?

### Full Version (Recommended)
- Use for: Initial setup, maximum clarity
- Length: ~150 lines
- Best for: Ensuring agents follow all workflows

### Condensed Version (Good Balance)
- Use for: Production use, space-constrained
- Length: ~50 lines
- Best for: Daily operations, most scenarios

### Ultra-Short Version (Last Resort)
- Use for: Very limited character limits
- Length: ~15 lines
- Best for: When you absolutely must conserve space

---

## Recommendation

Start with the **Condensed Version**. It strikes the best balance between:
- ✅ Comprehensive coverage of workflows
- ✅ Concise enough to not overwhelm
- ✅ Clear visual structure
- ✅ All critical rules included

If agents aren't following workflows properly, upgrade to the **Full Version**.

If you hit character limits, use the **Ultra-Short Version** but monitor agent behavior closely.
