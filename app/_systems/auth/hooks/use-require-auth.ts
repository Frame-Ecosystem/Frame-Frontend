"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"

/**
 * Page-level auth guard hook.
 * Redirects unauthenticated users to the root page with the sign-in dialog
 * open. Does NOT display any error message — the redirect is silent.
 *
 * Usage:
 *   const { user, isLoading } = useRequireAuth()
 *   if (isLoading || !user) return null
 */
export function useRequireAuth(options?: {
  requiredType?: "client" | "lounge" | "admin"
}) {
  const { user, isLoading, accessToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/?signin=true")
      return
    }

    if (options?.requiredType && user.type !== options.requiredType) {
      router.replace("/?signin=true")
    }
  }, [isLoading, user, router, options?.requiredType])

  return { user, isLoading, isAuthenticated: !!user && !!accessToken }
}
