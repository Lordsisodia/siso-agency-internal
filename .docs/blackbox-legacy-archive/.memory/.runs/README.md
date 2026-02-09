# Runs

A **run** is a durable workspace for a single batch of work, e.g.:

- “25 bits of feedback from today”
- “triage + plan + execute + verify a release”

Runs preserve context and handoffs between agents.

Conventions:

- Runs live under `docs/.blackbox/.runs/<run-id>/`
- A run contains:
  - `run.yaml` (metadata + status)
  - `inbox.md` → `normalized.md` → `grouping.md`
  - `handoffs/` (high-quality context)
  - `issues/` (per-issue folders)

Current active run pointer:

- `docs/.blackbox/.runs/ACTIVE_RUN`

