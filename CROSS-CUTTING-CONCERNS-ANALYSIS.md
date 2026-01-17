# Morning Routine - Cross-Cutting Concerns Analysis

**Date**: January 18, 2026
**Component**: MorningRoutineSection.tsx (1,192 lines)
**Goal**: Identify shared state, cross-domain dependencies, and infrastructure concerns before refactoring into 6 domain-based components

---

## Executive Summary

The MorningRoutineSection is a **highly coupled monolithic component** with **extensive cross-cutting concerns**. The component contains:

- **27 pieces of shared state** used across multiple domains
- **6 cross-domain dependencies** (Supabase, Clerk, Gamification, Auto-timeblocks, Offline storage)
- **4 separate persistence mechanisms** (localStorage, sessionStorage, Supabase, IndexedDB)
- **3 modals/overlays** that don't belong to specific domains
- **Complex orchestration logic** that coordinates all domains

**Critical Finding**: The XP system alone involves **8 different storage keys**, **3 state managers**, and **4 calculation layers**. This is the most complex cross-cutting concern.

---

## 1. Shared State Inventory

### 1.1 Core Application State

| State | Type | Used By | Storage | Persistence |
|-------|------|---------|---------|-------------|
| `selectedDate` | Date | All domains | Component prop | N/A |
| `routineDate` | Date | Derived | useMemo | N/A |
| `routineDateKey` | string | All domains | useMemo | N/A |
| `loading` | boolean | All domains | useState | N/A |
| `error` | string | All domains | useState | N/A |

### 1.2 User Identity State

| State | Type | Used By | Source | Notes |
|-------|------|---------|--------|-------|
| `user` | ClerkUser | All domains | useClerkUser | Clerk auth |
| `internalUserId` | string | All domains | useSupabaseUserId | Derived from Clerk |

**Concern**: User identity is a **hard dependency** for all features. Without it, the component falls back to localStorage.

### 1.3 Morning Routine Data State

| State | Type | Used By | Source | Storage |
|-------|------|---------|--------|---------|
| `morningRoutine` | MorningRoutineData | All domains | useMorningRoutineSupabase | Supabase + IndexedDB |
| `morningRoutineState` | MorningRoutineState | All domains | useMorningRoutineSupabase | Supabase + IndexedDB |
| `wakeUpTime` | string | WakeUp, XP, Auto-timeblocks | Supabase metadata | `metadata.wakeUpTime` |
| `waterAmount` | number | PowerUpBrain, XP, Wellness | Supabase metadata | `metadata.waterAmount` |
| `meditationDuration` | string | Meditation, XP | Supabase metadata | `metadata.meditationDuration` |
| `pushupReps` | number | GetBloodFlowing, XP | Supabase metadata | `metadata.pushupReps` |
| `pushupPB` | number | GetBloodFlowing, XP | localStorage | `lifelock-pushupPB` (global) |
| `dailyPriorities` | string[] | PostMeditation, XP | Supabase metadata | `metadata.dailyPriorities` |
| `isPlanDayComplete` | boolean | PlanDay, XP | Supabase metadata | `metadata.isPlanDayComplete` |

**Concern**: **8 metadata fields** are shared between domains. Changes to one affect XP calculations.

### 1.4 XP System State (Most Complex)

**Total: 8 separate storage keys + 3 state managers**

#### Storage Keys:
1. `xpStorageKey` = `lifelock-${userId}-${dateKey}-morningXpState` (localStorage)
2. `waterXPStorageKey` = `lifelock-${userId}-${dateKey}-waterXP` (localStorage)
3. `lifelock-pushupPB` (localStorage, global)
4. `lifelock-pushups-${dateKey}` (localStorage, per-day fallback)
5. `lifelock-water-amount-${dateKey}` (localStorage, per-day fallback)
6. `siso_gamification_data` (localStorage, global XP)
7. `thoughtDumpOpen` (sessionStorage, HMR persistence)
8. Supabase `daily_routines` table (metadata)

