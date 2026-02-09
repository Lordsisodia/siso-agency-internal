# Blackbox4 Structure Cleanup Plan

**Date**: 2026-01-15
**Purpose**: Remove duplicate/empty folders from root directory

---

## Issues Found

### 1. Duplicate config Folders

**Issue**: Two config folders exist:
- `config/` - EMPTY (should be removed)
- `.config/` - ACTIVE (contains actual config files)

**Fix**: Remove empty `config/` folder

**Files in .config** (should keep):
- `memory-config.json` - Semantic search configuration
- `mcp-servers.json` - MCP server configuration
- `model-profiles.yaml` - Model profiles
- `hooks.json` - Git hooks configuration
- `keywords.json` - Keyword extraction rules
- `notifications.json` - Notification settings
- `vendor-patterns.json` - Vendor patterns
- `compact-config.json` - Context compaction config

---

### 2. Empty Runtime Folders in Root

**Issue**: Empty runtime folders in root (should use .runtime/):
- `logs/` - EMPTY
- `runs/` - EMPTY (has manifests/ subfolder)
- `sessions/` - EMPTY
- `state/` - Has circuit-breaker file

**Fix**: Remove empty root folders, consolidate to `.runtime/`

**Actual locations**:
- Logs: `.runtime/.ralph/logs/`, `.runtime/.ralph/work/runner/logs/`
- Runs: `.runtime/.ralph/work/runner/runs/`, `.runtime/.ralph/.ralph/runs/`
- Sessions: `.memory/archival/sessions/`
- State: `.runtime/state/`

---

### 3. core/tree vs ralph/tree

**Issue**: You mentioned this exists but my search didn't find them

**Possible explanations**:
1. Already cleaned up
2. In different location
3. Part of template structure

**Action**: Need to verify if these still exist

---

## Cleanup Plan

### Step 1: Remove Empty Root Folders

```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4

# Remove empty config folder
rmdir config/ 2>/dev/null && echo "✓ Removed empty config/"

# Remove empty logs folder
rmdir logs/ 2>/dev/null && echo "✓ Removed empty logs/"

# Remove empty sessions folder
rmdir sessions/ 2>/dev/null && echo "✓ Removed empty sessions/"

# Check runs folder before removing
if [ -d "runs" ]; then
    if [ "$(ls -A runs/)" == "manifests" ]; then
        # Only has manifests subfolder
        echo "runs/ only has manifests/ - check if needed"
    fi
fi

# Move circuit-breaker file to proper location
if [ -f "state/circuit-breaker-ralph-main.json" ]; then
    mkdir -p .runtime/state/
    mv state/circuit-breaker-ralph-main.json .runtime/state/
    rmdir state/
    echo "✓ Moved circuit-breaker to .runtime/state/"
fi
```

### Step 2: Verify .gitignore

**Current .gitignore entries**:
```
.runtime/
runs/
artifacts/
```

**Should add**:
```
logs/
sessions/
state/
```

### Step 3: Document Proper Structure

**Root directory should have**:
- `.config/` - NOT `config/`
- `.runtime/` - NOT `logs/`, `runs/`, `sessions/` in root
- `.memory/` - Memory system
- `1-agents/` - Agent definitions
- `4-scripts/` - Utility scripts
- etc.

---

## Why These Duplicates Happen

### 1. Template Expansion
- Templates create placeholder folders
- Not all get cleaned up after expansion

### 2. Runtime Directory Creation
- Scripts may create folders in wrong location
- Should use `.runtime/` instead of root

### 3. Working Directory Confusion
- Some scripts use `./` as base
- Should use `$BLACKBOX_ROOT` consistently

---

## Prevention

### 1. Update Templates

Remove these lines from templates:
```bash
mkdir -p config/
mkdir -p logs/
mkdir -p sessions/
mkdir -p runs/
mkdir -p state/
```

### 2. Update Scripts

Ensure scripts use proper paths:
```bash
# Wrong
LOG_FILE="./logs/activity.log"

# Right
LOG_FILE="$BLACKBOX_ROOT/.runtime/.ralph/logs/activity.log"
```

### 3. Add Validation

Add to project setup:
```bash
# Verify structure
verify_structure() {
    # Root should not have these
    for dir in config logs sessions; do
        if [ -d "$dir" ]; then
            echo "Warning: $dir/ should not exist in root"
        fi
    done

    # These should exist in .runtime
    for dir in .runtime/logs .runtime/runs .runtime/state; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
        fi
    done
}
```

---

## Questions for You

1. **runs/ folder**:
   - Has `manifests/` subfolder
   - Is this actively used?
   - Or can it be moved to `.runtime/runs/`?

2. **core/tree vs ralph/tree**:
   - I couldn't find these directories
   - Do they still exist?
   - Or were they already cleaned up?

3. **state/circuit-breaker**:
   - Currently in root `state/` folder
   - Should be in `.runtime/state/`
   - Okay to move?

---

## Recommendation

**Clean up now**:
```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4

# Safe removal of empty folders
rmdir config/ logs/ sessions/ 2>/dev/null

# Move state to proper location
mkdir -p .runtime/state/
mv state/* .runtime/state/ 2>/dev/null
rmdir state/

# Verify
ls -la | grep -E "^d"
```

**Update .gitignore**:
```
# Add these
logs/
sessions/
state/
config/
```

This will prevent future accidental creation of these folders in root.

---

## Summary

| Issue | Fix | Priority |
|-------|-----|----------|
| Empty `config/` | Remove it | High |
| Empty `logs/` | Remove it | High |
| Empty `sessions/` | Remove it | High |
| `state/` in wrong place | Move to `.runtime/state/` | Medium |
| `runs/` in root | Verify usage, move to `.runtime/runs/` | Low |

**Benefits**:
- Cleaner structure
- No confusion about which folders to use
- All runtime data in `.runtime/`
- All config in `.config/`
- Consistent with `.gitignore`

Would you like me to proceed with the cleanup?
