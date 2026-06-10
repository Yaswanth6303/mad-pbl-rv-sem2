const CACHE_NAME = 'recipeverse-v4';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/search.js',
    '/js/detail.js',
    '/js/favorites.js',
    '/js/planner.js',
    '/js/grocery.js',
    '/js/download.js',
    '/js/speech.js',
    '/js/charts.js',
    '/js/map.js',
    '/js/indexeddb.js',
    '/js/utilities.js',
    '/assets/icons/logo_192.png',
    '/assets/icons/logo_512.png',
    '/assets/icons/maskable_icon.png',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never intercept API calls — let the browser hit the server directly.
    // Avoids stale-cache bugs where a previously-cached error response masks a working API.
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open('image-cache').then((cache) => {
                return cache.match(event.request).then((cachedRes) => {
                    const fetchedRes = fetch(event.request).then((networkRes) => {
                        cache.put(event.request, networkRes.clone());
                        return networkRes;
                    });
                    return cachedRes || fetchedRes;
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
