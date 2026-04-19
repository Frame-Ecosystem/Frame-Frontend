import type { PaginatedContentResponse } from "@/app/_types"

/* ────────────────────────────────────────────────────────────────── */
/*  Query key factories                                               */
/* ────────────────────────────────────────────────────────────────── */

export const contentKeys = {
  // Posts
  posts: ["posts"] as const,
  post: (id: string) => ["posts", id] as const,
  userPosts: (userId: string) => ["posts", "user", userId] as const,

  // Reels
  reels: ["reels"] as const,
  reel: (id: string) => ["reels", id] as const,
  userReels: (userId: string) => ["reels", "user", userId] as const,

  // Comments
  comments: (targetType: string, targetId: string) =>
    ["comments", targetType, targetId] as const,
  replies: (commentId: string) => ["comments", commentId, "replies"] as const,

  // Feeds
  followingFeed: ["feed", "following"] as const,
  exploreFeed: ["feed", "explore"] as const,
  savedFeed: ["feed", "saved"] as const,
  hashtagFeed: (tag: string) => ["feed", "hashtag", tag] as const,

  // Hashtags
  trendingHashtags: ["hashtags", "trending"] as const,
  searchHashtags: (q: string) => ["hashtags", "search", q] as const,

  // Reports (admin)
  reports: (status?: string) => ["reports", { status }] as const,
}

/* ────────────────────────────────────────────────────────────────── */
/*  Shared helpers                                                    */
/* ────────────────────────────────────────────────────────────────── */

export const RATE_LIMIT_COOLDOWN = 30_000

export function isRateLimitError(err: unknown): boolean {
  const code = (err as any)?.code ?? ""
  const msg = (err as any)?.message ?? ""
  return code === "RATE_LIMIT_EXCEEDED" || msg.includes("slow down")
}

export function extractPagination(last: PaginatedContentResponse<any>) {
  const totalPages = Math.ceil(last.pagination.total / last.pagination.limit)
  return last.pagination.page < totalPages
    ? last.pagination.page + 1
    : undefined
}

/**
 * Optimistically update a FeedItem inside all infinite-scroll feed caches.
 */
export function updateFeedItemOptimistic(
  qc: any,
  itemId: string,
  updater: (item: any) => any,
) {
  const feedKeys = [
    contentKeys.followingFeed,
    contentKeys.exploreFeed,
    contentKeys.savedFeed,
  ]

  for (const key of feedKeys) {
    qc.setQueriesData({ queryKey: key }, (old: any) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((item: any) =>
            item._id === itemId ? updater(item) : item,
          ),
        })),
      }
    })
  }

  // Also update any active hashtagFeed caches
  qc.setQueriesData({ queryKey: ["feed", "hashtag"] }, (old: any) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        data: page.data.map((item: any) =>
          item._id === itemId ? updater(item) : item,
        ),
      })),
    }
  })
}
