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
import { Post } from "../../_types"
import { PostService } from "../../_services"
import { useAuth } from "../../_providers/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Image navigation functions
  const nextImage = () => {
    if (post.images && currentImageIndex < post.images.length - 1) {
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

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: (postId: string) => PostService.toggleLikePost({ postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: { postId: string; content: string }) =>
      PostService.addComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setCommentText("")
      setShowCommentForm(false)
    },
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => PostService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const handleLike = () => {
    if (user) {
      likePostMutation.mutate(post.id)
    }
  }

  const handleComment = () => {
    if (user && commentText.trim()) {
      addCommentMutation.mutate({
        postId: post.id,
        content: commentText.trim(),
      })
    }
  }

  const handleDelete = () => {
    if (user && user._id === post.author._id) {
      deletePostMutation.mutate(post.id)
    }
  }

  const isLiked = user ? post.likes.includes(user._id || "") : false
  const canDelete = user && user._id === post.author._id

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  typeof post.author.profileImage === "string"
                    ? post.author.profileImage
                    : post.author.profileImage?.url
                }
                alt={
                  post.author.firstName ||
                  post.author.loungeTitle ||
                  post.author.email
                }
              />
              <AvatarFallback>
                {(
                  post.author.firstName ||
                  post.author.loungeTitle ||
                  post.author.email
                )
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">
                {post.author.firstName ||
                  post.author.loungeTitle ||
                  post.author.email}
              </p>
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
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>

          {/* Post images */}
          {post.images && post.images.length > 0 && (
            <div className="relative overflow-hidden rounded-lg">
              {/* Main image display */}
              <div className="relative aspect-video">
                <Image
                  src={post.images[currentImageIndex]}
                  alt={`Post image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Navigation arrows - only show if more than 1 image */}
                {post.images.length > 1 && (
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
                      disabled={currentImageIndex === post.images.length - 1}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Image indicators - only show if more than 1 image */}
              {post.images.length > 1 && (
                <div className="mt-2 flex justify-center space-x-1">
                  {post.images.map((_, index) => (
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
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
                disabled={likePostMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">{post.likes.length}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.comments.length}</span>
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

          {/* Comments */}
          {showComments && post.comments.length > 0 && (
            <div className="space-y-3 border-t pt-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage
                      src={
                        typeof comment.author.profileImage === "string"
                          ? comment.author.profileImage
                          : comment.author.profileImage?.url
                      }
                      alt={
                        comment.author.firstName ||
                        comment.author.loungeTitle ||
                        comment.author.email
                      }
                    />
                    <AvatarFallback className="text-xs">
                      {(
                        comment.author.firstName ||
                        comment.author.loungeTitle ||
                        comment.author.email
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <p className="text-xs font-medium">
                        {comment.author.firstName ||
                          comment.author.loungeTitle ||
                          comment.author.email}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
