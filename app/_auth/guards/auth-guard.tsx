"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { isPublicRoute } from "@/app/_auth/constants"
import { Skeleton } from "@/app/_components/ui/skeleton"
import { Loader2 } from "lucide-react"

/** Content-shaped skeleton shown while the session restore runs in the background. */
function SessionRestoreSkeleton() {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  )
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
  if (isLoading && publicRoute) return children

  // While restoring session on a protected route, show a skeleton (not blank text).
  if (isLoading) return <SessionRestoreSkeleton />

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
