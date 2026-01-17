# Morning UI Optimizer - Execution Prompt

**Date:** Sunday, January 18th, 4:16 AM, 2026
**Agent:** Morning UI Optimizer
**Type:** Iterative UI/UX Improvement Agent

---

## Single Prompt to Run Full Agent

Copy and paste this prompt to run the complete 10-step iterative improvement loop:

```
You are the Morning UI Optimizer agent. Your purpose is to autonomously iterate on the morning routine flow elements and pages to continuously improve UI/UX through first-principles analysis.

AGENT CONFIGURATION:
- Created: Sunday, January 18th, 4:16 AM, 2026
- Protocol: Ralph Wiggin Method + Sequential Thinking MCP + First-Principles Reasoning
- Scope: src/domains/lifelock/1-daily/1-morning-routine and related shared components

YOUR 10-STEP ITERATIVE LOOP:

Step 1: LOOK AT THE CODE
- Read all files in: src/domains/lifelock/1-daily/1-morning-routine/ui/
- Read shared components in: src/domains/lifelock/1-daily/_shared/
- Use Glob and Read tools to understand current state

Step 2: ANALYZE THE CODE
- Use mcp__sequential-thinking__sequentialthinking MCP tool
- Think through: What works well? What doesn't? What's redundant? What's confusing?
- Spend 5-8 thoughts on deep analysis

Step 3: FIRST-PRINCIPLES EVALUATION
- Use mcp__sequential-thinking__sequentialthinking to apply first-principles
- Question EVERYTHING: Do we need this element? Can this be simpler?
- Decompose to fundamentals, then reconstruct from essentials only

Step 4: FIGURE OUT IMPROVEMENTS
- Based on analysis and first-principles, generate specific improvement ideas
- Consider: data from Supabase (use mcp__siso-internal-supabase__execute_sql if needed)
- Focus on: cleaner UI, better UX, fewer elements, more clarity

Step 5: PROVIDE FIVE OPTIONS
Generate 5 distinct approaches:
1. CONSERVATIVE: Minimal changes, very safe
2. INCREMENTAL: Small but meaningful enhancements
3. MODERATE: Balanced approach
4. NOVEL: Creative, calculated risks
5. RADICAL: Complete redesign

For each option, describe: approach, changes, pros, cons, risk level

Step 6: EVALUATE TO FIND BEST HYBRID
- Use mcp__sequential-thinking__sequentialthinking
- Analyze all 5 options
- Select best elements from each
- Create ONE hybrid solution that combines the best

Step 7: IMPLEMENTATION PLAN
- Create detailed step-by-step implementation strategy
- List exact files to modify
- Describe specific changes for each file

Step 8: IMPLEMENT CHANGES
- Use Edit and Write tools to make changes
- Modify files according to implementation plan
- Be precise and surgical

Step 9: VALIDATE RESULTS
- Use mcp__chrome-devtools__take_screenshot for visual validation
- Navigate to http://localhost:5173/morning-routine
- Take before/after screenshots
- Document what improved

Step 10: DOCUMENT AND PREPARE NEXT LOOP
- Create session files in: .blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-YYYYMMDD/
- Write: summary.md, analysis.md, options.md, implementation.md, validation.md, next-steps.md
- Document everything clearly

IMPORTANT PRINCIPLES:
- Apply first-principles reasoning at every step
- Question whether elements are NECESSARY, not just "how they are"
- Use data from Supabase to inform decisions (query usage data if needed)
- Always document your reasoning
- Take screenshots for visual validation
- Create clean, minimal, beautiful UI

TOOLS YOU HAVE ACCESS TO:
- mcp__sequential-thinking__sequentialthinking (for reasoning)
- mcp__siso-internal-supabase__execute_sql (for data)
- mcp__chrome-devtools__ (for visual analysis)
- mcp__filesystem__ (for file operations)
- Read, Write, Edit (for code changes)

START NOW: Begin with Step 1. Read the morning routine code and start the 10-step loop.
```

---

## Quick Start Guide

### 1. Create Session Directory

```bash
mkdir -p .blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-$(date +%Y%m%d)
```

### 2. Paste the Prompt Above

Copy the entire prompt in the "Single Prompt to Run Full Agent" section and paste it to the AI.

### 3. Monitor Progress

The agent will:
- Read and analyze code
- Apply first-principles reasoning
- Generate 5 design options
- Create hybrid solution
- Implement changes
- Take screenshots
- Document everything

### 4. Review Results

After completion, review:
```bash
.blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-YYYYMMDD/
```

Files:
- `summary.md` - What was done
- `analysis.md` - First-principles analysis
- `options.md` - 5 design options
- `implementation.md` - Implementation details
- `validation.md` - Validation results
- `next-steps.md` - What's next

---

## Example Output

### analysis.md Example

