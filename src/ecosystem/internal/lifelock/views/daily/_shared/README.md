# Shared Components for LifeLock Daily Views

**Scope**: This `_shared` folder is specifically for components shared across **LifeLock daily views only**.

Path: `/src/ecosystem/internal/lifelock/views/daily/_shared/`

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

### PrioritySelector
A smart dropdown component for selecting task priorities. Features:
- Portal rendering (no cutoff issues)
- Smart positioning (above/below based on available space)
- Mobile-friendly
- Consistent styling across all views

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
/src/ecosystem/internal/lifelock/
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
