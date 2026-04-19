import { apiClient } from "@/app/_core/api/api"
import type {
  LikeToggleResult,
  LikedLounge,
  LoungeLiker,
  PaginatedLikes,
} from "@/app/_types"

class LikeService {
  /** Toggle like/unlike for a lounge. */
  async toggle(loungeId: string): Promise<LikeToggleResult> {
    const res = await apiClient.post<{ data: LikeToggleResult }>(
      `/v1/likes/${loungeId}`,
    )
    return (res as any).data ?? res
  }

  /** Check whether the authenticated client has liked a lounge. */
  async checkLiked(loungeId: string): Promise<boolean> {
    const res = await apiClient.get<{ data: { liked: boolean } }>(
      `/v1/likes/check/${loungeId}`,
    )
    return ((res as any).data ?? res).liked
  }

  /** Get the authenticated client's liked lounges (paginated). */
  async getMyLikes(page = 1, limit = 20): Promise<PaginatedLikes<LikedLounge>> {
    const res = await apiClient.get<PaginatedLikes<LikedLounge>>(
      `/v1/likes/me?page=${page}&limit=${limit}`,
    )
    return res
  }

  /** Get clients who liked a specific lounge (paginated). */
  async getLoungeLikers(
    loungeId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedLikes<LoungeLiker>> {
    const res = await apiClient.get<PaginatedLikes<LoungeLiker>>(
      `/v1/likes/lounge/${loungeId}?page=${page}&limit=${limit}`,
    )
    return res
  }
}

export const likeService = new LikeService()
