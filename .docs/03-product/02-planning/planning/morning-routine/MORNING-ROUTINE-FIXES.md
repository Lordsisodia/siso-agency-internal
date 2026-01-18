# Morning Routine Page - Task List

## Priority: Easy Wins First

### 🎯 Critical Fixes

#### 1. Progress Bar Not Updating
- **Issue**: 0% complete bar in yellow callout box doesn't update when ticking boxes
- **Location**: Top of morning routine page
- **Priority**: HIGH

#### 2. Duplicate Time Display - Clean Up
- **Issue**: Time shown twice (in title AND in gray text)
  - "Get blood flowing" → "five minutes after" + "5 minutes" in gray
  - "Freshen up" → "freshen up in 25 minutes" + "25 minutes" in gray
  - "Power up brain" → "five minutes" + "5 minutes" in gray
  - "Plan day" → duplicate time display
  - "Meditation" → duplicate time display
- **Solution**: Put time in a pill badge, remove from title and gray text
- **Priority**: MEDIUM (Easy Win - Visual Polish)

#### 3. Task Counter Buttons → Progress Bars
- **Issue**: "0 out of 3", "3 out of 3" buttons next to each task are clunky
- **Solution**: Remove buttons, add progress bar at top of each card that fills as tasks complete
- **Priority**: MEDIUM (Easy Win - Better UX)

---

### 🔧 Section-Specific Fixes

#### Wake Up Section
- **Issue**: Edit mode missing scrolly date picker, only has type input
- **Keep**: "Use now" button (this is good)
- **Restore**: Scroll-to-date picker functionality
- **Priority**: LOW

#### Get Blood Flowing Section
- **Issue 1**: "push-ups pb30" has no way to track/change PB
  - Need to restore PB tracking functionality (code existed before)
- **Issue 2**: Remove "sit ups" and "pull ups" (not being used)
- **Priority**: MEDIUM

#### Freshen Up Section
- **Reorder**: Move this section to be #2 (right after "Wake up")
- **Priority**: LOW (Easy Win)

#### Power Up Brain Section
- **Issue 1**: Remove "pre-workout" (not currently used)
- **Issue 2**: Change water amount to 500ml
- **Issue 3**: Restore water tracking with ±100ml increment/decrement buttons
  - Code existed before - may need to find it
- **Priority**: MEDIUM

---

### 📋 Final Section Order
1. Wake up
2. Freshen up *(moved up)*
3. Get blood flowing
4. Power up brain
5. Plan day
6. Meditation

---

---

## ✅ COMPLETED TASKS

1. ✅ Remove unused items (sit-ups, pull-ups, pre-workout)
2. ✅ Reorder sections (Freshen Up after Wake Up)
3. ✅ Change water to 500ml
4. ✅ Fix duplicate time display with pill badges
5. ✅ Replace task counters with progress bars
6. ✅ Fix progress bar not updating (critical bug)
7. ✅ Add water tracking with ±100ml buttons
8. ✅ Optimize water tracking for mobile
9. ✅ Reorder subtasks (Supplements before Water)

---

## 🔧 REMAINING TASKS

### UI/UX Improvements

#### 1. Remove Main Task Checkboxes (HIGH - Easy Win)
- **Issue**: Main tasks have checkboxes on left side creating uneven padding
- **Problem**: Redundant when tasks have subtasks with their own checkboxes
- **Fix**: Remove main checkboxes for tasks with subtasks (Freshen Up, Get Blood Flowing, Power Up Brain)
- **Result**: Cleaner layout, more space, less redundancy
- **Priority**: HIGH (Easy Win - Better UX)

#### 2. Meditation Time - Buttons Instead of Typing (MEDIUM)
- **Issue**: Don't like typing minutes - prefer button controls
- **Fix**: Add +1 min and +5 min buttons (like water tracker style)
- **Remove**: Text input for meditation duration
- **Priority**: MEDIUM

#### 3. Push-ups - Buttons Instead of Typing (MEDIUM)
- **Issue**: Typing reps is less convenient than buttons
- **Fix**: Add +1 and +5 buttons to increment reps
- **Remove**: Number input field
- **Keep**: PB display and auto-update logic
- **Priority**: MEDIUM

#### 4. Completion State Rethink (LOW)
- **Issue**: Tasks like Plan Day and Meditation (no subtasks) just have checkbox
- **Idea**: Maybe show completion bar when data is input instead of checkbox
- **Priority**: LOW (Exploratory)

### Features to Add

#### 5. Wake Up Time Picker (LOW)
- **Issue**: Only has text input, missing scroll picker
- **Fix**: Add scroll-to-time picker functionality
- **IMPORTANT**: KEEP the "Use Now" button - user really likes this!
- **Priority**: LOW

---

## Notes
- Some of this functionality existed before and disappeared
- Worth searching codebase for previous implementations before rebuilding
- Focus on easy wins first to build momentum
