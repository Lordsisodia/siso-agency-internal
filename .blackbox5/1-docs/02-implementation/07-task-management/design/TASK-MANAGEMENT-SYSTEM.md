# BlackBox5 Task Management System

## Overview

The BlackBox5 Task Management System is a **dual-track workflow** that manages tasks from initial ideation through completion, with intelligent gating and feedback loops.

## Visual Flowchart

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        TRACK 1: LOCAL TASK MANAGEMENT                          ║
║                      (Pre-PRD / Pre-Commitment Phase)                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOCAL TASK DATABASES                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Long-term Goals │  │  Feature Ideas   │  │     Issues       │       │
│  │  (PDR - Product  │  │  (Concepts to    │  │  (Bug Reports,   │       │
│  │   Direction &    │  │   Implement)     │  │   Problems)      │       │
│  │   Requirements)  │  │                  │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│  ┌──────────────────┐                                                        │
│  │  Maintenance     │                                                        │
│  │  (Ongoing Tasks:  │                                                        │
│  │   Refactoring,   │                                                        │
│  │   Cleanup,       │                                                        │
│  │   Architecture)  │                                                        │
│  └──────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ User/Team selects task
                                      ▼
                              ┌───────────────┐
                              │  SELECT TASK  │
                              └───────────────┘
                                      │
                                      ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                              THE GATE: PRD FLOW                                ║
║                    (Decision Point: Commit or Defer)                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

                        ┌─────────────────────────────┐
                        │     PRD FLOW PROCESS         │
                        │  ┌────────────────────────┐ │
                        │  │ 1. Create PRD          │ │
                        │  │    - First principles  │ │
                        │  │    - Requirements      │ │
                        │  │    - Success metrics   │ │
                        │  └────────────────────────┘ │
                        │  ┌────────────────────────┐ │
                        │  │ 2. Generate Epic      │ │
                        │  │    - Architecture     │ │
                        │  │    - Tech decisions   │ │
                        │  │    - Components       │ │
                        │  └────────────────────────┘ │
                        │  ┌────────────────────────┐ │
                        │  │ 3. Generate Tasks     │ │
                        │  │    - Breakdown        │ │
                        │  │    - Estimates        │ │
                        │  │    - Dependencies     │ │
                        │  └────────────────────────┘ │
                        └─────────────────────────────┘
                                      │
                        ┌─────────────────────────────┐
                        │   GO / NO-GO DECISION        │
                        │   Commit to full flow?       │
                        └─────────────────────────────┘
                              │              │
                           NO              YES
                              │              │
                              ▼              ▼
                      ┌─────────────┐  ┌──────────────────────┐
                      │  HOLD/      │  │  ANALYZE CODEBASE    │
                      │  DEFER      │  │  + CONDUCT RESEARCH  │
                      │  (Return to │  │                      │
                      │   database) │  │  • Codebase analysis │
                      └─────────────┘  │  • Framework steps   │
                                        │  • Investigation     │
                                        │  • Feasibility      │
                                        └──────────────────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │  Push to Git     │
                                        │  Issues          │
                                        └──────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                    TRACK 2: BLACK BOX DEVELOPMENT PHASE                       ║
