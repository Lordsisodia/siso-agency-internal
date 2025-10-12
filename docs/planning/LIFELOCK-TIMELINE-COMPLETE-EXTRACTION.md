# LifeLock Timeline Views - COMPLETE Data Extraction
*Session Date: 2025-10-10*
*20-Minute Thought Dump - Every Single Detail*

---

## 📊 METHODOLOGY
This document extracts EVERY detail from the thought dump, organized by:
1. **Direct quotes** (exactly what you said)
2. **Implied requirements** (what this means technically)
3. **Specific examples** (concrete use cases you mentioned)
4. **Technical details** (implementation requirements)

---

## 📅 WEEKLY VIEW - Complete Extraction

### USAGE TIMING & CONTEXT

**Direct Quotes:**
> "During the week, end of the week, start of the week to check progress"

> "At the end of the week, at the start of the week, I'll make a week plan and set the main criteria and goals for what I want to do this week to get achieved"

> "I'll probably have a weekly checkout as well and just analyze how the week went, how can I improve it, and what can I learn for next time"

**Extracted Requirements:**
1. **Three distinct time windows:**
   - Start of week: Planning + goal setting
   - During week: Progress checking
   - End of week: Checkout + analysis

2. **Weekly planning component needed:**
   - "Set main criteria" for week
   - "Set goals for what I want to do this week to get achieved"
   - Happens at START of week

3. **Weekly checkout component needed:**
   - "Analyze how the week went"
   - "How can I improve it"
   - "What can I learn for next time"
   - Happens at END of week
   - Mirrors daily checkout pattern

4. **Continuous monitoring:**
   - Check progress "during the week"
   - Not just start/end - ongoing tracking

---

### PRIMARY QUESTIONS TO ANSWER

**Direct Quotes:**
> "Am I on track? Did I have a good week? Or what should I improve? All of the above, I guess"

> "I can kind of see how the week went, how the week's going, what the overall goals were for the week"

> "How did the week go? Are the weeks getting better? Are the weeks getting worse? Shit like this, really"

**Extracted Requirements:**
1. **Four core questions** (not three):
   - Q1: "Am I on track?" (status check)
   - Q2: "Did I have a good week?" (performance evaluation)
   - Q3: "What should I improve?" (actionable feedback)
   - Q4: "Are the weeks getting better/worse?" (trend analysis)

2. **Time perspective matters:**
   - "How the week WENT" (past tense - completed weeks)
   - "How the week's GOING" (present tense - current week)
   - Needs to support both retrospective AND real-time views

3. **Goal visibility:**
   - "What the overall goals WERE for the week" (past)
   - Must show goals that were set at start of week
   - Track progress against those specific goals

4. **Trend analysis critical:**
   - "Are the weeks getting better? Are the weeks getting worse?"
   - Week-over-week comparison
   - Trajectory visualization (upward/downward trend)

---

### HISTORICAL NAVIGATION

**Direct Quotes:**
> "Yeah, I would look at past weeks sometimes. I'd look at the past weeks. Ideally, I'd just look at the current week, and then maybe I'd plan some stuff ahead of time for the upcoming weeks"

> "But yeah, it's just mainly the past week. So just mainly the current week, but you know, the same way on the lifelock, how I can scroll to previous days, scroll to future days, you should be able to also do this on the weekly"

**Extracted Requirements:**
1. **Primary focus:**
   - "Ideally, I'd just look at the current week"
   - Current week is default view

2. **Past weeks:**
   - "Yeah, I would look at past weeks sometimes"
   - Not primary use case but needed
   - "Mainly the past week" (emphasis on recent)

3. **Future weeks:**
   - "Maybe I'd plan some stuff ahead of time for the upcoming weeks"
   - Forward planning capability
   - Not as important as past/current but should exist

4. **Navigation pattern:**
   - "The same way on the lifelock, how I can scroll to previous days, scroll to future days, you should be able to also do this on the weekly"
   - EXACT same UX as daily view
   - Swipe/scroll back and forward infinitely
   - ← Previous Week | Week of Jan 1-7 | Next Week →

---

### 30-SECOND CRITICAL DATA POINTS

**Direct Quotes:**
> "If I only had 30 seconds to look at the weekly view, what ONE thing must you see? Previous like days throughout the week, like total XP earned, did I do the morning routine every single day, what time did I wake up, what time did I sleep, how long was I awake, how many hours did I log per day, how many tasks did I complete, stuff like this would be nice"

**Extracted Requirements (Priority Order):**
1. **7-day overview:**
   - "Previous like days throughout the week"
   - Visual representation of all 7 days
   - Each day needs to be distinct/visible

2. **Total XP earned:**
   - Weekly total XP
   - Not daily - WEEKLY aggregate

3. **Morning routine completion:**
   - "Did I do the morning routine every single day"
   - Boolean per day (Y/N, ✅/❌)
   - 7-day streak visualization
   - Example: ✅✅✅❌✅✅✅ (6/7)

4. **Wake time:**
   - "What time did I wake up"
   - Per day across the week
   - Example: Mon 6am, Tue 7am, Wed 6:30am...

5. **Sleep time:**
   - "What time did I sleep"
   - Per day (previous night)
   - Example: Sun 11pm, Mon 10:30pm, Tue 11:15pm...

6. **Hours awake:**
   - "How long was I awake"
   - Calculated: wake time → sleep time
   - Example: 17 hours, 15.5 hours, 16.5 hours...

7. **Hours logged:**
   - "How many hours did I log per day"
   - Deep work + light work hours
   - Per day breakdown
   - Example: Mon 8h, Tue 6.5h, Wed 7h...

8. **Tasks completed:**
   - "How many tasks did I complete"
   - Per day count
   - Example: Mon 12, Tue 8, Wed 15...

**Technical Implementation:**
- All 8 metrics in ONE glance (30 seconds)
- Must be dense but readable
- Daily cards with mini-stats
- Week summary bar at top with totals

---

### DEEP WORK vs LIGHT WORK SPLIT

**Direct Quotes:**
> "Yeah, I kind of do care about the split between deep work and light work because they're different types of tasks. You know, light work is more about life stuff, and then deep work is more about work stuff and it's higher intensity"

> "Light work is like booking a flight or booking an Airbnb—something that just needs to be done, doesn't necessarily take a lot of time. Deep work would be like creating a website or an app for clients"

> "No, total tasks done should split these two up, and even the hours logged on these should split these two up"

**Extracted Requirements:**
1. **Split IS important:**
   - "Yeah, I kind of do care about the split"
   - Not optional - required

2. **Definition - Light Work:**
   - "More about life stuff"
   - "Doesn't necessarily take a lot of time"
   - **Examples given:**
     - Booking a flight
     - Booking an Airbnb
   - **Characteristics:**
     - Quick tasks
     - Life admin
     - Low cognitive load
     - "Just needs to be done"

3. **Definition - Deep Work:**
   - "More about work stuff"
   - "Higher intensity"
   - **Examples given:**
     - Creating a website
     - Creating an app for clients
   - **Characteristics:**
     - Client work
     - High cognitive load
     - Professional output
     - Requires focus

