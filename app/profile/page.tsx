"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { getProfilePath } from "../_lib/profile"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/")
      return
    }
    router.replace(getProfilePath(user))
  }, [isLoading, router, user])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              <div className="bg-primary/10 mx-auto h-24 w-24 animate-pulse rounded-full" />
              <div className="space-y-3">
                <div className="bg-primary/10 mx-auto h-5 w-40 animate-pulse rounded" />
                <div className="bg-primary/10 mx-auto h-4 w-56 animate-pulse rounded" />
              </div>
              <div className="flex justify-center gap-3">
                <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
                <div className="bg-primary/10 h-9 w-24 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
