"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import {
  Heart,
  MessageCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Textarea } from "../ui/textarea"
import type { Post } from "../../_types/content"
import { useAuth } from "../../_providers/auth"
import {
  useTogglePostLike,
  useDeletePost,
  useAddComment,
} from "../../_hooks/queries/useContent"

interface PostCardProps {
  post: Post
  /** Mark the post image as high-priority (LCP candidate). */
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const likeMutation = useTogglePostLike(post._id)
  const deleteMutation = useDeletePost()
  const addCommentMutation = useAddComment("post", post._id)

  // Image navigation
  const nextImage = () => {
    if (post.media && currentImageIndex < post.media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleLike = () => {
    if (user) likeMutation.mutate()
  }

  const handleComment = () => {
    if (user && commentText.trim()) {
      addCommentMutation.mutate(
        { text: commentText.trim() },
        {
          onSuccess: () => {
            setCommentText("")
            setShowCommentForm(false)
          },
        },
      )
    }
  }

  const handleDelete = () => {
    if (user && user._id === post.authorId._id) {
      deleteMutation.mutate(post._id)
    }
  }

  const author = post.authorId
  const authorName = author.firstName || author.loungeTitle || "User"
  const canDelete = user && user._id === author._id

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
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
            <div>
              <p className="text-sm font-semibold">{authorName}</p>
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
            <div className="relative overflow-hidden rounded-lg">
              {/* Main image display */}
              <div className="relative aspect-video">
                <Image
                  src={post.media[currentImageIndex].url}
                  alt={`Post image ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={priority}
                  loading={priority ? "eager" : undefined}
                />

                {/* Navigation arrows */}
                {post.media.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === post.media.length - 1}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Image indicators */}
              {post.media.length > 1 && (
                <div className="mt-2 flex justify-center space-x-1">
                  {post.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
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
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.commentCount}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="text-muted-foreground"
            >
              Reply
            </Button>
          </div>

          {/* Comment form */}
          {showCommentForm && (
            <div className="space-y-2 border-t pt-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCommentForm(false)
                    setCommentText("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
