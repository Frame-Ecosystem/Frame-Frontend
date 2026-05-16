"use client"

import { useState, useRef, useEffect } from "react"
import { Pencil, Reply, Trash2, MoreHorizontal, Smile } from "lucide-react"
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
        "animate-in fade-in zoom-in-95 bg-popover mb-1 flex items-center gap-0.5 rounded-full border px-1.5 py-1 shadow-xl",
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
          className="rounded-full p-1 text-xl transition-transform hover:scale-130 active:scale-110"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// ── Internal: Hover action buttons (absolutely positioned — do not steal bubble width) ────

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
  const btnCls =
    "bg-background/90 border-border/60 hover:bg-muted flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors"

  return (
    <div
      className={cn(
        // Floats outside the bubble — sent actions sit to the left, received to the right
        "absolute bottom-0 z-20 flex items-center gap-0.5 transition-all duration-150",
        isSent
          ? "right-[calc(100%+6px)] flex-row"
          : "left-[calc(100%+6px)] flex-row",
        show
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-1 opacity-0",
      )}
    >
      <button onClick={onTogglePicker} className={btnCls} aria-label="Add reaction">
        <Smile className="text-muted-foreground h-3.5 w-3.5" />
      </button>
      <button onClick={onReply} className={btnCls} aria-label="Reply">
        <Reply className="text-muted-foreground h-3.5 w-3.5" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={btnCls} aria-label="More options">
            <MoreHorizontal className="text-muted-foreground h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isSent ? "end" : "start"} className="w-44">
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
  /** True when the previous message was sent by the same user (tighter grouping). */
  isConsecutive?: boolean
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
  isConsecutive = false,
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

  // ── Bubble corner radius: Messenger-style grouped corners ────────────
  // Computed as a helper to avoid nested ternary lint warnings.
  function calcBubbleRadius(): string {
    if (isSent) {
      if (showAvatar && isConsecutive) return "rounded-2xl rounded-r-md"
      if (showAvatar) return "rounded-2xl rounded-br-sm"
      if (isConsecutive) return "rounded-2xl rounded-r-md"
      return "rounded-2xl rounded-tr-sm"
    }
    if (showAvatar && isConsecutive) return "rounded-2xl rounded-l-md"
    if (showAvatar) return "rounded-2xl rounded-bl-sm"
    if (isConsecutive) return "rounded-2xl rounded-l-md"
    return "rounded-2xl rounded-tl-sm"
  }
  const bubbleRadius = calcBubbleRadius()

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          "flex w-full items-end px-3 py-0.5",
          isSent ? "justify-end" : "justify-start",
        )}
      >
        {!isSent && <div className="mr-2 h-7 w-7 shrink-0" />}
        <p className="text-muted-foreground rounded-2xl border border-dashed px-4 py-1.5 text-sm italic">
          This message was recalled
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex w-full items-end px-3",
        isSent ? "justify-end" : "justify-start",
        // Tighter vertical gap inside a message group, wider at group boundaries
        isConsecutive ? "pb-0.5 pt-0.5" : "pb-0.5 pt-2",
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowPicker(false)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Avatar slot — received messages only */}
      {!isSent && (
        <div className="mr-1.5 h-7 w-7 shrink-0">
          {showAvatar ? (
            <ChatAvatar src={avatarSrc} name={senderName} size="sm" />
          ) : (
            // Invisible spacer keeps grouped messages left-aligned under the avatar
            <span className="block h-7 w-7" />
          )}
        </div>
      )}

      {/* Message column — fills up to 85% on mobile, 78% on wider screens */}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-0.5 sm:max-w-[78%]",
          isSent ? "items-end" : "items-start",
        )}
      >
        {showPicker && (
          <EmojiPicker
            isSent={isSent}
            onReact={(emoji) => onReact(message, emoji)}
            onClose={() => setShowPicker(false)}
          />
        )}

        {/* Bubble — actions float outside via absolute positioning */}
        <div className="relative">
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

          <div
            className={cn(
              "px-3 py-2 shadow-sm",
              bubbleRadius,
              isSent
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
              isPending && "opacity-60",
              isFailed && "ring-destructive ring-2",
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
              <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {message.text}
              </p>
            )}

            {/* Timestamp + status row */}
            <div
              className={cn(
                "mt-1 flex items-center gap-1",
                isSent ? "justify-end" : "justify-start",
              )}
            >
              <span
                className={cn(
                  "text-[10px] leading-none",
                  isSent
                    ? "text-primary-foreground/55"
                    : "text-muted-foreground",
                )}
              >
                {timeLabel}
              </span>
              {message.editedAt && (
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    isSent
                      ? "text-primary-foreground/55"
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
                    isFailed ? undefined : "text-primary-foreground/75"
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
                    includesMe
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background",
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