║                    (Post-Commitment / Git-Issues-Based)                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

                          ┌───────────────────────────┐
                          │    AGENT REVIEWS ISSUE     │
                          │  • Understands scope      │
                          │  • Identifies key areas    │
                          │  • Plans approach         │
                          └───────────────────────────┘
                                    │
                                    ▼
          ┌──────────────────────────────────────────────────┐
          │     VIBE KANBAN + MCP MULTI-AGENT SYSTEM         │
          │                                                      │
          │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
          │  │  Agent 1   │  │  Agent 2   │  │  Agent 3   │  │
          │  │  (Code)    │  │  (Tests)   │  │  (Docs)    │  │
          │  └────────────┘  └────────────┘  └────────────┘  │
          │       │               │               │           │
          │       └───────────────┴───────────────┘           │
          │                   │                               │
          │           Multi-Agent Collaboration              │
          └──────────────────────────────────────────────────┘
                                    │
                                    ▼
          ┌──────────────────────────────────────────────────┐
          │         BLACK BOX TRACKING SYSTEM                │
          │  ┌────────────────────────────────────────────┐ │
          │  │  HISTORY                                  │ │
          │  │  • All actions taken                       │ │
          │  │  • Timestamps                              │ │
          │  │  • Agent assignments                      │ │
          │  └────────────────────────────────────────────┘ │
          │  ┌────────────────────────────────────────────┐ │
          │  │  THOUGHT PROCESSES                         │ │
          │  │  • Reasoning chains                        │ │
          │  │  • Decision trees                          │ │
          │  │  • Alternative approaches                  │ │
          │  └────────────────────────────────────────────┘ │
          │  ┌────────────────────────────────────────────┐ │
          │  │  PLANS                                    │ │
          │  │  • Implementation strategies               │ │
          │  │  • Architecture decisions                  │ │
          │  │  • Step-by-step execution                  │ │
          │  └────────────────────────────────────────────┘ │
          └──────────────────────────────────────────────────┘
                                    │
                                    ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                          TESTING & VALIDATION PHASE                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

                        ┌──────────────────────┐
                        │   REVIEW & TEST       │
                        │  ┌────────────────┐   │
                        │  │ Code Review    │   │
                        │  │ Unit Tests     │   │
                        │  │ Integration    │   │
                        │  │ E2E Tests      │   │
                        │  │ Manual Testing │   │
                        │  └────────────────┘   │
                        └──────────────────────┘
                              │           │
                        ┌─────┴─────┐   ┌─┴──────┐
                        │   WORKS   │   │ FAILS  │
                        │           │   │        │
                        ▼           ▼   ▼        ▼
                   ┌─────────┐  ┌────────────────────────────┐
                   │  DONE   │  │  FEEDBACK LOOP             │
                   │         │  │  ┌──────────────────────┐  │
                   │ Archive │  │  │ Capture what failed   │  │
                   │ to      │  │  │ Root cause analysis  │  │
                   │ Memory  │  │  │ Update Black Box     │  │
                   └─────────┘  │  │ Re-enter Black Box   │  │
                                │  │ Development Phase   │  │
                                │  └──────────────────────┘  │
                                └────────────────────────────┘
