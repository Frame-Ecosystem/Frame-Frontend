"use client"

import React, { useEffect, useState } from "react"
import { Hourglass } from "lucide-react"

interface CountdownTimerProps {
  /** Total service duration in minutes */
  totalDuration: number
  /** ISO timestamp when service started (inServiceAt) */
  startedAt?: string
}

export default function CountdownTimer({
  totalDuration,
  startedAt,
}: CountdownTimerProps) {
  const totalSeconds = totalDuration * 60
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    const start = startedAt ? new Date(startedAt).getTime() : Date.now()

    const tick = () => {
      const e = Math.floor((Date.now() - start) / 1000)
      const r = Math.max(totalSeconds - e, 0)
      setRemaining(r)
      if (r <= 0) clearInterval(interval)
    }

    const interval = setInterval(tick, 1000)
    tick()

    return () => clearInterval(interval)
  }, [startedAt, totalSeconds])

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const isUrgent = progress <= 0.15
  const isWarning = progress <= 0.35

  const colorClass = isUrgent
    ? "text-red-500"
    : isWarning
      ? "text-orange-500"
      : "text-blue-500"

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Hourglass
        className={`h-7 w-7 ${colorClass} ${
          remaining > 0 ? "animate-[spin_2.5s_ease-in-out_infinite]" : ""
        } ${isUrgent && remaining > 0 ? "animate-[spin_1s_ease-in-out_infinite]" : ""}`}
      />
      <span
        className={`font-mono text-xs font-bold ${colorClass} ${
          isUrgent && remaining > 0 ? "animate-pulse" : ""
        }`}
      >
        {remaining <= 0 ? "0:00" : timeStr}
      </span>
    </div>
  )
}
