# 🔧 PR Rebase Strategy – Morning Routine XP Blockers

This appendix consolidates the technical data Codex needs while triaging the 13 conflicted PRs listed in `CODEX-PROMPT-PR-DECISION.md`.

---

## ✅ Merged Today (16 PRs)
The following landing zones are now on `work` and should be treated as canonical:
1. **Morning routine baseline extraction** – establishes `MorningRoutineSection.tsx` in `ecosystem/internal/lifelock`.
2. **Gamification service wiring** – hooks XP events into `GamificationService.awardXP` with wake/habit multipliers.
3. **Push-up tracker rewrite** – introduces the dedicated `PushUpTracker.tsx` component with PB logic.
4. **Water + meditation metadata sync** – centralizes metadata persistence in `workTypeApiClient.updateMorningRoutineMetadata`.
5. **Daily priorities UX** – ensures the three-priority fields award XP when filled.
6. **Morning quotes + motivational copy** – baseline variant already merged; refinements are in backlog PRs.
7. **Thought dump integration** – reintroduces AI thought dump trigger with voice capture state machine.
8. **Gamified progress ring** – renders XP-driven progress indicator around the morning routine header.
9. **Offline-safe storage fixes** – ensures localStorage mirrors Supabase states when API calls fail.
10. **Wake-time helper** – adds "Use current time" flow to the wake-up input.
11. **Weekend bonus calculation** – adds 1.2x multiplier on Saturday/Sunday pre-8am.
12. **XP summary card** – base card summarizing earned XP already in main branch (without pill styling).
13. **Water tracker accessibility** – keyboard shortcuts and ARIA labels now canonical.
14. **Meditation minute selector** – slider + minute entry view present in baseline.
15. **Daily routine API schema bump** – updates Supabase metadata columns to include `pushup_reps`, `plan_day_complete`, etc.
16. **Error boundary hardening** – ensures the morning routine section fails gracefully when metadata missing.

Any remaining PR that attempts to introduce alternative versions of the above should be regenerated or dropped.

---

## 🧩 File Conflict Matrix
| File | Purpose | Why It Is Fragile | Impacted PRs |
|------|---------|-------------------|--------------|
| `src/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection.tsx` (1,129 LOC) | Master orchestrator for wake time, habit toggles, XP awarding, and metadata sync. | Contains debounce hooks, XP multipliers, and localStorage mirrors. Any overwrite risks losing XP logic. | #21, #24, #33, #35, #39, #40 |
| `src/ecosystem/internal/lifelock/views/daily/morning-routine/components/PushUpTracker.tsx` (79 LOC) | Handles reps/PB input with validation and PB celebrations. | Provides `onRepsChange` callback tied to XP awards; conflicting PRs often replace with simpler inputs. | #24, #35 |
| `src/services/workTypeApiClient.ts` (312 LOC) | REST client for morning routine metadata/habit endpoints. | Debounce-friendly `updateMorningRoutineMetadata` and `updateMorningRoutineHabit` must remain intact; conflict PRs often fork payload shape. | #24, #35, #40 |
| `src/ecosystem/internal/lifelock/views/daily/morning-routine/utils/xpCalculators.ts` | Houses `calculateTotalMorningXP`, `calculateWakeUpXpMultiplier`, etc. | Multipliers + weekend bonuses already correct; conflicting PRs try to simplify numbers. | #33, #39 |
| `src/ecosystem/internal/lifelock/views/daily/morning-routine/components/CompletionCheckout.tsx` | Baseline checkout summary card. | High churn area: two alternative checkout PRs diverge from this baseline. | #33, #39 |

Use this grid when resolving conflicts: preserve the baseline behaviour, port cosmetic changes where necessary.

---

