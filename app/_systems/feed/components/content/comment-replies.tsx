"use client"

import { useState } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { useReplies } from "@/app/_hooks/queries/useContent"
import { cn } from "@/app/_lib/utils"
import type { Comment } from "@/app/_types"
import { useTranslation } from "@/app/_i18n"

interface CommentRepliesProps {
  comment: Comment
  /** Render function for each reply — avoids circular import with CommentItem */
  renderReply: (_reply: Comment) => React.ReactNode
}

/**
 * Expandable reply list under a top-level comment.
 * Handles fetching, loading state, and "Load more" pagination.
 */
export function CommentReplies({ comment, renderReply }: CommentRepliesProps) {
  const { t } = useTranslation()
  const [showReplies, setShowReplies] = useState(false)

  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useReplies(showReplies ? comment._id : undefined)

  const replies = repliesData?.pages.flatMap((p) => p.data) ?? []
  const count = comment.replyCount ?? 0

  if (count === 0) return null

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowReplies(!showReplies)}
        className="text-muted-foreground mt-2 flex items-center gap-1 text-xs font-semibold"
      >
        <div className="bg-muted-foreground h-px w-6" />
        {showReplies
          ? t("content.hideReplies")
          : t("content.viewReplies", { count: count })}
        <ChevronDown
          className={cn("h-3 w-3 transition", showReplies && "rotate-180")}
        />
      </button>

      {/* Replies list */}
      {showReplies && (
        <div className="mt-2 space-y-3">
          {isLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
          {replies.map(renderReply)}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-muted-foreground text-xs"
            >
              {isFetchingNextPage
                ? t("common.loadingDots")
                : t("content.loadMoreReplies")}
            </Button>
          )}
        </div>
      )}
    </>
  )
}
