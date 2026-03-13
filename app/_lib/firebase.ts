/**
 * @file firebase.ts
 * @description Firebase app initialisation and FCM messaging helpers.
 *
 * SSR-safe — messaging is only initialised in the browser.
 * All env vars are prefixed NEXT_PUBLIC_FIREBASE_*.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging"

// ── Configuration ────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

function isConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  )
}

// ── Singletons ───────────────────────────────────────────────

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

function getApp(): FirebaseApp | null {
  if (!isConfigured()) return null
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  }
  return app
}

/** Browser-only Messaging singleton. Returns `null` when unavailable. */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null
  if (!("Notification" in window)) return null
  if (!("serviceWorker" in navigator)) return null
  if (!isConfigured()) return null

  if (!messaging) {
    const firebaseApp = getApp()
    if (!firebaseApp) return null

    try {
      messaging = getMessaging(firebaseApp)
    } catch (err) {
      console.error("[Firebase] Failed to initialise messaging:", err)
      return null
    }
  }
  return messaging
}

// ── FCM Token ────────────────────────────────────────────────

const SW_PATH = "/firebase-messaging-sw.js"
const SW_SCOPE = "/"
const RETRY_DELAY_MS = 3_000
const MAX_RETRIES = 2

/**
 * Singleton promise to prevent concurrent token requests.
 * Multiple callers await the same in-flight request.
 */
let tokenPromise: Promise<string | null> | null = null

/** Tracks consecutive failures to apply back-off. */
let consecutiveFailures = 0

/**
 * Register the messaging service worker, wait for it to activate,
 * and return the current FCM registration token.
 *
 * Resilient against:
 *  - Concurrent calls (coalesced into one in-flight request)
 *  - AbortError / push-service errors (retried with back-off)
 *  - Stale subscriptions (cleared and retried once)
 *
 * Always resolves — never rejects. Returns `null` on any failure.
 */
export function requestFCMToken(): Promise<string | null> {
  if (tokenPromise) return tokenPromise

  tokenPromise = _doRequestFCMToken().finally(() => {
    tokenPromise = null
  })

  return tokenPromise
}

/** Small helper: true for transient push-service / network errors. */
function isTransientPushError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true
  const msg = err instanceof Error ? err.message : String(err)
  return /push service|network|fetch|timeout/i.test(msg)
}

/** Delay helper that resolves after `ms` milliseconds. */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function _doRequestFCMToken(): Promise<string | null> {
  const msg = getFirebaseMessaging()
  if (!msg || !VAPID_KEY) return null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Re-use an existing SW registration when available
      const registration =
        (await navigator.serviceWorker.getRegistration(SW_SCOPE)) ??
        (await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE }))

      await navigator.serviceWorker.ready

      const tokenOpts = {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      }

      try {
        const token = (await getToken(msg, tokenOpts)) ?? null
        consecutiveFailures = 0 // reset on success
        return token
      } catch (innerErr) {
        // Stale subscription — clear and retry within the same attempt
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          const token = (await getToken(msg, tokenOpts)) ?? null
          consecutiveFailures = 0
          return token
        }
        throw innerErr
      }
    } catch (err) {
      consecutiveFailures++

      // Only retry transient errors — anything else is terminal
      if (!isTransientPushError(err) || attempt === MAX_RETRIES) {
        if (consecutiveFailures <= 3) {
          // Log sparingly — avoid console spam
          console.warn("[Firebase] Push registration failed:", err)
        }
        return null
      }

      // Back-off before retrying (exponential: 3s, 6s)
      await delay(RETRY_DELAY_MS * (attempt + 1))
    }
  }

  return null
}

// ── Foreground listener ──────────────────────────────────────

/** Subscribe to foreground messages. Returns an unsubscribe function. */
export function onForegroundMessage(
  // eslint-disable-next-line no-unused-vars
  callback: (payload: MessagePayload) => void,
): () => void {
  const msg = getFirebaseMessaging()
  if (!msg) return () => {}
  return onMessage(msg, callback)
}
