# LifeLock Issues & Investigation Notes — 2025-11-25

Scope: Daily LifeLock + related app surfaces (XP Store, Tasks, Clients). Early investigation + fix outline so we can spin tickets quickly.

## 1) Main tasks not priority sorted ✅
- Fix: Added priority weighting + due-date tiebreak; default order now priority-first when no saved order. Completed tasks hidden from active list.
- Files: `src/ecosystem/internal/lifelock/views/daily/deep-work/components/DeepWorkTaskList.tsx`

## 2) Deep work “Done” doesn’t remove task ✅
- Fix: Active list now filters out completed tasks.
- Files: `DeepWorkTaskList.tsx`

## 3) Bottom nav off-center on mobile ✅
- Fix: Forced center justification in `ExpandableTabs`.
- Files: `src/shared/ui/expandable-tabs.tsx`

## 4) Cross-page login walls (XP Store / Tasks / Clients) ✅
- Fix: App now wrapped in `ClerkProvider` so Clerk session is available globally; removes manual-login wall.
- Files: `src/main.tsx` (requires `VITE_CLERK_PUBLISHABLE_KEY` in env)

## 5) Timebox: cannot change slots ✅
- Fix: Root issue was missing Clerk context → `internalUserId` null → timebox mutations blocked. With ClerkProvider in place, userId resolves and edits persist.
- Files: `src/main.tsx`

## 6) Timebox: remove smart suggestions ✅
- Fix: Feature flagged off.
- Files: `src/ecosystem/internal/lifelock/views/daily/timebox/hooks/useTimeboxHandlers.ts`

## 7) Push-up tracker not persisting ✅
- Fix: Added per-day local fallback storage so values persist even without userId/network.
- Files: `src/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection.tsx`

## 8) Water tracker not persisting ✅
- Fix: Local snapshot + storage fallback when userId missing; preserves entries offline.
- Files: `src/ecosystem/internal/lifelock/wellness/WaterTracker.tsx`

## Next Steps
- Verify env: `VITE_CLERK_PUBLISHABLE_KEY` present; restart dev server after adding.
- Run smoke on mobile PWA: deep work list sorting/hide, bottom nav centering, timebox edit/drag, XP Store loads without login prompt, push-up/water persistence offline & online.
