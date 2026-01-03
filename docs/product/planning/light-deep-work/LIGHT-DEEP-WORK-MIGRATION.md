# Light Work + Deep Work Migration Plan
**Date**: 2025-10-12
**Type**: Tier 1 - Simple Wrappers (No Extraction Needed)

---

## 🎯 WHAT WE LEARNED FROM MORNING ROUTINE

### ✅ Successes
1. **Folder structure works**: Domain-based folders provide clarity
2. **Component extraction**: Reduced 789 → 658 lines with 5 focused components
3. **Import fixes**: Must use absolute paths when moving files
4. **Phase-by-phase**: Small commits = easy rollback
5. **Testing**: Verify after changes

### ⚠️ What Caused Issues
1. **Relative imports broke**: When file moved deeper, `../` paths resolved wrong
2. **Fixed by**: Converting to absolute `@/` paths

### 📋 Checklist for Next Migrations
- [ ] All imports must be absolute (@/)
- [ ] Test after each section migrated
- [ ] Commit after each section
- [ ] Archive old files only after new ones work

---

## 📊 LIGHT + DEEP WORK ANALYSIS

### Key Findings

**Both sections are ALMOST IDENTICAL**:
- Only 118 lines (Light) and 109 lines (Deep)
- Just wrappers around `UnifiedWorkSection` component
- Different hooks: `useLightWorkTasksSupabase` vs `useDeepWorkTasksSupabase`
- Different workType prop: 'LIGHT' vs 'DEEP'

**Differences (from diff)**:
```diff
< Light Focus Work
> Deep Focus Work

< useLightWorkTasksSupabase
> useDeepWorkTasksSupabase

< workType: 'LIGHT'
> workType: 'DEEP'

< priority: 'MEDIUM' (default for light work)
> priority: 'HIGH' (default for deep work)
```

**Imports Check**: ✅ ALL absolute paths already - no fixes needed!

---

## 🏗️ FOLDER STRUCTURE DECISION

### Separate Folders (Recommended)

```
views/daily/
├── light-work/
│   └── LightFocusWorkSection.tsx (118 lines - keep as single file)
└── deep-work/
    └── DeepFocusWorkSection.tsx (109 lines - keep as single file)
```

**Why separate?**
- ✅ Different domains (light work ≠ deep work conceptually)
- ✅ Different hooks/APIs
- ✅ Matches tab structure (separate tabs in UI)
- ✅ Future expansion: Each could add section-specific components

**Why NOT a shared "work" parent?**
- They don't share code (just both use UnifiedWorkSection)
- UnifiedWorkSection lives in @/ecosystem/internal/tasks (shared elsewhere)
- Light and deep work are fundamentally different (per your docs)

---

## 🚀 MIGRATION PLAN

### **Phase 1: Light Work Section** (5 min)

#### Step 1: Create Folder
```bash
mkdir -p src/ecosystem/internal/lifelock/views/daily/light-work
```

#### Step 2: Copy File (No Modifications)
```bash
cp src/ecosystem/internal/lifelock/sections/LightFocusWorkSection.tsx \
   src/ecosystem/internal/lifelock/views/daily/light-work/LightFocusWorkSection.tsx
```

#### Step 3: Verify Imports
```bash
# Check all imports are absolute (they are!)
grep "^import" views/daily/light-work/LightFocusWorkSection.tsx
```

**Expected Result**: All imports use `@/` - no fixes needed ✅

#### Step 4: Update Import in admin-lifelock-tabs.ts
```typescript
// Line 11 - Change from:
import { LightFocusWorkSection } from './sections/LightFocusWorkSection';

// To:
import { LightFocusWorkSection } from './views/daily/light-work/LightFocusWorkSection';
```

#### Step 5: Test
- Navigate to light-work tab
- Verify tasks load
- Test task creation
- Test task completion

#### Step 6: Archive Old File
```bash
git mv src/ecosystem/internal/lifelock/sections/LightFocusWorkSection.tsx \
       archive/old-sections-2025-10-12/LightFocusWorkSection.tsx
```

#### Step 7: Commit
```bash
git commit -m "🚀 Migrate LightFocusWorkSection to domain structure"
```

---

### **Phase 2: Deep Work Section** (5 min)

**EXACT SAME STEPS** as light work, just replace "light-work" with "deep-work"

