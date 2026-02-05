# Morning Routine Improvements - Task Backup

## Summary
All work was done on the `dev` branch which was 90 commits behind `master`. The changes have been stashed and need to be re-applied to the master branch after verifying the new structure.

## Stash Reference
```
Stash: "Morning routine improvements: API stubs, stats components, collapsible sections, XP badge, vertical progress bar"
```

---

## Complete Task List (To Redo on Master)

### Task 1: Fix Mobile PWA Layout Issues
**Files Modified:**
- `index.html` (line 11): Change theme-color from #ea384c to #121212
- `public/manifest.json` (line 9): Change theme_color to #121212
- `vite.config.ts` (line 111): Change theme_color to #121212
- `src/app/index.css`: Add safe area utility classes

**Changes:**
- Fix red box at top of PWA screen (theme-color)
- Fix grey box at bottom blocking content
- Ensure consistent lighter grey background at top

---

### Task 2: Auto-Collapsing Sections
**Components:**
- Enhance `CollapsibleCard` component with:
  - `isComplete` prop (shows green completion indicator)
  - `autoCollapseOnComplete` prop
  - `onToggle` callback
  - sessionStorage persistence for collapse state

**Sections to Update:**
- Morning Routine section (collapses when all 6 tasks complete)
- Nightly Checkout section (collapses when complete)

**Visual:** Green checkmark icon when section is complete

---

### Task 3: Vertical Day Progress Bar
**New Component:** `src/domains/lifelock/1-daily/_shared/components/VerticalDayProgress.tsx`
- Vertical progress indicator on left side of screen
- Replaces horizontal DayProgressPill
- Color changes based on page/section

**Integration:**
- Update `TabLayoutWrapper.tsx` to include vertical progress
- Remove horizontal progress from `UnifiedTopNav.tsx`

---

### Task 4: XP Balance Display
**New Component:** `src/components/shared/XPBalanceBadge.tsx`
- Shows total XP balance
- Positioned at top left next to user icon

**Integration:**
- Add to `SidebarFooter.tsx` or top navigation

---

### Task 5: Code My Brain Text Layout
**File:** Morning routine section

**Change:**
- Separate text onto individual lines
- Current: One paragraph
- New: Each sentence on its own line

**Text Content:**
```
"Code my brain for the day ahead."
"Set clear intentions and priorities."
"Visualize success in all endeavors."
```
(Verify actual text on master branch)

---

### Task 6: This Week's Graph Component
**New Files:**
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/ThisWeekGraph.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/hooks/useWeeklyGraphData.ts`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/types.ts`

**Features:**
- Bar chart showing last 7 days of morning routine completion
- Orange gradient bars for completion percentage
- XP earned as line overlay (yellow dots)
- Wake-up time indicator below each bar
- Today highlighted with ring
- Loading and empty states
- Hover tooltips

---

### Task 7: Daily XP Tracker Component
**New Files:**
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/DailyXPTracker.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/XPStreakBadge.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/hooks/useDailyXPData.ts`

**Features:**
- Shows today's XP earned
- Category breakdown (Morning Routine, Tasks, etc.)
- Streak badge component
- Progress toward daily goal

---

### Task 8: Wake Up Statistics Component
**New Files:**
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/WakeUpStats.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/ConsistencyRing.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/hooks/useWakeUpStats.ts`

**Features:**
- Average wake-up time
- Consistency ring visualization
- Days tracked count
- Weekly comparison

---

### Task 9: Sleep Statistics Component
**New Files:**
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/SleepStats.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/SleepDebtIndicator.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/SleepInsights.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/hooks/useSleepStats.ts`

**Features:**
- Average sleep duration
- Sleep debt indicator
- Sleep insights/recommendations
- Sleep quality trends

---

### Task 10: Calories/Nutrition Statistics Component
**New Files:**
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/CalorieStats.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/MiniMacrosView.tsx`
- `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/hooks/useCalorieStats.ts`

**Features:**
- Daily calorie tracking
- Macro breakdown (protein, carbs, fats)
- Mini macros view
- Nutrition insights
- Diet-sleep correlation

---

### Task 11: API Route Stubs (To Prevent Console Spam)
**Files Created:**
- `api/light-work/tasks.js`
- `api/deep-work/tasks.js`
- `api/deep-work/subtasks/[id].js`
- `api/morning-routine.js`
- `api/xp-preview.js`
- `api/xp-store/balance.js`
- `api/xp-store/rewards.js`
- `api/xp-store/purchase.js`
- `api/xp-store/history.js`
- `api/xp-store/analytics.js`
- `api/xp-store/award-xp.js`

**Note:** These stubs return empty data. May need proper Supabase integration on master.

---

## Key Locations to Verify on Master

Before re-implementing, check these locations on master branch:

1. **Morning Routine Section Path:**
   - Old: `src/domains/lifelock/1-daily/1-morning-routine/ui/pages/MorningRoutineSection.tsx`
   - Check if structure changed in refactor

2. **CollapsibleCard Component:**
   - Old: `src/components/ui/collapsible-card/CollapsibleCard.tsx`
   - Verify it still exists or find replacement

3. **Stats Directory:**
   - Old: `src/domains/lifelock/1-daily/1-morning-routine/ui/components/stats/`
   - May need to create this directory structure

4. **Navigation/Layout:**
   - Check how top navigation is structured
   - Find where to add XP balance badge

5. **Tab Layout:**
   - Find where vertical progress bar should integrate

---

## Next Steps

1. ✅ Stash work on dev branch
2. ✅ Switch to master branch
3. 🔍 Explore master branch structure
4. 🔍 Find correct file locations
5. 📋 Re-create tasks for master branch
6. 🚀 Re-implement changes

---

## Commands to Restore (if needed)

```bash
# View stash list
git stash list

# Apply stash
git stash pop

# Or apply to new branch
git stash branch dev-backup stash@{0}
```
