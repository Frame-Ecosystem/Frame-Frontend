"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, X } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import {
  getRecentSearches,
  clearRecentSearches,
  removeRecentSearch,
} from "@/app/_systems/search/constants/recent-searches"
import { RECENT_SEARCHES_KEY } from "@/app/_systems/search/constants"

interface RecentSearchesProps {
  onSelect: (query: string) => void
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { t } = useTranslation()
  const [items, setItems] = useState<string[]>(() => getRecentSearches())

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === RECENT_SEARCHES_KEY) setItems(getRecentSearches())
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleRemove = useCallback((e: React.MouseEvent, query: string) => {
    e.stopPropagation()
    removeRecentSearch(query)
    setItems((prev) => prev.filter((s) => s !== query))
  }, [])

  const handleClear = useCallback(() => {
    clearRecentSearches()
    setItems([])
  }, [])

  if (items.length === 0) return null

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-medium">
          {t("search.recentTitle")}
        </h3>
        <button
          onClick={handleClear}
          className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
        >
          {t("search.clearRecent")}
        </button>
      </div>
      <div className="space-y-1">
        {items.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
          >
            <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-sm">{q}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => handleRemove(e, q)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleRemove(e as any, q)
              }}
              className="text-muted-foreground/50 hover:text-muted-foreground cursor-pointer p-0.5 transition-colors"
              aria-label={`Remove "${q}"`}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