#### State Managers:
```typescript
// Main XP state
interface MorningRoutineXPState {
  wakeAwarded: boolean;
  steps: Record<string, boolean>;  // Tracks which habits awarded XP
  lastCompletionTimestamp: number | null;
}

const [xpState, setXpState] = useState<MorningRoutineXPState>();

// Water XP tracking
const waterXPRef = useRef(0);

// Gamification service state (external)
GamificationService.getUserProgress()
GamificationService.getDailyXPBreakdown()
```

**Concern**: XP state is **fragmented across 3 systems**:
1. Component-level XP state (xpState)
2. Ref-based tracking (waterXPRef)
3. Global GamificationService (singleton)

### 1.5 UI Interaction State

| State | Type | Used By | Purpose |
|-------|------|---------|---------|
| `activeMindsetTab` | 'coding' \| 'rules' \| 'quotes' | MindsetCard | Tab switching |
| `showThoughtDumpChat` | boolean | PlanDay, Modal | Show/hide AI chat |
| `thoughtDumpResult` | ThoughtDumpResult \| null | PlanDay, Modal | AI processing result |
| `isProcessingVoice` | boolean | PlanDay | Loading state |
| `isEditingWakeTime` | boolean | WakeUpTimeTracker | Inline editing |
| `showTimeScrollPicker` | boolean | WakeUpTimeTracker, Modal | Time picker modal |
| `isEditingMeditationTime` | boolean | MeditationTracker | Inline editing |
| `localProgressTrigger` | number | All domains | Force re-renders |

**Concern**: **6 boolean flags** for UI state. Modals are tightly coupled to parent component.

---

## 2. Cross-Domain Dependencies

### 2.1 Data Layer Dependencies

#### useMorningRoutineSupabase
**File**: `/src/lib/hooks/useMorningRoutineSupabase.ts` (345 lines)

**Responsibilities**:
- Fetch routine data from Supabase
- Offline-first caching with IndexedDB
- Real-time sync between localStorage and Supabase
- Habit toggling
- Metadata updates

**Used By**: All domains (read + write)

**Concern**: This hook **orchestrates multiple persistence layers**:
1. Supabase (remote)
2. IndexedDB (offline cache)
3. localStorage (fallback)

**API Surface**:
```typescript
interface UseMorningRoutineSupabaseResult {
  routine: MorningRoutineState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggleHabit: (habitName: string, completed: boolean) => Promise<void>;
  updateMetadata: (metadata: Partial<MorningRoutineMetadata>) => Promise<void>;
}
```

**Coupling Risk**: High - All domains depend on this hook's data structure.

#### Offline Storage Services
**Files**:
- `/src/services/offline/offlineDb.ts`
- `/src/services/offline/syncService.ts`

**Used By**: useMorningRoutineSupabase (transparently)

**Concern**: Offline storage is **hidden inside the Supabase hook**. Domains don't know they're using IndexedDB.

### 2.2 Gamification Dependencies

#### GamificationService
**File**: `/src/domains/lifelock/_shared/services/gamificationService.ts` (501 lines)

**Responsibilities**:
- XP calculation and awarding
- Achievement tracking
- Streak management
- Level system
- LocalStorage persistence
- Supabase sync (background)

**Used By**:
- WakeUp domain (wake-up XP)
- FreshenUp domain (habit completion XP)
- GetBloodFlowing domain (push-up XP)
- PowerUpBrain domain (water XP)
- PlanDay domain (planning XP)
- Meditation domain (meditation XP)
- PostMeditation domain (priorities XP)

**Coupling Risk**: **Very High** - Every domain calls `GamificationService.awardXP()`.

**API Surface**:
```typescript
class GamificationService {
  static awardXP(activityId: string, multiplier: number): number;
  static getUserProgress(): UserProgress;
  static getDailyXPBreakdown(date: Date): DailyStats | null;
  static updateStreak(completed: boolean): void;
  static loadFromSupabase(userId: string): Promise<void>;
}
```

**Concern**: GamificationService is a **singleton with global state**. Changes affect all domains simultaneously.

#### XP Calculation Utilities
**Files**:
- `/src/domains/lifelock/1-daily/1-morning-routine/domain/xpCalculations.ts` (223 lines)
- `/src/domains/lifelock/1-daily/1-morning-routine/domain/morningRoutineXpUtils.ts` (131 lines)

