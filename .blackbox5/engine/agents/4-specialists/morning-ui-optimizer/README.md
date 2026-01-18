# Morning UI Optimizer Agent

**Agent Type:** Iterative UI/UX Improvement Agent
**Date Created:** Sunday, January 18th, 4:16 AM, 2026
**Parent System:** Blackbox4
**Protocol:** Ralph Wiggin Method + Sequential Thinking MCP + First-Principles Reasoning

---

## Purpose

This agent autonomously iterates on the morning routine flow elements and pages to continuously improve UI/UX through first-principles analysis. It uses Supabase MCP for data access, Chrome MCP for visual analysis, and Sequential Thinking MCP for reasoning through improvements.

---

## Core Principles

1. **First-Principles First** - Every iteration questions whether elements are necessary
2. **Data-Driven Decisions** - Use Supabase data to inform UI improvements
3. **Visual Analysis** - Use Chrome DevTools to inspect and analyze UI state
4. **Iterative Refinement** - 10-step loop with continuous improvement
5. **Autonomous Operation** - Minimal human intervention with full documentation

---

## The 10-Step Iterative Loop

### Step 1: Look at the Code
**Action:** Read current implementation files
**Tools:** Read, Glob, Grep
**Output:** Current state analysis

### Step 2: Analyze the Code
**Action:** Use Sequential Thinking MCP to reason through current state
**Tools:** `mcp__sequential-thinking__sequentialthinking`
**Output:** Deep analysis of what works and what doesn't

### Step 3: First-Principles Evaluation
**Action:** Apply first-principles reasoning to question necessity
**Tools:** Sequential Thinking MCP
**Output:**
- Which elements are actually needed?
- What can be removed?
- What's the essential purpose?

### Step 4: Figure Out Improvements
**Action:** Generate specific improvement ideas
**Tools:** Sequential Thinking MCP, Supabase MCP (for usage data)
**Output:** List of potential improvements

### Step 5: Provide Five Options
**Action:** Generate 5 distinct design/UX approaches
**Options:**
1. **Conservative** - Minimal changes, safe improvements
2. **Incremental** - Small but meaningful enhancements
3. **Moderate** - Balanced approach with clear benefits
4. **Novel** - Creative solutions with calculated risks
5. **Radical** - Complete redesign with breakthrough potential

### Step 6: Evaluate Options (Hybrid Solution)
**Action:** Use Sequential Thinking to find best hybrid approach
**Tools:** Sequential Thinking MCP
**Output:** Single hybrid solution combining best elements

### Step 7: Implementation Plan
**Action:** Create detailed implementation strategy
**Output:** Step-by-step implementation guide

### Step 8: Implement Changes
**Action:** Execute implementation plan
**Tools:** Edit, Write, Bash
**Output:** Updated code files

### Step 9: Validate Results
**Action:** Test and validate improvements
**Tools:** Chrome MCP (visual testing), Supabase MCP (data validation)
**Output:** Validation report

### Step 10: Document and Loop
**Action:** Document findings and prepare for next iteration
**Output:** Session documentation, next iteration prep

---

## Workspace Structure

```
.blackbox/1-agents/4-specialists/morning-ui-optimizer/
├── README.md                      # This file
├── protocol.md                    # Agent protocol (this file + config)
├── config.yaml                    # Agent configuration
├── work/                          # Work output directory
│   ├── session-YYYYMMDD/         # Per-session work
│   │   ├── summary.md            # What was done
│   │   ├── analysis.md           # First-principles analysis
│   │   ├── options.md            # 5 options generated
│   │   ├── implementation.md     # Implementation details
│   │   ├── validation.md         # Validation results
│   │   └── next-steps.md         # What to do next
│   └── index.md                  # Master index
├── logs/                         # Detailed logs
│   ├── activity.log              # Activity stream
│   └── decisions.log             # Decisions made
└── context/                      # Context snapshots
    ├── current-state.md          # Current UI state
    └── improvement-history.md    # All improvements made
```

---

## Configuration

### Agent Config (config.yaml)

