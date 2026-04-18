"use client"

import { useState } from "react"
import { Flag, Eye, EyeOff, Trash2, CheckCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../_components/ui/table"
import { Badge } from "../../_components/ui/badge"
import { Button } from "../../_components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select"
import { Label } from "../../_components/ui/label"
import { Textarea } from "../../_components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../_components/ui/dialog"
import { AdminHeader } from "../_components/admin-header"
import {
  DataTablePagination,
  DataTableSkeleton,
  EmptyState,
} from "../_components/data-table"
import { useConfirmDialog } from "../_components/confirm-dialog"
import {
  useAdminReports,
  useAdminReviewReport,
  useAdminHideContent,
  useAdminUnhideContent,
  useAdminDeleteContent,
} from "../../_hooks/queries/useAdmin"
import type {
  AdminReport,
  AdminReportStatus,
  ReviewReportDto,
} from "../../_types/admin"

const LIMIT = 20

const STATUS_COLORS: Record<AdminReportStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700",
  reviewed: "bg-blue-500/10 text-blue-700",
  dismissed: "bg-gray-500/10 text-gray-700",
  action_taken: "bg-green-500/10 text-green-700",
}

export default function ModerationPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [reviewReport, setReviewReport] = useState<AdminReport | null>(null)
  const [reviewForm, setReviewForm] = useState<ReviewReportDto>({
    status: "reviewed",
    adminNote: "",
  })

  const { data, isLoading } = useAdminReports({
    page,
    limit: LIMIT,
    status: statusFilter === "all" ? undefined : statusFilter,
  })
  const review = useAdminReviewReport()
  const hide = useAdminHideContent()
  const unhide = useAdminUnhideContent()
  const del = useAdminDeleteContent()
  const { confirm, dialog } = useConfirmDialog()

  const reports = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const reporterName = (r: AdminReport) => {
    const rep = r.reporter
    if (!rep) return "Unknown"
    if (rep.firstName) return `${rep.firstName} ${rep.lastName ?? ""}`.trim()
    if (rep.loungeTitle) return rep.loungeTitle
    return rep._id
  }

  return (
    <>
      <AdminHeader
        title="Content Moderation"
        description="Review reports and moderate platform content"
        icon={Flag}
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label className="text-sm">Status:</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="action_taken">Action Taken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reports.length === 0 ? (
            <EmptyState
              icon={<Flag />}
              title="No reports"
              description="No reports match the current filter"
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-48">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="text-sm">
                        {reporterName(r)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {r.targetType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {r.reason}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[r.status]}>
                          {r.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Review"
                            onClick={() => {
                              setReviewReport(r)
                              setReviewForm({
                                status: "reviewed",
                                adminNote: "",
                              })
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Hide content"
                            onClick={() =>
                              hide.mutate({
                                type: r.targetType,
                                id: r.targetId,
                              })
                            }
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Unhide content"
                            onClick={() =>
                              unhide.mutate({
                                type: r.targetType,
                                id: r.targetId,
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete content"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              confirm({
                                title: "Delete content?",
                                description:
                                  "This will permanently delete the reported content.",
                                confirmLabel: "Delete",
                                variant: "destructive",
                                onConfirm: () =>
                                  del.mutateAsync({
                                    type: r.targetType,
                                    id: r.targetId,
                                  }),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DataTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Review dialog */}
      {reviewReport && (
        <Dialog
          open={!!reviewReport}
          onOpenChange={(o) => !o && setReviewReport(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={reviewForm.status}
                  onValueChange={(v) =>
                    setReviewForm((f) => ({
                      ...f,
                      status: v as ReviewReportDto["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="action_taken">Action Taken</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Note</Label>
                <Textarea
                  value={reviewForm.adminNote ?? ""}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, adminNote: e.target.value }))
                  }
                  placeholder="Optional note about the decision..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewReport(null)}>
                Cancel
              </Button>
              <Button
                disabled={review.isPending}
                onClick={() =>
                  review
                    .mutateAsync({
                      reportId: reviewReport._id,
                      data: reviewForm,
                    })
                    .then(() => setReviewReport(null))
                }
              >
                {review.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {dialog}
    </>
  )
}
