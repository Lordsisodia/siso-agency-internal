# SISO Internal Memory - NEW Structure Visualization

## Complete Folder Structure (After Reorganization)

```
siso-internal/
│
├── 1. agents/                           # Agent Memory
│   ├── active/
│   │   └── _template/
│   │       └── session.json            # Template: Session state
│   ├── history/
│   │   ├── sessions/                   # Agent session records
│   │   │   ├── {agent-name}/
│   │   │   │   ├── context.json        # Agent context
│   │   │   │   ├── insights.json       # Learned insights
│   │   │   │   └── sessions.json       # Session records
│   │   ├── patterns/                   # Cross-session patterns
│   │   └── metrics/                    # Aggregate metrics
│   └── README.md                       # Documentation
│
├── 2. architecture/                     # Architecture Validation
│   ├── validation.json                 # Validation results
│   ├── dependencies.json               # Dependency graph
│   ├── duplicates.json                 # Duplicate detection
│   ├── evolution.json                  # Architecture evolution
│   └── README.md
│
├── 3. artifacts/                        # Completed Work Outputs
│   ├── architecture-specs/             # Architecture specifications
│   ├── dev-records/                    # Development records
│   ├── test_results.yaml               # Test results (from legacy/pipeline/)
│   ├── GITHUB-SYNC-COMPLETE.md
│   └── README.md
│
├── 4. codebase/                         # Code Knowledge
│   ├── patterns/                       # Discovered code patterns
│   ├── gotchas/                        # Common pitfalls
│   ├── code_index.md                   # Code structure index
│   └── README.md
│
├── 5. context/                          # High-Level Project Context
│   ├── AGENT-MIGRATION-INVENTORY.md    # Agent migration info
│   ├── AGENT-ORGANIZATION-SUMMARY.md   # Agent organization
│   ├── BRAIN-ARCHITECTURE-v2.md        # Brain architecture
│   ├── ENGINE-ARCHITECTURE-v1.md       # Engine architecture
│   ├── ENGINE-INITIALIZATION-DESIGN.md # Engine initialization
│   └── README.md
│
├── 6. decisions/                        # All Project Decisions ⭐ NEW
│   ├── architectural/                  # Architecture decisions
│   │   └── {decision-id}.md
│   ├── technical/                      # Technical decisions
│   │   └── {decision-id}.md
│   └── scope/                          # Scope decisions
│       └── {decision-id}.md
│
├── 7. domains/                          # Domain Organization ⭐ NEW (from context/domains/)
│   ├── admin/                          # Admin domain
│   │   ├── DOMAIN-CONTEXT.md           # What this domain is
│   │   ├── FEATURES.md                 # Features in this domain
│   │   ├── COMPONENTS.md               # Key components
│   │   ├── PAGES.md                    # Pages in this domain
│   │   └── REFACTOR-HISTORY.md        # Refactoring history
│   ├── analytics/                      # Analytics domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── clients/                        # Clients domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── financials/                     # Financials domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── lifelock/                       # LifeLock domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── partners/                       # Partners domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── projects/                       # Projects domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── resources/                      # Resources domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   ├── tasks/                          # Tasks domain
│   │   ├── DOMAIN-CONTEXT.md
│   │   ├── FEATURES.md
│   │   ├── COMPONENTS.md
│   │   ├── PAGES.md
│   │   └── REFACTOR-HISTORY.md
│   └── xp-store/                       # XP Store domain
│       ├── DOMAIN-CONTEXT.md
│       ├── FEATURES.md
│       ├── COMPONENTS.md
│       ├── PAGES.md
│       └── REFACTOR-HISTORY.md
│
├── 8. github/                           # GitHub Integration
│   ├── issues/                         # GitHub issue records
│   │   └── {issue-number}/
│   │       ├── issue.json
│   │       ├── comments/
│   │       ├── events.json
│   │       └── sync-log.json
│   ├── pull-requests/                  # PR records
│   │   └── {pr-number}/
│   │       ├── pr.json
│   │       ├── comments/
│   │       ├── reviews/
│   │       └── events.json
│   ├── sync-history/                   # Sync state
│   └── README.md
│
├── 9. knowledge/                        # Knowledge Graph
│   ├── entities/                       # Knowledge graph nodes
│   │   └── {entity-type}/
│   │       └── {entity-name}/
│   │           └── entity.json
│   ├── relationships/                  # Entity relationships
│   │   └── {relationship-type}/
│   │       └── entity.json
│   ├── embeddings/                     # Vector embeddings
│   │   └── {content-type}/
│   │       └── {id}.json
│   └── README.md
│
├── 10. logs/                            # System Logs
│   ├── agent-logs/                     # Agent execution logs
│   │   ├── {agent-name}-{date}.log
│   │   └── {workflow-name}-{date}.log
│   ├── logs/                          # System logs
│   └── README.md
│
├── 11. plans/                           # All Planning Documents ⭐ NEW
│   ├── active/                         # Active plans
│   │   └── user-profile/               # User profile epic (from legacy/plans/)
│   │       ├── README.md               # Epic overview
│   │       ├── metadata.yaml           # Epic metadata
│   │       ├── epic.md                 # Epic definition
│   │       ├── tasks/                  # Task breakdown
│   │       │   ├── TASK-SUMMARY.md
│   │       │   └── TASK-BREAKDOWN.md
│   │       ├── research/               # Research docs
│   │       │   ├── ARCHITECTURE.md
│   │       │   ├── FEATURES.md
│   │       │   ├── PITFALLS.md
│   │       │   ├── STACK.md
│   │       │   └── SUMMARY.md
│   │       ├── WORKFLOW-COMPLETE.md
│   │       └── tasks/                  # Individual tasks
│   │           ├── 001.md through 018.md
│   │
│   ├── prds/                           # Product Requirements (from context/prds/)
│   │   ├── active/                     # Currently active PRDs
│   │   │   └── _template.md           # PRD template
│   │   ├── backlog/                    # Future PRDs
│   │   └── completed/                  # Completed PRDs
│   │
│   ├── features/                       # Features (from context/features/)
│   │   ├── backlog.md                 # Feature backlog
│   │   ├── planned/                    # Planned features
│   │   └── under-consideration/       # Exploratory features
│   │
│   ├── briefs/                         # Product briefs (from artifacts/product-briefs/)
│   │
│   ├── archived/                       # Archived plans (merge of legacy/plans/ + artifacts/plans-archive/)
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
│   └── feature_backlog.yaml            # Feature backlog (from legacy/pipeline/)
│
├── 12. project/                         # Project Metadata & Goals ⭐ NEW
│   ├── context.yaml                    # Project context (from legacy/)
│   ├── project.yaml                    # Project metadata (from legacy/)
│   ├── timeline.yaml                   # Timeline (from legacy/)
│   │
│   ├── goals/                          # Goals (from context/goals/)
│   │   ├── current.md                  # Active goals
│   │   ├── long-term.md                # Future objectives
│   │   ├── metrics.json                # Goal progress
│   │   └── _template/                  # Goal template
│   │
│   └── directions/                     # Directions (from context/directions/)
│       ├── roadmap.md                  # Product roadmap
│       ├── strategy.md                 # Strategic initiatives
│       └── vision.md                   # Long-term vision
│
├── 13. research/                        # All Research ⭐ NEW
│   ├── active/                         # Active research
│   │   └── user-profile/               # User profile research (from legacy/research/)
│   │       ├── metadata.yaml           # Research metadata
│   │       ├── ARCHITECTURE.md         # Architecture findings
│   │       ├── FEATURES.md             # Feature analysis
│   │       ├── PITFALLS.md             # Common pitfalls
│   │       ├── STACK.md                # Tech stack analysis
│   │       └── SUMMARY.md              # Research summary
│   │
│   └── archived/                       # Completed research
│
├── 14. sessions/                        # Session Transcripts
│   └── {session-id}/
│       ├── transcript.json              # Full conversation
│       ├── context.json                 # Session context
│       └── metrics.json                 # Session metrics
│   └── README.md
│
├── 15. tasks/                           # Task Management
│   ├── active/                         # Active tasks (from legacy/tasks/active/)
│   │   ├── TASK-2026-01-18-001.md
│   │   ├── TASK-2026-01-18-002.md
│   │   ├── TASK-2026-01-18-003.md
│   │   ├── TASK-2026-01-18-004.md
│   │   └── TASK-2026-01-18-005.md
│   │
│   ├── working/                        # Working task folders
│   │   └── _template/
│   │       └── task.md                 # Task template
│   │
│   ├── completed/                      # Completed tasks
│   │   └── {task-id}/
│   │       ├── task.md
│   │       ├── final-report.md
│   │       ├── outcome.json
│   │       └── artifacts/
│   │
│   ├── archived/                       # Old completed tasks
│   │
│   ├── working-archive/                # Additional archive
│   │   └── tasks/
│   │       └── {task-id}/
│   │           ├── task.md
│   │           └── progress.md
│   │
│   └── README.md
│
├── 16. workflows/                        # Workflow Execution
│   ├── active/                         # Currently running workflows
│   │   └── {workflow-id}/
│   │       ├── workflow.json           # Workflow definition
│   │       ├── state.json              # Current state
│   │       └── context/                # Workflow context
│   │
│   ├── history/                        # Past workflow executions
│   │   └── {workflow-id}/
│   │       ├── execution.json         # Execution record
│   │       ├── artifacts/             # Generated artifacts
│   │       └── metrics/               # Performance metrics
│   │
│   └── README.md
│
├── CODE-INDEX.yaml                    # Global code index
│
└── README.md                          # Project memory overview
```

