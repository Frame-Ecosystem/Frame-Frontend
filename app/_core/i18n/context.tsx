"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Locale, Direction } from "./types"
import { translate } from "./engine"
import { dictionaries, fallbackDictionary } from "@/app/_i18n/locales"

// ── Constants ────────────────────────────────────────────────────────────

const RTL_LOCALES = new Set<Locale>(["ar"])
const STORAGE_KEY = "frame-locale"
const DEFAULT_LOCALE: Locale = "ar"
const SUPPORTED_LOCALES: Locale[] = ["en", "fr", "ar", "tr"]

// ── Helpers ──────────────────────────────────────────────────────────────

function getDirection(locale: Locale): Direction {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr"
}

/**
 * Detect the best locale on first visit.
 *
 * Priority:
 *   1. Explicit localStorage preference
 *   2. Browser `navigator.language` prefix
 *   3. DEFAULT_LOCALE
 */
function detectLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
  }

  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0] as Locale
    if (SUPPORTED_LOCALES.includes(browserLang)) return browserLang
  }

  return DEFAULT_LOCALE
}

// ── Context ──────────────────────────────────────────────────────────────

interface LanguageContextValue {
  /** Active locale code */
  locale: Locale
  /** Text direction for active locale */
  dir: Direction
  /** Convenience boolean — `true` when active locale is right-to-left */
  isRTL: boolean
  /** Switch locale. Persists to localStorage and updates `<html>` attrs. */
  setLocale: (locale: Locale) => void
  /**
   * Translate a key.
   *
   * @example
   *   t("nav.home")                           // → "Home"
   *   t("content.comments", { count: 5 })     // → "5 comments · view all"
   *   t("content.comments", { count: 1 })     // → "1 comment · view all"  (automatic plural)
   *   t("notifications.liked", { name: "Sara" }) // → "Sara liked your post"
   */
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  // Detect preferred locale on mount (client-only)
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(detectLocale())
    setMounted(true)
  }, [])

  // Sync document attributes whenever locale changes
  useLayoutEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.lang = locale
    // Keep document always LTR — individual title rows opt-in to RTL via dir={dir}
    root.dir = "ltr"

    // Persist choice
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, mounted])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
      return translate(dict, fallbackDictionary, key, params)
    },
    [locale],
  )

  const dir = getDirection(locale)

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dir, isRTL: dir === "rtl", setLocale, t }),
    [locale, dir, setLocale, t],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * Access the translation function and current locale inside any component.
 *
 * ```tsx
 * const { t, locale, isRTL } = useTranslation()
 * return <p>{t("common.loading")}</p>
 * ```
 */
export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within a <LanguageProvider>")
  }
  return ctx
}
