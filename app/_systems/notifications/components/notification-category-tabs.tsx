"use client"

import { NotificationCategory } from "@/app/_types"

// ── Tab config ───────────────────────────────────────────────

const CATEGORY_TAB_VALUES: (NotificationCategory | undefined)[] = [
  undefined,
  NotificationCategory.BOOKING,
  NotificationCategory.QUEUE,
  NotificationCategory.CONTENT,
  NotificationCategory.SOCIAL,
  NotificationCategory.ADMIN,
]

const CATEGORY_TAB_KEYS = [
  "notifications.catAll",
  "notifications.catBookings",
  "notifications.catQueue",
  "notifications.catContent",
  "notifications.catSocial",
  "notifications.catAdmin",
]

// ── Component ────────────────────────────────────────────────

interface NotificationCategoryTabsProps {
  activeCategory: NotificationCategory | undefined
  onCategoryChange: (category: NotificationCategory | undefined) => void
  unreadCount: number
  unreadByCategory: Record<string, number>
  t: (key: string, params?: Record<string, string | number>) => string
}

export function NotificationCategoryTabs({
  activeCategory,
  onCategoryChange,
  unreadCount,
  unreadByCategory,
  t,
}: NotificationCategoryTabsProps) {
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORY_TAB_VALUES.map((value, i) => {
        const isActive = activeCategory === value
        const label = t(CATEGORY_TAB_KEYS[i])
        const count = value ? (unreadByCategory[value] ?? 0) : unreadCount
        return (
          <button
            key={i}
            onClick={() => onCategoryChange(value)}
            className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
            {count > 0 && (
              <span
                className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
