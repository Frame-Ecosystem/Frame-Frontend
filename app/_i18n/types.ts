export type Locale = "en" | "fr" | "ar" | "tr"
export type Direction = "ltr" | "rtl"
export type TranslationDictionary = Record<string, string>

export interface LanguageConfig {
  code: Locale
  name: string // native name
  englishName: string
  flag: string
  dir: Direction
}
