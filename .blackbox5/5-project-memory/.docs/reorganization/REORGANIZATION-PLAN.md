# SISO Internal Memory Reorganization Plan

## Current Problems

1. **"legacy/" folder exists** - This is a graveyard folder that should not exist. If information is worth keeping, it should be properly organized. If not, it should be deleted.

2. **Massive redundancy:**
   - Plans exist in: `artifacts/plans-archive/`, `legacy/plans/`, and implicitly in `context/prds/`
   - PRDs exist in: `artifacts/prds/` AND `context/prds/`
   - Tasks exist in: `context/tasks/`, `tasks/`, and `legacy/tasks/`
   - Working folders exist in: `working/` AND `tasks/working/`

3. **Unclear purposes:**
   - What's the difference between `context/` and `knowledge/`?
   - What goes in `artifacts/` vs `tasks/`?
   - Why is `domains/` empty?

## Proposed Structure (10 Top-Level Folders)

### 1. **project/** - Project Identity & Metadata
High-level project information that defines what this project IS.
```
project/
├── context.yaml          # Project context (goals, constraints, scope)
├── project.yaml          # Project metadata (name, version, etc.)
├── timeline.yaml         # Project timeline and milestones
└── README.md             # Project overview
```

### 2. **plans/** - WHAT We're Building
ALL planning documents - active and archived.
```
plans/
├── active/               # Currently active plans
│   ├── prds/            # Product Requirements Documents
│   ├── epics/           # Epic breakdowns
│   ├── checklists/      # Implementation checklists
│   └── briefs/          # Product briefs
└── archived/            # Completed/archived plans
    ├── {plan-name}.md
    └── {phase-name}-summary.md
```

### 3. **decisions/** - WHY We Built It That Way
ALL decisions - architectural, technical, and scope.
```
decisions/
├── architectural/       # Architecture decisions (ADR format)
├── technical/           # Technical implementation decisions
└── scope/              # Scope and prioritization decisions
```

### 4. **research/** - WHAT We Learned
ALL research - active and archived.
```
research/
├── active/              # Currently active research
│   └── {topic}/
│       ├── findings.md
│       ├── analysis.md
│       └── recommendations.md
└── archived/            # Completed research
    └── {topic}/
```

### 5. **tasks/** - WHAT We're Working On
ALL tasks - active, completed, and archived.
```
tasks/
├── active/              # Currently active tasks
│   └── {task-id}/
│       ├── task.md
│       ├── progress.md
│       └── context.json
├── working/             # Same as active/ (for compatibility)
├── completed/           # Recently completed tasks
└── archived/            # Old completed tasks
```

### 6. **knowledge/** - WHAT We Know About the Code
Learned knowledge about the codebase - patterns, gotchas, entities.
```
knowledge/
├── patterns/            # Reusable code patterns
├── gotchas/             # Common pitfalls to avoid
├── entities/            # Knowledge graph entities
├── relationships/       # Entity relationships
└── embeddings/          # Semantic embeddings
```

### 7. **domains/** - Domain Organization
Domain-specific context, features, and organization.
```
domains/
├── {domain-name}/
│   ├── DOMAIN-CONTEXT.md    # What this domain is
│   ├── FEATURES.md          # Features in this domain
│   ├── COMPONENTS.md        # Key components
│   ├── PAGES.md             # Pages in this domain
│   └── REFACTOR-HISTORY.md  # Refactoring history
```

### 8. **operations/** - Runtime Operations
How the AI system operates - agents, sessions, logs, workflows.
```
operations/
├── agents/              # Agent memory and tracking
│   ├── active/         # Currently running agents
│   └── history/        # Past agent sessions
├── sessions/            # Session transcripts and context
├── logs/               # System and agent logs
├── workflows/          # Workflow execution records
│   ├── active/        # Currently running workflows
│   └── history/       # Past workflow executions
└── architecture/       # Architecture validation state
```

