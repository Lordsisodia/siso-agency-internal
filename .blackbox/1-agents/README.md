# Agents

Agents are lightweight “packages” that declare:

- role + operating rules (`agent.md`)
- reusable dependencies (`manifest.yaml` → skills + prompts)
- templates they own (optional, under `templates/`)
- optional durable memory (optional, under `runtime/`)

Per-batch work should live under `.runs/` (not inside agent folders).

