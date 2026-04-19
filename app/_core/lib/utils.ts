import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/app/_types"

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

/** Format bio text by inserting line breaks at intervals */
export function formatBioText(text: string, isMobile: boolean = false): string {
  const breakInterval = isMobile ? 40 : 100
  const lines: string[] = []
  for (let i = 0; i < text.length; i += breakInterval) {
    lines.push(text.substring(i, i + breakInterval))
  }
  return lines.join("\n")
}

/** Extract a usable URL from a User's profileImage field */
export function getImageUrl(img: User["profileImage"]): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img
  return img.url
}

/** Extract a usable URL from a User's coverImage field */
export function getCoverUrl(img: User["coverImage"]): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img
  return img.url
}
