import { useQuery } from "@tanstack/react-query"
import { feedService } from "../../_services/feed.service"
import { contentKeys } from "./content-keys"

export function useTrendingHashtags(limit = 20) {
  return useQuery({
    queryKey: contentKeys.trendingHashtags,
    queryFn: () => feedService.getTrendingHashtags(limit),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useSearchHashtags(query: string, limit = 10) {
  return useQuery({
    queryKey: contentKeys.searchHashtags(query),
    queryFn: () => feedService.searchHashtags(query, limit),
    enabled: query.length >= 1,
  })
}
