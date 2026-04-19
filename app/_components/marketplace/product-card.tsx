"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { Product } from "@/app/_types/marketplace"
import { PriceDisplay } from "./price-display"
import { StockIndicator } from "./stock-indicator"

interface ProductCardProps {
  product: Product
  isInWishlist?: boolean
  onWishlistToggle?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export function ProductCard({
  product,
  isInWishlist = false,
  onWishlistToggle,
  onAddToCart,
}: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0]
  const store = typeof product.storeId === "object" ? product.storeId : null
  const isOutOfStock = product.status === "out_of_stock" || product.stock === 0
  const hasDiscount =
    !!product.compareAtPrice && product.compareAtPrice > product.price
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Wishlist button */}
      {onWishlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onWishlistToggle(product._id)
          }}
          className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow transition-all hover:scale-110 dark:bg-black/60"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={14}
            className={
              isInWishlist
                ? "fill-rose-500 text-rose-500"
                : "text-muted-foreground"
            }
          />
        </button>
      )}

      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
          -{discountPct}%
        </div>
      )}

      <Link href={`/store/products/${product._id}`}>
        {/* Image */}
        <div className="bg-muted relative aspect-square overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? "opacity-50 grayscale" : ""
              }`}
            />
          ) : (
            <div className="from-muted to-muted/50 flex h-full w-full flex-col items-center justify-center bg-linear-to-br">
              <ShoppingCart className="text-muted-foreground/30 h-10 w-10" />
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-xs font-semibold">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          {/* Store name */}
          {store && (
            <p className="text-muted-foreground mb-0.5 line-clamp-1 text-xs">
              {typeof store === "object" && "name" in store ? store.name : ""}
            </p>
          )}

          {/* Product name */}
          <h3 className="mb-1 line-clamp-2 text-sm leading-snug font-medium">
            {product.name}
          </h3>

          {/* Category */}
          <Badge variant="outline" className="mb-2 text-xs capitalize">
            {product.category.replace(/_/g, " ")}
          </Badge>

          {/* Rating */}
          {product.stats.averageRating > 0 && (
            <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
              <Star className="fill-yellow-500 text-yellow-500" size={11} />
              <span>{product.stats.averageRating.toFixed(1)}</span>
              <span>({product.stats.ratingCount})</span>
            </div>
          )}

          {/* Price */}
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            className="mb-2"
          />

          {/* Stock */}
          <StockIndicator
            stock={product.stock}
            threshold={product.lowStockThreshold}
            status={product.status}
          />
        </CardContent>
      </Link>

      {/* Add to cart */}
      {onAddToCart && !isOutOfStock && (
        <div className="border-border border-t p-3 pt-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-full text-xs"
            onClick={(e) => {
              e.preventDefault()
              onAddToCart(product._id)
            }}
          >
            <ShoppingCart size={12} className="mr-1" />
            Add to cart
          </Button>
        </div>
      )}
    </Card>
  )
}
