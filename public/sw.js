const BRAND_CACHE = "ecoterra-access-brand-v1";
const BRAND_ASSETS = [
  "/brand/ken-code-logo-transparent.png",
  "/favicon.ico",
  "/icons/icon-32x32.png",
  "/icons/icon-48x48.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/social/ecoterra-access-demo-og-v1.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(BRAND_CACHE).then((cache) => cache.addAll(BRAND_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => (key.startsWith("ken-code-access-") || key.startsWith("ecoterra-access-")) && key !== BRAND_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isBrandAsset = url.origin === self.location.origin
    && event.request.method === "GET"
    && (url.pathname.startsWith("/brand/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/social/") || url.pathname === "/favicon.ico");

  if (!isBrandAsset) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
