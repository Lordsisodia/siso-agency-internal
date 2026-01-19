# Ralph Loop Data Storage Map

**Last Updated:** 2026-01-19
**Purpose:** Complete map of where all Ralph Loop data is stored

---

## Quick Overview

```
.blackbox5/roadmap/first-principles/
│
├── 📋 RALPH-LOOP-PRD.md                          # ✅ Main PRD (34KB)
├── 📋 DATA-STORAGE-MAP.md                       # ✅ This file
│
├── 📁 features/                                  # Phase 2 Output
│   ├── ✅ task-analyzer.md                      # Example
│   ├── ⬜ agent-loader.md                       # To generate
│   ├── ⬜ skill-manager.md                      # To generate
│   └── ⬜ ... (100+ feature docs)
│
├── 📁 challenges/                                # Phase 3 Output
│   ├── ✅ task-analyzer-challenges.md           # Example
│   ├── ⬜ agent-loader-challenges.md            # To generate
│   └── ⬜ ... (100+ challenge docs)
│
├── 📁 validations/                               # Phase 6 Output
│   ├── ✅ task-analyzer-validation.md           # Example
│   └── ⬜ ... (10-20 validation docs)
│
├── 📁 ralph-loop-sessions/                      # Runtime Data
│   ├── 📋 README.md                             # Session directory guide
│   ├── ⬜ session-001-autonomous-discovery/     # Phase 1
│   ├── ⬜ session-002-feature-documentation/    # Phase 2
│   ├── ⬜ session-003-challenge-generation/     # Phase 3
│   ├── ⬜ session-004-registry-update/          # Phase 4
│   ├── ⬜ session-005-validation-planning/      # Phase 5
│   ├── ⬜ session-006-selective-validation/     # Phase 6
│   └── ⬜ session-007-learning-integration/     # Phase 7
│
├── ✅ ASSUMPTION-REGISTRY.yaml                  # Master DB (updated Phase 4)
├── ✅ ASSUMPTIONS-LIST.md                       # Human view (updated Phase 4)
├── ✅ VALIDATION-DASHBOARD.md                   # Progress tracker (updated Phase 4)
├── ✅ COMPREHENSIVE-ASSUMPTIONS-LIST.md         # All assumptions
│
├── ✅ SYSTEM-GUIDE.md                           # System documentation
├── ✅ ASSUMPTION-CHALLENGER-PLAN.md             # Challenger design
├── ✅ ASSUMPTION-REGISTRY-DESIGN.md             # Registry design
├── ✅ TEMPLATE.md                               # Feature doc template
└── ✅ README.md                                 # System overview
```

---

## Complete File Manifest

### 1. Planning Documents (Root)

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `RALPH-LOOP-PRD.md` | 34KB | Main PRD with 300 tasks | ✅ Created |
| `DATA-STORAGE-MAP.md` | - | This file - data storage map | ✅ Created |

### 2. Feature Documentation (features/)

**Purpose:** Store all feature documentation generated in Phase 2

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `task-analyzer.md` | 11KB | Example feature doc | ✅ Exists |
| `agent-loader.md` | - | Agent Loader feature | ⬜ Phase 2 |
| `skill-manager.md` | - | Skill Manager feature | ⬜ Phase 2 |
| `base-agent.md` | - | Base Agent feature | ⬜ Phase 2 |
| `memory-system.md` | - | Memory System feature | ⬜ Phase 2 |
| `ralph-runtime.md` | - | Ralph Runtime feature | ⬜ Phase 2 |
| `decision-engine.md` | - | Decision Engine feature | ⬜ Phase 2 |
| `progress-tracker.md` | - | Progress Tracker feature | ⬜ Phase 2 |
| `error-recovery.md` | - | Error Recovery feature | ⬜ Phase 2 |
| ... | - | 100+ total features | ⬜ Phase 2 |

**Expected Count:** 100-150 feature documents
**Total Size:** ~2-3 MB

### 3. Challenge Documents (challenges/)

**Purpose:** Store generated challenges for each feature's assumptions

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `task-analyzer-challenges.md` | 17KB | Example challenges | ✅ Exists |
| `agent-loader-challenges.md` | - | Agent Loader challenges | ⬜ Phase 3 |
| `skill-manager-challenges.md` | - | Skill Manager challenges | ⬜ Phase 3 |
| ... | - | 100+ total challenges | ⬜ Phase 3 |

