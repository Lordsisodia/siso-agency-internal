# LifeLock Timeline Pages Breakdown
*Created: 2025-10-10*

## 🎯 Goal
Figure out what **swipeable pages** make sense for each time period (Weekly/Monthly/Yearly/Life), using the same box components as the daily view.

## 📱 Navigation Structure

```
Top Level: Period Selector
├── Daily (existing)
│   └── Tabs: Morning | Work | Light Work | Timebox | Wellness | Checkout
│
├── Weekly (new)
│   └── Tabs: [TO PLAN]
│
├── Monthly (new)
│   └── Tabs: [TO PLAN]
│
├── Yearly (new)
│   └── Tabs: [TO PLAN]
│
└── Life (new)
    └── Tabs: [TO PLAN]
```

## 🎨 Box Component Style (Copy This!)

From `MorningRoutineSection.tsx`:
```tsx
// Outer wrapper
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-sm" />

  // Content card
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
    <CardHeader>
      <CardTitle>
        <Icon /> Title
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content here */}
    </CardContent>
  </div>
</section>
```

---

## 📅 WEEKLY VIEW - Pages Breakdown

**Context**: User wants to see their week at a glance and track weekly performance.

### Page 1: Week Overview ⭐ (Default)
**Purpose**: Quick snapshot of the entire week

**Content Boxes**:
1. **7-Day Summary Card** (existing `StatisticalWeekView` style)
   - 7 daily cards showing: date, grade, XP, completion %
   - Swipe left/right to navigate weeks
   - Tap day → go to daily view

2. **Week Stats Box** (use same style as morning routine box)
   - Total XP: 1,850 / 2,500
   - Average grade: B+
   - Days completed: 5/7
   - Completion: 74%

3. **Streaks Box**
   - Morning routine: 5 days ✅
   - Workouts: 3 days 💪
   - Deep work: 4 days 🧠

### Page 2: Tasks
**Purpose**: What tasks were completed this week

**Content Boxes**:
1. **Tasks Overview Box**
   - Total tasks completed: 42/55
   - By priority:
     - P1: 12/15 ✅
     - P2: 18/22 ⚠️
     - P3: 12/18 📋

2. **Deep Work Box**
   - Total deep work hours: 18.5
   - Average per day: 2.6 hrs
   - Best day: Thursday (4 hrs)
   - Sessions completed: 12

3. **Light Work Box**
   - Light tasks completed: 28/35
   - Quick wins: 15
   - Admin tasks: 13

### Page 3: Wellness
**Purpose**: Health and wellness tracking for the week

**Content Boxes**:
1. **Workouts Box**
   - Workouts completed: 4/7 days
   - Total time: 240 minutes
   - Types: Gym (2), Run (1), Home (1)
   - Calories burned: ~1,200

2. **Health Habits Box**
   - Morning routine: 6/7 ✅
   - Evening checkout: 5/7 ✅
   - Water intake: Avg 8 glasses
   - Sleep: Avg 7.2 hrs

3. **Wellness Score Box**
   - Overall score: 82/100
   - Physical: 85%
   - Mental: 78%
   - Energy levels: Good ⚡

### Page 4: Habits & Consistency
**Purpose**: Track daily habits and streaks

**Content Boxes**:
1. **Daily Habits Grid**
   - 7x5 grid showing habits across the week
   - Each row = habit (morning routine, workout, deep work, etc.)
   - Each column = day of week
   - Check marks for completed

2. **Longest Streaks Box**
   - Morning routine: 14 days 🔥
   - Workouts: 7 days 💪
   - Task completion: 5 days ✅
   - Deep work: 4 days 🧠

3. **This Week's Wins Box**
   - Achievements unlocked
   - Personal bests
   - Milestones reached

---

## 📆 MONTHLY VIEW - Pages Breakdown

**Context**: User wants to see trends and patterns over the month.

### Page 1: Calendar Grid ⭐ (Default)
**Purpose**: Visual overview of the entire month

**Content Boxes**:
1. **Month Calendar Box** (enhance existing `MonthlyProgressSection`)
   - 31-day grid with completion dots
   - Color-coded: green (excellent), yellow (good), orange (started)
   - Tap day → go to daily view
   - Today highlighted with border

