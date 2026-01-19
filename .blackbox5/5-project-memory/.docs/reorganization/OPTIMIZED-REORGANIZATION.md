# SISO Internal Memory - OPTIMIZED Reorganization Plan

## Executive Summary

**Applying First Principles:** What is the ACTUAL purpose of this memory system?

### Core Principles

1. **PURPOSE:** Database for AI agents to find information quickly
2. **CONSUMERS:** AI agents (primary), humans (secondary)
3. **ACCESS PATTERNS:** Agents search by question type, not file type
4. **GOAL:** Minimal folders, maximum clarity, zero redundancy

### Key Insight: Separate by CONCERN

The current structure mixes THREE different concerns:
1. **Project Memory** - What we're building, why, how (for agents doing work)
2. **System Operations** - How the AI system runs (for technical monitoring)
3. **Organizational Structure** - How the project is organized (for navigation)

---

## Optimized Structure: 7 Folders (56% reduction)

```
siso-internal/
│
├── 1. project/              # ⭐ Project Identity & Direction
│   ├── context.yaml         # Project context, goals, constraints
│   ├── project.yaml         # Project metadata (name, version)
│   ├── timeline.yaml        # Timeline, milestones
│   ├── goals/               # Vision, roadmap, strategy, metrics
│   │   ├── current.md
│   │   ├── long-term.md
│   │   ├── metrics.json
│   │   └── _template/
│   └── directions/          # Strategic direction
│       ├── roadmap.md
│       ├── strategy.md
│       └── vision.md
│
├── 2. plans/                # ⭐ What We're Building
│   ├── active/              # Active plans and epics
│   │   └── user-profile/    # Active user profile epic
│   │       ├── README.md
│   │       ├── metadata.yaml
│   │       ├── epic.md
│   │       ├── tasks/       # Task breakdown
│   │       ├── research/    # Supporting research
│   │       └── tasks/       # Individual task files (001-018.md)
│   ├── prds/                # Product Requirements
│   │   ├── active/
│   │   │   └── _template.md
│   │   ├── backlog/
│   │   └── completed/
│   ├── features/            # Feature Management
│   │   ├── backlog.md
│   │   ├── planned/
│   │   └── under-consideration/
│   ├── briefs/              # Product briefs
│   ├── archived/            # Completed plans (20+ files)
│   │   ├── lifelock-gradient-enhancement-plan.md
│   │   ├── phase1-checklist.md
│   │   ├── top-nav-cleanup-implementation.md
│   │   ├── phase-3-stats-section-implementation.md
│   │   └── ... (20+ archived plans)
│   └── feature_backlog.yaml # Feature backlog
│
├── 3. decisions/            # ⭐ Why We're Doing It This Way
│   ├── architectural/      # Architecture decisions (long-lived)
│   ├── technical/          # Technical implementation decisions
│   └── scope/              # Scope and prioritization decisions
│
├── 4. knowledge/            # ⭐ How It Works + What We've Learned
│   ├── codebase/           # Code patterns and gotchas
│   │   ├── patterns/       # Discovered code patterns
│   │   ├── gotchas/        # Common pitfalls
│   │   └── code_index.md   # Code structure index
│   ├── research/           # Research findings
│   │   ├── active/
│   │   │   └── user-profile/
│   │   │       ├── metadata.yaml
│   │   │       ├── ARCHITECTURE.md
│   │   │       ├── FEATURES.md
│   │   │       ├── PITFALLS.md
│   │   │       ├── STACK.md
│   │   │       └── SUMMARY.md
│   │   └── archived/
│   ├── graph/              # Knowledge graph
│   │   ├── entities/       # Knowledge graph nodes
│   │   ├── relationships/  # Entity relationships
│   │   └── embeddings/     # Vector embeddings
│   └── artifacts/          # Completed work outputs
│       ├── architecture-specs/
│       ├── dev-records/
│       └── test_results.yaml
│
├── 5. tasks/                # ⭐ What We're Working On
│   ├── active/              # Active task files (from legacy/tasks/active/)
│   │   ├── TASK-2026-01-18-001.md
│   │   ├── TASK-2026-01-18-002.md
│   │   ├── TASK-2026-01-18-003.md
│   │   ├── TASK-2026-01-18-004.md
│   │   └── TASK-2026-01-18-005.md
│   ├── working/             # Working task folders
│   │   └── _template/
│   │       └── task.md
│   ├── completed/           # Completed tasks
│   ├── archived/            # Old completed tasks
│   └── working-archive/      # Additional archive
│
├── 6. domains/              # ⭐ How It's Organized
│   ├── admin/               # Admin domain
│   │   ├── DOMAIN-CONTEXT.md    # What this domain is
│   │   ├── FEATURES.md          # Features in this domain
│   │   ├── COMPONENTS.md        # Key components
│   │   ├── PAGES.md             # Pages in this domain
│   │   └── REFACTOR-HISTORY.md  # Refactoring history
│   ├── analytics/           # Analytics domain (same structure)
│   ├── clients/             # Clients domain (same structure)
│   ├── financials/          # Financials domain (same structure)
│   ├── lifelock/            # LifeLock domain (same structure)
│   ├── partners/            # Partners domain (same structure)
│   ├── projects/            # Projects domain (same structure)
│   ├── resources/           # Resources domain (same structure)
│   ├── tasks/               # Tasks domain (same structure)
│   └── xp-store/            # XP Store domain (same structure)
│
├── 7. operations/           # ⭐ System Operations
│   ├── agents/              # Agent memory
│   │   ├── active/
│   │   │   └── _template/session.json
│   │   ├── history/
│   │   │   ├── sessions/{agent}/
│   │   │   │   ├── context.json
│   │   │   │   ├── insights.json
│   │   │   │   └── sessions.json
│   │   │   ├── patterns/
│   │   │   └── metrics/
│   │   └── README.md
│   ├── sessions/            # Session transcripts
│   │   └── {session-id}/
│   │       ├── transcript.json
│   │       ├── context.json
│   │       └── metrics.json
│   │   └── README.md
│   ├── logs/                # System logs
│   │   ├── agent-logs/
│   │   ├── logs/
│   │   └── README.md
│   ├── workflows/           # Workflow execution
│   │   ├── active/{workflow-id}/
│   │   ├── history/{workflow-id}/
│   │   └── README.md
│   ├── github/              # GitHub integration
│   │   ├── issues/
│   │   ├── pull-requests/
│   │   ├── sync-history/
│   │   └── README.md
│   ├── architecture/        # Architecture validation
│   │   ├── validation.json
│   │   ├── dependencies.json
│   │   ├── duplicates.json
│   │   ├── evolution.json
│   │   └── README.md
│   └── docs/                # System documentation (from context/*.md)
│       ├── AGENT-MIGRATION-INVENTORY.md
│       ├── AGENT-ORGANIZATION-SUMMARY.md
│       ├── BRAIN-ARCHITECTURE-v2.md
│       ├── ENGINE-ARCHITECTURE-v1.md
│       └── ENGINE-INITIALIZATION-DESIGN.md
│
├── CODE-INDEX.yaml         # Global code index (keep at root)
└── README.md              # Memory system overview
```

