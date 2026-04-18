"use client"

import { usePathname } from "next/navigation"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Footer only appears on the root landing page (it has its own inline footer)
  // All other pages have no footer
  if (pathname !== "/") {
    return null
  }

  return null
}