**Responsibilities**:
- Calculate wake-up XP (time-based multiplier)
- Calculate habit XP (step-based multiplier)
- Calculate total XP
- Parse time strings
- Calculate time differences

**Used By**: All domains for XP display and calculation

**Concern**: XP calculations are **centralized but domain-agnostic**. They need data from all domains.

### 2.3 Authentication Dependencies

#### Clerk Auth
**Hook**: `useClerkUser()`
**Used By**: All domains (transitively via internalUserId)

**Flow**:
```
Clerk User ID → Supabase User ID → internalUserId
```

**Concern**: Without authentication, the component **degrades gracefully** to localStorage-only mode. This adds complexity.

### 2.4 Auto-Timeblock Dependencies

#### useAutoTimeblocks
**File**: `/src/lib/hooks/useAutoTimeblocks.ts` (140 lines)

**Responsibilities**:
- Create morning routine timebox
- Create nightly checkout timebox
- Update timeboxes when wake-up time changes
- Debounced to avoid excessive API calls

**Used By**: WakeUp domain (triggered by wakeUpTime changes)

**Input**:
```typescript
{
  wakeUpTime: string,
  userId: string | null,
  selectedDate: Date,
  enabled: boolean
}
```

**Concern**: This is a **side effect** of setting wake-up time. It's not owned by any specific domain.

**Service**: `createOrUpdateAutoTimeboxes()` from autoTimeblockService

**Coupling Risk**: Medium - Only affects WakeUp domain, but touches external systems.

### 2.5 AI Thought Dump Dependencies

#### AI Processing
**Files**: `/src/domains/lifelock/1-daily/1-morning-routine/features/ai-thought-dump/`

**Components**:
- SimpleThoughtDumpPage (full-page modal)
- ThoughtDumpResults (result modal)

**Service**: `lifeLockVoiceTaskProcessor.processThoughtDump()`

**Used By**: PlanDay domain

**Concern**: This is a **separate feature** that happens to be triggered from PlanDay. It has its own routing and state.

**Coupling Risk**: Low - Can be extracted easily.

---

## 3. Infrastructure Concerns

### 3.1 Data Persistence Strategy

**Problem**: Data is stored in **4 different places** with different sync strategies:

| Storage | Data | Sync Strategy | Offline Support | Used By |
|---------|------|---------------|-----------------|---------|
| Supabase | Routine data | Background sync | No (requires connection) | All domains |
| IndexedDB | Routine cache | Read-through write-through | Yes | useMorningRoutineSupabase |
| localStorage | XP state, fallback data | Manual (imperative) | Yes | XP system, fallback |
| sessionStorage | UI state (modals) | Manual (imperative) | Yes | ThoughtDumpChat |

**Concern**: **No unified persistence layer**. Developers must remember which storage to use.

**Sync Flow**:
```
User Action → Update State → Persist to localStorage → Background sync to Supabase
                            ↓
                    Persist to IndexedDB (if offline)
```

### 3.2 Debounced Persistence

**Pattern**: Multiple `useEffect` hooks with `debouncedMetadataUpdate`

```typescript
const debouncedMetadataUpdate = useMemo(() => {
  return debounce((payload: Partial<MorningRoutineMetadata>) => {
    void persistMorningMetadata(payload);
  }, 500);
}, [morningRoutineState, persistMorningMetadata]);
```

**Used For**:
- wakeUpTime (line 379)
- waterAmount (line 386)
- meditationDuration (line 393)
- pushupReps (line 400)
- dailyPriorities (line 412)
- isPlanDayComplete (line 419)

**Concern**: **6 separate debounced effects** create race conditions and unclear timing.

### 3.3 Error Handling

**Problem**: Error handling is **inconsistent**:

1. Supabase errors: Set `error` state, show error message
2. XP errors: Try-catch with console.error (silently fail)
3. Auto-timeblock errors: Toast notification
4. Thought dump errors: Console.error (no UI feedback)

**Concern**: No **centralized error boundary** or error handling strategy.

### 3.4 Loading States

**Problem**: **Only 1 loading state** for the entire component.

