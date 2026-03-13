/**
 * Shared booking utility functions used across BookingCard, BookingHistory, and other booking components.
 */

/**
 * Returns Tailwind classes for a booking status badge.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-transparent text-yellow-600 border-yellow-500 hover:bg-yellow-500 hover:text-white dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-white"
    case "confirmed":
      return "bg-transparent text-green-600 border-green-500 hover:bg-green-500 hover:text-white dark:text-green-400 dark:border-green-400 dark:hover:bg-green-400 dark:hover:text-white"
    case "completed":
      return "bg-transparent text-green-600 border-green-500 hover:bg-green-500 hover:text-white dark:text-green-400 dark:border-green-400 dark:hover:bg-green-400 dark:hover:text-white"
    case "inQueue":
      return "bg-transparent text-blue-600 border-blue-500 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
    case "in-service":
      return "bg-transparent text-purple-600 border-purple-500 hover:bg-purple-500 hover:text-white dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-400 dark:hover:text-white"
    case "cancelled":
      return "bg-transparent text-red-600 border-red-500 hover:bg-red-500 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-400 dark:hover:text-white"
    case "absent":
      return "bg-transparent text-red-600 border-red-500 hover:bg-red-500 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-400 dark:hover:text-white"
    default:
      return "bg-transparent text-gray-600 border-gray-400 hover:bg-gray-400 hover:text-white dark:text-gray-400 dark:border-gray-500 dark:hover:bg-gray-500 dark:hover:text-white"
  }
}

/**
 * Opens Google Maps navigation to a destination.
 * Uses the Geolocation API when available for turn-by-turn directions;
 * falls back to a simple search URL otherwise.
 */
export function openMapsNavigation(destination: string): void {
  if (!destination) return

  const open = (url: string) => {
    const w = window.open(url, "_blank")
    if (!w) window.location.href = url
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const origin = `${latitude},${longitude}`
        const encoded = encodeURIComponent(destination)
        open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encoded}&travelmode=driving`,
        )
      },
      () => {
        const encoded = encodeURIComponent(destination)
        open(`https://www.google.com/maps/search/?api=1&query=${encoded}`)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  } else {
    const encoded = encodeURIComponent(destination)
    open(`https://www.google.com/maps/search/?api=1&query=${encoded}`)
  }
}

/**
 * Resolves the best display destination string from a lounge object.
 */
export function getLoungeDestination(
  lounge?: {
    location?: { placeName?: string; address?: string }
    loungeTitle?: string
  } | null,
): string {
  if (!lounge) return ""
  return (
    lounge.location?.placeName ||
    lounge.location?.address ||
    lounge.loungeTitle ||
    ""
  )
}

/**
 * Extracts a displayable image URL from a profileImage field
 * (which can be a string or an object with a `url` property).
 */
export function resolveImageUrl(
  profileImage?: string | { url?: string } | null,
): string | undefined {
  if (!profileImage) return undefined
  if (typeof profileImage === "string") return profileImage
  return profileImage.url
}

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

/**
 * Check if a lounge is currently open based on its opening hours.
 * Returns true if the current day/time falls within the opening interval.
 */
export function isLoungeCurrentlyOpen(
  openingHours:
    | Record<string, { from?: string; to?: string }>
    | null
    | undefined,
): boolean {
  if (!openingHours) return false

  const now = new Date()
  const dayName = DAYS_OF_WEEK[now.getDay()]
  const todayHours = openingHours[dayName]

  if (!todayHours || !todayHours.from || !todayHours.to) return false
  if (todayHours.from === "00:00" && todayHours.to === "00:00") return false

  const [fromH, fromM] = todayHours.from.split(":").map(Number)
  const [toH, toM] = todayHours.to.split(":").map(Number)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const fromMinutes = fromH * 60 + fromM
  const toMinutes = toH * 60 + toM

  return currentMinutes >= fromMinutes && currentMinutes < toMinutes
}
