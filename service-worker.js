const CACHE_NAME = 'site-cache-v1';
const CACHE_URLS = [
  '/styles.css',
  '/script.js',
  '/games.json',
  '/background.png',
  // Add other static files here, but NOT /index.html
];

// check for updates button (resets cache)
self.addEventListener('message', event => {
  if (event.data === 'rebuild-cache') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(name => caches.delete(name));
    }).then(() => {
      // Optional: precache again
      self.skipWaiting();
    });
  }
});


// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event
self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  // Don't cache or intercept root index.html
  if (requestURL.pathname === '/' || requestURL.pathname === '/index.html') {
    return; // Let browser handle it as usual
  }

  // For all other files, try cache first, then fallback to network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      return new Response('Offline');
    })
  );
});
