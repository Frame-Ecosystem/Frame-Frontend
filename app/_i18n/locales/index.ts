import type { Locale, TranslationDictionary } from "../types"
import en from "./en"
import fr from "./fr"
import ar from "./ar"
import tr from "./tr"

/**
 * Static locale registry.
 *
 * All dictionaries are bundled at build time for instant language switching
 * with zero network delay. For apps with dozens of locales, swap this for
 * dynamic `import()` with React.lazy / Suspense.
 */
export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  fr,
  ar,
  tr,
}

/** The canonical fallback — every missing key resolves against English. */
export const fallbackDictionary: TranslationDictionary = en
