# Morning Routine Code Structure

## 📁 Directory Layout

```
src/domains/lifelock/1-daily/1-morning-routine/
├── ui/                                    # UI Components & Pages
│   ├── pages/                            # Main page components
│   │   └── MorningRoutineSection.tsx     # ✨ MAIN PAGE - Entry point
│   │                                      # ~1200 lines - Contains all tasks, state, logic
│   │
│   └── components/                        # Reusable UI components
│       ├── WakeUpTimeTracker.tsx         # Wake-up time picker with XP multipliers
│       ├── MeditationTracker.tsx         # Meditation duration tracker
│       ├── MeditationTimer.tsx           # Countdown timer for meditation
│       ├── WaterTracker.tsx              # Water intake counter (500ml glasses)
│       ├── PushUpTracker.tsx             # Push-up rep counter with PB tracking
│       ├── PlanDayActions.tsx            # Plan day completion & AI thought dump trigger
│       ├── MotivationalQuotes.tsx        # Rotating daily quotes display
│       ├── TimeScrollPicker.tsx          # Custom time picker modal (scroll wheels)
│       ├── XPPill.tsx                    # XP badge/pill display component
│       ├── XPFooterSummary.tsx           # Total XP summary at page bottom
│       └── MorningMindsetCard.tsx        # Tabbed card (Coding/Flow/Quotes)
│
├── domain/                               # Business Logic & Calculations
│   ├── xpCalculations.ts                 # XP calculation functions for all tasks
│   ├── morningRoutineXpUtils.ts          # XP utilities (multipliers, timestamps)
│   ├── types.ts                          # TypeScript interfaces
│   ├── config.ts                         # Configuration constants
│   └── utils.ts                          # Utility functions
│
├── features/                             # Complex features
│   └── ai-thought-dump/                  # AI-powered task planning feature
│       ├── components/
│       │   ├── SimpleThoughtDumpPage.tsx # Chat interface for AI planning
│       │   └── ThoughtDumpResults.tsx    # Results display after AI planning
│       ├── services/
│       │   ├── ai/                       # AI service implementations
│       │   └── tools/                    # Tool definitions for AI
│       ├── config/
│       │   ├── prompts.ts                # AI prompt templates
│       │   └── constants.ts              # Feature constants
│       └── types/                        # Feature-specific types
│
├── hooks/                                # Custom React hooks
├── application/                          # Application layer (use cases)
├── infrastructure/                       # External integrations
└── docs/                                 # Documentation
```

---

## 🎯 Main Page: MorningRoutineSection.tsx

**Location:** `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`

### Task Configuration (Lines 133-191)

The page defines **6 main tasks** in the `MORNING_ROUTINE_TASKS` array:

```typescript
const MORNING_ROUTINE_TASKS = [
  {
    key: 'wakeUp',
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity.',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'freshenUp',
    title: 'Freshen Up',
    description: 'Cold shower to wake up - Personal hygiene.',
    icon: Droplets,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bathroom', title: 'Bathroom break' },
      { key: 'brushTeeth', title: 'Brush teeth' },
      { key: 'coldShower', title: 'Cold shower' }
    ]
  },
  {
    key: 'getBloodFlowing',
    title: 'Get Blood Flowing',
    description: 'Max rep push-ups (Target PB: 30)',
    icon: Dumbbell,
    subtasks: [
      { key: 'pushups', title: 'Push-ups (PB 30)' }
    ]
  },
  {
    key: 'powerUpBrain',
    title: 'Power Up Brain',
    description: 'Hydrate and fuel the body and mind.',
    icon: Brain,
    subtasks: [
      { key: 'supplements', title: 'Supplements' },
      { key: 'water', title: 'Water (500ml)' }
    ]
  },
  {
    key: 'planDay',
    title: 'Plan Day',
    description: 'Use AI Thought Dump to organize tasks.',
    icon: CalendarIcon,
    hasTimeTracking: false,
    subtasks: []
  },
  {
    key: 'meditation',
    title: 'Meditation',
    description: 'Meditate to set an innovative mindset.',
    icon: Heart,
    hasTimeTracking: true,
    subtasks: []
  }
]
```

### Component Structure (Lines 920-1100)

```tsx
{MORNING_ROUTINE_TASKS.map((task) => {
  const taskComplete = isTaskComplete(task.key, task.subtasks);

  return (
    <Card key={task.key}>
      {/* Task Header */}
      <div className="flex items-center justify-between">
        <Icon />
        <Title />
        <XPPill xp={...} earned={taskComplete} />
      </div>

      {/* Progress Bar */}
      <ProgressBar percent={...} />

      {/* Description */}
      <Description />

      {/* Time Tracking (if applicable) */}
      {task.hasTimeTracking && task.key === 'wakeUp' && <WakeUpTimeTracker />}
      {task.hasTimeTracking && task.key === 'meditation' && <MeditationTracker />}

      {/* Subtasks */}
      {task.subtasks.map(subtask => (
        <CheckboxSubtask />
      ))}

      {/* Special Subtask UI */}
      {subtask.key === 'pushups' && <PushUpTracker />}
      {subtask.key === 'water' && <WaterTracker />}

      {/* Plan Day Actions */}
      {task.key === 'planDay' && <PlanDayActions />}

      {/* Completion Bar */}
      {taskComplete && <CompletionBar />}
    </Card>
  );
})}
```