---

## Key Files by Type

### YAML Files (Database/Configuration)

| File | Purpose | Location |
|------|---------|----------|
| `context.yaml` | Project context, goals, constraints | `project/` |
| `project.yaml` | Project metadata (name, version) | `project/` |
| `timeline.yaml` | Project timeline and milestones | `project/` |
| `feature_backlog.yaml` | Feature backlog | `plans/` |
| `metrics.json` | Goal progress metrics | `project/goals/` |
| `test_results.yaml` | Test results | `artifacts/` |
| `CODE-INDEX.yaml` | Global code index | Root |
| `metadata.yaml` | Plan/research metadata | `plans/active/*/`, `research/active/*/` |

### JSON Files (Agent & Session Data)

| File | Purpose | Location |
|------|---------|----------|
| `session.json` | Agent session state | `agents/active/_template/` |
| `context.json` | Agent context | `agents/history/sessions/{agent}/` |
| `insights.json` | Learned insights | `agents/history/sessions/{agent}/` |
| `sessions.json` | Session records | `agents/history/sessions/{agent}/` |
| `validation.json` | Architecture validation | `architecture/` |
| `dependencies.json` | Dependency graph | `architecture/` |
| `duplicates.json` | Duplicate detection | `architecture/` |
| `evolution.json` | Architecture evolution | `architecture/` |
| `entity.json` | Knowledge graph entities | `knowledge/entities/*/` |
| `transcript.json` | Session transcripts | `sessions/{id}/` |
| `outcome.json` | Task outcomes | `tasks/completed/{id}/` |

