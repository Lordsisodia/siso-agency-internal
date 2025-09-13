# Epic 1: Architecture Migration - Component Unification

## Epic Overview

**BMAD Epic ID**: 1  
**Epic Title**: SISO Architecture Unification - Component Migration  
**Epic Owner**: BMAD Team (Architect: Winston, SM: Bob)  
**Priority**: CRITICAL - Foundation Issue  
**Status**: In Progress  

## Problem Statement

SISO Internal has **THREE PARALLEL ARCHITECTURE LAYERS** causing fragmentation:
- **Layer 1**: App.tsx routing (✅ correct)
- **Layer 2**: `/src/ecosystem/internal/lifelock/` (production location)  
- **Layer 3**: `/ai-first/features/tasks/components/` (scattered implementations)

**Root Cause**: Sophisticated components exist but are architecturally misplaced, causing broken imports and incomplete features.

## Epic Goal

Unify all LifeLock components into the correct `/src/ecosystem/internal/lifelock/sections/` location following the successful MorningRoutineSection pattern.

## Success Criteria

1. ✅ **Single Source of Truth**: All components in `/lifelock/sections/`
2. ✅ **Clean Imports**: No cross-architecture imports
3. ✅ **Consistent Patterns**: All components follow MorningRoutine template
4. ✅ **Working Navigation**: All tabs accessible and functional
5. ✅ **Data Preservation**: Zero user data loss
6. ✅ **Performance**: <2s load time maintained

## Epic Stories

### Story 1.1: Build Missing DeepFocusWorkSection
**Priority**: HIGH - Blocking other work  
**Complexity**: Medium  
**Story**: As a user, I want a Deep Focus Work section that follows the MorningRoutine pattern so that I can track and manage deep focus sessions.

**Acceptance Criteria**:
1. Create `/src/ecosystem/internal/lifelock/sections/DeepFocusWorkSection.tsx` 
2. Implement `useDeepFocusSupabase` hook following MorningRoutine patterns
3. Design database schema for focus sessions and daily summaries
4. Build UI with exceptional animations matching MorningRoutine quality
5. Ensure <2s load time performance
6. Include comprehensive error handling and loading states
7. Add accessibility compliance (WCAG 2.1 AA)

### Story 1.2: Audit and Consolidate LightFocusWorkSection
**Priority**: HIGH  
**Complexity**: High  
**Story**: As a developer, I want to consolidate the 4+ scattered LightFocusWorkSection versions into a single production-ready component.

**Acceptance Criteria**:
1. Audit all versions in `/ai-first/features/tasks/components/`
2. Identify the best implementation (likely `LightFocusWorkSection-v2.tsx`)
3. Migrate chosen version to `/src/ecosystem/internal/lifelock/sections/LightFocusWorkSection.tsx`
4. Preserve all sophisticated functionality during migration
5. Ensure database integration works correctly
6. Update all import references

### Story 1.3: Migrate NightlyCheckoutSection 
**Priority**: HIGH  
**Complexity**: High - Sophisticated Voice Processing  
**Story**: As a user, I want the sophisticated Nightly Checkout functionality (voice processing, AI analysis) migrated to the correct location without losing any features.

**Acceptance Criteria**:
1. Preserve ALL voice processing capabilities
2. Maintain AI analysis integration 
3. Keep existing API connections intact
4. Migrate to `/src/ecosystem/internal/lifelock/sections/NightlyCheckoutSection.tsx`
5. Test voice-to-text and AI processing workflows
6. Ensure no data loss during migration

### Story 1.4: Migrate Wellness Components
**Priority**: MEDIUM  
**Complexity**: Medium  
**Story**: As a user, I want HomeWorkout and HealthNonNegotiables sections properly integrated into the LifeLock system.

**Acceptance Criteria**:
1. Migrate `HomeWorkoutSection.tsx` to `/lifelock/sections/`
2. Migrate `HealthNonNegotiablesSection.tsx` to `/lifelock/sections/`
3. Standardize database integration patterns
4. Ensure UI consistency with other sections

### Story 1.5: Migrate TimeboxSection
**Priority**: MEDIUM  
**Complexity**: Low - Already Well Integrated  
**Story**: As a developer, I want TimeboxSection moved for architectural consistency.

**Acceptance Criteria**:
1. Move TimeboxSection to `/lifelock/sections/`
2. Update import paths
3. Minimal functionality changes needed

### Story 1.6: Fix Import Paths and Integration
**Priority**: CRITICAL - Enables All Features  
**Complexity**: Medium  
**Story**: As a user, I want all LifeLock tabs to work correctly with proper component imports.

**Acceptance Criteria**:
1. Update `admin-lifelock-tabs.ts` import paths to use `/lifelock/sections/`
2. Fix `AdminLifeLock.tsx` component imports
3. Update any other files referencing these components
4. Test all navigation tabs work correctly
5. Verify no broken imports remain

### Story 1.7: Cleanup and Testing
**Priority**: LOW  
**Complexity**: Low  
**Story**: As a developer, I want to clean up deprecated component versions and ensure system stability.

**Acceptance Criteria**:
1. Remove deprecated versions in `/ai-first/features/tasks/components/`
2. Clean up unused imports
3. Run comprehensive integration tests
4. Update documentation
5. Verify performance benchmarks maintained

## Risk Assessment

### HIGH RISK
- **NightlyCheckoutSection Migration**: Voice processing could break
- **LightFocusWorkSection Consolidation**: Data conflicts between versions
- **User Data Preservation**: Existing data across different patterns

### MITIGATION STRATEGIES  
- Comprehensive database backup before migration
- Incremental migration with testing after each story
- Rollback plan for each component
- User communication about improvements

## Dependencies

- **Technical**: MorningRoutineSection as reference pattern
- **Data**: Supabase database schemas and existing user data
- **Architecture**: Winston's fragmentation analysis document

## Definition of Done

Epic complete when:
- All acceptance criteria met for all stories
- Zero broken imports or navigation issues  
- All features working in production
- Performance benchmarks maintained
- User data preserved
- Documentation updated