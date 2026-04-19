import type { TranslationDictionary } from "./types"

/**
 * Lightweight interpolation regex.
 * Matches `{variableName}` inside translation strings.
 */
const INTERPOLATION_RE = /\{(\w+)\}/g

/**
 * Core translation resolver.
 *
 * Lookup chain:
 *   1. Plural variant (if `params.count` is provided)  →  `key_zero | key_one | key_other`
 *   2. Exact key in active dictionary
 *   3. Exact key in fallback (English) dictionary
 *   4. Raw key as last resort (makes missing translations visible during dev)
 *
 * After resolving the template string, `{variable}` tokens are replaced
 * with the matching value from `params`.
 */
export function translate(
  dict: TranslationDictionary,
  fallback: TranslationDictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  let resolved: string | undefined

  // ── Automatic pluralization ──
  if (params && typeof params.count === "number") {
    const count = params.count
    const suffix = count === 0 ? "_zero" : count === 1 ? "_one" : "_other"
    resolved = dict[`${key}${suffix}`] ?? fallback[`${key}${suffix}`]
  }

  // ── Standard lookup with fallback chain ──
  if (!resolved) {
    resolved = dict[key] ?? fallback[key] ?? key
  }

  // ── Interpolation ──
  if (!params) return resolved

  return resolved.replace(INTERPOLATION_RE, (_, varName) =>
    params[varName] != null ? String(params[varName]) : `{${varName}}`,
  )
}
