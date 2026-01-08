---
id: ISSUE-20260105-0003
title: "Weekly view entry point: move out of top header"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The Daily View currently surfaces a “Weekly View” back button at the top of the screen, which makes the header feel cluttered. The goal is to move the Weekly View entry point to a cleaner location (ex: within a “More” menu or a dedicated navigation affordance).

## Symptoms / Evidence

- What the user sees: top header includes “Weekly View” with a back arrow.
- Where it happens: LifeLock Daily View wrapper header.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: relocate Weekly View entry point and ensure it remains discoverable.
- Out of scope: redesigning Weekly View itself.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Daily View no longer shows “Weekly View” button in the top header.
- [ ] Weekly View remains reachable via a new location (documented in the UI).
- [ ] Navigation still works correctly (Daily ↔ Weekly) without broken routes.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (renders Weekly View header button)
  - `src/domains/lifelock/2-weekly/WeeklyView.tsx` (weekly entry)
  - `src/services/shared/tab-config.ts` (central tab config used by Daily shell)
- Suspected root cause: header includes a hard-coded navigation affordance.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Remove or conditionally hide the Weekly View header button in `TabLayoutWrapper`.
2. Add a new Weekly View entry point (candidate: side nav “More” menu / daily nav).
3. Verify routes for `/admin/lifelock/weekly` are still correct.

---

# Classification (Stage 2a)

## Problem Type

- Category: `bug | feature | integration | refactor | tech_debt | performance | security`
- Risk: `low | medium | high`
- Blast radius: `local | cross-cutting`
- Test impact: `none | unit | integration | e2e`

## Three Solution Options (Code-Realistic)

### Option A — Minimal Patch

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

### Option B — Pattern-Consistent Refactor

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

### Option C — Alternative Approach

- What changes:
- Pros:
- Cons / risks:
- Estimated effort:

---

# Selection (Stage 2b)

## Chosen Option

Chosen: `A | B | C`

## Decision Reasoning

- Why this option fits current architecture:
- Why not the others:
- Edge cases:

---

# Implementation Plan (Stage 3)

## Preflight Checklist

- [ ] Identify exact files to touch
- [ ] Identify required Supabase / API changes (if any)
- [ ] Identify tests to add/update
- [ ] Identify migration/rollback plan (if DB-related)

## Steps (Ordered, Executable)

1. …
2. …
3. …

## Tests / Verification Commands

- Unit:
  - `npm test` (or `npm run test`)
- Typecheck:
  - `npm run typecheck`
- E2E (if applicable):
  - `npx playwright test`

## Rollback / Safety

- How to revert quickly if something breaks:

---

# Implementation Log (Filled by Executor)

- Date:
- What changed:
- Files changed:
- Notes:

---

# Verification (Stage 4)

## Verification Checklist

- [ ] Acceptance criteria met
- [ ] No regressions observed in adjacent flows
- [ ] Tests passing (or justified exceptions)
- [ ] If DB change: RLS/policies reviewed and validated

## Reviewer Notes

- Findings:
- Follow-ups:
