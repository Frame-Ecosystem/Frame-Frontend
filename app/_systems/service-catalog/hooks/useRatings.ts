import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { ratingService } from "@/app/_services/rating.service"
import type { SubmitRatingInput } from "@/app/_types"
import { toast } from "sonner"
import { useTranslation } from "@/app/_i18n"

export const ratingKeys = {
  all: ["ratings"] as const,
  target: (targetId: string) =>
    [...ratingKeys.all, "target", targetId] as const,
  my: (targetId: string) => [...ratingKeys.all, "my", targetId] as const,
}

/** Fetch the authenticated user's own rating for a target. */
export function useMyRating(targetId: string | undefined) {
  return useQuery({
    queryKey: ratingKeys.my(targetId ?? ""),
    queryFn: () => ratingService.getMyRating(targetId!),
    enabled: !!targetId,
    throwOnError: false,
  })
}

/** Infinite-scroll paginated ratings for a target. */
export function useTargetRatings(targetId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ratingKeys.target(targetId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      ratingService.getTargetRatings(targetId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: !!targetId,
  })
}

/** @deprecated Use useTargetRatings instead */
export const useLoungeRatings = useTargetRatings

/** Create or update a rating (upsert). */
export function useUpsertRating(targetId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: SubmitRatingInput) => ratingService.upsert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.my(targetId) })
      queryClient.invalidateQueries({ queryKey: ratingKeys.target(targetId) })
      toast.success(t("rating.saved"))
    },
    onError: (err: Error) => {
      toast.error(err.message || t("rating.saveFailed"))
    },
  })
}

/** Delete the user's rating. */
export function useDeleteRating(targetId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => ratingService.remove(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.my(targetId) })
      queryClient.invalidateQueries({ queryKey: ratingKeys.target(targetId) })
      toast.success(t("rating.removed"))
    },
    onError: (err: Error) => {
      toast.error(err.message || t("rating.removeFailed"))
    },
  })
}
