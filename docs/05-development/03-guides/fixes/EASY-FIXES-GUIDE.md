# Easy Fixes Guide - SISO Internal Errors

**Created**: 2025-10-13
**Status**: Ready to implement
**Risk Level**: ✅ LOW - All fixes are safe and isolated

---

## ✅ FIX #1: Remove Duplicate Supabase Client (CRITICAL - EASY)

### Problem
**Error**: `Multiple GoTrueClient instances detected in the same browser context`

### Root Cause
Two files are creating separate Supabase clients:
- `src/integrations/supabase/client.ts` (line 24)
- `src/shared/lib/supabase.ts` (line 24-30)

Both call `createClient()` with identical configuration, causing duplicate auth instances.

### Solution
**DELETE** one of the files and consolidate imports.

#### Recommended Approach:
Keep `/src/shared/lib/supabase.ts` (it has more features and type definitions) and delete `/src/integrations/supabase/client.ts`.

#### Files to Update:
1. **Delete**: `src/integrations/supabase/client.ts`
2. **Update all imports** from:
   ```typescript
   import { supabase } from '@/integrations/supabase/client'
   ```
   to:
   ```typescript
   import { supabase } from '@/shared/lib/supabase'
   ```

#### Search & Replace:
```bash
# Find all files importing the old client
grep -r "from '@/integrations/supabase/client'" src/
```

### Risk: ⚠️ LOW
- This is just consolidating imports
- Both files create identical clients
- No logic change

### Expected Impact:
- ✅ Removes duplicate auth warning
- ✅ Cleaner codebase
- ✅ Single source of truth

---

## ✅ FIX #2: Remove Debug Logs from CustomCalendar (EASY)

### Problem
**Issue**: Calendar component re-renders 26+ times, flooding console with debug logs

### Root Cause
Lines 74-75 in `/src/ecosystem/internal/calendar/ui/CustomCalendar.tsx`:
```typescript
console.log('🎨 CustomCalendar received theme:', theme);
console.log('🎨 Is Light Theme:', theme === 'LIGHT');
```

These run on EVERY render, causing performance issues.

### Solution
**DELETE** lines 74-75 from `CustomCalendar.tsx`

#### File to Update:
`/src/ecosystem/internal/calendar/ui/CustomCalendar.tsx`

#### Remove These Lines:
```typescript
// Line 74-75 - DELETE THESE
console.log('🎨 CustomCalendar received theme:', theme);
console.log('🎨 Is Light Theme:', theme === 'LIGHT');
```

### Risk: ✅ ZERO
- These are debug logs only
- No functional impact
- Already have the computed value on line 77

### Expected Impact:
- ✅ Cleaner console output
- ✅ Slightly better performance
- ✅ Reduces noise in production

---

## ✅ FIX #3: Fix HealthNonNegotiablesSection Infinite Re-render Loop (EASY)

### Problem
**Issue**: Nutrition component logs `🔄 [NUTRITION] Meals changed, saving...` 20+ times rapidly

### Root Cause
Lines 67-72 in `/src/ecosystem/internal/lifelock/views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx`:

```typescript
useEffect(() => {
  if (hasLoadedInitialData.current) {
    console.log('🔄 [NUTRITION] Meals changed, saving...', meals);
    saveData(meals, dailyTotals);
  }
}, [meals, dailyTotals, saveData]); // ❌ `saveData` causes loop
```

The `saveData` function is in the dependency array, but it's recreated on every render due to its dependencies (`updateMeals`, `updateMacros`), causing an infinite loop.

