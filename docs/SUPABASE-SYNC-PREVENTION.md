# Supabase Sync Prevention Strategy

**Last Updated**: 2025-10-21
**Purpose**: Prevent database sync failures from breaking the app

## 🚨 What Went Wrong (October 2025)

### The Bug
- Sync configuration used wrong conflict keys
- Code: `onConflict: 'id'`
- Database: `UNIQUE (user_id, date, routine_type)`
- Result: ALL syncs failed with 400 errors

### The Impact
- Data saved to local IndexedDB ✅
- Sync to Supabase failed ❌
- No cross-device updates ❌
- Silent failures (no visible errors) ❌

### Tables Affected
- `daily_routines` (morning routine checkboxes)
- `daily_reflections` (nightly checkout)
- `daily_workouts` (home workouts)
- `time_blocks` (schedule)

---

## ✅ Prevention System

### 1. Automated Tests (`npm test`)
**File**: `src/shared/offline/__tests__/syncService.validation.test.ts`

Tests that sync configs match database constraints:
```typescript
it('should use correct conflict key for daily_routines', () => {
  expect(config.onConflict).toBe('user_id,date,routine_type');
});
```

**When to run**: Every commit (pre-commit hook)

### 2. Database Validation Script
**File**: `scripts/validate-supabase-sync.ts`

Queries live database and validates:
- Conflict keys match UNIQUE constraints
- RLS bypass policies exist
- Tables are accessible
- Permissions are correct

**Usage**:
```bash
npm run validate:sync
```

### 3. Runtime Monitoring
**File**: `src/shared/offline/syncMonitor.ts`

Real-time detection of sync failures:
- Tracks failed syncs
- Alerts after 3 failures in 1 minute
- Shows browser notification
- Logs detailed error info

**Usage**: Automatic (integrated into syncService)

### 4. Pre-Commit Hook
**File**: `.husky/pre-commit`

Runs before every commit:
- ✅ Sync validation tests
- ✅ Component mounting tests
- ✅ ESLint checks

---

## 📋 Developer Checklist

### When Adding a New Synced Table

**Step 1**: Create table with proper constraints
```sql
CREATE TABLE my_new_table (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  -- other columns...
  UNIQUE (user_id, date)  -- ← Document this!
);
```

**Step 2**: Add to sync config
```typescript
// src/shared/offline/syncService.ts
myNewTable: {
  table: 'my_new_table',
  primaryKey: 'id',
  userKey: 'user_id',
  onConflict: 'user_id,date',  // ← MUST match database!
}
```

**Step 3**: Add bypass policy (development)
```sql
CREATE POLICY "dev_bypass_my_new_table" ON my_new_table
  FOR ALL USING (true) WITH CHECK (true);
```

**Step 4**: Add validation test
```typescript
it('should use correct conflict key for my_new_table', () => {
  expect(config.onConflict).toBe('user_id,date');
});
```

**Step 5**: Run validation
```bash
npm run validate:sync
npm test -- syncService.validation
```

### When Modifying Database Schema

**Before deploying**:
```bash
# 1. Apply migration
npm run migrate

# 2. Regenerate types
npm run generate:types

# 3. Validate sync still works
npm run validate:sync

# 4. Run tests
npm test

# 5. Check for warnings
npm run typecheck
```

---

## 🔍 Debugging Sync Issues

### Check if data is syncing:
```bash
# Open browser console on Device A
window.syncMonitor.getStats()

# Make a change (check a box)
# Wait 10 seconds

# Open Device B and refresh
# Should see the change
```

### Common error messages:

**"400 Bad Request on upsert"**
- ❌ Conflict key doesn't match database constraint
- ✅ Fix: Update `onConflict` in SYNC_TABLE_MAP

**"403 Forbidden"**
- ❌ RLS policy blocking access
- ✅ Fix: Add dev bypass policy

**"406 Not Acceptable"**
- ❌ Missing table permissions
- ✅ Fix: `GRANT ALL ON table TO anon;`

**"Dropping action after max retries"**
- ❌ Sync keeps failing, gave up
- ✅ Fix: Check console for actual error, then fix root cause

---

## 🎯 Success Criteria

**Sync is working correctly when:**
1. ✅ No errors in browser console
2. ✅ Changes appear on all devices within 10 seconds
3. ✅ `window.syncMonitor.getStats()` shows 0 failures
4. ✅ Database `updated_at` timestamps are recent
5. ✅ No "Dropping action" messages

**When in doubt**: Run `npm run validate:sync`

---

## 📚 Related Documentation
- `docs/OFFLINE-FIRST-COMPLETE-FIX.md` - Offline architecture
- `docs/AI-SESSION-PROTECTION.md` - General safety guidelines
- `supabase/migrations/` - Database schema changes
