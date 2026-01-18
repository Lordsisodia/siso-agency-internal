# Daily Sections Migration Plan
**Date**: 2025-10-12
**Status**: Morning Routine Complete ✅

---

## 📊 SECTION COMPLEXITY ANALYSIS

| Section | Lines | Complexity | Extraction Needed | Priority |
|---------|-------|------------|-------------------|----------|
| ✅ Morning Routine | 789 → 658 | High | YES (5 components) | ✅ DONE |
| Light Work | 118 | Low | NO (wrapper only) | 1 |
| Deep Work | 109 | Low | NO (wrapper only) | 1 |
| Home Workout | 308 | Medium | MAYBE (workout items) | 2 |
| Health Non-Negotiables | 238 | Medium | MAYBE (nutrition) | 2 |
| Timebox | 1,008 | **VERY HIGH** | **YES** (needs major extraction) | 3 |
| Checkout | 475 | High | YES (reflection forms) | 3 |

---

## ✅ GOOD NEWS: No Relative Import Issues!

**All remaining sections use absolute imports (@/) exclusively**

This means migration is MUCH simpler than morning routine:
- ✅ No import path fixes needed
- ✅ Just copy → move → done
- ✅ Much faster process

---

## 🎯 MIGRATION STRATEGY (By Complexity)

### TIER 1: Simple Wrappers (10 min total)
**Just move, no extraction needed**

#### Light-Work Section (118 lines)
```
views/daily/light-work/
└── LightFocusWorkSection.tsx (just wrapper around UnifiedWorkSection)
```

**Migration**:
1. Create folder
2. Copy file
3. Update import in admin-lifelock-tabs.ts
4. Archive old
5. Done

**No extraction needed** - it's already a simple wrapper

---

#### Deep-Work Section (109 lines)
```
views/daily/deep-work/
└── DeepFocusWorkSection.tsx (just wrapper around UnifiedWorkSection)
```

**Migration**: Same as light-work (5 minutes)

---

### TIER 2: Medium Complexity (30 min each)
**May need minimal extraction**

#### Home Workout Section (308 lines)

**Current Structure**:
- Workout items list
- Rep tracking UI
- Quick rep buttons (+5, +10, +20)
- Completion checkboxes

**Extraction Candidates**:
```
views/daily/wellness/home-workout/
├── HomeWorkoutSection.tsx (main - 200 lines)
├── components/
│   ├── WorkoutItemCard.tsx (workout item with reps)
│   └── QuickRepButtons.tsx (quick rep selector)
├── types.ts
└── config.ts (default exercises)
```

**OR**: Keep as single file (308 lines is manageable)

---

#### Health Non-Negotiables Section (238 lines)

**Current Structure**:
- Nutrition tracking
- Meal logging
- Macro calculations

**Extraction Candidates**:
```
views/daily/wellness/health-non-negotiables/
├── HealthNonNegotiablesSection.tsx (main)
├── components/
│   ├── MealTracker.tsx
│   └── MacroDisplay.tsx
├── types.ts
└── utils.ts (macro calculations)
```

**OR**: Keep as single file (238 lines is manageable)

---

### TIER 3: Complex (Need Extraction)

#### Timebox Section (1,008 lines!) 🔥

**WHY SO BIG**:
- Time block creation/editing
- QuickTaskScheduler integration
- Category mapping logic
- Hour-by-hour grid rendering
- Drag and drop
- Modal management

**MUST EXTRACT** - Too large for maintainability

**Recommended Extraction**:
```
views/daily/timebox/
├── TimeboxSection.tsx (main - 300 lines orchestrator)
├── components/
│   ├── TimeBlockGrid.tsx (hour grid - 200 lines)
│   ├── TimeBlockCard.tsx (individual block - 100 lines)
│   ├── TimeBlockFormModal.tsx (might already exist, import it)
│   ├── QuickTaskScheduler.tsx (might already exist)
│   └── CategoryMapper.tsx (mapping logic - 80 lines)
├── hooks/
│   └── useTimeBlockLogic.ts (complex state - 150 lines)
├── types.ts (TimeBlock interfaces)
├── config.ts (category mappings)
└── utils.ts (time calculations)
```

**Estimated effort**: 1-2 hours

