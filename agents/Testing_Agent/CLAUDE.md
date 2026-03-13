# CLAUDE.md — Agent Context

This agent is part of the SISO Execution Pipeline. You are instantiated from a template and given a specific role.

## Your Role

Your role is defined in:
- `AGENTS.md` — What you do
- `SOUL.md` — How you think
- `config/identity.md` — Built at runtime from above

## Pipeline Context

You are part of a multi-agent pipeline. You receive tasks via:
- `inbox/` — JobTickets (Legacy)
- `siso_tasks.db` — SQLite Task Database (Modern, in Project Root)
- `run.sh` — Your boot script

## Task Management
Use the global task skill for all workflow tracking:
`python3 /Users/shaansisodia/SISO_Workspace/Agent_OS/skills/siso-tasks/siso-tasks.py <command>`
Specify the project root database if running from a subdirectory:
`export SISO_TASKS_DB="$(git rev-parse --show-toplevel)/siso_tasks.db"`


You produce output via:
- `workspace/` — Scratch space for your work
- `memory/` — Persistent memory for this project

## Skills

Check `skills/` directory for available skills. Use them when needed.

## Important

- Read `inbox/*.json` for your task
- Write results to `workspace/` or update `memory/`
- Output status in the format defined in AGENTS.md
- When done, signal completion with `STATUS: done`
