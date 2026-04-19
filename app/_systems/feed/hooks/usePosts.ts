import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { postService } from "../../_services/post.service"
import { toast } from "sonner"
import type { Post } from "../../_types"
import {
  contentKeys,
  extractPagination,
  isRateLimitError,
  updateFeedItemOptimistic,
  RATE_LIMIT_COOLDOWN,
} from "./content-keys"

/** Single post detail */
export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: contentKeys.post(postId ?? ""),
    queryFn: () => postService.getPost(postId!),
    enabled: !!postId,
  })
}

/** User's posts (infinite scroll) */
export function useUserPosts(userId: string | undefined, limit = 12) {
  return useInfiniteQuery({
    queryKey: contentKeys.userPosts(userId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      postService.getUserPosts(userId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled: !!userId,
  })
}

/** Create post mutation */
export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      text?: string
      media?: File[]
      hashtags?: string[]
    }) => postService.createPost(input),
    onSuccess: () => {
      toast.success("Post created!")
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: ["posts", "user"] })
    },
    onError: () => toast.error("Failed to create post"),
  })
}

/** Update post mutation */
export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      postId,
      ...data
    }: {
      postId: string
      text?: string
      hashtags?: string[]
    }) => postService.updatePost(postId, data),
    onSuccess: (_data, vars) => {
      toast.success("Post updated")
      qc.invalidateQueries({ queryKey: contentKeys.post(vars.postId) })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
    },
    onError: () => toast.error("Failed to update post"),
  })
}

/** Delete post mutation */
export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      toast.success("Post deleted")
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
    onError: () => toast.error("Failed to delete post"),
  })
}

/** Toggle like on a post (optimistic + rate-limit guard) */
export function useTogglePostLike(postId: string) {
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
      return postService.toggleLike(postId)
    },
    onMutate: async () => {
      if (isRateLimited) return {}
      await qc.cancelQueries({ queryKey: contentKeys.post(postId) })
      const prev = qc.getQueryData<Post>(contentKeys.post(postId))
      if (prev) {
        qc.setQueryData(contentKeys.post(postId), {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        })
      }
      updateFeedItemOptimistic(qc, postId, (item: any) => ({
        ...item,
        isLiked: !item.isLiked,
        likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contentKeys.post(postId), ctx.prev)
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

/** Toggle save on a post (optimistic) */
export function useTogglePostSave(postId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => postService.toggleSave(postId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: contentKeys.post(postId) })
      const prev = qc.getQueryData<Post>(contentKeys.post(postId))
      if (prev) {
        qc.setQueryData(contentKeys.post(postId), {
          ...prev,
          isSaved: !prev.isSaved,
          saveCount: prev.isSaved ? prev.saveCount - 1 : prev.saveCount + 1,
        })
      }
      updateFeedItemOptimistic(qc, postId, (item: any) => ({
        ...item,
        isSaved: !item.isSaved,
        saveCount: item.isSaved ? item.saveCount - 1 : item.saveCount + 1,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contentKeys.post(postId), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
    },
  })
}
