# 🔧 Component Extraction Master Plan
**Date**: 2025-10-12
**Sections to Extract**: HomeWorkout, Health, Timebox, Checkout
**Total Lines**: 2,029 lines → Target: ~1,000 lines (extract ~1,000 lines into components)

---

## 📊 EXTRACTION ANALYSIS

### Current State:
| Section | Lines | Complexity | Priority |
|---------|-------|------------|----------|
| Home Workout | 308 | Medium | 2 |
| Health Non-Negotiables | 238 | Medium | 2 |
| **Timebox** | **1,008** | **VERY HIGH** | **1** |
| Checkout | 475 | High | 1 |

**Strategy**: Extract timebox and checkout FIRST (biggest files), then wellness if needed.

---

## 🔥 SECTION 1: TIMEBOX (1,008 lines) - URGENT

### Current Structure Analysis:
```
Lines 1-150:   Imports, interfaces, helper functions (mapping logic)
Lines 151-300: useTimeBlocks hook, state management
Lines 301-500: Event handlers (drag/drop, create, update, delete)
Lines 501-700: Time block grid rendering (24-hour grid)
Lines 701-900: Time block cards (individual blocks with styling)
Lines 901-1008: Modals, QuickScheduler integration
```

### Extraction Plan (1,008 → ~400 lines):

#### Components to Extract:

**1. TimeBlockGrid.tsx** (~200 lines)
```typescript
// Lines 501-700: The 24-hour hourly grid
interface TimeBlockGridProps {
  hours: number[];
  timeBlocks: TimeboxTask[];
  currentTime: Date;
  onSelectHour: (hour: number) => void;
  onDragStart: (taskId: string) => void;
  onDrop: (hour: number) => void;
}
```

**2. TimeBlockCard.tsx** (~150 lines)
```typescript
// Lines 701-850: Individual time block with category styling
interface TimeBlockCardProps {
  task: TimeboxTask;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  getDuration: (start: string, end: string) => string;
}
```

**3. CategoryMapper.tsx** (~60 lines)
```typescript
// Lines 29-90: Category mapping logic
// Helper functions: mapCategoryToUI, mapUIToCategory, getCategoryStyles
export const categoryMappers = {
  toUI: (dbCategory: TimeBlockCategory) => string,
  toDatabase: (uiCategory: string) => TimeBlockCategory,
  getStyles: (category, completed) => styles
};
```

**4. TimeBlockModals.tsx** (~100 lines)
```typescript
// Lines 901-1008: Modal management
interface TimeBlockModalsProps {
  isFormModalOpen: boolean;
  isQuickSchedulerOpen: boolean;
  editingBlock: any;
  selectedDate: Date;
  onClose: () => void;
  onCreate: (block) => void;
  onUpdate: (block) => void;
}
```

#### Hooks to Extract:

**5. useTimeBlockManagement.ts** (~150 lines)
```typescript
// Lines 140-290: All the time block CRUD logic
// Wraps useTimeBlocks and adds UI state
export const useTimeBlockManagement = (userId, selectedDate) => {
  // Returns: timeBlocks, handlers, modals state, drag state
};
```

#### Utils to Extract:

**6. timeCalculations.ts** (~80 lines)
```typescript
// Time formatting, duration calculation, hour parsing
export const calculateDuration = (start, end) => number;
export const formatTime = (time) => string;
export const parseHour = (timeString) => number;
```

**Final Timebox Structure**:
```
timebox/
├── TimeboxSection.tsx (main - ~300 lines)
├── components/
│   ├── TimeBlockGrid.tsx (200 lines)
│   ├── TimeBlockCard.tsx (150 lines)
│   ├── CategoryMapper.tsx (60 lines)
│   └── TimeBlockModals.tsx (100 lines)
├── hooks/
│   └── useTimeBlockManagement.ts (150 lines)
└── utils/
    └── timeCalculations.ts (80 lines)
```

**Reduction**: 1,008 → 300 main file (-708 lines extracted)

---

## 💜 SECTION 2: CHECKOUT (475 lines) - HIGH PRIORITY

