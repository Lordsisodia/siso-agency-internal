# Morning Routine Refactoring Implementation Plan

## Executive Summary

**Current State**: 1,192-line monolithic `MorningRoutineSection.tsx` component
**Target State**: Domain-driven architecture with 6 modular domains
**Estimated Effort**: 40-60 hours across 7 phases
**Risk Level**: Medium (mitigated by phased approach)

---

## Table of Contents

1. [Target Architecture](#1-target-architecture)
2. [Implementation Phases](#2-implementation-phases)
3. [File-by-File Specification](#3-file-by-file-specification)
4. [Testing Strategy](#4-testing-strategy)
5. [Risk Register](#5-risk-register)
6. [Migration Checklist](#6-migration-checklist)
7. [Success Metrics](#7-success-metrics)

---

## 1. Target Architecture

### 1.1 Directory Structure

```
src/domains/lifelock/1-daily/1-morning-routine/
├── domain/
│   ├── types/
│   │   ├── index.ts                      # Main type exports (50 lines)
│   │   ├── task.types.ts                 # Task & subtask types (100 lines)
│   │   ├── xp.types.ts                   # XP calculation types (80 lines)
│   │   ├── state.types.ts                # State management types (120 lines)
│   │   └── api.types.ts                  # API request/response types (60 lines)
│   ├── services/
│   │   ├── xp/
│   │   │   ├── XPCalculator.service.ts   # Core XP calculations (250 lines)
│   │   │   ├── XPAwarder.service.ts      # XP awarding logic (150 lines)
│   │   │   └── XPMultiplier.service.ts   # Multiplier calculations (200 lines)
│   │   ├── task/
│   │   │   ├── TaskValidator.service.ts  # Task validation (100 lines)
│   │   │   ├── TaskProgress.service.ts   # Progress tracking (150 lines)
│   │   │   └── TaskCompletion.service.ts # Completion logic (120 lines)
│   │   └── time/
│   │       ├── TimeParser.service.ts     # Time parsing (100 lines)
│   │       └── TimeTracker.service.ts    # Time tracking (150 lines)
│   ├── config/
│   │   ├── tasks.config.ts               # Task definitions (170 lines)
│   │   ├── xp.config.ts                  # XP rules config (100 lines)
│   │   └── constants.config.ts           # Constants (50 lines)
│   └── utils/
│       ├── date.utils.ts                 # Date utilities (80 lines)
│       ├── storage.utils.ts              # Storage helpers (100 lines)
│       └── validation.utils.ts           # Validation helpers (60 lines)
│
├── application/
│   ├── wake-up/
│   │   ├── hooks/
│   │   │   └── useWakeUpDomain.ts        # Wake-up domain hook (200 lines)
│   │   ├── services/
│   │   │   └── WakeUpService.ts          # Wake-up business logic (150 lines)
│   │   └── types/
│   │       └── wake-up.types.ts          # Wake-up specific types (40 lines)
│   ├── freshen-up/
│   │   ├── hooks/
│   │   │   └── useFreshenUpDomain.ts     # Freshen Up domain hook (180 lines)
│   │   ├── services/
│   │   │   └── FreshenUpService.ts       # Freshen Up logic (120 lines)
│   │   └── types/
│   │       └── freshen-up.types.ts       # Freshen Up types (40 lines)
│   ├── blood-flow/
│   │   ├── hooks/
│   │   │   └── useBloodFlowDomain.ts     # Blood Flow domain hook (200 lines)
│   │   ├── services/
│   │   │   └── BloodFlowService.ts       # Push-up tracking (150 lines)
│   │   └── types/
│   │       └── blood-flow.types.ts       # Blood Flow types (40 lines)
│   ├── brain-power/
│   │   ├── hooks/
│   │   │   └── useBrainPowerDomain.ts    # Brain Power domain hook (180 lines)
│   │   ├── services/
│   │   │   └── BrainPowerService.ts      # Hydration tracking (120 lines)
│   │   └── types/
│   │       └── brain-power.types.ts      # Brain Power types (40 lines)
│   ├── planning/
│   │   ├── hooks/
│   │   │   └── usePlanningDomain.ts      # Planning domain hook (220 lines)
│   │   ├── services/
│   │   │   └── PlanningService.ts        # Planning logic (150 lines)
│   │   └── types/
│   │       └── planning.types.ts         # Planning types (40 lines)
│   ├── meditation/
│   │   ├── hooks/
│   │   │   └── useMeditationDomain.ts    # Meditation domain hook (180 lines)
│   │   ├── services/
│   │   │   └── MeditationService.ts      # Meditation logic (120 lines)
│   │   └── types/
│   │       └── meditation.types.ts       # Meditation types (40 lines)
│   └── morning-routine/
│       ├── hooks/
│       │   └── useMorningRoutine.ts      # Main orchestrator hook (300 lines)
│       └── services/
│           └── MorningRoutineService.ts  # Routine orchestration (200 lines)
│
├── infrastructure/
│   └── repositories/
│       ├── MorningRoutineRepository.ts   # Data access layer (250 lines)
│       ├── OfflineCache.repository.ts    # Offline storage (150 lines)
│       └── SupabaseSync.repository.ts    # Sync logic (200 lines)
│
└── ui/
    ├── pages/
    │   └── MorningRoutineSection.tsx     # Main page (refactored, 200 lines)
    ├── task-views/
    │   ├── WakeUpTaskView.tsx            # Wake-up UI (150 lines)
    │   ├── FreshenUpTaskView.tsx         # Freshen Up UI (180 lines)
    │   ├── BloodFlowTaskView.tsx         # Blood Flow UI (200 lines)
    │   ├── BrainPowerTaskView.tsx        # Brain Power UI (180 lines)
    │   ├── PlanningTaskView.tsx          # Planning UI (220 lines)
    │   └── MeditationTaskView.tsx        # Meditation UI (180 lines)
    └── components/
        ├── (Reused existing components)
        │   ├── WakeUpTimeTracker.tsx
        │   ├── WaterTracker.tsx
        │   ├── PushUpTracker.tsx
        │   ├── MeditationTracker.tsx
        │   ├── TimeScrollPicker.tsx
        │   ├── PlanDayActions.tsx
        │   ├── MotivationalQuotes.tsx
        │   ├── MorningMindsetCard.tsx
        │   ├── XPPill.tsx
        │   └── XPFooterSummary.tsx
        └── (New shared components)
            ├── TaskCard.tsx               # Generic task card (120 lines)
            ├── ProgressBar.tsx            # Progress indicator (80 lines)
            └── XPDisplay.tsx              # XP display (60 lines)
```

### 1.2 File Count Summary

- **Domain Layer**: 24 files (~4,000 lines)
- **Application Layer**: 24 files (~3,500 lines)
- **Infrastructure Layer**: 3 files (~600 lines)
- **UI Layer**: 18 files (~2,500 lines)
- **Total**: 69 files (~10,600 lines)

**Average file size**: ~154 lines (down from 1,192)

---

## 2. Implementation Phases

### Phase 1: Foundation (Week 1, Days 1-2)
**Complexity**: Low | **Dependencies**: None | **Risk**: Low

#### Tasks:
1. **Create domain type definitions** (4 hours)
   - Set up `domain/types/` directory structure
   - Define core interfaces for tasks, state, XP
   - Create type export barrel file

2. **Establish domain services foundation** (6 hours)
   - Create service interfaces
   - Set up base service classes
   - Define service contracts

3. **Set up configuration** (2 hours)
   - Extract task configurations
   - Define XP rules
   - Set up constants

**Completion Criteria**:
- All type definitions compile without errors
- Service interfaces are defined
- Configuration is centralized

**Testing**:
- Type validation tests
- Configuration loading tests

---

### Phase 2: Domain Layer (Week 1, Days 3-5)
**Complexity**: Medium | **Dependencies**: Phase 1 | **Risk**: Low

#### Tasks:
1. **Implement XP calculation services** (8 hours)
   - `XPCalculator.service.ts`: Core calculations
   - `XPMultiplier.service.ts`: Multiplier logic
   - `XPAwarder.service.ts`: Awarding logic

2. **Implement task services** (6 hours)
   - `TaskValidator.service.ts`: Validation
   - `TaskProgress.service.ts`: Progress tracking
   - `TaskCompletion.service.ts`: Completion logic

3. **Implement time services** (4 hours)
   - `TimeParser.service.ts`: Parse time strings
   - `TimeTracker.service.ts`: Track time-based events

4. **Create utility functions** (4 hours)
   - Date utilities
   - Storage helpers
   - Validation helpers

**Completion Criteria**:
- All domain services have unit tests
- XP calculations match existing behavior
- Time parsing handles all edge cases

**Testing**:
- Unit tests for each service
- Integration tests for XP calculations
- Property-based tests for time parsing

---

### Phase 3: Application Layer (Week 2, Days 1-3)
**Complexity**: Medium | **Dependencies**: Phase 2 | **Risk**: Medium

#### Tasks:
1. **Create domain-specific hooks** (12 hours)
   - `useWakeUpDomain.ts`
   - `useFreshenUpDomain.ts`
   - `useBloodFlowDomain.ts`
   - `useBrainPowerDomain.ts`
   - `usePlanningDomain.ts`
   - `useMeditationDomain.ts`

2. **Create domain services** (8 hours)
   - Each domain gets a service class
   - Implement business logic
   - Handle state management

3. **Create orchestrator hook** (4 hours)
   - `useMorningRoutine.ts`
   - Coordinate all domain hooks
   - Provide unified interface

**Completion Criteria**:
- Each hook has TypeScript types
- Hooks can be used independently
- Orchestrator combines all hooks

**Testing**:
- Hook testing with React Testing Library
- Integration tests between hooks
- State management tests

---

### Phase 4: UI Layer - Task Views (Week 2, Days 4-5)
**Complexity**: Medium | **Dependencies**: Phase 3 | **Risk**: Medium

#### Tasks:
1. **Create task view components** (10 hours)
   - Extract UI for each domain
   - Create reusable `TaskCard` component
   - Implement `ProgressBar` and `XPDisplay`

2. **Refactor existing components** (4 hours)
   - Update existing trackers to use new hooks
   - Remove business logic from components
   - Keep components purely presentational

3. **Create shared UI components** (2 hours)
   - Generic task card
   - Progress bar
   - XP display

**Completion Criteria**:
- Each task view renders correctly
- Components use domain hooks
- No business logic in components

**Testing**:
- Visual regression tests
- Component unit tests
- Accessibility tests

---

### Phase 5: Integration (Week 3, Days 1-2)
**Complexity**: High | **Dependencies**: Phase 4 | **Risk**: High

#### Tasks:
1. **Implement infrastructure layer** (6 hours)
   - Repository pattern
   - Offline caching
   - Sync logic

2. **Create main page component** (4 hours)
   - Refactor `MorningRoutineSection.tsx`
   - Use orchestrator hook
   - Compose task views

3. **Integrate with existing systems** (4 hours)
   - Supabase integration
   - Offline mode
   - XP system

**Completion Criteria**:
- Main page loads without errors
- Data persists correctly
- Offline mode works

**Testing**:
- End-to-end tests
- Integration tests
- Performance tests

---

### Phase 6: Migration (Week 3, Days 3-4)
**Complexity**: High | **Dependencies**: Phase 5 | **Risk**: High

#### Tasks:
1. **Feature flag implementation** (2 hours)
   - Add feature flag
   - Create A/B test setup
   - Implement rollback mechanism

2. **Data migration** (4 hours)
   - Migrate existing data
   - Validate data integrity
   - Handle edge cases

3. **Gradual rollout** (4 hours)
   - 10% of users
   - 25% of users
   - 50% of users
   - 100% of users

**Completion Criteria**:
- No data loss
- No performance degradation
- User acceptance

**Testing**:
- Migration tests
- Rollback tests
- Data validation tests

---

### Phase 7: Cleanup (Week 3, Day 5)
**Complexity**: Low | **Dependencies**: Phase 6 | **Risk**: Low

#### Tasks:
1. **Remove old code** (2 hours)
   - Delete monolithic component
   - Remove unused imports
   - Clean up comments

2. **Update documentation** (2 hours)
   - Update README
   - Document new architecture
   - Create migration guide

3. **Performance optimization** (2 hours)
   - Code splitting
   - Lazy loading
   - Bundle analysis

**Completion Criteria**:
- Old code removed
- Documentation updated
- Performance improved

**Testing**:
- Bundle size analysis
- Performance metrics
- Documentation review

---

## 3. File-by-File Specification

### 3.1 Domain Layer Files

#### `domain/types/index.ts` (50 lines)
**Purpose**: Central type exports
**Exports**:
- All task types
- All state types
- All XP types
- All API types

**Dependencies**: None

---

#### `domain/types/task.types.ts` (100 lines)
**Purpose**: Task and subtask type definitions
**Key Types**:
```typescript
interface MorningTask {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  hasTimeTracking: boolean;
  subtasks: MorningSubtask[];
}

interface MorningSubtask {
  key: string;
  title: string;
  completed: boolean;
}
```

**Dependencies**: lucide-react

---

#### `domain/services/xp/XPCalculator.service.ts` (250 lines)
**Purpose**: Core XP calculation logic
**Key Methods**:
```typescript
class XPCalculator {
  calculateWakeUpXP(time: string, date: Date): number;
  calculateFreshenUpXP(tasks: FreshenUpTasks): number;
  calculateBloodFlowXP(reps: number, pb: number): number;
  calculateBrainPowerXP(water: number, supplements: boolean): number;
  calculatePlanningXP(complete: boolean): number;
  calculateMeditationXP(duration: string): number;
  calculatePrioritiesXP(priorities: string[]): number;
  calculateTotal(params: TotalXPParams): XPBreakdown;
}
```

**Dependencies**: 
- `domain/types/xp.types.ts`
- `domain/services/time/TimeParser.service.ts`

---

#### `domain/services/xp/XPMultiplier.service.ts` (200 lines)
**Purpose**: Calculate XP multipliers
**Key Methods**:
```typescript
class XPMultiplier {
  calculateWakeUpMultiplier(time: string): number;
  calculateSpeedMultiplier(minutesSinceWake: number): number;
  calculateStreakMultiplier(streak: number): number;
  calculateWeekendBonus(date: Date): number;
}
```

**Dependencies**: 
- `domain/types/xp.types.ts`
- `domain/services/time/TimeParser.service.ts`

---

#### `domain/config/tasks.config.ts` (170 lines)
**Purpose**: Task definitions and configuration
**Exports**:
```typescript
export const MORNING_ROUTINE_TASKS: MorningTask[] = [
  // Wake Up, Freshen Up, etc.
];

export const TASK_CATEGORIES = {
  preparation: ['wakeUp', 'freshenUp'],
  physical: ['getBloodFlowing', 'powerUpBrain'],
  mental: ['planDay', 'meditation']
};

export function getTaskByKey(key: string): MorningTask | undefined;
export function getTasksByCategory(category: string): MorningTask[];
```

**Dependencies**: 
- `domain/types/task.types.ts`
- lucide-react icons

---

### 3.2 Application Layer Files

#### `application/wake-up/hooks/useWakeUpDomain.ts` (200 lines)
**Purpose**: Wake-up domain hook
**Interface**:
```typescript
interface UseWakeUpDomainReturn {
  wakeUpTime: string;
  setWakeUpTime: (time: string) => void;
  xp: number;
  multiplier: number;
  isComplete: boolean;
  history: WakeUpHistoryEntry[];
  loadHistory: () => Promise<void>;
}

export function useWakeUpDomain(
  selectedDate: Date
): UseWakeUpDomainReturn;
```

**Dependencies**:
- `domain/services/xp/XPCalculator.service.ts`
- `infrastructure/repositories/MorningRoutineRepository.ts`
- `ui/components/WakeUpTimeTracker.tsx`

---

#### `application/morning-routine/hooks/useMorningRoutine.ts` (300 lines)
**Purpose**: Main orchestrator hook
**Interface**:
```typescript
interface UseMorningRoutineReturn {
  // Domain hooks
  wakeUp: UseWakeUpDomainReturn;
  freshenUp: UseFreshenUpDomainReturn;
  bloodFlow: UseBloodFlowDomainReturn;
  brainPower: UseBrainPowerDomainReturn;
  planning: UsePlanningDomainReturn;
  meditation: UseMeditationDomainReturn;
  
  // Aggregate state
  totalXP: number;
  progress: number;
  isComplete: boolean;
  
  // Actions
  loadAll: () => Promise<void>;
  saveAll: () => Promise<void>;
}

export function useMorningRoutine(
  selectedDate: Date
): UseMorningRoutineReturn;
```

**Dependencies**:
- All domain hooks
- `domain/services/xp/XPCalculator.service.ts`

---

### 3.3 Infrastructure Layer Files

#### `infrastructure/repositories/MorningRoutineRepository.ts` (250 lines)
**Purpose**: Data access layer
**Interface**:
```typescript
interface MorningRoutineRepository {
  // CRUD
  getRoutine(date: string): Promise<MorningRoutineData>;
  saveRoutine(data: MorningRoutineData): Promise<void>;
  updateRoutine(id: string, updates: Partial<MorningRoutineData>): Promise<void>;
  
  // Offline support
  getCachedRoutine(date: string): Promise<MorningRoutineData | null>;
  cacheRoutine(data: MorningRoutineData): Promise<void>;
  
  // Sync
  syncRoutine(date: string): Promise<void>;
  syncAllRoutines(): Promise<void>;
}
```

**Dependencies**:
- `domain/types/state.types.ts`
- Supabase client
- Offline DB

---

### 3.4 UI Layer Files

#### `ui/task-views/WakeUpTaskView.tsx` (150 lines)
**Purpose**: Wake-up task UI component
**Props**:
```typescript
interface WakeUpTaskViewProps {
  task: MorningTask;
  domain: UseWakeUpDomainReturn;
  onComplete: () => void;
}
```

**Structure**:
- Uses `WakeUpTimeTracker` component
- Displays XP and multiplier
- Shows completion status
- Handles user interactions

**Dependencies**:
- `application/wake-up/hooks/useWakeUpDomain.ts`
- `ui/components/WakeUpTimeTracker.tsx`
- `ui/components/TaskCard.tsx`

---

#### `ui/pages/MorningRoutineSection.tsx` (200 lines, refactored)
**Purpose**: Main page component
**Structure**:
```typescript
export function MorningRoutineSection({ selectedDate }: Props) {
  const routine = useMorningRoutine(selectedDate);
  
  return (
    <div>
      <ProgressHeader progress={routine.progress} />
      <MindsetCard />
      {routine.wakeUp && <WakeUpTaskView {...routine.wakeUp} />}
      {routine.freshenUp && <FreshenUpTaskView {...routine.freshenUp} />}
      {/* ... other task views */}
      <XPFooter breakdown={routine.totalXP} />
    </div>
  );
}
```

**Dependencies**:
- `application/morning-routine/hooks/useMorningRoutine.ts`
- All task view components

---

## 4. Testing Strategy

### 4.1 Unit Tests

**Domain Services** (70% coverage target):
- `XPCalculator.service.test.ts`: Test all XP calculations
- `XPMultiplier.service.test.ts`: Test multiplier logic
- `TimeParser.service.test.ts`: Test time parsing edge cases
- `TaskValidator.service.test.ts`: Test validation rules

**Example Test**:
```typescript
describe('XPCalculator', () => {
  it('calculates wake-up XP correctly', () => {
    const calculator = new XPCalculator();
    const xp = calculator.calculateWakeUpXP('6:00 AM', new Date());
    expect(xp).toBe(200); // 100 base × 2.0 multiplier
  });
});
```

---

### 4.2 Integration Tests

**Application Hooks** (50% coverage target):
- Test hook interactions
- Test state updates
- Test side effects

**Example Test**:
```typescript
describe('useMorningRoutine', () => {
  it('coordinates all domain hooks', async () => {
    const { result } = renderHook(() => 
      useMorningRoutine(new Date())
    );
    
    await act(() => result.current.loadAll());
    
    expect(result.current.wakeUp.isComplete).toBeDefined();
    expect(result.current.freshenUp.isComplete).toBeDefined();
  });
});
```

---

### 4.3 E2E Tests

**User Journeys** (100% coverage target):
- Complete morning routine flow
- XP calculation flow
- Offline mode flow
- Data sync flow

**Example Test**:
```typescript
describe('Morning Routine Flow', () => {
  it('allows user to complete all tasks', async () => {
    await page.goto('/morning-routine');
    
    // Set wake-up time
    await page.click('[data-testid="wake-up-now"]');
    await expect(page.locator('[data-testid="wake-up-time"]')).toHaveText(/AM/);
    
    // Complete freshen up tasks
    await page.click('[data-testid="bathroom-checkbox"]');
    await page.click('[data-testid="brush-teeth-checkbox"]');
    await page.click('[data-testid="cold-shower-checkbox"]');
    
    // Verify XP
    await expect(page.locator('[data-testid="total-xp"]')).toContainText('130');
  });
});
```

---

### 4.4 Migration Testing

**Data Validation**:
- Verify all existing data migrates
- Test edge cases (missing fields, invalid data)
- Performance test migration script

**Rollback Testing**:
- Test feature flag rollback
- Verify old code still works
- Test data rollback

---

## 5. Risk Register

### 5.1 Data Loss Risks

**Risk**: User data corrupted during migration
**Probability**: Low | **Impact**: Critical

**Mitigation**:
1. Create full backup before migration
2. Run migration on staging first
3. Implement dry-run mode
4. Create rollback script
5. Monitor logs during migration

**Recovery**:
- Restore from backup
- Run rollback script
- Notify users of any issues

---

### 5.2 Regression Risks

**Risk**: New code introduces bugs
**Probability**: Medium | **Impact**: High

**Mitigation**:
1. Comprehensive test suite
2. Code reviews
3. Feature flags
4. Gradual rollout
5. Monitoring and alerting

**Recovery**:
- Roll back feature flag
- Fix bug in new branch
- Re-deploy after fix

---

### 5.3 Performance Risks

**Risk**: Refactored code is slower
**Probability**: Low | **Impact**: Medium

**Mitigation**:
1. Performance benchmarks
2. Bundle size monitoring
3. Lazy loading
4. Code splitting
5. Memoization

**Recovery**:
- Optimize bottlenecks
- Roll back if severe

---

### 5.4 User Experience Risks

**Risk**: UI changes confuse users
**Probability**: Low | **Impact**: Medium

**Mitigation**:
1. Visual regression tests
2. User testing
3. Gradual rollout
4. Collect feedback
5. A/B testing

**Recovery**:
- Roll back UI changes
- Address feedback

---

### 5.5 Integration Risks

**Risk**: New code doesn't integrate with existing systems
**Probability**: Medium | **Impact**: High

**Mitigation**:
1. Integration tests
2. Contract testing
3. Mock external dependencies
4. Test in staging environment
5. Monitor API calls

**Recovery**:
- Fix integration issues
- Roll back if critical

---

## 6. Migration Checklist

### Pre-Migration

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Backup created
- [ ] Staging environment tested
- [ ] Feature flag configured
- [ ] Monitoring set up
- [ ] Rollback plan prepared
- [ ] Team notified
- [ ] Users notified (if applicable)

### Migration Day

- [ ] Run migration script in dry-run mode
- [ ] Verify dry-run output
- [ ] Run actual migration
- [ ] Verify data integrity
- [ ] Run data validation checks
- [ ] Enable feature flag for 10% of users
- [ ] Monitor logs and metrics
- [ ] Check for errors
- [ ] Verify user reports
- [ ] Increment rollout to 25%
- [ ] Monitor for 1 hour
- [ ] Increment rollout to 50%
- [ ] Monitor for 1 hour
- [ ] Increment rollout to 100%

### Post-Migration

- [ ] Verify all systems working
- [ ] Check performance metrics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Monitor for 24 hours
- [ ] Remove old code
- [ ] Update documentation
- [ ] Retrospective meeting

### Rollback Procedure (if needed)

1. Disable feature flag immediately
2. Verify old code working
3. Investigate issue
4. Fix in new branch
5. Test fix thoroughly
6. Schedule retry

---

## 7. Success Metrics

### 7.1 Code Quality Metrics

**Before**:
- Largest file: 1,192 lines
- Average file size: N/A (monolithic)
- Cyclomatic complexity: High
- Test coverage: 0%

**After**:
- Largest file: <300 lines
- Average file size: ~154 lines
- Cyclomatic complexity: Low (<10 per function)
- Test coverage: >70%

**Targets**:
- 80% reduction in max file size ✅
- 70%+ test coverage ✅
- <10 cyclomatic complexity ✅
- TypeScript strict mode ✅

---

### 7.2 Performance Metrics

**Before**:
- Initial load: TBD
- Bundle size: TBD
- Render time: TBD

**After**:
- Initial load: Same or better
- Bundle size: Same or better (code splitting)
- Render time: Same or better

**Targets**:
- No performance regression ✅
- <5% bundle size increase ✅
- <100ms initial render ✅

---

### 7.3 Maintainability Metrics

**Before**:
- Time to add feature: High
- Time to fix bug: High
- Code review time: High

**After**:
- Time to add feature: Low
- Time to fix bug: Low
- Code review time: Low

**Targets**:
- 50% faster feature development ✅
- 50% faster bug fixes ✅
- 30% faster code reviews ✅

---

### 7.4 Testability Metrics

**Before**:
- Unit tests: 0
- Integration tests: 0
- E2E tests: 0

**After**:
- Unit tests: >100
- Integration tests: >20
- E2E tests: >10

**Targets**:
- 100+ unit tests ✅
- 20+ integration tests ✅
- 10+ E2E tests ✅
- 70%+ coverage ✅

---

## 8. Next Steps

1. **Review this plan** with team
2. **Estimate tasks** more precisely
3. **Set up project tracking** (GitHub Projects, Jira, etc.)
4. **Schedule work** based on team availability
5. **Set up CI/CD** for tests
6. **Create feature flags**
7. **Start Phase 1**

---

## 9. Appendices

### Appendix A: File Creation Order

**Phase 1** (create in this order):
1. `domain/types/index.ts`
2. `domain/types/task.types.ts`
3. `domain/types/xp.types.ts`
4. `domain/types/state.types.ts`
5. `domain/types/api.types.ts`
6. `domain/config/tasks.config.ts`
7. `domain/config/xp.config.ts`
8. `domain/config/constants.config.ts`

**Phase 2** (create in this order):
1. `domain/services/time/TimeParser.service.ts`
2. `domain/services/xp/XPMultiplier.service.ts`
3. `domain/services/xp/XPCalculator.service.ts`
4. `domain/services/xp/XPAwarder.service.ts`
5. `domain/services/task/TaskValidator.service.ts`
6. `domain/services/task/TaskProgress.service.ts`
7. `domain/services/task/TaskCompletion.service.ts`
8. `domain/utils/date.utils.ts`
9. `domain/utils/storage.utils.ts`
10. `domain/utils/validation.utils.ts`

**Phase 3** (create in this order):
1. `application/wake-up/types/wake-up.types.ts`
2. `application/wake-up/services/WakeUpService.ts`
3. `application/wake-up/hooks/useWakeUpDomain.ts`
4. Repeat pattern for other domains
5. `application/morning-routine/hooks/useMorningRoutine.ts`

**Phase 4** (create in this order):
1. `ui/components/TaskCard.tsx`
2. `ui/components/ProgressBar.tsx`
3. `ui/components/XPDisplay.tsx`
4. `ui/task-views/WakeUpTaskView.tsx`
5. Repeat pattern for other task views

**Phase 5** (create in this order):
1. `infrastructure/repositories/MorningRoutineRepository.ts`
2. `infrastructure/repositories/OfflineCache.repository.ts`
3. `infrastructure/repositories/SupabaseSync.repository.ts`
4. Refactor `ui/pages/MorningRoutineSection.tsx`

---

### Appendix B: Dependencies Graph

```
MorningRoutineSection (UI)
    ↓
useMorningRoutine (Application Hook)
    ↓
┌───┴───┬─────────┬─────────┬─────────┬─────────┬─────────┐
│       │         │         │         │         │         │
useWakeUp useFreshenUp useBloodFlow useBrainPower usePlanning useMeditation
│       │         │         │         │         │         │
└───────┴─────────┴─────────┴─────────┴─────────┴─────────┘
                    ↓
        MorningRoutineService (Application Service)
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
XPCalculator   TaskValidator   TimeParser
    ↓               ↓               ↓
MorningRoutineRepository (Infrastructure)
    ↓
Supabase / Offline DB
```

---

### Appendix C: Example Migration Script

```typescript
// scripts/migrate-morning-routine.ts
import { supabase } from '@/lib/supabase';
import { offlineDb } from '@/services/offline/offlineDb';

async function migrate() {
  console.log('Starting migration...');
  
  // 1. Backup existing data
  const backup = await backupData();
  console.log(`Backed up ${backup.length} records`);
  
  // 2. Validate data
  const validationErrors = await validateData(backup);
  if (validationErrors.length > 0) {
    console.error('Validation errors:', validationErrors);
    throw new Error('Migration failed: validation errors');
  }
  
  // 3. Transform data to new format
  const transformed = backup.map(transformRecord);
  
  // 4. Save transformed data
  await saveData(transformed);
  console.log(`Migrated ${transformed.length} records`);
  
  // 5. Verify migration
  const verificationErrors = await verifyMigration(transformed);
  if (verificationErrors.length > 0) {
    console.error('Verification errors:', verificationErrors);
    throw new Error('Migration failed: verification errors');
  }
  
  console.log('Migration complete!');
}

async function rollback() {
  console.log('Starting rollback...');
  // Restore from backup
  await restoreBackup();
  console.log('Rollback complete!');
}

// Run migration
migrate().catch(console.error);
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-18
**Author**: Software Architect
**Status**: Draft for Review
