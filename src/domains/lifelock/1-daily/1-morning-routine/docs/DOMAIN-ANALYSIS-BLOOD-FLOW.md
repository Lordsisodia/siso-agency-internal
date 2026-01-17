# Blood Flow Domain Analysis

## Executive Summary

The **Blood Flow** domain manages push-up exercise tracking with automatic Personal Best (PB) detection and XP rewards. It is one of 6 domains in the Morning Routine feature and focuses on physical activation to wake up the body.

**Current State**: Embedded in a 1,192-line monolith component
**Target State**: Extracted into a standalone domain with clean boundaries
**Priority**: High - User-facing feature with gamification elements

---

## 1. Domain Overview

### 1.1 Purpose
The Blood Flow domain tracks daily push-up exercises as part of the morning routine. It incentivizes physical activity through:
- Daily rep tracking
- Personal Best (PB) detection and celebration
- XP rewards based on completion
- Speed bonuses for quick completion

### 1.2 Business Context
- **Domain Category**: Physical activation
- **Task Key**: `getBloodFlowing`
- **Subtask Key**: `pushups`
- **Time Estimate**: 5 minutes
- **Target PB**: 30 reps
- **Icon**: Dumbbell (from lucide-react)

### 1.3 User Journey
1. User sees "Get Blood Flowing" task in morning routine
2. User clicks "pushups" subtask checkbox
3. PushUpTracker component appears with rep counter
4. User uses +/- buttons to log reps
5. PB auto-updates if new record beaten
6. XP calculated and awarded
7. Progress shown in task card and XP footer

---

## 2. State Inventory

### 2.1 Core State Variables

#### In MorningRoutineSection.tsx
```typescript
// Lines 253-259
const [pushupReps, setPushupReps] = useState<number>(0);

const [pushupPB, setPushupPB] = useState<number>(() => {
  // PB is global, not per day
  const saved = localStorage.getItem('lifelock-pushupPB');
  return saved ? parseInt(saved) : 30; // Default PB is 30
});
```

**State Breakdown**:
- **pushupReps**: Daily counter (resets each day)
- **pushupPB**: Global personal best (persists across all days, default: 30)

### 2.2 Derived State
- **Task Completion**: Determined by `pushupReps > 0`
- **XP Calculation**: Based on reps, PB, and timing
- **PB Celebration**: Shows when `reps === personalBest && reps > 30`

### 2.3 State Persistence Strategy

| State | Storage | Scope | Key |
|-------|---------|-------|-----|
| pushupReps | Supabase + localStorage | Per day | `lifelock-pushups-${routineDateKey}` |
| pushupPB | localStorage only | Global | `lifelock-pushupPB` |

**Critical Note**: PB is NOT synced to Supabase - this is intentional as it's a global user preference, not daily data.

---

## 3. Business Rules

### 3.1 XP Calculation Rules

**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/domain/xpCalculations.ts` (Lines 93-111)

```typescript
export function calculateGetBloodFlowingXP(
  pushupReps: number,
  personalBest: number,
  completedWithin5Min: boolean
): { total: number; pbBonus: number; speedBonus: number } {
  if (pushupReps === 0) return { total: 0, pbBonus: 0, speedBonus: 0 };

  let base = 20;
  const beatPB = pushupReps > personalBest;
  const pbBonus = beatPB ? 50 : 0;

  // Speed multiplier
  const speedMultiplier = completedWithin5Min ? 1.5 : 1.0;
  const speedBonus = completedWithin5Min ? 10 : 0;

  const total = Math.round(base * speedMultiplier) + pbBonus;

  return { total, pbBonus, speedBonus };
}
```

**XP Breakdown**:
- **Base**: 20 XP (any push-ups completed)
- **PB Bonus**: +50 XP (when beating personal best)
- **Speed Bonus**: ×1.5 multiplier when completed within 5 minutes of previous section
- **Total Range**: 0-70 XP per session

**Current Status**: Speed bonus tracking is NOT implemented (TODO in code, line 197)

### 3.2 PB Update Logic

**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx` (Lines 566-573)

