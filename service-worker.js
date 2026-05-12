// Service worker: cache app shell for offline support and serve cached
// recipe images/API responses with a stale-while-revalidate strategy.
const CACHE_NAME = "recipe-hub-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./html/detail.html",
  "./html/favorites.html",
  "./css/styles.css",
  "./js/api.js",
  "./js/storage.js",
  "./js/app.js",
  "./js/detail.js",
  "./js/favorites.js",
  "./js/sw-register.js",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Stale-while-revalidate for TheMealDB API + images.
  if (url.hostname.includes("themealdb.com")) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Cache-first for app shell + same-origin assets.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}