2. **Month Summary Box**
   - Days completed (80%+): 18/31
   - Average grade: A-
   - Total XP: 12,450 / 15,000
   - Best week: Week 3 (95%)

3. **Weekly Breakdown Box**
   - 4-5 rows showing each week
   - Week 1: ████████░░ 80%
   - Week 2: ██████████ 95%
   - Week 3: ███████░░░ 75%
   - Week 4: ████████░░ 82%

### Page 2: Goals & Targets
**Purpose**: Track monthly goals progress

**Content Boxes**:
1. **Monthly Goals Box**
   - Goal 1: Complete 25 deep work sessions ████████░░ 20/25
   - Goal 2: 20 workouts ███████░░░ 16/20
   - Goal 3: 100% morning routine ████████░░ 22/25 days
   - Goal 4: Ship v2.0 ██████░░░░ 60%

2. **Targets Box**
   - XP Target: 15,000 (82% achieved)
   - Workout days: 20 (80% achieved)
   - Perfect days (A+): 10 (5 achieved)

3. **Progress vs Last Month Box**
   - XP: +15% ↗️
   - Average grade: Same (B+) →
   - Workouts: +3 days ↗️
   - Deep work: +8 hours ↗️

### Page 3: Trends & Insights
**Purpose**: Understand patterns and behaviors

**Content Boxes**:
1. **Performance Trends Box**
   - Line chart showing daily grades over month
   - Trend: Improving 📈 / Declining 📉 / Stable →
   - Best week: Week 2
   - Worst week: Week 1

2. **Day of Week Analysis Box**
   - Monday: 78% avg (weakest)
   - Tuesday: 85%
   - Wednesday: 92%
   - Thursday: 88%
   - Friday: 82%
   - Weekend: 65% avg

3. **Productivity Patterns Box**
   - Most productive time: 9-11am
   - Best day for deep work: Tuesday
   - Best workout day: Thursday
   - Consistency score: 82/100

### Page 4: Highlights
**Purpose**: Celebrate wins and review challenges

**Content Boxes**:
1. **Best Days Box**
   - Top 3 days of the month
   - Jan 15: 98% (A+) - Crushed it! 🚀
   - Jan 22: 95% (A) - Great flow state
   - Jan 8: 92% (A-) - Solid execution

2. **Achievements Box**
   - Unlocked this month:
   - 🏆 Week Warrior (7-day streak)
   - 💪 Gym Rat (15 workouts)
   - 🧠 Deep Thinker (20 deep work sessions)

3. **Challenges Box**
   - Areas to improve next month:
   - Weekend consistency (65% → target 80%)
   - Evening checkout (19/31 → target 25/31)
   - Light work tasks (78% → target 90%)

---

## 📊 YEARLY VIEW - Pages Breakdown

**Context**: High-level view of the entire year, quarterly breakdowns.

### Page 1: Year Overview ⭐ (Default)
**Purpose**: See all 12 months at once

**Content Boxes**:
1. **12-Month Grid Box**
   - Grid of 12 cards (3x4 on mobile)
   - Each card: Month name, grade, completion %, mini calendar
   - Tap month → go to monthly view
   - Current month highlighted

2. **Year Summary Box**
   - Total XP: 125,000 / 180,000
   - Average monthly grade: B+
   - Months completed (80%+): 8/12
   - Year completion: 69%

3. **Year Progress Bar Box**
   - Jan ████████░░ 80%
   - Feb ██████░░░░ 62%
   - Mar ████████░░ 85%
   - ... (all 12 months)

### Page 2: Quarters
**Purpose**: Break down year into Q1, Q2, Q3, Q4

**Content Boxes**:
1. **Q1 Box** (Jan-Mar)
   - Average grade: B+
   - Total XP: 32,000
   - Best month: March
   - Focus: Foundation building

2. **Q2 Box** (Apr-Jun)
   - Average grade: A-
   - Total XP: 38,000
   - Best month: May
   - Focus: Momentum & growth

