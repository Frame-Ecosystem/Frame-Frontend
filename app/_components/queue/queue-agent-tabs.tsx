"use client"

import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Info, Armchair, Plus } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { useRouter } from "next/navigation"
import { calculateQueueStats } from "./queue-utils"
import type { Queue } from "../../_types"

interface QueueAgentTabsProps {
  queues: Queue[]
  activeQueueIndex: number
  // eslint-disable-next-line no-unused-vars
  onSelectQueue: (index: number) => void
  isLoading: boolean
  showAddAgent?: boolean
}

export default function QueueAgentTabs({
  queues,
  activeQueueIndex,
  onSelectQueue,
  isLoading,
  showAddAgent = false,
}: QueueAgentTabsProps) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {isLoading ? (
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border-border/50 flex items-center gap-2 rounded-xl border px-3 py-2"
                >
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : queues.length === 0 ? (
            <div className="flex flex-col gap-2 px-3 py-4">
              <div className="flex items-center gap-2">
                <Info className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  No agents have been added yet
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Soon clients will be able to book directly from the queue. Stay
                tuned!
              </p>
            </div>
          ) : (
            <>
              {queues.map((queue, index) => (
                <button
                  key={queue._id}
                  onClick={() => onSelectQueue(index)}
                  className={`group relative shrink-0 overflow-hidden rounded-xl border px-1 py-2 text-sm font-medium transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg ${
                    activeQueueIndex === index
                      ? "border-primary/50 from-primary to-primary/80 text-primary-foreground shadow-primary/25 ring-primary/20 bg-gradient-to-br shadow-lg ring-2"
                      : "border-border/50 from-background to-muted/30 text-muted-foreground hover:border-primary/30 hover:from-muted/50 hover:to-muted/70 hover:text-foreground bg-gradient-to-br hover:shadow-md"
                  }`}
                >
                  {activeQueueIndex === index && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}
                  <div className="relative flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={queue.agentId?.profileImage?.url || undefined}
                        alt={queue.agentId?.agentName || "Agent"}
                        className="h-5 w-5 object-cover"
                      />
                      <AvatarFallback className="bg-muted text-xs">
                        {queue.agentId?.agentName?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold">
                      {queue.agentId?.agentName ?? "Agent"}
                    </span>
                    <Badge
                      variant={
                        activeQueueIndex === index ? "secondary" : "outline"
                      }
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        activeQueueIndex === index
                          ? "text-primary-foreground bg-white/20 hover:bg-white/30"
                          : "group-hover:border-primary/50"
                      }`}
                    >
                      <Armchair className="mr-0.5 h-3.5 w-3.5 text-amber-500" />
                      {(() => {
                        const stats = calculateQueueStats(
                          queue.persons ?? [],
                        )
                        return stats.totalWaiting + stats.totalInService
                      })()}
                    </Badge>
                  </div>
                  <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}

              {/* Add Agent Button */}
              {showAddAgent && (
                <button
                  onClick={() => router.push("/lounge/agents")}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Agent
                </button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
