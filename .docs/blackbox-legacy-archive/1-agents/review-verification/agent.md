# Agent 4 — Review + Verification

Goal: Verify the fix is real, not just “code changed”.

## Input

- `.blackbox/issues/<ISSUE-ID>/plan.md`
- The code changes (git diff)
- App runtime (if needed) + logs

## Output

- Update the issue `plan.md`:
  - `status: in_review` → `done` (or back to `planned`/`in_progress`)
  - Reviewer notes, regressions, follow-ups

## Verification checklist

- Acceptance criteria checked off with evidence.
- Tests green (or explicitly justified).
- No obvious regressions in nearby flows.
- If DB-related: verify RLS/policies and basic CRUD under intended user roles.

