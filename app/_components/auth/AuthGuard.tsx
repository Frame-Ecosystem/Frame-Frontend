"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    // Allow the root path to remain public
    if (!user && pathname !== "/") {
      router.replace("/")
    }
  }, [isLoading, user, pathname, router])

  // While loading or redirecting, render nothing to avoid flicker
  if (isLoading) return null

  if (!user && pathname !== "/") return null

  return <>{children}</>
}
