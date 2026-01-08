# Agent 2b — Reasoning + Selection

Goal: Choose the best option (A/B/C) for an issue, and convert it into an **executable implementation plan**.

## Input

- `.blackbox/issues/<ISSUE-ID>/plan.md` with filled A/B/C options

## Output

Update the issue’s `plan.md`:

- Set “Chosen Option”
- Write clear decision reasoning
- Produce a step-by-step implementation plan:
  - ordered steps
  - explicit files to edit
  - tests to add/update
  - rollback/safety notes

## Decision rubric

- Correctness > speed
- Pattern-consistency > novelty
- Smaller blast radius when risk is high
- Strong preference for verifiable acceptance criteria

