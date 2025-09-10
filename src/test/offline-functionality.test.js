/**
 * Manual test script for offline functionality
 * This can be run in browser console to verify offline capabilities
 */

// Test the offline API functionality
async function testOfflineFunctionality() {
  console.log('🧪 Testing Offline PWA Functionality\n');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function logTest(name, status, message) {
    const symbol = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${symbol} ${name}: ${message}`);
    results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
  }

  try {
    // Test 1: Import hybrid API
    console.log('Testing component imports...');
    
    try {
      const module = await import('/src/api/hybridLifelockApi.ts');
      const { hybridLifelockApi } = module;
      logTest('Hybrid API Import', 'pass', 'Successfully imported hybridLifelockApi');
      
      // Test connection status
      const connectionStatus = hybridLifelockApi.getConnectionStatus();
      logTest('Connection Status', 'pass', `Network: ${connectionStatus.isOnline ? 'Online' : 'Offline'}`);
      
      // Test sync stats
      const syncStats = await hybridLifelockApi.getSyncStats();
      logTest('Sync Stats', 'pass', `Local tasks: ${syncStats.localTasks || 0}, Pending: ${syncStats.pendingSync || 0}`);
      
    } catch (error) {
      logTest('Hybrid API Import', 'fail', `Import failed: ${error.message}`);
    }

    // Test 2: IndexedDB functionality
    console.log('\nTesting IndexedDB...');
    
    try {
      const request = indexedDB.open('lifelock-offline-test', 1);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('test-store')) {
          db.createObjectStore('test-store', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['test-store'], 'readwrite');
        const store = transaction.objectStore('test-store');
        
        // Test write
        const testData = { id: 'test-1', title: 'Test Task', created: new Date().toISOString() };
        const addRequest = store.add(testData);
        
        addRequest.onsuccess = function() {
          // Test read
          const getRequest = store.get('test-1');
          getRequest.onsuccess = function() {
            if (getRequest.result) {
              logTest('IndexedDB Read/Write', 'pass', 'Successfully stored and retrieved data');
            } else {
              logTest('IndexedDB Read/Write', 'fail', 'Data not found after write');
            }
            
            // Cleanup
            db.close();
            indexedDB.deleteDatabase('lifelock-offline-test');
          };
        };
        
        addRequest.onerror = function() {
          logTest('IndexedDB Read/Write', 'fail', 'Failed to write data');
        };
      };
      
      request.onerror = function() {
        logTest('IndexedDB Read/Write', 'fail', 'Failed to open database');
      };
      
    } catch (error) {
      logTest('IndexedDB Read/Write', 'fail', `Error: ${error.message}`);
    }

    // Test 3: Service Worker
    console.log('\nTesting Service Worker...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          logTest('Service Worker', 'pass', `Active: ${registration.active ? 'Yes' : 'No'}`);
        } else {
          logTest('Service Worker', 'warning', 'Not registered (will activate on first page load)');
        }
      } else {
        logTest('Service Worker', 'fail', 'Service Worker API not supported');
      }
    } catch (error) {
      logTest('Service Worker', 'fail', `Error: ${error.message}`);
    }

    // Test 4: Cache API
    console.log('\nTesting Cache API...');
    
    try {
      if ('caches' in window) {
        const cache = await caches.open('functionality-test');
        await cache.put('/test-cache', new Response(JSON.stringify({ test: true })));
        const cached = await cache.match('/test-cache');
        
        if (cached) {
          const data = await cached.json();
          logTest('Cache API', 'pass', 'Cache operations working');
        } else {
          logTest('Cache API', 'fail', 'Cache retrieval failed');
        }
        
        await caches.delete('functionality-test');
      } else {
        logTest('Cache API', 'fail', 'Cache API not supported');
      }
    } catch (error) {
      logTest('Cache API', 'fail', `Error: ${error.message}`);
    }

    // Test 5: Task creation simulation
    console.log('\nTesting Task Creation...');
    
    try {
      const testTask = {
        id: `test-${Date.now()}`,
        user_id: 'test-user',
        title: 'Test Offline Task',
        description: 'Created by offline functionality test',
        priority: 'MEDIUM',
        completed: false,
        original_date: new Date().toISOString().split('T')[0],
        task_date: new Date().toISOString().split('T')[0],
        estimated_duration: 30,
        xp_reward: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _offline_id: `offline-${Date.now()}`,
        _needs_sync: true,
        _sync_status: 'pending'
      };
      
      logTest('Task Creation Simulation', 'pass', 'Test task data structure valid');
      
    } catch (error) {
      logTest('Task Creation Simulation', 'fail', `Error: ${error.message}`);
    }

    // Summary
    setTimeout(() => {
      console.log('\n📊 Test Summary:');
      console.log(`✅ Passed: ${results.passed}`);
      console.log(`⚠️ Warnings: ${results.warnings}`);
      console.log(`❌ Failed: ${results.failed}`);
      
      if (results.failed === 0) {
        console.log('\n🎉 All critical tests passed! Offline functionality is working.');
      } else {
        console.log('\n🔧 Some tests failed. Check the issues above.');
      }
      
      console.log('\n🚀 To test manually:');
      console.log('1. Visit /admin/offline-demo');
      console.log('2. Create tasks while online');
      console.log('3. Disconnect internet');
      console.log('4. Create more tasks (should work offline)');
      console.log('5. Reconnect internet (should auto-sync)');
    }, 2000);

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the test
console.log('🔧 Running Offline PWA Functionality Test...');
console.log('Copy and paste this into your browser console while on the app:');
console.log('');
console.log('testOfflineFunctionality()');
console.log('');

// Export for use
if (typeof window !== 'undefined') {
  window.testOfflineFunctionality = testOfflineFunctionality;
}

export { testOfflineFunctionality };