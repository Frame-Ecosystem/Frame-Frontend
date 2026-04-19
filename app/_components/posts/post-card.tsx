"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { CommentSheet } from "../content/comment-sheet"
import { PostMediaCarousel } from "./post-media-carousel"
import type { Post } from "../../_types/content"
import { useAuth } from "@/app/_auth"
import {
  useTogglePostLike,
  useTogglePostSave,
  useDeletePost,
} from "../../_hooks/queries/useContent"

interface PostCardProps {
  post: Post
  /** Mark the post image as high-priority (LCP candidate). */
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useAuth()
  const [showCommentSheet, setShowCommentSheet] = useState(false)

  const likeMutation = useTogglePostLike(post._id)
  const saveMutation = useTogglePostSave(post._id)
  const deleteMutation = useDeletePost()

  const handleLike = () => {
    if (user) likeMutation.mutate()
  }

  const handleSave = () => {
    if (user) saveMutation.mutate()
  }

  const handleDelete = () => {
    if (user && user._id === post.authorId._id) {
      deleteMutation.mutate(post._id)
    }
  }

  const author = post.authorId
  const authorName = author.firstName || author.loungeTitle || "User"
  const authorHref =
    author.type === "lounge"
      ? `/lounges/${author._id}`
      : `/clients/${author._id}`
  const canDelete = user && user._id === author._id

  return (
    <Card id={`post-${post._id}`} className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={authorHref}>
              <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage
                  src={
                    typeof author.profileImage === "string"
                      ? author.profileImage
                      : (author.profileImage as any)?.url
                  }
                  alt={authorName}
                />
                <AvatarFallback>
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={authorHref}
                className="text-sm font-semibold hover:underline"
              >
                {authorName}
              </Link>
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Post content */}
          {post.text && (
            <p className="text-sm whitespace-pre-wrap">{post.text}</p>
          )}

          {/* Post images */}
          {post.media && post.media.length > 0 && (
            <PostMediaCarousel media={post.media} priority={priority} />
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                  post.isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`}
                />
                <span className="text-xs">{post.likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentSheet(true)}
                className="text-muted-foreground flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.commentCount}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`flex items-center space-x-1 ${
                post.isSaved ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Bookmark
                className={`h-4 w-4 transition-colors ${
                  post.isSaved ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Comment bottom sheet */}
      <CommentSheet
        open={showCommentSheet}
        onClose={() => setShowCommentSheet(false)}
        targetType="post"
        targetId={post._id}
        commentCount={post.commentCount}
      />
    </Card>
  )
}
