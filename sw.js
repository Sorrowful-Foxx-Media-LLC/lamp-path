// Lamp & Path: keeps the app working offline.
// Bump VERSION whenever you change any file, so installed copies pick up the update.
const VERSION = "lamp-path-v1";
const FILES = [
  "./",
  "index.html",
  "privacy.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "fonts/CrimsonText-Regular.ttf",
  "fonts/CrimsonText-Italic.ttf",
  "fonts/CrimsonText-SemiBold.ttf",
  "fonts/SourceSans3.ttf"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Pages: try the network first so updates show up, fall back to the saved copy offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }
  // Everything else (fonts, icons): saved copy first.
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});
