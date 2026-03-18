"use client"

import { useState, useCallback } from "react"
import { Heart, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import type { Comment } from "../../_types"
import { useAuth } from "../../_providers/auth"
import {
  useToggleCommentLike,
  useDeleteComment,
} from "../../_hooks/queries/useContent"
import { getAuthorName, getAuthorInitials } from "./author-header"
import { CommentReplies } from "./comment-replies"
import { resolveProfileImage } from "../../_lib/image-utils"
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

  const isOwner = user?._id === comment.authorId._id
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
    <div className={cn("flex gap-3", depth > 0 && "ml-10")}>
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
        </div>

        {/* Like button (right side) */}
        <button
          onClick={handleLike}
          className="absolute top-1 right-0"
          style={{ position: "relative", float: "right", marginTop: "-2rem" }}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition",
              localLiked
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground",
            )}
          />
        </button>

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
    </div>
  )
}
