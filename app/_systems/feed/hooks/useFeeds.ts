import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { feedService } from "@/app/_services/feed.service"
import { contentKeys, extractPagination } from "./content-keys"
import {
  applyFeedRateLimitRemainingHint,
  getFeedRetryAfterSeconds,
  setFeedRateLimitCooldown,
  useFeedRateLimitState,
} from "../lib/feed-rate-limit"

function useRateLimitedFeedQuery(
  queryKey: readonly unknown[],
  queryFn: (
    _pageParam: number,
  ) => ReturnType<typeof feedService.getFollowingFeed>,
  enabled = true,
) {
  const feedRateLimit = useFeedRateLimitState()

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled,
    retry: (failureCount, error) => {
      if ((error as any)?.code === "RATE_LIMIT_EXCEEDED") return false
      return failureCount < 3
    },
  })

  useEffect(() => {
    if ((query.error as any)?.code !== "RATE_LIMIT_EXCEEDED") return

    const retryAfter = getFeedRetryAfterSeconds(query.error)
    if (retryAfter > 0) {
      setFeedRateLimitCooldown(retryAfter, "rate-limit")
    }
  }, [query.error])

  return {
    ...query,
    feedRateLimit,
  }
}

/** Following feed (infinite scroll) */
export function useFollowingFeed(limit = 10) {
  return useRateLimitedFeedQuery(contentKeys.followingFeed, (pageParam) =>
    feedService.getFollowingFeed(pageParam, limit, ({ rateLimitRemaining }) => {
      applyFeedRateLimitRemainingHint(rateLimitRemaining)
    }),
  )
}

/** Explore feed (infinite scroll) */
export function useExploreFeed(limit = 10) {
  return useRateLimitedFeedQuery(contentKeys.exploreFeed, (pageParam) =>
    feedService.getExploreFeed(pageParam, limit, ({ rateLimitRemaining }) => {
      applyFeedRateLimitRemainingHint(rateLimitRemaining)
    }),
  )
}

/** Saved content feed (infinite scroll) */
export function useSavedFeed(limit = 10) {
  return useRateLimitedFeedQuery(contentKeys.savedFeed, (pageParam) =>
    feedService.getSavedFeed(pageParam, limit, ({ rateLimitRemaining }) => {
      applyFeedRateLimitRemainingHint(rateLimitRemaining)
    }),
  )
}

/** Hashtag feed (infinite scroll) */
export function useHashtagFeed(tag: string, limit = 10) {
  return useRateLimitedFeedQuery(
    contentKeys.hashtagFeed(tag),
    (pageParam) =>
      feedService.getHashtagFeed(
        tag,
        pageParam,
        limit,
        ({ rateLimitRemaining }) => {
          applyFeedRateLimitRemainingHint(rateLimitRemaining)
        },
      ),
    !!tag,
  )
}
