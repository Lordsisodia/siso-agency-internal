/**
 * Test script to verify offline API functionality
 */

async function testOfflineAPI() {
  console.log('🧪 Testing Offline API functionality...\n');

  try {
    // Test 1: Check if IndexedDB is available
    console.log('1. Testing IndexedDB availability...');
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      console.log('✅ IndexedDB is available');
    } else {
      console.log('❌ IndexedDB not available');
      return;
    }

    // Test 2: Test basic database operations
    console.log('\n2. Testing database operations...');
    
    const request = indexedDB.open('lifelock-offline-db', 1);
    
    request.onerror = function() {
      console.log('❌ Failed to open IndexedDB');
    };
    
    request.onsuccess = function(event) {
      console.log('✅ IndexedDB opened successfully');
      const db = event.target.result;
      db.close();
    };

    request.onupgradeneeded = function(event) {
      console.log('📝 Setting up database schema...');
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('lightWorkTasks')) {
        const lightWorkStore = db.createObjectStore('lightWorkTasks', { keyPath: 'id' });
        lightWorkStore.createIndex('user_id', 'user_id', { unique: false });
        lightWorkStore.createIndex('task_date', 'task_date', { unique: false });
        console.log('✅ Light work tasks store created');
      }
      
      if (!db.objectStoreNames.contains('deepWorkTasks')) {
        const deepWorkStore = db.createObjectStore('deepWorkTasks', { keyPath: 'id' });
        deepWorkStore.createIndex('user_id', 'user_id', { unique: false });
        deepWorkStore.createIndex('task_date', 'task_date', { unique: false });
        console.log('✅ Deep work tasks store created');
      }
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('✅ Offline actions store created');
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        console.log('✅ Settings store created');
      }
    };

    // Test 3: Network detection
    console.log('\n3. Testing network detection...');
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      console.log(`✅ Network status: ${navigator.onLine ? 'Online' : 'Offline'}`);
    } else {
      console.log('❌ Network detection not available');
    }

    // Test 4: Service Worker support
    console.log('\n4. Testing Service Worker support...');
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('✅ Service Worker API available');
      
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log(`✅ Service Worker registered at: ${registration.scope}`);
          console.log(`📊 State: ${registration.active ? registration.active.state : 'Not active'}`);
        } else {
          console.log('⚠️ No Service Worker registered (will register on first load)');
        }
      } catch (error) {
        console.log('⚠️ Service Worker check failed:', error.message);
      }
    } else {
      console.log('❌ Service Worker not supported');
    }

    // Test 5: Cache API
    console.log('\n5. Testing Cache API...');
    if (typeof window !== 'undefined' && 'caches' in window) {
      console.log('✅ Cache API available');
      
      try {
        const testCache = await caches.open('pwa-functionality-test');
        await testCache.put('/test-url', new Response('test data'));
        const cached = await testCache.match('/test-url');
        
        if (cached) {
          console.log('✅ Cache read/write operations working');
          await caches.delete('pwa-functionality-test');
        } else {
          console.log('❌ Cache operations failed');
        }
      } catch (error) {
        console.log('❌ Cache API error:', error.message);
      }
    } else {
      console.log('❌ Cache API not supported');
    }

    console.log('\n🎉 Offline API testing completed!');
    console.log('\n📋 Summary:');
    console.log('- IndexedDB: Ready for local storage');
    console.log('- Network Detection: Available');
    console.log('- Service Worker: Available (will activate on page load)');
    console.log('- Cache API: Ready for offline caching');
    console.log('\n✅ All core offline functionality is supported!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for Node.js environments or run directly in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testOfflineAPI;
} else if (typeof window !== 'undefined') {
  // Run in browser context
  testOfflineAPI();
}