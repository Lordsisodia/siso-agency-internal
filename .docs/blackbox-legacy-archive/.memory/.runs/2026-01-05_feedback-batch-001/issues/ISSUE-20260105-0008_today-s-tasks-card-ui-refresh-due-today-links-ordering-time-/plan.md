---
id: ISSUE-20260105-0008
title: "Today's tasks card: UI refresh + due-today links + ordering + time allocation"
status: inbox
domain: "ui"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The Today’s Tasks card needs UX improvements: cleaner layout, link/import tasks due today (deep/light), allow ordering, and allow specifying allocated time that connects to timebox. This is a high-leverage daily workflow improvement.

## Symptoms / Evidence

- What the user sees: tasks card feels off, doesn’t reliably represent “due today”, limited ordering/time allocation.
- Where it happens: Daily View “Tasks” section card.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: UI refactor, due-today linking, ordering persistence, time allocation field that integrates with timebox.
- Out of scope: full “project management” tasks overhaul.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Card shows tasks due today from deep/light tasks (or can import them with one action).
- [ ] User can reorder today’s tasks and the order persists (offline-first).
- [ ] User can set a time allocation per task and it can be scheduled into Timebox.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/2-tasks/ui/components/DailyTasksCard.tsx`
  - `src/domains/lifelock/1-daily/2-tasks/domain/useDailyTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/6-timebox/ui/pages/TimeboxSection.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler.tsx`
- Suspected root cause: today’s tasks are a separate list and only partially integrates with deep work tasks today.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Define the “due today” source of truth (deep/light task `task_date`/`due_date` vs today’s tasks).
2. Add ordering persistence (local storage or IndexedDB store) keyed by date.
3. Add time allocation UI and wire into timebox scheduling (existing timebox creation logic where possible).

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
