"use client"

import { useParams, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/app/_components/ui/badge"
import { OrderTimeline } from "@/app/_components/marketplace/order-timeline"
import { useOrderById } from "@/app/_hooks/queries/useMarketplace"

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  disputed: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: order, isLoading, isError } = useOrderById(id)

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 lg:px-8">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-32 animate-pulse rounded-xl" />
          <div className="bg-muted h-48 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  const store =
    typeof order.storeId === "object"
      ? (order.storeId as { _id: string; name: string; slug: string })
      : null

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} /> Back to orders
        </button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="text-muted-foreground mt-1 font-mono text-xs">
              #{order.orderNumber}
            </p>
          </div>
          <Badge
            className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`}
          >
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Timeline */}
        <OrderTimeline currentStatus={order.status} />

        {/* Items */}
        <div className="bg-card border-border space-y-3 rounded-xl border p-4">
          <h2 className="font-semibold">Items</h2>
          {order.items.map((item, idx) => {
            return (
              <div key={idx} className="flex items-center gap-3">
                {item.image && (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {(item.price * item.quantity).toFixed(2)} DT
                  </p>
                  <p className="text-muted-foreground text-xs">
                    x{item.quantity} · {item.price.toFixed(2)} DT
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Shipping + payment */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-card border-border rounded-xl border p-4">
            <h2 className="mb-2 text-sm font-semibold">Shipping Address</h2>
            <p className="text-muted-foreground text-sm">
              {order.shippingAddress.address}
            </p>
            <p className="text-muted-foreground text-sm">
              {order.shippingAddress.city}
              {order.shippingAddress.state
                ? `, ${order.shippingAddress.state}`
                : ""}
            </p>
            {order.shippingAddress.zipCode && (
              <p className="text-muted-foreground text-sm">
                {order.shippingAddress.zipCode}
              </p>
            )}
            {order.shippingAddress.notes && (
              <p className="text-muted-foreground mt-1 text-xs italic">
                {order.shippingAddress.notes}
              </p>
            )}
          </div>
          <div className="bg-card border-border rounded-xl border p-4">
            <h2 className="mb-2 text-sm font-semibold">Payment</h2>
            <p className="text-muted-foreground text-sm capitalize">
              {order.paymentMethod.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="text-muted-foreground text-sm capitalize">
              {order.paymentStatus}
            </p>
            {store && (
              <Link
                href={`/store/stores/${store.slug}`}
                className="text-primary mt-2 block text-sm hover:underline"
              >
                View Store →
              </Link>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-card border-border rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-primary text-xl font-bold">
              {order.total.toFixed(2)} DT
            </span>
          </div>
        </div>

        {order.notes && (
          <div className="bg-muted rounded-xl p-4">
            <h2 className="mb-1 text-sm font-semibold">Notes</h2>
            <p className="text-muted-foreground text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