```typescript
const updatePushupReps = (reps: number) => {
  setPushupReps(reps);
  // Update PB if new record!
  if (reps > pushupPB) {
    setPushupPB(reps);
  }
};
```

**Rules**:
- PB updates immediately when reps exceed current PB
- No validation on decrement (user can decrease reps below PB)
- PB persists globally in localStorage
- Default PB: 30 reps (initial value)

### 3.3 Task Completion Rules

**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx` (Lines 616-632)

```typescript
case 'getBloodFlowing':
  // Complete when all subtasks are checked
  return subtasks.length > 0 && subtasks.every(subtask => isHabitCompleted(subtask.key));
```

**Current Implementation**: Task completion requires:
1. Pushup subtask checkbox checked
2. At least 1 rep logged

**Issue**: The checkbox logic is disconnected from actual rep tracking - checking the box doesn't mean push-ups were done.

---

## 4. Component Dependencies

### 4.1 UI Components

#### PushUpTracker Component
**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/PushUpTracker.tsx`

**Props Interface**:
```typescript
interface PushUpTrackerProps {
  reps: number;
  personalBest: number;
  onUpdateReps: (reps: number) => void;
}
```

**Features**:
- Rep counter display with +/- buttons
- Increment by 1 or 5
- Decrement by 1 (minimum 0)
- PB display below counter
- New PB celebration animation (when `reps === personalBest && reps > 30`)

**Styling**:
- Orange color theme (`bg-orange-900/20`, `border-orange-600/30`)
- Compact layout (w-64)
- Mobile-optimized buttons with h-7 height

### 4.2 Display Components

#### XPPill Component
**Usage**: Displays potential/earned XP for the task
**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill.tsx`

**Blood Flow Specifics**:
- Shows XP earned when task complete
- Color-coded tiers based on XP amount
- Glow animation on completion

#### XPFooterSummary Component
**Usage**: Shows XP breakdown at bottom of page
**Location**: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/XPFooterSummary.tsx`

**Blood Flow Specifics**:
- Displays "Get Blood Flowing" XP (Line 73-82)
- Shows PB bonus with 🏆 emoji
- Shows speed bonus with ⚡ emoji (currently always 0)

---

## 5. External Dependencies

### 5.1 Supabase Integration

**Hook**: `useMorningRoutineSupabase`
**Location**: `/src/lib/hooks/useMorningRoutineSupabase.ts`

**Metadata Interface**:
```typescript
export interface MorningRoutineMetadata {
  pushupReps?: number;
  // ... other fields
}
```

**Sync Behavior**:
1. State changes trigger debounced metadata update (500ms)
2. Updates stored in offline database first (IndexedDB)
3. Synced to Supabase when online
4. Falls back to localStorage if not signed in

**Key Function**: `updateMetadata({ pushupReps })`
**Lines**: 396-401 in MorningRoutineSection.tsx

### 5.2 XP Calculation Dependencies

**Imports**:
```typescript
import {
  calculateGetBloodFlowingXP,
  calculateTotalMorningXP
} from '../../domain/xpCalculations';
```

**Called From**:
- `todayXP` useMemo (Lines 653-672)
- Total morning routine calculation

### 5.3 Gamification Service

**Service**: `GamificationService`
**Location**: `/src/domains/lifelock/_shared/services/gamificationService`

**Usage**: Awards XP for completion
**Note**: Currently NO direct XP awarding for blood flow (XP calculated but not awarded via service)

---

## 6. Data Flow Diagram

