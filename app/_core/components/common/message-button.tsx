"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/app/_core/ui/button"
import { Badge } from "@/app/_core/ui/badge"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "@/app/_providers/notification"
import { useRouter } from "next/navigation"

interface MessageButtonProps {
  compact?: boolean
}

const MessageButton = ({ compact: _compact }: MessageButtonProps) => {
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
            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
          >
            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

export default MessageButton
