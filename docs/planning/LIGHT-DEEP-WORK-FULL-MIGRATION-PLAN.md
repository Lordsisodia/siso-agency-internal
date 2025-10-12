# 🚀 Light + Deep Work FULL Domain Ownership Migration
**Date**: 2025-10-12
**Approach**: Copy ALL components into domain folders for full control
**Estimated Time**: 1 hour per section (2 hours total)
**Safety**: Rollback at every phase

---

## 🎯 WHAT WE'RE DOING (Option A - Full Control)

Copying THE ENTIRE task management UI stack into each domain:
- ✅ Full customization freedom (green vs blue themes)
- ✅ Fix bugs without affecting other domains
- ✅ Independent evolution
- ✅ AI can edit light-work components without touching deep-work

**Yes, it's code duplication. But you get FULL CONTROL.**

---

## 📦 COMPLETE DEPENDENCY MANIFEST

### Files to Copy Into EACH Domain (light-work AND deep-work):

#### Main Component (1 file):
```
UnifiedWorkSection.tsx (517 lines)
└─ Rename to: LightWorkTaskList.tsx / DeepWorkTaskList.tsx
```

#### Management Components (9 files, ~1,945 lines total):
```
1. TaskActionButtons.tsx      (Task CRUD buttons)
2. TaskSeparator.tsx           (Visual separator)
3. TaskProgress.tsx            (Progress bars)
4. SubtaskMetadata.tsx         (🎯 PRIORITY, CALENDAR, TIME - this is what you want to fix!)
5. TaskHeader.tsx              (Task title/actions)
6. SubtaskItem.tsx             (Subtask rendering)
7. AddSubtaskInput.tsx         (Add subtask form)
8. TaskStatsGrid.tsx           (XP/time stats)
9. WorkProtocolCard.tsx        (Work protocol)
```

#### External Dependencies (Copy These Too):
```
10. CustomCalendar.tsx         (from calendar/ui/ - you want different colors!)
11. useTaskEditing.ts          (UI state hook)
12. useTaskFiltering.ts        (Filtering logic)
13. useTaskReordering.ts       (Reorder logic)
14. subtaskSorting.ts          (Sort utility)
```

#### Keep Shared (Database Only):
```
✅ useLightWorkTasksSupabase.ts  (26K lines - DATABASE - stays in tasks/hooks/)
✅ useDeepWorkTasksSupabase.ts   (28K lines - DATABASE - stays in tasks/hooks/)
```

**Total per domain**: ~14 files, ~3,000+ lines of UI code

---

## 🏗️ FINAL STRUCTURE (Per Domain)

### Light Work:
```
views/daily/light-work/
├── LightFocusWorkSection.tsx    (main wrapper)
├── components/
│   ├── LightWorkTaskList.tsx    (from UnifiedWorkSection - GREEN theme)
│   ├── TaskCard.tsx             (might extract from TaskList)
│   ├── SubtaskItem.tsx          (GREEN checkboxes)
│   ├── SubtaskMetadata.tsx      (🎯 GREEN calendar, FIXED priority!)
│   ├── TaskHeader.tsx
│   ├── TaskActionButtons.tsx
│   ├── AddSubtaskInput.tsx
│   ├── TaskProgress.tsx
│   ├── TaskSeparator.tsx
│   ├── TaskStatsGrid.tsx
│   ├── WorkProtocolCard.tsx
│   └── CustomCalendar.tsx       (GREEN theme)
├── hooks/
│   ├── useTaskEditing.ts
│   ├── useTaskFiltering.ts
│   └── useTaskReordering.ts
└── utils/
    └── subtaskSorting.ts
```

### Deep Work:
**EXACT same structure, BLUE theme instead of GREEN**

---

## 🚀 PHASE-BY-PHASE MIGRATION PLAN

### LIGHT WORK MIGRATION (1 hour)

#### Phase L1: Create Structure (2 min)
```bash
mkdir -p views/daily/light-work/{components,hooks,utils}
```

