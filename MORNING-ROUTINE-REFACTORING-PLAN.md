# Morning Routine Refactoring Plan
## Domain-Based Architecture Redesign

## 🚨 Current Problems

### 1. Monolithic Page Component (1,192 lines)
**File:** `MorningRoutineSection.tsx`

**Issues:**
- Contains 21 separate state declarations
- Mixes 6 different business domains
- No separation of concerns
- Difficult to test, maintain, and extend
- Violates Single Responsibility Principle

### 2. State Management Chaos
```typescript
// 21 useState hooks in ONE component:
const [morningRoutine, setMorningRoutine] = useState(...)
const [loading, setLoading] = useState(...)
const [error, setError] = useState(...)
const [activeMindsetTab, setActiveMindsetTab] = useState(...)
const [showThoughtDumpChat, setShowThoughtDumpChat] = useState(...)
const [thoughtDumpResult, setThoughtDumpResult] = useState(...)
const [isProcessingVoice, setIsProcessingVoice] = useState(false)
const [wakeUpTime, setWakeUpTime] = useState('')
const [isEditingWakeTime, setIsEditingWakeTime] = useState(false)
const [showTimeScrollPicker, setShowTimeScrollPicker] = useState(false)
const [meditationDuration, setMeditationDuration] = useState('')
const [isEditingMeditationTime, setIsEditingMeditationTime] = useState(false)
const [localProgressTrigger, setLocalProgressTrigger] = useState(0)
const [isPlanDayComplete, setIsPlanDayComplete] = useState(false)
const [waterAmount, setWaterAmount] = useState(0)
const [pushupReps, setPushupReps] = useState(0)
const [pushupPB, setPushupPB] = useState(...)
const [dailyPriorities, setDailyPriorities] = useState(['', '', ''])
const [xpState, setXpState] = useState(...)
```

### 3. Violated Principles
- **Single Responsibility:** One component does everything
- **Open/Closed:** Must modify the monolith to add features
- **Dependency Inversion:** Tight coupling to Supabase
- **Domain Boundaries:** No clear domain separation

---

## 🎯 First Principles Analysis

### What are the ACTUAL domains?

Based on the tasks, we have **6 distinct bounded contexts**:

```
1. WAKE UP DOMAIN
   - Entity: WakeUpSession
   - Value: wakeUpTime, wakeUpMultiplier
   - Behavior: Track wake time, calculate XP multiplier
   - Rules: Before 7am = 3x, 7-9am = 2x, etc.

2. FRESHEN UP DOMAIN
   - Entity: HygieneSession
   - Value: bathroom, brushTeeth, coldShower
   - Behavior: Track completion of hygiene tasks
   - Rules: All tasks must complete = 100%

3. BLOOD FLOW DOMAIN
   - Entity: ExerciseSession
   - Value: pushupReps, pushupPB
   - Behavior: Track reps, update PB
   - Rules: XP based on rep count vs PB

4. BRAIN POWER DOMAIN
   - Entity: NutritionSession
   - Value: supplements, waterAmount
   - Behavior: Track intake
   - Rules: XP based on glasses of water

5. PLANNING DOMAIN
   - Entity: PlanningSession
   - Value: isComplete, aiTasksGenerated
   - Behavior: AI thought dump integration
   - Rules: Complete = AI plan generated

6. MEDITATION DOMAIN
   - Entity: MeditationSession
   - Value: duration, durationType
   - Behavior: Track meditation time
   - Rules: XP based on minutes
```

---

## 🏗️ Proposed Domain-Based Architecture

### New Directory Structure

