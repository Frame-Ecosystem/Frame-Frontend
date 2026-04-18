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
import { StatCard, StatCardSkeleton } from "../_components/stat-card"
import { useSuggestionStats } from "../../_hooks/queries/useAdmin"

export default function SuggestionsPage() {
  const { data: statsData, isLoading } = useSuggestionStats()
  const stats = statsData?.data

  return (
    <>
      <AdminHeader
        title="Service Suggestions"
        description="Overview of service suggestions submitted by lounges"
        icon={Lightbulb}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard title="Total" value={stats.total} icon={Lightbulb} />
            <StatCard title="Pending" value={stats.pending} icon={Clock} />
            <StatCard
              title="Under Review"
              value={stats.underReview}
              icon={Eye}
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={CheckCircle}
            />
            <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
            <StatCard
              title="Implemented"
              value={stats.implemented}
              icon={Rocket}
            />
          </>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Suggestions Work</CardTitle>
          <CardDescription>
            Lounges submit service suggestions through their dashboard. Use the
            status and approval endpoints to process individual suggestions by
            ID. When a suggestion is approved and implemented, the system
            automatically creates the service, assigns it to the lounge, and
            notifies the lounge owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            <strong>Flow:</strong> Pending → Under Review → Approved / Rejected
            → Implemented
          </p>
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
