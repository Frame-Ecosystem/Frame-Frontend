"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { resetScrollAndFocusHeader } from "@/app/_lib/scroll-reset"

export default function ScrollResetOnNavigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Disable browser-level restoration so each route starts from the top.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      resetScrollAndFocusHeader()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [pathname, searchKey])

  return null
}
