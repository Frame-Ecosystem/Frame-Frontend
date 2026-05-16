/*
 * Legacy caching service worker kill switch.
 *
 * We intentionally do NOT cache app shell/chunks anymore because stale caches
 * can break installed PWA sessions after deployments (blank/black screens).
 */

const CACHE_PREFIXES_TO_CLEAR = ["frame-", "next-", "workbox"]

self.addEventListener("install", () => {
  // Activate immediately so old clients can recover on next launch.
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((name) =>
            CACHE_PREFIXES_TO_CLEAR.some((prefix) => name.startsWith(prefix)),
          )
          .map((name) => caches.delete(name)),
      )

      // Stop controlling pages with this legacy worker.
      await self.registration.unregister()

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })

      // Ask open tabs/PWA windows to reload without stale worker control.
      await Promise.all(clients.map((client) => client.navigate(client.url)))
    })(),
  )
})
