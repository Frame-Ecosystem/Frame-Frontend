import type { QueuePerson, QueuePersonStatus } from "@/app/_types"

export interface QueueStats {
  totalWaiting: number
  totalInService: number
  totalCompleted: number
  totalAbsent: number
  totalPeople: number
  totalEstimatedWait: number
}

/**
 * Calculate queue statistics from real API queue persons
 */
export function calculateQueueStats(
  persons: QueuePerson[],
  now = Date.now(),
): QueueStats {
  const waiting = persons.filter((p) => p.status === "waiting")
  const inService = persons.filter((p) => p.status === "inService")
  const completed = persons.filter((p) => p.status === "completed")
  const absent = persons.filter((p) => p.status === "absent")
  const totalEstimatedWait = persons
    .filter(
      (person) => person.status === "waiting" || person.status === "inService",
    )
    .reduce((total, person) => total + remainingServiceDuration(person, now), 0)

  return {
    totalWaiting: waiting.length,
    totalInService: inService.length,
    totalCompleted: completed.length,
    totalAbsent: absent.length,
    totalPeople: persons.length,
    totalEstimatedWait,
  }
}

/**
 * Estimate remaining wait from the durations of people ahead in the queue.
 */
export function estimatedWaitTime(
  person: QueuePerson,
  allPersons: QueuePerson[],
  now = Date.now(),
): number {
  const preceding = allPersons.filter(
    (p) =>
      p.position < person.position &&
      (p.status === "waiting" || p.status === "inService"),
  )
  return preceding.reduce(
    (sum, queuePerson) => sum + remainingServiceDuration(queuePerson, now),
    0,
  )
}

function remainingServiceDuration(person: QueuePerson, now: number): number {
  const duration = Math.max(person.bookingId?.totalDuration ?? 0, 0)
  if (person.status !== "inService" || !person.inServiceAt) return duration

  const startedAt = new Date(person.inServiceAt).getTime()
  if (!Number.isFinite(startedAt)) return duration

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 60000))
  return Math.max(duration - elapsed, 0)
}

/**
 * Valid next statuses for a given current status
 */
export function getValidTransitions(
  status: QueuePersonStatus | string,
): string[] {
  const map: Record<string, string[]> = {
    waiting: ["inService", "absent"],
    inService: ["completed", "waiting"],
    absent: ["waiting"],
    completed: [],
  }
  return map[status] ?? []
}

/**
 * Client initials from first + last name
 */
export function getClientInitials(
  firstName?: string,
  lastName?: string,
): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ""
  const l = lastName?.charAt(0)?.toUpperCase() ?? ""
  return f + l || "?"
}

/**
 * Full client name
 */
export function getClientFullName(
  firstName?: string,
  lastName?: string,
): string {
  return [firstName, lastName].filter(Boolean).join(" ")
}

/**
 * Services booked for a queue ticket, including their individual durations.
 */
export function getQueueServices(
  person: QueuePerson,
  defaultServiceName: string,
): Array<{ name: string; duration?: number; imageUrl?: string }> {
  return (person.bookingId?.loungeServiceIds ?? []).map((service) => {
    const image = service.image
    const imageUrl =
      typeof image === "string" ? image : (image?.url ?? undefined)

    return {
      name:
        service.serviceId?.name || service.description || defaultServiceName,
      duration: service.duration,
      imageUrl,
    }
  })
}

/**
 * Status color classes
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "waiting":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case "inService":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "absent":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    default:
      return "bg-muted"
  }
}

/**
 * Status display label
 */
export function getStatusLabel(
  status: string,
  t: (key: string) => string,
): string {
  switch (status) {
    case "waiting":
      return t("queue.waiting")
    case "inService":
      return t("queue.inService")
    case "completed":
      return t("queue.completed")
    case "absent":
      return t("queue.absent")
    default:
      return status
  }
}
