const CACHE_NAME = 'siso-agency-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Skip requests from extensions
  if (url.href.includes('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          console.log('[SW] Serving from cache:', request.url);
          return response;
        }

        console.log('[SW] Fetching:', request.url);
        return fetch(request)
          .then(response => {
            // Don't cache non-2xx responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache successful responses
                cache.put(request, responseToCache);
              });

            return response;
          });
      })
      .catch(error => {
        console.error('[SW] Fetch failed:', error);
        // You could return a custom offline page here
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Implement background sync logic here
  console.log('[SW] Syncing tasks...');
}