**Issue**: Different parts load at different times:
- Initial data load: `routineLoading`
- AI thought dump: `isProcessingVoice`
- XP calculations: Silent (no loading state)

**Concern**: Users can't tell which operation is loading.

---

## 4. Orchestration Logic

### 4.1 Task Mapping Loop

**Location**: Lines 921-1102

**Purpose**: Render all morning routine tasks with progress tracking

**Complexity**:
- Maps over `MORNING_ROUTINE_TASKS` array
- Calculates completion status per task
- Calls `isTaskComplete()` (complex logic)
- Calls `isHabitCompleted()` (checks database)
- Calculates progress percentage
- Renders different UI based on task type

**Concern**: This is **pure orchestration logic** that doesn't belong in any domain.

```typescript
MORNING_ROUTINE_TASKS.map((task) => {
  const taskComplete = isTaskComplete(task.key, task.subtasks);
  const progressPercent = calculateProgress(task);

  return (
    <Card>
      {task.hasTimeTracking && <TimeTracker />}
      {task.subtasks.length > 0 && <Subtasks />}
      {task.key === 'planDay' && <PlanDayActions />}
    </Card>
  );
})
```

### 4.2 Progress Calculation

**Location**: Lines 635-646

**Purpose**: Calculate overall progress percentage

**Logic**:
```typescript
const getRoutineProgress = useCallback(() => {
  const totalTasks = MORNING_ROUTINE_TASKS.length;
  const completedTasks = MORNING_ROUTINE_TASKS.filter(task =>
    isTaskComplete(task.key, task.subtasks)
  ).length;

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}, [isTaskComplete]);
```

**Concern**: This is **aggregation logic** that spans all domains. Can't be owned by a single domain.

### 4.3 XP Calculation & Awarding

**Location**: Lines 654-728

**Purpose**: Calculate total XP and award to GamificationService

**Flow**:
1. Calculate today's XP from all domains
2. Get previously recorded XP from GamificationService
3. Calculate difference
4. Award additional XP to GamificationService
5. Update water XP separately

**Concern**: This is **cross-domain aggregation**. It needs data from all domains.

```typescript
const todayXP = useMemo(() => {
  return calculateTotalMorningXP({
    wakeUpTime,        // WakeUp domain
    freshenUp: {...},  // FreshenUp domain
    pushupReps,        // GetBloodFlowing domain
    waterAmount,       // PowerUpBrain domain
    planDayComplete,   // PlanDay domain
    meditationDuration,// Meditation domain
    priorities         // PostMeditation domain
  });
}, [/* all domain state */]);
```

**Side Effect**: Awards XP to GamificationService (line 700)

### 4.4 Habit Completion Tracking

**Location**: Lines 487-555

**Purpose**: Track which habits have awarded XP to prevent double-awarding

**Logic**:
1. Check `xpState.steps[habitKey]` to see if XP already awarded
2. If not awarded, calculate XP multiplier based on timing
3. Award XP via `GamificationService.awardXP()`
4. Update `xpState.steps[habitKey] = true`

**Concern**: This is **business logic** that spans all domains. Each domain needs to know about XP timing rules.

**Timing Multipliers**:
- Wake-up time multiplier (earlier = higher)
- Minutes since wake-up (faster = higher)
- Minutes since previous habit (faster = higher)

---

## 5. Modals & Overlays

### 5.1 TimeScrollPicker Modal

**Location**: Lines 1180-1189

**Purpose**: Full-screen modal for selecting wake-up time

**State**: `showTimeScrollPicker` (boolean)

**Component**: `TimeScrollPicker` (200 lines)

**Concern**: This is a **shared UI component** that could be used by other time-tracking features. It doesn't belong to WakeUp domain.

### 5.2 ThoughtDumpResults Modal

**Location**: Lines 1171-1177

**Purpose**: Show results of AI thought dump processing

**State**: `thoughtDumpResult` (ThoughtDumpResult | null)

**Component**: `ThoughtDumpResults`

**Concern**: This is part of the **AI thought dump feature**, not the PlanDay domain. It's a separate feature.

### 5.3 SimpleThoughtDumpPage

**Location**: Lines 1159-1168

**Purpose**: Full-page AI chat interface for thought dump