---

## Complete File Mapping (Every Single File)

### From legacy/ → Eliminated (contents distributed)

| Source | Destination | Notes |
|--------|-------------|-------|
| `legacy/context.yaml` | `project/context.yaml` | Project metadata |
| `legacy/project.yaml` | `project/project.yaml` | Project metadata |
| `legacy/timeline.yaml` | `project/timeline.yaml` | Timeline |
| `legacy/plans/*` | `plans/archived/*` | 20+ archived plans |
| `legacy/plans/user-profile/` | `plans/active/user-profile/` | **ACTIVE** epic |
| `legacy/decisions/*` | `decisions/*` | All decisions |
| `legacy/research/*` | `knowledge/research/active/*` | **ACTIVE** research |
| `legacy/tasks/active/*` | `tasks/active/*` | 5 **ACTIVE** tasks |
| `legacy/tasks/completed/*` | `tasks/completed/*` | Merge with existing |
| `legacy/pipeline/feature_backlog.yaml` | `plans/feature_backlog.yaml` | Planning doc |
| `legacy/pipeline/test_results.yaml` | `knowledge/artifacts/test_results.yaml` | Artifact |
| `legacy/agents/*` | Delete | Redundant with operations/agents/ |

**Then delete entire legacy/ folder**

### From context/ → Eliminated (contents distributed)

