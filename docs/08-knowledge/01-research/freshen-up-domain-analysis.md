# Freshen Up Domain Analysis

**Date:** 2026-01-18
**Analyst:** Domain Analysis Agent
**Domain:** Morning Routine - Freshen Up
**Component:** MorningRoutineSection.tsx (Lines 142-153, 620-624, 658-662)

---

## Executive Summary

The **Freshen Up** domain manages personal hygiene tasks in the morning routine, consisting of three specific subtasks: bathroom break, brushing teeth, and taking a cold shower. This domain is currently tightly coupled within a 1,192-line monolithic component and requires extraction into a separate, reusable domain hook.

**Key Findings:**
- 3 boolean state variables (bathroom, brushTeeth, coldShower)
- XP calculation: 40 XP base (10+10+20) + 25 XP speed bonus
- Tightly coupled to global habit tracking system
- No dedicated domain-specific components
- Direct dependency on wake-up time for speed bonus calculation

---

## 1. Domain Boundaries

### 1.1 What Belongs to Freshen Up Domain

**Core Responsibilities:**
- Tracking completion of 3 hygiene subtasks:
  - `bathroom` (boolean) - 10 XP
  - `brushTeeth` (boolean) - 10 XP
  - `coldShower` (boolean) - 20 XP
- Calculating domain completion status (all 3 subtasks must be true)
- Computing XP rewards with speed bonus
- Managing subtask checkbox interactions

**Subtask Definitions:**
```typescript
// From MorningRoutineSection.tsx lines 148-152
subtasks: [
  { key: 'bathroom', title: 'Bathroom break' },
  { key: 'brushTeeth', title: 'Brush teeth' },
  { key: 'coldShower', title: 'Cold shower' }
]
```

### 1.2 What Does NOT Belong

**External Dependencies (not part of domain):**
- Wake-up time tracking (belongs to Wake Up domain)
- XP awarding system (GamificationService)
- Supabase synchronization (useMorningRoutineSupabase)
- UI rendering (checkboxes, progress bars)
- Global habit completion tracking (isHabitCompleted function)
- Storage/persistence logic

**Why These Are External:**
- Wake-up time is used for speed bonus calculation but is owned by Wake Up domain
- GamificationService is a cross-domain service
- Persistence layer should be domain-agnostic
- UI components are presentation concerns

### 1.3 Domain Dependencies

**Required Inputs:**
```typescript
interface FreshenUpDependencies {
  // From Wake Up domain - needed for speed bonus
  wakeUpTime: string;
  selectedDate: Date;

  // From global state - needed for completion check
  isHabitCompleted: (habitKey: string) => boolean;

  // From persistence - needed for updates
  toggleHabit: (habitKey: string, completed: boolean) => Promise<void>;

  // From gamification - needed for XP awarding
  awardXP: (activityId: string, multiplier: number) => void;
}
```

**Optional Inputs:**
```typescript
interface FreshenUpOptionalDependencies {
  // For speed bonus calculation (currently NOT tracked)
  completionTimestamp?: Date;
}
```

---

## 2. State Management

### 2.1 Current State Implementation

**Location:** `MorningRoutineSection.tsx` (via `useMorningRoutineSupabase`)

**State Storage:**
```typescript
// From useMorningRoutineSupabase.ts lines 36-43
const DEFAULT_ITEMS: MorningRoutineHabit[] = [
  { name: 'wakeUp', completed: false },
  { name: 'freshenUp', completed: false },
  { name: 'getBloodFlowing', completed: false },
  { name: 'powerUpBrain', completed: false },
  { name: 'planDay', completed: false },
  { name: 'meditation', completed: false },
];
```

**Problem:** The three Freshen Up subtasks (`bathroom`, `brushTeeth`, `coldShower`) are stored as individual habits in the `items` array, not as a nested structure under `freshenUp`.

### 2.2 State Variables Specific to Freshen Up

**Direct State:**
```typescript
// These are NOT directly stored - they're computed from habit items
interface FreshenUpState {
  bathroom: boolean;      // Computed: isHabitCompleted('bathroom')
  brushTeeth: boolean;    // Computed: isHabitCompleted('brushTeeth')
  coldShower: boolean;    // Computed: isHabitCompleted('coldShower')
}
```

**Derived State:**
```typescript
// Lines 620-624 in MorningRoutineSection.tsx
const isTaskComplete = useCallback((taskKey: string, subtasks: any[]): boolean => {
  switch (taskKey) {
    case 'freshenUp':
      // Complete when all subtasks are checked
      return subtasks.length > 0 && subtasks.every(subtask => isHabitCompleted(subtask.key));
    // ... other cases
  }
}, [isHabitCompleted]);
```

**Completion Status:**
```typescript
// All 3 subtasks must be completed for domain to be complete
const isFreshenUpComplete =
  isHabitCompleted('bathroom') &&
  isHabitCompleted('brushTeeth') &&
  isHabitCompleted('coldShower');
```

### 2.3 State Synchronization

**Supabase Table:** `daily_routines`

**Storage Schema:**
```typescript
interface DailyRoutineRow {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  routine_type: 'morning' | 'nightly';
  items: MorningRoutineHabit[]; // Contains bathroom, brushTeeth, coldShower
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  metadata: MorningRoutineMetadata;
  created_at: string;
  updated_at: string;
}
```

**Offline Storage:** IndexedDB `morningRoutines` store
```typescript
// From offlineDb.ts lines 73-90
morningRoutines: {
  key: string;
  value: {
    id: string;
    user_id: string;
    date: string;
    routine_type: string;
    items: any; // Contains habit completion state
    completed_count: number;
    total_count: number;
    completion_percentage: number;
    created_at: string;
    updated_at: string;
    _needs_sync?: boolean;
    _last_synced?: string;
    _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
  };
}
```

### 2.4 Proposed Hook State Interface

