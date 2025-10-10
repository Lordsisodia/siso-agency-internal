# 🧪 Offline Infrastructure Testing Guide

Complete testing suite to verify cache-first architecture and offline functionality.

---

## 🎯 Test Coverage

We have **3 types of tests**:

1. **Automated Unit Tests** (Vitest) - Test individual components
2. **Browser Console Tests** (JavaScript) - Quick verification in DevTools
3. **Manual Browser Tests** (UI) - Real-world usage testing

---

## 1️⃣ Automated Unit Tests (Vitest)

### Run Tests

```bash
npm run test
```

### Test Files Created:

**`src/shared/offline/__tests__/offlineDb.test.ts`**
- ✅ IndexedDB schema validation
- ✅ CRUD operations for all 6 stores
- ✅ Sync status tracking
- ✅ Date filtering
- ✅ Cache statistics
- ✅ Performance benchmarks

**`src/shared/hooks/__tests__/offline-hooks.test.tsx`**
- ✅ Cache-first loading pattern
- ✅ Offline behavior
- ✅ Data persistence
- ✅ Multiple store types
- ✅ Performance (load time < 50ms)
- ✅ Stress test (100 records)

### What These Tests Verify:

✅ Database schema has all 8 required stores:
  - lightWorkTasks
  - deepWorkTasks
  - morningRoutines ← NEW
  - workoutSessions ← NEW
  - healthHabits ← NEW
  - nightlyCheckouts ← NEW
  - offlineActions
  - settings

✅ Save/load operations work for each store
✅ Sync status tracking (_needs_sync, _sync_status)
✅ Date filtering returns correct data
✅ Cache loads faster than 50ms
✅ Handles 100+ records without slowdown

---

## 2️⃣ Browser Console Tests (Quick Verification)

### How to Run:

1. Open your app in browser
2. Open DevTools (F12)
3. Go to Console tab
4. Copy and paste: `scripts/test-offline-browser.js`
5. Press Enter

### What It Tests:

```
🧪 Starting Offline Infrastructure Tests...

✅ IndexedDB exists and opens - v2
✅ All 8 IndexedDB stores exist - lightWorkTasks, deepWorkTasks, morningRoutines...
✅ Write to cache - Saved morning routine
✅ Read from cache - Found 1 routine(s)
✅ Count all records - Total: 15 across 6 stores
✅ Network detection - Online
✅ Service Worker registered - Active

📊 Test Summary
✅ Passed: 7
❌ Failed: 0
📈 Success Rate: 100%

🎉 All tests passed! Offline infrastructure is working correctly.
```

### Quick Actions Available:

```javascript
// Clear IndexedDB completely
indexedDB.deleteDatabase('SISOOfflineDB');

// Get current stats
await offlineDb.getStats();

// Check what's in cache
const routines = await offlineDb.getMorningRoutines('2025-10-10');
console.log(routines);

// Check network status
offlineManager.getStatus();
```

---

## 3️⃣ Manual Browser Tests (Real-World Usage)

### Test Page: `/test-offline`

Navigate to: **http://localhost:5173/test-offline**

This page provides:
- ✅ Live IndexedDB statistics
- ✅ Network status monitoring
- ✅ Hook load status indicators
- ✅ One-click test execution
- ✅ Cache management tools

### Manual Test Scenarios:

---

### **Test A: Instant Load (Cache-First)**

**Purpose**: Verify data loads instantly from cache

**Steps**:
1. Open app, navigate to `/admin/life-lock/day/2025-10-10`
2. Let data load once (initial fetch from Supabase)
3. Switch to different tab (e.g., "Workout")
4. Switch back to "Morning" tab

**Expected Result**:
- ✅ Data appears **instantly** (< 50ms)
- ✅ **No loading spinner**
- ✅ Console shows: `⚡ INSTANT: Loaded from IndexedDB`

**If Failed**:
- ❌ Spinner appears for 500ms
- ❌ Console shows network requests
- 🔧 Check: Is IndexedDB cache empty? Run `/test-offline` to check stats

---

### **Test B: Offline Mode (Full Functionality)**

**Purpose**: Verify app works completely offline

**Steps**:
1. Open app while **online**
2. Navigate to LifeLock, let data load
3. Open DevTools → Network tab
4. Set throttling to **"Offline"**
5. Refresh the page
6. Navigate between tabs
7. Toggle morning routine habits
8. Mark workout exercises as complete
9. Add new light work task

