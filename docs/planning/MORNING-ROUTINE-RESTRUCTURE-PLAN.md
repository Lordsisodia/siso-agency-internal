# 🏗️ Morning Routine Domain Restructure - SAFETY-FIRST PLAN
**Date**: 2025-10-12
**Branch**: feature/morning-routine-domain-structure
**Backup**: backups/before-morning-routine-restructure-2025-10-12/

---

## 🛡️ SAFETY NETS IN PLACE

✅ **GitHub**: Pushed to remote (emergency-directory-restructure branch)
✅ **AI Snapshot**: scripts/ai-session-snapshot.sh executed
✅ **Local Backup**: backups/before-morning-routine-restructure-2025-10-12/ (448KB)
✅ **Git Branch**: feature/morning-routine-domain-structure (can abandon easily)
✅ **Rollback Script**: scripts/rollback-morning-routine-restructure.sh (to be created)

**Rollback is 1 command away at ANY point**

---

## 🎯 GOAL

Transform this:
```
lifelock/
└── sections/MorningRoutineSection.tsx (789 lines)
```

Into this:
```
lifelock/
└── views/
    └── daily/
        └── morning-routine/
            ├── MorningRoutineSection.tsx (200 lines - orchestrator)
            ├── components/
            │   ├── WakeUpTimeTracker.tsx
            │   ├── WaterTracker.tsx
            │   ├── PushUpTracker.tsx
            │   ├── MeditationTracker.tsx
            │   └── PlanDayActions.tsx
            ├── hooks/
            │   └── useMorningRoutineProgress.ts
            ├── types.ts
            ├── config.ts
            └── utils.ts
```

**Without breaking anything**

---

## 🔒 SAFETY PRINCIPLES

### 1. Copy, Don't Move (Phase by Phase)
- Never delete working code until new code works
- Keep both versions running simultaneously
- Switch imports only after testing

### 2. Test After Every Single Change
- Run `npm run dev` after each step
- Check morning routine page loads
- Verify all features work
- If broken, rollback that step only

### 3. Commit Every 30 Minutes
- Small commits = easy to revert specific changes
- Clear commit messages
- Never batch 10+ changes

### 4. Feature Flag Pattern
- Use `useImplementation()` to toggle between old and new
- Can switch back instantly if issues found

### 5. One Component at a Time
- Extract WaterTracker → test → commit
- Extract PushUpTracker → test → commit
- NEVER extract 5 components at once

---

## 📋 STEP-BY-STEP EXECUTION PLAN

### PHASE 0: Setup (5 min)
**Status**: ✅ COMPLETE
- [x] Run AI snapshot
- [x] Create local backup
- [x] Create git branch
- [x] Document plan

---

### PHASE 1: Create Empty Structure (2 min)
**Risk**: Zero (just creating folders)
**Rollback**: Delete folders

**Actions**:
```bash
# Create new structure (empty)
mkdir -p src/ecosystem/internal/lifelock/views/daily/morning-routine/{components,hooks}

# Verify structure created
ls -R src/ecosystem/internal/lifelock/views/
```

**Test**: No testing needed (no code changes)

**Commit**: "🏗️ Create views/daily/morning-routine folder structure"

---

### PHASE 2: Copy Files (No Changes) (3 min)
**Risk**: Zero (copies, not moves)
**Rollback**: Delete copies

**Actions**:
```bash
# Copy existing files to new location (NO modifications yet)
cp src/ecosystem/internal/lifelock/sections/MorningRoutineSection.tsx \
   src/ecosystem/internal/lifelock/views/daily/morning-routine/MorningRoutineSection.tsx

cp src/ecosystem/internal/lifelock/types/morning-routine.types.ts \
   src/ecosystem/internal/lifelock/views/daily/morning-routine/types.ts

cp src/ecosystem/internal/lifelock/utils/morning-routine-progress.ts \
   src/ecosystem/internal/lifelock/views/daily/morning-routine/utils.ts

cp src/ecosystem/internal/lifelock/morning-routine-defaults.ts \
   src/ecosystem/internal/lifelock/views/daily/morning-routine/config.ts
```

