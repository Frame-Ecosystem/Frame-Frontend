"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import type { CartItem as CartItemType } from "@/app/_types/marketplace"
import { PriceDisplay } from "./price-display"

interface CartItemRowProps {
  item: CartItemType
  onQuantityChange: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const product = item.productId
  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0]

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Image */}
      <Link href={`/store/products/${product._id}`} className="flex-shrink-0">
        <div className="bg-muted relative h-16 w-16 overflow-hidden rounded-lg">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted h-full w-full" />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link href={`/store/products/${product._id}`}>
          <p className="line-clamp-2 text-sm font-medium hover:underline">
            {product.name}
          </p>
        </Link>
        <PriceDisplay price={product.price} size="sm" className="mt-0.5" />

        {/* Quantity controls */}
        <div className="mt-2 flex items-center gap-2">
          <div className="border-border flex items-center rounded-lg border">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onQuantityChange(product._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus size={12} />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onQuantityChange(product._id, item.quantity + 1)}
              disabled={item.quantity >= product.stock}
            >
              <Plus size={12} />
            </Button>
          </div>

          <span className="text-muted-foreground text-xs">
            = {(product.price * item.quantity).toFixed(2)} DT
          </span>
        </div>
      </div>

      {/* Remove */}
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground h-7 w-7 hover:text-red-500"
        onClick={() => onRemove(product._id)}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
