---
id: ISSUE-20260105-0007
title: "Timebox + Today's tasks: unify with segmented control"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

Timebox and Today’s Tasks are conceptually linked (tasks → scheduled blocks). The requested UX is a single unified view with a top segmented control that switches between “Timebox” and “Tasks”, similar to the desired consolidated tasks pill UX.

## Symptoms / Evidence

- What the user sees: Timebox and Tasks feel like separate islands; harder to flow between them.
- Where it happens: Daily View navigation / sections.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: unify UX with segmented control and share scheduling affordances.
- Out of scope: new scheduling AI features (unless necessary).

## Acceptance Criteria (Must Be Verifiable)

- [ ] There is a single entry point that can display either Timebox or Tasks with a segmented control toggle.
- [ ] Switching tabs preserves selected date and feels instant.
- [ ] Scheduling a task from the Tasks view reflects in the Timebox view (or at minimum supports “Add to timebox”).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/6-timebox/ui/pages/TimeboxSection.tsx`
  - `src/domains/lifelock/1-daily/2-tasks/ui/components/DailyTasksCard.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler.tsx` (already consumes deep/light hooks)
- Related prior code / patterns:
  - The app already uses segmented/tab-like UX in other places (bottom nav + ExpandableTabs).

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Decide where the unified “Tasks/Timebox” lives in IA (new route vs replace an existing tab).
2. Extract shared “segmented control” UI component (or reuse existing).
3. Wire both views into one container while preserving current behavior and offline-first storage.

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
