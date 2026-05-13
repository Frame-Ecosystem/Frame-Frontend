"use client"

import React from "react"
import { Bell } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "../../_providers/notification"
import { useRouter } from "next/navigation"

// Re-export from canonical modules for backward compatibility
export { getNotificationMeta } from "@/app/_systems/notifications/lib/notification-registry"
export { timeAgo } from "@/app/_systems/notifications/lib/time-utils"

// ── Main notification button (direct redirect) ──────────────

interface NotificationButtonProps {
  compact?: boolean
}

const NotificationButton = ({ compact: _compact }: NotificationButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
  const router = useRouter()

  if (authLoading || !user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/10 relative flex h-10 w-10 items-center justify-center rounded-full p-0"
      onClick={() => router.push("/notifications")}
      aria-label="Notifications"
    >
      <div className="border-primary/30 relative flex h-10 w-10 items-center justify-center rounded-full border">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

export default NotificationButton
