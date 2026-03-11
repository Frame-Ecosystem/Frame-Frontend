import type { QueuePerson, QueuePersonStatus } from "../../_types"

export interface QueueStats {
  totalWaiting: number
  totalInService: number
  totalCompleted: number
  totalAbsent: number
  totalPeople: number
  averageWait: number
}

/**
 * Calculate queue statistics from real API queue persons
 */
export function calculateQueueStats(persons: QueuePerson[]): QueueStats {
  const waiting = persons.filter((p) => p.status === "waiting")
  const inService = persons.filter((p) => p.status === "inService")
  const completed = persons.filter((p) => p.status === "completed")
  const absent = persons.filter((p) => p.status === "absent")

  const averageWait =
    waiting.length > 0
      ? Math.round(
          waiting.reduce(
            (sum, p) => sum + (p.bookingId?.totalDuration ?? 0),
            0,
          ) / waiting.length,
        )
      : 0

  return {
    totalWaiting: waiting.length,
    totalInService: inService.length,
    totalCompleted: completed.length,
    totalAbsent: absent.length,
    totalPeople: persons.length,
    averageWait,
  }
}

/**
 * Estimated wait time for a person = sum of totalDuration from all
 * preceding persons with status === 'waiting'
 */
export function estimatedWaitTime(
  person: QueuePerson,
  allPersons: QueuePerson[],
): number {
  const preceding = allPersons.filter(
    (p) => p.position < person.position && p.status === "waiting",
  )
  return preceding.reduce(
    (sum, p) => sum + (p.bookingId?.totalDuration ?? 0),
    0,
  )
}

/**
 * Valid next statuses for a given current status
 */
export function getValidTransitions(
  status: QueuePersonStatus | string,
): string[] {
  const map: Record<string, string[]> = {
    waiting: ["inService", "absent"],
    inService: ["completed"],
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
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown Client"
}

/**
 * Summary of booked services
 */
export function getServicesSummary(person: QueuePerson): string {
  const services = person.bookingId?.loungeServiceIds
  if (!services || services.length === 0) return "No services"
  const names = services.map((s: any) => s.serviceId?.name).filter(Boolean)
  if (names.length === 0) return `${services.length} service(s)`
  if (names.length <= 2) return names.join(", ")
  return `${names[0]}, ${names[1]} +${names.length - 2} more`
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
export function getStatusLabel(status: string): string {
  switch (status) {
    case "waiting":
      return "Waiting"
    case "inService":
      return "In Service"
    case "completed":
      return "Completed"
    case "absent":
      return "Absent"
    default:
      return status
  }
}
