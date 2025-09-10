# Morning Routine Page - UI/UX Issues Document

## Overview
This document catalogs identified UI/UX issues with the morning routine page components for future improvements. All text/copy is approved - these are layout and design optimization opportunities.

---

## Issue #1: Wake Up Time Tracking Section Layout

**Component:** `MorningRoutineSection.tsx`
**Location:** Lines 341-382 (Wake Up task special time tracking interface)
**Screenshot:** Provided by user

### Current Implementation
The wake-up time tracking section has a complex interface that shows when editing:
- When time set: Shows "Woke up at: {time}" badge + "Edit" button
- When editing: Text input "Enter wake-up time (e.g., 7:30 AM)" + "Use Now (19:46)" button
- Help text: "Track your wake-up time to build better morning routine habits."

### Issue Description
The current interface becomes cluttered when clicked to edit. User suggests this could be much cleaner with a time slider interface showing hour/minute controls instead of text input.

### Current Code Location
```typescript
// MorningRoutineSection.tsx lines 341-382
{task.hasTimeTracking && (
  <div className="mt-2">
    <div className="space-y-2">
      {wakeUpTime ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-yellow-900/20 border border-yellow-700/50 rounded-md px-3 py-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-100 font-semibold">
              Woke up at: {wakeUpTime}
            </span>
          </div>
          <Button onClick={() => setIsEditingWakeTime(!isEditingWakeTime)}>
            Edit
          </Button>
        </div>
      ) : null}
      
      {(!wakeUpTime || isEditingWakeTime) && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter wake-up time (e.g., 7:30 AM)"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
          />
          <Button onClick={setCurrentTimeAsWakeUp}>
            Use Now ({getCurrentTime()})
          </Button>
        </div>
      )}
    </div>
  </div>
)}
```

### Suggested Improvement Options

#### **Option 1: Time Slider Interface (User Preferred)**
Replace text input with hour/minute sliders when editing:
- Hour slider: 1-12 with AM/PM toggle
- Minute slider: 00-59 in 5-minute increments
- Cleaner, more visual time selection
- Better mobile experience

#### **Option 2: Time Picker Wheel (Mobile-First)**
iOS-style spinning wheels for time selection:
- Native mobile feel with smooth scrolling
- Separate wheels for hour, minute, AM/PM
- Compact and intuitive interaction

#### **Option 3: Quick Time Buttons + Custom**
Preset common wake-up times with custom option:
- Quick buttons: "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"
- "Custom" button reveals time slider/picker
- Faster for common times, flexible for edge cases

#### **Option 4: Prominent Callout Card Design**
Keep current functionality but improve visual design:
- Dedicated card/callout box with better visual hierarchy
- Larger, more prominent time display
- Better spacing and typography
- Keep text input but style it better

#### **Option 5: Inline Time Components**
Hybrid approach with separate hour/minute inputs:
- Two small inputs: [HH] : [MM] [AM/PM dropdown]
- Stepper buttons (+/-) on each input
- More structured than free text, less complex than sliders

### Recommended Approach
**Option 1 (Time Slider)** for best UX, with **Option 3 (Quick Buttons)** as fallback for speed.

### ✅ **IMPLEMENTED SOLUTION**
**Option 2: Time Picker Wheel (Mobile-First)** has been successfully integrated!

#### Implementation Details:
- **Component:** `WakeUpTimePicker` created in `src/shared/ui/wake-up-time-picker.tsx`
- **Integration:** Modified `MorningRoutineSection.tsx` lines 341-378
- **Features:**
  - iOS-style wheel picker with hour/minute/AM-PM wheels
  - "Use Now" button for quick current time selection
  - Themed to match yellow morning routine design
  - Shows selected time prominently before saving
  - Only appears when user clicks "Edit" button
- **Dependencies:** `@ncdai/react-wheel-picker` installed successfully

#### User Flow:
1. When no time set: Shows wheel picker immediately
2. When time is set: Shows "Woke up at: {time}" with "Edit" button
3. When "Edit" clicked: Shows wheel picker interface
4. User selects time or uses "Use Now" → time saved and picker closes

### Priority
Medium - UI/UX enhancement opportunity **✅ COMPLETED**

---

## Issue #2: Time Duration Duplication in Task Titles

**Component:** `MorningRoutineSection.tsx` & `task-defaults.ts`
**Location:** Task title display and task definitions
**Screenshots:** User provided images showing duplication

### Current Implementation
The "Get Blood Flowing" task shows time duration twice:
- In title: "Get Blood Flowing (5 min)"
- In grey text next to title: "(5 min)"

### Issue Description
Time duration appears redundantly in both the main title and as additional grey text, creating visual clutter and redundancy.

### Current Code Location
```typescript
// task-defaults.ts line ~60
{
  key: 'getBloodFlowing',
  title: 'Get Blood Flowing (5 min)',  // ← Time here
  timeEstimate: '5 min',              // ← And here
}

// MorningRoutineSection.tsx display
<h4>{task.title}</h4>
<span>({task.timeEstimate})</span>  // ← Duplicates the time
```

### Suggested Improvement Direction
- Remove time from title text in task-defaults.ts
- Keep only the grey timeEstimate display
- Title should be: "Get Blood Flowing" (no time)

### Priority
Low - Visual cleanup

---

## Issue #3: Exercise PB Tracking & Checkbox Design

**Component:** `MorningRoutineSection.tsx` & `task-defaults.ts`
**Location:** Exercise subtasks and checkbox styling
**Screenshots:** User provided images of subtask checkboxes

### Current Implementation Part A - PB Tracking
Only "Push-ups" shows PB (Personal Best) tracking:
- "Push-ups (PB 30)"
- "Sit-ups" (no PB)
- "Pull-ups" (no PB)

### Issue Description Part A
User suggests adding PB tracking for all exercise options, not just push-ups.

### Current Code Location Part A
```typescript
// task-defaults.ts lines ~65-69
subtasks: [
  { key: 'pushups', title: 'Push-ups (PB 30)' },  // ← Only this has PB
  { key: 'situps', title: 'Sit-ups' },            // ← Could add PB
  { key: 'pullups', title: 'Pull-ups' }           // ← Could add PB
]
```

### Current Implementation Part B - Checkbox Design
The subtask checkboxes have basic styling with connecting lines to parent task.

### Issue Description Part B
The checkbox visual design and interaction could be improved. Current checkboxes work functionally but visual design could be enhanced.

### Current Code Location Part B
```typescript
// MorningRoutineSection.tsx lines ~320-340
<Checkbox
  checked={isHabitCompleted(subtask.key)}
  onCheckedChange={(checked) => handleHabitToggle(subtask.key, !!checked)}
  className="h-4 w-4 border-yellow-400/70 data-[state=checked]:bg-yellow-500..."
/>
```

### Suggested Improvement Direction
- Add PB tracking to Sit-ups and Pull-ups
- Enhance checkbox visual design and styling
- Consider better visual feedback for checked/unchecked states

### Priority
Medium - UX enhancement opportunity

---

## Issue #4: [Waiting for user input]

*Additional issues to be documented as provided...*

---

## Notes
- All text/copy content is approved as-is
- Focus is on layout, visual design, and component organization improvements
- Component files: `MorningRoutineTab.tsx`, `MorningRoutineSection.tsx`, related UI components