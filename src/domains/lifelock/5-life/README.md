
# 🌟 Life View - Implementation Guide

## Overview

The Life View provides the ultimate long-term perspective, helping users track major life goals, legacy achievements, and multi-year progress. It consists of 7 swipeable pages focused on purpose, vision, and lasting impact.

## Pages Structure

### 1. Vision ⭐ (Default Page)
**Purpose**: Life mission, values, and 5-year vision

**Key Components**:
- Life Mission Statement (core purpose)
- Core Values (5-7 fundamental values)
- 5-Year Vision (detailed future state)
- Life Philosophy (guiding principles)

### 2. Active Goals
**Purpose**: Track major life goals across categories

**Key Components**:
- Major Life Goals (5-10 big goals)
- Goal Categories (health, career, financial, relationships, personal)
- Progress Tracking (visual progress bars)
- Next Milestones (upcoming achievements)

### 3. Legacy & Stats
**Purpose**: Lifetime achievements and all-time records

**Key Components**:
- Lifetime Performance (total days, XP, streaks)
- All-Time Bests (records across all metrics)
- Financial Legacy (revenue, savings, investments)
- Impact Metrics (lives touched, projects shipped)

### 4. Multi-Year Timeline
**Purpose**: Visual timeline of life journey

**Key Components**:
- Year Cards (2020-2025+ with highlights)
- Major Life Events (career changes, moves, relationships)
- Achievement Timeline (chronological milestones)
- Life Chapters (distinct life periods)

### 5. Life Balance Scorecard
**Purpose**: Comprehensive life assessment

**Key Components**:
- Life Balance Wheel (visual balance assessment)
- Category Scores (health, career, financial, relationships, personal)
- Balance Trends (how balance evolved)
- Balance Insights (areas needing attention)

### 6. Life Review & Assessment
**Purpose**: Quarterly life checkout and course correction

**Key Components**:
- Quarterly Life Review (structured reflection)
- Course Corrections (adjustments needed)
- Priority Assessment (what matters most now)
- Life Satisfaction Score (overall happiness)

### 7. Planning & Roadmap
**Purpose**: 1/3/5/10-year life planning

**Key Components**:
- 1-Year Plan (immediate priorities)
- 3-Year Vision (mid-term goals)
- 5-Year Roadmap (major milestones)
- 10-Year Plan (ultimate life vision)

## Technical Implementation

### Folder Structure
```
views/life/
├── _shared/
│   ├── LifeTabNav.tsx           # Bottom navigation
│   ├── YearTimeline.tsx          # Multi-year timeline component
│   ├── LifeBalanceWheel.tsx      # Visual balance wheel
│   ├── LifeStatsCard.tsx         # Reusable stats card
│   └── types.ts                  # Shared types
├── vision/
│   ├── LifeVisionSection.tsx     # Main orchestrator
│   ├── components/
│   │   ├── MissionStatement.tsx   # Life mission
│   │   ├── CoreValues.tsx         # Values display
│   │   ├── FiveYearVision.tsx     # Future vision
│   │   └── LifePhilosophy.tsx    # Guiding principles
│   ├── hooks/
│   │   └── useLifeVision.ts       # Data management
│   └── utils/
│       └── visionUtils.ts         # Helper functions
├── active-goals/
│   ├── ActiveGoalsSection.tsx
│   ├── components/
│   │   ├── MajorLifeGoals.tsx
│   │   ├── GoalCategories.tsx
│   │   ├── ProgressTracking.tsx
│   │   └── NextMilestones.tsx
│   └── hooks/
│       └── useActiveGoals.ts
├── legacy/
│   ├── LifeLegacySection.tsx
│   ├── components/
│   │   ├── LifetimePerformance.tsx
│   │   ├── AllTimeBests.tsx
│   │   ├── FinancialLegacy.tsx
│   │   └── ImpactMetrics.tsx
│   └── hooks/
│       └── useLifeLegacy.ts
├── timeline/
│   ├── LifeTimelineSection.tsx
│   ├── components/
│   │   ├── YearCards.tsx
│   │   ├── MajorLifeEvents.tsx
│   │   ├── AchievementTimeline.tsx
│   │   └── LifeChapters.tsx
│   └── hooks/
│       └── useLifeTimeline.ts
├── balance/
│   ├── LifeBalanceSection.tsx
│   ├── components/
│   │   ├── LifeBalanceWheel.tsx
│   │   ├── CategoryScores.tsx
│   │   ├── BalanceTrends.tsx
│   │   └── BalanceInsights.tsx
│   └── hooks/
│       └── useLifeBalance.ts
├── review/
│   ├── LifeReviewSection.tsx
│   ├── components/
│   │   ├── QuarterlyReview.tsx
│   │   ├── CourseCorrections.tsx
│   │   ├── PriorityAssessment.tsx
│   │   └── LifeSatisfaction.tsx
│   └── hooks/
│       └── useLifeReview.ts
└── planning/
    ├── LifePlanningSection.tsx
    ├── components/
    │   ├── OneYearPlan.tsx
    │   ├── ThreeYearVision.tsx
    │   ├── FiveYearRoadmap.tsx
    │   └── TenYearPlan.tsx
    └── hooks/
        └── useLifePlanning.ts
```

