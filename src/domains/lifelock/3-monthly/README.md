# 📆 Monthly View - Implementation Guide

## Overview

The Monthly View provides month-over-month trends and yearly goal progress, helping users track patterns and long-term progress. It consists of 5 swipeable pages focused on trends, goals, and consistency.

## Pages Structure

### 1. Calendar ⭐ (Default Page)
**Purpose**: Visual overview + event plotting

**Key Components**:
- 31-Day Performance Grid (enhanced MonthlyProgressSection)
- Weekly Performance Bars (4-5 week summaries)
- Month Summary (days completed, average grade, total XP)
- Event plotting (click to add events that sync to weekly/daily)

### 2. Goals & Progress
**Purpose**: Monthly goals + yearly goal tracking

**Key Components**:
- Monthly Goals (progress bars for each goal)
- Yearly Goal Progress (tracked monthly)
- Ongoing Projects (status, timelines)
- Next Milestones (upcoming targets)

### 3. Performance & Trends
**Purpose**: Month-over-month comparison (PRIMARY FEATURE)

**Key Components**:
- Month-over-Month Comparison (key metrics vs last month)
- Performance Trend Graph (daily grades over month)
- Best vs Worst Weeks (analysis and insights)
- Pattern Detection (recurring behaviors)

### 4. Consistency & Streaks
**Purpose**: Habit tracking - "Am I building good habits?"

**Key Components**:
- Monthly Habit Grid (31 days × core habits)
- Longest Streaks This Month (active and broken)
- Consistency Scores (by habit category)
- Habit Analysis (strengths and weaknesses)

### 5. Review & Reflection
**Purpose**: End-of-month checkout + next month prep

**Key Components**:
- Monthly Wins & Achievements (celebrate success)
- Areas for Improvement (identify patterns)
- Monthly Reflection (structured checkout)
- February Prep (planning half in advance)

## Technical Implementation

### Folder Structure
```
views/monthly/
├── _shared/
│   ├── MonthlyTabNav.tsx         # Bottom navigation
│   ├── CalendarGrid.tsx          # 31-day calendar component
│   ├── MonthlyStatsCard.tsx      # Reusable stats card
│   ├── HabitGrid.tsx             # Habit tracking grid
│   └── types.ts                  # Shared types
├── calendar/
│   ├── MonthlyCalendarSection.tsx # Main orchestrator
│   ├── components/
│   │   ├── DayPerformanceGrid.tsx # 31-day grid
│   │   ├── WeeklyBars.tsx         # Week summary bars
│   │   ├── MonthSummary.tsx       # Month statistics
│   │   └── EventPlotter.tsx       # Add events modal
│   ├── hooks/
│   │   └── useMonthlyCalendar.ts   # Data management
│   └── utils/
│       └── calendarUtils.ts       # Date utilities
├── goals/
│   ├── MonthlyGoalsSection.tsx
│   ├── components/
│   │   ├── MonthlyGoalsList.tsx
│   │   ├── YearlyProgress.tsx
│   │   ├── OngoingProjects.tsx
│   │   └── NextMilestones.tsx
│   └── hooks/
│       └── useMonthlyGoals.ts
├── performance/
│   ├── MonthlyPerformanceSection.tsx
│   ├── components/
│   │   ├── MonthOverMonth.tsx
│   │   ├── TrendGraph.tsx
│   │   ├── BestWorstWeeks.tsx
│   │   └── PatternDetector.tsx
│   └── hooks/
│       └── useMonthlyPerformance.ts
├── consistency/
│   ├── MonthlyConsistencySection.tsx
│   ├── components/
│   │   ├── HabitGrid.tsx
│   │   ├── StreakTracker.tsx
│   │   ├── ConsistencyScores.tsx
│   │   └── HabitAnalysis.tsx
│   └── hooks/
│       └── useMonthlyConsistency.ts
└── review/
    ├── MonthlyReviewSection.tsx
    ├── components/
    │   ├── MonthlyWins.tsx
    │   ├── AreasForImprovement.tsx
    │   ├── MonthlyReflection.tsx
    │   └── NextMonthPrep.tsx
    └── hooks/
        └── useMonthlyReview.ts
```

## Data Architecture

### Data Sources
The Monthly View aggregates data from:
1. **Daily Data** (aggregated for the month)
2. **Weekly Summaries** (pre-computed weekly data)
3. **Goals Data** (monthly and yearly goals)
4. **Events Data** (user-plotted events)

