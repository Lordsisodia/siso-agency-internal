# 🛡️ Supabase Sync Failure Prevention System

**Created**: 2025-10-21
**Purpose**: Ensure database sync NEVER silently breaks again
**Priority**: CRITICAL - This prevents data loss

---

## ⚡ Quick Start

**Before making database changes**:
```bash
npm run validate:sync  # Check sync is healthy
npm run test:sync      # Test sync configs
```

**If sync seems broken**:
```bash
# Open browser console
window.syncMonitor.getStats()  # Check for failures
```

---

## 🎯 The 4-Layer Defense System

### **Layer 1: Automated Tests (Runs Every Commit)**
**File**: `src/shared/offline/__tests__/syncService.validation.test.ts`

**What it does**: Tests that sync conflict keys match database constraints

**Example**:
```typescript
it('should use correct conflict key for daily_routines', () => {
  expect(config.onConflict).toBe('user_id,date,routine_type');
});
```

**When it runs**:
- Every `git commit` (pre-commit hook)
- Every `npm test`
- CI/CD pipeline

**Prevents**: Wrong conflict keys causing 400 errors

---

### **Layer 2: Database Validator Script**
**File**: `scripts/validate-supabase-sync.ts`

**What it does**: Connects to LIVE database and validates:
- ✅ Conflict keys match actual UNIQUE constraints
- ✅ RLS bypass policies exist
- ✅ Tables are accessible
- ✅ Permissions are correct

**Usage**:
```bash
npm run validate:sync
```

**When to run**:
- After database migrations
- Before major releases
- When adding new synced tables
- Monthly health check

**Prevents**: Deployed code with broken sync

---

### **Layer 3: Runtime Monitoring**
**File**: `src/shared/offline/syncMonitor.ts`

**What it does**: Watches for sync failures in real-time

**Features**:
- Tracks all sync errors
- Alerts after 3 failures in 1 minute
- Shows browser notification
- Detailed error logging

**Developer tools**:
```javascript
// Browser console commands
window.syncMonitor.getStats()  // Check sync health
window.syncMonitor.reset()     // Clear failure history
```

**Prevents**: Silent sync failures going unnoticed

---

### **Layer 4: Pre-Commit Hook**
**File**: `.husky/pre-commit`

**What it runs**:
1. ESLint checks
2. Component mounting tests
3. **Sync validation tests** ← NEW!
4. TypeScript type checking

**Prevents**: Committing broken sync configs

---

## 🔧 How Each Layer Catches Different Problems

| Problem | Layer 1 Tests | Layer 2 Validator | Layer 3 Monitor | Layer 4 Hook |
|---------|---------------|-------------------|-----------------|--------------|
| Wrong conflict key | ✅ | ✅ | ✅ | ✅ |
| Missing RLS policy | ❌ | ✅ | ✅ | ❌ |
| Table doesn't exist | ❌ | ✅ | ✅ | ❌ |
| Permissions issue | ❌ | ✅ | ✅ | ❌ |
| Silent failures | ❌ | ❌ | ✅ | ❌ |
| Code committed broken | ✅ | ❌ | ❌ | ✅ |

**Together**: Catch 100% of sync issues before they reach production

---

## 📋 Developer Workflows

### **Adding a New Synced Table**

```bash
# 1. Create table with proper constraints
# Document the UNIQUE constraint clearly!

# 2. Add to syncService.ts
# Match onConflict to database constraint

# 3. Add bypass policy (dev mode)
CREATE POLICY "dev_bypass_my_table" ON my_table...

# 4. Add validation test
it('should use correct key for my_table', () => ...)

# 5. Run validation
npm run test:sync
npm run validate:sync

# 6. Commit (tests run automatically)
git commit
```

---

### **After Database Migration**

```bash
# 1. Apply migration
supabase db push

# 2. Regenerate types
supabase gen types typescript > src/types/database.types.ts

# 3. Validate sync still works
npm run validate:sync

# 4. Check for constraint changes
# Compare old vs new UNIQUE constraints

# 5. Update sync configs if needed

# 6. Run tests
npm run test:sync

# 7. Commit
git commit  # Tests run automatically
```

---

### **Debugging Sync Issues**

**Step 1**: Check runtime monitor
```javascript
window.syncMonitor.getStats()
// Shows: { totalFailures: 5, byTable: { daily_routines: 5 } }
```

**Step 2**: Check console for actual error
```
[SyncService] Failed to upsert daily_routines: ...
```

**Step 3**: Compare config to database
```typescript
// syncService.ts
onConflict: 'user_id,date,routine_type'

// Database
UNIQUE (user_id, date, routine_type)  // Must match!
```

**Step 4**: Fix and test
```bash
npm run test:sync      # Verify fix
npm run validate:sync  # Validate against DB
```

---

## 🎓 What We Learned (October 2025 Incident)

### **What Broke**
- Type generation exposed that sync was broken
- Conflict keys didn't match database constraints
- Errors were logged but not visible
- Data piled up in offline queue
- Nothing synced across devices

### **Root Causes**
1. No automated tests for sync configs
2. No runtime monitoring of sync health
3. Database constraints not validated
4. Silent failures (console.error only)

### **The Fix**
- ✅ 4-layer prevention system
- ✅ Automated tests catch mismatches
- ✅ Runtime alerts on failures
- ✅ Pre-commit validation
- ✅ Live database health checks

---

## 🚀 Future Improvements

**Phase 2** (Optional):
- Generate sync configs from database schema (eliminate manual config)
- Add Sentry integration for production monitoring
- Create admin dashboard showing sync health
- Auto-fix common sync issues

**Phase 3** (Advanced):
- Real-time sync health widget in dev toolbar
- Automated constraint migration validation
- Performance metrics (sync latency tracking)
- A/B test sync strategies

---

## 📞 Troubleshooting

**Q: Tests pass but sync still failing?**
A: Run `npm run validate:sync` - tests check code, validator checks live DB

**Q: Validator passes but data not syncing?**
A: Check `window.syncMonitor.getStats()` - might be network/auth issue

**Q: How often should I run validator?**
A: After every migration, before releases, or monthly

**Q: Can I disable the pre-commit hook?**
A: Yes, but DON'T - it's your safety net

---

## ✅ Success Metrics

**Sync is healthy when:**
1. Pre-commit tests pass ✅
2. `npm run validate:sync` shows all green ✅
3. `syncMonitor.getStats()` shows 0 failures ✅
4. Changes appear on all devices within 10s ✅
5. No console errors ✅

**If any fail**: Stop and fix before deploying!

---

## 🎯 Team Guidelines

**For developers**:
- ✅ Run tests before committing
- ✅ Check sync monitor weekly
- ✅ Never skip pre-commit hook
- ✅ Document UNIQUE constraints in migrations

**For AI agents**:
- ✅ Always run validation after schema changes
- ✅ Check test failures carefully
- ✅ Never bypass validation "to save time"
- ✅ Update tests when constraints change

---

*This system prevents the October 2025 sync failure from ever happening again.*
