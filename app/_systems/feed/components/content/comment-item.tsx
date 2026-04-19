"use client"

import { useState, useCallback } from "react"
import { Heart, Trash2, EyeOff, Eye, ShieldAlert } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import type { Comment } from "@/app/_types"
import { useAuth } from "@/app/_auth"
import {
  useToggleCommentLike,
  useDeleteComment,
  useAdminHideComment,
  useAdminUnhideComment,
  useAdminDeleteComment,
} from "@/app/_hooks/queries/useContent"
import { getAuthorName, getAuthorInitials } from "./author-header"
import { CommentReplies } from "./comment-replies"
import { resolveProfileImage } from "@/app/_lib/image-utils"
import { cn } from "@/app/_lib/utils"
import Link from "next/link"

interface CommentItemProps {
  comment: Comment
  targetType: "post" | "reel"
  targetId: string
  onReply?: (_commentId: string, _authorName: string) => void
  depth?: number
}

export function CommentItem({
  comment,
  targetType,
  targetId,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth()
  const [localLiked, setLocalLiked] = useState(comment.isLiked ?? false)
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount)

  const likeMutation = useToggleCommentLike(comment._id)
  const deleteMutation = useDeleteComment(targetType, targetId)
  const hideMutation = useAdminHideComment()
  const unhideMutation = useAdminUnhideComment()
  const adminDeleteMutation = useAdminDeleteComment()

  const isOwner = user?._id === comment.authorId._id
  const isAdmin = user?.type === "admin"
  const name = getAuthorName(comment.authorId)
  const initials = getAuthorInitials(comment.authorId)
  const profileLink =
    comment.authorId.type === "lounge"
      ? `/lounges/${comment.authorId._id}`
      : `/clients/${comment.authorId._id}`

  const handleLike = useCallback(() => {
    setLocalLiked((prev) => !prev)
    setLocalLikeCount((prev) => (localLiked ? prev - 1 : prev + 1))
    likeMutation.mutate()
  }, [localLiked, likeMutation])

  const handleDelete = useCallback(() => {
    if (window.confirm("Delete this comment?")) {
      deleteMutation.mutate({
        commentId: comment._id,
        parentCommentId: comment.parentCommentId,
      })
    }
  }, [deleteMutation, comment._id, comment.parentCommentId])

  return (
    <div
      id={`comment-${comment._id}`}
      className={cn("flex gap-3", depth > 0 && "ml-10")}
    >
      <Link href={profileLink} className="shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={resolveProfileImage(comment.authorId.profileImage)}
            alt={name}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <Link
            href={profileLink}
            className="mr-1 font-semibold hover:underline"
          >
            {name}
          </Link>
          <span>{comment.text}</span>
        </div>

        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>

          {localLikeCount > 0 && (
            <span>
              {localLikeCount} {localLikeCount === 1 ? "like" : "likes"}
            </span>
          )}

          {onReply && depth === 0 && (
            <button
              onClick={() => onReply(comment._id, name)}
              className="font-semibold hover:underline"
            >
              Reply
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="hover:text-destructive transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}

          {/* Admin actions */}
          {isAdmin && !isOwner && (
            <>
              <button
                onClick={() =>
                  comment.isHidden
                    ? unhideMutation.mutate(comment._id)
                    : hideMutation.mutate(comment._id)
                }
                className="text-amber-500 transition hover:text-amber-600"
                title={comment.isHidden ? "Unhide" : "Hide"}
              >
                {comment.isHidden ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Force-delete this comment as admin?")) {
                    adminDeleteMutation.mutate(comment._id)
                  }
                }}
                className="text-red-500 transition hover:text-red-600"
                title="Admin delete"
              >
                <ShieldAlert className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* Replies (top-level comments only) */}
        {depth === 0 && (
          <CommentReplies
            comment={comment}
            renderReply={(reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                targetType={targetType}
                targetId={targetId}
                depth={1}
              />
            )}
          />
        )}
      </div>

      {/* Like button (right side) */}
      <button onClick={handleLike} className="mt-2 shrink-0 self-start">
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition",
            localLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
          )}
        />
      </button>
    </div>
  )
}
