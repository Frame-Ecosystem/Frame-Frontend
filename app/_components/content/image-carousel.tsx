"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/app/_lib/utils"

interface ImageCarouselProps {
  images: { url: string; publicId?: string }[]
  alt?: string
  aspectRatio?: "square" | "video" | "auto" | "portrait"
  priority?: boolean
  onDoubleClick?: () => void
}

const SWIPE_VELOCITY_THRESHOLD = 0.5 // px/ms
const SWIPE_DISTANCE_THRESHOLD = 40 // px
const _SPRING_TENSION = 0.6 // Spring-like easing intensity

export function ImageCarousel({
  images,
  alt = "Post image",
  aspectRatio = "square",
  priority = false,
  onDoubleClick,
}: Readonly<ImageCarouselProps>) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const startXRef = useRef<number | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const movedRef = useRef(false)
  const startTimeRef = useRef<number>(0)
  const velocityRef = useRef(0)

  // Lock body scroll when lightbox is open; broadcast to sibling components
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
      window.dispatchEvent(
        new CustomEvent("frame:lightbox-change", { detail: { open: true } }),
      )
    } else {
      document.body.style.overflow = ""
      window.dispatchEvent(
        new CustomEvent("frame:lightbox-change", { detail: { open: false } }),
      )
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), [])
  const next = useCallback(
    () => setCurrent((c) => Math.min(images.length - 1, c + 1)),
    [images.length],
  )

  const beginDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (images.length <= 1) return
      startXRef.current = e.clientX
      startTimeRef.current = Date.now()
      activePointerIdRef.current = e.pointerId
      movedRef.current = false
      velocityRef.current = 0
      setIsDragging(true)
      setTransitionEnabled(false)
      setDragOffset(0)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [images.length],
  )

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isDragging || startXRef.current === null) return
      if (activePointerIdRef.current !== e.pointerId) return

      const deltaX = e.clientX - startXRef.current
      const timeDelta = Date.now() - startTimeRef.current || 1

      if (Math.abs(deltaX) > 3) movedRef.current = true

      // Calculate velocity for momentum-based swipe
      velocityRef.current = deltaX / timeDelta

      setDragOffset(deltaX)
    },
    [isDragging],
  )

  const endDrag = useCallback(() => {
    if (!isDragging) return

    const distanceThreshold = SWIPE_DISTANCE_THRESHOLD
    const velocityThreshold = SWIPE_VELOCITY_THRESHOLD

    // Combined distance + velocity logic for natural swipe feeling
    const swipedLeft =
      dragOffset < -distanceThreshold ||
      (dragOffset < -20 && velocityRef.current < -velocityThreshold)
    const swipedRight =
      dragOffset > distanceThreshold ||
      (dragOffset > 20 && velocityRef.current > velocityThreshold)

    setTransitionEnabled(true)

    if (swipedRight && current > 0) {
      setCurrent(current - 1)
    } else if (swipedLeft && current < images.length - 1) {
      setCurrent(current + 1)
    }

    setDragOffset(0)
    setIsDragging(false)
    startXRef.current = null
    activePointerIdRef.current = null
    velocityRef.current = 0
  }, [current, dragOffset, images.length, isDragging])

  const cancelDrag = useCallback(() => {
    setTransitionEnabled(true)
    setDragOffset(0)
    setIsDragging(false)
    startXRef.current = null
    activePointerIdRef.current = null
  }, [])

  const handleOpenLightbox = useCallback(() => {
    if (!movedRef.current) {
      setLightboxOpen(true)
    }
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const handleInlineKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleOpenLightbox()
      }
      if (images.length > 1 && e.key === "ArrowLeft") {
        e.preventDefault()
        prev()
      }
      if (images.length > 1 && e.key === "ArrowRight") {
        e.preventDefault()
        next()
      }
    },
    [handleOpenLightbox, images.length, next, prev],
  )

  if (images.length === 0) return null

  let aspectClass = "aspect-auto min-h-[300px]"
  if (aspectRatio === "square") {
    aspectClass = "aspect-square"
  } else if (aspectRatio === "video") {
    aspectClass = "aspect-video"
  } else if (aspectRatio === "portrait") {
    aspectClass = "aspect-[4/5]"
  }

  return (
    <>
      <div className="relative touch-manipulation select-none">
        {/* Main image */}
        <button
          type="button"
          className={cn(
            "relative w-full cursor-grab overflow-hidden bg-gradient-to-br from-black/80 to-black active:cursor-grabbing",
            aspectClass,
          )}
          onClick={handleOpenLightbox}
          onKeyDown={handleInlineKeyDown}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}
          onDoubleClick={onDoubleClick}
          aria-label={`Image gallery: ${current + 1} of ${images.length}. Open in full screen`}
        >
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(calc(${-current * 100}% + ${dragOffset}px))`,
              transition: transitionEnabled
                ? "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "none",
              willChange: isDragging ? "transform" : "auto",
            }}
          >
            {images.map((img, index) => (
              <div
                key={img.publicId || `${img.url}-${index}`}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  src={img.url}
                  alt={`${alt} ${index + 1} of ${images.length}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 470px"
                  className={cn(
                    "object-cover select-none",
                    isDragging && "pointer-events-none",
                  )}
                  priority={priority && index === 0}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Drag indicator overlay (subtle feedback) */}
          {isDragging && dragOffset !== 0 && (
            <div className="pointer-events-none absolute inset-0 bg-white/5" />
          )}
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            {current > 0 && (
              <button
                onClick={prev}
                className="group absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/35 active:scale-95"
                aria-label={`Previous image (${current} of ${images.length})`}
              >
                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={next}
                className="group absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/35 active:scale-95"
                aria-label={`Next image (${current + 2} of ${images.length})`}
              >
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </>
        )}

        {/* Dot indicator with smooth animation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/40 px-3 py-2 backdrop-blur-md">
            {images.map((_, i) => (
              <button
                key={`dot-${images[i]?.publicId || images[i]?.url || i}`}
                onClick={() => {
                  setTransitionEnabled(true)
                  setCurrent(i)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setTransitionEnabled(true)
                    setCurrent(i)
                  }
                }}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === current ? "page" : undefined}
                className={cn(
                  "h-2 origin-center transform rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 bg-white shadow-lg"
                    : "w-2 bg-white/50 hover:bg-white/70 active:scale-90",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with improved UX */}
      {lightboxOpen && (
        <dialog
          open
          className="fixed inset-0 z-[2147483647] m-0 h-screen w-screen max-w-none border-none bg-transparent p-0 backdrop:bg-black/95 backdrop:backdrop-blur-md"
          aria-label="Image viewer (full screen)"
          onCancel={closeLightbox}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            tabIndex={-1}
          />

          <button
            type="button"
            onClick={closeLightbox}
            className="fixed z-[2147483647] rounded-full border border-white/20 bg-white/10 p-2.5 text-white shadow-xl backdrop-blur-lg transition-all duration-200 hover:bg-white/20 active:scale-95"
            style={{
              top: "max(16px, env(safe-area-inset-top))",
              right: "max(16px, env(safe-area-inset-right))",
            }}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute inset-0 z-[110]">
            <div
              className="relative h-full w-full touch-manipulation overflow-hidden"
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={cancelDrag}
            >
              <div
                className="flex h-full"
                style={{
                  transform: `translateX(calc(${-current * 100}% + ${dragOffset}px))`,
                  transition: transitionEnabled
                    ? "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "none",
                  willChange: isDragging ? "transform" : "auto",
                }}
              >
                {images.map((img, index) => (
                  <div
                    key={`lightbox-${img.publicId || img.url || index}`}
                    className="relative h-full w-full shrink-0"
                  >
                    <Image
                      src={img.url}
                      alt={`${alt} ${index + 1} of ${images.length}`}
                      fill
                      sizes="100vw"
                      quality={90}
                      className={cn(
                        "object-contain select-none",
                        isDragging && "pointer-events-none",
                      )}
                      priority={index === current || index === 0}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Drag feedback overlay */}
              {isDragging && dragOffset !== 0 && (
                <div className="pointer-events-none absolute inset-0 bg-white/5" />
              )}
            </div>
          </div>

          {/* Lightbox nav arrows with improved styling */}
          {images.length > 1 && (
            <>
              {current > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="group fixed top-1/2 left-4 z-[125] -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/35 active:scale-95 sm:left-6"
                  aria-label={`Previous image (${current} of ${images.length})`}
                >
                  <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                </button>
              )}
              {current < images.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="group fixed top-1/2 right-4 z-[125] -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/35 active:scale-95 sm:right-6"
                  aria-label={`Next image (${current + 2} of ${images.length})`}
                >
                  <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </>
          )}

          {/* Lightbox image counter and dots */}
          <div className="fixed right-0 bottom-0 left-0 z-[120] flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 py-6">
            <div className="text-sm text-white/70">
              {current + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={`lightbox-dot-${i}`}
                    onClick={() => {
                      setTransitionEnabled(true)
                      setCurrent(i)
                    }}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === current ? "page" : undefined}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === current
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/60",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  )
}