---

#### Checkout Section (475 lines)

**COMPLEXITY**:
- Reflection questions (multiple fields)
- Progress calculation
- Auto-save with debouncing
- Bed time tracking
- Rating system
- Multiple text areas

**Recommended Extraction**:
```
views/daily/checkout/
├── CheckoutSection.tsx (main - 200 lines)
├── components/
│   ├── ReflectionQuestions.tsx (went well, better if - 100 lines)
│   ├── DailyAnalysis.tsx (analysis textarea - 60 lines)
│   ├── TomorrowPlanner.tsx (tomorrow focus - 60 lines)
│   └── BedTimeTracker.tsx (time tracking - 50 lines)
├── hooks/
│   └── useCheckoutProgress.ts (progress calculation)
├── types.ts
└── config.ts (questions config)
```

**Estimated effort**: 45 min

---

## 🏗️ RECOMMENDED MIGRATION ORDER

### Session 1: Easy Wins (20 min)
```
1. Light-Work (5 min)
2. Deep-Work (5 min)
3. Test both (10 min)
```

**Why first**: Build confidence, prove pattern works for simple sections

---

### Session 2: Wellness Sections (45 min)
```
1. Create views/daily/wellness/ parent folder
2. Home Workout (20 min - keep as single file OR extract)
3. Health Non-Negotiables (20 min - keep as single file OR extract)
4. Test wellness tab (5 min)
```

**Why second**: Medium complexity, can decide extraction on the fly

---

### Session 3: Timebox (1-2 hours)
```
1. Analyze current structure deeply
2. Extract TimeBlockGrid component
3. Extract time block logic hooks
4. Test thoroughly (this is complex!)
```

**Why third**: Most complex, needs careful extraction

---

### Session 4: Checkout (45 min)
```
1. Extract reflection components
2. Extract progress logic
3. Test checkout flow
```

**Why last**: Complex but follows proven pattern from morning routine

---

## 🎯 TIER 1 MIGRATION SCRIPT (Light + Deep Work)

Since these are simple wrappers, I can migrate both in ONE go:

### Commands:
```bash
# Create folders
mkdir -p views/daily/{light-work,deep-work}

# Copy files
cp sections/LightFocusWorkSection.tsx views/daily/light-work/
cp sections/DeepFocusWorkSection.tsx views/daily/deep-work/

# Update imports in admin-lifelock-tabs.ts
# (Change 2 import lines)

# Archive old files
git mv sections/LightFocusWorkSection.tsx archive/old-sections/
git mv sections/DeepFocusWorkSection.tsx archive/old-sections/

# Test
# Commit
```

**Time**: 10 minutes
**Risk**: Very low (no extraction, all imports already absolute)

---

## 💡 RECOMMENDATIONS

### Option A: Migrate Tier 1 Now (10 min)
- Light-work + Deep-work sections
- Simple, low risk
- Builds momentum
- ✅ **I recommend this**

### Option B: Plan Documentation First (20 min)
- Design docs/ structure for all views
- Create templates
- Then migrate Tier 1

### Option C: Migrate All At Once (3-4 hours)
- Do all 6 sections today
- Higher risk
- Longer session

---

## 📁 WELLNESS FOLDER STRUCTURE DECISION

Since wellness has 2 sections, we need to decide:

### Option A: Separate Folders
```
views/daily/
├── wellness-workout/
│   └── HomeWorkoutSection.tsx
└── wellness-health/
    └── HealthNonNegotiablesSection.tsx
```

### Option B: Single Wellness Folder
```
views/daily/wellness/
├── home-workout/
│   └── HomeWorkoutSection.tsx
└── health-non-negotiables/
    └── HealthNonNegotiablesSection.tsx
```

### Option C: Flat in Wellness
```
views/daily/wellness/
├── HomeWorkoutSection.tsx
└── HealthNonNegotiablesSection.tsx
```

**I recommend Option B**: Single wellness parent folder with sub-folders for each section

---

## 🚀 READY TO EXECUTE

**What do you want to do?**

**A)** Migrate light-work + deep-work now (10 min, easy wins)
**B)** Design documentation structure first
**C)** Something else?

All sections analyzed. All imports verified. Pattern proven. Ready to continue! 🎯
