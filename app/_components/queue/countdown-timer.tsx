"use client"

import React, { useEffect, useState } from "react"

interface CountdownTimerProps {
  /** Total service duration in minutes */
  totalDuration: number
  /** ISO timestamp when service started (inServiceAt) */
  startedAt?: string
  /** Size of the circular timer in pixels */
  size?: number
}

export default function CountdownTimer({
  totalDuration,
  startedAt,
  size = 56,
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

    // First tick immediately
    const interval = setInterval(tick, 1000)
    tick()

    return () => clearInterval(interval)
  }, [startedAt, totalSeconds])

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

  // Color based on remaining percentage
  const isUrgent = progress <= 0.15
  const isWarning = progress <= 0.35

  const strokeColor = isUrgent
    ? "#ef4444" // red
    : isWarning
      ? "#f97316" // orange
      : "#3b82f6" // blue

  const bgGlow = isUrgent
    ? "shadow-red-500/30"
    : isWarning
      ? "shadow-orange-400/20"
      : "shadow-blue-400/20"

  // SVG circle setup
  const strokeWidth = 3.5
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center shadow-lg ${bgGlow} rounded-full`}
      style={{ width: size, height: size }}
    >
      {/* Background pulse when urgent */}
      {isUrgent && remaining > 0 && (
        <div
          className="absolute inset-0 animate-ping rounded-full bg-red-400/20"
          style={{ animationDuration: "1.5s" }}
        />
      )}

      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/15"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
            filter: `drop-shadow(0 0 4px ${strokeColor}40)`,
          }}
        />
      </svg>

      {/* Time text */}
      <span
        className={`z-10 font-mono text-xs font-bold ${
          remaining <= 0
            ? "text-red-500"
            : isUrgent
              ? "animate-pulse text-red-500"
              : isWarning
                ? "text-orange-500"
                : "text-blue-500"
        }`}
      >
        {remaining <= 0 ? "0:00" : timeStr}
      </span>
    </div>
  )
}