#### Steps:
1. Create `views/daily/deep-work/` folder
2. Copy `DeepFocusWorkSection.tsx`
3. Verify imports (all absolute)
4. Update import in `admin-lifelock-tabs.ts` (Line ~12)
5. Test deep-work tab
6. Archive old file
7. Commit

---

## ✅ NO COMPONENT EXTRACTION NEEDED

**Why?**
- Both files are tiny (109-118 lines)
- Both are simple wrappers (just prop mapping)
- No complex UI to extract
- No sub-components needed

**Comparison to Morning Routine**:
```
Morning Routine: 789 lines → NEEDED extraction (5 components)
Light Work:      118 lines → NO extraction needed (simple wrapper)
Deep Work:       109 lines → NO extraction needed (simple wrapper)
```

---

## 🔍 IMPORT VERIFICATION

### Light Work Imports:
```typescript
✅ import React from 'react';
✅ import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';
✅ import { useLightWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase';
```

All absolute ✅ - No fixes needed!

### Deep Work Imports:
```typescript
✅ import React from 'react';
✅ import { UnifiedWorkSection } from '@/ecosystem/internal/tasks/components/UnifiedWorkSection';
✅ import { useDeepWorkTasksSupabase } from '@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase';
```

All absolute ✅ - No fixes needed!

---

## 📁 FINAL STRUCTURE PREVIEW

```
views/daily/
├── morning-routine/        ✅ COMPLETE
│   ├── MorningRoutineSection.tsx
│   ├── components/ (6 files)
│   ├── hooks/
│   ├── types.ts
│   ├── config.ts
│   └── utils.ts
│
├── light-work/             🔨 TO MIGRATE (Phase 1)
│   └── LightFocusWorkSection.tsx (118 lines - single file)
│
└── deep-work/              🔨 TO MIGRATE (Phase 2)
    └── DeepFocusWorkSection.tsx (109 lines - single file)
```

**Notice**: No components/, hooks/, types.ts for work sections - they don't need them!

**Keep it simple** - not every section needs the full folder structure.

---

## ⏱️ ESTIMATED TIME

| Phase | Task | Time | Risk |
|-------|------|------|------|
| 1 | Light Work | 5 min | Very Low |
| 2 | Deep Work | 5 min | Very Low |
| **Total** | **Both Sections** | **10 min** | **Very Low** |

---

## 🎯 KEY DIFFERENCES FROM MORNING ROUTINE

### Morning Routine Was:
- ❌ 789 lines (huge)
- ❌ Had relative imports (broke when moved)
- ❌ Needed extraction (5 components)
- ❌ Complex trackers (water, push-ups, meditation)
- ⏱️ Took 2+ hours

### Light/Deep Work Are:
- ✅ ~110 lines each (tiny)
- ✅ All absolute imports (won't break)
- ✅ No extraction needed (simple wrappers)
- ✅ Just prop mapping to UnifiedWorkSection
- ⏱️ Will take 10 minutes total

**This migration is MUCH simpler!**

---

## 🚨 POTENTIAL ISSUES (None Expected)

### Checked:
✅ All imports absolute (won't break when moved)
✅ No relative imports to fix
✅ No complex components to extract
✅ No type files to migrate
✅ No config files to migrate
✅ No utils to migrate

### Risk Assessment:
- **Import breakage**: None (all absolute)
- **Component breakage**: None (simple wrappers)
- **Testing issues**: Low (just prop pass-through)

**Risk Level**: Very Low 🟢

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting:
- [x] Morning routine working
- [x] Import patterns understood
- [x] Folder structure decided
- [x] Migration steps documented
- [x] Safety nets in place (git branch, backups)

**Ready to execute!**

---

## 🚀 EXECUTION PLAN

### Step-by-Step:

1. Create both folders (1 min)
2. Copy both files (1 min)
3. Verify all imports (1 min)
4. Update 2 import lines in admin-lifelock-tabs.ts (1 min)
5. Test light-work tab (2 min)
6. Test deep-work tab (2 min)
7. Archive old files (1 min)
8. Commit (1 min)

**Total: 10 minutes**

---

## ✅ READY TO EXECUTE

**Folder structure decided**: Separate folders for light-work and deep-work
**No extraction needed**: Files are simple wrappers
**No import fixes needed**: All already absolute
**Low risk**: Simple copy-paste-update migration

**Proceed?** 🚀
