"use client"

import React from "react"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/app/_auth"
import { useFindOrCreateConversation } from "@/app/_systems/chat/hooks/useChatQueries"
import { useNotificationContext } from "../../_providers/notification"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

interface NavMessageButtonProps {
  compact?: boolean
}

const NavMessageButton = ({
  compact: _compact,
}: NavMessageButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadMessageCount } = useNotificationContext()
  const router = useRouter()

  if (authLoading || !user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/10 relative flex h-10 w-10 items-center justify-center rounded-full p-0"
      onClick={() => router.push("/messages")}
      aria-label="Messages"
    >
      <div className="border-primary/30 relative flex h-10 w-10 items-center justify-center rounded-full border">
        <MessageCircle className="h-5 w-5" />
        {unreadMessageCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
          >
            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

interface MessageButtonProps {
  recipientId: string
  className?: string
}

export function MessageButton({ recipientId, className }: MessageButtonProps) {
  const router = useRouter()
  const { mutateAsync, isPending } = useFindOrCreateConversation()

  const handleClick = async () => {
    const res = await mutateAsync(recipientId)
    router.push(`/messages/${res.conversation._id}`)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-1 text-blue-600 transition-colors hover:bg-blue-500/20 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`}
      aria-label="Send message"
    >
      <MessageCircle size={14} />
      <span className="text-sm font-medium">Message</span>
    </button>
  )
}

export default NavMessageButton
