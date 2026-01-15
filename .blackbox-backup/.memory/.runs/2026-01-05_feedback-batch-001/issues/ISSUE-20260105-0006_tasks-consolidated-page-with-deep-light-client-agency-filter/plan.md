---
id: ISSUE-20260105-0006
title: "Tasks: consolidated page with deep/light + client/agency filters"
status: inbox
domain: "ui"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

Tasks are currently spread across multiple views (Deep Work, Light Work, “Today’s Tasks”, etc.). The desired UX is a single consolidated Tasks page with a top “pill” (segmented control) to switch between Deep Work and Light Work, plus filters for Client vs Agency tasks.

## Symptoms / Evidence

- What the user sees: tasks are fragmented; hard to see everything due today.
- Where it happens: Daily View tasks workflows.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: add a consolidated tasks screen and drive it from existing data hooks; add filters (client/agency).
- Out of scope: redesigning deep/light task schemas unless needed.

## Acceptance Criteria (Must Be Verifiable)

- [ ] There is a “Tasks” page with a segmented control to switch Deep vs Light tasks.
- [ ] User can filter tasks by “Client” vs “Agency” (initial implementation can be heuristic if needed).
- [ ] Tasks shown include “due today” and allow quick completion toggles.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/2-tasks/ui/pages/TasksSection.tsx`
  - `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/4-deep-work/domain/deepWork/deepWorkTaskCache.ts` (client_id mapping exists in deep tasks)
- Suspected root cause: no single “aggregated tasks” composition layer exists for deep/light tasks.
- If DB-related:
  - `deep_work_tasks` includes `client_id`; `light_work_tasks` does not (today), so “client vs agency” may need definition.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Define filter semantics (what counts as “Client” vs “Agency”) using existing fields (`client_id`, tags, category).
2. Create a new consolidated UI component (either inside `TasksSection` or a new page) with segmented control.
3. Wire to existing hooks and ensure offline-first behavior remains intact.

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
