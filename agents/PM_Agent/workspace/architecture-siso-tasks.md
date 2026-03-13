# SISO Tasks CLI — Architecture Document

## 1. The Problem

To support autonomous pipelines, interactive PMs, massive scale, and zero cost, we must abandon both:
- **Massive Cloud Databases** — APIs, billing, vendor lock-in
- **Raw File-System Folders** — Race conditions, context bloat

## 2. The Solution: SQLite + Native CLI

### The Source of Truth (siso_tasks.db)

Replace the entire `/.tasks/` folder structure with a single local file: `Agent_OS/.tasks/siso_tasks.db` (SQLite).

- Completely free, runs natively on your machine
- Handles concurrent readers/writers via WAL mode
- Zero server setup

### The Agent UI (Native CLI Skill)

Abandon heavy MCP Servers. Running background Node/Python servers and passing JSON-RPC overhead is wasteful.

**Bleeding-Edge Paradigm: Agent Skills**
- Build a hyper-lean native Python CLI (`siso-tasks`)
- Create a single `SKILL.md` in the agent's workspace
- Autonomous agents read the SKILL.md and execute `siso-tasks pull --project SISO_Internal_Lab`
- Zero JSON-RPC latency, zero background server overhead

### The Interactive View (PMs)

The PM Agent uses the same `siso-tasks report` CLI command via shell to instantly read SQLite state.

---

## 3. Single Project DB vs. DB-per-Agent

**One database per Project, NOT one per Agent.**

### The 'Pull' Queue vs 'Push' Bottleneck

| DB per Agent (Bad) | Central DB (Standard) |
|---|---|
| PM juggles 10 different DB files | PM dumps 100 tasks into central queue |
| Must figure out which agent is free | Agents poll central DB themselves |
| Complex routing | How AWS SQS, Kafka, Kubernetes work |

### Global Visibility UX

- Central DB: One query sees all tasks
- DB per Agent: PM connects to 50 different SQLite files to aggregate a report

**Conclusion**: The Project owns the tasks in a central SQLite file. Agents are stateless workers that pull from it.

---

## 4. Redlining the Agent Inboxes (The SOS Channel)

If SQLite handles standard workloads, what are `inbox/*.json` folders for?

**Inboxes become the Asynchronous Interrupt / SOS Channel.**

Scenario: An autonomous Execution_Agent is blocked by a missing dependency.
- Agent writes `MSG_SOS_Blocked.json` → drops in `PM_Agent/inbox/`
- PM Agent reads this and alerts you: "Downstream agent blocked. Authorize dependency install?"

This ensures:
- Autonomous compute burns on SQLite
- Subjective blockers escalate securely to interactive PMs

---

## 5. Why Version 4 (SQLite + Native CLI Skill) is the Ultimate Masterpiece

| Benefit | How It's Achieved |
|---------|-------------------|
| Zero Background Compute | No long-running MCP servers |
| Infinite Concurrency | SQLite WAL mode handles thousands of agents |
| Lowest Token Cost | CLI returns exactly what's needed (2KB) |
| True Autonomy | Pipeline agents ruthlessly pull via shell |
| Open Source Standard | Same architecture as OpenClaw, OpenHands |

---

## 6. Prior Art: Open-Source SQL Task Trackers for Agents

### Industry Trend: Agent Skills

Top-tier CLI agents (Gemini CLI, Aider, Open Horizon) are shifting away from MCP toward:
- **Agent Skills** — Portable, version-controlled CLI scripts
- **Markdown Documentation** — Radically reduces ambient token costs

### Stoneforge (stoneforge-ai/stoneforge)
- Open-source orchestrator for multiple Claude Code agents in parallel
- Uses SQLite + JSONL for event-sourcing
- **Key**: Prevents agents from hallucinating state across sessions

### Open Horizon CLI Agent (rohittcodes/cli-agent)
- SQLite database via CLI for activity logging
- Persistent audit trails
- **Key**: Ditches heavy servers

### Counter-Example: Flat Markdown Files
- `fxstein/ai-todo` — Explicitly notes cannot handle parallel execution due to race conditions

---

## Conclusion

The industry is moving toward **SQLite + Native CLI Skills** for highly concurrent agent grids:

- Zero-cost local storage
- ACID compliance for parallel execution
- Efficient audit trails without text log bloat
- Bleeding-edge architecture used by Stoneforge, Open Horizon, and other leading frameworks

Building `siso-tasks.db` accessed via a hyper-fast CLI script puts this ecosystem at the exact frontier of AI orchestration.
