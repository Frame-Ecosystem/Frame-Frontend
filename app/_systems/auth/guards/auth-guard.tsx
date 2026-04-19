"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"

const PUBLIC_ROUTES = [
  "/",
  "/auth/google/callback",
  "/auth/google/done",
  "/auth/google/error",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/check-email",
  "/sentry-example-page",
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname)
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user && !isPublicRoute(pathname)) {
      router.replace("/?signin=true")
    }
  }, [isLoading, user, pathname, router])

  // While loading, render nothing to avoid flicker
  if (isLoading) return null

  // On protected routes without auth, render nothing (redirect is in progress)
  if (!user && !isPublicRoute(pathname)) return null

  return <>{children}</>
}
