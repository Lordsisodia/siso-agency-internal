# LifeBlock Task Pages - Improvement Plan

## Overview
Consolidated improvement plan for Light Work, Deep Work, and Today's Tasks pages.

---

## Phase 1: Foundation (Critical)

### Task 1.1: Create Unified WorkTaskList Component
**Priority:** CRITICAL
**Status:** ✅ COMPLETED
**File:** `src/domains/lifelock/1-daily/_shared/components/WorkTaskList.tsx`

**Description:**
Created a consolidated WorkTaskList component that accepts theme configuration and work-type-specific props. This eliminates the 95% code duplication between LightWorkTaskList and DeepWorkTaskList.

**Key Features:**
- Accepts `workType`, `theme`, `themeName`, `flowProtocol` props
- All state management and handlers internalized
- Supports client badges via optional `clientMap` prop
- Progress summary at top (tasks completed, time remaining)
- Collapsible Flow State Protocol section

---

### Task 1.2: Refactor LightWorkTaskList to Use WorkTaskList
**Priority:** CRITICAL
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 30 minutes

**Description:**
Replace the entire LightWorkTaskList implementation to use the new WorkTaskList component.

**Implementation:**
```tsx
// LightWorkTaskList.tsx becomes a thin wrapper
import { WorkTaskList } from "../../_shared/components/WorkTaskList";
import { LIGHT_THEME } from "../../_shared/components/UnifiedTaskCard";
import { useLightWorkTasksSupabase } from "../domain/useLightWorkTasksSupabase";

const LIGHT_FLOW_PROTOCOL = {
  title: "🌱 Light Work Tasks",
  subtitle: "Light Focus Work",
  description: "Light work sessions require focused attention without deep cognitive load...",
  rules: [
    "• Light interruptions allowed for urgent matters",
    "• Phone on normal mode - check periodically",
    "• Work in 1-2 hour focused blocks",
    "• Quick breaks encouraged between tasks"
  ]
};

export default function LightWorkTaskList({ onStartFocusSession, selectedDate }) {
  const { tasks, loading, error, ...operations } = useLightWorkTasksSupabase({ selectedDate });

  // Transform tasks to WorkTask format
  const workTasks = useMemo(() => transformToWorkTasks(tasks), [tasks]);

  return (
    <WorkTaskList
      workType="light"
      tasks={workTasks}
      loading={loading}
      error={error}
      selectedDate={selectedDate}
      flowProtocol={LIGHT_FLOW_PROTOCOL}
      theme={LIGHT_THEME}
      themeName="LIGHT"
      baseSubtaskMinutes={30}
      {...operations}
    />
  );
}
```

**Acceptance Criteria:**
- [ ] LightWorkTaskList.tsx reduced to ~100 lines
- [ ] All existing functionality preserved
- [ ] Visual appearance identical to before
- [ ] No console errors

---

### Task 1.3: Refactor DeepWorkTaskList to Use WorkTaskList
**Priority:** CRITICAL
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 30 minutes

**Description:**
Replace the entire DeepWorkTaskList implementation to use the new WorkTaskList component.

**Implementation:**
Similar to Task 1.2, but with:
- DEEP_THEME
- DEEP_FLOW_PROTOCOL
- baseSubtaskMinutes={45}
- clientMap from useClientsList

**Acceptance Criteria:**
- [ ] DeepWorkTaskList.tsx reduced to ~100 lines
- [ ] All existing functionality preserved
- [ ] Client badges still work
- [ ] Visual appearance identical to before
- [ ] No console errors

---

## Phase 2: Quick Wins (High Impact, Low Effort)

### Task 2.1: Add Work Type Badges to Today's Tasks View
**Priority:** HIGH
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 45 minutes

**Description:**
Add visual indicators to show whether a task is Light Work (green) or Deep Work (blue) in the unified Today's Tasks view.

**Changes Needed:**
1. Modify `UnifiedTaskCard` to accept optional `workType` prop
2. Add small badge in task header showing "Light" or "Deep"
3. Update `TodayTasksList` to pass workType to each card

**Visual Design:**
```
[Checkbox] Task Title                    [Light|green badge] [▼]
```