**State**: `showThoughtDumpChat` (boolean)

**Component**: `SimpleThoughtDumpPage`

**Concern**: This is a **separate route/page** that happens to be triggered from PlanDay. It has its own navigation and state.

**Persistence**: Uses `sessionStorage` to survive HMR (line 208)

---

## 6. Proposed Architecture

### 6.1 Domain Separation Strategy

Based on `MORNING_ROUTINE_TASKS`, we have **6 domains**:

1. **WakeUpDomain** - Wake-up time tracking
2. **FreshenUpDomain** - Bathroom, teeth, cold shower
3. **GetBloodFlowingDomain** - Push-ups
4. **PowerUpBrainDomain** - Water, supplements
5. **PlanDayDomain** - AI thought dump, day planning
6. **MeditationDomain** - Meditation duration
7. **PostMeditationDomain** - Top 3 priorities

### 6.2 Shared Layer Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Morning Routine Orchestrator              │
│  - Task mapping & rendering                                  │
│  - Progress calculation                                      │
│  - XP aggregation                                            │
│  - Modal management                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Shared State Manager                     │
│  - User identity (internalUserId)                           │
│  - Date context (selectedDate, dateKey)                     │
│  - Loading & error states                                    │
│  - XP state coordination                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                   ↓                       ↓
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│ WakeUpDomain │    │ FreshenUp    │      │ GetBloodFlow │
│              │    │ Domain       │      │ Domain       │
└──────────────┘    └──────────────┘      └──────────────┘
        ↑                   ↑                       ↑
        └─────────────────────┴─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  - useMorningRoutineSupabase (data layer)                   │
│  - GamificationService (XP system)                          │
│  - useAutoTimeblocks (side effects)                         │
│  - Persistence manager (localStorage, IndexedDB)             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Data Flow Architecture

```
User Interaction
        ↓
Domain Component (e.g., WakeUpDomain)
        ↓
Shared State Manager (updates state)
        ↓
Infrastructure Layer (persists data)
        ├→ localStorage (immediate)
        ├→ IndexedDB (offline cache)
        └→ Supabase (background sync)
        ↓
GamificationService (awards XP)
        ↓
Orchestrator (re-renders UI)
```

### 6.4 Proposed Component Structure

```
MorningRoutineSection (Orchestrator)
├── SharedStateProvider (Context)
│   ├── UserIdentityContext
│   ├── DateContext
│   ├── XPStateContext
│   └── LoadingErrorContext
├── MorningRoutineHeader
│   └── ProgressBar (aggregated)
├── MindsetCard (separate feature)
├── WakeUpDomain
│   ├── WakeUpTimeTracker
│   └── TimeScrollPicker (shared modal)
├── FreshenUpDomain
│   ├── HabitCheckbox (bathroom)
│   ├── HabitCheckbox (teeth)
│   └── HabitCheckbox (cold shower)
├── GetBloodFlowingDomain
│   ├── HabitCheckbox (push-ups)
│   └── PushUpTracker
├── PowerUpBrainDomain
│   ├── HabitCheckbox (supplements)
│   └── WaterTracker
├── PlanDayDomain
│   ├── PlanDayActions
│   └── ThoughtDumpLauncher
├── MeditationDomain
│   └── MeditationTracker
├── PostMeditationDomain
│   └── PrioritiesTracker
├── XPFooterSummary (aggregated)
└── Modals (shared)
    ├── TimeScrollPicker
    ├── ThoughtDumpResults
    └── SimpleThoughtDumpPage
```

---

## 7. Data Flow Diagrams

### 7.1 Wake-Up Time Flow

```
User sets wake-up time
        ↓
WakeUpDomain.setWakeUpTime()
        ↓
Shared State Manager updates wakeUpTime
        ↓
├→ Debounced persist to Supabase
├→ Persist to localStorage (fallback)
├→ Trigger useAutoTimeblocks (side effect)
└→ Calculate wake-up XP
        ↓
GamificationService.awardXP('wake_up_tracked', multiplier)
        ↓
Persist XP state to localStorage
        ↓
Orchestrator re-renders UI
```

### 7.2 Habit Completion Flow

