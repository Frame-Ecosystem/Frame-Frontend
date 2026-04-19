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
    onSuccess: (_data, postId) => {
      toast.success("Post hidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
      qc.invalidateQueries({ queryKey: contentKeys.post(postId) })
    },
  })
}

export function useAdminUnhidePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => postService.unhidePost(postId),
    onSuccess: (_data, postId) => {
      toast.success("Post unhidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
      qc.invalidateQueries({ queryKey: contentKeys.post(postId) })
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
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
    },
  })
}

/* ── Reel admin actions ── */

export function useAdminHideReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.hideReel(reelId),
    onSuccess: (_data, reelId) => {
      toast.success("Reel hidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
      qc.invalidateQueries({ queryKey: contentKeys.reel(reelId) })
    },
  })
}

export function useAdminUnhideReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reelId: string) => reelService.unhideReel(reelId),
    onSuccess: (_data, reelId) => {
      toast.success("Reel unhidden")
      qc.invalidateQueries({ queryKey: contentKeys.exploreFeed })
      qc.invalidateQueries({ queryKey: contentKeys.followingFeed })
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
      qc.invalidateQueries({ queryKey: contentKeys.reel(reelId) })
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
      qc.invalidateQueries({ queryKey: contentKeys.savedFeed })
    },
  })
}

/* ── Comment admin actions ── */

export function useAdminHideComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => commentService.hideComment(commentId),
    onSuccess: () => {
      toast.success("Comment hidden")
      // Invalidate all comment caches
      qc.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}

export function useAdminUnhideComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => commentService.unhideComment(commentId),
    onSuccess: () => {
      toast.success("Comment unhidden")
      qc.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}

export function useAdminDeleteComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) =>
      commentService.adminDeleteComment(commentId),
    onSuccess: () => {
      toast.success("Comment force-deleted")
      qc.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}
