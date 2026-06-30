// public/sw.js
const CACHE_NAME = 'childcare-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
];

// Install: Cache essential assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for app assets and API caching
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Cache API requests for offline reads (stale-while-revalidate pattern)
  if (url.pathname === '/api/proxy' && e.request.method === 'POST') {
    // We clone the request because POST request bodies can only be read once.
    // However, Service Worker cache usually stores GET requests.
    // For POST APIs in offline-first SaaS, we can capture the response and save it
    // under a custom key or let Zustand store's IndexedDB cache take care of DB data.
    // So for POST /api/proxy, we let it hit the network, and Zustand will handle IndexedDB fallback.
    return;
  }

  // Handle standard GET requests (assets, images, scripts)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          e.request.method === 'GET'
        ) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log('SW fetch failed (running offline):', err);
        return cachedResponse; // Return cached response on failure
      });

      return cachedResponse || fetchPromise;
    })
  );
});
