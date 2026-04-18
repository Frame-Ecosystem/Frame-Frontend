/**
 * @file push-notification-prompt.tsx
 * @description Non-intrusive banner prompting the user to enable push
 * notifications. Only shown when permission is still "default".
 * Dismissing stores a timestamp so the banner reappears after 1 day.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "../ui/button"

// ── Constants ────────────────────────────────────────────────

const DISMISSED_KEY = "frame_push_prompt_dismissed"
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 1 day
const SHOW_DELAY_MS = 2_000

// ── Component ────────────────────────────────────────────────

interface Props {
  onEnable: () => Promise<void>
}

export default function PushNotificationPrompt({ onEnable }: Props) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "default") return

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_COOLDOWN_MS) {
      return
    }

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleEnable = useCallback(async () => {
    setLoading(true)
    try {
      await onEnable()
    } finally {
      setLoading(false)
      setVisible(false)
    }
  }, [onEnable])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      className="animate-in slide-in-from-top-4 fade-in bg-card fixed top-4 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border p-4 shadow-lg"
      role="alert"
    >
      <button
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded-full p-1 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Bell className="text-primary h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm leading-tight font-medium">
            Stay updated on your bookings
          </p>
          <p className="text-muted-foreground text-xs">
            Get notified about booking confirmations, queue updates, and
            reminders — even when you&apos;re not on the app.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleEnable} disabled={loading}>
              {loading ? "Enabling…" : "Enable notifications"}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
