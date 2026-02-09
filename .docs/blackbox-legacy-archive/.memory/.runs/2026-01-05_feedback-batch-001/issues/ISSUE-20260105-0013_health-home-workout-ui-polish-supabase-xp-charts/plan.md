---
id: ISSUE-20260105-0013
title: "Health: home workout UI polish + Supabase + XP + charts"
status: inbox
domain: "supabase"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

Home workout tracking needs UI cleanup and should reliably persist to Supabase, award XP, and show weekly progress (goals/streaks/previous days in a chart). This improves the “health non-negotiables” daily loop.

## Symptoms / Evidence

- What the user sees: workout UI needs polish; wants weekly goals and streak visuals; persistence should work.
- Where it happens: Wellness home workout section.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: UI polish, weekly chart, confirm Supabase persistence + XP awarding.
- Out of scope: redesign workout taxonomy.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Workout item completion/logging persists across refresh and syncs to Supabase.
- [ ] Weekly history is visible (chart or streak) showing recent workout completion.
- [ ] XP awards once per progress increase (no duplicate awards across refresh).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/5-wellness/ui/pages/HomeWorkoutSection.tsx`
  - `src/domains/lifelock/_shared/services/supabaseWorkoutService.ts`
  - `src/domains/lifelock/1-daily/5-wellness/domain/xpCalculations.ts`
  - `src/services/offline/syncService.ts` (supports workout session syncing)
- Notes:
  - There is an offline-first sync layer for workout sessions; ensure the UI uses the intended service path.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Confirm current persistence path for workouts (direct Supabase vs offline-first sync service) and standardize.
2. Add weekly chart summary by reusing existing data fetching patterns (last 7 days).
3. Refine UI spacing and states (loading/empty/error) while keeping mobile-first layout.

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
