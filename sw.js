const CACHE_PREFIX = "web-store-app-shell";
const CACHE_NAME = `${CACHE_PREFIX}-v10`;
const APP_BASE = new URL("./", self.location.href).pathname;
const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}store-icon.svg`,
  `${APP_BASE}assets/index-full.js`,
  `${APP_BASE}assets/index-mobile.css`,
  `${APP_BASE}assets/store-apps-full.js`,
  `${APP_BASE}icons/ide-konten-192.png`,
  `${APP_BASE}icons/ai-key-hub-192.png`,
  `${APP_BASE}icons/fattah-chat-192.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_BASE)) return;
  if (url.pathname.includes("/api/") || url.pathname.startsWith("/__")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(`${APP_BASE}index.html`, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(`${APP_BASE}index.html`)) || caches.match(APP_BASE))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
