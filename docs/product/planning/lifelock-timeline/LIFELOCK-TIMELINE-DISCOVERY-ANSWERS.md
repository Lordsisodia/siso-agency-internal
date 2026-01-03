# LifeLock Timeline Views - Discovery Session Answers
*Session Date: 2025-10-10*
*Format: Raw thought dump → Key insights*

---

## 📅 WEEKLY VIEW - What Actually Matters

### When You'd Look at Weekly View
**Raw Answer:**
- "During the week, end of the week, start of the week to check progress"
- "At the end of the week, at the start of the week, I'll make a week plan and set the main criteria and goals for what I want to do this week"
- "I'll probably have a weekly checkout as well and just analyze how the week went, how can I improve it, and what can I learn for next time"

**Key Insight:**
- **3 distinct use cases:**
  1. **Start of week**: Plan & set goals
  2. **During week**: Check progress
  3. **End of week**: Checkout & analyze

**Design Implication:**
- Need both PLANNING mode and REVIEW mode
- Weekly checkout component (like daily checkout but for week)

---

### #1 Question to Answer
**Raw Answer:**
- "Am I on track? Did I have a good week? Or what should I improve? All of the above, I guess"
- "I can kind of see how the week went, how the week's going, what the overall goals were for the week"
- "How did the week go? Are the weeks getting better? Are the weeks getting worse?"

**Key Insight:**
- Not one question - it's THREE:
  1. Current status: "Am I on track?"
  2. Performance: "Did I have a good week?"
  3. Improvement: "What should I improve?"
  4. PLUS trend: "Am I getting better over time?"

**Design Implication:**
- First page MUST show all three at once
- Need week-over-week trend visualization

---

### Past Weeks Usage
**Raw Answer:**
- "Yeah, I would look at past weeks sometimes"
- "Ideally, I'd just look at the current week, and then maybe I'd plan some stuff ahead of time for the upcoming weeks"
- "Same way on the lifelock, how I can scroll to previous days, scroll to future days, you should be able to also do this on the weekly"

**Key Insight:**
- Mostly current week, but needs ability to scroll back/forward
- Same navigation pattern as daily view

**Design Implication:**
- Top nav: ← Previous Week | Week of Jan 1-7 | Next Week →
- Can scroll infinitely back/forward like daily

---

### 30-Second Glance View
**Raw Answer:**
- "Previous like days throughout the week"
- "Total XP earned"
- "Did I do the morning routine every single day"
- "What time did I wake up"
- "What time did I sleep"
- "How long was I awake"
- "How many hours did I log per day"
- "How many tasks did I complete"

**Key Insight:**
- **Priority data points (in order):**
  1. 7-day overview (visual cards)
  2. Total XP earned
  3. Morning routine completion (Y/N each day)
  4. Wake/sleep times
  5. Hours awake
  6. Hours logged
  7. Tasks completed

**Design Implication:**
- First page = dense dashboard with ALL these metrics
- 7 daily cards with mini-stats per day
- Week summary bar at top

---

### Deep Work vs Light Work Split
**Raw Answer:**
- "Yeah, I kind of do care about the split between deep work and light work because they're different types of tasks"
- "Light work is more about life stuff, and then deep work is more about work stuff and it's higher intensity"
- "Light work is like booking a flight or booking an Airbnb—something that just needs to be done, doesn't necessarily take a lot of time"
- "Deep work would be like creating a website or an app for clients"
- "Total tasks done should split these two up, and even the hours logged on these should split these two up"

**Key Insight:**
- Split IS important
- Different categories:
  - **Light work** = Life admin (flights, Airbnb, quick tasks)
  - **Deep work** = High-intensity work (websites, apps, client work)
- Track BOTH tasks AND hours separately

**Design Implication:**
- Separate boxes for deep work vs light work
- Show both task count AND hours logged for each
- Example:
  - Deep Work: 12 sessions | 18.5 hours
  - Light Work: 28 tasks | 6.2 hours

---

### Time Analysis Page
**Raw Answer:**
- "Time analysis page is quite cool, but I don't know how you would track like social media"
- "I've actually deleted all social media"
- "Maybe just track the stuff you can track, like the amount of time I've slept because you would do that from the nightly checkout to the morning routine"
- "Amounts of hours logged on deep work—you would do that because I would select how long I'm spending on a deep work task"
- "Light work and stuff like that"
- "You probably want calorie trackers as well because we've got that new functionality where I can take a photo of food and then it will track the food—how many calories"

