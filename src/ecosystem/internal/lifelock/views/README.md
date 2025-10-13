# 📋 LifeLock Views - Implementation Guide

## Overview

This guide outlines the implementation plan for expanding LifeLock from daily-only to a complete multi-level timeline system: Daily → Weekly → Monthly → Yearly → Life.

## Current State

### ✅ Completed
- **Daily View**: Fully implemented with 6 sections
  - Morning Routine
  - Light Work
  - Deep Work
  - Home Workout
  - Health Non-Negotiables
  - Timebox
  - Nightly Checkout

### 🔨 To Build
- **Weekly View** (5 pages)
- **Monthly View** (5 pages)
- **Yearly View** (5 pages)
- **Life View** (7 pages)

## Architecture Pattern (Proven with Daily View)

### Folder Structure
```
views/
├── daily/                    ✅ COMPLETE
│   ├── _shared/
│   ├── morning-routine/
│   ├── light-work/
│   ├── deep-work/
│   ├── wellness/
│   │   ├── home-workout/
│   │   └── health-non-negotiables/
│   ├── timebox/
│   └── checkout/
├── weekly/                   🔨 TO BUILD
│   ├── _shared/
│   ├── overview/
│   ├── productivity/
│   ├── wellness/
│   ├── time-analysis/
│   └── checkout/
├── monthly/                  🔨 TO BUILD
│   ├── _shared/
│   ├── calendar/
│   ├── goals/
│   ├── performance/
│   ├── consistency/
│   └── review/
├── yearly/                   🔨 TO BUILD
│   ├── _shared/
│   ├── overview/
│   ├── goals/
│   ├── growth/
│   ├── balance/
│   └── planning/
└── life/                     🔨 TO BUILD
    ├── _shared/
    ├── vision/
    ├── active-goals/
    ├── legacy/
    ├── timeline/
    ├── balance/
    ├── review/
    └── planning/
```

### Component Pattern (Copy from Daily)

Each section follows this proven pattern:
```
section-name/
├── SectionName.tsx           (Main orchestrator)
├── components/               (UI components)
│   ├── Component1.tsx
│   ├── Component2.tsx
│   └── ...
├── hooks/                    (Custom hooks)
│   ├── useSectionData.ts
│   └── ...
├── utils/                    (Helper functions)
│   └── sectionUtils.ts
├── types.ts                  (TypeScript types)
├── config.ts                 (Configuration)
└── README.md                 (Documentation)
```

## Implementation Plan

### Phase 1: Weekly View (Priority: HIGH)

#### Pages to Build (5 total)
1. **Overview** ⭐ (Default)
   - 7-day performance cards
   - Week summary stats
   - Active streaks
   - Red flags & problems

2. **Productivity**
   - Deep work breakdown
   - Light work completion
   - Priority breakdown
   - Week-over-week comparison

3. **Wellness**
   - Workout summary
   - Health habits checklist
   - Energy & sleep analysis
   - Nutrition & calories

4. **Time Analysis**
   - Sleep & awake time
   - Logged work hours
   - Wake time analysis
   - Time utilization summary

5. **Insights & Checkout**
   - Weekly wins
   - Problems & red flags
   - Week-over-week trends
   - Weekly checkout component

#### Technical Implementation
```typescript
// File structure to create
views/weekly/
├── _shared/
│   ├── WeeklyTabNav.tsx
│   ├── WeekGrid.tsx
│   └── WeeklyStatsCard.tsx
├── overview/
│   ├── WeeklyOverviewSection.tsx
│   ├── components/
│   │   ├── WeekStatusHeader.tsx
│   │   ├── SevenDayCards.tsx
│   │   ├── WeekSummaryStats.tsx
│   │   ├── ActiveStreaks.tsx
│   │   └── RedFlags.tsx
│   └── hooks/
│       └── useWeeklyOverview.ts
├── productivity/
│   ├── WeeklyProductivitySection.tsx
│   └── components/
│       ├── DeepWorkBreakdown.tsx
│       ├── LightWorkCompletion.tsx
│       └── PriorityBreakdown.tsx
├── wellness/
│   ├── WeeklyWellnessSection.tsx
│   └── components/
│       ├── WorkoutSummary.tsx
│       └── HealthHabitsGrid.tsx
├── time-analysis/
│   ├── WeeklyTimeAnalysisSection.tsx
│   └── components/
│       └── SleepAnalysis.tsx
└── checkout/
    ├── WeeklyCheckoutSection.tsx
    └── components/
        └── WeeklyCheckout.tsx
```

### Phase 2: Monthly View (Priority: HIGH)