```typescript
interface UseFreshenUpState {
  // Completion state
  bathroom: boolean;
  brushTeeth: boolean;
  coldShower: boolean;
  isComplete: boolean;

  // Progress tracking
  completedCount: number; // 0-3
  totalCount: 3;
  progressPercent: number;

  // Timestamp (for speed bonus - currently NOT implemented)
  completionTimestamp?: Date;
}

interface UseFreshenUpActions {
  toggleSubtask: (subtaskKey: 'bathroom' | 'brushTeeth' | 'coldShower', completed: boolean) => Promise<void>;
  calculateXP: () => { total: number; breakdown: FreshenUpXPBreakdown };
  checkSpeedBonus: () => boolean; // Not currently implemented
}

interface UseFreshenUpReturn extends UseFreshenUpState, UseFreshenUpActions {}
```

---

## 3. Business Logic

### 3.1 Completion Rules

**Domain Completion:**
```typescript
// Rule: ALL 3 subtasks must be completed
const isDomainComplete =
  isHabitCompleted('bathroom') &&
  isHabitCompleted('brushTeeth') &&
  isHabitCompleted('coldShower');
```

**Subtask Completion:**
- Each subtask is toggled independently via checkbox
- No order requirement
- No time constraints on individual subtasks
- All 3 must be completed for domain to be complete

### 3.2 XP Calculation Logic

**Location:** `xpCalculations.ts` lines 54-85

```typescript
export function calculateFreshenUpXP(
  completed: { bathroom: boolean; brushTeeth: boolean; coldShower: boolean },
  wakeUpTime: string,
  completionTime?: Date,
  date?: Date
): { total: number; speedBonus: number }
```

**Base XP Calculation:**
```typescript
// Lines 66-68
let total = 0;
if (completed.bathroom) total += 10;    // 10 XP
if (completed.brushTeeth) total += 10;   // 10 XP
if (completed.coldShower) total += 20;   // 20 XP
// Base Total: 40 XP
```

**Speed Bonus Calculation:**
```typescript
// Lines 70-82
let speedBonus = 0;
if (completed.bathroom && completed.brushTeeth && completed.coldShower &&
    wakeUpTime && completionTime && date) {
  // Check if completed within 25 min of wake-up
  const wakeMinutes = getTimeInMinutes(wakeUpTime);
  const completionMinutes = completionTime.getHours() * 60 + completionTime.getMinutes();
  const timeDiff = completionMinutes - wakeMinutes;

  if (timeDiff <= 25 && timeDiff >= 0) {
    speedBonus = 25;
    total += speedBonus; // +25 XP
  }
}
```

**Total XP Range:**
- Minimum: 0 XP (no subtasks completed)
- Maximum: 65 XP (all 3 subtasks + speed bonus)
- Breakdown:
  - Bathroom: 10 XP
  - Brush teeth: 10 XP
  - Cold shower: 20 XP
  - Speed bonus: 25 XP (if all completed within 25 min of wake-up)

### 3.3 Speed Bonus Rules

**Current Implementation:** **NOT WORKING**

**Why:**
1. `completionTime` parameter is `undefined` when called (line 658)
2. No timestamp tracking for when Freshen Up domain is completed
3. `completionTime` is only passed in tests, not in production

**Required Fix:**
```typescript
// Need to track when ALL 3 subtasks are completed
const [freshenUpCompletionTimestamp, setFreshenUpCompletionTimestamp] = useState<number | null>(null);

// Update timestamp when domain becomes complete
useEffect(() => {
  if (isFreshenUpComplete && !freshenUpCompletionTimestamp) {
    setFreshenUpCompletionTimestamp(Date.now());
  }
}, [isFreshenUpComplete, freshenUpCompletionTimestamp]);
```

### 3.4 Validation Rules

**Pre-completion Validation:**
- None (user can complete subtasks in any order)

**Post-completion Validation:**
- Domain is complete only when all 3 subtasks are `true`
- XP is awarded immediately when subtask is toggled (via `awardHabitCompletion`)
- Speed bonus is calculated in real-time via `calculateTotalMorningXP` useMemo

**Edge Cases:**
1. **User untoggles a completed subtask:** XP is NOT retracted (one-way awarding)
2. **User completes all 3, then untoggles one:** Domain becomes incomplete, but XP remains awarded
3. **Wake-up time changes:** Speed bonus recalculates automatically via useMemo
4. **Date changes:** All state resets via `useMorningRoutineSupabase`

---

## 4. UI Components

### 4.1 Current UI Implementation

**Location:** `MorningRoutineSection.tsx` lines 1003-1052

**Component Structure:**
```tsx
{/* Sub-tasks rendering */}
{task.subtasks.length > 0 && (
  <div className="mt-4 ml-4 space-y-3">
    {task.subtasks.map((subtask) => (
      <div key={subtask.key}>
        {/* Full row clickable - mobile touch targets */}
        <div
          className="group flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] p-2 -m-2 hover:bg-orange-900/20 active:bg-orange-900/30"
          onClick={() => handleHabitToggle(subtask.key, !isHabitCompleted(subtask.key))}
        >
          {/* Checkbox - visual indicator only, click handled by parent */}
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isHabitCompleted(subtask.key)}
              className="h-6 w-6 border-2 border-orange-400/70 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 transition-all duration-200 group-hover:border-orange-400 pointer-events-none"
            />
          </div>
          <span className={cn(
            "text-sm font-medium transition-all duration-200 flex-1",
            isHabitCompleted(subtask.key)
              ? "text-gray-500 line-through"
              : "text-orange-200/90 group-hover:text-orange-50"
          )}>
            {subtask.title}
          </span>
          {isHabitCompleted(subtask.key) && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 animate-in zoom-in-50 duration-200" />
          )}
        </div>
      </div>
    ))}
  </div>
)}
```