**Expected Result**:
- ✅ Page loads (from cache or service worker)
- ✅ All tabs load instantly from IndexedDB
- ✅ Can toggle habits (saves to cache)
- ✅ Can complete exercises (saves to cache)
- ✅ Can create tasks (queued for sync)
- ✅ See offline indicator (if UI shows it)
- ✅ Console shows: `💾 Saving to offline storage`

**If Failed**:
- ❌ Blank page or error on refresh
- ❌ "Network error" when loading data
- 🔧 Check: Service Worker installed? Cache populated?

---

### **Test C: Background Sync**

**Purpose**: Verify offline changes sync automatically

**Steps**:
1. Go **offline** (DevTools → Network → Offline)
2. Make 5 changes (toggle habits, complete exercises, etc.)
3. Open `/test-offline` page
4. Check "Pending Syncs" counter (should be > 0)
5. Go back **online** (DevTools → Network → Online)
6. Wait 30 seconds (auto-sync interval)
7. Check "Pending Syncs" counter (should go to 0)

**Expected Result**:
- ✅ Pending syncs increase as you make offline changes
- ✅ Console shows: `🔄 Syncing X pending actions`
- ✅ Pending syncs decrease to 0 after 30 seconds online
- ✅ Console shows: `✅ Sync complete: 5 synced, 0 failed`
- ✅ Changes appear in Supabase database

**If Failed**:
- ❌ Pending syncs stuck at > 0
- ❌ Console shows sync errors
- 🔧 Check: Supabase connection? Network truly online?

---

### **Test D: Cache Persistence**

**Purpose**: Verify cache survives browser restart

**Steps**:
1. Open app, navigate to LifeLock
2. Toggle 3 morning routine habits
3. Open `/test-offline` - note IndexedDB stats
4. **Close browser tab completely**
5. Reopen browser
6. Navigate to `/test-offline`
7. Check IndexedDB stats (should match before)
8. Navigate to LifeLock
9. Check habits are still toggled

**Expected Result**:
- ✅ IndexedDB stats match before closing
- ✅ Habit states persisted
- ✅ No data loss

**If Failed**:
- ❌ IndexedDB empty after reopen
- ❌ Habits reset
- 🔧 Check: Browser cleared cache? Private browsing mode?

---

### **Test E: Multi-Tab Consistency**

**Purpose**: Verify cache updates across browser tabs

**Steps**:
1. Open app in 2 browser tabs
2. In Tab 1: Toggle a morning habit
3. In Tab 2: Refresh or navigate to morning routine
4. Check if toggle appears in Tab 2

**Expected Result**:
- ✅ Change appears in Tab 2 after refresh
- ✅ IndexedDB shared across tabs

**Note**: Real-time sync between tabs not implemented (would need BroadcastChannel)

---

## 📊 Success Criteria

### All Tests Should Show:

✅ **Automated Tests**: 100% pass rate (Vitest)  
✅ **Console Tests**: 7/7 tests pass  
✅ **Manual Test A**: Data loads instantly (< 50ms)  
✅ **Manual Test B**: App works offline  
✅ **Manual Test C**: Changes sync automatically  
✅ **Manual Test D**: Cache persists across sessions  
✅ **Manual Test E**: Multi-tab cache sharing  

---

## 🐛 Troubleshooting

### Issue: Tests fail with "Database not found"

**Fix**: 
```javascript
// Run in console:
await offlineDb.init();
```

### Issue: "Service Worker not registered"

**Fix**:
```bash
# Rebuild with PWA
npm run build
npm run preview
```

### Issue: IndexedDB shows 0 records

**Cause**: Cache not populated yet  
**Fix**: Navigate to actual LifeLock pages, let data load once

### Issue: Pending syncs stuck at > 0

**Cause**: Network actually offline or Supabase unreachable  
**Fix**:
```javascript
// Force sync manually:
await offlineManager.forcSync();
```

### Issue: Cache clears unexpectedly

**Cause**: Browser storage limit or private browsing  
**Fix**: 
- Check browser storage quota
- Disable private browsing
- Check IndexedDB isn't in "temporary" mode

---

## 🔍 Debugging Tools

### Check IndexedDB in Browser:

