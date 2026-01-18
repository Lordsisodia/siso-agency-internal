# BMAD + GSD: The Complete Combination

**How BMAD and GSD work together to provide the ultimate AI-driven development methodology**

---

## Executive Summary

**BMAD and GSD are complementary, not competing.**

| Aspect | BMAD | GSD |
|--------|------|-----|
| **Focus** | Methodology + Architecture | Context Engineering + Execution |
| **Team Size** | 2+ developers | Solo developers |
| **Process** | Structured 4-phase methodology | Atomic task execution |
| **Agents** | 12+ specialized domain experts | 11 generalist agents |
| **Strength** | Discipline, quality, scale | Speed, efficiency, solo dev |
| **Best For** | Complex, long-term projects | Quick wins, solo work |

**The Best of Both Worlds:**
- **BMAD provides:** Structure, methodology, specialization, architecture quality
- **GSD provides:** Context engineering, atomic operations, verification, solo dev optimization

**When combined:** You get a complete system that handles both the "what" (BMAD) and the "how" (GSD) of AI-driven development.

---

## Why They Complement Each Other

### BMAD's Weaknesses → GSD's Strengths

| BMAD Gap | GSD Solution |
|----------|-------------|
| No explicit context management | Explicit degradation curve (0-30% PEAK, 30-50% GOOD, 50-70% DEGRADING) |
| Ad-hoc git commits | Per-task atomic commits with structured format |
| Task-based verification | Goal-backward verification (3-level artifact checks) |
| Complex for simple tasks | Quick Flow agent for fast wins |
| No context budgeting | 2-3 tasks per plan, ~50% context target |

### GSD's Weaknesses → BMAD's Strengths

| GSD Gap | BMAD Solution |
|----------|-------------|
| No structured methodology | 4-phase methodology (Elicitation → Analysis → Solutioning → Implementation) |
| Generic agents | 12+ specialized domain experts |
| No workflow library | 50+ battle-tested workflows |
| No architecture enforcement | Automated domain-driven architecture validation |
| Greenfield-only focus | Brownfield integration workflows |

---

## Combined Methodology

### The Integration Point

```yaml
# .blackbox5/config/combined-methodology.yaml
methodology:
  framework: "BMAD 4-Phase"
  execution: "GSD patterns"

phases:
  elicitation:
    framework: "BMAD"
    agent: "mary"
    execution: "GSD deep questioning"
    output: "product-brief.md"
    context_budget: "30%"

  analysis:
    framework: "BMAD"
    agents: ["mary", "john"]
    execution: "GSD pre-planning discussion"
    output: "prd.md"
    context_budget: "50%"

  solutioning:
    framework: "BMAD"
    agent: "winston"
    execution: "GSD research integration"
    output: "architecture-spec.md"
    context_budget: "50%"

  implementation:
    framework: "BMAD"
    agent: "arthur"
    execution: "GSD wave-based execution"
    output: "working-code"
    git_strategy: "GSD atomic commits"
    verification: "GSD goal-backward"
    context_budget_per_task: "30%"
```

---

## Phase-by-Phase Integration

### Phase 1: Elicitation (Mary + GSD Deep Questioning)

**BMAD Part:**
- Mary (Business Analyst) leads market research
- Structured artifact: product-brief.md
- Quality gate: elicitation-complete

**GSD Part:**
- Deep questioning to extract true requirements
- Context budget: 30% (keep it lean)
- Atomic task: "Create product brief for X"

**Example:**
```
User: "I need a partnership referral system"

BMAD: Trigger Mary (Analyst)
GSD: Deep questioning (what problem does this solve? who are the users?)
Mary: Creates product-brief.md
GSD: Atomic commit "feat(01-01): create product brief"
```

### Phase 2: Analysis (Mary + John + GSD Pre-Planning)

**BMAD Part:**
- Mary + John (PM) create PRD
- Structured artifact: prd.md
- Quality gate: requirements-approved

