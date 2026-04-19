"use client"

import { useTranslation } from "@/app/_i18n"
import { useRouter } from "next/navigation"

interface BookingQueueBannerProps {
  bookingStatus: string
  userType: string
  loungeId?: string
  agentId?: string
  bookingId?: string
}

export function BookingQueueBanner({
  bookingStatus,
  userType,
  loungeId,
  agentId,
  bookingId,
}: BookingQueueBannerProps) {
  const { t } = useTranslation()
  const router = useRouter()
  if (bookingStatus !== "inQueue" || !loungeId) return null

  let url: string
  if (userType === "lounge") {
    // Lounge accounts use their own staff queue page
    const params = new URLSearchParams()
    if (agentId) params.set("agent", agentId)
    if (bookingId) params.set("bookingId", bookingId)
    url = `/queue${params.toString() ? `?${params.toString()}` : ""}`
  } else {
    // Clients view the public lounge queue tab
    const params = new URLSearchParams({ tab: "queue" })
    if (agentId) params.set("agentId", agentId)
    if (bookingId) params.set("bookingId", bookingId)
    url = `/lounges/${loungeId}?${params.toString()}`
  }

  return (
    <button
      className="mb-2 flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      onClick={() => {
        router.push(url)
      }}
    >
      <span>{t("booking.goToQueue")}</span>
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  )
}