```
User checks habit checkbox
        ↓
Domain Component.handleHabitToggle()
        ↓
Shared State Manager updates habit state
        ↓
useMorningRoutineSupabase.toggleHabit()
        ↓
├→ Update Supabase (if online)
├→ Update IndexedDB (offline cache)
└→ Update localStorage (fallback)
        ↓
Calculate XP multiplier
        ├→ Check xpState.steps[habitKey]
        ├→ Calculate minutes since wake-up
        └→ Calculate minutes since previous habit
        ↓
GamificationService.awardXP('morning_routine_step', multiplier)
        ↓
Update xpState.steps[habitKey] = true
        ↓
Orchestrator re-renders UI
```

### 7.3 Water Tracking Flow

```
User clicks +100ml water button
        ↓
PowerUpBrainDomain.incrementWater()
        ↓
Shared State Manager updates waterAmount
        ↓
├→ Debounced persist to Supabase
├→ Persist to localStorage (fallback)
└→ Calculate water XP
        ↓
Calculate water XP: (amount / 500) * 30
        ↓
Check if waterXP > waterXPRef.current
        ↓
If yes: Award difference to GamificationService
        ↓
Update waterXPRef.current
        ↓
Orchestrator re-renders UI
```

---

## 8. Risks & Mitigation Strategies

### 8.1 XP System Complexity

**Risk**: XP state is fragmented across 3 systems (component state, refs, GamificationService)

**Impact**: Double-awarding XP, lost XP, incorrect calculations

**Mitigation**:
- Create a centralized `XPStateManager` service
- Use a single source of truth for XP state
- Implement XP transaction logs for debugging
- Add unit tests for XP calculations

### 8.2 Race Conditions in Persistence

**Risk**: Multiple debounced effects writing to same storage simultaneously

**Impact**: Data loss, last-write-wins conflicts

**Mitigation**:
- Implement a centralized persistence queue
- Use transactions for IndexedDB
- Add optimistic locking for Supabase updates
- Implement conflict resolution strategy

### 8.3 Offline/Online Sync Conflicts

**Risk**: User modifies data offline, then Supabase has conflicting data

**Impact**: Data overwrites, lost changes

**Mitigation**:
- Implement last-write-wins with timestamps
- Add conflict detection UI
- Allow user to resolve conflicts manually
- Maintain offline queue of pending changes

### 8.4 Domain Coupling

**Risk**: Domains are tightly coupled through shared state and XP calculations

**Impact**: Difficult to test, impossible to reuse domains

**Mitigation**:
- Use dependency injection for shared services
- Create domain interfaces (contracts)
- Implement event-driven architecture for cross-domain communication
- Use React Context for shared state (not prop drilling)

### 8.5 Testing Complexity

**Risk**: Component is too large to test effectively

**Impact**: Bugs, regression issues, fear of refactoring

**Mitigation**:
- Write integration tests for orchestrator
- Write unit tests for each domain
- Mock all external dependencies (Supabase, GamificationService)
- Use test fixtures for complex state

### 8.6 Performance Issues

**Risk**: Too many re-renders due to shared state changes

**Impact**: Laggy UI, poor user experience

**Mitigation**:
- Use React.memo for domain components
- Implement selective state updates (useCallback, useMemo)
- Virtualize long lists (if needed)
- Add performance monitoring

### 8.7 Breaking Changes During Refactoring

**Risk**: Refactoring breaks existing functionality

**Impact**: Lost data, angry users

**Mitigation**:
- Implement feature flags for new architecture
- Maintain backward compatibility with old data structure
- Add migration scripts for data
- Test thoroughly in staging environment
- Rollback plan if issues arise

---

## 9. Refactoring Recommendations

### 9.1 Phase 1: Extract Shared State (Week 1)

**Goal**: Create a shared state manager to reduce coupling

**Tasks**:
1. Create `MorningRoutineContext` with:
   - UserIdentityContext
   - DateContext
   - XPStateContext
   - LoadingErrorContext
2. Move all shared state to context
3. Update domains to use context instead of props
4. Add TypeScript types for all context values

**Success Criteria**:
- No prop drilling for shared state
- Domains can be rendered independently
- TypeScript types are strict