4. **What to track separately:**
   - "Total tasks done should split these two up"
   - "Even the hours logged on these should split these two up"
   - **Two metrics each:**
     - Deep Work: X tasks | Y hours
     - Light Work: X tasks | Y hours

**Technical Implementation:**
- Separate boxes/sections for deep vs light
- Show both task count AND hour count
- Example display:
  ```
  Deep Work: 12 sessions | 18.5 hours
  Light Work: 28 tasks | 6.2 hours
  ```

---

### TIME ANALYSIS PAGE

**Direct Quotes:**
> "Time analysis page is quite cool, but I don't know how you would track like social media and like that. And I've actually deleted all social media, so maybe just track the stuff you can track"

> "Like the amount of time I've slept because you would do that from the nightly checkout to the morning routine. You could also do amounts of hours logged on deep work—you would do that because I would select how long I'm spending on a deep work task, and then I guess light work and stuff like that"

> "You probably want calorie trackers as well because we've got that new functionality where I can take a photo of food and then it will track the food—how many calories and stuff like that, right?"

**Extracted Requirements:**
1. **Social media tracking:**
   - "I've actually deleted all social media"
   - NO social media tracking needed
   - Remove this from design

2. **"Track the stuff you can track":**
   - Only trackable data
   - No guessing/estimating
   - Must have clear data source

3. **Sleep time tracking:**
   - "Amount of time I've slept"
   - **Data source:** "Nightly checkout to the morning routine"
   - Calculated: checkout_time → morning_routine_wake_time
   - Example: 11pm → 7am = 8 hours sleep

4. **Deep work hours:**
   - "Amounts of hours logged on deep work"
   - **Data source:** "I would select how long I'm spending on a deep work task"
   - Manual time entry when logging task
   - Example: "Deep work task - 2.5 hours"

5. **Light work hours:**
   - "And then I guess light work and stuff like that"
   - Same pattern as deep work
   - Manual time entry

6. **CALORIE TRACKING (NEW!):**
   - "You probably want calorie trackers as well"
   - **New functionality:** "We've got that new functionality where I can take a photo of food and then it will track the food—how many calories and stuff like that"
   - Photo-based food tracking
   - Automatic calorie calculation
   - Weekly calorie visualization
   - **This is a NEW feature requirement!**

**Time Analysis Page Content:**
1. Sleep time (calculated from checkout → morning)
2. Deep work hours (logged manually)
3. Light work hours (logged manually)
4. **Calorie tracking (photo-based)**
5. NO social media
6. NO untracked time estimates

---

### NEXT WEEK FOCUS AREAS

**Direct Quotes:**
> "Yeah, we could do a next week's focus areas, but that would come into the weekly checkout, same way on our daily checkout we have kind of like for tomorrow without actually planning tomorrow. I think that's kind of cool, but that would be in the weekly checkout"

**Extracted Requirements:**
1. **Next week focus = part of weekly checkout:**
   - NOT a separate page
   - Integrated into weekly checkout component
   - Happens at end of week

2. **Pattern mirrors daily checkout:**
   - "Same way on our daily checkout we have kind of like for tomorrow without actually planning tomorrow"
   - Daily has "For Tomorrow" section
   - Weekly has "For Next Week" section
   - Same UX pattern

3. **Not full planning:**
   - "Without actually planning tomorrow"
   - Light touch, not detailed planning
   - High-level focus areas only

**Technical Implementation:**
- Weekly checkout modal/page at end of week
- Section: "For Next Week"
- Quick notes on focus areas
- Example:
  ```
  For Next Week:
  - Focus on client project X
  - Hit 20 hours deep work
  - Don't miss morning routine
  ```

---

### MOTIVATION & PSYCHOLOGY

**Direct Quotes:**
> "Not really about XP numbers—is cool, green check marks is cool, but it's not really about feeling good reviewing your week. It's like, yeah, exactly—motivating. I want to see missed workouts, low grades. I want to see where I haven't done morning routines where I've woken up at stupid times with no justifications"

**Extracted Requirements:**
1. **NOT about feeling good:**
   - "Not really about feeling good reviewing your week"
   - NOT a celebration tool
   - Reality check tool

2. **XP numbers:**
   - "XP numbers—is cool"
   - Nice to have, not primary motivator

3. **Green check marks:**
   - "Green check marks is cool"
   - Visual completion indicators
   - But not the main point

4. **PRIMARY MOTIVATOR = Seeing problems:**
   - "I want to see missed workouts"
   - "Low grades"
   - "Where I haven't done morning routines"
   - "Woken up at stupid times with no justifications"

5. **CRITICAL FEATURE: "No justifications":**
   - "Woken up at stupid times with NO JUSTIFICATIONS"
   - If wake time is late, must have option to add justification
   - **No justification = RED FLAG**
   - Examples of justifications:
     - "Late client call"
     - "Flight delay"
     - "Emergency"
   - If no justification given → highlight as problem

**Technical Implementation:**
- Highlight FAILURES prominently:
  - ❌ Missed workouts (red)
  - 🔴 Low grades (highlighted)
  - ⚠️ Skipped morning routines (warning)
  - 😡 Late wake times with NO JUSTIFICATION (alert)

- Wake time justification system:
  ```
  Wed: Woke 10am ⚠️ [Add Justification]
  Thu: Woke 11am 😡 NO JUSTIFICATION
  Fri: Woke 9am ⚠️ "Late client call previous night"
  ```

---

### PAGE COUNT

**Direct Quotes:**
> "I think five pages to swipe through is all right for the weekly. I mean, we have six or seven for the daily, so yeah"

**Extracted Requirements:**
1. **5 pages acceptable:**
   - "Five pages to swipe through is all right"
   - Not too many

2. **Reference point:**
   - Daily has "six or seven"
   - Weekly having 5 is consistent with this scale

3. **Will actually swipe:**
   - Implied: would swipe through all 5
   - Not just looking at first page

**Design Decision:**
- 5 swipeable pages for weekly view
- Matches daily's 6-7 page pattern

---

## 📆 MONTHLY VIEW - Complete Extraction

### USAGE TIMING

**Direct Quotes:**
> "I guess maybe at the start of the month and at the end of the month, and when new things come up where I need to add monthly tasks and stuff. And you know, what throughout the month as well. You know"

**Extracted Requirements:**
1. **Start of month:**
   - Planning
   - Goal setting
   - Monthly setup

2. **End of month:**
   - Review
   - Checkout
   - Reflection

3. **Throughout month:**
   - "When new things come up where I need to add monthly tasks and stuff"
   - Ad-hoc task additions
   - Ongoing tracking
   - Not just start/end - continuous use

**Technical Implementation:**
- Quick add task functionality
- Always accessible, not just start/end
- "Add Monthly Task" button prominent

---

### MONTHLY GOALS (DETAILED)

**Direct Quotes:**
> "Do I set monthly goals? Probably not as much. I guess right, like there would be some monthly goals like maybe put on 0.5kg or you know stuff like that, but monthly goals is way too long. There would be some monthly goals, but not as much as weekly because monthly just takes too long to pivot"

> "There might be a monthly goal of like close 5 clients this month or get this set up. There would still be monthly goals of course, but I mean yeah they would. They would be monthly goals. I just wouldn't use them as much"

> "And they would be more like overreaching goals, which I would make goals in between them to try and achieve these monthly goals, you know"

