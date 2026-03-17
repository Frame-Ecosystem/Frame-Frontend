import type { ClientProfile } from "@/app/_types"

export function getDisplayName(p: ClientProfile | null): string {
  if (!p) return "Client"
  return `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Client"
}

export function getInitials(p: ClientProfile | null): string {
  if (!p) return "?"
  const f = p.firstName?.[0] || ""
  const l = p.lastName?.[0] || ""
  return (f + l).toUpperCase() || "?"
}

/** Safely extract a URL string from a field that may be a string, object with url, or empty. */
export function toImageUrl(img: unknown): string | undefined {
  if (!img) return undefined
  if (typeof img === "string" && img.length > 0) return img
  if (typeof img === "object" && img !== null && "url" in img) {
    const url = (img as { url?: string }).url
    return url && url.length > 0 ? url : undefined
  }
  return undefined
}
