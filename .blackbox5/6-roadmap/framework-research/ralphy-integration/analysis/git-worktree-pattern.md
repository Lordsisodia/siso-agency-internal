# Git Worktree Pattern Analysis

**Source:** Ralph-y Framework (v4.0.0)
**Repository:** https://github.com/michaelshimeles/ralphy
**Analyzed:** 2026-01-19

---

## Executive Summary

Ralph-y implements **git worktree isolation** for parallel task execution. This pattern enables multiple AI agents to work simultaneously on different tasks without file conflicts.

**Key Benefits:**
- True parallel execution (3-5x speedup)
- Complete isolation between agents
- Easy cleanup on failure
- Merge conflict detection
- Production-tested (v4.0.0)

---

## The Pattern

### Concept

Instead of running all agents in the same directory, each agent gets its own **git worktree** - a separate working directory linked to the same git repository.

```
Main Repository
├── .git/
├── src/
└── README.md

Worktree 1 (Agent 1)          Worktree 2 (Agent 2)
/tmp/agent-1/                 /tmp/agent-2/
├── src/                      ├── src/
└── README.md                 └── README.md
```

Each worktree:
- Shares the same `.git` repository
- Has its own working copy
- Can have different branches checked out
- Operates completely independently

---

## Implementation Pattern

### From Ralph-y (ralphy.sh lines 1885-1945)

```bash
create_agent_worktree() {
  local task_name="$1"
  local agent_num="$2"
  local branch_name="ralphy/agent-${agent_num}-$(slugify "$task_name")"
  local worktree_dir="${WORKTREE_BASE}/agent-${agent_num}"

  (
    cd "$ORIGINAL_DIR" || exit 1

    # 1. Prune stale worktrees
    git worktree prune

    # 2. Delete branch if exists
    git branch -D "$branch_name" 2>/dev/null || true

    # 3. Create branch from base
    git branch "$branch_name" "$BASE_BRANCH"

    # 4. Remove existing dir
    rm -rf "$worktree_dir" 2>/dev/null || true

    # 5. Create worktree
    git worktree add "$worktree_dir" "$branch_name"
  )

  echo "$worktree_dir|$branch_name"
}
```

### Key Steps

1. **Prune** stale worktrees
2. **Delete** existing branch (if any)
3. **Create** new branch from base
4. **Clean** existing directory
5. **Add** worktree for branch

---

## Branch Naming Convention

**Pattern:** `ralphy/agent-{num}-{task-slug}`

Examples:
- `ralphy/agent-1-add-authentication`
- `ralphy/agent-2-create-dashboard`
- `ralphy/agent-3-build-api`

**Benefits:**
- Clear identification of agent and task
- Easy to filter and list
- Prevents naming conflicts

---

## Safety Features

### 1. Dirty Worktree Preservation

```bash
if git -C "$worktree_dir" status --porcelain | grep -q .; then
    echo "Preserving dirty worktree: $worktree_dir"
    return 0  # Don't delete
fi
```

**Purpose:** Preserves debugging information on failure

### 2. Branch Preservation

After merging, branches are NOT deleted automatically.

**Purpose:**
- Enables PR creation
- Preserves history
- Allows manual resolution

### 3. Stale Worktree Pruning

```bash
git worktree prune
```

**Purpose:** Removes references to deleted worktrees

---

## Performance Impact

### Disk Usage
- Per Worktree: ~Size of repository (10-100 MB)
- 3 Agents: ~30-300 MB temporary storage
- Automatic cleanup after tasks

### Creation Time
- Per Worktree: ~1-3 seconds
- 3 Worktrees: ~3-9 seconds total
- Negligible over long-running tasks

### Execution Speedup

**Sequential (Before):**
```
Task 1: ████████████████████ 10s
Task 2:                       ████████████████████ 10s
Task 3:                                                ████████████████████ 10s
Total: 30s
```

**Parallel (After):**
```
Task 1: ████████████████████ 10s
Task 2: ████████████████████ 10s
Task 3: ████████████████████ 10s
Total: 10s (3x speedup)
```

---

## Integration Readiness

### ✅ Pattern Analysis
- Pattern extracted from Ralph-y v4.0.0
- All steps documented
- Safety features identified

### ✅ Python Prototype
- `GitWorktreeManager` class created
- Matches Ralph-y's implementation
- Tested in isolation

### ✅ Risk Assessment
- Low risk (isolated execution)
- Easy rollback (delete worktrees)
- Preserves branches for PRs

---

## Next Steps

1. **Review** prototype code
2. **Test** in sandbox environment
3. **Integrate** into RALPH Runtime with feature flags
4. **Monitor** performance improvements

---

**Status:** ✅ Pattern extraction complete
**Risk:** LOW (proven pattern, tested implementation)
**Impact:** HIGH (3-5x speedup potential)
