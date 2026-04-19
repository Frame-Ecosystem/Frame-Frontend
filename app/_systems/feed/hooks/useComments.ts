import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { commentService } from "@/app/_services/comment.service"
import { toast } from "sonner"
import {
  contentKeys,
  extractPagination,
  updateFeedItemOptimistic,
} from "./content-keys"

/** Top-level comments (infinite scroll) */
export function useComments(
  targetType: "post" | "reel",
  targetId: string | undefined,
  limit = 20,
) {
  return useInfiniteQuery({
    queryKey: contentKeys.comments(targetType, targetId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      commentService.getComments(targetType, targetId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled: !!targetId,
  })
}

/** Replies to a comment */
export function useReplies(commentId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: contentKeys.replies(commentId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      commentService.getReplies(commentId!, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: extractPagination,
    enabled: !!commentId,
  })
}

/** Add comment / reply */
export function useAddComment(targetType: "post" | "reel", targetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { text: string; parentCommentId?: string }) =>
      commentService.addComment(targetType, targetId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: contentKeys.comments(targetType, targetId),
      })
      if (vars.parentCommentId) {
        qc.invalidateQueries({
          queryKey: contentKeys.replies(vars.parentCommentId),
        })
      }
      const key =
        targetType === "post"
          ? contentKeys.post(targetId)
          : contentKeys.reel(targetId)
      qc.setQueryData(key, (old: any) =>
        old ? { ...old, commentCount: (old.commentCount ?? 0) + 1 } : old,
      )
      updateFeedItemOptimistic(qc, targetId, (item: any) => ({
        ...item,
        commentCount: (item.commentCount ?? 0) + 1,
      }))
    },
    onError: (err) => {
      const msg = (err as any)?.message ?? ""
      if (msg.includes("TARGET_NOT_FOUND")) {
        toast.error("This content no longer exists")
      } else {
        toast.error("Failed to post comment")
      }
    },
  })
}

/** Delete comment */
export function useDeleteComment(
  targetType: "post" | "reel",
  targetId: string,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: string
      parentCommentId?: string | null
    }) => commentService.deleteComment(commentId),
    onSuccess: (_, { parentCommentId }) => {
      qc.invalidateQueries({
        queryKey: contentKeys.comments(targetType, targetId),
      })
      if (parentCommentId) {
        qc.invalidateQueries({
          queryKey: contentKeys.replies(parentCommentId),
        })
      }
      const key =
        targetType === "post"
          ? contentKeys.post(targetId)
          : contentKeys.reel(targetId)
      qc.setQueryData(key, (old: any) =>
        old
          ? { ...old, commentCount: Math.max(0, (old.commentCount ?? 1) - 1) }
          : old,
      )
    },
    onError: () => toast.error("Failed to delete comment"),
  })
}

/** Toggle like on comment */
export function useToggleCommentLike(commentId: string) {
  return useMutation({
    mutationFn: () => commentService.toggleLike(commentId),
  })
}
