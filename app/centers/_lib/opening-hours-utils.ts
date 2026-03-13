/**
 * Convert a time string to minutes since midnight.
 * Supports both "HH:MM" (24h) and "H:MM AM/PM" (12h) formats.
 */
export function timeToMinutes(timeStr: string): number {
  const time = timeStr.toLowerCase().trim()
  let hours: number, minutes: number

  if (time.includes("am") || time.includes("pm")) {
    const [timePart, period] = time.split(" ")
    const [h, m] = timePart.split(":").map(Number)
    hours = h === 12 ? (period === "am" ? 0 : 12) : period === "pm" ? h + 12 : h
    minutes = m || 0
  } else {
    const [h, m] = time.split(":").map(Number)
    hours = h
    minutes = m || 0
  }

  return hours * 60 + minutes
}

/**
 * Check if a lounge is currently open based on its opening hours.
 */
export function isCurrentlyOpen(openingHours: any): boolean {
  if (!openingHours) return false

  const now = new Date()
  const dayOfWeek = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const todayHours = openingHours[dayOfWeek]
  if (!todayHours) return false

  const openTime = todayHours.open || todayHours.from
  const closeTime = todayHours.close || todayHours.to
  if (!openTime || !closeTime) return false

  const openMinutes = timeToMinutes(openTime)
  const closeMinutes = timeToMinutes(closeTime)

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
}