```yaml
agent:
  name: "morning-ui-optimizer"
  type: "iterative-improvement"
  version: "1.0.0"
  created: "2026-01-18 04:16:00"

loop:
  steps: 10
  max_iterations: 10  # Run 10 complete loops
  auto_continue: true

scope:
  domains:
    - "src/domains/lifelock/1-daily/1-morning-routine"
    - "src/domains/lifelock/1-daily/_shared"
  file_patterns:
    - "**/*.tsx"
    - "**/*.ts"
    - "**/*.css"

tools:
  mcp:
    - "sequential-thinking"      # First-principles reasoning
    - "supabase"                 # Data access
    - "chrome-devtools"          # Visual analysis
    - "fetch"                    # Web resources
    - "filesystem"               # File operations

principles:
  first_principles: true
  data_driven: true
  visually_tested: true
  documented: true

quality_gates:
  - "All changes documented"
  - "Visual validation passed"
  - "No regressions introduced"
  - "First-principles applied"
```

---

## MCP Tool Usage

### Sequential Thinking MCP

Used for first-principles reasoning throughout the loop:

```javascript
// Step 2: Analyze current state
mcp__sequential-thinking__sequentialthinking({
  thought: "What is the current state of the morning routine UI? What elements exist? Which ones are essential?",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 8
})

// Step 3: First-principles evaluation
mcp__sequential-thinking__sequentialthinking({
  thought: "Let's apply first-principles: Do we actually need all these elements? What's the irreducible minimum?",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 8
})

// Step 6: Evaluate hybrid solution
mcp__sequential-thinking__sequentialthinking({
  thought: "Comparing all 5 options, what's the best hybrid approach that balances innovation with safety?",
  nextThoughtNeeded: true,
  thoughtNumber: 6,
  totalThoughts: 8
})
```

### Supabase MCP

Used for data-driven decisions:

```javascript
// Get user engagement data
mcp__siso-internal-supabase__execute_sql({
  query: `
    SELECT
      component_name,
      COUNT(*) as interactions,
      AVG(time_spent) as avg_time
    FROM morning_routine_events
    WHERE date > NOW() - INTERVAL '7 days'
    GROUP BY component_name
    ORDER BY interactions DESC
  `
})
```

### Chrome DevTools MCP

Used for visual validation:

```javascript
// Take screenshot before changes
mcp__chrome-devtools__take_screenshot({
  filePath: ".blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-20260118/before.png"
})

// Take snapshot after changes
mcp__chrome-devtools__take_snapshot({
  filePath: ".blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-20260118/after-snapshot.md"
})

// Navigate to morning routine
mcp__chrome-devtools__navigate_page({
  type: "url",
  url: "http://localhost:5173/morning-routine"
})
```

---

## First-Principles Framework

Every iteration MUST apply first-principles reasoning:

### DECOMPOSITION
- Break UI elements to atomic components
- Identify what's truly essential vs. nice-to-have
- Question every element's existence

### GROUNDING
- Replace assumptions with user data (from Supabase)
- Identify hard constraints (technical, UX)
- Identify soft constraints (preferences, conventions)

### RECONSTRUCTION
- Rebuild UI from fundamentals
- Generate 5 options (Conservative → Radical)
- Optimize for user goals under constraints

### TESTABILITY
- Define success metrics
- Create validation tests
- Schedule review date

---

## Session Template

### summary.md

```markdown
# Session Summary - YYYY-MM-DD (Iteration X/10)

**Session ID:** [unique-id]
**Start Time:** [timestamp]
**End Time:** [timestamp]
**Duration:** [time]
**Iteration:** X of 10

## What Was Done

- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

## Impact

- Files modified: [count]
- Lines changed: [count]
- Visual improvements: [description]
- User experience: [improvements]

## Next Iteration Focus

[What to work on next loop]
```

### analysis.md

```markdown
# First-Principles Analysis - Session YYYY-MM-DD

## Current State

[What the UI looks like now]

## Decomposition

### Essential Elements
- [Element 1]: [Why it's essential]
- [Element 2]: [Why it's essential]

### Non-Essential Elements
- [Element X]: [Can be removed because...]
- [Element Y]: [Can be simplified because...]

## Grounding

### Hard Constraints
- [Constraint 1]
- [Constraint 2]

### Soft Constraints
- [Constraint 1]
- [Constraint 2]

## Reconstruction Principles

1. [Principle 1]
2. [Principle 2]
3. [Principle 3]
```

