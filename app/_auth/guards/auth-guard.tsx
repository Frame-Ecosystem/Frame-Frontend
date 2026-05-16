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
  const publicRoute = isPublicRoute(pathname)

  useEffect(() => {
    if (isLoading) return

    if (!user && !publicRoute) {
      router.replace("/?signin=true")
    }
  }, [isLoading, user, publicRoute, router])

  // Public routes must render immediately to avoid intermittent white screens.
  if (isLoading && publicRoute) return <>{children}</>

  // While loading protected routes, show a deterministic shell instead of a blank screen.
  if (isLoading) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    )
  }

  // On protected routes without auth, keep a visible shell while redirect is in progress.
  if (!user && !publicRoute) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Redirecting to sign in...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
