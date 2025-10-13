# Legacy SisoDeepFocusPlan Archive - 2025-10-13

## Archived Components

This directory contains the legacy SisoDeepFocusPlan component and its dependencies, archived during migration to the new architecture.

### Files Archived:
- `siso-deep-focus-plan.tsx` - Main unified component (872 lines)
- `siso-deep-focus-plan-v2.tsx` - V2 variant  
- `siso-light-work-plan.tsx` - Light work variant
- `CustomCalendar-components-ui.tsx` - Legacy calendar component
- `SubtaskRow.tsx` - Legacy subtask row component
- `SharedTaskCard.tsx` - Legacy shared task card

### Why Archived:
These components were located in `/components/ui/` but were LifeLock-specific.
They've been replaced by the new architecture:
- `DeepWorkTaskList` in `/ecosystem/internal/lifelock/views/daily/deep-work/components/`
- `LightWorkTaskList` in `/ecosystem/internal/lifelock/views/daily/light-work/components/`

### New Architecture Benefits:
- Proper domain organization (LifeLock components in LifeLock directory)
- Shared components in `_shared/components/` directory
- Theme-based configuration via `WORK_THEMES`
- Exact same functionality as SisoDeepFocusPlan
- Better maintainability and organization

### Migration Date:
October 13, 2025

### Can Be Restored:
YES - All files preserved here in case rollback is needed.

### Related Changes:
- `admin-lifelock-tabs.ts` updated to use `DeepFocusWorkSection` and `LightFocusWorkSection`
- Both new components have ALL features from SisoDeepFocusPlan (expansion toggles, modals, animations, etc.)
