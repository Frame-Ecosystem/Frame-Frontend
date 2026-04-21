"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { CartStoreGroup } from "@/app/_components/marketplace/cart-store-group"
import {
  useMyCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "@/app/_hooks/queries/useMarketplace"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { data: cart, isLoading } = useMyCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveFromCart()
  const router = useRouter()

  const storeIds = cart
    ? Array.from(
        new Set(
          cart.items
            .map((item) => {
              const store =
                typeof item.productId.storeId === "object"
                  ? (item.productId.storeId as { _id: string })
                  : null
              return store?._id ?? ""
            })
            .filter(Boolean),
        ),
      )
    : []

  const totalItems = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const totalPrice = cart?.totalPrice ?? 0

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 lg:px-8 lg:py-14">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-muted h-40 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <ShoppingCart className="text-muted-foreground/30 h-20 w-20" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm">
          Start shopping to add items to your cart
        </p>
        <Button asChild>
          <Link href="/store">Browse Marketplace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <ShoppingCart className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">Cart</h1>
          <span className="text-muted-foreground text-sm">
            ({totalItems} items)
          </span>
        </div>

        {/* Groups by store */}
        <div className="space-y-4">
          {storeIds.map((storeId) => {
            const storeItems = cart.items.filter((item) => {
              const s =
                typeof item.productId.storeId === "object"
                  ? (item.productId.storeId as { _id: string })
                  : null
              return s?._id === storeId
            })
            const storeRef = storeItems[0]?.storeId ?? storeId
            return (
              <CartStoreGroup
                key={storeId}
                store={storeRef}
                items={storeItems}
                onQuantityChange={(productId, qty) =>
                  updateItem.mutate({ productId, quantity: qty })
                }
                onRemove={(productId) => removeItem.mutate(productId)}
                onCheckout={(sid) => router.push(`/store/checkout/${sid}`)}
              />
            )
          })}
        </div>

        {/* Total */}
        <div className="bg-card border-border mt-6 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-primary text-xl font-bold">
              {totalPrice.toFixed(2)} DT
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Checkout is done per store
          </p>
        </div>
      </div>
    </div>
  )
}