---

## 🧮 XP Calculations

**Location:** `src/domains/lifelock/1-daily/1-morning-routine/domain/xpCalculations.ts`

### Wake-Up XP (Lines 11-50)

```typescript
export function calculateWakeUpXP(wakeUpTime: string, date: Date): number {
  // Base: 100 XP × time multiplier × weekend bonus

  let multiplier = 1.0;
  if (mins <= 360) multiplier = 2.0;        // ≤ 6:00 AM
  else if (mins <= 420) multiplier = 2.0;   // ≤ 7:00 AM
  else if (mins <= 480) multiplier = 1.5;   // ≤ 8:00 AM
  else if (mins <= 540) multiplier = 1.2;   // ≤ 9:00 AM
  else if (mins <= 600) multiplier = 0.75;  // ≤ 10:00 AM
  // ... continues with decreasing multipliers

  // Weekend bonus: +20% on Sat/Sun before 8 AM
  const weekendBonus = isWeekend && isBefore8AM ? 1.2 : 1.0;

  return Math.round(100 * multiplier * weekendBonus);
}
```

### Other Task XP Functions

```typescript
calculateFreshenUpXP()       // Bathroom, teeth, shower
calculateGetBloodFlowingXP() // Push-ups
calculatePowerUpBrainXP()   // Supplements, water
calculatePlanDayXP()        // AI planning completion
calculateMeditationXP()     // Based on duration
calculatePrioritiesXP()     // Top 3 priorities
calculateTotalMorningXP()   // Sum of all above
```

---

## 🎨 UI Components

### WakeUpTimeTracker.tsx
- **Purpose:** Track wake-up time with gamification
- **Features:**
  - XP multiplier badge (3x, 2x, 1.5x, 1x)
  - Quick time presets (6:00, 6:30, 7:00, 7:30)
  - Weekly pattern bar chart (7-day history)
  - Streak counter
  - Celebration animation for 3x XP

### MeditationTracker.tsx
- **Purpose:** Track meditation duration
- **Features:**
  - Duration selector (5, 10, 15, 20, 30 min)
  - XP calculation based on time
  - Completion status

### WaterTracker.tsx
- **Purpose:** Track water intake
- **Features:**
  - Increment/decrement 500ml glasses
  - Visual glass icons
  - Total amount display

### PushUpTracker.tsx
- **Purpose:** Track push-up reps
- **Features:**
  - Rep counter
  - Personal best display
  - XP calculation

### TimeScrollPicker.tsx
- **Purpose:** Custom time picker modal
- **Features:**
  - Scroll wheel for hours
  - Scroll wheel for minutes
  - AM/PM toggle

### XPPill.tsx
- **Purpose:** Display XP badges
- **Features:**
  - Color-coded tiers (gray, green, blue, orange)
  - Glow animation when earned
  - Emoji indicators (🌟, ✨, ⚡, ⭐, 💎)

### XPFooterSummary.tsx
- **Purpose:** Display total XP at page bottom
- **Features:**
  - Breakdown by task
  - Total XP display
  - Visual progress indicator

---

## 🤖 AI Thought Dump Feature

**Location:** `src/domains/lifelock/1-daily/1-morning-routine/features/ai-thought-dump/`

### Components

**SimpleThoughtDumpPage.tsx**
- Chat interface for AI-powered task planning
- Voice input support
- Real-time AI responses

**ThoughtDumpResults.tsx**
- Display AI-generated task plan
- Option to add tasks to schedule

### Services

**AI Service:** `services/ai/taskProcessor.service.ts`
- Processes user thoughts
- Generates structured task list
- Integrates with GPT-4

**Tools:** `services/tools/`
- `taskQueryTools.ts` - Query existing tasks
- `taskUpdateTools.ts` - Update/create tasks
- `toolExecutor.ts` - Execute tool calls

---

## 📊 State Management

### Main State (MorningRoutineSection.tsx)

