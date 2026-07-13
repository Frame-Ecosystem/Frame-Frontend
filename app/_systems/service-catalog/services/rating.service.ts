import { apiClient } from "@/app/_core/api/api"
import type { Rating, PaginatedRatings, SubmitRatingInput } from "@/app/_types"

class RatingService {
  /** Create or update the authenticated user's rating for a target. */
  async upsert(input: SubmitRatingInput): Promise<Rating> {
    const body: { targetId: string; score: number; comment?: string } = {
      targetId: input.targetId,
      score: input.score,
    }
    if (input.comment?.trim()) body.comment = input.comment.trim()
    const res = await apiClient.put<{ data: Rating }>("/v1/ratings", body)
    return res.data
  }

  /** Delete the authenticated user's rating for a target. */
  async remove(targetId: string): Promise<void> {
    await apiClient.delete(`/v1/ratings/${targetId}`)
  }

  /** Fetch paginated ratings for a target (lounge or agent). */
  async getTargetRatings(
    targetId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedRatings> {
    return apiClient.get<PaginatedRatings>(
      `/v1/ratings/target/${targetId}?page=${page}&limit=${limit}`,
      { suppressAuthFailure: true },
    )
  }

  /** Fetch the authenticated user's own rating for a target (or null). */
  async getMyRating(targetId: string): Promise<Rating | null> {
    const res = await apiClient.get<{ data: Rating | null }>(
      `/v1/ratings/me/${targetId}`,
      { suppressAuthFailure: true },
    )
    return res.data ?? null
  }
}

export const ratingService = new RatingService()
