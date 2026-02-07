# App UI/UX Bug Report - 2026-02-07

Structured task list for user-reported issues. Each issue is documented as a separate task for agent resolution.

---

## Morning Routine Issues

### TASK-001: Push-ups "Done" Checkbox Not Clickable
**Area:** Morning Routine - Get Blood Flowing section
**Priority:** HIGH
**Type:** Bug

**Description:**
The "Done" checkbox for push-ups in the "Get Blood Flowing" section does not respond to clicks/taps.

**Expected Behavior:**
Checkbox should toggle between checked/unchecked state when clicked, marking the push-up task as complete or incomplete.

**Acceptance Criteria:**
- [ ] Checkbox responds to click/tap events
- [ ] Visual state changes when toggled
- [ ] State persists after interaction

---

### TASK-002: Water "Done" Checkbox Not Clickable
**Area:** Morning Routine - Power Up Brain section
**Priority:** HIGH
**Type:** Bug

**Description:**
The "Done" checkbox for water in the "Power Up Brain" section does not respond to clicks/taps. Same root cause as TASK-001.

**Expected Behavior:**
Checkbox should toggle between checked/unchecked state when clicked, marking the water task as complete or incomplete.

**Acceptance Criteria:**
- [ ] Checkbox responds to click/tap events
- [ ] Visual state changes when toggled
- [ ] State persists after interaction

---

### TASK-003: Meditation Timer Stops When App Closed
**Area:** Morning Routine - Meditation
**Priority:** HIGH
**Type:** Bug

**Description:**
The meditation timer stops counting when the user closes the app. It does not continue running in the background.

**Expected Behavior:**
Timer should continue counting down even when the app is in the background or closed. Should use background task/notification to maintain timer state.

**Acceptance Criteria:**
- [ ] Timer continues in background when app minimized
- [ ] Timer persists when app closed and reopened
- [ ] Notification shows remaining time (optional but recommended)
- [ ] Timer completes correctly even if app was closed

---

## Today's Tasks Issues

### TASK-004: "Allocated for Today" Box Not Centered
**Area:** Today's Tasks - Allocated for Today section
**Priority:** MEDIUM
**Type:** UI Bug

**Description:**
The "Allocated for Today" box is positioned off to the side instead of being centered. Elements are being cut off due to misalignment.

**Expected Behavior:**
Box should be centered horizontally on the screen with all elements fully visible.

**Acceptance Criteria:**
- [ ] Box is horizontally centered
- [ ] No elements are cut off
- [ ] Responsive on different screen sizes

---

### TASK-005: Cannot Edit Task Priority in Today Task Box
**Area:** Today's Tasks - Task editing
**Priority:** MEDIUM
**Type:** Feature Gap

**Description:**
Users cannot edit the priority level of tasks within the "Allocated for Today" task box.

**Expected Behavior:**
Users should be able to tap/click on priority to change it (e.g., High, Medium, Low).

**Acceptance Criteria:**
- [ ] Priority is editable inline or via modal
- [ ] Priority options: High, Medium, Low
- [ ] Change persists immediately

---

### TASK-006: Cannot Edit "Light Work" vs "Deep Work" in Today Task Box
**Area:** Today's Tasks - Task editing
**Priority:** MEDIUM
**Type:** Feature Gap

**Description:**
Users cannot change whether a task is categorized as "light work" or "deep work" from the today task box.

**Expected Behavior:**
Users should be able to toggle or select between light work and deep work categories for each task.

**Acceptance Criteria:**
- [ ] Work type is editable
- [ ] Toggle or dropdown to switch between light/deep
- [ ] Visual indicator updates immediately

---

### TASK-007: Cannot Edit Task Duration in Today Task Box
**Area:** Today's Tasks - Task editing
**Priority:** MEDIUM
**Type:** Feature Gap

**Description:**
Users cannot edit the estimated duration ("how long it's going to take") for tasks in the today task box.

**Expected Behavior:**
Users should be able to tap on duration to edit it.

**Acceptance Criteria:**
- [ ] Duration field is editable
- [ ] Time picker or input field appears
- [ ] Change persists immediately

---

### TASK-008: Header Gets Cut Off When Scrolling
**Area:** Today's Tasks - Scroll behavior
**Priority:** MEDIUM
**Type:** UI Bug

**Description:**
When scrolling down and then back up, the "Today is 7th February" header and the light work/deep work section get cut off.

**Expected Behavior:**
Header and section titles should remain fully visible when scrolling back to top.

**Acceptance Criteria:**
- [ ] Header remains visible on scroll up
- [ ] Light work/deep work section titles visible
- [ ] Smooth scroll behavior

---

### TASK-009: Remove Checkbox from "Auto Schedule"
**Area:** Today's Tasks - Auto Schedule
**Priority:** LOW
**Type:** UI Cleanup

**Description:**
Remove the checkbox on the left side next to "Auto Schedule" in the Today view.

**Expected Behavior:**
No checkbox should appear next to "Auto Schedule" text.

**Acceptance Criteria:**
- [ ] Checkbox element removed
- [ ] "Auto Schedule" text remains
- [ ] Layout remains intact

---

### TASK-010: Remove Info Button from Light Work Section
**Area:** Today's Tasks - Light Work section
**Priority:** LOW
**Type:** UI Cleanup

**Description:**
Remove the info button (i) from the light work section as it's taking up unnecessary space.

**Expected Behavior:**
No info icon/button in light work section header.

**Acceptance Criteria:**
- [ ] Info button removed from light work section
- [ ] Layout adjusts accordingly

---

### TASK-011: Remove Emoji from Light Work Title
**Area:** Today's Tasks - Light Work section
**Priority:** LOW
**Type:** UI Cleanup

**Description:**
Remove the emoji from the light work section title.

