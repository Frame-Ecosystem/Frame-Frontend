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

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
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
      activePointerIdRef.current = e.pointerId
      movedRef.current = false
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
      if (Math.abs(deltaX) > 3) movedRef.current = true
      setDragOffset(deltaX)
    },
    [isDragging],
  )

  const endDrag = useCallback(() => {
    if (!isDragging) return

    const threshold = 56
    const shouldPrev = dragOffset > threshold && current > 0
    const shouldNext = dragOffset < -threshold && current < images.length - 1

    setTransitionEnabled(true)
    if (shouldPrev) {
      prev()
    } else if (shouldNext) {
      next()
    }

    setDragOffset(0)
    setIsDragging(false)
    startXRef.current = null
    activePointerIdRef.current = null
  }, [current, dragOffset, images.length, isDragging, next, prev])

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
      <div className="relative select-none">
        {/* Main image */}
        <button
          type="button"
          className={cn(
            "relative w-full cursor-pointer overflow-hidden bg-black",
            aspectClass,
          )}
          onClick={handleOpenLightbox}
          onKeyDown={handleInlineKeyDown}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}
          onDoubleClick={onDoubleClick}
          aria-label="Open image in full screen"
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(calc(${-current * 100}% + ${dragOffset}px))`,
              transition: transitionEnabled
                ? "transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1)"
                : "none",
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
                    "object-cover",
                    isDragging && "pointer-events-none",
                  )}
                  priority={priority && index === 0}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            {current > 0 && (
              <button
                onClick={prev}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/80"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={next}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/80"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </>
        )}

        {/* Dot indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={`dot-${images[i]?.publicId || images[i]?.url || i}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <dialog
          open
          className="fixed inset-0 z-[2147483647] m-0 h-screen w-screen max-w-none border-none bg-transparent p-0"
          aria-label="Image viewer"
          onCancel={closeLightbox}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
            aria-label="Close image viewer"
          />

          <button
            type="button"
            onClick={closeLightbox}
            className="fixed z-[2147483647] rounded-full border border-black/15 bg-white/80 p-2 text-black shadow-lg backdrop-blur-sm transition-colors hover:bg-white dark:border-white/30 dark:bg-black/70 dark:text-white dark:hover:bg-black/85"
            style={{
              top: "max(12px, env(safe-area-inset-top))",
              right: "max(12px, env(safe-area-inset-right))",
            }}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute inset-0 z-[110]">
            <div
              className="relative h-full w-full overflow-hidden"
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
                    ? "transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1)"
                    : "none",
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
                        "object-contain",
                        isDragging && "pointer-events-none",
                      )}
                      priority={index === current || index === 0}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Lightbox nav arrows */}
          {images.length > 1 && (
            <>
              {current > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="fixed top-1/2 left-3 z-[125] -translate-y-1/2 rounded-full bg-black/65 p-2 text-white backdrop-blur-sm transition hover:bg-black/85 sm:left-4"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {current < images.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="fixed top-1/2 right-3 z-[125] -translate-y-1/2 rounded-full bg-black/65 p-2 text-white backdrop-blur-sm transition hover:bg-black/85 sm:right-4"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </dialog>
      )}
    </>
  )
}
