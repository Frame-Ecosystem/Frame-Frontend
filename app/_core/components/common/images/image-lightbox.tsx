"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

export function ImageLightbox({ src, alt, open, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 z-0 bg-black/88 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex max-h-[92vh] max-w-[95vw] flex-col items-end gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          onMouseDown={(event) => event.stopPropagation()}
          className="z-20 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/70 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/85"
          aria-label="Close image"
        >
          <X className="h-4 w-4" />
          <span>Close</span>
        </button>

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/35 shadow-2xl">
          <img
            src={src}
            alt={alt}
            className="block max-h-[80vh] w-auto max-w-[95vw] object-contain sm:max-h-[84vh] md:max-w-[980px]"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
