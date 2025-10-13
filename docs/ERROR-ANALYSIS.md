# SISO Internal - Error Analysis & Issues Log

**Date Created**: 2025-10-13
**Purpose**: Document all console errors and warnings for systematic debugging

---

## 🔴 CRITICAL ERRORS

### 1. Daily Health UUID Sync Failure (HIGHEST PRIORITY)

**Error Message**:
```
❌ Sync upsert failed for daily_health: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "a95135f0-1970-474a-850c-d280fc6ca217-2025-10-12"'
}
```

**Details**:
- **Frequency**: Repeating every sync cycle (5 failed actions continuously)
- **Location**: `offlineManager.ts:388` → `syncAction()` → `syncPendingActions()`
- **Affected Component**: Offline sync system
- **Root Cause**: ID format is wrong - concatenating `user_id + "-" + date` instead of proper UUID
- **Impact**: Data not syncing to Supabase, offline changes stuck in queue

**Files Involved**:
- `src/shared/services/offlineManager.ts` (line 388) ✅ CURRENT LOCATION
- `main.tsx` (line 53 - error logging)
- Supabase table: `daily_health`

**Fix Strategy**:
1. Check how IDs are generated for `daily_health` table
2. Either use proper UUID generation OR change table schema to allow composite keys
3. Clear pending sync queue after fix: `offlineManager.clearPendingActions()`

---

### 2. Daily Reflections 406 Not Acceptable

**Error Message**:
```
GET https://avdgyrepwrvsvwgxrccr.supabase.co/rest/v1/daily_reflections?select=*&user_id=eq.a95135f0-1970-474a-850c-d280fc6ca217&date=eq.2025-10-13 406 (Not Acceptable)
```

**Details**:
- **Frequency**: On every page load when trying to fetch reflection
- **Location**: `useDailyReflections.ts:59` → `getDailyReflection()`
- **Affected Component**: Daily reflections section
- **Root Cause**: Either RLS policy issue or missing Accept header
- **Impact**: Users cannot load/view daily reflections

**Files Involved**:
- `src/shared/hooks/useDailyReflections.ts` (line 59, 81) ✅ CURRENT LOCATION
- `src/shared/services/unified-data.service.ts` (line 57) ✅ CURRENT LOCATION
- `src/shared/offline/offlineDb.ts` (line 493) ✅ CURRENT LOCATION

**Cascade Effect**:
- Logs: `📝 No reflection found for 2025-10-13, will create on save`
- But might actually exist - just can't fetch it

---

### 3. Daily Health Nutrition Data 406 Error

**Error Message**:
```
GET https://avdgyrepwrvsvwgxrccr.supabase.co/rest/v1/daily_health?select=meals%2Cmacros&user_id=eq.a95135f0-1970-474a-850c-d280fc6ca217&date=eq.2025-10-13 406 (Not Acceptable)
```

**Details**:
- **Frequency**: Every time nutrition section loads
- **Location**: `HealthNonNegotiablesSection.tsx`
- **Affected Component**: Health & Nutrition tracking
- **Root Cause**: Similar to #2 - RLS or Accept header issue
- **Impact**: Cannot load meals/macros data

**Files Involved**:
- `src/ecosystem/internal/lifelock/views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx` ✅ CURRENT LOCATION

---

## ⚠️ WARNINGS & PERFORMANCE ISSUES

### 4. Multiple GoTrueClient Instances

**Warning Message**:
```
Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
```

**Details**:
- **Frequency**: Once per session
- **Location**: Multiple Supabase client initializations
- **Impact**: Potential auth state conflicts

**Files Involved**:
- `src/integrations/supabase/client.ts` (line 24) ✅ CURRENT LOCATION
- `src/shared/lib/supabase.ts` (line 24-30) ✅ CURRENT LOCATION (consolidated)

**Fix Strategy**: Consolidate to single Supabase client instance

---

### 5. Excessive Re-renders: HealthNonNegotiablesSection

**Log Pattern**:
```
🔄 [NUTRITION] Meals changed, saving... {breakfast: '', lunch: '', dinner: '', snacks: ''}
```