```

## Phase Descriptions

### Phase 1: Local Task Management (Track 1)

**Purpose**: Capture and organize ideas before committing resources.

**Storage Location**: `.blackbox5/memory/tasks/` or `.blackbox5/specs/backlog/`

**Categories**:

1. **Long-term Goals (PDR)**
   - Product Direction & Requirements
   - Strategic objectives
   - Vision statements
   - Example: "Implement user authentication system"

2. **Feature Ideas**
   - Concepts to implement
   - Enhancement opportunities
   - User-facing improvements
   - Example: "Add dark mode support"

3. **Issues**
   - Bug reports
   - Specific problems
   - User-reported errors
   - Example: "Fix navigation bug on mobile"

4. **Maintenance**
   - Ongoing architectural tasks
   - Code cleanup
   - Refactoring
   - Performance optimization
   - Example: "Upgrade to React 19"

**Data Structure**:
```yaml
task_id: TASK-XXX
title: Task title
category: [goals|features|issues|maintenance]
status: [backlog|selected|in_prd|deferred|archived]
priority: [critical|high|medium|low]
created_at: timestamp
description: Detailed description
```

### Phase 2: The Gate - PRD Flow

**Purpose**: Decide whether to commit full development resources to a task.

**Trigger**: User/Team selects a task from Local Task Database.

**Process**:

1. **Create PRD** (`bb5 prd:new`)
   - First principles analysis
   - Requirements gathering
   - Success metrics
   - User stories

2. **Generate Epic** (`bb5 epic:create`)
   - Architecture design
   - Technical decisions with rationale
   - Component breakdown

3. **Generate Tasks** (`bb5 task:create`)
   - Implementation tasks
   - Estimates and dependencies
   - Acceptance criteria

**Decision Point**: Go / No-Go

- **NO**: Task returns to local database (marked as deferred)
- **YES**: Proceed to codebase analysis + research

**Output**: PRD, Epic, and Task documents saved to `.blackbox5/specs/`

### Phase 3: Analysis & Research

**Purpose**: Deep understanding before development.

**Activities**:
- Codebase analysis (understand existing patterns)
- Research (follow established framework steps)
- Feasibility assessment
- Risk identification

**Agents Involved**:
- Research Agent
- Codebase Navigator Agent
- Framework Analysis Agent

**Output**: Enhanced understanding, updated task documents

### Phase 4: Push to Git Issues

**Purpose**: Move from local to shared workflow.

**Command**: `bb5 github:sync-epic` or `bb5 task:sync`

**Result**:
- Epic created as GitHub Issue
- Tasks created as sub-issues
- Links to PRD and Epic documents
- Labels, milestones, assignees

**Transition**: Task now exists in BOTH Git Issues AND Black Box system

### Phase 5: Black Box Development Phase (Track 2)

**Purpose**: Execute development with full traceability.

**Sub-phases**:

#### 5.1 Agent Reviews Issue
- Agent assigned to GitHub Issue
- Analyzes requirements
- Plans approach
- Identifies dependencies

#### 5.2 Vibe Kanban + MCP Multi-Agent System
- **Vibe Kanban**: Visual workflow management
- **MCP Agents**: Multiple specialized agents work in parallel

**Example Agent Orchestration**:
```
┌─────────────────────────────────────────────┐
│  GitHub Issue: Implement AuthService        │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Orchestrator Agent Plans Approach          │
│  • Breaks down into sub-tasks               │
│  • Assigns to specialist agents             │
└─────────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ Code       │  │ Test       │  │ Docs       │  │ Review     │
│ Agent      │  │ Agent      │  │ Agent      │  │ Agent     │
│            │  │            │  │            │  │            │
│ Implement  │  │ Write      │  │ Create     │  │ Validate   │
│ AuthService│  │ tests      │  │ docs       │  │ PR         │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

#### 5.3 Black Box Tracking System

**What Gets Tracked**:

1. **History**
   - Every action taken
   - Timestamps
   - Agent assignments
   - File modifications

2. **Thought Processes**
   - Reasoning chains (Sequential Thinking MCP)
   - Decision trees
   - Alternative approaches considered
   - Trade-off analysis

3. **Plans**
   - Implementation strategies
   - Architecture decisions
   - Step-by-step execution plans
   - Rollback plans

**Storage**:
```
.blackbox5/memory/working/
├── {task-id}/
│   ├── history.json          # All actions
│   ├── thoughts.md           # Thought processes
│   ├── plan.md               # Implementation plan
│   ├── agents/               # Per-agent logs
│   │   ├── code-agent/
│   │   ├── test-agent/
│   │   └── docs-agent/
│   └── artifacts/            # Generated artifacts
```

### Phase 6: Testing & Validation

**Purpose**: Ensure quality and correctness.

**Testing Types**:
- Code review (human or agent)
- Unit tests (automated)
- Integration tests
- E2E tests
- Manual testing

**Outcomes**:

#### Path A: Success → DONE
- Task marked as complete in Git
- Black Box memory archived
- Learnings extracted
- Documentation updated

#### Path B: Failure → FEEDBACK LOOP
- Root cause analysis
- Black Box updated with failure data
- Task re-enters Black Box Development Phase
- New iteration planned

## State Transitions

```
┌─────────────┐
│  BACKLOG    │  Local task database
└──────┬──────┘
       │ Selected
       ▼
┌─────────────┐
│  SELECTED   │  Chosen for PRD flow
└──────┬──────┘
       │ PRD created
       ▼
┌─────────────┐
│  IN_PRD     │  PRD, Epic, Tasks generated
└──────┬──────┘
       │
       ├─────────┐
       │         │
      NO        YES Decision
       │         │
       ▼         ▼
┌─────────────┐ ┌──────────────┐
│  DEFERRED   │ │  APPROVED    │
└──────┬──────┘ └──────┬───────┘
       │               │ Research done
       │               ▼
       │         ┌──────────────┐
       │         │  IN_GIT      │  Pushed to GitHub
       │         └──────┬───────┘
       │                │ Agent assigned
       │                ▼
       │         ┌──────────────┐
       │         │  IN_DEVELOP  │  Black Box active
       │         └──────┬───────┘
       │                │ Development done
       │                ▼
       │         ┌──────────────┐
       │         │  IN_TEST     │  Testing phase
       │         └──────┬───────┘
       │                │
       │         ┌──────┴──────┐
       │         │             │
       │      FAIL          SUCCESS
       │         │             │
       │         ▼             ▼
       │    ┌─────────┐  ┌─────────┐
       │    │IN_DEVELOP│  │  DONE   │
       │    │(loop)    │  │         │
       │    └─────────┘  └─────────┘
       │
       └───> (Can be re-selected later)
```