```
User Interaction Flow:
┌─────────────────┐
│ User clicks     │
│ +/- buttons     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PushUpTracker.onUpdateReps()    │
│ (Line 1038 in MorningRoutine)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ updatePushupReps(reps)          │
│ (Lines 566-573)                 │
└────────┬────────────────────────┘
         │
         ├──► setPushupReps(reps)
         │    │
         │    ├──► localStorage: lifelock-pushups-${date}
         │    └──► Supabase: metadata.pushupReps (debounced 500ms)
         │
         └──► if (reps > pushupPB)
                setPushupPB(reps)
                │
                └──► localStorage: lifelock-pushupPB (global)

XP Calculation Flow:
┌─────────────────────────────────┐
│ todayXP useMemo                 │
│ (Lines 653-672)                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ calculateTotalMorningXP()       │
│ (xpCalculations.ts)             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ calculateGetBloodFlowingXP()    │
│ - pushupReps                    │
│ - pushupPB                      │
│ - completedWithin5Min (false)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Returns: {                      │
│   total: 20-70,                 │
│   pbBonus: 0/50,                │
│   speedBonus: 0/10              │
│ }                               │
└─────────────────────────────────┘
```

---

## 7. Proposed Hook Interface

### 7.1 Hook Signature

```typescript
interface BloodFlowState {
  // Core state
  reps: number;
  personalBest: number;

  // Computed values
  isComplete: boolean;
  isNewPB: boolean;
  xp: {
    total: number;
    base: number;
    pbBonus: number;
    speedBonus: number;
  };

  // Actions
  setReps: (reps: number) => void;
  incrementReps: (amount: number) => void;
  decrementReps: (amount: number) => void;
  resetReps: () => void;

  // Sync status
  isSyncing: boolean;
  lastSyncError: Error | null;
}

interface UseBloodFlowOptions {
  date: Date;
  userId: string | null;
  enableSync?: boolean;
}

export function useBloodFlow(
  options: UseBloodFlowOptions
): BloodFlowState
```

### 7.2 Implementation Structure

```typescript
export function useBloodFlow({
  date,
  userId,
  enableSync = true
}: UseBloodFlowOptions): BloodFlowState {

  // ========== STATE ==========
  const [reps, setReps] = useState<number>(0);
  const [personalBest, setPersonalBest] = useState<number>(() => loadPB());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<Error | null>(null);

  // ========== DERIVED STATE ==========
  const isComplete = useMemo(() => reps > 0, [reps]);
  const isNewPB = useMemo(() => reps > 30 && reps === personalBest, [reps, personalBest]);

  const xp = useMemo(() => {
    return calculateGetBloodFlowingXP(
      reps,
      personalBest,
      false // TODO: implement speed tracking
    );
  }, [reps, personalBest]);

  // ========== ACTIONS ==========
  const updateReps = useCallback((newReps: number) => {
    setReps(newReps);

    // Update PB if new record
    if (newReps > personalBest) {
      setPersonalBest(newReps);
      savePB(newReps);
    }

    // Persist to localStorage (immediate)
    saveRepsToLocalStorage(date, newReps);

    // Sync to Supabase (debounced)
    if (enableSync && userId) {
      syncToSupabase(newReps);
    }
  }, [personalBest, date, userId, enableSync]);

  const incrementReps = useCallback((amount: number) => {
    updateReps(Math.max(0, reps + amount));
  }, [reps, updateReps]);

  const decrementReps = useCallback((amount: number) => {
    updateReps(Math.max(0, reps - amount));
  }, [reps, updateReps]);

  const resetReps = useCallback(() => {
    updateReps(0);
  }, [updateReps]);

  // ========== INIT ==========
  useEffect(() => {
    // Load reps for specific date
    const savedReps = loadRepsFromLocalStorage(date);
    if (savedReps !== null) {
      setReps(savedReps);
    }
  }, [date]);

  // ========== RETURN ==========
  return {
    reps,
    personalBest,
    isComplete,
    isNewPB,
    xp,
    setReps: updateReps,
    incrementReps,
    decrementReps,
    resetReps,
    isSyncing,
    lastSyncError
  };
}
```

### 7.3 Component Usage

```typescript
// In MorningRoutineSection.tsx
const bloodFlow = useBloodFlow({
  date: selectedDate,
  userId: internalUserId,
  enableSync: !!internalUserId
});

// In render:
<PushUpTracker
  reps={bloodFlow.reps}
  personalBest={bloodFlow.personalBest}
  onUpdateReps={bloodFlow.setReps}
/>

<XPPill
  xp={bloodFlow.xp.total}
  earned={bloodFlow.isComplete}
  showGlow={bloodFlow.isComplete}
/>
```