#### Phase L2: Copy Main Component (3 min)
```bash
cp tasks/components/UnifiedWorkSection.tsx \
   views/daily/light-work/components/LightWorkTaskList.tsx
```

#### Phase L3: Copy Management Components (5 min)
```bash
# Copy all 9 management components
cp tasks/management/TaskActionButtons.tsx views/daily/light-work/components/
cp tasks/management/TaskSeparator.tsx views/daily/light-work/components/
cp tasks/management/TaskProgress.tsx views/daily/light-work/components/
cp tasks/management/SubtaskMetadata.tsx views/daily/light-work/components/
cp tasks/management/TaskHeader.tsx views/daily/light-work/components/
cp tasks/management/SubtaskItem.tsx views/daily/light-work/components/
cp tasks/management/AddSubtaskInput.tsx views/daily/light-work/components/
cp tasks/management/TaskStatsGrid.tsx views/daily/light-work/components/
cp tasks/management/WorkProtocolCard.tsx views/daily/light-work/components/
```

#### Phase L4: Copy Calendar (2 min)
```bash
cp ecosystem/internal/calendar/ui/CustomCalendar.tsx \
   views/daily/light-work/components/
```

#### Phase L5: Copy Hooks (3 min)
```bash
cp tasks/hooks/useTaskEditing.ts views/daily/light-work/hooks/
cp tasks/hooks/useTaskFiltering.ts views/daily/light-work/hooks/
cp tasks/hooks/useTaskReordering.ts views/daily/light-work/hooks/
```

#### Phase L6: Copy Utils (1 min)
```bash
cp tasks/utils/subtaskSorting.ts views/daily/light-work/utils/
```

#### Phase L7: Update Imports in LightWorkTaskList.tsx (10 min)
Change ALL imports from shared paths to local:
```typescript
// FROM:
import { TaskHeader } from '@/ecosystem/internal/tasks/management/TaskHeader';
import { SubtaskItem } from '@/ecosystem/internal/tasks/management/SubtaskItem';
// ... (9 more)

// TO:
import { TaskHeader } from './TaskHeader';
import { SubtaskItem } from './SubtaskItem';
// ... (9 more - all from ./components)

// Hooks:
import { useTaskEditing } from '../hooks/useTaskEditing';

// Utils:
import { sortSubtasksHybrid } from '../utils/subtaskSorting';

// Calendar:
import { CustomCalendar } from './CustomCalendar';
```

#### Phase L8: Update LightFocusWorkSection.tsx (3 min)
```typescript
// FROM:
import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';

// TO:
import { LightWorkTaskList } from './components/LightWorkTaskList';

// And replace component:
<LightWorkTaskList ... />
```

#### Phase L9: Fix ALL Internal Imports in Copied Components (15 min)
Each management component imports others:
```typescript
// SubtaskMetadata.tsx might import:
import { CustomCalendar } from './CustomCalendar';  // Update to local

// TaskHeader.tsx might import:
import { TaskActionButtons } from './TaskActionButtons';  // Update to local
```

#### Phase L10: Test Light Work (5 min)
- Load light-work tab
- Create task
- Add subtask
- Test priority selector (fix the bug!)
- Test calendar
- Test all features

#### Phase L11: Customize for Light Work (10 min)
```typescript
// SubtaskMetadata.tsx - GREEN theme
<div className="text-emerald-400">  // Light work color

// CustomCalendar.tsx - GREEN accents
className="border-emerald-500"

// Fix priority cut-off bug
<div className="w-full overflow-visible truncate-none">
```

#### Phase L12: Commit (1 min)
```bash
git commit -m "🚀 Light Work - Full domain ownership migration"
```

---

### DEEP WORK MIGRATION (1 hour)

**REPEAT EXACT SAME STEPS** but:
- Folder: `views/daily/deep-work/`
- Rename: `DeepWorkTaskList.tsx`
- Theme: **BLUE** instead of green
- Test deep-work tab

---

## 📋 COMPLETE FILE MANIFEST (What Gets Copied × 2)

### Per Domain (14 files each):

