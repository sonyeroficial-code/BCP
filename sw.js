const CACHE_NAME = 'bcp-app-offline-v5-instalar-pwa';
const ASSETS = [
  './', './index.html', './manifest.json', './manifest.webmanifest', './sw.js',
  './icon-120.png', './icon-152.png', './icon-167.png', './icon-180.png',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './logo_original.png',
  './assets/images/asset_016.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(
      ASSETS.map(url => cache.add(new Request(url, {cache: 'reload'})).catch(() => null))
    ))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
