# Shared Components for LifeLock Daily Views

> **Last updated:** 2025-10-16  
> **Status summary:** ✅ All listed shared components are live and imported across the active daily views.

**Scope**: This `_shared` folder is specifically for components shared across **LifeLock daily views only**.

Path: `/src/domains/lifelock/1-daily/_shared/`

## Daily Views Using These Components

- 🌅 **morning-routine** - Morning tracking and routines
- 💡 **light-work** - Light focus tasks
- 🎯 **deep-work** - Deep focus sessions
- ⏰ **timebox** - Time-boxed activities
- 💪 **wellness** - Health and wellness tracking
- ✅ **checkout** - End of day review

## Purpose

Reduce code duplication and maintain consistency across **daily views specifically** by centralizing shared UI components within the LifeLock daily domain.

## Current Shared Components

## Component Inventory Status

| Component | Status | Path |
| --- | --- | --- |
| CleanDateNav | ✅ Live | [`CleanDateNav.tsx`](/src/domains/lifelock/1-daily/_shared/components/CleanDateNav.tsx) |
| DailyBottomNav | ✅ Live | [`DailyBottomNav.tsx`](/src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx) |
| PrioritySelector | ✅ Live | [`PrioritySelector.tsx`](/src/domains/lifelock/1-daily/_shared/components/ui/PrioritySelector.tsx) |
| CustomCalendar | ✅ Live | [`CustomCalendar.tsx`](/src/domains/lifelock/1-daily/_shared/components/ui/CustomCalendar.tsx) |
| WorkProtocolCard | ✅ Live | [`WorkProtocolCard.tsx`](/src/domains/lifelock/1-daily/_shared/components/ui/WorkProtocolCard.tsx) |
| AddSubtaskInput | ✅ Live | [`AddSubtaskInput.tsx`](/src/domains/lifelock/1-daily/_shared/components/subtask/AddSubtaskInput.tsx) |
| SubtaskItem | ✅ Live | [`SubtaskItem.tsx`](/src/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem.tsx) |
| SubtaskMetadata | ✅ Live | [`SubtaskMetadata.tsx`](/src/domains/lifelock/1-daily/_shared/components/subtask/SubtaskMetadata.tsx) |
| TaskActionButtons | ✅ Live | [`TaskActionButtons.tsx`](/src/domains/lifelock/1-daily/_shared/components/task/TaskActionButtons.tsx) |
| TaskHeader | ✅ Live | [`TaskHeader.tsx`](/src/domains/lifelock/1-daily/_shared/components/task/TaskHeader.tsx) |
| TaskProgress | ✅ Live | [`TaskProgress.tsx`](/src/domains/lifelock/1-daily/_shared/components/task/TaskProgress.tsx) |
| TaskSeparator | ✅ Live | [`TaskSeparator.tsx`](/src/domains/lifelock/1-daily/_shared/components/task/TaskSeparator.tsx) |
| TaskStatsGrid | ✅ Live | [`TaskStatsGrid.tsx`](/src/domains/lifelock/1-daily/_shared/components/task/TaskStatsGrid.tsx) |

## Scope Boundaries

**✅ Add here when:**
- Component is used in 2+ daily views (light-work, deep-work, etc.)
- Component is specific to daily view functionality
- Component needs to be consistent across all daily views

**❌ DO NOT add here:**
- Components used across multiple LifeLock domains (use `/lifelock/shared/` instead)
- Components used globally across the entire app (use `/shared/` instead)
- Components specific to only ONE daily view (keep in that view's folder)

## Adding New Shared Components

When you find a component duplicated in multiple daily view folders:

1. Move it to `_shared/components/`
2. Export it from `_shared/components/index.ts`
3. Update imports in the original locations:
   ```typescript
   // Before (from within a daily view)
   import { Component } from './components/Component';

   // After (from within a daily view)
   import { Component } from '../_shared/components';
   ```

## Folder Hierarchy Context

```
/src/domains/lifelock/
  ├── views/
  │   ├── daily/
  │   │   ├── _shared/          ← YOU ARE HERE (daily views only)
  │   │   ├── morning-routine/
  │   │   ├── light-work/
  │   │   ├── deep-work/
  │   │   ├── timebox/
  │   │   ├── wellness/
  │   │   └── checkout/
  │   └── weekly/
  ├── features/
  └── shared/                    ← For all LifeLock domains
```

This is NOT a global shared folder - it's specifically scoped to daily views within LifeLock.
