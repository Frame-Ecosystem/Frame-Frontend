"use client"

import { useState, useCallback, useEffect } from "react"
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
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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

  if (images.length === 0) return null

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
        ? "aspect-video"
        : aspectRatio === "portrait"
          ? "aspect-[4/5]"
          : "aspect-auto min-h-[300px]"

  return (
    <>
      <div className="relative select-none" onDoubleClick={onDoubleClick}>
        {/* Main image */}
        <div
          className={cn(
            "relative w-full cursor-pointer overflow-hidden bg-black",
            aspectClass,
          )}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={images[current].url}
            alt={`${alt} ${current + 1} of ${images.length}`}
            fill
            sizes="(max-width: 768px) 100vw, 470px"
            className="object-cover"
            priority={priority && current === 0}
            loading={priority && current === 0 ? "eager" : "lazy"}
          />
        </div>

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
                key={i}
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-[101] rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[current].url}
              alt={`${alt} ${current + 1} of ${images.length}`}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain"
              priority
            />
          </div>
          {/* Lightbox nav arrows */}
          {images.length > 1 && (
            <>
              {current > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {current < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
