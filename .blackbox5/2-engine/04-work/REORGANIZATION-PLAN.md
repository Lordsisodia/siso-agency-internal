# 04-Work Analysis & Reorganization Plan

## Current State

The 04-work folder contains **162 files** with a mixed structure that needs clarification.

### Current Structure

```
04-work/
├── .docs/                    # Documentation
├── frameworks/               # AI Frameworks (12 files, 4 frameworks)
│   ├── 1-bmad/
│   ├── 2-speckit/
│   ├── 3-metagpt/
│   └── 4-swarm/
│
├── modules/                  # Work Modules (131 files!)
│   ├── .skills/              # Agent skills (8 files)
│   ├── context/              # Context management (11 files)
│   ├── domain/               # Domain workflows (7 files)
│   ├── first-principles/     # First principles workflows (9 files)
│   ├── implementation/       # Implementation workflows (6 files)
│   ├── kanban/               # Kanban board (8 files)
│   ├── planning/             # Planning tools (9 files)
│   └── research/             # Research tools (20 files)
│
├── tasks/                    # Task Management (18 files)
│   └── task_management/      # Analyzers & tools
│
├── planning/                 # EMPTY FOLDER ❌
└── workflows/                # EMPTY FOLDER ❌
```

## File Inventory

**Total: 162 files**