**Acceptance Criteria:**
- [ ] Light work tasks show green "Light" badge
- [ ] Deep work tasks show blue "Deep" badge
- [ ] Badge is subtle but visible
- [ ] Works in both expanded and collapsed states

---

### Task 2.2: Enable Timer in Today's Tasks View
**Priority:** HIGH
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 30 minutes

**Description:**
Currently `handleTimerToggle` is a no-op in TodayTasksList. Enable timer functionality.

**Changes Needed:**
1. Import `useDeepWorkTimers` hook
2. Implement `handleTimerToggle` to start/stop timer
3. Pass timer state to UnifiedTaskCard

**Acceptance Criteria:**
- [ ] Can start timer from Today's Tasks view
- [ ] Timer displays elapsed time
- [ ] Can stop timer
- [ ] Timer state persists when switching views

---

### Task 2.3: Add Progress Summary to Light/Deep Work Headers
**Priority:** MEDIUM
**Status:** ✅ COMPLETED (in WorkTaskList)
**File:** `WorkTaskList.tsx`

**Description:**
Show progress stats at the top of Light Work and Deep Work pages.

**Already Implemented:**
- Tasks completed: "3/5 done"
- Visual progress bar
- Time remaining: "~2h 30m remaining"
- Active/completed count

---

### Task 2.4: Make Flow State Protocol Collapsible
**Priority:** MEDIUM
**Status:** ✅ COMPLETED (in WorkTaskList)
**File:** `WorkTaskList.tsx`

**Description:**
The Flow State Protocol section takes up too much vertical space. Make it collapsible.

**Already Implemented:**
- "Show/Hide" toggle button
- Smooth animation on expand/collapse
- Default to collapsed after first view (can be changed)

---

## Phase 3: Functional Improvements

### Task 3.1: Add Quick-Add Task (Keyboard Shortcut)
**Priority:** MEDIUM
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 1 hour

**Description:**
Add keyboard shortcut (Cmd/Ctrl + N) and inline quick-add for new tasks.

**Implementation:**
1. Add keyboard event listener for Cmd/Ctrl + N
2. Show inline input at top of task list
3. Auto-focus on input
4. Enter to create, Escape to cancel

**Acceptance Criteria:**
- [ ] Cmd/Ctrl + N opens quick-add input
- [ ] Input appears at top of task list
- [ ] Enter creates task
- [ ] Escape cancels
- [ ] Works in Light Work, Deep Work, and Today's Tasks

---

### Task 3.2: Add Task Filtering/Sorting
**Priority:** MEDIUM
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 1.5 hours

**Description:**
Add filter and sort controls to task lists.

**Filters:**
- All Tasks
- Active Only
- Completed Only

**Sort Options:**
- Manual Order (current)
- Priority (Urgent → Low)
- Due Date
- Time Estimate

**Implementation:**
Add dropdown controls in header area.

**Acceptance Criteria:**
- [ ] Filter dropdown works
- [ ] Sort dropdown works
- [ ] Selections persist during session
- [ ] Visual feedback on current selection

---

### Task 3.3: Subtask Visual Improvements
**Priority:** MEDIUM
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 1 hour

**Description:**
Improve subtask visual hierarchy and interaction.

**Changes:**
1. Increase indentation for subtasks (more visual hierarchy)
2. Add drag handles for reordering subtasks
3. Show subtask progress bar on collapsed parent task
4. Improve checkbox hit area

**Acceptance Criteria:**
- [ ] Subtasks visually indented more
- [ ] Progress bar shows on collapsed task card
- [ ] Checkbox easier to click
- [ ] (Optional) Drag to reorder works

---

## Phase 4: Today's Tasks Enhancements

### Task 4.1: Enable Task Reordering in Today's Tasks
**Priority:** MEDIUM
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 45 minutes

**Description:**
Currently `handleMoveTask` is a no-op in TodayTasksList. Enable reordering.

**Challenge:**
Tasks come from two different sources (light vs deep), so we need to store order separately.

**Implementation:**
1. Add localStorage persistence for today's task order
2. Implement move up/down handlers
3. Show reorder arrows on task cards

