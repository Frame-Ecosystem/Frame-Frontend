"use client"

import { useRef, useCallback } from "react"
import { Search, X } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onCancel?: () => void
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  onCancel,
  autoFocus,
}: SearchBarProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (value) {
          onChange("")
        } else {
          onCancel?.()
        }
      }
    },
    [value, onChange, onCancel],
  )

  return (
    <div className="flex items-center gap-3">
      <div className="bg-muted/60 relative flex flex-1 items-center rounded-xl border">
        <Search className="text-muted-foreground ml-3 h-5 w-5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("search.placeholder")}
          autoFocus={autoFocus}
          className="h-12 w-full bg-transparent px-3 text-base outline-none placeholder:text-sm"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground mr-2 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            aria-label={t("search.clear")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {value && onCancel && (
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground shrink-0 text-sm font-medium transition-colors"
        >
          {t("search.cancel")}
        </button>
      )}
    </div>
  )
}
