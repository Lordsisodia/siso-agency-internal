# SISO Internal Memory - COMPLETE STRUCTURE (All Subfolders & Files)

## Visual Directory Tree

```
siso-internal/
│
├── 1. project/                              # ⭐ Project Identity & Direction
│   │
│   ├── context.yaml                         # Project context (goals, constraints, scope)
│   ├── project.yaml                         # Project metadata (name, version, description)
│   ├── timeline.yaml                        # Timeline and milestones
│   │
│   ├── goals/                               # Goals and objectives
│   │   ├── current.md                       # Active goals and OKRs
│   │   ├── long-term.md                     # Future objectives and vision
│   │   ├── metrics.json                     # Goal progress metrics
│   │   └── _template/                       # Goal template
│   │       └── goal-template.md
│   │
│   └── directions/                          # Strategic direction
│       ├── roadmap.md                       # Product roadmap and phases
│       ├── strategy.md                      # Strategic initiatives
│       └── vision.md                        # Long-term vision
│
├── 2. plans/                                # ⭐ What We're Building
│   │
│   ├── active/                              # Active plans and epics
│   │   └── user-profile/                    # User Profile Epic (ACTIVE)
│   │       ├── README.md                     # Epic overview and status
│   │       ├── metadata.yaml                 # Epic metadata (status, priority, estimates)
│   │       ├── epic.md                       # Epic definition
│   │       ├── first-principles.md           # First principles analysis
│   │       ├── ARCHITECTURE.md                # Architecture decisions
│   │       ├── INDEX.md                       # Task index
│   │       ├── TASK-BREAKDOWN.md             # Task breakdown
│   │       ├── TASK-SUMMARY.md                # Task summary
│   │       ├── WORKFLOW-COMPLETE.md          # Workflow completion
│   │       │
│   │       ├── tasks/                         # Individual task files
│   │       │   ├── 001.md                    # Task 1
│   │       │   ├── 002.md                    # Task 2
│   │       │   ├── 003.md                    # Task 3
│   │       │   ├── 004.md                    # Task 4
│   │       │   ├── 005.md                    # Task 5
│   │       │   ├── 006.md                    # Task 6
│   │       │   ├── 007.md                    # Task 7
│   │       │   ├── 008.md                    # Task 8
│   │       │   ├── 009.md                    # Task 9
│   │       │   ├── 010.md                    # Task 10
│   │       │   ├── 011.md                    # Task 11
│   │       │   ├── 012.md                    # Task 12
│   │       │   ├── 013.md                    # Task 13
│   │       │   ├── 014.md                    # Task 14
│   │       │   ├── 015.md                    # Task 15
│   │       │   ├── 016.md                    # Task 16
│   │       │   ├── 017.md                    # Task 17
│   │       │   └── 018.md                    # Task 18
│   │       │
│   │       └── research/                      # Supporting research
│   │           ├── ARCHITECTURE.md            # Architecture research
│   │           ├── FEATURES.md                # Feature analysis
│   │           ├── PITFALLS.md                # Common pitfalls
│   │           ├── STACK.md                   # Tech stack analysis
│   │           └── SUMMARY.md                 # Research summary
│   │
│   ├── prds/                                # Product Requirements Documents
│   │   ├── active/
│   │   │   └── _template.md                  # PRD template
│   │   │       ├── # Title, Status, Priority
│   │   │       ├── # Problem Statement
│   │   │       ├── # Goals
│   │   │       ├── # Success Metrics
│   │   │       ├── # User Stories
│   │   │       ├── # Technical Requirements
│   │   │       ├── # Dependencies
│   │   │       └── # Timeline
│   │   ├── backlog/                          # Future PRDs
│   │   └── completed/                        # Completed PRDs
│   │
│   ├── features/                            # Feature Management
│   │   ├── backlog.md                        # Feature backlog list
│   │   ├── planned/                          # Planned features
│   │   └── under-consideration/              # Exploratory features
│   │
│   ├── briefs/                              # Product briefs
│   │
│   ├── archived/                            # Archived plans (20+ files)
│   │   ├── lifelock-gradient-enhancement-plan.md
│   │   ├── phase-3-stats-section-implementation.md
│   │   ├── phase-5-ai-legacy-button-implementation.md
│   │   ├── phase-5-file-summary.md
│   │   ├── phase1-checklist.md
│   │   ├── phase1-diet-consolidation-progress.md
│   │   ├── phase1-diet-consolidation-summary.md
│   │   ├── phase1-documentation-index.md
│   │   ├── phase1-visual-changes.md
│   │   ├── phase2-diet-to-health-nutrition.md
│   │   ├── phase4-execution-log.md
│   │   ├── phase4-summary.md
│   │   ├── top-nav-cleanup-analysis.md
│   │   ├── top-nav-cleanup-implementation.md
│   │   ├── top-nav-design-alternatives.md
│   │   ├── top-nav-further-cleanup-analysis.md
│   │   ├── xp-dashboard-enhancement-plan.md
│   │   ├── xp-store-phase3-implementation.md
│   │   └── xp-store-test-checklist.md
│   │
│   └── feature_backlog.yaml                 # Feature backlog (YAML format)
│
├── 3. decisions/                            # ⭐ Why We're Doing It This Way
│   │
│   ├── architectural/                       # Architecture decisions
│   │   └── {decision-id}.md                 # ADR format:
│   │       ├── # Title
│   │       ├── # Status
│   │       ├── # Context
│   │       ├── # Decision
│   │       ├── # Consequences
│   │       └── # Alternatives considered
│   │
│   ├── technical/                           # Technical implementation decisions
│   │   └── {decision-id}.md                 # Same ADR format
│   │
│   └── scope/                               # Scope and prioritization decisions
│       └── {decision-id}.md                 # Same ADR format
│
├── 4. knowledge/                            # ⭐ How It Works + What We've Learned
│   │
│   ├── codebase/                            # Code knowledge
│   │   ├── patterns/                         # Discovered code patterns
│   │   │   └── {category}/{pattern-name}.md
│   │   │       ├── # Pattern description
│   │   │       ├── # Code examples
│   │   │       ├── # When to use
│   │   │       └── # Related patterns
│   │   │
│   │   ├── gotchas/                          # Common pitfalls
│   │   │   └── {gotcha-name}.md
│   │   │       ├── # What to avoid
│   │   │       ├── # Why it's a problem
│   │   │       ├── # How to fix
│   │   │       └── # Example
│   │   │
│   │   ├── code_index.md                    # Code structure index
│   │   └── README.md
│   │
│   ├── research/                            # Research findings
│   │   ├── active/
│   │   │   └── user-profile/
│   │   │       ├── metadata.yaml             # Research metadata
│   │   │       ├── ARCHITECTURE.md          # Architecture findings
│   │   │       ├── FEATURES.md              # Feature analysis
│   │   │       ├── PITFALLS.md              # Common pitfalls
│   │   │       ├── STACK.md                 # Tech stack analysis
│   │   │       └── SUMMARY.md               # Research summary
│   │   │
│   │   └── archived/                        # Completed research
│   │
│   ├── graph/                               # Knowledge graph
│   │   ├── entities/                         # Knowledge graph nodes
│   │   │   └── {entity-type}/{entity-name}/
│   │   │       └── entity.json
│   │   │           ├── # Entity properties
│   │   │           ├── # Relationships
│   │   │           └── # Metadata
│   │   │
│   │   ├── relationships/                    # Entity relationships
│   │   │   └── {relationship-type}/
│   │   │       └── entity.json
│   │   │           ├── # Source entity
│   │   │           ├── # Target entity
│   │   │           ├── # Relationship type
│   │   │           └── # Properties
│   │   │
│   │   └── embeddings/                       # Vector embeddings
│   │       └── {content-type}/{id}.json
│   │           ├── # Embedding vector
│   │           └── # Content hash
│   │
│   └── artifacts/                           # Completed work outputs
│       ├── architecture-specs/              # Architecture specifications
│       ├── dev-records/                     # Development records
│       ├── test_results.yaml                # Test results
│       └── README.md
│
├── 5. tasks/                                # ⭐ What We're Working On
│   │
│   ├── active/                              # Active task files (from legacy/tasks/active/)
│   │   ├── TASK-2026-01-18-001.md
│   │   ├── TASK-2026-01-18-002.md
│   │   ├── TASK-2026-01-18-003.md
│   │   ├── TASK-2026-01-18-004.md
│   │   └── TASK-2026-01-18-005.md
│   │       # Task format:
│   │       ├── # Title
│   │       ├── # Status
│   │       ├── # Description
│   │       ├── # Acceptance criteria
│   │       ├── # Dependencies
│   │       └── # Progress updates
│   │
│   ├── working/                             # Working task folders
│   │   ├── {task-id}/
│   │   │   ├── task.md                      # Task description
│   │   │   ├── progress.md                  # Progress updates
│   │   │   ├── context.json                 # Task context
│   │   │   └── artifacts/                   # Generated files
│   │   │
│   │   └── _template/
│   │       └── task.md                      # Task template
│   │           # Title, Status, Priority
│   │           # Description
│   │           # Acceptance Criteria
│   │           # Technical Details
│   │           # Dependencies
│   │           # Progress Section
│   │           # Blockers/Issues
│   │
│   ├── completed/                           # Completed tasks
│   │   └── {task-id}/
│   │       ├── task.md
│   │       ├── final-report.md              # Final summary
│   │       ├── outcome.json                 # Results, patterns, gotchas
│   │       └── artifacts/
│   │
│   ├── archived/                            # Old completed tasks
│   │
│   ├── working-archive/                     # Additional archive
│   │   └── tasks/
│   │       └── {task-id}/
│   │           ├── task.md
│   │           └── progress.md
│   │
│   └── README.md
│
├── 6. domains/                              # ⭐ How It's Organized (10 Domains)
│   │
│   ├── admin/                               # Admin domain
│   │   ├── DOMAIN-CONTEXT.md                # What this domain is
│   │   ├── FEATURES.md                      # Features in this domain
│   │   ├── COMPONENTS.md                    # Key components
│   │   ├── PAGES.md                         # Pages in this domain
│   │   └── REFACTOR-HISTORY.md              # Refactoring history
│   │
│   ├── analytics/                           # Analytics domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── clients/                             # Clients domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── financials/                          # Financials domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── lifelock/                            # LifeLock domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── partners/                            # Partners domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── projects/                            # Projects domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── resources/                           # Resources domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   ├── tasks/                               # Tasks domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   │
│   └── xp-store/                            # XP Store domain
│       ├── DOMAIN-CONTEXT.md
│       ├── FEATURES.md
│       ├── COMPONENTS.md
│       ├── PAGES.md
│       └── REFACTOR-HISTORY.md
│
├── 7. operations/                           # ⭐ System Operations
│   │
│   ├── agents/                              # Agent memory
│   │   ├── active/
│   │   │   └── _template/
│   │   │       └── session.json             # Session state template
│   │   │           # session_id
│   │   │           # agent_id
│   │   │           # start_time
│   │   │           # state
│   │   │           # context
│   │   │
│   │   ├── history/
│   │   │   ├── sessions/                    # Agent session records
│   │   │   │   ├── {agent-name}/
│   │   │   │   │   ├── context.json        # Agent context
│   │   │   │   │   ├── insights.json       # Learned insights
│   │   │   │   │   └── sessions.json       # Session records
│   │   │   │   │
│   │   │   │   # Current agents:
│   │   │   │   ├── analyst_1_memory.json
│   │   │   │   ├── analyst_2_memory.json
│   │   │   │   ├── backend-developer/
│   │   │   │   ├── demo-agent/
│   │   │   │   ├── dev_1_memory.json
│   │   │   │   ├── developer_1_memory.json
│   │   │   │   ├── export-agent/
│   │   │   │   ├── frontend-developer/
│   │   │   │   ├── import-agent/
│   │   │   │   ├── persistent-agent/
│   │   │   │   ├── search-agent/
│   │   │   │   ├── stats-agent/
│   │   │   │   └── tester_1_memory.json
│   │   │   │
│   │   │   ├── patterns/                   # Cross-session patterns
│   │   │   └── metrics/                    # Aggregate metrics
│   │   │
│   │   └── README.md
│   │
│   ├── sessions/                            # Session transcripts
│   │   └── {session-id}/
│   │       ├── transcript.json              # Full conversation
│   │       ├── context.json                 # Session context
│   │       └── metrics.json                 # Session metrics
│   │   └── README.md
│   │
│   ├── logs/                                # System logs
│   │   ├── agent-logs/                      # Agent execution logs
│   │   │   ├── {agent-name}-{date}.log
│   │   │   └── {workflow-name}-{date}.log
│   │   ├── logs/                           # System logs
│   │   │   └── .gitkeep
│   │   └── README.md
│   │
│   ├── workflows/                           # Workflow execution
│   │   ├── active/                          # Currently running workflows
│   │   │   └── {workflow-id}/
│   │   │       ├── workflow.json           # Workflow definition
│   │   │       ├── state.json              # Current state
│   │   │       └── context/                # Workflow context
│   │   │
│   │   ├── history/                         # Past workflow executions
│   │   │   └── {workflow-id}/
│   │   │       ├── execution.json         # Execution record
│   │   │       ├── artifacts/             # Generated artifacts
│   │   │       └── metrics/               # Performance metrics
│   │   │
│   │   └── README.md
│   │
│   ├── github/                              # GitHub integration
│   │   ├── issues/                         # GitHub issue records
│   │   │   └── {issue-number}/
│   │   │       ├── issue.json             # Raw issue data
│   │   │       ├── comments/              # Comment history
│   │   │       ├── events.json            # Issue events
│   │   │       └── sync-log.json          # Sync history
│   │   │
│   │   ├── pull-requests/                  # PR records
│   │   │   └── {pr-number}/
│   │   │       ├── pr.json                # Raw PR data
│   │   │       ├── comments/              # Review comments
│   │   │       ├── reviews/               # Review records
│   │   │       └── events.json            # PR events
│   │   │
│   │   ├── sync-history/                   # Sync state
│   │   │   ├── last-sync.txt
│   │   │   ├── pending/
│   │   │   └── conflicts/
│   │   │
│   │   └── README.md
│   │
│   ├── architecture/                        # Architecture validation
│   │   ├── validation.json                 # Validation results
│   │   ├── dependencies.json               # Dependency graph
│   │   ├── duplicates.json                 # Duplicate detection
│   │   ├── evolution.json                  # Architecture evolution
│   │   └── README.md
│   │
│   └── docs/                                # System documentation
│       ├── AGENT-MIGRATION-INVENTORY.md    # Agent migration info
│       ├── AGENT-ORGANIZATION-SUMMARY.md   # Agent organization
│       ├── BRAIN-ARCHITECTURE-v2.md        # Brain architecture
│       ├── ENGINE-ARCHITECTURE-v1.md       # Engine architecture
│       └── ENGINE-INITIALIZATION-DESIGN.md # Engine initialization
│
├── CODE-INDEX.yaml                         # Global code index
└── README.md                               # Memory system overview
```

