"use client"

import FooterDesktop from "./footerDesktop"
import { usePathname } from "next/navigation"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Hide footer on verification/check-email and reels pages
  if (
    pathname === "/auth/verify" ||
    pathname === "/auth/check-email" ||
    pathname === "/reels"
  ) {
    return null
  }

  return <FooterDesktop />
}
