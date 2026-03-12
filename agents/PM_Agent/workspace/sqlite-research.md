# SQLite + Claude Code Research

Research into open-source projects combining SQLite with Claude Code / LLM agents.

## Key Projects

### 1. mcp_agent_mail (1,793 stars)
**URL**: https://github.com/Dicklesworthstone/mcp_agent_mail

**What it does**: Inter-agent IPC (Inter-Process Communication) message queue. SQLite-backed with HTTP + CLI, long-poll, per-agent watermarks.

**How it works**:
- Agents have identities and inboxes stored in SQLite
- Async message passing between agents
- Searchable threads for conversation history
- Advisory file leases (locks on files being worked on)

**What we could steal**:
- Per-agent inbox model with watermarks (don't miss messages)
- File leasing to prevent race conditions

---

### 2. engram (1,118 stars)
**URL**: https://github.com/Gentleman-Programming/engram

**What it does**: Persistent memory system for AI coding agents. Agent-agnostic Go binary with SQLite + FTS5, MCP server, HTTP API, CLI, and TUI.

**How it works**:
- Full-text search (FTS5) over memories
- Memories tagged by type, date, context
- MCP server for integration with Claude Code
- CLI and TUI for human interaction

**What we could steal**:
- FTS5 for searching task history
- Memory types/categories
- TUI for viewing tasks

---

### 3. busy town (37 stars)
**URL**: https://github.com/gordonbrander/busytown

**What it does**: Multi-agent factories coordinated over a SQLite queue.

**How it works**:
- Agents are "workers" that pull from SQLite queue
- Each task has status (pending, in-progress, done)
- SQLite ensures atomicity for concurrent access

**What we could steal**:
- The exact queue-pull pattern we already have!
- Clean task state machine

---

### 4. meta_skill (134 stars)
**URL**: https://github.com/Dicklesworthstone/meta_skill

**What it does**: Local-first skill management platform for AI coding agents. Dual SQLite+Git persistence, semantic search, bandit-optimized suggestions, MCP integration.

**How it works**:
- Skills stored in both SQLite (for fast querying) and Git (for versioning)
- Semantic search over skill descriptions
- Suggests skills based on context

**What we could steal**:
- Dual persistence (SQLite + Git for artifacts)
- Skill recommendation system

---

### 5. claude-code-el-ipc (0 stars)
**URL**: https://github.com/mividtim/claude-code-el-ipc

**What it does**: Inter-agent IPC message queue for Claude Code. SQLite-backed, HTTP + CLI, long-poll, per-agent watermarks.

**How it works**:
- Simple message queue in SQLite
- Long-polling for real-time-ish updates
- Per-agent watermarks (track what you've read)

---

### 6. local-mem (1 star)
**URL**: https://github.com/Teddorf/local-mem

**What it does**: Persistent local memory for Claude Code. SQLite + FTS5, zero dependencies, MCP server + hooks.

**How it works**:
- Lightweight alternative to engram
- FTS5 for full-text search
- Hooks into Claude Code context

---

### 7. multi-agent-setup (0 stars)
**URL**: https://github.com/mnesler/multi-agent-setup

**What it does**: Multi-agent system with Claude Code, SQLite, and tmux for local development orchestration.

**How it works**:
- Multiple Claude Code agents in tmux panes
- SQLite for coordination
- Shell-based orchestration

---

## Summary: What to Steal

| Feature | Project | How |
|---------|---------|-----|
| Agent inboxes with watermarks | mcp_agent_mail | Track what's been read |
| Full-text search | engram, local-mem | FTS5 for task/memory search |
| Queue-pull coordination | busy town | Already implemented! |
| Dual SQLite+Git | meta_skill | Version artifacts in Git |
| File leasing | mcp_agent_mail | Prevent concurrent edits |

## Conclusion

Our current siso-tasks design aligns with:
- busy town (queue-pull pattern)
- mcp_agent_mail (per-agent inboxes)

Future enhancements to consider:
1. FTS5 for searching task history
2. Memory table for cross-session learning
3. File leasing for concurrent safety
