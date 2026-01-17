# Phase 1: Foundation - Execution Plan

**Project:** Morning Routine Refactoring
**Phase:** 1 - Foundation
**Duration:** 2 days
**Status:** 🚀 In Progress
**Started:** 2025-01-18T07:15:00Z

---

## 📋 Phase Overview

Phase 1 establishes the foundation for the entire refactoring. We create the type definitions, configuration, service interfaces, and test infrastructure that all subsequent phases will depend upon.

### Goals
- ✅ Define all domain types
- ✅ Extract configuration constants
- ✅ Create service interfaces
- ✅ Set up test infrastructure
- ✅ Zero breaking changes to existing code

### Success Criteria
- All type definitions compile without errors
- Configuration extracted from monolith
- Test suite runs successfully
- Existing code still works

---

## 👥 Agent Team Allocation

### Team Lead: Architect Agent
**Location:** `.blackbox/1-agents/4-specialists/architect/`
**Role:** Overall architecture oversight, type system design, coordination

### Agent 1: Type Definition Specialist
**Agent Type:** backend-developer-mcp-enhanced (MCP with Supabase)
**Focus:** Domain types, interfaces, type safety
**Deliverables:**
- `domain/types/morning-routine.types.ts`
- `domain/types/xp.types.ts`
- `domain/types/index.ts`

### Agent 2: Configuration Extractor
**Agent Type:** general-purpose
**Focus:** Extract constants, config files
**Deliverables:**
- `domain/config/tasks.config.ts`
- `domain/config/xp-multipliers.config.ts`
- `domain/config/index.ts`

### Agent 3: Service Interface Designer
**Agent Type:** Plan (software architect)
**Focus:** Service interfaces, contracts
**Deliverables:**
- `domain/services/xp/interfaces.ts`
- `domain/services/validators/interfaces.ts`
- `domain/services/parsers/interfaces.ts`

### Agent 4: Test Infrastructure Setup
**Agent Type:** test-runner
**Focus:** Test framework, utilities
**Deliverables:**
- `vitest.config.mts`
- `test/setup.ts`
- `test/utils/test-helpers.ts`
- `test/mocks/mock-supabase.ts`

---

## 📁 File Creation Plan

### 1. Domain Types

#### `domain/types/morning-routine.types.ts`
**Agent:** Type Definition Specialist
**Lines:** ~150
**Content:**
```typescript
// Core domain types
export type TaskKey = 'wakeUp' | 'freshenUp' | 'getBloodFlowing' | 'powerUpBrain' | 'planDay' | 'meditation';
export type TaskDomain = 'wake-up' | 'freshen-up' | 'blood-flow' | 'brain-power' | 'planning' | 'meditation';

export interface MorningRoutineTask {
  key: TaskKey;
  title: string;
  description: string;
  icon: React.ComponentType;
  domain: TaskDomain;
  hasTimeTracking: boolean;
  subtasks: SubTask[];
}

export interface SubTask {
  key: string;
  title: string;
}

export interface TaskCompletionStatus {
  isComplete: boolean;
  progressPercent: number;
  xpEarned: number;
  completedAt?: Date;
}

export interface MorningRoutineState {
  date: Date;
  tasks: Record<TaskKey, TaskCompletionStatus>;
  totalXP: number;
}
```

#### `domain/types/xp.types.ts`
**Agent:** Type Definition Specialist
**Lines:** ~100
**Content:**
```typescript
export interface XPCalculation {
  base: number;
  bonus: number;
  multiplier: number;
  total: number;
  breakdown: XPBreakdown;
}

export interface XPBreakdown {
  [taskKey: string]: number;
}

export interface XPMultiplier {
  value: number;
  label: string;
  color: string;
  icon: string;
}

export interface XPRequest {
  wakeUpTime?: string;
  habitsCompleted?: string[];
  pushupReps?: number;
  waterAmount?: number;
  meditationDuration?: number;
  isPlanDayComplete?: boolean;
  date: Date;
}
```

#### `domain/types/index.ts`
**Agent:** Type Definition Specialist
**Lines:** ~20
**Content:** Export all types

---

### 2. Configuration