**GSD Part:**
- Pre-planning discussion to align on approach
- Context budget: 50% (more complex)
- Split into 2-3 atomic tasks

**Example:**
```
BMAD: Mary + John collaborate on PRD
GSD: Pre-planning discussion (what are the risks? dependencies?)
Mary+John: Create prd.md
GSD: Atomic commits:
  - "feat(02-01): define user personas"
  - "feat(02-02): write user stories"
  - "feat(02-03): document acceptance criteria"
```

### Phase 3: Solutioning (Winston + GSD Research Integration)

**BMAD Part:**
- Winston (Architect) designs system
- Structured artifact: architecture-spec.md
- Quality gate: design-review-passed

**GSD Part:**
- Research integration (what are the tech options?)
- Context budget: 50%
- Wave-based parallelization (research multiple options in parallel)

**Example:**
```
BMAD: Winston designs architecture
GSD: Research integration (compare PostgreSQL vs MongoDB vs MySQL)
Winston: Creates architecture-spec.md
GSD: Atomic commits:
  - "arch(03-01): evaluate database options"
  - "arch(03-02): design API contracts"
  - "arch(03-03): create data model"
```

### Phase 4: Implementation (Arthur + GSD Wave-Based Execution)

**BMAD Part:**
- Arthur (Developer) implements feature
- Structured artifact: dev-agent-record.md
- Quality gate: qa-signoff

**GSD Part:**
- Wave-based parallelization (independent tasks in parallel)
- Context budget: 30% per task
- Per-task atomic commits
- Goal-backward verification

**Example:**
```
BMAD: Arthur implements feature
GSD: Wave-based execution
Wave 1 (parallel):
  - Task 1: Create database schema
  - Task 2: Build API endpoints
  - Task 3: Implement UI components
Wave 2 (after Wave 1 complete):
  - Task 4: Integrate frontend with backend
  - Task 5: Add error handling
Wave 3 (after Wave 2 complete):
  - Task 6: Write tests
  - Task 7: Documentation

GSD: Per-task atomic commits:
  - "feat(04-01-01): create database schema"
  - "feat(04-01-02): build API endpoints"
  - "feat(04-01-03): implement UI components"
  - "feat(04-02-01): integrate frontend with backend"
  - "feat(04-02-02): add error handling"
  - "test(04-03-01): write integration tests"
  - "docs(04-03-02): write API documentation"
```

---

## Combined Agent System

### When to Use Which Agent

**Simple Task (1 file, clear fix):**
```
Agent: Quick Flow (BMAD) or gsd-executor (GSD)
Context: 0-30% (GSD PEAK quality)
Commit: Single atomic commit
```

**Medium Task (2-5 files, feature):**
```
Agent: Arthur (BMAD Developer) or gsd-executor (GSD)
Context: 30-50% (GSD GOOD quality)
Split: 2-3 atomic tasks
Commits: Per-task atomic commits
```

**Complex Task (5+ files, new feature):**
```
Agent: BMAD Team (Mary → John → Winston → Arthur)
Context: 50% target per phase (GSD)
Split: Wave-based execution (GSD)
Commits: Per-task atomic commits (GSD)
Verification: Goal-backward (GSD)
```

### Agent Mapping

| BMAD Agent | GSD Equivalent | When to Use |
|------------|---------------|-------------|
| Mary (Analyst) | gsd-planner | Research, analysis, requirements |
| Winston (Architect) | gsd-planner | System design, architecture |
| Arthur (Developer) | gsd-executor | Implementation |
| John (PM) | gsd-planner | Planning, coordination |
| Quick Flow | gsd-executor | Simple tasks |
| TEA (Technical Analyst) | gsd-researcher | Technical research |

**Key Insight:** BMAD agents have **domain expertise**. GSD agents have **execution patterns**. Use BMAD for specialized work, GSD for general execution.

---

## Combined Git Strategy

### GSD Atomic Commits (The Execution Layer)