### 4.2 Domain-Specific UI Elements

**Freshen Up Subtasks:**
1. **Bathroom break** - Checkbox with title "Bathroom break"
2. **Brush teeth** - Checkbox with title "Brush teeth"
3. **Cold shower** - Checkbox with title "Cold shower"

**Visual States:**
- **Incomplete:** Orange text, unchecked checkbox, hover effect
- **Complete:** Gray strikethrough text, checked checkbox, green checkmark icon

**Interactions:**
- Full row is clickable (44px min height for mobile touch targets)
- Checkbox is visual only (pointer-events-none)
- Hover effect: darker orange background
- Active effect: even darker background

### 4.3 Progress Bar

**Location:** Lines 947-975

```tsx
{/* Universal Progress Bar - ALL TASKS */}
<div className="mt-2 mb-1">
  <div className="w-full bg-orange-900/30 border border-orange-600/20 rounded-full h-1.5">
    <motion.div
      className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500"
      initial={{ width: 0 }}
      animate={{ width: `${progressPercent}%` }}
    />
  </div>
  <div className="flex justify-between items-center mt-1">
    <span className="text-xs text-orange-400/70 font-medium">
      {completedSubtasks}/{task.subtasks.length} completed
    </span>
    {taskComplete && (
      <span className="text-xs text-green-400 font-semibold">✓ Complete</span>
    )}
  </div>
</div>
```

**Calculation:**
```typescript
const completedSubtasks = task.subtasks.filter(subtask => isHabitCompleted(subtask.key)).length;
const progressPercent = task.subtasks.length > 0
  ? (completedSubtasks / task.subtasks.length) * 100
  : (taskComplete ? 100 : 0);
```

### 4.4 Proposed Component Interface

```typescript
interface FreshenUpCardProps {
  // State
  bathroom: boolean;
  brushTeeth: boolean;
  coldShower: boolean;
  isComplete: boolean;

  // Progress
  completedCount: number;
  progressPercent: number;

  // XP
  xpAwarded: number;
  speedBonusAwarded: number;

  // Actions
  onToggleSubtask: (subtaskKey: 'bathroom' | 'brushTeeth' | 'coldShower') => void;

  // Styling
  className?: string;
}
```

**Extracted Component:**
```tsx
function FreshenUpCard({
  bathroom,
  brushTeeth,
  coldShower,
  isComplete,
  completedCount,
  progressPercent,
  xpAwarded,
  speedBonusAwarded,
  onToggleSubtask,
  className
}: FreshenUpCardProps) {
  const subtasks = [
    { key: 'bathroom' as const, title: 'Bathroom break', completed: bathroom },
    { key: 'brushTeeth' as const, title: 'Brush teeth', completed: brushTeeth },
    { key: 'coldShower' as const, title: 'Cold shower', completed: coldShower },
  ];

  return (
    <Card className={cn("morning-card bg-orange-900/20 border-orange-700/40", className)}>
      {/* Card content */}
    </Card>
  );
}
```

---

## 5. Data Flow

### 5.1 Data Flow Diagram

```
User Interaction (Click Checkbox)
        ↓
handleHabitToggle(subtaskKey, !completed)  [Line 576]
        ↓
toggleMorningHabit(subtaskKey, completed)  [From useMorningRoutineSupabase]
        ↓
Update items array in routine state
        ↓
persistRoutineOffline(updated, true)  [IndexedDB]
        ↓
syncToSupabase(updated)  [Supabase]
        ↓
awardHabitCompletion(habitKey)  [Line 487]
        ↓
Calculate XP multiplier based on timing
        ↓
GamificationService.awardXP('morning_routine_step', multiplier)  [Line 529]
        ↓
Update localStorage with new XP total
        ↓
Trigger re-render (useState updates)
```

### 5.2 Habit Toggle Flow

**File:** `MorningRoutineSection.tsx` lines 576-591

```typescript
const handleHabitToggle = async (habitKey: string, completed: boolean) => {
  if (!selectedDate) return;

  try {
    // 1. Update Supabase/IndexedDB
    await toggleMorningHabit(habitKey, completed);

    // 2. Award XP if completing
    if (completed) {
      awardHabitCompletion(habitKey);
    }

    // 3. Trigger progress update
    setLocalProgressTrigger(prev => prev + 1);
  } catch (error) {
    console.error('Error updating habit:', error);
    setError('Failed to update habit completion');
  }
};
```

### 5.3 XP Awarding Flow

**File:** `MorningRoutineSection.tsx` lines 487-533

```typescript
const awardHabitCompletion = useCallback((habitKey: string) => {
  let shouldAward = false;
  let previousTimestamp: number | null = null;
  let completionTimestamp = Date.now();

  // 1. Check if already awarded
  setXpState(prev => {
    if (prev.steps[habitKey]) {
      return prev; // Already awarded, skip
    }

    shouldAward = true;
    previousTimestamp = prev.lastCompletionTimestamp ?? null;
    completionTimestamp = Date.now();

    return {
      wakeAwarded: prev.wakeAwarded,
      steps: { ...prev.steps, [habitKey]: true },
      lastCompletionTimestamp: completionTimestamp
    };
  });

  if (!shouldAward) return;

  // 2. Calculate timing multipliers
  const minutesSinceWake = wakeUpTime
    ? calculateMinutesSinceWake(wakeUpTime, routineDate, completionTimestamp)
    : null;

  const minutesSincePrevious =
    previousTimestamp !== null
      ? (completionTimestamp - previousTimestamp) / 60000
      : null;

  const wakeMultiplier = wakeUpTime ? calculateWakeUpXpMultiplier(wakeUpTime) : 1;

  // 3. Calculate final multiplier
  const multiplier = calculateStepXpMultiplier({
    minutesSinceWake,
    minutesSincePrevious,
    wakeUpMultiplier: wakeMultiplier
  });

  // 4. Award XP
  GamificationService.awardXP('morning_routine_step', multiplier);
}, [wakeUpTime, routineDate]);
```

