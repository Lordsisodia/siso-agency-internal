# Busy Town Research - Complete Analysis

## What is Busy Town?

**URL**: https://github.com/gordonbrander/busytown

A multi-agent coordination framework built around a shared SQLite event queue. Each agent is a separate Claude Code instance that listens for events, reacts to them, and pushes new events — forming an asynchronous pipeline.

**Stars**: 37 (TypeScript/Deno)
**Key innovation**: Event-driven architecture with zero coupling between agents.

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

### Tables

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

### Key Features

1. **WAL Mode** - `PRAGMA journal_mode = WAL` for concurrent reads/writes
2. **Busy Timeout** - `PRAGMA busy_timeout = 5000` - waits up to 5s for locks
3. **Foreign Keys** - `PRAGMA foreign_keys = ON`

---

## Core Concepts

### 1. Cursor-Based Delivery (The Pull Pattern)

Each worker maintains its own cursor in `worker_cursors`:
- Cursor advances when event is READ (not processed)
- At-most-once delivery guarantee
- New agents start at current tail (not replay history)

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

### 3. Event Types (Pub/Sub)

- **Exact match**: `plan.created`
- **Prefix glob**: `file.*` (catches `file.create`, `file.modify`)
- **Wildcard**: `*` (catch all)

Agents listen for specific event types in their frontmatter:
```yaml
listen:
  - "plan.request"
  - "review.created"
```

### 4. Agents are Just Markdown

Agent definition is a markdown file with YAML frontmatter:
```yaml
---
description: Explores codebase and writes plans
model: "opus"
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
---

# Plan Agent

You create implementation plans...
```

Body = system prompt. Runner injects context about event queue CLI.

### 5. Shell Agents

Lightweight agents that run shell scripts instead of Claude:
```yaml
---
type: shell
listen:
  - "file.create"
---

path={{event.payload.path}} echo "Processing $path"
deno fmt "$path" busytown events push --type file.formatted
```

---

## Included Agents (Plan-Code-Review Loop)

| Agent | Listens For | Does | Pushes |
|-------|-------------|------|--------|
| **plan** | `plan.request`, `review.created` | Reads PRD, explores code, writes plan | `plan.created` |
| **code** | `plan.created` | Implements code | `code.review` |
| **review** | `code.review` | Reviews diff | `review.created` |

Loop continues until reviewer approves.

---

## CLI Commands

```bash
# Push event
busytown events push --type my.event --worker my-script --payload '{"key":"value"}'

# Query events
busytown events list --type plan.* --limit 10 --tail

# Watch for new events (streams ndjson)
busytown events watch --worker my-watcher

# Check cursor position
busytown events cursor --worker my-agent

# Claim an event
busytown events claim --event 42 --worker my-agent
```

---

## What We Can Steal for SISO Tasks

### 1. ✅ Already Have: Queue-Pull Pattern
Our `pull` command works similarly. Keep it.

### 2. ✅ Already Have: Per-Agent Inboxes
Our `view-inbox` is similar. Keep it.

### 3. 🟡 Should Add: Worker Cursors Table
We don't track per-agent cursor position. This is useful for:
- Resuming from where agent left off
- Knowing if agent has seen certain events

### 4. 🟡 Should Add: Claims Table
We don't have first-claim-wins for parallel agents. Could add for:
- Preventing duplicate work
- File leasing (don't edit same file)

### 5. 🟡 Should Add: Event Types with Globbing
Our current system uses exact match on `role`. Could add:
- Prefix matching (`task.*`)
- Wildcards

### 6. 🔴 Could Add: Agents as Markdown Files
Instead of hardcoding roles, define agents as markdown files:
- Easier to version control
- Each agent has clear system prompt
- Tool permissions per agent

### 7. 🔴 Could Add: Shell Agents
For lightweight tasks (formatting, linting) that don't need Claude.

### 8. 🔴 Could Add: TUI Dashboard
Terminal dashboard showing agent activity, events, claims.

---

## Implementation Priority

| Priority | Feature | Effort |
|----------|---------|--------|
| High | Add worker_cursors table | Medium |
| High | Add claims table + claimEvent | Medium |
| Medium | Event type globbing | Low |
| Low | Markdown agent definitions | High |
| Low | Shell agents | Medium |
| Low | TUI dashboard | High |

---

## Files Analyzed

- `/lib/event-queue.ts` - Core SQLite logic
- `/agents/plan.md` - Example agent definition
- `/README.md` - Architecture overview
- `/lib/worker.ts` - Agent runner