| Source | Destination | Notes |
|--------|-------------|-------|
| `context/goals/*` | `project/goals/*` | Goals and metrics |
| `context/directions/*` | `project/directions/*` | Strategic direction |
| `context/prds/*` | `plans/prds/*` | PRDs |
| `context/features/*` | `plans/features/*` | Features |
| `context/domains/*` | `domains/*` | 10 domains |
| `context/tasks/*` | Delete | Redundant with tasks/ |
| `context/*.md` | `operations/docs/*` | System docs |
| `context/README.md` | Update | New structure |

**Then delete entire context/ folder**

### From knowledge/context/ → Delete (duplicate)

**Delete entire knowledge/context/ folder** - Exact duplicate of root context/

### From artifacts/ → Partial move

| Source | Destination | Notes |
|--------|-------------|-------|
| `artifacts/prds/` | Delete | Empty, redundant |
| `artifacts/plans-archive/*` | `plans/archived/*` | Merge with legacy/plans |
| `artifacts/product-briefs/*` | `plans/briefs/*` | Product briefs |
| `artifacts/architecture-specs/*` | Keep | In knowledge/artifacts/ |
| `artifacts/dev-records/*` | Keep | In knowledge/artifacts/ |
| `artifacts/*.md` | Keep | In knowledge/artifacts/ |

### From working/ → Delete (redundant)

**Delete entire working/ folder** - Redundant with tasks/working/

### From domains/ (empty) → Delete

