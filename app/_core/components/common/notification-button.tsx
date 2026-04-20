"use client"

import React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/app/_core/ui/button"
import { Badge } from "@/app/_core/ui/badge"
import { useAuth } from "@/app/_auth"
import { useNotificationContext } from "@/app/_providers/notification"
import { useRouter } from "next/navigation"

// Re-export from canonical modules for backward compatibility
export { getNotificationMeta } from "@/app/_systems/notifications/lib/notification-registry"
export { timeAgo } from "@/app/_systems/notifications/lib/time-utils"

// ── Main notification button (direct redirect) ──────────────

interface NotificationButtonProps {
  compact?: boolean
}

const NotificationButton = ({ compact }: NotificationButtonProps) => {
  const { user, isLoading: authLoading } = useAuth()
  const { unreadCount } = useNotificationContext()
  const router = useRouter()

  if (authLoading || !user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`hover:bg-primary/10 relative flex items-center gap-2 rounded-full ${compact ? "h-8 w-8" : ""}`}
      onClick={() => router.push("/notifications")}
    >
      <div
        className={`border-primary/30 relative flex items-center justify-center rounded-full border ${compact ? "h-8 w-8" : "h-9 w-9"}`}
      >
        <Bell className={compact ? "h-4 w-4" : "h-5 w-5"} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className={`absolute flex items-center justify-center p-0 font-bold ${compact ? "-top-1.5 -right-1.5 h-4 w-4 text-[9px]" : "-top-1 -right-1 h-5 w-5 text-[10px]"}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}

export default NotificationButton
