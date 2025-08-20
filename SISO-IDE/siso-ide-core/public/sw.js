// Service Worker for SISO IDE PWA
const CACHE_NAME = 'siso-ide-v1.3';
const STATIC_CACHE = 'siso-static-v1.3';
const DYNAMIC_CACHE = 'siso-dynamic-v1.3';

// Global error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.log('Service worker unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the error from being logged to console
});

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.svg',
  '/favicon.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache each URL individually to avoid failing if one fails
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.log('Failed to cache:', url, err);
              return Promise.resolve(); // Continue even if this URL fails
            })
          )
        );
      })
      .catch(err => {
        console.log('Service worker install failed:', err);
      })
  );
  self.skipWaiting();
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for API requests to avoid authentication issues
  if (url.pathname.includes('/api/') || url.pathname.includes('/auth/')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip caching for WebSocket connections
  if (request.url.includes('ws://') || request.url.includes('wss://')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip caching for localhost backend requests during development
  if (url.hostname === 'localhost' && (url.port === '4001' || url.port === '5001')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first, fallback to network
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      event.respondWith(
        caches.match(request)
          .then(response => {
            if (response) {
              return response;
            }
            return fetch(request).then(fetchResponse => {
              // Only cache successful responses
              if (fetchResponse.ok) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE).then(cache => {
                  cache.put(request, responseClone);
                }).catch(err => console.log('Cache put failed:', err));
              }
              return fetchResponse;
            });
          })
          .catch(err => {
            console.log('Fetch failed for static asset:', request.url, err);
            // Return cached version if network fails
            return caches.match(request).then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a minimal fallback for missing assets
              return new Response('', { status: 404, statusText: 'Not Found' });
            });
          })
      );
    } 
    // HTML pages - network first, fallback to cache
    else {
      event.respondWith(
        fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              }).catch(err => console.log('Dynamic cache put failed:', err));
            }
            return response;
          })
          .catch(err => {
            console.log('Fetch failed for page:', request.url, err);
            // Fallback to cache if network fails
            return caches.match(request).then(response => {
              if (response) {
                return response;
              }
              // If no cache, return offline page or basic fallback
              if (request.destination === 'document') {
                return caches.match('/').then(indexResponse => {
                  if (indexResponse) {
                    return indexResponse;
                  }
                  return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>SISO IDE - Offline</h1><p>Please check your connection.</p></body></html>', {
                    headers: { 'Content-Type': 'text/html' },
                    status: 503
                  });
                });
              }
              return new Response('Service temporarily unavailable', { status: 503 });
            });
          })
      );
    }
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Handle background sync for queued prompts (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'prompt-queue') {
    event.waitUntil(
      // Future: Process queued prompts when connection is restored
      console.log('Background sync triggered for prompt queue')
    );
  }
});

// Handle push notifications (future enhancement for prompt completion)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Prompt processing complete',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'siso-notification',
      actions: [
        {
          action: 'view',
          title: 'View Result'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SISO IDE', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});