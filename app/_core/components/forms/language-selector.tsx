"use client"

import { Check, ChevronDown, Globe } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "@/app/_i18n"
import type { Locale } from "@/app/_i18n"
import { LANGUAGES } from "@/app/_constants/languages"
import { authService } from "@/app/_auth"
import { useAuth } from "@/app/_auth"
import { isAuthError } from "@/app/_services/api"
import { toast } from "sonner"

export function LanguageSelector() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { locale, setLocale, t } = useTranslation()
  const { user } = useAuth()

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = async (code: string) => {
    const previousLocale = locale
    try {
      setIsUpdating(true)
      // Optimistic: switch immediately
      setLocale(code as Locale)
      setIsOpen(false)

      if (user) {
        // Persist to backend
        await authService.updateLanguage(code)
      }
      setTimeout(() => toast.success(t("toast.languageUpdated")), 0)
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to update language:", error)
      // Revert on failure
      setLocale(previousLocale)
      toast.error(t("toast.error"))
    } finally {
      setIsUpdating(false)
    }
  }

  // SSR / hydration placeholder
  if (!mounted) {
    return (
      <div className="space-y-2">
        <button className="border-border w-full rounded-lg border p-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="text-muted-foreground h-5 w-5" />
              <span className="font-medium">{t("language.title")}</span>
            </div>
            <ChevronDown className="text-muted-foreground h-5 w-5" />
          </div>
        </button>
      </div>
    )
  }

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  return (
    <div className="space-y-2">
      {/* ── Collapsed header ─────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border-border hover:bg-card/50 w-full rounded-lg border p-4 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="text-muted-foreground h-5 w-5" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentLang.flag}</span>
              <span className="font-medium">{currentLang.name}</span>
            </div>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* ── Expanded language list ───────────────────────────────────── */}
      {isOpen && (
        <div className="space-y-1 px-1">
          {LANGUAGES.map((lang) => {
            const isActive = locale === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isUpdating}
                className={`relative flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all hover:scale-[1.01] ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                } ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <Check className="text-primary h-4 w-4" />
                  </div>
                )}

                <span className="text-2xl">{lang.flag}</span>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{lang.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {lang.englishName}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
