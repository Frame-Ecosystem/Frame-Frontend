"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { getProfilePath } from "../_lib/profile"
import { ProfileRouterSkeleton } from "../_components/skeletons/auth"

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
    return <ProfileRouterSkeleton />
  }

  return null
}
