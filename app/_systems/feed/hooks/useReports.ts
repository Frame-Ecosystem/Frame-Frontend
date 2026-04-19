import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { reportService } from "@/app/_services/report.service"
import { toast } from "sonner"
import { contentKeys, extractPagination } from "./content-keys"

export function useCreateReport() {
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      reason,
    }: {
      targetType: "post" | "reel" | "comment"
      targetId: string
      reason: string
    }) => reportService.createReport(targetType, targetId, { reason }),
    onSuccess: () =>
      toast.success("Report submitted. We'll review it shortly."),
    onError: (err) => {
      const msg = (err as any)?.message ?? ""
      if (msg.includes("409") || msg.includes("already reported")) {
        toast.info("You've already reported this content")
      } else {
        toast.error("Failed to submit report")
      }
    },
  })
}

/** Admin: list reports */
export function useReports(
  status?: "pending" | "reviewed" | "dismissed",
  limit = 20,
) {
  return useInfiniteQuery({
    queryKey: contentKeys.reports(status),
    queryFn: ({ pageParam = 1 }) =>
      reportService.getReports(status, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
  })
}

/** Admin: review report */
export function useReviewReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      reportId,
      status,
      adminNote,
    }: {
      reportId: string
      status: "reviewed" | "dismissed"
      adminNote?: string
    }) => reportService.reviewReport(reportId, { status, adminNote }),
    onSuccess: () => {
      toast.success("Report reviewed")
      qc.invalidateQueries({ queryKey: ["reports"] })
    },
    onError: () => toast.error("Failed to review report"),
  })
}
