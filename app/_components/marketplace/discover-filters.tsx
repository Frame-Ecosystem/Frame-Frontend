"use client"

import { useState } from "react"
import { SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import type {
  ProductCategory,
  ProductDiscoverParams,
} from "@/app/_types/marketplace"

const CATEGORIES: { value: ProductCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "shampoo", label: "Shampoo" },
  { value: "conditioner", label: "Conditioner" },
  { value: "hair_oil", label: "Hair Oil" },
  { value: "hair_mask", label: "Hair Mask" },
  { value: "hair_color", label: "Hair Color" },
  { value: "face_cream", label: "Face Cream" },
  { value: "face_serum", label: "Face Serum" },
  { value: "cleanser", label: "Cleanser" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "sunscreen", label: "Sunscreen" },
  { value: "foundation", label: "Foundation" },
  { value: "mascara", label: "Mascara" },
  { value: "lipstick", label: "Lipstick" },
  { value: "eyeshadow", label: "Eyeshadow" },
  { value: "nail_polish", label: "Nail Polish" },
  { value: "perfume", label: "Perfume" },
  { value: "body_lotion", label: "Body Lotion" },
  { value: "brush_set", label: "Brush Set" },
  { value: "other", label: "Other" },
]

const SORT_OPTIONS: {
  value: NonNullable<ProductDiscoverParams["sort"]>
  label: string
}[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

interface DiscoverFiltersProps {
  params: ProductDiscoverParams
  onChange: (next: ProductDiscoverParams) => void
  className?: string
}

export function DiscoverFilters({
  params,
  onChange,
  className = "",
}: DiscoverFiltersProps) {
  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? "")
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? "")
  const [open, setOpen] = useState(false)

  const hasFilters =
    !!params.category ||
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    params.inStock !== undefined ||
    (params.sort && params.sort !== "newest")

  const applyPriceRange = () => {
    onChange({
      ...params,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
  }

  const clearAll = () => {
    setMinPrice("")
    setMaxPrice("")
    onChange({ search: params.search, sort: "newest" })
  }

  return (
    <div className={className}>
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="border-border flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span className="bg-primary text-primary-foreground ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs">
              •
            </span>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className={`space-y-5 ${open ? "block" : "hidden lg:block"}`}>
        {/* Clear all (desktop) */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-xs lg:flex"
          >
            <X size={12} /> Clear all
          </button>
        )}

        {/* Sort */}
        <div>
          <p className="mb-2 text-sm font-semibold">Sort by</p>
          <div className="space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...params, sort: opt.value })}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  (params.sort ?? "newest") === opt.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="mb-2 text-sm font-semibold">Category</p>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  onChange({ ...params, category: cat.value || undefined })
                }
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  (params.category ?? "") === cat.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <p className="mb-2 text-sm font-semibold">Price (DT)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 text-sm"
              min={0}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 text-sm"
              min={0}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 w-full text-xs"
            onClick={applyPriceRange}
          >
            Apply
          </Button>
        </div>

        {/* In stock only */}
        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={params.inStock === true}
              onChange={(e) =>
                onChange({
                  ...params,
                  inStock: e.target.checked ? true : undefined,
                })
              }
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">In stock only</span>
          </label>
        </div>
      </div>
    </div>
  )
}