---

## 8. Migration Risks

### 8.1 High Risk Areas

#### 1. PB State Management
**Risk**: PB is global state shared across all dates
**Issue**: If extracted incorrectly, could create duplicate PB state
**Mitigation**:
- Ensure PB is loaded/saved from single source of truth
- Add migration to clean up duplicate localStorage keys
- Add validation to prevent PB from decreasing

#### 2. Supabase Sync Timing
**Risk**: Debounced sync could conflict with hook state updates
**Issue**: Race conditions between local state and Supabase updates
**Mitigation**:
- Implement optimistic locking or versioning
- Add sync conflict resolution
- Test offline/online transitions

#### 3. XP Calculation Integration
**Risk**: XP calc is tightly coupled with total morning routine XP
**Issue**: Breaking the dependency could affect other domains
**Mitigation**:
- Keep calculateGetBloodFlowingXP in shared domain layer
- Ensure hook returns same XP structure
- Add integration tests for total XP calculation

### 8.2 Medium Risk Areas

#### 4. Task Completion Logic
**Risk**: Checkbox state is disconnected from rep tracking
**Issue**: Users can check box without doing push-ups
**Mitigation**:
- Make checkbox read-only, auto-check when reps > 0
- Or remove checkbox entirely (use rep count as completion signal)

#### 5. Date Boundary Handling
**Risk**: State doesn't reset when date changes
**Issue**: Yesterday's reps carry over to today
**Mitigation**:
- Add useEffect to reset reps when date changes
- Validate stored reps belong to current date
- Add date validation to localStorage keys

### 8.3 Low Risk Areas

#### 6. UI Component Props
**Risk**: Component interface changes could break rendering
**Issue**: Minimal - props are simple and well-typed
**Mitigation**:
- Keep PushUpTracker props unchanged
- Add TypeScript validation
- Storybook tests for component

---

## 9. Test Requirements

### 9.1 Unit Tests

#### State Management Tests
```typescript
describe('useBloodFlow', () => {
  it('should initialize with 0 reps', () => {
    // Test initial state
  });

  it('should load saved reps from localStorage', () => {
    // Test localStorage integration
  });

  it('should reset reps when date changes', () => {
    // Test date boundary handling
  });

  it('should update PB when reps exceed current PB', () => {
    // Test PB update logic
  });

  it('should not decrease PB when reps decrease', () => {
    // Test PB persistence
  });
});
```

#### XP Calculation Tests
```typescript
describe('calculateGetBloodFlowingXP', () => {
  it('should return 0 XP when reps is 0', () => {
    expect(calculateGetBloodFlowingXP(0, 30, false)).toEqual({
      total: 0,
      pbBonus: 0,
      speedBonus: 0
    });
  });

  it('should award base 20 XP for any push-ups', () => {
    expect(calculateGetBloodFlowingXP(5, 30, false).total).toBe(20);
  });

  it('should award 50 XP PB bonus when beating PB', () => {
    expect(calculateGetBloodFlowingXP(31, 30, false).pbBonus).toBe(50);
  });

  it('should apply speed multiplier when completedWithin5Min is true', () => {
    const result = calculateGetBloodFlowingXP(10, 30, true);
    expect(result.total).toBe(30); // 20 * 1.5
    expect(result.speedBonus).toBe(10);
  });

  it('should calculate max XP (base + PB + speed)', () => {
    const result = calculateGetBloodFlowingXP(31, 30, true);
    expect(result.total).toBe(80); // (20 * 1.5) + 50
  });
});
```

### 9.2 Integration Tests

```typescript
describe('Blood Flow Integration', () => {
  it('should sync reps to Supabase when user is signed in', async () => {
    // Test Supabase sync
  });

  it('should fallback to localStorage when offline', async () => {
    // Test offline behavior
  });

  it('should calculate total morning routine XP correctly', () => {
    // Test integration with total XP calc
  });

  it('should update task completion status when reps > 0', () => {
    // Test task completion logic
  });
});
```

