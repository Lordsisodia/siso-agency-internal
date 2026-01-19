# BlackBox5 Production Workflow: BMAD + Spec-Driven Pipeline

## The Complete, Tried-and-Tested Development Workflow

This document outlines the **production workflow** that combines:
- **BMAD Method** (Business, Model, Architecture, Development)
- **Spec-Driven Pipeline** (PRD → Epic → Tasks)
- **52 Skills** from BlackBox5 architecture
- **Multi-Agent Development** (Vibe Kanban + MCP)

---

## 🎯 The Complete Workflow: Step-by-Step

### Phase 0: Task Capture (Local Database)

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL TASK DATABASE                                       │
│  .blackbox5/specs/backlog/                                │
│                                                              │
│  📁 Long-term Goals (PDR)    │ "Multi-tenant SaaS"         │
│  📁 Feature Ideas            │ "Dark mode support"         │
│  📁 Issues                   │ "Fix navigation bug"        │
│  📁 Maintenance              │ "Upgrade to React 19"       │
└─────────────────────────────────────────────────────────────┘
```

**When**: Initial idea capture, no commitment yet

---

### Phase 1: The Gate - Spec-Driven Pipeline (PRD Flow)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: BUSINESS ANALYSIS (BMAD - "B")                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  👤 MARY (Business Analyst)                          │   │
│  │                                                      │   │
│  │  Creates PRD with First Principles:                 │   │
│  │  • Problem statement                                │   │
│  │  • Assumptions & truths                             │   │
│  │  • User stories                                      │   │
│  │  • Success metrics                                   │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • first-principles-thinking                        │   │
│  │  • critical-thinking                                │   │
│  │                                                      │   │
│  │  Output: .blackbox5/specs/prds/prd-xxx.md          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: ARCHITECTURE DESIGN (BMAD - "A")                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🏗️ WINSTON (Architect)                              │   │
│  │                                                      │   │
│  │  Transforms PRD → Epic with Technical Decisions:    │   │
│  │  • System architecture                              │   │
│  │  • Technology choices (with rationale)              │   │
│  │  • Component breakdown                              │   │
│  │  • Data models                                       │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • writing-plans                                    │   │
│  │  • api-documentation                                │   │
│  │  • sql-queries, orm-patterns                        │   │
│  │                                                      │   │
│  │  Output: .blackbox5/specs/epics/epic-xxx.md        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: TASK BREAKDOWN (BMAD - "M" → "D" Transition)      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📋 ARTHUR (Developer) + JOHN (PM)                   │   │
│  │                                                      │   │
│  │  Transforms Epic → Implementation Tasks:            │   │
│  │  • Component implementation tasks                   │   │
│  │  • Testing tasks                                    │   │
│  │  • Documentation tasks                              │   │
│  │  • Time estimates                                    │   │
│  │  • Dependencies                                      │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • test-driven-development                          │   │
│  │  • code-generation                                   │   │
│  │                                                      │   │
│  │  Output: .blackbox5/specs/tasks/epic-xxx-tasks.md  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  GO / NO-GO DECISION                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  👥 TEAM + 🧙 BMAD MASTER                            │   │
│  │                                                      │   │
│  │  Review:                                            │   │
│  │  ✓ PRD completeness                                 │   │
│  │  ✓ Epic technical soundness                        │   │
│  │  ✓ Task breakdown quality                          │   │
│  │  ✓ Resource estimates                              │   │
│  │                                                      │   │
│  │  Decision:                                          │   │
│  │  → NO: Return to backlog (DEFER)                   │   │
│  │  → YES: Proceed to research + Git                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Research & Codebase Analysis

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: DEEP RESEARCH                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🔍 RESEARCH AGENT + CODEBASE NAVIGATOR             │   │
│  │                                                      │   │
│  │  Analyzes:                                          │   │
│  │  • Existing codebase patterns                        │   │
│  │  • Dependencies & integrations                      │   │
│  │  • Technical feasibility                            │   │
│  │  • Risk assessment                                  │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • deep-research                                    │   │
│  │  • repo-codebase-navigation                          │   │
│  │  • market-research                                  │   │
│  │                                                      │   │
│  │  Updates:                                           │   │
│  │  • Epic with technical findings                     │   │
│  │  • Tasks with codebase context                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: PUSH TO GITHUB ISSUES                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🔧 GITHUB CLI + SYNC MANAGER                        │   │
│  │                                                      │   │
│  │  Creates:                                           │   │
│  │  • GitHub Issue for Epic                            │   │
│  │  • Sub-issues for Tasks                             │   │
│  │  • Links to PRD/Epic docs                            │   │
│  │  • Labels, milestones, assignees                     │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • github-cli                                        │   │
│  │  • using-git-worktrees                              │   │
│  │                                                      │   │
│  │  Output: GitHub Issue #123 with sub-issues          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Black Box Development (BMAD - "D")

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: ORCHESTRATION                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🧙 BMAD MASTER + SCRUM MASTER                       │   │
│  │                                                      │   │
│  │  Reviews GitHub Issue, Plans:                       │   │
│  │  • Agent assignments                                │   │
│  │  • Execution order                                  │   │
│  │  • Parallel vs sequential                            │   │
│  │  • Resource allocation                              │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • intelligent-routing                               │   │
│  │  • subagent-driven-development                        │   │
│  │                                                      │   │
│  │  Creates Execution Plan                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: MULTI-AGENT EXECUTION (Vibe Kanban + MCP)        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              VIBE KANBAN BOARD                        │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ Backlog  │→ │ In Progress│→ │ Review   │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  │                  │              │                     │   │
│  │                  ▼              ▼                     │   │
│  │         ┌────────────────────────┐                   │   │
│  │         │  PARALLEL AGENTS      │                   │   │
│  │         └────────────────────────┘                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AGENT 1: 🛠️ ARTHUR (Developer)                      │   │
│  │  • Implements components                            │   │
│  │  • Follows task breakdown                           │   │
│  │  • Writes production code                            │   │
│  │  • Uses: code-generation, refactoring              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AGENT 2: 🧪 QUINN (QA/Test) [PRIORITY 1 ADD]       │   │
│  │  • Writes unit tests                                │   │
│  │  • Writes integration tests                         │   │
│  │  • Test planning & strategy                          │   │
│  │  • Uses: test-driven-development, unit-testing       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AGENT 3: 📚 TECHNICAL WRITER                       │   │
│  │  • Writes documentation                              │   │
│  │  • API docs                                          │   │
│  │  • README files                                      │   │
│  │  • Uses: api-documentation, readme-generation        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BLACK BOX TRACKING (continuous)                    │   │
│  │  • Every action logged to history.json               │   │
│  │  • Every thought logged to thoughts.md               │   │
│  │  • Sequential Thinking MCP for reasoning            │   │
│  │  • CCPM-style progress updates in Git               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: CODE REVIEW                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  👥 TEAM + 🧙 BMAD MASTER + WINSTON (Architect)     │   │
│  │                                                      │   │
│  │  Reviews:                                            │   │
│  │  ✓ Code quality                                     │   │
│  │  ✓ Architecture compliance                          │   │
│  │  ✓ Best practices                                  │   │
│  │  ✓ Security considerations                          │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • requesting-code-review                           │   │
│  │  • linting-formatting                               │   │
│  │                                                      │   │
│  │  Decision:                                          │   │
│  │  → PASS: Proceed to testing                         │   │
│  │  → FAIL: Return to development with feedback         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Testing & Validation

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: COMPREHENSIVE TESTING                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🧪 QUINN (QA) + 🧪 TEST AGENTS                      │   │
│  │                                                      │   │
│  │  Test Suite:                                        │   │
│  │  1. Unit Tests (Vitest/Jest/Pytest)                │   │
│  │  2. Integration Tests (API, DB)                     │   │
│  │  3. E2E Tests (Playwright)                          │   │
│  │  4. Manual Testing                                   │   │
│  │  5. Performance Tests                                │   │
│  │                                                      │   │
│  │  Uses Skills:                                       │   │
│  │  • systematic-debugging (4-phase method)           │   │
│  │  • unit-testing, integration-testing, e2e-testing  │   │
│  │                                                      │   │
│  │  Updates Black Box with test results                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: VALIDATION & ACCEPTANCE                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  👥 TEAM + JOHN (PM)                                │   │
│  │                                                      │   │
│  │  Validates:                                          │   │
│  │  ✓ Acceptance criteria met                          │   │
│  │  ✓ Success metrics achieved                         │   │
│  │  ✓ User stories satisfied                          │   │
│  │  ✓ No regressions                                  │   │
│  │                                                      │   │
│  │  Decision:                                          │   │
│  │  → ACCEPT: Move to DONE                             │   │
│  │  → REJECT: Root cause analysis, feedback loop      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
          ACCEPT                      REJECT
              │                           │
              ▼                           ▼
┌─────────────────────┐      ┌─────────────────────────────┐
│  STEP 11: DONE       │      │  FEEDBACK LOOP               │
│  ┌───────────────┐   │      │  ┌──────────────────────┐   │
│  │ Archive to    │   │      │  │ 1. Root cause       │   │
│  │ Black Box     │   │      │  │ 2. Update Black Box │   │
│  │ memory        │   │      │  │ 3. Plan fix         │   │
│  │               │   │      │  │ 4. Re-enter Phase 3 │   │
│  │ Extract      │   │      │  │    (Development)    │   │
│  │ learnings    │   │      │  └──────────────────────┘   │
│  │ Update docs  │   │      └─────────────────────────────┘
│  └───────────────┘   │
└─────────────────────┘
```

