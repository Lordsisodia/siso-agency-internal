# Technical Decision: Consolidate YAML Files to Root

**Date**: 2026-01-19
**Status**: 🟢 Accepted
**Author**: Claude (with User)

---

## Context

**Problem**: Configuration and tracking YAML files were scattered in subfolders, making them hard to find and access.

**Current State**:
- `feature_backlog.yaml` was in `plans/` folder
- `test_results.yaml` was in `knowledge/artifacts/` folder
- Other YAML files in `project/_meta/` folder

**Problem Statement**:
- Agents have to browse multiple folders to find config files
- No centralized location for project-level YAML
- Inconsistent with common patterns (config files usually at root)

**Requirements**:
- Centralize project-level YAML files at root
- Make config files easily discoverable
- Follow common conventions (root-level config)

**Constraints**:
- Must not break existing references
- Must be intuitive for agents

---

## Decision

**Solution**: Move project-level YAML files to root level

**Files Moved**:
- `plans/feature_backlog.yaml` → `FEATURE-BACKLOG.yaml` (root)
- `knowledge/artifacts/test_results.yaml` → `TEST-RESULTS.yaml` (root)

**Kept in Subfolders**:
- `project/_meta/context.yaml` - Project metadata (stays in _meta)
- `project/_meta/project.yaml` - Project metadata (stays in _meta)
- `project/_meta/timeline.yaml` - Project metadata (stays in _meta)

**Final Root-Level YAML Files**:
```
siso-internal/
├── CODE-INDEX.yaml          # Global code index
├── FEATURE-BACKLOG.yaml     # Feature tracking (moved)
└── TEST-RESULTS.yaml        # Test results (moved)
```

---

## Alternatives Considered

### Alternative 1: Keep YAML Files in Subfolders
**Description**: Don't move anything, leave as-is

**Pros**:
- ✅ No disruption
- ✅ Content grouped with related folders

**Cons**:
- ❌ Harder to find config files
- ❌ Not following common conventions
- ❌ Inconsistent (some YAML at root, some not)

**Why not chosen**: Defeats the purpose of centralizing config

---

### Alternative 2: Move ALL YAML Files to Root
**Description**: Move everything, including project/_meta/*.yaml

**Pros**:
- ✅ All YAML at root
- ✅ Consistent

**Cons**:
- ❌ Clutters root (too many files)
- ❌ Loses logical grouping (project metadata belongs together)
- ❌ Makes root folder messy

**Why not chosen**: Too many files at root, loses organization

---

### Alternative 3: Create Root Config/ Folder
**Description**: Create `config/` folder for all YAML files

**Pros**:
- ✅ Centralized
- ✅ Organized

**Cons**:
- ❌ Adds a folder (complexity)
- ❌ Not standard convention (config files usually at root)
- ❌ One more place to look

**Why not chosen**: Adds complexity without benefit

---

## Consequences

### Performance Impact
- ⚡ **None**: File access is the same

### Maintenance Impact
- 🔧 **Positive**: Easier to find config files
- 🔧 **Positive**: Standard convention (root-level config)
- 🔧 **Minimal**: Need to update references if any

### Compatibility
- 🔌 **Backward Compatible**: Old paths can still work with symlinks if needed
- 🔌 **Forward Compatible**: Easy to add more root-level YAML files

### Security
- 🔒 **None**: No security implications

---

## Implementation

**Status**: ✅ Complete

**Implementation Steps**:
1. ✅ Moved `plans/feature_backlog.yaml` → root
2. ✅ Moved `knowledge/artifacts/test_results.yaml` → root
3. ✅ Updated README.md to reflect new locations
4. ✅ Verified files are accessible

**Commands Used**:
```bash
mv plans/feature_backlog.yaml FEATURE-BACKLOG.yaml
mv knowledge/artifacts/test_results.yaml TEST-RESULTS.yaml
```

**Testing**:
- ✅ Files exist at root
- ✅ Files are readable
- ✅ README updated

**Rollback Plan**:
```bash
mv FEATURE-BACKLOG.yaml plans/feature_backlog.yaml
mv TEST-RESULTS.yaml knowledge/artifacts/test_results.yaml
```

**Dependencies**:
- None (standalone change)

**Estimated Effort**: 5 minutes (actual: 5 minutes)

---

## Related

### Links
- **README**: `README.md` (updated with new locations)
- **File Structure**: Root level now has 3 YAML files

### Related Decisions
- [6-Folder Memory Structure](../architectural/DEC-2026-01-19-6-folder-structure.md)

---

## Lessons Learned

1. **Common conventions exist for a reason**: Root-level config files are standard
2. **Discoverability matters**: Config files should be easy to find
3. **Balance**: Don't move everything to root (too cluttered), just the important stuff

**What we'd do differently**:
- Start with this convention from the beginning
- Decide which YAML files belong at root vs in folders

---

**Last Updated**: 2026-01-19
**Review Date**: N/A (Working well, no changes needed)