### Current Structure Analysis:
```
Lines 1-50:    Imports, interfaces
Lines 51-120:  Helper functions (add/remove items for arrays)
Lines 121-180: useEffect hooks (load data, save data)
Lines 181-230: Progress calculation
Lines 231-350: Reflection questions UI (went well, even better if)
Lines 351-400: Daily analysis, action items, key learnings
Lines 401-450: Tomorrow focus, overall rating
Lines 451-475: Save indicator, bed time tracker
```

### Extraction Plan (475 → ~200 lines):

#### Components to Extract:

**1. ReflectionQuestions.tsx** (~120 lines)
```typescript
// Lines 231-350: Went well + Even better if dynamic arrays
interface ReflectionQuestionsProps {
  wentWell: string[];
  evenBetterIf: string[];
  onUpdateWentWell: (items: string[]) => void;
  onUpdateEvenBetterIf: (items: string[]) => void;
}
```

**2. DailyAnalysisForm.tsx** (~80 lines)
```typescript
// Lines 351-430: Analysis, action items, key learnings textareas
interface DailyAnalysisFormProps {
  dailyAnalysis: string;
  actionItems: string;
  keyLearnings: string;
  onChange: (field: string, value: string) => void;
}
```

**3. TomorrowPlanner.tsx** (~60 lines)
```typescript
// Lines 401-460: Tomorrow focus input
interface TomorrowPlannerProps {
  tomorrowFocus: string;
  onChange: (value: string) => void;
}
```

**4. BedTimeTracker.tsx** (~50 lines)
```typescript
// Lines 451-475 + bed time state: Bed time with "Use Now" button
// (Similar pattern to WakeUpTimeTracker!)
interface BedTimeTrackerProps {
  time: string;
  onChange: (time: string) => void;
  getCurrentTime: () => string;
}
```

**5. OverallRating.tsx** (~40 lines)
```typescript
// Rating 1-10 selector
interface OverallRatingProps {
  rating: number | undefined;
  onChange: (rating: number) => void;
}
```

#### Hooks to Extract:

**6. useCheckoutProgress.ts** (~50 lines)
```typescript
// Lines 124-180: Progress calculation logic
export const useCheckoutProgress = (checkoutData) => {
  return progressPercentage;
};
```

**7. useCheckoutPersistence.ts** (~60 lines)
```typescript
// Lines 80-140: Load/save logic with debouncing
export const useCheckoutPersistence = (selectedDate) => {
  // Returns: data, save, loading, saving
};
```

**Final Checkout Structure**:
```
checkout/
├── NightlyCheckoutSection.tsx (main - ~200 lines)
├── components/
│   ├── ReflectionQuestions.tsx (120 lines)
│   ├── DailyAnalysisForm.tsx (80 lines)
│   ├── TomorrowPlanner.tsx (60 lines)
│   ├── BedTimeTracker.tsx (50 lines)
│   └── OverallRating.tsx (40 lines)
├── hooks/
│   ├── useCheckoutProgress.ts (50 lines)
│   └── useCheckoutPersistence.ts (60 lines)
└── utils/ (if needed)
```

**Reduction**: 475 → 200 main file (-275 lines extracted)

---

## 💪 SECTION 3: HOME WORKOUT (308 lines) - MEDIUM PRIORITY

### Current Structure Analysis:
```
Lines 1-40:    Imports, interfaces, helper function (getQuickReps)
Lines 41-120:  State, useEffect (load workout items from Supabase)
Lines 121-180: Event handlers (toggle, update field)
Lines 181-240: Progress calculation
Lines 241-308: Workout items rendering (checkboxes, target, logged, quick buttons)
```

### Extraction Plan (308 → ~150 lines):

#### Components to Extract:

**1. WorkoutItemCard.tsx** (~100 lines)
```typescript
// Lines 241-308: Single workout item with all controls
interface WorkoutItemCardProps {
  item: WorkoutItem;
  onToggle: () => void;
  onUpdateTarget: (value: string) => void;
  onUpdateLogged: (value: string) => void;
  quickReps: number[];
}
```

**2. QuickRepButtons.tsx** (~40 lines)
```typescript
// Quick rep selector buttons (+5, +10, +20, etc.)
interface QuickRepButtonsProps {
  reps: number[];
  onSelect: (rep: number) => void;
}
```

#### Utils to Extract:

**3. workoutHelpers.ts** (~30 lines)
```typescript
// Line 26-37: getQuickReps function
export const getQuickReps = (exerciseName: string) => number[];
export const calculateWorkoutProgress = (items: WorkoutItem[]) => number;
```

