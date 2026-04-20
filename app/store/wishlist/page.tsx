"use client"

import { Heart } from "lucide-react"
import Link from "next/link"
import { useMemo, useCallback } from "react"
import { Button } from "@/app/_components/ui/button"
import { ProductCard } from "@/app/_components/marketplace/product-card"
import {
  useWishlist,
  useToggleWishlist,
} from "@/app/_hooks/queries/useMarketplace"

function WishlistProductCard({ productId }: { productId: string }) {
  const { data } = useWishlist()
  const items = useMemo(() => data?.data ?? [], [data])
  const item = useMemo(
    () => items.find((w) => w.product?._id === productId),
    [items, productId],
  )
  const toggle = useToggleWishlist(productId, true)

  const handleToggle = useCallback(() => {
    toggle.mutate()
  }, [toggle])

  if (!item?.product) return null

  return (
    <ProductCard
      product={item.product}
      isInWishlist
      onWishlistToggle={handleToggle}
    />
  )
}

export default function WishlistPage() {
  const { data, isLoading } = useWishlist()
  const productIds = useMemo(
    () =>
      (data?.data ?? [])
        .filter((w) => w.product != null)
        .map((w) => w.product._id),
    [data],
  )

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Heart className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">Wishlist</h1>
          {productIds.length > 0 && (
            <span className="text-muted-foreground text-sm">
              ({productIds.length} items)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted h-64 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : productIds.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Heart className="text-muted-foreground/30 h-16 w-16" />
            <p className="font-semibold">Your wishlist is empty</p>
            <p className="text-muted-foreground text-sm">
              Save products you love to buy later
            </p>
            <Button asChild variant="outline">
              <Link href="/store">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productIds.map((id) => (
              <WishlistProductCard key={id} productId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
