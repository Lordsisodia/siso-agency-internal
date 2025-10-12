# Morning Routine Component Archive

**Archive Date**: 2025-10-12
**Reason**: AI confusion cleanup - multiple ghost components causing editing errors

## Problem

The morning routine feature had **10 component files** but only **1 was actually being used**. This caused AI tools to frequently edit the wrong components, leading to confusion and bugs.

## Solution

All unused/ghost components have been archived here to leave only the single active component in the codebase.

---

## Active Component (NOT in archive)

**✅ `src/ecosystem/internal/lifelock/sections/MorningRoutineSection.tsx`**
- This is the ONLY component actually rendered on the morning routine page
- Render chain: AdminLifeLockDay → LifeLockViewRenderer → TabLayoutWrapper → SafeTabContentRenderer → MorningRoutineSection

---

## Archived Components

### `/components` - Ghost React Components

#### `MorningRoutineTab.tsx`
- **Original Path**: `src/ecosystem/internal/admin/dashboard/components/`
- **Status**: ❌ Broken - imports from non-existent path
- **Issue**: Tried to import `../../tasks/components/MorningRoutineSection` which never existed
- **Why Archived**: Broken import, never actually worked

#### `MorningRoutineTimer-shared.tsx`
- **Original Path**: `src/shared/components/MorningRoutineTimer.tsx`
- **Status**: ⚠️ Unused duplicate #1
- **Features**: 23-minute timer, AI integration, session tracking
- **Why Archived**: Never integrated into render chain, duplicate functionality

#### `MorningRoutineTimer-timers.tsx`
- **Original Path**: `src/components/timers/MorningRoutineTimer.tsx`
- **Status**: ⚠️ Unused duplicate #2
- **Features**: Identical to the shared version
- **Why Archived**: Exact duplicate, never used

#### `RoutineCard-teams.tsx`
- **Original Path**: `src/ecosystem/internal/teams/timeline/RoutineCard.tsx`
- **Purpose**: Display morning/evening routine cards in team timeline
- **Why Archived**: For teams feature, not LifeLock. Can be restored if needed.

#### `RoutineCard-admin.tsx`
- **Original Path**: `src/ecosystem/internal/admin/dashboard/components/RoutineCard.tsx`
- **Status**: ⚠️ Redirect file (just re-exported teams version)
- **Why Archived**: Unnecessary duplicate/redirect

#### `RoutineCard-types.tsx`
- **Original Path**: `src/types/RoutineCard.tsx`
- **Status**: ⚠️ Another duplicate of the same component
- **Why Archived**: Third copy of the same component

---

### `/services` - Broken Service Files

#### `TabComponentMapper.ts`
- **Original Path**: `src/shared/services/TabComponentMapper.ts`
- **Status**: ❌ Multiple broken imports
- **Broken References**:
  - `@/ecosystem/internal/tasks/components/MorningRoutineTab` - doesn't exist
  - `@/shared/tabs/LightWorkTab` - directory doesn't exist
  - Multiple other non-existent components
- **Why Archived**: Service had broken imports, replaced by working tab system

---

### `/test` - Test Files

#### `TestMorningAI.tsx`
- **Original Path**: `src/pages/TestMorningAI.tsx`
- **Purpose**: Test page for morning AI tools and Supabase data
- **Why Archived**: Development/testing utility, not production code

---

### `/migration` - Migration Artifacts

#### `morning-routine-migration-example.tsx`
- **Original Path**: `src/migration/`
- **Purpose**: Example migration file from older architecture
- **Why Archived**: Migration complete, no longer needed

#### `enhanced-morning-routine-migration.tsx`
- **Original Path**: `src/migration/`
- **Purpose**: Enhanced migration implementation
- **Why Archived**: Migration complete, kept for reference

---

## Supporting Files (Still Active)

These files were **NOT archived** as they're actively used:

- ✅ `src/shared/services/tabs/morning-tab-config.ts` - Tab configuration
- ✅ `src/ecosystem/internal/lifelock/morning-routine-defaults.ts` - Habit data
- ✅ `src/ecosystem/internal/lifelock/types/morning-routine.types.ts` - TypeScript types
- ✅ `src/ecosystem/internal/lifelock/utils/morning-routine-progress.ts` - Progress utils

---

## Restoration Instructions

If you need to restore any of these components:

```bash
# Example: Restore the timer component
git mv archive/morning-routine/components/MorningRoutineTimer-shared.tsx src/shared/components/MorningRoutineTimer.tsx

# Don't forget to update imports in other files!
```

---

---

### `/containers` - Old Container Components (ROUND 2)

#### `DayTabContainer.tsx`
- **Original Path**: `src/ecosystem/internal/admin/dashboard/components/DayTabContainer.tsx`
- **Status**: ❌ BROKEN IMPORT - imports archived `MorningRoutineTab` (line 23)
- **Issue**: Part of old tab architecture before LifeLockViewRenderer refactor
- **Why Archived**: Not rendered anywhere, broken imports, replaced by new system

#### `LifeLockTabContainer.tsx`
- **Original Path**: `src/ecosystem/internal/admin/dashboard/components/LifeLockTabContainer.tsx`
- **Status**: ❌ BROKEN IMPORT - imports archived `MorningRoutineTab` from `./tabs/` (line 20)
- **Issue**: Duplicate container, same broken imports as DayTabContainer
- **Why Archived**: Not rendered, broken imports, duplicate functionality

---

### `/backups` - Old Backup Files (ROUND 2)

#### `AdminLifeLockDay-backup.tsx`
- **Original Path**: `src/ecosystem/internal/admin/dashboard/pages/AdminLifeLockDay-backup.tsx`
- **Status**: ⚠️ OLD BACKUP (47KB file!)
- **Purpose**: Backup from previous refactor
- **Why Archived**: Old backup, not being used, taking up space

---

### `/utilities` - Unused Service Files (ROUND 2)

#### `morningRoutineTools.ts`
- **Original Path**: `src/services/morningRoutineTools.ts`
- **Status**: ⚠️ UNUSED - AI function calling tools for GPT-5 Nano
- **Where Used**: Only test pages (OfflineTestPage, AIAssistantTesting)
- **Why Archived**: NOT imported by MorningRoutineSection, only for testing
- **Note**: Can be restored if AI function calling is added to morning routine

#### `useMorningRoutineSupabase.ts`
- **Original Path**: `src/shared/hooks/useMorningRoutineSupabase.ts`
- **Status**: ⚠️ UNUSED - Supabase hook for morning routine
- **Where Used**: useTimelineTasks.ts (timeline feature), OfflineTestPage.tsx (test)
- **Why Archived**: NOT used by actual MorningRoutineSection component
- **Note**: May be used by timeline feature - can restore if needed

---

## Impact

**Round 1 Archive**: 10 files (6 components + 1 service + 2 migration + 1 test)
**Round 2 Archive**: 5 files (2 containers + 1 backup + 2 utilities)

**Total Archived**: 15 files
**Remaining Active**: 1 component file (MorningRoutineSection.tsx)

**Result**: AI tools can now focus on the correct component without confusion.