```bash
# Each task = 1 commit (or 2-3 for TDD)
git commit -m "feat(04-01-01): create database schema"
git commit -m "feat(04-01-02): build API endpoints"
git commit -m "test(04-01-02): add API tests"
```

### BMAD Phase Commits (The Methodology Layer)

```bash
# Complete phase = 1 summary commit
git commit -m "docs(04-01): complete database schema phase

- Created schema with migrations
- Added indexes for performance
- Documented data model

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Combined Strategy

```bash
# During implementation (GSD pattern)
git commit -m "feat(04-01-01): create partnership table"
git commit -m "feat(04-01-02): add referral tracking"
git commit -m "test(04-01): add integration tests"

# Phase complete (BMAD pattern)
git commit -m "docs(04-01): complete data model phase

Phase 4.1 (Data Model) - COMPLETE

Tasks:
- ✅ 04-01-01: Create partnership table
- ✅ 04-01-02: Add referral tracking
- ✅ 04-01-03: Build commission tracking

Tests: ✅ Passing
Documentation: ✅ Complete
Review: ✅ Approved

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Combined Verification

### GSD Goal-Backward Verification (Task Level)

```yaml
must_haves:
  truths:
    - "User can view partnership dashboard"
    - "User can see referral list"
    - "User can track commissions"

  artifacts:
    - path: "src/domains/partnerships/pages/PartnerDashboard.tsx"
      provides: "Partnership dashboard view"
      min_lines: 50

    - path: "src/domains/partnerships/components/ReferralList.tsx"
      provides: "Referral list display"
      min_lines: 30

    - path: "src/domains/partnerships/hooks/usePartnershipData.ts"
      provides: "Data fetching for dashboard"
      min_lines: 20

  key_links:
    - from: "src/domains/partnerships/pages/PartnerDashboard.tsx"
      to: "/infrastructure/integrations/partnerships"
      via: "usePartnershipData hook"
```

### BMAD Quality Gates (Phase Level)

```yaml
gates:
  elicitation:
    - product-brief-exists
    - market-analysis-complete
    - stakeholder-alignment

  analysis:
    - prd-exists
    - user-stories-defined
    - acceptance-criteria-established

  solutioning:
    - architecture-spec-exists
    - tech-stack-selected
    - apis-designed

  implementation:
    - feature-complete
    - tests-passing
    - documentation-complete
```

### Combined Verification Process

```bash
# 1. Task-level verification (GSD)
/gsd:verify-work
# Checks: must_haves, artifacts, key_links

# 2. Phase-level verification (BMAD)
/bmad:verify-phase
# Checks: phase gates, artifacts, approval

# 3. Final verification (Combined)
/combined:verify
# Runs both GSD and BMAD verification
```

---

## Real Example: Partnership Referral System

### Using BMAD + GSD Together

**Week 1: Elicitation (BMAD) + Deep Questioning (GSD)**

```
User: "I need a partnership referral system"

Session 1 (GSD - Deep Questioning):
- What problem does this solve?
- Who are the users?
- What are the success metrics?
- Context: 15% (PEAK quality)

Session 2 (BMAD - Mary):
- Market research
- Competitive analysis
- Output: product-brief.md
- Commit: "feat(01-01): create product brief"

Session 3 (GSD - Pre-Planning):
- Review product brief
- Identify gaps
- Context: 25% (GOOD quality)
```

**Week 2-3: Analysis (BMAD) + Pre-Planning (GSD)**

```
Session 4 (BMAD - Mary + John):
- Define user personas
- Create user stories
- Write acceptance criteria
- Context: 45% (GOOD quality)

Session 5 (GSD - Planning):
- Split into atomic tasks
- Plan waves
- Context: 50% (target)

Commits:
- "feat(02-01): define user personas"
- "feat(02-02): create user stories"
- "feat(02-03): write acceptance criteria"
- "docs(02-00): complete analysis phase"
```

**Week 4-5: Solutioning (BMAD) + Research (GSD)**

