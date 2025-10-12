# Checkout Pattern - All Time Scales
*Created: 2025-10-10*

## 🎯 Core Pattern: Every Time Scale Has a Checkout Page

**Discovery Insight:**
> "Every single section should have... every single like each week, each month, each year should have a checkout page, you know like an analysis checkout page"

---

## ✅ CHECKOUT PAGES BY TIME SCALE

### 1. DAILY CHECKOUT (Page 6) - EXISTS ✅
**Component:** `NightlyCheckoutSection.tsx`

**Questions:**
- What went well today? (bullet list)
- Even better if... (bullet list)
- Analyze your day and areas for improvement (text)
- Action items for improvement (text)
- Rate your overall day (1-10)
- Key learning from today (text)
- Tomorrow's focus (text)

**Timing:** Every evening before bed

**Pattern:**
- Reflection questions
- Rating system
- Forward-looking section ("Tomorrow's focus")
- Progress bar (shows % complete)
- Auto-saves to Supabase

---

### 2. WEEKLY CHECKOUT (Page 5) - TO BUILD

**Component:** `WeeklyCheckoutSection.tsx` (mirror daily pattern)

**Questions:**
1. What worked well this week?
   → [Text area]

2. What didn't work?
   → [Text area]

3. What did I learn?
   → [Text area]

4. What will I improve next week?
   → [Text area]

**For Next Week (Quick Focus):**
- □ [Focus area 1]
- □ [Focus area 2]
- □ [Focus area 3]

**Timing:** End of week (Sunday evening or Monday morning)

**Integration:** Appears as last section on Weekly View Page 5 (Insights & Checkout)

---

### 3. MONTHLY CHECKOUT (Page 5) - TO BUILD

**Component:** `MonthlyCheckoutSection.tsx` (mirror daily pattern)

**Questions:**
1. What worked this month?
   → [Text area]

2. What didn't work?
   → [Text area]

3. What patterns emerged?
   → [Text area]

4. What will you change next month?
   → [Text area]

**Next Month Prep:**
- Focus: [Primary focus area]
- Goals: [3-5 monthly goals preview]
- Known events: [Upcoming events]
- Areas to improve: [Specific areas]

**Timing:** End of month (last day or first of new month)

**Integration:** Appears on Monthly View Page 5 (Review & Checkout)

---

### 4. YEARLY CHECKOUT (Page 5) - TO BUILD ⚠️ MISSING!

**Component:** `YearlyCheckoutSection.tsx` (mirror daily pattern)

**Questions:**
1. What were the biggest wins of [YEAR]?
   → [Text area]

2. What were the biggest challenges?
   → [Text area]

3. What did I learn about myself this year?
   → [Text area]

4. What patterns emerged over 12 months?
   → [Text area]

5. What will I do differently in [NEXT YEAR]?
   → [Text area]

6. What am I most proud of?
   → [Text area]

**For Next Year (High-Level Focus):**
- □ Theme: [Annual theme]
- □ Primary goal: [Main goal]
- □ Health focus: [Health target]
- □ Relationship goal: [Relationship target]
- □ Business goal: [Business target]
- □ Stretch goal: [Ambitious target]

**Quarterly Roadmap Preview:**
- Q1: [Theme + key goals]
- Q2: [Theme + key goals]
- Q3: [Theme + key goals]
- Q4: [Theme + key goals]

**Timing:** End of year (December 31 or January 1)

**Integration:** Appears on Yearly View Page 5 (Yearly Checkout & Learnings)

---

### 5. LIFE REVIEW (Page 6) - TO BUILD

**Component:** `LifeReviewSection.tsx` (different pattern - periodic, not time-boxed)

**Big Picture Questions:**
1. Am I living aligned with my values?
   → [Rate 1-10] [Text area]

2. Am I making progress on my life goals?
   → [Rate 1-10] [Text area]

3. What am I most proud of in my life so far?
   → [Text area]

4. What would I regret if I died tomorrow?
   → [Text area]

5. What needs to change in my life?
   → [Text area]

6. What is my biggest priority right now?
   → [Text area]

**Life Scorecard Quick Check:**
- □ Physical Health: [ /100]
- □ Career & Work: [ /100]
- □ Financial: [ /100]
- □ Relationships: [ /100]
- □ Personal Growth: [ /100]
- □ Life Purpose: [ /100]

