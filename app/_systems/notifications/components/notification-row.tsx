"use client"

import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { getNotificationMeta } from "../lib/notification-registry"
import { timeAgo } from "../lib/time-utils"
import type { AppNotification } from "@/app/_types"

interface NotificationRowProps {
  notification: AppNotification
  onDelete: () => void
  onClick: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export function NotificationRow({
  notification,
  onDelete,
  onClick,
  t,
}: NotificationRowProps) {
  const { Icon, color } = getNotificationMeta(notification)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group hover:bg-muted/60 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20 shadow-sm"
          : "bg-background border-border hover:shadow-sm"
      }`}
    >
      {/* Actor avatar or type icon */}
      {notification.imageUrl ? (
        <Image
          src={notification.imageUrl}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className={`mt-0.5 shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="bg-primary h-2 w-2 shrink-0 rounded-full" />
          )}
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {notification.body}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="text-muted-foreground/70 text-xs">
            {timeAgo(notification.createdAt, t)}
          </p>
          {notification.category && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] capitalize">
              {notification.category}
            </span>
          )}
        </div>
      </div>

      {/* Delete button (visible on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  )
}