### Key Data Structure
```typescript
interface MonthlyData {
  month: Date;
  days: Array<{
    date: Date;
    completionPercentage: number;
    grade: string;
    xpEarned: number;
    habits: {
      morningRoutine: boolean;
      workout: boolean;
      deepWork: boolean;
      checkout: boolean;
    };
    events: Event[];
  }>;
  weeklySummaries: Array<{
    weekStart: Date;
    weekEnd: Date;
    averageCompletion: number;
    totalXP: number;
    grade: string;
  }>;
  monthSummary: {
    daysCompleted80Plus: number;
    averageGrade: string;
    totalXP: number;
    maxXP: number;
    longestStreak: number;
    perfectDays: number;
  };
  monthlyGoals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
  }>;
  yearlyProgress: Array<{
    id: string;
    title: string;
    yearlyTarget: number;
    monthlyContribution: number;
    totalToDate: number;
  }>;
}
```

## Implementation Steps

### Step 1: Setup Infrastructure
1. Create folder structure
2. Set up shared types and utilities
3. Create base components (MonthlyTabNav, CalendarGrid)
4. Set up data hooks

### Step 2: Build Calendar Page
1. Create MonthlyCalendarSection.tsx
2. Enhance existing MonthlyProgressSection
3. Implement DayPerformanceGrid
4. Build WeeklyBars
5. Create MonthSummary
6. Add EventPlotter modal
7. Wire up data and test

### Step 3: Build Goals Page
1. Create MonthlyGoalsSection.tsx
2. Implement MonthlyGoalsList
3. Build YearlyProgress
4. Create OngoingProjects
5. Implement NextMilestones
6. Connect to goals data

### Step 4: Build Performance Page
1. Create MonthlyPerformanceSection.tsx
2. Implement MonthOverMonth comparison
3. Build TrendGraph (line chart)
4. Create BestWorstWeeks
5. Implement PatternDetector
6. Add trend calculations

### Step 5: Build Consistency Page
1. Create MonthlyConsistencySection.tsx
2. Implement HabitGrid (31×X grid)
3. Build StreakTracker
4. Create ConsistencyScores
5. Add HabitAnalysis
6. Calculate consistency metrics

### Step 6: Build Review Page
1. Create MonthlyReviewSection.tsx
2. Implement MonthlyWins
3. Build AreasForImprovement
4. Create MonthlyReflection component
5. Implement NextMonthPrep
6. Add save functionality

### Step 7: Integration & Polish
1. Wire up navigation between pages
2. Implement swipe gestures
3. Add loading states
4. Test on mobile
5. Optimize performance

## Design Patterns to Reuse

### 1. Card Component (with Purple Theme)
```typescript
// Use this pattern with purple theme for monthly
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
    <CardHeader>
      <CardTitle className="text-purple-400">
        <Icon className="h-5 w-5 mr-2" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </div>
</section>
```

### 2. Calendar Grid Pattern
```typescript
// Enhance existing MonthlyProgressSection
<div className="grid grid-cols-7 gap-1 text-xs">
  {days.map((day, index) => (
    <div
      key={index}
      className={cn(
        "aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all",
        day.isToday && "ring-2 ring-purple-500",
        getCompletionColor(day.completionPercentage)
      )}
      onClick={() => handleDayClick(day.date)}
    >
      {day.date.getDate()}
    </div>
  ))}
</div>
```

### 3. Progress Bar Pattern
```typescript
// Reusable progress for goals
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>{goal.title}</span>
    <span>{goal.current}/{goal.target} {goal.unit}</span>
  </div>
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
      style={{ width: `${(goal.current / goal.target) * 100}%` }}
    />
  </div>
</div>
```

## API Implementation

### Endpoint: GET /api/lifelock/monthly
```typescript
// Query parameters: ?month=2025-01&user_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM format
  const userId = searchParams.get('user_id');
  
  // Calculate month start and end
  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  // Fetch daily data for the month
  const { data: dailyData, error } = await supabase
    .from('lifelock_daily_data')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date');
  
  // Fetch weekly summaries
  const { data: weeklyData } = await supabase
    .from('weekly_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('week_start', format(startDate, 'yyyy-MM-dd'))
    .lte('week_start', format(endDate, 'yyyy-MM-dd'));
  
  // Fetch monthly goals
  const { data: goals } = await supabase
    .from('monthly_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month);
  
  // Fetch events for the month
  const { data: events } = await supabase
    .from('monthly_events')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'));
  
  return Response.json({
    month,
    days: enrichDailyData(dailyData, events),
    weeklySummaries: weeklyData,
    monthSummary: calculateMonthSummary(dailyData),
    monthlyGoals: goals,
    events
  });
}
```

### Database Schema Additions
```sql
-- Monthly goals
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  month DATE NOT NULL, -- First day of month
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT,
  category TEXT, -- 'health', 'career', 'financial', etc.
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, title)
);

-- Monthly events (for calendar)
CREATE TABLE monthly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  type TEXT, -- 'flight', 'meeting', 'deadline', etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly summaries (pre-computed)
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
```

## Testing Strategy

