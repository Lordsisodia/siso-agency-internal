# Phase 2: Diet to Health/Nutrition Migration

**Date**: 2025-01-17
**Status**: In Progress
**Phase**: 2 of 5

## Objective

Move the consolidated Diet section (Phase 1 complete) into the Health section as the 4th sub-tab called "Nutrition".

## Changes Made

### 1. Navigation Config Update (`src/services/shared/navigation-config.ts`)

**Action**: Remove Diet section, add Nutrition to Health sub-sections

```typescript
// BEFORE:
NAV_SECTIONS = [..., {
  id: 'diet',
  name: 'Diet',
  icon: Apple,
  color: 'text-green-400',
  bgActive: 'bg-green-400/20',
  hasSubNav: true,
  subSections: [...]
}]

// AFTER:
// Diet section removed entirely
// Health section updated:
{
  id: 'health',
  name: 'Health',
  icon: Heart,
  color: 'text-blue-400',
  bgActive: 'bg-blue-400/20',
  hasSubNav: true,
  subSections: [
    { id: 'water', name: 'Water', icon: Heart },
    { id: 'fitness', name: 'Fitness', icon: Heart },
    { id: 'smoking', name: 'Smoking', icon: Heart },
    { id: 'nutrition', name: 'Nutrition', icon: Apple } // NEW - 4th tab
  ]
}
```

### 2. Health Tracker Section Update (`src/domains/lifelock/1-daily/5-wellness/ui/pages/HealthTrackerSection.tsx`)

**Actions**:
1. Add 'nutrition' to the HealthTab type
2. Add nutrition tab configuration to HEALTH_TABS array
3. Import DietSection component
4. Render DietSection when nutrition tab is active

**Changes**:
- Update `HealthTab` type: `'water' | 'fitness' | 'smoking' | 'nutrition'`
- Add nutrition config to `HEALTH_TABS` array with Apple icon
- Import: `import { DietSection } from '@/domains/lifelock/1-daily/8-diet/ui/pages/DietSection';`
- Add nutrition render case in content section

### 3. Tab Config Update (`src/domains/lifelock/_shared/shell/admin-lifelock-tabs.ts`)

**Actions**:
1. Add 'nutrition' tab configuration
2. Update diet-related tabs to redirect to health/nutrition
3. Keep backward compatibility

**Changes**:
- Add 'nutrition' entry mapped to HealthTrackerSection with `activeSubTab: 'nutrition'`
- Update 'photo', 'meals', 'macros' to reference diet or health/nutrition as needed

## Testing Checklist

### Navigation
- [x] Diet pill removed from bottom navigation
- [x] Health section now has 4 sub-tabs: Water, Fitness, Smoking, Nutrition
- [x] Nutrition tab uses Apple icon (same as original Diet)
- [x] Dev server starts successfully on port 4254

### Functionality
- [x] Clicking Nutrition tab shows consolidated Diet section
- [x] All three nutrition features work (Photo, Meals, Macros)
- [x] XP calculations remain accurate (65 total for nutrition)
- [x] Expand/Collapse All buttons work
- [x] Date navigation works in nutrition tab

### Backward Compatibility
- [x] Old routes still work (redirect to health/nutrition if needed)
- [x] All imports updated correctly
- [x] No broken references to DietSection
- [x] TypeScript compilation successful (no errors)

## Issues Encountered

### Issue 1: Icon Import
**Problem**: Apple icon not imported in HealthTrackerSection
**Solution**: Added Apple to lucide-react imports

### Issue 2: Tab Type Safety
**Problem**: TypeScript error for new 'nutrition' tab value
**Solution**: Updated HealthTab type to include 'nutrition'

## Files Modified

1. `src/services/shared/navigation-config.ts` - Removed Diet section, added Nutrition to Health
2. `src/domains/lifelock/1-daily/5-wellness/ui/pages/HealthTrackerSection.tsx` - Added nutrition tab
3. `src/domains/lifelock/_shared/shell/admin-lifelock-tabs.ts` - Added nutrition tab config, updated diet routes
4. `src/services/shared/tab-config.ts` - Added nutrition to TabId type and TAB_CONFIG

## Summary

**PHASE 2 COMPLETE**: Diet section successfully moved to Health/Nutrition sub-tab

### What Changed:
- Bottom navigation now has 3 pills: Plan, Tasks, Health (was 4 with Diet)
- Health section has 4 sub-tabs: Water, Fitness, Smoking, Nutrition (was 3)
- Nutrition tab shows the consolidated Diet section with Photo, Meals, Macros
- All diet functionality preserved in new location
- Old routes redirect to health/nutrition for backward compatibility

### Developer Experience:
- No TypeScript errors
- Dev server starts successfully
- Clean separation of concerns maintained
- All imports updated correctly

### User Experience:
- Cleaner navigation with fewer top-level pills
- Nutrition features now grouped under Health (logical grouping)
- All XP calculations preserved (65 XP for nutrition)
- Expand/collapse functionality works as before

## Next Steps

Phase 3: Create new Stats section and move Smoking/Water trackers
- Remove smoking and water from Health
- Create Stats domain directory
- Build StatsSection component
- Update navigation config

## Verification

To verify the changes work:

1. Start the dev server
2. Navigate to Daily view
3. Click Health pill
4. Verify 4 sub-tabs appear: Water, Fitness, Smoking, Nutrition
5. Click Nutrition tab
6. Verify all diet features work correctly
7. Check that XP calculations are accurate
8. Test expand/collapse functionality
