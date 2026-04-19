"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PostMedia } from "@/app/_systems/feed/types/content"

interface PostMediaCarouselProps {
  media: PostMedia[]
  /** Mark the first image as priority for LCP. */
  priority?: boolean
  /** Optional alt prefix; defaults to `Post image`. */
  altPrefix?: string
}

/**
 * Touch-first media carousel for post cards.
 *
 * Behaviour:
 *  - **Swipe** with finger (mobile) or trackpad — uses native CSS scroll-snap,
 *    so momentum, rubber-banding and direction-locking match platform UX.
 *  - **Buttons** (desktop) — show on hover; do a smooth `scrollIntoView`.
 *  - **Dots** — clickable indicators that also reflect the active page.
 *  - **Keyboard** — `←` / `→` navigate while the carousel has focus.
 *  - **Active index** — derived from scroll position via IntersectionObserver
 *    (avoids scroll-listener jank, no rAF needed).
 *  - **Lazy loading** — only the first image is `priority`; the rest defer.
 *  - **Vertical pan preserved** — `touch-action: pan-y` lets the page scroll
 *    vertically while the carousel handles horizontal swipes.
 */
export function PostMediaCarousel({
  media,
  priority = false,
  altPrefix = "Post image",
}: PostMediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const isMulti = media.length > 1

  /** Smooth-scroll to a given slide. */
  const goTo = useCallback((index: number) => {
    const slide = slideRefs.current[index]
    if (!slide) return
    slide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    })
  }, [])

  /* ── Track which slide is in view ── */
  useEffect(() => {
    if (!isMulti) return
    const track = trackRef.current
    if (!track) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio (>= 0.6)
        let best: IntersectionObserverEntry | null = null
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.6) continue
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry
          }
        }
        if (!best) return
        const idx = Number((best.target as HTMLElement).dataset.index)
        if (!Number.isNaN(idx)) setActiveIndex(idx)
      },
      { root: track, threshold: [0.6, 0.9, 1] },
    )

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide)
    }
    return () => observer.disconnect()
  }, [isMulti, media.length])

  /* ── Keyboard navigation ── */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isMulti) return
      if (e.key === "ArrowRight") {
        e.preventDefault()
        goTo(Math.min(activeIndex + 1, media.length - 1))
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goTo(Math.max(activeIndex - 1, 0))
      }
    },
    [activeIndex, goTo, isMulti, media.length],
  )

  return (
    <div
      className="group/media relative overflow-hidden rounded-xl"
      tabIndex={isMulti ? 0 : -1}
      onKeyDown={onKeyDown}
      role={isMulti ? "region" : undefined}
      aria-roledescription={isMulti ? "carousel" : undefined}
      aria-label={isMulti ? `Image gallery, ${media.length} items` : undefined}
    >
      {/* Track (scroll container) */}
      <div
        ref={trackRef}
        className="scrollbar-hide flex aspect-square w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain bg-black sm:aspect-video"
        style={{ scrollBehavior: "smooth", touchAction: "pan-y" }}
      >
        {media.map((item, index) => (
          <div
            key={item.publicId || index}
            ref={(el) => {
              slideRefs.current[index] = el
            }}
            data-index={index}
            className="relative h-full w-full flex-none snap-start snap-always"
            aria-roledescription={isMulti ? "slide" : undefined}
            aria-label={isMulti ? `${index + 1} of ${media.length}` : undefined}
          >
            <Image
              src={item.url}
              alt={`${altPrefix} ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover"
              priority={priority && index === 0}
              loading={priority && index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Counter pill */}
      {isMulti && (
        <div className="pointer-events-none absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {media.length}
        </div>
      )}

      {/* Desktop arrow buttons (hidden on touch devices) */}
      {isMulti && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => goTo(Math.max(activeIndex - 1, 0))}
            disabled={activeIndex === 0}
            className="absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover/media:opacity-100 hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-20 sm:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => goTo(Math.min(activeIndex + 1, media.length - 1))}
            disabled={activeIndex === media.length - 1}
            className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover/media:opacity-100 hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-20 sm:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {isMulti && (
        <div className="pointer-events-none absolute right-0 bottom-2 left-0 flex justify-center gap-1.5">
          {media.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to image ${index + 1}`}
              onClick={() => goTo(index)}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-200 ${
                index === activeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