### Templates

| Template | Purpose | Location |
|----------|---------|----------|
| `session.json` | Agent session template | `agents/active/_template/` |
| `_template.md` | PRD template | `plans/prds/active/` |
| `_template/` | Goal template | `project/goals/_template/` |
| `task.md` | Task template | `tasks/working/_template/` |

### README Files (Documentation)

| README | Covers | Location |
|--------|--------|----------|
| `agents/README.md` | Agent memory system | `agents/` |
| `architecture/README.md` | Architecture validation | `architecture/` |
| `artifacts/README.md` | Artifacts and deliverables | `artifacts/` |
| `codebase/README.md` | Code knowledge | `codebase/` |
| `context/README.md` | Project context | `context/` |
| `github/README.md` | GitHub integration | `github/` |
| `knowledge/README.md` | Knowledge graph | `knowledge/` |
| `logs/README.md` | System logs | `logs/` |
| `sessions/README.md` | Session transcripts | `sessions/` |
| `tasks/README.md` | Task management | `tasks/` |
| `workflows/README.md` | Workflow execution | `workflows/` |

---

## How Agents Interact With This Data

### 1. Finding Information (Search Patterns)

```
"What are we building?"     → plans/ (PRDs, active plans, features)
"Why did we decide this?"  → decisions/ (architectural, technical, scope)
"What have we learned?"    → research/ (active, archived) + knowledge/ (patterns, gotchas)
"What are we working on?"  → tasks/ (active, working)
"How does the code work?"  → codebase/ (patterns, gotchas) + knowledge/ (entities)
"What's the domain structure?" → domains/ (10 domains with context)
"Where are we heading?"    → project/ (goals, directions, vision)
```

