# SISO Task System Infrastructure

## Overview

The SISO Task System is a SQLite-based task management system for coordinating autonomous agents. It provides a centralized queue for task distribution, step-based DAG execution, and artifact versioning.

**Central Database**: `/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db`

---

## Database Schema

### Tables

#### 1. `tasks` - High-level task queue

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Unique task ID (e.g., TASK-0001) |
| `project_id` | TEXT | Project identifier (e.g., SISO_Internal_Lab) |
| `pipeline_type` | TEXT | Pipeline type (execution, research, management) |
| `title` | TEXT | Short task title |
| `category` | TEXT | Category (feature, bugfix, research, etc.) |
| `created_by` | TEXT | Creator (human, agent name) |
| `assigned_to` | TEXT | Assigned agent role |
| `description` | TEXT | Task description |
| `metadata` | TEXT | JSON blob for dependencies, beads, etc. |
| `status` | TEXT | Status (pending, in_progress, done, error) |
| `priority` | INTEGER | Priority (higher = more urgent) |
| `created_at` | DATETIME | Creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

#### 2. `task_steps` - DAG pipeline steps

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Step ID (e.g., STEP-1) |
| `task_id` | TEXT | Parent task ID |
| `step_name` | TEXT | Step name (route, plan, implement, verify) |
| `status` | TEXT | Step status (pending, done, retry, error) |
| `assigned_agent_role` | TEXT | Role that should execute this step |
| `step_order` | INTEGER | Order in the pipeline |
| `input_payload` | TEXT | JSON input for the step |
| `output_payload` | TEXT | JSON output from the step |
| `error_log` | TEXT | Error message if failed |

#### 3. `artifacts` - Versioned context/artifacts

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Artifact ID |
| `task_id` | TEXT | Parent task ID |
| `artifact_type` | TEXT | Type (progress_log, spec, etc.) |
| `content` | TEXT | Artifact content |
| `version` | INTEGER | Version number (auto-increments) |
| `created_by_step_id` | TEXT | Step that created this |
| `created_at` | DATETIME | Creation timestamp |

---

## CLI Tool: `siso-tasks`

**Location**: `/Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py`

**Usage**:
```bash
export SISO_TASKS_DB="/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db"
python3 /Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py <command>
```

### Commands

#### `init`
Initialize the database (creates tables if not exist).

```bash
siso-tasks.py init
```

#### `create-task`
Create a new task.

```bash
siso-tasks.py create-task \
  --id "TASK-0001" \
  --project-id "SISO_Internal_Lab" \
  --pipeline-type "execution" \
  --title "Implement Auth" \
  --category "feature" \
  --created-by "human" \
  --assigned-to "Developer" \
  --description "Add JWT authentication" \
  --metadata '{"dependencies": []}' \
  --priority 10
```

#### `add-step`
Add a step to a task DAG.

```bash
siso-tasks.py add-step \
  --id "STEP-1" \
  --task-id "TASK-0001" \
  --step-name "implement" \
  --role "developer" \
  --order 1 \
  --input-payload '{"context": "..."}'
```

#### `view-inbox`
View pending steps for a role (agent's inbox).

```bash
siso-tasks.py view-inbox --role "developer"
```

#### `pull`
Pull the highest-priority step for a role.

```bash
siso-tasks.py pull --role "developer"
```

#### `update-step`
Update step status after execution.

```bash
siso-tasks.py update-step \
  --id "STEP-1" \
  --status "done" \
  --output-payload '{"result": "..."}'
```

#### `update-artifact`
Write a versioned artifact.

```bash
siso-tasks.py update-artifact \
  --task-id "TASK-0001" \
  --step-id "STEP-1" \
  --type "progress_log" \
  --content "# Progress update..."
```

#### `get-artifact`
Read latest artifact.

```bash
siso-tasks.py get-artifact --task-id "TASK-0001" --type "progress_log"
```

#### `log-execution`
Log agent execution steps (thought/action/observation).

```bash
siso-tasks.py log-execution \
  --step-id "STEP-1" \
  --action-type "tool_call" \
  --details "Ran grep and found 12 files"
```

#### `add-memory`
Save persistent memory for future sessions.

```bash
siso-tasks.py add-memory \
  --task-id "TASK-0001" \
  --session-id "sess-123" \
  --type "learning" \
  --content "The auth router requires a trailing slash"
```

#### `query`
Run raw read-only SQL query.

```bash
siso-tasks.py query --sql "SELECT * FROM tasks WHERE status = 'pending'"
```

---

## How Agents Interact

### 1. PM Creates Task
PM agent creates a task with steps:

```
PM → create-task → add-step → add-step → ...
```

### 2. Agent Checks Inbox
Agent polls for available work:

```
Developer → view-inbox --role "developer"
```

### 3. Agent Pulls Task
Agent pulls highest-priority step:

```
Developer → pull --role "developer"
```

### 4. Agent Executes
Agent does the work, updates step status:

```
Developer → update-step --status "done" --output-payload "{...}"
```

### 5. Agent Writes Progress
Agent writes artifacts for next agents:

```
Developer → update-artifact --type "progress_log" --content "..."
```

---

## Architecture

```
┌─────────────┐
│   PM Agent  │ ← Creates tasks
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  SQLite Queue    │ ← Central task DB
│  (siso_tasks.db) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Agent Inboxes   │ ← Per-role queues
│  (view-inbox)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Agent Pull      │ ← Claim and execute
│  (pull)          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Update Step    │ ← Mark complete
│  (update-step)   │
└──────────────────┘
```

---

## Legacy System (JSON-based)

The old system used JSON files in `/Agent_OS/.tasks/`:

| Directory | Purpose |
|-----------|---------|
| `backlog/` | Queued tasks |
| `in_progress/` | Active tasks |
| `completed/` | Finished tasks |

**Legacy Scripts** (still present but deprecated):
- `get_ready_tasks.py` - List tasks with dependencies complete
- `claim_task.py` - Atomically claim a task
- `link_task_beads.py` - Link beads to tasks
- `check_task_progress.py` - Check bead status

These scripts are **deprecated** — use the SQLite CLI instead.

---

## Best Practices

1. **Always set SISO_TASKS_DB** before running commands
2. **Use pull** instead of manually assigning tasks
3. **Write artifacts** for context passing between agents
4. **Log executions** for audit trails
5. **Use priorities** to control agent focus

---

## File Locations

| Component | Path |
|-----------|------|
| Database | `/Users/shaansisodia/SISO_Workspace/.tasks/siso_tasks.db` |
| CLI Script | `/Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py` |
| SKILL.md | `/Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/SKILL.md` |
| Schema (JSON) | `/Users/shaansisodia/SISO_Workspace/Agent_OS/.tasks/task_schema.json` |
