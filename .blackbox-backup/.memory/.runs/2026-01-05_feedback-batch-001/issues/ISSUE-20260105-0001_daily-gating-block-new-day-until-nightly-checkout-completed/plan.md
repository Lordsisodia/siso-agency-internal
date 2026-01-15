---
id: ISSUE-20260105-0001
title: "Daily gating: block new day until nightly checkout completed"
status: inbox
domain: "ui"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

In Daily View, you can navigate into a “new day” and start a fresh morning routine even if the previous day’s nightly checkout hasn’t been completed. The desired UX is a strict day-to-day loop: *you can’t start tomorrow until you close out today*, which should increase compliance and reduce “broken streak” behavior.

## Symptoms / Evidence

- What the user sees: can navigate to the next date and start interacting as normal.
- Where it happens: LifeLock Daily View date navigation.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: blocking or intercepting “next day” navigation when yesterday’s nightly checkout is incomplete; clear UI explaining why.
- Out of scope: redesigning the entire checkout UI.

## Acceptance Criteria (Must Be Verifiable)

- [ ] When viewing today, attempting to navigate to tomorrow is blocked if yesterday’s nightly checkout is incomplete.
- [ ] User sees a clear message and a single CTA to open the Nightly Checkout for yesterday.
- [ ] After completing and saving yesterday’s nightly checkout, navigating to tomorrow succeeds without a refresh.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (date navigation + wrapper shell)
  - `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx` (nightly UI)
  - `src/lib/hooks/useDailyReflections.ts` (offline-first reflection load; supports `includePreviousDay`)
- Suspected root cause: date navigation is unconstrained and not aware of “yesterday completion” state.
- Related prior code / patterns:
  - `useDailyReflections({ includePreviousDay: true })` exposes `previousReflection` which can be used as the “yesterday complete” signal.
- If DB-related: `daily_reflections` is the backing store via `unifiedDataService` (offline-first + Supabase sync).

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Define “nightly checkout complete” predicate (ex: `previousReflection !== null` or a stricter field-based heuristic).
2. Intercept “next day” navigation in `TabLayoutWrapper` (and/or `CleanDateNav` caller) when predicate fails.
3. Add a small blocking UI (toast/modal/banner) with CTA to open Checkout for yesterday.

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
