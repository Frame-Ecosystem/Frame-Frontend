"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Default landing page for agents. Redirects to the queue dashboard,
 * which is the primary workspace for an agent.
 */
export default function AgentIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/agent/queue")
  }, [router])
  return null
}
