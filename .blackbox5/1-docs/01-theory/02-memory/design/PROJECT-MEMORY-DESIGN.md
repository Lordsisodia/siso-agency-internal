# Project Memory System Design Plan

**Created:** 2026-01-18
**Status:** Planning Phase
**Goal:** Restructure BlackBox5 memory to support project-based organization

---

## Executive Summary

Transform BlackBox5's memory system from agent-centric to project-centric. Instead of each agent having isolated memory, we'll have **project memories** that persist across all agents and sessions.

### Current Structure (Agent-Centric)
```
.blackbox5/data/memory/
└── john/              # Agent John's memory
    ├── sessions.json
    ├── insights.json
    └── context.json
```

### New Structure (Project-Centric)
```
.blackbox5/project-memory/
├── _template/         # Template for new projects
│   ├── project.yaml
│   ├── context.yaml
│   ├── research/
│   ├── plans/
│   ├── tasks/
│   └── decisions/
│
└── siso-internal/     # Current project
    ├── project.yaml
    ├── context.yaml
    ├── research/
    │   ├── user-profile/
    │   └── _archive/
    ├── plans/
    │   ├── user-profile/
    │   │   ├── prd.md
    │   │   ├── epic.md
    │   │   └── tasks/
    │   │       ├── 001.md
    │   │       └── 002.md
    │   └── _archive/
    ├── tasks/
    │   ├── active/
    │   │   ├── TASK-2026-01-18-001.md
    │   │   └── TASK-2026-01-18-002.md
    │   └── completed/
    ├── decisions/
    │   ├── technical/
    │   ├── architectural/
    │   └── scope/
    └── agents/            # Agent-specific memories (optional)
        ├── john/
        ├── winston/
        └── arthur/
```

---

## Design Principles

### 1. Project-Centric Organization
- **All project data in one place**
- **Persistent across agents and sessions**
- **Easy to navigate and understand**

### 2. Template-Based Initialization
- **New projects start from template**
- **Consistent structure every time**
- **Best practices baked in**

### 3. Clear Separation of Concerns
- **Research**: All research findings
- **Plans**: PRDs, epics, tasks
- **Tasks**: Active and completed tasks
- **Decisions**: Technical, architectural, scope decisions
- **Agents**: Optional agent-specific memories

### 4. Complete Traceability
- **Every decision documented**
- **Every task has context**
- **Timeline maintained**
- **Who did what recorded**

### 5. Easy Navigation
- **YAML manifests for quick overview**
- **Markdown documents for details**
- **Clear folder structure**
- **Searchable and discoverable**

---

## Folder Structure Design

### 1. Root Level
```
.blackbox5/project-memory/
├── _template/         # Project template
├── siso-internal/     # Current project
└── _archive/          # Old/completed projects
```

### 2. Project Template (`_template/`)

**Purpose**: Initialize new projects with consistent structure

**Contents**:
```yaml
# _template/project.yaml
name: project-template
version: "1.0"
created: "2026-01-18"
status: "template"

# Project Metadata
description: "Template for new projects"
type: "template"
tags: []

# Project Structure
structure:
  research: "research/"
  plans: "plans/"
  tasks: "tasks/"
  decisions: "decisions/"
  agents: "agents/"

# Default Settings
defaults:
  research_dimensions: ["stack", "features", "architecture", "pitfalls"]
  first_principles_questions: 6
  task_format: "markdown"
  decision_format: "markdown"
```

```yaml
# _template/context.yaml
# Project Context Template

project:
  name: ""
  description: ""
  status: "planning"  # planning, active, completed, archived

goals:
  primary: ""
  secondary: []

constraints:
  technical: []
  time: []
  resources: []

scope:
  in_scope: []
  out_of_scope: []

stakeholders:
  - role: ""
    name: ""
    responsibilities: []

timeline:
  started: ""
  estimated_completion: ""
  milestones: []
```

**Template Directories**:
```
_template/
├── research/
│   ├── _template-research.md    # Research template
│   └── README.md                 # Research guide
├── plans/
│   ├── _template-prd.md          # PRD template
│   ├── _template-epic.md         # Epic template
│   └── README.md
├── tasks/
│   ├── _template-task.md         # Task template
│   └── README.md
├── decisions/
│   ├── _template-technical.md    # Technical decision template
│   ├── _template-architectural.md # Architectural decision template
│   └── README.md
└── README.md                      # Template guide
```

