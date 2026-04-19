"use client"

import { useSwipeNavigation } from "@/app/_hooks/useSwipeNavigation"
import { usePullToRefresh } from "@/app/_hooks/usePullToRefresh"

export function SwipeNavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useSwipeNavigation()
  usePullToRefresh()
  return <>{children}</>
}