**Test**: `npm run dev` (old code still works)

**Commit**: "📦 Copy morning routine files to new structure (no changes)"

---

### PHASE 3: Extract WaterTracker Component (30 min)
**Risk**: Low (original still exists)
**Rollback**: Delete WaterTracker.tsx, revert import

**Actions**:
1. Create `views/daily/morning-routine/components/WaterTracker.tsx`
2. Extract water tracking logic from MorningRoutineSection
3. Update MorningRoutineSection to import WaterTracker
4. Test thoroughly

**Test Checklist**:
- [ ] Morning routine page loads
- [ ] Water tracker displays correctly
- [ ] +100ml button works
- [ ] -100ml button works
- [ ] Value persists in localStorage
- [ ] Progress bar updates when water task completed

**Commit**: "♻️ Extract WaterTracker component (789 → 730 lines)"

**If broken**:
```bash
git revert HEAD
```

---

### PHASE 4: Extract PushUpTracker Component (30 min)
**Risk**: Low (original still exists)
**Rollback**: Delete PushUpTracker.tsx, revert import

**Actions**:
1. Create `views/daily/morning-routine/components/PushUpTracker.tsx`
2. Extract push-up logic from MorningRoutineSection
3. Update import
4. Test thoroughly

**Test Checklist**:
- [ ] Push-up tracker displays
- [ ] +1 and +5 buttons work
- [ ] -1 button works
- [ ] PB updates automatically
- [ ] Celebration shows on new PB
- [ ] Value persists in localStorage

**Commit**: "♻️ Extract PushUpTracker component (730 → 670 lines)"

---

### PHASE 5: Extract MeditationTracker Component (30 min)
**Risk**: Low
**Rollback**: Revert commit

**Actions**:
1. Create `components/MeditationTracker.tsx`
2. Extract meditation logic
3. Update import
4. Test

**Test Checklist**:
- [ ] Meditation tracker displays
- [ ] +1/+5 buttons work
- [ ] -1 button works
- [ ] Value persists
- [ ] Progress updates

**Commit**: "♻️ Extract MeditationTracker component (670 → 610 lines)"

---

### PHASE 6: Extract WakeUpTimeTracker Component (30 min)
**Risk**: Low

**Actions**:
1. Create `components/WakeUpTimeTracker.tsx`
2. Extract wake-up time logic
3. Include TimeScrollPicker integration
4. Test

**Test Checklist**:
- [ ] Wake-up tracker displays
- [ ] TimeScrollPicker opens
- [ ] "Use Now" button works
- [ ] Time persists
- [ ] Progress updates

**Commit**: "♻️ Extract WakeUpTimeTracker component (610 → 530 lines)"

---

### PHASE 7: Extract PlanDayActions Component (20 min)
**Risk**: Low

**Actions**:
1. Create `components/PlanDayActions.tsx`
2. Extract Plan Day UI
3. Test

**Test Checklist**:
- [ ] AI Thought Dump button works
- [ ] Opens thought dump chat
- [ ] Mark complete button works
- [ ] Progress updates

**Commit**: "♻️ Extract PlanDayActions component (530 → 490 lines)"

---

### PHASE 8: Extract MotivationalQuotes Component (20 min)
**Risk**: Very low

**Actions**:
1. Create `components/MotivationalQuotes.tsx`
2. Extract quotes display
3. Test

**Commit**: "♻️ Extract MotivationalQuotes component (490 → 450 lines)"

---

### PHASE 9: Extract Progress Hook (20 min)
**Risk**: Low

**Actions**:
1. Create `hooks/useMorningRoutineProgress.ts`
2. Extract progress calculation logic
3. Test all progress bars update correctly

**Commit**: "♻️ Extract useMorningRoutineProgress hook"

---

### PHASE 10: Update Imports in Consuming Files (10 min)
**Risk**: Medium (breaks if import path wrong)
**Rollback**: Revert commit

