# Busy Town - Complete Research Analysis

## Overview

**URL**: https://github.com/gordonbrander/busytown
**Stars**: 37
**Language**: TypeScript/Deno

A multi-agent coordination framework built around a shared SQLite event queue. Each agent is a separate Claude Code instance that listens for events, reacts to them, and pushes new events.

---

## Architecture

```
┌──────────┐    push     ┌─────────────────┐    dispatch    ┌───────────┐
│  User /  │───────────▸ │  SQLite Event   │ ─────────────▸ │  Agent    │
│  Script  │             │  Queue          │                │  (Claude) │
└──────────┘             │                 │ ◂───────────── └───────────┘
                         │  events table   │    push new
                         │  worker_cursors │    events
                         │  claims         │
                         └─────────────────┘
```

---

## SQLite Schema

### Tables Created

```sql
-- Events table (the queue)
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
  type TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}'
);

-- Worker cursors (per-agent position tracking)
CREATE TABLE worker_cursors (
  worker_id TEXT PRIMARY KEY,
  since INTEGER NOT NULL DEFAULT 0,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Claims (first-claim-wins for concurrency)
CREATE TABLE claims (
  event_id INTEGER PRIMARY KEY,
  worker_id TEXT NOT NULL,
  claimed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### Database Initialization

```typescript
db.exec("PRAGMA journal_mode = WAL");     // Write-Ahead Logging
db.exec("PRAGMA busy_timeout = 5000");   // Wait up to 5s for locks
db.exec("PRAGMA foreign_keys = ON");    // Enforce FK constraints
```

---

## Core Concepts

### 1. Cursor-Based Delivery (Pull Pattern)

Each worker maintains its own cursor position. Cursor advances when event is READ (not processed), giving at-most-once delivery.

```typescript
// Get or create cursor - new workers start at current tail
export const getOrCreateCursor = (db, workerId) => {
  const existing = db.prepare("SELECT since FROM worker_cursors WHERE worker_id = ?").get(workerId);
  if (existing) return existing.since;
  // Push sys.cursor.create event, set cursor to that ID
  const event = pushEvent(db, workerId, "sys.cursor.create", { worker_id: workerId });
  updateCursor(db, workerId, event.id);
  return event.id;
};
```

### 2. First-Claim-Wins (Concurrency)

```typescript
export const claimEvent = (db, workerId, eventId) => {
  // INSERT OR IGNORE - only first worker succeeds
  db.prepare("INSERT OR IGNORE INTO claims (event_id, worker_id) VALUES (?, ?)").run(eventId, workerId);
  // Check if WE won
  const row = db.prepare("SELECT worker_id FROM claims WHERE event_id = ?").get(eventId);
  return row?.worker_id === workerId;
};
```

### 3. Event Type Matching

Supports three modes:
- **Exact match**: `plan.created`
- **Prefix glob**: `file.*` (catches `file.create`, `file.modify`)
- **Wildcard**: `*` (catch all)

```typescript
export const eventMatches = (event: Event, listen: string[]): boolean => {
  for (const pattern of listen) {
    if (pattern === "*") return true;
    else if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -1);
      if (event.type.startsWith(prefix)) return true;
    } else {
      if (event.type === pattern) return true;
    }
  }
  return false;
};
```

---

## Agent System

### Agents as Markdown Files

Agent definition is a markdown file with YAML frontmatter:

```yaml
---
type: claude                    # or "shell" for lightweight scripts
description: Explores codebase and writes plans
model: "opus"                   # claude model to use
listen:
  - "plan.request"
  - "review.created"
emits:
  - "plan.created"
allowed_tools:
  - "Read"
  - "Grep"
  - "Glob"
  - "Write"
effort: medium                  # low, medium, or high
---

# Plan Agent

You create implementation plans...
```

- `body` = system prompt for Claude agents
- `listen` = event types to react to
- `allowed_tools` = tool permissions

### Shell Agents

Lightweight agents that run shell scripts:

```yaml
---
type: shell
listen:
  - "file.create"
---

path={{event.payload.path}} echo "Processing $path"
deno fmt "$path" busytown events push --type file.formatted
```

Template syntax: `{{key}}` for shell-escaped, `{{{key}}}` for raw.

### Tool Permission Handling

```typescript
// Allow agents to run busytown events commands
const tools = [...allowedTools, "Bash(busytown events:*)"];
```

For restricted tools, uses MCP permission server:
- Agent requests tool → MCP server pushes `permission.request` event
- Human/UI processes → pushes `permission.response`
- MCP returns allow/deny to Claude

---

## Worker System

### Parallel Event Processing

Each agent runs as an independent async worker, polling SQLite:

```typescript
const forkWorker = async (worker: Worker, abortSignal: AbortSignal): Promise<void> => {
  while (!abortSignal.aborted) {
    const event = getNextEvent(db, getOrCreateCursor(db, worker.id));
    if (!event) {
      await abortableSleep(timeout, abortSignal);
      continue;
    }
    updateCursor(db, worker.id, event.id);
    if (worker.ignoreSelf && event.worker_id === worker.id) continue;
    if (eventMatches(event, worker.listen)) {
      await manageEffect(worker, event, abortSignal);
    }
  }
};
```

### Error Handling

Errors are captured and pushed as events:
- `sys.worker.<agent-id>.error` - on failure
- `sys.worker.<agent-id>.finish` - on success

No automatic retry - external systems handle retries by emitting new events.

---

## CLI Commands

```bash
# Run agent poll loop
busytown run
busytown start          # background daemon

