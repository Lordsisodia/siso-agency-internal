# 🚀 START HERE: First Prompt for Lumelle Architect

Copy and paste this prompt into a fresh Claude Code session to start working on Issue #193.

---

## PROMPT TO COPY:

```
# Load the lumelle-architect specialist

You are the **lumelle-architect specialist** 🏗️

I need you to create an execution specification for Issue #193: CartContext.tsx Refactoring.

## Context

**Project:** Lumelle - Shopify storefront platform
**Current Issue:** Issue #193 from Phase 1 (Critical Issues)
**Session ID:** 2026-01-15-2230

## Issue Details

### Problem Statement
CartContext.tsx is a monolithic context (562 lines) handling too many responsibilities:
- Cart state management
- Cart operations (add, remove, update)
- Cart calculations (totals, discounts, taxes)
- UI state for cart drawer
- Integration with multiple services

### Target State
Reduce CartContext to <300 lines by:
1. Extracting cart state management into focused contexts
2. Creating cart operations module
3. Creating cart calculations module
4. Maintaining backward compatibility

### Success Criteria
- [ ] CartContext < 300 lines
- [ ] All existing functionality preserved
- [ ] Proper separation of concerns
- [ ] Type safety maintained
- [ ] No breaking changes to consumers
- [ ] Unit tests added for new modules
- [ ] Integration tests pass

## Your Task

1. **Read the hierarchical task:**
   Load `.blackbox/.memory/working/hierarchical-tasks/issue-193.json` to see all 10 subtasks

2. **Analyze current implementation:**
   - Find CartContext.tsx in the codebase
   - Read and understand current structure
   - Identify dependencies and usage patterns
   - Use Serena tools: `find_referencing_symbols` to see what uses CartContext

3. **Create execution specification:**
   Follow the planning-phase prompt template from:
   `.blackbox/1-agents/4-specialists/lumelle/lumelle-architect/prompts/planning-phase.md`

   Your spec should include:
   - Architecture analysis (current state, problems, target state)
   - Architecture decisions (with options, rationale, consequences)
   - Refactoring approach (phases, steps, implementation details)
   - Files to modify/create
   - Success criteria (measurable)
   - Test requirements (unit, integration, E2E)
   - Risk assessment
   - Effort estimation

4. **Save your work:**
   Create session directory:
   `.blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-2230/`

   Copy templates from:
   `.blackbox/1-agents/4-specialists/ralph-agent/work/_templates/*.md`

   Fill in:
   - summary.md (session overview)
   - achievements.md (what you completed)
   - analysis.md (your architecture decisions)
   - materials.md (execution spec you created)

## Deliverables

1. **Execution Specification** - Detailed implementation plan
2. **Architecture Decisions** - With clear rationale
3. **File Structure** - What files to create/modify
4. **Success Criteria** - Measurable outcomes
5. **Test Requirements** - What tests to add

Please start by:
1. Reading the hierarchical task JSON
2. Finding CartContext.tsx in the codebase
3. Analyzing its current structure
4. Creating the execution specification

Take your time to be thorough. This spec will guide the implementation phase.
```

---

## 📋 After You Run This Prompt

The architect will:
1. Read the task structure
2. Find CartContext.tsx
3. Analyze dependencies
4. Create detailed execution spec
5. Save everything to session files

### Check Progress:
```bash
# View session progress
cat .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-2230/summary.md

# View architecture decisions
cat .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-2230/analysis.md

# View execution spec
cat .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-2230/materials.md
```

---

## 🔄 Next Steps After Architect Completes

1. **Review the execution spec** (make sure it looks good)
2. **Start implementation phase** (either you or dev agent)
3. **Update Kanban card** (move from planning → in_progress)

---

## 📊 Board Status

```bash
python3 .blackbox/.plans/board-status.py
```

Current state:
- ✅ Issue #193 moved to **planning** column
- ⏳ 7 issues remaining in **backlog**

---

## 🎯 Summary

**What to do now:**
1. Copy the prompt above
2. Open a fresh Claude Code session (clean tab)
3. Paste the prompt
4. Let the architect create the execution spec
5. Review the output
6. Come back and continue with implementation

**This is SEQUENTIAL execution:**
- One issue at a time
- One phase at a time
- Clear progress tracking
- No merge conflicts
- Full context maintained

Ready to start? 🚀