### 9.2 Phase 2: Extract Infrastructure Layer (Week 2)

**Goal**: Separate data layer from UI layer

**Tasks**:
1. Create `PersistenceManager` service:
   - Unified API for localStorage, IndexedDB, Supabase
   - Conflict resolution strategy
   - Offline queue management
2. Refactor `useMorningRoutineSupabase` to use `PersistenceManager`
3. Create `XPManager` service:
   - Centralize XP state management
   - Consolidate all XP storage keys
   - Add XP transaction logging
4. Update `GamificationService` to use `XPManager`

**Success Criteria**:
- Single API for all persistence operations
- XP state is centralized
- No direct localStorage access in components

### 9.3 Phase 3: Extract Domain Components (Week 3-4)

**Goal**: Create domain-based components with clear boundaries

**Tasks**:
1. Create domain folders:
   - `/domains/wake-up/`
   - `/domains/freshen-up/`
   - `/domains/get-blood-flowing/`
   - `/domains/power-up-brain/`
   - `/domains/plan-day/`
   - `/domains/meditation/`
   - `/domains/post-meditation/`
2. Move domain-specific logic to domain folders
3. Create domain interfaces (contracts)
4. Implement dependency injection for shared services
5. Add domain-specific unit tests

**Success Criteria**:
- Each domain has < 200 lines
- Domains can be tested independently
- No circular dependencies between domains

### 9.4 Phase 4: Create Orchestrator (Week 5)

**Goal**: Build orchestrator to coordinate domains

**Tasks**:
1. Create `MorningRoutineOrchestrator` component:
   - Task mapping logic
   - Progress calculation
   - XP aggregation
   - Modal management
2. Move orchestration logic from `MorningRoutineSection`
3. Implement event-driven communication between domains
4. Add orchestrator unit tests

**Success Criteria**:
- Orchestrator has no domain-specific logic
- Domains communicate via events
- Orchestrator can be tested independently

### 9.5 Phase 5: Extract Modals (Week 6)

**Goal**: Separate modal logic from domains

**Tasks**:
1. Create shared modal manager:
   - `ModalManager` context
   - `useModal` hook
2. Move modals to shared folder:
   - `/shared/modals/TimeScrollPicker/`
   - `/shared/modals/ThoughtDumpResults/`
   - `/shared/modals/SimpleThoughtDumpPage/`
3. Update domains to use modal manager
4. Add modal animations and transitions

**Success Criteria**:
- Modals are not tied to specific domains
- Modals can be reused across the app
- Modal state is managed centrally

### 9.6 Phase 6: Testing & Documentation (Week 7-8)

**Goal**: Ensure reliability and maintainability

**Tasks**:
1. Write integration tests for orchestrator
2. Write unit tests for each domain
3. Write unit tests for infrastructure layer
4. Add E2E tests for critical user flows
5. Document architecture decisions
6. Create migration guide for developers
7. Add performance monitoring

**Success Criteria**:
- 80%+ test coverage
- All tests pass
- Documentation is complete
- Performance is acceptable

---

## 10. Conclusion

### 10.1 Key Findings

1. **27 pieces of shared state** across multiple domains
2. **8 storage keys** for XP system alone
3. **4 persistence mechanisms** with no unified strategy
4. **3 modals** that don't belong to specific domains
5. **Complex orchestration logic** that spans all domains

### 10.2 Critical Success Factors

1. **Centralize shared state** - Use React Context for shared state, not prop drilling
2. **Unify persistence** - Create a single persistence API for all storage
3. **Simplify XP system** - Consolidate XP state into one service
4. **Separate concerns** - Domains should own their logic, orchestrator coordinates
5. **Test thoroughly** - Write tests before refactoring to prevent regressions

### 10.3 Estimated Effort

- **Phase 1**: 1 week (Extract Shared State)
- **Phase 2**: 1 week (Extract Infrastructure)
- **Phase 3**: 2 weeks (Extract Domain Components)
- **Phase 4**: 1 week (Create Orchestrator)
- **Phase 5**: 1 week (Extract Modals)
- **Phase 6**: 2 weeks (Testing & Documentation)