**Chrome/Edge**:
1. DevTools → Application tab
2. IndexedDB → SISOOfflineDB
3. Expand to see all stores
4. Click each store to view records

**Firefox**:
1. DevTools → Storage tab
2. Indexed DB → SISOOfflineDB
3. View stores and records

### Console Helpers:

```javascript
// Get detailed stats
const stats = await offlineDb.getStats();
console.table(stats);

// View all morning routines
const routines = await offlineDb.getMorningRoutines();
console.table(routines);

// Check pending actions
const pending = await offlineDb.getPendingActions();
console.log('Pending syncs:', pending);

// Network status
const status = offlineManager.getStatus();
console.log('Network:', status);

// Force sync
const result = await offlineManager.forcSync();
console.log('Sync result:', result);

// Clear everything
await offlineDb.clear();
console.log('Cache cleared');
```

---

## 📈 Performance Benchmarks

### Expected Performance:

| Operation | Target | Acceptable | Poor |
|-----------|--------|------------|------|
| Cache read | < 10ms | < 50ms | > 100ms |
| Cache write | < 20ms | < 100ms | > 200ms |
| Initial load (no cache) | 300-500ms | < 1s | > 2s |
| Tab switch (cached) | < 50ms | < 100ms | > 500ms |
| Offline save | < 100ms | < 200ms | > 500ms |
| Sync operation | < 2s | < 5s | > 10s |

### How to Measure:

```javascript
// In browser console:
console.time('cacheLoad');
const data = await offlineDb.getMorningRoutines('2025-10-10');
console.timeEnd('cacheLoad');
// Should show: cacheLoad: 5ms
```

---

## 🎯 Test Checklist - Complete Verification

### Pre-Flight Checks:
- [ ] Run `npm run test` - all pass
- [ ] Run browser console test - all pass
- [ ] Open `/test-offline` - no errors

### Functionality Tests:
- [ ] **Test A** - Instant load (< 50ms)
- [ ] **Test B** - Works offline
- [ ] **Test C** - Auto-sync works
- [ ] **Test D** - Cache persists
- [ ] **Test E** - Multi-tab works

### Edge Cases:
- [ ] Empty cache loads correctly
- [ ] Network transitions (online ↔ offline) handle gracefully
- [ ] Rapid tab switching doesn't break
- [ ] 100+ cached records still fast
- [ ] Sync failures queue for retry

### Performance:
- [ ] Tab switches feel instant
- [ ] No "loading loading loading"
- [ ] Background sync doesn't lag UI
- [ ] Network calls reduced by 85%+

---

## 🚀 Quick Start Testing

**1. Automated Tests** (2 minutes):
```bash
npm run test src/shared/offline
npm run test src/shared/hooks/__tests__/offline-hooks
```

**2. Browser Console Test** (1 minute):
- Open app
- F12 → Console
- Paste `scripts/test-offline-browser.js`
- Verify all ✅

**3. Visual Test Page** (2 minutes):
- Navigate to `/test-offline`
- Click "Run All Tests"
- Check all green ✅
- View IndexedDB stats

**4. Real-World Test** (5 minutes):
- Navigate to `/admin/life-lock`
- Switch tabs rapidly → Should be instant
- Go offline (DevTools → Network → Offline)
- Toggle habits → Should still work
- Go online → Should auto-sync

**Total**: ~10 minutes for complete verification

---

## 📋 Test Execution Log Template

```
Date: 2025-10-10
Tester: [Your Name]
Environment: Chrome 119, macOS

=== Automated Tests ===
[✅] IndexedDB schema tests - 13/13 passed
[✅] Offline hooks tests - 8/8 passed

=== Browser Console Test ===
[✅] All 7 tests passed

=== Manual Tests ===
[✅] Test A: Instant Load - < 10ms
[✅] Test B: Offline Mode - Full functionality
[✅] Test C: Background Sync - 5 items synced
[✅] Test D: Cache Persistence - Data survived restart
[✅] Test E: Multi-Tab - Changes reflected

=== Performance ===
Cache read: 8ms (target: < 10ms) ✅
Cache write: 15ms (target: < 20ms) ✅
Tab switch: 12ms (target: < 50ms) ✅

=== Issues Found ===
None

=== Conclusion ===
✅ All tests passed
✅ Offline infrastructure working correctly
✅ Ready for production
```

---

## 🎉 Success Criteria

Your offline infrastructure is **working correctly** if:

✅ All automated tests pass (21/21 tests)
✅ Browser console test shows 100% success rate
✅ `/test-offline` page shows all green checkmarks
✅ Data loads instantly on tab switch (< 50ms)
✅ App works completely offline
✅ Changes sync automatically when back online
✅ No "loading loading loading" experience
✅ Cache persists across browser sessions

If all above are true → **Ship it!** 🚀

---

## 🛠️ Continuous Testing

### Add to CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run offline tests
  run: npm run test -- src/shared/offline src/shared/hooks/__tests__/offline-hooks
```

### Add to Pre-Commit Hook:

```bash
# .husky/pre-commit
npm run test -- --run src/shared/offline
```

### Monitor in Production:

```javascript
// Add to app initialization
if (import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    const stats = await offlineDb.getStats();
    console.log('📊 Cache health:', stats);
    
    // Report to analytics
    analytics.track('cache_health', {
      total_records: Object.values(stats).reduce((a,b) => a+b, 0),
      pending_syncs: stats.pendingActions
    });
  });
}
```

---

## 📝 Test Data Setup

### For Manual Testing, Pre-Populate Cache:

```javascript
// Run in browser console to create test data:

const testDate = '2025-10-10';
const userId = 'test-user-id';

// Morning routine
await offlineDb.saveMorningRoutine({
  id: 'test-routine',
  user_id: userId,
  date: testDate,
  routine_type: 'morning',
  items: [
    { name: 'wakeUp', completed: true },
    { name: 'exercise', completed: false }
  ],
  completed_count: 1,
  total_count: 2,
  completion_percentage: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}, false);

// Workout
await offlineDb.saveWorkoutSession({
  id: 'test-workout',
  user_id: userId,
  workout_date: testDate,
  items: [
    { id: '1', title: 'Push-ups', completed: true, target: '50', logged: '50' }
  ],
  total_exercises: 1,
  completed_exercises: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}, false);

console.log('✅ Test data created');
```

---

## 🔄 Regression Testing

### When to Re-Test:

**After any changes to**:
- ⚠️ `src/shared/offline/offlineDb.ts` - Core infrastructure
- ⚠️ Any hook with "Supabase" in the name
- ⚠️ `src/shared/services/offlineManager.ts`
- ⚠️ Service worker configuration
- ⚠️ Vite PWA settings

**Quick Regression Test** (3 min):
```bash
npm run test src/shared/offline
# Then open /test-offline and click "Run All Tests"
```

---

## 🎯 Known Limitations

### Not Tested Yet:

⚠️ **Conflict Resolution** - If user edits same data on 2 devices offline
⚠️ **Storage Limits** - What happens at 50MB IndexedDB limit  
⚠️ **Old Data Cleanup** - Cache doesn't auto-delete old entries
⚠️ **Network Timeout Handling** - Slow connections (3G, poor WiFi)

### Future Test Coverage:

```
Priority 1 (Next):
- [ ] Conflict detection test
- [ ] Storage limit handling
- [ ] Slow network simulation

Priority 2 (Later):
- [ ] Multi-device sync test
- [ ] Cache invalidation test
- [ ] Background sync registration test
```

---

## ✅ Test Completion Sign-Off

**Run this final checklist before marking as "done":**

```bash
# 1. Run all automated tests
npm run test

# 2. TypeScript check
npx tsc --noEmit

# 3. Build succeeds
npm run build

# 4. Manual tests
# → Open /test-offline
# → Click "Run All Tests"
# → All green checkmarks

# 5. Real-world usage
# → Navigate to /admin/life-lock
# → Switch tabs 10x rapidly
# → All instant, no spinners

# 6. Offline mode
# → DevTools → Offline
# → App still works
# → Make changes
# → Go online
# → Changes sync
```

**If all pass** → ✅ Offline infrastructure verified and production-ready!

---

## 📞 Quick Reference

| What | Command/URL |
|------|-------------|
| Run tests | `npm run test` |
| Browser console test | Paste `scripts/test-offline-browser.js` |
| Visual test page | `/test-offline` |
| Check cache | DevTools → Application → IndexedDB |
| Go offline | DevTools → Network → Offline |
| Clear cache | `indexedDB.deleteDatabase('SISOOfflineDB')` |
| Force sync | `await offlineManager.forcSync()` |

---

**Happy Testing! 🧪**