### 3. SISO-Internal Project (`siso-internal/`)

**Purpose**: Current active project

**Contents**:
```yaml
# siso-internal/project.yaml
name: siso-internal
version: "1.0"
created: "2026-01-18"
updated: "2026-01-18"
status: "active"

# Project Metadata
description: "SISO Internal Development Project"
type: "production"
tags: ["internal", "development", "active"]

# Projects (sub-projects within this project)
projects:
  - id: "user-profile"
    name: "User Profile Page"
    status: "planning"
    priority: "high"
    started: "2026-01-18"
    links:
      research: "research/user-profile/"
      plans: "plans/user-profile/"

  - id: "github-integration"
    name: "GitHub Integration"
    status: "completed"
    priority: "high"
    completed: "2026-01-18"

# Team
team:
  - agent: "john"
    role: "Product Manager"
    responsibilities: ["PRD creation", "requirements"]

  - agent: "winston"
    role: "Architect"
    responsibilities: ["Epic creation", "technical design"]

  - agent: "arthur"
    role: "Developer"
    responsibilities: ["Implementation", "coding"]

# Progress
progress:
  total_features: 2
  completed_features: 1
  active_features: 1
  overall_completion: "50%"
```

```yaml
# siso-internal/context.yaml
# Current Project Context

project:
  name: "SISO Internal Development"
  description: "Internal development and features for SISO ecosystem"
  status: "active"

current_focus:
  feature: "user-profile"
  phase: "epic-creation"
  next_step: "Sync to GitHub"

goals:
  primary: "Build production-ready features for SISO ecosystem"
  secondary:
    - Implement user identity features
    - Integrate GitHub for project tracking
    - Enable autonomous execution via Vibe Kanban

constraints:
  technical:
    - Use existing infrastructure (Supabase, Clerk, Radix UI)
    - Follow domain-driven design patterns
    - Maintain type safety (TypeScript)

  time:
    - User profile: 4 weeks (MVP)
    - GitHub integration: Complete

  resources:
    - 3 agents (John, Winston, Arthur)
    - 1 autonomous system (Ralph Runtime)

scope:
  in_scope:
    - User profile page
    - GitHub integration
    - Project memory system
    - Autonomous execution

  out_of_scope:
    - Social features (follow, messaging)
    - Content creation tools
    - Advanced analytics

active_tasks:
  - TASK-2026-01-18-001: User Profile PRD Creation (completed)
  - TASK-2026-01-18-002: User Profile Epic Creation (completed)
  - TASK-2026-01-18-003: User Profile Task Breakdown (completed)
  - TASK-2026-01-18-004: Sync User Profile to GitHub (pending)

upcoming_tasks:
  - Implement user profile tasks (18 tasks)
  - Create project memory system
  - Set up Vibe Kanban integration
```

### 4. Research Directory

**Structure**:
```
siso-internal/research/
├── user-profile/
│   ├── STACK.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── PITFALLS.md
│   ├── SUMMARY.md
│   └── metadata.yaml
│       └── conducted_by: "john"
│       └── date: "2026-01-18"
│
└── _archive/
    └── [old research]
```

**Purpose**: Store all research findings by feature/project

**Metadata**:
```yaml
# research/user-profile/metadata.yaml
feature: "user-profile"
conducted_by: "john"
date_conducted: "2026-01-18"
dimensions_completed:
  - STACK
  - FEATURES
  - ARCHITECTURE
  - PITFALLS
findings_count: 50
confidence_level: "high"
next_review: ""
```

### 5. Plans Directory

**Structure**:
```
siso-internal/plans/
├── user-profile/
│   ├── prd.md
│   ├── epic.md
│   ├── ARCHITECTURE.md
│   ├── TASK-BREAKDOWN.md
│   ├── tasks/
│   │   ├── 001.md
│   │   ├── 002.md
│   │   └── ... (18 tasks)
│   └── metadata.yaml
│
└── _archive/
```

**Purpose**: Store all plans (PRDs, epics, tasks)

**Metadata**:
```yaml
# plans/user-profile/metadata.yaml
feature: "user-profile"
created_by: "john"
epic_created_by: "winston"
tasks_created_by: "winston+arthur"
date_created: "2026-01-18"
last_updated: "2026-01-18"

requirements:
  functional: 8
  non_functional: 6
  acceptance_criteria: 43

tasks:
  total: 18
  parallel: 15
  sequential: 3
  estimated_hours: 63
```

