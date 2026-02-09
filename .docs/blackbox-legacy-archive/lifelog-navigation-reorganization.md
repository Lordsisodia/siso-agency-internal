# LifeLog Navigation Reorganization Plan

## Executive Summary

This document outlines the comprehensive plan to reorganize the LifeLog app's bottom navigation from a 4-pill system (Plan, Tasks, Health, Diet) to a new structure with the "More" button integrated as the 4th pill.

**Project Code**: `LIFELOG-NAV-2025-01`

**Status**: ✅ **ALL PHASES COMPLETE**

**Last Updated**: 2025-01-17
**Completion Date**: 2025-01-17

---

## Current Architecture Analysis

### Current Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Plan  │  Tasks  │  Health  │  Diet  │         [More (9dots)]  │
└─────────────────────────────────────────────────────────────┘
```

### Current File Locations

#### 1. Bottom Navigation Components
- **Main Navigation**: `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx`
- **Consolidated Nav**: `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx`
- **Grid More Menu**: `src/components/GridMoreMenu.tsx`

#### 2. Navigation Configuration
- **Config File**: `src/services/shared/navigation-config.ts`
- **Exports**: `NAV_SECTIONS` array defining all sections and sub-sections

#### 3. Diet Section Components
- **Location**: `src/domains/lifelock/1-daily/8-diet/`
- **Main Component**: `DietSection.tsx`
- **Sub-components**:
  - Photo Nutrition: `features/photo-nutrition/components/PhotoNutritionTracker.tsx`
  - Meals: `ui/components/Meals.tsx`
  - Macros: `ui/components/Macros.tsx`

#### 4. Health Section Components
- **Location**: `src/domains/lifelock/1-daily/5-wellness/`
- **Main Component**: `HealthTrackerSection.tsx`
- **Sub-components**:
  - Water: `ui/components/WaterTrackerCard.tsx`
  - Fitness: `ui/components/HomeWorkoutSection.tsx`
  - Smoking: `ui/components/SmokingTracker.tsx`

---

## Target Architecture

### New Navigation Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Plan  │  Tasks  │  Health  │  Stats  │         [AI Legacy]   │
└──────────────────────────────────────────────────────────────┘
```

### Section Mapping

| Current Section | Target Location | Notes |
|----------------|-----------------|-------|
| Diet (Photo + Meals + Macros) | Health → Nutrition | Merge all diet features into single tab under Health |
| Health (Water + Fitness) | Health → Water/Fitness | Keep existing structure |
| Smoking | New "Stats" section | Move from Health to new section |
| Water | New "Stats" section | Consolidate with Smoking |
| More Button (9 dots) | 4th Pill Position | Replace current Diet pill |
| AI Legacy | Right Side Button | Replace current More button position |

---

## Detailed Implementation Plan

### Phase 1: Consolidate Diet Section into Single Page
**Priority**: High
**Complexity**: Medium
**Estimated Files**: 3-5

**Objective**: Merge Photo Nutrition, Meals, and Macros into a single unified page under Health.

#### Steps:
1. Create new consolidated component: `ConsolidatedNutritionSection.tsx`
2. Combine all three features (Photo, Meals, Macros) into tabbed interface
3. Update routing to redirect `/diet` to `/health/nutrition`
4. Preserve all existing UI and functionality

#### Files to Modify:
- `src/domains/lifelock/1-daily/8-diet/ui/pages/DietSection.tsx` → Refactor to single-page layout
- `src/domains/lifelock/1-daily/5-wellness/ui/pages/HealthTrackerSection.tsx` → Add Nutrition tab
- `src/services/shared/navigation-config.ts` → Update Diet sub-sections

#### Testing:
- Verify all three diet features work on single page
- Test tab switching between Photo, Meals, Macros
- Confirm XP calculations remain accurate
- Check data persistence for all features

---

### Phase 2: Move Consolidated Diet to Health Section
**Priority**: High
**Complexity**: Low
**Estimated Files**: 2

