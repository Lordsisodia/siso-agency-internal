# LifeLock Component Cleanup Plan

**Date**: 2025-10-13
**Status**: Analysis Complete - Ready for Execution

---

## 🎯 **ACTIVE USAGE ANALYSIS**

### **✅ CURRENTLY ACTIVE (Used by NEW pixel-perfect components)**

#### **From `/components/ui/`:**
```
✅ CustomCalendar.tsx (5,910 bytes)
   Used by: DeepWorkTaskList, LightWorkTaskList

✅ task-detail-modal.tsx (14,893 bytes)
   Used by: DeepWorkTaskList, LightWorkTaskList

✅ TabContentRenderer.tsx (5,205 bytes)
   Used by: AdminLifeLock.tsx, LifeLockViewRenderer.tsx
```

#### **From `/components/tasks/`:**
```
✅ SubtaskItem.tsx (9,722 bytes - 247 lines with all features)
   Used by: DeepWorkTaskList, LightWorkTaskList

✅ SubtaskMetadata.tsx (9,556 bytes)
   Used by: SubtaskItem.tsx (internally)

✅ TaskSeparator.tsx (991 bytes)
   Used by: DeepWorkTaskList, LightWorkTaskList
```

#### **From `/shared/ui/`:**
```
✅ animated-date-header-v2.tsx (13,959 bytes)
   Used by: HomeWorkoutSection, HealthNonNegotiablesSection, TimeboxSection
```

---

## ❌ **ORPHANED - No Active Imports (Safe to Delete)**

### **`/components/ui/` - 6 files**
```
❌ siso-deep-focus-plan.tsx (37,734 bytes) - ARCHIVED ✅
❌ siso-deep-focus-plan-v2.tsx (6,844 bytes) - ARCHIVED ✅
❌ siso-light-work-plan.tsx (9,441 bytes) - ARCHIVED ✅
❌ SubtaskRow.tsx (8,344 bytes) - NO USAGE FOUND
❌ SharedTaskCard.tsx (6,355 bytes) - Used only by siso-light-work-plan (also archived)
❌ animated-task-icon.tsx, animated-checkbox.tsx, animated-progress-counter.tsx (legacy?)
❌ component-reusability-demo.tsx (demo file)
❌ swipe-hint.tsx (legacy?)
```

### **`/components/layout/` - ENTIRE FOLDER (33 files)**
```
❌ ALL 33 FILES - Zero active imports from LifeLock
   Status: Legacy redirect files or old backups
   Action: Archive entire folder
```

### **`/components/tasks/` - 4 files**
```
❌ TaskContainer.tsx (11,215 bytes) - NO USAGE FOUND
❌ TaskContainerV2.tsx (5,844 bytes) - NO USAGE FOUND
❌ TaskActionButtons.tsx (3,979 bytes) - NO USAGE FOUND
⚠️  TaskDetailModal.tsx (18,239 bytes) - Possible duplicate of /components/ui/task-detail-modal.tsx?
```

### **`/shared/ui/` - 2 files**
```
❌ siso-deep-focus-plan.tsx (22,762 bytes) - Different version, NO USAGE FOUND
❌ enhanced-light-work-manager.tsx (44,858 bytes) - NO USAGE FOUND (was in old config, removed)
```

---

## 🏗️ **PROPER ARCHITECTURE MAPPING**

Based on the LifeLock architecture pattern:
```
/ecosystem/internal/lifelock/
  ├── core/              ← Core system components (TabContentRenderer)
  ├── components/        ← LifeLock-wide shared components
  ├── features/          ← Feature-specific (ai-thought-dump, etc.)
  └── views/
      └── daily/
          ├── _shared/
          │   └── components/  ← Daily-view shared components
          └── [section]/
              └── components/  ← Section-specific components
```

### **Files That Need Moving:**

