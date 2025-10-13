# 📊 Yearly View - Implementation Guide

## Overview

The Yearly View provides a high-level perspective of the entire year, helping users track annual goals, quarterly progress, and long-term trends. It consists of 5 swipeable pages focused on yearly achievements and growth.

## Pages Structure

### 1. Overview ⭐ (Default Page)
**Purpose**: Year at a glance - quarters, months, summary

**Key Components**:
- 12-Month Grid (visual overview of all months)
- Quarterly Breakdown (Q1-Q4 performance)
- Year Summary (total XP, average grade, completion)
- Best/Worst Months (highlighted with insights)

### 2. Goals & Milestones
**Purpose**: Track annual goals + timeline of achievements

**Key Components**:
- 2025 Annual Goals Progress (major goals with progress bars)
- Monthly Milestones Timeline (chronological achievements)
- Quarterly Targets (quarterly goal checkpoints)
- Achievement Badges (earned throughout year)

### 3. Growth & Trends
**Purpose**: See progress and evolution throughout year

**Key Components**:
- Year-over-Year Comparison (2025 vs 2024 metrics)
- Performance Trend Graph (monthly grades over time)
- Biggest Wins (record-breaking achievements)
- Lessons Learned (key insights from patterns)

### 4. Life Balance
**Purpose**: Assess balance across life areas

**Key Components**:
- Life Balance Scorecard (health, career, financial, etc.)
- Time Allocation Analysis (where time went)
- Balance Trends (how balance evolved)
- Area-Specific Insights (strengths and weaknesses)

### 5. Planning & Learnings
**Purpose**: Year-end checkout + next year vision

