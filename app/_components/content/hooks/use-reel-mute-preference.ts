"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "reels:muted"

/** Read persisted preference. Defaults to muted (required for autoplay). */
function readStored(): boolean {
  if (typeof window === "undefined") return true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return true
    return raw === "1"
  } catch {
    return true
  }
}

function writeStored(muted: boolean) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0")
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * Manages the user's reel mute preference across the session.
 *
 * - Starts muted (required for browser autoplay policies).
 * - Persists the preference in localStorage so subsequent reels and visits
 *   honour the user's choice without requiring another tap.
 * - When `autoUnmuteOnInteraction` is true, the first user gesture
 *   (touch/click/key/wheel) automatically unmutes — the gesture itself
 *   satisfies browser audio-autoplay requirements.
 */
export function useReelMutePreference(
  opts: {
    autoUnmuteOnInteraction?: boolean
  } = {},
) {
  const { autoUnmuteOnInteraction = true } = opts
  const [muted, setMutedState] = useState<boolean>(true)

  // Hydrate from storage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMutedState(readStored()) // eslint-disable-line react-hooks/set-state-in-effect -- hydrate from storage on mount
  }, [])

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next)
    writeStored(next)
  }, [])

  // Auto-unmute on first user interaction (browser autoplay-with-sound requires a gesture)
  useEffect(() => {
    if (!autoUnmuteOnInteraction) return
    if (!muted) return

    const unmute = () => setMuted(false)
    const opts = { capture: true, once: true } as const

    window.addEventListener("touchstart", unmute, opts)
    window.addEventListener("pointerdown", unmute, opts)
    window.addEventListener("keydown", unmute, opts)
    window.addEventListener("wheel", unmute, opts)

    return () => {
      window.removeEventListener("touchstart", unmute, true)
      window.removeEventListener("pointerdown", unmute, true)
      window.removeEventListener("keydown", unmute, true)
      window.removeEventListener("wheel", unmute, true)
    }
  }, [autoUnmuteOnInteraction, muted, setMuted])

  return [muted, setMuted] as const
}
