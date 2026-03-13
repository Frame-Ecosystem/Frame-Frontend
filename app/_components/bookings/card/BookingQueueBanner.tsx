"use client"

interface BookingQueueBannerProps {
  bookingStatus: string
  userType: string
  loungeId?: string
  agentId?: string
}

export function BookingQueueBanner({
  bookingStatus,
  userType,
  loungeId,
  agentId,
}: BookingQueueBannerProps) {
  if (userType !== "client" || bookingStatus !== "inQueue" || !loungeId)
    return null

  const url = agentId
    ? `/centers/${loungeId}?tab=queue&agentId=${agentId}`
    : `/centers/${loungeId}?tab=queue`

  return (
    <button
      className="mb-2 flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      onClick={() => {
        window.location.href = url
      }}
    >
      <span>Go to Queue</span>
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