### 6. Tasks Directory

**Structure**:
```
siso-internal/tasks/
├── active/
│   ├── TASK-2026-01-18-001.md
│   │   └── User Profile PRD Creation (completed)
│   ├── TASK-2026-01-18-002.md
│   │   └── User Profile Epic Creation (completed)
│   ├── TASK-2026-01-18-003.md
│   │   └── User Profile Task Breakdown (completed)
│   └── TASK-2026-01-18-004.md
│       └── Sync User Profile to GitHub (pending)
│
└── completed/
    ├── TASK-2026-01-18-001/
    │   ├── context.md
    │   ├── execution.md
    │   └── outcome.md
    └── ...
```

**Purpose**: Track all tasks with complete context

**Task File Structure**:
```markdown
# TASK-2026-01-18-001

**Task**: User Profile PRD Creation
**Status**: ✅ Completed
**Date**: 2026-01-18

## Context
### Why
Demonstrate enhanced GitHub integration workflow

### Timeline
- Started: 2026-01-18 08:00 UTC
- Completed: 2026-01-18 08:11 UTC
- Duration: 11 minutes

### Who
- Orchestrator: Claude
- Researchers: 4 parallel agents
- Memory Agent: John

### Before
- Enhanced GitHub integration setup
- BlackBox5 framework ready
- GitHub CLI authenticated

### After
- Epic creation (next)
- Task breakdown
- GitHub sync
- Implementation

## Execution
### Process
1. Research phase (4 dimensions)
2. First principles analysis
3. PRD creation
4. Memory update

### Outcome
- PRD created: 8 FRs, 6 NFRs, 43 ACs
- Memory updated with 12 insights
- Ready for epic creation

## Files Created
- .claude/prds/user-profile.md
- .claude/prds/user-profile/first-principles.md
- .claude/prds/user-profile/research/ (5 docs)
- .blackbox5/data/memory/john/ (3 files)

## Next Steps
- Create epic from PRD
- Break down into tasks
- Sync to GitHub
```

### 7. Decisions Directory

**Structure**:
```
siso-internal/decisions/
├── technical/
│   ├── DEC-2026-01-18-001.md
│   │   └── Use Radix UI for components
│   └── DEC-2026-01-18-002.md
│       └── Custom hooks instead of Zustand
│
├── architectural/
│   ├── DEC-2026-01-18-003.md
│   │   └── Feature-based domain structure
│   └── DEC-2026-01-18-004.md
│       └── Service layer pattern
│
└── scope/
    ├── DEC-2026-01-18-005.md
    │   └── MVP: No social features
    └── DEC-2026-01-18-006.md
        └── Phase 2: Add 2FA
```

**Purpose**: Document all decisions with rationale

**Decision Template**:
```markdown
# DEC-2026-01-18-001

**Decision**: Use Radix UI for components
**Date**: 2026-01-18
**Status**: ✅ Approved
**Category**: Technical

## Context
### Problem
Need component library for UI

### Options Considered
1. **Radix UI** ✅ CHOSEN
   - Pros: Complete, accessible, customizable
   - Cons: Learning curve

2. Material-UI
   - Pros: Popular, complete
   - Cons: Heavy, opinionated design

3. Chakra UI
   - Pros: Light, accessible
   - Cons: Less customizable

### Decision
Use Radix UI for all UI components

### Rationale
- Complete component set
- Excellent accessibility
- Already in dependencies
- Customizable with Tailwind

### Impact
- Faster development
- Consistent UX
- Accessibility built-in

### Alternatives Rejected
- Material-UI: Too heavy
- Chakra UI: Less flexible

### Expiry
Review after: 6 months
```

---

## Implementation Plan

### Phase 1: Create Template Structure (Day 1)

**Tasks**:
1. Create `.blackbox5/project-memory/` directory
2. Create `_template/` with all templates
3. Create YAML manifests for project metadata
4. Create README files for each directory
5. Document template usage

### Phase 2: Create SISO-Internal Project (Day 1-2)

**Tasks**:
1. Create `siso-internal/` directory
2. Copy existing user-profile data:
   - Research → `research/user-profile/`
   - Plans → `plans/user-profile/`
   - Tasks → `tasks/active/`
