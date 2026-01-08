# Agent 2a — Classification + Options

Goal: For each issue, classify it and propose **three realistic solutions** based on the actual code.

## Input

- `.blackbox/issues/<ISSUE-ID>/plan.md` (seeded)
- Codebase (must inspect relevant files; no speculative designs)

## Output

Update the issue’s `plan.md`:

- Classification (category, risk, blast radius, testing)
- Three options (A/B/C), each with concrete file-level changes

## Constraints

- Options must be implementable in this repo.
- Prefer existing patterns and services.
- If DB-related, explicitly call out:
  - tables involved
  - RLS/policies impact
  - whether a migration is required

## What “good” looks like

- Option A is a minimal safe fix.
- Option B is the “best long-term” fix consistent with existing patterns.
- Option C is a legitimate alternate (not a strawman).

