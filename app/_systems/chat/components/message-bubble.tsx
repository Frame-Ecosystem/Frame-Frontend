"use client"

import { useState, useEffect } from "react"
// import { Pencil, Reply, Trash2, MoreHorizontal, Smile } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/app/_lib/utils"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/app/_components/ui/dropdown-menu"
import { BubbleActions } from "./bubble-actions"
import { ChatAvatar, MessageStatusIcon } from "./ui/chat-atoms"
import { AttachmentRenderer } from "./attachment-renderer"
import { ReplyPreview } from "./reply-preview"
// import type { Message } from "../types"

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"]

// ── Internal: Emoji reaction picker ──────────────────────────

function EmojiPicker({
  isSent,
  onReact,
  onClose,
}: Readonly<{
  isSent: boolean
  onReact: (emoji: string) => void
  onClose: () => void
}>) {
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

function BubbleMainContent({
  message,
  isSent,
  getParticipantName,
  bubbleRadius,
  isPending,
  isFailed,
  timeLabel,
}: any) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center px-3 py-2 shadow-sm",
        bubbleRadius,
        isSent
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
        isPending && "opacity-60",
        isFailed && "ring-destructive ring-2",
      )}
    >
      {/* Reply preview (horizontal wrap) */}
      {message.replyTo && (
        <div className="mb-1 flex flex-row flex-wrap items-center gap-2">
          <ReplyPreview
            replyTo={message.replyTo}
            senderName={getParticipantName(message.replyTo.senderId)}
            isSent={isSent}
          />
        </div>
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
            isSent ? "text-primary-foreground/55" : "text-muted-foreground",
          )}
        >
          {timeLabel}
        </span>
        {message.editedAt && (
          <span
            className={cn(
              "text-[10px] leading-none",
              isSent ? "text-primary-foreground/55" : "text-muted-foreground",
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
            className={isFailed ? undefined : "text-primary-foreground/75"}
          />
        )}
      </div>
    </div>
  )
}

function ReactionsRow({
  reactionGroups,
}: {
  reactionGroups: Record<string, { count: number; includesMe: boolean }>
}) {
  if (Object.keys(reactionGroups).length === 0) return null
  return (
    <div className="flex flex-row gap-1 pt-1">
      {Object.entries(reactionGroups).map(([emoji, { count, includesMe }]) => (
        <span
          key={emoji}
          className={cn(
            "bg-background flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm",
            includesMe && "border-primary bg-primary/10 text-primary",
          )}
        >
          {emoji} {count > 1 && <span>{count}</span>}
        </span>
      ))}
    </div>
  )
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
}: Readonly<MessageBubbleProps>) {
  const [showPicker, setShowPicker] = useState(false)

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
        "flex w-full items-end px-3",
        isSent ? "justify-end" : "justify-start",
        isConsecutive ? "pt-0.5 pb-0.5" : "pt-2 pb-0.5",
      )}
    >
      {/* Avatar slot — received messages only */}
      {!isSent && (
        <div className="mr-1.5 h-7 w-7 shrink-0">
          {showAvatar ? (
            <ChatAvatar src={avatarSrc} name={senderName} size="sm" />
          ) : (
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

        {/* Bubble and actions in a row */}
        <div className="relative flex w-full flex-row items-stretch gap-2">
          <BubbleMainContent
            message={message}
            isSent={isSent}
            getParticipantName={getParticipantName}
            bubbleRadius={bubbleRadius}
            isPending={isPending}
            isFailed={isFailed}
            timeLabel={timeLabel}
          />
          {/* Actions: emoji, reply, 3-dots, always visible in row */}
          <div className="flex min-w-[36px] flex-col items-center justify-center gap-1">
            <BubbleActions
              message={message}
              isSent={isSent}
              isEditable={isEditable}
              show={true}
              onReply={() => onReply(message)}
              onEdit={() => onEdit(message)}
              onDelete={(recallForAll) => onDelete(message, recallForAll)}
              onTogglePicker={() => setShowPicker((v) => !v)}
            />
          </div>
        </div>
        {/* Reactions row */}
        <ReactionsRow reactionGroups={reactionGroups} />
      </div>
    </div>
  )
}
// (removed duplicate code block)
