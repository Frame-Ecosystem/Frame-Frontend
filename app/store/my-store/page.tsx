"use client"

import Link from "next/link"
import {
  Store,
  Package,
  ShoppingBag,
  BarChart2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import {
  useMyStore,
  useStoreOrders,
  useMyStoreAnalytics,
} from "@/app/_hooks/queries/useMarketplace"

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  suspended: {
    label: "Suspended",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-900/20",
  },
  under_review: {
    label: "Under Review",
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
}

export default function MyStoreDashboard() {
  const { data: store, isLoading } = useMyStore()
  const { data: ordersData } = useStoreOrders({ status: "pending" })
  const { data: analytics } = useMyStoreAnalytics()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-8">
        <div className="bg-muted h-32 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pb-24 lg:pb-0">
        <Store className="text-muted-foreground/30 h-20 w-20" />
        <h2 className="text-xl font-bold">You don&apos;t have a store yet</h2>
        <p className="text-muted-foreground max-w-sm text-center text-sm">
          Open your store and start selling your beauty products to thousands of
          customers.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/store/my-store/create">
            <Plus size={16} /> Open My Store
          </Link>
        </Button>
      </div>
    )
  }

  const status =
    STATUS_CONFIG[store.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const pendingOrders = ordersData?.count ?? 0

  return (
    <div className="from-background to-muted/10 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 lg:px-8">
        {/* Store card */}
        <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
          {store.banner && (
            <div className="from-primary/20 to-primary/5 relative h-28 overflow-hidden bg-gradient-to-r">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.banner.url}
                alt="Banner"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {store.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logo.url}
                    alt={store.name}
                    className="h-12 w-12 rounded-full object-cover shadow"
                  />
                ) : (
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Store className="text-primary h-6 w-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold">{store.name}</h1>
                  <p className="text-muted-foreground text-sm capitalize">
                    {store.category.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.color}`}
              >
                <StatusIcon size={12} />
                {status.label}
              </div>
            </div>

            {store.status === "pending" && (
              <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Your store is pending admin approval. You can set up your
                  products while you wait.
                </p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href="/store/my-store/edit">
                  <Edit size={13} /> Edit Store
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href={`/store/stores/${store.slug}`}>
                  <Store size={13} /> View Public Page
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Total Products",
              value: analytics?.totalProducts ?? store.totalProducts ?? 0,
              icon: Package,
              href: "/store/my-store/products",
            },
            {
              label: "Total Orders",
              value: analytics?.totalOrders ?? 0,
              icon: ShoppingBag,
              href: "/store/my-store/orders",
            },
            {
              label: "Pending Orders",
              value: pendingOrders,
              icon: Clock,
              href: "/store/my-store/orders?status=pending",
            },
            {
              label: "Revenue",
              value: `${(analytics?.totalRevenue ?? 0).toFixed(0)} DT`,
              icon: BarChart2,
              href: "/store/my-store/analytics",
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-card border-border hover:bg-muted group rounded-xl border p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Icon size={16} className="text-primary" />
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                </div>
                <p className="mt-2 text-xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
              </Link>
            )
          })}
        </div>

        {/* Quick links */}
        <div className="bg-card border-border space-y-2 rounded-xl border p-4">
          <h2 className="mb-3 font-semibold">Manage</h2>
          {[
            {
              label: "Products",
              description: "Manage your product catalog",
              href: "/store/my-store/products",
              icon: Package,
            },
            {
              label: "Orders",
              description: "View and process customer orders",
              href: "/store/my-store/orders",
              icon: ShoppingBag,
            },
            {
              label: "Analytics",
              description: "Revenue, views, and trends",
              href: "/store/my-store/analytics",
              icon: BarChart2,
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              >
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Icon size={15} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
