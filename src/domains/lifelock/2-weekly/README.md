# 📅 Weekly View - Implementation Guide

## Overview

The Weekly View provides a comprehensive overview of weekly performance, helping users answer "Am I on track? Good week? What to improve? Getting better?" It consists of 5 swipeable pages with detailed analytics and insights.

## Pages Structure

### 1. Overview ⭐ (Default Page)
**Purpose**: 30-second health check - answer all 4 core questions at once

**Key Components**:
- Week Status Header (date range, overall grade, XP, trend)
- 7-Day Performance Cards (reuse StatisticalWeekView pattern)
- Week Summary Stats (completion, averages, best/worst days)
- Active Streaks (morning routine, workouts, deep work, etc.)
- Red Flags & Problems (critical issues, missed items, low performance)

### 2. Productivity
**Purpose**: Work output analysis - "What did I accomplish?"

**Key Components**:
- Deep Work Breakdown (hours, sessions, daily breakdown)
- Light Work Completion (tasks, hours, breakdown)
- Priority Breakdown (P1-P4 completion rates)
- Week-over-Week Comparison (trends, improvements)

### 3. Wellness
**Purpose**: Health tracking - "Did I take care of myself?"

**Key Components**:
- Workout Summary (completion, time, types)
- Health Habits Checklist (morning routine, checkout, water, sleep)
- Energy & Sleep Analysis (sleep quality, energy levels)
- Nutrition & Calories (intake tracking, weight change)

### 4. Time Analysis
**Purpose**: Time audit - "Where did my time actually go?"

**Key Components**:
- Sleep & Awake Time (daily breakdown, averages)
- Logged Work Hours (deep vs light work)
- Wake Time Analysis (on-time rate, justifications)
- Time Utilization Summary (tracked vs untracked time)

### 5. Insights & Checkout
**Purpose**: Learning & improvement - "What worked? What didn't? What's next?"

**Key Components**:
- Weekly Wins (achievements, personal bests, streaks)
- Problems & Red Flags (critical issues, areas needing work)
- Week-over-Week Trends (progress vs last week)
- Weekly Checkout Component (reflection questions, next week focus)

## Technical Implementation

### Folder Structure
```
views/weekly/
├── _shared/
│   ├── WeeklyTabNav.tsx          # Bottom navigation
│   ├── WeekGrid.tsx              # 7-day grid component
│   ├── WeeklyStatsCard.tsx       # Reusable stats card
│   ├── StreakTracker.tsx         # Streak visualization
│   └── types.ts                  # Shared types
├── overview/
│   ├── WeeklyOverviewSection.tsx # Main orchestrator
│   ├── components/
│   │   ├── WeekStatusHeader.tsx   # Week info header
│   │   ├── SevenDayCards.tsx      # Daily performance cards
│   │   ├── WeekSummaryStats.tsx   # Summary statistics
│   │   ├── ActiveStreaks.tsx      # Current streaks
│   │   └── RedFlags.tsx           # Problems & issues
│   ├── hooks/
│   │   └── useWeeklyOverview.ts   # Data management
│   └── utils/
│       └── weeklyCalculations.ts  # Helper functions
├── productivity/
│   ├── WeeklyProductivitySection.tsx
│   ├── components/
│   │   ├── DeepWorkBreakdown.tsx
│   │   ├── LightWorkCompletion.tsx
│   │   ├── PriorityBreakdown.tsx
│   │   └── WeekOverWeekComparison.tsx
│   └── hooks/
│       └── useWeeklyProductivity.ts
├── wellness/
│   ├── WeeklyWellnessSection.tsx
│   ├── components/
│   │   ├── WorkoutSummary.tsx
│   │   ├── HealthHabitsGrid.tsx
│   │   ├── EnergySleepAnalysis.tsx
│   │   └── NutritionTracker.tsx
│   └── hooks/
│       └── useWeeklyWellness.ts
├── time-analysis/
│   ├── WeeklyTimeAnalysisSection.tsx
│   ├── components/
│   │   ├── SleepAnalysis.tsx
│   │   ├── WorkHoursBreakdown.tsx
│   │   ├── WakeTimeAnalysis.tsx
│   │   └── TimeUtilization.tsx
│   └── hooks/
│       └── useWeeklyTimeAnalysis.ts
└── checkout/
    ├── WeeklyCheckoutSection.tsx
    ├── components/
    │   ├── WeeklyWins.tsx
    │   ├── ProblemsRedFlags.tsx
    │   ├── WeekOverWeekTrends.tsx
    │   └── WeeklyCheckout.tsx
    └── hooks/
        └── useWeeklyCheckout.ts
```

## Data Architecture

### Data Sources
The Weekly View aggregates data from:
1. **Daily Data** (lifelock_daily_data table)
2. **Task Data** (tasks and subtasks)
3. **Health Data** (workouts, nutrition, sleep)
4. **Reflection Data** (daily checkouts)

