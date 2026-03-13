"use client"

import { useSearchParams } from "next/navigation"
import { useAuth } from "../_providers/auth"
import { getUserDisplayName } from "../_services/auth.service"
import QueueDisplay from "../_components/queue/queue-display"

export default function QueuePage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const loungeIdParam = searchParams.get("lounge")
  const { user } = useAuth()

  const isLounge = user?.type === "lounge"

  // Lounge accounts always see their agent queues regardless of opening hours
  return (
    <div className="mx-auto max-w-5xl px-3 py-4 lg:px-8 lg:py-8">
      <QueueDisplay
        centerName={
          isLounge
            ? user?.loungeTitle || getUserDisplayName(user)
            : "Salon Center"
        }
        mode={isLounge ? "staff" : "client"}
        loungeId={isLounge ? user?._id : (loungeIdParam ?? undefined)}
        initialAgentId={agentId}
      />
    </div>
  )
}
