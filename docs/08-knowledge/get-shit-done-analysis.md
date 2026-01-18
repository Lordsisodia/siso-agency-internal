# Get Shit Done — Comprehensive System Analysis

**Source:** https://github.com/glittercowboy/get-shit-done
**Analyzed:** 2025-01-18
**Purpose:** Reference for Blackbox architecture and design patterns

---

## Executive Summary

**Get Shit Done (GSD)** is a sophisticated meta-prompting and context engineering system built for Claude Code. It solves the critical problem of **context rot** — the quality degradation that occurs as Claude's context window fills up during complex development sessions.

**Created by:** TÂCHES
**Version:** 1.6.4
**Architecture:** Multi-agent orchestration with XML-based prompt formatting
**Target User:** Solo developers using AI as their primary implementation partner

---

## 1. Overall Architecture

### Core Design Philosophy

GSD is built on three fundamental principles:

1. **Context Engineering** — Deliberate management of Claude's 200k token context window to maintain peak quality
2. **Plans as Prompts** — PLAN.md files ARE the executable prompts, not documents that get transformed
3. **Multi-Agent Orchestration** — Thin orchestrators spawn specialized subagents, keeping main context lean (~30-40%)

### System Components

```
get-shit-done/
├── agents/           # 11 specialized subagent definitions
├── commands/         # 24 slash commands for Claude Code
├── get-shit-done/    # Core workflow, templates, references
├── hooks/            # Node.js scripts for statusline/update checks
└── bin/              # Installation script
```

---

## 2. Key Directories Explained

### `/agents/` — Multi-Agent System

Contains 11 specialized subagents, each with a specific role:

| Agent | Role | Spawned By |
|-------|------|------------|
| **gsd-planner** | Creates executable PLAN.md files with task breakdown | `/gsd:plan-phase` |
| **gsd-executor** | Executes plans with atomic commits and deviation handling | `/gsd:execute-phase` |
| **gsd-verifier** | Goal-backward verification of phase completion | `/gsd:execute-phase` |
| **gsd-plan-checker** | Validates plans against requirements | `/gsd:plan-phase` |
| **gsd-phase-researcher** | Researches domain-specific implementation patterns | `/gsd:plan-phase` |
| **gsd-project-researcher** | 4 parallel dimensions: stack, features, architecture, pitfalls | `/gsd:new-project` |
| **gsd-roadmapper** | Creates phased roadmap from requirements | `/gsd:new-project` |
| **gsd-codebase-mapper** | Analyzes existing codebases (brownfield) | `/gsd:map-codebase` |
| **gsd-debugger** | Systematic debugging with persistent state | `/gsd:debug` |
| **gsd-integration-checker** | Cross-phase integration verification | `/gsd:audit-milestone` |
| **gsd-research-synthesizer** | Synthesizes 4 research dimensions into SUMMARY | `/gsd:new-project` |

**Key Design Pattern:** Agents are spawned as fresh context instances via the `Task` tool, inheriting only what's explicitly passed in their prompt.

### `/commands/gsd/` — Slash Commands

24 user-facing commands organized by workflow stage:

**Initialization:**
- `new-project` — Full project initialization (questions → research → requirements → roadmap)
- `map-codebase` — Analyze existing codebase before planning

**Phase Workflow:**
- `discuss-phase [N]` — Gather implementation context before planning
- `plan-phase [N]` — Research + plan + verify (spawns planner + checker agents)
- `execute-phase [N]` — Execute all plans in waves with parallel executors
- `verify-work [N]` — Manual user acceptance testing

**Milestone Management:**
- `complete-milestone` — Archive milestone, tag release
- `new-milestone [name]` — Start next version (same flow as new-project)
- `audit-milestone` — Verify requirements, cross-phase integration

**Phase Modifications:**
- `add-phase` — Append phase to roadmap
- `insert-phase [N]` — Insert urgent work between phases
- `remove-phase [N]` — Remove future phase, renumber

**Utilities:**
- `progress` — Where am I? What's next?
- `add-todo [desc]` — Capture ideas for later
- `check-todos` — List pending todos
- `debug [desc]` — Systematic debugging
- `pause-work` / `resume-work` — Session handoff
- `help`, `whats-new`, `update`