### 5.4 Speed Bonus Calculation Flow

**File:** `MorningRoutineSection.tsx` lines 654-672

```typescript
const todayXP = useMemo(() => {
  const result = calculateTotalMorningXP({
    wakeUpTime,
    date: selectedDate,
    freshenUp: {
      bathroom: isHabitCompleted('bathroom'),
      brushTeeth: isHabitCompleted('brushTeeth'),
      coldShower: isHabitCompleted('coldShower')
    },
    // ... other domains
  });
  return result;
}, [
  wakeUpTime,
  selectedDate,
  isHabitCompleted('bathroom'),
  isHabitCompleted('brushTeeth'),
  isHabitCompleted('coldShower'),
  // ... other dependencies
]);
```

**Problem:** `completionTime` is `undefined` in the call to `calculateFreshenUpXP`, so speed bonus NEVER works.

### 5.5 Storage Synchronization Flow

**File:** `useMorningRoutineSupabase.ts` lines 272-308

```typescript
const toggleHabit = useCallback(
  async (habitName: string, completed: boolean) => {
    if (!routine || !internalUserId) return;

    // 1. Update items array
    let items = routine.items.map(item =>
      item.name === habitName ? { ...item, completed } : item,
    );

    if (!items.some(item => item.name === habitName)) {
      items = [...items, { name: habitName, completed }];
    }

    // 2. Recalculate completion stats
    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 3. Create updated state
    const updated: MorningRoutineState = {
      ...routine,
      items,
      completedCount,
      totalCount,
      completionPercentage,
      updatedAt: new Date().toISOString(),
    };

    // 4. Update local state
    setRoutine(updated);

    // 5. Persist to IndexedDB (mark for sync)
    await persistRoutineOffline(updated, true);

    // 6. Sync to Supabase (if online)
    try {
      await syncToSupabase(updated);
      await persistRoutineOffline({ ...updated, updatedAt: new Date().toISOString() }, false);
    } catch (syncError) {
      console.warn('[MorningRoutine] Failed to sync habit update:', syncError);
    }
  },
  [internalUserId, persistRoutineOffline, routine, syncToSupabase],
);
```

---

## 6. External Dependencies

### 6.1 Required Dependencies

**1. Wake Up Domain**
```typescript
// Used for speed bonus calculation
interface WakeUpDependency {
  wakeUpTime: string;        // Format: "HH:MM AM/PM"
  selectedDate: Date;        // For timestamp calculation
}

// Usage
const wakeMinutes = getTimeInMinutes(wakeUpTime);
const completionMinutes = completionTime.getHours() * 60 + completionTime.getMinutes();
const timeDiff = completionMinutes - wakeMinutes;
if (timeDiff <= 25 && timeDiff >= 0) {
  // Award speed bonus
}
```

**2. Global Habit Tracking**
```typescript
// Used to check subtask completion
interface HabitTrackingDependency {
  isHabitCompleted: (habitKey: string) => boolean;
  toggleHabit: (habitKey: string, completed: boolean) => Promise<void>;
}

// Usage
const bathroom = isHabitCompleted('bathroom');
const brushTeeth = isHabitCompleted('brushTeeth');
const coldShower = isHabitCompleted('coldShower');
```

**3. Gamification Service**
```typescript
// Used to award XP
interface GamificationDependency {
  awardXP: (activityId: string, multiplier: number) => void;
}

// Usage
GamificationService.awardXP('morning_routine_step', multiplier);
```

**4. Persistence Layer**
```typescript
// Used for data storage/sync
interface PersistenceDependency {
  routine: MorningRoutineState | null;
  updateMetadata: (metadata: Partial<MorningRoutineMetadata>) => Promise<void>;
}

// Usage
await updateMetadata({ /* ... */ });
```

### 6.2 Optional Dependencies

**1. Timing Utilities**
```typescript
// From morningRoutineXpUtils.ts
interface TimingUtils {
  parseTimeToMinutes: (time: string) => number | null;
  calculateMinutesSinceWake: (wakeUpTime: string, selectedDate: Date, completionTimestamp: number) => number | null;
}
```

**2. XP Calculation Utilities**
```typescript
// From xpCalculations.ts
interface XPCalculations {
  calculateFreshenUpXP: (completed: FreshenUpState, wakeUpTime: string, completionTime?: Date, date?: Date) => { total: number; speedBonus: number };
  calculateStepXpMultiplier: (params: StepXpMultiplierParams) => number;
  calculateWakeUpXpMultiplier: (wakeUpTime: string) => number;
}
```

### 6.3 Dependency Graph

```
Freshen Up Domain
    ↓ depends on
    ├─ Wake Up Domain (wakeUpTime, selectedDate)
    ├─ Habit Tracking System (isHabitCompleted, toggleHabit)
    ├─ Gamification Service (awardXP)
    ├─ Persistence Layer (routine state, updateMetadata)
    ├─ Timing Utilities (parseTimeToMinutes, calculateMinutesSinceWake)
    └─ XP Calculations (calculateFreshenUpXP, calculateStepXpMultiplier, calculateWakeUpXpMultiplier)
```

### 6.4 Dependency Injection Strategy

**Option 1: Pass All Dependencies (Explicit)**
```typescript
function useFreshenUp(dependencies: {
  wakeUpTime: string;
  selectedDate: Date;
  isHabitCompleted: (key: string) => boolean;
  toggleHabit: (key: string, completed: boolean) => Promise<void>;
  awardXP: (id: string, multiplier: number) => void;
}) {
  // ...
}
```

**Option 2: Use Context (Implicit)**
```typescript
const MorningRoutineContext = createContext<MorningRoutineContextValue>(null);

function useFreshenUp() {
  const context = useContext(MorningRoutineContext);
  // Extract Freshen Up dependencies from context
  // ...
}
```