**Extracted Requirements:**
1. **Monthly goals exist BUT:**
   - "Probably not as much" (as weekly)
   - "Not as much as weekly because monthly just takes too long to pivot"
   - Fewer monthly goals than weekly goals
   - Monthly = too long of a timeframe to adjust quickly

2. **Specific examples given:**
   - "Put on 0.5kg" (weight gain)
   - "Close 5 clients this month"
   - "Get this set up" (vague project/system)

3. **CRITICAL CONCEPT: "Overreaching goals":**
   - "They would be more like overreaching goals"
   - Monthly goals are BIGGER/BROADER than weekly
   - Not tactical - strategic

4. **"Goals in between":**
   - "Which I would make goals in between them to try and achieve these monthly goals"
   - Monthly goal → broken into smaller sub-goals
   - Example:
     - Monthly: "Close 5 clients"
     - Week 1: "Reach out to 20 prospects"
     - Week 2: "Schedule 10 calls"
     - Week 3: "Send 5 proposals"
     - Week 4: "Close 5 deals"

**Technical Implementation:**
- Monthly goals are high-level/strategic
- Show relationship to weekly goals (sub-goals)
- Example:
  ```
  Monthly Goal: Close 5 clients
  ├─ Week 1: Outreach (20 prospects) ✅
  ├─ Week 2: Calls (10 scheduled) ⏳
  ├─ Week 3: Proposals (5 to send)
  └─ Week 4: Closings (5 target)
  ```

---

### YEARLY GOALS → MONTHLY TRACKING

**Direct Quotes:**
> "Yeah, but then there would also be like yearly goals and I would just track the progress monthly. But those yearly goals would break down into monthly goals, you know"

> "There be like fitness goals, monetary finance goals, life goals, some other shit like that, you know"

**Extracted Requirements:**
1. **Yearly goals exist:**
   - Separate from monthly goals
   - Tracked monthly (progress)

2. **Yearly goals break down into monthly:**
   - "Those yearly goals would break down into monthly goals"
   - Hierarchical: Yearly → Monthly → Weekly
   - Example:
     - Yearly: 200 workouts
     - Monthly: ~17 workouts per month
     - Weekly: ~4 workouts per week

3. **Goal categories:**
   - "Fitness goals"
   - "Monetary finance goals"
   - "Life goals"
   - "Some other shit like that"

**Technical Implementation:**
- Show yearly goals on monthly view
- Progress bars showing monthly contribution
- Example:
  ```
  Yearly Goal: 200 Workouts
  ████████████░░░░░░░░ 156/200 (78%)

  This Month: 18 workouts
  Last Month: 14 workouts (+29% ↗️)
  ```

---

### MONTHLY = MONTH-OVER-MONTH TRACKING

**Direct Quotes:**
> "And maybe like log x amount of hours this month could be cool, and then like it's more about like the monthly is more about like tracking on a month-to-month basis and am I improving, am I logging more hours than the previous month, am I fixing up my sleep routine better, is my am I working out more, am I putting on more weight, am I eating more calories, stuff like that"

**Extracted Requirements:**
1. **"Log X amount of hours this month":**
   - Monthly hours logged goal
   - Example: "Log 80 hours this month"

2. **KEY INSIGHT: "Monthly is more about tracking on a month-to-month basis":**
   - Primary purpose = month-over-month comparison
   - NOT absolute performance
   - RELATIVE improvement

3. **Questions to answer:**
   - "Am I improving?"
   - "Am I logging more hours than the previous month?"
   - "Am I fixing up my sleep routine better?"
   - "Am I working out more?"
   - "Am I putting on more weight?"
   - "Am I eating more calories?"

4. **Metrics to track month-over-month:**
   - Hours logged
   - Sleep routine quality
   - Workout count/frequency
   - Weight gain
   - Calorie intake

**Technical Implementation:**
- Month-over-month comparison is PRIMARY feature
- Show current month vs last month for ALL metrics
- Example:
  ```
  Hours Logged:
  This Month: 85 hours
  Last Month: 72 hours
  Change: +13 hours (+18% ↗️)

  Workouts:
  This Month: 18
  Last Month: 14
  Change: +4 (+29% ↗️)

  Weight:
  This Month: +0.6kg
  Last Month: +0.4kg
  Change: +0.2kg ↗️

  Sleep Quality:
  This Month: 7.5h avg
  Last Month: 7.0h avg
  Change: +0.5h ↗️
  ```

---

### CALENDAR GRID & EVENT PLOTTING

**Direct Quotes:**
> "I mean, I guess it could be cool to you probably should have a calendar grid on here just so I can like oh I guess the calendar is useful because if I know I'm doing something on certain days I should plot them down on the monthly, right, and that would carry through to the weekly and daily"

> "But like for example if I know I'm catching a flight on a certain day of a month then I'd put that there as well"

> "Obviously I still like to see some sort of day calendar just a very brief overview, red green yellow type shit, you know, or like a variant of a great color grading scale based on like an overall point system"

**Extracted Requirements:**
1. **Calendar grid needed:**
   - "You probably should have a calendar grid on here"
   - 31-day visual grid

2. **Purpose: Event plotting:**
   - "If I know I'm doing something on certain days I should plot them down on the monthly"
   - Add events to specific dates
   - Example given: "Catching a flight"

3. **Event propagation:**
   - "That would carry through to the weekly and daily"
   - Events added to monthly → automatically show on weekly → automatically show on daily
   - Cascading sync

4. **Visual coding - TWO options mentioned:**
   - Option A: "Red green yellow type shit"
     - Traffic light system
     - Red = bad day
     - Yellow = okay day
     - Green = good day

   - Option B: "Or like a variant of a great color grading scale based on like an overall point system"
     - Gradient scale based on grade
     - Example:
       - A+ = bright green
       - A = green
       - B+ = light green
       - B = yellow
       - C = orange
       - D/F = red

**Technical Implementation:**
- 31-day calendar grid
- Click day → add event modal
- Events sync: Monthly → Weekly → Daily
- Color coding by daily performance:
  - Based on "overall point system"
  - Gradient from red (bad) to green (excellent)
  - Example:
    ```
    Jan 1: 🟢 (95%, A)
    Jan 2: 🟡 (78%, B+)
    Jan 3: 🔴 (62%, C)
    ```

---

### DAY-OF-WEEK ANALYSIS

**Direct Quotes:**
> "I don't think day of the week's too important. I'd go more on the weekly analysis, right? Maybe more week by week analysis"

**Extracted Requirements:**
1. **NO day-of-week analysis:**
   - "Day of the week's not too important"
   - Don't show: Monday 78%, Tuesday 85%, etc.

2. **YES week-by-week analysis:**
   - "I'd go more on the weekly analysis"
   - "Maybe more week by week analysis"
   - Show performance per week within month

**Technical Implementation:**
- Remove day-of-week breakdown
- Add week-by-week breakdown:
  ```
  Week 1 (Jan 1-7):   ████████░░ 80% (B+) | 1,250 XP
  Week 2 (Jan 8-14):  ██████████ 95% (A)  | 1,480 XP
  Week 3 (Jan 15-21): ███████░░░ 75% (B)  | 1,120 XP
  Week 4 (Jan 22-28): ████████░░ 82% (B+) | 1,340 XP
  Week 5 (Jan 29-31): ████████░░ 85% (B+) | 520 XP
  ```