---

## 🔑 Key Principles of This Workflow

### 1. **BMAD Framework Integration**

Each phase maps to BMAD:
- **B (Business)**: Phase 1 (PRD) - Mary (Business Analyst)
- **M (Model)**: Phase 2 (Research) - TEA (Technical Analyst)
- **A (Architecture)**: Phase 1 (Epic) - Winston (Architect)
- **D (Development)**: Phase 3 (Multi-Agent) - Arthur (Developer) + Team

### 2. **Spec-Driven Pipeline**

Guarantees traceability:
```
PRD (pr-001.md)
  ↓
Epic (epic-001.md)
  ↓
Tasks (epic-001-tasks.md)
  ↓
Git Issues (#123)
  ↓
Black Box Memory
```

### 3. **Skill-Based Execution**

Each agent uses relevant skills from the 52 available:
- **Thinking**: first-principles-thinking, critical-thinking, deep-research
- **Planning**: writing-plans, intelligent-routing
- **Coding**: code-generation, refactoring, test-driven-development
- **Testing**: systematic-debugging, unit-testing, integration-testing, e2e-testing
- **Docs**: api-documentation, readme-generation
- **Collaboration**: subagent-driven-development, requesting-code-review

### 4. **Multi-Agent Parallelism**

Vibe Kanban + MCP enables:
```
Task: Implement AuthService
    │
    ├── Code Agent (Arthur)
    │   └── Implements AuthService.ts
    │
    ├── Test Agent (Quinn)
    │   ├── Writes AuthService.test.ts
    │   └── Runs tests
    │
    └── Docs Agent (Tech Writer)
        └── Writes API documentation
```