#### `domain/config/tasks.config.ts`
**Agent:** Configuration Extractor
**Lines:** ~100
**Source:** Extract from `MorningRoutineSection.tsx` lines 133-191
**Content:**
```typescript
import { Sun, Droplets, Dumbbell, Brain, Calendar, Heart } from 'lucide-react';

export const MORNING_ROUTINE_TASKS = [
  {
    key: 'wakeUp' as const,
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity.',
    icon: Sun,
    domain: 'wake-up' as const,
    hasTimeTracking: true,
    subtasks: []
  },
  // ... all 6 tasks
] as const;

export const TASK_CONFIG = {
  wakeUp: {
    targetTime: '7:00 AM',
    earlyBirdCutoff: '7:00 AM',
    onTrackCutoff: '9:00 AM',
  },
  freshenUp: {
    speedBonusWindow: 25, // minutes
    speedBonusXP: 25,
  },
  // ... all task configs
};
```

#### `domain/config/xp-multipliers.config.ts`
**Agent:** Configuration Extractor
**Lines:** ~80
**Source:** Extract from `domain/xpCalculations.ts`
**Content:**
```typescript
export const XP_MULTIPLIERS = {
  wakeUp: {
    earlyBird: 2.0,      // Before 7am
    onTrack: 2.0,        // 7-8am
    good: 1.5,           // 8-9am
    okay: 1.2,           // 9-10am
    late: 0.75,          // 10am-12pm
    veryLate: 0.5,       // 12-2pm
    emergency: 0.25,     // 2-4pm
    minimal: 0.1,        // 4pm+
  },
  freshenUp: {
    base: 40,
    speedBonus: 25,
    speedWindow: 25, // minutes after wake-up
  },
  // ... all multipliers
} as const;

export const WEEKEND_BONUS = 1.2; // +20% on Sat/Sun before 8am
```

---

### 3. Service Interfaces

#### `domain/services/xp/interfaces.ts`
**Agent:** Service Interface Designer
**Lines:** ~50
**Content:**
```typescript
export interface IXPCalculatorService {
  calculateWakeUpXP(request: WakeUpXPRequest): number;
  calculateFreshenUpXP(request: FreshenUpXPRequest): number;
  calculateBloodFlowXP(request: BloodFlowXPRequest): number;
  calculateBrainPowerXP(request: BrainPowerXPRequest): number;
  calculatePlanningXP(request: PlanningXPRequest): number;
  calculateMeditationXP(request: MeditationXPRequest): number;
  calculateTotalXP(request: TotalXPRequest): XPCalculation;
}

export interface IXPMultiplierService {
  getWakeUpMultiplier(time: string, date: Date): XPMultiplier;
  getStepMultiplier(minutesSinceWake: number): number;
  isValidForSpeedBonus(wakeUpTime: string, completionTime: Date): boolean;
}
```

#### `domain/services/validators/interfaces.ts`
**Agent:** Service Interface Designer
**Lines:** ~30
**Content:**
```typescript
export interface ITaskValidatorService {
  validateWakeUpTime(time: string): boolean;
  validatePushupReps(reps: number): boolean;
  validateWaterAmount(amount: number): boolean;
  validateMeditationDuration(duration: number): boolean;
  isTaskComplete(taskKey: TaskKey, data: any): boolean;
}
```

#### `domain/services/parsers/interfaces.ts`
**Agent:** Service Interface Designer
**Lines:** ~30
**Content:**
```typescript
export interface ITimeParserService {
  parseTime(time: string): number | null; // minutes from midnight
  formatTime(minutes: number): string;
  isValidTime(time: string): boolean;
}

export interface IDateParserService {
  isWeekend(date: Date): boolean;
  isBefore8AM(date: Date): boolean;
}
```

---

### 4. Test Infrastructure

#### `vitest.config.mts` (or update existing)
**Agent:** Test Infrastructure Setup
**Lines:** ~50
**Content:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
      ],
    },
  },
});
```

#### `test/setup.ts`
**Agent:** Test Infrastructure Setup
**Lines:** ~30
**Content:**
```typescript
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'test-user' } }),
}));

