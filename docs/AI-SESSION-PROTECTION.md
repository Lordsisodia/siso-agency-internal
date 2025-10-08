# 🛡️ AI Session Protection Protocol

## The Problem That Happened

**Date**: 2025-10-08 19:35
**Impact**: 240+ files modified, UI broken, old components came back
**Cause**: Another AI session made massive changes without isolation

## ⚠️ MANDATORY: Before ANY AI Session

### Option 1: Auto-Snapshot (Recommended)
```bash
# Run this BEFORE starting any AI session
bash scripts/ai-session-snapshot.sh
```

This will:
- ✅ Save current state to `.git/ai-snapshots/`
- ✅ Create restore script if things break
- ✅ Keep last 10 snapshots automatically

### Option 2: Manual Safety
```bash
# Commit everything first
git add .
git commit -m "Before AI session $(date +%Y%m%d_%H%M)"

# OR stash if not ready to commit
git stash push -u -m "Before AI session $(date +%Y%m%d_%H%M)"

# OR create isolated branch
git checkout -b ai-session-$(date +%Y%m%d-%H%M)
```

## 🚨 If AI Breaks Everything

### Quick Recovery
```bash
# Check available snapshots
ls -lt .git/ai-snapshots/

# Restore latest snapshot
bash .git/ai-snapshots/restore_TIMESTAMP.sh

# OR revert to last commit
git restore .
git clean -fd
```

## 📋 Rules for ALL AI Sessions

### ❌ NEVER:
- Start without committing/stashing first
- Modify 100+ files in one session
- Change core routing without approval
- Revert code to old versions
- Remove export statements across multiple files

### ✅ ALWAYS:
1. Run snapshot before starting
2. Work on isolated branches for big features
3. Commit frequently (every 30 min)
4. Test changes before moving to next task
5. Ask before modifying core files

## 🎯 For Different AI Platforms

### Claude Code (This Session)
```bash
# At start of session
bash scripts/ai-session-snapshot.sh
```

### Cursor AI
```bash
# Before opening Cursor
git checkout -b cursor-session
bash scripts/ai-session-snapshot.sh
```

### Windsurf/Other
```bash
# Create isolated workspace
git worktree add ../siso-ai-workspace emergency-directory-restructure
cd ../siso-ai-workspace
```

## 🔄 Restoration Examples

### Restore from snapshot (last hour)
```bash
ls -lt .git/ai-snapshots/ | head -5
bash .git/ai-snapshots/restore_20251008_193000.sh
```

### Restore from stash
```bash
git stash list
git stash apply stash@{0}
```

### Restore to last commit
```bash
git restore .
git clean -fd  # Remove untracked files
```

### Restore to specific commit
```bash
git log --oneline -10
git reset --hard abc1234
```

## 📊 Snapshot Maintenance

Snapshots are auto-cleaned (keeps last 10). To manually check:

```bash
# List all snapshots
ls -lh .git/ai-snapshots/

# Remove old snapshots
rm .git/ai-snapshots/snapshot_20251001_*

# See what changed in a snapshot
cat .git/ai-snapshots/snapshot_TIMESTAMP.status
```

## 🎓 Training Other AIs

When starting a session with a new AI, say:

```
"Before you make any changes:
1. Run: bash scripts/ai-session-snapshot.sh
2. Work on a feature branch
3. Commit every 30 minutes
4. Never modify 100+ files at once"
```

## 🚀 Quick Commands

```bash
# Create snapshot
bash scripts/ai-session-snapshot.sh

# Check current changes
git status --short | wc -l

# See what changed
git diff --stat

# Emergency revert
git restore . && git clean -fd

# List snapshots
ls -lt .git/ai-snapshots/
```

---

**Remember**: 5 seconds creating a snapshot saves 30 minutes debugging! 🎯