**Actions**:
Update `admin-lifelock-tabs.ts`:
```typescript
// Before
import { MorningRoutineSection } from './sections/MorningRoutineSection';

// After
import { MorningRoutineSection } from './views/daily/morning-routine/MorningRoutineSection';
```

**Test**: Full app navigation test

**Commit**: "🔧 Update MorningRoutineSection import path"

---

### PHASE 11: Archive Old Files (5 min)
**Risk**: Zero (copies already work)

**Actions**:
```bash
git mv src/ecosystem/internal/lifelock/sections/MorningRoutineSection.tsx \
       archive/old-sections-2025-10-12/MorningRoutineSection.tsx.old
```

**Commit**: "🗄️ Archive old MorningRoutineSection (new version working)"

---

### PHASE 12: Final Verification (10 min)

**Full Test Suite**:
- [ ] Navigate to /admin/life-lock/daily/[today]
- [ ] Morning routine tab loads
- [ ] All 6 tasks display
- [ ] Progress bar updates correctly
- [ ] Wake-up time tracker works
- [ ] Water tracker +/- works
- [ ] Push-up tracker +/-/PB works
- [ ] Meditation tracker +/- works
- [ ] Plan Day AI button works
- [ ] All data persists to localStorage
- [ ] Page navigation works
- [ ] No console errors
- [ ] TypeScript compiles

**Commit**: "✅ Morning routine domain restructure complete - all tests pass"

---

## 🔄 ROLLBACK PROCEDURES

### Immediate Rollback (If Broken During Work)
```bash
# Rollback last commit
git reset --hard HEAD~1

# Or abandon entire branch
git checkout emergency-directory-restructure
git branch -D feature/morning-routine-domain-structure
```

### Full Restore from Backup
```bash
# If git history corrupted somehow
rm -rf src/ecosystem/internal/lifelock
cp -r backups/before-morning-routine-restructure-2025-10-12/lifelock-complete/ \
      src/ecosystem/internal/lifelock/
```

### Partial Rollback (Specific Component)
```bash
# If WaterTracker.tsx broken but rest OK
git checkout HEAD~1 -- src/ecosystem/internal/lifelock/views/daily/morning-routine/components/WaterTracker.tsx
```

---

## ⚠️ RISK ASSESSMENT PER PHASE

| Phase | Risk | Can Break | Rollback Time |
|-------|------|-----------|---------------|
| 1 | None | Nothing | N/A |
| 2 | None | Nothing | Delete copies |
| 3 | Low | Water tracker only | 10 sec (git revert) |
| 4 | Low | Push-up tracker only | 10 sec |
| 5 | Low | Meditation only | 10 sec |
| 6 | Low | Wake-up only | 10 sec |
| 7 | Low | Plan Day only | 10 sec |
| 8 | Very Low | Quotes only | 10 sec |
| 9 | Low | Progress calc | 10 sec |
| 10 | Medium | Entire page | 10 sec |
| 11 | None | Nothing (old archived) | N/A |

**Maximum risk**: Phase 10 (import update)
**Mitigation**: Test before commit, keep old file until verified

---

## 🧪 TESTING PROTOCOL (After Each Phase)

### Quick Test (30 seconds)
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to morning routine
open http://localhost:5173/admin/life-lock/daily/2025-10-12

# 3. Visual check
# - Page loads? ✓
# - No errors in console? ✓
# - Component renders? ✓
```

### Full Test (2 minutes)
- [ ] Click all 6 main tasks
- [ ] Check all subtasks
- [ ] Test wake-up time picker
- [ ] Test water +/- buttons
- [ ] Test push-up +/-/PB
- [ ] Test meditation +/-
- [ ] Test Plan Day button
- [ ] Verify progress bar updates
- [ ] Check localStorage (DevTools → Application)
- [ ] Navigate away and back (state persists?)

### TypeScript Test
```bash
npm run typecheck
```

---

## 💾 CHECKPOINT COMMIT STRATEGY

Every phase gets a commit:
- ✅ Atomic changes (one thing per commit)
- ✅ Clear messages
- ✅ Easy to revert
- ✅ Easy to cherry-pick

**Commit Message Format**:
```
[PHASE X] Action - component name

