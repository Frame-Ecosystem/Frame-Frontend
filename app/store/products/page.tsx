"use client"

import { useState, useCallback } from "react"
import { Search, Package } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { ProductCard } from "@/app/_components/marketplace/product-card"
import { DiscoverFilters } from "@/app/_components/marketplace/discover-filters"
import {
  useDiscoverProducts,
  useAddToCart,
} from "@/app/_hooks/queries/useMarketplace"
import type { ProductDiscoverParams } from "@/app/_types/marketplace"
import { toast } from "sonner"

export default function ProductsPage() {
  const [params, setParams] = useState<ProductDiscoverParams>({
    sort: "newest",
    limit: 24,
  })

  const { data, isLoading, isError } = useDiscoverProducts(params)
  const addToCart = useAddToCart()
  const products = data?.data ?? []

  const handleSearch = useCallback(
    (search: string) =>
      setParams((p) => ({ ...p, search: search || undefined })),
    [],
  )

  const handleAddToCart = (productId: string) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: () => toast.error("Failed to add to cart"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold lg:text-3xl">Products</h1>
          <p className="text-muted-foreground text-sm">
            Browse beauty products from our marketplace
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            defaultValue={params.search ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-6 rounded-xl border p-4 shadow-sm">
              <DiscoverFilters params={params} onChange={setParams} />
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0 flex-1">
            {/* Mobile filters */}
            <div className="mb-4 lg:hidden">
              <DiscoverFilters params={params} onChange={setParams} />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-64 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  Failed to load products. Please try again.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="text-muted-foreground/30 mx-auto mb-4 h-16 w-16" />
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-4 text-sm">
                  {data?.count ?? products.length} products found
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