3. **Q3 Box** (Jul-Sep)
   - Average grade: B
   - Total XP: 28,000
   - Best month: July
   - Focus: Consistency

4. **Q4 Box** (Oct-Dec)
   - Average grade: A
   - Total XP: 27,000 (in progress)
   - Best month: TBD
   - Focus: Strong finish

### Page 3: Annual Goals
**Purpose**: Track yearly goals and resolutions

**Content Boxes**:
1. **2025 Goals Box**
   - Launch SISO Ecosystem ██████░░░░ 60%
   - 200 workouts ████████░░ 156/200
   - 500 deep work hours ███████░░░ 340/500
   - Ship 3 major features ████████░░ 2/3

2. **Milestones Box**
   - January: First 7-day streak 🎯
   - March: Hit 10k XP 🏆
   - June: 100 workouts milestone 💪
   - September: Launched beta 🚀

3. **Year-End Targets Box**
   - 180,000 XP target (69% achieved)
   - 12 months of consistency (8 done)
   - Average A- grade (currently B+)
   - 10 perfect weeks (6 achieved)

### Page 4: Growth & Reflections
**Purpose**: See progress and evolution throughout the year

**Content Boxes**:
1. **Year-over-Year Box**
   - 2025 vs 2024
   - XP: +25% ↗️
   - Workouts: +40 days ↗️
   - Deep work: +150 hours ↗️
   - Average grade: B+ vs B → Improving!

2. **Biggest Wins Box**
   - Longest streak: 21 days (May)
   - Best month: June (95%)
   - Most improved: Q2 (+15%)
   - Personal best: 4 A+ weeks

3. **Lessons Learned Box**
   - What worked: Morning routines, time boxing
   - What didn't: Weekend discipline, late nights
   - Top insight: Tuesday = best productivity
   - Next year focus: Weekend consistency

---

## 🌟 LIFE VIEW - Pages Breakdown

**Context**: Long-term vision, multi-year tracking, life goals.

### Page 1: Life Goals ⭐ (Default)
**Purpose**: Track major life goals and dreams

**Content Boxes**:
1. **Active Life Goals Box**
   - Build SISO Ecosystem ████████░░ 80%
     - Started: 2023 | Target: 2025
   - Get to 10% body fat ██████░░░░ 60%
     - Started: 2024 | Target: 2026
   - Financial freedom ████░░░░░░ 40%
     - Started: 2022 | Target: 2028

2. **Goal Categories Box**
   - 💼 Career (3 active goals)
   - 💪 Health (2 active goals)
   - 💰 Financial (2 active goals)
   - 🧠 Learning (1 active goal)
   - 👨‍👩‍👧‍👦 Relationships (1 active goal)

3. **Next Major Milestones Box**
   - Launch SISO v1.0 (2 months)
   - Hit 180 lbs lean (6 months)
   - Complete side project (3 months)

### Page 2: Achievements & Legacy
**Purpose**: Celebrate all wins and milestones

**Content Boxes**:
1. **All Achievements Box**
   - Scrollable list of all badges/achievements
   - 🏆 Week Warrior x12
   - 💪 Gym Rat x8
   - 🧠 Deep Thinker x15
   - 🔥 Streak Master x3
   - ... (all achievements)

2. **Lifetime Milestones Box**
   - First 7-day streak: Jan 2024
   - First perfect week: Mar 2024
   - 100 workouts: Jun 2024
   - 1,000 tasks: Sep 2024
   - 50k lifetime XP: Oct 2025

3. **Legacy Metrics Box**
   - Days tracked: 523
   - Lifetime XP: 156,000
   - Total workouts: 312
   - Deep work hours: 890
   - Perfect days: 45

### Page 3: Multi-Year Timeline
**Purpose**: See all years at once

**Content Boxes**:
1. **Year Cards Stack**
   - Vertical scrolling list
   - **2025 Card**
     - YTD XP: 125,000
     - Avg grade: B+
     - Status: In progress
     - Tap → go to yearly view

   - **2024 Card**
     - Total XP: 110,000
     - Avg grade: B
     - Best month: December
     - Tap → go to 2024 yearly view

   - **2023 Card**
     - Total XP: 85,000
     - Avg grade: B-
     - Best month: August
     - Tap → go to 2023 yearly view

