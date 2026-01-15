# Issue Research Handoff

Run: `2026-01-05_feedback-batch-001`

Primary references:

- `normalized.md` (source of truth list)
- `grouping.md` (domain batching map)
- Per-issue `issues/<ISSUE>/plan.md`

## Suggested execution order (first pass)

1. `ui/lifelock-daily-flow-gating` (unblocks the “day loop” correctness)
2. `ui/lifelock-navigation-shell` (navigation affordances; depends on gating rules)
3. `ui/lifelock-tasks-timebox` (bigger surface area; likely touches multiple pages + data)
4. `ui/lifelock-work-timers-and-metadata` (timer persistence can be tricky)
5. `supabase/wellness-xp-trackers` (schema/RLS/types risk)
6. `integrations/ai-agents-and-models` (secrets/config risk; validate carefully)
7. `ui/lifelock-stats-and-insights` (likely depends on XP + AI outputs)

---

## Group: `ui/lifelock-daily-flow-gating`

Issues:

- `ISSUE-20260105-0001` — `issues/ISSUE-20260105-0001_daily-gating-block-new-day-until-nightly-checkout-completed/plan.md`
- `ISSUE-20260105-0002` — `issues/ISSUE-20260105-0002_daily-gating-require-morning-routine-completion-before-other/plan.md`

Likely code areas:

- `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`
- `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
- `src/lib/hooks/useDailyReflections.ts`

Open questions to resolve during implementation:

- What is the canonical “nightly checkout completed” signal (Supabase row? local state? derived)?
- How is “morning routine completed” tracked today, and where is the guard best enforced (UI disable vs route intercept vs date-nav block)?
- Should gating block *all* navigation or only allow “go back to yesterday checkout” CTA?

Promotion candidates (durable knowledge):

- If gating rules become canonical, promote a short note to `docs/.blackbox/domains/ui/` about “Daily gating rules + storage source”.

---

## Group: `ui/lifelock-navigation-shell`

Issues:

- `ISSUE-20260105-0003` — `issues/ISSUE-20260105-0003_weekly-view-entry-point-move-out-of-top-header/plan.md`
- `ISSUE-20260105-0004` — `issues/ISSUE-20260105-0004_daily-bottom-nav-fix-spacing-padding-and-reorder-tabs/plan.md`
- `ISSUE-20260105-0005` — `issues/ISSUE-20260105-0005_date-navigation-add-swipe-animation-between-days/plan.md`
- `ISSUE-20260105-0016` — `issues/ISSUE-20260105-0016_side-nav-clickup-style-daily-icons-more-menu-toggle-page/plan.md`

Likely code areas:

- `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`
- `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx`
- `src/domains/lifelock/1-daily/_shared/components/CleanDateNav.tsx`
- `src/services/shared/tab-config.ts`

Open questions:

- Is swipe navigation intended for mobile only (touch), or should it work on desktop trackpads too?
- Are there existing animation utilities or motion libs already used in the app?
- How should “weekly view entry point” behave with gating (should weekly show future days if gating is strict)?

---

## Group: `ui/lifelock-tasks-timebox`

Issues:

- `ISSUE-20260105-0006` — `issues/ISSUE-20260105-0006_tasks-consolidated-page-with-deep-light-client-agency-filter/plan.md`
- `ISSUE-20260105-0007` — `issues/ISSUE-20260105-0007_timebox-today-s-tasks-unify-with-segmented-control/plan.md`
- `ISSUE-20260105-0008` — `issues/ISSUE-20260105-0008_today-s-tasks-card-ui-refresh-due-today-links-ordering-time-/plan.md`
- `ISSUE-20260105-0011` — `issues/ISSUE-20260105-0011_timebox-full-screen-add-task-availability-planning-ui/plan.md`

Likely code areas:

- `src/domains/lifelock/1-daily/2-tasks/ui/components/DailyTasksCard.tsx`
- `src/domains/lifelock/1-daily/2-tasks/ui/pages/TasksSection.tsx`
- `src/domains/lifelock/1-daily/6-timebox/ui/pages/TimeboxSection.tsx`
- `src/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler.tsx`
- `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`
- `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts`

Open questions:

- Do we already store “time allocation”, “due date”, “time taken” for tasks? If not, does this require schema changes?
- How are “client/agency” fields represented (project metadata? tags? separate table)?
- Should “Today’s tasks” be derived from timebox schedule or from task due date fields?

---

## Group: `ui/lifelock-work-timers-and-metadata`

Issues:

- `ISSUE-20260105-0009` — `issues/ISSUE-20260105-0009_deep-work-persistent-timer-and-multi-task-timers/plan.md`
- `ISSUE-20260105-0010` — `issues/ISSUE-20260105-0010_light-work-match-deep-work-metadata-due-dates-time-taken/plan.md`

Likely code areas:

- `src/domains/lifelock/1-daily/4-deep-work/ui/pages/DeepFocusWorkSection.tsx`
- `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts`
- `src/domains/lifelock/1-daily/3-light-work/ui/pages/LightFocusWorkSection.tsx`
- `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`

Open questions:

- What does “persistent timer” mean: survives page refresh, app restart, or cross-device?
- Multi-task timers: one active timer at a time vs concurrent? How is switching recorded?

---

## Group: `supabase/wellness-xp-trackers`

Issues:

- `ISSUE-20260105-0012` — `issues/ISSUE-20260105-0012_health-water-tracker-ui-simplification-supabase-xp-weekly-go/plan.md`
- `ISSUE-20260105-0013` — `issues/ISSUE-20260105-0013_health-home-workout-ui-polish-supabase-xp-charts/plan.md`

Likely code areas:

- `src/domains/lifelock/1-daily/5-wellness/ui/pages/HomeWorkoutSection.tsx`
- `src/domains/lifelock/1-daily/5-wellness/ui/components/WaterTracker.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/WaterTracker.tsx`
- `src/domains/lifelock/1-daily/5-wellness/domain/xpCalculations.ts`

Open questions / required checks:

- Which tables store wellness events and XP? Use `siso-internal-supabase.list_tables` to confirm.
- Are RLS policies already correct for the relevant wellness tables?
- Are types up to date with schema (if migrations needed)?

---

## Group: `integrations/ai-agents-and-models`

Issues:

- `ISSUE-20260105-0014` — `issues/ISSUE-20260105-0014_ai-calorie-tracker-restore-working-model-api-key-path/plan.md`
- `ISSUE-20260105-0015` — `issues/ISSUE-20260105-0015_nightly-checkout-ai-feedback-agent-for-tomorrow/plan.md`

Likely code areas (first-pass):

- `src/services/` (AI integration services)
- `src/lib/` (config + clients)
- `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`

Open questions:

- Where should API keys come from (env vars, Supabase secrets, edge functions)? Avoid hardcoding.
- Is there an existing “AI client” abstraction we should reuse (avoid new patterns)?

