import { apiClient } from "@/app/_core/api/api"
import type {
  Extra,
  LoungeExtra,
  CreateExtraDto,
  UpdateExtraDto,
  AdoptExtraDto,
  UpdateAdoptedExtraDto,
  PaginatedParams,
  PaginatedResponse,
} from "../types/extras"

/* ═══════════════════════════════════════════════
   Admin — Global Extra CRUD  (/v1/admin/extras)
   ═══════════════════════════════════════════════ */

class AdminExtrasService {
  async list(
    params: PaginatedParams & { category?: string; free?: boolean } = {},
  ): Promise<PaginatedResponse<Extra>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    if (params.search) qs.set("search", params.search)
    if (params.category) qs.set("category", params.category)
    if (params.free !== undefined) qs.set("free", String(params.free))
    return apiClient.get(`/v1/admin/extras?${qs}`)
  }

  async getById(extraId: string): Promise<{ data: Extra; message: string }> {
    return apiClient.get(`/v1/admin/extras/${extraId}`)
  }

  async create(
    data: CreateExtraDto,
  ): Promise<{ data: Extra; message: string }> {
    return apiClient.post("/v1/admin/extras", data)
  }

  async update(
    extraId: string,
    data: UpdateExtraDto,
  ): Promise<{ data: Extra; message: string }> {
    return apiClient.put(`/v1/admin/extras/${extraId}`, data)
  }

  async remove(extraId: string): Promise<{ message: string }> {
    return apiClient.delete(`/v1/admin/extras/${extraId}`)
  }
}

/* ═══════════════════════════════════════════════
   Lounge — Extra Adoption  (/v1/lounge-extras)
   ═══════════════════════════════════════════════ */

class LoungeExtrasService {
  async list(
    params: PaginatedParams = {},
  ): Promise<PaginatedResponse<LoungeExtra>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    return apiClient.get(`/v1/lounge-extras?${qs}`)
  }

  async getAvailable(
    params: PaginatedParams = {},
  ): Promise<PaginatedResponse<Extra>> {
    const qs = new URLSearchParams()
    if (params.page) qs.set("page", String(params.page))
    if (params.limit) qs.set("limit", String(params.limit))
    return apiClient.get(`/v1/lounge-extras/available?${qs}`)
  }

  async adopt(
    data: AdoptExtraDto,
  ): Promise<{ data: LoungeExtra; message: string }> {
    return apiClient.post("/v1/lounge-extras", data)
  }

  async update(
    adoptedId: string,
    data: UpdateAdoptedExtraDto,
  ): Promise<{ data: LoungeExtra; message: string }> {
    return apiClient.put(`/v1/lounge-extras/${adoptedId}`, data)
  }

  async remove(adoptedId: string): Promise<{ message: string }> {
    return apiClient.delete(`/v1/lounge-extras/${adoptedId}`)
  }

  async toggle(
    adoptedId: string,
  ): Promise<{ data: LoungeExtra; message: string }> {
    return apiClient.patch(`/v1/lounge-extras/${adoptedId}/toggle`)
  }
}

export const adminExtrasService = new AdminExtrasService()
export const loungeExtrasService = new LoungeExtrasService()
