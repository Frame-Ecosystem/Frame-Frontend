"use client"

import { useSwipeNavigation } from "../_hooks/useSwipeNavigation"
import { usePullToRefresh } from "../_hooks/usePullToRefresh"

export function SwipeNavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useSwipeNavigation()
  usePullToRefresh()
  return <>{children}</>
}