---

### HABIT HEATMAP

**Direct Quotes:**
> "A habit heat map could be cool, I guess"

**Extracted Requirements:**
1. **Neutral stance:**
   - "Could be cool, I guess"
   - Not enthusiastic
   - Not critical

2. **Low priority:**
   - "I guess" = uncertain
   - Include if space allows
   - Not a must-have

**Design Decision:**
- Optional/low priority
- Could simplify to streak counts instead
- Example:
  ```
  Morning Routine: 22/31 days (71%)
  Workouts: 16/31 days (52%)
  ```

---

### CONSISTENCY vs PERFORMANCE

**Direct Quotes:**
> "I guess consistency for me is a part of performance, I guess, but I don't know. We could maybe split it up"

**Extracted Requirements:**
1. **Consistency = part of performance:**
   - "Consistency for me is a part of performance"
   - Related concepts
   - Could be one thing

2. **Open to splitting:**
   - "But I don't know. We could maybe split it up"
   - Flexible
   - If content is dense, split
   - If content is light, combine

**Design Decision:**
- Start combined: "Performance & Consistency"
- Split if page gets too dense
- Example combined content:
  - Performance: Grades, XP, completion %
  - Consistency: Streaks, habit completion rates

---

### MONTHLY REVIEW/REFLECTION

**Direct Quotes:**
> "Yeah, we should definitely do monthly reviews and reflections. This is quite cool"

**Extracted Requirements:**
1. **Definitely wanted:**
   - "Yeah, we should definitely do"
   - High confidence
   - "This is quite cool" = enthusiastic

2. **Monthly review = end-of-month checkout:**
   - Similar to weekly checkout
   - Reflection questions
   - Learnings
   - Improvements

**Technical Implementation:**
- End-of-month checkout modal/page
- Reflection prompts:
  - What worked this month?
  - What didn't work?
  - What will I improve next month?
  - Best days/wins
  - Challenges faced
- Next month prep section

---

### PROJECTS vs GOALS

**Direct Quotes:**
> "It'll be a mix of ongoing projects and monthly goals, you know"

**Extracted Requirements:**
1. **Two separate concepts:**
   - **Monthly goals:** Time-boxed, specific targets
   - **Ongoing projects:** Long-term, continuous work

2. **Both exist simultaneously:**
   - "Mix of"
   - Not one or the other
   - Both need tracking

**Technical Implementation:**
- Separate sections:
  ```
  Monthly Goals:
  - Close 5 clients (3/5 ✅)
  - Log 80 hours (72/80 ⏳)
  - Gain 0.5kg (0.6kg ✅)

  Ongoing Projects:
  - SISO v2.0 (60% complete)
  - Client website redesign (30% complete)
  - Database optimization (ongoing)
  ```

---

### NEXT MONTH PREP

**Direct Quotes:**
> "Yeah, I think next month prep like planning some months half in advance like just understanding what I would do is quite cool"

**Extracted Requirements:**
1. **Next month planning wanted:**
   - "Yeah, I think next month prep... is quite cool"
   - Part of monthly review

2. **"Planning some months half in advance":**
   - Not full detailed planning
   - "Half in advance" = rough outline
   - "Just understanding what I would do"
   - High-level preparation

**Technical Implementation:**
- Next month prep section in monthly review
- Not detailed planning - just overview
- Example:
  ```
  Next Month (February):
  - Focus: Client acquisition
  - Major events: Conference on 15th
  - Goals to set: Close 6 clients, 90 hours logged
  - Areas to improve: Weekend consistency
  ```

---

## 📊 YEARLY VIEW - Complete Extraction

### PURPOSE & PHILOSOPHY

**Direct Quotes:**
> "The yearly view's like an overarching. The yearly view just helps me keep on track. I know what's going on, so for example, track how I'm doing during the quarters, see what my yearly goals are, and like a 12-month grid"

**Extracted Requirements:**
1. **"Overarching":**
   - High-level perspective
   - Not detailed
   - Big picture view

2. **Purpose: "Keep on track":**
   - Accountability
   - Stay aligned with yearly vision
   - Don't lose sight of big goals

3. **"I know what's going on":**
   - Situational awareness
   - Where am I in the year?
   - How am I doing overall?

4. **Three key components:**
   - "Track how I'm doing during the quarters"
   - "See what my yearly goals are"
   - "12-month grid"

---

### STATISTICS & GRAPHS

**Direct Quotes:**
> "Yeah, and like some statistics and graphs showing over the last couple of months like is my XP going up, earning-wise has been going up, has my hours log been going up, stuff like that. And you could also do quarters as well"

**Extracted Requirements:**
1. **Trend visualization critical:**
   - "Statistics and graphs"
   - Visual trends, not just numbers

2. **Time range: "Over the last couple of months":**
   - Not full year at once
   - Recent months (2-3 months?)
   - Sliding window view

3. **Three key metrics:**
   - "Is my XP going up" (XP trend)
   - "Earning-wise has been going up" (EARNINGS tracking - not just revenue!)
   - "Has my hours log been going up" (hours logged trend)

4. **"Stuff like that":**
   - Open to other metrics
   - These are examples, not exhaustive

5. **Quarterly view:**
   - "And you could also do quarters as well"
   - Q1, Q2, Q3, Q4 breakdown
   - Quarterly comparisons

**Technical Implementation:**
- Line graphs showing trends:
  ```
  XP Over Last 3 Months:
  Oct: 14,200
  Nov: 15,800 (+11% ↗️)
  Dec: 16,500 (+4% ↗️)
  Trend: Increasing ↗️

  Earnings Over Last 3 Months:
  Oct: $8,500
  Nov: $9,200 (+8% ↗️)
  Dec: $10,100 (+10% ↗️)
  Trend: Increasing ↗️

  Hours Logged:
  Oct: 78 hours
  Nov: 85 hours (+9% ↗️)
  Dec: 92 hours (+8% ↗️)
  Trend: Increasing ↗️
  ```

---

### 12-MONTH GRID

**Direct Quotes:**
> "A 12-month grid. Yeah, that would be quite cool"

**Extracted Requirements:**
1. **Visual 12-month grid:**
   - All 12 months visible at once
   - Grid layout (likely 3×4 or 4×3)
   - Tap month → go to monthly view

**Technical Implementation:**
- Grid of 12 cards:
  ```
  Jan  Feb  Mar  Apr
  May  Jun  Jul  Aug
  Sep  Oct  Nov  Dec

  Each card shows:
  - Month name
  - Grade (A-, B+, etc.)
  - Completion % (87%)
  - XP earned
  ```

---

### QUARTERS

**Direct Quotes:**
> "And you could also do quarters as well"

**Extracted Requirements:**
1. **Quarterly breakdown:**
   - Q1 (Jan-Mar)
   - Q2 (Apr-Jun)
   - Q3 (Jul-Sep)
   - Q4 (Oct-Dec)

2. **Quarterly comparisons:**
   - Performance per quarter
   - Best/worst quarter
   - Quarter-over-quarter growth