---

## File Templates & Formats

### 1. Task Template (`tasks/working/_template/task.md`)

```markdown
# {Task Title}

**Status:** 🔄 In Progress | ✅ Complete | ⏳ Blocked | 📋 Planned
**Priority:** P0 | P1 | P2 | P3
**Assigned:** {Agent/Developer}
**Created:** {Date}
**Updated:** {Date}

## Description
{Clear description of what needs to be done}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Technical Details
- **Location:** `{file-path}`
- **Dependencies:** {list of dependencies}
- **Complexity:** Low | Medium | High

## Progress
### Completed
- {What has been done}

### In Progress
- {What's being worked on}

### Blocked
- {Any blockers or issues}

## Notes
{Additional context, decisions, or considerations}
```

### 2. PRD Template (`plans/prds/active/_template.md`)

```markdown
# {PRD Title}

**Status:** Draft | Active | Completed
**Priority:** P0 | P1 | P2 | P3
**Owner:** {Name}
**Last Updated:** {Date}

## Problem Statement
{What problem are we solving? Why now?}

## Goals
{What are we trying to achieve?}

## Success Metrics
{How will we measure success?}

## User Stories
{Who is this for? What do they need?}

## Functional Requirements
{What must the solution do?}

## Non-Functional Requirements
{Performance, security, accessibility, etc.}

## Technical Approach
{How will we implement this?}

## Dependencies
{What does this depend on?}

## Timeline
{When will this be done?}

## Risks & Mitigation
{What could go wrong? How will we handle it?}
```

