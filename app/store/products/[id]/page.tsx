"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ShoppingCart, Store, Star } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { ProductGallery } from "@/app/_components/marketplace/product-gallery"
import { ProductVariants } from "@/app/_components/marketplace/product-variants"
import { PriceDisplay } from "@/app/_components/marketplace/price-display"
import { StockIndicator } from "@/app/_components/marketplace/stock-indicator"
import { ReviewCard } from "@/app/_components/marketplace/review-card"
import { ReviewForm } from "@/app/_components/marketplace/review-form"
import { WishlistButton } from "@/app/_components/marketplace/wishlist-button"
import {
  useProductById,
  useProductReviews,
  useAddToCart,
  useWishlist,
} from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"
import { useAuth } from "@/app/_auth"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [variantIndex, setVariantIndex] = useState<number | undefined>(
    undefined,
  )
  const [tab, setTab] = useState<"description" | "reviews">("description")

  const { data: product, isLoading, isError } = useProductById(id)
  const { data: reviewsData } = useProductReviews(id)
  const { data: wishlistData } = useWishlist()
  const addToCart = useAddToCart()

  const isInWishlist = (wishlistData?.data ?? []).some(
    (w) => w.product._id === id,
  )
  const ownProduct =
    product?.storeId && typeof product.storeId === "object"
      ? (product.storeId as { owner?: string }).owner === user?._id
      : false

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    addToCart.mutate(
      { productId: id, quantity, variantIndex },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: () => toast.error("Failed to add to cart"),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-muted aspect-square animate-pulse rounded-xl" />
            <div className="space-y-4">
              <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-12 w-1/3 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    )
  }

  const store =
    typeof product.storeId === "object"
      ? (product.storeId as {
          _id: string
          name: string
          slug: string
          logo?: { url: string }
        })
      : null

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-4 lg:px-8 lg:py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Category + wishlist */}
            <div className="flex items-center justify-between">
              {(() => {
                const label =
                  typeof product.categoryId === "object" &&
                  product.categoryId !== null
                    ? product.categoryId.name
                    : (product.category ?? "").replace(/_/g, " ")
                return label ? (
                  <Badge variant="outline" className="text-xs capitalize">
                    {label}
                  </Badge>
                ) : (
                  <span />
                )
              })()}
              <WishlistButton productId={id} isInWishlist={isInWishlist} />
            </div>

            {/* Name */}
            <h1 className="text-2xl leading-snug font-bold">{product.name}</h1>

            {/* Rating */}
            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(product.averageRating ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {(product.averageRating ?? 0).toFixed(1)} (
                  {product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />

            {/* Stock */}
            <StockIndicator
              stock={product.stock}
              threshold={product.lowStockThreshold}
            />

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-muted-foreground text-sm">
                {product.shortDescription}
              </p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <ProductVariants
                variants={product.variants}
                selectedIndex={variantIndex}
                onSelect={(idx) => setVariantIndex(idx)}
              />
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Qty:</span>
                <div className="border-border flex items-center rounded-lg border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-1.5 text-lg disabled:opacity-40"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            {!ownProduct && (
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
                size="lg"
                className="w-full gap-2"
              >
                <ShoppingCart size={16} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            )}

            {/* Store info */}
            {store && (
              <Link
                href={`/store/stores/${store.slug}`}
                className="bg-muted flex items-center gap-3 rounded-xl p-3 transition-colors hover:opacity-80"
              >
                <div className="bg-background flex h-10 w-10 items-center justify-center rounded-full shadow">
                  <Store size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sold by</p>
                  <p className="text-sm font-semibold">{store.name}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs: description / reviews */}
        <div className="mt-10">
          <div className="border-border flex gap-1 border-b">
            {(["description", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "border-primary text-primary border-b-2"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "reviews"
                  ? `Reviews (${reviewsData?.count ?? 0})`
                  : "Description"}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "description" ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {user && !ownProduct && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="mb-3 text-sm font-semibold">
                      Write a Review
                    </h3>
                    <ReviewForm
                      productId={id}
                      orderId=""
                      onSuccess={() => setTab("reviews")}
                    />
                  </div>
                )}
                {(reviewsData?.data ?? []).length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No reviews yet. Be the first!
                    </p>
                  </div>
                ) : (
                  (reviewsData?.data ?? []).map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