**Recommendation:** Option 1 (Explicit) for better testability and clearer dependencies.

---

## 7. Proposed Hook Interface

### 7.1 Hook Signature

```typescript
/**
 * Freshen Up Domain Hook
 *
 * Manages personal hygiene tasks in the morning routine.
 *
 * @param dependencies - External dependencies required for the domain
 * @returns Freshen Up state and actions
 */
export function useFreshenUp(
  dependencies: FreshenUpDependencies
): FreshenUpReturn
```

### 7.2 Type Definitions

```typescript
/**
 * External dependencies required by Freshen Up domain
 */
export interface FreshenUpDependencies {
  // From Wake Up domain
  wakeUpTime: string;
  selectedDate: Date;

  // From global habit tracking
  isHabitCompleted: (habitKey: string) => boolean;
  toggleHabit: (habitKey: string, completed: boolean) => Promise<void>;

  // From gamification system
  awardHabitCompletion: (habitKey: string) => void;
}

/**
 * Freshen Up subtask state
 */
export interface FreshenUpState {
  bathroom: boolean;
  brushTeeth: boolean;
  coldShower: boolean;
  isComplete: boolean;        // All 3 subtasks completed
  completedCount: number;     // 0-3
  progressPercent: number;    // 0-100
}

/**
 * Freshen Up XP breakdown
 */
export interface FreshenUpXPBreakdown {
  bathroom: number;      // 0 or 10
  brushTeeth: number;    // 0 or 10
  coldShower: number;    // 0 or 20
  speedBonus: number;    // 0 or 25
  total: number;         // Sum of above
}

/**
 * Freshen Up actions
 */
export interface FreshenUpActions {
  toggleSubtask: (subtaskKey: FreshenUpSubtaskKey) => Promise<void>;
  calculateXP: () => FreshenUpXPBreakdown;
  checkSpeedBonus: () => boolean;
  reset: () => void;
}

/**
 * Freshen Up subtask keys
 */
export type FreshenUpSubtaskKey = 'bathroom' | 'brushTeeth' | 'coldShower';

/**
 * Complete hook return type
 */
export type FreshenUpReturn = FreshenUpState & FreshenUpActions;
```

### 7.3 Hook Implementation Structure

```typescript
export function useFreshenUp(
  dependencies: FreshenUpDependencies
): FreshenUpReturn {
  const {
    wakeUpTime,
    selectedDate,
    isHabitCompleted,
    toggleHabit,
    awardHabitCompletion
  } = dependencies;

  // ===== STATE =====

  // Computed state (no local state needed)
  const bathroom = useMemo(() => isHabitCompleted('bathroom'), [isHabitCompleted]);
  const brushTeeth = useMemo(() => isHabitCompleted('brushTeeth'), [isHabitCompleted]);
  const coldShower = useMemo(() => isHabitCompleted('coldShower'), [isHabitCompleted]);

  const isComplete = useMemo(
    () => bathroom && brushTeeth && coldShower,
    [bathroom, brushTeeth, coldShower]
  );

  const completedCount = useMemo(
    () => [bathroom, brushTeeth, coldShower].filter(Boolean).length,
    [bathroom, brushTeeth, coldShower]
  );

  const progressPercent = useMemo(
    () => (completedCount / 3) * 100,
    [completedCount]
  );

  // ===== ACTIONS =====

  const toggleSubtask = useCallback(async (subtaskKey: FreshenUpSubtaskKey) => {
    const currentState = isHabitCompleted(subtaskKey);
    await toggleHabit(subtaskKey, !currentState);

    if (!currentState) {
      awardHabitCompletion(subtaskKey);
    }
  }, [isHabitCompleted, toggleHabit, awardHabitCompletion]);

  const calculateXP = useCallback((): FreshenUpXPBreakdown => {
    const completed = { bathroom, brushTeeth, coldShower };

    // Base XP
    let total = 0;
    if (bathroom) total += 10;
    if (brushTeeth) total += 10;
    if (coldShower) total += 20;

    // Speed bonus (TODO: Implement completionTimestamp tracking)
    let speedBonus = 0;

    return {
      bathroom: bathroom ? 10 : 0,
      brushTeeth: brushTeeth ? 10 : 0,
      coldShower: coldShower ? 20 : 0,
      speedBonus,
      total
    };
  }, [bathroom, brushTeeth, coldShower]);

  const checkSpeedBonus = useCallback((): boolean => {
    // TODO: Implement speed bonus check
    // Requires tracking completion timestamp
    return false;
  }, []);

  const reset = useCallback(() => {
    // Reset all subtasks
    // This would be called when date changes
  }, []);

  return {
    // State
    bathroom,
    brushTeeth,
    coldShower,
    isComplete,
    completedCount,
    progressPercent,

    // Actions
    toggleSubtask,
    calculateXP,
    checkSpeedBonus,
    reset
  };
}
```

### 7.4 Usage Example

```typescript
// In MorningRoutineSection.tsx
const freshenUp = useFreshenUp({
  wakeUpTime,
  selectedDate,
  isHabitCompleted,
  toggleHabit: toggleMorningHabit,
  awardHabitCompletion
});

// Use in component
<FreshenUpCard
  bathroom={freshenUp.bathroom}
  brushTeeth={freshenUp.brushTeeth}
  coldShower={freshenUp.coldShower}
  isComplete={freshenUp.isComplete}
  completedCount={freshenUp.completedCount}
  progressPercent={freshenUp.progressPercent}
  xpAwarded={freshenUp.calculateXP().total}
  speedBonusAwarded={freshenUp.calculateXP().speedBonus}
  onToggleSubtask={freshenUp.toggleSubtask}
/>
```

---

## 8. Migration Risks

### 8.1 Critical Risks