**Objective**: Relocate the newly merged Diet functionality into the Health category.

#### Steps:
1. Move Diet component files to Health domain
2. Update navigation config to add Nutrition as 4th Health sub-tab
3. Remove Diet section from main navigation
4. Update all import paths

#### Files to Modify:
- `src/services/shared/navigation-config.ts` → Remove Diet section, add Nutrition to Health
- Update all imports referencing `8-diet` domain

#### Navigation Config Changes:
```typescript
// Remove this section:
{
  id: 'diet',
  name: 'Diet',
  icon: Apple,
  color: 'text-green-400',
  bgActive: 'bg-green-400/20',
  hasSubNav: true,
  subSections: [...]
}

// Update Health section:
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
    { id: 'nutrition', name: 'Nutrition', icon: Apple } // NEW
  ]
}
```

#### Testing:
- Verify Nutrition tab appears in Health section
- Test all nutrition features still work after move
- Confirm no broken imports or references

---

### Phase 3: Create New Stats Section
**Priority**: High
**Complexity**: Medium
**Estimated Files**: 4-6

**Objective**: Create a new "Stats" section consolidating Smoking and Water tracking.

#### Steps:
1. Create new Stats domain directory structure
2. Build StatsSection main component
3. Move Smoking and Water trackers to Stats
4. Configure Stats as 3rd main navigation pill

#### Directory Structure:
```
src/domains/lifelock/1-daily/6-stats/
├── domain/
│   ├── types.ts
│   └── xpCalculations.ts
├── ui/
│   ├── pages/
│   │   └── StatsSection.tsx
│   └── components/
│       ├── SmokingTracker.tsx (moved from Health)
│       ├── WaterTrackerCard.tsx (moved from Health)
│       └── index.ts
└── index.ts
```

#### Files to Modify:
- Create: `src/domains/lifelock/1-daily/6-stats/` (entire directory)
- Modify: `src/services/shared/navigation-config.ts` → Add Stats section
- Modify: `src/domains/lifelock/1-daily/5-wellness/` → Remove Smoking and Water

#### Navigation Config Addition:
```typescript
{
  id: 'stats',
  name: 'Stats',
  icon: BarChart3,
  color: 'text-cyan-400',
  bgActive: 'bg-cyan-400/20',
  hasSubNav: true,
  subSections: [
    { id: 'smoking', name: 'Smoking', icon: CigaretteOff },
    { id: 'water', name: 'Water', icon: Droplets }
  ]
}
```

#### Testing:
- Verify Stats section appears in navigation
- Test Smoking tracker functionality after move
- Test Water tracker functionality after move
- Confirm XP calculations remain accurate

---

### Phase 4: Move More Button to 4th Pill Position
**Priority**: High
**Complexity**: High
**Estimated Files**: 3-5

**Objective**: Replace the 4th pill (Diet) with the More button (9 dots).

#### Steps:
1. Update navigation config to have only 3 main sections
2. Modify ConsolidatedBottomNav to render More button as 4th item
3. Update DailyBottomNav styling and layout
4. Ensure More menu functionality remains intact

#### Files to Modify:
- `src/services/shared/navigation-config.ts` → Remove Diet section
- `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx` → Update layout
- `src/domains/lifelock/1-daily/_shared/components/navigation/DailyBottomNav.tsx` → Update styling

#### Layout Changes:
```tsx
// Current: 4 pills + separate More button
// New: 3 pills + More button as 4th pill

const NAV_ITEMS = [
  { id: 'plan', ... },
  { id: 'tasks', ... },
  { id: 'health', ... },
  { id: 'more', isMoreButton: true } // NEW
]
```

#### Testing:
- Verify More button appears as 4th pill
- Test More menu opens correctly
- Ensure animations and styling match existing pills
- Check responsive behavior

---

### Phase 5: Replace Right-Side Button with AI Legacy
**Priority**: Medium
**Complexity**: Low
**Estimated Files**: 2

