const CACHE_NAME = "frame-v4"
const urlsToCache = [
  "/",
  "/images/frameIconDark.png",
  "/images/frameIconLight.png",
  "/icon.svg",
  // Add other critical resources
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline, but skip API requests
self.addEventListener("fetch", (event) => {
  // Skip caching for API requests
  if (
    event.request.url.includes("/v1/") ||
    event.request.url.includes("192.168.100.11:3000")
  ) {
    return // Let the request go through normally
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
