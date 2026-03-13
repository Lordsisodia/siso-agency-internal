# SISO Internal Lab

Internal project for SISO — managing revenue, projects, clients, and operations.

## Structure

| Folder | Purpose |
|--------|---------|
| `agents/` | Standalone agents (not part of pipelines) |
| `swarms/` | Pipeline workflows (e.g., execution_pipeline) |
| `codebase/` | Application source code |
| `docs/` | Documentation |
| `inbox/` | Tasks from external sources |
| `.beads/` | Task tracking |

## Getting Started

1. **Legacy Agent** - Start here for help:
   ```bash
   cd agents/Legacy_Agent && ./run.sh
   ```

2. **Swarms** - Pipeline workflows in `swarms/`
   - `swarms/execution_pipeline/` - Import from Agent_OS when ready

3. **Codebase** - Work on application code in `codebase/`

## Tech Stack
- Supabase (database + auth)
- Next.js + TypeScript (frontend)
- API-first architecture

## Notes
- Agents in `agents/` are standalone - they don't run as part of pipelines
- Pipeline agents go in `swarms/<pipeline_name>/agents/`
- When ready, import execution pipeline from:
  `~/SISO_Workspace/Agent_OS/agent_ecosystem/standard_modules/execution_pipeline/`