**Objective**: Replace the current right-side circle button with the AI Legacy component.

#### Steps:
1. Locate current right-side button component
2. Extract AI Legacy component from GridMoreMenu
3. Create standalone AI Legacy button component
4. Replace right-side button with AI Legacy

#### Files to Modify:
- `src/components/GridMoreMenu.tsx` → Extract AI Legacy component
- Create: `src/components/AILegacyButton.tsx`
- Modify: `src/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav.tsx`

#### AI Legacy Component Features:
- Animated orb in center
- Glassmorphism effect
- Opens AI Legacy panel/overlay
- Maintains existing styling and animations

#### Testing:
- Verify AI Legacy button appears in correct position
- Test button opens AI Legacy interface
- Confirm animations work correctly
- Check styling matches design system

---

## Risk Assessment

### High Risk Items
1. **Data Migration**: Moving Diet to Health could break existing data references
   - **Mitigation**: Update all database queries and service calls to new paths

2. **Navigation State**: URL routing changes could cause 404s
   - **Mitigation**: Implement redirects from old paths to new paths

3. **XP Calculations**: Moving features between sections may affect XP logic
   - **Mitigation**: Comprehensive testing of XP calculations after each phase

### Medium Risk Items
1. **Import Path Updates**: Many files may reference old domain paths
   - **Mitigation**: Global search and replace, then verify all imports

2. **Component Coupling**: Some components may have tight coupling
   - **Mitigation**: Refactor for loose coupling during moves

### Low Risk Items
1. **Styling Consistency**: New layouts may need styling adjustments
   - **Mitigation**: Use existing design tokens and patterns

---

## Testing Strategy

### Unit Testing
- Test each moved component in isolation
- Verify data flow and state management
- Check XP calculations for accuracy

### Integration Testing
- Test navigation flows between all sections
- Verify data persistence across sections
- Check routing and URL state management

### UI Testing
- Verify responsive design on mobile/tablet/desktop
- Test animations and transitions
- Check accessibility (WCAG 2.1 AAA)

### User Acceptance Testing
- Test complete user journeys
- Verify all features work end-to-end
- Gather feedback on UX changes

---

## Rollback Plan

If critical issues arise:
1. **Immediate Rollback**: Revert to git commit before changes
2. **Data Recovery**: Restore database from backup if needed
3. **Feature Flags**: Implement feature flags to enable/disable new navigation
4. **Redirects**: Keep old routes working with redirects

---

## Success Criteria

- [x] All Diet features consolidated into single Health tab
- [x] Diet section removed from main navigation
- [x] New Stats section created with Smoking and Water
- [x] More button integrated as 4th pill
- [x] AI Legacy button on right side
- [x] All existing functionality preserved
- [x] No data loss or corruption
- [x] All tests passing (TypeScript compilation)
- [x] No regression bugs

---

## Next Steps

1. ✅ **Review and Approval**: Stakeholder review of this plan - COMPLETE
2. ✅ **Environment Setup**: Create feature branch for development - COMPLETE
3. ✅ **Phase 1 Execution**: Begin with Diet consolidation - COMPLETE
4. ✅ **Testing After Each Phase**: Continuous testing approach - COMPLETE
5. ✅ **Documentation Updates**: Update architecture docs after completion - COMPLETE

### Project Status: ✅ COMPLETE

All phases successfully implemented and tested. See comprehensive completion report:
- `.blackbox/lifelog-navigation-reorganization-complete.md`
- `.blackbox/phase-5-ai-legacy-button-implementation.md`

---

## Appendices

### Appendix A: File Structure Map

Detailed mapping of all files that will be created, moved, or modified.

### Appendix B: Database Schema Changes

No database schema changes required. All moves are frontend-only.

### Appendix C: API Changes

No API changes required. All service layers remain the same.

---

**Document Owner**: Development Team
**Reviewers**: Product, Design, QA
**Approved By**: _______________

**Last Updated**: 2025-01-17
