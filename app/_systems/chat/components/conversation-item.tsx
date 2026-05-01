"use client"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { ChatAvatar } from "./ui/chat-atoms"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import type { Conversation } from "../types"

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isActive?: boolean
  onDeleteConversation?: (id: string) => void
  /** When provided, renders as a button instead of a Link */
  onSelect?: (id: string) => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onDeleteConversation,
  onSelect,
}: ConversationItemProps) {
  const conversationId = conversation._id
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

  const rowClassName = cn(
    "flex items-center gap-2 rounded-xl px-2 py-2 transition-colors",
    isActive ? "bg-primary/10" : "hover:bg-muted/60 active:bg-muted",
  )

  const sharedClassName = "flex min-w-0 flex-1 items-center gap-3 px-1 py-1"

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

  return (
    <div className={rowClassName}>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(conversationId)}
          className={cn(sharedClassName, "w-full text-left")}
        >
          {content}
        </button>
      ) : (
        <Link href={`/messages/${conversationId}`} className={sharedClassName}>
          {content}
        </Link>
      )}

      {onDeleteConversation && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Conversation options"
              className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                onDeleteConversation(conversationId)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
