# GitHub Sync State

> Track what's synced to GitHub. Avoid duplicate work.

---

**Last Updated**: 2026-01-19 12:45 UTC
**Sync Method**: Manual (via GitHub CLI)
**Repository**: siso-internal (private)
**Repository URL**: https://github.com/siso-agency-internal

---

## 🔄 Sync Overview

| Category | Synced | Pending | Not Tracked |
|----------|--------|--------|-------------|
| **Tasks** | 4 | 1 epic + 18 tasks | - |
| **Epic/Features** | - | 1 epic | - |
| **Research** | - | - | ✅ All research |
| **Decisions** | - | - | ✅ All decisions |
| **Documentation** | - | - | ✅ Internal docs |

**Overall Sync Status**: 🟡 Partial (17% - 4/23 items)

---

## ✅ Synced

### Completed Tasks

| Task ID | Task Name | Issue # | Status | Issue URL | Closed Date |
|---------|-----------|---------|--------|-----------|-------------|
| TASK-2026-01-18-001 | User Profile PRD Creation | #38 | ✅ Closed | [Link](https://github.com/siso-agency-internal/issues/38) | 2026-01-18 |
| TASK-2026-01-18-002 | User Profile Epic Creation | #39 | ✅ Closed | [Link](https://github.com/siso-agency-internal/issues/39) | 2026-01-18 |
| TASK-2026-01-18-003 | User Profile Task Breakdown | #40 | ✅ Closed | [Link](https://github.com/siso-agency-internal/issues/40) | 2026-01-18 |
| TASK-2026-01-18-004 | Project Memory System Migration | #41 | ✅ Closed | [Link](https://github.com/siso-agency-internal/issues/41) | 2026-01-19 |

**Total Synced**: 4 tasks

---

## 🟡 Pending Sync

### User Profile Epic

| Item | Type | Priority | Status | Planned For |
|------|------|----------|--------|-------------|
| **User Profile Epic** | Epic | High | 🟡 Pending Sync | TASK-2026-01-18-005 |
| **18 Implementation Tasks** | Tasks | High | 🟡 Pending Sync | TASK-2026-01-18-005 |

**Epic Details**:
- **Epic File**: `plans/active/user-profile/epic.md`
- **Research**: `knowledge/research/active/user-profile/`
- **PRD**: `plans/prds/active/user-profile.md`
- **Tasks**: 001.md through 018.md (in epic folder)

**Task List**:
```
001. Clerk Authentication Setup
002. Profile Data Models (Supabase)
003. Profile Page Layout (Radix UI)
004. Profile Editing Functionality
005. Avatar Upload System
006. Privacy Settings
007. Profile Display Components
008. Profile State Management
009. Profile API Integration
010. Profile Testing Suite
011. Profile Documentation
012. Profile Accessibility
013. Profile Performance Optimization
014. Profile Security Review
015. Profile Deployment
016. Profile Monitoring Setup
017. Profile User Acceptance Testing
018. Profile Launch Preparation
```

**Expected GitHub Structure**:
```
Epic Issue: #200 (estimated)
├── Task Issues: #201-#218 (18 tasks)
└── All tasks linked to parent epic
```

**Planned Sync Date**: After TASK-2026-01-18-005 completes

**Blocking**: TASK-2026-01-18-005 must complete first

---

### Active Task (Not Yet Synced)

| Task ID | Task Name | Status | Issue # | Notes |
|---------|-----------|--------|---------|-------|
| TASK-2026-01-18-005 | Sync User Profile to GitHub | 🟡 Pending | - | Will create epic + 18 task issues |

---

## ❌ Not Synced (Internal Only)

The following are **NOT tracked in GitHub** - they are internal documentation:

### Research Files
- ✅ `knowledge/research/active/user-profile/*` - (6 research files, 72 KB)
- ✅ `knowledge/research/INDEX.md` - (research index)

**Rationale**: Research is internal knowledge capture. GitHub is for task tracking, not research storage.

### Decision Records
- ✅ `decisions/architectural/*` - (architectural decisions)
- ✅ `decisions/technical/*` - (technical decisions)
- ✅ `decisions/scope/*` - (scope decisions)

**Rationale**: Decisions are internal documentation. Captured in project memory for reference.

### System Documentation
- ✅ `operations/docs/*` - (Brain/Engine architecture)
- ✅ `operations/README.md` files - (operational docs)
- ✅ `.docs/reorganization/*` - (reorganization history)

**Rationale**: System docs are internal. GitHub issues track work, not documentation.

### Work Logs & State
- ✅ `WORK-LOG.md` - (chronological work log)
- ✅ `ACTIVE.md` - (active work dashboard)
- ✅ `project/_meta/*` - (project metadata)

**Rationale**: These are internal state tracking. Not relevant for GitHub issues.

### Agent Memory
- ✅ `operations/agents/history/sessions/*` - (agent sessions)
- ✅ `operations/agents/active/*` - (active agent state)

**Rationale**: Agent memory is internal runtime state. Not tracked in GitHub.

---

## 🛠️ Sync Workflow

### How to Sync Epic + Tasks

**Command**:
```bash
/pm:epic-sync user-profile
```

**What It Does**:
1. Creates epic issue on GitHub
2. Creates 18 task issues on GitHub
3. Links tasks to epic as parent/child
4. Updates local files with issue numbers
5. Creates development worktree (optional)

