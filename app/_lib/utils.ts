import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMemberSinceDate(dateString?: string): string {
  if (!dateString) return "Unknown"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Unknown"
  }
}