**Final HomeWorkout Structure**:
```
wellness/home-workout/
├── HomeWorkoutSection.tsx (main - ~150 lines)
├── components/
│   ├── WorkoutItemCard.tsx (100 lines)
│   └── QuickRepButtons.tsx (40 lines)
└── utils/
    └── workoutHelpers.ts (30 lines)
```

**Reduction**: 308 → 150 main file (-158 lines extracted)

---

## 💖 SECTION 4: HEALTH NON-NEGOTIABLES (238 lines) - MEDIUM PRIORITY

### Current Structure Analysis:
```
Lines 1-80:    Imports, state management, save logic with debouncing
Lines 81-140:  Meal inputs (breakfast, lunch, dinner, snacks)
Lines 141-238: Macro trackers (calories, protein, carbs, fats) with +/- buttons
```

### Extraction Plan (238 → ~100 lines):

#### Components to Extract:

**1. MealInput.tsx** (~40 lines)
```typescript
// Lines 102-136: Single meal textarea (repeated 4 times)
interface MealInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}
```

**2. MacroTracker.tsx** (~80 lines)
```typescript
// Lines 143-238: Macro item with +/- buttons (repeated 4 times)
// Similar to WaterTracker pattern!
interface MacroTrackerProps {
  label: string;
  value: number;
  unit: string;
  steps: number[]; // [10, 25, 50]
  onChange: (value: number) => void;
}
```

**Final Health Structure**:
```
wellness/health-non-negotiables/
├── HealthNonNegotiablesSection.tsx (main - ~100 lines)
├── components/
│   ├── MealInput.tsx (40 lines)
│   └── MacroTracker.tsx (80 lines)
└── hooks/
    └── useNutritionPersistence.ts (60 lines - extract save logic)
```

**Reduction**: 238 → 100 main file (-138 lines extracted)

---

## 📋 EXTRACTION PRIORITY ORDER

### Phase 1: Timebox (1-2 hours) - HIGHEST IMPACT
- **Why first**: Largest file (1,008 lines)
- **Complexity**: High - needs 6 extractions
- **Benefit**: 1,008 → 300 lines (-708 lines!)

### Phase 2: Checkout (45 min) - HIGH IMPACT
- **Why second**: Large file (475 lines)
- **Complexity**: Medium - needs 7 extractions
- **Benefit**: 475 → 200 lines (-275 lines!)
- **Pattern**: Similar to morning routine (trackers, forms)

### Phase 3: Home Workout (30 min) - QUICK WIN
- **Why third**: Medium file (308 lines)
- **Complexity**: Low - needs 3 extractions
- **Benefit**: 308 → 150 lines (-158 lines!)
- **Pattern**: Like water/pushup trackers (simple +/- buttons)

### Phase 4: Health Non-Negotiables (30 min) - QUICK WIN
- **Why last**: Smallest complexity
- **Complexity**: Low - needs 3 extractions
- **Benefit**: 238 → 100 lines (-138 lines!)
- **Pattern**: MealInput (textarea) + MacroTracker (+/- buttons)

---

## 📊 TOTAL EXTRACTION IMPACT

**Before**:
```
Total: 2,029 lines across 4 files
Average: 507 lines per section
```

**After**:
```
Main files: ~750 lines total (avg 187 per section)
Extracted: ~1,279 lines into 19 focused components

Total reduction: 1,279 lines extracted from main files
AI clarity: 19 new focused components (40-200 lines each)
```

---

## 🎯 RECOMMENDED EXECUTION ORDER

### Option A: Do Timebox Now (Biggest Impact)
- 1-2 hours
- 1,008 → 300 lines
- Most complex, get it done

### Option B: Do Quick Wins First (Build Momentum)
- 1 hour total (Health + Home Workout)
- Build confidence with simple extractions
- Then tackle timebox

### Option C: Do Checkout First (Proven Pattern)
- 45 min
- Similar to morning routine (trackers, forms)
- Proves pattern for reflection components

---

## 🚀 DETAILED EXTRACTION GUIDES

### Timebox Extraction (Full Plan):