```markdown
# First-Principles Analysis - Session 20260118

## Current State

The morning routine has these components:
1. WakeUpTimeTracker - Shows wake-up time with XP multiplier
2. MeditationTracker - Tracks meditation minutes
3. MorningMindsetCard - Daily intention setting
4. DailyPriorities - Top 3 goals
5. PlanDay - Calendar integration

## Decomposition

### Essential Elements (Cannot Remove)
- Wake-up time tracking: Core to the system
- XP display: User motivation
- Daily goals: Primary value proposition

### Non-Essential Elements (Can Simplify/Remove)
- MorningMindsetCard: Redundant with priorities
- Extra labels: "This week" can be removed
- Verbose descriptions: Can be shortened
- Multiple borders: Visual clutter

## Grounding

### Hard Constraints
- XP system must remain intact
- Supabase integration required
- Wake-up time calculation logic fixed

### Soft Constraints
- Yellow/orange theme preferred
- Collapsible sections nice-to-have
- Animation timing flexible

## Reconstruction Principles

1. Minimalism: If it doesn't add value, remove it
2. Clarity: One primary action per section
3. Data-first: Show actual data, not descriptions of data
4. Visual hierarchy: Important things big/clear, less important small/subtle
```

### options.md Example

```markdown
# Design Options - Session 20260118

## Option 1: Conservative
**Approach:** Clean up labels and spacing only
**Changes:**
- Remove "This week" label
- Reduce padding
- Simplify text
**Pros:** Safe, minimal risk
**Cons:** Limited improvement
**Risk:** Low

## Option 2: Incremental
**Approach:** Remove redundant elements
**Changes:**
- Remove MorningMindsetCard
- Combine stats into single row
- Simplify wake-up display
**Pros:** Clear improvements
**Cons:** Some users may miss removed features
**Risk:** Low-Medium

## Option 3: Moderate
**Approach:** Redesign information architecture
**Changes:**
- Consolidate all stats into header
- Remove verbose descriptions
- Use icons instead of text labels
- Flatten card hierarchy
**Pros:** Much cleaner UX
**Cons:** Requires significant changes
**Risk:** Medium

## Option 4: Novel
**Approach:** Progressive disclosure design
**Changes:**
- Show only wake-up time initially
- Expand to show details on hover/click
- Animate transitions
- Use data to show most-used features first
**Pros:** Very clean base state
**Cons:** Hidden functionality
**Risk:** Medium-High

## Option 5: Radical
**Approach:** Complete redesign as dashboard
**Changes:**
- Remove cards entirely
- Single-page dashboard with widgets
- Drag-and-drop customization
- Real-time data streaming
**Pros:** Breakthrough potential
**Cons:** Complete rewrite, high risk
**Risk:** High

## Selected Hybrid Solution

**Best Elements From:**
- Option 2: Remove redundant elements
- Option 3: Consolidate stats into header
- Option 4: Progressive disclosure for advanced features

**Final Approach:**
1. Remove MorningMindsetCard (redundant)
2. Consolidate all stats into single header row
3. Keep collapsible sections but default to closed
4. Simplify all text labels
5. Use data-driven defaults (expand most-used sections)
```

---

## Running Multiple Iterations

To run all 10 iterations consecutively, append this to the prompt:

```
After completing the first iteration (Steps 1-10), immediately begin the second iteration using the same process. Continue until 10 iterations are complete or no meaningful improvements can be found.

For each new iteration, build upon the previous one. The scope is the CURRENT state of the code (after your previous changes), not the original state.

Track iteration number in session files: summary-iteration-1.md, summary-iteration-2.md, etc.
```

---

## Troubleshooting

### Agent Gets Stuck

If the agent appears stuck or is making no progress:

1. Check `.blackbox/1-agents/4-specialists/morning-ui-optimizer/logs/activity.log`
2. Look for stagnation (3+ iterations with <10% improvement)
3. Circuit breaker will trigger automatically

### Visual Validation Fails

If Chrome DevTools MCP fails:

1. Ensure dev server is running: `npm run dev`
2. Check URL is correct: `http://localhost:5173/morning-routine`
3. Verify browser is accessible

### Supabase Queries Fail

If Supabase MCP fails:

1. Check credentials are configured
2. Verify database connection
3. Agent will continue without data (optional feature)

---

## Session Checklist

After each iteration, verify:

- [ ] Step 1: Code read and understood
- [ ] Step 2: Sequential thinking analysis completed
- [ ] Step 3: First-principles evaluation done
- [ ] Step 4: Improvements identified
- [ ] Step 5: Five options generated
- [ ] Step 6: Hybrid solution evaluated
- [ ] Step 7: Implementation plan created
- [ ] Step 8: Changes implemented
- [ ] Step 9: Visual validation passed
- [ ] Step 10: Documentation complete

---

## Notes

- **Date Stamp:** Sunday, January 18th, 4:16 AM, 2026
- **Method:** Ralph Wiggin autonomous loop + First-principles reasoning
- **Tools:** Sequential Thinking MCP, Supabase MCP, Chrome MCP
- **Iterations:** 10 maximum (or until convergence)
- **Documentation:** All work stored in `.blackbox/1-agents/4-specialists/morning-ui-optimizer/work/`

---

## Integration with Existing Systems

This agent integrates with:

- **Ralph Agent Protocol** (`.blackbox/1-agents/4-specialists/ralph-agent/protocol.md`)
  - File-based memory
  - Session documentation
  - Sub-agent spawning

- **First-Principles System** (`.blackbox/.docs/3-components/first-principles/README.md`)
  - DECOMPOSITION, GROUNDING, RECONSTRUCTION, TESTABILITY
  - ADI cycle for complex decisions

- **Ralph Runtime** (`.blackbox/4-scripts/lib/ralph-runtime/README.md`)
  - Autonomous execution
  - Progress tracking
  - Error recovery

---

**End of Prompt Documentation**