# Event queue
busytown events push --type my.event --worker agent1 --payload '{"key":"value"}'
busytown events list --type plan.* --limit 10 --tail
busytown events watch --worker my-agent
busytown events cursor --worker my-agent
busytown events claim --event 42 --worker my-agent

# Dashboard
busytown dashboard

# Push PRD for planning
busytown plan prds/my-feature.md
```

---

## TUI Dashboard

### Structure (React + Ink)

- **Agents Panel**: Real-time agent status (idle, processing, error)
- **Files Panel**: Recent file operations (create, modify, delete, rename)
- **Claims Panel**: Which agents are processing which events
- **Stats Panel**: Aggregate statistics
- **Event Stream Panel**: Scrolling event log

### Keyboard Shortcuts

- `j/k` - scroll
- `y/n` - allow/deny permission
- `s` - toggle system events
- `Tab` - switch panel focus
- `q` - quit

---

## Filesystem Watcher

### Events Generated

- `file.create` - new file
- `file.modify` - file changed
- `file.delete` - file removed
- `file.rename` - file renamed

### Key Features

1. **Recursive watching** via `Deno.watchFs()`
2. **Exclusion patterns** - filters .git, node_modules, etc.
3. **Debouncing** - 200ms to aggregate rapid changes
4. **Deduplication** - removes duplicate paths
5. **Relative paths** - normalized to project root

### Default Exclusions

```typescript
const DEFAULT_EXCLUDES = [
  "**/.git/**",
  "**/node_modules/**",
  "**/.DS_Store",
  "*.pid",
  "*.log",
  "logs/**",
  "events.db*",
];
```

---

## Transaction Pattern

```typescript
const transaction = <T>(db, fn) => {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
};
```

Used for atomic operations like `claimEvent` and `getOrCreateCursor`.

---

## Upsert Pattern

```typescript
// INSERT or UPDATE in one statement
db.prepare(
  "INSERT INTO worker_cursors (worker_id, since, timestamp) VALUES (?, ?, unixepoch()) " +
  "ON CONFLICT(worker_id) DO UPDATE SET since = excluded.since"
).run(workerId, sinceId);
```

---

## What We Should Steal for SISO Tasks

### High Priority

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **worker_cursors table** | Track each agent's position | Add to schema |
| **claims table** | First-claim-wins for parallel work | Add to schema |
| **Event type globbing** | Listen for `task.*` not just exact | Update matching logic |
| **sys.* events** | Emit lifecycle events (start, finish, error) | Add to CLI |

### Medium Priority

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Markdown agents** | Define agents as .md files | Agent loader |
| **Shell agents** | Lightweight script agents | New agent type |
| **Filesystem watcher** | Generate file.* events | New module |
| **TUI dashboard** | Visual agent monitoring | Future phase |

### Low Priority

| Feature | Description |
|---------|-------------|
| **MCP permission server** | Tool approval workflow |
| **Event streaming** | Long-poll CLI for real-time |
| **Signal handling** | Graceful shutdown |

---

## Comparison: Our System vs Busy Town

| Feature | SISO Tasks | Busy Town |
|---------|-------------|-----------|
| SQLite DB | ✅ | ✅ |
| Pull-based queue | ✅ | ✅ |
| Per-agent inboxes | ✅ | ✅ |
| Worker cursors | ❌ | ✅ |
| First-claim-wins | ❌ | ✅ |
| Event globbing | ❌ | ✅ |
| Markdown agents | ❌ | ✅ |
| Shell agents | ❌ | ✅ |
| TUI dashboard | ❌ | ✅ |
| FS watcher | ❌ | ✅ |

---

## Files Analyzed

- `/lib/event-queue.ts` - Core SQLite logic
- `/lib/event.ts` - Event types and matching
- `/lib/worker.ts` - Worker system
- `/lib/runner.ts` - Agent runner
- `/lib/agent.ts` - Agent loading
- `/lib/cli.ts` - CLI commands
- `/lib/fs-watcher.ts` - Filesystem watching
- `/lib/tui/app.tsx` - TUI dashboard
- `/agents/plan.md` - Example agent
- `/README.md` - Architecture