| Location | Files | Type |
|----------|-------|------|
| **frameworks/** | 12 | Documentation |
| **modules/** | 131 | Mixed (Python + Markdown) |
| **tasks/** | 18 | Python (analyzers) |
| **planning/** | 0 | Empty! |
| **workflows/** | 0 | Empty! |

### By Type

- **Python files**: 32
- **Markdown files**: 126
- **Other**: 4

## Issues Found

### 1. EMPTY FOLDERS ❌
- `planning/` - Empty (should be deleted, planning is in modules/)
- `workflows/` - Empty (should be deleted, workflows are in modules/)

### 2. CONFUSING STRUCTURE ⚠️
- **4 framework folders** at root (numbered: 1-bmad, 2-speckit, 3-metagpt, 4-swarm)
- **8 module folders** in modules/ (some overlap with frameworks?)
- **tasks/** contains task management tools (why not in modules?)
- Unclear what's a "framework" vs "module" vs "task"

### 3. INCONSISTENT ORGANIZATION ⚠️
- `frameworks/` has numbered folders (1-bmad, 2-speckit, etc.)
- `modules/` has named folders (context, domain, planning, etc.)
- `tasks/` has task_management/
- No clear pattern

### 4. POTENTIAL DUPLICATION ⚠️
- `modules/planning/` exists but root `planning/` is empty
- `modules/` has workflows but root `workflows/` is empty
- Some frameworks might overlap with modules

## First Principles Analysis

### WHAT (Purpose)

The 04-work folder contains:
1. **Frameworks** - AI agent frameworks (BMAD, SpeckIt, MetaGPT, Swarm)
2. **Modules** - Work capabilities (context, domain, planning, research, etc.)
3. **Task Management** - Task analysis tools

### HOW (Organization)

**Current Issues:**
- Frameworks numbered (1-4) - why this order?
- Modules mixed (capabilities vs tools)
- Tasks separate but could be a module
- Empty folders confuse structure

**Questions:**
1. What's the difference between a "framework" and a "module"?
   - **Framework**: Complete AI agent system
   - **Module**: Work capability/component

2. Should task management be in modules?
   - **YES** - It's a work capability like the others

3. Why are planning/ and workflows/ empty at root?
   - **MISTAKE** - They exist in modules/ already

## Proposed Organization

### Option A: Flat Structure (RECOMMENDED) ✅

Remove empty folders, organize by purpose:

```
04-work/
├── README.md                # Overview
├── .docs/                   # Documentation
│
├── frameworks/              # AI Frameworks (4)
│   ├── bmad/
│   ├── speckit/
│   ├── metagpt/
│   └── swarm/
│
└── modules/                 # All Work Capabilities
    ├── context/            # Context management
    ├── domain/             # Domain workflows
    ├── first-principles/   # First principles analysis
    ├── implementation/     # Implementation workflows
    ├── kanban/             # Kanban board management
    ├── planning/           # Planning tools
    ├── research/           # Research capabilities
    ├── task-management/    # Move from tasks/
    └── skills/             # Move from .skills/
```

**Changes:**
1. ✅ Delete empty `planning/` and `workflows/` at root
2. ✅ Move `tasks/task_management/` → `modules/task-management/`
3. ✅ Move `modules/.skills/` → `modules/skills/`
4. ✅ Remove numbering from frameworks (1-bmad → bmad)
5. ✅ Create root README.md

### Option B: Frameworks + Capabilities (Alternative)

```
04-work/
├── frameworks/              # AI Frameworks
│   ├── bmad/
│   ├── speckit/
│   ├── metagpt/
│   └── swarm/
│
└── capabilities/            # Rename modules → capabilities
    ├── context/
    ├── domain/
    ├── planning/
    ├── research/
    └── task-management/
```

**Why NOT recommended:**
- "modules" is clearer than "capabilities"
- More renaming required
- "capabilities" vs "skills" confusion

### Option C: Everything as Modules (Not Recommended)

```
04-work/
└── modules/
    ├── frameworks/
    │   ├── bmad/
    │   ├── speckit/
    │   ├── metagpt/
    │   └── swarm/
    ├── context/
    ├── domain/
    └── ...
```

**Why NOT recommended:**
- Frameworks are distinct from modules
- Frameworks are complete systems
- Modules are components/capabilities
- Hides important distinction

## Detailed Implementation Plan (Option A)

### Phase 1: Remove Empty Folders ✅

```bash
# Delete empty folders
rmdir planning/
rmdir workflows/
```

### Phase 2: Move Tasks to Modules ✅

```bash
# Move task_management into modules
mv tasks/task_management modules/task-management

# Remove empty tasks/ folder
rmdir tasks/
```

### Phase 3: Rename .skills to skills ✅

```bash
# Remove dot from folder name
mv modules/.skills modules/skills
```

### Phase 4: Unnumber Frameworks ✅

```bash
cd frameworks/
mv 1-bmad bmad
mv 2-speckit speckit
mv 3-metagpt metagpt
mv 4-swarm swarm
```

### Phase 5: Create Root README.md ✅

Create comprehensive README explaining:
- Frameworks vs Modules
- Structure overview
- How to use each
- Links to documentation

## File Mapping

### Frameworks (no content changes, just rename)

| Old | New |
|-----|-----|
| `frameworks/1-bmad/` | `frameworks/bmad/` |
| `frameworks/2-speckit/` | `frameworks/speckit/` |
| `frameworks/3-metagpt/` | `frameworks/metagpt/` |
| `frameworks/4-swarm/` | `frameworks/swarm/` |

### Modules (consolidate tasks)

| Old | New |
|-----|-----|
| `modules/.skills/` | `modules/skills/` |
| `tasks/task_management/` | `modules/task-management/` |
| `planning/` | **DELETE** (empty) |
| `workflows/` | **DELETE** (empty) |

## Before vs After

### Before ❌

```
04-work/
├── frameworks/
│   ├── 1-bmad/        # Numbered?
│   ├── 2-speckit/
│   ├── 3-metagpt/
│   └── 4-swarm/
├── modules/
│   ├── .skills/        # Dot prefix?
│   ├── context/
│   ├── domain/
│   ├── planning/
│   └── research/
├── tasks/
│   └── task_management/  # Separate?
├── planning/            # EMPTY!
└── workflows/           # EMPTY!
```

**Problems:**
- Empty folders
- Confusing numbered frameworks
- Tasks separate from modules
- Dot-prefixed folder

### After ✅

```
04-work/
├── README.md            # Overview
├── .docs/               # Documentation
│
├── frameworks/          # AI Frameworks
│   ├── bmad/           # Clear names
│   ├── speckit/
│   ├── metagpt/
│   └── swarm/
│
└── modules/             # Work Capabilities
    ├── context/
    ├── domain/
    ├── first-principles/
    ├── implementation/
    ├── kanban/
    ├── planning/
    ├── research/
    ├── skills/         # No dot prefix
    └── task-management/ # Consolidated
```

**Benefits:**
- ✅ No empty folders
- ✅ Clear framework names
- ✅ All capabilities in modules/
- ✅ Consistent naming
- ✅ Easy to understand

## Key Distinctions

### Frameworks vs Modules

**Frameworks** (4):
- Complete AI agent systems
- Independent architectures
- BMAD, SpeckIt, MetaGPT, Swarm
- Used as foundation for agents

**Modules** (9):
- Work capabilities/components
- Pluggable features
- Context, domain, planning, research, etc.
- Used to extend agents

### Categories

**Frameworks:**
1. **bmad** - Blackbox Multi-Agent Development
2. **speckit** - Spec-driven development kit
3. **metagpt** - Multi-agent software development
4. **swarm** - Swarm intelligence patterns

**Modules:**
1. **context** - Context management
2. **domain** - Domain workflows
3. **first-principles** - First principles analysis
4. **implementation** - Implementation workflows
5. **kanban** - Kanban board operations
6. **planning** - Planning tools
7. **research** - Research capabilities
8. **skills** - Agent skills
9. **task-management** - Task analysis

## Verification Steps

After implementation:

```bash
# 1. Check no empty folders
find . -type d -empty

# 2. Verify framework names
ls frameworks/
# Should show: bmad, speckit, metagpt, swarm

# 3. Verify modules
ls modules/
# Should show: context, domain, first-principles, etc.

# 4. Count files
find . -type f | wc -l
# Should still be ~162

# 5. Check structure
tree -L 2 -d
```

## Recommendations

1. ✅ **Implement Option A** - Clean, simple, clear
2. ✅ **Remove empty folders** - planning/, workflows/
3. ✅ **Consolidate tasks** - Move to modules/task-management/
4. ✅ **Rename .skills** - Remove dot prefix
5. ✅ **Unnumber frameworks** - Use clear names
6. ✅ **Create README.md** - Explain structure

## Questions?

1. Do you approve Option A?
2. Should I implement it now?
3. Any concerns about the reorganization?

---

**Status**: Ready for implementation
