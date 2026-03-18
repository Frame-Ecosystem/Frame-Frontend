import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postService } from "../../_services/post.service"
import { reelService } from "../../_services/reel.service"
import { commentService } from "../../_services/comment.service"
import { toast } from "sonner"
import { contentKeys } from "./content-keys"

/* ── Post admin actions ── */

export function useAdminHidePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postService.hidePost(postId),
    onSuccess: () => {
      toast.success("Post hidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
  })
}

export function useAdminUnhidePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postService.unhidePost(postId),
    onSuccess: () => {
      toast.success("Post unhidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
  })
}

export function useAdminDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postService.adminDeletePost(postId),
    onSuccess: () => {
      toast.success("Post force-deleted")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
    },
  })
}

/* ── Reel admin actions ── */

export function useAdminHideReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.hideReel(reelId),
    onSuccess: () => {
      toast.success("Reel hidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
  })
}

export function useAdminUnhideReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.unhideReel(reelId),
    onSuccess: () => {
      toast.success("Reel unhidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
    },
  })
}

export function useAdminDeleteReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.adminDeleteReel(reelId),
    onSuccess: () => {
      toast.success("Reel force-deleted")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
    },
  })
}

/* ── Comment admin actions ── */

export function useAdminHideComment() {
  return useMutation({
    mutationFn: (commentId: string) => commentService.hideComment(commentId),
    onSuccess: () => toast.success("Comment hidden"),
  })
}

export function useAdminUnhideComment() {
  return useMutation({
    mutationFn: (commentId: string) => commentService.unhideComment(commentId),
    onSuccess: () => toast.success("Comment unhidden"),
  })
}

export function useAdminDeleteComment() {
  return useMutation({
    mutationFn: (commentId: string) =>
      commentService.adminDeleteComment(commentId),
    onSuccess: () => toast.success("Comment force-deleted"),
  })
}
