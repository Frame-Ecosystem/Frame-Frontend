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

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (CACHING_SW_ENABLED) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {})
      })
    } else {
      // Clean up stale caching SW registrations (preserve Firebase SW)
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          const url = reg.active?.scriptURL ?? ""
          if (url.includes("/sw.js") && !url.includes("firebase")) {
            reg.unregister()
          }
        }
      })
    }
  }, [])

  return null
}
