import { apiClient } from "./api"
import type { Rating, PaginatedRatings, SubmitRatingInput } from "../_types"

class RatingService {
  /** Create or update the authenticated client's rating for a lounge. */
  async upsert(input: SubmitRatingInput): Promise<Rating> {
    const body: SubmitRatingInput = {
      loungeId: input.loungeId,
      score: input.score,
    }
    if (input.comment?.trim()) body.comment = input.comment.trim()
    const res = await apiClient.put<{ data: Rating }>("/v1/ratings", body)
    return (res as any).data ?? res
  }

  /** Delete the authenticated client's rating for a lounge. */
  async remove(loungeId: string): Promise<void> {
    await apiClient.delete(`/v1/ratings/${loungeId}`)
  }

  /** Fetch paginated ratings for a lounge. */
  async getLoungeRatings(
    loungeId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedRatings> {
    const res = await apiClient.get<PaginatedRatings>(
      `/v1/ratings/lounge/${loungeId}?page=${page}&limit=${limit}`,
    )
    return res
  }

  /** Fetch the authenticated client's own rating for a lounge (or null). */
  async getMyRating(loungeId: string): Promise<Rating | null> {
    const res = await apiClient.get<{ data: Rating | null }>(
      `/v1/ratings/me/${loungeId}`,
    )
    return (res as any).data ?? res ?? null
  }
}

export const ratingService = new RatingService()
