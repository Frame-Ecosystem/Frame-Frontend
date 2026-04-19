import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import {
  adminUsers,
  adminSystem,
  adminModeration,
  adminServices,
  adminCategories,
  adminSuggestions,
  adminLoungeServices,
  adminQueue,
} from "@/app/_services/admin.service"
import type {
  PaginatedParams,
  CreateUserDto,
  UpdateUserDto,
  ReviewReportDto,
  CreateServiceDto,
  UpdateServiceDto,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  UpdateSuggestionStatusDto,
  ApproveSuggestionDto,
  CreateLoungeServiceDto,
  AuditLogInput,
} from "@/app/_types/admin"
import { toast } from "sonner"

/* ═══════════════════════════════════════════════
   Query Key Factory
   ═══════════════════════════════════════════════ */

export const adminKeys = {
  all: ["admin"] as const,

  // Users
  users: (params?: PaginatedParams) => [...adminKeys.all, "users", params],
  user: (id: string) => [...adminKeys.all, "users", id],
  sessions: () => [...adminKeys.all, "sessions"],
  loungeNames: () => [...adminKeys.all, "lounge-names"],

  // System
  dashboard: () => [...adminKeys.all, "dashboard"],
  systemStats: () => [...adminKeys.all, "system-stats"],
  health: () => [...adminKeys.all, "health"],
  activityLog: (limit?: number) => [...adminKeys.all, "activity-log", limit],

  // Moderation
  reports: (params?: PaginatedParams & { status?: string }) => [
    ...adminKeys.all,
    "reports",
    params,
  ],

  // Catalog
  services: (params?: PaginatedParams) => [
    ...adminKeys.all,
    "services",
    params,
  ],
  service: (id: string) => [...adminKeys.all, "services", id],
  categories: () => [...adminKeys.all, "categories"],
  category: (id: string) => [...adminKeys.all, "categories", id],
  suggestions: () => [...adminKeys.all, "suggestions"],
  suggestionStats: () => [...adminKeys.all, "suggestion-stats"],
  loungeServices: (params?: PaginatedParams) => [
    ...adminKeys.all,
    "lounge-services",
    params,
  ],
} as const

/* ═══════════════════════════════════════════════
   User Management Hooks
   ═══════════════════════════════════════════════ */

export function useAdminUsers(params: PaginatedParams = {}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminUsers.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => adminUsers.getById(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDto) => adminUsers.create(data),
    onSuccess: () => {
      toast.success("User created")
      qc.invalidateQueries({ queryKey: adminKeys.users() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create user"),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      adminUsers.update(id, data),
    onSuccess: (_d, { id }) => {
      toast.success("User updated")
      qc.invalidateQueries({ queryKey: adminKeys.users() })
      qc.invalidateQueries({ queryKey: adminKeys.user(id) })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update user"),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminUsers.remove(id),
    onSuccess: () => {
      toast.success("User deleted")
      qc.invalidateQueries({ queryKey: adminKeys.users() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete user"),
  })
}

export function useToggleBlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminUsers.toggleBlock(id, isBlocked),
    onSuccess: (_d, { isBlocked }) => {
      toast.success(isBlocked ? "User blocked" : "User unblocked")
      qc.invalidateQueries({ queryKey: adminKeys.users() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update block status"),
  })
}

export function useSessionInfo() {
  return useQuery({
    queryKey: adminKeys.sessions(),
    queryFn: () => adminUsers.getSessionInfo(),
  })
}

export function useLoungeNames() {
  return useQuery({
    queryKey: adminKeys.loungeNames(),
    queryFn: () => adminUsers.getLoungeNames(),
  })
}

/* ═══════════════════════════════════════════════
   System Hooks
   ═══════════════════════════════════════════════ */

export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminSystem.getDashboard(),
  })
}

export function useSystemStats() {
  return useQuery({
    queryKey: adminKeys.systemStats(),
    queryFn: () => adminSystem.getStats(),
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: adminKeys.health(),
    queryFn: () => adminSystem.getHealth(),
    refetchInterval: 30_000, // auto-refresh every 30s
  })
}

export function useActivityLog(limit = 100) {
  return useQuery({
    queryKey: adminKeys.activityLog(limit),
    queryFn: () => adminSystem.getActivityLog(limit),
  })
}

export function useClearSessions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminSystem.clearSessions(userId),
    onSuccess: () => {
      toast.success("Sessions cleared")
      qc.invalidateQueries({ queryKey: adminKeys.sessions() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to clear sessions"),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string
      newPassword: string
    }) => adminSystem.resetPassword(userId, newPassword),
    onSuccess: () => toast.success("Password reset successfully"),
    onError: (err: Error) =>
      toast.error(err.message || "Failed to reset password"),
  })
}

export function useExportUserData() {
  return useMutation({
    mutationFn: (userId: string) => adminSystem.exportUserData(userId),
  })
}

export function useCreateAuditLog() {
  return useMutation({
    mutationFn: (data: AuditLogInput) => adminSystem.createAuditLog(data),
  })
}

