"use client"

import { Bell } from "lucide-react"

interface NotificationEmptyStateProps {
  activeCategory?: string
  t: (key: string, params?: Record<string, string | number>) => string
}

export function NotificationEmptyState({
  activeCategory,
  t,
}: NotificationEmptyStateProps) {
  return (
    <div className="py-24 text-center">
      <div className="bg-muted/30 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full">
        <Bell className="text-muted-foreground h-10 w-10 opacity-40" />
      </div>
      <p className="text-foreground text-base font-medium">
        {activeCategory
          ? t("notifications.noCategory", { category: activeCategory })
          : t("notifications.empty")}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {activeCategory
          ? t("notifications.trySwitching")
          : t("notifications.emptyHint")}
      </p>
    </div>
  )
}