**Details**:
- **Frequency**: 20+ identical logs in rapid succession
- **Location**: `src/ecosystem/internal/lifelock/views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx:69` ✅ CURRENT
- **Root Cause**: useEffect dependency causing infinite loop
- **Impact**: Performance degradation, unnecessary API calls

**Fix Strategy**: Review useEffect dependencies and debounce save operations

---

### 6. Excessive Re-renders: CustomCalendar Theme Logs

**Log Pattern**:
```
🎨 CustomCalendar received theme: DEEP
🎨 Is Light Theme: false
```

**Details**:
- **Frequency**: 26+ renders when switching between Work/Life tabs
- **Location**: `src/ecosystem/internal/calendar/ui/CustomCalendar.tsx:74-75` ✅ CURRENT
- **Root Cause**: Parent component re-rendering on every state change
- **Impact**: Performance issue, unnecessary renders

**Fix Strategy**: Memoize theme props, optimize parent component

---

### 7. Excessive Re-renders: TimeboxSection

**Log Pattern**:
```
🔍 [TIMEBOX] RENDER with internalUserId: null isSignedIn: true date: 2025-10-13
🔍 [TIMEBOX] internalUserId: null selectedDate: 2025-10-13
🔍 [TIMEBOX] isLoading: false timeBlocks: 0 error: null
```

**Details**:
- **Frequency**: Multiple renders during auth state resolution
- **Location**: `src/ecosystem/internal/lifelock/views/daily/timebox/TimeboxSection.tsx:121, 137, 162` ✅ CURRENT
- **Root Cause**: Auth state resolving asynchronously, causing multiple re-renders
- **Impact**: Minor performance issue

---

## 📊 ERROR STATISTICS

**Total Critical Errors**: 3
**Total Warnings**: 4
**Most Frequent Error**: Daily Health UUID sync (5 failures per sync cycle)
**Most Affected Components**:
1. HealthNonNegotiablesSection.tsx (2 issues)
2. Offline sync system (1 critical)
3. Daily reflections (1 critical)

---

## 🔍 AFFECTED USER WORKFLOWS

1. **Daily Health Tracking**: ❌ BROKEN
   - Cannot save daily health data
   - Cannot view nutrition/meals

2. **Daily Reflections**: ❌ BROKEN
   - Cannot load existing reflections
   - May duplicate reflections on save

3. **Offline Sync**: ❌ BROKEN
   - 5 pending actions stuck in queue
   - No data syncing to server

4. **General Performance**: ⚠️ DEGRADED
   - Excessive re-renders in multiple components
   - Multiple auth client instances

---

## 🎯 RECOMMENDED FIX PRIORITY

### Phase 1: Critical Data Issues
1. **Fix daily_health UUID format** (blocking offline sync)
2. **Fix 406 errors** (RLS policies or Accept headers)

### Phase 2: Performance & Optimization
3. **Debounce nutrition save operations**
4. **Optimize calendar re-renders**
5. **Consolidate Supabase client instances**

### Phase 3: Cleanup
6. **Remove debug logs in production**
7. **Optimize TimeboxSection re-renders**

---

## 📝 NOTES

- All errors are repeating continuously due to periodic sync attempts
- User is logged in as: `fuzeheritage@gmail.com` (Clerk ID: `user_31c4PuaPdFf9abejhmzrN9kcill`)
- Internal user ID: `a95135f0-1970-474a-850c-d280fc6ca217`
- PWA is running normally despite errors
- Service Worker is functioning (workbox logs normal)
- All errors appear to be backend/database related, not frontend logic issues

---

## 🧪 DEBUGGING COMMANDS

```javascript
// Clear pending sync queue (in browser console)
window.offlineManager.clearPendingActions()

// Check pending actions
window.offlineManager.getPendingActions()

// Test voice service
window.voiceService.debugMicrophoneAccess()
```

---

**Last Updated**: 2025-10-13
**Status**: READY TO FIX - See `EASY-FIXES-GUIDE.md` for solutions

---

## 🔗 RELATED DOCUMENTS

- **[EASY-FIXES-GUIDE.md](./EASY-FIXES-GUIDE.md)** - Step-by-step fix instructions with code examples
- Priority-ordered fixes with risk assessment
- Estimated time: 10 minutes for Phase 1 quick wins, 90 minutes for complete fix