**Key Components**:
- Yearly Wins & Achievements (celebrate success)
- Areas for Improvement (what didn't work)
- Yearly Reflection (structured checkout)
- Next Year Vision (2026 planning)

## Technical Implementation

### Folder Structure
```
views/yearly/
├── _shared/
│   ├── YearlyTabNav.tsx         # Bottom navigation
│   ├── MonthGrid.tsx             # 12-month grid component
│   ├── QuarterCard.tsx           # Quarterly summary card
│   ├── YearlyStatsCard.tsx      # Reusable stats card
│   └── types.ts                  # Shared types
├── overview/
│   ├── YearlyOverviewSection.tsx # Main orchestrator
│   ├── components/
│   │   ├── TwelveMonthGrid.tsx    # 12-month overview
│   │   ├── QuarterlyBreakdown.tsx  # Q1-Q4 performance
│   │   ├── YearSummary.tsx        # Year statistics
│   │   └── BestWorstMonths.tsx   # Highlighted months
│   ├── hooks/
│   │   └── useYearlyOverview.ts   # Data management
│   └── utils/
│       └── yearlyCalculations.ts  # Helper functions
├── goals/
│   ├── YearlyGoalsSection.tsx
│   ├── components/
│   │   ├── AnnualGoalsProgress.tsx
│   │   ├── MilestonesTimeline.tsx
│   │   ├── QuarterlyTargets.tsx
│   │   └── AchievementBadges.tsx
│   └── hooks/
│       └── useYearlyGoals.ts
├── growth/
│   ├── YearlyGrowthSection.tsx
│   ├── components/
│   │   ├── YearOverYear.tsx
│   │   ├── PerformanceTrends.tsx
│   │   ├── BiggestWins.tsx
│   │   └── LessonsLearned.tsx
│   └── hooks/
│       └── useYearlyGrowth.ts
├── balance/
│   ├── YearlyBalanceSection.tsx
│   ├── components/
│   │   ├── LifeBalanceScorecard.tsx
│   │   ├── TimeAllocation.tsx
│   │   ├── BalanceTrends.tsx
│   │   └── AreaInsights.tsx
│   └── hooks/
│       └── useYearlyBalance.ts
└── planning/
    ├── YearlyPlanningSection.tsx
    ├── components/
    │   ├── YearlyWins.tsx
    │   ├── AreasForImprovement.tsx
    │   ├── YearlyReflection.tsx
    │   └── NextYearVision.tsx
    └── hooks/
        └── useYearlyPlanning.ts
```

## Data Architecture

### Data Sources
The Yearly View aggregates data from:
1. **Monthly Summaries** (pre-computed monthly data)
2. **Annual Goals** (year-long objectives)
3. **Achievements** (badges and milestones)
4. **Life Balance Metrics** (multi-dimensional tracking)

### Key Data Structure
```typescript
interface YearlyData {
  year: number;
  months: Array<{
    month: Date;
    completionPercentage: number;
    grade: string;
    totalXP: number;
    maxXP: number;
    bestWeek: Date;
    worstWeek: Date;
    achievements: Achievement[];
  }>;
  quarters: Array<{
    quarter: number; // 1-4
    months: Date[];
    averageCompletion: number;
    totalXP: number;
    grade: string;
    bestMonth: Date;
    worstMonth: Date;
  }>;
  yearSummary: {
    totalXP: number;
    maxXP: number;
    averageGrade: string;
    bestMonth: Date;
    worstMonth: Date;
    yearCompletion: number;
    perfectMonths: number;
  };
  annualGoals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    category: 'health' | 'career' | 'financial' | 'personal';
    status: 'active' | 'completed' | 'paused';
  }>;
  milestones: Array<{
    date: Date;
    title: string;
    description: string;
    type: 'achievement' | 'milestone' | 'record';
  }>;
  lifeBalance: {
    health: number;
    career: number;
    financial: number;
    relationships: number;
    personal: number;
    overall: number;
    trends: {
      health: number[];
      career: number[];
      financial: number[];
      relationships: number[];
      personal: number[];
    };
  };
}
```

## Implementation Steps

### Step 1: Setup Infrastructure
1. Create folder structure
2. Set up shared types and utilities
3. Create base components (YearlyTabNav, MonthGrid)
4. Set up data hooks

### Step 2: Build Overview Page
1. Create YearlyOverviewSection.tsx
2. Implement TwelveMonthGrid
3. Build QuarterlyBreakdown
4. Create YearSummary
5. Implement BestWorstMonths
6. Wire up data and test

### Step 3: Build Goals Page
1. Create YearlyGoalsSection.tsx
2. Implement AnnualGoalsProgress
3. Build MilestonesTimeline
4. Create QuarterlyTargets
5. Implement AchievementBadges
6. Connect to goals data

### Step 4: Build Growth Page
1. Create YearlyGrowthSection.tsx
2. Implement YearOverYear comparison
3. Build PerformanceTrends
4. Create BiggestWins
5. Implement LessonsLearned
6. Add trend calculations

### Step 5: Build Balance Page
1. Create YearlyBalanceSection.tsx
2. Implement LifeBalanceScorecard
3. Build TimeAllocation
4. Create BalanceTrends
5. Implement AreaInsights
6. Calculate balance metrics

### Step 6: Build Planning Page
1. Create YearlyPlanningSection.tsx
2. Implement YearlyWins
3. Build AreasForImprovement
4. Create YearlyReflection
5. Implement NextYearVision
6. Add save functionality

### Step 7: Integration & Polish
1. Wire up navigation between pages
2. Implement swipe gestures
3. Add loading states
4. Test on mobile
5. Optimize performance

## Design Patterns to Reuse

### 1. Card Component (with Orange Theme)
```typescript
// Use this pattern with orange theme for yearly
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
    <CardHeader>
      <CardTitle className="text-orange-400">
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

### 2. Month Grid Pattern
```typescript
// 12-month grid layout
<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
  {months.map((month) => (
    <MonthCard
      key={month.month}
      month={month}
      onClick={() => navigateToMonth(month.month)}
      className={cn(
        "cursor-pointer transition-all hover:scale-105",
        month.isCurrent && "ring-2 ring-orange-500"
      )}
    >
      <div className="text-center">
        <div className="text-sm font-medium">{month.name}</div>
        <div className="text-xs text-gray-400">{month.grade}</div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full"
            style={{ width: `${month.completionPercentage}%` }}
          />
        </div>
      </div>
    </MonthCard>
  ))}
</div>
```

### 3. Progress Pattern for Annual Goals
```typescript
// Annual goal progress with yearly context
<div className="space-y-4">
  {annualGoals.map((goal) => (
    <div key={goal.id} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{goal.title}</span>
        <span className="text-xs text-gray-400">
          {goal.current}/{goal.target} {goal.unit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            goal.status === 'completed' 
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : "bg-gradient-to-r from-orange-400 to-orange-600"
          )}
          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
        />
      </div>
      {goal.status === 'completed' && (
        <div className="text-xs text-green-400 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed on {format(goal.completedDate, 'MMM d')}
        </div>
      )}
    </div>
  ))}