**Risk 1: Breaking Habit Toggle Flow**
- **Severity:** HIGH
- **Impact:** Users unable to toggle habits
- **Cause:** Incorrect dependency injection or missing functions
- **Mitigation:**
  - Comprehensive integration tests
  - Manual testing on mobile devices
  - Verify toggle flow in isolation before integration

**Risk 2: XP Calculation Discrepancy**
- **Severity:** HIGH
- **Impact:** Incorrect XP awarded, user dissatisfaction
- **Cause:** Different calculation logic in hook vs component
- **Mitigation:**
  - Reuse existing `calculateFreshenUpXP` function
  - Add unit tests for XP calculation
  - Compare XP totals before/after migration

**Risk 3: Speed Bonus Loss**
- **Severity:** MEDIUM
- **Impact:** Users lose 25 XP bonus
- **Cause:** Speed bonus already broken (completionTime undefined)
- **Mitigation:**
  - Implement completionTimestamp tracking in hook
  - Add tests for speed bonus calculation
  - Verify bonus is awarded correctly

**Risk 4: State Desynchronization**
- **Severity:** HIGH
- **Impact:** State mismatch between UI and database
- **Cause:** Race condition between hook state and Supabase sync
- **Mitigation:**
  - Use same `useMorningRoutineSupabase` hook
  - Ensure state updates are atomic
  - Add retry logic for failed updates

**Risk 5: Regression in Other Domains**
- **Severity:** MEDIUM
- **Impact:** Other domains (Wake Up, Get Blood Flowing, etc.) break
- **Cause:** Shared code modified accidentally
- **Mitigation:**
  - Extract domain-specific code only
  - Run full test suite after extraction
  - Test all domains manually

### 8.2 Medium Risks

**Risk 6: Performance Degradation**
- **Severity:** MEDIUM
- **Impact:** Slower UI, janky animations
- **Cause:** Too many re-renders from hook
- **Mitigation:**
  - Use `useMemo` and `useCallback` appropriately
  - Profile render performance before/after
  - Implement React.memo for components

**Risk 7: Mobile UX Issues**
- **Severity:** MEDIUM
- **Impact:** Touch targets too small, hard to use on mobile
- **Cause:** Component structure changes
- **Mitigation:**
  - Maintain 44px min touch targets
  - Test on real mobile devices
  - Preserve hover/active states

**Risk 8: Offline Mode Breakage**
- **Severity:** MEDIUM
- **Impact:** App doesn't work offline
- **Cause:** IndexedDB sync logic modified
- **Mitigation:**
  - Preserve existing sync flow
  - Test offline mode extensively
  - Verify IndexedDB writes succeed

### 8.3 Low Risks

**Risk 9: Tylen in Subtask Titles**
- **Severity:** LOW
- **Impact:** Minor text issues
- **Cause:** Copy-paste errors
- **Mitigation:**
  - Review all text strings
  - Add spell-check to CI

**Risk 10: Animation Loss**
- **Severity:** LOW
- **Impact:** Less polished UI
- **Cause:** Framer Motion props not passed through
- **Mitigation:**
  - Preserve all motion components
  - Test animations manually

### 8.4 Risk Mitigation Checklist

- [ ] Write integration tests for habit toggle flow
- [ ] Write unit tests for XP calculation
- [ ] Write unit tests for speed bonus (when implemented)
- [ ] Manual testing on mobile devices
- [ ] Manual testing on desktop browsers
- [ ] Offline mode testing
- [ ] Performance profiling
- [ ] Code review by senior developer
- [ ] Beta testing with subset of users
- [ ] Rollback plan ready

---

## 9. Test Requirements

### 9.1 Unit Tests

**Test Suite 1: State Calculation**
```typescript
describe('useFreshenUp - State Calculation', () => {
  it('should calculate bathroom state correctly', () => {
    // Test: isHabitCompleted('bathroom') returns true
    // Expect: bathroom === true
  });

  it('should calculate isComplete correctly', () => {
    // Test: All 3 subtasks true
    // Expect: isComplete === true
  });

  it('should calculate isComplete as false when incomplete', () => {
    // Test: Only 2 subtasks true
    // Expect: isComplete === false
  });

  it('should calculate completedCount correctly', () => {
    // Test: 2 subtasks true
    // Expect: completedCount === 2
  });

  it('should calculate progressPercent correctly', () => {
    // Test: 2 subtasks true
    // Expect: progressPercent === 66.67
  });
});
```

**Test Suite 2: XP Calculation**
```typescript
describe('useFreshenUp - XP Calculation', () => {
  it('should calculate 0 XP when no subtasks completed', () => {
    // Test: All subtasks false
    // Expect: total === 0
  });

  it('should calculate 10 XP for bathroom only', () => {
    // Test: bathroom === true, others false
    // Expect: total === 10, breakdown.bathroom === 10
  });

  it('should calculate 20 XP for cold shower only', () => {
    // Test: coldShower === true, others false
    // Expect: total === 20, breakdown.coldShower === 20
  });

  it('should calculate 40 XP for all subtasks', () => {
    // Test: All subtasks true
    // Expect: total === 40 (no speed bonus)
  });

  it('should calculate 65 XP with speed bonus', () => {
    // Test: All subtasks true + completed within 25 min
    // Expect: total === 65, speedBonus === 25
  });

  it('should not award speed bonus after 25 min', () => {
    // Test: All subtasks true + completed after 25 min
    // Expect: total === 40, speedBonus === 0
  });
});
```

**Test Suite 3: Actions**
```typescript
describe('useFreshenUp - Actions', () => {
  it('should toggle subtask from false to true', async () => {
    // Test: toggleSubtask('bathroom')
    // Expect: toggleHabit called with ('bathroom', true)
    // Expect: awardHabitCompletion called with ('bathroom')
  });

  it('should toggle subtask from true to false', async () => {
    // Test: toggleSubtask('bathroom') when already true
    // Expect: toggleHabit called with ('bathroom', false)
    // Expect: awardHabitCompletion NOT called
  });

  it('should handle toggle errors gracefully', async () => {
    // Test: toggleHabit throws error
    // Expect: Error caught and logged
  });
});
```

