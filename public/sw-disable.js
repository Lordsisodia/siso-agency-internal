// Disable service worker completely
self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete all caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Don't cache anything - pass through all requests with error handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch((error) => {
      // Silently fail for now - don't throw unhandled promise rejections
      console.warn('SW: Fetch failed for', event.request.url, error);
      // Return a basic response for failed requests
      return new Response('Service Worker: Network Error', {
        status: 408,
        statusText: 'Request Timeout'
      });
    })
  );
});