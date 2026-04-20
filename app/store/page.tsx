"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Store,
  Package,
  ShoppingCart,
  Heart,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { StoreCard } from "@/app/_components/marketplace/store-card"
import { ProductCard } from "@/app/_components/marketplace/product-card"
import {
  useDiscoverStores,
  useDiscoverProducts,
  useAddToCart,
  useMyCart,
} from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"
import type { StoreCategory } from "@/app/_types/marketplace"

const CATEGORY_CHIPS: {
  value: StoreCategory | ""
  label: string
  emoji: string
}[] = [
  { value: "", label: "All", emoji: "✨" },
  { value: "beauty", label: "Beauty", emoji: "💆" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "wellness", label: "Wellness", emoji: "🌿" },
  { value: "accessories", label: "Accessories", emoji: "👜" },
  { value: "tools", label: "Tools", emoji: "🩮" },
  { value: "other", label: "Other", emoji: "📦" },
]

export default function MarketplacePage() {
  const [search, setSearch] = useState("")

  const { data: storesData, isLoading: storesLoading } = useDiscoverStores({
    sort: "popular",
    limit: 6,
  })
  const { data: productsData, isLoading: productsLoading } =
    useDiscoverProducts({
      sort: "best_selling",
      limit: 8,
    })
  const { data: newArrivalsData } = useDiscoverProducts({
    sort: "newest",
    limit: 4,
  })
  const { data: cart } = useMyCart()
  const addToCart = useAddToCart()

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  const handleAddToCart = (productId: string) => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: () => toast.error("Failed to add to cart"),
      },
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      window.location.href = `/store/products?search=${encodeURIComponent(search)}`
    }
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <div className="from-primary/20 via-primary/10 to-background relative overflow-hidden rounded-2xl bg-linear-to-br p-6 lg:p-10">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <span className="text-primary text-sm font-semibold tracking-wide uppercase">
                Beauty Marketplace
              </span>
            </div>
            <h1 className="mb-2 text-3xl leading-tight font-bold lg:text-4xl">
              Discover Beauty
              <br />
              <span className="text-primary">Products & Stores</span>
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md text-sm">
              Shop from the best beauty professionals and salons.
            </p>
            <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, stores..."
                  className="bg-background/80 pl-9 backdrop-blur-sm"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
          <div className="bg-primary/10 absolute -top-12 -right-12 h-64 w-64 rounded-full blur-3xl" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "All Products",
              href: "/store/products",
              icon: Package,
              color:
                "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            },
            {
              label: "All Stores",
              href: "/store/stores",
              icon: Store,
              color:
                "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
            },
            {
              label: `Cart (${cartCount})`,
              href: "/store/cart",
              icon: ShoppingCart,
              color:
                cartCount > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
            },
            {
              label: "Wishlist",
              href: "/store/wishlist",
              icon: Heart,
              color:
                "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl p-3.5 transition-all hover:scale-[1.02] ${item.color}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Category chips */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          {CATEGORY_CHIPS.map((cat) => (
            <Link
              key={cat.value}
              href={`/store/products${cat.value ? `?category=${cat.value}` : ""}`}
              className="border-border bg-card hover:bg-muted flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all"
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* Best Selling Products */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" />
              <h2 className="text-xl font-bold">Best Selling</h2>
            </div>
            <Link
              href="/store/products?sort=best_selling"
              className="text-primary flex items-center gap-0.5 text-sm hover:underline"
            >
              See all <ChevronRight size={14} />
            </Link>
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
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {(productsData?.data ?? []).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* New Arrivals */}
        {(newArrivalsData?.data.length ?? 0) > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                <h2 className="text-xl font-bold">New Arrivals</h2>
              </div>
              <Link
                href="/store/products?sort=newest"
                className="text-primary flex items-center gap-0.5 text-sm hover:underline"
              >
                See all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(newArrivalsData?.data ?? []).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Stores */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="text-primary h-5 w-5" />
              <h2 className="text-xl font-bold">Featured Stores</h2>
            </div>
            <Link
              href="/store/stores"
              className="text-primary flex items-center gap-0.5 text-sm hover:underline"
            >
              See all <ChevronRight size={14} />
            </Link>
          </div>
          {storesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-48 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(storesData?.data ?? []).map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          )}
        </section>

        {/* Open store CTA */}
        <section className="from-primary/15 to-primary/5 rounded-2xl bg-linear-to-r p-6 text-center">
          <Store className="text-primary mx-auto mb-3 h-10 w-10" />
          <h3 className="mb-2 text-xl font-bold">Start Selling Today</h3>
          <p className="text-muted-foreground mx-auto mb-4 max-w-md text-sm">
            Join hundreds of beauty professionals. Open your store and reach
            thousands of customers.
          </p>
          <Button asChild size="lg">
            <Link href="/store/my-store">Open My Store</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
