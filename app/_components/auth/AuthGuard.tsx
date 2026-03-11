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

    // Allow certain public routes even when not authenticated
    const publicRoutes = [
      "/",
      "/auth/google/callback",
      "/auth/google/error",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify",
      "/auth/check-email",
    ]
    const isPublicRoute = publicRoutes.includes(pathname)

    // Allow the root path and other public routes to remain accessible
    if (!user && !isPublicRoute) {
      router.replace("/?signin=true")
    }
  }, [isLoading, user, pathname, router])

  // While loading or redirecting, render nothing to avoid flicker
  if (isLoading) return null

  // Allow certain public routes even when not authenticated
  const publicRoutes = [
    "/",
    "/auth/google/callback",
    "/auth/google/error",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify",
    "/auth/check-email",
  ]
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!user && !isPublicRoute) return null

  return <>{children}</>
}
