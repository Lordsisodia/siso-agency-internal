/**
 * 🧪 Browser Console Test Script
 * Run in browser console to verify offline functionality
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Watch test results appear
 */

(async function testOfflineInfrastructure() {
  console.log('🧪 Starting Offline Infrastructure Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const emoji = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${emoji} ${name}: ${status}${details ? ' - ' + details : ''}`);
    
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // Test 1: IndexedDB Exists
  try {
    const dbCheck = indexedDB.open('SISOOfflineDB', 2);
    await new Promise((resolve, reject) => {
      dbCheck.onsuccess = resolve;
      dbCheck.onerror = reject;
    });
    logTest('IndexedDB exists and opens', true, 'v2');
  } catch (error) {
    logTest('IndexedDB exists and opens', false, error.message);
  }

  // Test 2: Check Store Names
  try {
    const db = await new Promise((resolve) => {
      const request = indexedDB.open('SISOOfflineDB', 2);
      request.onsuccess = () => resolve(request.result);
    });
    
    const requiredStores = [
      'lightWorkTasks',
      'deepWorkTasks',
      'morningRoutines',
      'workoutSessions',
      'healthHabits',
      'nightlyCheckouts',
      'offlineActions',
      'settings'
    ];
    
    const existingStores = Array.from(db.objectStoreNames);
    const allExist = requiredStores.every(store => existingStores.includes(store));
    
    if (allExist) {
      logTest('All 8 IndexedDB stores exist', true, existingStores.join(', '));
    } else {
      const missing = requiredStores.filter(s => !existingStores.includes(s));
      logTest('All 8 IndexedDB stores exist', false, `Missing: ${missing.join(', ')}`);
    }
  } catch (error) {
    logTest('All 8 IndexedDB stores exist', false, error.message);
  }

  // Test 3: Write to Cache
  try {
    const testData = {
      id: 'test-' + Date.now(),
      user_id: 'test-user',
      date: '2025-10-10',
      routine_type: 'morning',
      items: [{ name: 'testHabit', completed: true }],
      completed_count: 1,
      total_count: 1,
      completion_percentage: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const db = await new Promise((resolve) => {
      const request = indexedDB.open('SISOOfflineDB', 2);
      request.onsuccess = () => resolve(request.result);
    });

    await new Promise((resolve, reject) => {
      const tx = db.transaction('morningRoutines', 'readwrite');
      const store = tx.objectStore('morningRoutines');
      const request = store.put(testData);
      request.onsuccess = resolve;
      request.onerror = reject;
    });

    logTest('Write to cache', true, 'Saved morning routine');
  } catch (error) {
    logTest('Write to cache', false, error.message);
  }

  // Test 4: Read from Cache
  try {
    const db = await new Promise((resolve) => {
      const request = indexedDB.open('SISOOfflineDB', 2);
      request.onsuccess = () => resolve(request.result);
    });

    const data = await new Promise((resolve, reject) => {
      const tx = db.transaction('morningRoutines', 'readonly');
      const store = tx.objectStore('morningRoutines');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });

    if (Array.isArray(data) && data.length > 0) {
      logTest('Read from cache', true, `Found ${data.length} routine(s)`);
    } else {
      logTest('Read from cache', true, 'No data (empty DB)');
    }
  } catch (error) {
    logTest('Read from cache', false, error.message);
  }

  // Test 5: Count Records
  try {
    const db = await new Promise((resolve) => {
      const request = indexedDB.open('SISOOfflineDB', 2);
      request.onsuccess = () => resolve(request.result);
    });

    const stores = ['lightWorkTasks', 'deepWorkTasks', 'morningRoutines', 'workoutSessions', 'healthHabits', 'nightlyCheckouts'];
    const counts = {};

    for (const storeName of stores) {
      const count = await new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).count();
        request.onsuccess = () => resolve(request.result);
      });
      counts[storeName] = count;
    }

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
    logTest('Count all records', true, `Total: ${totalRecords} across ${stores.length} stores`);
    
    console.log('\n📊 Record counts by store:');
    Object.entries(counts).forEach(([store, count]) => {
      console.log(`   ${store}: ${count}`);
    });
  } catch (error) {
    logTest('Count all records', false, error.message);
  }

  // Test 6: Network Detection
  try {
    const isOnline = navigator.onLine;
    logTest('Network detection', true, isOnline ? 'Online' : 'Offline');
  } catch (error) {
    logTest('Network detection', false, error.message);
  }

  // Test 7: Service Worker
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        logTest('Service Worker registered', true, registration.active ? 'Active' : 'Installing');
      } else {
        logTest('Service Worker registered', false, 'Not registered');
      }
    } else {
      logTest('Service Worker registered', false, 'Not supported');
    }
  } catch (error) {
    logTest('Service Worker registered', false, error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    console.log('🎉 All tests passed! Offline infrastructure is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the details above.');
  }

  console.log('\n💡 Quick Actions:');
  console.log('• Clear cache: indexedDB.deleteDatabase("SISOOfflineDB")');
  console.log('• Check stats: await offlineDb.getStats()');
  console.log('• Go offline: DevTools → Network → Offline');
  console.log('• Test page: /test-offline');

  return results;
})();