```
src/domains/lifelock/1-daily/1-morning-routine/
│
├── domain/                              # SHARED DOMAIN LAYER
│   ├── types/                           # Shared domain types
│   │   ├── morning-routine.types.ts     # Core interfaces
│   │   ├── xp.types.ts                  # XP calculation types
│   │   └── index.ts
│   │
│   ├── services/                        # Domain services
│   │   ├── xp-calculator.service.ts     # XP calculation logic
│   │   ├── progress-tracker.service.ts  # Progress tracking
│   │   └── index.ts
│   │
│   └── config/                          # Domain configuration
│       ├── tasks.config.ts              # Task definitions
│       ├── xp-multipliers.config.ts     # XP rules
│       └── index.ts
│
├── application/                         # APPLICATION LAYER (Use Cases)
│   ├── morning-routine/                 # Main orchestrator
│   │   ├── use-morning-routine.ts       # Main hook
│   │   ├── morning-routine-orchestrator.ts
│   │   └── index.ts
│   │
│   ├── wake-up/                         # WAKE UP DOMAIN
│   │   ├── use-wake-up.ts               # Hook
│   │   ├── wake-up.usecase.ts           # Use case
│   │   └── index.ts
│   │
│   ├── freshen-up/                      # FRESHEN UP DOMAIN
│   │   ├── use-freshen-up.ts
│   │   ├── freshen-up.usecase.ts
│   │   └── index.ts
│   │
│   ├── blood-flow/                      # BLOOD FLOW DOMAIN
│   │   ├── use-blood-flow.ts
│   │   ├── blood-flow.usecase.ts
│   │   └── index.ts
│   │
│   ├── brain-power/                     # BRAIN POWER DOMAIN
│   │   ├── use-brain-power.ts
│   │   ├── brain-power.usecase.ts
│   │   └── index.ts
│   │
│   ├── planning/                        # PLANNING DOMAIN
│   │   ├── use-planning.ts
│   │   ├── planning.usecase.ts
│   │   └── index.ts
│   │
│   └── meditation/                      # MEDITATION DOMAIN
│       ├── use-meditation.ts
│       ├── meditation.usecase.ts
│       └── index.ts
│
├── infrastructure/                      # INFRASTRUCTURE LAYER
│   ├── repositories/                    # Data access
│   │   ├── morning-routine.repository.ts
│   │   ├── wake-up.repository.ts
│   │   └── index.ts
│   │
│   └── external/                        # External services
│       ├── supabase.adapter.ts
│       └── index.ts
│
├── ui/                                  # PRESENTATION LAYER
│   ├── pages/
│   │   └── MorningRoutineSection.tsx    # ORCHESTRATOR ONLY (~200 lines)
│   │
│   ├── task-views/                      # TASK-SPECIFIC VIEWS
│   │   ├── WakeUpTaskView.tsx           # ~150 lines
│   │   ├── FreshenUpTaskView.tsx        # ~100 lines
│   │   ├── BloodFlowTaskView.tsx        # ~100 lines
│   │   ├── BrainPowerTaskView.tsx       # ~100 lines
│   │   ├── PlanningTaskView.tsx         # ~100 lines
│   │   ├── MeditationTaskView.tsx       # ~100 lines
│   │   └── index.ts
│   │
│   ├── components/                      # SHARED UI COMPONENTS
│   │   ├── MorningRoutineCard.tsx       # Card wrapper
│   │   ├── TaskProgress.tsx             # Progress bar
│   │   ├── CompletionBar.tsx            # Completion status
│   │   └── index.ts
│   │
│   └── trackers/                        # EXISTING TRACKERS (keep as-is)
│       ├── WakeUpTimeTracker.tsx
│       ├── MeditationTracker.tsx
│       ├── WaterTracker.tsx
│       ├── PushUpTracker.tsx
│       └── ...
│
└── features/                            # COMPLEX FEATURES
    └── ai-thought-dump/                 # (Keep as-is)
        └── ...
```

---

## 📋 Detailed Breakdown

### 1. DOMAIN LAYER

#### File: `domain/types/morning-routine.types.ts`
```typescript
// Core domain types (shared across all subdomains)

export interface MorningRoutineTask {
  key: TaskKey;
  title: string;
  description: string;
  icon: React.ComponentType;
  domain: TaskDomain;
}

export type TaskKey =
  | 'wakeUp'
  | 'freshenUp'
  | 'getBloodFlowing'
  | 'powerUpBrain'
  | 'planDay'
  | 'meditation';

export type TaskDomain =
  | 'wake-up'
  | 'freshen-up'
  | 'blood-flow'
  | 'brain-power'
  | 'planning'
  | 'meditation';

export interface TaskCompletionStatus {
  isComplete: boolean;
  progressPercent: number;
  xpEarned: number;
}

export interface MorningRoutineState {
  date: Date;
  tasks: Record<TaskKey, TaskCompletionStatus>;
  totalXP: number;
}
```