### Unit Tests
```typescript
// Example: MonthlyCalendarSection.test.tsx
describe('MonthlyCalendarSection', () => {
  test('displays 31-day grid correctly', () => {
    const mockData = generateMockMonthlyData();
    render(<MonthlyCalendarSection selectedMonth={new Date()} />);
    
    const dayCells = screen.getAllByTestId('day-cell');
    expect(dayCells).toHaveLength(31);
  });
  
  test('shows month summary statistics', () => {
    const mockData = generateMockMonthlyData();
    render(<MonthlyCalendarSection selectedMonth={new Date()} />);
    
    expect(screen.getByText('18/31 (58%)')).toBeInTheDocument();
    expect(screen.getByText('B+ (83%)')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Example: Month-over-month comparison
describe('Monthly Performance', () => {
  test('compares current month with previous month', async () => {
    render(<MonthlyPerformanceSection selectedMonth={new Date()} />);
    
    await waitFor(() => {
      expect(screen.getByText('+5% ↗️ IMPROVING!')).toBeInTheDocument();
      expect(screen.getByText('+1,250 (+11% ↗️)')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimizations

### 1. Data Aggregation
```typescript
// Pre-compute monthly summaries
const calculateMonthSummary = (dailyData: DailyData[]) => {
  return {
    totalXP: dailyData.reduce((sum, day) => sum + day.xpEarned, 0),
    averageGrade: calculateGrade(dailyData.reduce((sum, day) => sum + day.completionPercentage, 0) / dailyData.length),
    daysCompleted80Plus: dailyData.filter(day => day.completionPercentage >= 80).length,
    perfectDays: dailyData.filter(day => day.completionPercentage >= 95).length,
    longestStreak: calculateLongestStreak(dailyData)
  };
};
```

### 2. Lazy Loading
```typescript
// Lazy load heavy components
const TrendGraph = lazy(() => import('./components/TrendGraph'));
const HabitGrid = lazy(() => import('./components/HabitGrid'));

// Use with Suspense
<Suspense fallback={<div>Loading chart...</div>}>
  <TrendGraph data={trendData} />
</Suspense>
```

### 3. Memoization
```typescript
// Memoize expensive calculations
const monthlyStats = useMemo(() => {
  return calculateMonthlyStats(dailyData);
}, [dailyData]);

// Memoize calendar days
const CalendarDay = memo(({ day, onClick }: CalendarDayProps) => {
  return (
    <div onClick={() => onClick(day.date)}>
      {day.date.getDate()}
    </div>
  );
});
```

## Mobile Considerations

### 1. Calendar Grid
```typescript
// Responsive calendar
<div className="grid grid-cols-7 gap-px text-xs">
  {/* Sunday header */}
  <div className="text-gray-500 text-center py-1">S</div>
  {/* ... other days */}
  
  {/* Calendar days */}
  {days.map((day) => (
    <div
      key={day.date.toISOString()}
      className={cn(
        "aspect-square flex items-center justify-center",
        "text-xs sm:text-sm",
        day.isToday && "ring-2 ring-purple-500"
      )}
    >
      {day.date.getDate()}
    </div>
  ))}
</div>
```

### 2. Touch Interactions
```typescript
// Touch-friendly day selection
const handleDayTouch = (day: DayData) => {
  // Add haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
  
  // Navigate to daily view
  navigate(`/admin/lifelock/day/${format(day.date, 'yyyy-MM-dd')}`);
};
```

## Accessibility

### 1. Calendar Navigation
```typescript
// Keyboard navigation for calendar
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        navigateToPreviousDay();
        break;
      case 'ArrowRight':
        navigateToNextDay();
        break;
      case 'Enter':
        openSelectedDay();
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. Screen Reader Support
```typescript
// ARIA labels for calendar
<div
  role="gridcell"
  aria-label={`${format(day.date, 'MMMM d, yyyy')}, ${day.completionPercentage}% complete, grade ${day.grade}`}
  aria-selected={day.isSelected}
  tabIndex={0}
>
  {day.date.getDate()}
</div>
```

## Launch Checklist

### Before Merge
- [ ] All 5 pages implemented and tested
- [ ] Calendar grid displays correctly
- [ ] Month-over-month comparison works
- [ ] Events can be added and sync
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility compliant

### After Deploy
- [ ] Monitor calendar rendering performance
- [ ] Check month-over-month calculation accuracy
- [ ] Verify event sync to weekly/daily
- [ ] Gather user feedback on trends

## Future Enhancements

### V2 Features
- Year-over-year comparison
- Predictive trends
- Goal templates
- Event categories
- Export monthly report

### V3 Features
- Multi-month comparison
- Seasonal pattern detection
- AI-powered insights
- Shared calendars
- Recurring events

---

The Monthly View bridges the gap between daily tracking and yearly goals, providing the crucial "glue layer" that connects immediate actions to long-term vision.