// Service Worker — アプリシェルのオフラインキャッシュ
const CACHE = 'palate-atlas-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js', './js/db.js', './js/ui.js', './js/wheel.js', './js/ai.js', './js/export.js', './js/sync.js',
  './js/views/home.js', './js/views/list.js', './js/views/editor.js',
  './js/views/detail.js', './js/views/settings.js', './js/views/search.js', './js/views/login.js',
  './data/categories.js', './data/wine.js', './data/whisky.js', './data/coffee.js',
  './data/brandy.js', './data/sake.js', './data/cascalate.js', './data/sync-config.js',
  './icons/icon.svg', './icons/icon-180.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API呼び出しなど外部リクエストはキャッシュしない
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // ネットワーク優先(更新を反映)、失敗時キャッシュ
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
