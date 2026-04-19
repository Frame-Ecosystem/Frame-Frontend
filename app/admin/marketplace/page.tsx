"use client"

import { useState } from "react"
import {
  ShoppingBag,
  Store,
  Package,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Badge } from "../../_components/ui/badge"
import { AdminHeader } from "../_components/admin-header"
import { StatCard } from "../_components/stat-card"
import {
  useAdminMarketplaceAnalytics,
  useAdminAllStores,
  useAdminUpdateStoreStatus,
  useAdminVerifyStore,
  useAdminAllProducts,
  useAdminUpdateProductStatus,
  useAdminAllOrders,
  useAdminResolveDispute,
} from "../../_hooks/queries/useMarketplace"
import type {
  Store as StoreType,
  Product,
  Order,
} from "../../_types/marketplace"
import {
  StoreStatus,
  ProductStatus,
  StoreBadge,
  OrderStatus,
} from "../../_types/marketplace"
import { cn } from "../../_lib/utils"

type Tab = "overview" | "stores" | "products" | "disputes"

const TABS: { id: Tab; label: string; icon: typeof Store }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "stores", label: "Store Approvals", icon: Store },
  { id: "products", label: "Product Moderation", icon: Package },
  { id: "disputes", label: "Disputes", icon: AlertTriangle },
]

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  rejected: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  inactive:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  out_of_stock:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  pending_review:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  disputed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  refunded:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
}

