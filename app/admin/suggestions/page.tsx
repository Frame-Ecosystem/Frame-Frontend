"use client"

import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Rocket,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { AdminHeader } from "../_components/admin-header"
import { useTranslation } from "@/app/_i18n"
import { StatCard, StatCardSkeleton } from "../_components/stat-card"
import { useSuggestionStats } from "../../_hooks/queries/useAdmin"

export default function SuggestionsPage() {
  const { t } = useTranslation()
  const { data: statsData, isLoading } = useSuggestionStats()
  const stats = statsData?.data

  return (
    <>
      <AdminHeader
        title={t("admin.suggestions.title")}
        description={t("admin.suggestions.desc")}
        icon={Lightbulb}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title={t("admin.suggestions.total")}
              value={stats.total}
              icon={Lightbulb}
            />
            <StatCard
              title={t("admin.suggestions.pending")}
              value={stats.pending}
              icon={Clock}
            />
            <StatCard
              title={t("admin.suggestions.underReview")}
              value={stats.underReview}
              icon={Eye}
            />
            <StatCard
              title={t("admin.suggestions.approved")}
              value={stats.approved}
              icon={CheckCircle}
            />
            <StatCard
              title={t("admin.suggestions.rejected")}
              value={stats.rejected}
              icon={XCircle}
            />
            <StatCard
              title={t("admin.suggestions.implemented")}
              value={stats.implemented}
              icon={Rocket}
            />
          </>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.suggestions.howItWorks")}</CardTitle>
          <CardDescription>
            {t("admin.suggestions.howItWorksDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>{t("admin.suggestions.flow")}</p>
          <p>
            Use{" "}
            <code className="bg-muted rounded px-1">
              PATCH /suggestions/:id/status
            </code>{" "}
            to update status, and{" "}
            <code className="bg-muted rounded px-1">
              PATCH /suggestions/:id/approve
            </code>{" "}
            to approve with implementation details (name, category, price,
            duration, gender).
          </p>
        </CardContent>
      </Card>
    </>
  )
}