**Overall Life Satisfaction:** [ /100]

**Course Corrections:**
- 🔴 Critical (act now): [List]
- ⚠️ Important (soon): [List]
- 📋 Monitor: [List]

**Next Review Date:** [Date picker]

**Timing:** Quarterly or when feeling stuck/lost (not time-boxed)

**Integration:** Appears on Life View Page 6 (Life Review & Assessment)

---

## 🎨 CHECKOUT COMPONENT DESIGN (Shared Pattern)

All checkout components share this UX:

### Visual Style
```tsx
<Card className="bg-purple-900/10 border-purple-700/30">
  <CardHeader>
    <CardTitle className="flex items-center text-purple-400">
      <Icon className="h-5 w-5 mr-2" />
      [Time Scale] Check-Out
    </CardTitle>

    {/* Progress Bar */}
    <div className="mt-4">
      <div className="flex justify-between text-sm text-purple-300 mb-2">
        <span>Reflection Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-purple-900/30 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {/* Questions */}
    {/* Forward-looking section */}
  </CardContent>
</Card>
```

### Common Elements
1. **Progress bar** - shows % of reflection complete
2. **Purple color scheme** - consistent with nightly checkout
3. **Text areas** - expandable for long answers
4. **Auto-save** - debounced saves to Supabase
5. **"For [Next Period]" section** - always forward-looking
6. **Save button** (optional - auto-saves anyway)

### Icons by Time Scale
- Daily: Moon 🌙
- Weekly: Calendar 📅
- Monthly: CalendarDays 📆
- Yearly: CalendarRange 📊
- Life: Target 🎯

---

## 📊 CHECKOUT DATA STRUCTURE

### Database Schema (Supabase)

```sql
-- Daily reflections (EXISTS)
daily_reflections (
  id, user_id, date,
  wentWell[], evenBetterIf[],
  dailyAnalysis, actionItems,
  overallRating, keyLearnings, tomorrowFocus,
  bedTime
)

-- Weekly reflections (NEW)
weekly_reflections (
  id, user_id, week_start_date,
  whatWorked, whatDidntWork,
  whatLearned, whatToImprove,
  nextWeekFocus[], -- Array of focus areas
  created_at, updated_at
)

-- Monthly reflections (NEW)
monthly_reflections (
  id, user_id, month, year,
  whatWorked, whatDidntWork,
  patternsEmerged, whatToChange,
  nextMonthTheme,
  nextMonthGoals[], -- Array of goals
  nextMonthEvents[], -- Known events
  created_at, updated_at
)

-- Yearly reflections (NEW)
yearly_reflections (
  id, user_id, year,
  biggestWins, biggestChallenges,
  learnedAboutSelf, patternsOver12Months,
  doDifferently, mostProudOf,
  nextYearTheme,
  nextYearPrimaryGoal,
  nextYearHealthFocus,
  nextYearRelationshipGoal,
  nextYearBusinessGoal,
  nextYearStretchGoal,
  q1_focus, q2_focus, q3_focus, q4_focus,
  created_at, updated_at
)

-- Life reviews (NEW)
life_reviews (
  id, user_id, review_date,
  alignedWithValues, alignmentRating,
  makingProgress, progressRating,
  mostProudOf, wouldRegret, needsToChange,
  biggestPriority,
  health_score, career_score, financial_score,
  relationships_score, growth_score, purpose_score,
  overall_satisfaction,
  critical_actions[], important_actions[], monitor_items[],
  next_review_date,
  created_at, updated_at
)
```

---

## 🔄 CHECKOUT WORKFLOW

### When Checkouts Appear

**Daily:**
- Available every evening
- Persists for that date
- Can edit past days

**Weekly:**
- Unlocks Sunday evening or Monday morning
- Persists for that week
- Shows "Complete weekly checkout" reminder if not done

**Monthly:**
- Unlocks last day of month or first day of new month
- Persists for that month
- Shows reminder if month ended but checkout not done

**Yearly:**
- Unlocks December 25-31 (year-end window)
- Can also do on January 1-7
- Big reflection, takes time
- Shows reminder throughout December if not complete

**Life:**
- No unlock - always available
- Suggests quarterly (every 3 months)
- Can trigger anytime feeling stuck/lost
- Sets next review date after completion

