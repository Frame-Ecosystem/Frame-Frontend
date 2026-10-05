"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { isPublicRoute } from "@/app/_auth/constants"
import { SessionRestoreLoader } from "@/app/_components/common/session-restore-loader"
import { Loader2 } from "lucide-react"

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
  if (isLoading && publicRoute) return children

  // While restoring session on a protected route, show the animated brand loader.
  if (isLoading) return <SessionRestoreLoader />

  // On protected routes without auth, keep a visible shell while redirect is in progress.
  if (!user && !publicRoute) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Redirecting to sign in…
          </p>
        </div>
      </div>
    )
  }

  return children
}
