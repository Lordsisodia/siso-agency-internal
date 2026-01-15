---
id: ISSUE-20260105-0016
title: "Side nav: ClickUp-style daily icons + more menu + toggle page"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The user wants a ClickUp-style side/nav system: a compact “daily” nav with 3 icons (Today/Tasks/Health) plus a “More” button (stats, morning routine, deep/light work, checkout, timeline, today’s tasks). Separately, a burger/toggle should open a page with all views and toggles. This is an IA/navigation redesign.

## Symptoms / Evidence

- What the user sees: existing nav doesn’t match desired IA; too many top-level sections.
- Where it happens: overall LifeLock navigation shell.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: create “More” menu and/or side nav affordance; reorganize shortcuts.
- Out of scope: rewriting router structure outside LifeLock unless required.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Daily nav shows 3 core icons + More.
- [ ] More menu includes shortcuts to: stats, morning routine, deep work, light work, checkout, timeline, today’s tasks.
- [ ] Navigation works on mobile (touch targets, safe-area, doesn’t conflict with bottom nav).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (current daily shell)
  - `src/services/shared/tab-config.ts` (tab list)
  - `src/domains/lifelock/_shared/shell/AdminLifeLockDay.tsx` (daily view shell usage)
- Notes:
  - There is currently a bottom nav pattern; a side nav needs to coexist with it without duplicating affordances.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Decide whether “More” is part of the existing bottom nav or a separate overlay.
2. Implement a minimal menu with route shortcuts (keep it consistent with existing routing).
3. Add a “toggle page” route listing available views and feature toggles.

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
