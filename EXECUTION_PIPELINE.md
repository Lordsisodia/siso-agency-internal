# SISO Internal Lab - Execution Pipeline

## Overview

**Stoneforge** is now the execution pipeline for SISO Internal Lab.

## Purpose

When we want to build features or make changes to SISO Internal Lab, we use Stoneforge as the execution pipeline.

## How It Works

```
PM Agent → Creates Task → Stoneforge Director → Workers → Merge Steward → Codebase
```

## Current Setup

- **Location:** `/Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab/`
- **Git:** `.git/` (standalone git repo)
- **Stoneforge:** `.stoneforge/`
- **URL:** http://localhost:3457

## Default Agents

| Agent | Role | Purpose |
|-------|------|---------|
| director | Planner | Receives goals, breaks into tasks |
| e-worker-1 | Worker | Executes tasks |
| e-worker-2 | Worker | Executes tasks |
| m-steward-1 | Steward | Reviews & merges |

## Workflow

1. **Create Task:** `sf task create "Feature name" --priority high`
2. **Director Plans:** Breaks into subtasks
3. **Workers Execute:** In git worktrees
4. **Merge Steward:** Reviews, tests, merges

## Commands

```bash
# Navigate to project
cd /Users/shaansisodia/SISO_Workspace/SISO_Internal_Lab

# Start Stoneforge
sf serve

# Create task
sf task create "Add login feature" --priority 3

# List tasks
sf task list

# Start agents
sf agent start director
```

## Integration with PM Agent

The PM Agent uses `sf` CLI to manage Stoneforge:
- Creates tasks via `sf task create`
- Monitors via `sf task list`
- Checks status via `sf agent list`

## Customization

See `.stoneforge/prompts/OVERRIDE_GUIDE.md` for customizing agent prompts with our skills.

---

**Status:** Active - Ready for execution pipeline use
**Last Updated:** 2026-03-12
