"use client"

import { Sparkles, CheckCircle, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/app/_i18n"

interface ExtraInfo {
  _id: string
  name: string
  description?: string
  free: boolean
  cost: number
}

interface ExtrasCardProps {
  extras: ExtraInfo[]
}

export function ExtrasCard({ extras }: ExtrasCardProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!extras?.length) return null

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-amber-200/60 bg-amber-50/40 dark:border-amber-900/20 dark:bg-amber-950/10">
      <div className="absolute top-0 left-0 h-full w-[3px] rounded-l-xl bg-amber-400" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 pl-5">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              {t("extras.title")}
            </span>
            <p className="text-muted-foreground truncate text-sm">
              {extras.length} {extras.length === 1 ? "extra" : "extras"}
            </p>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-2 border-t border-amber-200/40 px-4 py-3 pl-5 dark:border-amber-900/20">
          {extras.map((extra) => (
            <div
              key={extra._id}
              className="text-foreground flex items-start gap-2 text-sm"
            >
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <span className="font-medium">{extra.name}</span>
                {extra.description && (
                  <p className="text-muted-foreground truncate text-xs">
                    {extra.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums">
                {extra.free ? t("loungeExtras.free") : `$${extra.cost}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
