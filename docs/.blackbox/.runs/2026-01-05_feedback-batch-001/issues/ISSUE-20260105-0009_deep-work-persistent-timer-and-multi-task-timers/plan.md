---
id: ISSUE-20260105-0009
title: "Deep work: persistent timer and multi-task timers"
status: inbox
domain: "ui"
priority: "p2"
owner: "unassigned"
created_at: "2026-01-05"
updated_at: "2026-01-05"
---

# Summary

Deep Work should support time tracking with a timer that continues when the app is backgrounded, plus per-task timers so you can track multiple timers (or switch between them) during the day. This enables accurate “hours worked” stats and better habit reinforcement.

## Symptoms / Evidence

- What the user sees: no robust timer for deep work tasks that persists outside the view.
- Where it happens: Deep Work section task list.
- Source: `docs/knowledge/feedback/4-1-26/Daily View Feedback.md`

## Scope

- In scope: persistent timers + task-linked time logging for deep work tasks.
- Out of scope: building a full Pomodoro system unless desired.

## Acceptance Criteria (Must Be Verifiable)

- [ ] User can start/stop a Deep Work timer and it keeps accurate time when app is backgrounded.
- [ ] Each deep work task can be associated with time spent for the day.
- [ ] Daily stats can read “deep work minutes” from recorded data (not just a UI counter).

## Research Notes (Grounded in Code)

- Entry points:
  - `src/domains/lifelock/1-daily/4-deep-work/ui/pages/DeepFocusWorkSection.tsx`
  - `src/domains/lifelock/1-daily/4-deep-work/ui/components/DeepWorkTaskList.tsx`
  - `src/services/flowStatsService.ts` (existing “flow stats” local storage patterns)
- Notes:
  - PWA background timers rely on storing timestamps (start/stop) rather than running JS continuously.

---

# Implementation Plan (Stage 3) — Seed

## Steps (Ordered, Executable)

1. Implement timer state as timestamp-based (start time + accumulated) persisted in storage.
2. Add per-task “start timer” action and a global “active timers” UI.
3. Persist time logs per day and make them available for stats/checkout summary.

---

# Classification (Stage 2a)

## Problem Type

- Category: `bug | feature | integration | refactor | tech_debt | performance | security`
- Risk: `low | medium | high`
- Blast radius: `local | cross-cutting`
- Test impact: `none | unit | integration | e2e`

Selected:
- Category: `feature`
- Risk: `medium` (timer accuracy and persistence)
- Blast radius: `local` (deep work UI + stats consumers)
- Test impact: `unit`, `integration` (timer math, storage restore, stats aggregation)

## Three Solution Options (Code-Realistic)

### Option A — Minimal Patch

- What changes: Add timestamp-based timer state inside DeepWorkTaskList; persist active timer `{taskId, startedAt, accumulatedMs}` to localStorage; resume on mount; log simple session entries per day.
- Pros: Fastest; minimal new files; leverages existing component state.
- Cons / risks: Timer logic trapped in UI component; harder reuse across other views; limited validation; higher regression risk if component remounts unexpectedly.
- Estimated effort: S (0.5–1 day)

### Option B — Pattern-Consistent Refactor

- What changes: Create shared `deepWorkTimerService` (mirrors `flowStatsService` patterns) that stores active timers + per-task session logs in localStorage/IndexedDB-friendly JSON; expose hook for start/pause/resume/switch; integrate DeepWorkTaskList UI with service; add aggregation helper to feed daily deep-work minutes to stats.
- Pros: Centralized logic; background-safe timestamp math; multi-task switching supported; reusable for future screens; aligned with existing local storage stats approach.
- Cons / risks: Slightly more up-front structure; need to ensure migrations of prior data (none yet) handled gracefully.
- Estimated effort: M (1–2 days)

### Option C — Alternative Approach

- What changes: Log timer sessions directly to Supabase table (start/end) with RLS; rely on server time for accuracy; UI syncs via Supabase hooks.
- Pros: Multi-device sync and server-trusted timestamps.
- Cons / risks: Requires new table + RLS; offline complexity; more scope than request; potential latency for start/stop.
- Estimated effort: L (3–4 days including migration + policies)

---

# Selection (Stage 2b)

## Chosen Option

Chosen: `B`

## Decision Reasoning

- Why this option fits current architecture: Reuses local storage timer/stat pattern already in `flowStatsService`, keeps PWA background-safe by storing timestamps, and keeps logic reusable beyond a single component.
- Why not the others: A is too brittle and hard to reuse; C adds Supabase/RLS scope and sacrifices offline reliability not needed for this iteration.
- Edge cases: App killed/backgrounded mid-session; date rollover while a timer runs; switching between tasks should pause previous timer and record partial session; ensure negative durations are clamped to 0; handle missing localStorage gracefully (SSR/tauri).

---

# Implementation Plan (Stage 3)

## Preflight Checklist

- [x] Identify exact files to touch
  - `src/domains/lifelock/1-daily/4-deep-work/ui/components/DeepWorkTaskList.tsx`
  - `src/domains/lifelock/1-daily/4-deep-work/ui/pages/DeepFocusWorkSection.tsx` (start/stop controls)
  - `src/services/flowStatsService.ts` (pattern reference; may add aggregator helper)
  - New: `src/services/deepWorkTimerService.ts` (or `/domains/lifelock/.../services/` following existing pattern)
- [x] Identify required Supabase / API changes (if any): None for this iteration (local storage only).
- [ ] Identify tests to add/update: timer math unit tests; service persistence/restore; stats aggregation.
- [ ] Identify migration/rollback plan (if DB-related): Not needed (no DB change).

## Steps (Ordered, Executable)

1) Define timestamp-based timer model and service  
   - Create `deepWorkTimerService` storing `{ activeTimer: {taskId, startedAt, accumulatedMs, dateKey}, sessions: Array<{taskId, startTime, endTime, durationMs, dateKey}> }` under a single storage key; guard for SSR/localStorage absence.  
   - Functions: `start(taskId, dateKey)`, `pause(taskId)`, `resume(taskId)`, `stop(taskId)`, `switch(taskId, dateKey)`, `getState(dateKey)`, `pruneOldSessions(limit?)`.  
   - Ensure calculations rely on `Date.now()` deltas (no setInterval) so timers survive background/killed app by recomputing elapsed on read.

2) Wire Deep Work UI to service for multi-task timers  
   - Add a lightweight hook (e.g., `useDeepWorkTimers`) to expose service state + dispatcher to components.  
   - Integrate start/stop buttons in `DeepWorkTaskList` / `DeepFocusWorkSection`: starting a new task pauses current active and starts selected; show accumulated mm:ss from `accumulatedMs + (now - startedAt)` when active.  
   - Provide “active timers” pill/list so users can switch between tasks; handle date mismatch (if selectedDate differs from active timer date, prompt to end or continue under that dateKey).

3) Persist time logs for stats consumption  
   - On `stop` or `switch`, append session record to `sessions`; ensure dateKey = ISO date (yyyy-MM-dd) for lookup.  
   - Add helper `getDailyTotals(dateKey)` returning total ms per task and aggregate minutes.  
   - Extend/compose `flowStatsService` with a new function (or small adapter) to supply “deep work minutes” to stats pages using the stored sessions; ensure it tolerates missing data.

4) Tests and verification  
   - Unit: timer service start/pause/resume/switch rollover across midnight; persistence serialization/deserialization.  
   - Integration: hook renders correct elapsed after tab reload; stats helper returns expected totals for mock sessions.

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
