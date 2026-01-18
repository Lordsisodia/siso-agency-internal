# LifeLock Timeline Views - Implementation Plan
*Created: 2025-10-10*

## 🎯 Overview
Build a multi-level timeline view system for LifeLock that allows users to zoom out from daily → weekly → monthly → yearly → life views, using consistent UI patterns and swipeable navigation.

## 📊 Current State Analysis

### Existing Components
1. **AdminLifeLockDay** (`src/ecosystem/internal/lifelock/AdminLifeLockDay.tsx`)
   - Daily view with tabs (morning, work, timebox, wellness, checkout)
   - Uses `TabLayoutWrapper` for bottom navigation
   - "Back to Weekly" button goes to `/admin/life-lock/weekly` (doesn't exist yet)

2. **StatisticalWeekView** (`src/ecosystem/internal/tasks/ui/StatisticalWeekView.tsx`)
   - Shows 7 daily cards with stats
   - Swipeable navigation between weeks
   - Displays: grade, points, morning/evening completion, tasks, focus hours, health
   - Week summary: total points, average, streaks

3. **MonthlyProgressSection** (`src/ecosystem/internal/tasks/components/MonthlyProgressSection.tsx`)
   - Monthly dot grid (31 days)
   - Color-coded completion: emerald (excellent), amber (good), orange (started)
   - Shows current day with orange border

4. **TabLayoutWrapper** (`src/ecosystem/internal/lifelock/TabLayoutWrapper.tsx`)
   - Swipeable tab navigation
   - Bottom navigation with expandable tabs
   - Already has navigation structure

### Existing Routes
- ✅ `/admin/lifelock/day/:date` - Daily view (exists)
- ❌ `/admin/life-lock/weekly` - Weekly view (referenced but doesn't exist)
- ❌ No monthly, yearly, or life routes yet

## 🏗️ Proposed Architecture

### Route Hierarchy
```
/admin/lifelock
  ├── /day/:date           [EXISTING] Daily breakdown
  ├── /timeline            [NEW] Timeline view with tabs
  │   ├── ?view=weekly     Weekly summary (default)
  │   ├── ?view=monthly    Monthly calendar
  │   ├── ?view=yearly     Yearly overview
  │   └── ?view=life       Life goals & plans
```

### Component Structure
```
AdminLifeLockTimeline
├── TimelineTabWrapper (similar to TabLayoutWrapper)
│   ├── WeeklyTimeline (enhanced StatisticalWeekView)
│   ├── MonthlyTimeline (enhanced MonthlyProgressSection)
│   ├── YearlyTimeline (new)
│   └── LifeTimeline (new)
```

## 📱 UI Design Patterns (Copy from Daily View)

### Shared Design Elements
1. **Card Styling**
   ```tsx
   // Base card style from StatisticalWeekView
   className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/50"

   // Today/active highlight
   className="ring-2 ring-orange-500/80 border-orange-500/70 shadow-lg shadow-orange-500/20"
   ```

2. **Bottom Navigation**
   - Use `ExpandableTabs` component (same as daily view)
   - 4 tabs: Weekly, Monthly, Yearly, Life
   - Icons: Calendar, CalendarDays, CalendarRange, Target

3. **Swipe Navigation**
   ```tsx
   // Pattern from StatisticalWeekView
   <motion.div
     drag="x"
     dragConstraints={{ left: -50, right: 50 }}
     dragElastic={0.2}
     onDragEnd={handleDragEnd}
   />
   ```

## 📋 Detailed View Specs

### 1. Weekly Timeline (`WeeklyTimeline.tsx`)
**Purpose**: Show weekly performance with ability to scroll through weeks

**Data Displayed**:
- 7 daily cards (reuse `StatDayCard` from StatisticalWeekView)
- Week summary: total points, average grade, completion %
- Streaks: morning routine, exercise, deep work
- Best day of the week
- Health metrics: workout count, wellness score

**Navigation**:
- ← → Swipe between weeks
- Tap daily card → Navigate to `/admin/lifelock/day/:date`
- "Go to Month" button → Switch to monthly view

**Data Source**:
```typescript
// Hook: useWeeklyData(weekStart: Date)
interface WeeklyData {
  weekCards: DailyCard[];
  weekStart: Date;
  weekEnd: Date;
  summary: {
    totalPoints: number;
    averageGrade: string;
    completionPercentage: number;
    streaks: {
      morningRoutine: number;
      exercise: number;
      deepWork: number;
    };
    bestDay: Date;
  };
}
```

### 2. Monthly Timeline (`MonthlyTimeline.tsx`)
**Purpose**: Calendar view of entire month with completion dots

**Data Displayed**:
- 31-day calendar grid (similar to existing MonthlyProgressSection)
- Each day: completion dot (color-coded)
- Monthly stats card:
  - Days completed (80%+): X/31
  - Average daily grade: A-
  - Total XP earned: 2,450 / 3,100
  - Longest streak: 5 days
- Weekly summaries (4-5 rows): Week 1, 2, 3, 4 with mini-bars

**Navigation**:
- ← → Swipe between months
- Tap day → Navigate to `/admin/lifelock/day/:date`
- Tap week → Switch to weekly view for that week
- "Go to Year" button → Switch to yearly view

**UI Enhancement**:
```tsx
// Enhance existing MonthlyProgressSection with:
1. Clickable days
2. Week row summaries (4 rows showing weekly completion %)
3. Monthly stats card at top
4. Swipe navigation between months
```

**Data Source**:
```typescript
// Hook: useMonthlyData(month: Date)
interface MonthlyData {
  month: Date;
  days: Array<{
    date: Date;
    completionPercentage: number;
    grade: string;
    points: number;
  }>;
  weeklySummaries: Array<{
    weekStart: Date;
    weekEnd: Date;
    averageCompletion: number;
    totalPoints: number;
  }>;
  monthSummary: {
    daysCompleted: number;
    totalDays: number;
    averageGrade: string;
    totalXP: number;
    maxXP: number;
    longestStreak: number;
  };
}
```

### 3. Yearly Timeline (`YearlyTimeline.tsx`)
**Purpose**: Show yearly overview with monthly summaries

**Data Displayed**:
- 12 monthly cards (Jan-Dec)
- Each month card shows:
  - Month name
  - Completion bar (0-100%)
  - Total XP earned
  - Grade (A+, A, B+, etc.)
  - Mini calendar preview (tiny dots)
- Year summary card:
  - Total XP: 28,500 / 36,000
  - Average monthly grade: A-
  - Best month: September (95%)
  - Worst month: February (62%)
  - Year completion: 78%

**Navigation**:
- ← → Swipe between years
- Tap month → Navigate to monthly view for that month
- "Go to Life" button → Switch to life view

**Layout**:
```tsx
// Grid of monthly cards (2 columns on mobile, 3-4 on desktop)
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
  {months.map(month => (
    <MonthCard
      month={month}
      data={monthData}
      onClick={() => navigateToMonth(month)}
    />
  ))}
</div>
```

**Data Source**:
```typescript
// Hook: useYearlyData(year: number)
interface YearlyData {
  year: number;
  months: Array<{
    month: Date;
    completionPercentage: number;
    grade: string;
    totalXP: number;
    maxXP: number;
    bestWeek: Date;
  }>;
  yearSummary: {
    totalXP: number;
    maxXP: number;
    averageGrade: string;
    bestMonth: Date;
    worstMonth: Date;
    yearCompletion: number;
  };
}
```

### 4. Life Timeline (`LifeTimeline.tsx`)
**Purpose**: Long-term goals, life plans, multi-year tracking

**Data Displayed**:
- Life goals dashboard:
  - Active goals (e.g., "Launch SISO", "Get to 10% body fat")
  - Progress bars for each goal
  - Milestones achieved
- Multi-year view:
  - 2024, 2025, 2026... cards
  - Each year: completion %, total XP
- Life stats:
  - Total days tracked
  - Lifetime XP earned
  - All-time best day/week/month
  - Longest streak
  - Total workouts completed
  - Total deep work hours

**Navigation**:
- Scroll through years
- Tap year → Navigate to yearly view
- Add/edit life goals
- View achievements/badges

**Layout**:
```tsx
// Top: Life Goals Section
<div className="space-y-4">
  <GoalsCard goals={lifeGoals} />
  <AchievementsBadges badges={badges} />
</div>

// Bottom: Multi-year timeline
<div className="space-y-3 mt-6">
  {years.map(year => (
    <YearSummaryCard
      year={year}
      data={yearData}
      onClick={() => navigateToYear(year)}
    />
  ))}
</div>
```

**Data Source**:
```typescript
// Hook: useLifeData(userId: string)
interface LifeData {
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
    deadline?: Date;
    category: 'health' | 'career' | 'personal';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    unlockedAt: Date;
    icon: string;
  }>;
  lifetimeStats: {
    totalDaysTracked: number;
    lifetimeXP: number;
    bestDay: Date;
    longestStreak: number;
    totalWorkouts: number;
    totalDeepWorkHours: number;
  };
  yearlyProgress: Array<{
    year: number;
    completionPercentage: number;
    totalXP: number;
  }>;
}
```

## 🔧 Implementation Steps

### Phase 1: Setup & Routes
1. Create `AdminLifeLockTimeline.tsx` component
2. Add routes to router config:
   ```typescript
   {
     path: 'timeline',
     element: <AdminLifeLockTimeline />,
   }
   ```
3. Update "Back to Weekly" button in `TabLayoutWrapper`:
   ```typescript
   onClick={() => navigate('/admin/lifelock/timeline?view=weekly')}
   ```

### Phase 2: Weekly View
1. Extract `StatDayCard` component for reuse
2. Create `WeeklyTimeline.tsx` (enhanced StatisticalWeekView)
3. Implement `useWeeklyData` hook
4. Add navigation to daily view
5. Test swipe gestures

### Phase 3: Monthly View
1. Enhance `MonthlyProgressSection.tsx`:
   - Add clickable days
   - Add weekly summary rows
   - Add monthly stats card
   - Add swipe navigation
2. Implement `useMonthlyData` hook
3. Link to daily/weekly views
4. Test click and swipe

### Phase 4: Yearly View
1. Create `YearlyTimeline.tsx`
2. Design `MonthCard` component
3. Implement `useYearlyData` hook
4. Add year summary card
5. Link to monthly views

### Phase 5: Life View
1. Create `LifeTimeline.tsx`
2. Design goals/achievements UI
3. Implement `useLifeData` hook
4. Add multi-year cards
5. Link to yearly views

### Phase 6: Tab Navigation
1. Create `TimelineTabWrapper.tsx` (copy from TabLayoutWrapper)
2. Configure 4 tabs: Weekly, Monthly, Yearly, Life
3. Handle tab switching and URL params
4. Implement swipe between tabs
5. Add bottom navigation with icons

### Phase 7: Polish & Testing
1. Test all navigation flows
2. Verify data loads correctly
3. Test swipe gestures on mobile
4. Add loading states
5. Add error handling
6. Optimize performance

## 🗄️ Database Queries

### Weekly Query
```sql
SELECT
  date,
  morning_tasks,
  work_tasks,
  wellness_tasks,
  checkout_tasks,
  xp_earned,
  completion_percentage
FROM lifelock_daily_data
WHERE user_id = $1
  AND date >= $2  -- week_start
  AND date <= $3  -- week_end
ORDER BY date ASC;
```

### Monthly Query
```sql
SELECT
  date,
  completion_percentage,
  xp_earned,
  grade
FROM lifelock_daily_data
WHERE user_id = $1
  AND EXTRACT(MONTH FROM date) = $2
  AND EXTRACT(YEAR FROM date) = $3
ORDER BY date ASC;
```

### Yearly Query
```sql
SELECT
  EXTRACT(MONTH FROM date) as month,
  AVG(completion_percentage) as avg_completion,
  SUM(xp_earned) as total_xp,
  COUNT(*) as days_tracked
FROM lifelock_daily_data
WHERE user_id = $1
  AND EXTRACT(YEAR FROM date) = $2
GROUP BY EXTRACT(MONTH FROM date)
ORDER BY month ASC;
```

### Life Query
```sql
-- Get all-time stats
SELECT
  COUNT(DISTINCT date) as total_days,
  SUM(xp_earned) as lifetime_xp,
  MAX(completion_percentage) as best_day_percentage,
  MAX(date) as best_day
FROM lifelock_daily_data
WHERE user_id = $1;

-- Get yearly summaries
SELECT
  EXTRACT(YEAR FROM date) as year,
  AVG(completion_percentage) as avg_completion,
  SUM(xp_earned) as total_xp,
  COUNT(*) as days_tracked
FROM lifelock_daily_data
WHERE user_id = $1
GROUP BY EXTRACT(YEAR FROM date)
ORDER BY year DESC;
```

## 🎨 Reusable Components to Create

### 1. `TimelineCard.tsx`
Base card component with consistent styling:
```tsx
interface TimelineCardProps {
  title: string;
  subtitle?: string;
  completionPercentage: number;
  grade?: string;
  xp?: { earned: number; max: number };
  isActive?: boolean; // Today/current period
  onClick?: () => void;
  children?: ReactNode;
}
```

### 2. `PeriodNavigator.tsx`
Swipeable navigation header:
```tsx
interface PeriodNavigatorProps {
  currentPeriod: string; // "Week of Jan 1-7", "January 2025", etc.
  onNavigate: (direction: 'prev' | 'next') => void;
  onZoomOut?: () => void; // Optional "Go to Month/Year" button
}
```

### 3. `CompletionDot.tsx`
Reusable completion indicator:
```tsx
interface CompletionDotProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean; // For "today" indicator
  onClick?: () => void;
}
```

### 4. `StatsCard.tsx`
Summary statistics card:
```tsx
interface StatsCardProps {
  title: string;
  stats: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    color?: string;
  }>;
}
```

## 📊 Data Fetching Strategy

### Caching & Performance
1. Use SWR for all data fetching
2. Cache weekly data for 5 minutes
3. Cache monthly/yearly data for 1 hour
4. Prefetch adjacent periods on navigation
5. Lazy load Life view data (only when tab active)

### Example Hook Pattern
```typescript
export function useWeeklyData(weekStart: Date) {
  const { data, error, mutate } = useSWR(
    `/api/lifelock/weekly?start=${format(weekStart, 'yyyy-MM-dd')}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000 // 5 minutes
    }
  );

  return {
    weekData: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
```

## 🚀 Success Metrics

### Must Have (MVP)
- ✅ Weekly view shows 7 days with accurate data
- ✅ Monthly view shows 31 days with completion dots
- ✅ Navigation between daily ↔ weekly ↔ monthly works
- ✅ Swipe gestures work on mobile
- ✅ Bottom tab navigation matches daily view style

### Should Have (V2)
- ✅ Yearly view with 12 monthly cards
- ✅ Life view with goals and achievements
- ✅ All navigation flows work (5 levels)
- ✅ Prefetching for smooth transitions

### Could Have (Future)
- 📊 Export data (CSV, PDF)
- 📈 Trends analysis (improving/declining)
- 🏆 Challenges & competitions
- 📱 Share progress cards
- 🎯 Goal templates

## 📝 Notes & Considerations

### Design Consistency
- Use EXACT same card styling as `StatisticalWeekView`
- Use EXACT same bottom navigation as `TabLayoutWrapper`
- Maintain orange accent color throughout (#FF9500)
- Keep swipe gestures consistent (100px threshold)

### Mobile-First
- All views must work perfectly on iPhone 14 Pro (393×852)
- Test swipe gestures extensively
- Ensure tap targets are 44×44px minimum
- Optimize for thumb reach (bottom navigation)

### Performance
- Daily view: Load immediately (cached)
- Weekly view: Load 1 week (7 days data)
- Monthly view: Load 1 month (31 days data)
- Yearly view: Load 12 monthly summaries
- Life view: Load aggregated stats only

### Future Enhancements
- Comparison mode (this week vs last week)
- Prediction mode (AI suggests best times for tasks)
- Social mode (compare with friends)
- Coach mode (AI analyzes patterns and gives advice)

---

## 🎯 Next Steps
1. Review this plan with user
2. Get approval on design and architecture
3. Start Phase 1: Setup & Routes
4. Build incrementally (weekly → monthly → yearly → life)
5. Test each phase before moving to next

**Estimated Time**: 2-3 days for full implementation
**Priority**: High (referenced by existing "Back to Weekly" button)
