# Grouping (Domain-based)

Source of truth for the issue list: `normalized.md`.

Purpose:

- Batch work by shared code area (cheaper execution).
- Preserve handoff context (next agent doesn’t re-discover basics).
- Keep a clear “work map” for this run.

---

## Domain: `ui`

### Group: `ui/lifelock-daily-flow-gating`

- **Why grouped:** Daily View progression rules (nightly checkout → morning routine → rest of day)
- **Likely code areas:**
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`
  - `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`
  - `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
  - `src/lib/hooks/useDailyReflections.ts`
- **Issues**
  - `ISSUE-20260105-0001` — Daily gating: block new day until nightly checkout completed
  - `ISSUE-20260105-0002` — Daily gating: require morning routine completion before other sections

### Group: `ui/lifelock-navigation-shell`

- **Why grouped:** Navigation entry points + layout polish (weekly entry, bottom nav spacing, date transitions, side nav)
- **Likely code areas:**
  - `src/domains/lifelock/_shared/core/TabLayoutWrapper.tsx`
  - `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx`
  - `src/domains/lifelock/1-daily/_shared/components/CleanDateNav.tsx`
  - `src/services/shared/tab-config.ts`
- **Issues**
  - `ISSUE-20260105-0003` — Weekly view entry point: move out of top header
  - `ISSUE-20260105-0004` — Daily bottom nav: fix spacing/padding and reorder tabs
  - `ISSUE-20260105-0005` — Date navigation: add swipe animation between days
  - `ISSUE-20260105-0016` — Side nav: ClickUp-style daily icons + more menu + toggle page

### Group: `ui/lifelock-tasks-timebox`

- **Why grouped:** Consolidating task workflows and tying tasks ↔ timebox scheduling (UI + data expectations)
- **Likely code areas:**
  - `src/domains/lifelock/1-daily/2-tasks/ui/components/DailyTasksCard.tsx`
  - `src/domains/lifelock/1-daily/2-tasks/ui/pages/TasksSection.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/pages/TimeboxSection.tsx`
  - `src/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler.tsx`
  - `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts`
- **Issues**
  - `ISSUE-20260105-0006` — Tasks: consolidated page with deep/light + client/agency filters
  - `ISSUE-20260105-0007` — Timebox + Today's tasks: unify with segmented control
  - `ISSUE-20260105-0008` — Today's tasks card: UI refresh + due-today links + ordering + time allocation
  - `ISSUE-20260105-0011` — Timebox: full-screen add-task + availability planning UI

### Group: `ui/lifelock-work-timers-and-metadata`

- **Why grouped:** Deep/Light work task UX parity + time tracking features
- **Likely code areas:**
  - `src/domains/lifelock/1-daily/4-deep-work/ui/pages/DeepFocusWorkSection.tsx`
  - `src/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase.ts`
  - `src/domains/lifelock/1-daily/3-light-work/ui/pages/LightFocusWorkSection.tsx`
  - `src/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase.ts`
- **Issues**
  - `ISSUE-20260105-0009` — Deep work: persistent timer and multi-task timers
  - `ISSUE-20260105-0010` — Light work: match deep work metadata (due dates, time taken)

### Group: `ui/lifelock-stats-and-insights`

- **Why grouped:** A single place to show XP and compact daily stats + AI insights (UI surface first; may call into services)
- **Likely code areas:**
  - `src/domains/lifelock/1-daily/_shared/` (shared daily UI)
  - `src/domains/lifelock/_shared/services/gamificationService.ts`
  - `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
- **Issues**
  - `ISSUE-20260105-0017` — Stats page: dedicated XP view + daily summary + AI insights

---

## Domain: `supabase`

### Group: `supabase/wellness-xp-trackers`

- **Why grouped:** Wellness tracking + Supabase persistence + XP tie-ins
- **Likely code areas:**
  - `src/domains/lifelock/1-daily/5-wellness/ui/pages/HomeWorkoutSection.tsx`
  - `src/domains/lifelock/1-daily/5-wellness/ui/components/WaterTracker.tsx`
  - `src/domains/lifelock/1-daily/1-morning-routine/ui/components/WaterTracker.tsx`
  - `src/domains/lifelock/1-daily/5-wellness/domain/xpCalculations.ts`
- **Issues**
  - `ISSUE-20260105-0012` — Health: water tracker UI simplification + Supabase + XP + weekly goal
  - `ISSUE-20260105-0013` — Health: home workout UI polish + Supabase + XP + charts

---

## Domain: `integrations`

### Group: `integrations/ai-agents-and-models`

- **Why grouped:** AI model wiring + nightly AI workflows (will likely touch UI surfaces + service layer)
- **Likely code areas (first-pass):**
  - `src/services/` (AI integration services)
  - `src/lib/` (config + clients)
  - `src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx`
- **Issues**
  - `ISSUE-20260105-0014` — AI calorie tracker: restore working model + API key path
  - `ISSUE-20260105-0015` — Nightly checkout: AI feedback agent for tomorrow

---

## Domain: `auth` / `build`

No issues in this run are currently tagged as `auth` or `build`.

