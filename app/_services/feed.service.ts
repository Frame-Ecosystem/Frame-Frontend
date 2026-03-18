import { apiClient } from "./api"
import type { FeedItem, Hashtag, PaginatedContentResponse } from "../_types"

class FeedServiceClass {
  /** Following-based feed (content from followed users) */
  async getFollowingFeed(
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed?page=${page}&limit=${limit}`,
    )
  }

  /** Explore / discover feed (global, sorted by engagement) */
  async getExploreFeed(
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/explore?page=${page}&limit=${limit}`,
    )
  }

  /** Saved / bookmarked content */
  async getSavedFeed(
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/saved?page=${page}&limit=${limit}`,
    )
  }

  /** Hashtag-filtered feed */
  async getHashtagFeed(
    tag: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedContentResponse<FeedItem>> {
    return apiClient.get<PaginatedContentResponse<FeedItem>>(
      `/v1/feed/hashtag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`,
    )
  }

  /** Trending hashtags */
  async getTrendingHashtags(limit = 20): Promise<Hashtag[]> {
    const res = await apiClient.get<{ data: Hashtag[]; message: string }>(
      `/v1/feed/hashtags/trending?limit=${limit}`,
    )
    return res.data
  }

  /** Search hashtags */
  async searchHashtags(query: string, limit = 10): Promise<Hashtag[]> {
    const res = await apiClient.get<{ data: Hashtag[]; message: string }>(
      `/v1/feed/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    )
    return res.data
  }
}

export const feedService = new FeedServiceClass()
