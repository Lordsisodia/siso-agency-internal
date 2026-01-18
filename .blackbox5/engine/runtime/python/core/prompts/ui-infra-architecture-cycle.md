# UI↔Infra Plug‑In Architecture (Shopify now, Stripe later) — Prompt Pack

Use this when you want to run the **6–10 hour / ~50 prompt** architecture cycle to make the UI interchangeable with infrastructure providers (Shopify today; Stripe/others later).

## Hard constraints (paste at start)

1) No app code changes unless explicitly requested.
2) UI must depend only on ports/contracts (no adapter imports).
3) Provider specifics (IDs, copy, URLs, SDK assumptions) must live behind adapters.
4) Output must be written into the plan folder (paths cited).
5) Every 3–5 prompts: checkpoint + update `status.md`.

## Start here

Pinned plan folder (canonical run workspace):
- `docs/.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/`

Run instructions:
- `docs/.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/RUN-NOW.md`

Exact 50‑prompt sequence:
- `docs/.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/agent-cycle.md`

Optional logging template:
- `docs/.blackbox/agents/.plans/2025-12-28_2014_deep-research-architecture-ui-infra-plug-in-ports-adapters/prompt-log.md`

## Target outcome (what “done” looks like)

- A single “north star” architecture writeup that:
  - states the layering rules (imports + boundaries)
  - enumerates ports (contracts) and capabilities
  - identifies current coupling (file paths) and a reversible migration plan
- A concrete “Week 1” plan that is small, high‑leverage, and measurable.

## Suggested first 5 prompts

1) Restate the goal: UI plug‑in; Shopify now; Stripe later; CLI‑only.
2) Inventory the current provider touchpoints (top ~20) with file paths (no code edits).
3) Categorize touchpoints: proper adapter vs leak above adapters vs legacy shared lib.
4) Draft the dependency rules (“UI can import X, cannot import Y”) and list violations.
5) Write a checkpoint: update `status.md` + `progress-log.md` with what you learned.