/* ─── Store Row ─────────────────────────────────────────────────────────── */
function StoreRow({ store }: { store: StoreType }) {
  const [reason, setReason] = useState("")
  const [showReason, setShowReason] = useState(false)
  const updateStatus = useAdminUpdateStoreStatus()
  const verifyStore = useAdminVerifyStore()

  const approve = () => {
    updateStatus.mutate(
      { id: store._id, status: StoreStatus.ACTIVE },
      {
        onSuccess: () => toast.success(`${store.name} approved`),
        onError: () => toast.error("Failed to approve store"),
      },
    )
  }

  const reject = () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    updateStatus.mutate(
      { id: store._id, status: StoreStatus.REJECTED, reason },
      {
        onSuccess: () => {
          toast.success(`${store.name} rejected`)
          setShowReason(false)
          setReason("")
        },
        onError: () => toast.error("Failed to reject store"),
      },
    )
  }

  const suspend = () => {
    updateStatus.mutate(
      {
        id: store._id,
        status: StoreStatus.SUSPENDED,
        reason: reason || undefined,
      },
      {
        onSuccess: () => toast.success(`${store.name} suspended`),
        onError: () => toast.error("Failed to suspend store"),
      },
    )
  }

  const grantBadge = (badge: StoreBadge) => {
    verifyStore.mutate(
      { id: store._id, badge },
      {
        onSuccess: () => toast.success(`Badge updated`),
        onError: () => toast.error("Failed to update badge"),
      },
    )
  }

  return (
    <div className="border-border space-y-3 border-b py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {store.logo?.url ? (
            <Image
              src={store.logo.url}
              alt={store.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <Store className="text-muted-foreground h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{store.name}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[store.status] ?? STATUS_COLORS.pending,
              )}
            >
              {store.status}
            </span>
            {store.badge && store.badge !== StoreBadge.NONE && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {store.badge}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {store.category} • {store.stats?.totalProducts ?? 0} products •{" "}
            {store.stats?.totalOrders ?? 0} orders
          </p>
          {store.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {store.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {store.status === StoreStatus.PENDING && (
            <>
              <Button
                size="sm"
                onClick={approve}
                disabled={updateStatus.isPending}
                className="h-7 bg-green-600 text-xs hover:bg-green-700"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowReason(!showReason)}
                className="h-7 text-xs"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Reject
              </Button>
            </>
          )}
          {store.status === StoreStatus.ACTIVE && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => suspend()}
                disabled={updateStatus.isPending}
                className="h-7 text-xs"
              >
                Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => grantBadge(StoreBadge.VERIFIED)}
                disabled={verifyStore.isPending}
                className="h-7 text-xs"
              >
                <Shield className="mr-1 h-3 w-3" />
                Verify
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => grantBadge(StoreBadge.PREMIUM)}
                disabled={verifyStore.isPending}
                className="h-7 text-xs"
              >
                <Star className="mr-1 h-3 w-3" />
                Premium
              </Button>
            </>
          )}
          {store.status === StoreStatus.SUSPENDED && (
            <Button
              size="sm"
              onClick={approve}
              disabled={updateStatus.isPending}
              className="h-7 text-xs"
            >
              Reinstate
            </Button>
          )}
        </div>
      </div>
      {showReason && (
        <div className="flex gap-2 pl-13">
          <input
            className="border-border bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
            placeholder="Rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            className="h-8 text-xs"
          >
            Confirm Reject
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─── Product Row ───────────────────────────────────────────────────────── */
function ProductRow({ product }: { product: Product }) {
  const [reason, setReason] = useState("")
  const [showReason, setShowReason] = useState(false)
  const updateStatus = useAdminUpdateProductStatus()

  const primaryImage =
    product.images?.find((i) => i.isPrimary) ?? product.images?.[0]

  const approve = () => {
    updateStatus.mutate(
      { id: product._id, status: ProductStatus.ACTIVE },
      {
        onSuccess: () => toast.success(`${product.name} approved`),
        onError: () => toast.error("Failed to approve product"),
      },
    )
  }

  const reject = () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    updateStatus.mutate(
      { id: product._id, status: ProductStatus.REJECTED, reason },
      {
        onSuccess: () => {
          toast.success(`${product.name} rejected`)
          setShowReason(false)
          setReason("")
        },
        onError: () => toast.error("Failed to reject product"),
      },
    )
  }

  return (
    <div className="border-border space-y-3 border-b py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <Package className="text-muted-foreground h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{product.name}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[product.status] ?? STATUS_COLORS.pending,
              )}
            >
              {product.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {product.category} • {product.price.toFixed(2)} DT • Stock:{" "}
            {product.stock}
          </p>
          {product.shortDescription && (
            <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
              {product.shortDescription}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {product.status === ProductStatus.PENDING_REVIEW && (
            <>
              <Button
                size="sm"
                onClick={approve}
                disabled={updateStatus.isPending}
                className="h-7 bg-green-600 text-xs hover:bg-green-700"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowReason(!showReason)}
                className="h-7 text-xs"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Reject
              </Button>
            </>
          )}
          {product.status === ProductStatus.ACTIVE && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateStatus.mutate(
                  { id: product._id, status: ProductStatus.INACTIVE },
                  {
                    onSuccess: () => toast.success("Product deactivated"),
                    onError: () => toast.error("Failed"),
                  },
                )
              }
              disabled={updateStatus.isPending}
              className="h-7 text-xs"
            >
              <EyeOff className="mr-1 h-3 w-3" />
              Deactivate
            </Button>
          )}
          {product.status === ProductStatus.INACTIVE && (
            <Button
              size="sm"
              variant="outline"
              onClick={approve}
              disabled={updateStatus.isPending}
              className="h-7 text-xs"
            >
              <Eye className="mr-1 h-3 w-3" />
              Activate
            </Button>
          )}
        </div>
      </div>
      {showReason && (
        <div className="flex gap-2">
          <input
            className="border-border bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
            placeholder="Rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            className="h-8 text-xs"
          >
            Confirm Reject
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─── Dispute Row ───────────────────────────────────────────────────────── */
function DisputeRow({ order }: { order: Order }) {
  const [resolution, setResolution] = useState<
    "refunded" | "delivered" | "cancelled"
  >("refunded")
  const [notes, setNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [expanded, setExpanded] = useState(false)
  const resolveDispute = useAdminResolveDispute()

  const resolve = () => {
    if (!notes.trim()) {
      toast.error("Please provide resolution notes")
      return
    }
    resolveDispute.mutate(
      {
        id: order._id,
        dto: {
          resolution,
          notes,
          refundAmount: refundAmount ? Number(refundAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Dispute resolved")
          setExpanded(false)
        },
        onError: () => toast.error("Failed to resolve dispute"),
      },
    )
  }

  const store = order.storeId as { name?: string } | string
  const storeName = typeof store === "string" ? store : (store?.name ?? "Store")

  return (
    <div className="border-border space-y-3 border-b py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="bg-destructive/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{order.orderNumber}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[order.status] ?? STATUS_COLORS.pending,
              )}
            >
              {order.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Store: {storeName} • Total: {order.total.toFixed(2)} DT •{" "}
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
          {order.disputeReason && (
            <p className="mt-1 line-clamp-2 text-xs text-red-600 dark:text-red-400">
              Dispute: {order.disputeReason}
            </p>
          )}
        </div>
        {order.status === OrderStatus.DISPUTED && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="h-7 shrink-0 text-xs"
          >
            {expanded ? "Cancel" : "Resolve"}
          </Button>
        )}
      </div>
      {expanded && (
        <div className="bg-muted/40 space-y-3 rounded-lg p-3">
          <div className="flex gap-2">
            {(["refunded", "delivered", "cancelled"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  resolution === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {resolution === "refunded" && (
            <input
              type="number"
              className="border-border bg-background w-full rounded-md border px-3 py-1.5 text-sm"
              placeholder={`Refund amount (DT) — max ${order.total.toFixed(2)}`}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          )}
          <textarea
            className="border-border bg-background w-full resize-none rounded-md border px-3 py-2 text-sm"
            rows={2}
            placeholder="Resolution notes (required)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            size="sm"
            onClick={resolve}
            disabled={resolveDispute.isPending}
            className="h-8 text-xs"
          >
            Confirm Resolution
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [storeStatusFilter, setStoreStatusFilter] = useState<
    StoreStatus | undefined
  >(StoreStatus.PENDING)
  const [productStatusFilter, setProductStatusFilter] = useState<
    ProductStatus | undefined
  >(ProductStatus.PENDING_REVIEW)

  const { data: analytics, isLoading: analyticsLoading } =
    useAdminMarketplaceAnalytics()
  const { data: storesData, isLoading: storesLoading } = useAdminAllStores({
    status: storeStatusFilter,
  })
  const { data: productsData, isLoading: productsLoading } =
    useAdminAllProducts({ status: productStatusFilter })
  const { data: disputesData, isLoading: disputesLoading } = useAdminAllOrders({
    status: OrderStatus.DISPUTED,
  })

  const overview = analytics?.overview

  return (
    <>
      <AdminHeader
        title="Marketplace Management"
        description="Approve stores, moderate products, resolve disputes, and view analytics"
        icon={ShoppingBag}
      />

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "stores" &&
                storesData?.count != null &&
                storeStatusFilter === StoreStatus.PENDING && (
                  <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {storesData.count}
                  </span>
                )}
              {tab.id === "products" &&
                productsData?.count != null &&
                productStatusFilter === ProductStatus.PENDING_REVIEW && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {productsData.count}
                  </span>
                )}
              {tab.id === "disputes" && disputesData?.count != null && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {disputesData.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card h-28 animate-pulse rounded-xl border"
                />
              ))}
            </div>
          ) : overview ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <StatCard
                  title="Total Stores"
                  value={overview.totalStores}
                  icon={Store}
                />
                <StatCard
                  title="Total Products"
                  value={overview.totalProducts}
                  icon={Package}
                />
                <StatCard
                  title="Total Orders"
                  value={overview.totalOrders}
                  icon={ShoppingBag}
                />
                <StatCard
                  title="Total Revenue"
                  value={`${overview.totalRevenue.toFixed(0)} DT`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Active Stores"
                  value={overview.storesByStatus?.active ?? 0}
                  icon={CheckCircle}
                  className="border-green-200 dark:border-green-900"
                />
              </div>

              {/* Stores by Status */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Store className="h-4 w-4" />
                      Stores by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {overview.storesByStatus &&
                      Object.entries(overview.storesByStatus).map(
                        ([status, count]) => {
                          const pct =
                            overview.totalStores > 0
                              ? (count / overview.totalStores) * 100
                              : 0
                          return (
                            <div key={status}>
                              <div className="mb-1 flex justify-between text-xs">
                                <span className="capitalize">{status}</span>
                                <span className="text-muted-foreground">
                                  {count}
                                </span>
                              </div>
                              <div className="bg-muted h-2 overflow-hidden rounded-full">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    status === "active"
                                      ? "bg-green-500"
                                      : status === "pending"
                                        ? "bg-yellow-500"
                                        : status === "suspended"
                                          ? "bg-red-500"
                                          : "bg-gray-400",
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        },
                      )}
                  </CardContent>
                </Card>

                {/* Recent Disputes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4" />
                      Recent Disputes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.recentDisputes?.length ? (
                      <div className="space-y-2">
                        {analytics.recentDisputes.slice(0, 5).map((order) => (
                          <div
                            key={order._id}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {order.orderNumber}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {order.disputeReason ?? "No reason given"}
                              </p>
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">
                              {order.total.toFixed(2)} DT
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No recent disputes
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Orders chart */}
              {analytics?.dailyOrders?.length ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4" />
                      Daily Orders (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-32 items-end gap-1">
                      {(() => {
                        const days = analytics.dailyOrders.slice(-30)
                        const maxOrders = Math.max(
                          ...days.map((d) => d.orders),
                          1,
                        )
                        return days.map((day) => (
                          <div
                            key={day._id}
                            className="group relative flex flex-1 flex-col items-center justify-end"
                          >
                            <div
                              className="bg-primary/70 hover:bg-primary min-h-[2px] w-full rounded-t transition-colors"
                              style={{
                                height: `${(day.orders / maxOrders) * 100}%`,
                              }}
                            />
                            <div className="bg-popover border-border absolute bottom-full mb-1 hidden rounded border px-2 py-1 text-xs whitespace-nowrap group-hover:block">
                              {day._id}: {day.orders} orders
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No analytics data</p>
          )}
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === "stores" && (
        <div className="space-y-4">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: "Pending", value: StoreStatus.PENDING },
                { label: "Active", value: StoreStatus.ACTIVE },
                { label: "Suspended", value: StoreStatus.SUSPENDED },
                { label: "All", value: undefined },
              ] as { label: string; value: StoreStatus | undefined }[]
            ).map((f) => (
              <button
                key={f.label}
                onClick={() => setStoreStatusFilter(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  storeStatusFilter === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="pt-4">
              {storesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : storesData?.data?.length ? (
                <div>
                  {storesData.data.map((store) => (
                    <StoreRow key={store._id} store={store} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Store className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No stores found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                {
                  label: "Pending Review",
                  value: ProductStatus.PENDING_REVIEW,
                },
                { label: "Active", value: ProductStatus.ACTIVE },
                { label: "Inactive", value: ProductStatus.INACTIVE },
                { label: "Rejected", value: ProductStatus.REJECTED },
                { label: "All", value: undefined },
              ] as { label: string; value: ProductStatus | undefined }[]
            ).map((f) => (
              <button
                key={f.label}
                onClick={() => setProductStatusFilter(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  productStatusFilter === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="pt-4">
              {productsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="bg-muted h-12 w-12 animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsData?.data?.length ? (
                <div>
                  {productsData.data.map((product) => (
                    <ProductRow key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No products found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === "disputes" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="text-destructive h-4 w-4" />
              Open Disputes
              {disputesData?.count != null && (
                <Badge variant="destructive" className="ml-1">
                  {disputesData.count}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {disputesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                      <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : disputesData?.data?.length ? (
              <div>
                {disputesData.data.map((order) => (
                  <DisputeRow key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
                <p className="text-muted-foreground text-sm">
                  No open disputes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
