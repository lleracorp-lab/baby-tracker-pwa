self.addEventListener('install', e => {
  e.waitUntil(caches.open('bt-v1').then(c => c.addAll(['./','./index.html','./manifest.json'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