### 9. **integrations/** - External System Integrations
Connections to external systems.
```
integrations/
├── github/             # GitHub integration
│   ├── issues/        # GitHub issues
│   ├── pull-requests/ # PR records
│   └── sync-history/  # Sync logs
└── pipeline/           # CI/CD pipeline configs
    ├── feature_backlog.yaml
    └── test_results.yaml
```

### 10. **artifacts/** - Completed Work Outputs
Deliverables and outputs from completed work.
```
artifacts/
├── architecture-specs/  # Architecture specifications
├── dev-records/         # Development records
└── specs/              # Technical specifications
```

## Mapping: Current → New

| Current Location | New Location | Notes |
|-----------------|--------------|-------|
| `legacy/context.yaml` | `project/context.yaml` | Project metadata |
| `legacy/project.yaml` | `project/project.yaml` | Project metadata |
| `legacy/timeline.yaml` | `project/timeline.yaml` | Project metadata |
| `legacy/plans/*` | `plans/archived/*` | All archived plans |
| `legacy/decisions/*` | `decisions/*` | All decisions |
| `legacy/research/*` | `research/archived/*` | All research |
| `legacy/tasks/*` | `tasks/archived/*` | All old tasks |
| `legacy/pipeline/*` | `integrations/pipeline/*` | Pipeline configs |
| `artifacts/prds/*` | `plans/active/prds/*` | Active PRDs |
| `artifacts/plans-archive/*` | `plans/archived/*` | Merge with legacy/plans |
| `artifacts/product-briefs/*` | `plans/active/briefs/*` | Product briefs |
| `artifacts/architecture-specs/*` | `artifacts/architecture-specs/*` | Keep |
| `artifacts/dev-records/*` | `artifacts/dev-records/*` | Keep |
| `context/prds/*` | `plans/active/prds/*` | Merge with artifacts/prds |
| `context/goals/*` | `project/goals/*` | Project goals |
| `context/directions/*` | `project/directions/*` | Project directions |
| `context/features/*` | `plans/active/features/*` | Planned features |
| `context/tasks/*` | `tasks/active/` | Active task overview |
| `context/domains/*` | `domains/*` | Domain context |
| `tasks/working/*` | `tasks/active/*` | Active tasks |
| `tasks/completed/*` | `tasks/completed/*` | Keep |
| `tasks/archived/*` | `tasks/archived/*` | Merge with legacy/tasks |
| `working/*` | `tasks/active/*` | Merge with tasks/working |
| `domains/*` | `domains/*` | Currently empty, will populate |
| `agents/*` | `operations/agents/*` | Agent memory |
| `sessions/*` | `operations/sessions/*` | Session transcripts |
| `logs/*` | `operations/logs/*` | System logs |
| `workflows/*` | `operations/workflows/*` | Workflow records |
| `architecture/*` | `operations/architecture/*` | Architecture validation |
| `github/*` | `integrations/github/*` | GitHub integration |
| `codebase/*` | `knowledge/codebase/*` | Code patterns, gotchas |
| `knowledge/*` | `knowledge/*` | Keep (entities, relationships) |

## Eliminated Folders

- `legacy/` - **ELIMINATED** - Everything moved to proper locations
- `working/` (at root) - **ELIMINATED** - Merged into `tasks/active/`
- `domains/` (at root, empty) - **ELIMINATED** - Use `domains/` with content from `context/domains/`

## Benefits

1. **No redundancy** - Each type of information has ONE clear location
2. **No "legacy" folder** - Everything is properly organized or deleted
3. **Clear purpose** - Each folder has a well-defined purpose
4. **Easy for AI** - Clear hierarchy, obvious where to find/put information
5. **Maintainable** - Easy to understand and maintain over time

## Implementation Steps

1. Create new folder structure
2. Move files from legacy/ to proper locations
3. Consolidate redundant folders (PRDs, plans, working)
4. Update all README files
5. Delete empty/obsolete folders
6. Verify all files are accessible
7. Update any references in other files
