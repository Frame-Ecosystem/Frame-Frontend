/**
 * ─── Frame i18n Module ───────────────────────────────────────────────────
 *
 * Lightweight, zero-dependency internationalisation system inspired by n8n.
 *
 * Features
 *   • Dot-notation translation keys — `t("nav.home")`
 *   • Variable interpolation — `t("queue.position", { position: 3 })`
 *   • Automatic pluralisation — `_zero`, `_one`, `_other` suffixes
 *   • RTL support — `dir` attribute set on `<html>` for Arabic
 *   • Browser locale detection + localStorage persistence
 *   • Fallback chain — missing key → English → raw key
 *
 * Usage
 * ```tsx
 * import { useTranslation } from "@/app/_i18n"
 *
 * function MyComponent() {
 *   const { t, locale, isRTL } = useTranslation()
 *   return <h1>{t("nav.home")}</h1>
 * }
 * ```
 */

export { LanguageProvider, useTranslation } from "./context"
export type { Locale, Direction, LanguageConfig } from "./types"
