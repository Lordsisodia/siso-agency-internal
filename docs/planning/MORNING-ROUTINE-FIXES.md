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

## Notes
- Some of this functionality existed before and disappeared
- Worth searching codebase for previous implementations before rebuilding
- Focus on easy wins first to build momentum
