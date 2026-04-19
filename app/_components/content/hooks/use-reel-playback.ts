"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseReelPlaybackOptions {
  autoPlay: boolean
  videoUrl: string
  initialMuted: boolean
  onMuteChange?: (_muted: boolean) => void
}

/* ── iOS detection (runs once at module level) ── */
const IS_IOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent)

/** Track first user interaction for iOS autoplay retry. */
let userHasInteracted = false
const pendingRetries = new Set<() => void>()

if (typeof window !== "undefined") {
  const markInteracted = () => {
    userHasInteracted = true
    for (const fn of pendingRetries) fn()
    pendingRetries.clear()
    window.removeEventListener("touchstart", markInteracted, true)
    window.removeEventListener("click", markInteracted, true)
  }
  window.addEventListener("touchstart", markInteracted, { capture: true })
  window.addEventListener("click", markInteracted, { capture: true })
}

/** Retry delays (ms) for play() attempts. */
const RETRY_DELAYS = IS_IOS ? [50, 200, 600, 1500, 3000] : [100, 400]

/** Release the hardware video decoder held by a <video> element. */
function releaseDecoder(v: HTMLVideoElement) {
  v.pause()
  v.removeAttribute("src")
  // Also remove any <source> children we may have added
  while (v.firstChild) v.removeChild(v.firstChild)
  v.load() // triggers an abort that frees the decoder
}

/** Set video source via <source type="video/mp4"> so Safari knows the MIME type. */
function setSourceWithType(v: HTMLVideoElement, url: string) {
  // Remove any previous <source> children
  while (v.firstChild) v.removeChild(v.firstChild)
  v.removeAttribute("src")

  const source = document.createElement("source")
  source.src = url
  source.type = "video/mp4"
  v.appendChild(source)
}

/** Fetch video as blob with explicit video/mp4 type (fallback for Content-Type mismatch). */
async function fetchBlobUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  const blob = new Blob([buf], { type: "video/mp4" })
  return URL.createObjectURL(blob)
}