**Command Structure:**
```yaml
---
name: gsd:command-name
description: One-line description
argument-hint: "<required>" or "[optional]"
allowed-tools: [Read, Write, Bash, ...]
---

<objective>
What this command accomplishes
</objective>

<execution_context>
@workflow-file.md
@template-file.md
</execution_context>

<context>
$ARGUMENTS, @file-references
</context>

<process>
Step-by-step implementation
</process>

<success_criteria>
Checklist for completion
</success_criteria>
```

### `/get-shit-done/` — Core System

**Three subdirectories:**

1. **`workflows/`** (13 files) — Detailed implementation logic referenced by commands
   - `execute-phase.md` — Wave-based parallel execution orchestration
   - `execute-plan.md` — (55KB) Single-plan execution with checkpoints, TDD, commits
   - `discuss-phase.md` — Adaptive questioning for context gathering
   - `discovery-phase.md` — Deep research workflow for complex domains
   - `verify-phase.md` / `verify-work.md` — Verification protocols

2. **`templates/`** (23 files) — File templates for project artifacts
   - `project.md` — PROJECT.md structure
   - `requirements.md` — REQUIREMENTS.md structure
   - `milestone.md` / `phase-prompt.md` — Various state files
   - `codebase/*.md` — Stack, architecture, conventions, concerns, etc.

3. **`references/`** (7 files) — Best practices and patterns
   - `questioning.md` — Deep questioning techniques for dream extraction
   - `ui-brand.md` — UI/UX decision patterns
   - `checkpoints.md` — Checkpoint handling protocols
   - `tdd.md` — Test-driven development workflow
   - `git-integration.md` — Atomic commit patterns

### `/hooks/` — Claude Code Integration

Two Node.js scripts:

1. **`statusline.js`** — Custom Claude Code statusline showing:
   - Model name
   - Current task (from todos)
   - Directory name
   - Context usage with color-coded progress bar
   - Example: `Claude 03 | Implement auth login | myapp | ████░░░░░░ 40%`

2. **`gsd-check-update.js`** — SessionStart hook checking for new GSD versions

---

## 3. How It Works

### Installation Process

**Interactive Install:**
```bash
npx get-shit-done-cc
```

Prompts user for:
1. **Location:** Global (`~/.claude/`) or Local (`./.claude/`)
2. **Statusline:** Replace existing if detected

**Non-Interactive Install:**
```bash
npx get-shit-done-cc --global    # Install to ~/.claude/
npx get-shit-done-cc --local     # Install to ./.claude/
```

**What Gets Installed:**
```
~/.claude/
├── commands/gsd/          # All slash commands
├── agents/gsd-*.md        # All subagent definitions
├── get-shit-done/         # Workflows, templates, references
├── hooks/statusline.js    # Statusline script
└── settings.json          # Updated with hooks + statusline
```

**Path Replacement:** During installation, `~/.claude/` paths in markdown files are replaced with the actual install path (critical for both global and local installs).

### The Workflow System

GSD implements a **6-phase development cycle**:

#### Phase 1: Initialize Project (`/gsd:new-project`)

**Flow:** Setup → Brownfield Detection → Deep Questioning → PROJECT.md → Workflow Config → Research (optional) → Requirements → Roadmap

**Artifacts Created:**
```
.planning/
├── PROJECT.md
├── config.json
├── research/
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   └── SUMMARY.md
├── REQUIREMENTS.md
├── ROADMAP.md
└── STATE.md
```

#### Phase 2: Discuss Phase (`/gsd:discuss-phase [N]`)

**Purpose:** Capture implementation decisions before planning

**Process:**
1. Analyze phase — identify gray areas (visual, API, content, organization)
2. Present gray areas — multi-select: which to discuss?
3. Deep-dive each area — 4 questions per area, then "more or next?"
4. Write CONTEXT.md — sections match discussed areas

#### Phase 3: Plan Phase (`/gsd:plan-phase [N]`)

**Flow:** Research (if needed) → Plan → Verify → Iterate