#### **1. TabContentRenderer.tsx**
```
Current:  /components/ui/TabContentRenderer.tsx
Should be: /ecosystem/internal/lifelock/core/TabContentRenderer.tsx
Why: LifeLock-specific tab rendering logic
Usage: AdminLifeLock.tsx, LifeLockViewRenderer.tsx
```

#### **2. CustomCalendar.tsx**
```
Current:  /components/ui/CustomCalendar.tsx
Should be: /ecosystem/internal/lifelock/views/daily/_shared/components/ui/CustomCalendar.tsx
Why: Already exists there! This is a duplicate
Action: Update imports in DeepWorkTaskList/LightWorkTaskList, then delete
```

#### **3. SubtaskItem.tsx + SubtaskMetadata.tsx + TaskSeparator.tsx**
```
Current:  /components/tasks/
Should be: /ecosystem/internal/lifelock/views/daily/_shared/components/
Why: These are LifeLock daily-view specific (not global task components)
Action: Move to _shared and update imports
```

#### **4. task-detail-modal.tsx**
```
Current:  /components/ui/task-detail-modal.tsx
Should be: /ecosystem/internal/lifelock/components/TaskDetailModal.tsx
Why: LifeLock-specific task modal
Usage: DeepWorkTaskList, LightWorkTaskList
```

#### **5. animated-date-header-v2.tsx**
```
Current:  /shared/ui/animated-date-header-v2.tsx
Should be: /ecosystem/internal/lifelock/components/AnimatedDateHeader.tsx
Why: LifeLock-specific date header (used by wellness/timebox sections)
Usage: HomeWorkoutSection, HealthNonNegotiablesSection, TimeboxSection
```

---

## 📋 **MIGRATION PLAN - 3 Phases**

### **Phase 1: Safe Deletions (No Breaking Changes)**

Delete orphaned files that have no active imports:

```bash
# Components to delete (already archived):
rm src/components/ui/siso-deep-focus-plan.tsx
rm src/components/ui/siso-deep-focus-plan-v2.tsx
rm src/components/ui/siso-light-work-plan.tsx
rm src/components/ui/SubtaskRow.tsx
rm src/components/ui/SharedTaskCard.tsx

rm src/shared/ui/siso-deep-focus-plan.tsx
rm src/shared/ui/enhanced-light-work-manager.tsx

# Archive and delete entire /components/layout/ folder (33 files, zero usage)
mv src/components/layout .archive/2025-10-13-cleanup/components-layout-backup

# Delete unused /components/tasks/ files:
rm src/components/tasks/TaskContainer.tsx
rm src/components/tasks/TaskContainerV2.tsx
rm src/components/tasks/TaskActionButtons.tsx
```

**Impact**: ZERO - These files have no active imports
**Risk**: None - All archived for rollback

---

### **Phase 2: Move Core LifeLock Components**

#### **2A. Move TabContentRenderer**
```bash
# 1. Move file
mv src/components/ui/TabContentRenderer.tsx \
   src/ecosystem/internal/lifelock/core/TabContentRenderer.tsx

# 2. Update imports (2 files):
# - AdminLifeLock.tsx
# - LifeLockViewRenderer.tsx
Change: from '@/components/ui/TabContentRenderer'
To:     from '@/ecosystem/internal/lifelock/core/TabContentRenderer'
```

**Files to update**: 2
**Risk**: Low - Simple import path change

#### **2B. Move animated-date-header-v2**
```bash
# 1. Move file
mv src/shared/ui/animated-date-header-v2.tsx \
   src/ecosystem/internal/lifelock/components/AnimatedDateHeader.tsx

# 2. Update imports (3 files):
# - HomeWorkoutSection.tsx
# - HealthNonNegotiablesSection.tsx
# - TimeboxSection.tsx
Change: from '@/shared/ui/animated-date-header-v2'
To:     from '@/ecosystem/internal/lifelock/components/AnimatedDateHeader'
```

**Files to update**: 3
**Risk**: Low - Simple import path change