</div>
```

## API Implementation

### Endpoint: GET /api/lifelock/yearly
```typescript
// Query parameters: ?year=2025&user_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'));
  const userId = searchParams.get('user_id');
  
  // Fetch monthly summaries for year
  const { data: monthlyData, error } = await supabase
    .from('monthly_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('month', `${year}-01-01`)
    .lte('month', `${year}-12-31`)
    .order('month');
  
  // Fetch annual goals
  const { data: goals } = await supabase
    .from('annual_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year);
  
  // Fetch milestones for year
  const { data: milestones } = await supabase
    .from('yearly_milestones')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date');
  
  // Fetch life balance data
  const { data: balanceData } = await supabase
    .from('life_balance')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date');
  
  // Calculate quarterly breakdowns
  const quarters = calculateQuarterlyData(monthlyData);
  
  // Calculate year summary
  const yearSummary = calculateYearSummary(monthlyData);
  
  return Response.json({
    year,
    months: enrichMonthlyData(monthlyData, milestones),
    quarters,
    yearSummary,
    annualGoals: goals,
    milestones,
    lifeBalance: calculateLifeBalance(balanceData)
  });
}
```

### Database Schema Additions
```sql
-- Annual goals
CREATE TABLE annual_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT,
  category TEXT, -- 'health', 'career', 'financial', 'personal'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  completed_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year, title)
);

