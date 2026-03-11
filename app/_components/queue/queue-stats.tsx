"use client"

import React from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Users, Clock, TrendingUp, CheckCircle2, UserX } from "lucide-react"
import type { QueueStats as QueueStatsData } from "./queue-utils"

interface QueueStatsProps {
  agentName?: string
  centerName?: string
  stats: QueueStatsData
  isFullScreen: boolean
  mode?: "client" | "staff"
}

export default function QueueStats({
  agentName,
  centerName,
  stats,
  isFullScreen,
  mode = "client",
}: QueueStatsProps) {
  return (
    <Card
      className={`border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br ${isFullScreen ? "shadow-2xl" : ""}`}
    >
      <CardContent className={`p-6 ${isFullScreen ? "p-8" : ""}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-3">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {agentName ? `${agentName}'s Queue` : "Queue"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {centerName || "Current status"}
              </p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base">
            {stats.totalWaiting} waiting
          </Badge>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-2 gap-4 ${isFullScreen ? "md:grid-cols-2" : mode === "staff" ? "md:grid-cols-5" : "md:grid-cols-3"}`}
        >
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Waiting
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.totalWaiting}</p>
          </div>
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Avg Wait
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.averageWait} min</p>
          </div>
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-muted-foreground text-xs font-medium">
                In Service
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.totalInService}</p>
          </div>
          {mode === "staff" && (
            <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <p className="text-muted-foreground text-xs font-medium">
                  Total People
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.totalPeople}</p>
            </div>
          )}
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Completed
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.totalCompleted}</p>
          </div>
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Absent
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.totalAbsent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
