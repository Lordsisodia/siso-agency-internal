# docs/.blackbox (Domain-based agent runtime)

This folder is the **Blackbox**: a domain-based agent runtime that preserves context across work by separating:

- **Domains** (`domains/`) — durable “how it works” knowledge by subsystem boundary
- **Agents** (`.agents/`) — lightweight agent packages (role + dependencies + templates)
- **Reusable building blocks** (`.skills/`, `.prompts/`) — playbooks + prompt packs
- **Runs** (`.runs/`) — durable workspaces for a batch of feedback (handoffs, plans, logs, results)

Start here:

1) `protocol.md`  
2) `context.md`  
3) `domains/_map.md`  
4) create or open a run in `.runs/`  

## Quick workflow

1. Create a run:
   - `./docs/.blackbox/scripts/new-run.sh "feedback-batch-001" --owner shaun`
2. Paste raw feedback into the run’s `inbox.md`.
3. Research + grouping agent produces `normalized.md`, `grouping.md`, and handoffs.
4. Planning + execution happen per-issue inside the run.
5. Verification agent writes outcomes and marks done/reopen.

## Key locations

- Domain knowledge: `docs/.blackbox/domains/`
- Agent packages: `docs/.blackbox/.agents/`
- Prompt packs: `docs/.blackbox/.prompts/`
- Skills: `docs/.blackbox/.skills/`
- Runs: `docs/.blackbox/.runs/`
- Helper: `docs/.blackbox/bin/blackbox.mjs` (issue scaffolding inside the active run)