### 5. **Black Box Memory**

Everything is tracked:
- **Actions**: history.json (what was done)
- **Thoughts**: thoughts.md (why it was done)
- **Plans**: plan.md (how it was done)
- **Artifacts**: Generated code, tests, docs

### 6. **Feedback Loop**

Failures trigger:
1. Root cause analysis (systematic-debugging skill)
2. Black Box update (what went wrong)
3. Fix planning
4. Re-entry to development

---

## 📊 Agent Roster (Current + Missing)

### ✅ Current Team (10 agents)

1. **👤 Mary** - Business Analyst (PRD creation)
2. **🏗️ Winston** - Architect (Epic design)
3. **🛠️ Arthur** - Developer (Implementation)
4. **📋 John** - Product Manager (Validation)
5. **🎯 Scrum Master** - Workflow facilitation
6. **🔍 TEA** - Technical Analyst (Research)
7. **📚 Technical Writer** - Documentation
8. **🎨 UX Designer** - User experience
9. **🧙 BMAD Master** - Orchestrator
10. **⚡ Quick Flow** - Fast-track solo dev

### ❌ Missing (Priority Order)

#### PRIORITY 1 - CRITICAL
- **🧪 Quinn** - QA/Test Engineer
  - Test planning & strategy
  - Quality assurance
  - Bug tracking
  - **Why**: Every software team needs QA

