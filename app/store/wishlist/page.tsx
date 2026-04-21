"use client"

import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { ProductCard } from "@/app/_components/marketplace/product-card"
import {
  useWishlist,
  useToggleWishlist,
} from "@/app/_hooks/queries/useMarketplace"
import type { Product } from "@/app/_systems/marketplace/types"

function WishlistProductCard({ product }: { product: Product }) {
  const toggle = useToggleWishlist(product._id, true)
  return (
    <ProductCard
      product={product}
      isInWishlist={true}
      onWishlistToggle={() => toggle.mutate()}
    />
  )
}

export default function WishlistPage() {
  const { data, isLoading } = useWishlist()
  const items = (data?.data ?? []).filter((w) => w.product?._id)

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-6 flex items-center gap-3">
          <Heart className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">Wishlist</h1>
          {items.length > 0 && (
            <span className="text-muted-foreground text-sm">
              ({items.length} items)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted h-64 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
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
            {items.map(({ product }) => (
              <WishlistProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
