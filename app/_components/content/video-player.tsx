"use client"

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react"
import { Play, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/app/_lib/utils"

export interface VideoPlayerHandle {
  togglePlay: () => void
  toggleMute: () => void
  setMuted: (muted: boolean) => void
}

interface VideoPlayerProps {
  src: string
  thumbnailUrl?: string
  autoPlay?: boolean
  /** External active control — replaces IntersectionObserver when provided */
  isActive?: boolean
  loop?: boolean
  muted?: boolean
  className?: string
  /** Callback when play state changes */
  onPlayChange?: (playing: boolean) => void
  /** Callback when mute state changes */
  onMuteChange?: (muted: boolean) => void
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      thumbnailUrl,
      autoPlay = false,
      isActive,
      loop = true,
      muted: initialMuted = true,
      className,
      onPlayChange,
      onMuteChange,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(initialMuted)
    const [showControls, setShowControls] = useState(true)
    const [progress, setProgress] = useState(0)
    const [isBuffering, setIsBuffering] = useState(false)
    const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const externallyControlled = isActive !== undefined

    // External active control (for reels — replaces IntersectionObserver)
    useEffect(() => {
      if (!externallyControlled) return
      const video = videoRef.current
      if (!video) return
      if (isActive) {
        video
          .play()
          .then(() => {
            setIsPlaying(true)
            onPlayChange?.(true)
          })
          .catch(() => {
            // Autoplay blocked (mobile without user gesture) — show paused state
            setIsPlaying(false)
            onPlayChange?.(false)
          })
      } else {
        video.pause()
        // eslint-disable-next-line react-hooks/set-state-in-effect -- imperative video sync
        setIsPlaying(false)
        onPlayChange?.(false)
      }
    }, [isActive, externallyControlled, onPlayChange])

    // IntersectionObserver fallback (when not externally controlled)
    useEffect(() => {
      if (externallyControlled) return
      const video = videoRef.current
      const container = containerRef.current
      if (!video || !container || !autoPlay) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
        },
        { threshold: 0.6 },
      )

      observer.observe(container)
      return () => observer.disconnect()
    }, [autoPlay, externallyControlled])

    // Progress tracking
    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      const handleTime = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100)
        }
      }
      video.addEventListener("timeupdate", handleTime)
      return () => video.removeEventListener("timeupdate", handleTime)
    }, [])

    const togglePlay = useCallback(() => {
      const video = videoRef.current
      if (!video) return
      if (video.paused) {
        // Optimistically update UI; revert if play() is rejected
        setIsPlaying(true)
        onPlayChange?.(true)
        const p = video.play()
        if (p) {
          p.catch(() => {
            setIsPlaying(false)
            onPlayChange?.(false)
          })
        }
      } else {
        video.pause()
        setIsPlaying(false)
        onPlayChange?.(false)
      }
    }, [onPlayChange])

    const toggleMute = useCallback(() => {
      const video = videoRef.current
      if (!video) return
      video.muted = !video.muted
      setIsMuted(video.muted)
      onMuteChange?.(video.muted)
    }, [onMuteChange])

    const setMutedValue = useCallback(
      (muted: boolean) => {
        const video = videoRef.current
        if (!video) return
        video.muted = muted
        setIsMuted(muted)
        onMuteChange?.(muted)
      },
      [onMuteChange],
    )

    // Expose imperative handle for parent control
    useImperativeHandle(
      ref,
      () => ({
        togglePlay,
        toggleMute,
        setMuted: setMutedValue,
      }),
      [togglePlay, toggleMute, setMutedValue],
    )

    const handleClick = useCallback(() => {
      if (externallyControlled) return // parent handles interactions
      togglePlay()
      setShowControls(true)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      hideTimeout.current = setTimeout(() => setShowControls(false), 2500)
    }, [togglePlay, externallyControlled])

    const handleToggleMuteClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        toggleMute()
      },
      [toggleMute],
    )

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full cursor-pointer overflow-hidden bg-black",
          className,
        )}
        onClick={handleClick}
        onMouseEnter={
          externallyControlled ? undefined : () => setShowControls(true)
        }
        onMouseLeave={
          externallyControlled
            ? undefined
            : () => {
                if (isPlaying) setShowControls(false)
              }
        }
      >
        <video
          ref={videoRef}
          src={src}
          poster={thumbnailUrl}
          loop={loop}
          muted={isMuted}
          playsInline
          preload="metadata"
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          className="h-full w-full object-cover"
        />

        {/* Buffering spinner (always shown) */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}

        {/* Built-in controls — only when NOT externally controlled */}
        {!externallyControlled && (
          <>
            {/* Play/Pause overlay */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-200",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              {!isPlaying && !isBuffering && (
                <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div
              className={cn(
                "absolute right-0 bottom-0 left-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 pt-6 pb-2 transition-opacity duration-200",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Progress bar */}
              <div className="flex-1">
                <div className="h-0.5 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full bg-white transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Mute button */}
              <button
                onClick={handleToggleMuteClick}
                className="rounded-full p-1 text-white transition hover:bg-white/20"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    )
  },
)