**Key Insight:**
- NO social media tracking (doesn't use it)
- Only track what CAN be tracked:
  1. Sleep time (checkout → morning routine)
  2. Deep work hours (logged manually)
  3. Light work hours (logged manually)
  4. **CALORIE TRACKING** (new photo feature!)

**Design Implication:**
- Time analysis = trackable time only
- Remove "time wasters" section
- ADD calorie tracking visualization
- Show: Sleep | Deep Work | Light Work | Calories

---

### Next Week Focus Areas
**Raw Answer:**
- "Yeah, we could do a next week's focus areas, but that would come into the weekly checkout"
- "Same way on our daily checkout we have kind of like for tomorrow without actually planning tomorrow"

**Key Insight:**
- Next week focus = part of WEEKLY CHECKOUT
- Same pattern as daily checkout ("for tomorrow" section)
- Not a separate page

**Design Implication:**
- Weekly checkout component at end of week
- Includes "For Next Week" section
- Mirrors daily checkout structure

---

### Motivation (What Makes You Feel Good/Bad)
**Raw Answer:**
- "Not really about XP numbers—is cool, green check marks is cool, but it's not really about feeling good reviewing your week"
- "It's like, yeah, exactly—motivating. I want to see missed workouts, low grades"
- "I want to see where I haven't done morning routines where I've woken up at stupid times with no justifications"

**Key Insight:**
- **NOT about feeling good**
- Wants to see PROBLEMS:
  - Missed workouts ❌
  - Low grades 🔴
  - Skipped morning routines ⚠️
  - Late wake times with no justification 😡

**Design Implication:**
- Highlight FAILURES prominently
- Red/yellow warnings for problems
- "No justification" indicator for bad wake times
- Don't sugarcoat - show the truth

---

### Page Count
**Raw Answer:**
- "I think five pages to swipe through is all right for the weekly"
- "We have six or seven for the daily, so yeah"

**Key Insight:**
- 5 pages is acceptable
- Daily has 6-7, so weekly having 5 is consistent

**Design Implication:**
- Stick with 5 pages for weekly view

---

## 📆 MONTHLY VIEW - What Actually Matters

### When You'd Look at Monthly View
**Raw Answer:**
- "I guess maybe at the start of the month and at the end of the month"
- "When new things come up where I need to add monthly tasks and stuff"
- "Throughout the month as well"

**Key Insight:**
- **3 use cases:**
  1. Start of month (planning)
  2. End of month (review)
  3. Throughout month (adding tasks)

**Design Implication:**
- Need both planning and tracking modes
- Easy way to add monthly tasks on the fly

---

### Monthly Goals
**Raw Answer:**
- "Do I set monthly goals? Probably not as much"
- "There would be some monthly goals like maybe put on 0.5kg or you know stuff like that, but monthly goals is way too long. There would be some monthly goals, but not as much as weekly because monthly just takes too long to pivot"
- "They would be more like overreaching goals, which I would make goals in between them to try and achieve these monthly goals"
- "There be like fitness goals, monetary finance goals, life goals, some other shit like that"
- "Maybe like log x amount of hours this month could be cool"
- "Monthly is more about like tracking on a month-to-month basis and am I improving"
- "Am I logging more hours than the previous month, am I fixing up my sleep routine better, is my am I working out more, am I putting on more weight, am I eating more calories"

**Key Insight:**
- Monthly goals exist but are **overarching/strategic**
- Monthly = too long to pivot quickly
- Examples:
  - Put on 0.5kg
  - Close 5 clients
  - Log X hours
  - Fitness/finance/life goals
- **Monthly is MORE about tracking improvement month-over-month**:
  - More hours than last month?
  - Better sleep?
  - More workouts?
  - More weight/calories?

**Design Implication:**
- Monthly goals = fewer, bigger targets
- Focus on TRENDS: "This month vs last month"
- Month-over-month comparison is KEY
- Example:
  - Hours logged: 85 (last month: 72) ↗️ +18%
  - Workouts: 18 (last month: 14) ↗️ +29%
  - Weight: +0.6kg ✅ (goal: +0.5kg)

---

### Yearly Goals → Monthly Breakdown
**Raw Answer:**
- "Then there would also be like yearly goals and I would just track the progress monthly"
- "But those yearly goals would break down into monthly goals"

**Key Insight:**
- Yearly goals exist
- They break down into monthly milestones
- Monthly view tracks progress on yearly goals

**Design Implication:**
- Show yearly goals on monthly view
- Progress bars: "200 workouts this year: 156/200 (18 this month)"
- Monthly contribution to yearly goals

---

### Calendar Grid
**Raw Answer:**
- "I guess it could be cool to you probably should have a calendar grid on here just so I can like oh I guess the calendar is useful because if I know I'm doing something on certain days I should plot them down on the monthly"
- "That would carry through to the weekly and daily"
- "For example if I know I'm catching a flight on a certain day of a month then I'd put that there as well"
- "I still like to see some sort of day calendar just a very brief overview, red green yellow type shit, you know, or like a variant of a great color grading scale based on like an overall point system"

**Key Insight:**
- Calendar grid = YES
- Purpose: Plot events (flights, etc.) that carry to weekly/daily
- Visual: Red/green/yellow OR grade color scale
- Based on overall point system per day

**Design Implication:**
- 31-day calendar grid
- Color-coded by daily grade/points
- Clickable to add events
- Events sync to weekly/daily views

---

### Day-of-Week Analysis
**Raw Answer:**
- "I don't think day of the week's too important"
- "I'd go more on the weekly analysis, right? Maybe more week by week analysis"

**Key Insight:**
- NO day-of-week analysis (Monday 78%, Tuesday 85%, etc.)
- YES week-by-week analysis instead

**Design Implication:**
- Remove day-of-week breakdown
- Show 4-5 week bars with performance per week
- Example:
  - Week 1: 80% (B+)
  - Week 2: 95% (A)
  - Week 3: 75% (B)
  - Week 4: 82% (B+)

---

### Habit Heatmap
**Raw Answer:**
- "A habit heat map could be cool, I guess"

**Key Insight:**
- Neutral on habit heatmap
- "Could be cool" = not critical

**Design Implication:**
- Include if space allows, but not priority
- Or simplify to just "Morning routine: 22/31 days" instead of full grid

---

### Consistency vs Performance
**Raw Answer:**
- "I guess consistency for me is a part of performance, I guess, but I don't know. We could maybe split it up"

**Key Insight:**
- Consistency = part of performance
- Open to splitting if it makes sense

**Design Implication:**
- Could combine into one page: "Performance & Consistency"
- Or keep separate if content is dense enough

---

### Monthly Review/Reflection
**Raw Answer:**
- "Yeah, we should definitely do monthly reviews and reflections. This is quite cool"

**Key Insight:**
- Monthly review = YES definitely want this

**Design Implication:**
- Dedicated monthly review/reflection page
- End-of-month checkout component

---

### Projects vs Goals
**Raw Answer:**
- "It'll be a mix of ongoing projects and monthly goals, you know"

**Key Insight:**
- Projects AND monthly goals coexist
- Not the same thing

**Design Implication:**
- Show both:
  - Monthly Goals (close 5 clients, log 80 hours)
  - Ongoing Projects (SISO v2.0: 60% complete)

---

### Next Month Prep
**Raw Answer:**
- "Yeah, I think next month prep like planning some months half in advance like just understanding what I would do is quite cool"

**Key Insight:**
- Next month planning = valuable
- Plan "half in advance" to understand what's coming

**Design Implication:**
- "Next Month Prep" section in monthly review
- Preview next month's goals/focus areas

---

## 📊 YEARLY VIEW - What Actually Matters

### Purpose & Usage
**Raw Answer:**
- "The yearly view's like an overarching. The yearly view just helps me keep on track. I know what's going on"
- "Track how I'm doing during the quarters, see what my yearly goals are"
- "Some statistics and graphs showing over the last couple of months like is my XP going up, earning-wise has been going up, has my hours log been going up"

**Key Insight:**
- Yearly view = **overarching perspective**
- Purpose: Keep on track, know what's going on
- Track quarters, yearly goals
- Statistics/graphs showing trends:
  - XP going up?
  - Earnings up?
  - Hours logged up?

**Design Implication:**
- Trend graphs are CRITICAL
- Show upward/downward trajectories
- Quarter-by-quarter comparison
- Stats that matter: XP, earnings, hours logged

---

### 12-Month Grid
**Raw Answer:**
- "A 12-month grid. Yeah, that would be quite cool"

**Key Insight:**
- 12-month grid = wanted

**Design Implication:**
- Visual grid of all 12 months
- Tap month → go to monthly view

---

### Quarters
**Raw Answer:**
- "And you could also do quarters as well"

**Key Insight:**
- Quarters = yes, meaningful
- Mentioned twice (once here, once earlier)

**Design Implication:**
- Quarterly breakdown page or section
- Q1, Q2, Q3, Q4 comparisons

---

### Year-over-Year Comparison
**Raw Answer:**
- "Year-over-year comparison is definitely going to be motivating"
- "I definitely care about past years"
- "This life log system is going to be basically tracking the next 10 years of my life"

**Key Insight:**
- Year-over-year = **DEFINITELY motivating**
- Cares about past years
- **"This life log system is going to be basically tracking the next 10 years of my life"** ← HUGE

**Design Implication:**
- Year-over-year comparison is MUST-HAVE
- 2025 vs 2024 comparison
- This is a 10-YEAR system, not just one year
- Build for long-term tracking

---

### Life Balance Scorecard
**Raw Answer:**
- "Life balance scorecard on the year, yeah, health, career, finance. I'd assess it at the start of the year throughout the whole year"

**Key Insight:**
- Life balance scorecard = yearly assessment
- Assessed at start of year + throughout year
- Categories: Health, Career, Finance (at minimum)

**Design Implication:**
- Scorecard on yearly view (not just life view)
- Ongoing assessment throughout year
- Health | Career | Finance | Others

---

### Annual Goals vs Life Goals
**Raw Answer:**
- "Annual goals would be a breakup of the life goals like I'll be able to plan the life goals to help me get to my life goals"
- "Obviously 200 workouts would be an annual goal"
- "Obviously financial freedom would obviously be a life goal"

**Key Insight:**
- **Annual goals = breakdown/steps toward life goals**
- Annual goal example: 200 workouts
- Life goal example: Financial freedom
- Annual goals help achieve life goals

**Design Implication:**
- Show relationship between annual goals and life goals
- "200 workouts (toward: Peak Health life goal)"
- Link annual accomplishments to bigger picture

---

## 🌟 LIFE VIEW - What Actually Matters

### 10-Year Vision
**Raw Answer:**
- "Seeing a 10-year vision motivates me, but it wouldn't be 10 years, be like five years"

**Key Insight:**
- Vision motivates him
- 5 years, not 10 years

**Design Implication:**
- 5-year vision, not 10-year
- Keep it medium-term (more realistic than 10)

---

### Mission Statement & Core Values
**Raw Answer:**
- "Mission statement, core values, yes, yes, I do. We need to have these written. That's very cool"

**Key Insight:**
- **YES** to mission statement
- **YES** to core values
- "We NEED to have these written"
- "That's very cool" = enthusiastic

**Design Implication:**
- Dedicated section for mission statement
- Core values list (editable)
- This is important to him

---

### Life Goals Quantity
**Raw Answer:**
- "Well, I'd have quite a few life goals"
- "So for example, like I want to have 10 kids or 10 sons rather"
- "I want to buy an island for my family"
- "I want to retire my dad"
- "I want to own a Zontorno"
- "I want to work with a hundred thousand business owners or million business owners"
- "I want to have a team of at least a thousand people or a hundred thousand or ten thousand people"
- "And they go along as they go along, you know, and I could just add to them as I think and brainstorm stuff"

**Key Insight:**
- **QUITE A FEW** life goals
- Examples given:
  1. **10 sons** (not just kids - specifically sons!)
  2. **Buy an island** for family
  3. **Retire dad**
  4. **Own a Zontorno** (supercar)
  5. **Work with 100k-1M business owners**
  6. **Team of 10k-100k people**
- Can add more as he brainstorms
- These are BIG, ambitious goals

**Design Implication:**
- Life goals list that's expandable
- Big, audacious goals welcome
- Easy to add new goals
- Categories might help (Family, Business, Possessions, Impact)

---

### Legacy Stats
**Raw Answer:**
- "Yeah, legacy stats is cool like a lifetime XP, all-time best week, all-time best month, all-time best year, lifetime revenue"

**Key Insight:**
- Legacy stats = COOL
- Stats wanted:
  - Lifetime XP
  - All-time best week
  - All-time best month
  - All-time best year
  - **LIFETIME REVENUE** ← Important!

**Design Implication:**
- Include all these stats
- Revenue tracking is important (not just XP)
- "All-time best" = motivating

---

### Multi-Year Timeline
**Raw Answer:**
- "Yeah, I would score through the multi-year timeline"

**Key Insight:**
- Would scroll through multi-year timeline
- Wants to see year-by-year progress

**Design Implication:**
- Scrollable year cards (2025, 2024, 2023...)
- Can go back years to see evolution

---

### Vision & Purpose Page
**Raw Answer:**
- "100 vision and purpose page is not too philosophical whatsoever. I like that, yeah, 100%"

**Key Insight:**
- Vision & purpose page = **NOT too philosophical**
- Likes it **100%**
- Wants this

**Design Implication:**
- Keep vision & purpose page
- This is valuable to him

---

### 10-Year Planning
**Raw Answer:**
- "Of course, I planned 10 years out. What the fuck, who'd you take me for?"
- "And it's a real plan. Why would I plan it and it not be a real plan?"

**Key Insight:**
- **OF COURSE** he plans 10 years out
- Gets offended at suggestion it's not real
- **"It's a REAL plan"**
- This is who he is

**Design Implication:**
- 10-year planning is SERIOUS
- Not aspirational - REAL planning
- Need robust long-term planning tools
- 1-year, 3-year, 5-year, 10-year sections

---

### Life View Page Count
**Raw Answer:**
- "It just depends. The amount of pages just depends on what we need on here, right?"
- "I think the live view should be slightly bigger, I guess, but I'm not sure. I'm not sure. It depends"

**Key Insight:**
- Flexible on page count
- Depends on what's needed
- Maybe slightly bigger than yearly

**Design Implication:**
- 6 pages seems right (bigger than yearly's 5)
- Can adjust based on content density

---

## 🎯 NAVIGATION & USAGE

### How to Navigate
**Raw Answer:**
- "So it would pretty much always be on the daily"
- "And then I can click back to weekly, back to monthly, back to yearly, back to life like that"
- "And then to navigate forward, I would just click. So for example, on life log, I'd see see this year, see this month, see this week, see this day"

**Key Insight:**
- **Default view = DAILY** (always start here)
- **Zoom out**: Daily → Weekly → Monthly → Yearly → Life
- **Zoom in**: Life → This Year → This Month → This Week → This Day

**Design Implication:**
- Daily is home base
- "Back" button hierarchy:
  - Daily: Back to Weekly
  - Weekly: Back to Monthly
  - Monthly: Back to Yearly
  - Yearly: Back to Life
- Breadcrumb navigation: Life > 2025 > January > Week 1 > Jan 3

---

### Would You Use All Time Scales?
**Raw Answer:**
- "I mean, I'd use all of them of course. I would otherwise why am I building them out?"

**Key Insight:**
- **YES** - would use ALL time scales
- "Why am I building them otherwise?"
- Practical mindset

**Design Implication:**
- Build all 5 time scales
- No shortcuts - all are valuable

---

### Grade Cards
**Raw Answer:**
- "I'm not sure what you mean by grade cards, but maybe we figure that out later"

**Key Insight:**
- Not clear on what "grade cards" means
- Needs clarification

**Design Implication:**
- Explain: Daily grades (A+, A, B+, etc.)
- Should these appear everywhere or just daily/weekly?

---

### XP Numbers
**Raw Answer:**
- "XP numbers, yeah, like XP numbers, they're definitely useful once I get the XP system built out"

**Key Insight:**
- XP numbers = useful
- But XP system needs to be built out first

**Design Implication:**
- XP tracking at all time scales
- Daily XP, Weekly XP, Monthly XP, Yearly XP, Lifetime XP

---

### Streaks
**Raw Answer:**
- "Streaks, streaks are cool like no smoking streak, waking up at a certain time streak, logging my morning routine streak, my nightly checkout streak, stuff like that. Streaks are definitely cool"

**Key Insight:**
- Streaks = COOL
- Examples:
  - No smoking streak
  - Wake time streak
  - Morning routine streak
  - Nightly checkout streak
  - "Stuff like that"

**Design Implication:**
- Streak tracking is important
- Multiple streak types
- Show active streaks + longest streaks

---

### Build Priority
**Raw Answer:**
- "I guess weekly would be the next most important, then monthly, then yearly, then live, but I want to build them all out"

**Key Insight:**
- Priority order:
  1. Daily (exists)
  2. **Weekly** (next)
  3. **Monthly**
  4. **Yearly**
  5. **Life**
- But wants ALL built out

**Design Implication:**
- Build in this order
- Weekly first (most used after daily)

---

### Which Would You Actually Use?
**Raw Answer:**
- "Honestly, I think I'd use all of them"
- "I think maybe it's mostly the monthly might be least important, but you still need it to tie everything else into it"

**Key Insight:**
- Would use ALL
- Monthly = least important BUT still needed to "tie everything together"
- All time scales interconnected

**Design Implication:**
- Monthly is the "glue" layer
- Can't skip it even if less frequently used
- Connects weekly to yearly

---

### Mobile vs Desktop
**Raw Answer:**
- "Yeah, everything's on the phone, everything's all mobile first"

**Key Insight:**
- **EVERYTHING mobile first**
- Phone is primary device

**Design Implication:**
- Mobile-first design mandatory
- Swipeable pages optimized for phone
- Desktop = nice to have, but mobile is priority

---

### Usage Frequency
**Raw Answer:**
- "Daily every day"
- "Weekly like I'd probably check that like a couple times a week"
- "Monthly I'd probably check that at least once a week"
- "Yearly I'd probably check that at least every two weeks"
- "Life log, the life maybe I'd check that like every two weeks every month"

**Key Insight:**
- **Daily**: Every day
- **Weekly**: Couple times a week
- **Monthly**: At least once a week
- **Yearly**: At least every two weeks
- **Life**: Every two weeks to every month

**Design Implication:**
- Weekly gets heavy usage (multiple times per week)
- Monthly gets regular checks (weekly)
- Yearly and Life = less frequent but still regular
- All views will be used actively

---

## 🎯 CRITICAL INSIGHTS SUMMARY

### 1. This is a 10-YEAR SYSTEM
- "This life log system is going to be basically tracking the next 10 years of my life"
- He's SERIOUS about long-term tracking
- Plans 10 years out with REAL plans

### 2. Life Goals Are AMBITIOUS
- 10 sons (not kids - sons!)
- Buy an island
- Retire dad
- Own a Zontorno (supercar)
- Work with 1M business owners
- Team of 100k people
- Track LIFETIME REVENUE

### 3. Motivation = Seeing PROBLEMS
- NOT about feeling good
- Wants to see: missed workouts, low grades, late wake times
- "No justification" indicator for failures
- Don't sugarcoat

### 4. Deep Work vs Light Work IS Important
- Different categories of work
- Light = life admin (flights, errands)
- Deep = high-intensity work (client projects)
- Track both separately

### 5. Monthly = "Glue Layer"
- Least important individually
- But NEEDED to tie weekly → yearly
- Focus on month-over-month trends
- Fewer but bigger goals than weekly

### 6. Navigation Pattern
- Daily is home base
- Zoom out: Daily → Weekly → Monthly → Yearly → Life
- Zoom in: Life → Year → Month → Week → Day

### 7. Everything Mobile First
- Phone is primary device
- Swipeable pages optimized for mobile

### 8. Weekly Gets Heavy Usage
- Check couple times per week
- Most important after daily
- Build this first

### 9. Time Tracking = What's Trackable
- NO social media (deleted all)
- YES sleep (checkout → morning)
- YES deep work (logged hours)
- YES light work (logged hours)
- YES calories (photo tracking feature!)

### 10. Planning Is Serious
- Weekly planning at start of week
- Weekly checkout at end of week
- Monthly planning/review
- Yearly goals broken into monthly milestones
- 5-year vision (not 10)
- 10-year plan (REAL plan, not aspirational)

---

## 🚀 NEXT STEPS

Based on this session, we now know:

1. **What to build first**: Weekly view
2. **What matters most**: Performance tracking + seeing problems + trends
3. **How navigation works**: Zoom out/zoom in pattern
4. **How he'll use it**: Regular checks across all time scales
5. **What NOT to build**: Social media tracking, day-of-week analysis

**Ready to design the ACTUAL pages now with real content!**
