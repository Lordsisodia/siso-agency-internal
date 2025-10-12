# Morning Routine - Domain Folder

**Restructure Date**: 2025-10-12
**Branch**: feature/morning-routine-domain-structure

---

## 📁 Structure

```
morning-routine/
├── MorningRoutineSection.tsx  (Main component - 658 lines)
├── components/
│   ├── WaterTracker.tsx        (Water intake tracking)
│   ├── PushUpTracker.tsx       (Push-up reps + PB tracking)
│   ├── MeditationTracker.tsx   (Meditation duration)
│   ├── WakeUpTimeTracker.tsx   (Wake-up time + picker)
│   ├── PlanDayActions.tsx      (AI Thought Dump + completion)
│   └── MotivationalQuotes.tsx  (Daily mindset quotes)
├── hooks/
│   └── (future custom hooks)
├── types.ts                    (TypeScript interfaces)
├── config.ts                   (Task defaults and constants)
└── utils.ts                    (Progress calculation utils)
```

---

## ✅ Why This Structure?

### Before Restructure
- **1 file**: 789 lines (everything in one place)
- **AI confusion**: Editing "water tracker" meant scanning 789 lines
- **Hard to maintain**: All logic mixed together

### After Restructure
- **Main file**: 658 lines (orchestrator only)
- **5 sub-components**: 54-80 lines each (focused)
- **AI clarity**: "Edit water tracker" → finds exact component
- **Easy maintenance**: Each concern separated

---

## 🎯 Component Responsibilities

### Main: MorningRoutineSection.tsx
- Overall layout and card structure
- Task iteration and rendering
- State management (hooks morning routine data)
- Progress calculation
- Coordinates sub-components

### WaterTracker.tsx
- Water amount display
- +/- 100ml increment buttons
- Visual UI with center alignment
- Props: value, onIncrement, onDecrement

### PushUpTracker.tsx
- Rep counter with +1, +5, -1 buttons
- Personal Best (PB) display
- Auto-update PB when beaten
- New PB celebration animation
- Props: reps, personalBest, onUpdateReps

### MeditationTracker.tsx
- Duration display in minutes
- -1, +1, +5 minute buttons
- Center-aligned UI
- Props: duration, onChange

### WakeUpTimeTracker.tsx
- Wake-up time display
- TimeScrollPicker integration
- "Use Now" quick button
- Edit mode handling
- Props: time, onTimeChange, onOpenPicker, onUseNow, getCurrentTime

### PlanDayActions.tsx
- AI Thought Dump launch button
- Manual "Mark Complete" button
- Conditional rendering based on completion
- Props: isComplete, onMarkComplete, onOpenThoughtDump

### MotivationalQuotes.tsx
- Displays rotating daily quotes
- Animation on mount
- Visual cards with author attribution
- Props: quotes

---

## 📦 Imports

```typescript
// From other files, import like this:
import { MorningRoutineSection } from '@/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection';

// Or with barrel export (if index.ts added):
import { MorningRoutineSection } from '@/ecosystem/internal/lifelock/views/daily/morning-routine';
```

---

## 🔧 Extending This Pattern

### Adding a New Sub-Component

1. Create file in `components/`
2. Define props interface
3. Extract logic from main file
4. Import in MorningRoutineSection.tsx
5. Use component with props

### Adding a Custom Hook

1. Create file in `hooks/`
2. Extract state/effect logic
3. Import in MorningRoutineSection.tsx
4. Use hook in component

---

## 🚀 Benefits Achieved

✅ **AI Clarity**: Each component has a clear, findable file
✅ **Maintainability**: Focused components (50-80 lines vs 789)
✅ **Testability**: Can test components in isolation
✅ **Reusability**: Components can be reused if needed
✅ **Scalability**: Pattern proven for weekly/monthly/yearly views
✅ **Organization**: Domain-based folder structure

---

## 📝 Migration History

**Original Structure**:
```
sections/MorningRoutineSection.tsx (789 lines)
types/morning-routine.types.ts
utils/morning-routine-progress.ts
morning-routine-defaults.ts
```

**New Structure**:
```
views/daily/morning-routine/
├── MorningRoutineSection.tsx (658 lines)
├── components/ (6 files)
├── types.ts
├── utils.ts
└── config.ts
```

**Reduction**: 789 → 658 lines in main file (131 lines extracted)

**Archived**: `archive/old-morning-routine-structure-2025-10-12/`

---

## ✅ Ready for Replication

This pattern is now proven and ready to apply to:
- Weekly view pages (5 pages)
- Monthly view pages (5 pages)
- Yearly view pages (5 pages)
- Life view pages (7 pages)

**Next**: Build weekly view using same structure.
