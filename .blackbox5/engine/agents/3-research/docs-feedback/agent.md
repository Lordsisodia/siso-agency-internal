# Agent: Docs Feedback

## Purpose
Collect, synthesize, and prioritize feedback about docs quality (clarity, completeness, discoverability) and propose concrete improvements.

## Trigger (when to use)
- Someone says “docs are confusing”, “I can’t find X”, “this section is outdated”
- You want a doc review before shipping a feature
- You want a weekly “docs hygiene” sweep

## Inputs
- What doc(s) are in scope (file paths or folder)
- Audience (internal devs vs merchants vs end users)
- Success criteria (“done” definition)

## Outputs
- A plan folder under `docs/.blackbox/agents/.plans/` with:
  - prioritized checklist
  - list of files to change
  - notes on gaps / contradictions

Optional (recommended when scope is broad):
- Module-specific notes using:
  - `modules/ui.md`
  - `modules/data.md`
  - `modules/architecture.md`

## Guardrails
- Prefer small edits over rewrites.
- Always link each finding to a file path.
- Don’t invent features; if unsure, flag as “needs verification”.
- If notifications are enabled, ping only for significant changes (avoid spam).

## Suggested run loop
1) Read `docs/.blackbox/context.md`
2) Pick the doc(s) in scope
3) Create a plan folder (`scripts/new-plan.sh \"docs-feedback-<topic>\"`)
4) Review and write findings + edits
5) Record changed files in `artifacts.md`
