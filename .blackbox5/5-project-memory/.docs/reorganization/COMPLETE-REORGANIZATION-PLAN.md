# SISO Internal Memory - Complete Reorganization Plan

## Executive Summary

**Current state:** 14 top-level folders with massive redundancy, a "legacy" dumping ground, and duplicate content.

**Target state:** 16 top-level folders with clear purposes, no redundancy, no "legacy" folder, optimized for AI retrieval.

**Key changes:**
1. ❌ **ELIMINATE** legacy/ folder entirely
2. ❌ **ELIMINATE** duplicate knowledge/context/ folder
3. ❌ **ELIMINATE** redundant working/ folder
4. ✅ **CREATE** plans/, decisions/, research/, project/, domains/ folders
5. ✅ **CONSOLIDATE** all scattered content into proper locations

---

## Problem Analysis

### Critical Issues Found

1. **"legacy/" folder contains ACTIVE work:**
   - `legacy/plans/user-profile/` - Complete active epic (18 files!)
   - `legacy/research/user-profile/` - Active research
   - `legacy/tasks/active/` - 5 actual active tasks
   - `legacy/pipeline/` - Current feature backlog and test results

2. **DUPLICATE folders:**
   - `knowledge/context/` is an EXACT duplicate of `context/` (same 5 files)
   - `context/prds/` and `artifacts/prds/` - Both for PRDs
   - `context/tasks/` and `tasks/` - Both for tasks
   - `working/` and `tasks/working/` - Both for working tasks

3. **Scattered content:**
   - Plans in 3 places: legacy/plans/, artifacts/plans-archive/, context/prds/
   - Tasks in 3 places: legacy/tasks/, tasks/, context/tasks/
   - Decisions buried in "legacy" when they should be reference-able

4. **Empty/misplaced folders:**
   - `domains/` at root is EMPTY
   - But `context/domains/` has rich content for 10 domains

---

## Complete File Mapping

### Phase 1: CREATE New Folder Structure

```bash
mkdir -p plans/active
mkdir -p plans/prds
mkdir -p plans/features
mkdir -p plans/briefs
mkdir -p plans/archived

mkdir -p decisions/architectural
mkdir -p decisions/technical
mkdir -p decisions/scope

mkdir -p research/active
mkdir -p research/archived

mkdir -p project/goals
mkdir -p project/directions
```

### Phase 2: ELIMINATE legacy/ Folder

