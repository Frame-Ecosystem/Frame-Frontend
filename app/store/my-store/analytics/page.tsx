"use client"

import { useMyStoreAnalytics } from "@/app/_hooks/queries/useMarketplace"
import {
  BarChart2,
  TrendingUp,
  ShoppingBag,
  Star,
  Eye,
  Package,
} from "lucide-react"

export default function StoreAnalyticsPage() {
  const { data: analytics, isLoading } = useMyStoreAnalytics()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="bg-muted h-48 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No analytics data yet</p>
      </div>
    )
  }

  const { overview, last30Days, dailyRevenue, ordersByStatus } = analytics

  const stats = [
    {
      label: "Total Revenue",
      value: `${overview.totalRevenue.toFixed(2)} DT`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Total Orders",
      value: overview.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Products",
      value: overview.totalProducts,
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Average Rating",
      value: overview.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "Last 30d Revenue",
      value: `${last30Days.revenue.toFixed(2)} DT`,
      icon: BarChart2,
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      label: "Avg Order Value",
      value: `${last30Days.avgOrderValue.toFixed(2)} DT`,
      icon: Eye,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ]

  // Revenue chart: last 30 days
  const revenue30 = dailyRevenue?.slice(-30) ?? []
  const maxRevenue = Math.max(...revenue30.map((d) => d.revenue), 1)

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 lg:px-8">
        <div className="mb-2 flex items-center gap-3">
          <BarChart2 className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-card border-border rounded-xl border p-4"
              >
                <div
                  className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Revenue chart */}
        {revenue30.length > 0 && (
          <div className="bg-card border-border rounded-xl border p-4">
            <h2 className="mb-4 font-semibold">Revenue (Last 30 Days)</h2>
            <div className="flex h-32 items-end gap-1">
              {revenue30.map((day, i) => {
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div
                    key={i}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className="bg-primary/70 hover:bg-primary w-full rounded-t transition-all"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="bg-foreground text-background pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded px-1.5 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100">
                      {day.revenue.toFixed(0)} DT
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              <span>{revenue30[0]?.date ?? ""}</span>
              <span>{revenue30[revenue30.length - 1]?.date ?? ""}</span>
            </div>
          </div>
        )}

        {/* Orders by status */}
        {ordersByStatus && (
          <div className="bg-card border-border rounded-xl border p-4">
            <h2 className="mb-4 font-semibold">Orders by Status</h2>
            <div className="space-y-2">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24 text-sm capitalize">
                    {status.replace(/_/g, " ")}
                  </span>
                  <div className="bg-muted h-2 flex-1 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${overview.totalOrders > 0 ? (count / overview.totalOrders) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
