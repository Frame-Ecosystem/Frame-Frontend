/** Format large numbers for display (1000 → 1K, 1000000 → 1M). */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

/** Get a Tailwind color class pair based on a rating score. */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "text-emerald-500 bg-emerald-500/10"
  if (rating >= 4.0) return "text-blue-500 bg-blue-500/10"
  if (rating >= 3.0) return "text-amber-500 bg-amber-500/10"
  return "text-orange-500 bg-orange-500/10"
}