## Data Flow

### Input (Task Creation)
```
User/Team Idea
    ↓
Local Task Database Entry
    ├── task_id
    ├── title
    ├── category
    ├── description
    ├── priority
    └── status = backlog
```

### PRD Flow (Task Elaboration)
```
Selected Task
    ↓
PRD Document (.blackbox5/specs/prds/prd-xxx.md)
    ├── First principles analysis
    ├── Requirements
    ├── Success metrics
    └── User stories
    ↓
Epic Document (.blackbox5/specs/epics/epic-xxx.md)
    ├── Architecture
    ├── Technical decisions
    ├── Components
    └── Acceptance criteria
    ↓
Task Document (.blackbox5/specs/tasks/epic-xxx-tasks.md)
    ├── Individual tasks
    ├── Estimates
    ├── Dependencies
    └── Traceability (PRD → Epic → Tasks)
```

### Development (Execution)
```
Git Issue Created
    ↓
Black Box Memory Initiated
    ├── .blackbox5/memory/working/{task-id}/
    │   ├── history.json
    │   ├── thoughts.md
    │   ├── plan.md
    │   └── agents/
    ↓
Multi-Agent Execution (Vibe Kanban + MCP)
    ├── Code Agent implements
    ├── Test Agent writes tests
    ├── Docs Agent documents
    └── All thought processes tracked
    ↓
Black Box Memory Updated (continuous)
    ├── Every action logged
    ├── Every thought recorded
    └── Every decision documented
```

### Output (Completion or Feedback)
```
Testing Phase
    ├── SUCCESS → Task archived to memory
    │   └── .blackbox5/memory/archive/{task-id}/
    └── FAILURE → Feedback loop
        ├── Root cause analysis
        ├── Black Box updated
        └── Task re-enters development
```

## Agent Responsibilities

### 1. PRD Agent
**When**: Task selected from local database
**Responsibility**:
- Create PRD with first principles analysis
- Gather requirements
- Define success metrics
- Write user stories

### 2. Epic Agent
**When**: PRD approved
**Responsibility**:
- Design architecture
- Make technical decisions
- Break down into components
- Define acceptance criteria

### 3. Task Agent
**When**: Epic approved
**Responsibility**:
- Generate implementation tasks
- Create estimates
- Identify dependencies
- Link to PRD/Epic

### 4. Research Agent
**When**: Task approved for development
**Responsibility**:
- Analyze codebase
- Follow framework steps
- Conduct feasibility study
- Identify risks

### 5. Orchestrator Agent
**When**: Task in Git Issues
**Responsibility**:
- Review GitHub Issue
- Plan approach
- Assign to specialist agents
- Coordinate multi-agent work

### 6. Specialist Agents (Vibe Kanban + MCP)
**When**: Development phase
**Types**:
- **Code Agent**: Implementation
- **Test Agent**: Testing
- **Docs Agent**: Documentation
- **Review Agent**: Code review

**Responsibility**:
- Execute assigned work
- Log all thoughts and decisions
- Update Black Box memory
- Report progress

### 7. Testing Agent
**When**: Development complete
**Responsibility**:
- Run tests
- Validate functionality
- Report results
- Trigger feedback loop if failed

## Storage Schema

