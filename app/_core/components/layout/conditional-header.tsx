"use client"

import Header from "./header"
import { usePathname } from "next/navigation"

export default function ConditionalHeader() {
  const pathname = usePathname()

  // Hide header on verification/check-email pages for a compact experience
  if (pathname === "/auth/verify" || pathname === "/auth/check-email") {
    return null
  }

  return <Header />
}