/* ═══════════════════════════════════════════════
   Content Moderation Hooks
   ═══════════════════════════════════════════════ */

export function useAdminReports(
  params: PaginatedParams & { status?: string } = {},
) {
  return useQuery({
    queryKey: adminKeys.reports(params),
    queryFn: () => adminModeration.getReports(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminReviewReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string
      data: ReviewReportDto
    }) => adminModeration.reviewReport(reportId, data),
    onSuccess: () => {
      toast.success("Report reviewed")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "reports"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to review report"),
  })
}

export function useAdminHideContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "post" | "reel" | "comment"
      id: string
    }) => {
      if (type === "post") return adminModeration.hidePost(id)
      if (type === "reel") return adminModeration.hideReel(id)
      return adminModeration.hideComment(id)
    },
    onSuccess: () => {
      toast.success("Content hidden")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "reports"] })
    },
  })
}

export function useAdminUnhideContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "post" | "reel" | "comment"
      id: string
    }) => {
      if (type === "post") return adminModeration.unhidePost(id)
      if (type === "reel") return adminModeration.unhideReel(id)
      return adminModeration.unhideComment(id)
    },
    onSuccess: () => {
      toast.success("Content unhidden")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "reports"] })
    },
  })
}

export function useAdminDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "post" | "reel" | "comment"
      id: string
    }) => {
      if (type === "post") return adminModeration.deletePost(id)
      if (type === "reel") return adminModeration.deleteReel(id)
      return adminModeration.deleteComment(id)
    },
    onSuccess: () => {
      toast.success("Content deleted")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "reports"] })
    },
  })
}

/* ═══════════════════════════════════════════════
   Catalog — Services Hooks
   ═══════════════════════════════════════════════ */

export function useAdminServices(params: PaginatedParams = {}) {
  return useQuery({
    queryKey: adminKeys.services(params),
    queryFn: () => adminServices.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminService(id: string) {
  return useQuery({
    queryKey: adminKeys.service(id),
    queryFn: () => adminServices.getById(id),
    enabled: !!id,
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateServiceDto) => adminServices.create(data),
    onSuccess: () => {
      toast.success("Service created")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "services"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create service"),
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      adminServices.update(id, data),
    onSuccess: () => {
      toast.success("Service updated")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "services"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update service"),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminServices.remove(id),
    onSuccess: () => {
      toast.success("Service deleted")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "services"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete service"),
  })
}

/* ═══════════════════════════════════════════════
   Catalog — Categories Hooks
   ═══════════════════════════════════════════════ */

export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: () => adminCategories.list(),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateServiceCategoryDto) =>
      adminCategories.create(data),
    onSuccess: () => {
      toast.success("Category created")
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create category"),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateServiceCategoryDto
    }) => adminCategories.update(id, data),
    onSuccess: () => {
      toast.success("Category updated")
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update category"),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminCategories.remove(id),
    onSuccess: () => {
      toast.success("Category deleted")
      qc.invalidateQueries({ queryKey: adminKeys.categories() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete category"),
  })
}

/* ═══════════════════════════════════════════════
   Catalog — Suggestions Hooks
   ═══════════════════════════════════════════════ */

export function useSuggestionStats() {
  return useQuery({
    queryKey: adminKeys.suggestionStats(),
    queryFn: () => adminSuggestions.getStats(),
  })
}

export function useUpdateSuggestionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateSuggestionStatusDto
    }) => adminSuggestions.updateStatus(id, data),
    onSuccess: () => {
      toast.success("Suggestion status updated")
      qc.invalidateQueries({ queryKey: adminKeys.suggestions() })
      qc.invalidateQueries({ queryKey: adminKeys.suggestionStats() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update suggestion"),
  })
}

export function useApproveSuggestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveSuggestionDto }) =>
      adminSuggestions.approve(id, data),
    onSuccess: () => {
      toast.success("Suggestion processed")
      qc.invalidateQueries({ queryKey: adminKeys.suggestions() })
      qc.invalidateQueries({ queryKey: adminKeys.suggestionStats() })
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "services"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to process suggestion"),
  })
}

/* ═══════════════════════════════════════════════
   Catalog — Lounge Services Hooks
   ═══════════════════════════════════════════════ */

export function useAdminLoungeServices(params: PaginatedParams = {}) {
  return useQuery({
    queryKey: adminKeys.loungeServices(params),
    queryFn: () => adminLoungeServices.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useBulkCreateLoungeServices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLoungeServiceDto[]) =>
      adminLoungeServices.bulkCreate(data),
    onSuccess: () => {
      toast.success("Lounge services created")
      qc.invalidateQueries({ queryKey: [...adminKeys.all, "lounge-services"] })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create lounge services"),
  })
}

/* ═══════════════════════════════════════════════
   Queue Hooks
   ═══════════════════════════════════════════════ */

export function usePopulateDailyQueues() {
  return useMutation({
    mutationFn: () => adminQueue.populateDailyQueues(),
    onSuccess: () => toast.success("Daily queues populated"),
    onError: (err: Error) =>
      toast.error(err.message || "Failed to populate queues"),
  })
}
