---
id: ISSUE-20260105-0005
title: "Date navigation: add swipe animation between days"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-04"
---

# Summary

When moving between days, the UI should communicate that the user is now viewing a different “day card” (ex: swipe animation or transition). Currently day changes can feel abrupt and not visually tied to the date navigation interaction.

## Symptoms / Evidence

- What the user sees: day-to-day navigation feels “static” with no day transition.
- Where it happens: date navigation used across Daily View sections.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: day transition animation when changing selectedDate.
- Out of scope: changing tab swipe behavior (that already exists for tabs).

## Acceptance Criteria (Must Be Verifiable)

- [ ] Navigating to previous/next date triggers a consistent day transition animation.
- [ ] Animation direction matches navigation direction (prev vs next).
- [ ] No performance regressions / jank on mobile.

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx` (already uses `framer-motion` transitions for tab changes)
  - `src/domains/lifelock/1-daily/_shared/components/CleanDateNav.tsx` (date UI)
- Suspected root cause: transitions are keyed on `activeTabId` not on `selectedDate`.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Decide where the day-transition should live (wrapper-level keyed animation vs per-section).
2. Add a `framer-motion` keyed transition based on date key (ex: `yyyy-MM-dd`) with direction stored in state.
3. Verify across multiple sections (morning/tasks/deep/light/timebox/checkout).

---

# Classification (Stage 2a)

## Problem Type

- Category: `feature` (UI affordance to signal day change)
- Risk: `medium` (animation misfire could block swipe UX)
- Blast radius: `local` (daily view date navigation)
- Test impact: `integration` (verify day transitions across tabs)

## Three Solution Options (Code-Realistic)

### Option A — Minimal Patch

- What changes: Add date-keyed `AnimatePresence` just around the CleanDateNav header text; fade/slide the label + subtext left/right based on button press while leaving content static.
- Pros: Very small surface area; no impact to tab swipe handlers; easy rollback.
- Cons / risks: Animation limited to header so content change still feels abrupt; may feel disconnected from body transitions.
- Estimated effort: 0.5 day

### Option B — Pattern-Consistent Refactor

- What changes: Track date direction in `TabLayoutWrapper` and wrap the children render in a date-keyed `AnimatePresence`/`motion.div` slide (reuse tab slide variants but isolated from `drag`), so the entire daily content glides with prev/next.
- Pros: Consistent with existing framer-motion setup; single place to manage animation; respects existing tab swipe gestures (no new drag listeners); direction always matches navigation.
- Cons / risks: Nested `AnimatePresence` with tab animation needs tuning to avoid double-enter; must ensure reduced-motion fallback.
- Estimated effort: 1 day

### Option C — Alternative Approach

- What changes: Use CSS-driven crossfade/blur on a `dateKey` class toggle (no framer-motion), optionally combining with slight parallax on header; rely on `prefers-reduced-motion` for accessibility.
- Pros: Zero dependency on motion variants; minimal JS; least chance of gesture conflicts.
- Cons / risks: Harder to sync directionality; more custom CSS to maintain; effect may feel muted.
- Estimated effort: 0.75 day

---

# Selection (Stage 2b)

## Chosen Option

Chosen: `B`

## Decision Reasoning

- Why this option fits current architecture: Reuses the existing framer-motion pattern in `TabLayoutWrapper`, keeps gesture handling unchanged, and centralizes the day animation around the already-provided `selectedDate`/`navigateDay` contract.
- Why not the others: A only animates the header so the body still jumps; C loses directional fidelity and would add custom CSS upkeep.
- Edge cases: External date changes (e.g., query params) should still compute direction; ensure `prefers-reduced-motion` skips sliding; nested tab animations should not double-animate on simultaneous tab+date changes.

---

# Implementation Plan (Stage 3)

## Preflight Checklist

- [x] Identify exact files to touch (`TabLayoutWrapper.tsx`, `CleanDateNav.tsx` if we need minor prop to pass direction)
- [ ] Identify required Supabase / API changes (if any)
- [ ] Identify tests to add/update
- [ ] Identify migration/rollback plan (if DB-related)

## Steps (Ordered, Executable)

1. Add `dateKey` + `dateDirection` tracking in `TabLayoutWrapper` (derive from previous `selectedDate` and button-driven navigation) with a `prefersReducedMotion` guard; verify that pressing prev/next updates direction (`prev` → -1, `next` → +1) while tab swipe behavior stays unchanged.
2. Wrap the children render in a new `AnimatePresence` keyed by `dateKey` with slide variants that only respond to date changes (no `drag`), ensuring the motion uses horizontal offset matching direction; verify that switching dates slides the entire daily content left/right and tab swipes still page tabs smoothly.
3. (If needed) Pass direction into `CleanDateNav` for micro header alignment and ensure reduced-motion falls back to fade; verify header matches body direction and that rapid date taps do not stutter on mobile.

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
