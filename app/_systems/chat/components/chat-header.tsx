"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Trash2, MoreVertical } from "lucide-react"
import { ChatAvatar, ChatIconBtn } from "./ui/chat-atoms"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import type { Conversation } from "../types"

interface ChatHeaderProps {
  conversation: Conversation
  currentUserId: string
  onSearchToggle: () => void
  onDeleteConversation: () => void
  /** When provided, overrides router.back() for use inside the chat drawer */
  onBack?: () => void
}

export function ChatHeader({
  conversation,
  currentUserId,
  onSearchToggle,
  onDeleteConversation,
  onBack,
}: ChatHeaderProps) {
  const router = useRouter()

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

  return (
    <header className="border-border/60 bg-background/80 border-b backdrop-blur-sm">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Back */}
        <ChatIconBtn
          onClick={() => (onBack ? onBack() : router.back())}
          label="Back"
          className="-ml-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </ChatIconBtn>

        {/* Avatar + name */}
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <ChatAvatar
            src={avatarSrc}
            name={displayName}
            size="md"
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate leading-tight font-semibold">
              {displayName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <ChatIconBtn onClick={onSearchToggle} label="Search messages">
            <Search className="h-4 w-4" />
          </ChatIconBtn>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ChatIconBtn label="More options">
                <MoreVertical className="h-4 w-4" />
              </ChatIconBtn>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={onDeleteConversation}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
