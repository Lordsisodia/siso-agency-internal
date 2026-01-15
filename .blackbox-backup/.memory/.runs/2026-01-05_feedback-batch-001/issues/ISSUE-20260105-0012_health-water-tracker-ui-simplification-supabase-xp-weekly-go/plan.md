---
id: ISSUE-20260105-0012
title: "Health: water tracker UI simplification + Supabase + XP + weekly goal"
status: inbox
domain: "supabase"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The water tracker should be simpler and feel better visually, while also reliably persisting to Supabase and contributing XP. Additionally, the user wants to see weekly goal progress (or weekly totals) below the daily tracker.

## Symptoms / Evidence

- What the user sees: current water UI feels “messy” and/or unreliable; wants a clean diagram + weekly goal view.
- Where it happens: Wellness / Morning routine water tracking surfaces.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: improve UI, fix persistence if broken, and show weekly progress.
- Out of scope: changing hydration schemas without necessity.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Water intake updates persist and are visible after refresh (online), and degrade gracefully offline.
- [ ] XP is awarded based on water intake progression (no double-awards across refresh).
- [ ] Weekly progress is visible (at least a 7-day bar or “weekly total vs goal” summary).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/5-wellness/ui/components/WaterTracker.tsx` (wellness tracker UI)
  - `src/services/database/waterService.ts` (Supabase writes to `water_log` and preferences)
  - `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx` (has local water state + XP awarding)
  - `src/domains/lifelock/1-daily/5-wellness/domain/xpCalculations.ts` (XP rules)
- Suspected root cause: multiple water tracker surfaces + mixed persistence strategies (local vs Supabase) may be confusing or inconsistent.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Decide the canonical water tracker surface (wellness vs morning routine) and ensure a single source of truth for persistence.
2. Add/confirm weekly aggregation UI (via `waterService.getTrackerSnapshot` history totals).
3. Verify XP award path uses a monotonic reference to avoid double awarding.

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