### options.md

```markdown
# Design Options - Session YYYY-MM-DD

## Option 1: Conservative (Safe, Minimal Changes)
**Approach:** [Description]
**Changes:** [List]
**Pros:** [List]
**Cons:** [List]
**Risk:** Low

## Option 2: Incremental (Small Enhancements)
**Approach:** [Description]
**Changes:** [List]
**Pros:** [List]
**Cons:** [List]
**Risk:** Low-Medium

## Option 3: Moderate (Balanced Approach)
**Approach:** [Description]
**Changes:** [List]
**Pros:** [List]
**Cons:** [List]
**Risk:** Medium

## Option 4: Novel (Creative Solutions)
**Approach:** [Description]
**Changes:** [List]
**Pros:** [List]
**Cons:** [List]
**Risk:** Medium-High

## Option 5: Radical (Complete Redesign)
**Approach:** [Description]
**Changes:** [List]
**Pros:** [List]
**Cons:** [List]
**Risk:** High

## Selected Hybrid Solution

**Best Elements From:**
- Option X: [element]
- Option Y: [element]
- Option Z: [element]

**Final Approach:** [Description]
```

---

## Execution Guide

### Starting a Session

```bash
# 1. Create new session directory
mkdir -p .blackbox/1-agents/4-specialists/morning-ui-optimizer/work/session-$(date +%Y%m%d)

# 2. Initialize session files
# (Automatically created by agent)

# 3. Start the loop
# (Agent runs autonomously)
```

### Running the Agent

The agent can be invoked with a single prompt:

```
"Run Morning UI Optimizer - Iteration 1. Apply first-principles reasoning to improve the morning routine UI. Use Sequential Thinking MCP for analysis, Supabase MCP for data, and Chrome MCP for visual validation. Follow the 10-step loop protocol."
```

### Human Review

After each iteration:
1. Review summary.md for what was done
2. Check validation.md for test results
3. View before/after screenshots
4. Approve or request changes
5. Agent proceeds to next iteration

---

## Success Metrics

Per-session metrics:
- Visual improvements made
- Elements removed/simplified
- User engagement (from Supabase)
- Performance improvements
- Documentation completeness

Overall metrics (after 10 iterations):
- Total UI improvements
- Reduction in complexity
- User satisfaction
- System performance
- Code maintainability

---

## Integration Points

### With Supabase
- Query user engagement data
- Validate UI changes with real usage
- Track feature adoption
- Measure time spent in sections

### With Chrome DevTools
- Visual regression testing
- Screenshot comparisons
- Accessibility analysis
- Performance metrics

### With Sequential Thinking
- First-principles decomposition
- Option generation and evaluation
- Hybrid solution reasoning
- Implementation planning

---

## Quality Gates

Before completing an iteration:

- [ ] First-principles analysis completed
- [ ] 5 options generated and evaluated
- [ ] Hybrid solution identified
- [ ] Implementation completed
- [ ] Visual validation passed
- [ ] No regressions introduced
- [ ] Documentation complete
- [ ] Next iteration planned

---

## Exit Conditions

The agent stops when:
1. **10 iterations completed** (default)
2. **Convergence detected** (no meaningful improvements)
3. **Human intervention** (manual stop)
4. **Circuit breaker triggered** (stagnation)

---

## Notes

- **Created:** Sunday, January 18th, 4:16 AM, 2026
- **Purpose:** Autonomous UI/UX improvement for morning routine
- **Method:** Ralph Wiggin autonomous loop + First-principles reasoning
- **Tools:** Sequential Thinking MCP, Supabase MCP, Chrome MCP
- **Scope:** Morning routine flow elements and pages
- **Duration:** 10 iterations max

---

## Related Systems

- **Ralph Agent Protocol:** `.blackbox/1-agents/4-specialists/ralph-agent/protocol.md`
- **First-Principles System:** `.blackbox/.docs/3-components/first-principles/README.md`
- **Ralph Runtime:** `.blackbox/4-scripts/lib/ralph-runtime/README.md`
