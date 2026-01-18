# 🧪 LifeLock Component Testing Checklist

**Date**: October 4, 2025
**Phase**: 2.9 - LifeLock Components Consolidation
**Dev Server**: http://localhost:5175

---

## ✅ Pre-Testing Verification

- [x] Build passes (11.23s, 0 errors)
- [x] TypeScript compiles (0 errors)
- [x] Dev server running on port 5175
- [x] All 10 files converted to redirects
- [x] Git commit successful

---

## 🎯 Critical Path Testing (MUST TEST)

### 1. LifeLock Day Page Navigation ⭐ CRITICAL
**Route**: `/admin/lifelock/day/:date`
**File**: `src/ecosystem/internal/lifelock/AdminLifeLockDay.tsx`

**Test Steps**:
1. Navigate to: `http://localhost:5175/admin/lifelock/day/2025-10-04`
2. Verify page loads without errors
3. Check browser console for import errors
4. Verify all sections render:
   - Morning Routine Section
   - Deep Focus Work Section
   - Light Focus Work Section
   - Nightly Checkout Section
   - Home Workout Section
   - Health Non-Negotiables Section
   - Timebox Section

**Expected Result**: All sections load, no console errors, no "Component not found" messages

**Failure Indicators**:
- Blank screen
- "Cannot read property" errors
- Missing sections
- Redirect loop

---

### 2. LifeLock Main Page ⭐ CRITICAL
**Route**: `/admin/lifelock`
**File**: `src/ecosystem/internal/lifelock/AdminLifeLock.tsx`

**Test Steps**:
1. Navigate to: `http://localhost:5175/admin/lifelock`
2. Verify weekly view loads
3. Check mobile responsive layout
4. Test date navigation (previous/next week)

**Expected Result**: Page loads, weekly calendar visible, navigation works

---

### 3. Section Component Functionality

#### a) Morning Routine Section
**Test**:
- [ ] Section renders with morning tasks
- [ ] Can add new morning routine item
- [ ] Task checkboxes work
- [ ] Voice command button appears

**Expected Result**: All morning routine functionality intact

---

#### b) Deep Focus Work Section
**Test**:
- [ ] Focus timer appears
- [ ] Can start/stop focus session
- [ ] Current task list displays
- [ ] Time blocks render correctly

**Expected Result**: Focus session controls work

---

#### c) Light Focus Work Section
**Test**:
- [ ] Light work tasks display
- [ ] Can toggle task completion
- [ ] Task list updates in real-time

**Expected Result**: Light focus tasks functional

---

#### d) Nightly Checkout Section
**Test**:
- [ ] Reflection prompts appear
- [ ] Can add journal entries
- [ ] Day summary displays
- [ ] Wins and learnings save

**Expected Result**: Evening reflection works

---

#### e) Home Workout Section
**Test**:
- [ ] Workout tracker displays
- [ ] Can log exercises
- [ ] Rep counter works
- [ ] Workout history shows

**Expected Result**: Workout tracking functional

---

#### f) Health Non-Negotiables Section
**Test**:
- [ ] Health checklist appears
- [ ] Can mark items complete
- [ ] Streak counter works (if applicable)
- [ ] Daily goals update

**Expected Result**: Health tracking works

---

#### g) Timebox Section
**Test**:
- [ ] Time blocks display
- [ ] Can create new timebox
- [ ] Drag-and-drop works (if enabled)
- [ ] Calendar integration works

**Expected Result**: Timeboxing functional

---

## 🔄 Import/Export Testing

### 4. Verify Redirects Work
**Test**: Check that old import paths still resolve

```typescript
// These should all work (redirects):
import { AdminLifeLockDay } from '@/ecosystem/internal/admin/dashboard/pages/AdminLifeLockDay';
import { AdminLifeLockDay } from '@/features/admin/dashboard/pages/AdminLifeLockDay';
import { AdminLifeLockDay } from '@/features/lifelock/AdminLifeLockDay';

// This should work (canonical):
import { AdminLifeLockDay } from '@/ecosystem/internal/lifelock/AdminLifeLockDay';
```

**How to Test**:
1. Check browser Network tab for 404s
2. Look for "Module not found" errors
3. Verify no duplicate bundle loading

**Expected Result**: All imports resolve, no 404s, single module loaded

---

## 🎨 Visual/UI Testing

