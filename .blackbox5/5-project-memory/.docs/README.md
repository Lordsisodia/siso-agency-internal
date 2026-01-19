# Project Memory Documentation

**Location**: `.blackbox5/5-project-memory/.docs/`
**Purpose**: Documentation for the project memory system

---

## Overview

This folder contains documentation about the project memory system, its structure, and its evolution.

## Contents

### `reorganization/` - Reorganization Documentation

Documents related to the 2026-01-19 reorganization from 18 folders to 7 folders.

**Files:**
- `COMPLETE-REORGANIZATION-PLAN.md` - Initial 16-folder reorganization plan
- `COMPLETE-STRUCTURE-WITH-TEMPLATES.md` - Detailed structure with templates
- `CURRENT-STRUCTURE-ACTUAL-CONTENT.md` - Analysis of actual content before reorganization
- `NEW-STRUCTURE-VISUALIZATION.md` - Visualization of the new structure
- `OPTIMIZED-REORGANIZATION.md` - Final optimized 7-folder structure plan
- `REORGANIZATION-COMPLETE.md` - Summary of completed reorganization
- `REORGANIZATION-PLAN.md` - Initial reorganization plan

**Summary:**
- Reduced from 18 folders to 7 folders (61% reduction)
- Organized by question type (how AI agents think)
- Eliminated duplicate folders
- Moved active work from "legacy" to proper locations

### `code_index.md` - Global Code Index

Located at project root: `.blackbox5/5-project-memory/code_index.md`

Contains:
- Code structure index
- File mappings
- Code relationships

## Quick Reference

### 7-Folder Structure

```
siso-internal/
├── 1. decisions/          # Why we're doing it this way
├── 2. domains/            # How it's organized (10 domains)
├── 3. knowledge/          # How it works + what we've learned
├── 4. operations/         # System operations
├── 5. plans/              # What we're building
├── 6. project/            # Project identity & direction
├── 7. tasks/              # What we're working on
├── CODE-INDEX.yaml        # Global code index
└── .docs/                 # Documentation
```

### Key Benefits

1. **AI-Optimized** - Organized by how agents search for information
2. **Zero Redundancy** - No duplicate folders or files
3. **Active Work Accessible** - No longer buried in "legacy"
4. **Maintainable** - Clear where new content goes
5. **Scalable** - Easy to grow with the project

### File Count

- **Markdown files**: 96
- **YAML files**: 8
- **JSON files**: 31 (agent session data)
- **Total**: 135 files (clean, no duplicates)

## Related Documentation

- `.blackbox5/5-project-memory/README.md` - Project memory system overview
- `.blackbox5/5-project-memory/_template/README.md` - Template documentation
- `.blackbox5/5-project-memory/siso-internal/README.md` - SISO Internal project overview

## History

- **2026-01-19**: Reorganized to 7-folder structure
- **2026-01-18**: Initial project memory system created
