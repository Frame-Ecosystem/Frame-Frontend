"use client"

import { useState } from "react"
import { SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { useProductCategories } from "@/app/_hooks/queries/useMarketplace"
import type { ProductDiscoverParams } from "@/app/_types/marketplace"

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

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategories({ activeOnly: true })
  const categories = categoriesResponse?.data ?? []

  const hasFilters =
    !!params.categoryId ||
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
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="border-border flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span className="bg-primary text-primary-foreground ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs">
              &bull;
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

      <div className={`space-y-5 ${open ? "block" : "hidden lg:block"}`}>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-xs lg:flex"
          >
            <X size={12} /> Clear all
          </button>
        )}

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

        <div>
          <p className="mb-2 text-sm font-semibold">Category</p>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            <button
              onClick={() => onChange({ ...params, categoryId: undefined })}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                !params.categoryId
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
            >
              All Categories
            </button>
            {categoriesLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-3 py-1.5 text-xs">
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </div>
            ) : null}
            {categoriesError ? (
              <p className="text-muted-foreground px-3 py-1.5 text-xs">
                Couldn&apos;t load categories.
              </p>
            ) : null}
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onChange({ ...params, categoryId: cat._id })}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  params.categoryId === cat._id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {cat.icon ? <span aria-hidden>{cat.icon}</span> : null}
                <span className="truncate">{cat.name}</span>
                {typeof cat.productCount === "number" &&
                cat.productCount > 0 ? (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {cat.productCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

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
            <span className="text-muted-foreground">-</span>
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
