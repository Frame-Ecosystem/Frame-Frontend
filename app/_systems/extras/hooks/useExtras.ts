import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import { clientService } from "@/app/_services"
import {
  adminExtrasService,
  loungeExtrasService,
} from "../services/extras.service"
import type {
  CreateExtraDto,
  UpdateExtraDto,
  AdoptExtraDto,
  PaginatedParams,
} from "../types/extras"
import { toast } from "sonner"

/* ═══════════════════════════════════════════════
   Query Key Factory
   ═══════════════════════════════════════════════ */

export const extrasKeys = {
  all: ["extras"] as const,
  admin: {
    all: () => [...extrasKeys.all, "admin"] as const,
    list: (params?: PaginatedParams & { category?: string; free?: boolean }) =>
      [...extrasKeys.admin.all(), "list", params] as const,
  },
  lounge: {
    all: () => [...extrasKeys.all, "lounge"] as const,
    list: (params?: PaginatedParams) =>
      [...extrasKeys.lounge.all(), "list", params] as const,
    available: (params?: PaginatedParams) =>
      [...extrasKeys.lounge.all(), "available", params] as const,
  },
}

/* ═══════════════════════════════════════════════
   Admin — Extras Hooks
   ═══════════════════════════════════════════════ */

export function useAdminExtras(
  params: PaginatedParams & { category?: string; free?: boolean } = {},
) {
  return useQuery({
    queryKey: extrasKeys.admin.list(params),
    queryFn: () => adminExtrasService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExtraDto) => adminExtrasService.create(data),
    onSuccess: () => {
      toast.success("Extra created")
      qc.invalidateQueries({ queryKey: extrasKeys.admin.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create extra"),
  })
}

export function useUpdateExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExtraDto }) =>
      adminExtrasService.update(id, data),
    onSuccess: () => {
      toast.success("Extra updated")
      qc.invalidateQueries({ queryKey: extrasKeys.admin.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update extra"),
  })
}

export function useDeleteExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminExtrasService.remove(id),
    onSuccess: () => {
      toast.success("Extra deleted")
      qc.invalidateQueries({ queryKey: extrasKeys.admin.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete extra"),
  })
}

/* ═══════════════════════════════════════════════
   Lounge — Extras Hooks
   ═══════════════════════════════════════════════ */

export function useLoungeExtras(params: PaginatedParams = {}) {
  return useQuery({
    queryKey: extrasKeys.lounge.list(params),
    queryFn: () => loungeExtrasService.list(params),
    placeholderData: keepPreviousData,
    throwOnError: false,
  })
}

export function useAvailableExtras(params: PaginatedParams = {}) {
  return useQuery({
    queryKey: extrasKeys.lounge.available(params),
    queryFn: () => loungeExtrasService.getAvailable(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdoptExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdoptExtraDto) => loungeExtrasService.adopt(data),
    onSuccess: () => {
      toast.success("Extra adopted successfully")
      qc.invalidateQueries({ queryKey: extrasKeys.lounge.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to adopt extra"),
  })
}

export function useRemoveAdoptedExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => loungeExtrasService.remove(id),
    onSuccess: () => {
      toast.success("Extra removed successfully")
      qc.invalidateQueries({ queryKey: extrasKeys.lounge.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to remove extra"),
  })
}

export function useToggleExtra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => loungeExtrasService.toggle(id),
    onSuccess: () => {
      toast.success("Extra status toggled")
      qc.invalidateQueries({ queryKey: extrasKeys.lounge.all() })
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to toggle extra"),
  })
}

/* ═══════════════════════════════════════════════
   Client — Lounge Visitor Extras Hook
   ═══════════════════════════════════════════════ */

export function useVisitorLoungeExtras(loungeId: string) {
  return useQuery({
    queryKey: [...extrasKeys.all, "visitor", loungeId] as const,
    queryFn: () => clientService.getLoungeExtrasById(loungeId),
    enabled: !!loungeId,
  })
}