### 3. Agent Session Template (`operations/agents/active/_template/session.json`)

```json
{
  "session_id": "{uuid}",
  "agent_id": "{agent-name}",
  "start_time": "{ISO-timestamp}",
  "state": "active | completed | error",
  "context": {
    "task": "{current task}",
    "constraints": [],
    "resources": []
  },
  "history": [],
  "metrics": {
    "duration_seconds": 0,
    "tools_used": [],
    "tokens_used": 0
  }
}
```

### 4. Decision Record Template (`decisions/*/{decision-id}.md`)

```markdown
# {Decision Title} - {Decision ID}

**Date:** {Date}
**Status:** Proposed | Accepted | Deprecated | Superseded
**Decision Type:** Architectural | Technical | Scope

## Context
{What is the issue that we're facing that requires a decision?}

## Decision
{What is the decision that was made?}

## Consequences
- **Positive:** {What good things happen because of this decision?}
- **Negative:** {What are the downsides of this decision?}

## Alternatives Considered
1. {Alternative 1}
   - Pros: {benefits}
   - Cons: {drawbacks}
   - Why not: {why we didn't choose this}

2. {Alternative 2}
   - Pros: {benefits}
   - Cons: {drawbacks}
   - Why not: {why we didn't choose this}

## Related Decisions
- {Links to related decisions}

## References
- {Links to external resources, discussions, etc.}
```

