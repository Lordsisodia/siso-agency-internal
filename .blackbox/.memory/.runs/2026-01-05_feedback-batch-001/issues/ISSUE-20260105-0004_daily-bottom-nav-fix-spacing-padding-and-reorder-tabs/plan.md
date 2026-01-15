---
id: ISSUE-20260105-0004
title: "Daily bottom nav: fix spacing/padding and reorder tabs"
status: inbox
domain: "ui"
priority: "p1"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

The Daily bottom navigation doesn’t “hug” the icons correctly (spacing/padding feels off), and the desired tab order should place Tasks immediately after Morning Routine (instead of Light Work). This is a UX polish + IA change that affects daily navigation flow.

## Symptoms / Evidence

- What the user sees: bottom nav has too much horizontal flex spacing and awkward padding.
- Where it happens: Daily View bottom nav component.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: adjust spacing/padding styles and reorder tab list.
- Out of scope: redesigning the entire ExpandableTabs component unless necessary.

## Acceptance Criteria (Must Be Verifiable)

- [ ] Bottom nav icon spacing/padding matches desired “hugged” look on mobile widths.
- [ ] Tasks tab appears directly after Morning Routine in the Daily nav order.
- [ ] Tab switching still works and persists correctly via URL query param.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx` (wrapper positioning)
  - `src/components/ui/expandable-tabs` (actual tab layout component)
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (provides tabs from `TAB_CONFIG`)
  - `src/services/shared/tab-config.ts` (tab ordering source of truth)
- Suspected root cause: tab list ordering comes from `TAB_CONFIG` and layout styles are overly wide for icon hugging.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Identify where Daily tab order is defined (likely `src/services/shared/tab-config.ts`).
2. Reorder tabs to put Tasks after Morning.
3. Adjust bottom nav layout styles (width constraints / spacing) to “hug icons” while preserving safe-area padding.

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
