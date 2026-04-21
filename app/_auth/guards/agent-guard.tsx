"use client"

import { useAuth } from "@/app/_auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

/**
 * Client-side guard for agent-only routes.
 * Redirects non-agents to the sign-in prompt on the root page.
 */
export function AgentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "agent")) {
      router.replace("/?signin=true")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.type !== "agent") return null

  return <>{children}</>
}
