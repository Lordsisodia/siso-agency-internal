---
id: ISSUE-20260105-0002
title: "Daily gating: require morning routine completion before other sections"
status: inbox
domain: "ui"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

After a nightly checkout is completed, the desired UX is that the next day’s morning routine becomes a mandatory “unlock” step: until morning routine is completed, the user shouldn’t be able to proceed to other Daily View sections. This enforces a structured daily cadence.

## Symptoms / Evidence

- What the user sees: can jump into Deep Work / Light Work / Tasks / Timebox without completing morning routine.
- Where it happens: LifeLock Daily View tab navigation.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: gate tab navigation based on morning routine completion (today) and display a clear prompt.
- Out of scope: changing the underlying morning routine content.

## Acceptance Criteria (Must Be Verifiable)

- [ ] If today’s morning routine is incomplete, navigating to any tab other than Morning is blocked.
- [ ] Block UI includes CTA to return to Morning Routine and shows progress (ex: percent complete).
- [ ] Once morning routine is complete, all tabs are accessible immediately.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (tab navigation + persistence in URL)
  - `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx` (progress calculation)
  - `src/domains/lifelock/1-daily/1-morning-routine/domain/` (routine data + persistence)
- Suspected root cause: tab changes are unconditional; no “completion” guard exists.
- Related prior code / patterns:
  - Morning routine progress is computed in `MorningRoutineSection` (`getRoutineProgress` / `morningRoutineProgress`).
  - Nightly reflections hook supports “previous day” data and could be used for sequencing.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Define a shared “morning routine completion” signal available to the wrapper (likely via a hook/service, not just local component state).
2. Add a guard in `TabLayoutWrapper.handleTabClick` / `navigateTab` to prevent leaving Morning when incomplete.
3. Provide a minimal blocking UI and ensure the guard respects historical dates (only strict-gate “today” unless explicitly desired).

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