| Source | Destination | Notes |
|--------|-------------|-------|
| `legacy/context.yaml` | `project/context.yaml` | Project metadata |
| `legacy/project.yaml` | `project/project.yaml` | Project metadata |
| `legacy/timeline.yaml` | `project/timeline.yaml` | Project timeline |
| `legacy/plans/lifelock-gradient-enhancement-plan.md` | `plans/archived/lifelock-gradient-enhancement-plan.md` | Archived plan |
| `legacy/plans/phase-3-stats-section-implementation.md` | `plans/archived/phase-3-stats-section-implementation.md` | Archived plan |
| `legacy/plans/phase-5-ai-legacy-button-implementation.md` | `plans/archived/phase-5-ai-legacy-button-implementation.md` | Archived plan |
| `legacy/plans/phase-5-file-summary.md` | `plans/archived/phase-5-file-summary.md` | Archived plan |
| `legacy/plans/phase1-checklist.md` | `plans/archived/phase1-checklist.md` | Archived plan |
| `legacy/plans/phase1-diet-consolidation-progress.md` | `plans/archived/phase1-diet-consolidation-progress.md` | Archived plan |
| `legacy/plans/phase1-diet-consolidation-summary.md` | `plans/archived/phase1-diet-consolidation-summary.md` | Archived plan |
| `legacy/plans/phase1-documentation-index.md` | `plans/archived/phase1-documentation-index.md` | Archived plan |
| `legacy/plans/phase1-visual-changes.md` | `plans/archived/phase1-visual-changes.md` | Archived plan |
| `legacy/plans/phase2-diet-to-health-nutrition.md` | `plans/archived/phase2-diet-to-health-nutrition.md` | Archived plan |
| `legacy/plans/phase4-execution-log.md` | `plans/archived/phase4-execution-log.md` | Archived plan |
| `legacy/plans/phase4-summary.md` | `plans/archived/phase4-summary.md` | Archived plan |
| `legacy/plans/top-nav-cleanup-analysis.md` | `plans/archived/top-nav-cleanup-analysis.md` | Archived plan |
| `legacy/plans/top-nav-cleanup-implementation.md` | `plans/archived/top-nav-cleanup-implementation.md` | Archived plan |
| `legacy/plans/top-nav-design-alternatives.md` | `plans/archived/top-nav-design-alternatives.md` | Archived plan |
| `legacy/plans/top-nav-further-cleanup-analysis.md` | `plans/archived/top-nav-further-cleanup-analysis.md` | Archived plan |
| `legacy/plans/xp-dashboard-enhancement-plan.md` | `plans/archived/xp-dashboard-enhancement-plan.md` | Archived plan |
| `legacy/plans/xp-store-phase3-implementation.md` | `plans/archived/xp-store-phase3-implementation.md` | Archived plan |
| `legacy/plans/xp-store-test-checklist.md` | `plans/archived/xp-store-test-checklist.md` | Archived plan |
| `legacy/plans/user-profile/` | `plans/active/user-profile/` | **ACTIVE EPIC** - not legacy! |
| `legacy/decisions/architectural/` | `decisions/architectural/` | Reference-able decisions |
| `legacy/decisions/technical/` | `decisions/technical/` | Reference-able decisions |
| `legacy/decisions/scope/` | `decisions/scope/` | Reference-able decisions |
| `legacy/research/user-profile/` | `research/active/user-profile/` | **ACTIVE RESEARCH** - not legacy! |
| `legacy/tasks/active/TASK-2026-01-18-001.md` | `tasks/active/TASK-2026-01-18-001.md` | **ACTIVE TASK** |
| `legacy/tasks/active/TASK-2026-01-18-002.md` | `tasks/active/TASK-2026-01-18-002.md` | **ACTIVE TASK** |
| `legacy/tasks/active/TASK-2026-01-18-003.md` | `tasks/active/TASK-2026-01-18-003.md` | **ACTIVE TASK** |
| `legacy/tasks/active/TASK-2026-01-18-004.md` | `tasks/active/TASK-2026-01-18-004.md` | **ACTIVE TASK** |
| `legacy/tasks/active/TASK-2026-01-18-005.md` | `tasks/active/TASK-2026-01-18-005.md` | **ACTIVE TASK** |
| `legacy/tasks/completed/` | `tasks/completed/` | Merge with existing |
| `legacy/pipeline/feature_backlog.yaml` | `plans/feature_backlog.yaml` | Planning document |
| `legacy/pipeline/test_results.yaml` | `artifacts/test_results.yaml` | Test artifact |
| `legacy/agents/` | **DELETE** | Redundant with agents/ at root |

Then delete entire legacy/ folder.

### Phase 3: REORGANIZE context/ Folder