**Delete empty domains/ folder** - Replaced by context/domains/*

---

## Folder-by-Folder Breakdown

### 1. project/ - Project Identity & Direction

**Purpose:** Answer "What is this project and where are we heading?"

**Contents:** 11 files
```
context.yaml              # Project context, goals, constraints
project.yaml              # Project metadata
timeline.yaml             # Timeline, milestones
goals/current.md          # Active goals
goals/long-term.md        # Future objectives
goals/metrics.json        # Progress tracking
goals/_template/          # Goal template
directions/roadmap.md     # Product roadmap
directions/strategy.md    # Strategic initiatives
directions/vision.md      # Long-term vision
```

**AI Usage:** "What are our goals?" "What's the vision?" "Where are we heading?"

---

### 2. plans/ - What We're Building

**Purpose:** Answer "What are we building and why?"

**Contents:** ~50 files
```
active/user-profile/      # Active epic (18 files)
prds/active/_template.md  # PRD template
prds/active/              # Active PRDs
prds/backlog/             # Future PRDs
prds/completed/           # Completed PRDs
features/backlog.md       # Feature backlog
features/planned/          # Planned features
features/under-consideration/  # Exploratory
briefs/                   # Product briefs
archived/                 # 20+ archived plans
feature_backlog.yaml      # Feature backlog
```

**AI Usage:** "What are we building?" "What's the plan?" "What features are planned?"

---

### 3. decisions/ - Why This Approach

**Purpose:** Answer "Why did we decide to do it this way?"

**Contents:** 3 subfolders with decision records
```
architectural/            # Architecture decisions
technical/                # Technical decisions
scope/                    # Scope decisions
```

**AI Usage:** "Why this architecture?" "Why this technical approach?" "Why is this in scope?"

---

### 4. knowledge/ - How It Works + What We've Learned

**Purpose:** Answer "How does it work?" and "What have we learned?"

**Contents:** ~100+ files across 4 subfolders
```
codebase/patterns/       # Code patterns
codebase/gotchas/        # Common pitfalls
codebase/code_index.md   # Code structure

research/active/user-profile/  # Active research (6 files)
research/archived/             # Past research

graph/entities/           # Knowledge graph
graph/relationships/      # Entity relationships
graph/embeddings/         # Vector embeddings

artifacts/architecture-specs/  # Specs
artifacts/dev-records/         # Records
artifacts/test_results.yaml     # Test results
```

**AI Usage:** "How does this work?" "What are the patterns?" "What have we learned?"

---

### 5. tasks/ - What We're Working On

**Purpose:** Answer "What should I work on?"

**Contents:** 5 active tasks + working folders + archives
```
active/TASK-*.md          # 5 active task files
working/_template/task.md # Task template
working/{task-id}/        # Working folders
completed/{task-id}/      # Completed tasks
archived/{task-id}/       # Old tasks
working-archive/          # Additional archive
```

**AI Usage:** "What should I work on?" "What's active?" "What's completed?"

---

### 6. domains/ - How It's Organized

**Purpose:** Answer "How is the project organized?"

**Contents:** 10 domains, each with 5 context files (50 total files)
```
admin/                   # Admin domain
analytics/               # Analytics domain
clients/                 # Clients domain
financials/              # Financials domain
lifelock/                # LifeLock domain
partners/                # Partners domain
projects/                # Projects domain
resources/               # Resources domain
tasks/                   # Tasks domain
xp-store/                # XP Store domain

Each domain has:
├── DOMAIN-CONTEXT.md     # What is this domain?
├── FEATURES.md           # What does it have?
├── COMPONENTS.md         # How is it built?
├── PAGES.md              # What pages?
└── REFACTOR-HISTORY.md   # How has it changed?
```

**AI Usage:** "What's in the tasks domain?" "How is the project organized?" "What are the domains?"

---

### 7. operations/ - System Operations

**Purpose:** System monitoring and technical operations

**Contents:** ~50+ files across 7 subfolders
```
agents/active/_template/session.json      # Session template
agents/history/sessions/{agent}/          # 15 agent sessions
  ├── context.json
  ├── insights.json
  └── sessions.json
agents/history/patterns/                  # Cross-session patterns
agents/history/metrics/                   # Aggregate metrics

sessions/{session-id}/                    # Session transcripts
  ├── transcript.json
  ├── context.json
  └── metrics.json

logs/agent-logs/{agent}-{date}.log        # Agent logs
logs/logs/                                # System logs

workflows/active/{workflow-id}/           # Active workflows
workflows/history/{workflow-id}/          # Past workflows

github/issues/{issue-number}/             # GitHub issues
github/pull-requests/{pr-number}/         # PR records
github/sync-history/                      # Sync state

architecture/validation.json              # Validation results
architecture/dependencies.json            # Dependencies
architecture/duplicates.json              # Duplicates
architecture/evolution.json               # Evolution

docs/AGENT-MIGRATION-INVENTORY.md         # System docs
docs/AGENT-ORGANIZATION-SUMMARY.md
docs/BRAIN-ARCHITECTURE-v2.md
docs/ENGINE-ARCHITECTURE-v1.md
docs/ENGINE-INITIALIZATION-DESIGN.md
```

**AI Usage:** "What agents have run?" "What's in the logs?" "How's the system performing?"

---

## Key Files at Root Level

| File | Purpose | Type |
|------|---------|------|
| `CODE-INDEX.yaml` | Global code index | YAML |
| `README.md` | Memory system overview | Markdown |

---

## Summary Statistics

### Before Reorganization
- **18 top-level folders** (including legacy/, working/, empty domains/)
- **1 "legacy" dumping ground** with ACTIVE work
- **1 duplicate folder** (knowledge/context/ == context/)
- **3+ locations** for plans, tasks, PRDs
- **165 markdown files**, **8 YAML files**, **33 JSON files**

### After Reorganization
- **7 top-level folders** (56% reduction)
- **0 "legacy" folders**
- **0 duplicate folders**
- **1 location** for each content type
- **Same file counts** (no data loss)

---

## Benefits of Optimized Structure

### 1. **Cognitive Clarity**
- 7 folders vs 18 = easier to understand
- Each folder has ONE clear purpose
- No "where do I look?" confusion

### 2. **AI Optimization**
- Organized by QUESTION TYPE (how agents think)
- "What are we building?" → plans/
- "Why this way?" → decisions/
- "How does it work?" → knowledge/
- "What should I do?" → tasks/

### 3. **Separation of Concerns**
- **Project memory** (folders 1-6): For agents doing work
- **System operations** (folder 7): For technical monitoring

### 4. **Zero Redundancy**
- No duplicate folders
- No "legacy" dumping ground
- Single source of truth

### 5. **Maintainability**
- Clear where new content goes
- Easy to archive (move from active/ to archived/)
- Consistent patterns across folders

---

## Implementation Steps

1. Create new 7-folder structure
2. Move legacy/ contents to proper homes
3. Delete legacy/ folder
4. Move context/ contents to proper homes
5. Delete context/ folder
6. Delete knowledge/context/ (duplicate)
7. Delete working/ (redundant)
8. Delete empty domains/
9. Consolidate artifacts/ into knowledge/artifacts/
10. Update all README files
11. Verify no files lost (206 files total)

---

## File Inventory Verification

**Total files to account for:**
- Markdown: 165 files
- YAML: 8 files
- JSON: 33 files
- **Total: 206 files**

**All accounted for in new structure.**