### 9.3 E2E Tests

```typescript
describe('Blood Flow E2E', () => {
  it('should complete full user flow: increment reps → update PB → award XP', () => {
    // Test complete user journey
  });

  it('should display PB celebration when beating PB', () => {
    // Test UI feedback
  });

  it('should persist reps across page refreshes', () => {
    // Test persistence
  });

  it('should handle offline/online transitions', () => {
    // Test sync resilience
  });
});
```

### 9.4 Edge Cases to Test

1. **Zero Reps**: User clicks checkbox but enters 0 reps
2. **Negative Reps**: User attempts to set negative reps
3. **PB Ties**: User equals current PB (should not update)
4. **Date Change**: User changes date while viewing push-ups
5. **Concurrent Sessions**: Same user on multiple devices
6. **Data Corruption**: Invalid values in localStorage/Supabase
7. **Network Failures**: Sync fails during update
8. **Rapid Updates**: User spamming +/- buttons quickly

---

## 10. Refactoring Checklist

### Phase 1: Preparation
- [ ] Create feature branch for Blood Flow extraction
- [ ] Set up test environment
- [ ] Document current behavior (screenshots/videos)
- [ ] Backup current state of code

### Phase 2: Domain Extraction
- [ ] Create `/domains/lifelock/1-daily/1-morning-routine/features/blood-flow/` directory
- [ ] Create `useBloodFlow.ts` hook
- [ ] Move PB logic to hook
- [ ] Move XP calc to hook (call shared function)
- [ ] Implement localStorage persistence in hook

### Phase 3: Component Integration
- [ ] Update MorningRoutineSection to use useBloodFlow
- [ ] Update PushUpTracker props usage
- [ ] Update XP calculation integration
- [ ] Update task completion logic

### Phase 4: Testing
- [ ] Write unit tests for useBloodFlow
- [ ] Write integration tests for XP calc
- [ ] Write E2E tests for user flows
- [ ] Test offline/online scenarios
- [ ] Test date boundary handling
- [ ] Test PB update logic

### Phase 5: Validation
- [ ] Compare XP values before/after (should match)
- [ ] Compare PB behavior before/after (should match)
- [ ] Test in development environment
- [ ] Test in staging environment
- [ ] Performance testing (no regressions)

### Phase 6: Deployment
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Monitor user behavior analytics
- [ ] Rollback plan if issues detected

---

## 11. Open Questions

### 11.1 Functional Questions

1. **Speed Bonus**: Should we implement the speed bonus tracking?
   - Currently hardcoded to `false` in XP calc
   - Requires tracking time since previous section completion
   - Adds complexity but incentivizes quick completion

2. **PB Validation**: Should PB be validated to prevent decrease?
   - Current logic allows PB to stay same or increase
   - No validation prevents user from "cheating" by setting impossible PB
   - Consider max PB cap (e.g., 100 reps)

