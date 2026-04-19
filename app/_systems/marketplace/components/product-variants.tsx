"use client"

import { useState } from "react"
import type { ProductVariant } from "@/app/_types/marketplace"

interface ProductVariantsProps {
  variants: ProductVariant[]
  selectedIndex?: number
  onSelect: (index: number) => void
}

export function ProductVariants({
  variants,
  selectedIndex: _selectedIndex,
  onSelect,
}: ProductVariantsProps) {
  const [selected, setSelected] = useState<Record<number, number>>({})

  if (!variants || variants.length === 0) return null

  const handleSelect = (variantIdx: number, optionIdx: number) => {
    const next = { ...selected, [variantIdx]: optionIdx }
    setSelected(next)
    // For single variant groups: pass first variant's selection
    onSelect(optionIdx)
  }

  return (
    <div className="space-y-4">
      {variants.map((variant, vi) => (
        <div key={vi}>
          <p className="mb-2 text-sm font-medium">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((opt, oi) => {
              const isSelected = selected[vi] === oi
              const isUnavailable = opt.stock !== undefined && opt.stock === 0
              return (
                <button
                  key={oi}
                  onClick={() => !isUnavailable && handleSelect(vi, oi)}
                  disabled={isUnavailable}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : isUnavailable
                        ? "border-border text-muted-foreground cursor-not-allowed line-through opacity-40"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                  {opt.priceModifier && opt.priceModifier !== 0 && (
                    <span className="ml-1 text-xs opacity-70">
                      {opt.priceModifier > 0 ? "+" : ""}
                      {opt.priceModifier} DT
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
