import { apiClient } from "@/app/_core/api/api"
import type {
  LikeToggleResult,
  LikedTarget,
  TargetLiker,
  PaginatedLikes,
} from "@/app/_types"

class LikeService {
  /** Toggle like/unlike for a target (lounge or agent). */
  async toggle(targetId: string): Promise<LikeToggleResult> {
    const res = await apiClient.post<{ data: LikeToggleResult }>(
      `/v1/likes/${targetId}`,
    )
    return res.data
  }

  /** Check whether the authenticated user has liked a target. */
  async checkLiked(targetId: string): Promise<boolean> {
    const res = await apiClient.get<{ data: { liked: boolean } }>(
      `/v1/likes/check/${targetId}`,
      { suppressAuthFailure: true },
    )
    return res.data.liked
  }

  /** Get the authenticated user's liked targets (paginated). */
  async getMyLikes(page = 1, limit = 20): Promise<PaginatedLikes<LikedTarget>> {
    return apiClient.get<PaginatedLikes<LikedTarget>>(
      `/v1/likes/me?page=${page}&limit=${limit}`,
    )
  }

  /** Get users who liked a specific target (paginated). */
  async getTargetLikers(
    targetId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedLikes<TargetLiker>> {
    return apiClient.get<PaginatedLikes<TargetLiker>>(
      `/v1/likes/target/${targetId}?page=${page}&limit=${limit}`,
    )
  }
}

export const likeService = new LikeService()
