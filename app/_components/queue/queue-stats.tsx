"use client"

import React from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Users, Clock, TrendingUp, CheckCircle2 } from "lucide-react"

interface QueueStatsData {
  totalWaiting: number
  averageWait: number
  inService: any[]
  totalPeople: number
  completed: number
}

interface QueueStatsProps {
  activeQueue: { name?: string } | undefined
  centerName?: string
  stats: QueueStatsData
  isFullScreen: boolean
}

export default function QueueStats({
  activeQueue,
  centerName,
  stats,
  isFullScreen,
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
                {activeQueue?.name || "Queue"}
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
          className={`grid grid-cols-2 gap-4 ${isFullScreen ? "md:grid-cols-2" : "md:grid-cols-4"}`}
        >
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <Clock className="text-primary h-4 w-4" />
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
            <p className="text-2xl font-bold">{stats.inService.length}</p>
          </div>
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Total People
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.totalPeople}</p>
          </div>
          <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-muted-foreground text-xs font-medium">
                Completed
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
