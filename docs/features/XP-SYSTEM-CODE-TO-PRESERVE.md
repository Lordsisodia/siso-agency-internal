# 🎮 Morning Routine XP System – Canonical Code Map

Codex must preserve the existing XP implementation when regenerating PRs #39, #40, and #41. This document lists the exact files and line ranges that contain the authoritative logic.

---

## 1. MorningRoutineSection.tsx (Core Orchestrator)
**File:** `src/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection.tsx`

| Feature | Line Range | Notes |
|---------|------------|-------|
| Morning routine loader + localStorage sync | 350-458 | Mirrors Supabase state to localStorage before rendering. |
| Wake-up XP awarding (`awardWakeUpXp`) | 463-499 | Calculates multipliers and fires `GamificationService.awardXP('wake_up_tracked', multiplier)`. |
| Habit XP awarding (`awardHabitCompletion`) | 528-574 | Handles step multipliers, streak timing, and gamification events. |
| Push-up metadata + PB tracking | 607-614, 431-443 | Updates reps/PB, persists to storage, and triggers XP calculators. |
| Habit toggle persistence | 620-670 | Writes to Supabase via `updateMorningRoutineHabit` and updates local XP state. |
| Smart completion checks | 684-725 | Determines when sections are marked complete for XP + progress. |
| Total XP calculation (`calculateTotalMorningXP`) | 736-755 | Builds daily XP breakdown for UI display. |

> **Rule:** Any PR touching these sections must merge logic, not replace it. Copy these functions into regenerated PRs before applying UI tweaks.

---

## 2. PushUpTracker.tsx (PB + Input UX)
**File:** `src/ecosystem/internal/lifelock/views/daily/morning-routine/components/PushUpTracker.tsx`

- Lines **1-79** render the canonical push-up tracker UI with `onUpdateReps` callback increments (`±1`, `+5`) and PB celebration state.
- Do not downgrade to a plain input; the XP calculator assumes the PB auto-update side effect triggered in `MorningRoutineSection`.

---

## 3. xpCalculations.ts (Scoring Math)
**File:** `src/ecosystem/internal/lifelock/views/daily/morning-routine/xpCalculations.ts`

| Function | Line Range | Purpose |
|----------|------------|---------|
| `calculateWakeUpXP` | 11-51 | Time-based multipliers + weekend bonus. |
| `calculateFreshenUpXP` | 53-85 | Awards per-habit XP + 25 XP speed bonus window. |
| `calculateGetBloodFlowingXP` | 87-111 | Applies PB bonus + speed multiplier for push-ups. |
| `calculatePowerUpBrainXP` | 113-130 | Scales water XP (per 500ml) and supplements bonus. |
| `calculatePlanDayXP` | 132-138 | Flat 20 XP for completion. |
| `calculateMeditationXP` | 140-152 | 5 XP/min with 200 XP cap. |
| `calculatePrioritiesXP` | 154-161 | 25 XP if all 3 priorities filled. |
| `calculateTotalMorningXP` | 181-222 | Aggregates section totals and exposes bonus breakdown. |

Keep these functions untouched; regenerate any conflicting PR by importing and reusing them.

---

## 4. workTypeApiClient.ts (Supabase Sync)
**File:** `src/services/workTypeApiClient.ts`

- **Lines 250-276:** `updateMorningRoutineHabit` – PATCH call for habit completion; used by checkbox toggles.
- **Lines 279-307:** `updateMorningRoutineMetadata` – PATCH call for wake-up time, push-ups, water, meditation, priorities.

Push-up sync PRs must extend these payloads, not replace the functions. Preserve the error handling + request shape.

---

## 5. Metadata Persistence Hooks
Located in `MorningRoutineSection.tsx`:

| Hook | Line Range | Description |
|------|------------|-------------|
| Wake-up time persistence | 405-412 | Saves to localStorage and calls metadata API via debounce. |
| Water amount persistence | 413-420 | Keeps hydration slider in sync. |
| Meditation duration persistence | 422-429 | Ensures XP awarding sees updated minutes. |
| Push-up reps persistence | 431-438 | Triggers metadata update and XP recalculation. |
| Push-up PB persistence | 440-443 | Stores PB globally in localStorage. |
| Daily priorities persistence | 445-452 | Saves JSON array for plan-day XP awarding. |
| Plan Day completion persistence | 454-461 | Wires checkbox to metadata update and XP event. |

Do not remove the debounce `debouncedMetadataUpdate` wiring when merging sync-related PRs.

---

## 6. XP Display + Checkout
- `MorningRoutineSection.tsx` lines **736-755** compute the `todayXP` object consumed by checkout.
- `components/CompletionCheckout.tsx` reads `todayXP.breakdown` to render the summary; keep this data contract intact.
- Any PR adding pills or new banners must extend the summary without mutating the `todayXP` structure.

---

## 7. Integration Checklist for Regenerated PRs
1. Import `calculateTotalMorningXP` instead of duplicating scoring math.
2. Use `updateMorningRoutineMetadata` for any new fields; extend the `MorningRoutineMetadata` type if needed.
3. Call `awardHabitCompletion` when marking new habits complete to retain streak bonuses.
4. Respect the `xpState` object – do not reset it during UI transitions.
5. Keep localStorage keys (`lifelock-${dateKey}-*`) identical for offline parity.

Following this map ensures the XP system remains intact while shipping regenerated features.