**Expected Behavior:**
Light work section title displays as plain text without emoji.

**Acceptance Criteria:**
- [ ] Emoji removed from title
- [ ] Text remains: "Light Work"

---

### TASK-012: Remove Emoji from Deep Work Title
**Area:** Today's Tasks - Deep Work section
**Priority:** LOW
**Type:** UI Cleanup

**Description:**
Remove the emoji from the deep work section title.

**Expected Behavior:**
Deep work section title displays as plain text without emoji.

**Acceptance Criteria:**
- [ ] Emoji removed from title
- [ ] Text remains: "Deep Work"

---

## Bottom Navigation Issues

### TASK-013: Bottom Nav Text Censorship Issue
**Area:** Bottom Navigation - 9 icons/buttons
**Priority:** HIGH
**Type:** UI Bug

**Description:**
The bottom navigation bar with 9 icons/buttons is largely censored. The text below the icons that should make labels visible is not displaying correctly.

**Expected Behavior:**
All 9 navigation buttons should display their labels clearly below the icons without censorship.

**Acceptance Criteria:**
- [ ] All 9 nav button labels are visible
- [ ] Text is not censored or obscured
- [ ] Layout is balanced and readable

---

## Tracking Issues

### TASK-014: Cigarette Tracking Database Connection Error
**Area:** Tracking - Cigarette tracker
**Priority:** CRITICAL
**Type:** Bug

**Description:**
Cigarette tracking shows error message: "failed to update please try again". Not connected to database.

**Expected Behavior:**
Cigarette count should save to database and update without errors.

**Acceptance Criteria:**
- [ ] Database connection established
- [ ] Cigarette count saves successfully
- [ ] No error message displayed
- [ ] Data persists across app restarts

---

### TASK-015: Caffeine Tracker Wrong Color
**Area:** Tracking - Caffeine tracker
**Priority:** LOW
**Type:** UI Bug

**Description:**
Caffeine tracker is displaying in yellow instead of green.

**Expected Behavior:**
Caffeine tracker should display in green color.

**Acceptance Criteria:**
- [ ] Caffeine tracker color changed to green
- [ ] Color matches design system

---

### TASK-016: Add Reminders for Tracking Items
**Area:** Tracking - All tracking items
**Priority:** MEDIUM
**Type:** Feature Request

**Description:**
Add reminder notifications for tracking items since there are many things to track throughout the day.

**Expected Behavior:**
Users receive timely reminders to log their tracking data (cigarettes, caffeine, etc.).

**Acceptance Criteria:**
- [ ] Reminder system implemented
- [ ] Configurable reminder times per tracking item
- [ ] Push notifications work in background
- [ ] Users can enable/disable reminders per item

---

## Nutrition Tracking Issues

### TASK-017: Nutrition Tracking Double Title Fix
**Area:** Nutrition Tracking - Header
**Priority:** MEDIUM
**Type:** UI Bug

**Description:**
Nutrition tracking has a double title with a yellow icon. Needs to be a single, smaller title.

**Expected Behavior:**
Single title line, smaller size, clean header without duplication.

**Acceptance Criteria:**
- [ ] Duplicate title removed
- [ ] Single title displayed
- [ ] Title size reduced appropriately
- [ ] Yellow icon retained if part of design

---

### TASK-018: Nutrition Elements Color and Functionality
**Area:** Nutrition Tracking - All elements
**Priority:** HIGH
**Type:** Bug

**Description:**
All nutrition tracking elements should be yellow and fully functional.

**Expected Behavior:**
All nutrition elements display in yellow color scheme and all interactive elements work correctly.

**Acceptance Criteria:**
- [ ] All nutrition elements use yellow color
- [ ] All input fields functional
- [ ] All buttons/interactions work
- [ ] Data saves correctly

---

## Summary

| Task ID | Area | Title | Priority | Type |
|---------|------|-------|----------|------|
| TASK-001 | Morning Routine | Push-ups checkbox not clickable | HIGH | Bug |
| TASK-002 | Morning Routine | Water checkbox not clickable | HIGH | Bug |
| TASK-003 | Morning Routine | Meditation timer background issue | HIGH | Bug |
| TASK-004 | Today's Tasks | Allocated for Today box not centered | MEDIUM | UI Bug |
| TASK-005 | Today's Tasks | Cannot edit task priority | MEDIUM | Feature Gap |
| TASK-006 | Today's Tasks | Cannot edit light/deep work | MEDIUM | Feature Gap |
| TASK-007 | Today's Tasks | Cannot edit task duration | MEDIUM | Feature Gap |
| TASK-008 | Today's Tasks | Header cut off on scroll | MEDIUM | UI Bug |
| TASK-009 | Today's Tasks | Remove Auto Schedule checkbox | LOW | UI Cleanup |
| TASK-010 | Today's Tasks | Remove light work info button | LOW | UI Cleanup |
| TASK-011 | Today's Tasks | Remove light work emoji | LOW | UI Cleanup |
| TASK-012 | Today's Tasks | Remove deep work emoji | LOW | UI Cleanup |
| TASK-013 | Bottom Nav | Text censorship issue | HIGH | UI Bug |
| TASK-014 | Tracking | Cigarette tracking DB error | CRITICAL | Bug |
| TASK-015 | Tracking | Caffeine tracker wrong color | LOW | UI Bug |
| TASK-016 | Tracking | Add tracking reminders | MEDIUM | Feature |
| TASK-017 | Nutrition | Double title fix | MEDIUM | UI Bug |
| TASK-018 | Nutrition | Elements color and functionality | HIGH | Bug |

---

*Document created: 2026-02-07*
*Total issues: 18*
*Critical: 1 | High: 6 | Medium: 7 | Low: 4*
