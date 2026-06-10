const STATIC_CACHE = 'recipeverse-static-v5';
const API_CACHE    = 'recipeverse-api-v5';
const IMAGE_CACHE  = 'recipeverse-images-v5';

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

const CURRENT_CACHES = new Set([STATIC_CACHE, API_CACHE, IMAGE_CACHE]);

// Hostnames whose images we cache (recipe artwork from the API).
const CACHED_IMAGE_HOSTS = new Set([
    'img.spoonacular.com',
    'spoonacular.com',
]);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys.filter((key) => !CURRENT_CACHES.has(key)).map((key) => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

// --- Stale-While-Revalidate ---
// 1. Open the right cache.
// 2. Kick off a network fetch in the background; on success, write the fresh
//    copy to the cache (so the NEXT request gets it).
// 3. If we have a cached copy, return it IMMEDIATELY — the UI renders without
//    waiting for the network. The cache update happens silently in the background.
// 4. If not cached, await the network result.
// 5. If both fail, throw — the caller decides how to surface the error.
async function staleWhileRevalidate(event, cacheName) {
    const { request } = event;
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkPromise = fetch(request)
        .then((response) => {
            if (response && (response.ok || response.type === 'opaque')) {
                cache.put(request, response.clone()).catch(() => {});
            }
            return response;
        })
        .catch(() => null);

    if (cached) {
        // Keep the SW alive until the background refresh finishes writing.
        event.waitUntil(networkPromise);
        return cached;
    }

    const network = await networkPromise;
    if (network) return network;
    throw new Error('SWR: cache miss and network failed');
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // 1) API JSON (recipe details, search, random) — SWR.
    if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
        event.respondWith(staleWhileRevalidate(event, API_CACHE));
        return;
    }

    // 2) Recipe images from Spoonacular CDN — SWR.
    if (request.destination === 'image' && CACHED_IMAGE_HOSTS.has(url.hostname)) {
        event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE));
        return;
    }

    // 3) Same-origin images — SWR.
    if (request.destination === 'image' && url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(event, IMAGE_CACHE));
        return;
    }

    // 4) Static assets — cache-first (precached on install; rarely change).
    event.respondWith((async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
            return await fetch(request);
        } catch (err) {
            if (request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
            throw err;
        }
    })());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
