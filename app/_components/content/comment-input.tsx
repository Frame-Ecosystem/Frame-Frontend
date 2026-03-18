"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuth } from "../../_providers/auth"
import { useAddComment } from "../../_hooks/queries/useContent"

interface CommentInputProps {
  targetType: "post" | "reel"
  targetId: string
  replyTo?: { commentId: string; authorName: string } | null
  onCancelReply?: () => void
}

export function CommentInput({
  targetType,
  targetId,
  replyTo,
  onCancelReply,
}: CommentInputProps) {
  const { user } = useAuth()
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const addComment = useAddComment(targetType, targetId)

  // Focus input when replying
  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus()
    }
  }, [replyTo])

  if (!user) return null

  const handleSubmit = () => {
    if (!text.trim()) return
    addComment.mutate(
      {
        text: text.trim(),
        parentCommentId: replyTo?.commentId,
      },
      {
        onSuccess: () => {
          setText("")
          onCancelReply?.()
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const profileImage =
    typeof user.profileImage === "string"
      ? user.profileImage
      : user.profileImage?.url

  return (
    <div className="border-border border-t">
      {/* Reply context */}
      {replyTo && (
        <div className="text-muted-foreground bg-muted/50 flex items-center justify-between px-4 py-1.5 text-xs">
          <span>
            Replying to <strong>{replyTo.authorName}</strong>
          </span>
          <button onClick={onCancelReply}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={profileImage} alt="" />
          <AvatarFallback className="text-xs">
            {(user.firstName || user.email || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <input
          ref={inputRef}
          type="text"
          placeholder={
            replyTo ? `Reply to ${replyTo.authorName}...` : "Add a comment..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || addComment.isPending}
          className="text-primary disabled:text-muted-foreground shrink-0 text-sm font-semibold disabled:cursor-not-allowed"
        >
          {addComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
