import { useInfiniteQuery } from "@tanstack/react-query"
import { feedService } from "@/app/_services/feed.service"
import { contentKeys, extractPagination } from "./content-keys"

/** Following feed (infinite scroll) */
export function useFollowingFeed(limit = 10) {
  return useInfiniteQuery({
    queryKey: contentKeys.followingFeed,
    queryFn: ({ pageParam = 1 }) =>
      feedService.getFollowingFeed(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
  })
}

/** Explore feed (infinite scroll) */
export function useExploreFeed(limit = 10) {
  return useInfiniteQuery({
    queryKey: contentKeys.exploreFeed,
    queryFn: ({ pageParam = 1 }) =>
      feedService.getExploreFeed(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
  })
}

/** Saved content feed (infinite scroll) */
export function useSavedFeed(limit = 10) {
  return useInfiniteQuery({
    queryKey: contentKeys.savedFeed,
    queryFn: ({ pageParam = 1 }) => feedService.getSavedFeed(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
  })
}

/** Hashtag feed (infinite scroll) */
export function useHashtagFeed(tag: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: contentKeys.hashtagFeed(tag),
    queryFn: ({ pageParam = 1 }) =>
      feedService.getHashtagFeed(tag, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled: !!tag,
  })
}
