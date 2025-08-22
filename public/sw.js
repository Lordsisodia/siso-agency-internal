// TEMPORARILY DISABLED - Service worker causing MIME type issues
console.log('[SW] Service worker disabled to fix MIME type caching issues');

const CACHE_NAME = 'siso-internal-disabled';
const urlsToCache = []; // Disabled caching

// Install event - clear all caches instead of creating new ones
self.addEventListener('install', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All caches cleared, skipping waiting');
      return self.skipWaiting();
    })
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

// Fetch event - DISABLED to fix MIME type issues
self.addEventListener('fetch', event => {
  // Let browser handle all requests normally - no caching
  return;
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