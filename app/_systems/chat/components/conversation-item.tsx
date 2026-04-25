"use client"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { cn } from "@/app/_lib/utils"
import { ChatAvatar } from "./ui/chat-atoms"
import type { Conversation } from "../types"

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isActive?: boolean
  /** When provided, renders as a button instead of a Link */
  onSelect?: (id: string) => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const other = conversation.participants.find((p) => p._id !== currentUserId)

  const displayName = other
    ? `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim() ||
      other.loungeTitle ||
      "User"
    : "Conversation"

  const avatarSrc =
    typeof other?.profileImage === "string"
      ? other.profileImage
      : (other?.profileImage as any)?.url

  const last = conversation.lastMessage
  const lastText = last?.text
    ? last.text.length > 60
      ? last.text.slice(0, 60) + "…"
      : last.text
    : last?.contentType === "image"
      ? "📷 Photo"
      : last?.contentType === "audio"
        ? "🎵 Audio"
        : last?.contentType === "file"
          ? "📎 File"
          : null

  const unreadCount =
    conversation.unreadCounts?.find((u) => u.userId === currentUserId)?.count ??
    0

  const timeLabel = conversation.updatedAt
    ? formatDistanceToNow(new Date(conversation.updatedAt), {
        addSuffix: false,
      })
    : null

  const sharedClassName = cn(
    "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
    isActive ? "bg-primary/10" : "hover:bg-muted/60 active:bg-muted",
  )

  const content = (
    <>
      <div className="relative shrink-0">
        <ChatAvatar src={avatarSrc} name={displayName} size="lg" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate leading-snug font-semibold">{displayName}</p>
          {timeLabel && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {timeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {lastText && (
            <p
              className={cn(
                "truncate text-sm",
                unreadCount > 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {lastText}
            </p>
          )}
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </>
  )

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(conversation._id)}
        className={cn(sharedClassName, "w-full text-left")}
      >
        {content}
      </button>
    )
  }

  return (
    <Link href={`/messages/${conversation._id}`} className={sharedClassName}>
      {content}
    </Link>
  )
}
