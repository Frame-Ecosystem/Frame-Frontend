"use client"

import { useState } from "react"
import { Badge } from "@/app/_components/ui/badge"
import {
  useMyStoreOrders,
  useUpdateOrderStatus,
} from "@/app/_hooks/queries/useMarketplace"
import type { OrderStatus } from "@/app/_types/marketplace"
import { Package, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  processing:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  shipped:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export default function StoreOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const { data, isLoading } = useMyStoreOrders(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
  )
  const updateStatus = useUpdateOrderStatus()
  const orders = data?.data ?? []

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => toast.success("Order status updated"),
        onError: () => toast.error("Failed to update order"),
      },
    )
  }

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Store Orders</h1>
          <p className="text-muted-foreground text-sm">
            Manage orders from your customers
          </p>
        </div>

        {/* Status filter */}
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-28 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="text-muted-foreground/30 mx-auto mb-4 h-14 w-14" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const buyer =
                typeof order.buyerId === "object"
                  ? (order.buyerId as {
                      name?: string
                      firstName?: string
                      lastName?: string
                    })
                  : null
              const buyerName = buyer
                ? [buyer.firstName, buyer.lastName].filter(Boolean).join(" ") ||
                  (buyer as { name?: string }).name ||
                  "Customer"
                : "Customer"

              return (
                <div
                  key={order._id}
                  className="bg-card border-border rounded-xl border p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <Link
                        href={`/store/orders/${order._id}`}
                        className="font-mono text-sm font-semibold hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                        <User size={11} />
                        {buyerName}
                      </div>
                    </div>
                    <Badge
                      className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-3 text-xs">
                    {order.items.length} item(s) ·{" "}
                    {order.totalAmount != null
                      ? order.totalAmount.toFixed(2)
                      : (order.total ?? 0).toFixed(2)}{" "}
                    DT
                  </p>

                  {/* Update status */}
                  {!["delivered", "cancelled", "refunded"].includes(
                    order.status,
                  ) && (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter(
                        (s) => s !== order.status && !["pending"].includes(s),
                      ).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order._id, s)}
                          className="border-border hover:bg-muted rounded-full border px-3 py-1 text-xs capitalize transition-colors"
                        >
                          Mark as {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