| Source | Destination | Notes |
|--------|-------------|-------|
| `context/domains/admin/` | `domains/admin/` | Move to root level |
| `context/domains/analytics/` | `domains/analytics/` | Move to root level |
| `context/domains/clients/` | `domains/clients/` | Move to root level |
| `context/domains/financials/` | `domains/financials/` | Move to root level |
| `context/domains/lifelock/` | `domains/lifelock/` | Move to root level |
| `context/domains/partners/` | `domains/partners/` | Move to root level |
| `context/domains/projects/` | `domains/projects/` | Move to root level |
| `context/domains/resources/` | `domains/resources/` | Move to root level |
| `context/domains/tasks/` | `domains/tasks/` | Move to root level |
| `context/domains/xp-store/` | `domains/xp-store/` | Move to root level |
| `context/prds/active/` | `plans/prds/active/` | PRDs belong in plans/ |
| `context/prds/backlog/` | `plans/prds/backlog/` | PRDs belong in plans/ |
| `context/prds/completed/` | `plans/prds/completed/` | PRDs belong in plans/ |
| `context/prds/active/_template.md` | `plans/prds/_template.md` | PRD template |
| `context/features/backlog.md` | `plans/features/backlog.md` | Features belong in plans/ |
| `context/features/planned/` | `plans/features/planned/` | Features belong in plans/ |
| `context/features/under-consideration/` | `plans/features/under-consideration/` | Features belong in plans/ |
| `context/goals/current.md` | `project/goals/current.md` | Goals belong in project/ |
| `context/goals/long-term.md` | `project/goals/long-term.md` | Goals belong in project/ |
| `context/goals/metrics.json` | `project/goals/metrics.json` | Metrics belong in project/ |
| `context/goals/_template/` | `project/goals/_template/` | Goal template |
| `context/directions/roadmap.md` | `project/directions/roadmap.md` | Directions belong in project/ |
| `context/directions/strategy.md` | `project/directions/strategy.md` | Directions belong in project/ |
| `context/directions/vision.md` | `project/directions/vision.md` | Directions belong in project/ |
| `context/tasks/` | **DELETE** | Redundant with tasks/ |
| `context/AGENT-MIGRATION-INVENTORY.md` | `context/AGENT-MIGRATION-INVENTORY.md` | Keep in context/ |
| `context/AGENT-ORGANIZATION-SUMMARY.md` | `context/AGENT-ORGANIZATION-SUMMARY.md` | Keep in context/ |
| `context/BRAIN-ARCHITECTURE-v2.md` | `context/BRAIN-ARCHITECTURE-v2.md` | Keep in context/ |
| `context/ENGINE-ARCHITECTURE-v1.md` | `context/ENGINE-ARCHITECTURE-v1.md` | Keep in context/ |
| `context/ENGINE-INITIALIZATION-DESIGN.md` | `context/ENGINE-INITIALIZATION-DESIGN.md` | Keep in context/ |
| `context/README.md` | Update with new structure | Update documentation |

### Phase 4: CONSOLIDATE artifacts/ Folder

