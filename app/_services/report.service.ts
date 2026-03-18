import { apiClient } from "./api"
import type {
  Report,
  CreateReportInput,
  ReviewReportInput,
  PaginatedContentResponse,
  SingleContentResponse,
} from "../_types"

class ReportServiceClass {
  /** Report a post, reel, or comment */
  async createReport(
    targetType: "post" | "reel" | "comment",
    targetId: string,
    data: CreateReportInput,
  ): Promise<Report> {
    const res = await apiClient.post<SingleContentResponse<Report>>(
      `/v1/reports/${targetType}/${targetId}`,
      data,
    )
    return res.data
  }

  /** List reports (admin only) */
  async getReports(
    status?: "pending" | "reviewed" | "dismissed",
    page = 1,
    limit = 20,
  ): Promise<PaginatedContentResponse<Report>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (status) params.set("status", status)
    return apiClient.get<PaginatedContentResponse<Report>>(
      `/v1/reports?${params.toString()}`,
    )
  }

  /** Review a report (admin only) */
  async reviewReport(
    reportId: string,
    data: ReviewReportInput,
  ): Promise<Report> {
    const res = await apiClient.put<SingleContentResponse<Report>>(
      `/v1/reports/${reportId}`,
      data,
    )
    return res.data
  }
}

export const reportService = new ReportServiceClass()
