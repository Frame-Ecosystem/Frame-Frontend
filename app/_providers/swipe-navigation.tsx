"use client"

import { useSwipeNavigation } from "../_hooks/useSwipeNavigation"

export function SwipeNavigationProvider({ children }: { children: React.ReactNode }) {
  useSwipeNavigation()
  return <>{children}</>
}
