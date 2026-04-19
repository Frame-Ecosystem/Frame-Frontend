"use client"

import { useState } from "react"
import { Store, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { StoreCard } from "@/app/_components/marketplace/store-card"
import { useDiscoverStores } from "@/app/_hooks/queries/useMarketplace"
import type {
  StoreCategory,
  StoreDiscoverParams,
} from "@/app/_types/marketplace"

const CATEGORIES: { value: StoreCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "haircare", label: "Hair Care" },
  { value: "skincare", label: "Skin Care" },
  { value: "makeup", label: "Makeup" },
  { value: "nails", label: "Nails" },
  { value: "fragrance", label: "Fragrance" },
  { value: "tools_accessories", label: "Tools" },
  { value: "organic_natural", label: "Organic" },
  { value: "mens_grooming", label: "Men's" },
  { value: "spa_wellness", label: "Spa & Wellness" },
  { value: "other", label: "Other" },
]

const SORT_OPTIONS: {
  value: NonNullable<StoreDiscoverParams["sort"]>
  label: string
}[] = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
]

export default function StoresPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<StoreCategory | "">("")
  const [sort, setSort] = useState<StoreDiscoverParams["sort"]>("popular")

  const params: StoreDiscoverParams = {
    search: search || undefined,
    category: category || undefined,
    sort,
    limit: 24,
  }

  const { data, isLoading, isError } = useDiscoverStores(params)
  const stores = data?.data ?? []

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Store className="text-primary h-7 w-7" />
            <h1 className="text-2xl font-bold lg:text-3xl">Discover Stores</h1>
          </div>
          <p className="text-muted-foreground">
            Find beauty stores from salons & professionals near you
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="pl-9"
          />
        </div>

        {/* Category chips */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as StoreCategory | "")}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort chips */}
        <div className="mb-6 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-muted-foreground" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                sort === opt.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted h-52 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              Failed to load stores. Please try again.
            </p>
          </div>
        ) : stores.length === 0 ? (
          <div className="py-16 text-center">
            <Store className="text-muted-foreground/30 mx-auto mb-4 h-16 w-16" />
            <p className="text-muted-foreground">
              No stores found. Try a different search.
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4 text-sm">
              {data?.count ?? stores.length} stores found
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {stores.map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
