"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseReelPlaybackOptions {
  autoPlay: boolean
  initialMuted: boolean
  onMuteChange?: (_muted: boolean) => void
}

/**
 * Manages video playback lifecycle — play/pause, mute, buffering state,
 * iOS 16 retry logic, and synchronous play() calls for mobile gesture
 * policy compliance.
 */
export function useReelPlayback({
  autoPlay,
  initialMuted,
  onMuteChange,
}: UseReelPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(initialMuted)
  const [isBuffering, setIsBuffering] = useState(false)

  // Ref callback — set DOM properties React doesn't handle well
  const setVideoEl = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el
      if (el) {
        el.muted = initialMuted
        el.setAttribute("webkit-playsinline", "true")
      }
    },
    [initialMuted],
  )

  // Sync muted when parent changes (reel switch)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = initialMuted
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMuted(initialMuted)
  }, [initialMuted])

  // Play / pause based on active state.
  // iOS 16: canplay may never fire and play() may reject on first attempt
  // even for muted+playsinline. We retry with backoff.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    if (!autoPlay) {
      v.pause()
      v.currentTime = 0
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false)
      return
    }

    v.muted = initialMuted
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const tryPlay = () => {
      if (cancelled) return
      v.play()
        .then(() => {
          if (!cancelled) setIsPlaying(true)
        })
        .catch(() => {
          if (cancelled) return
          retryTimer = setTimeout(() => {
            if (cancelled) return
            v.play()
              .then(() => {
                if (!cancelled) setIsPlaying(true)
              })
              .catch(() => {
                if (!cancelled) setIsPlaying(false)
              })
          }, 150)
        })
    }

    if (v.readyState >= 2) {
      tryPlay()
    } else {
      const onReady = () => {
        v.removeEventListener("loadeddata", onReady)
        v.removeEventListener("canplay", onReady)
        tryPlay()
      }
      v.addEventListener("loadeddata", onReady, { once: true })
      v.addEventListener("canplay", onReady, { once: true })

      if (v.readyState === 0) v.load()

      return () => {
        cancelled = true
        if (retryTimer) clearTimeout(retryTimer)
        v.removeEventListener("loadeddata", onReady)
        v.removeEventListener("canplay", onReady)
      }
    }

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [autoPlay, initialMuted])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      setIsPlaying(true)
      if (v.readyState === 0) v.load()
      const p = v.play()
      if (p) p.catch(() => setIsPlaying(false))
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
    onMuteChange?.(v.muted)
  }, [onMuteChange])

  return {
    videoRef,
    setVideoEl,
    isPlaying,
    isMuted,
    isBuffering,
    setIsBuffering,
    setIsPlaying,
    togglePlay,
    toggleMute,
  }
}
