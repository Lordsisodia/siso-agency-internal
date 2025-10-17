# 🧠 Codex Decision Prompt – Remaining Morning Routine PRs

## ⚡ Situation Overview
- **Merged today:** 16 PRs covering the morning routine migration, wellness cleanup, and XP scoring polish.
- **Successfully rebased:** PR #26 (_morning-routine-cleanup_) – net removal of 416 obsolete lines.
- **Remaining:** 13 PRs still on disk with merge conflicts that primarily touch the morning routine XP loop and associated UI polish.
- **Net change to date:** `+2,828 / -594` lines after today's merges.
- **Build status:** ✅ `npm run build` passes on `work` branch.

Use this prompt with Codex (or any follow-up agent) to decide what to keep, what to regenerate, and what can be closed.

---

## 🧭 Conflict Hotspots
1. **Morning Routine XP orchestration** – `MorningRoutineSection.tsx`, `PushUpTracker.tsx`, `GamificationService` hooks.
2. **Checkout/Completion UX** – competing PRs implement different pill layouts and reward summaries.
3. **Sync plumbing** – push-up metadata sync (#24) and status banners (#40) both edit debounce + local state code.
4. **Analytics overlays** – several smaller PRs inject additional metrics panels that risk double-counting XP.

Refer to `docs/features/PR-REBASE-STRATEGY-CODEX.md` for a conflict-by-file breakdown.

---

## 📦 Remaining PRs (13)
| PR # | Title | High-Level Description | Conflict Risk | Notes |
|-----:|-------|-----------------------|---------------|-------|
| 19 | Morning routine voice uplift | Adds voice confirmations + celebratory confetti. | Low | Cosmetic – can be regenerated post-XP lock. |
| 21 | Dynamic habit ordering | Re-sorts sections based on completion data. | Medium | Touches `MorningRoutineSection` progress calc. |
| 22 | Meditation streak tracker | Persists streaks + achievements UI. | Medium | Shares metadata payload with XP totals. |
| 23 | Wake-time suggestions | AI suggestions card below wake input. | Low | Can wait until after XP-critical merges. |
| 24 | Push-up sync fix | Ensures push-up reps + PB sync between Supabase and local cache. | High | Touches metadata debounce hooks. |
| 27 | Water tracker animation | Adds fill animation + audible cues. | Low | Local component changes only. |
| 30 | Daily quote refinements | Rotating quotes & share button. | Low | Self-contained to quote helper. |
| 31 | Morning momentum chart | Small chart summarizing XP over last 7 days. | Medium | Reads from same XP calculators. |
| 33 | Gamified summary banner | Replaces header with XP pill summary. | High | Competes with checkout PR styling. |
| 34 | Consistency coach tips | AI-generated nudge panel. | Medium | Hooks into GamificationService events. |
| 35 | Habit audit log | Adds per-habit activity timeline. | High | Writes to metadata payload + xp awarding. |
| 39 | Checkout flow (XP-focused) | Full-screen completion view with XP recap + share CTA. | Critical | Directly edits XP distribution + final step gating. |
| 40 | Sync status toast | Adds "Syncing to cloud" indicator at top of page. | Medium | Wraps around metadata/push sync state. |

> PR #41 (XP pills integration) depends on #39 and is best regenerated if we redo the checkout flow. Track it as part of #39.

---

## 🎯 Core XP Conflict
The current production XP engine (see `docs/features/XP-SYSTEM-CODE-TO-PRESERVE.md`) awards:
- Wake-up XP with time-based multipliers and weekend bonus hooks.
- Step completion XP that factors in minutes since wake and streak cadence.
- Push-up PB bonuses + speed multipliers.
- Meditation, plan-day, and hydration bonuses wired through `GamificationService`.

Most conflicted PRs replace or simplify this logic. Codex must ensure the preserved version keeps:
1. `awardWakeUpXp` multiplier pipeline.
2. `awardHabitCompletion` debounce + streak math.
3. Accurate storage of push-up reps and PB in both Supabase + localStorage.

---

## ❓ Questions for Codex
1. Which checkout PR (existing #39 vs. alternatives) maintains XP integrity without duplicating UI work?
2. Should we regenerate PR #39 with the XP code preloaded to avoid regressions?
3. Does the sync status UI (#40) add enough value to justify rework, or is it redundant with existing inline loaders?
4. How do we handle push-up sync PR #24 so it cooperates with the preserved metadata pipeline?
5. Are there lower-priority PRs that actually block XP accuracy more than expected?
6. Which PRs can be regenerated quickly after XP stabilization (e.g., animations, quotes)?
7. Do any of the remaining PRs duplicate functionality already merged today?

Codex should answer each question referencing the technical appendix.

---

## ✅ Decision Matrix (initial recommendation)
| PR | Keep As-Is | Regenerate | Drop | Rationale |
|----|------------|------------|------|-----------|
| #24 | ➖ | ✅ | ❌ | Rebuild on top of preserved debounce hooks to avoid merge hell. |
| #33 | ❌ | ✅ | ➖ | Needs redesign to wrap around kept checkout version. |
| #35 | ❌ | ✅ | ➖ | Regenerate after XP state machine is frozen. |
| #39 | ❌ | ✅ | ➖ | Start fresh with XP-preserving context from appendix. |
| #40 | ➖ | ✅ | ❌ | Lightweight – safer to regenerate with new metadata events. |
| Others | ✅ (if conflict-free) | ➖ | ❌ | Merge after rebasing onto XP-safe baseline. |

Legend: ✅ recommended, ➖ optional.

---

## 🗳️ My Recommendations (Codex still decides)
- **Lock in the XP baseline first.** Treat `MorningRoutineSection.tsx` and `PushUpTracker.tsx` as canonical.
- **Regenerate checkout (#39) with XP hooks pre-integrated.** The existing PR variants strip out multipliers.
- **Only keep UI polish PRs (quotes, animations) once XP sync PRs land.** They can reapply cleanly afterwards.
- **Evaluate sync status (#40) after #24 is rebuilt.** If push-up sync reliably updates the metadata banner, a global toast may be unnecessary.
- **Defer habit audit (#35) until metadata schema decisions are finalized.**

Hand this file to Codex together with `PR-REBASE-STRATEGY-CODEX.md` and `XP-SYSTEM-CODE-TO-PRESERVE.md` for full context.