**Step 1**: Extract CategoryMapper
```typescript
// Create: timebox/utils/categoryMapper.ts
export const mapCategoryToUI = ...
export const mapUIToCategory = ...
export const getCategoryStyles = ...
```

**Step 2**: Extract TimeBlockCard
```typescript
// Create: timebox/components/TimeBlockCard.tsx
// Extract lines 701-850 (individual block rendering)
```

**Step 3**: Extract TimeBlockGrid
```typescript
// Create: timebox/components/TimeBlockGrid.tsx
// Extract lines 501-700 (24-hour grid)
```

**Step 4**: Extract TimeBlockModals
```typescript
// Create: timebox/components/TimeBlockModals.tsx
// Extract lines 901-1008 (modal management)
```

**Step 5**: Extract useTimeBlockManagement hook
```typescript
// Create: timebox/hooks/useTimeBlockManagement.ts
// Extract state and handlers (lines 151-300)
```

**Step 6**: Extract time calculations
```typescript
// Create: timebox/utils/timeCalculations.ts
// Extract time parsing, formatting, duration logic
```

**Result**: TimeboxSection.tsx goes from 1,008 → ~300 lines

---

### Checkout Extraction (Proven Pattern):

**Step 1**: Extract ReflectionQuestions
```typescript
// Similar to morning routine extractions
// Lines 231-350: Went well + Even better if arrays
```

**Step 2**: Extract DailyAnalysisForm
```typescript
// Lines 351-430: Textareas for analysis, actions, learnings
```

**Step 3**: Extract TomorrowPlanner
```typescript
// Lines 401-460: Tomorrow focus input
```

**Step 4**: Extract BedTimeTracker
```typescript
// Like WakeUpTimeTracker from morning routine
// Bed time + "Use Now" button
```

**Step 5**: Extract OverallRating
```typescript
// 1-10 rating selector
```

**Step 6**: Extract useCheckoutProgress hook
```typescript
// Progress calculation (lines 124-180)
```

**Step 7**: Extract useCheckoutPersistence hook
```typescript
// Load/save with debouncing (lines 80-120)
```

**Result**: NightlyCheckoutSection.tsx goes from 475 → ~200 lines

---

### HomeWorkout Extraction (Quick Win):

**Step 1**: Extract WorkoutItemCard
```typescript
// Lines 241-308: Workout item with checkbox, target, logged, quick buttons
```

**Step 2**: Extract QuickRepButtons
```typescript
// Quick rep selector (+5, +10, +20)
```

**Step 3**: Extract workoutHelpers util
```typescript
// getQuickReps function
// Progress calculation
```

**Result**: HomeWorkoutSection.tsx goes from 308 → ~150 lines

---

### Health Non-Negotiables Extraction (Quick Win):

**Step 1**: Extract MealInput
```typescript
// Meal textarea (repeated 4 times for breakfast/lunch/dinner/snacks)
```

**Step 2**: Extract MacroTracker
```typescript
// Macro with +/- buttons (repeated 4 times for calories/protein/carbs/fats)
// EXACTLY like WaterTracker pattern!
```

**Step 3**: Extract useNutritionPersistence hook
```typescript
// Debounced save logic (lines 44-78)
```

**Result**: HealthNonNegotiablesSection.tsx goes from 238 → ~100 lines

---

## ✅ FINAL OUTCOME

**All Daily Sections After Extraction**:
```
morning-routine/      658 lines + 6 components ✅
light-work/           118 lines + 17 files ✅
deep-work/            109 lines + 23 files ✅
home-workout/         ~150 lines + 3 components 🔨
health-non-negotiables/ ~100 lines + 3 components 🔨
timebox/              ~300 lines + 6 components 🔨
checkout/             ~200 lines + 7 components 🔨
```

**All main files under 300 lines** ✅
**19 new focused components** ✅
**AI can find anything instantly** ✅

---

## 🚀 RECOMMENDATION

**Start with Timebox** (biggest impact):
- 1,008 → 300 lines
- Gets the hardest one done
- Proven extraction pattern from morning routine

**Then**:
- Checkout (475 → 200)
- Home Workout (308 → 150)
- Health (238 → 100)

**Total time**: 3-4 hours for all extractions

---

**Ready to extract Timebox first?** (1-2 hours, biggest payoff)

Or prefer quick wins (Health + Home Workout) to build momentum?
