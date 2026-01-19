# Architectural Decision: 6-Folder Memory Structure

**Date**: 2026-01-19
**Status**: 🟢 Accepted
**Author**: Claude (with User)

---

## Context

**Problem**: The project memory system had 18 folders with redundant organization, making it hard for AI agents to find information efficiently.

**Background**:
- Original structure mixed different concerns (project memory vs system operations)
- "Legacy" folder contained 353 KB of ACTIVE work (user profile epic, research, tasks)
- Duplicate `knowledge/context/` folder (5 files duplicated from root `context/`)
- Plans scattered across 3+ locations
- Empty folders cluttering the structure

**Constraints**:
- Must be organized by how AI agents think (by question type)
- Must reduce cognitive load for agents
- Must be maintainable long-term
- Must follow first principles: Simplicity, DRY, YAGNI

**Drivers**:
- **Efficiency**: Agents need to find information quickly
- **Clarity**: Clear where new content goes
- **Scalability**: Easy to grow with the project

---

## Decision

**Solution**: Reorganize to 6-folder structure organized by question type

**Final Structure**:
```
siso-internal/
├── 1. decisions/          # Why we're doing it this way
├── 2. knowledge/          # How it works + what we've learned
├── 3. operations/         # System operations
├── 4. plans/              # What we're building
├── 5. project/            # Project identity & direction
└── 6. tasks/              # What we're working on
```

**Key Changes**:
1. **Eliminated folders**: `legacy/`, `context/`, `domains/`, `working/`, `artifacts/`, `codebase/`, `agents/`, `sessions/`, `logs/`, `workflows/`, `github/`, `architecture/`
2. **Consolidated**: System operations into single `operations/` folder
3. **Moved**: Active work from "legacy" to proper locations
4. **Deleted**: Duplicate `knowledge/context/` folder

---

## Alternatives Considered

### Alternative 1: Keep 18 folders, reorganize within
**Description**: Maintain existing folder count, just reorganize contents

**Pros**:
- ✅ Less disruptive change
- ✅ Familiar structure

**Cons**:
- ❌ Still too many folders (cognitive load)
- ❌ Redundancy remains
- ❌ Doesn't solve the core problem

**Why not chosen**: Too much complexity without solving the root issue

---

### Alternative 2: 4-folder structure (ultra-minimal)
**Description**: Combine related concepts into fewer folders

**Pros**:
- ✅ Even simpler
- ✅ Less traversal

**Cons**:
- ❌ Loses question-based organization
- ❌ Less intuitive for agents
- ❌ Might need re-splitting later

**Why not chosen**: 6 folders is the right balance between simplicity and clarity

---

### Alternative 3: Add navigation layer (keep 18 folders + INDEX files)
**Description**: Keep existing structure but add INDEX.yaml, QUICKSTART.md, etc.

**Pros**:
- ✅ Minimal disruption to existing content

**Cons**:
- ❌ File system IS the index (redundant)
- ❌ Creates maintenance burden
- ❌ Adds steps to find information

**Why not chosen**: Navigation aids don't fix the core organizational problem

---

## Consequences

### Positive
- ✅ **67% reduction** in folders (18 → 6)
- ✅ **Question-based**: Agents can find info by asking questions
- ✅ **No redundancy**: Duplicate folders eliminated
- ✅ **Active work accessible**: No longer buried in "legacy"
- ✅ **Maintainable**: Clear where new content goes
- ✅ **Scalable**: Easy to add new content

### Negative
- ⚠️ **Migration effort**: Took ~2 hours to reorganize
- ⚠️ **Documentation updates**: README files needed updating
- ⚠️ **Learning curve**: Agents need to learn new structure

### Risks
- 🔴 **Risk**: Agents might be confused by new structure
  - **Mitigation**: Comprehensive README, ACTIVE.md dashboard
- 🔴 **Risk**: Some content might have been missed during migration
  - **Mitigation**: Verification step, file counts tracked

---

## Implementation

**Status**: ✅ Complete

**Steps**:
1. ✅ Analyzed current structure (206 files)
2. ✅ Designed 6-folder organization
3. ✅ Moved content to new locations
4. ✅ Deleted old folders
5. ✅ Updated documentation
6. ✅ Verified final structure (135 files, cleaned up duplicates)

**Results**:
- **Folders**: 18 → 6 (67% reduction)
- **Files**: 206 → 135 (eliminated duplicates)
- **Active work**: All accessible in proper locations
- **Structure**: Organized by question type

**Dependencies**:
- None (standalone reorganization)

**Estimated Effort**: 2 hours (actual: 2 hours)

---

## Related

### Links
- **Reorganization Doc**: `.docs/reorganization/REORGANIZATION-COMPLETE.md`
- **Design Doc**: `.docs/reorganization/OPTIMIZED-REORGANIZATION.md`
- **README**: `README.md`

### Related Decisions
- [Remove Empty domains/ Folder](#)
- [Consolidate YAML Files to Root](#)

---

## Lessons Learned

1. **First principles work**: Starting from "how do agents think?" led to better organization
2. **Empty folders are waste**: Don't create structure until content exists
3. **The file system is the index**: Adding navigation layers creates redundancy
4. **Active work should be visible**: "Legacy" folder was a mistake (buried active work)

**What we'd do differently**:
- Start with 6-folder structure from the beginning
- Never create empty folders "just in case"
- Never bury active work in "legacy" folders

---

**Last Updated**: 2026-01-19
**Review Date**: 2026-02-19 (1 month review to assess effectiveness)
