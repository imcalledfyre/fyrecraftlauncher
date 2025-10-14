// sw.js - Caches assets except HTML
const CACHE_NAME = 'fyrex-cache-v4';
const FILE_TYPES = [
  '.js', '.data', '.wasm', '.json',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.mp3', '.ogg', '.wav', '.m4a',
  '.zip', '.rar', '.7z'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip HTML files
  if (req.headers.get('accept')?.includes('text/html')) return;

  // Check if file should be cached
  const isCacheable = FILE_TYPES.some(type => url.pathname.endsWith(type));
  if (!isCacheable) return;

  // Handle caching
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        console.log('[SW] Serving from cache:', url.pathname);
        return cached;
      }

      console.log('[SW] Fetching and caching:', url.pathname);
      return fetch(req)
        .then((networkResp) => {
          if (!networkResp || !networkResp.ok) return networkResp;
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
          return networkResp;
        })
        .catch((err) => {
          console.warn('[SW] Fetch failed for', url.pathname, err);
          throw err;
        });
    })
  );
});