2. **Multi-Year Trends Box**
   - XP growth: 📈
   - Grade improvement: B- → B → B+ → A- (target)
   - Consistency: Improving
   - Overall: Upward trajectory 🚀

3. **All-Time Bests Box**
   - Best day ever: June 15, 2024 (98%, A+)
   - Best week ever: Week of May 20, 2024 (96%)
   - Best month ever: June 2024 (95%)
   - Longest streak: 21 days (May 2024)

### Page 4: Vision & Purpose
**Purpose**: Big picture, why you're doing this

**Content Boxes**:
1. **Life Vision Box**
   - Mission statement
   - Core values
   - Long-term vision (10 years)
   - Editable text area

2. **Annual Themes Box**
   - 2023: Foundation
   - 2024: Growth
   - 2025: Momentum
   - 2026: [Set theme]

3. **Life Scorecard Box**
   - Health: 85/100 🟢
   - Career: 78/100 🟡
   - Financial: 65/100 🟡
   - Relationships: 72/100 🟡
   - Learning: 80/100 🟢
   - Overall: 76/100

---

## 🎯 Navigation Design

### Time Period Selector (Top Level)
```tsx
// Maybe a dropdown or horizontal tabs at the very top
[Daily ▼] [Weekly] [Monthly] [Yearly] [Life]

// When you select a time period, you see its tabs at the bottom
```

### Bottom Tab Navigation (Per Time Period)
```tsx
// WEEKLY VIEW
[Overview] [Tasks] [Wellness] [Habits]

// MONTHLY VIEW
[Calendar] [Goals] [Trends] [Highlights]

// YEARLY VIEW
[Overview] [Quarters] [Goals] [Growth]

// LIFE VIEW
[Goals] [Achievements] [Timeline] [Vision]
```

### Swipe Behavior
- **Left/Right swipe on content** = Navigate between pages/tabs
- **Top area swipe** = Navigate between time periods (weeks/months/years)
- **Tap on cards** = Drill down (e.g., tap day → go to daily view)

---

## 🎨 Box Component Reusability

All pages use these box types:

1. **StatBox** - Quick stat with icon and value
   ```tsx
   <StatBox icon={<Zap />} label="Total XP" value="12,450" />
   ```

2. **ProgressBox** - Goal/task with progress bar
   ```tsx
   <ProgressBox title="Deep Work" current={20} target={25} />
   ```

3. **ListBox** - List of items with checks/status
   ```tsx
   <ListBox title="Weekly Habits" items={habits} />
   ```

4. **GridBox** - Grid of days/months/years
   ```tsx
   <GridBox items={days} type="calendar" />
   ```

5. **ChartBox** - Visual chart/graph
   ```tsx
   <ChartBox title="Trends" data={trendData} type="line" />
   ```

---

## ✅ Implementation Priority

### MVP (Week 1)
1. Weekly Overview page
2. Monthly Calendar page
3. Basic navigation (swipe + tabs)

### V2 (Week 2)
4. All Weekly pages (Tasks, Wellness, Habits)
5. All Monthly pages (Goals, Trends, Highlights)
6. Time period selector

### V3 (Week 3)
7. Yearly view (all pages)
8. Life view (all pages)
9. Polish & animations

---

## 🤔 Questions to Answer

1. **How do you switch between time periods?**
   - Option A: Dropdown selector at top
   - Option B: Horizontal tabs above bottom nav
   - Option C: Long-press on "back" button shows options

2. **Should weekly view auto-scroll to current week?**
   - Yes, always start on current week

3. **Can you edit goals from the timeline views?**
   - Yes, tap goal → modal to edit
   - Or, tap "Edit Goals" button → full page

4. **Do we need a "Today" quick button?**
   - Yes, floating button to jump back to today's daily view

5. **Should Life view have time period navigation?**
   - No, Life view shows all time (no prev/next)

---

**Ready to discuss and refine! Which time period should we build first?** 🚀