### Local Task Database
```
.blackbox5/specs/backlog/
├── goals/
│   ├── goal-001-product-vision.md
│   └── goal-002-market-expansion.md
├── features/
│   ├── feature-001-dark-mode.md
│   └── feature-002-api-cache.md
├── issues/
│   ├── issue-001-nav-bug.md
│   └── issue-002-memory-leak.md
└── maintenance/
    ├── maint-001-upgrade-react.md
    └── maint-002-refactor-auth.md
```

### PRD Documents
```
.blackbox5/specs/prds/
├── prd-001-auth-system.md
├── prd-002-dark-mode.md
└── prd-003-api-cache.md
```

### Epic Documents
```
.blackbox5/specs/epics/
├── epic-001-auth-system.md
├── epic-002-dark-mode.md
└── epic-003-api-cache.md
```

### Task Documents
```
.blackbox5/specs/tasks/
├── epic-001-auth-system-tasks.md
├── epic-002-dark-mode-tasks.md
└── epic-003-api-cache-tasks.md
```

### Black Box Working Memory
```
.blackbox5/memory/working/
├── {task-id}/
│   ├── history.json          # Action log
│   ├── thoughts.md           # Thought processes
│   ├── plan.md               # Implementation plan
│   ├── agents/               # Per-agent logs
│   │   ├── orchestrator/
│   │   ├── code-agent/
│   │   ├── test-agent/
│   │   └── docs-agent/
│   └── artifacts/            # Generated code, tests, docs
```

### Black Box Archive Memory
```
.blackbox5/memory/archive/
├── {task-id}/
│   ├── complete-history.json
│   ├── final-thoughts.md
│   ├── execution-summary.md
│   ├── lessons-learned.md
│   └── artifacts/            # Final code, tests, docs
```

## Integration Points

### 1. Git Integration
- **Sync to Git**: `bb5 github:sync-epic` / `bb5 task:sync`
- **Update Progress**: `bb5 github:update`
- **Close Issues**: `bb5 github:close`
- **Bidirectional sync** between Black Box and Git Issues

### 2. Vibe Kanban Integration
- Visual workflow management
- Agent assignment
- Progress tracking
- Bottleneck identification

### 3. MCP Integration
- Multi-agent orchestration
- Specialized agent deployment
- Inter-agent communication
- Distributed problem solving

### 4. Memory System Integration
- Persistent storage
- Thought process tracking
- Historical analysis
- Learning and improvement

## Key Principles

1. **Traceability**: Every task is traceable from idea → PRD → Epic → Tasks → Git → Black Box → Done
2. **Transparency**: All thoughts, decisions, and actions are recorded
3. **Flexibility**: Tasks can be deferred, re-prioritized, or looped back
4. **Quality Gate**: PRD flow prevents premature commitment
5. **Multi-Agent**: Parallel execution with specialist agents
6. **Feedback Loop**: Failures trigger analysis and re-entry
7. **Archival**: Complete history preserved for learning

## Usage Example

```bash
# 1. Create local task
echo "title: Add dark mode
category: features
priority: medium" > .blackbox5/specs/backlog/features/feature-dark-mode.md

# 2. Select and run PRD flow
bb5 prd:new "Add dark mode support"
bb5 epic:create --prd specs/prds/prd-dark-mode.md
bb5 task:create specs/epics/epic-dark-mode.md

# 3. Research and analyze
# (Research agent analyzes codebase automatically)

# 4. Push to Git
bb5 github:sync-epic specs/epics/epic-dark-mode.md

# 5. Development (Black Box + Vibe Kanban + MCP)
# (Agents work in Git issue, tracked in Black Box)

# 6. Testing
# (Test agent validates)

# 7. Done or Loop
# (Success → archive, Failure → re-enter development)
```

## Summary

This system provides a **complete task lifecycle management** approach:

1. **Capture** ideas in local databases
2. **Elaborate** through PRD flow
3. **Gate** decisions prevent waste
4. **Execute** with multi-agent system
5. **Track** everything in Black Box
6. **Validate** through testing
7. **Archive** or **Loop** based on results

The dual-track design ensures:
- **Track 1**: Flexible ideation without commitment
- **Track 2**: Rigorous development with full traceability

And the feedback loop ensures continuous improvement.