| Source | Destination | Notes |
|--------|-------------|-------|
| `artifacts/prds/` | **DELETE** | Empty, redundant with plans/prds/ |
| `artifacts/plans-archive/*` | `plans/archived/` | Merge with legacy/plans/* |
| `artifacts/product-briefs/*` | `plans/briefs/` | Product briefs |
| `artifacts/architecture-specs/` | `artifacts/architecture-specs/` | Keep |
| `artifacts/dev-records/` | `artifacts/dev-records/` | Keep |
| `artifacts/GITHUB-SYNC-COMPLETE.md` | `artifacts/GITHUB-SYNC-COMPLETE.md` | Keep |
| `artifacts/README.md` | Update with new structure | Update documentation |

### Phase 5: ELIMINATE DUPLICATE knowledge/context/

| Source | Destination | Notes |
|--------|-------------|-------|
| `knowledge/context/` | **DELETE ENTIRELY** | Exact duplicate of root context/ |

This folder contains:
- AGENT-MIGRATION-INVENTORY.md (duplicate)
- AGENT-ORGANIZATION-SUMMARY.md (duplicate)
- BRAIN-ARCHITECTURE-v2.md (duplicate)
- ENGINE-ARCHITECTURE-v1.md (duplicate)
- ENGINE-INITIALIZATION-DESIGN.md (duplicate)

### Phase 6: ELIMINATE REDUNDANT working/

| Source | Destination | Notes |
|--------|-------------|-------|
| `working/test/` | **DELETE** | Just a test folder, redundant with tasks/working/ |
| `working/` | **DELETE** | Entire folder redundant |

### Phase 7: DELETE EMPTY domains/

| Source | Destination | Notes |
|--------|-------------|-------|
| `domains/` (empty) | **DELETE** | Will be replaced by context/domains/* |

---

## Final Structure (16 Folders)

### 1. agents/
**Purpose:** Agent memory and tracking
```
agents/
├── active/              # Currently running agents
├── history/             # Past agent sessions
│   ├── sessions/        # Named sessions
│   ├── patterns/        # Cross-session patterns
│   └── metrics/         # Aggregate metrics
└── README.md
```

### 2. architecture/
**Purpose:** Architecture validation and enforcement
```
architecture/
├── validation.json      # Validation results
├── dependencies.json    # Dependency graph
├── duplicates.json      # Duplicate detection
├── evolution.json       # Architecture evolution
└── README.md
```

### 3. artifacts/
**Purpose:** Completed work outputs and deliverables
```
artifacts/
├── architecture-specs/  # Architecture specifications
├── dev-records/         # Development records
├── test_results.yaml    # Test results
├── GITHUB-SYNC-COMPLETE.md
└── README.md
```

### 4. codebase/
**Purpose:** Code patterns, gotchas, and structure knowledge
```
codebase/
├── patterns/            # Discovered code patterns
├── gotchas/             # Common pitfalls
├── code_index.md        # Code index
└── README.md
```

### 5. context/
**Purpose:** High-level project context (engine/architecture docs)
```
context/
├── AGENT-MIGRATION-INVENTORY.md
├── AGENT-ORGANIZATION-SUMMARY.md
├── BRAIN-ARCHITECTURE-v2.md
├── ENGINE-ARCHITECTURE-v1.md
├── ENGINE-INITIALIZATION-DESIGN.md
└── README.md
```

### 6. decisions/ ⭐ NEW
**Purpose:** All project decisions (architectural, technical, scope)
```
decisions/
├── architectural/       # Architecture decisions
├── technical/           # Technical decisions
└── scope/              # Scope decisions
```

### 7. domains/ ⭐ NEW (from context/domains/)
**Purpose:** Domain organization and context
```
domains/
├── admin/              # Admin domain
│   ├── DOMAIN-CONTEXT.md
│   ├── FEATURES.md
│   ├── COMPONENTS.md
│   ├── PAGES.md
│   └── REFACTOR-HISTORY.md
├── analytics/          # Analytics domain
├── clients/            # Clients domain
├── financials/         # Financials domain
├── lifelock/           # LifeLock domain
├── partners/           # Partners domain
├── projects/           # Projects domain
├── resources/          # Resources domain
├── tasks/              # Tasks domain
└── xp-store/           # XP Store domain
```

### 8. github/
**Purpose:** GitHub integration memory
```
github/
├── issues/             # GitHub issue records
├── pull-requests/      # PR records
├── sync-history/       # Sync state
└── README.md
```

### 9. knowledge/
**Purpose:** Knowledge graph (entities, relationships, embeddings)
```
knowledge/
├── entities/           # Knowledge graph nodes
├── relationships/      # Entity relationships
├── embeddings/         # Vector embeddings
└── README.md
```

### 10. logs/
**Purpose:** System logs
```
logs/
├── agent-logs/         # Agent execution logs
├── logs/               # System logs
└── README.md
```

### 11. plans/ ⭐ NEW
**Purpose:** All planning documents (PRDs, epics, features, archived)
```
plans/
├── active/             # Active plans
│   └── user-profile/   # User profile epic (from legacy/plans/)
├── prds/               # Product requirements (from context/prds/)
│   ├── active/
│   ├── backlog/
│   ├── completed/
│   └── _template.md
├── features/           # Features (from context/features/)
│   ├── backlog.md
│   ├── planned/
│   └── under-consideration/
├── briefs/             # Product briefs (from artifacts/product-briefs/)
├── archived/           # Archived plans (merge of legacy/plans/ and artifacts/plans-archive/)
│   ├── lifelock-gradient-enhancement-plan.md
│   ├── phase1-checklist.md
│   ├── top-nav-cleanup-implementation.md
│   └── ... (20+ archived plans)
└── feature_backlog.yaml # From legacy/pipeline/
```

### 12. project/ ⭐ NEW
**Purpose:** Project metadata, goals, and directions
```
project/
├── context.yaml        # Project context (from legacy/)
├── project.yaml        # Project metadata (from legacy/)
├── timeline.yaml       # Timeline (from legacy/)
├── goals/              # Goals (from context/goals/)
│   ├── current.md
│   ├── long-term.md
│   ├── metrics.json
│   └── _template/
└── directions/         # Directions (from context/directions/)
    ├── roadmap.md
    ├── strategy.md
    └── vision.md
```

### 13. research/ ⭐ NEW
**Purpose:** All research (active and archived)
```
research/
├── active/             # Active research
│   └── user-profile/   # User profile research (from legacy/research/)
└── archived/           # Archived research
```

### 14. sessions/
**Purpose:** Session transcripts and context
```
sessions/
└── README.md
```

### 15. tasks/
**Purpose:** Task management (active, working, completed, archived)
```
tasks/
├── active/             # Active tasks (from legacy/tasks/active/)
│   ├── TASK-2026-01-18-001.md
│   ├── TASK-2026-01-18-002.md
│   └── ... (5 active tasks)
├── working/            # Working task folders
│   └── _template/
├── completed/          # Completed tasks
├── archived/           # Archived tasks
├── working-archive/    # Additional archive
└── README.md
```

### 16. workflows/
**Purpose:** Workflow execution records
```
workflows/
├── active/             # Currently running workflows
├── history/            # Past workflow executions
└── README.md
```

---

## Files at Root Level

| File | Action | Notes |
|------|--------|-------|
| `CODE-INDEX.yaml` | Keep | Code index |

---

## Summary Statistics

**Before:**
- 14 top-level folders
- 1 "legacy" dumping ground
- 1 duplicate folder (knowledge/context/)
- 3+ scattered plan locations
- 3+ scattered task locations
- 2 PRD locations
- 2 "working" locations

**After:**
- 16 top-level folders
- 0 "legacy" folders
- 0 duplicate folders
- 1 consolidated plans/ location
- 1 consolidated tasks/ location
- 1 consolidated PRDs location (plans/prds/)
- 1 working location (tasks/working/)

**Folders eliminated:**
- legacy/ (entire folder)
- working/ (redundant)
- knowledge/context/ (duplicate)
- context/tasks/ (redundant)
- artifacts/prds/ (redundant)
- artifacts/plans-archive/ (merged)
- context/domains/ (moved to domains/)
- context/prds/ (moved to plans/prds/)
- context/features/ (moved to plans/features/)
- context/goals/ (moved to project/goals/)
- context/directions/ (moved to project/directions/)

**Folders created:**
- plans/ (consolidates all planning documents)
- decisions/ (all decisions in one place)
- research/ (all research in one place)
- project/ (project metadata and goals)
- domains/ (domain organization at root level)

---

## Implementation Order

1. **Create new folder structure** (plans/, decisions/, research/, project/, domains/)
2. **Move legacy/ content** to proper locations
3. **Delete legacy/ folder**
4. **Move context/domains/** to domains/
5. **Move context/prds/** to plans/prds/
6. **Move context/features/** to plans/features/
7. **Move context/goals/** to project/goals/
8. **Move context/directions/** to project/directions/
9. **Delete context/tasks/**
10. **Consolidate artifacts/**
11. **Delete knowledge/context/**
12. **Delete working/**
13. **Update all README files**
14. **Verify no files lost**

---

## Benefits

1. **No "legacy" folder** - Everything properly organized
2. **No duplicates** - Single source of truth
3. **Clear purposes** - Each folder has a defined purpose
4. **AI-optimized** - Organized by how AI searches for information
5. **Active work accessible** - No longer buried in "legacy"
6. **Decisions reference-able** - Not hidden away
7. **Domain knowledge at root** - Easy to find
8. **Plans consolidated** - One location for all planning docs
