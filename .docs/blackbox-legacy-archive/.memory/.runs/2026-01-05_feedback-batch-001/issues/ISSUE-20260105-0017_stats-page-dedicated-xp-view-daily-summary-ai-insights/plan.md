---
id: ISSUE-20260105-0017
title: "Stats page: dedicated XP view + daily summary + AI insights"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

A dedicated Stats page should exist (ideally right after Checkout) to show XP using the existing XP component, plus short daily stats across sections (deep/light tasks done, hours worked, wake-up time, calories eaten) and optionally an AI insight callout.

## Symptoms / Evidence

- What the user sees: stats are scattered; wants a single place post-checkout.
- Where it happens: Daily navigation / post-checkout flow.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: new stats page UI + data aggregation across existing stores.
- Out of scope: building a full analytics backend (use existing client-side/offline-first sources first).

## Acceptance Criteria (Must Be Verifiable)

- [ ] Stats page exists and is reachable from Daily flow (ideally near Checkout/More).
- [ ] Stats page shows XP using the existing XP component and at least 4 daily summary metrics.
- [ ] Optional AI insight appears if online; otherwise shows a graceful fallback.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/services/gamificationService.ts` (XP)
  - `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx` (wake-up time + water)
  - `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts` (task counts)
  - `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts` (task counts / focus blocks)
  - `src/domains/lifelock/1-daily/5-wellness/ui/pages/HealthNonNegotiablesSection.tsx` (nutrition)
- Notes:
  - “Hours worked” may come from future timer work (see `ISSUE-20260105-0009`); stats page should degrade gracefully until timers land.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Create a new Stats page component (likely under `src/domains/lifelock/1-daily/_shared/` or a new daily section).
2. Implement a small aggregation layer that reads from existing hooks/services and composes metrics.
3. Add optional AI insight generation (can reuse the nightly AI service once built).

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
