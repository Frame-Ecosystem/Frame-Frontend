import { apiClient } from "@/app/_core/api/api"
import type {
  FollowToggleResult,
  FollowCheckResult,
  FollowCounts,
  FollowingRecord,
  FollowerRecord,
  PaginatedFollows,
} from "@/app/_types"

class FollowService {
  /** Follow a user (client or lounge). */
  async follow(targetId: string): Promise<FollowToggleResult> {
    const res = await apiClient.post<{ data: FollowToggleResult }>(
      `/v1/follows/${targetId}`,
    )
    return (res as any).data ?? res
  }

  /** Unfollow a user. */
  async unfollow(targetId: string): Promise<FollowToggleResult> {
    const res = await apiClient.delete<{ data: FollowToggleResult }>(
      `/v1/follows/${targetId}`,
    )
    return (res as any).data ?? res
  }

  /** Check whether the authenticated user is following a target. */
  async checkFollowing(targetId: string): Promise<boolean> {
    try {
      const res = await apiClient.get<{ data: FollowCheckResult }>(
        `/v1/follows/check/${targetId}`,
      )
      const payload = (res as any).data ?? res
      return !!(payload.isFollowing ?? payload.following ?? false)
    } catch (error) {
      console.warn("[FollowService] checkFollowing failed:", error)
      return false
    }
  }

  /** Get the list of users that a given user is following (paginated). */
  async getFollowing(
    userId: string,
    page = 1,
    limit = 20,
    type?: "client" | "lounge",
  ): Promise<PaginatedFollows<FollowingRecord>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (type) params.set("type", type)
    const res = await apiClient.get<any>(
      `/v1/follows/following/${userId}?${params.toString()}`,
    )
    return this.normalizePaginated(res, page, limit)
  }

  /** Get the list of followers for a given user (paginated). */
  async getFollowers(
    userId: string,
    page = 1,
    limit = 20,
    type?: "client" | "lounge",
  ): Promise<PaginatedFollows<FollowerRecord>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (type) params.set("type", type)
    const res = await apiClient.get<any>(
      `/v1/follows/followers/${userId}?${params.toString()}`,
    )
    return this.normalizePaginated(res, page, limit)
  }

  /** Normalize any API response shape into PaginatedFollows. */
  private normalizePaginated<T>(
    res: any,
    page: number,
    limit: number,
  ): PaginatedFollows<T> {
    // apiClient returns the full JSON: { success, data: { users, total, page, limit } }
    const payload = res?.data ?? res
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.docs)
            ? payload.docs
            : []
    return {
      data: list,
      total: payload?.total ?? payload?.totalDocs ?? list.length,
      page: payload?.page ?? page,
      limit: payload?.limit ?? limit,
    }
  }

  /** Get follower + following counts for a user. */
  async getCounts(userId: string): Promise<FollowCounts> {
    try {
      const res = await apiClient.get<{ data: FollowCounts }>(
        `/v1/follows/counts/${userId}`,
      )
      const payload = (res as any).data ?? res
      return {
        followersCount: payload.followersCount ?? 0,
        followingCount: payload.followingCount ?? 0,
      }
    } catch (error) {
      console.warn("[FollowService] getCounts failed:", error)
      return { followersCount: 0, followingCount: 0 }
    }
  }
}

export const followService = new FollowService()