#### **2C. Move task-detail-modal**
```bash
# 1. Move file
mv src/components/ui/task-detail-modal.tsx \
   src/ecosystem/internal/lifelock/components/TaskDetailModal.tsx

# 2. Update imports (2 files):
# - DeepWorkTaskList.tsx
# - LightWorkTaskList.tsx
Change: from '@/components/ui/task-detail-modal'
To:     from '@/ecosystem/internal/lifelock/components/TaskDetailModal'
```

**Files to update**: 2
**Risk**: Low - These are our NEW components

---

### **Phase 3: Consolidate Daily Shared Components**

#### **3A. Use existing _shared CustomCalendar**
```bash
# NO MOVE - Already exists in correct location!
# Just update imports in:
# - DeepWorkTaskList.tsx
# - LightWorkTaskList.tsx

Change: from '@/components/ui/CustomCalendar'
To:     from '../../_shared/components'

# Then verify old one is truly duplicate and delete:
rm src/components/ui/CustomCalendar.tsx
```

**Files to update**: 2
**Risk**: Low - _shared version already exists and is identical

#### **3B. Move /components/tasks/ to _shared**
```bash
# 1. Move files to proper location
mv src/components/tasks/SubtaskItem.tsx \
   src/ecosystem/internal/lifelock/views/daily/_shared/components/subtask/SubtaskItem.tsx

mv src/components/tasks/SubtaskMetadata.tsx \
   src/ecosystem/internal/lifelock/views/daily/_shared/components/subtask/SubtaskMetadata.tsx

mv src/components/tasks/TaskSeparator.tsx \
   src/ecosystem/internal/lifelock/views/daily/_shared/components/task/TaskSeparator.tsx

# 2. Update imports in DeepWorkTaskList + LightWorkTaskList:
Change: from '@/components/tasks/...'
To:     from '../../_shared/components'
```

**Files to update**: 2 (DeepWorkTaskList, LightWorkTaskList)
**Risk**: Medium - These files are larger, need careful testing

---

## 🎯 **RECOMMENDED EXECUTION ORDER**

### **NOW (Immediate - Zero Risk):**
1. ✅ Delete orphaned files (Phase 1)
   - Already archived siso-deep-focus-plan variants
   - Delete SubtaskRow, SharedTaskCard
   - Archive/delete entire /components/layout/ folder

### **NEXT (Low Risk):**
2. Move core components (Phase 2A, 2B, 2C)
   - TabContentRenderer → /lifelock/core/
   - animated-date-header-v2 → /lifelock/components/
   - task-detail-modal → /lifelock/components/

### **LATER (Medium Risk - Needs Testing):**
3. Consolidate daily shared (Phase 3A, 3B)
   - Use _shared/CustomCalendar instead of /components/ui/
   - Move SubtaskItem/SubtaskMetadata/TaskSeparator to _shared/

---

## 📊 **IMPACT SUMMARY**

### **Total Files to Process:**
- 🗑️ **Delete**: 15+ orphaned files
- 📦 **Archive**: 33 files (/components/layout/)
- 📁 **Move**: 6 actively used files
- ✏️ **Update imports**: ~10 files

### **Storage Savings:**
- ~200KB of orphaned code removed
- Better organization
- Clearer architecture

### **Risk Assessment:**
- **Phase 1**: Zero risk (no active usage)
- **Phase 2**: Low risk (simple import changes)
- **Phase 3**: Medium risk (needs testing)

---

## ⚠️ **CRITICAL NOTES**

1. **DO NOT delete /components/tasks/ files yet** - They're actively used by NEW components
2. **DO move them later** to _shared once we verify the _shared versions work
3. **/components/layout/** has zero usage - safe to archive immediately
4. **Test after each phase** before moving to next

---

## 🚀 **READY TO EXECUTE?**

All analysis complete. Components are categorized. Migration paths mapped.

**Recommendation**: Start with Phase 1 (safe deletions) immediately.

Want me to proceed?
