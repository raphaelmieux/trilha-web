const CACHE_NAME = 'trilha-web-v1';
// Resolved relative to this script's own URL so the cache list is correct whether
// the app is served from the domain root or a GitHub Pages subpath (/trilha-web/).
const SCOPE = new URL('.', self.location).href;
const STATIC_ASSETS = ['', 'index.html', 'manifest.json', 'icon-192.svg', 'icon-512.svg'].map(
  (path) => new URL(path, SCOPE).href
);
const INDEX_URL = new URL('index.html', SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.status === 200 && url.pathname.match(/\.(js|css|svg|png|jpg|ico|json)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(INDEX_URL);
        }
      });
    })
  );
});