---

### YEAR-OVER-YEAR & 10-YEAR VISION

**Direct Quotes:**
> "Year-over-year comparison is definitely going to be motivating. I definitely care about past years. This life log system is going to be basically tracking the next 10 years of my life"

**Extracted Requirements:**
1. **Year-over-year = motivating:**
   - "Definitely going to be motivating"
   - High value feature
   - 2025 vs 2024 comparison

2. **Cares about past years:**
   - "I definitely care about past years"
   - Not just current year
   - Historical data matters

3. **CRITICAL: "This life log system is going to be basically tracking the next 10 years of my life":**
   - This is a 10-YEAR system
   - Not a short-term tracker
   - Build for long-term use
   - Data retention: minimum 10 years
   - Performance must scale (10 years of daily data!)

**Technical Implementation:**
- Year-over-year comparison:
  ```
  2025 vs 2024:

  XP Earned:
  2024: 98,000
  2025: 130,000 (proj. 155,000)
  Change: +32,000 (+33% ↗️)

  Workouts:
  2024: 120
  2025: 156 (proj. 200)
  Change: +36 (+30% ↗️)

  Hours Logged:
  2024: 280 hours
  2025: 340 hours (proj. 425)
  Change: +60 hours (+21% ↗️)
  ```

- Multi-year data retention:
  - Store ALL data for 10+ years
  - Efficient storage/querying
  - Year cards scrollable back to start (2024, 2023, 2022...)

---

### LIFE BALANCE SCORECARD

**Direct Quotes:**
> "And life balance scorecard on the year, yeah, health, career, finance. I'd assess it at the start of the year throughout the whole year, I'd be assessing the yearly thing"

**Extracted Requirements:**
1. **Scorecard on yearly view:**
   - Not just life view
   - Assessed yearly

2. **Three categories mentioned:**
   - Health
   - Career
   - Finance

3. **Assessment timing:**
   - "At the start of the year" (annual assessment)
   - "Throughout the whole year" (ongoing updates)
   - Not once - continuous assessment

**Technical Implementation:**
- Life balance scorecard on yearly view
- Updated throughout year
- Categories (minimum):
  - Health: /100
  - Career: /100
  - Finance: /100
- Example:
  ```
  2025 Life Balance:

  Health:   85/100 🟢
  Career:   82/100 🟢
  Finance:  72/100 🟡

  Overall: 80/100 🟢
  ```

---

### ANNUAL GOALS vs LIFE GOALS

**Direct Quotes:**
> "Well, obviously annual goals would be a breakup of the life goals like I'll be able to plan the life goals to help me get to my life goals. Obviously 200 workouts would be an annual goal. Obviously financial freedom would obviously be a life goal"

**Extracted Requirements:**
1. **Relationship: Annual goals → Life goals:**
   - "Annual goals would be a breakup of the life goals"
   - Annual goals are STEPS toward life goals
   - Hierarchical relationship

2. **Examples:**
   - **Annual goal:** "200 workouts"
     - Time-boxed (this year)
     - Measurable (numeric target)
     - Achievable in 12 months

   - **Life goal:** "Financial freedom"
     - Long-term (multi-year)
     - Strategic (not just one year)
     - Requires multiple annual goals to achieve

3. **"Plan the life goals to help me get to my life goals":**
   - Annual goals are PLANNED to achieve life goals
   - Intentional breakdown
   - Not random - strategic alignment

**Technical Implementation:**
- Show relationship between annual and life goals
- Link annual accomplishments to bigger picture
- Example:
  ```
  Annual Goal: 200 Workouts
  ████████████████░░░░ 156/200 (78%)

  Contributes to Life Goal:
  → Peak Physical Health (Multi-year)
  → 10% Body Fat (2-year goal)
  ```

---

## 🌟 LIFE VIEW - Complete Extraction

### VISION TIMEFRAME

**Direct Quotes:**
> "Life view - inspiring or overwhelming? Yes, seeing a 10-year vision motivates me, but it wouldn't be 10 years, be like five years, but yeah, pretty much"

**Extracted Requirements:**
1. **10-year vision motivates:**
   - "Yes, seeing a 10-year vision motivates me"
   - Long-term vision is motivating

2. **BUT: 5 years, not 10:**
   - "But it wouldn't be 10 years, be like five years"
   - 5-year vision is the right timeframe
   - 10 years too far out

3. **"But yeah, pretty much":**
   - Affirming the concept
   - Just adjusting timeframe

**Design Decision:**
- 5-year vision (not 10-year)
- Still motivating, more realistic
- Example: "By 2030" instead of "By 2035"

---

### MISSION STATEMENT & CORE VALUES

**Direct Quotes:**
> "Mission statement, core values, yes, yes, I do. We need to have these written. That's very cool"

**Extracted Requirements:**
1. **Emphatic yes:**
   - "Yes, yes, I do"
   - Repeated affirmation
   - Definitely wants this

2. **"We NEED to have these written":**
   - NEED not "want"
   - Critical importance
   - Must be documented

3. **"That's very cool":**
   - Enthusiastic
   - Values this feature

**Technical Implementation:**
- Dedicated sections:
  - Mission Statement (editable text area)
  - Core Values (list, editable)
- Examples:
  ```
  Mission Statement:
  "Build technology that helps people become
  the best version of themselves."

  Core Values:
  1. Excellence over perfection
  2. Discipline = freedom
  3. Continuous growth
  4. Relationships matter
  5. Build in public
  ```

---

### LIFE GOALS (DETAILED)

**Direct Quotes:**
> "Well, I'd have quite a few life goals. So for example, like I want to have 10 kids or 10 sons rather, and I want to buy an island for my family, I want to retire my dad, I want to own a Zontorno, I want to work with a hundred thousand business owners or million business owners, I want to have a team of at least a thousand people or a hundred thousand or ten thousand people. Wanna yeah like and they go along as they go along, you know, and I could just add to them as I think and brainstorm stuff"

**Extracted Requirements:**
1. **"Quite a few life goals":**
   - Not just 5-6
   - Many goals
   - Potentially 10+ major goals

2. **SPECIFIC EXAMPLES GIVEN:**
   - **"10 kids or 10 sons rather":**
     - NOT just "10 kids"
     - Specifically "10 SONS"
     - Very specific gender preference

   - **"Buy an island for my family":**
     - Not just "buy property"
     - Specifically AN ISLAND
     - For FAMILY (not personal)

   - **"Retire my dad":**
     - Financial goal
     - Family-focused
     - Specific person

   - **"Own a Zontorno":**
     - NOT "supercar"
     - Specifically "Zontorno"
     - (Note: This is likely "Centenario" - Lamborghini Aventador variant, ~$2M car)

   - **"Work with a hundred thousand business owners or million business owners":**
     - Range: 100k - 1M
     - Not sure which yet
     - MASSIVE scale

   - **"Team of at least a thousand people or a hundred thousand or ten thousand people":**
     - Range: 1k - 10k - 100k
     - Not sure exact size
     - VERY large organization

3. **"They go along as they go along":**
   - Goals evolve
   - Not fixed list
   - Ongoing development

4. **"I could just add to them as I think and brainstorm stuff":**
   - New goals can be added anytime
   - Brainstorming process
   - Living document