3. Create project.yaml and context.yaml
4. Migrate agent memories to `agents/` subdirectory
5. Create task context files

### Phase 3: Rename/Move Existing Memory (Day 2)

**Tasks**:
1. Rename `.blackbox5/data/memory/` to `.blackbox5/project-memory/`
2. Migrate agent memories to project structure
3. Update references in code
4. Create migration script
5. Test new structure

### Phase 4: Update Documentation (Day 2-3)

**Tasks**:
1. Update README files
2. Create usage guide
3. Update memory system documentation
4. Create quick start guide
5. Provide examples

### Phase 5: Create Tooling (Day 3-4)

**Tasks**:
1. Create project initialization script
2. Create task context generator
3. Create decision logger
4. Create project status reporter
5. Create migration utilities

---

## Key Features

### 1. Project Initialization

**Command**: `init-project <project-name>`

**What it does**:
- Creates new project from template
- Sets up directory structure
- Initializes project.yaml
- Creates first task context

### 2. Task Context Generator

**Command**: `create-task-context <task-id>`

**What it does**:
- Creates task context file
- Records why, timeline, who
- Links to before/after tasks
- Stores in `tasks/active/`

### 3. Decision Logger

**Command**: `log-decision <category> <title>`

**What it does**:
- Creates decision file
- Records options considered
- Documents rationale
- Stores in `decisions/<category>/`

### 4. Project Status Reporter

**Command**: `project-status`

**What it does**:
- Reads project.yaml
- Reads context.yaml
- Reports overall status
- Shows active tasks
- Lists upcoming milestones

---

## Benefits

### 1. Project-Centric (Not Agent-Centric)
- All project data in one place
- Persistent across agents and sessions
- Easy to navigate

### 2. Complete Context
- Every task has full context
- Every decision has rationale
- Timeline maintained
- Who did what recorded

### 3. Scalable
- Easy to add new projects
- Template ensures consistency
- Clear organization

### 4. Searchable
- YAML manifests for quick overview
- Markdown for details
- Clear folder structure
- Easy to find information

### 5. Professional
- Proper documentation
- Clear structure
- Easy to handoff
- Audit trail

---

## Migration Strategy

### From Current Structure

**Current**:
```
.blackbox5/data/memory/
└── john/
    ├── sessions.json
    ├── insights.json
    └── context.json
```

**To New Structure**:
```
.blackbox5/project-memory/
├── _template/
└── siso-internal/
    ├── project.yaml
    ├── context.yaml
    ├── research/
    ├── plans/
    ├── tasks/
    ├── decisions/
    └── agents/
        ├── john/
        │   ├── sessions.json
        │   ├── insights.json
        │   └── context.json
        ├── winston/
        └── arthur/
```

### Migration Steps

1. **Backup existing memory**
2. **Create new structure**
3. **Copy data to new locations**
4. **Update references**
5. **Test new structure**
6. **Remove old structure**

---

## File Inventory

### Template Files (10 files)
1. `_template/project.yaml`
2. `_template/context.yaml`
3. `_template/research/_template-research.md`
4. `_template/plans/_template-prd.md`
5. `_template/plans/_template-epic.md`
6. `_template/plans/_template-task.md`
7. `_template/decisions/_template-technical.md`
8. `_template/decisions/_template-architectural.md`
9. `_template/README.md`
10. Various directory READMEs

### SISO-Internal Files (30+ files)
1. `siso-internal/project.yaml`
2. `siso-internal/context.yaml`
3. `siso-internal/research/user-profile/*` (6 files)
4. `siso-internal/plans/user-profile/*` (10+ files)
5. `siso-internal/tasks/active/*` (4 files)
6. `siso-internal/decisions/*` (to be created)
7. `siso-internal/agents/john/*` (3 files)

---

## Next Steps

1. ✅ Design complete
2. ⏳ Create template structure
3. ⏳ Create SISO-internal project
4. ⏳ Migrate existing data
5. ⏳ Update documentation
6. ⏳ Create tooling

---

**Status**: ✅ Planning Complete
**Ready for Implementation**: Yes
**Estimated Time**: 3-4 days
**Confidence**: ⭐⭐⭐⭐⭐ (5/5)

This design provides a solid foundation for project-centric memory that will scale across multiple projects and agents while maintaining complete traceability and context.
