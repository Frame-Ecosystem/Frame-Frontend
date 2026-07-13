import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { likeService } from "@/app/_services/like.service"
import { toast } from "sonner"
import { useTranslation } from "@/app/_i18n"

export const likeKeys = {
  all: ["likes"] as const,
  check: (targetId: string) => [...likeKeys.all, "check", targetId] as const,
  myLikes: (limit?: number) => [...likeKeys.all, "my", limit] as const,
  targetLikers: (targetId: string) =>
    [...likeKeys.all, "target", targetId] as const,
}

/** Check whether the authenticated user has liked a specific target. */
export function useCheckLiked(targetId: string | undefined) {
  return useQuery({
    queryKey: likeKeys.check(targetId ?? ""),
    queryFn: () => likeService.checkLiked(targetId!),
    enabled: !!targetId,
    throwOnError: false,
  })
}

/** Cooldown duration after a 429 rate-limit response (ms). */
const RATE_LIMIT_COOLDOWN = 30_000

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    const code = "code" in err ? String((err as { code?: unknown }).code) : ""
    return code === "RATE_LIMIT_EXCEEDED" || err.message.includes("slow down")
  }
  return false
}

/**
 * Toggle like/unlike with optimistic UI and rate-limit handling.
 * Returns `{ mutate, isPending, isRateLimited }`.
 */
export function useToggleLike(targetId: string) {
  const queryClient = useQueryClient()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useTranslation()

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const mutation = useMutation({
    mutationFn: () => {
      if (isRateLimited) return Promise.reject(new Error("RATE_LIMITED_LOCAL"))
      return likeService.toggle(targetId)
    },
    onMutate: async () => {
      if (isRateLimited) return {}
      await queryClient.cancelQueries({
        queryKey: likeKeys.check(targetId),
      })
      const previous = queryClient.getQueryData<boolean>(
        likeKeys.check(targetId),
      )
      queryClient.setQueryData(
        likeKeys.check(targetId),
        (old: boolean | undefined) => !old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(likeKeys.check(targetId), context.previous)
      }
      if (_err instanceof Error && _err.message === "RATE_LIMITED_LOCAL") return
      if (isRateLimitError(_err)) {
        toast.error(t("like.tooMany"))
        setIsRateLimited(true)
        timerRef.current = setTimeout(
          () => setIsRateLimited(false),
          RATE_LIMIT_COOLDOWN,
        )
      } else {
        toast.error(t("like.failed"))
      }
    },
    onSettled: (_data, err) => {
      if (err instanceof Error && err.message === "RATE_LIMITED_LOCAL") return
      queryClient.invalidateQueries({ queryKey: likeKeys.check(targetId) })
      queryClient.invalidateQueries({ queryKey: likeKeys.all })
    },
  })

  const mutate = (options?: Parameters<typeof mutation.mutate>[1]) => {
    if (isRateLimited) return
    mutation.mutate(undefined, options)
  }

  return { ...mutation, mutate, isRateLimited }
}

/** Paginated list of the authenticated user's liked targets. */
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

/** Paginated list of users who liked a target. */
export function useTargetLikers(targetId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: likeKeys.targetLikers(targetId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      likeService.getTargetLikers(targetId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit)
      return last.page < totalPages ? last.page + 1 : undefined
    },
    enabled: !!targetId,
  })
}

/** @deprecated Use useTargetLikers instead */
export const useLoungeLikers = useTargetLikers
