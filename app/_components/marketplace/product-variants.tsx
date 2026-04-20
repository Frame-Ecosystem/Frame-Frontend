"use client"

import type { ProductVariant } from "@/app/_types/marketplace"

interface ProductVariantsProps {
  variants: ProductVariant[]
  selectedIndex?: number
  onSelect: (index: number) => void
}

export function ProductVariants({
  variants,
  selectedIndex,
  onSelect,
}: ProductVariantsProps) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Variants</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant, i) => {
          const isSelected = selectedIndex === i
          const isUnavailable = variant.stock === 0
          return (
            <button
              key={i}
              onClick={() => !isUnavailable && onSelect(i)}
              disabled={isUnavailable}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : isUnavailable
                    ? "border-border text-muted-foreground cursor-not-allowed line-through opacity-40"
                    : "border-border hover:border-primary/50"
              }`}
            >
              {variant.name}
              {variant.price > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  {variant.price} DT
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