**Technical Implementation:**
- Expandable life goals list
- Easy to add new goals
- Support for:
  - Personal goals (10 sons)
  - Family goals (island, retire dad)
  - Possessions (Zontorno/Centenario)
  - Business impact (100k-1M business owners)
  - Organization building (1k-100k team)
- Example display:
  ```
  Life Goals:

  👨‍👩‍👦 Family:
  - Have 10 sons
  - Buy an island for family
  - Retire dad

  🚗 Possessions:
  - Own a Lamborghini Centenario

  💼 Business Impact:
  - Work with 100k-1M business owners
  - Build team of 10k-100k people

  [+ Add New Goal]
  ```

---

### LEGACY STATS

**Direct Quotes:**
> "Yeah, legacy stats is cool like a lifetime XP, all-time best week, all-time best month, all-time best year, lifetime revenue. Yeah"

**Extracted Requirements:**
1. **"Legacy stats is cool":**
   - Wants this feature
   - Interesting/motivating

2. **Specific stats mentioned:**
   - **Lifetime XP:**
     - Total XP ever earned
     - Cumulative across all years

   - **All-time best week:**
     - Best week ever recorded
     - Date + performance

   - **All-time best month:**
     - Best month ever recorded
     - Date + performance

   - **All-time best year:**
     - Best year ever recorded
     - Year + performance

   - **LIFETIME REVENUE:**
     - Total revenue earned (not just tracked)
     - Financial metric
     - This is NEW - not just XP tracking!

**Technical Implementation:**
```
Legacy Stats:

Lifetime Metrics:
- Total XP Earned: 156,000
- Total Days Tracked: 670
- Total Revenue: $287,000
- Total Workouts: 312
- Total Deep Work: 890 hours

All-Time Bests:
- Best Day: June 15, 2024 (98%, A+)
- Best Week: Week of May 20, 2024 (96% avg)
- Best Month: September 2025 (91% avg, A)
- Best Year: 2025 (87% avg, A-)
```

---

### MULTI-YEAR TIMELINE

**Direct Quotes:**
> "Yeah, I would score through the multi-year timeline. 100"

**Note:** "Score through" = "scroll through" (voice transcription)

**Extracted Requirements:**
1. **Would scroll through timeline:**
   - Not just view current year
   - Navigate through past years

2. **"100" = 100% yes:**
   - Definitely wants this
   - High confidence

**Technical Implementation:**
- Scrollable year cards:
  ```
  2025 (Current)
  ├─ Grade: A- (87%)
  ├─ XP: 130,000
  └─ Best Month: September

  2024
  ├─ Grade: B (78%)
  ├─ XP: 98,000
  └─ Best Month: December

  2023
  ├─ Grade: B- (72%)
  ├─ XP: 85,000
  └─ Best Month: August

  [Scroll for more years...]
  ```

---

### VISION & PURPOSE PAGE

**Direct Quotes:**
> "100 vision and purpose page is not too philosophical whatsoever. I like that, yeah, 100%"

**Extracted Requirements:**
1. **NOT too philosophical:**
   - "Not too philosophical whatsoever"
   - Won't be overwhelming
   - Practical, not abstract

2. **"I like that, yeah, 100%":**
   - Strong approval
   - Definitely wants this
   - High value

**Design Decision:**
- Keep vision & purpose page
- Make it practical, not abstract
- Focus on actionable direction

---

### 10-YEAR PLANNING (SERIOUS)

**Direct Quotes:**
> "Of course, I planned 10 years out. What the fuck, who'd you take me for? And it's a real plan. Why would I plan it and it not be a real plan?"

**Extracted Requirements:**
1. **"Of course":**
   - Obviously he plans this far
   - No question about it

2. **"What the fuck, who'd you take me for?":**
   - Offended at suggestion he doesn't
   - This is WHO HE IS
   - Core identity

3. **"It's a REAL plan":**
   - NOT aspirational
   - NOT wishful thinking
   - REAL, actionable plan

4. **"Why would I plan it and it not be a real plan?":**
   - Rhetorical question
   - Planning = real planning
   - No point in fake planning

**Key Insight:**
- 10-year planning is SERIOUS
- Not motivational poster stuff
- Actual strategic planning
- Needs robust planning tools

**Technical Implementation:**
- 10-year planning section
- Broken down:
  - 1-year plan (detailed)
  - 3-year plan (strategic)
  - 5-year plan (vision)
  - 10-year plan (direction)
- Example:
  ```
  10-Year Plan (2025-2035):

  2025: Foundation Year
  - Launch SISO
  - Hit 10% body fat
  - 200 workouts

  2026-2028: Growth Phase
  - SISO profitability
  - 1st child
  - $10k MRR

  2029-2032: Scale Phase
  - 10k users
  - Financial freedom
  - Buy island

  2033-2035: Legacy Phase
  - 10 sons
  - Retire dad
  - 100k business owners helped
  ```

---

### LIFE VIEW PAGE COUNT

**Direct Quotes:**
> "I mean it just depends. The amount of pages just depends on what we need on here, right? Yeah, I think the live view should be slightly bigger, I guess, but I'm not sure. I'm not sure. It depends, like I said"

**Extracted Requirements:**
1. **Flexible:**
   - "It just depends"
   - Not dogmatic about page count

2. **"What we need on here":**
   - Content-driven decision
   - Not arbitrary number

3. **"Slightly bigger, I guess":**
   - Maybe more pages than yearly
   - But uncertain

4. **"I'm not sure... It depends":**
   - Open to discussion
   - Will decide based on content