/** Manages video playback lifecycle with iOS Safari compatibility. */
export function useReelPlayback({
  autoPlay,
  videoUrl,
  initialMuted,
  onMuteChange,
}: UseReelPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(initialMuted)
  const [isBuffering, setIsBuffering] = useState(false)

  /* ── Ref callback — configure DOM, set src, release old decoders ── */
  const setVideoEl = useCallback(
    (el: HTMLVideoElement | null) => {
      const prev = videoRef.current
      if (prev && prev !== el) releaseDecoder(prev)

      videoRef.current = el
      if (!el) return

      // Set playback-policy attributes before src (iOS requires this order)
      el.muted = true
      el.setAttribute("muted", "")
      el.setAttribute("playsinline", "")
      el.setAttribute("webkit-playsinline", "true")
      el.setAttribute("x-webkit-airplay", "deny")
      el.disableRemotePlayback = true

      if (videoUrl) {
        setSourceWithType(el, videoUrl)
        el.preload = "metadata"
      }
    },
    [videoUrl],
  )

  /* ── Sync muted state when parent toggles (reel switch) ── */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = initialMuted
    if (initialMuted) {
      v.setAttribute("muted", "")
    } else {
      v.removeAttribute("muted")
    }
    setIsMuted(initialMuted) // eslint-disable-line react-hooks/set-state-in-effect -- syncing local state from prop
  }, [initialMuted])

  /* ── Auto-play / auto-pause with iOS 16 retry logic ── */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    if (!autoPlay) {
      v.pause()
      v.currentTime = 0
      setIsPlaying(false) // eslint-disable-line react-hooks/set-state-in-effect -- pausing resets play state
      return
    }

    // Force muted for autoplay (iOS blocks unmuted programmatic play)
    v.muted = true
    v.setAttribute("muted", "")

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null
    const listeners: Array<[string, EventListener]> = []

    const clearTimers = () => {
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
        fallbackTimer = null
      }
    }

    const removeListeners = () => {
      for (const [evt, fn] of listeners) v.removeEventListener(evt, fn)
      listeners.length = 0
    }

    /**
     * Attempt video.play() with retries.
     */
    const tryPlay = (attempt = 0): void => {
      if (cancelled) return

      if (v.error) {
        setIsPlaying(false)
        return
      }

      v.muted = true
      v.setAttribute("muted", "")

      const promise = v.play()
      if (promise) {
        promise
          .then(() => {
            if (cancelled) return
            pendingRetries.delete(retryOnInteraction)
            setIsPlaying(true)
            setIsBuffering(false)

            // Restore the user's muted preference
            if (!initialMuted) {
              v.muted = false
              v.removeAttribute("muted")
              setIsMuted(false)
            }
          })
          .catch((_err) => {
            if (cancelled) return

            if (attempt < RETRY_DELAYS.length) {
              // iOS: force a fresh load if decoder never started
              if (IS_IOS && attempt >= 2 && v.readyState === 0) {
                v.load()
              }
              retryTimer = setTimeout(
                () => tryPlay(attempt + 1),
                RETRY_DELAYS[attempt],
              )
            } else {
              // Queue a retry for the first user interaction on iOS
              if (IS_IOS && !userHasInteracted) {
                pendingRetries.add(retryOnInteraction)
              }
              setIsPlaying(false)
            }
          })
      }
    }

    /** Retry callback fired on first user interaction */
    const retryOnInteraction = () => {
      if (cancelled || !v.paused) return
      tryPlay()
    }

    let blobFallbackAttempted = false

    /** Error listener with blob URL fallback */
    const onError = () => {
      clearTimers()
      removeListeners()

      const errCode = v.error?.code

      // MEDIA_ERR_SRC_NOT_SUPPORTED (4) — likely a Content-Type mismatch.
      // Fetch the video as a blob with explicit video/mp4 type and retry.
      if (errCode === 4 && !blobFallbackAttempted && videoUrl) {
        blobFallbackAttempted = true

        fetchBlobUrl(videoUrl)
          .then((blobSrc) => {
            if (cancelled) {
              URL.revokeObjectURL(blobSrc)
              return
            }
            // Set blob URL directly as src (it already has correct MIME)
            while (v.firstChild) v.removeChild(v.firstChild)
            v.src = blobSrc
            v.load()

            // Re-attach error listener for the blob attempt
            v.addEventListener(
              "error",
              () => {
                URL.revokeObjectURL(blobSrc)
                setIsPlaying(false)
                setIsBuffering(false)
              },
              { once: true },
            )

            // Wait for ready then play
            const onBlobReady = () => tryPlay()
            v.addEventListener("loadedmetadata", onBlobReady, { once: true })
            v.addEventListener("canplay", onBlobReady, { once: true })
          })
          .catch(() => {
            setIsPlaying(false)
            setIsBuffering(false)
          })
        return
      }

      setIsPlaying(false)
      setIsBuffering(false)
    }
    v.addEventListener("error", onError)

    // If readyState is already sufficient, play immediately
    if (v.readyState >= 1) {
      tryPlay()
    } else {
      const onReady = () => {
        removeListeners()
        clearTimers()
        tryPlay()
      }

      // Listen for every possible ready signal
      for (const evt of [
        "loadedmetadata",
        "loadeddata",
        "canplay",
        "canplaythrough",
      ]) {
        const handler = onReady as EventListener
        v.addEventListener(evt, handler, { once: true })
        listeners.push([evt, handler])
      }

      // Kick the load if nothing has started
      if (v.readyState === 0) v.load()

      // Fallback: if NO ready event fires within 3 s, try play() anyway
      fallbackTimer = setTimeout(() => {
        if (cancelled) return
        removeListeners()
        tryPlay()
      }, 3000)
    }

    return () => {
      cancelled = true
      clearTimers()
      removeListeners()
      v.removeEventListener("error", onError)
      pendingRetries.delete(retryOnInteraction)
    }
  }, [autoPlay, initialMuted, videoUrl])

  /* ── Unmount safety net: release decoder ── */
  useEffect(() => {
    return () => {
      const v = videoRef.current
      if (v) releaseDecoder(v)
    }
  }, [])

  /* ── User-initiated play/pause (synchronous gesture stack) ── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      if (v.muted) v.setAttribute("muted", "")
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
    if (v.muted) {
      v.setAttribute("muted", "")
    } else {
      v.removeAttribute("muted")
    }
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
