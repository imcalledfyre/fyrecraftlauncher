// sw.js - Caches game assets but NOT HTML
const CACHE_NAME = 'fyrex-cache-v3';
const FILE_TYPES = [
  '.js', '.data', '.wasm', '.json',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.mp3', '.ogg', '.wav', '.m4a',
  '.zip', '.rar', '.7z'
];

// Install event - pre-cache nothing (optional if you want to add stuff later)
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch event - cache everything except HTML
self.addEventListener('fetch', event => {
  const req = event.request;

  // Skip if it's not a GET request
  if (req.method !== 'GET') return;

  // Skip if it's HTML (prevent caching main pages)
  if (req.headers.get('accept')?.includes('text/html')) return;

  // Check file extension
  const url = new URL(req.url);
  const isCacheable = FILE_TYPES.some(type => url.pathname.endsWith(type));
  if (!isCacheable) return;

  // Try cache first, then network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkResp => {
        if (!networkResp || !networkResp.ok) return networkResp;
        const respClone = networkResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, respClone));
        return networkResp;
      });
    })
  );
});

// Optional: Push notification handler (from your old script)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FyreX Notification';
  const options = {
    body: data.body || '',
    icon: './favicon.ico',
    badge: './favicon.ico'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
