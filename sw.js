// Cache-first service worker.
// IMPORTANT: bump CACHE_VERSION on every deploy. Without that the PWA serves
// stale data forever.
const CACHE_VERSION = "v4";
const CACHE_NAME = "mtr-exit-map-" + CACHE_VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./data.json",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) =>
      // Use individual adds so a single missing icon doesn't fail the whole install.
      Promise.all(
        ASSETS.map((url) =>
          c.add(url).catch(() => {
            /* missing asset is fine */
          }),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
