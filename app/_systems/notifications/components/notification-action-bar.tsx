"use client"

import { CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/app/_components/ui/button"

interface NotificationActionBarProps {
  onMarkAllRead: () => void
  onClearAll: () => void
  isMarkingRead: boolean
  isClearing: boolean
  t: (key: string) => string
}

export function NotificationActionBar({
  onMarkAllRead,
  onClearAll,
  isMarkingRead,
  isClearing,
  t,
}: NotificationActionBarProps) {
  return (
    <div className="border-border mb-4 flex items-center gap-2 border-b pb-4">
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-primary/10 gap-2 text-xs"
        onClick={onMarkAllRead}
        disabled={isMarkingRead}
      >
        <CheckCheck className="h-3.5 w-3.5" />
        {t("notifications.markAllReadBtn")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-xs"
        onClick={onClearAll}
        disabled={isClearing}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t("notifications.clearAll")}
      </Button>
    </div>
  )
}