### 2. Inputting Data (Write Patterns)

```
Create a plan          → plans/active/{plan-name}/
Make a decision        → decisions/{type}/{decision-id}.md
Do research            → research/active/{topic}/
Start a task           → tasks/working/{task-id}/
Learn a pattern        → codebase/patterns/{category}/{pattern}.md
Discover a gotcha      → codebase/gotchas/{gotcha}.md
```

### 3. Key Entry Points

**For Planning:**
- `plans/active/` - Where active plans live
- `plans/prds/active/_template.md` - PRD template

**For Decisions:**
- `decisions/architectural/` - Architecture decisions
- `decisions/technical/` - Technical decisions

**For Tasks:**
- `tasks/working/_template/task.md` - Task template
- `tasks/active/` - Active task files

**For Research:**
- `research/active/` - Active research

**For Domain Knowledge:**
- `domains/{domain}/DOMAIN-CONTEXT.md` - Domain overview
- `domains/{domain}/FEATURES.md` - Domain features
- `domains/{domain}/COMPONENTS.md` - Domain components

---

## File Purposes Summary

### Project Metadata (Helps AI understand project scope)
- `project/context.yaml` - What are we building?
- `project/project.yaml` - Project identity
- `project/timeline.yaml` - When are we building it?
- `project/goals/` - What are we trying to achieve?
- `project/directions/` - Where are we heading?

### Planning Documents (What we're building)
- `plans/active/` - Current plans (epics, features)
- `plans/prds/` - Product requirements
- `plans/features/` - Feature backlog
- `plans/archived/` - Past plans

### Decisions (Why we built it this way)
- `decisions/architectural/` - Architecture decisions
- `decisions/technical/` - Implementation decisions
- `decisions/scope/` - Scope decisions

### Research (What we learned)
- `research/active/` - Current research
- `research/archived/` - Past research

### Tasks (What we're working on)
- `tasks/active/` - Active task files
- `tasks/working/` - Working task folders
- `tasks/completed/` - Completed tasks

### Knowledge (How the code works)
- `codebase/patterns/` - Reusable patterns
- `codebase/gotchas/` - Common pitfalls
- `knowledge/entities/` - Knowledge graph
- `knowledge/relationships/` - Entity relationships

### Domains (How it's organized)
- `domains/{domain}/DOMAIN-CONTEXT.md` - What is this domain?
- `domains/{domain}/FEATURES.md` - What does it have?
- `domains/{domain}/COMPONENTS.md` - How is it built?
- `domains/{domain}/PAGES.md` - What pages?
- `domains/{domain}/REFACTOR-HISTORY.md` - How has it changed?

### Operations (How the system runs)
- `agents/` - Agent memory
- `sessions/` - Session transcripts
- `logs/` - System logs
- `workflows/` - Workflow execution
- `architecture/` - Architecture validation

### Integrations (External connections)
- `github/` - GitHub issues, PRs, sync

### Outputs (What we've produced)
- `artifacts/` - Specs, records, test results