Example:
[PHASE 3] ♻️ Extract WaterTracker component (789 → 730 lines)
[PHASE 10] 🔧 Update import paths to new structure
```

---

## 🚨 ABORT CONDITIONS

**STOP IMMEDIATELY if**:
1. Page doesn't load
2. Console shows errors
3. Any feature stops working
4. TypeScript compilation fails
5. Tests fail

**Then**:
```bash
git reset --hard HEAD  # Abandon current work
# Or
git revert HEAD        # Undo last commit
```

---

## 📊 PROGRESS TRACKING

Track completion after each phase:

```
[✅] Phase 0: Setup
[  ] Phase 1: Create structure
[  ] Phase 2: Copy files
[  ] Phase 3: Extract WaterTracker
[  ] Phase 4: Extract PushUpTracker
[  ] Phase 5: Extract MeditationTracker
[  ] Phase 6: Extract WakeUpTimeTracker
[  ] Phase 7: Extract PlanDayActions
[  ] Phase 8: Extract MotivationalQuotes
[  ] Phase 9: Extract Progress Hook
[  ] Phase 10: Update imports
[  ] Phase 11: Archive old files
[  ] Phase 12: Final verification
```

**Estimated Time**: 3-4 hours (with testing)
**Recommended**: Do in 2 sessions (break after Phase 6)

---

## 🎯 COMPONENT EXTRACTION DETAILS

### WaterTracker.tsx Specification

**Props Interface**:
```typescript
interface WaterTrackerProps {
  value: number;
  onChange: (amount: number) => void;
  selectedDate: Date;
}
```

**Extracted Code** (from lines ~655-690):
- Water amount state management
- Increment/decrement functions
- Button UI (+100ml, -100ml)
- Visual display
- localStorage integration

**Parent Integration**:
```typescript
// In MorningRoutineSection.tsx
import { WaterTracker } from './components/WaterTracker';

{subtask.key === 'water' && (
  <WaterTracker
    value={waterAmount}
    onChange={setWaterAmount}
    selectedDate={selectedDate}
  />
)}
```

**Test Criteria**:
- Renders correctly
- Buttons responsive
- localStorage saves
- Value persists on page reload
- Progress bar reflects state

---

### PushUpTracker.tsx Specification

**Props Interface**:
```typescript
interface PushUpTrackerProps {
  reps: number;
  personalBest: number;
  onRepsChange: (reps: number) => void;
  onPBChange: (pb: number) => void;
  selectedDate: Date;
}
```

**Extracted Code** (from lines ~684-740):
- Rep tracking state
- PB state and auto-update logic
- +1, +5, -1 buttons
- New PB celebration
- localStorage integration

**Parent Integration**:
```typescript
import { PushUpTracker } from './components/PushUpTracker';

{subtask.key === 'pushups' && (
  <PushUpTracker
    reps={pushupReps}
    personalBest={pushupPB}
    onRepsChange={updatePushupReps}
    onPBChange={setPushupPB}
    selectedDate={selectedDate}
  />
)}
```

---

### MeditationTracker.tsx Specification

**Props Interface**:
```typescript
interface MeditationTrackerProps {
  duration: string;
  onChange: (duration: string) => void;
  selectedDate: Date;
}
```

**Extracted Code** (from lines ~610-663):
- Duration state
- -1, +1, +5 minute buttons
- Display UI
- localStorage integration

---

### WakeUpTimeTracker.tsx Specification

**Props Interface**:
```typescript
interface WakeUpTimeTrackerProps {
  time: string;
  onChange: (time: string) => void;
  selectedDate: Date;
  showPicker: boolean;
  onTogglePicker: () => void;
}
```

**Extracted Code** (from lines ~497-608):
- Time display
- Edit button
- TimeScrollPicker integration
- "Use Now" button
- getCurrentTime() utility

---

### PlanDayActions.tsx Specification

**Props Interface**:
```typescript
interface PlanDayActionsProps {
  isComplete: boolean;
  onMarkComplete: () => void;
  onOpenThoughtDump: () => void;
}
```

**Extracted Code** (from lines ~730-757):
- AI Thought Dump button
- Mark complete button
- Conditional rendering

---

## 🔧 IMPORT PATH STRATEGY

### Absolute Imports (Recommended)
```typescript
// From any file
import { WaterTracker } from '@/ecosystem/internal/lifelock/views/daily/morning-routine/components/WaterTracker';