## Data Architecture

### Data Sources
The Life View aggregates data from:
1. **All Previous Views** (daily, weekly, monthly, yearly)
2. **Life Goals** (long-term objectives)
3. **Life Events** (major life milestones)
4. **Legacy Data** (all-time achievements)

### Key Data Structure
```typescript
interface LifeData {
  vision: {
    missionStatement: string;
    coreValues: Array<{
      value: string;
      description: string;
      importance: number; // 1-10
    }>;
    fiveYearVision: {
      career: string;
      health: string;
      financial: string;
      relationships: string;
      personal: string;
    };
    lifePhilosophy: string;
  };
  activeGoals: Array<{
    id: string;
    title: string;
    category: 'health' | 'career' | 'financial' | 'relationships' | 'personal';
    target: string;
    currentProgress: number;
    targetValue: number;
    deadline?: Date;
    milestones: Array<{
      title: string;
      completed: boolean;
      completedDate?: Date;
    }>;
  }>;
  legacy: {
    lifetimeStats: {
      totalDaysTracked: number;
      lifetimeXP: number;
      bestDay: {
        date: Date;
        grade: string;
        xp: number;
      };
      longestStreak: number;
      totalWorkouts: number;
      totalDeepWorkHours: number;
    };
    allTimeBests: {
      longestStreak: number;
      mostXPInDay: number;
      mostXPInWeek: number;
      mostXPInMonth: number;
      bestYear: {
        year: number;
        totalXP: number;
        averageGrade: string;
      };
    };
    financialLegacy: {
      totalRevenue: number;
      totalSaved: number;
      totalInvested: number;
      netWorth: number;
    };
    impactMetrics: {
      projectsShipped: number;
      clientsHelped: number;
      peopleMentored: number;
      contentCreated: number;
    };
  };
  timeline: Array<{
    year: number;
    highlights: string[];
    majorEvents: Array<{
      date: Date;
      title: string;
      description: string;
      type: 'career' | 'personal' | 'health' | 'financial';
    }>;
    achievements: Achievement[];
    chapter: {
      title: string;
      description: string;
      startDate: Date;
      endDate?: Date;
    };
  }>;
  balance: {
    currentScores: {
      health: number;
      career: number;
      financial: number;
      relationships: number;
      personal: number;
      overall: number;
    };
    historicalScores: Array<{
      date: Date;
      scores: LifeBalanceScores;
    }>;
    insights: Array<{
      category: string;
      strength: string;
      improvement: string;
    }>;
  reviews: Array<{
    date: Date;
    type: 'quarterly' | 'annual';
    satisfactionScore: number;
    reflections: string;
    courseCorrections: string[];
    priorities: string[];
  }>;
  planning: {
    oneYear: {
      focus: string;
      priorities: string[];
      milestones: Array<{
        title: string;
        targetDate: Date;
        status: 'pending' | 'in-progress' | 'completed';
      }>;
    };
    threeYear: {
      vision: string;
      keyAchievements: string[];
    };
    fiveYear: {
      roadmap: Array<{
        year: number;
        goals: string[];
        metrics: string[];
      }>;
    };
    tenYear: {
      ultimateVision: string;
      legacyGoals: string[];
      lifeState: string;
    };
  };
}
```