**Plan Structure:**
```yaml
---
phase: "01"
plan: "01"
type: "feature"
wave: 1
depends_on: []
autonomous: true
files_modified:
  - src/app/api/auth/login/route.ts
---

## Objective
Create secure login endpoint with JWT authentication

## Tasks

<task type="auto">
  <name>Create JWT utility library</name>
  <files>src/lib/auth/jwt.ts</files>
  <action>
Use jose for JWT (not jsonwebtoken - CommonJS issues).
Implement sign() and verify() functions.
Set 15-minute expiry for access tokens.
  </action>
  <verify>
Unit tests pass: npm test -- jwt.test.ts
  </verify>
  <done>
jose library integrated, sign/verify working, tests passing
  </done>
</task>
```

#### Phase 4: Execute Phase (`/gsd:execute-phase [N]`)

**Orchestrator Role:**
Discover plans → group by wave → spawn parallel executors → collect results → verify goal → update state

**Wave Execution Pattern:**
```
## Wave 1

**01-01: JWT Utility Library**
Implements jose-based JWT signing and verification.

**01-02: Login Endpoint**
POST /api/auth/login endpoint. Depends on JWT utility from 01-01.

Spawning 2 agents...
Wave 1 complete ✓
```

**Each Executor:**
1. Loads project state (STATE.md)
2. Executes tasks sequentially
3. Handles deviations automatically (bugs, gaps, blockers)
4. Commits each task atomically
5. Runs verification
6. Creates SUMMARY.md
7. Updates STATE.md

#### Phase 5: Verify Work (`/gsd:verify-work [N]`)

**Purpose:** Manual user acceptance testing

**Process:**
1. Extract testable deliverables from VERIFICATION.md
2. Walk through each one
3. If failures: spawn debug agents
4. Create fix plans

#### Phase 6: Complete Milestone (`/gsd:complete-milestone`)

1. Verify milestone (all requirements complete?)
2. Archive milestone (`.planning/` → `.planning/milestones/v1.0/`)
3. Tag git release
4. Initialize next milestone

---

## 4. Context Management System

### Quality Degradation Curve

| Context Usage | Quality | Claude's State |
|---------------|---------|----------------|
| 0-30% | PEAK | Thorough, comprehensive |
| 30-50% | GOOD | Confident, solid work |
| 50-70% | DEGRADING | Efficiency mode begins |
| 70%+ | POOR | Rushed, minimal |

### GSD's Strategy

1. **Orchestrators stay lean** (~15% context)
2. **Subagents get fresh context** (100% budget each)
3. **Plans are atomic** (2-3 tasks each)
4. **File-based persistence** (every decision committed)

### STATE.md — Project Memory

**Purpose:** Cross-session continuity

**Structure:**
```markdown
# Project State

**Current Phase:** Phase 1 - Authentication
**Current Plan:** 01-02 (Login endpoint)
**Status:** In Progress

## Position
Building authentication system with JWT tokens.

## Decisions Made
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use jose, not jsonwebtoken | CommonJS issues with Edge | ✓ Good |

## Blockers
None currently.

## Concerns
- bcrypt on Edge runtime might be slow

## Alignment
Core value: Users can share content
Current focus: Authentication foundation
```

---

## 5. Multi-Agent Orchestration

### Spawning Pattern

```
User runs: /gsd:plan-phase 1

↓

Command (orchestrator) spawns researchers in parallel:
Task(prompt="...", subagent_type="gsd-project-researcher") × 4

↓

All 4 run in parallel, return together

↓

Orchestrator spawns synthesizer

↓

Orchestrator spawns planner

↓

Orchestrator spawns checker

↓

If issues → spawn planner again (iteration 1/3)
```

### Context Flow

**Main Context (Orchestrator):**
- Sees agent spawns
- Sees agent returns
- Stays at 30-40% usage

**Subagent Contexts:**
- Get fresh 200k tokens each
- Load only what's explicitly passed
- Do heavy lifting independently

---

## 6. Design Patterns

### 1. XML Prompt Formatting

Every plan is structured XML:
```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>Use jose for JWT...</action>
  <verify>curl test returns 200</verify>
  <done>Valid credentials return cookie</done>
</task>
```

### 2. Atomic Git Commits

**Per-Task Commits:**
```bash
abc123f feat(01-01): create JWT utility library
def456g feat(01-02): implement login endpoint
```

**Benefits:**
- Git bisect finds exact failing task
- Each task independently revertable
- Clear history for future sessions

### 3. Goal-Backward Verification

**Not:** "Did you complete the tasks?"
**Yes:** "Did you achieve the goal?"

