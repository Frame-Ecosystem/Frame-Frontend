import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { followService } from "../../_services/follow.service"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/*  Query-key factory                                                  */
/* ------------------------------------------------------------------ */
export const followKeys = {
  all: ["follows"] as const,
  check: (targetId: string) => [...followKeys.all, "check", targetId] as const,
  counts: (userId: string) => [...followKeys.all, "counts", userId] as const,
  followers: (userId: string) =>
    [...followKeys.all, "followers", userId] as const,
  following: (userId: string) =>
    [...followKeys.all, "following", userId] as const,
}

/* ------------------------------------------------------------------ */
/*  useCheckFollowing                                                  */
/* ------------------------------------------------------------------ */
/** Check whether the authenticated user is following a target. */
export function useCheckFollowing(targetId: string | undefined) {
  return useQuery({
    queryKey: followKeys.check(targetId ?? ""),
    queryFn: () => followService.checkFollowing(targetId!),
    enabled: !!targetId,
  })
}

/* ------------------------------------------------------------------ */
/*  useToggleFollow – optimistic UI + rate-limit guard                 */
/* ------------------------------------------------------------------ */
const RATE_LIMIT_COOLDOWN = 30_000

function isRateLimitError(err: unknown): boolean {
  const code = (err as any)?.code ?? ""
  const msg = (err as any)?.message ?? ""
  return code === "RATE_LIMIT_EXCEEDED" || msg.includes("slow down")
}

/**
 * Toggle follow / unfollow with optimistic UI and rate-limit handling.
 * Returns `{ mutate, isPending, isRateLimited }`.
 */
export function useToggleFollow(targetId: string) {
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
    mutationFn: async (_vars: { wasFollowing: boolean }) => {
      if (isRateLimited) throw new Error("RATE_LIMITED_LOCAL")
      if (_vars.wasFollowing) {
        return followService.unfollow(targetId)
      }
      return followService.follow(targetId)
    },

    // Optimistic update on the "check" query
    onMutate: async () => {
      if (isRateLimited) return {}
      await queryClient.cancelQueries({
        queryKey: followKeys.check(targetId),
      })
      const previous = queryClient.getQueryData<boolean>(
        followKeys.check(targetId),
      )
      queryClient.setQueryData(
        followKeys.check(targetId),
        (old: boolean | undefined) => !old,
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      // Revert on failure
      if (context?.previous !== undefined) {
        queryClient.setQueryData(followKeys.check(targetId), context.previous)
      }
      if ((_err as any)?.message === "RATE_LIMITED_LOCAL") return
      if (isRateLimitError(_err)) {
        toast.error("Too many follow requests. Please slow down.")
        setIsRateLimited(true)
        timerRef.current = setTimeout(
          () => setIsRateLimited(false),
          RATE_LIMIT_COOLDOWN,
        )
      } else {
        toast.error("Failed to update follow")
      }
    },

    onSettled: (_data, err) => {
      if ((err as any)?.message === "RATE_LIMITED_LOCAL") return
      queryClient.invalidateQueries({ queryKey: followKeys.check(targetId) })
      queryClient.invalidateQueries({ queryKey: followKeys.all })
    },
  })

  const mutate = (options?: Parameters<typeof mutation.mutate>[1]) => {
    if (isRateLimited) return
    const wasFollowing = !!queryClient.getQueryData<boolean>(
      followKeys.check(targetId),
    )
    mutation.mutate({ wasFollowing }, options)
  }

  return { ...mutation, mutate, isRateLimited }
}

/* ------------------------------------------------------------------ */
/*  useFollowCounts                                                    */
/* ------------------------------------------------------------------ */
/** Get follower + following counts for a user. */
export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: followKeys.counts(userId ?? ""),
    queryFn: () => followService.getCounts(userId!),
    enabled: !!userId,
  })
}

/* ------------------------------------------------------------------ */
/*  useFollowers (infinite / paginated)                                */
/* ------------------------------------------------------------------ */
export function useFollowers(
  userId: string | undefined,
  limit = 20,
  type?: "client" | "lounge",
) {
  return useInfiniteQuery({
    queryKey: [...followKeys.followers(userId ?? ""), type] as const,
    queryFn: ({ pageParam = 1 }) =>
      followService.getFollowers(userId!, pageParam, limit, type),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit)
      return last.page < totalPages ? last.page + 1 : undefined
    },
    enabled: !!userId,
  })
}

/* ------------------------------------------------------------------ */
/*  useFollowing (infinite / paginated)                                */
/* ------------------------------------------------------------------ */
export function useFollowing(
  userId: string | undefined,
  limit = 20,
  type?: "client" | "lounge",
) {
  return useInfiniteQuery({
    queryKey: [...followKeys.following(userId ?? ""), type] as const,
    queryFn: ({ pageParam = 1 }) =>
      followService.getFollowing(userId!, pageParam, limit, type),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit)
      return last.page < totalPages ? last.page + 1 : undefined
    },
    enabled: !!userId,
  })
}