## Implementation Steps

### Step 1: Setup Infrastructure
1. Create folder structure
2. Set up shared types and utilities
3. Create base components (LifeTabNav, YearTimeline)
4. Set up data hooks

### Step 2: Build Vision Page
1. Create LifeVisionSection.tsx
2. Implement MissionStatement (editable)
3. Build CoreValues display
4. Create FiveYearVision
5. Implement LifePhilosophy
6. Add edit functionality

### Step 3: Build Active Goals Page
1. Create ActiveGoalsSection.tsx
2. Implement MajorLifeGoals
3. Build GoalCategories
4. Create ProgressTracking
5. Implement NextMilestones
6. Add goal management

### Step 4: Build Legacy Page
1. Create LifeLegacySection.tsx
2. Implement LifetimePerformance
3. Build AllTimeBests
4. Create FinancialLegacy
5. Implement ImpactMetrics
6. Aggregate all-time data

### Step 5: Build Timeline Page
1. Create LifeTimelineSection.tsx
2. Implement YearCards
3. Build MajorLifeEvents
4. Create AchievementTimeline
5. Implement LifeChapters
6. Add event management

### Step 6: Build Balance Page
1. Create LifeBalanceSection.tsx
2. Implement LifeBalanceWheel (visual)
3. Build CategoryScores
4. Create BalanceTrends
5. Implement BalanceInsights
6. Calculate balance metrics

### Step 7: Build Review Page
1. Create LifeReviewSection.tsx
2. Implement QuarterlyReview
3. Build CourseCorrections
4. Create PriorityAssessment
5. Implement LifeSatisfaction
6. Add save functionality

### Step 8: Build Planning Page
1. Create LifePlanningSection.tsx
2. Implement OneYearPlan
3. Build ThreeYearVision
4. Create FiveYearRoadmap
5. Implement TenYearPlan
6. Add planning tools

### Step 9: Integration & Polish
1. Wire up navigation between pages
2. Implement swipe gestures
3. Add loading states
4. Test on mobile
5. Optimize performance

## Design Patterns to Reuse