```
Session 6 (GSD - Research - Wave 1):
- Task 1: Research database options (PostgreSQL vs MongoDB vs MySQL)
- Task 2: Research API frameworks (Express vs Fastify vs NestJS)
- Task 3: Research frontend state management (Context vs Zustand vs Redux)
- Context: Each task 30% (PEAK quality)

Session 7 (BMAD - Winston):
- Design system architecture
- Select tech stack
- Design APIs
- Output: architecture-spec.md

Commits:
- "arch(03-01-01): evaluate database options"
- "arch(03-01-02): evaluate API frameworks"
- "arch(03-01-03): evaluate state management"
- "arch(03-02): design system architecture"
- "docs(03-00): complete solutioning phase"
```

**Week 6-8: Implementation (BMAD) + Wave-Based Execution (GSD)**

```
Wave 1 (Parallel - 3 tasks):
- Task 04-01-01: Create database schema
- Task 04-01-02: Build API endpoints
- Task 04-01-03: Implement UI components
- Context per task: 30% (PEAK quality)
- Commits: Per-task atomic commits

Wave 2 (After Wave 1 - 2 tasks):
- Task 04-02-01: Integrate frontend with backend
- Task 04-02-02: Add error handling
- Context per task: 30% (PEAK quality)
- Commits: Per-task atomic commits

Wave 3 (After Wave 2 - 2 tasks):
- Task 04-03-01: Write tests
- Task 04-03-02: Documentation
- Context per task: 30% (PEAK quality)
- Commits: Per-task atomic commits

Phase Complete:
- "docs(04-00): complete implementation phase

Phase 4 (Implementation) - COMPLETE

Tasks: ✅ All 7 tasks complete
Tests: ✅ Passing (95% coverage)
Documentation: ✅ Complete
Verification: ✅ Goal-backward + Quality gates passed

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Week 9: Verification (Combined)**

```
Session 8 (GSD - Verify Work):
- /gsd:verify-work
- Checks: must_haves, artifacts, key_links
- Result: ✅ All artifacts verified

Session 9 (BMAD - Verify Phase):
- /bmad:verify-phase
- Checks: All phase gates passed
- Result: ✅ All gates passed

Session 10 (Combined - Final Verification):
- /combined:verify
- Result: ✅ Ready for production
```

---

## When to Use BMAD vs GSD vs Combined

### Use GSD Alone When:
- Single developer
- Simple task (1-2 files)
- Quick fix or minor feature
- Solo project
- Speed is priority

### Use BMAD Alone When:
- Team of 2+ developers
- Complex, long-term project
- Need architecture discipline
- Brownfield integration
- Quality is priority

### Use Combined When:
- Team of 2+ developers
- Complex project with tight deadlines
- Need both architecture discipline AND execution efficiency
- Brownfield integration with complex requirements
- Both quality AND speed are priorities

---

## Quick Reference

### BMAD Concepts
- 4-phase methodology
- 12+ specialized agents
- 50+ workflows
- Domain-driven architecture
- Artifact-based communication

### GSD Concepts
- Context engineering (quality degradation curve)
- Per-task atomic commits
- Goal-backward verification
- Wave-based parallelization
- Solo dev optimization

### Combined Power
- BMAD: Structure + Methodology + Specialization
- GSD: Context + Execution + Verification
- Result: Complete system for AI-driven development

---

## Conclusion

**BMAD + GSD = The Complete Methodology**

BMAD provides the "what" and "when" (methodology, phases, agents)
GSD provides the "how" (execution, context, verification)

Together, they create a system that is:
- **Structured** (BMAD methodology)
- **Efficient** (GSD context engineering)
- **Specialized** (BMAD domain experts)
- **Verified** (GSD goal-backward)
- **Scalable** (BMAD architecture)
- **Fast** (GSD atomic operations)

**This is the future of AI-driven development.**

---

*BMAD provides the discipline. GSD provides the speed. Together, they provide excellence.*
