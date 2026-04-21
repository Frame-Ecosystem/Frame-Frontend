"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { OrderCard } from "@/app/_components/marketplace/order-card"
import { useMyOrders } from "@/app/_hooks/queries/useMarketplace"

export default function OrdersPage() {
  const { data, isLoading } = useMyOrders()
  const orders = data?.data ?? []

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-6 flex items-center gap-3">
          <Package className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-28 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Package className="text-muted-foreground/30 h-16 w-16" />
            <p className="font-semibold">No orders yet</p>
            <p className="text-muted-foreground text-sm">
              Your order history will appear here
            </p>
            <Button asChild variant="outline">
              <Link href="/store">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