### 9.2 Integration Tests

**Test Suite 4: Habit Toggle Flow**
```typescript
describe('useFreshenUp - Integration', () => {
  it('should complete full toggle flow', async () => {
    // 1. User clicks bathroom checkbox
    // 2. toggleSubtask called
    // 3. toggleHabit called
    // 4. IndexedDB updated
    // 5. Supabase synced
    // 6. awardHabitCompletion called
    // 7. GamificationService.awardXP called
    // 8. State updated
    // 9. UI re-rendered
  });

  it('should update progress bar after toggle', async () => {
    // Test: Toggle bathroom from false to true
    // Expect: progressPercent changes from 0 to 33.33
  });

  it('should show complete status when all done', async () => {
    // Test: Toggle all 3 subtasks to true
    // Expect: isComplete === true
    // Expect: UI shows "✓ Complete"
  });
});
```

**Test Suite 5: Speed Bonus Flow**
```typescript
describe('useFreshenUp - Speed Bonus', () => {
  it('should track completion timestamp', () => {
    // Test: Complete all 3 subtasks
    // Expect: completionTimestamp is set
  });

  it('should calculate speed bonus correctly', () => {
    // Test: Wake up at 6:00 AM, complete at 6:20 AM
    // Expect: speedBonus === 25
  });

  it('should not award speed bonus if too slow', () => {
    // Test: Wake up at 6:00 AM, complete at 6:30 AM
    // Expect: speedBonus === 0
  });
});
```

### 9.3 E2E Tests

**Test Suite 6: User Journeys**
```typescript
describe('Freshen Up - E2E', () => {
  it('should complete full morning routine', async () => {
    // 1. User navigates to Morning Routine page
    // 2. User sets wake-up time to 6:00 AM
    // 3. User checks "Bathroom break"
    // 4. User checks "Brush teeth"
    // 5. User checks "Cold shower"
    // 6. Verify: Progress bar shows 100%
    // 7. Verify: XP badge shows 40 XP (or 65 XP with speed bonus)
    // 8. Verify: "✓ Complete" status shown
  });

  it('should handle offline mode', async () => {
    // 1. Disable network
    // 2. User checks "Bathroom break"
    // 3. Verify: IndexedDB updated
    // 4. Verify: UI shows checked state
    // 5. Enable network
    // 6. Verify: Supabase synced
  });

  it('should handle subtask untoggle', async () => {
    // 1. User checks "Bathroom break"
    // 2. User unchecks "Bathroom break"
    // 3. Verify: Progress bar updates
    // 4. Verify: XP not retracted (current behavior)
  });
});
```

### 9.4 Performance Tests

**Test Suite 7: Performance**
```typescript
describe('Freshen Up - Performance', () => {
  it('should render without lag', () => {
    // Test: Render component with all 3 subtasks
    // Expect: Render time < 16ms (60fps)
  });

  it('should not re-render unnecessarily', () => {
    // Test: Toggle unrelated subtask (e.g., pushups)
    // Expect: Freshen Up component does NOT re-render
  });

  it('should handle rapid toggles', async () => {
    // Test: Toggle all 3 subtasks rapidly (5 times each)
    // Expect: No race conditions, final state correct
  });
});
```

### 9.5 Accessibility Tests

**Test Suite 8: Accessibility**
```typescript
describe('Freshen Up - A11y', () => {
  it('should have proper touch targets', () => {
    // Test: Measure touch target size
    // Expect: Min 44px height and width
  });

  it('should be keyboard accessible', () => {
    // Test: Tab through subtasks, press Enter to toggle
    // Expect: All subtasks toggleable via keyboard
  });

  it('should have proper ARIA labels', () => {
    // Test: Check checkbox aria-label
    // Expect: Meaningful labels for screen readers
  });

  it('should have sufficient color contrast', () => {
    // Test: Check color contrast ratios
    // Expect: WCAG AA compliant (4.5:1 for text)
  });
});
```

### 9.6 Test Coverage Targets

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** 80%+ coverage
- **E2E Tests:** All critical user journeys
- **Performance Tests:** All rendering paths
- **Accessibility Tests:** All interactive elements

---

## 10. Recommendations

### 10.1 Immediate Actions (High Priority)

1. **Extract useFreshenUp Hook**
   - Create `/src/domains/lifelock/1-daily/1-morning-routine/hooks/useFreshenUp.ts`
   - Implement hook with all state and actions
   - Write comprehensive unit tests
   - Integrate into MorningRoutineSection.tsx

2. **Fix Speed Bonus Calculation**
   - Add `completionTimestamp` tracking to hook
   - Pass `completionTime` to `calculateFreshenUpXP`
   - Write tests for speed bonus scenarios
   - Verify bonus is awarded correctly

3. **Extract FreshenUpCard Component**
   - Create `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/FreshenUpCard.tsx`
   - Move UI rendering code from MorningRoutineSection
   - Implement component props interface
   - Add Storybook stories

4. **Update Type Definitions**
   - Add `FreshenUpSubtaskKey` type to `domain/types.ts`
   - Add `FreshenUpState` interface to `domain/types.ts`
   - Add `FreshenUpXPBreakdown` interface to `domain/types.ts`
   - Export from `domain/index.ts`

5. **Write Integration Tests**
   - Create `hooks/useFreshenUp.test.ts`
   - Test all state calculations
   - Test all actions
   - Test error handling
   - Achieve 90%+ coverage

### 10.2 Short-term Actions (Medium Priority)

