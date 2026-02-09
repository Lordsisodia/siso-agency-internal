# Workspaces Directory

**Purpose:** Working directories for agents during execution.

---

## Directory Structure

```
workspaces/
├── analyzer/       # Analyzer agent workspace
├── architect/      # Architect agent workspace
├── execution/      # Execution agent workspace
├── executor/       # Executor agent workspace
├── planner/        # Planner agent workspace
├── scout/          # Scout agent workspace
└── README.md       # This file
```

---

## Workspace Contents

Each workspace may contain:
- Temporary files
- Scratch data
- Working copies
- Intermediate results

---

## Lifecycle

1. **Created** when agent starts
2. **Used** during execution
3. **Cleaned** after task completion
4. **Archived** if results need preservation

---

## Cleanup Policy

Workspaces are cleaned after task completion unless:
- `preserve: true` flag set
- Task failed (kept for debugging)
- Explicitly requested