// Global test utilities
global.testDate = new Date('2025-01-18T07:00:00Z');
```

#### `test/utils/test-helpers.ts`
**Agent:** Test Infrastructure Setup
**Lines:** ~80
**Content:**
```typescript
export function createMockTask(taskKey: TaskKey): MorningRoutineTask { }
export function createMockCompletionStatus(overrides?: Partial<TaskCompletionStatus>): TaskCompletionStatus { }
export function createMockXPRequest(overrides?: Partial<XPRequest>): XPRequest { }
export function advanceToTime(date: Date, time: string): Date { }
export function TestUtils {
  // Reset all mocks
  resetAll(): void;
  // Flush all promises
  flushPromises(): Promise<void>;
}
```

#### `test/mocks/mock-supabase.ts`
**Agent:** Test Infrastructure Setup
**Lines:** ~100
**Content:**
```typescript
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => mockSupabaseClient),
};
```

---

## 🔄 Agent Workflow

### Step 1: Team Lead Kickoff (Architect Agent)
- Review overall architecture
- Define type system approach
- Create execution order
- Assign specific files to each agent

### Step 2: Parallel Execution (4 Agents)

**Type Definition Specialist:**
1. Read existing monolith for type usage
2. Extract all implicit types
3. Create explicit type definitions
4. Ensure type safety across domains
5. Export types via index.ts

**Configuration Extractor:**
1. Find all magic numbers/constants
2. Extract to config files
3. Group by domain
4. Create strongly-typed config
5. Document each constant

**Service Interface Designer:**
1. Analyze existing service usage
2. Define clean interfaces
3. Ensure SOLID principles
4. Create contracts for future implementation
5. Document interface expectations

**Test Infrastructure Setup:**
1. Check existing test setup
2. Update/create vitest config
3. Create test utilities
4. Mock external dependencies
5. Verify test runner works

### Step 3: Integration (Architect Agent)
- Review all created files
- Check for type errors
- Verify compilation
- Run test suite
- Update documentation

---

## 📊 Progress Tracking

### Checklist

- [ ] **Type Definition Specialist**
  - [ ] Create `domain/types/morning-routine.types.ts`
  - [ ] Create `domain/types/xp.types.ts`
  - [ ] Create `domain/types/index.ts`
  - [ ] Verify no `any` types
  - [ ] Check compilation

- [ ] **Configuration Extractor**
  - [ ] Create `domain/config/tasks.config.ts`
  - [ ] Create `domain/config/xp-multipliers.config.ts`
  - [ ] Create `domain/config/index.ts`
  - [ ] Extract all magic numbers
  - [ ] Document constants

- [ ] **Service Interface Designer**
  - [ ] Create `domain/services/xp/interfaces.ts`
  - [ ] Create `domain/services/validators/interfaces.ts`
  - [ ] Create `domain/services/parsers/interfaces.ts`
  - [ ] Review interfaces for completeness
  - [ ] Document contracts

- [ ] **Test Infrastructure Setup**
  - [ ] Create/update `vitest.config.mts`
  - [ ] Create `test/setup.ts`
  - [ ] Create `test/utils/test-helpers.ts`
  - [ ] Create `test/mocks/mock-supabase.ts`
  - [ ] Run test suite to verify

- [ ] **Team Lead (Architect)**
  - [ ] Review all files
  - [ ] Check compilation
  - [ ] Verify type safety
  - [ ] Update blackbox documentation
  - [ ] Sign off on Phase 1

---

## ✅ Exit Criteria

Phase 1 is complete when:

1. **All files created** (12 files total)
2. **TypeScript compiles** with zero errors
3. **Test suite runs** (even if no tests yet)
4. **No breaking changes** to existing code
5. **Documentation updated** in blackbox
6. **Team lead approval**

---

## 🚀 Next Phase Preview

Once Phase 1 is complete, we'll move to **Phase 2: Domain Layer** which will:

- Implement XP Calculator Service (using interfaces from Phase 1)
- Implement XP Multiplier Service (using interfaces from Phase 1)
- Implement Task Validator Service (using interfaces from Phase 1)
- Implement Time Parser Service (using interfaces from Phase 1)
- Write unit tests for all services (using test infrastructure from Phase 1)

**Agent Allocation for Phase 2:**
- 4 Service Implementation Agents (parallel)
- 1 Test Writer Agent
- 1 Team Lead (Architect)

---

## 📝 Notes

- All agents should update progress in blackbox
- Team lead coordinates via `.blackbox/.plans/active/vibe-kanban-work/`
- Each agent creates their own progress file
- Use `.blackbox/9-brain/incoming/` for completed artifacts

---

**Last Updated:** 2025-01-18T07:15:00Z
**Status:** 🚀 Ready to Launch