### 1. Card Component (with Gold Theme)
```typescript
// Use this pattern with gold theme for life view
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-2xl blur-sm" />
  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
    <CardHeader>
      <CardTitle className="text-yellow-400">
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

### 2. Life Balance Wheel Pattern
```typescript
// Visual balance wheel component
<div className="relative w-64 h-64 mx-auto">
  <svg viewBox="0 0 200 200" className="transform -rotate-90">
    {/* Background circles */}
    {[20, 40, 60, 80, 100].map((radius, index) => (
      <circle
        key={index}
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />
    ))}
    
    {/* Category segments */}
    {categories.map((category, index) => {
      const angle = (360 / categories.length) * index;
      const nextAngle = (360 / categories.length) * (index + 1);
      const score = balanceScores[category.key];
      
      return (
        <path
          key={category.key}
          d={describeArc(100, 100, 80, angle, nextAngle)}
          fill="none"
          stroke={category.color}
          strokeWidth="15"
          strokeDasharray={`${score * 0.8} 100`}
          className="transition-all duration-1000"
        />
      );
    })}
  </svg>
  
  {/* Center text */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center transform rotate-90">
      <div className="text-3xl font-bold text-yellow-400">
        {overallScore}
      </div>
      <div className="text-xs text-gray-400">Life Score</div>
    </div>
  </div>
</div>
```

### 3. Timeline Pattern
```typescript
// Multi-year timeline
<div className="space-y-6">
  {years.map((year) => (
    <div key={year.year} className="relative">
      {/* Year marker */}
      <div className="absolute left-0 top-0 w-20 text-right pr-4">
        <div className="text-lg font-bold text-yellow-400">
          {year.year}
        </div>
      </div>
      
      {/* Timeline line */}
      <div className="absolute left-24 top-4 bottom-0 w-0.5 bg-gray-700" />
      
      {/* Year content */}
      <div className="ml-32 space-y-3">
        {year.highlights.map((highlight, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
            <div className="flex-1">
              <div className="text-sm">{highlight}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

## API Implementation

### Endpoint: GET /api/lifelock/life
```typescript
// Query parameters: ?user_id=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  
  // Fetch life vision
  const { data: vision } = await supabase
    .from('life_vision')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Fetch active life goals
  const { data: goals } = await supabase
    .from('life_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  // Fetch lifetime stats (aggregated)
  const { data: lifetimeStats } = await supabase
    .from('lifetime_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Fetch life events
  const { data: events } = await supabase
    .from('life_events')
    .select('*')
    .eq('user_id', userId)
    .order('date');
  
  // Fetch life balance data
  const { data: balanceData } = await supabase
    .from('life_balance')
    .select('*')
    .eq('user_id', userId)
    .order('date');
  
  // Fetch life reviews
  const { data: reviews } = await supabase
    .from('life_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('date');
  
  // Fetch life planning
  const { data: planning } = await supabase
    .from('life_planning')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return Response.json({
    vision,
    activeGoals: goals,
    legacy: {
      lifetimeStats,
      allTimeBests: calculateAllTimeBests(lifetimeStats),
      financialLegacy: calculateFinancialLegacy(userId),
      impactMetrics: calculateImpactMetrics(userId)
    },
    timeline: buildTimeline(events, lifetimeStats),
    balance: calculateLifeBalance(balanceData),
    reviews,
    planning
  });
}
```

### Database Schema Additions
```sql
-- Life vision
CREATE TABLE life_vision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  mission_statement TEXT,
  core_values JSONB, -- Array of {value, description, importance}
  five_year_vision JSONB, -- Career, health, financial, relationships, personal
  life_philosophy TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Life goals (long-term)
CREATE TABLE life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  category TEXT, -- 'health', 'career', 'financial', 'relationships', 'personal'
  target TEXT,
  current_progress INTEGER DEFAULT 0,
  target_value INTEGER,
  deadline DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  milestones JSONB, -- Array of {title, completed, completedDate}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Life events
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'career', 'personal', 'health', 'financial', 'achievement'
  importance INTEGER DEFAULT 5, -- 1-10
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lifetime stats (aggregated)
CREATE TABLE lifetime_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  total_days_tracked INTEGER DEFAULT 0,
  lifetime_xp INTEGER DEFAULT 0,
  best_day_date DATE,
  best_day_xp INTEGER,
  best_day_grade VARCHAR(2),
  longest_streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_deep_work_hours DECIMAL(10,2) DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Life reviews
CREATE TABLE life_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  type TEXT, -- 'quarterly', 'annual'
  satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
  reflections TEXT,
  course_corrections JSONB, -- Array of strings
  priorities JSONB, -- Array of strings
  created_at TIMESTAMP DEFAULT NOW()
);

-- Life planning
CREATE TABLE life_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  one_year_plan JSONB, -- Focus, priorities, milestones
  three_year_vision JSONB, -- Vision, key achievements
  five_year_roadmap JSONB, -- Year-by-year roadmap
  ten_year_plan JSONB, -- Ultimate vision, legacy goals
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Strategy

### Unit Tests
```typescript
// Example: LifeVisionSection.test.tsx
describe('LifeVisionSection', () => {
  test('displays mission statement correctly', () => {
    const mockVision = generateMockLifeVision();
    render(<LifeVisionSection vision={mockVision} />);
    
    expect(screen.getByText('Build technology that helps people')).toBeInTheDocument();
  });
  
  test('shows core values', () => {
    const mockVision = generateMockLifeVision();
    render(<LifeVisionSection vision={mockVision} />);
    
    expect(screen.getByText('Excellence Over Perfection')).toBeInTheDocument();
    expect(screen.getByText('Discipline = Freedom')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Example: Life balance calculation
describe('Life Balance', () => {
  test('calculates life balance correctly', async () => {
    render(<LifeBalanceSection userId="test-user" />);
    
    await waitFor(() => {
      expect(screen.getByText('81/100')).toBeInTheDocument();
      expect(screen.getByText('Thriving')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimizations

### 1. Data Aggregation
```typescript
// Pre-compute lifetime stats
const calculateLifetimeStats = async (userId: string) => {
  // Aggregate from all yearly summaries
  const { data: yearlyData } = await supabase
    .from('yearly_summaries')
    .select('total_xp, perfect_months')
    .eq('user_id', userId);
  
  return {
    totalDaysTracked: yearlyData.reduce((sum, year) => sum + (year.total_xp / 100), 0),
    lifetimeXP: yearlyData.reduce((sum, year) => sum + year.total_xp, 0),
    perfectDays: yearlyData.reduce((sum, year) => sum + year.perfect_months, 0)
  };
};
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const lifeBalance = useMemo(() => {
  return calculateLifeBalance(balanceData);
}, [balanceData]);

// Memoize timeline
const timeline = useMemo(() => {
  return buildTimeline(events, lifetimeStats);
}, [events, lifetimeStats]);
```

### 3. Lazy Loading
```typescript
// Lazy load heavy components
const LifeBalanceWheel = lazy(() => import('./components/LifeBalanceWheel'));
const YearTimeline = lazy(() => import('./components/YearTimeline'));
```

## Mobile Considerations

### 1. Balance Wheel
```typescript
// Responsive balance wheel
<div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto">
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* SVG content */}
  </svg>
</div>
```

### 2. Timeline Navigation
```typescript
// Touch-friendly timeline
<div className="overflow-x-auto pb-4">
  <div className="flex space-x-4 min-w-max">
    {years.map((year) => (
      <YearCard
        key={year.year}
        year={year}
        className="w-64 flex-shrink-0"
        onTouchEnd={() => handleYearSelect(year)}
      />
    ))}
  </div>
</div>
```

## Accessibility

### 1. Life Navigation
```typescript
// Keyboard navigation for life sections
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key) {
        case '1':
          setActiveTab('vision');
          break;
        case '2':
          setActiveTab('goals');
          break;
        // ... other shortcuts
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. Screen Reader Support
```typescript
// ARIA labels for life balance
<div
  role="img"
  aria-label={`Life balance wheel. Overall score: ${overallScore} out of 100. Health: ${health}%, Career: ${career}%, Financial: ${financial}%, Relationships: ${relationships}%, Personal: ${personal}%`}
>
  {/* Balance wheel SVG */}
</div>
```

## Launch Checklist

### Before Merge
- [ ] All 7 pages implemented and tested
- [ ] Life balance wheel renders correctly
- [ ] Timeline displays all years
- [ ] Goals track properly
- [ ] Vision is editable
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility compliant

### After Deploy
- [ ] Monitor lifetime stats calculations
- [ ] Check balance wheel rendering
- [ ] Verify goal progress tracking
- [ ] Gather user feedback on life planning

## Future Enhancements

### V2 Features
- Life coaching integration
- Accountability partners
- Legacy planning tools
- Life story generator
- Achievement sharing

### V3 Features
- AI life insights
- Predictive life modeling
- Multi-life comparison
- Legacy impact calculator
- Life purpose discovery

---

The Life View provides the ultimate "why" behind all daily actions, connecting immediate tasks to lifelong purpose and legacy. It's the culmination of the entire LifeLock system.
  };
