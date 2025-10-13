# LifeLock Component Migration - Execution Plan

**Date**: 2025-10-13
**Goal**: Move all LifeLock components to proper architecture locations
**Approach**: Archive orphans, move active files, update imports

---

## 📋 **EXECUTION PHASES**

### **PHASE 1: Archive Orphaned Files (Zero Risk)**

Move unused files to `.archive/2025-10-13-component-cleanup/`

#### **1A. Archive orphaned from /components/ui/**
```bash
# Already archived (can delete):
- siso-deep-focus-plan.tsx
- siso-deep-focus-plan-v2.tsx
- siso-light-work-plan.tsx

# Archive these:
- SubtaskRow.tsx (8,344 bytes - NO USAGE)
- SharedTaskCard.tsx (6,355 bytes - NO USAGE)
- animated-task-icon.tsx (NO USAGE)
- animated-checkbox.tsx (NO USAGE)
- animated-progress-counter.tsx (NO USAGE)
- component-reusability-demo.tsx (demo file)
- swipe-hint.tsx (NO USAGE)
```

#### **1B. Archive entire /components/layout/ folder**
```bash
# 33 files, ZERO active imports
mv src/components/layout/ .archive/2025-10-13-component-cleanup/
```

#### **1C. Archive orphaned from /components/tasks/**
```bash
# Move these unused files:
- TaskContainer.tsx (11,215 bytes)
- TaskContainerV2.tsx (5,844 bytes)
- TaskActionButtons.tsx (3,979 bytes)
- TaskDetailModal.tsx (18,239 bytes - possible duplicate)
```

#### **1D. Archive orphaned from /shared/ui/**
```bash
# LifeLock-specific files that shouldn't be in shared:
- siso-deep-focus-plan.tsx (22,762 bytes - NO USAGE)
- enhanced-light-work-manager.tsx (44,858 bytes - NO USAGE)
- clean-date-nav.tsx (10,463 bytes - NO USAGE by LifeLock)
- animated-date-header.tsx (6,398 bytes - OLD VERSION, v2 is used)
```

**Total**: ~50+ files to archive
**Risk**: ZERO - none have active imports
**Impact**: Cleaner codebase

---

### **PHASE 2: Move Core LifeLock Components**

#### **2A. TabContentRenderer → lifelock/core/**

**Current**: `/components/ui/TabContentRenderer.tsx`
**New**: `/ecosystem/internal/lifelock/core/TabContentRenderer.tsx`

**Files to update (2):**
```typescript
// src/ecosystem/internal/lifelock/AdminLifeLock.tsx
// src/ecosystem/internal/lifelock/core/LifeLockViewRenderer.tsx

Change: import { SafeTabContentRenderer } from '@/components/ui/TabContentRenderer';
To:     import { SafeTabContentRenderer } from '@/ecosystem/internal/lifelock/core/TabContentRenderer';
```

**Why**: LifeLock-specific tab rendering logic
**Risk**: Low - just import path changes

---

#### **2B. task-detail-modal → lifelock/components/**

**Current**: `/components/ui/task-detail-modal.tsx`
**New**: `/ecosystem/internal/lifelock/components/TaskDetailModal.tsx`

**Files to update (2):**
```typescript
// src/ecosystem/internal/lifelock/views/daily/deep-work/components/DeepWorkTaskList.tsx
// src/ecosystem/internal/lifelock/views/daily/light-work/components/LightWorkTaskList.tsx

Change: import { TaskDetailModal } from '@/components/ui/task-detail-modal';
To:     import { TaskDetailModal } from '@/ecosystem/internal/lifelock/components/TaskDetailModal';
```

**Why**: LifeLock-specific task modal
**Risk**: Low - only 2 files to update

---

#### **2C. animated-date-header-v2 → lifelock/components/**

**Current**: `/shared/ui/animated-date-header-v2.tsx`
**New**: `/ecosystem/internal/lifelock/components/AnimatedDateHeader.tsx`

**Files to update (3):**
```typescript
// src/ecosystem/internal/lifelock/views/daily/wellness/home-workout/HomeWorkoutSection.tsx
// src/ecosystem/internal/lifelock/views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx
// src/ecosystem/internal/lifelock/views/daily/timebox/TimeboxSection.tsx

Change: import { AnimatedDateHeader } from '@/shared/ui/animated-date-header-v2';
To:     import { AnimatedDateHeader } from '@/ecosystem/internal/lifelock/components/AnimatedDateHeader';
```

**Why**: LifeLock-specific date header with XP/streak display
**Risk**: Low - only 3 files to update

---

### **PHASE 3: Consolidate Daily Shared Components**

#### **3A. Use existing _shared CustomCalendar**

**Current**: DeepWorkTaskList/LightWorkTaskList use `/components/ui/CustomCalendar.tsx`
**Existing**: `/ecosystem/internal/lifelock/views/daily/_shared/components/ui/CustomCalendar.tsx` ✅

**Action**:
1. Compare both files to confirm they're identical/compatible
2. Update imports in new task lists
3. Archive `/components/ui/CustomCalendar.tsx`

**Files to update (2):**
```typescript
// DeepWorkTaskList.tsx
// LightWorkTaskList.tsx

Change: import { CustomCalendar } from '@/components/ui/CustomCalendar';
To:     import { CustomCalendar } from '../../_shared/components';
```

**Risk**: Low - _shared version already exists

---

#### **3B. Move /components/tasks/ to _shared**

**Files to move**:
```
SubtaskItem.tsx (9,722 bytes)
SubtaskMetadata.tsx (9,556 bytes)
TaskSeparator.tsx (991 bytes)
```

**Current**: `/components/tasks/`
**New**: `/ecosystem/internal/lifelock/views/daily/_shared/components/`

**Wait!** These already exist in _shared but are DIFFERENT versions:
- `/components/tasks/SubtaskItem.tsx` - **247 lines** (full features)
- `/_shared/components/subtask/SubtaskItem.tsx` - **156 lines** (simpler)

**Decision Needed**:
- Keep using `/components/tasks/` versions (they work perfectly)
- OR verify _shared versions can handle all features
- OR replace _shared versions with the fuller /components/tasks/ versions

**Files to update (2):**
```typescript
// DeepWorkTaskList.tsx
// LightWorkTaskList.tsx

Change: import { SubtaskItem } from '@/components/tasks/SubtaskItem';
        import { TaskSeparator } from '@/components/tasks/TaskSeparator';
To:     import { SubtaskItem, TaskSeparator } from '../../_shared/components';
```

**Risk**: Medium - Need to test which version to use

---

## 🎯 **RECOMMENDED EXECUTION**

### **TODAY (Do Now):**

**Phase 1**: Archive all orphaned files (~50 files)
- Creates clean slate
- Zero risk (no active usage)
- Reduces confusion

**Phase 2A-C**: Move 3 core components
- TabContentRenderer → lifelock/core/
- task-detail-modal → lifelock/components/
- animated-date-header-v2 → lifelock/components/
- Update ~7 import statements
- Test each section

### **LATER (Needs More Analysis):**

**Phase 3**: Decide on subtask component strategy
- Current: /components/tasks/ versions work perfectly
- Option: Move them as-is to _shared and update imports
- Option: Keep them where they are if they're truly perfect

---

## 📊 **SUMMARY**

### **Files to Archive**: ~50 orphaned files
### **Files to Move**: 3-6 active files
### **Imports to Update**: ~10 files
### **Risk Level**: Low (Phase 1-2), Medium (Phase 3)

---

## 🚀 **Ready to Execute?**

Want me to start with **Phase 1** (archive orphaned files)?