---

## 🎯 PROGRESS TRACKING

Each checkout calculates completion:

```typescript
// Daily (existing pattern)
const fields = [
  'wentWell',      // Has at least one item
  'evenBetterIf',  // Has at least one item
  'dailyAnalysis', // Has text
  'actionItems',   // Has text
  'keyLearnings',  // Has text
  'tomorrowFocus'  // Has text
];

// Weekly
const fields = [
  'whatWorked',     // Has text
  'whatDidntWork',  // Has text
  'whatLearned',    // Has text
  'whatToImprove',  // Has text
  'nextWeekFocus'   // Has at least one item
];

// Monthly
const fields = [
  'whatWorked',
  'whatDidntWork',
  'patternsEmerged',
  'whatToChange',
  'nextMonthGoals'  // Has at least one goal
];

// Yearly
const fields = [
  'biggestWins',
  'biggestChallenges',
  'learnedAboutSelf',
  'patternsOver12Months',
  'doDifferently',
  'mostProudOf',
  'nextYearTheme'
];

// Life
const fields = [
  'alignedWithValues',
  'makingProgress',
  'mostProudOf',
  'wouldRegret',
  'needsToChange',
  'biggestPriority',
  'lifeScorecardComplete' // All 6 scores filled
];

Progress = (completed fields / total fields) × 100
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Weekly Checkout
- Most frequently used after daily
- Check 2-3 times per week
- Build first

### Phase 2: Monthly Checkout
- Used once a week to review month
- Needed for month-to-month tracking

### Phase 3: Yearly Checkout
- Used every 2 weeks during year
- Big reflection at year-end

### Phase 4: Life Review
- Periodic, not as urgent
- Build after time-boxed checkouts working

---

## 📝 CHECKOUT QUESTIONS (Master List)

### Daily (6 questions)
1. What went well?
2. Even better if?
3. Analyze your day
4. Action items
5. Key learning
6. Tomorrow's focus

### Weekly (5 questions)
1. What worked well?
2. What didn't work?
3. What did I learn?
4. What will I improve?
5. Next week focus (bullet list)

### Monthly (5 questions)
1. What worked this month?
2. What didn't work?
3. What patterns emerged?
4. What will you change?
5. Next month prep (theme, goals, events)

### Yearly (7 questions)
1. Biggest wins?
2. Biggest challenges?
3. What I learned about myself?
4. Patterns over 12 months?
5. What I'll do differently?
6. What I'm most proud of?
7. Next year focus (theme, goals, roadmap)

### Life (8 questions)
1. Living aligned with values? (+ rating)
2. Making progress on life goals? (+ rating)
3. Most proud of in life?
4. What would I regret?
5. What needs to change?
6. Biggest priority now?
7. Life scorecard (6 areas)
8. Overall life satisfaction

---

## 🎨 UX PATTERN (Consistent)

All checkouts follow same UX:
1. **Header** with icon + "X Checkout" title
2. **Progress bar** showing % complete
3. **Reflection questions** (text areas)
4. **Forward-looking section** (focus for next period)
5. **Auto-save** (debounced, shows "Saving..." indicator)
6. **Save button** (optional, triggers immediate save)

Color scheme:
- Purple gradients (matches daily checkout)
- Purple-400 for primary elements
- Purple-700/30 for borders
- Purple-900/10 for backgrounds

---

## ✅ UPDATED PAGE COUNTS

```
DAILY:   6 pages (Page 6 = Checkout ✅)
WEEKLY:  5 pages (Page 5 = Checkout ✅)
MONTHLY: 5 pages (Page 5 = Checkout ✅)
YEARLY:  5 pages (Page 5 = Checkout ✅)
LIFE:    7 pages (Page 6 = Review ✅, Page 7 = Planning)
```

**Total: 28 pages across all 5 time scales**

---

## 🚀 NEXT STEPS

1. Review daily checkout pattern (`NightlyCheckoutSection.tsx`)
2. Build WeeklyCheckoutSection (mirror pattern)
3. Build MonthlyCheckoutSection (mirror pattern)
4. Build YearlyCheckoutSection (mirror pattern)
5. Build LifeReviewSection (adapted pattern)

**Every time scale gets reflection + analysis + forward planning!** ✅