### Key Data Structure
```typescript
interface WeeklyData {
  weekStart: Date;
  weekEnd: Date;
  dailyData: Array<{
    date: Date;
    grade: string; // A+, A, B+, etc.
    completionPercentage: number;
    xpEarned: number;
    morningRoutine: boolean;
    deepWorkHours: number;
    lightWorkTasks: number;
    workout: boolean;
    sleepHours: number;
    wakeTime: string;
    checkout: boolean;
  }>;
  summary: {
    totalXP: number;
    averageGrade: string;
    completionPercentage: number;
    streaks: {
      morningRoutine: number;
      deepWork: number;
      workouts: number;
      checkout: number;
    };
    bestDay: {
      date: Date;
      grade: string;
      xp: number;
    };
    worstDay: {
      date: Date;
      grade: string;
      issues: string[];
    };
  };
}
```

## Implementation Steps

### Step 1: Setup Infrastructure
1. Create folder structure
2. Set up shared types and utilities
3. Create base components (WeeklyTabNav, WeekGrid)
4. Set up data hooks

### Step 2: Build Overview Page
1. Create WeeklyOverviewSection.tsx
2. Implement WeekStatusHeader
3. Adapt StatisticalWeekView for SevenDayCards
4. Build WeekSummaryStats
5. Implement ActiveStreaks
6. Create RedFlags component
7. Wire up data and test

### Step 3: Build Productivity Page
1. Create WeeklyProductivitySection.tsx
2. Implement DeepWorkBreakdown (chart + list)
3. Build LightWorkCompletion
4. Create PriorityBreakdown (visual breakdown)
5. Implement WeekOverWeekComparison
6. Add data aggregation logic

### Step 4: Build Wellness Page
1. Create WeeklyWellnessSection.tsx
2. Implement WorkoutSummary
3. Build HealthHabitsGrid (7x5 grid)
4. Create EnergySleepAnalysis
5. Add NutritionTracker
6. Connect to health data sources

### Step 5: Build Time Analysis Page
1. Create WeeklyTimeAnalysisSection.tsx
2. Implement SleepAnalysis
3. Build WorkHoursBreakdown
4. Create WakeTimeAnalysis
5. Implement TimeUtilization
6. Add time calculations

### Step 6: Build Checkout Page
1. Create WeeklyCheckoutSection.tsx
2. Implement WeeklyWins
3. Build ProblemsRedFlags
4. Create WeekOverWeekTrends
5. Implement WeeklyCheckout component
6. Add reflection saving

### Step 7: Integration & Polish
1. Wire up navigation between pages
2. Implement swipe gestures
3. Add loading states
4. Test on mobile
5. Optimize performance

## Design Patterns to Reuse

