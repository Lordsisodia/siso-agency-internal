# GSD Implementation Guide for Blackbox

**Purpose:** Capture all Git patterns, workflow innovations, and implementation details from Get Shit Done that can be adopted by Blackbox.

**Created:** 2025-01-18
**Source:** https://github.com/glittercowboy/get-shit-done

---

## Table of Contents

1. [Six-Phase Solo Development Cycle](#1-six-phase-solo-development-cycle)
2. [What GSD Does Better](#2-what-gsd-does-better)
3. [Git Integration Implementation](#3-git-integration-implementation)
4. [Adopting GSD Patterns in Blackbox](#4-adopting-gsd-patterns-in-blackbox)

---

## 1. Six-Phase Solo Development Cycle

GSD's workflow is optimized for solo developers using AI as their primary implementation partner.

### Phase 1: `/gsd:new-project` - Project Initialization

**Flow:**
```
Setup → Brownfield Detection → Deep Questioning → PROJECT.md →
Workflow Config → Research (optional) → Requirements → Roadmap
```

**Artifacts Created:**
```bash
.planning/
├── PROJECT.md              # Project brief and context
├── config.json             # Workflow configuration
├── research/               # Optional deep research
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   └── SUMMARY.md
├── REQUIREMENTS.md         # Feature requirements from PROJECT.md
├── ROADMAP.md              # Phased delivery plan
└── STATE.md                # Current project state
```

**Key Innovation:** Interactive questioning extracts user's vision before any code is written.

### Phase 2: `/gsd:discuss-phase [N]` - Implementation Context

**Purpose:** Capture implementation decisions before planning

**Process:**
1. Analyze phase — identify gray areas (visual, API, content, organization)
2. Present gray areas — multi-select: which to discuss?
3. Deep-dive each area — 4 questions per area, then "more or next?"
4. Write CONTEXT.md — sections match discussed areas

**Output:** `.planning/phases/XX-name/CONTEXT.md`

**Key Innovation:** Prevents mid-plan "wait, what did you want?" moments.

### Phase 3: `/gsd:plan-phase [N]` - Create Executable Plans

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

**Context Budgeting:**
- 2-3 tasks per plan
- Target ~50% context usage
- Allows orchestrator to stay lean

**Key Innovation:** Plans ARE executable prompts, not documents to transform.

### Phase 4: `/gsd:execute-phase [N]` - Wave-Based Execution

**Orchestrator Role:**
```
Discover plans → group by wave → spawn parallel executors →
collect results → verify goal → update state
```

**Wave Execution Pattern:**
```bash
## Wave 1
**01-01: JWT Utility Library**
Implements jose-based JWT signing and verification.

**01-02: Login Endpoint**
POST /api/auth/login endpoint. Depends on JWT utility from 01-01.

Spawning 2 agents...
Wave 1 complete ✓

## Wave 2
**01-03: Protected Route**
Middleware for JWT-protected endpoints. Depends on 01-01.

Spawning 1 agent...
Wave 2 complete ✓
```

**Each Executor:**
1. Loads project state (STATE.md)
2. Executes tasks sequentially
3. Handles deviations automatically (see Deviation Rules below)
4. Commits each task atomically
5. Runs verification
6. Creates SUMMARY.md
7. Updates STATE.md

**Key Innovation:** Fresh context per agent + wave-based parallelization = consistent quality.

### Phase 5: `/gsd:verify-work [N]` - Manual UAT

**Purpose:** User acceptance testing

**Process:**
1. Extract testable deliverables from VERIFICATION.md
2. Walk through each one
3. If failures: spawn debug agents
4. Create fix plans

**Key Innovation:** Manual testing catches what automated tests miss.

### Phase 6: `/gsd:complete-milestone` - Archive & Release

**Process:**
1. Verify milestone (all requirements complete?)
2. Archive milestone (`.planning/` → `.planning/milestones/v1.0/`)
3. Tag git release
4. Initialize next milestone

**Key Innovation:** Clean separation between versions.

---

## 2. What GSD Does Better

### Context Management

**The Problem:** As Claude's context window fills, quality degrades.

**GSD's Solution:**

| Context Usage | Quality | Claude's State |
|---------------|---------|----------------|
| 0-30% | PEAK | Thorough, comprehensive |
| 30-50% | GOOD | Confident, solid work |
| 50-70% | DEGRADING | Efficiency mode begins |
| 70%+ | POOR | Rushed, minimal |

**Implementation:**
1. Orchestrators stay lean (~15% context)
2. Subagents get fresh context (100% budget each)
3. Plans are atomic (2-3 tasks each)
4. File-based persistence (every decision committed)

**Why This Matters:**
- Consistent quality across all sessions
- No "I'm rushed" responses at 70%+ context
- Each agent gets 200k tokens to work with

### Git Integration

**The Problem:** Large commits make debugging impossible.

**GSD's Solution:** Per-task atomic commits.

**Implementation:**

```bash
# Each task gets exactly one commit
git commit -m "feat(01-01): create JWT utility library

- Uses jose for JWT signing
- Implements sign() and verify() functions
- Sets 15-minute expiry for access tokens
"
```

**Commit Format:**
```
{type}({phase}-{plan}): {task-name}

- {key change 1}
- {key change 2}
- {key change 3}
```

**Commit Types:**
- `feat` - New feature, endpoint, component, functionality
- `fix` - Bug fix, error correction
- `test` - Test-only changes (TDD RED phase)
- `refactor` - Code cleanup (TDD REFACTOR phase)
- `perf` - Performance improvement
- `docs` - Documentation changes
- `style` - Formatting, linting fixes
- `chore` - Config, tooling, dependencies

**Benefits:**
1. **Git Bisect Debugging:** `git bisect` finds exact failing task in seconds
2. **Independent Revertibility:** Each task can be reverted without affecting others
3. **Context Engineering for AI:** Future Claude sessions can run `git log --grep="01-01"` and see all work for that plan
4. **Failure Recovery:** Task 1 committed ✅, Task 2 failed ❌ → Claude sees task 1 complete, can retry task 2

**Example Git Log:**
```bash
# Phase 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation
0j1k2l feat(04-01): create checkout page component

# Phase 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
```

### Goal-Backward Verification

**The Problem:** Testing task completion doesn't verify actual functionality.

**GSD's Solution:** Verify outcomes, not tasks.

**Implementation:**

```yaml
must_haves:
  truths:
    - "User can see existing messages"
    - "User can send a message"
  artifacts:
    - path: "src/components/Chat.tsx"
      provides: "Message list rendering"
      min_lines: 30
  key_links:
    - from: "src/components/Chat.tsx"
      to: "/api/chat"
      via: "fetch in useEffect"
```

**3-Level Checks:**
1. **Existence** — Does file exist?
2. **Substantive** — Is it implemented (not stub)?
3. **Wired** — Is it connected (not orphaned)?

**Why This Matters:**
- Prevents stub implementations
- Verifies actual user outcomes
- Checks real codebase, not SUMMARY.md claims

### Automatic Deviation Handling

**The Problem:** Plans never match reality perfectly.

**GSD's Solution:** 4 rules for automatic deviation handling.

**Implementation:**

```xml
<deviation_rules>

**RULE 1: Auto-fix bugs**
Trigger: Code doesn't work as intended
Action: Fix immediately, track for Summary
No user permission needed

**RULE 2: Auto-add missing critical functionality**
Trigger: Missing essential features for correctness/security
Action: Add immediately, track for Summary
No user permission needed

**RULE 3: Auto-fix blocking issues**
Trigger: Something prevents task completion
Action: Fix immediately, track for Summary
No user permission needed

**RULE 4: Ask about architectural changes**
Trigger: Fix requires significant structural modification
Action: STOP, present to user, wait for decision
User decision required

</deviation_rules>
```

**Rule Priority:**
1. If Rule 4 applies → STOP and ask
2. If Rules 1-3 apply → Fix automatically
3. If unsure → Apply Rule 4 (ask user)

**Edge Case Guidance:**
- "This validation is missing" → Rule 2 (critical for security)
- "This crashes on null" → Rule 1 (bug)
- "Need to add table" → Rule 4 (architectural)
- "Need to add column" → Rule 1 or 2 (depends)

**Documentation Pattern:**

```markdown
## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed case-sensitive email uniqueness constraint**

- **Found during:** Task 4 (Follow/unfollow API implementation)
- **Issue:** User.email unique constraint was case-sensitive
- **Fix:** Changed to `CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email))`
- **Files modified:** src/models/User.ts, migrations/003_fix_email_unique.sql
- **Verification:** Unique constraint test passes
- **Commit:** abc123f
```

### Solo Developer Workflow

**The Problem:** Enterprise frameworks are overkill for solo developers.

**GSD's Solution:** Opinionated automation optimized for solo dev + Claude.

**What Makes It Solo-Dev Optimized:**

1. **No Enterprise Theater**
   - No meetings
   - No process for process sake
   - No permission gates for routine work

2. **Frictionless Automation**
   - Commands handle orchestration
   - No manual context passing
   - Automatic agent spawning

3. **Opinionated Defaults**
   - Works for 90% of web apps
   - Next.js, React, Node.js focus
   - JWT authentication
   - Prisma ORM

4. **Speed to Productivity**
   - 2-minute install: `npx get-shit-done-cc`
   - Start with `/gsd:new-project`
   - No configuration required

**Installation:**

```bash
# Interactive install
npx get-shit-done-cc

# Prompts for:
# 1. Location: Global (~/.claude/) or Local (./.claude/)
# 2. Statusline: Replace existing if detected
```

**What Gets Installed:**

```bash
~/.claude/
├── commands/gsd/          # All slash commands
├── agents/gsd-*.md        # All subagent definitions
├── get-shit-done/         # Workflows, templates, references
├── hooks/statusline.js    # Statusline script
└── settings.json          # Updated with hooks + statusline
```

### Speed & Productivity

**The Problem:** Context rot causes quality degradation and slow development.

**GSD's Solution:** Context engineering + wave-based parallelization.

**Context Budgeting:**

1. **Plans are Atomic**
   - 2-3 tasks per plan
   - Target ~50% context usage
   - Orchestrator reviews plan before execution

2. **Orchestrators Stay Lean**
   - Main agent at ~15% context
   - Spawns subagents for heavy lifting
   - Collects results, updates state

3. **Fresh Context Per Agent**
   - Each executor gets 200k tokens
   - No context degradation
   - Consistent quality

**Wave-Based Parallelization:**

```yaml
# Plan 01-01: JWT utility
wave: 1
depends_on: []

# Plan 01-02: Login endpoint
wave: 2
depends_on: [01-01]

# Plan 01-03: Protected route
wave: 2
depends_on: [01-01]
```

**Execution:**
```bash
Wave 1: Spawn executor for 01-01 → complete
Wave 2: Spawn 2 parallel executors for 01-02 and 01-03
```

**Result:**
- Consistent quality (context never exceeds 50%)
- Parallel execution (waves run in parallel)
- Fast feedback (each wave commits immediately)

---

## 3. Git Integration Implementation

### Task Commit Protocol

**After each task completes (verification passed, done criteria met), commit immediately:**

**1. Identify modified files:**

```bash
git status --short
```

Track files changed during this specific task (not the entire plan).

**2. Stage only task-related files:**

```bash
# Stage each file individually (NEVER use git add . or git add -A)
git add src/api/auth.ts
git add src/types/user.ts
```

**3. Determine commit type:**

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature, endpoint, component, functionality | feat(08-02): create user registration endpoint |
| `fix` | Bug fix, error correction | fix(08-02): correct email validation regex |
| `test` | Test-only changes (TDD RED phase) | test(08-02): add failing test for password hashing |
| `refactor` | Code cleanup (TDD REFACTOR phase) | refactor(08-02): extract validation to helper |
| `perf` | Performance improvement | perf(08-02): add database index for user lookups |
| `docs` | Documentation changes | docs(08-02): add API endpoint documentation |
| `style` | Formatting, linting fixes | style(08-02): format auth module |
| `chore` | Config, tooling, dependencies | chore(08-02): add bcrypt dependency |

**4. Craft commit message:**

```bash
git commit -m "{type}({phase}-{plan}): {concise task description}

- {key change 1}
- {key change 2}
- {key change 3}
"
```

**Examples:**

```bash
# Standard plan task
git commit -m "feat(08-02): create user registration endpoint

- POST /auth/register validates email and password
- Checks for duplicate users
- Returns JWT token on success
"

# Another standard task
git commit -m "fix(08-02): correct email validation regex

- Fixed regex to accept plus-addressing
- Added tests for edge cases
"
```

**5. Record commit hash:**

```bash
TASK_COMMIT=$(git rev-parse --short HEAD)
echo "Task ${TASK_NUM} committed: ${TASK_COMMIT}"

# Store in array for SUMMARY generation
TASK_COMMITS+=("Task ${TASK_NUM}: ${TASK_COMMIT}")
```

### Plan Completion Commit

**After all tasks committed, one final metadata commit captures plan completion:**

```bash
git add .planning/phases/XX-name/{phase}-{plan}-PLAN.md
git add .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md
git add .planning/STATE.md
git add .planning/ROADMAP.md

git commit -m "docs({phase}-{plan}): complete [plan-name] plan

Tasks completed: [N]/[N]
- [Task 1 name]
- [Task 2 name]
- [Task 3 name]

SUMMARY: .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md
"
```

**Note:** Code files NOT included - already committed per-task.

### Commit Points Guide

| Event | Commit? | Why |
|-------|---------|-----|
| BRIEF + ROADMAP created | YES | Project initialization |
| PLAN.md created | NO | Intermediate - commit with plan completion |
| RESEARCH.md created | NO | Intermediate |
| DISCOVERY.md created | NO | Intermediate |
| **Task completed** | YES | Atomic unit of work (1 commit per task) |
| **Plan completed** | YES | Metadata commit (SUMMARY + STATE + ROADMAP) |
| Handoff created | YES | WIP state preserved |

### TDD Commit Pattern

**RED-GREEN-REFACTOR gets 3 commits:**

```bash
# RED: Write failing test
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): add failing test for JWT generation

- Tests token contains user ID claim
- Tests token expires in 1 hour
- Tests signature verification
"

# GREEN: Make test pass
git add src/utils/jwt.ts
git commit -m "feat(07-02): implement JWT generation

- Uses jose library for signing
- Includes user ID and expiry claims
- Signs with HS256 algorithm
"

# REFACTOR: Clean up code
git add src/utils/jwt.ts src/__tests__/jwt.test.ts
git commit -m "refactor(07-02): extract signing logic to helper

- Extracted signToken() helper function
- Simplified test assertions
- No behavior change
"
```

### Git Integration Benefits

**Context Engineering for AI:**
- Git history becomes primary context source for future Claude sessions
- `git log --grep="{phase}-{plan}"` shows all work for a plan
- `git diff <hash>^..<hash>` shows exact changes per task
- Less reliance on parsing SUMMARY.md = more context for actual work

**Failure Recovery:**
- Task 1 committed ✅, Task 2 failed ❌
- Claude in next session: sees task 1 complete, can retry task 2
- Can `git reset --hard` to last successful task

**Debugging:**
- `git bisect` finds exact failing task, not just failing plan
- `git blame` traces line to specific task context
- Each commit is independently revertable

### Example Git Log Comparison

**Old approach (per-plan commits):**
```bash
a7f2d1 feat(checkout): Stripe payments with webhook verification
3e9c4b feat(products): catalog with search, filters, and pagination
8a1b2c feat(auth): JWT with refresh rotation using jose
5c3d7e feat(foundation): Next.js 15 + Prisma + Tailwind scaffold
2f4a8d docs: initialize ecommerce-app (5 phases)
```

**New approach (per-task commits):**
```bash
# Phase 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation
0j1k2l feat(04-01): create checkout page component

# Phase 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
9s0t1u feat(03-02): implement search and filters
2v3w4x feat(03-01): create product catalog schema
```

Each plan produces 2-4 commits (tasks + metadata). Clear, granular, bisectable.

---

## 4. Adopting GSD Patterns in Blackbox

### Priority 1: Context Budgeting

**What to Implement:**

1. **Define quality degradation curve**
   ```yaml
   quality_curve:
     0-30: PEAK
     30-50: GOOD
     50-70: DEGRADING
     70-100: POOR
   ```

2. **Set context target per operation**
   - Plans: Target 50% context max
   - Orchestrators: Stay at 15-20%
   - Subagents: Get fresh 200k tokens

3. **Split large operations into atomic units**
   - 2-3 tasks per plan
   - Wave-based execution
   - Fresh context per wave

4. **Track and report context usage**
   ```bash
   # In statusline
   Claude 03 | Implement auth | myapp | ████░░░░░░ 40%
   ```

**Implementation Location:**
- Blackbox memory system (`.memory/`)
- Agent prompts (context budgeting instructions)
- Workflow templates (atomic plan structure)

### Priority 2: Per-Task Atomic Commits

**What to Implement:**

1. **Enforce per-task commits**
   ```xml
   <task_commit_protocol>
   After each task:
   1. Stage only task-related files
   2. Commit with {type}({phase}-{plan}): format
   3. Record commit hash
   4. Continue to next task
   </task_commit_protocol>
   ```

2. **Structured commit format**
   ```
   {type}({scope}): {description}

   - {change 1}
   - {change 2}
   ```

3. **Commit verification**
   - Check commit exists in success criteria
   - Verify commit format in validation

**Implementation Location:**
- Git workflow skills
- Agent execution templates
- Validation scripts

### Priority 3: Goal-Backward Verification

**What to Implement:**

1. **Derive must_haves from goals**
   ```yaml
   must_haves:
     truths:
       - "User can see existing messages"
       - "User can send a message"
     artifacts:
       - path: "src/components/Chat.tsx"
         provides: "Message list rendering"
         min_lines: 30
     key_links:
       - from: "src/components/Chat.tsx"
         to: "/api/chat"
         via: "fetch in useEffect"
   ```

2. **3-level artifact checks**
   - Existence: Does file exist?
   - Substantive: Is it implemented (not stub)?
   - Wired: Is it connected (not orphaned)?

3. **Verifier agent checks actual codebase**
   - Don't trust SUMMARY.md claims
   - Read actual files
   - Verify wiring with code search

**Implementation Location:**
- Verification agents
- Success criteria templates
- QA workflows

### Priority 4: Wave-Based Parallelization

**What to Implement:**

1. **Pre-compute waves during planning**
   ```yaml
   # Plan 01-01
   wave: 1
   depends_on: []

   # Plan 01-02
   wave: 2
   depends_on: [01-01]

   # Plan 01-03
   wave: 2
   depends_on: [01-01]
   ```

2. **Group independent tasks into waves**
   - Analyze dependencies
   - Create wave groups
   - Execute each wave in parallel

3. **Wave execution orchestration**
   ```bash
   Wave 1: Spawn N executors in parallel
   Wave 1 complete ✓

   Wave 2: Spawn M executors in parallel
   Wave 2 complete ✓
   ```

**Implementation Location:**
- Planning workflows
- Execution orchestrators
- Agent spawning logic

### Priority 5: STATE.md Equivalent

**What to Implement:**

1. **Single STATE.md for project state**
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

2. **Human-readable AND machine-parseable**
   - Markdown for humans
   - Structured sections for parsing
   - Updated after every action

3. **State persistence**
   - Git-tracked
   - Updated per task
   - Survives session restarts

**Implementation Location:**
- `.blackbox-state/STATE.md`
- State update workflows
- Cross-session continuity

### Priority 6: Deviation Handling Rules

**What to Implement:**

1. **4-rule system**
   ```xml
   <deviation_rules>
   Rule 1: Auto-fix bugs (no permission needed)
   Rule 2: Auto-add critical (no permission needed)
   Rule 3: Auto-fix blockers (no permission needed)
   Rule 4: Ask about architectural (user decision required)
   </deviation_rules>
   ```

2. **Deviation documentation**
   ```markdown
   ## Deviations from Plan

   ### Auto-fixed Issues
   **1. [Rule 1 - Bug] Fixed case-sensitive email uniqueness**
   - **Found during:** Task 4
   - **Issue:** Case-sensitive unique constraint
   - **Fix:** LOWER() index
   - **Commit:** abc123f
   ```

3. **Rule priority system**
   - Rule 4 > Rules 1-3
   - When unsure, ask user

**Implementation Location:**
- Agent execution templates
- Deviation tracking
- Summary generation

### Priority 7: XML-Structured Plans

**What to Implement:**

1. **XML task structure**
   ```xml
   <task type="auto">
     <name>Create login endpoint</name>
     <files>src/app/api/auth/login/route.ts</files>
     <action>
     Use jose for JWT...
     Implement POST handler...
     </action>
     <verify>
     curl test returns 200
     </verify>
     <done>
     Valid credentials return cookie
     </done>
   </task>
   ```

2. **Enforce completeness with required tags**
   - `<name>` - Task name
   - `<files>` - Files to modify
   - `<action>` - What to do
   - `<verify>` - How to verify
   - `<done>` - Success criteria

3. **Make plans executable as prompts**
   - No transformation needed
   - Direct agent input
   - Self-documenting

**Implementation Location:**
- Plan templates
- Agent prompts
- Planning workflows

### Implementation Roadmap

**Phase 1: Foundation (Week 1)**
- Implement per-task atomic commits
- Add STATE.md to Blackbox
- Create structured commit format

**Phase 2: Context Management (Week 2)**
- Define quality degradation curve
- Add context budgeting to agents
- Implement context tracking

**Phase 3: Verification (Week 3)**
- Implement goal-backward verification
- Create 3-level artifact checks
- Build verifier agent

**Phase 4: Parallelization (Week 4)**
- Add wave-based execution
- Implement dependency analysis
- Create parallel orchestration

**Phase 5: Deviation Handling (Week 5)**
- Implement 4-rule system
- Add deviation tracking
- Create deviation documentation

**Phase 6: XML Plans (Week 6)**
- Convert plan format to XML
- Enforce completeness tags
- Make plans executable

---

## 5. Additional GSD Innovations (Not Yet Covered)

After deeper analysis of the GSD codebase, here are **5 additional innovations** that GSD does exceptionally well:

### 5.1 Pre-Planning Context Extraction (`/gsd:discuss-phase`)

**The Problem:** Planning agents often make wrong assumptions because implementation context wasn't captured.

**GSD's Solution:** Deep questioning workflow BEFORE planning extracts implementation decisions.

**How It Works:**

```bash
# Phase 2: Before planning
/gsd:discuss-phase 1

# Analyzes phase for "gray areas":
- UI: Layout style (cards vs timeline)
- Behavior: Loading pattern (infinite scroll vs pagination)
- Content: What metadata displays
- Empty State: What shows when no data

# User selects which to discuss
# 4 questions per area, then "more or next?"
# Creates CONTEXT.md with all decisions
```

**CONTEXT.md Structure:**
```markdown
## Phase Boundary
[Clear statement of what this phase delivers - scope anchor]

## Implementation Decisions
### Layout & Visuals
- Card-based layout with 2-column grid
- Information density: Full posts (not previews)

### Behavior
- Infinite scroll (not pagination)
- Pull-to-refresh on mobile

### Claude's Discretion
[Areas where user said "you decide"]

## Specific Ideas
[References, examples, "I want it like X" moments]

## Deferred Ideas
[Things that came up but belong in other phases]
```

**Why This Matters:**
- Prevents mid-plan "wait, what did you want?" moments
- Downstream agents (researcher, planner, executor) all read CONTEXT.md
- No scope creep - phase boundary is FIXED
- User = visionary, Claude = builder (roles are clear)

**Key Innovation:** Scope guardrail prevents discussion from adding new capabilities.

### 5.2 Checkpoint Protocol (Fresh Continuation Agents)

**The Problem:** Long-running sessions lose context quality at checkpoints.

**GSD's Solution:** Structured checkpoints with fresh continuation agents.

**3 Checkpoint Types:**

1. **checkpoint:human-verify** (90% of checkpoints)
   - Claude automated everything
   - Human verifies visual/functional correctness
   - Example: "Visit https://myapp.vercel.app and confirm homepage loads"

2. **checkpoint:decision** (9% of checkpoints)
   - Human makes architectural/technology choice
   - Claude presents balanced pros/cons (not prescriptive)
   - Example: "Select auth provider: Supabase, Clerk, or NextAuth?"

3. **checkpoint:human-action** (1% - rare)
   - Truly unavoidable manual steps with NO CLI/API
   - Example: Email verification links, SMS 2FA codes, credit card 3DS
   - Claude automates EVERYTHING possible first

**Checkpoint Protocol:**
```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Deployed to https://myapp.vercel.app</what-built>
  <how-to-verify>
    Visit https://myapp.vercel.app and confirm:
    - Homepage loads without errors
    - Login form is visible
    - No console errors
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe issues</resume-signal>
</task>
```

**Execution Flow:**
```bash
1. Executor STOPs at checkpoint
2. Returns structured message to user
3. User responds ("approved" or describes issues)
4. FRESH continuation agent resumes (same context as executor)
5. Continues to next task
```

**Why This Matters:**
- Checkpoints are for verification/decisions, NOT manual work
- Fresh agents avoid context degradation
- Clear resume signals prevent ambiguity
- No resume complexity (state passed in message)

**Authentication Gates:**
When Claude tries CLI/API and gets auth error, this is NOT a failure:
```bash
Claude tries: vercel --yes
Error: Not authenticated

╔═══════════════════════════════════════════════════════╗
║  CHECKPOINT: Action Required                          ║
╚═══════════════════════════════════════════════════════╝

What you need to do:
  1. Run: vercel login
  2. Complete browser authentication

I'll verify: vercel whoami returns your account

→ YOUR ACTION: Type "done" when authenticated
```

### 5.3 Enhanced Verification (3-Level Artifact Checks)

**The Problem:** Task completion doesn't verify actual functionality (stubs pass task checks).

**GSD's Solution:** Goal-backward verification with 3-level artifact checks.

**Verification Process:**

**Level 1: Existence**
```bash
check_exists() {
  [ -f "$path" ] && echo "EXISTS" || echo "MISSING"
}
```

**Level 2: Substantive**
```bash
# Line count check
check_length() {
  lines=$(wc -l < "$path")
  [ "$lines" -ge "$min_lines" ] && echo "SUBSTANTIVE" || echo "THIN"
}

# Stub pattern check
check_stubs() {
  stubs=$(grep -c -E "TODO|FIXME|placeholder|not implemented" "$path")
  [ "$stubs" -gt 0 ] && echo "STUB_PATTERNS" || echo "NO_STUBS"
}

# Export check (for components)
check_exports() {
  grep -E "^export (default )?(function|const|class)" "$path"
}
```

**Level 3: Wired**
```bash
# Import check
check_imported() {
  imports=$(grep -r "import.*$artifact_name" "$search_path")
  [ "$imports" -gt 0 ] && echo "IMPORTED" || echo "NOT_IMPORTED"
}

# Usage check
check_used() {
  uses=$(grep -r "$artifact_name" "$search_path" | grep -v "import")
  [ "$uses" -gt 0 ] && echo "USED" || echo "NOT_USED"
}
```

**Final Status:**
| Exists | Substantive | Wired | Status |
|--------|-------------|-------|--------|
| ✓ | ✓ | ✓ | ✓ VERIFIED |
| ✓ | ✓ | ✗ | ⚠️ ORPHANED |
| ✓ | ✗ | - | ✗ STUB |
| ✗ | - | - | ✗ MISSING |

**Key Link Verification:**

Pattern 1: Component → API
```bash
verify_component_api_link() {
  # Check for fetch/axios call to the API
  has_call=$(grep -E "fetch\(['\"].*$api_path|axios\.(get|post).*$api_path" "$component")

  # Check if response is used
  uses_response=$(grep -A 5 "fetch\|axios" "$component" | grep -E "await|\.then|setData")
}
```

Pattern 2: API → Database
```bash
verify_api_db_link() {
  # Check for Prisma/DB call
  has_query=$(grep -E "prisma\.$model|db\.$model" "$route")

  # Check if result is returned
  returns_result=$(grep -E "return.*json.*\w+|res\.json\(\w+" "$route")
}
```

**Why This Matters:**
- Prevents stub implementations
- Verifies actual user outcomes
- Checks real codebase, not SUMMARY.md claims
- Finds orphaned code (exists but not used)

### 5.4 Deep Questioning (Dream Extraction)

**The Problem:** Project initialization is often requirements gathering, not vision extraction.

**GSD's Solution:** Collaborative thinking partnership, not interrogation.

**Philosophy:**
> "You are a thinking partner, not an interviewer. The user often has a fuzzy idea. Your job is to help them sharpen it."

**How to Question:**

1. **Start open** - Let them dump their mental model. Don't interrupt.
2. **Follow energy** - Dig into what excited them. What sparked this?
3. **Challenge vagueness** - "Good" means what? "Users" means who?
4. **Make abstract concrete** - "Walk me through using this."
5. **Clarify ambiguity** - "When you say Z, do you mean A or B?"
6. **Know when to stop** - When you understand what/why/who/done.

**Question Types:**

**Motivation (why this exists):**
- "What prompted this?"
- "What are you doing today that this replaces?"
- "What would you do if this existed?"

**Concreteness (what it actually is):**
- "Walk me through using this"
- "You said X — what does that actually look like?"
- "Give me an example"

**Clarification (what they mean):**
- "When you say Z, do you mean A or B?"
- "You mentioned X — tell me more about that"

**Success (how you'll know it's working):**
- "How will you know this is working?"
- "What does done look like?"

**Using AskUserQuestion Effectively:**

Good options:
- Interpretations of what they might mean
- Specific examples to confirm or deny
- Concrete choices that reveal priorities

Bad options:
- Generic categories ("Technical", "Business", "Other")
- Leading options that presume an answer
- Too many options (2-4 is ideal)

**Context Checklist:**
Use as background, not conversation structure:
- [ ] What they're building
- [ ] Why it needs to exist
- [ ] Who it's for
- [ ] What "done" looks like

**Anti-Patterns:**
- ❌ Checklist walking - going through domains regardless of what they said
- ❌ Canned questions - "What's your core value?" regardless of context
- ❌ Corporate speak - "What are your success criteria?" "Who are your stakeholders?"
- ❌ Interrogation - firing questions without building on answers
- ❌ Rushing - minimizing questions to get to "the work"
- ❌ Shallow acceptance - taking vague answers without probing
- ❌ Premature constraints - asking about tech stack before understanding the idea
- ❌ User skills - NEVER ask about technical experience. Claude builds.

### 5.5 Anti-Pattern Detection

**The Problem:** Code can pass tests but still have quality issues.

**GSD's Solution:** Automated anti-pattern scanning during verification.

**Detection Patterns:**

```bash
scan_antipatterns() {
  for file in $files; do
    # TODO/FIXME comments
    grep -n -E "TODO|FIXME|XXX|HACK" "$file"

    # Placeholder content
    grep -n -E "placeholder|coming soon|will be here" "$file"

    # Empty implementations
    grep -n -E "return null|return \{\}|return \[\]|=> \{\}" "$file"

    # Console.log only implementations
    grep -n -B 2 -A 2 "console\.log" "$file" | grep -E "^\s*(const|function|=>)"
  done
}
```

**Categorization:**
- 🛑 **Blocker**: Prevents goal achievement (placeholder renders, empty handlers)
- ⚠️ **Warning**: Indicates incomplete (TODO comments, console.log)
- ℹ️ **Info**: Notable but not problematic

**Why This Matters:**
- Catches quality issues tests miss
- Identifies incomplete work
- Provides concrete remediation steps
- Builds trust through transparency

---

## 6. Summary: All GSD Advantages Over Blackbox

### Core Innovations (Previously Documented):

1. **Context Management** - Explicit quality degradation curve
2. **Git Integration** - Per-task atomic commits
3. **Goal-Backward Verification** - Verify outcomes, not tasks
4. **Automatic Deviation Handling** - 4-rule system
5. **Solo Developer Workflow** - Opinionated, frictionless
6. **Speed & Productivity** - Wave-based parallelization

### Additional Innovations (Just Discovered):

7. **Pre-Planning Context Extraction** - `/gsd:discuss-phase` captures implementation decisions before planning
8. **Checkpoint Protocol** - Fresh continuation agents prevent context degradation
9. **Enhanced Verification** - 3-level artifact checks (existence, substantive, wired)
10. **Deep Questioning** - Dream extraction, not requirements gathering
11. **Anti-Pattern Detection** - Automated scanning for TODO, placeholders, empty returns

### What Makes GSD Unique:

| Innovation | Why It Matters |
|------------|----------------|
| **Context Engineering** | Explicit degradation curve = consistent quality |
| **Atomic Commits** | Git bisect finds exact failing task in seconds |
| **Goal-Backward Verification** | Prevents stub implementations |
| **Pre-Planning Discussion** | Prevents mid-plan "what did you want?" moments |
| **Checkpoint Protocol** | Fresh agents = no context degradation |
| **3-Level Artifact Checks** | Finds orphaned code and stubs |
| **Wave-Based Parallelization** | Parallel execution + context budgeting |
| **Deep Questioning** | Collaborative thinking, not interrogation |
| **Scope Guardrails** | Prevents scope creep during discussion |
| **Anti-Pattern Scanning** | Catches quality issues tests miss |

---

## 6. Additional GSD Innovations (Deep Exploration)

After comprehensive exploration of the GSD codebase, here are **14 more innovations** that GSD does exceptionally well:

### 6.1 Todo Management System

**Problem:** Capturing good ideas mid-work without losing them, then systematically deciding what to work on next.

**GSD's Solution:** Persistent todo capture with intelligent routing.

**How It Works:**

```bash
# Capture idea mid-work
/gsd:add-todo

# Creates:
---
title: "Add auth token refresh"
area: "api"
created: 2025-01-18T10:30:00Z
files: ["src/lib/auth.ts"]
---
### Problem
Current auth token expires after 1 hour
### Solution
Add automatic token refresh logic

# Later: Check todos
/gsd:check-todos

# Routes todos to:
# - Existing roadmap phases (by area)
# - New phases (if no match)
# - Backlog (deferred ideas)
```

**Why It Matters:**
- Prevents context switching interruptions while preserving valuable insights
- Creates system for idea incubation vs. execution
- Intelligent routing matches todos to roadmap phases

### 6.2 Parallel Debugging Architecture

**Problem:** Multiple issues found during UAT require investigation without sequential bottlenecks.

**GSD's Solution:** Parallel root cause analysis with fresh context per agent.

**How It Works:**

```python
# /gsd:verify-work finds 3 gaps during UAT
gaps = ["Dashboard doesn't fetch data", "Auth redirects broken", "Form validation missing"]

# Spawn parallel debug agents
for gap in gaps:
    Task(prompt=filled_debug_template, subagent_type="gsd-debugger")

# All run in parallel, each with fresh 200k context
# Results collected and UAT.md updated with root causes
```

**Why It Matters:**
- Reduces debugging time from linear to parallel processing
- Each gap gets full attention without cross-contamination
- Fresh context per debugger maintains quality

### 6.3 Agent Specialization Framework

**Problem:** Different development phases require different expertise levels and tool access.

**GSD's Solution:** Domain-specific agents with baked-in expertise.

**Agent Specializations:**

```markdown
### gsd-debugger
- Scientific method + hypothesis testing
- Tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
- Color: orange
- Expertise: Root cause analysis

### gsd-integration-checker
- Cross-phase verification only
- Tools: Read, Grep, Bash
- Color: blue
- Expertise: Integration testing

### gsd-planner
- Full planning methodology
- Tools: All available
- Color: purple
- Expertise: Task decomposition

### gsd-verifier
- Artifact validation against codebase
- Tools: Read, Grep, Bash
- Color: green
- Expertise: Goal-backward verification
```

**Why It Matters:**
- Creates reusable expertise modules
- Agents spawned independently with context-only prompts
- Specialized tool access reduces context bloat

### 6.4 Milestone Audit Framework

**Problem:** Milestones can appear complete but have integration gaps or unmet requirements.

**GSD's Solution:** Comprehensive milestone review with cross-phase verification.

**How It Works:**

```bash
/gsd:audit-milestone

# Aggregates all phase VERIFICATION.md files
# Spawns gsd-integration-checker for cross-phase wiring
# Creates v{version}-MILESTONE-AUDIT.md with scores

---
milestone: v1.0
status: tech_debt
scores:
  requirements: 8/10
  integration: 9/10
  flows: 7/10
tech_debt:
  - phase: 03-dashboard
    items:
      - "TODO: add rate limiting"
      - "FIXME: handle edge case"
```

**Gap Categories:**
- **Requirements**: Features promised but not delivered
- **Integration**: Cross-phase wiring issues
- **Flows**: User journey gaps
- **Tech Debt**: TODOs, FIXMEs, placeholders

**Why It Matters:**
- Ensures milestones deliver working systems, not just phase completion
- Categorizes gaps for systematic closure
- Creates audit trail for quality

### 6.5 Automated Gap Closure Planning

**Problem:** Manually planning fixes for audit gaps is error-prone and time-consuming.

**GSD's Solution:** Audit-to-plan automation with gap-to-task mapping.

**How It Works:**

```bash
/gsd:plan-milestone-gaps

# Reads MILESTONE-AUDIT.md
# Groups related gaps into logical phases
# Creates ROADMAP.md entries for fix phases

# Gap mapping example:
gap:
  id: DASH-01
  reason: "Dashboard exists but doesn't fetch"
  missing:
    - "useEffect with fetch"
    - "State for user data"

becomes:

tasks:
  - name: "Add data fetching"
    action: "Add useEffect that fetches /api/user/data"
    files: "src/app/dashboard/page.tsx"
    verify: "Dashboard displays user data on load"
```

**Why It Matters:**
- Transforms audit findings directly into actionable plans
- No manual interpretation needed
- Maintains traceability from gap → task → fix

### 6.6 TDD Integration Framework

**Problem:** TDD requires discipline that's hard to maintain without tooling support.

**GSD's Solution:** Test-driven development as first-class citizen.

**How It Works:**

```yaml
---
phase: 08-auth
plan: 02
type: tdd
---

<feature>
  <name>Email validation</name>
  <behavior>
    Valid emails → true, Invalid → false
  </behavior>
  <edge_cases>
    - Plus addressing: user+tag@example.com
    - Subdomains: user@mail.example.com
    - Case sensitivity: Test@Example.com
  </edge_cases>
</feature>

# Produces 3 commits:
# 1. test(08-02): add failing test for email validation
# 2. feat(08-02): implement email validation
# 3. refactor(08-02): extract validation to helper
```

**TDD Commit Pattern:**
- RED: Test-only changes
- GREEN: Implementation to pass tests
- REFACTOR: Code cleanup (no behavior change)

**Why It Matters:**
- Makes TDD practical within GSD workflow
- Proper tooling support with framework detection
- Context budgeting (~40% vs ~50% for standard plans)

### 6.7 Session Persistence Pattern

**Problem:** Work sessions span multiple `/clear` commands but need to maintain state.

**GSD's Solution:** Cross-context state continuation with frontmatter.

**How It Works:**

```markdown
---
status: testing  # OVERWRITE on update
phase: 04-comments  # IMMUTABLE
started: 2025-01-18T10:30:00Z  # IMMUTABLE
updated: 2025-01-18T10:45:00Z  # OVERWRITE
current_task: 3/8
---

## Position
Building comment system with real-time updates.

## Decisions Made
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use WebSockets, not polling | Real-time requirement | ✓ Good |

## Blockers
None currently.

## Concerns
- WebSocket reconnection on network loss
```

**Frontmatter Fields:**
- **IMMUTABLE**: Never changes (phase, started)
- **OVERWRITE**: Updated each session (status, updated, current_task)

**Why It Matters:**
- Enables long-running projects to survive context resets
- Clear resume points after `/clear`
- Session-aware todo management

### 6.8 Automated Versioning & Archiving

**Problem:** Milestones need proper versioning but manual versioning is error-prone.

**GSD's Solution:** Semantic versioning integration with archive pattern.

**How It Works:**

```bash
/gsd:complete-milestone

# Version inferred from ROADMAP.md or explicit argument
# Creates v{version}-MILESTONE-AUDIT.md
# Archive pattern with metadata preservation

# Archiving:
mkdir .planning/archive/v1.0/
cp -r .planning/phases/* .planning/archive/v1.0/
cp .planning/v1.0-MILESTONE-AUDIT.md .planning/archive/v1.0/
git tag v1.0

# Roadmap updated:
## Milestone v1.0 ✅
Completed: 2025-01-18
Phases: 04 (Foundation, Auth, Products, Checkout)
```

**Why It Matters:**
- Creates proper release artifacts
- Version history for project evolution
- Git tags for easy rollback

### 6.9 Error Recovery Framework

**Problem:** When agents fail, the system should recover gracefully, not crash.

**GSD's Solution:** Intelligent failure handling with partial progress preservation.

**Recovery Patterns:**

```python
# Timeout detection
if agent_return.timeout:
    save_partial_progress()
    retry_with_fresh_context()

# Zombie agent cleanup
if "accidentally re-added" in agent_description:
    remove_zombie_agent()
    continue_processing()

# Graceful degradation
if verification_fails:
    root_cause = determine_failure_type()
    if root_cause == "Manual review needed":
        create_checkpoint()
    else:
        retry_with_different_approach()
```

**Why It Matters:**
- Makes system robust enough for real-world use
- Partial progress preserved on failure
- Manual intervention points with clear escalation

### 6.10 Multi-Platform Installation System

**Problem:** Installation friction prevents adoption across different environments.

**GSD's Solution:** Cross-platform zero-friction setup.

**How It Works:**

```bash
# Single command install
npx get-shit-done-cc

# Platform detection:
if [ "$OSTYPE" = "darwin"* ]; then
  # macOS: Use shell hooks
  install_hooks="$HOME/.claude/hooks"
elif [ "$OSTYPE" = "linux-gnu"* ]; then
  # Linux: Use shell hooks
  install_hooks="$HOME/.claude/hooks"
else
  # Windows: Use Node.js hooks
  install_hooks="$HOME/.claude/hooks"
fi

# Automatic hook installation
# Config directory customization for multiple accounts
# Clean install with orphaned file cleanup
```

**Why It Matters:**
- Eliminates installation barriers across development environments
- Works on macOS, Linux, Windows
- Global or local installation

### 6.11 Statusline Integration

**Problem:** Developers lose track of context usage and current task.

**GSD's Solution:** Real-time status display in Claude Code.

**How It Works:**

```javascript
// hooks/statusline.js
module.exports = {
  format: async ({ modelName, currentTask, directory, contextInfo }) => {
    const percentage = Math.round(contextInfo.usage * 100);
    const bar = '█'.repeat(Math.floor(percentage / 10)) +
                '░'.repeat(10 - Math.floor(percentage / 10));

    return `${modelName} 03 | Implement auth login | ${directory} | ${bar} ${percentage}%`;
  }
};

// Display: Claude 03 | Implement auth login | myapp | ████░░░░░░ 40%
```

**Status Shows:**
- Model name
- Current task (from todos)
- Directory name
- Context usage with color-coded progress bar

**Why It Matters:**
- Real-time context awareness
- Prevents unexpected context overflow
- Quick reference for current work

### 6.12 Project State Management

**Problem:** Projects need centralized state tracking across sessions.

**GSD's Solution:** STATE.md as single source of truth.

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

**Why It Matters:**
- Cross-session continuity
- Single source of truth
- Decision audit trail

### 6.13 Handoff/Resume Protocol

**Problem:** Sessions need to pause and resume without losing context.

**GSD's Solution:** Structured handoff with WIP commits.

**How It Works:**

```bash
/gsd:pause-work

# Creates:
---
status: paused
phase: 04-comments
current_task: 3/8
last_action: "Added reply form"
next_action: "Implement WebSocket for real-time"
paused_at: 2025-01-18T15:30:00Z
---

git commit -m "wip: comments paused at task 3/8

Current: Implementing reply form
Next: WebSocket for real-time updates"

# Later:
/gsd:resume-work

# Loads STATE.md
# Presents position, blockers, next steps
# Fresh context with all state restored
```

**Why It Matters:**
- No lost context on session pause
- Clear resume points
- Works across `/clear`

### 6.14 Research Integration

**Problem:** Planning requires domain knowledge but manual research is time-consuming.

**GSD's Solution:** Automated research with parallel dimension analysis.

**How It Works:**

```bash
/gsd:new-project

# Spawns 4 parallel research agents:
Task(prompt="Analyze TECH STACK", subagent_type="gsd-project-researcher")
Task(prompt="Analyze FEATURES", subagent_type="gsd-project-researcher")
Task(prompt="Analyze ARCHITECTURE", subagent_type="gsd-project-researcher")
Task(prompt="Analyze PITFALLS", subagent_type="gsd-project-researcher")

# Each produces:
- STACK.md: Recommended tech stack with rationale
- FEATURES.md: Core features with MVP scoping
- ARCHITECTURE.md: System design patterns
- PITFALLS.md: Common mistakes to avoid

# Synthesized into SUMMARY.md
```

**Why It Matters:**
- Parallel research reduces planning time
- Each dimension gets full attention
- Comprehensive domain understanding before planning

---

## 7. Summary: All GSD Advantages Over Blackbox

### Core Innovations (Previously Documented):

1. **Context Management** - Explicit quality degradation curve
2. **Git Integration** - Per-task atomic commits
3. **Goal-Backward Verification** - Verify outcomes, not tasks
4. **Automatic Deviation Handling** - 4-rule system
5. **Solo Developer Workflow** - Opinionated, frictionless
6. **Speed & Productivity** - Wave-based parallelization
7. **Pre-Planning Context Extraction** - `/gsd:discuss-phase`
8. **Checkpoint Protocol** - Fresh continuation agents
9. **Enhanced Verification** - 3-level artifact checks
10. **Deep Questioning** - Dream extraction
11. **Anti-Pattern Detection** - Quality scanning

### Additional Innovations (Just Discovered):

12. **Todo Management System** - Persistent capture with intelligent routing
13. **Parallel Debugging Architecture** - Parallel root cause analysis
14. **Agent Specialization Framework** - Domain-specific expertise
15. **Milestone Audit Framework** - Comprehensive milestone review
16. **Automated Gap Closure Planning** - Audit-to-plan automation
17. **TDD Integration Framework** - Test-driven development as first-class citizen
18. **Session Persistence Pattern** - Cross-context state continuation
19. **Automated Versioning & Archiving** - Semantic versioning integration
20. **Error Recovery Framework** - Intelligent failure handling
21. **Multi-Platform Installation System** - Cross-platform zero-friction setup
22. **Statusline Integration** - Real-time context display
23. **Project State Management** - STATE.md as single source of truth
24. **Handoff/Resume Protocol** - Structured session pause/resume
25. **Research Integration** - Automated parallel dimension analysis

---

## Complete Innovation Matrix

| Category | Innovation | Impact | Complexity |
|----------|-----------|--------|------------|
| **Context** | Quality degradation curve | HIGH | Low |
| **Context** | Thin orchestrator pattern | HIGH | Medium |
| **Context** | Statusline integration | MEDIUM | Low |
| **Git** | Per-task atomic commits | HIGH | Low |
| **Git** | TDD commit pattern | MEDIUM | Low |
| **Verification** | Goal-backward verification | HIGH | Medium |
| **Verification** | 3-level artifact checks | HIGH | Medium |
| **Verification** | Anti-pattern detection | MEDIUM | Low |
| **Verification** | Milestone audit framework | HIGH | High |
| **Planning** | Pre-planning context extraction | HIGH | Medium |
| **Planning** | Research integration | MEDIUM | High |
| **Planning** | Gap closure planning | HIGH | Medium |
| **Execution** | Wave-based parallelization | HIGH | Medium |
| **Execution** | Checkpoint protocol | HIGH | Medium |
| **Execution** | Deviation handling (4-rule) | HIGH | Medium |
| **Debugging** | Parallel debugging architecture | HIGH | Medium |
| **State** | Session persistence | HIGH | Low |
| **State** | Handoff/resume protocol | MEDIUM | Low |
| **State** | STATE.md management | HIGH | Low |
| **Agents** | Specialization framework | MEDIUM | Medium |
| **Quality** | TDD integration | MEDIUM | Medium |
| **Quality** | Error recovery framework | MEDIUM | High |
| **UX** | Deep questioning | HIGH | Medium |
| **UX** | Multi-platform installation | MEDIUM | Medium |
| **UX** | Todo management | MEDIUM | Low |
| **UX** | Automated versioning | LOW | Low |

**Total: 25 documented innovations**

---

## Conclusion

**GSD's constraints ARE its strengths.** By saying "no" to enterprise complexity and focusing on solo dev + Claude Code, GSD achieves remarkable simplicity and effectiveness.

**Key Takeaways for Blackbox:**

1. **Context engineering is not optional** — It's the core design principle
2. **Atomic everything** — 2-3 tasks per plan, per-task commits, wave-based parallelization
3. **Goal-backward verification** — Verify outcomes, not tasks
4. **Solo dev optimization** — No enterprise theater, frictionless automation
5. **File-based state** — Git-friendly, cross-session continuity

**Implementation Priority:**
1. Context budgeting (highest impact)
2. Atomic commits (enables everything else)
3. Goal-backward verification (quality assurance)
4. Wave-based parallelization (speed + consistency)
5. STATE.md equivalent (cross-session continuity)
6. Deviation handling (autonomy)
7. XML plans (enforce completeness)

**For Blackbox to improve:** Adopt GSD's core innovations while maintaining Blackbox's breadth and scalability. The goal is not to become GSD, but to learn from its brilliant context engineering and solo dev optimization.