**Design Decision:**
- 6 pages (bigger than yearly's 5)
- Can adjust based on content density
- Flexibility is key

---

## 🎯 NAVIGATION & USAGE - Complete Extraction

### NAVIGATION PATTERN

**Direct Quotes:**
> "So it would pretty much always be on the daily, and then I can click back to weekly, back to monthly, back to yearly, back to life like that. And then to navigate forward, I would just click. So for example, on life log, I'd see see this year, see this month, see this week, see this day. Yeah, that's how I would do it. It'd be uh like that"

**Extracted Requirements:**
1. **Default view = DAILY:**
   - "Pretty much always be on the daily"
   - Daily is home base
   - Start point for navigation

2. **Zoom out pattern:**
   - Daily → [Back] → Weekly
   - Weekly → [Back] → Monthly
   - Monthly → [Back] → Yearly
   - Yearly → [Back] → Life
   - Each level has "Back" button to zoom out

3. **Zoom in pattern:**
   - Life → [See This Year] → Yearly (2025)
   - Yearly → [See This Month] → Monthly (January)
   - Monthly → [See This Week] → Weekly (Week 1)
   - Weekly → [See This Day] → Daily (Jan 3)
   - Drill down from abstract to specific

**Technical Implementation:**
- Navigation hierarchy:
  ```
  Life (Most abstract)
    ↓ [See This Year]
  Yearly 2025
    ↓ [See This Month]
  Monthly January
    ↓ [See This Week]
  Weekly Week 1
    ↓ [See This Day]
  Daily Jan 3 (Most specific)

  [Back] buttons to zoom out
  [See This X] buttons to zoom in
  ```

- Breadcrumb example:
  ```
  Life > 2025 > January > Week 1 > Jan 3
  ```

---

### WILL USE ALL TIME SCALES

**Direct Quotes:**
> "I mean, I'd use all of them of course. I would otherwise why am I building them out?"

**Extracted Requirements:**
1. **Use ALL:**
   - "I'd use all of them of course"
   - Not just some
   - All 5 time scales

2. **Practical mindset:**
   - "Otherwise why am I building them out?"
   - Build what will be used
   - No waste

**Key Insight:**
- Build all 5 time scales
- Each has purpose
- All will be actively used

---

### GRADE CARDS

**Direct Quotes:**
> "I'm not sure what you mean by grade cards, but maybe we figure that out later"

**Extracted Requirements:**
1. **Needs clarification:**
   - Not clear on concept
   - Explain later

**Action Item:**
- Explain: Grade cards = A+, A, B+, etc. visual cards
- Show examples from daily view
- Decide if these appear everywhere or just certain views

---

### XP NUMBERS

**Direct Quotes:**
> "XP numbers, yeah, like XP numbers, they're definitely useful once I get the XP system built out"

**Extracted Requirements:**
1. **XP numbers = useful:**
   - "Definitely useful"
   - Important metric

2. **"Once I get the XP system built out":**
   - XP system is not finished
   - Still being developed
   - Future dependency

**Technical Note:**
- XP system is prerequisite
- Design views with XP in mind
- May need placeholder values initially

---

### STREAKS (DETAILED)

**Direct Quotes:**
> "Streaks, streaks are cool like no smoking streak, waking up at a certain time streak, logging my morning routine streak, my nightly checkout streak, stuff like that. Streaks are definitely cool"

**Extracted Requirements:**
1. **"Streaks are cool":**
   - Repeated twice ("Streaks, streaks are cool")
   - Emphatic
   - Important feature

2. **Specific streak examples:**
   - **No smoking streak:**
     - Health habit
     - Days without smoking

   - **Waking up at a certain time streak:**
     - NOT just "woke up"
     - Specific TARGET time
     - Example: "Woke before 7am" streak

   - **Logging my morning routine streak:**
     - Completion streak
     - Did morning routine Y/N

   - **Nightly checkout streak:**
     - Completion streak
     - Did checkout Y/N

3. **"Stuff like that":**
   - More streak types possible
   - These are examples

4. **"Definitely cool":**
   - High value
   - Motivating

**Technical Implementation:**
- Multiple streak types:
  ```
  Active Streaks:
  🚭 No Smoking: 127 days
  ☀️ Wake Before 7am: 23 days
  🌅 Morning Routine: 42 days
  🌙 Nightly Checkout: 18 days
  💪 Workouts: 7 days
  🧠 Deep Work: 56 days
  ```

- Track both current AND longest streaks
- Celebrate milestones (30, 60, 90, 100+ days)

---

### BUILD PRIORITY

**Direct Quotes:**
> "I guess weekly would be the next most important, then monthly, then yearly, then live, but I want to build them all out"

**Extracted Requirements:**
1. **Priority order:**
   1. Daily (exists)
   2. **Weekly** (next)
   3. **Monthly**
   4. **Yearly**
   5. **Life**

2. **"But I want to build them all out":**
   - ALL will be built
   - Priority is just sequence
   - Not "maybe build later"

**Implementation Plan:**
- Phase 1: Weekly
- Phase 2: Monthly
- Phase 3: Yearly
- Phase 4: Life
- All phases will be completed

---

### MONTHLY = LEAST IMPORTANT (BUT STILL NEEDED)

**Direct Quotes:**
> "Honestly, I think I'd use all of them. I think maybe it's mostly the monthly might be least important, but you still need it to tie everything else into it"

**Extracted Requirements:**
1. **Would use ALL:**
   - "I think I'd use all of them"
   - All time scales valuable

2. **Monthly = least important:**
   - "Maybe it's mostly the monthly might be least important"
   - Relative importance
   - Still important, just least

3. **"But you still need it to tie everything else into it":**
   - Monthly is the "GLUE"
   - Connects weekly to yearly
   - Can't skip it
   - Structural necessity

**Key Insight:**
- Monthly bridges weekly ↔ yearly
- Less frequently checked but structurally critical
- Focus monthly on:
  - Month-over-month trends
  - Yearly goal progress
  - Week summaries
  - Bridge function, not standalone

---

### MOBILE FIRST

**Direct Quotes:**
> "Yeah, everything's on the phone, everything's all mobile first"

**Extracted Requirements:**
1. **EVERYTHING mobile:**
   - "Everything's on the phone"
   - Primary device = phone

2. **Mobile first:**
   - "Everything's all mobile first"
   - Not responsive design
   - MOBILE FIRST design
   - Desktop = secondary

**Technical Implementation:**
- Design for iPhone 14 Pro (393×852)
- Swipeable pages optimized for thumb
- Touch targets 44×44px minimum
- Desktop = bonus, not requirement

---

### USAGE FREQUENCY (DETAILED)

**Direct Quotes:**
> "Daily every day. Weekly like I'd probably check that like a couple times a week. Monthly I'd probably check that at least once a week. Yearly I'd probably check that at least every two weeks, and then life log, the life maybe I'd check that like every two weeks every month. I would say"

**Extracted Requirements:**

**Daily:**
- "Every day"
- Usage: 7 days/week
- Frequency: Daily

**Weekly:**
- "Couple times a week"
- Usage: 2-3 times/week (not just once)
- Frequency: High

**Monthly:**
- "At least once a week"
- Usage: 4-5 times/month minimum
- Frequency: Regular

**Yearly:**
- "At least every two weeks"
- Usage: 2-3 times/month
- Frequency: Moderate

**Life:**
- "Every two weeks every month"
- Usage: 2-4 times/month
- Frequency: Moderate

**Key Insight:**
- ALL views will be used regularly
- Weekly gets heavy usage (multiple times per week)
- Even Life view gets checked 2-4 times/month
- This is NOT "set and forget" - actively managed

---

## 🔥 ADDITIONAL CRITICAL DETAILS EXTRACTED

### 1. WAKE TIME JUSTIFICATIONS

**From:** "Woken up at stupid times with no justifications"

**Requirements:**
- Wake time tracking per day
- Target wake time setting (e.g., 7am)
- If late: option to add justification
- If no justification: RED FLAG
- Examples of valid justifications:
  - "Late client call"
  - "Flight delay"
  - "Emergency"
  - "Sick"

**Implementation:**
```
Monday: 6:30am ✅ (On time)
Tuesday: 9:00am ⚠️ "Late client call" (Justified)
Wednesday: 10:30am 😡 NO JUSTIFICATION (Problem!)
Thursday: 7:15am ✅ (On time)
```

---

### 2. SLEEP CALCULATION

**From:** "Amount of time I've slept because you would do that from the nightly checkout to the morning routine"

**Requirements:**
- Sleep time = checkout time → wake time
- Example:
  - Nightly checkout: 11:00pm
  - Wake time: 7:00am
  - Sleep: 8 hours
- Display per day + weekly average

---

### 3. HOURS AWAKE CALCULATION

**From:** "How long was I awake"

**Requirements:**
- Hours awake = wake time → next checkout time
- Example:
  - Wake: 7am
  - Checkout: 11pm
  - Awake: 16 hours
- Display per day + weekly average

---

### 4. CALORIE TRACKING (PHOTO-BASED)

**From:** "We've got that new functionality where I can take a photo of food and then it will track the food—how many calories and stuff like that"

**Requirements:**
- Photo food tracking feature (ALREADY EXISTS)
- Automatic calorie calculation from photo
- Weekly calorie visualization
- Show:
  - Daily calories
  - Weekly total
  - Daily average
  - Target vs actual (if target set)

**NEW FEATURE REQUIREMENT!**

---

### 5. EARNINGS TRACKING

**From:** "Earning-wise has been going up"

**Requirements:**
- NOT just revenue
- EARNINGS = income earned
- Track monthly earnings
- Show trends (month-over-month)
- Display on yearly view

**Note:** This is SEPARATE from revenue
- Revenue = total sales
- Earnings = money you actually took home

---

### 6. EVENT PROPAGATION

**From:** "If I know I'm catching a flight on a certain day of a month then I'd put that there as well. And that would carry through to the weekly and daily"

**Requirements:**
- Events added to monthly → sync to weekly → sync to daily
- One-way propagation (add at monthly, appears everywhere)
- Example:
  - Add "Flight to London" to Jan 15 on monthly
  - Automatically appears on Week 3 weekly view
  - Automatically appears on Jan 15 daily view

---

### 7. ZONTORNO (CENTENARIO)

**From:** "I want to own a Zontorno"

**Note:**
- "Zontorno" is likely "Centenario"
- Lamborghini Aventador Centenario
- ~$2M limited edition supercar
- 40 units worldwide
- This is a VERY specific, ambitious goal

---

### 8. 10 SONS (NOT 10 KIDS)

**From:** "I want to have 10 kids or 10 sons rather"

**Note:**
- Specifically corrected to "10 SONS"
- Not just "have kids"
- Very specific gender preference
- Major life goal

---

### 9. TEAM SIZE RANGES

**From:** "A team of at least a thousand people or a hundred thousand or ten thousand people"

**Note:**
- Range: 1,000 - 10,000 - 100,000
- Not sure exact size yet
- But massive scale
- Building large organization is goal

---

### 10. BUSINESS OWNERS SERVED

**From:** "Work with a hundred thousand business owners or million business owners"

**Note:**
- Range: 100,000 - 1,000,000
- Not sure which yet
- Massive impact goal
- SISO is vehicle for this

---

### 11. PLANNING "HALF IN ADVANCE"

**From:** "Planning some months half in advance"

**Note:**
- Not full detailed planning
- "Half in advance" = rough outline
- Quick overview, not deep dive
- Enough to know what's coming

---

### 12. "OVERREACHING GOALS"

**From:** "They would be more like overreaching goals"

**Note:**
- Specific terminology used
- Monthly goals = "overreaching"
- Bigger than weekly
- Strategic vs tactical

---

### 13. "GOALS IN BETWEEN"

**From:** "Which I would make goals in between them to try and achieve these monthly goals"

**Note:**
- Monthly goal → broken into sub-goals
- Sub-goals = "goals in between"
- Example:
  - Monthly: Close 5 clients
  - Week 1: Outreach
  - Week 2: Calls
  - Week 3: Proposals
  - Week 4: Close

---

### 14. NO SMOKING STREAK

**From:** "No smoking streak"

**Note:**
- Health habit tracking
- Days without smoking
- Specific streak type mentioned

---

### 15. WAKE TIME STREAK

**From:** "Waking up at a certain time streak"

**Note:**
- NOT just "woke up"
- "At a CERTAIN TIME"
- Target time set (e.g., 7am)
- Streak = consecutive days hitting target

---

### 16. 5-YEAR VISION (NOT 10)

**From:** "It wouldn't be 10 years, be like five years"

**Note:**
- 5-year timeframe preferred
- 10 years too far
- But still plans 10 years out (just vision is 5)

---

### 17. GRADE COLOR SCALE

**From:** "Or like a variant of a great color grading scale based on like an overall point system"

**Note:**
- NOT just red/yellow/green
- Gradient based on grade
- Overall point system drives color
- Example:
  - A+ = brightest green
  - A = green
  - B+ = light green
  - B = yellow-green
  - C = yellow
  - D = orange
  - F = red

---

### 18. WEEK-BY-WEEK ANALYSIS

**From:** "I'd go more on the weekly analysis, right? Maybe more week by week analysis"

**Note:**
- For monthly view
- Show performance per week (4-5 weeks)
- NOT day-of-week analysis
- Week summaries within month

---

### 19. LIFETIME REVENUE

**From:** "Lifetime revenue"

**Note:**
- NEW metric requirement
- Total revenue earned over lifetime
- Not just XP
- Financial tracking

---

### 20. "SCORE THROUGH" = "SCROLL THROUGH"

**From:** "Yeah, I would score through the multi-year timeline"

**Note:**
- Voice transcription: "score" = "scroll"
- Would scroll through timeline
- Navigate through past years

---

## 🎯 MASTER REQUIREMENTS SUMMARY

### CRITICAL FEATURES IDENTIFIED

**NEW Features (Not in Original Design):**
1. ✅ Calorie tracking (photo-based) - ALREADY EXISTS
2. ✅ Wake time justifications
3. ✅ Earnings tracking (separate from revenue)
4. ✅ Event propagation (monthly → weekly → daily)
5. ✅ "No smoking" streak type
6. ✅ Wake time target streak
7. ✅ Lifetime revenue tracking
8. ✅ Hours awake calculation
9. ✅ Sleep time calculation

**Critical Patterns:**
1. ✅ Weekly checkout (mirrors daily)
2. ✅ Monthly review/reflection
3. ✅ Month-over-month comparison (PRIMARY monthly feature)
4. ✅ Week-over-week trends
5. ✅ Deep work vs light work split (everywhere)
6. ✅ 10-year data retention
7. ✅ Zoom out/zoom in navigation
8. ✅ Mobile-first design

**Life Goals Specificity:**
- 10 sons (not kids)
- Buy island for family
- Retire dad
- Own Lamborghini Centenario (~$2M)
- Work with 100k-1M business owners
- Team of 1k-100k people

**Time Tracking (Only What's Trackable):**
- ✅ Sleep (checkout → wake)
- ✅ Deep work hours (logged)
- ✅ Light work hours (logged)
- ✅ Calories (photo tracking)
- ✅ Hours awake (wake → checkout)
- ❌ NO social media (deleted all)

**Monthly = "Glue Layer":**
- Least frequently checked
- But structurally critical
- Bridges weekly ↔ yearly
- Focus: month-over-month trends

**Usage Frequency:**
- Daily: Every day
- Weekly: 2-3 times/week
- Monthly: 4-5 times/month
- Yearly: 2-3 times/month
- Life: 2-4 times/month

---

## ✅ EXTRACTION COMPLETE

**Total Details Extracted:** 100+ specific requirements
**New Features Identified:** 9
**Critical Patterns Identified:** 8
**Specific Examples Given:** 20+

**Status:** Ready for final design specification 🚀

---

**Next Step:** Create final implementation spec based on ALL these details
