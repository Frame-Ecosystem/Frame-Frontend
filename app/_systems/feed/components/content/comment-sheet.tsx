"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { CommentItem } from "./comment-item"
import { CommentInput } from "./comment-input"
import { EmptyState } from "./empty-state"
import { useComments } from "@/app/_hooks/queries/useContent"
import { cn } from "@/app/_lib/utils"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "@/app/_i18n"

interface CommentSheetProps {
  open: boolean
  onClose: () => void
  targetType: "post" | "reel"
  targetId: string
  commentCount: number
  /** When set, auto-scrolls to and highlights this comment after loading. */
  highlightCommentId?: string | null
}

/**
 * Bottom-sheet style comment panel.
 * Opens as a full-height overlay on mobile, a slide-up panel on desktop.
 */
export function CommentSheet({
  open,
  onClose,
  targetType,
  targetId,
  commentCount,
  highlightCommentId,
}: CommentSheetProps) {
  const { t } = useTranslation()
  const [replyTo, setReplyTo] = useState<{
    commentId: string
    authorName: string
  } | null>(null)
  const { ref: bottomRef, inView } = useInView()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(targetType, open ? targetId : undefined)

  // Infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleReply = useCallback((commentId: string, authorName: string) => {
    setReplyTo({ commentId, authorName })
  }, [])

  // Scroll to and highlight a specific comment when navigated from a notification
  const highlightedRef = useRef(false)
  useEffect(() => {
    if (!highlightCommentId || isLoading || highlightedRef.current) return
    const el = document.getElementById(`comment-${highlightCommentId}`)
    if (!el) return
    highlightedRef.current = true
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("notif-highlight")
      setTimeout(() => el.classList.remove("notif-highlight"), 3500)
    })
  }, [highlightCommentId, isLoading, data])

  // Lock body scroll and hide mobile navbar when open
  useEffect(() => {
    const nav = document.querySelector(
      "[data-nav-mobile]",
    ) as HTMLElement | null
    if (open) {
      document.body.style.overflow = "hidden"
      if (nav) nav.style.display = "none"
    } else {
      document.body.style.overflow = ""
      if (nav) nav.style.display = ""
    }
    return () => {
      document.body.style.overflow = ""
      if (nav) nav.style.display = ""
    }
  }, [open])

  const comments = data?.pages.flatMap((p) => p.data) ?? []

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        className={cn(
          "bg-background fixed right-0 bottom-0 left-0 z-50 mx-auto flex max-h-[85vh] flex-col rounded-t-2xl shadow-xl lg:max-w-[420px]",
          "animate-in slide-in-from-bottom duration-300",
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">
            {t("content.comments.title")}
            {commentCount > 0 && ` (${commentCount})`}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <EmptyState type="comments" />
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  targetType={targetType}
                  targetId={targetId}
                  onReply={handleReply}
                />
              ))}
              <div ref={bottomRef} />
              {isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment input (pinned at bottom) */}
        <div className="mb-12">
          <CommentInput
            targetType={targetType}
            targetId={targetId}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>
      </div>
    </>
  )
}
