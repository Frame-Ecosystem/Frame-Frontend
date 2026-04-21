"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { getUserDisplayName } from "@/app/_auth"
import QueueDisplay from "../_components/queue/queue-display"
import { useTranslation } from "@/app/_i18n"
import { Loader2 } from "lucide-react"

export default function QueuePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const loungeIdParam = searchParams.get("lounge")
  const highlightBookingId = searchParams.get("bookingId")
  const { user } = useAuth()
  const { t } = useTranslation()

  const isLounge = user?.type === "lounge"
  const isAgent = user?.type === "agent"

  // Agents have their own dedicated queue surface.
  useEffect(() => {
    if (isAgent) router.replace("/agent/queue")
  }, [isAgent, router])

  if (isAgent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  // Lounge accounts always see their agent queues regardless of opening hours
  return (
    <div className="mx-auto max-w-5xl px-3 py-4 lg:px-8 lg:py-8">
      <QueueDisplay
        centerName={
          isLounge
            ? user?.loungeTitle || getUserDisplayName(user)
            : t("queue.defaultCenter")
        }
        mode={isLounge ? "staff" : "client"}
        loungeId={isLounge ? user?._id : (loungeIdParam ?? undefined)}
        initialAgentId={agentId}
        highlightBookingId={highlightBookingId}
      />
    </div>
  )
}