#### File: `domain/services/xp-calculator.service.ts`
```typescript
// Pure XP calculation logic (domain service)

export class XPCalculatorService {
  calculateWakeUpXP(time: string, date: Date): number { }
  calculateFreshenUpXP(habits: string[]): number { }
  calculateBloodFlowXP(reps: number): number { }
  calculateBrainPowerXP(waterGlasses: number): number { }
  calculatePlanningXP(isComplete: boolean): number { }
  calculateMeditationXP(duration: number): number { }
  calculateTotalXP(request: TotalXPRequest): TotalXPResponse { }
}
```

---

### 2. APPLICATION LAYER

#### File: `application/wake-up/use-wake-up.ts`
```typescript
// Hook for WAKE UP domain only

export interface UseWakeUpState {
  wakeUpTime: string;
  isEditing: boolean;
  completionStatus: TaskCompletionStatus;
  multiplierInfo: MultiplierInfo;
}

export interface UseWakeUpActions {
  setWakeUpTime: (time: string) => void;
  openTimePicker: () => void;
  closeTimePicker: () => void;
  setCurrentTime: () => void;
  clearTime: () => void;
}

export function useWakeUp(date: Date): UseWakeUpState & UseWakeUpActions {
  // ALL wake-up related state and logic
  // ~50 lines
}
```

#### File: `application/freshen-up/use-freshen-up.ts`
```typescript
// Hook for FRESHEN UP domain only

export interface UseFreshenUpState {
  habits: {
    bathroom: boolean;
    brushTeeth: boolean;
    coldShower: boolean;
  };
  completionStatus: TaskCompletionStatus;
}

export interface UseFreshenUpActions {
  toggleHabit: (key: string) => void;
}

export function useFreshenUp(date: Date): UseFreshenUpState & UseFreshenUpActions {
  // ALL freshen-up related state and logic
  // ~40 lines
}
```

#### File: `application/morning-routine/use-morning-routine.ts`
```typescript
// Main orchestrator hook - composes all domain hooks

export function useMorningRoutine(date: Date) {
  // Compose all domain hooks
  const wakeUp = useWakeUp(date);
  const freshenUp = useFreshenUp(date);
  const bloodFlow = useBloodFlow(date);
  const brainPower = useBrainPower(date);
  const planning = usePlanning(date);
  const meditation = useMeditation(date);

  // Cross-domain concerns
  const totalProgress = useMemo(() => {
    return calculateTotalProgress([
      wakeUp.completionStatus,
      freshenUp.completionStatus,
      bloodFlow.completionStatus,
      brainPower.completionStatus,
      planning.completionStatus,
      meditation.completionStatus,
    ]);
  }, [wakeUp, freshenUp, bloodFlow, brainPower, planning, meditation]);

  const totalXP = useMemo(() => {
    return calculateTotalXP([
      wakeUp.completionStatus.xpEarned,
      freshenUp.completionStatus.xpEarned,
      bloodFlow.completionStatus.xpEarned,
      brainPower.completionStatus.xpEarned,
      planning.completionStatus.xpEarned,
      meditation.completionStatus.xpEarned,
    ]);
  }, [wakeUp, freshenUp, bloodFlow, brainPower, planning, meditation]);

  return {
    domains: {
      wakeUp,
      freshenUp,
      bloodFlow,
      brainPower,
      planning,
      meditation,
    },
    totalProgress,
    totalXP,
  };
}
```

---

### 3. PRESENTATION LAYER

#### File: `ui/pages/MorningRoutineSection.tsx`
```typescript
// ORCHESTRATOR ONLY - ~200 lines

export function MorningRoutineSection({ selectedDate }: Props) {
  const { domains, totalProgress, totalXP } = useMorningRoutine(selectedDate);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Loading State */}
      {loading && <SkeletonLoader />}

      {/* Tasks */}
      <WakeUpTaskView {...domains.wakeUp} />
      <FreshenUpTaskView {...domains.freshenUp} />
      <BloodFlowTaskView {...domains.bloodFlow} />
      <BrainPowerTaskView {...domains.brainPower} />
      <PlanningTaskView {...domains.planning} />
      <MeditationTaskView {...domains.meditation} />

      {/* Shared Components */}
      <DailyPrioritiesSection />
      <MindsetCard />
      <XPFooterSummary totalXP={totalXP} />
    </div>
  );
}
```

