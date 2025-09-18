// 🚀 SISO LifeLock Offline-First Service Worker
// Bulletproof offline functionality for productivity that never stops

const CACHE_NAME = 'siso-lifelock-v1.0.0';
const OFFLINE_CACHE = 'offline-fallbacks-v1';
const DATA_CACHE = 'data-cache-v1';

// Critical resources for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/admin/life-lock',
  '/admin/life-lock/day',
  '/admin/tasks',
  '/admin/analytics',
  '/manifest.webmanifest',
  '/registerSW.js'
];

// Install event - Cache critical resources
self.addEventListener('install', event => {
  console.log('[SW] 🚀 Installing LifeLock Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical app shell
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] 📦 Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Create offline fallback cache
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('[SW] 🔌 Setting up offline fallbacks');
        return cache.put('/offline', new Response(
          createOfflinePage(),
          { headers: { 'Content-Type': 'text/html' } }
        ));
      }),
      
      // Initialize data cache
      caches.open(DATA_CACHE)
    ]).then(() => {
      console.log('[SW] ✅ Installation complete - LifeLock ready for offline use');
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] 🔄 Activating new service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName !== CACHE_NAME && 
            cacheName !== OFFLINE_CACHE && 
            cacheName !== DATA_CACHE
          )
          .map(cacheName => {
            console.log('[SW] 🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] ✅ Cleanup complete - claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Offline-first strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    // API/Database requests - Network First with offline queue
    event.respondWith(handleDataRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    // Static assets - Cache First
    event.respondWith(handleAssetRequest(request));
  } else {
    // Navigation requests - App Shell
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API/Database requests with offline queue
async function handleDataRequest(request) {
  try {
    console.log('[SW] 🌐 Attempting online request:', request.url);
    
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, response.clone());
      console.log('[SW] ✅ Data cached for offline use');
    }
    
    return response;
  } catch (error) {
    console.log('[SW] 🔌 Network failed, checking cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 📦 Serving from cache');
      return cachedResponse;
    }
    
    // If it's a write operation, queue it for later
    if (request.method !== 'GET') {
      await queueOfflineAction(request);
      return new Response(JSON.stringify({ 
        success: true, 
        queued: true,
        message: 'Action queued for sync when online' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return offline indicator for GET requests
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Data not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static asset requests
async function handleAssetRequest(request) {
  // Cache first strategy
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] ❌ Asset failed to load:', request.url);
    return new Response('', { status: 404 });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first for fresh content
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.log('[SW] 🔌 Navigation offline, serving app shell');
  }
  
  // Fallback to cached app shell
  const cachedResponse = await caches.match('/');
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Ultimate fallback - offline page
  return caches.match('/offline');
}

// Queue offline actions for later sync
async function queueOfflineAction(request) {
  const action = {
    id: Date.now(),
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  // Store in IndexedDB or localStorage
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['offline_queue'], 'readwrite');
    await transaction.objectStore('offline_queue').add(action);
    console.log('[SW] 📝 Action queued for sync:', action.url);
  } catch (error) {
    // Fallback to localStorage
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push(action);
    localStorage.setItem('offline_queue', JSON.stringify(queue));
    console.log('[SW] 📝 Action queued in localStorage');
  }
}

// Background sync for queued actions
self.addEventListener('sync', event => {
  if (event.tag === 'lifelock-data-sync') {
    console.log('[SW] 🔄 Background sync triggered');
    event.waitUntil(syncQueuedActions());
  }
});

// Sync queued offline actions
async function syncQueuedActions() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['offline_queue'], 'readonly');
    const queue = await transaction.objectStore('offline_queue').getAll();
    
    console.log(`[SW] 🔄 Syncing ${queue.length} queued actions`);
    
    for (const action of queue) {
      try {
        const request = new Request(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        const response = await fetch(request);
        if (response.ok) {
          // Remove from queue
          const deleteTransaction = db.transaction(['offline_queue'], 'readwrite');
          await deleteTransaction.objectStore('offline_queue').delete(action.id);
          console.log('[SW] ✅ Synced action:', action.url);
        }
      } catch (error) {
        console.log('[SW] ❌ Failed to sync action:', action.url, error);
      }
    }
  } catch (error) {
    console.log('[SW] ❌ Sync failed:', error);
  }
}

// IndexedDB helper
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LifeLockOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline_queue')) {
        const store = db.createObjectStore('offline_queue', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LifeLock - Offline Mode</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
          color: white; margin: 0; padding: 2rem;
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { text-align: center; max-width: 400px; }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { color: #ea384c; margin-bottom: 1rem; }
        p { opacity: 0.8; line-height: 1.6; }
        .btn { 
          background: #ea384c; color: white; border: none; padding: 1rem 2rem;
          border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📴</div>
        <h1>LifeLock Offline Mode</h1>
        <p>You're currently offline, but LifeLock continues to work! Your productivity data is safely stored locally and will sync when you're back online.</p>
        <button class="btn" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;
}

console.log('[SW] 🚀 LifeLock Service Worker loaded - Ready for offline productivity!');