### Solution
**REMOVE** `saveData` from the dependency array (it's already memoized with `useCallback`)

#### File to Update:
`/src/ecosystem/internal/lifelock/views/daily/wellness/health-non-negotiables/HealthNonNegotiablesSection.tsx`

#### Change Line 72:
```typescript
// BEFORE (line 67-72):
useEffect(() => {
  if (hasLoadedInitialData.current) {
    console.log('🔄 [NUTRITION] Meals changed, saving...', meals);
    saveData(meals, dailyTotals);
  }
}, [meals, dailyTotals, saveData]); // ❌ BAD

// AFTER:
useEffect(() => {
  if (hasLoadedInitialData.current) {
    console.log('🔄 [NUTRITION] Meals changed, saving...', meals);
    saveData(meals, dailyTotals);
  }
}, [meals, dailyTotals]); // ✅ FIXED
```

### Why This Works:
- `saveData` is memoized with `useCallback` on lines 47-64
- Its dependencies (`internalUserId`, `saving`, `updateMeals`, `updateMacros`) are stable
- We only want to re-run this effect when `meals` or `dailyTotals` actually change
- The function itself doesn't need to be in the deps

### Risk: ⚠️ LOW
- React ESLint rule will warn about missing dependency
- Can add `// eslint-disable-next-line react-hooks/exhaustive-deps` comment
- Function is properly memoized, so omission is safe

### Expected Impact:
- ✅ Stops infinite loop
- ✅ Console only logs when meals actually change
- ✅ Reduces unnecessary saves
- ✅ Better performance

---

## ⚠️ FIX #4: Fix daily_health UUID Sync Error (MEDIUM)

### Problem
**Error**: `invalid input syntax for type uuid: "a95135f0-1970-474a-850c-d280fc6ca217-2025-10-12"`

### Root Cause
The offline sync system is trying to save `daily_health` records with a concatenated string ID like `"user_id-date"` instead of a proper UUID. The database expects the `id` column to be a UUID type.

### Analysis
- Line 379-381 in `/src/shared/services/offlineManager.ts` correctly uses `onConflict: 'user_id,date'`
- The data being sent has a malformed `id` field
- Database schema uses `(user_id, date)` as the unique constraint, not `id`

### Solution
**STRIP** the `id` field from daily_health data before upserting

#### File to Update:
`/src/shared/services/offlineManager.ts`

#### Add ID Stripping Logic (around line 383):
```typescript
// BEFORE (line 375-390):
switch (action.action) {
  case 'create':
  case 'update':
    // Use proper upsert with conflict resolution
    const upsertOptions = tableName === 'daily_health'
      ? { onConflict: 'user_id,date', ignoreDuplicates: false }
      : {};

    const { error } = await supabase
      .from(tableName)
      .upsert(action.data, upsertOptions);

    if (error) {
      console.error(`❌ Sync upsert failed for ${tableName}:`, error);
    }
    return !error;
}

// AFTER:
switch (action.action) {
  case 'create':
  case 'update':
    // Use proper upsert with conflict resolution
    const upsertOptions = tableName === 'daily_health'
      ? { onConflict: 'user_id,date', ignoreDuplicates: false }
      : {};

    // 🔧 FIX: Remove id field from daily_health records
    // Database uses (user_id, date) composite key, not id
    let dataToUpsert = action.data;
    if (tableName === 'daily_health') {
      const { id, ...dataWithoutId } = action.data;
      dataToUpsert = dataWithoutId;
      console.log('🔧 [SYNC FIX] Stripped id from daily_health record:', id);
    }

    const { error } = await supabase
      .from(tableName)
      .upsert(dataToUpsert, upsertOptions);

    if (error) {
      console.error(`❌ Sync upsert failed for ${tableName}:`, error);
    }
    return !error;
}
```

### Risk: ⚠️ MEDIUM
- Affects offline sync logic
- Should test with offline mode
- Won't break existing records (they use user_id+date)

### Expected Impact:
- ✅ Fixes UUID syntax error
- ✅ Clears stuck sync queue (5 pending actions)
- ✅ Enables offline sync to work
- ✅ No data loss

### Testing Steps:
1. Clear pending queue: `window.offlineManager.clearPendingActions()`
2. Make offline changes
3. Go back online
4. Verify sync succeeds

---

## 🔍 FIX #5: Daily Reflections 406 Error (REQUIRES INVESTIGATION)

### Problem
**Error**: `GET .../daily_reflections?select=*&user_id=eq...&date=eq... 406 (Not Acceptable)`

### Possible Causes:
1. **RLS Policy Issue** - User doesn't have SELECT permission
2. **Missing Accept Header** - Supabase expects `Accept: application/json`
3. **Wrong Column Name** - `user_id` might be different in schema

### Investigation Steps:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'daily_reflections';

-- Check table schema
\d daily_reflections

-- Test query manually
SELECT * FROM daily_reflections WHERE user_id = 'a95135f0-1970-474a-850c-d280fc6ca217' AND date = '2025-10-13';
```

### Temporary Workaround:
Add fallback in `useDailyReflections.ts`:
```typescript
const { data, error } = await supabase
  .from('daily_reflections')
  .select('*')
  .eq('user_id', userId)
  .eq('date', date)
  .maybeSingle(); // ✅ Use maybeSingle() instead of single()
```

### Risk: ⚠️ UNKNOWN
- Needs database investigation
- Could be RLS or schema issue

---

## 🔍 FIX #6: Daily Health Nutrition 406 Error (SAME AS #5)

### Problem
**Error**: `GET .../daily_health?select=meals,macros&user_id=eq...&date=eq... 406 (Not Acceptable)`

### Same root cause as Fix #5
- Either RLS policy
- Or schema mismatch

### Quick Test:
```typescript
// In useNutritionSupabase.ts line 43-48
const { data, error } = await supabase
  .from('daily_health')
  .select('meals, macros')
  .eq('user_id', userId)
  .eq('date', date)
  .maybeSingle(); // ✅ Change from .single() to .maybeSingle()
```

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Zero-Risk Fixes (Do First)
1. ✅ **Fix #2** - Remove debug logs (2 lines)
2. ✅ **Fix #1** - Consolidate Supabase client (find/replace imports)
3. ✅ **Fix #3** - Fix infinite loop (1 line change)

### Phase 2: Low-Risk Fixes (Test Well)
4. ⚠️ **Fix #4** - Fix UUID sync error (add ID stripping logic)

### Phase 3: Investigation Required
5. 🔍 **Fix #5 & #6** - Debug 406 errors (requires database access)

---

## 🧪 TESTING CHECKLIST

### After Phase 1 Fixes:
- [ ] No duplicate Supabase client warning
- [ ] Console is cleaner (no calendar spam)
- [ ] Nutrition saves only when changed (not 20+ times)

### After Phase 2 Fixes:
- [ ] Clear offline queue: `window.offlineManager.clearPendingActions()`
- [ ] Make offline changes to nutrition
- [ ] Go back online
- [ ] Check sync succeeds (no UUID errors)

### After Phase 3 Fixes:
- [ ] Daily reflections load without 406 error
- [ ] Nutrition data loads without 406 error
- [ ] No errors in console

---

## 🚀 ESTIMATED IMPACT

**Phase 1 Fixes** (10 minutes):
- 50% reduction in console noise
- Stops infinite loops
- Cleaner architecture

**Phase 2 Fixes** (20 minutes):
- Fixes critical offline sync
- Unblocks 5 stuck sync actions
- Enables offline mode to work

**Phase 3 Fixes** (60+ minutes):
- Requires database investigation
- May need schema changes
- Could be RLS policy updates

---

**Total Time**: ~90 minutes for complete fix
**Quick Wins**: Phase 1 can be done in 10 minutes for immediate improvement!
