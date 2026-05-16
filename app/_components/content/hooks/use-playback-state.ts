"use client"

import { useState, useRef, useCallback, useEffect } from "react"

/**
 * Core playback state interface — separates concerns:
 * - Video playback (play/pause/buffering)
 * - Audio state (muted/unmuted)
 * These are controlled independently but kept in sync
 */
export interface PlaybackState {
  isPlaying: boolean
  isMuted: boolean
  isBuffering: boolean
  progress: number
}

interface UsePlaybackStateOptions {
  autoPlay: boolean
  videoUrl: string
  initialMuted: boolean
  onMuteChange?: (muted: boolean) => void
}

/**
 * High-level playback state management.
 * Decoupled from reel-specific retry logic — focuses on state transitions only.
 */
export function usePlaybackState({
  autoPlay,
  videoUrl,
  initialMuted,
  onMuteChange,
}: UsePlaybackStateOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    isMuted: initialMuted,
    isBuffering: false,
    progress: 0,
  })

  // ── Video element ref callback ──
  const setVideoEl = useCallback(
    (el: HTMLVideoElement | null) => {
      const prev = videoRef.current
      if (prev && prev !== el) {
        prev.pause()
        prev.removeAttribute("src")
        while (prev.firstChild) prev.removeChild(prev.firstChild)
        prev.load()
      }

      videoRef.current = el
      if (!el || !videoUrl) return

      // Set video attributes for autoplay policy
      el.muted = initialMuted
      el.setAttribute("muted", "")
      el.setAttribute("playsinline", "")
      el.setAttribute("webkit-playsinline", "true")
      el.setAttribute("x-webkit-airplay", "deny")
      el.disableRemotePlayback = true

      // Set source
      while (el.firstChild) el.removeChild(el.firstChild)
      const source = document.createElement("source")
      source.src = videoUrl
      source.type = "video/mp4"
      el.appendChild(source)
      el.preload = "metadata"
    },
    [videoUrl, initialMuted],
  )

  // ── Playback control: toggle play/pause ──
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return

    if (v.paused) {
      const promise = v.play()
      if (promise) {
        promise
          .then(() => setState((s) => ({ ...s, isPlaying: true })))
          .catch(() => setState((s) => ({ ...s, isPlaying: false })))
      }
    } else {
      v.pause()
      setState((s) => ({ ...s, isPlaying: false }))
    }
  }, [])

  // ── Audio control: toggle mute/unmute ──
  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return

    const newMuted = !state.isMuted
    v.muted = newMuted

    if (newMuted) {
      v.setAttribute("muted", "")
    } else {
      v.removeAttribute("muted")
    }

    setState((s) => ({ ...s, isMuted: newMuted }))
    onMuteChange?.(newMuted)
  }, [state.isMuted, onMuteChange])

  // ── Auto-play on mount/when becoming active reel ──
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    if (autoPlay && v.paused) {
      // Always start muted for autoplay policy compliance
      v.muted = true
      const promise = v.play()
      if (promise) {
        promise
          .then(() => setState((s) => ({ ...s, isPlaying: true })))
          .catch(() => setState((s) => ({ ...s, isPlaying: false })))
      }
    } else if (!autoPlay && !v.paused) {
      v.pause()
      setState((s) => ({ ...s, isPlaying: false }))
    }
  }, [autoPlay])

  // ── Sync muted state when initial preference changes ──
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.muted = initialMuted
    setState((s) => ({ ...s, isMuted: initialMuted }))
  }, [initialMuted])

  // ── Video event listeners ──
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }))
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }))
    const onWaiting = () => setState((s) => ({ ...s, isBuffering: true }))
    const onPlaying = () => setState((s) => ({ ...s, isBuffering: false, isPlaying: true }))
    const onTimeUpdate = () => {
      if (v.duration > 0) {
        setState((s) => ({ ...s, progress: v.currentTime / v.duration }))
      }
    }
    const onEnded = () => {
      setState((s) => ({ ...s, progress: 0 }))
    }

    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("waiting", onWaiting)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("timeupdate", onTimeUpdate)
    v.addEventListener("ended", onEnded)

    return () => {
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("waiting", onWaiting)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("timeupdate", onTimeUpdate)
      v.removeEventListener("ended", onEnded)
    }
  }, [])

  return {
    state,
    setVideoEl,
    togglePlay,
    toggleMute,
    videoRef,
  }
}