**Main**:
1. LightWorkTaskList.tsx / DeepWorkTaskList.tsx (517 lines - renamed UnifiedWorkSection)

**Components (9 files)**:
2. TaskActionButtons.tsx
3. TaskSeparator.tsx
4. TaskProgress.tsx
5. SubtaskMetadata.tsx      (🎯 Priority + Calendar - FIX HERE!)
6. TaskHeader.tsx
7. SubtaskItem.tsx
8. AddSubtaskInput.tsx
9. TaskStatsGrid.tsx
10. WorkProtocolCard.tsx
11. CustomCalendar.tsx       (GREEN or BLUE theme)

**Hooks (3 files)**:
12. useTaskEditing.ts
13. useTaskFiltering.ts
14. useTaskReordering.ts

**Utils (1 file)**:
15. subtaskSorting.ts

**Total**: ~3,500 lines × 2 domains = ~7,000 lines of UI code in domain control

---

## 🛡️ SAFETY PROCEDURES

### Before Starting:
```bash
# New safety checkpoint
git add . && git commit --no-verify -m "💾 Checkpoint before light/deep work migration"

# Create new backup
rsync -a src/ecosystem/internal/lifelock/ backups/before-work-sections-2025-10-12/
```

### After Each Phase:
```bash
# Test that section still loads
# If broken:
git reset --hard HEAD  # Undo last changes
```

### After Each Section Complete:
```bash
# Commit checkpoint
git commit -m "✅ Light work domain ownership complete"

# Test thoroughly before starting deep work
```

### Nuclear Rollback:
```bash
bash scripts/rollback-morning-routine-restructure.sh
# Abandons entire branch
```

---

## 🎨 CUSTOMIZATION OPPORTUNITIES (Why We're Doing This)

### Light Work (GREEN Theme):
```typescript
// SubtaskMetadata.tsx
<div className="text-emerald-400 border-emerald-500">  // GREEN

// CustomCalendar.tsx
<div className="bg-emerald-500/10 hover:bg-emerald-500/20">  // GREEN

// TaskProgress.tsx
<div className="bg-gradient-to-r from-emerald-400 to-teal-500">  // GREEN

// FIX PRIORITY BUG:
<div className="max-w-full overflow-visible">  // No more cut-off!
```

### Deep Work (BLUE Theme):
```typescript
// SubtaskMetadata.tsx
<div className="text-blue-400 border-blue-500">  // BLUE

// CustomCalendar.tsx
<div className="bg-blue-500/10 hover:bg-blue-500/20">  // BLUE

// TaskProgress.tsx
<div className="bg-gradient-to-r from-blue-400 to-purple-500">  // BLUE

// SAME bug fixes as light work
```

---

## ⚠️ POTENTIAL ISSUES & SOLUTIONS

### Issue 1: Import Hell
**Problem**: 14 files × lots of imports = easy to mess up

**Solution**:
- Do one file at a time
- Test after each file
- Use find/replace for import paths

### Issue 2: Circular Dependencies
**Problem**: Components might import each other

**Solution**:
- Copy all files first
- THEN fix imports
- Not the other way around

### Issue 3: Forget a Dependency
**Problem**: Miss a util or type file

**Solution**:
- Run TypeScript check after migration
- Errors will tell us what's missing

---

## 📊 EFFORT COMPARISON

### Original Plan (Just Wrappers):
- Time: 10 minutes total
- Files moved: 2
- Control: Limited
- Customization: Can't do

### New Plan (Full Domain Ownership):
- Time: 2 hours total
- Files copied: 28 (14 per domain)
- Control: FULL
- Customization: Anything you want

**Worth it?** YES - you get:
- ✅ Green light work, blue deep work
- ✅ Fix priority bug without fear
- ✅ Edit any component freely
- ✅ Independent evolution

---

## ✅ READY TO EXECUTE?

**Plan created**: Phase-by-phase for light work, then repeat for deep work

**Safety**: Checkpoints, rollback, testing

**Outcome**: Full domain ownership - customize anything!

**Proceed with Phase L1 (create light-work structure)?** 🚀
