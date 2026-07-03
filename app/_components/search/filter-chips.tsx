"use client"

import { useTranslation } from "@/app/_i18n"
import type { SearchCategory } from "@/app/_systems/search/types"
import { SEARCH_CATEGORIES } from "@/app/_systems/search/types"

interface FilterChipsProps {
  active: SearchCategory
  onChange: (category: SearchCategory) => void
}

const LABEL_MAP: Record<SearchCategory, string> = {
  all: "search.filter.all",
  users: "search.filter.users",
  lounges: "search.filter.lounges",
  posts: "search.filter.posts",
  reels: "search.filter.reels",
  products: "search.filter.products",
  stores: "search.filter.stores",
  hashtags: "search.filter.hashtags",
  services: "search.filter.services",
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden">
      {SEARCH_CATEGORIES.map((cat) => {
        const isActive = cat === active
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {t(LABEL_MAP[cat])}
          </button>
        )
      })}
    </div>
  )
}
