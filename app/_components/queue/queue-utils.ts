import { QueuePerson } from "../../_constants/mockQueues"

export interface QueueStats {
  inService: QueuePerson[]
  waiting: QueuePerson[]
  totalWaiting: number
  averageWait: number
  totalPeople: number
  completed: number
}

/**
 * Calculate queue statistics from a list of queue items
 */
export function calculateQueueStats(queueItems: QueuePerson[]): QueueStats {
  const inService = queueItems.filter((p) => p.status === "in-service")
  const waiting = queueItems.filter((p) => p.status === "waiting")
  const totalWaiting = waiting.length
  const averageWait =
    totalWaiting > 0
      ? Math.round(
          waiting.reduce((sum, p) => sum + p.estimatedWaitMinutes, 0) /
            totalWaiting,
        )
      : 0

  return {
    inService,
    waiting,
    totalWaiting,
    averageWait,
    totalPeople: queueItems.length,
    completed: queueItems.filter((p) => p.status === "completed").length,
  }
}
