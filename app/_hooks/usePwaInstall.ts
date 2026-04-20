/**
 * @file usePwaInstall.ts
 * @description Global hook for PWA "Add to Home Screen" install flow.
 *
 * Platform behavior:
 *   - **Android / Desktop Chrome/Edge**: Captures `beforeinstallprompt` and
 *     triggers the native install dialog when the user confirms.
 *   - **iOS Safari**: No native prompt exists — shows manual instructions
 *     (Share → Add to Home Screen) since iOS doesn't support the Install API.
 *   - **Already installed / standalone**: Hook stays silent.
 *
 * Persistence:
 *   - Dismissed prompts respect a 3-day cooldown (localStorage timestamp).
 *   - Accepted installs are recorded so the prompt never reappears.
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// ── Types ────────────────────────────────────────────────────

export type PwaPlatform = "android" | "ios" | "desktop" | null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export interface UsePwaInstallReturn {
  /** Whether the install prompt should be shown */
  canPrompt: boolean
  /** Detected platform */
  platform: PwaPlatform
  /** Trigger native install (Android/Desktop) — no-op on iOS */
  install: () => Promise<boolean>
  /** Dismiss the prompt (stores cooldown timestamp) */
  dismiss: () => void
  /** True while the native install dialog is open */
  installing: boolean
}

// ── Constants ────────────────────────────────────────────────

const DISMISSED_KEY = "frame_pwa_install_dismissed"
const INSTALLED_KEY = "frame_pwa_installed"
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const SHOW_DELAY_MS = 3_000 // wait 3s after auth before showing

// ── Helpers ──────────────────────────────────────────────────

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  )
}

function detectPlatform(): PwaPlatform {
  if (typeof navigator === "undefined") return null

  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "desktop"
}

function isInCooldown(): boolean {
  const dismissed = localStorage.getItem(DISMISSED_KEY)
  if (!dismissed) return false
  return Date.now() - Number(dismissed) < DISMISS_COOLDOWN_MS
}

function wasInstalled(): boolean {
  return localStorage.getItem(INSTALLED_KEY) === "true"
}

// ── Hook ─────────────────────────────────────────────────────

export function usePwaInstall(): UsePwaInstallReturn {
  const [canPrompt, setCanPrompt] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [platform, setPlatform] = useState<PwaPlatform>(null)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already running as PWA or previously installed — bail out
    if (isStandalone() || wasInstalled()) return

    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)

    // Don't show if user dismissed recently
    if (isInCooldown()) return

    // For iOS there's no beforeinstallprompt — show instructions after delay
    if (detectedPlatform === "ios") {
      const timer = setTimeout(() => setCanPrompt(true), SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }

    // For Android / Desktop — capture the native prompt event
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      // Delay showing so we don't overwhelm on login
      setTimeout(() => setCanPrompt(true), SHOW_DELAY_MS)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Detect if the user installs via the browser's native UI (not our prompt)
    const installedHandler = () => {
      localStorage.setItem(INSTALLED_KEY, "true")
      setCanPrompt(false)
      deferredPromptRef.current = null
    }
    window.addEventListener("appinstalled", installedHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPromptRef.current
    if (!prompt) return false

    setInstalling(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice

      if (outcome === "accepted") {
        localStorage.setItem(INSTALLED_KEY, "true")
        setCanPrompt(false)
        deferredPromptRef.current = null
        return true
      }

      // User dismissed the native dialog — start cooldown
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
      setCanPrompt(false)
      return false
    } finally {
      setInstalling(false)
    }
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setCanPrompt(false)
  }, [])

  return { canPrompt, platform, install, dismiss, installing }
}
