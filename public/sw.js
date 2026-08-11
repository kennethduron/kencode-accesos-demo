const BRAND_CACHE = "ken-code-access-brand-v1";
const BRAND_ASSETS = [
  "/brand/ken-code-logo.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(BRAND_CACHE).then((cache) => cache.addAll(BRAND_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("ken-code-access-") && key !== BRAND_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isBrandAsset = url.origin === self.location.origin
    && event.request.method === "GET"
    && (url.pathname.startsWith("/brand/") || url.pathname.startsWith("/icons/"));

  if (!isBrandAsset) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