-- Yearly milestones
CREATE TABLE yearly_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'achievement', 'milestone', 'record'
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Life balance tracking
CREATE TABLE life_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  health INTEGER CHECK (health >= 0 AND health <= 100),
  career INTEGER CHECK (career >= 0 AND career <= 100),
  financial INTEGER CHECK (financial >= 0 AND financial <= 100),
  relationships INTEGER CHECK (relationships >= 0 AND relationships <= 100),
  personal INTEGER CHECK (personal >= 0 AND personal <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Yearly summaries (pre-computed)
CREATE TABLE yearly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  year INTEGER NOT NULL,
  total_xp INTEGER,
  max_xp INTEGER,
  average_grade VARCHAR(2),
  best_month DATE,
  worst_month DATE,
  year_completion INTEGER,
  perfect_months INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year)
);
```

## Testing Strategy

### Unit Tests
```typescript
// Example: YearlyOverviewSection.test.tsx
describe('YearlyOverviewSection', () => {
  test('displays 12-month grid correctly', () => {
    const mockData = generateMockYearlyData();
    render(<YearlyOverviewSection selectedYear={2025} />);
    
    const monthCards = screen.getAllByTestId('month-card');
    expect(monthCards).toHaveLength(12);
  });
  
  test('shows quarterly breakdown', () => {
    const mockData = generateMockYearlyData();
    render(<YearlyOverviewSection selectedYear={2025} />);
    
    expect(screen.getByText('Q1: Foundation')).toBeInTheDocument();
    expect(screen.getByText('88% (A-)')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Example: Annual goals progress
describe('Yearly Goals', () => {
  test('tracks annual goal progress correctly', async () => {
    render(<YearlyGoalsSection selectedYear={2025} />);
    
    await waitFor(() => {
      expect(screen.getByText('156/200 (78%)')).toBeInTheDocument();
      expect(screen.getByText('340/500 (68%)')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimizations

### 1. Data Aggregation
```typescript
// Pre-compute yearly summaries
const calculateYearSummary = (monthlyData: MonthlyData[]) => {
  return {
    totalXP: monthlyData.reduce((sum, month) => sum + month.totalXP, 0),
    averageGrade: calculateGrade(monthlyData.reduce((sum, month) => sum + month.averageCompletion, 0) / monthlyData.length),
    bestMonth: monthlyData.reduce((best, month) => month.completionPercentage > best.completionPercentage ? month : best),
    worstMonth: monthlyData.reduce((worst, month) => month.completionPercentage < worst.completionPercentage ? month : worst),
    yearCompletion: Math.round(monthlyData.reduce((sum, month) => sum + month.completionPercentage, 0) / monthlyData.length),
    perfectMonths: monthlyData.filter(month => month.averageGrade.startsWith('A')).length
  };
};
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const quarterlyData = useMemo(() => {
  return calculateQuarterlyData(monthlyData);
}, [monthlyData]);

// Memoize month cards
const MonthCard = memo(({ month, onClick }: MonthCardProps) => {
  return (
    <div onClick={() => onClick(month.month)}>
      {/* Card content */}
    </div>
  );
});
```

### 3. Lazy Loading
```typescript
// Lazy load heavy components
const PerformanceTrends = lazy(() => import('./components/PerformanceTrends'));
const LifeBalanceScorecard = lazy(() => import('./components/LifeBalanceScorecard'));
```

## Mobile Considerations

### 1. Month Grid Layout
```typescript
// Responsive month grid
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
  {months.map((month) => (
    <div
      key={month.month}
      className="aspect-square flex flex-col justify-center p-2 sm:p-3"
    >
      <div className="text-xs sm:text-sm font-medium text-center">
        {month.name.slice(0, 3)}
      </div>
      <div className="text-lg sm:text-xl font-bold text-center">
        {month.grade}
      </div>
    </div>
  ))}
</div>
```

### 2. Touch Interactions
```typescript
// Touch-friendly month selection
const handleMonthTouch = (month: MonthData) => {
  // Add haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
  
  // Navigate to monthly view
  navigate(`/admin/lifelock/timeline?view=monthly&month=${format(month.month, 'yyyy-MM')}`);
};
```

## Accessibility

### 1. Year Navigation
```typescript
// Keyboard navigation for year
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        navigateToPreviousYear();
        break;
      case 'ArrowRight':
        navigateToNextYear();
        break;
      case 'Home':
        navigateToCurrentYear();
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. Screen Reader Support
```typescript
// ARIA labels for year overview
<div
  role="grid"
  aria-label={`Year ${year} overview with ${months.length} months`}
>
  {months.map((month) => (
    <div
      key={month.month}
      role="gridcell"
      aria-label={`${format(month.month, 'MMMM')}, grade ${month.grade}, ${month.completionPercentage}% complete`}
      tabIndex={0}
    >
      {month.name}
    </div>
  ))}
</div>
```

## Launch Checklist

### Before Merge
- [ ] All 5 pages implemented and tested
- [ ] 12-month grid displays correctly
- [ ] Quarterly breakdowns accurate
- [ ] Annual goals track properly
- [ ] Life balance calculations work
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility compliant

### After Deploy
- [ ] Monitor year-over-year calculations
- [ ] Check quarterly aggregation accuracy
- [ ] Verify goal progress tracking
- [ ] Gather user feedback on insights

## Future Enhancements

### V2 Features
- Multi-year comparison
- Predictive yearly trends
- Goal templates
- Achievement sharing
- Export yearly report

### V3 Features
- Vision board integration
- Accountability partners
- AI-powered yearly planning
- Life coaching insights
- Legacy tracking

---

The Yearly View provides the "big picture" perspective that connects daily actions to long-term vision, helping users see how their daily choices compound into annual achievements.