"use client"

import { useSearchParams } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { getUserDisplayName } from "@/app/_auth"
import QueueDisplay from "../_components/queue/queue-display"
import { useTranslation } from "@/app/_i18n"

export default function QueuePage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get("agent")
  const loungeIdParam = searchParams.get("lounge")
  const highlightBookingId = searchParams.get("bookingId")
  const { user } = useAuth()
  const { t } = useTranslation()

  const isLounge = user?.type === "lounge"

  // Lounge accounts always see their agent queues regardless of opening hours
  return (
    <div className="mx-auto max-w-5xl px-3 py-4 pb-24 lg:px-8 lg:py-8 lg:pb-0">
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