**3-level checks:**
1. **Existence** — Does file exist?
2. **Substantive** — Is it implemented (not a stub)?
3. **Wired** — Is it connected (not orphaned)?

### 4. Checkpoint Protocol

**Flow:**
1. Executor STOPs at checkpoint
2. Returns structured message
3. Orchestrator presents to user
4. User responds
5. Fresh continuation agent resumes

### 5. Deviation Handling

| Rule | Trigger | Action |
|------|---------|--------|
| 1: Auto-fix bugs | Code doesn't work | Fix immediately |
| 2: Auto-add critical | Security/correctness gaps | Add and document |
| 3: Auto-fix blockers | Can't proceed without | Do it and document |
| 4: Ask about architectural | Major structural changes | Stop and ask user |

### 6. Wave-Based Parallelization

Pre-computed during planning:
```yaml
# Plan 01-01
wave: 1
depends_on: []

# Plan 01-02
wave: 1
depends_on: []

# Plan 01-03
wave: 2
depends_on: [01-01]
```

---

## 7. Key Innovations

1. **Context Window as First-Class Concern**
   - Not an afterthought
   - Core design principle
   - Measured and managed

2. **Plans as Prompts**
   - Not documents to transform
   - Executable XML
   - Ready for subagents

3. **Goal-Backward Verification**
   - Not task completion
   - Actual outcome verification
   - 3-level artifact checks

4. **Checkpoint Protocol**
   - Fresh continuation agents
   - Structured state return
   - No resume complexity

5. **Deviation Autonomy**
   - Automatic fixes for bugs/gaps
   - User only for architectural
   - Tracked in summaries

6. **Wave Pre-computation**
   - No runtime dependency analysis
   - Deterministic execution
   - Parallelization built-in

---

## 8. Comparison to Alternatives

| Aspect | GSD | SpecKit | BMAD | Taskmaster |
|--------|-----|---------|------|------------|
| **Context Management** | Explicit engineering | Implicit | Implicit | Basic |
| **Multi-Agent** | 11 specialized agents | Limited | No | No |
| **Verification** | Goal-backward, automated | Task-based | Manual | Manual |
| **Git Integration** | Per-task atomic commits | Per-phase | Basic | Basic |
| **Solo Dev Focus** | ✓ | ✗ | ✗ | ✗ |

---

## 9. Lessons for Blackbox

### Applicable Patterns

1. **Context Budgeting**
   - Keep orchestrators lean
   - Subagents get fresh context
   - File-based persistence

2. **File-Based State Management**
   - STATE.md as project memory
   - Cross-session continuity
   - Atomic commits per action

3. **XML-Structured Prompts**
   - Precise parsing
   - Clear structure
   - Enforces completeness

4. **Goal-Backward Verification**
   - Verify outcomes, not tasks
   - 3-level artifact checks
   - Don't trust claims, verify code

5. **Checkpoint Pattern**
   - Pause for human input
   - Fresh agent resumes
   - Structured state return

6. **Specialized Agents**
   - Each agent has single responsibility
   - Orchestrator coordinates
   - Parallel execution where possible

### Architectural Insights

1. **Monorepo vs Multi-Repo**
   - GSD is single package (npx)
   - All agents, commands, workflows bundled
   - Updates via npm, not git merges

2. **Installation Model**
   - Global install to `~/.claude/`
   - Local install to `./.claude/`
   - Path replacement during install

3. **Configuration Separation**
   - Framework code (agents, commands)
   - Project state (.planning/)
   - Clear boundary between engine and knowledge

---

## 10. Relevant Files for Reference

- **agents/gsd-planner.md** — Agent that creates executable plans
- **agents/gsd-executor.md** — Agent that executes plans with atomic commits
- **commands/gsd/plan-phase.md** — Command orchestrating planning workflow
- **commands/gsd/execute-phase.md** — Command orchestrating execution workflow
- **get-shit-done/workflows/execute-plan.md** — Single-plan execution logic
- **get-shit-done/references/checkpoints.md** — Checkpoint handling
- **get-shit-done/references/git-integration.md** — Atomic commit patterns

---

**Conclusion:** GSD is a masterclass in context engineering and multi-agent orchestration. The key takeaway is that complexity lives in the system, not the user workflow. Blackbox can learn from its patterns for context management, file-based state, and specialized agent orchestration.
