import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { ratingService } from "@/app/_services/rating.service"
import type { SubmitRatingInput } from "@/app/_types"
import { toast } from "sonner"

export const ratingKeys = {
  all: ["ratings"] as const,
  lounge: (loungeId: string) =>
    [...ratingKeys.all, "lounge", loungeId] as const,
  my: (loungeId: string) => [...ratingKeys.all, "my", loungeId] as const,
}

/** Fetch the authenticated client's own rating for a lounge. */
export function useMyRating(loungeId: string | undefined) {
  return useQuery({
    queryKey: ratingKeys.my(loungeId ?? ""),
    queryFn: () => ratingService.getMyRating(loungeId!),
    enabled: !!loungeId,
  })
}

/** Infinite-scroll paginated ratings for a lounge. */
export function useLoungeRatings(loungeId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ratingKeys.lounge(loungeId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      ratingService.getLoungeRatings(loungeId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: !!loungeId,
  })
}

/** Create or update a rating (upsert). */
export function useUpsertRating(loungeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitRatingInput) => ratingService.upsert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.my(loungeId) })
      queryClient.invalidateQueries({ queryKey: ratingKeys.lounge(loungeId) })
      toast.success("Rating saved!")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save rating")
    },
  })
}

/** Delete the client's rating. */
export function useDeleteRating(loungeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => ratingService.remove(loungeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.my(loungeId) })
      queryClient.invalidateQueries({ queryKey: ratingKeys.lounge(loungeId) })
      toast.success("Rating removed")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove rating")
    },
  })
}