**Acceptance Criteria:**
- [ ] Can reorder tasks in Today's Tasks view
- [ ] Order persists during session
- [ ] Reordering doesn't affect Light/Deep work views

---

### Task 4.2: Add "Add Task" Form to Today's Tasks
**Priority:** LOW
**Status:** 🔄 PENDING
**Assignee:** Sub-agent
**Estimated Time:** 30 minutes

**Description:**
The current inline add form in Today's Tasks is good but could be improved.

**Enhancements:**
1. Add keyboard shortcut (Cmd/Ctrl + N)
2. Auto-focus on title input
3. Better visual feedback

---

## Phase 5: Polish & Nice-to-Have

### Task 5.1: Batch Actions
**Priority:** LOW
**Status:** 🔄 PENDING
**Assignee:** Sub-agent (optional)
**Estimated Time:** 2 hours

**Description:**
Allow selecting multiple tasks and performing batch actions.

**Features:**
- Checkbox to select tasks
- Batch complete
- Batch delete
- Batch change priority

---

### Task 5.2: Timer Enhancements
**Priority:** LOW
**Status:** 🔄 PENDING
**Assignee:** Sub-agent (optional)
**Estimated Time:** 1.5 hours

**Features:**
- Show running timer in page title: "(25m) Deep Work Tasks"
- Sound notification when timer completes
- Auto-log time when task marked complete
- Pomodoro-style timer option

---

### Task 5.3: Empty State Improvements
**Priority:** LOW
**Status:** 🔄 PENDING
**Assignee:** Sub-agent (optional)
**Estimated Time:** 45 minutes

**Description:**
Make empty states more engaging and helpful.

**Ideas:**
- Illustration or icon
- Suggested first task
- Quick tutorial tooltip
- "Create your first task" CTA

---

### Task 5.4: Implement sortSubtasksHybrid
**Priority:** LOW
**Status:** 🔄 PENDING
**Assignee:** Sub-agent (optional)
**Estimated Time:** 30 minutes

**Description:**
The sortSubtasksHybrid function is currently a stub. Implement proper subtask sorting.

**Sort Order:**
1. By priority (Urgent → High → Medium → Low)
2. Then by due date (soonest first)
3. Then by creation date

---

## Task Summary

| Phase | Task | Priority | Est. Time | Status |
|-------|------|----------|-----------|--------|
| 1.1 | Create WorkTaskList Component | CRITICAL | 1h | ✅ Done |
| 1.2 | Refactor LightWorkTaskList | CRITICAL | 30m | 🔄 Pending |
| 1.3 | Refactor DeepWorkTaskList | CRITICAL | 30m | 🔄 Pending |
| 2.1 | Work Type Badges | HIGH | 45m | 🔄 Pending |
| 2.2 | Enable Timer in Today's Tasks | HIGH | 30m | 🔄 Pending |
| 2.3 | Progress Summary | MEDIUM | 30m | ✅ Done |
| 2.4 | Collapsible Protocol | MEDIUM | 30m | ✅ Done |
| 3.1 | Quick-Add Task | MEDIUM | 1h | 🔄 Pending |
| 3.2 | Task Filtering/Sorting | MEDIUM | 1.5h | 🔄 Pending |
| 3.3 | Subtask Improvements | MEDIUM | 1h | 🔄 Pending |
| 4.1 | Today's Tasks Reordering | MEDIUM | 45m | 🔄 Pending |
| 4.2 | Today's Tasks Add Form | LOW | 30m | 🔄 Pending |
| 5.1 | Batch Actions | LOW | 2h | 🔄 Pending |
| 5.2 | Timer Enhancements | LOW | 1.5h | 🔄 Pending |
| 5.3 | Empty State Improvements | LOW | 45m | 🔄 Pending |
| 5.4 | Implement sortSubtasksHybrid | LOW | 30m | 🔄 Pending |

**Total Estimated Time:** ~13 hours
**Critical Path:** Tasks 1.1-1.3 (foundation)
**Quick Wins:** Tasks 2.1-2.4 (high impact, low effort)
