import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { likeService } from "../../_services/like.service"
import { toast } from "sonner"

export const likeKeys = {
  all: ["likes"] as const,
  check: (loungeId: string) => [...likeKeys.all, "check", loungeId] as const,
  myLikes: (limit?: number) => [...likeKeys.all, "my", limit] as const,
  loungeLikers: (loungeId: string) =>
    [...likeKeys.all, "lounge", loungeId] as const,
}

/** Check whether the authenticated client has liked a specific lounge. */
export function useCheckLiked(loungeId: string | undefined) {
  return useQuery({
    queryKey: likeKeys.check(loungeId ?? ""),
    queryFn: () => likeService.checkLiked(loungeId!),
    enabled: !!loungeId,
  })
}

/** Cooldown duration after a 429 rate-limit response (ms). */
const RATE_LIMIT_COOLDOWN = 30_000

function isRateLimitError(err: unknown): boolean {
  const code = (err as any)?.code ?? ""
  const msg = (err as any)?.message ?? ""
  return code === "RATE_LIMIT_EXCEEDED" || msg.includes("slow down")
}

/**
 * Toggle like/unlike with optimistic UI and rate-limit handling.
 * Returns `{ mutate, isPending, isRateLimited }`.
 * When `isRateLimited` is `true` the button should be disabled.
 */
export function useToggleLike(loungeId: string) {
  const queryClient = useQueryClient()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const mutation = useMutation({
    mutationFn: () => {
      if (isRateLimited) return Promise.reject(new Error("RATE_LIMITED_LOCAL"))
      return likeService.toggle(loungeId)
    },
    // Optimistic update on the "check" query
    onMutate: async () => {
      if (isRateLimited) return {}
      await queryClient.cancelQueries({
        queryKey: likeKeys.check(loungeId),
      })
      const previous = queryClient.getQueryData<boolean>(
        likeKeys.check(loungeId),
      )
      queryClient.setQueryData(
        likeKeys.check(loungeId),
        (old: boolean | undefined) => !old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Revert on failure
      if (context?.previous !== undefined) {
        queryClient.setQueryData(likeKeys.check(loungeId), context.previous)
      }
      if ((_err as any)?.message === "RATE_LIMITED_LOCAL") return
      if (isRateLimitError(_err)) {
        toast.error("Too many like requests. Please slow down.")
        setIsRateLimited(true)
        timerRef.current = setTimeout(
          () => setIsRateLimited(false),
          RATE_LIMIT_COOLDOWN,
        )
      } else {
        toast.error("Failed to update like")
      }
    },
    onSettled: (_data, err) => {
      if ((err as any)?.message === "RATE_LIMITED_LOCAL") return
      queryClient.invalidateQueries({ queryKey: likeKeys.check(loungeId) })
      queryClient.invalidateQueries({ queryKey: likeKeys.all })
    },
  })

  const mutate = (options?: Parameters<typeof mutation.mutate>[1]) => {
    if (isRateLimited) return
    mutation.mutate(undefined, options)
  }

  return { ...mutation, mutate, isRateLimited }
}

/** Paginated list of the authenticated client's liked lounges. */
export function useMyLikes(limit = 20) {
  return useInfiniteQuery({
    queryKey: likeKeys.myLikes(limit),
    queryFn: ({ pageParam = 1 }) => likeService.getMyLikes(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit)
      return last.page < totalPages ? last.page + 1 : undefined
    },
  })
}

/** Paginated list of clients who liked a lounge. */
export function useLoungeLikers(loungeId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: likeKeys.loungeLikers(loungeId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      likeService.getLoungeLikers(loungeId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit)
      return last.page < totalPages ? last.page + 1 : undefined
    },
    enabled: !!loungeId,
  })
}
