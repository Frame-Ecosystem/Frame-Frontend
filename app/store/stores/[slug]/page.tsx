"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Search, Package } from "lucide-react"
import { Input } from "@/app/_components/ui/input"
import { StoreHeader } from "@/app/_components/marketplace/store-header"
import { ProductCard } from "@/app/_components/marketplace/product-card"
import { ReviewCard } from "@/app/_components/marketplace/review-card"
import {
  useStoreBySlug,
  useProductsByStore,
  useStoreReviews,
  useAddToCart,
} from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"

export default function StoreProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [tab, setTab] = useState<"products" | "reviews">("products")
  const [search, setSearch] = useState("")

  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
  } = useStoreBySlug(slug)
  const { data: productsData, isLoading: productsLoading } = useProductsByStore(
    store?._id ?? "",
    1,
  )
  const { data: reviewsData } = useStoreReviews(store?._id ?? "")
  const addToCart = useAddToCart()

  const products = (productsData?.data ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )
  const reviews = reviewsData?.data ?? []

  const handleAddToCart = (productId: string) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: () => toast.error("Failed to add to cart"),
      },
    )
  }

  if (storeLoading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-0">
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 lg:px-8">
          <div className="bg-muted h-48 animate-pulse rounded-xl" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted h-64 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (storeError || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Store not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-4 lg:px-8 lg:py-8">
        {/* Store header */}
        <StoreHeader store={store} />

        {/* Tabs */}
        <div className="border-border flex gap-1 border-b">
          {(["products", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-primary text-primary border-b-2"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "products"
                ? `Products (${productsData?.count ?? 0})`
                : `Reviews (${reviewsData?.count ?? 0})`}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products in this store..."
                className="pl-9"
              />
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-64 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "reviews" && (
          <div>
            {reviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              <div>
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
