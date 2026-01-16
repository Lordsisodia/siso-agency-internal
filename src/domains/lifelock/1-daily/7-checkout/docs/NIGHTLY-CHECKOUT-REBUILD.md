# Nightly Checkout Rebuild - Complete Plan

## Overview
Building a data-driven nightly checkout system that tracks core metrics, captures state data, and enables tomorrow's planning - all in under 15 minutes.

---

## Phase 1: Core Metrics Tracking (The 6 Pillars)

### ✅ Checkpoint: Define Data Models
- [ ] Create TypeScript interfaces for the 6 core metrics
- [ ] Set up Supabase table schema for nightly checkout data
- [ ] Create validation schemas for each metric type

### The 6 Core Metrics to Track:

1. **Meditation**
   - Minutes meditated
   - Quality rating (1-100)
   - Target: 30+ minutes daily

2. **Working Out**
   - Did you work out? (yes/no)
   - Workout type (strength, cardio, yoga, etc.)
   - Duration (minutes)
   - Intensity (light, moderate, intense)

3. **Calorie & Macros Intake**
   - Total calories
   - Protein (g)
   - Carbs (g)
   - Fats (g)
   - Hit calorie goal? (yes/no)

4. **Deep Work Hours**
   - Hours of deep work
   - Target: 8 hours daily
   - Quality rating (1-100)

5. **Research Hours**
   - Hours of research/learning
   - Target: 2 hours daily
   - Topic/research notes

6. **Sleep Data**
   - Hours slept
   - Bedtime
   - Wake time
   - Sleep quality (1-100)

---

## Phase 2: State Data Tracking

### ✅ Checkpoint: State Metrics
- [ ] Mood tracking (start of day → end of day)
- [ ] Energy level (1-10)
- [ ] Stress level (1-10)
- [ ] Overall day rating (1-10)

---

## Phase 3: Quick Reflection

### ✅ Checkpoint: Reflection Prompts
- [ ] What went well today? (bullet list)
- [ ] Even better if... (bullet list)
- [ ] Biggest time waste today
- [ ] One thing I learned

---

## Phase 4: Tomorrow Planning

### ✅ Checkpoint: Planning System
- [ ] One non-negotiable priority
- [ ] Top 3 tasks for tomorrow
- [ ] Tomorrow's focus/intention statement
- [ ] Show yesterday's focus for accountability

---

## Phase 5: UI Components to Build

### ✅ Checkpoint: Component Structure
- [ ] MetricsCard component (reusable for all 6 metrics)
- [ ] StateSnapshot component (mood, energy, stress)
- [ ] ReflectionInput component (bullet lists)
- [ ] TomorrowPlan component (priority + tasks)
- [ ] Progress indicator showing completion %

---

## Phase 6: Data Visualization (Future)

### ✅ Checkpoint: Dashboard Features
- [ ] Daily alignment score
- [ ] Weekly trend charts
- [ ] Pattern correlation insights
- [ ] Streak tracking
- [ ] Weekly summary reports

---

## Implementation Order

### Milestone 1: Data Foundation
- [ ] Update Supabase schema for new checkout structure
- [ ] Create type definitions
- [ ] Build data persistence layer
- [ ] Test data saving/loading

### Milestone 2: Core UI
- [ ] Build 6 metrics input cards
- [ ] Build state snapshot section
- [ ] Build reflection section
- [ ] Build tomorrow planning section
- [ ] Style everything consistently (purple theme)

### Milestone 3: Smart Features
- [ ] Show yesterday's data for comparison
- [ ] Calculate alignment score
- [ ] Progress tracking
- [ ] XP/gamification integration

### Milestone 4: Polish & Optimize
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Auto-save with debouncing
- [ ] Loading states
- [ ] Error handling

---

## Technical Specifications

### Data Structure

```typescript
interface NightlyCheckout {
  date: string;
  userId: string;

  // Core Metrics
  meditation: {
    minutes: number;
    quality: number; // 1-100
  };
  workout: {
    completed: boolean;
    type?: string;
    duration?: number;
    intensity?: 'light' | 'moderate' | 'intense';
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    hitGoal: boolean;
  };
  deepWork: {
    hours: number;
    quality: number; // 1-100
  };
  research: {
    hours: number;
    topic?: string;
    notes?: string;
  };
  sleep: {
    hours: number;
    bedTime: string;
    wakeTime: string;
    quality: number; // 1-100
  };

  // State Data
  moodStart: number; // 1-10
  moodEnd: number; // 1-10
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  overallRating: number; // 1-10

  // Reflection
  wentWell: string[];
  evenBetterIf: string[];
  biggestWaste: string;
  keyLearning: string;

  // Tomorrow
  nonNegotiable: string;
  topTasks: string[3];
  tomorrowFocus: string;
}
```

### UI Layout Structure

```
┌──────────────────────────────────────────┐
│  Nightly Checkout Header                 │
│  Progress bar, XP, streak                │
└──────────────────────────────────────────┘

┌─ Yesterday's Accountability ────────────┐
│  "Yesterday you said you'd focus on..." │
│  Did you follow through?                │
└──────────────────────────────────────────┘

┌─ Core Metrics (6 cards grid) ───────────┐
│  [Meditation] [Workout] [Nutrition]     │
│  [Deep Work] [Research] [Sleep]         │
└──────────────────────────────────────────┘

┌─ State Snapshot ───────────────────────┐
│  Mood: Start → End  |  Energy  | Stress │
└──────────────────────────────────────────┘

┌─ Quick Reflection ─────────────────────┐
│  What went well?                        │
│  Even better if...                      │
│  Biggest waste?                         │
│  Key learning?                          │
└──────────────────────────────────────────┘

┌─ Tomorrow's Plan ──────────────────────┐
│  🔥 Non-negotiable                      │
│  Top 3 Tasks                            │
│  Tomorrow's Focus                       │
└──────────────────────────────────────────┘
```

---

## Targets & Goals

### Daily Targets
- Meditation: 30+ minutes
- Deep Work: 8 hours
- Research: 2 hours
- Sleep: 7-9 hours
- Calories: 3,000 (with macro targets)

### Alignment Score Calculation
```
Score = (Meditation/30 × 20) +
        (DeepWork/8 × 20) +
        (Research/2 × 15) +
        (Workout × 15) +
        (NutritionGoal × 15) +
        (SleepQuality × 15)
```

Max score: 100/100

---

## Next Steps

1. ✅ Review this plan
2. ✅ Approve data structure
3. ✅ Approve UI layout
4. ⏳ Start implementation with Phase 1

---

## Notes

- Keep inputs fast and keyboard-friendly
- Auto-save everything
- Show progress clearly
- Make it feel rewarding, not like homework
- Mobile-first design
- Purple/dark theme consistent with app
