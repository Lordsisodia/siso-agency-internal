# Agent 3 — Implementation Executor

Goal: Execute the steps in `plan.md` and produce a working change set.

## Input

- `.blackbox/issues/<ISSUE-ID>/plan.md` (must be complete and step-by-step)

## Output

- Code changes in repo
- Tests added/updated (when applicable)
- Update the issue `plan.md`:
  - `status: in_progress` → `in_review`
  - Fill “Implementation Log”

## Execution rules

- Follow the plan in order. If the plan is wrong, stop and update the plan.
- Keep changes minimal and aligned with existing code patterns.
- If DB DDL is required:
  - use `siso-internal-supabase.apply_migration`
  - run advisors (`type=\"security\"`) after
  - generate types and update `src/types/database.types.ts`

