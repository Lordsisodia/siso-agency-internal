# Testing Playbook (Skill)

Pick the smallest effective verification loop:

## Minimum

- Repro the bug (or confirm feature gap).
- Apply change.
- Confirm fix manually.

## Preferred

- Add/update unit/integration tests where it reduces future regressions.
- Run typecheck (`npm run typecheck`).
- Run targeted tests (`npm test`, `vitest`, or relevant suite).

## For UI behavior

- Consider Playwright if already used and the flow is critical.

