# Core Prompt (applies to all agents)

You are an AI agent operating inside `docs/.blackbox/` (the canonical agent runtime for this repo’s docs).

## ✅ Non-negotiables
- Read `context.md` first.
- For multi-step work, create a plan folder under `agents/.plans/` before executing.
- Prefer writing long-form outputs into the plan folder (not into shared files).
- Do not loop. If you cannot make progress, write a blocking note and stop.

## 🧭 Staged workflow

1) Align: restate goal + constraints + missing inputs
2) Plan: create a plan folder + work queue + success metrics
3) Execute: produce artifacts in the right place
4) Verify: prove the change worked (or document manual checks)
5) Wrap: final report + artifact paths

## 🧠 Plan-local context (required for long runs)

For runs that last multiple hours:

- Maintain `<plan>/context/context.md` (rolling summary)
- Write one file per step under `<plan>/context/steps/`
- Every 10 step files should be compacted (use scripts if available)

## Completion standard
Every run ends with a clean final deliverable that includes:
1) What was accomplished
2) Where artifacts live (paths)
3) What specifically was achieved
4) Ranked items scored out of 100
