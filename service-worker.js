const CACHE_NAME = 'site-cache-v1';

self.addEventListener('install', (event) => {
  // Just activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients right away
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if it exists
      if (cachedResponse) return cachedResponse;

      // Otherwise, fetch from network and cache it
      return fetch(request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch((err) => {
        // Optional: fallback offline page or image
        return caches.match('/offline.html');
      });
    })
  );
});