### 1. Card Component (from Morning Routine)
```typescript
// Use this exact pattern with blue theme
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
    <CardHeader>
      <CardTitle className="text-blue-400">
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

### 2. Data Hook Pattern (from Light Work)
```typescript
export function useWeeklyData({ selectedWeek }: { selectedWeek: Date }) {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadWeeklyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lifelock/weekly?start=${format(selectedWeek, 'yyyy-MM-dd')}`);
      const weeklyData = await response.json();
      setData(weeklyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);
  
  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);
  
  return {
    data,
    loading,
    error,
    refresh: loadWeeklyData
  };
}
```

### 3. Navigation Pattern (from Daily View)
```typescript
// Reuse TabLayoutWrapper with weekly theme
<TabLayoutWrapper
  tabs={[
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'productivity', label: 'Work', icon: Briefcase },
    { id: 'wellness', label: 'Health', icon: Heart },
    { id: 'time', label: 'Time', icon: Clock },
    { id: 'checkout', label: 'Review', icon: CheckCircle }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  theme="blue"
>
  {children}
</TabLayoutWrapper>
```

## API Implementation

### Endpoint: GET /api/lifelock/weekly
```typescript
// Query parameters: ?start=2025-01-01&user_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get('start');
  const userId = searchParams.get('user_id');
  
  // Calculate week end
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  // Fetch daily data for the week
  const { data: dailyData, error } = await supabase
    .from('lifelock_daily_data')
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekStart)
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date');
  
  if (error) throw error;
  
  // Calculate weekly summary
  const summary = calculateWeeklySummary(dailyData);
  
  return Response.json({
    weekStart,
    weekEnd: format(endDate, 'yyyy-MM-dd'),
    dailyData,
    summary
  });
}
```

### Database Function: calculateWeeklySummary
```sql
CREATE OR REPLACE FUNCTION calculate_weekly_summary(
  user_id_param UUID,
  week_start_param DATE
)
RETURNS TABLE (
  total_xp INTEGER,
  average_grade VARCHAR(2),
  completion_percentage INTEGER,
  morning_routine_streak INTEGER,
  deep_work_streak INTEGER,
  workout_streak INTEGER,
  checkout_streak INTEGER
) AS $$
DECLARE
  week_end DATE := week_start_param + INTERVAL '6 days';
BEGIN
  RETURN QUERY
  SELECT
    SUM(xp_earned) as total_xp,
    (SELECT grade FROM calculate_grade(AVG(completion_percentage))) as average_grade,
    ROUND(AVG(completion_percentage)) as completion_percentage,
    (SELECT calculate_streak(user_id_param, 'morning_routine', week_start_param)) as morning_routine_streak,
    (SELECT calculate_streak(user_id_param, 'deep_work', week_start_param)) as deep_work_streak,
    (SELECT calculate_streak(user_id_param, 'workout', week_start_param)) as workout_streak,
    (SELECT calculate_streak(user_id_param, 'checkout', week_start_param)) as checkout_streak
  FROM lifelock_daily_data
  WHERE user_id = user_id_param
    AND date >= week_start_param
    AND date <= week_end;
END;
$$ LANGUAGE plpgsql;
```

## Testing Strategy

### Unit Tests
```typescript
// Example: WeeklyOverviewSection.test.tsx
describe('WeeklyOverviewSection', () => {
  test('displays week status header correctly', () => {
    const mockData = generateMockWeeklyData();
    render(<WeeklyOverviewSection selectedWeek={new Date()} />);
    
    expect(screen.getByText('Week of January 1-7, 2025')).toBeInTheDocument();
    expect(screen.getByText('B+ (82%)')).toBeInTheDocument();
  });
  
  test('shows 7-day performance cards', () => {
    const mockData = generateMockWeeklyData();
    render(<WeeklyOverviewSection selectedWeek={new Date()} />);
    
    const dayCards = screen.getAllByTestId('day-card');
    expect(dayCards).toHaveLength(7);
  });
});
```

### Integration Tests
```typescript
// Example: Weekly navigation test
describe('Weekly View Navigation', () => {
  test('navigates between weekly pages', async () => {
    render(<WeeklyView selectedWeek={new Date()} />);
    
    // Click on Productivity tab
    fireEvent.click(screen.getByText('Productivity'));
    
    await waitFor(() => {
      expect(screen.getByText('Deep Work Breakdown')).toBeInTheDocument();
    });
  });
  
  test('swipes between pages', async () => {
    render(<WeeklyView selectedWeek={new Date()} />);
    
    const container = screen.getByTestId('weekly-container');
    
    // Swipe left
    fireEvent.touchStart(container, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(container, { touches: [{ clientX: 0 }] });
    
    await waitFor(() => {
      expect(screen.getByText('Productivity')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimizations

### 1. Data Caching
```typescript
// Use SWR with 5-minute cache
const { data: weeklyData } = useSWR(
  `/api/lifelock/weekly?start=${format(weekStart, 'yyyy-MM-dd')}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 0 // Manual refresh only
  }
);
```

### 2. Component Memoization
```typescript
// Memoize expensive calculations
const weekSummary = useMemo(() => {
  return calculateWeekSummary(dailyData);
}, [dailyData]);

// Memoize day cards
const DayCard = memo(({ dayData }: { dayData: DailyData }) => {
  return <div>{/* card content */}</div>;
});
```

### 3. Virtualization (if needed)
```typescript
// For long lists (achievements, etc.)
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }: { items: any[] }) => (
  <List
    height={300}
    itemCount={items.length}
    itemSize={60}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {/* Render item */}
      </div>
    )}
  </List>
);
```

## Mobile Considerations

### 1. Touch Targets
- Minimum 44×44px for all interactive elements
- Adequate spacing between touch targets
- Swipe gesture sensitivity (100px threshold)

### 2. Layout Adaptations
```typescript
// Responsive design patterns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
  {/* Day cards */}
</div>

<div className="px-2 sm:px-4 lg:px-6">
  {/* Content padding */}
</div>
```

### 3. Performance
- Lazy load images
- Optimize animations for 60fps
- Reduce re-renders during swipe

## Accessibility

### 1. Semantic HTML
```typescript
// Use proper semantic elements
<section aria-labelledby="week-overview-title">
  <h2 id="week-overview-title">Week Overview</h2>
  {/* Content */}
</section>
```

### 2. ARIA Labels
```typescript
// Add descriptive labels
<button
  aria-label="View previous week"
  onClick={previousWeek}
>
  <ChevronLeft />
</button>
```

### 3. Keyboard Navigation
- Tab order follows visual flow
- Escape key closes modals
- Arrow keys navigate cards

## Launch Checklist

### Before Merge
- [ ] All 5 pages implemented and tested
- [ ] Navigation works smoothly
- [ ] Data loads correctly
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Error handling in place

### After Deploy
- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Gather user feedback
- [ ] Track usage patterns
- [ ] Plan improvements

## Future Enhancements

### V2 Features
- Week comparison (this week vs last week)
- Weekly goals setting
- AI-powered insights
- Export weekly report
- Share weekly progress

### V3 Features
- Team weekly views
- Weekly challenges
- Streak competitions
- Predictive analytics
- Voice reflections

---

The Weekly View is the foundation for the entire timeline system. Get this right, and the Monthly, Yearly, and Life views will follow the same proven patterns.
