"use client"

import { useState, useMemo } from "react"
import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Shield, Flag, Eye, Check, X } from "lucide-react"
import { ErrorBoundary } from "../../_components/common/errorBoundary"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select"
import { Badge } from "../../_components/ui/badge"
import { Textarea } from "../../_components/ui/textarea"
import { useReports, useReviewReport } from "../../_hooks/queries/useContent"
import type { Report, ReportStatus } from "../../_types/content"
import { formatDistanceToNow } from "date-fns"

export default function ContentModerationPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all")

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const reportsQuery = useReports(
    statusFilter === "all" ? undefined : statusFilter,
  )
  const reports: Report[] = useMemo(() => {
    return (
      reportsQuery.data?.pages.flatMap((page) => page.data as Report[]) ?? []
    )
  }, [reportsQuery.data])

  if (isLoading || !user || user.type !== "admin") return null

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br pb-24 lg:pb-0">
        <div className="mx-auto max-w-4xl p-5 lg:px-8 lg:py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Content Moderation</h1>
                <p className="text-muted-foreground text-sm">
                  Review and manage reported content
                </p>
              </div>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports list */}
          <div className="space-y-4">
            {reports.length === 0 && !reportsQuery.isLoading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Flag className="text-muted-foreground mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    No reports found
                  </p>
                </CardContent>
              </Card>
            )}

            {reports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}

            {reportsQuery.hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => reportsQuery.fetchNextPage()}
                  disabled={reportsQuery.isFetchingNextPage}
                >
                  {reportsQuery.isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function ReportCard({ report }: { report: Report }) {
  const [reviewNote, setReviewNote] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const reviewReport = useReviewReport()

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    reviewed: "bg-green-500/10 text-green-600",
    dismissed: "bg-gray-500/10 text-gray-600",
  }

  const handleReview = (action: "reviewed" | "dismissed") => {
    reviewReport.mutate(
      {
        reportId: report._id,
        status: action,
        adminNote: reviewNote || undefined,
      },
      {
        onSuccess: () => setReviewing(false),
      },
    )
  }

  const reporterName =
    typeof report.reporterId === "string"
      ? report.reporterId
      : report.reporterId?.loungeTitle ||
        report.reporterId?.firstName ||
        "Unknown"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-500" />
              <CardTitle className="text-base">
                {report.targetType} Report
              </CardTitle>
              <Badge
                variant="secondary"
                className={statusColor[report.status] || ""}
              >
                {report.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Reported by {reporterName} &middot;{" "}
              {formatDistanceToNow(new Date(report.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-sm font-medium">Reason: {report.reason}</p>
          {report.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {report.description}
            </p>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Target ID: {report.targetId}
        </p>

        {report.adminNote && (
          <div className="rounded-md border p-3">
            <p className="text-xs font-medium">Admin Note:</p>
            <p className="text-muted-foreground text-sm">{report.adminNote}</p>
          </div>
        )}

        {report.status === "pending" && !reviewing && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => setReviewing(true)}
              className="gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              Review
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReview("dismissed")}
              disabled={reviewReport.isPending}
              className="gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        )}

        {reviewing && (
          <div className="space-y-3 border-t pt-3">
            <Textarea
              placeholder="Admin note (optional)..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleReview("reviewed")}
                disabled={reviewReport.isPending}
                className="gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Mark Reviewed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview("dismissed")}
                disabled={reviewReport.isPending}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReviewing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
