"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ProductImage } from "@/app/_types/marketplace"

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center rounded-xl">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={images[current].url}
          alt={images[current].alt ?? productName}
          fill
          className="object-cover transition-opacity duration-200"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="bg-background/80 hover:bg-background absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-1.5 shadow backdrop-blur-sm transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="bg-background/80 hover:bg-background absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 shadow backdrop-blur-sm transition"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-80"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `Image ${i + 1}`}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