**Total**: 8 weeks

### 10.4 Next Steps

1. Review this analysis with the team
2. Prioritize phases based on business value
3. Create detailed task breakdown for Phase 1
4. Set up testing infrastructure
5. Begin refactoring with Phase 1

---

## Appendix A: File Structure

```
src/domains/lifelock/1-daily/1-morning-routine/
├── ui/
│   ├── pages/
│   │   └── MorningRoutineSection.tsx (1,192 lines) ← CURRENT
│   └── components/
│       ├── WakeUpTimeTracker.tsx (333 lines)
│       ├── WaterTracker.tsx
│       ├── PushUpTracker.tsx
│       ├── MeditationTracker.tsx
│       ├── PlanDayActions.tsx
│       ├── MotivationalQuotes.tsx
│       ├── TimeScrollPicker.tsx (200 lines)
│       ├── MorningMindsetCard.tsx
│       ├── XPPill.tsx
│       └── XPFooterSummary.tsx
├── domain/
│   ├── xpCalculations.ts (223 lines)
│   └── morningRoutineXpUtils.ts (131 lines)
└── features/
    └── ai-thought-dump/
        ├── components/
        │   ├── SimpleThoughtDumpPage.tsx
        │   └── ThoughtDumpResults.tsx
        └── services/
            └── lifeLockVoiceTaskProcessor.ts

src/lib/
├── hooks/
│   ├── useMorningRoutineSupabase.ts (345 lines)
│   ├── useClerkUser.ts
│   ├── useSupabaseUserId.ts
│   └── useAutoTimeblocks.ts (140 lines)
└── services/
    └── offline/
        ├── offlineDb.ts
        └── syncService.ts

src/domains/lifelock/_shared/
└── services/
    ├── gamificationService.ts (501 lines)
    └── autoTimeblockService.ts
```

---

## Appendix B: Interface Definitions

### B.1 MorningRoutineState

```typescript
interface MorningRoutineState {
  id: string;
  userId: string;
  date: string;
  items: MorningRoutineHabit[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  metadata: MorningRoutineMetadata;
  createdAt: string;
  updatedAt: string;
}

interface MorningRoutineHabit {
  name: string;
  completed: boolean;
}

interface MorningRoutineMetadata {
  wakeUpTime?: string;
  waterAmount?: number;
  meditationDuration?: string;
  pushupReps?: number;
  dailyPriorities?: string[];
  isPlanDayComplete?: boolean;
}
```

### B.2 XP State

```typescript
interface MorningRoutineXPState {
  wakeAwarded: boolean;
  steps: Record<string, boolean>;
  lastCompletionTimestamp: number | null;
}

interface XPBreakdown {
  wakeUp: number;
  freshenUp: number;
  getBloodFlowing: number;
  powerUpBrain: number;
  planDay: number;
  meditation: number;
  priorities: number;
  bonuses: {
    freshenUpSpeed: number;
    pushupPB: number;
    pushupSpeed: number;
  };
}
```

### B.3 Task Configuration

```typescript
interface TaskConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  hasTimeTracking: boolean;
  subtasks: SubtaskConfig[];
}

interface SubtaskConfig {
  key: string;
  title: string;
}
```

---

## Appendix C: Storage Keys Reference

| Key | Format | Scope | Purpose |
|-----|--------|-------|---------|
| `xpStorageKey` | `lifelock-${userId}-${dateKey}-morningXpState` | User + Date | XP state tracking |
| `waterXPStorageKey` | `lifelock-${userId}-${dateKey}-waterXP` | User + Date | Water XP tracking |
| `lifelock-pushupPB` | `lifelock-pushupPB` | Global | Push-up personal best |
| `lifelock-pushups-${dateKey}` | `lifelock-pushups-${dateKey}` | Date | Push-up fallback |
| `lifelock-water-amount-${dateKey}` | `lifelock-water-amount-${dateKey}` | Date | Water fallback |
| `siso_gamification_data` | `siso_gamification_data` | Global | Gamification service data |
| `thoughtDumpOpen` | `thoughtDumpOpen` | Session | HMR persistence |

---

**END OF ANALYSIS**