**Expected Output**:
```
GitHub Epic Issue: #200
├── Task 001 → Issue #201
├── Task 002 → Issue #202
...
└── Task 018 → Issue #218
```

**Files Updated**:
- `plans/active/user-profile/001.md` → `201.md`
- `plans/active/user-profile/002.md` → `202.md`
- ...
- `plans/active/user-profile/018.md` → `218.md`

### Manual Sync (Individual Tasks)

**Create GitHub Issue**:
```bash
gh issue create \
  --title "TASK-2026-01-18-005: Sync User Profile to GitHub" \
  --body "See tasks/active/TASK-2026-01-18-005.md for details" \
  --label "task,user-profile,priority-high"
```

**Link to Epic** (if epic exists):
```bash
gh issue edit <issue-number> \
  --add-assignee "@me" \
  --add-label "epic-parent-#200"
```

---

## 📋 Sync Checklist

### Before Sync
- [ ] Verify epic file is complete
- [ ] Verify all task files are complete
- [ ] Verify research is complete
- [ ] Verify PRD is complete
- [ ] Check for any blockers or dependencies

### During Sync
- [ ] Create epic issue
- [ ] Create all task issues
- [ ] Link tasks to epic
- [ ] Add appropriate labels
- [ ] Add assignees if known

### After Sync
- [ ] Update this file (SYNC-STATE.md)
- [ ] Update task files with issue links
- [ ] Update ACTIVE.md with sync status
- [ ] Update XREF.md with issue numbers
- [ ] Verify all links work

---

## 🏷️ GitHub Labels

### Standard Labels
- `epic` - Epic/feature issues
- `task` - Individual task issues
- `user-profile` - User Profile feature
- `priority-high` - High priority
- `priority-medium` - Medium priority
- `priority-low` - Low priority
- `bug` - Bug reports
- `enhancement` - Feature enhancements
- `documentation` - Documentation tasks
- `internal` - Internal tasks (not customer-facing)

### Status Labels
- `status-backlog` - In backlog
- `status-planned` - Planned
- `status-in-progress` - Currently working
- `status-review` - In review
- `status-done` - Complete

### Type Labels
- `type-planning` - Planning tasks
- `type-development` - Development tasks
- `type-testing` - Testing tasks
- `type-deployment` - Deployment tasks
- `type-documentation` - Documentation tasks

---

## 📊 Sync Statistics

| Metric | Value |
|--------|-------|
| **Total Tracked Items** | 23 (4 tasks + 1 epic + 18 tasks) |
| **Total Synced** | 4 (17%) |
| **Total Pending** | 19 (83%) |
| **Total Not Tracked** | N/A (internal only) |
| **Last Sync** | 2026-01-19 12:45 UTC |
| **Next Sync** | After TASK-2026-01-18-005 completes |

---

## 🔗 Quick Links

### GitHub
- **Repository**: https://github.com/siso-agency-internal
- **Issues**: https://github.com/siso-agency-internal/issues
- **Pull Requests**: https://github.com/siso-agency-internal/pulls

### Local
- **Active Tasks**: `tasks/active/`
- **User Profile Epic**: `plans/active/user-profile/epic.md`
- **Active Work**: `ACTIVE.md`
- **Work Log**: `WORK-LOG.md`

---

## ⚠️ Known Issues

### None

Current sync process is working as expected.

---

## 📝 Notes

### Sync Strategy
- **Tasks**: Sync to GitHub for tracking and visibility
- **Epic**: Sync to GitHub to organize related tasks
- **Research**: Keep in project memory (internal knowledge)
- **Decisions**: Keep in project memory (internal documentation)
- **Documentation**: Keep in project memory (internal docs)

### Issue Number Assignment
- Issues are numbered sequentially by GitHub
- Epic issue will be assigned next available number
- Task issues will be assigned subsequent numbers
- Estimated: Epic #200, Tasks #201-#218 (19 issues total)

### Parent-Child Relationships
- All 18 task issues will be linked to parent epic issue
- GitHub will show the hierarchy
- Progress on epic can be tracked via child task completion

### Worktrees
- After sync, a worktree may be created for development
- Worktree location: `../epic-user-profile/`
- This isolates epic development from main branch

---

## 🔮 Future Sync Plans

### Upcoming Syncs
1. **User Profile Epic** (after TASK-2026-01-18-005)
   - 1 epic issue
   - 18 task issues
   - Link to research and PRD

2. **GitHub Integration Feature** (future)
   - Epic sync
   - Task breakdown
   - Implementation tracking

3. **Vibe Kanban Integration** (future)
   - Epic sync
   - Workflow automation
   - Status tracking

### Automation Plans
- [ ] Automate sync command (pm:epic-sync)
- [ ] Auto-update SYNC-STATE.md after sync
- [ ] Auto-link related issues
- [ ] Auto-create worktrees

---

**Next Review**: After TASK-2026-01-18-005 completes
**Maintainer**: Update this file whenever sync occurs
**Related Files**:
- [ACTIVE.md](../../ACTIVE.md) - Current work status
- [WORK-LOG.md](../../WORK-LOG.md) - Chronological progress
- [User Profile XREF](../plans/active/user-profile/XREF.md) - Feature cross-reference