---

## YAML Files & Database Structure

### Project Metadata (`project/*.yaml`)

**context.yaml:**
```yaml
project:
  name: "SISO Internal"
  version: "1.0.0"
  description: "Internal productivity and task management system"

goals:
  primary: "Build a comprehensive task and productivity system"
  secondary:
    - "Integrate AI capabilities"
    - "Provide actionable insights"

constraints:
  technical:
    - "Must use existing tech stack"
    - "Must maintain backward compatibility"
  timeline:
    - "Q1 2026 for MVP"
  resources:
    - "Single developer"

scope:
  in_scope:
    - "Task management"
    - "Progress tracking"
    - "AI assistance"
  out_of_scope:
    - "Multi-tenant support"
    - "Mobile apps"
```

**timeline.yaml:**
```yaml
phases:
  - name: "Phase 1"
    start: "2025-01-01"
    end: "2025-03-31"
    status: "completed"
    milestones:
      - "Core task system"
      - "Basic UI"

  - name: "Phase 2"
    start: "2025-04-01"
    end: "2025-06-30"
    status: "in_progress"
    milestones:
      - "AI integration"
      - "Advanced features"
```

**feature_backlog.yaml:**
```yaml
features:
  - id: "FEAT-001"
    name: "User Profiles"
    status: "active"
    priority: "P0"
    epic: "user-profile"
    estimate: 21
    assigned: "frontend-developer"

  - id: "FEAT-002"
    name: "XP Dashboard"
    status: "planned"
    priority: "P1"
    epic: "xp-store"
    estimate: 14
```

