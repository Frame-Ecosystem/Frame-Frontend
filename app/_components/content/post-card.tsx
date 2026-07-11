"use client"

import { useState, useCallback, useRef } from "react"
import { Heart, EyeOff } from "lucide-react"
import { AuthorHeader } from "./author-header"
import { ActionBar } from "./action-bar"
import { ImageCarousel } from "./image-carousel"
import { HashtagText } from "./hashtag-text"
import { ContentMenu } from "./content-menu"
import { ReportModal } from "./report-modal"
import { EditPostDialog } from "./edit-post-dialog"
import type { Post } from "../../_types"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
import {
  useTogglePostLike,
  useTogglePostSave,
  useDeletePost,
  useAdminHidePost,
  useAdminUnhidePost,
  useAdminDeletePost,
} from "../../_hooks/queries/useContent"

interface PostCardProps {
  post: Post
  priority?: boolean
  onCommentClick?: () => void
  onEditClick?: () => void
  hideCloseButton?: boolean
}

export function PostCard({
  post,
  priority,
  onCommentClick,
  onEditClick: _onEditClick,
  hideCloseButton = false,
}: Readonly<PostCardProps>) {
  const { user } = useAuth()
  const { t, dir } = useTranslation()
  const [showReport, setShowReport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const heartTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const likeMutation = useTogglePostLike(post?._id ?? "")
  const saveMutation = useTogglePostSave(post?._id ?? "")
  const deleteMutation = useDeletePost()
  const hideMutation = useAdminHidePost()
  const unhideMutation = useAdminUnhidePost()
  const adminDeleteMutation = useAdminDeletePost()

  // Use local optimistic state for like/save (falls back to server value)
  const isLiked = post?.isLiked ?? false
  const isSaved = post?.isSaved ?? false

  const handleDoubleTap = useCallback(() => {
    if (!isLiked && post?._id) {
      likeMutation.mutate()
    }
    // Show heart animation
    setShowDoubleTapHeart(true)
    if (heartTimeout.current) clearTimeout(heartTimeout.current)
    heartTimeout.current = setTimeout(() => setShowDoubleTapHeart(false), 800)
  }, [isLiked, likeMutation, post])

  const handleDelete = useCallback(() => {
    if (!post?._id) return
    if (globalThis.confirm(t("content.post.deleteConfirm"))) {
      deleteMutation.mutate(post._id)
    }
  }, [deleteMutation, post, t])

  // Defensive: validate post data integrity after all hooks
  if (!post?._id || !post.authorId) {
    return null
  }

  const isOwner = user?._id === post.authorId._id
  const isAdmin = user?.type === "admin"

  // Text truncation
  const textContent = post.text ?? ""
  const shouldTruncate = textContent.length > 150 && !expanded
  const displayText = shouldTruncate
    ? textContent.slice(0, 150) + "..."
    : textContent

  return (
    <article
      id={`post-${post._id}`}
      className="border-border/60 bg-card relative overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md lg:rounded-2xl"
    >
      {/* Hidden indicator for admins */}
      {post.isHidden && isAdmin && (
        <div
          dir={dir}
          className="flex items-center gap-1.5 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
        >
          <EyeOff className="h-3 w-3" />
          {t("content.post.hidden")}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <AuthorHeader author={post.authorId} createdAt={post.createdAt} />
        <ContentMenu
          isOwner={isOwner}
          isAdmin={isAdmin}
          isHidden={post.isHidden}
          onEdit={isOwner ? () => setShowEdit(true) : undefined}
          onDelete={isOwner ? handleDelete : undefined}
          onReport={isOwner ? undefined : () => setShowReport(true)}
          onHide={isAdmin ? () => hideMutation.mutate(post._id) : undefined}
          onUnhide={isAdmin ? () => unhideMutation.mutate(post._id) : undefined}
          onAdminDelete={
            isAdmin ? () => adminDeleteMutation.mutate(post._id) : undefined
          }
        />
      </div>

      {/* Text content — above media */}
      {textContent && (
        <div className="px-4 pt-1 pb-2">
          <p className="text-sm">
            <HashtagText text={displayText} />
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(true)}
              className="text-muted-foreground text-sm"
            >
              {t("content.post.more")}
            </button>
          )}
        </div>
      )}

      {/* Hashtags (if not inline in text) */}
      {post.hashtags.length > 0 && !textContent.includes("#") && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {post.hashtags.map((tag) => (
            <HashtagText
              key={tag}
              text={`#${tag}`}
              className="text-primary text-sm"
            />
          ))}
        </div>
      )}

      {/* Media carousel */}
      {post.media.length > 0 && (
        <div className="relative">
          <ImageCarousel
            images={post.media}
            alt="Post image"
            aspectRatio="square"
            priority={priority}
            onDoubleClick={handleDoubleTap}
            hideCloseButton={hideCloseButton}
          />
          {/* Double-tap heart animation */}
          {showDoubleTapHeart && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart className="h-20 w-20 animate-ping fill-white text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="border-border/30 border-t">
        <ActionBar
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          saveCount={post.saveCount}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={() => likeMutation.mutate()}
          onComment={() => onCommentClick?.()}
          onSave={() => saveMutation.mutate()}
          isLikeDisabled={likeMutation.isRateLimited}
          className="px-3 py-1.5"
        />
      </div>

      {/* Comment preview / button */}
      {post.commentCount > 0 && onCommentClick && (
        <button
          dir={dir}
          onClick={onCommentClick}
          className="text-muted-foreground hover:text-foreground block px-4 pb-3 text-sm transition-colors"
        >
          {t("content.viewAllComments", { count: post.commentCount })}
        </button>
      )}

      {/* Report modal */}
      <ReportModal
        open={showReport}
        onOpenChange={setShowReport}
        targetType="post"
        targetId={post._id}
      />

      {/* Edit dialog */}
      {isOwner && (
        <EditPostDialog
          post={post}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}
    </article>
  )
}