**Expected Count:** 100-150 challenge documents
**Total Size:** ~3-5 MB

### 4. Validation Documents (validations/)

**Purpose:** Store validation results for top 10% assumptions

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `task-analyzer-validation.md` | 10KB | Example validation | ✅ Exists |
| `validation-002.md` | - | Top 10% validation #2 | ⬜ Phase 6 |
| `validation-003.md` | - | Top 10% validation #3 | ⬜ Phase 6 |
| ... | - | 10-20 total validations | ⬜ Phase 6 |

**Expected Count:** 10-20 validation documents
**Total Size:** ~500 KB - 1 MB

### 5. Session Data (ralph-loop-sessions/)

**Purpose:** Store Ralph Runtime execution data for each phase

#### Session 001: Autonomous Discovery (Phase 1)

```
session-001-autonomous-discovery/
├── session-metadata.yaml        # Session config
├── execution-log.json           # Event log
├── progress-tracking.yaml       # Task progress
├── decision-history.json        # All decisions
├── feature-inventory.json       # Discovered features
├── errors-and-retries.json      # Error tracking
└── final-report.md              # Session summary
```

**Expected Size:** ~1-2 MB per session
**Contains:** Tasks 001-050 (Discovery phase)

#### Session 002: Feature Documentation (Phase 2)

```
session-002-feature-documentation/
├── session-metadata.yaml
├── execution-log.json
├── progress-tracking.yaml
├── decision-history.json
├── feature-docs-generated.json  # List of docs created
├── quality-metrics.json         # Doc quality scores
└── final-report.md
```

**Expected Size:** ~2-3 MB per session
**Contains:** Tasks 051-150 (Documentation phase)

#### Sessions 003-007

Similar structure for remaining phases.

**Total Session Data:** ~10-15 MB across all 7 sessions

### 6. Registry Files (Root)

**Purpose:** Master databases and human-readable views

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `ASSUMPTION-REGISTRY.yaml` | 12KB | Master assumption DB | ✅ Exists, updated Phase 4 |
| `ASSUMPTIONS-LIST.md` | 14KB | Human-readable list | ✅ Exists, updated Phase 4 |
| `VALIDATION-DASHBOARD.md` | 8KB | Progress dashboard | ✅ Exists, updated Phase 4 |
| `COMPREHENSIVE-ASSUMPTIONS-LIST.md` | 14KB | All 32+ assumptions | ✅ Exists |

**Expected Growth After Phase 4:**
- `ASSUMPTION-REGISTRY.yaml`: 12KB → 500-800 KB (150-200 assumptions)
- `ASSUMPTIONS-LIST.md`: 14KB → 1-2 MB (human-readable format)
- `VALIDATION-DASHBOARD.md`: 8KB → 200-500 KB (tracking all validations)

### 7. System Documentation (Root)

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `SYSTEM-GUIDE.md` | 12KB | User guide | ✅ Exists |
| `ASSUMPTION-CHALLENGER-PLAN.md` | 13KB | Challenger design | ✅ Exists |
| `ASSUMPTION-REGISTRY-DESIGN.md` | 12KB | Registry design | ✅ Exists |
| `TEMPLATE.md` | 3KB | Feature doc template | ✅ Exists |
| `README.md` | 3KB | System overview | ✅ Exists |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INPUT SOURCES                                               │
│  ├── .blackbox5/engine/              → Feature discovery    │
│  ├── .blackbox5/frameworks/          → Feature discovery    │
│  ├── .blackbox5/capabilities/        → Feature discovery    │
│  └── Existing feature docs           → Examples             │
│                                                              │
│  ↓                                                            │
│                                                              │
│  PROCESSING (Ralph Runtime)                                  │
│  ├── Session 001: Discovery → features/                     │
│  ├── Session 002: Documentation → features/                 │
│  ├── Session 003: Challenges → challenges/                  │
│  ├── Session 004: Registry → ASSUMPTION-REGISTRY.yaml       │
│  ├── Session 005: Planning → validation-queue               │
│  ├── Session 006: Validation → validations/                 │
│  └── Session 007: Learning → roadmap updates               │
│                                                              │
│  ↓                                                            │
│                                                              │
│  OUTPUT DATA                                                 │
│  ├── features/*.md                 (100-150 files)          │
│  ├── challenges/*.md               (100-150 files)          │
│  ├── validations/*.md              (10-20 files)            │
│  ├── ralph-loop-sessions/*/        (7 sessions)             │
│  ├── ASSUMPTION-REGISTRY.yaml      (master DB)              │
│  └── ASSUMPTIONS-LIST.md           (human view)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Storage Requirements Summary