## 🔍 High-Risk Code Snippets
### Wake-up XP Awarding
```ts
const awardWakeUpXp = useCallback((time: string) => {
  if (!time) {
    return;
  }

  let shouldAward = false;
  const wakeTimestamp = getWakeUpTimestamp(routineDate, time);

  setXpState(prev => {
    if (prev.wakeAwarded) {
      return prev;
    }

    shouldAward = true;
    return {
      wakeAwarded: true,
      steps: { ...prev.steps },
      lastCompletionTimestamp: wakeTimestamp ?? prev.lastCompletionTimestamp
    };
  });

  if (!shouldAward) {
    return;
  }

  try {
    const multiplier = calculateWakeUpXpMultiplier(time);
    GamificationService.awardXP('wake_up_tracked', multiplier);
  } catch (error) {
    console.error('Failed to award XP for wake-up time:', error);
  }
}, [routineDate]);
```
_Source: `MorningRoutineSection.tsx`, lines 471-494._

### Habit Completion XP
```ts
const awardHabitCompletion = useCallback((habitKey: string) => {
  let shouldAward = false;
  let previousTimestamp: number | null = null;
  let completionTimestamp = Date.now();

  setXpState(prev => {
    if (prev.steps[habitKey]) {
      return prev;
    }

    shouldAward = true;
    previousTimestamp = prev.lastCompletionTimestamp ?? null;
    completionTimestamp = Date.now();

    return {
      wakeAwarded: prev.wakeAwarded,
      steps: { ...prev.steps, [habitKey]: true },
      lastCompletionTimestamp: completionTimestamp
    };
  });

  if (!shouldAward) {
    return;
  }

  const minutesSinceWake = wakeUpTime
    ? calculateMinutesSinceWake(wakeUpTime, routineDate, completionTimestamp)
    : null;

  const minutesSincePrevious =
    previousTimestamp !== null
      ? (completionTimestamp - previousTimestamp) / 60000
      : null;

  const wakeMultiplier = wakeUpTime ? calculateWakeUpXpMultiplier(wakeUpTime) : 1;

  try {
    const multiplier = calculateStepXpMultiplier({
      minutesSinceWake,
      minutesSincePrevious,
      wakeUpMultiplier: wakeMultiplier
    });
    GamificationService.awardXP('morning_routine_step', multiplier);
  } catch (error) {
    console.error('Failed to award XP for morning routine habit:', error);
  }
}, [wakeUpTime, routineDate]);
```
_Source: `MorningRoutineSection.tsx`, lines 528-574._

Any PR that omits these callbacks or replaces them with simplified calls must be regenerated.

---

## 📈 Change Statistics (Current Baseline)
| Area | Lines Added | Lines Removed | Notes |
|------|-------------|---------------|-------|
| MorningRoutineSection.tsx | +1,129 | — | Large orchestrator containing XP + metadata logic. |
| PushUpTracker.tsx | +79 | — | Dedicated push-up input UI. |
| xpCalculators.ts | +214 | — | XP multiplier + scoring math. |
| workTypeApiClient.ts | +312 | +54 | Adds metadata update endpoints, removed legacy helpers. |

Use these numbers when evaluating whether a PR is reintroducing already-landed work.

---

## 🛠️ Rebase Workflow
1. **Baseline checkout** – Keep the existing `CompletionCheckout.tsx` from main. Cherry-pick styling tweaks where safe.
2. **Reapply sync fixes** – Implement push-up sync (#24) by extending `updateMorningRoutineMetadata` instead of overwriting.
3. **Then UI polish** – Merge low-risk UI-only PRs (quotes, animations) once XP code compiles.
4. **Regenerate heavy hitters** – Recreate checkout (#39) and audit log (#35) from scratch with XP context loaded.
5. **Run validation** – Execute `npm run build` + targeted XP flow manual test after each major merge.

---

## 🔗 Task ID Mapping
| Codex Task | Related PR | Notes |
|------------|------------|-------|
| COD-1245 | #24 | Push-up sync regeneration. |
| COD-1246 | #33/#39 | Checkout consolidation with XP pills. |
| COD-1247 | #35 | Habit audit log reimplementation. |
| COD-1248 | #40 | Sync status indicator regeneration. |
| COD-1249 | #21/#22 | Metadata driven habit ordering & streaks (merge after XP lock). |

Keep this matrix handy when delegating follow-up tasks.
