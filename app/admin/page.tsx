"use client"

import Link from "next/link"
import {
  Users,
  Package,
  Store,
  Activity,
  LayoutDashboard,
  Heart,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card"
import { Badge } from "../_components/ui/badge"
import { AdminHeader } from "./_components/admin-header"
import { StatCard, StatCardSkeleton } from "./_components/stat-card"
import { useDashboardStats, useSystemHealth } from "../_hooks/queries/useAdmin"
import { cn } from "../_lib/utils"
import { useTranslation } from "@/app/_i18n"

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { data: dashboard, isLoading } = useDashboardStats()
  const { data: health } = useSystemHealth()

  const stats = dashboard?.data

  return (
    <>
      <AdminHeader
        title={t("admin.dashboard")}
        description={t("admin.dashboard.platformOverview")}
        icon={LayoutDashboard}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title={t("admin.dashboard.totalUsers")}
              value={stats?.totalUsers ?? 0}
              icon={Users}
            />
            <StatCard
              title={t("admin.dashboard.totalLounges")}
              value={stats?.totalLounges ?? 0}
              icon={Store}
            />
            <StatCard
              title={t("admin.dashboard.totalBookings")}
              value={stats?.totalBookings ?? 0}
              icon={Package}
            />
            <StatCard
              title={t("admin.dashboard.newThisMonth")}
              value={stats?.newUsersThisMonth ?? 0}
              icon={Activity}
              className="border-green-200 dark:border-green-900"
            />
          </>
        )}
      </div>

      {/* Health status */}
      {health?.data && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" />
              {t("admin.dashboard.systemHealth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(health.data).map(([key, val]) => {
                const ok =
                  val === "ok" ||
                  val === "connected" ||
                  val === true ||
                  val === "healthy"
                return (
                  <Badge
                    key={key}
                    variant={ok ? "default" : "destructive"}
                    className="gap-1.5"
                  >
                    {ok ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {key}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className={cn("rounded-lg p-2", link.color)}>
                  <link.icon className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-base">{t(link.labelKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t(link.descKey)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

const QUICK_LINKS = [
  {
    labelKey: "admin.nav.userManagement",
    href: "/admin/users",
    icon: Users,
    color: "bg-blue-500",
    descKey: "admin.nav.userManagementDesc",
  },
  {
    labelKey: "admin.nav.contentModeration",
    href: "/admin/moderation",
    icon: Flag,
    color: "bg-red-500",
    descKey: "admin.nav.contentModerationDesc",
  },
  {
    labelKey: "admin.nav.services",
    href: "/admin/services",
    icon: Package,
    color: "bg-purple-500",
    descKey: "admin.nav.servicesDesc",
  },
  {
    labelKey: "admin.nav.loungeServices",
    href: "/admin/lounge-services",
    icon: Store,
    color: "bg-orange-500",
    descKey: "admin.nav.loungeServicesDesc",
  },
  {
    labelKey: "admin.nav.queue",
    href: "/admin/queue",
    icon: Clock,
    color: "bg-teal-500",
    descKey: "admin.nav.queueDesc",
  },
  {
    labelKey: "admin.nav.system",
    href: "/admin/system",
    icon: Activity,
    color: "bg-green-500",
    descKey: "admin.nav.systemDesc",
  },
]
