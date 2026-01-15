---
id: ISSUE-20260105-0010
title: "Light work: match deep work metadata (due dates, time taken)"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

Light Work tasks should match the Deep Work UX: due dates, time taken, and similar metadata display. Right now Light Work feels “lighter” in UI structure than Deep Work, which reduces consistency.

## Symptoms / Evidence

- What the user sees: Light Work UI lacks metadata parity (due date/time taken).
- Where it happens: Light Work section task list.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: UI and data plumbing to show/set due dates + durations for light work tasks.
- Out of scope: migrating deep/light into a single table.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Light Work tasks support due date (create/edit) and display it consistently.
- [ ] Light Work tasks can capture “time taken” (actual duration) and display it.
- [ ] The UI layout patterns are consistent across Deep/Light.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/3-light-work/ui/pages/LightFocusWorkSection.tsx`
  - `src/domains/lifelock/1-daily/3-light-work/ui/components/LightWorkTaskList.tsx`
  - `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/3-light-work/domain/lightWork/lightWorkTaskCache.ts` (maps `due_date`, `actual_duration_min`)
- Notes:
  - The DB schema for `light_work_tasks` already includes `due_date` and `actual_duration_min`.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Verify Light Work DB mappings include the fields and are wired through the UI.
2. Implement UI components mirroring Deep Work metadata blocks.
3. Add update flows in `useLightWorkTasksSupabase` for due date and actual duration if missing.

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
