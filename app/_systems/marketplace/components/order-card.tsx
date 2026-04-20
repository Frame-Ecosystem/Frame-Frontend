"use client"

import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { Order } from "@/app/_types/marketplace"

interface OrderCardProps {
  order: Order
}

const STATUS_CONFIG: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", cls: "bg-indigo-100 text-indigo-700" },
  shipped: { label: "Shipped", cls: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", cls: "bg-orange-100 text-orange-700" },
  disputed: { label: "Disputed", cls: "bg-red-100 text-red-800" },
}

export function OrderCard({ order }: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.status]
  const storeName =
    typeof order.storeId === "object" && "name" in order.storeId
      ? order.storeId.name
      : "Store"
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <Link href={`/store/orders/${order._id}`}>
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Order number + store */}
              <div className="mb-1 flex items-center gap-2">
                <Package
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="font-mono text-sm font-semibold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-muted-foreground mb-2 text-xs">
                {storeName} · {formattedDate}
              </p>

              {/* Items preview */}
              <p className="text-sm">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                {" · "}
                {order.items
                  .slice(0, 2)
                  .map((item) => item.name)
                  .join(", ")}
                {order.items.length > 2 && ` +${order.items.length - 2} more`}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.cls}`}
              >
                {statusCfg.label}
              </span>
              <p className="text-primary font-semibold">
                {order.total.toFixed(2)} DT
              </p>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
