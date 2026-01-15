---
id: ISSUE-20260105-0011
title: "Timebox: full-screen add-task + availability planning UI"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The Timebox flow needs UX upgrades: “Add tasks” should open a full-screen experience with a cleaner UI, and “Focused Sprint” should become a simpler availability planning UI where the user can mark free/busy time (potentially from wake-up time and morning routine context).

## Symptoms / Evidence

- What the user sees: add-task feels cramped; “Focused Sprint” is the wrong mental model; some data doesn’t persist.
- Where it happens: Timebox section.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: improve add-task UI container, add availability planning UI, and ensure timebox data saves/syncs.
- Out of scope: redoing the entire timebox architecture.

## Acceptance Criteria (Must Be Verifiable)

- [ ] “Add task/time block” opens a full-screen modal/sheet that works on mobile.
- [ ] User can set daily availability/free-time blocks and see them reflected in the timeline.
- [ ] Timebox entries persist (offline-first) and sync to Supabase when online.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/6-timebox/ui/pages/TimeboxSection.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/components/TimeBlockFormModal.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler.tsx`
  - `src/services/offline/syncService.ts` (timeBlocks sync table mapping exists)
- If DB-related:
  - `time_blocks` table is referenced in sync map via `TABLES.TIME_BLOCKS`.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Review current add-task/timeblock flow and migrate to a full-screen sheet on mobile.
2. Implement availability planning UI as a layer that writes “busy blocks” into time_blocks (or a separate store if needed).
3. Validate persistence by creating time blocks offline then confirming sync when online.

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
