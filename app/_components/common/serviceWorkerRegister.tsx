/**
 * @file serviceWorkerRegister.tsx
 * @description Manages the caching service worker (sw.js).
 *
 * Currently disabled. When enabled, registers /sw.js for offline caching.
 * Always preserves the Firebase messaging service worker.
 */

"use client"

import { useEffect } from "react"

const CACHING_SW_ENABLED = false
const SW_RECOVERY_RELOAD_KEY = "frame:sw-recovery-reloaded"

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (CACHING_SW_ENABLED) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { updateViaCache: "none" })
          .catch(() => {})
      })
    } else {
      const cleanupLegacyServiceWorkers = async () => {
        let hadLegacyController = false

        const activeControllerUrl =
          navigator.serviceWorker.controller?.scriptURL
        if (activeControllerUrl && !activeControllerUrl.includes("firebase")) {
          hadLegacyController = true
        }

        // Clean up stale caching SW registrations (preserve Firebase SW)
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          const url = reg.active?.scriptURL ?? reg.waiting?.scriptURL ?? ""
          if (!url.includes("firebase")) {
            hadLegacyController = true
            await reg.unregister()
          }
        }

        // Clear stale app caches so old chunks don't keep running after deploys.
        if ("caches" in window) {
          const cacheNames = await caches.keys()
          for (const cacheName of cacheNames) {
            if (
              cacheName.startsWith("frame-") ||
              cacheName.startsWith("next-") ||
              cacheName.includes("workbox")
            ) {
              await caches.delete(cacheName)
            }
          }
        }

        if (!hadLegacyController) return

        // One-time reload to fully detach from legacy worker control.
        try {
          const alreadyReloaded =
            sessionStorage.getItem(SW_RECOVERY_RELOAD_KEY) === "1"
          if (!alreadyReloaded) {
            sessionStorage.setItem(SW_RECOVERY_RELOAD_KEY, "1")
            window.location.reload()
            return
          }

          sessionStorage.removeItem(SW_RECOVERY_RELOAD_KEY)
        } catch {
          // Ignore storage errors (private mode / restricted contexts).
        }
      }

      cleanupLegacyServiceWorkers().catch(() => {})
    }
  }, [])

  return null
}
