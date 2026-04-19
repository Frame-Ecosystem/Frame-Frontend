"use client"

import type { ProductStatus } from "@/app/_types/marketplace"

interface StockIndicatorProps {
  stock: number
  threshold?: number
  status?: ProductStatus
}

export function StockIndicator({
  stock,
  threshold = 5,
  status,
}: StockIndicatorProps) {
  if (status === "out_of_stock" || stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
        Out of stock
      </span>
    )
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
        Only {stock} left
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
      In stock
    </span>
  )
}
