import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { reelService } from "../../_services/reel.service"
import { toast } from "sonner"
import type { Reel } from "../../_types"
import {
  contentKeys,
  extractPagination,
  isRateLimitError,
  updateFeedItemOptimistic,
  RATE_LIMIT_COOLDOWN,
} from "./content-keys"

/** Single reel detail */
export function useReel(reelId: string | undefined) {
  return useQuery({
    queryKey: contentKeys.reel(reelId ?? ""),
    queryFn: () => reelService.getReel(reelId!),
    enabled: !!reelId,
  })
}

/** User's reels (infinite scroll) */
export function useUserReels(userId: string | undefined, limit = 12) {
  return useInfiniteQuery({
    queryKey: contentKeys.userReels(userId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      reelService.getUserReels(userId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled: !!userId,
  })
}

/** Create reel mutation */
export function useCreateReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      video: File
      thumbnail?: File
      caption?: string
      duration: number
      hashtags?: string[]
    }) => reelService.createReel(input),
    onSuccess: () => {
      toast.success("Reel shared!")
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
    onError: () => toast.error("Failed to upload reel"),
  })
}

/** Delete reel */
export function useDeleteReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.deleteReel(reelId),
    onSuccess: () => {
      toast.success("Reel deleted")
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
    onError: () => toast.error("Failed to delete reel"),
  })
}

/** Toggle like on a reel (optimistic + rate-limit guard) */
export function useToggleReelLike(reelId: string) {
  const qc = useQueryClient()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const mutation = useMutation({
    mutationFn: () => {
      if (isRateLimited) return Promise.reject(new Error("RATE_LIMITED_LOCAL"))
      return reelService.toggleLike(reelId)
    },
    onMutate: async () => {
      if (isRateLimited) return {}
      await qc.cancelQueries({ queryKey: contentKeys.reel(reelId) })
      const prev = qc.getQueryData<Reel>(contentKeys.reel(reelId))
      if (prev) {
        qc.setQueryData(contentKeys.reel(reelId), {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        })
      }
      updateFeedItemOptimistic(qc, reelId, (item: any) => ({
        ...item,
        isLiked: !item.isLiked,
        likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contentKeys.reel(reelId), ctx.prev)
      if ((_err as any)?.message === "RATE_LIMITED_LOCAL") return
      if (isRateLimitError(_err)) {
        toast.error("Too many likes. Please slow down.")
        setIsRateLimited(true)
        timerRef.current = setTimeout(
          () => setIsRateLimited(false),
          RATE_LIMIT_COOLDOWN,
        )
      }
    },
  })

  return {
    ...mutation,
    mutate: () => {
      if (!isRateLimited) mutation.mutate()
    },
    isRateLimited,
  }
}

/** Toggle save on a reel (optimistic) */
export function useToggleReelSave(reelId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => reelService.toggleSave(reelId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: contentKeys.reel(reelId) })
      const prev = qc.getQueryData<Reel>(contentKeys.reel(reelId))
      if (prev) {
        qc.setQueryData(contentKeys.reel(reelId), {
          ...prev,
          isSaved: !prev.isSaved,
          saveCount: prev.isSaved ? prev.saveCount - 1 : prev.saveCount + 1,
        })
      }
      updateFeedItemOptimistic(qc, reelId, (item: any) => ({
        ...item,
        isSaved: !item.isSaved,
        saveCount: item.isSaved ? item.saveCount - 1 : item.saveCount + 1,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contentKeys.reel(reelId), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
    },
  })
}
