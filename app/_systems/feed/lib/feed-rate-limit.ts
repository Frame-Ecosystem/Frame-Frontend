"use client"

import { useEffect, useState } from "react"

type FeedRateLimitSource = "none" | "rate-limit" | "throttle"

interface FeedRateLimitState {
  lockedUntil: number
  source: FeedRateLimitSource
}

export interface FeedRateLimitSnapshot {
  isLocked: boolean
  remainingSeconds: number
  showBanner: boolean
}

const DEFAULT_STATE: FeedRateLimitState = {
  lockedUntil: 0,
  source: "none",
}

let state: FeedRateLimitState = DEFAULT_STATE
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value)
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return null
}

function getRemainingSeconds(): number {
  const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000)
  if (remaining <= 0) {
    if (state.lockedUntil !== 0 || state.source !== "none") {
      state = DEFAULT_STATE
    }
    return 0
  }
  return remaining
}

export function subscribeFeedRateLimit(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getFeedRateLimitSnapshot(): FeedRateLimitSnapshot {
  const remainingSeconds = getRemainingSeconds()
  return {
    isLocked: remainingSeconds > 0,
    remainingSeconds,
    showBanner: remainingSeconds > 0 && state.source === "rate-limit",
  }
}

export function setFeedRateLimitCooldown(
  seconds: number,
  source: FeedRateLimitSource,
): void {
  const parsedSeconds = parsePositiveInt(seconds)
  if (!parsedSeconds) return

  const nextLockedUntil = Date.now() + parsedSeconds * 1000
  const shouldReplace =
    nextLockedUntil > state.lockedUntil || source === "rate-limit"

  if (!shouldReplace) return

  state = {
    lockedUntil: nextLockedUntil,
    source,
  }
  emitChange()
}

export function applyFeedRateLimitRemainingHint(remaining: unknown): void {
  const parsedRemaining = parsePositiveInt(remaining)
  if (parsedRemaining === null) return

  // Slow repeated refresh/load-more requests when the backend indicates the
  // window is nearly exhausted, without surfacing a blocking banner.
  if (parsedRemaining <= 1) {
    setFeedRateLimitCooldown(2, "throttle")
  }
}

export function isFeedRateLimitError(error: unknown): boolean {
  return (error as any)?.code === "RATE_LIMIT_EXCEEDED"
}

export function getFeedRetryAfterSeconds(error: unknown): number {
  return parsePositiveInt((error as any)?.retryAfter) ?? 0
}

export function getFeedRateLimitMessage(retryAfter: number): string {
  return `Too many requests — please wait ${retryAfter}s before refreshing the feed.`
}

export function useFeedRateLimitState(): FeedRateLimitSnapshot {
  const [snapshot, setSnapshot] = useState<FeedRateLimitSnapshot>(() =>
    getFeedRateLimitSnapshot(),
  )

  useEffect(
    () => subscribeFeedRateLimit(() => setSnapshot(getFeedRateLimitSnapshot())),
    [],
  )

  useEffect(() => {
    if (!snapshot.isLocked) return

    const timer = window.setInterval(() => {
      setSnapshot(getFeedRateLimitSnapshot())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [snapshot.isLocked])

  return snapshot
}