#### Pages to Build (5 total)
1. **Calendar** ⭐ (Default)
   - 31-day performance grid
   - Weekly performance bars
   - Month summary
   - Event plotting

2. **Goals & Progress**
   - Monthly goals
   - Yearly goal progress
   - Ongoing projects

3. **Performance & Trends**
   - Month-over-month comparison
   - Performance trend graph
   - Best vs worst weeks

4. **Consistency**
   - Monthly habit grid
   - Longest streaks
   - Consistency scores

5. **Review & Reflection**
   - Monthly wins
   - Areas for improvement
   - Monthly reflection
   - Next month prep

### Phase 3: Yearly View (Priority: MEDIUM)

#### Pages to Build (5 total)
1. **Overview** ⭐ (Default)
   - 12-month grid
   - Quarterly breakdown
   - Year summary

2. **Goals & Milestones**
   - Annual goals progress
   - Monthly milestones timeline
   - Achievements earned

3. **Growth & Trends**
   - Year-over-year comparison
   - Monthly trend graphs
   - Biggest improvements

4. **Life Balance**
   - Life balance scorecard
   - Time allocation analysis
   - Balance trends

5. **Planning & Learnings**
   - Yearly checkout
   - Next year vision
   - Quarterly roadmap

### Phase 4: Life View (Priority: MEDIUM)

#### Pages to Build (7 total)
1. **Vision** ⭐ (Default)
   - Life mission statement
   - Core values
   - 5-year vision

2. **Active Goals**
   - Major life goals
   - Goal categories
   - Next milestones

3. **Legacy & Stats**
   - Lifetime performance
   - All-time bests
   - Financial legacy

4. **Multi-Year Timeline**
   - Year cards
   - Multi-year trends
   - Life events

5. **Balance Scorecard**
   - Comprehensive life assessment
   - Happiness tracking
   - Time allocation

6. **Life Review & Assessment**
   - Life review checkout
   - Course corrections
   - Priorities

7. **Planning & Roadmap**
   - 1-year plan
   - 3-year plan
   - 5-year & 10-year vision

## Design Patterns to Reuse

### 1. Card Styling (from Morning Routine)
```typescript
// Use this exact pattern for all cards
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-[THEME]-500/5 to-[THEME]-500/5 rounded-2xl blur-sm" />
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[THEME]-500/20 shadow-lg shadow-[THEME]-500/10">
    <CardHeader>
      <CardTitle>
        <Icon className="h-5 w-5 text-[THEME]-400 mr-2" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </div>
</section>
```

### 2. Theme Colors
- **Weekly**: Blue/Indigo (focus, depth)
- **Monthly**: Purple/Violet (reflection, wisdom)
- **Yearly**: Orange/Amber (achievement, celebration)
- **Life**: Gold/Yellow (purpose, legacy)

### 3. Navigation Pattern
```typescript
// Reuse TabLayoutWrapper pattern
<TabLayoutWrapper
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  theme="[THEME]"
>
  {children}
</TabLayoutWrapper>
```

### 4. Data Hooks Pattern
```typescript
// Follow useLightWorkTasksSupabase pattern
export function useWeeklyData({ selectedWeek }: { selectedWeek: Date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch logic here
  
  return {
    data,
    loading,
    error,
    refresh: () => {/* refresh logic */}
  };
}
```

## Data Architecture

