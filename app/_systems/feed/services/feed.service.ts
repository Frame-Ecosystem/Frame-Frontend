import { apiClient } from "@/app/_core/api/api"
import type { FeedItem, Hashtag, PaginatedContentResponse } from "@/app/_types"

function parseRateLimitRemaining(response: Response): number | undefined {
  const raw = response.headers.get("RateLimit-Remaining")
  if (!raw) return undefined

  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

class FeedServiceClass {
  /** Following-based feed (content from followed users) */
  async getFollowingFeed(
    page = 1,
    limit = 10,
    onResponseMeta?: (_meta: { rateLimitRemaining?: number }) => void,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed?${params}`,
      {
        onResponse: (response) => {
          onResponseMeta?.({
            rateLimitRemaining: parseRateLimitRemaining(response),
          })
        },
      },
    )
  }

  /** Explore / discover feed (global, sorted by engagement) */
  async getExploreFeed(
    page = 1,
    limit = 10,
    onResponseMeta?: (_meta: { rateLimitRemaining?: number }) => void,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/explore?${params}`,
      {
        onResponse: (response) => {
          onResponseMeta?.({
            rateLimitRemaining: parseRateLimitRemaining(response),
          })
        },
      },
    )
  }

  /** Saved / bookmarked content */
  async getSavedFeed(
    page = 1,
    limit = 10,
    onResponseMeta?: (_meta: { rateLimitRemaining?: number }) => void,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/saved?${params}`,
      {
        onResponse: (response) => {
          onResponseMeta?.({
            rateLimitRemaining: parseRateLimitRemaining(response),
          })
        },
      },
    )
  }

  /** Hashtag-filtered feed */
  async getHashtagFeed(
    tag: string,
    page = 1,
    limit = 10,
    onResponseMeta?: (_meta: { rateLimitRemaining?: number }) => void,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/hashtag/${encodeURIComponent(tag)}?${params}`,
      {
        onResponse: (response) => {
          onResponseMeta?.({
            rateLimitRemaining: parseRateLimitRemaining(response),
          })
        },
      },
    )
  }

  /** Trending hashtags */
  async getTrendingHashtags(limit = 20): Promise<Hashtag[]> {
    const params = new URLSearchParams({ limit: String(limit) })
    const res = await apiClient.get<{ data: Hashtag[]; message: string }>(
      `/v1/feed/hashtags/trending?${params}`,
    )
    return res.data
  }

  /** Search hashtags */
  async searchHashtags(query: string, limit = 10): Promise<Hashtag[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) })
    const res = await apiClient.get<{ data: Hashtag[]; message: string }>(
      `/v1/feed/hashtags/search?${params}`,
    )
    return res.data
  }
}

export const feedService = new FeedServiceClass()
