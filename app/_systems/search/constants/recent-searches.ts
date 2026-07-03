import { RECENT_SEARCHES_KEY, MAX_RECENT_SEARCHES } from "."

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === "undefined") return
  const recent = getRecentSearches()
  const updated = [query, ...recent.filter((s) => s !== query)].slice(
    0,
    MAX_RECENT_SEARCHES,
  )
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {}
}

export function removeRecentSearch(query: string): void {
  if (typeof window === "undefined") return
  const recent = getRecentSearches()
  const updated = recent.filter((s) => s !== query)
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {}
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {}
}
