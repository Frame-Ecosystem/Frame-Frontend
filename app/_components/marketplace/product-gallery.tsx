"use client"

import Image from "next/image"
import { useImageSlider } from "@/app/_hooks/useImageSlider"
import type { ProductImage } from "@/app/_types/marketplace"

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { index, goTo, onTouchStart, onTouchEnd } = useImageSlider(
    images.length,
  )

  if (images.length === 0) {
    return (
      <div className="bg-muted flex h-60 w-full items-center justify-center rounded-xl">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-2 overflow-hidden">
      {/* Slide area */}
      <div
        className="bg-muted relative h-60 w-full overflow-hidden rounded-xl lg:h-80"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-300 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt ?? productName}
              fill
              className="object-contain p-2"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === index ? "bg-primary w-4" : "bg-foreground/30 w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails — always 5 visible, scroll for more */}
      {images.length > 1 && (
        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative aspect-square flex-none snap-start overflow-hidden rounded-lg border-2 transition-all ${
                i === index
                  ? "border-primary"
                  : "border-transparent opacity-50 hover:opacity-75"
              }`}
              style={{ width: "calc((100% - 24px) / 5)" }}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
