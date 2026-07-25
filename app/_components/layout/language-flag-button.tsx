"use client"

import { useLayoutEffect, useState } from "react"
import { Check } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import type { Locale } from "@/app/_i18n"
import { LANGUAGES } from "@/app/_constants/languages"
import { cn } from "@/app/_core/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"

const LABELS: Record<string, string> = {
  ar: "Ar",
  en: "En",
  fr: "Fr",
  tr: "Tr",
}

function checkFlagEmoji(): boolean {
  if (typeof document === "undefined") return true
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return true
    ctx.font = "72px serif"
    const flagW = ctx.measureText("\u{1F1F9}\u{1F1F3}").width
    const textW = ctx.measureText("AA").width
    return flagW > textW
  } catch {
    return true
  }
}

export default function LanguageFlagButton() {
  const [ready, setReady] = useState({ mounted: false, flagOk: true })
  const { locale, setLocale } = useTranslation()

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady({ mounted: true, flagOk: checkFlagEmoji() })
  }, [])

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]
  const label = LABELS[currentLang.code] ?? currentLang.code.toUpperCase()

  if (!ready.mounted) {
    return (
      <div className="border-primary/30 flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold">
        {LABELS[LANGUAGES[0].code]}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change language"
          className="border-primary/30 hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition-colors"
        >
          {ready.flagOk ? currentLang.flag : label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[150px]">
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code
          const itemLabel = LABELS[lang.code] ?? lang.code.toUpperCase()
          return (
            <DropdownMenuItem
              key={lang.code}
              onSelect={() => setLocale(lang.code as Locale)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 py-2",
                isActive && "bg-primary/10",
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] leading-none font-bold">
                {ready.flagOk ? lang.flag : itemLabel}
              </span>
              <span className="flex-1 text-sm font-medium">{lang.name}</span>
              {isActive && <Check className="text-primary h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
