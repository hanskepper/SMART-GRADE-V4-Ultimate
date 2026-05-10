var CACHE_NAME = 'smartgrade-v4-' + Date.now();

var ASSETS = [
  '/SMART-GRADE/',
  '/SMART-GRADE/index.html',
  '/SMART-GRADE/login.html',
  '/SMART-GRADE/register.html',
  '/SMART-GRADE/dashboard.html',
  '/SMART-GRADE/add-grade.html',
  '/SMART-GRADE/subjects.html',
  '/SMART-GRADE/subject-detail.html',
  '/SMART-GRADE/term1.html',
  '/SMART-GRADE/term2.html',
  '/SMART-GRADE/term3.html',
  '/SMART-GRADE/yearly.html',
  '/SMART-GRADE/statistics.html',
  '/SMART-GRADE/achievements.html',
  '/SMART-GRADE/settings.html',
  '/SMART-GRADE/guide.html',
  '/SMART-GRADE/about.html',
  '/SMART-GRADE/404.html',
  '/SMART-GRADE/css/style.css',
  '/SMART-GRADE/js/utils.js',
  '/SMART-GRADE/js/database.js',
  '/SMART-GRADE/js/auth.js',
  '/SMART-GRADE/js/app.js',
  '/SMART-GRADE/js/pwa.js',
  '/SMART-GRADE/manifest.json',
  '/SMART-GRADE/icon.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) { console.log('Cache:', err); });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetched = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        if (event.request.mode === 'navigate') return caches.match('/SMART-GRADE/index.html');
        return cached;
      });
      return cached || fetched;
    })
  );
});

/* PUSH NOTIFICATIONS (#11) */
self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : { title: 'SMART GRADE', body: 'Check your grades!' };
  var options = {
    body: data.body || 'Update available',
    icon: '/SMART-GRADE/icon.svg',
    badge: '/SMART-GRADE/icon.svg',
    vibrate: [200, 100, 200],
    data: { url: '/SMART-GRADE/dashboard.html' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/SMART-GRADE/dashboard.html'));
});