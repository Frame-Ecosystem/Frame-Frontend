"use client"

import { useState, useRef, useEffect } from "react"
import { Pencil, Reply, Trash2, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/app/_lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import { ChatAvatar, MessageStatusIcon } from "./ui/chat-atoms"
import { AttachmentRenderer } from "./attachment-renderer"
import { ReplyPreview } from "./reply-preview"
import type { Message } from "../types"

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"]

// ── Internal: Emoji reaction picker ──────────────────────────

function EmojiPicker({
  isSent,
  onReact,
  onClose,
}: {
  isSent: boolean
  onReact: (emoji: string) => void
  onClose: () => void
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in-95 bg-card mb-1 flex items-center gap-0.5 rounded-full border px-1.5 py-1 shadow-lg",
        isSent ? "self-end" : "self-start",
      )}
    >
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onReact(emoji)
            onClose()
          }}
          className="rounded-full p-1 text-lg transition-transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// ── Internal: Hover action buttons ───────────────────────────

function BubbleActions({
  message: _message,
  isSent,
  isEditable,
  show,
  onReply,
  onEdit,
  onDelete,
  onTogglePicker,
}: {
  message: Message
  isSent: boolean
  isEditable: boolean
  show: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: (recallForAll: boolean) => void
  onTogglePicker: () => void
}) {
  return (
    <div
      className={cn(
        "mb-1 flex shrink-0 items-center gap-0.5 transition-opacity duration-150",
        show ? "opacity-100" : "opacity-0",
        isSent ? "flex-row-reverse" : "flex-row",
      )}
    >
      <button
        onClick={onTogglePicker}
        className="hover:bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs"
        aria-label="React"
      >
        ðŸ˜Š
      </button>
      <button
        onClick={onReply}
        className="hover:bg-muted flex h-6 w-6 items-center justify-center rounded-full"
        aria-label="Reply"
      >
        <Reply className="h-3.5 w-3.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="hover:bg-muted flex h-6 w-6 items-center justify-center rounded-full"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isSent ? "end" : "start"} className="w-40">
          <DropdownMenuItem onClick={onReply}>
            <Reply className="mr-2 h-4 w-4" /> Reply
          </DropdownMenuItem>
          {isEditable && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isSent && (
            <DropdownMenuItem
              onClick={() => onDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Recall for all
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => onDelete(false)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete for me
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Public: MessageBubble ─────────────────────────────────────

export interface MessageBubbleProps {
  message: Message
  isSent: boolean
  currentUserId: string
  showAvatar: boolean
  getParticipantName: (userId: string) => string
  onReply: (message: Message) => void
  onEdit: (message: Message) => void
  onDelete: (message: Message, recallForAll: boolean) => void
  onReact: (message: Message, emoji: string) => void
}

export function MessageBubble({
  message,
  isSent,
  currentUserId,
  showAvatar,
  getParticipantName,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isPending = message._pending
  const isFailed = message._failed

  const [isEditable, setIsEditable] = useState(false)

  useEffect(() => {
    let raf = 0
    if (!isSent || message.isDeleted || message.contentType !== "text") {
      raf = requestAnimationFrame(() => setIsEditable(false))
      return () => cancelAnimationFrame(raf)
    }
    const age = Date.now() - new Date(message.createdAt).getTime()
    raf = requestAnimationFrame(() => setIsEditable(age < 15 * 60 * 1000))
    return () => cancelAnimationFrame(raf)
  }, [isSent, message.isDeleted, message.contentType, message.createdAt])

  const senderName = isSent
    ? "You"
    : (message.senderId?.firstName ?? message.senderId?.loungeTitle ?? "User")

  const avatarSrc =
    typeof message.senderId?.profileImage === "string"
      ? message.senderId.profileImage
      : undefined

  const timeLabel = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: false,
  })

  const reactionGroups = message.reactions.reduce<
    Record<string, { count: number; includesMe: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, includesMe: false }
    acc[r.emoji].count++
    if (r.userId === currentUserId) acc[r.emoji].includesMe = true
    return acc
  }, {})

  const handleTouchStart = () => {
    longPressRef.current = setTimeout(() => setShowPicker(true), 500)
  }
  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          "flex w-full items-end px-4 py-0.5",
          isSent ? "justify-end" : "justify-start",
        )}
      >
        {!isSent && <div className="mr-2 h-8 w-8 shrink-0" />}
        <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-2 text-sm italic">
          This message was recalled
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex w-full items-end px-4 py-0.5",
        isSent ? "justify-end" : "justify-start",
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowPicker(false)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Avatar slot */}
      <div className={cn("h-8 w-8 shrink-0", isSent ? "hidden" : "mr-2")}>
        {!isSent && showAvatar && (
          <ChatAvatar src={avatarSrc} name={senderName} size="sm" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-0.5",
          isSent ? "ml-auto items-end" : "mr-auto items-start",
        )}
      >
        {showPicker && (
          <EmojiPicker
            isSent={isSent}
            onReact={(emoji) => onReact(message, emoji)}
            onClose={() => setShowPicker(false)}
          />
        )}

        <div
          className={cn("flex items-end gap-1", isSent && "flex-row-reverse")}
        >
          <BubbleActions
            message={message}
            isSent={isSent}
            isEditable={isEditable}
            show={showActions}
            onReply={() => onReply(message)}
            onEdit={() => onEdit(message)}
            onDelete={(recallForAll) => onDelete(message, recallForAll)}
            onTogglePicker={() => setShowPicker((v) => !v)}
          />

          {/* Bubble body */}
          <div
            className={cn(
              "relative rounded-2xl px-3 py-2 shadow-sm",
              isSent
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card text-card-foreground border-border/60 rounded-bl-sm border",
              isPending && "opacity-70",
              isFailed && "border-destructive border-2",
            )}
          >
            {message.replyTo && (
              <ReplyPreview
                replyTo={message.replyTo}
                senderName={getParticipantName(message.replyTo.senderId)}
                isSent={isSent}
              />
            )}

            {message.attachment && (
              <div className="mb-1">
                <AttachmentRenderer
                  attachment={message.attachment}
                  contentType={message.contentType}
                  isSent={isSent}
                />
              </div>
            )}

            {message.text && (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.text}
              </p>
            )}

            <div
              className={cn(
                "mt-0.5 flex items-center gap-1",
                isSent ? "justify-end" : "justify-start",
              )}
            >
              <span
                className={cn(
                  "text-[10px]",
                  isSent
                    ? "text-primary-foreground/60"
                    : "text-muted-foreground",
                )}
              >
                {timeLabel}
              </span>
              {message.editedAt && (
                <span
                  className={cn(
                    "text-[10px]",
                    isSent
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  · edited
                </span>
              )}
              {isSent && (
                <MessageStatusIcon
                  isPending={isPending}
                  isFailed={isFailed}
                  isRead={message.readBy.length > 1}
                  className={
                    isFailed ? undefined : "text-primary-foreground/80"
                  }
                />
              )}
            </div>
          </div>
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div
            className={cn(
              "-mt-1 flex flex-wrap gap-1",
              isSent ? "justify-end pr-1" : "justify-start pl-1",
            )}
          >
            {Object.entries(reactionGroups).map(
              ([emoji, { count, includesMe }]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message, emoji)}
                  className={cn(
                    "border-border hover:bg-muted flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs shadow-sm transition-colors",
                    includesMe ? "bg-primary/10" : "bg-card",
                  )}
                >
                  <span>{emoji}</span>
                  {count > 1 && (
                    <span className="text-muted-foreground">{count}</span>
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
