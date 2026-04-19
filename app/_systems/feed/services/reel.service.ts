import { apiClient } from "@/app/_core/api/api"
import type {
  Reel,
  UpdateReelInput,
  PaginatedContentResponse,
  SingleContentResponse,
} from "@/app/_types"

class ReelServiceClass {
  /** Create a new reel (multipart/form-data) */
  async createReel(input: {
    video: File
    thumbnail?: File
    caption?: string
    duration: number
    hashtags?: string[]
  }): Promise<Reel> {
    const formData = new FormData()
    formData.append("video", input.video)
    if (input.thumbnail) formData.append("thumbnail", input.thumbnail)
    if (input.caption) formData.append("caption", input.caption)
    formData.append("duration", String(input.duration))
    if (input.hashtags?.length) {
      formData.append("hashtags", JSON.stringify(input.hashtags))
    }
    const res = await apiClient.post<SingleContentResponse<Reel>>(
      "/v1/reels",
      formData,
    )
    return res.data
  }

  /** Get a single reel */
  async getReel(reelId: string): Promise<Reel> {
    const res = await apiClient.get<SingleContentResponse<Reel>>(
      `/v1/reels/${reelId}`,
    )
    return res.data
  }

  /** Get a user's reels (paginated) */
  async getUserReels(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<Reel>> {
    return apiClient.get<PaginatedContentResponse<Reel>>(
      `/v1/reels/user/${userId}?page=${page}&limit=${limit}`,
    )
  }

  /** Update reel caption/hashtags */
  async updateReel(reelId: string, data: UpdateReelInput): Promise<Reel> {
    const res = await apiClient.put<SingleContentResponse<Reel>>(
      `/v1/reels/${reelId}`,
      data,
    )
    return res.data
  }

  /** Delete own reel */
  async deleteReel(reelId: string): Promise<void> {
    await apiClient.delete(`/v1/me/reels/${reelId}`)
  }

  /** Toggle like */
  async toggleLike(reelId: string): Promise<{ liked: boolean }> {
    const res = await apiClient.post<{ data: { liked: boolean } }>(
      `/v1/reels/${reelId}/like`,
    )
    return res.data
  }

  /** Toggle save/bookmark */
  async toggleSave(reelId: string): Promise<{ saved: boolean }> {
    const res = await apiClient.post<{ data: { saved: boolean } }>(
      `/v1/reels/${reelId}/save`,
    )
    return res.data
  }

  /* ── Admin ── */

  async hideReel(reelId: string): Promise<Reel> {
    const res = await apiClient.put<SingleContentResponse<Reel>>(
      `/v1/reels/${reelId}/hide`,
    )
    return res.data
  }

  async unhideReel(reelId: string): Promise<Reel> {
    const res = await apiClient.put<SingleContentResponse<Reel>>(
      `/v1/reels/${reelId}/unhide`,
    )
    return res.data
  }

  async adminDeleteReel(reelId: string): Promise<void> {
    await apiClient.delete(`/v1/reels/${reelId}/admin`)
  }
}

export const reelService = new ReelServiceClass()