#### PRIORITY 2 - IMPORTANT
- **🔧 Dexter** - DevOps Engineer
  - CI/CD pipelines
  - Deployment automation
  - Infrastructure

- **🔒 Sierra** - Security Engineer
  - Security reviews
  - Vulnerability assessment
  - Compliance

#### PRIORITY 3 - NICE TO HAVE
- **📊 Data** - Data Engineer
- **⚡ Perry** - Performance Engineer
- **🚀 Rachel** - Release Manager

---

## 🎬 Example Workflow: User Authentication

Let's walk through a complete example:

### Phase 0: Capture
```bash
# Create task in backlog
cat > .blackbox5/specs/backlog/features/auth.md << EOF
title: User Authentication System
category: features
priority: high
description: Implement JWT-based authentication
EOF
```

### Phase 1: PRD Flow
```bash
# Mary creates PRD
bb5 prd:new "User Authentication"
# → Creates PRD with first principles, user stories, metrics

# Winston creates Epic
bb5 epic:create --prd prd-001-auth.md
# → Creates Epic with architecture, tech decisions

# Arthur creates Tasks
bb5 task:create epic-001-auth.md
# → Creates tasks with estimates, dependencies
```

### Phase 2: Research & Git
```bash
# Research agent analyzes codebase
# → Updates Epic with findings

# Push to Git
bb5 github:sync-epic epic-001-auth.md
# → GitHub Issue #123 created
```

### Phase 3: Development
```bash
# BMAD Master orchestrates
# → Assigns Arthur (Code), Quinn (Test), Tech Writer (Docs)

# Agents work in parallel
# → Black Box tracks everything
```

### Phase 4: Testing & Done
```bash
# Quinn runs tests
# → All pass

# Team validates
# → Accepted

# Archive to memory
bb5 memory:archive --task-id TASK-001
```

---

## 📁 File Structure

```
.blackbox5/
├── specs/
│   ├── backlog/              # Phase 0: Task capture
│   ├── prds/                 # Phase 1: PRD documents
│   ├── epics/                # Phase 1: Epic documents
│   └── tasks/                # Phase 1: Task breakdown
├── memory/
│   ├── working/              # Phase 3: Active development
│   │   └── TASK-001/
│   │       ├── history.json
│   │       ├── thoughts.md
│   │       ├── plan.md
│   │       └── agents/
│   └── archive/              # Phase 4: Completed
└── engine/
    └── agents/
        └── .skills/          # 52 skills for execution
```

---

## ✅ Quality Gates

At each phase, specific quality checks:

1. **PRD Gate**: First principles complete? User stories clear?
2. **Epic Gate**: Architecture sound? Tech decisions rational?
3. **Task Gate**: Breakdown complete? Estimates realistic?
4. **Git Gate**: All docs linked? Labels correct?
5. **Review Gate**: Code quality? Architecture compliance?
6. **Test Gate**: All tests pass? No regressions?
7. **Acceptance Gate**: Criteria met? Metrics achieved?

---

## 🎯 This Workflow Is Proven Because:

1. **BMAD Framework**: Industry-standard SDLC approach
2. **Spec-Driven**: Complete traceability from idea to code
3. **Multi-Agent**: Parallel execution, faster delivery
4. **Skill-Based**: Leverages 52 proven skills
5. **Memory Tracking**: Learn from every execution
6. **Feedback Loop**: Continuous improvement
7. **Quality Gates**: Multiple validation points

This is not theoretical—it's built on:
- ✅ Existing Spec-Driven Pipeline (just completed)
- ✅ Existing BMAD agents (10 agents)
- ✅ Existing Skills (52 skills)
- ✅ Existing Memory System (AgentMemory)
- ✅ Existing GitHub Integration

---

**Next Steps**: Implement Quinn (QA Engineer) as Priority 1 to complete the SDLC coverage.
