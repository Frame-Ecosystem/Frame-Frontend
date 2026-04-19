"use client"

import React from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  UserX,
  Armchair,
} from "lucide-react"
import type { QueueStats as QueueStatsData } from "./queue-utils"
import { useTranslation } from "@/app/_i18n"

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
  const { t } = useTranslation()
  return (
    <Card
      className={`border-primary/20 from-primary/5 to-primary/10 rounded-lg bg-gradient-to-br ${isFullScreen ? "shadow-2xl" : ""}`}
    >
      <CardContent className={`p-3 ${isFullScreen ? "p-4" : ""}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 rounded-full p-2">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {agentName ? `${agentName}'s Queue` : "Queue"}
              </h3>
              <p className="text-muted-foreground text-xs">
                {centerName || t("queue.currentStatus")}
              </p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground px-2 py-1 text-xs">
            {t("queue.waitingCount", { count: stats.totalWaiting })}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-2 gap-2 ${isFullScreen ? "md:grid-cols-2" : mode === "staff" ? "md:grid-cols-5" : "md:grid-cols-3"}`}
        >
          <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Armchair className="h-5 w-5 text-amber-500" />
              <p className="text-muted-foreground text-[11px] font-medium">
                {t("queue.waiting")}
              </p>
            </div>
            <div className="mt-1 flex w-full justify-end">
              <p className="text-base font-bold">{stats.totalWaiting}</p>
            </div>
          </div>
          <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-muted-foreground text-[11px] font-medium">
                {t("queue.avgWait")}
              </p>
            </div>
            <div className="mt-1 flex w-full justify-end">
              <p className="text-base font-bold">{stats.averageWait} min</p>
            </div>
          </div>
          <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <p className="text-muted-foreground text-[11px] font-medium">
                {t("queue.inService")}
              </p>
            </div>
            <div className="mt-1 flex w-full justify-end">
              <p className="text-base font-bold">{stats.totalInService}</p>
            </div>
          </div>
          {mode === "staff" && (
            <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5 text-indigo-500" />
                <p className="text-muted-foreground text-[11px] font-medium">
                  {t("queue.totalPeople")}
                </p>
              </div>
              <div className="mt-1 flex w-full justify-end">
                <p className="text-base font-bold">{stats.totalPeople}</p>
              </div>
            </div>
          )}
          {mode === "staff" && (
            <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-muted-foreground text-[11px] font-medium">
                  {t("queue.completed")}
                </p>
              </div>
              <div className="mt-1 flex w-full justify-end">
                <p className="text-base font-bold">{stats.totalCompleted}</p>
              </div>
            </div>
          )}
          <div className="bg-card/50 rounded-md border p-2 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <UserX className="h-5 w-5 text-red-500" />
              <p className="text-muted-foreground text-[11px] font-medium">
                {t("queue.absent")}
              </p>
            </div>
            <div className="mt-1 flex w-full justify-end">
              <p className="text-base font-bold">{stats.totalAbsent}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