3. **Task Completion**: Should we remove the checkbox and rely solely on rep count?
   - Current: Checkbox state + rep count are independent
   - Proposed: Auto-check when reps > 0
   - Simpler but removes flexibility (e.g., user did pushups but didn't track)

### 11.2 Technical Questions

1. **PB Storage**: Should PB be synced to Supabase?
   - Current: localStorage only (global, not per-day)
   - Pro: Survives browser/device changes
   - Con: Requires user profile schema change
   - Recommendation: Keep in localStorage for now, migrate later

2. **Rep Reset**: When should reps reset?
   - Current: When date changes in UI
   - Edge case: What if user logs push-ups at 11 PM, then checks at 1 AM?
   - Recommendation: Use date of wake-up time, not current date

3. **XP Awarding**: Should we use GamificationService for blood flow?
   - Current: XP calculated but not awarded via service
   - Inconsistent with other domains (wake-up, meditation)
   - Recommendation: Implement service awarding for consistency

---

## 12. Success Metrics

### 12.1 Technical Metrics
- **Code Reduction**: Reduce MorningRoutineSection.tsx by ~100 lines
- **Test Coverage**: Achieve 90%+ coverage for Blood Flow domain
- **Performance**: No regressions in render time or bundle size
- **Bug Rate**: Zero critical bugs post-refactor

### 12.2 User Experience Metrics
- **Completion Rate**: Maintain or increase push-up completion rate
- **Data Integrity**: Zero data loss during migration
- **Sync Reliability**: 99%+ sync success rate
- **User Feedback**: No negative feedback on behavior changes

### 12.3 Developer Experience Metrics
- **Maintainability**: Easy to add new Blood Flow features
- **Testability**: Easy to test Blood Flow in isolation
- **Documentation**: Clear documentation of domain boundaries
- **Onboarding**: New devs can understand Blood Flow quickly

---

## 13. Next Steps

### Immediate Actions
1. **Review this document** with team to validate assumptions
2. **Create tech spec** for useBloodFlow hook implementation
3. **Set up test environment** with sample data
4. **Create branch** for refactoring work

### Week 1: Foundation
- Implement useBloodFlow hook
- Write unit tests
- Update PushUpTracker integration
- Test locally

### Week 2: Integration
- Update MorningRoutineSection
- Integrate with Supabase sync
- Write integration tests
- Test in staging

### Week 3: Validation
- E2E testing
- Performance testing
- User acceptance testing
- Documentation updates

### Week 4: Deployment
- Code review and approval
- Production deployment
- Monitoring and rollback plan
- Post-deployment validation

---

## 14. Appendix

### 14.1 File Locations

**Current Implementation**:
- Main Component: `/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`
- UI Component: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/PushUpTracker.tsx`
- XP Calc: `/src/domains/lifelock/1-daily/1-morning-routine/domain/xpCalculations.ts`
- Config: `/src/domains/lifelock/1-daily/1-morning-routine/domain/config.ts`

**Proposed Structure**:
```
/src/domains/lifelock/1-daily/1-morning-routine/features/
├── blood-flow/
│   ├── hooks/
│   │   └── useBloodFlow.ts
│   ├── components/
│   │   └── PushUpTracker.tsx (move here)
│   ├── utils/
│   │   ├── pbStorage.ts
│   │   └── xpCalculator.ts
│   ├── types/
│   │   └── bloodFlow.types.ts
│   └── __tests__/
│       ├── useBloodFlow.test.ts
│       └── xpCalculator.test.ts
```

### 14.2 Related Documentation

- **Morning Routine XP System**: `/docs/features/MORNING-ROUTINE-XP-SYSTEM.md`
- **Domain Architecture**: `/docs/architecture/DOMAIN-DRIVEN-DESIGN.md`
- **Supabase Schema**: `/docs/database/SUPABASE-SCHEMA.md`
- **Gamification Service**: `/domains/lifelock/_shared/services/gamificationService.ts`

### 14.3 Key Code References

| Function | Location | Lines | Description |
|----------|----------|-------|-------------|
| updatePushupReps | MorningRoutineSection.tsx | 566-573 | Updates reps and PB |
| calculateGetBloodFlowingXP | xpCalculations.ts | 93-111 | XP calculation logic |
| PushUpTracker | PushUpTracker.tsx | 1-80 | UI component |
| persistMorningMetadata | useMorningRoutineSupabase.ts | 310-334 | Supabase sync |

---

## Document Metadata

**Author**: Domain Analysis Agent
**Date**: 2025-01-18
**Version**: 1.0
**Status**: Draft
**Related Domains**: Wake Up, Freshen Up, Power Up Brain, Plan Day, Meditation
**Dependencies**: Supabase, Gamification Service, XP Calculations

---

## Changelog

**v1.0** (2025-01-18)
- Initial domain analysis
- Complete state inventory
- Business rules documentation
- Proposed hook interface
- Migration risk assessment
- Test requirements
