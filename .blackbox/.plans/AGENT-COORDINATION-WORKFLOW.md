# Agent Coordination Workflow for Systematic Refactoring

This document explains how your **3 Lumelle specialist agents** work with the **existing ralph-agent session tracking structure** to execute the systematic refactoring.

---

## Agent Responsibilities

### 1. lumelle-architect 🏗️
**Primary Role:** Planning & Architecture Review
- Analyzes architectural issues
- Creates detailed execution specifications
- Defines success criteria
- Reviews code for architectural compliance

**When Used:**
- Planning phase of each issue (Step 2 of autonomous loop)
- Code review phase (Step 5 of autonomous loop)

**Handles:** Issues #193-200 (all critical issues need architect input)

---

### 2. lumelle-performance-specialist ⚡
**Primary Role:** Performance Analysis & Optimization
- Analyzes bundle size and rendering performance
- Identifies bottlenecks
- Implements performance optimizations
- Sets up performance monitoring

**When Used:**
- Performance-related issues (Issue #193, #195, etc.)
- Bundle analysis needed
- Rendering optimization needed

**Handles:** Issues where performance is a concern

---

### 3. lumelle-security-auditor 🔒
**Primary Role:** Security Auditing & Implementation
- Reviews code for security vulnerabilities
- Validates webhook verification
- Checks API key exposure
- Implements security fixes

**When Used:**
- Security-related issues (Issue #194, #197, etc.)
- Webhook verification needed
- Authentication/authorization review needed

**Handles:** Issues involving security, data protection, or integrations

---

## Existing Agent Session Structure (ralph-agent)

You already have this structure in `.blackbox/1-agents/4-specialists/ralph-agent/`:

```
ralph-agent/
├── work/
│   ├── _templates/           # Session templates
│   │   ├── summary.md        # Session overview
│   │   ├── achievements.md   # Completed items
│   │   ├── analysis.md       # Decisions & rationale
│   │   └── materials.md      # Artifacts created
│   └── session-YYYYMMDD/     # Actual session data
│       ├── summary.md
│       ├── achievements.md
│       ├── analysis.md
│       └── materials.md
```

**We will use this SAME structure for all 3 Lumelle specialists.**

---

## How It Works: Complete Flow

### Phase 1: Agent Session Initialization

When an agent starts working on a task:

```bash
# 1. Create session directory
mkdir -p .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-1430

# 2. Copy templates
cp .blackbox/1-agents/4-specialists/ralph-agent/work/_templates/*.md \
   .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-20260115-1430/

# 3. Initialize session
# Fill in summary.md with task details
```

---

### Phase 2: Agent Works Through Subtasks

For each subtask, the agent:

1. **Updates progress** in `summary.md`
2. **Records achievements** in `achievements.md`
3. **Documents decisions** in `analysis.md`
4. **Saves materials** (specs, code) in `materials.md`

---

### Phase 3: Agent Handoff

When one agent completes and hands off to another:

```markdown
# Handoff Document

## From: lumelle-architect
## To: dev
## Issue: #193 - CartContext Refactoring

## Session Complete
- **Session:** session-20260115-1430
- **Duration:** 4 hours
- **Status:** ✅ Complete

## What Was Created
1. **Execution Spec:** `.plans/issue-193-spec.md`
2. **Architecture Decisions:** See `analysis.md`
3. **Implementation Plan:** See `materials.md`

## Key Decisions
1. Split CartContext into 3 modules
2. Use port/adapter pattern for cart operations
3. Keep backward compatibility during migration

## For Dev Agent
- Read the execution spec
- Follow implementation steps
- Update progress as you go
- Create your own session when you start

## Files to Modify
- `src/context/CartContext.tsx` - Refactor
- `src/cart/operations.ts` - Create new
- `src/cart/calculations.ts` - Create new

## Success Criteria
- CartContext < 300 lines
- All tests pass
- No breaking changes
```

---

## Complete Agent Coordination Example

### Issue #193: CartContext Refactoring

#### Step 1: Pull Work
**System** reads Kanban board, gets Issue #193
**Loads:** `.memory/working/hierarchical-tasks/issue-193.json`

---

#### Step 2: Plan (lumelle-architect)
```bash
# Architect starts session
cd .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/
mkdir session-20260115-1000
cp ../ralph-agent/work/_templates/*.md session-20260115-1000/

# Architect analyzes Issue #193
# Reads: issue-193.json (hierarchical task)
# Creates: execution-spec.md
# Updates: summary.md, achievements.md, analysis.md

# Session complete after 2 hours
```

**Session Output:**
```
session-20260115-1000/
├── summary.md          # "Created execution spec for Issue #193"
├── achievements.md     # ["Analyzed CartContext", "Designed refactoring approach"]
├── analysis.md         # ["Decision: Split into 3 modules", "Decision: Use port/adapter"]
└── materials.md        # ["execution-spec.md", "architecture-diagram.md"]
```

---

#### Step 3: Implement (dev agent)
```bash
# Dev agent starts session
cd .blackbox/1-agents/2-bmad/dev/work/
mkdir session-20260115-1200
cp ../../ralph-agent/work/_templates/*.md session-20260115-1200/

# Dev reads architect's spec
# Reads: execution-spec.md
# Implements: Creates modules, refactors CartContext
# Commits: Git commits with detailed messages
# Updates: summary.md, achievements.md

# Each subtask completion:
# - Update achievements.md
# - Mark subtask complete in issue-193.json
# - Update Kanban checklist

# Session complete after 6 hours
```

**Session Output:**
```
session-20260115-1200/
├── summary.md          # "Implemented CartContext refactoring"
├── achievements.md     # ["Created cart operations module", "Created calculations module", ...]
├── analysis.md         # ["Chose hooks pattern for reusability", "Kept backward compatibility"]
└── materials.md        # ["src/cart/operations.ts", "src/cart/calculations.ts", ...]
```

---

#### Step 4: Test (qa agent)
```bash
# QA agent starts session
cd .blackbox/1-agents/2-bmad/qa/work/
mkdir session-20260115-1800
cp ../../ralph-agent/work/_templates/*.md session-20260115-1800/

# QA reads dev's materials
# Runs: npm test
# Verifies: All tests pass
# Adds: Missing tests
# Updates: summary.md, achievements.md

# Session complete after 3 hours
```

**Session Output:**
```
session-20260115-1800/
├── summary.md          # "Tested CartContext refactoring"
├── achievements.md     # ["All unit tests pass", "Added integration tests", ...]
├── analysis.md         # ["Found 2 edge cases", "Added test coverage"]
└── materials.md        # ["cart-operations.test.ts", "cart-calculations.test.ts", ...]
```

---

#### Step 5: Review (lumelle-architect)
```bash
# Architect starts review session
cd .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/
mkdir session-20260115-2100
cp ../ralph-agent/work/_templates/*.md session-20260115-2100/

# Architect reviews:
# - Code matches execution spec?
# - Architecture patterns followed?
# - Success criteria met?

# Updates: summary.md, achievements.md
# Approves or requests changes

# Session complete after 1 hour
```

---

#### Step 6: Merge (pm agent)
```bash
# PM creates PR, merges
# Updates Kanban: IN_PROGRESS → DONE
# Marks hierarchical task complete
```

---

#### Step 7: Learn & Document
```bash
# All agents' sessions archived to:
# - .blackbox/.memory/archival/agents/lumelle-architect/session-20260115-1000/
# - .blackbox/.memory/archival/agents/dev/session-20260115-1200/
# - .blackbox/.memory/archival/agents/qa/session-20260115-1800/

# Key learnings added to semantic search index
```

---

## Agent Context Storage

Each agent maintains their context in:

```
.blackbox/1-agents/4-specialists/lumelle/[agent-name]/work/
├── session-YYYYMMDD-HHMM/     # Current/active session
│   ├── summary.md               # What's being worked on
│   ├── achievements.md          # What's been completed
│   ├── analysis.md              # Decisions made
│   └── materials.md             # Artifacts created
│
└── _templates/                 # Empty templates for new sessions
    ├── summary.md
    ├── achievements.md
    ├── analysis.md
    └── materials.md
```

---

## Template Files (Copied from ralph-agent)

### summary.md Template
```markdown
# Session Summary - YYYY-MM-DD

**Agent:** [agent-name]
**Issue:** #[number] - [Title]
**Session ID:** session-YYYYMMDD-HHMM
**Start Time:** [timestamp]
**Status:** In Progress | Completed

## What I'm Doing
[Brief description of current task]

## Progress
- [ ] [Subtask 1]
- [ ] [Subtask 2]

## Time Spent
- **Planning:** X hours
- **Execution:** X hours
- **Total:** X hours
```

### achievements.md Template
```markdown
# Achievements

## Completed Items
- [x] [Task 1] - [timestamp]
- [x] [Task 2] - [timestamp]

## Metrics
- **Subtasks Completed:** X / Y
- **Progress Percentage:** Z%
```

### analysis.md Template
```markdown
# Analysis & Decisions

## Decision 1: [Title]
- **Context:** [Why we needed this decision]
- **Options Considered:**
  - Option A: [Description]
  - Option B: [Description]
- **Decision:** [Chosen option]
- **Rationale:** [Why this option]
- **Consequences:** [Impact]
```

### materials.md Template
```markdown
# Materials Created

## Specifications
1. [Title] - [path/to/spec.md]

## Code Files
1. [Title] - [path/to/file.ts]

## Documentation
1. [Title] - [path/to/docs.md]
```

---

## Query Agent Progress

```bash
# See what lumelle-architect is working on
cat .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-*/summary.md

# See recent achievements
cat .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-*/achievements.md

# See all sessions
ls -la .blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/

# Compare agents
for agent in lumelle-architect lumelle-performance-specialist lumelle-security-auditor; do
  echo "=== $agent ==="
  cat .blackbox/1-agents/4-specialists/lumelle/$agent/work/session-*/summary.md
done
```

---

## Session Lifecycle

### 1. Start Session
```bash
# Create new session
NOW=$(date +%Y%m%d-%H%M%M)
SESSION_DIR=".blackbox/1-agents/4-specialists/lumelle/lumelle-architect/work/session-$NOW"
mkdir -p "$SESSION_DIR"

# Copy templates
cp .blackbox/1-agents/4-specialists/ralph-agent/work/_templates/*.md "$SESSION_DIR/"

# Initialize
echo "# Session Summary - $(date +%Y-%m-%d)" > "$SESSION_DIR/summary.md"
```

### 2. Work & Update
```bash
# After completing a subtask
echo "- [x] Subtask X - $(date +%H:%M)" >> achievements.md

# After making a decision
cat >> analysis.md << EOF
## Decision: [Title]
[Details]
EOF

# After creating artifact
echo "1. [Artifact] - [path]" >> materials.md
```

### 3. Complete Session
```bash
# Mark session complete
sed -i '' 's/Status: In Progress/Status: Completed/' summary.md

# Archive to extended memory
ARCHIVE_DIR=".blackbox/.memory/archival/agents/lumelle-architect/sessions/"
mkdir -p "$ARCHIVE_DIR"
mv "$SESSION_DIR" "$ARCHIVE_DIR/"
```

---

## Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| **lumelle-architect** | `1-agents/4-specialists/lumelle/lumelle-architect/` | Planning & architecture |
| **lumelle-performance-specialist** | `1-agents/4-specialists/lumelle/lumelle-performance-specialist/` | Performance optimization |
| **lumelle-security-auditor** | `1-agents/4-specialists/lumelle/lumelle-security-auditor/` | Security auditing |
| **Session Templates** | `1-agents/4-specialists/ralph-agent/work/_templates/` | Session file templates |
| **Active Sessions** | `[agent-name]/work/session-YYYYMMDD-HHMM/` | Current work |
| **Archived Sessions** | `.memory/archival/agents/[agent-name]/` | Completed work |

Your existing **ralph-agent structure** is perfect for tracking all agent sessions!
