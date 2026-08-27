const CACHE_NAME = "brava-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Shell files are cached; everything else (API calls) goes straight to the network.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some((file) =>
    url.pathname.endsWith(file.replace("./", "/"))
  );

  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
