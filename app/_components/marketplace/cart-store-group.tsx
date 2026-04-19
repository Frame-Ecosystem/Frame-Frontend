"use client"

import Image from "next/image"
import Link from "next/link"
import { Store, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { CartItem } from "@/app/_types/marketplace"
import { CartItemRow } from "./cart-item"

interface CartStoreGroupProps {
  store: CartItem["storeId"]
  items: CartItem[]
  onQuantityChange: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
  onCheckout: (storeId: string) => void
}

export function CartStoreGroup({
  store,
  items,
  onQuantityChange,
  onRemove,
  onCheckout,
}: CartStoreGroupProps) {
  const storeId = typeof store === "object" ? store._id : store
  const storeName = typeof store === "object" ? store.name : "Store"
  const storeLogo = typeof store === "object" ? store.logo?.url : undefined
  const storeSlug = typeof store === "object" ? store.slug : undefined

  const subtotal = items.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0,
  )

  return (
    <Card className="overflow-hidden">
      {/* Store header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link
          href={storeSlug ? `/store/stores/${storeSlug}` : "#"}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <div className="h-6 w-6 overflow-hidden rounded-full">
            {storeLogo ? (
              <Image
                src={storeLogo}
                alt={storeName}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                <Store size={12} className="text-primary" />
              </div>
            )}
          </div>
          <span className="text-sm">{storeName}</span>
        </Link>
        <span className="text-muted-foreground text-xs">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <CardContent className="px-4 pt-0 pb-4">
        {/* Items */}
        <div className="divide-border divide-y">
          {items.map((item) => (
            <CartItemRow
              key={item.productId._id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Subtotal + checkout */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Store subtotal</p>
            <p className="text-primary font-semibold">
              {subtotal.toFixed(2)} DT
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onCheckout(storeId)}
            className="gap-1"
          >
            <ShoppingBag size={14} />
            Checkout
            <ArrowRight size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