6. **Refactor XP Calculation**
   - Move `calculateFreshenUpXP` to hook file
   - Add memoization to prevent recalculation
   - Add unit tests for edge cases
   - Document XP formula

7. **Improve Error Handling**
   - Add try-catch to `toggleSubtask`
   - Show user-friendly error messages
   - Add retry logic for failed updates
   - Log errors to monitoring service

8. **Optimize Performance**
   - Add `React.memo` to FreshenUpCard
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers
   - Profile and optimize render performance

9. **Enhance Mobile UX**
   - Verify touch targets are 44px minimum
   - Test on real mobile devices
   - Add haptic feedback (if supported)
   - Improve checkbox hit areas

10. **Add Analytics**
    - Track subtask toggle events
    - Track completion times
    - Track speed bonus frequency
    - Monitor XP awarding

### 10.3 Long-term Actions (Low Priority)

11. **Add A/B Testing**
    - Test different subtask orders
    - Test different XP values
    - Test different UI layouts
    - Measure impact on completion rates

12. **Improve Documentation**
    - Add JSDoc comments to all functions
    - Create architecture diagram
    - Write migration guide
    - Update onboarding docs

13. **Add Notifications**
    - Notify user when domain is complete
    - Celebrate speed bonus achievement
    - Remind user if not started by 8 AM
    - Show progress streak

14. **Refactor Other Domains**
    - Extract `useWakeUp` hook
    - Extract `useGetBloodFlowing` hook
    - Extract `usePowerUpBrain` hook
    - Extract `usePlanDay` hook
    - Extract `useMeditation` hook

15. **Implement Domain Composition**
    - Create `useMorningRoutine` hook
    - Compose all domain hooks
    - Centralize state management
    - Simplify component code

---

## 11. Appendix

### 11.1 File Locations

**Current Implementation:**
- Component: `/src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`
- XP Calculation: `/src/domains/lifelock/1-daily/1-morning-routine/domain/xpCalculations.ts`
- Types: `/src/domains/lifelock/1-daily/1-morning-routine/domain/types.ts`
- Config: `/src/domains/lifelock/1-daily/1-morning-routine/domain/config.ts`
- Hook: `/src/lib/hooks/useMorningRoutineSupabase.ts`

**Proposed Locations:**
- Hook: `/src/domains/lifelock/1-daily/1-morning-routine/hooks/useFreshenUp.ts`
- Component: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/FreshenUpCard.tsx`
- Tests: `/src/domains/lifelock/1-daily/1-morning-routine/hooks/useFreshenUp.test.ts`
- Stories: `/src/domains/lifelock/1-daily/1-morning-routine/ui/components/FreshenUpCard.stories.tsx`

### 11.2 Key Code Snippets

**Subtask Definitions (Lines 148-152):**
```typescript
subtasks: [
  { key: 'bathroom', title: 'Bathroom break' },
  { key: 'brushTeeth', title: 'Brush teeth' },
  { key: 'coldShower', title: 'Cold shower' }
]
```

**Completion Check (Lines 620-624):**
```typescript
case 'freshenUp':
  // Complete when all subtasks are checked
  return subtasks.length > 0 && subtasks.every(subtask => isHabitCompleted(subtask.key));
```

**XP Calculation Usage (Lines 658-662):**
```typescript
freshenUp: {
  bathroom: isHabitCompleted('bathroom'),
  brushTeeth: isHabitCompleted('brushTeeth'),
  coldShower: isHabitCompleted('coldShower')
}
```

**Habit Toggle Handler (Lines 576-591):**
```typescript
const handleHabitToggle = async (habitKey: string, completed: boolean) => {
  if (!selectedDate) return;

  try {
    await toggleMorningHabit(habitKey, completed);

    if (completed) {
      awardHabitCompletion(habitKey);
    }

    setLocalProgressTrigger(prev => prev + 1);
  } catch (error) {
    console.error('Error updating habit:', error);
    setError('Failed to update habit completion');
  }
};
```

### 11.3 Related Documentation

- Morning Routine Guide: `/docs/product/lifelock/daily/morning-routine-guide.md`
- Implementation Notes: `/docs/knowledge/feedback/dated/2025/2025-10-17-COMPLETE-morning-routine-implementation.md`
- XP System: `/docs/features/MORNING-ROUTINE-XP-SYSTEM.md` (referenced but not found)

### 11.4 Glossary

- **Domain:** A distinct business area with its own state, logic, and UI
- **Subtask:** An individual task within a domain (e.g., bathroom, brushTeeth, coldShower)
- **Hook:** A reusable React function that encapsulates state and logic
- **XP:** Experience Points awarded for completing tasks
- **Speed Bonus:** Extra XP awarded for completing tasks quickly
- **IndexedDB:** Browser database for offline storage
- **Supabase:** Cloud database for cross-device synchronization

---

## Summary

The **Freshen Up** domain is a well-defined, self-contained business domain that manages three personal hygiene subtasks. It has clear boundaries, simple state management, and straightforward business rules. However, it is currently tightly coupled within a monolithic component, making it difficult to test, maintain, and reuse.

**Key Takeaways:**
1. **State:** 3 boolean variables (bathroom, brushTeeth, coldShower)
2. **XP:** 40 XP base + 25 XP speed bonus (currently broken)
3. **Dependencies:** Wake Up domain (wakeUpTime), habit tracking system, gamification service
4. **Risks:** Breaking toggle flow, XP discrepancies, speed bonus loss
5. **Tests:** Unit, integration, E2E, performance, accessibility

**Next Steps:**
1. Extract `useFreshenUp` hook
2. Create `FreshenUpCard` component
3. Fix speed bonus calculation
4. Write comprehensive tests
5. Update documentation

**Impact:**
- Reduced code complexity
- Improved testability
- Better reusability
- Clearer domain boundaries
- Easier maintenance

---

**End of Analysis**
