// Bumping this name is what evicts the previous deploy's cache on activate.
const CACHE_NAME = 'trilha-web-v2';

// Resolved relative to this script's own URL so the cache list is correct whether
// the app is served from the domain root or a GitHub Pages subpath (/trilha-web/).
const SCOPE = new URL('.', self.location).href;
const INDEX_URL = new URL('index.html', SCOPE).href;
const OFFLINE_ASSETS = ['manifest.json', 'icon-192.svg', 'icon-512.svg'].map(
  (path) => new URL(path, SCOPE).href
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([INDEX_URL, ...OFFLINE_ASSETS]))
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

/**
 * index.html must never be served cache-first.
 *
 * Vite emits hashed asset filenames, so every deploy produces a new
 * index-<hash>.js. A cached index.html therefore points at bundles that no
 * longer exist on the server, and the app boots into a blank white page for
 * anyone who had visited before — which is exactly what happened with v1 of
 * this worker. HTML goes network-first (falling back to cache only when
 * genuinely offline); hashed assets are immutable by construction, so those
 * stay cache-first.
 */
function isHtmlRequest(request, url) {
  return request.mode === 'navigate'
    || request.destination === 'document'
    || url.pathname.endsWith('.html')
    || url.pathname === new URL(SCOPE).pathname;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (isHtmlRequest(request, url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(INDEX_URL, clone));
          }
          return response;
        })
        .catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.status === 200 && url.pathname.match(/\.(js|css|svg|png|jpg|ico|json|woff2?)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