### Current (Before Execution)
- **Total Files:** 12 files
- **Total Size:** ~150 KB
- **Directories:** 6 (features, challenges, validations, agents, assumptions, workflows)

### After Phase 1 (Discovery)
- **New Files:** +7 (session files)
- **New Size:** +1-2 MB
- **Artifacts:** feature-inventory.json

### After Phase 2 (Documentation)
- **New Files:** +100-150 (feature docs)
- **New Size:** +2-3 MB
- **Artifacts:** features/*.md

### After Phase 3 (Challenges)
- **New Files:** +100-150 (challenge docs)
- **New Size:** +3-5 MB
- **Artifacts:** challenges/*.md

### After Phase 4 (Registry)
- **Updated Files:** +3 (registry files)
- **New Size:** +1-2 MB (registry growth)
- **Artifacts:** Updated ASSUMPTION-REGISTRY.yaml, etc.

### After Phase 5 (Planning)
- **New Files:** +10 (planning docs)
- **New Size:** +500 KB
- **Artifacts:** Validation plan, schedule, etc.

### After Phase 6 (Validation)
- **New Files:** +10-20 (validation docs)
- **New Size:** +500 KB - 1 MB
- **Artifacts:** validations/*.md

### After Phase 7 (Learning)
- **New Files:** +5 (reports, updates)
- **New Size:** +200-500 KB
- **Artifacts:** Insights, improvements, updates

### FINAL TOTAL
- **Total Files:** ~350-450 files
- **Total Size:** ~10-15 MB
- **Compression Potential:** ~3-5 MB (gzip)

---

## Backup Strategy

### What to Backup
1. **All session data** - irreplaceable execution history
2. **Registry files** - master database
3. **Generated features** - can be regenerated but time-consuming
4. **Validation results** - important findings

### Backup Frequency
- **Session data:** Real-time (after each task)
- **Registry files:** After each phase
- **Generated docs:** After each phase

### Backup Location
```bash
# Primary: Git repository
git add .blackbox5/roadmap/first-principles/
git commit -m "Ralph Loop session updates"

# Secondary: Archive directory
cp -r ralph-loop-sessions/ ../archive/ralph-loop-sessions-backup-$(date +%Y%m%d)/
```

---

## Access Patterns

### Read Access (During Execution)
1. **Ralph Runtime** reads:
   - Session metadata
   - Progress tracking
   - Context variables
   - Previous decisions

2. **Agents** read:
   - Feature docs (examples)
   - Template files
   - Registry (for context)

### Write Access (During Execution)
1. **Ralph Runtime** writes:
   - Execution log (append)
   - Progress tracking (update)
   - Decision history (append)
   - Session metadata (update)

2. **Documentation Agent** writes:
   - Feature docs
   - Challenge docs
   - Validation docs

3. **Registry Updater** writes:
   - ASSUMPTION-REGISTRY.yaml
   - ASSUMPTIONS-LIST.md
   - VALIDATION-DASHBOARD.md

### Read Access (Post-Execution)
1. **Humans** read:
   - Final reports
   - Validation results
   - Assumption lists
   - Dashboards

2. **Analysis tools** read:
   - All session data
   - Registry files
   - Execution logs

---

## Data Integrity

### Validation Checks
```bash
# After each phase, run integrity checks

# 1. Check all expected files exist
find . -name "*.md" | wc -l  # Should match expected count

# 2. Check YAML validity
python -c "import yaml; yaml.safe_load(open('ASSUMPTION-REGISTRY.yaml'))"

# 3. Check JSON validity
for f in ralph-loop-sessions/*/execution-log.json; do
    python -c "import json; json.load(open('$f'))"
done

# 4. Check registry consistency
# Compare assumption counts across files
```

### Corruption Recovery
```bash
# If session data corrupted
1. Restore from git backup
2. Replay from execution log
3. Re-run phase from checkpoint

# If registry corrupted
1. Restore from git backup
2. Reconstruct from feature/challenge docs
3. Validate with checksums
```

---

**Last Updated:** 2026-01-19
**Next Update:** After Phase 1 completion
**Maintainer:** BlackBox5 Engine Team