### Agent Memory (`operations/agents/history/sessions/{agent}/context.json`)

```json
{
  "agent_id": "{agent-name}",
  "created_at": "{ISO-timestamp}",
  "last_updated": "{ISO-timestamp}",
  "preferences": {
    "language": "TypeScript",
    "framework": "React",
    "style": "functional"
  },
  "patterns": [
    {
      "pattern": "Use custom hooks for state",
      "confidence": 0.95,
      "source_session": "session-id"
    }
  ],
  "gotchas": [
    {
      "gotcha": "Always validate user input server-side",
      "category": "security",
      "severity": "high"
    }
  ],
  "statistics": {
    "total_sessions": 10,
    "successful_tasks": 8,
    "avg_duration_seconds": 300
  }
}
```

---

## Complete File Inventory

### By Type

| Type | Count | Locations |
|------|-------|-----------|
| **Markdown** | 165 | All folders (docs, plans, tasks, domains) |
| **YAML** | 8 | project/, plans/, artifacts/ |
| **JSON** | 33 | agents/, knowledge/, tasks/, sessions/ |

### By Folder

| Folder | Files | Subfolders |
|--------|-------|------------|
| `project/` | 11 | goals/, directions/ |
| `plans/` | ~50 | active/, prds/, features/, briefs/, archived/ |
| `decisions/` | Variable | architectural/, technical/, scope/ |
| `knowledge/` | ~100 | codebase/, research/, graph/, artifacts/ |
| `tasks/` | ~20 | active/, working/, completed/, archived/ |
| `domains/` | 50 | 10 domains × 5 files each |
| `operations/` | ~60 | agents/, sessions/, logs/, workflows/, github/, architecture/, docs/ |

**Total: ~206 files**