```typescript
// Wake-up state
const [wakeUpTime, setWakeUpTime] = useState('');

// Task completion state (from Supabase)
const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);

// Special trackers
const [waterAmount, setWaterAmount] = useState(0);
const [pushupReps, setPushupReps] = useState(0);
const [pushupPB, setPushupPB] = useState(30);
const [meditationDuration, setMeditationDuration] = useState(10);

// Plan day state
const [isPlanDayComplete, setIsPlanDayComplete] = useState(false);

// Priorities state
const [dailyPriorities, setDailyPriorities] = useState(['', '', '']);

// UI state
const [activeMindsetTab, setActiveMindsetTab] = useState('coding');
const [showTimeScrollPicker, setShowTimeScrollPicker] = useState(false);
const [showThoughtDumpChat, setShowThoughtDumpChat] = useState(false);
```

---

## 🎨 Styling

### Theme Colors (Orange)
- Background: `bg-orange-900/20`
- Border: `border-orange-700/40`
- Text: `text-orange-400`, `text-orange-300`
- Accent: `bg-orange-600`

### Custom CSS (index.css)
```css
/* Orange Theme Custom Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(234, 88, 12, 0.1); }
::-webkit-scrollbar-thumb { background: rgba(234, 88, 12, 0.4); }

/* Morning Card Hover Effect */
.morning-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.morning-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.15);
}

/* Progress Glow Animation */
@keyframes progress-glow { ... }
.progress-complete { animation: progress-glow 2s infinite; }

/* XP Pill Pulse Animation */
@keyframes xp-pulse { ... }
.xp-earned { animation: xp-pulse 0.5s ease-out; }
```

---

## 🔄 Data Flow

```
User Action
    ↓
State Update (useState)
    ↓
XP Calculation (calculateTotalMorningXP)
    ↓
UI Re-render
    ↓
Supabase Sync (useMorningRoutineSupabase)
```

---

## 📝 Key Functions

### Task Completion Check (Lines 616-633)

```typescript
const isTaskComplete = useCallback((taskKey: string, subtasks: any[]): boolean => {
  switch (taskKey) {
    case 'wakeUp':
      return wakeUpTime !== '';
    case 'freshenUp':
      return subtasks.every(st => isHabitCompleted(st.key));
    case 'getBloodFlowing':
      return pushupReps > 0;
    case 'powerUpBrain':
      return waterAmount >= 500; // At least 1 glass
    case 'planDay':
      return isPlanDayComplete;
    case 'meditation':
      return meditationDuration > 0;
    default:
      return false;
  }
}, [wakeUpTime, pushupReps, waterAmount, isPlanDayComplete, meditationDuration]);
```

### XP Calculation (Lines 654-680)

```typescript
const todayXP = useMemo(() => {
  return calculateTotalMorningXP({
    wakeUpTime,
    date: selectedDate,
    habitsCompleted,
    pushupReps,
    waterAmount,
    meditationDuration,
    isPlanDayComplete,
    dailyPriorities
  });
}, [wakeUpTime, selectedDate, habitsCompleted, pushupReps, waterAmount, meditationDuration, isPlanDayComplete, dailyPriorities]);
```

---

## 🚀 Entry Points

1. **Main Page:** `MorningRoutineSection.tsx` (lines 193-end)
2. **XP System:** `domain/xpCalculations.ts`
3. **Data Layer:** `useMorningRoutineSupabase` hook
4. **Routing:** Integrated into main app at `/lifelock/daily`

---

## 📦 Dependencies

```typescript
// UI
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Icons
import { Sun, Droplets, Dumbbell, Brain, Heart, Calendar } from 'lucide-react';

// Utils
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Domain
import { calculateTotalMorningXP } from '../../domain/xpCalculations';
import { useMorningRoutineSupabase } from '@/lib/hooks/useMorningRoutineSupabase';
```

---

## 🎯 Quick Navigation

| Want to find... | Go to... |
|----------------|----------|
| Add new task | `MorningRoutineSection.tsx:133` (MORNING_ROUTINE_TASKS) |
| Change XP values | `domain/xpCalculations.ts` |
| Modify task UI | `MorningRoutineSection.tsx:920` (task mapping) |
| Update component | `ui/components/[ComponentName].tsx` |
| Change colors | Global search: `text-orange-` or `bg-orange-` |
| Add animation | `index.css` or component `motion.` props |
| Database sync | `useMorningRoutineSupabase` hook |
| AI prompts | `features/ai-thought-dump/config/prompts.ts` |

---

## 📊 File Sizes (Approximate)

| File | Lines | Purpose |
|------|-------|---------|
| MorningRoutineSection.tsx | ~1200 | Main page, all tasks |
| WakeUpTimeTracker.tsx | ~330 | Wake-up UI |
| MeditationTracker.tsx | ~200 | Meditation UI |
| PlanDayActions.tsx | ~150 | Plan day UI |
| xpCalculations.ts | ~150 | XP logic |
| MorningMindsetCard.tsx | ~100 | Tabbed mindset card |
| XPPill.tsx | ~85 | XP badge |
| XPFooterSummary.tsx | ~80 | XP summary |
