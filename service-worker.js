/* SaberPro Service Worker - PWA Support */
const CACHE_NAME = 'saberpro-v4.1';
const ASSETS = [
  './index.html',
  './css/user.css',
  './js/device.js',
  './js/registry.js',
  './js/transfer.js',
  './js/user.js',
  './data/questions.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    clients.claim().then(() =>
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    )
  );
});