### Database Schema Extensions
```sql
-- Weekly summaries (pre-computed for performance)
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  total_xp INTEGER,
  average_grade VARCHAR(2),
  completion_percentage INTEGER,
  deep_work_hours DECIMAL(5,2),
  light_work_tasks INTEGER,
  workouts INTEGER,
  morning_routine_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly summaries
CREATE TABLE monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  month DATE NOT NULL, -- First day of month
  total_xp INTEGER,
  average_grade VARCHAR(2),
  days_completed_80_plus INTEGER,
  perfect_days INTEGER,
  longest_streak INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Yearly summaries
CREATE TABLE yearly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  year INTEGER NOT NULL,
  total_xp INTEGER,
  average_grade VARCHAR(2),
  months_completed_80_plus INTEGER,
  best_month DATE,
  worst_month DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Life goals
CREATE TABLE life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'health', 'career', 'financial', 'relationships', 'personal'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints to Create

### Weekly Data
```typescript
// GET /api/lifelock/weekly?start=2025-01-01&user_id=xxx
interface WeeklyResponse {
  weekStart: string;
  weekEnd: string;
  dailyData: DailyCard[];
  summary: {
    totalXP: number;
    averageGrade: string;
    completionPercentage: number;
    streaks: StreakData;
    bestDay: string;
    worstDay: string;
  };
}
```

### Monthly Data
```typescript
// GET /api/lifelock/monthly?month=2025-01&user_id=xxx
interface MonthlyResponse {
  month: string;
  days: DayData[];
  weeklySummaries: WeeklySummary[];
  monthSummary: {
    daysCompleted80Plus: number;
    averageGrade: string;
    totalXP: number;
    longestStreak: number;
  };
}
```

### Yearly Data
```typescript
// GET /api/lifelock/yearly?year=2025&user_id=xxx
interface YearlyResponse {
  year: number;
  months: MonthData[];
  yearSummary: {
    totalXP: number;
    averageGrade: string;
    bestMonth: string;
    worstMonth: string;
    yearCompletion: number;
  };
}
```

### Life Data
```typescript
// GET /api/lifelock/life?user_id=xxx
interface LifeResponse {
  goals: LifeGoal[];
  achievements: Achievement[];
  lifetimeStats: {
    totalDaysTracked: number;
    lifetimeXP: number;
    bestDay: BestDayData;
    longestStreak: number;
  };
  yearlyProgress: YearlyData[];
}
```

## Implementation Checklist

### Before Starting
- [ ] Review daily view patterns thoroughly
- [ ] Set up database schema extensions
- [ ] Create API endpoints
- [ ] Prepare design assets (icons, themes)

### Weekly View
- [ ] Create folder structure
- [ ] Build shared components
- [ ] Implement Overview page
- [ ] Implement Productivity page
- [ ] Implement Wellness page
- [ ] Implement Time Analysis page
- [ ] Implement Checkout page
- [ ] Add navigation
- [ ] Test thoroughly

### Monthly View
- [ ] Create folder structure
- [ ] Build shared components
- [ ] Implement Calendar page
- [ ] Implement Goals page
- [ ] Implement Performance page
- [ ] Implement Consistency page
- [ ] Implement Review page
- [ ] Add navigation
- [ ] Test thoroughly

### Yearly View
- [ ] Create folder structure
- [ ] Build shared components
- [ ] Implement Overview page
- [ ] Implement Goals page
- [ ] Implement Growth page
- [ ] Implement Balance page
- [ ] Implement Planning page
- [ ] Add navigation
- [ ] Test thoroughly

### Life View
- [ ] Create folder structure
- [ ] Build shared components
- [ ] Implement Vision page
- [ ] Implement Active Goals page
- [ ] Implement Legacy page
- [ ] Implement Timeline page
- [ ] Implement Balance page
- [ ] Implement Review page
- [ ] Implement Planning page
- [ ] Add navigation
- [ ] Test thoroughly

## Testing Strategy

### Unit Tests
- Each component tested individually
- Data hooks tested with mock data
- Utility functions tested

### Integration Tests
- Navigation between views
- Data flow between levels
- API integration

### E2E Tests
- Complete user journeys
- Mobile responsiveness
- Performance under load

## Performance Considerations

### Data Loading
- Lazy load each view
- Cache summaries in database
- Prefetch adjacent periods
- Use SWR for client-side caching

### Rendering
- Virtualize long lists
- Memoize expensive calculations
- Optimize re-renders
- Use React.lazy for code splitting

## Success Metrics

### Technical
- All views load in <2 seconds
- Smooth transitions between views
- Mobile-first responsive design
- Zero console errors

### User Experience
- Intuitive navigation
- Clear data visualization
- Meaningful insights
- Motivational feedback

## Timeline

### Week 1: Weekly View
- Days 1-2: Setup + Overview page
- Days 3-4: Remaining pages
- Day 5: Testing + Polish

### Week 2: Monthly View
- Days 1-2: Setup + Calendar page
- Days 3-4: Remaining pages
- Day 5: Testing + Polish

### Week 3: Yearly View
- Days 1-2: Setup + Overview page
- Days 3-4: Remaining pages
- Day 5: Testing + Polish

### Week 4: Life View
- Days 1-2: Setup + Vision page
- Days 3-4: Remaining pages
- Day 5: Testing + Polish

### Week 5: Integration & Polish
- Cross-view navigation
- Performance optimization
- Final testing
- Documentation updates

## Next Steps

1. **Review this plan** with the team
2. **Approve the architecture** and patterns
3. **Start with Weekly View** (highest priority)
4. **Follow the proven patterns** from daily view
5. **Test thoroughly** before moving to next view

---

**Remember**: The daily view patterns are proven and working. Reuse them extensively to ensure consistency and reduce development time.