#### File: `ui/task-views/WakeUpTaskView.tsx`
```typescript
// WAKE UP domain view - ~150 lines

export function WakeUpTaskView(props: UseWakeUpState & UseWakeUpActions) {
  return (
    <MorningRoutineCard
      title="Wake Up"
      description="Start the day before midday..."
      icon={Sun}
      xp={props.completionStatus.xpEarned}
      isComplete={props.completionStatus.isComplete}
    >
      {props.wakeUpTime ? (
        <>
          <WakeUpTimeTracker
            time={props.wakeUpTime}
            multiplier={props.multiplierInfo}
            onOpenPicker={props.openTimePicker}
            onUseNow={props.setCurrentTime}
          />
        </>
      ) : (
        <EmptyState onSetTime={props.openTimePicker} onNow={props.setCurrentTime} />
      )}
    </MorningRoutineCard>
  );
}
```

#### File: `ui/task-views/FreshenUpTaskView.tsx`
```typescript
// FRESHEN UP domain view - ~100 lines

export function FreshenUpTaskView(props: UseFreshenUpState & UseFreshenUpActions) {
  return (
    <MorningRoutineCard
      title="Freshen Up"
      description="Cold shower to wake up..."
      icon={Droplets}
      xp={props.completionStatus.xpEarned}
      isComplete={props.completionStatus.isComplete}
    >
      {SUBTASKS.map(subtask => (
        <CheckboxSubtask
          key={subtask.key}
          label={subtask.title}
          checked={props.habits[subtask.key]}
          onToggle={() => props.toggleHabit(subtask.key)}
        />
      ))}
    </MorningRoutineCard>
  );
}
```

---

## 🔄 Migration Strategy

### Phase 1: Create Domain Layer (No breaking changes)
1. Create `domain/services/xp-calculator.service.ts`
2. Create `domain/types/morning-routine.types.ts`
3. Create `domain/config/tasks.config.ts`
4. Keep existing code, start using new types

### Phase 2: Create Application Hooks (Parallel development)
1. Create `application/wake-up/use-wake-up.ts`
2. Create `application/freshen-up/use-freshen-up.ts`
3. Create `application/blood-flow/use-blood-flow.ts`
4. Create `application/brain-power/use-brain-power.ts`
5. Create `application/planning/use-planning.ts`
6. Create `application/meditation/use-meditation.ts`
7. Create `application/morning-routine/use-morning-routine.ts`

### Phase 3: Create Task Views (Parallel development)
1. Create `ui/task-views/WakeUpTaskView.tsx`
2. Create `ui/task-views/FreshenUpTaskView.tsx`
3. Create `ui/task-views/BloodFlowTaskView.tsx`
4. Create `ui/task-views/BrainPowerTaskView.tsx`
5. Create `ui/task-views/PlanningTaskView.tsx`
6. Create `ui/task-views/MeditationTaskView.tsx`
7. Create `ui/components/MorningRoutineCard.tsx`
8. Create `ui/components/CompletionBar.tsx`

### Phase 4: Refactor Main Page (Incremental)
1. Replace one task at a time
2. Test each task independently
3. Remove old code after verification
4. Final: Main page is just an orchestrator (~200 lines)

---

## 📊 Benefits

### Before (Current)
- **1,192 lines** in one file
- **21 state variables** in one component
- **6 domains** mixed together
- **Impossible to test** in isolation
- **Hard to extend** - must touch everything
- **Tight coupling** - change breaks everything

### After (Refactored)
- **~200 lines** in orchestrator
- **6 domain hooks** (~50 lines each)
- **6 task views** (~100 lines each)
- **Easy to test** - each domain isolated
- **Easy to extend** - add new domain without touching others
- **Loose coupling** - domains communicate through types

---

## 🎯 Success Criteria

1. ✅ Main page < 250 lines
2. ✅ Each domain hook < 100 lines
3. ✅ Each task view < 150 lines
4. ✅ No shared state between domains
5. ✅ All types defined in domain layer
6. ✅ Pure functions for calculations
7. ✅ Hooks for state management
8. ✅ Views for presentation only
9. ✅ Tests for each domain
10. ✅ Documentation for each layer

---

## 🚀 Next Steps

1. **Review this plan** - Does it align with your vision?
2. **Create Phase 1** - Set up domain layer
3. **Create Phase 2** - Build application hooks
4. **Create Phase 3** - Build task views
5. **Execute Phase 4** - Incremental migration

Should I proceed with implementing this refactoring?