// Or with barrel export
import { WaterTracker } from '@/ecosystem/internal/lifelock/views/daily/morning-routine';
```

### Create index.ts Barrel
```typescript
// views/daily/morning-routine/index.ts
export { MorningRoutineSection } from './MorningRoutineSection';
export * from './components';
export * from './types';
```

Then import becomes:
```typescript
import { MorningRoutineSection, WaterTracker } from '@/ecosystem/internal/lifelock/views/daily/morning-routine';
```

---

## 📝 FILES TO UPDATE (Complete List)

### Files That Import MorningRoutineSection
1. `src/ecosystem/internal/lifelock/admin-lifelock-tabs.ts` (Line 8)
   ```typescript
   // Change this import
   import { MorningRoutineSection } from './sections/MorningRoutineSection';
   // To this
   import { MorningRoutineSection } from './views/daily/morning-routine';
   ```

### Files That Import morning-routine Types
(Search for these after extraction)
```bash
grep -r "from.*morning-routine.types" src
```

---

## 🎯 SUCCESS CRITERIA

### Component Extraction Complete When:
- [ ] All 5 sub-components extracted and working
- [ ] Main file reduced to ~200 lines
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] No console errors
- [ ] All features work identically to before

### Architecture Complete When:
- [ ] Files organized in domain folder
- [ ] Imports updated
- [ ] Old files archived
- [ ] Documentation updated
- [ ] Committed and pushed

---

## 🚀 EXECUTION CHECKPOINTS

### Checkpoint 1 (After Phase 3)
- WaterTracker extracted
- Pause and verify everything works
- If good, continue
- If issues, debug before proceeding

### Checkpoint 2 (After Phase 6)
- All trackers extracted
- Take a break
- Full testing
- Commit state before continuing

### Checkpoint 3 (After Phase 10)
- Imports updated
- CRITICAL: Full app test
- If anything broken, rollback immediately

---

## 📄 POST-MIGRATION TASKS

After successful migration:

1. **Update Documentation**
   - Update CLAUDE.md with new structure
   - Update architecture docs

2. **Create Pattern Template**
   - Document folder structure
   - Create template for other sections
   - Use for weekly/monthly/yearly

3. **Merge to Master**
   ```bash
   git checkout master
   git merge feature/morning-routine-domain-structure
   ```

4. **Delete Backups** (after 1 week of stability)
   ```bash
   rm -rf backups/before-morning-routine-restructure-2025-10-12/
   ```

---

## 🛡️ SAFETY VERIFICATION

Before each phase, verify:
```bash
# 1. On correct branch?
git branch --show-current
# Should show: feature/morning-routine-domain-structure

# 2. No uncommitted changes?
git status --short
# Should be clean or only expected files

# 3. Backup exists?
ls -la backups/before-morning-routine-restructure-2025-10-12/
# Should show 448K backup

# 4. Can rollback?
git log --oneline -5
# Should see recent commits
```

---

## 📋 READY TO EXECUTE

**All safety nets in place**:
✅ GitHub backup
✅ Local backup (448KB)
✅ Git branch (easy abandon)
✅ Rollback script (will create)
✅ Phase-by-phase plan
✅ Test protocol
✅ Clear abort conditions

**Estimated Total Time**: 3-4 hours
**Risk Level**: Very Low (every step is reversible)

**Ready to start Phase 1?** 🚀