### 5. Mobile Responsiveness
**Devices to Test**:
- [ ] iPhone (375px width)
- [ ] iPad (768px width)
- [ ] Desktop (1440px width)

**Test Steps**:
1. Open DevTools, toggle device toolbar
2. Cycle through all LifeLock sections
3. Check for layout breaks, overflows, hidden content

**Expected Result**: All sections responsive, no horizontal scroll

---

### 6. Dark Mode (if applicable)
**Test**:
- [ ] Toggle dark mode
- [ ] All sections maintain readability
- [ ] No invisible text
- [ ] Icons/colors adapt

**Expected Result**: Consistent appearance in both modes

---

## 🔗 Integration Testing

### 7. Tab Navigation (TabLayoutWrapper)
**File**: `src/ecosystem/internal/lifelock/TabLayoutWrapper.tsx`

**Test**:
- [ ] Can switch between tabs
- [ ] Tab state persists on page reload
- [ ] Active tab highlighted
- [ ] URL updates when switching tabs

**Expected Result**: Smooth tab navigation

---

### 8. Data Fetching (useLifeLockData hook)
**Test**:
- [ ] Loading state shows
- [ ] Data populates sections
- [ ] Error handling works
- [ ] Refetch/refresh works

**How to Test**:
1. Open Network tab
2. Navigate to LifeLock page
3. Check API calls
4. Verify data flows to UI

**Expected Result**: Data loads correctly, no infinite loops

---

## ⚡ Performance Testing

### 9. Bundle Size Verification
**Test**:
```bash
npm run build
```

**Check**:
- [ ] lifelock-*.js bundle size reasonable (<200kb gzipped)
- [ ] No duplicate LifeLock code in multiple chunks
- [ ] Tree-shaking eliminated unused exports

**Expected Result**: Single LifeLock bundle, no duplicates

---

### 10. Initial Load Performance
**Test**:
1. Open DevTools Performance tab
2. Record page load
3. Check:
   - [ ] Time to Interactive < 3s
   - [ ] No layout shifts (CLS < 0.1)
   - [ ] No render blocking

**Expected Result**: Fast initial load

---

## 🐛 Error Boundary Testing

### 11. Error Handling
**Test**:
1. Simulate network failure (DevTools offline mode)
2. Check error boundaries catch failures
3. Verify user sees error message, not blank screen

**Expected Result**: Graceful error handling

---

## 🔍 Console Debugging

### 12. Browser Console Check
**Open**: Chrome DevTools Console

**Look For**:
- [ ] No TypeScript errors
- [ ] No "Component not found" warnings
- [ ] No circular dependency warnings
- [ ] No prop type mismatches

**Expected Result**: Clean console

---

## 📊 Regression Testing

### 13. Existing Functionality Still Works
**Test**:
- [ ] Admin Dashboard loads
- [ ] Admin Tasks page works
- [ ] Other admin routes unaffected
- [ ] Non-LifeLock features unchanged

**Expected Result**: No regressions

---

## 🎯 Quick Smoke Test (5 minutes)

**For Rapid Verification**:
1. ✅ Navigate to `/admin/lifelock/day/2025-10-04`
2. ✅ Check all 7 sections render
3. ✅ Open console, verify no errors
4. ✅ Toggle one task in each section
5. ✅ Navigate to previous/next day
6. ✅ Check mobile view (375px)

**If all pass**: Consolidation successful ✅
**If any fail**: Investigate immediately 🔴

---

## 🚨 Known Issues / Acceptable Failures

- ESLint warnings (535 pre-existing, not from consolidation)
- Pre-commit hooks disabled (temporary, for rapid iteration)

---

## ✅ Sign-Off

**Tested By**: _________________
**Date**: _________________
**Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Fixes

**Notes**:
```
[Add testing notes here]
```

---

## 🔧 Troubleshooting Guide

### If sections don't render:
1. Check: `src/ecosystem/internal/lifelock/AdminLifeLockDay.tsx` imports
2. Verify: Redirects export correctly
3. Test: Direct canonical import works

### If imports fail:
1. Check: `tsconfig.json` paths configuration
2. Verify: Vite build completed
3. Clear: Browser cache and reload

### If data doesn't load:
1. Check: Network tab for API calls
2. Verify: `useLifeLockData` hook working
3. Test: Supabase connection

---

**Last Updated**: October 4, 2025
**Phase**: 2.9 Complete
**Next**: Update Component Registry with results
