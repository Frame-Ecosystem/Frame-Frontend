import { useCallback, useEffect, useRef, useState } from "react"

/** How many consecutive failures before the cooldown kicks in. */
const FAILURE_THRESHOLD = 5
/** Initial cooldown in seconds after hitting the threshold. */
const INITIAL_COOLDOWN_SECS = 30
/** Maximum cooldown in seconds (doubles each time the threshold is hit). */
const MAX_COOLDOWN_SECS = 120

/**
 * Client-side rate-limiter for auth forms.
 *
 * Tracks consecutive failed submissions and enforces an exponential cooldown
 * after `FAILURE_THRESHOLD` failures. The cooldown resets once a submission
 * succeeds.
 *
 * Integrates with backend 429 responses: when `recordFailure` is called with
 * a `retryAfter` value (seconds), that overrides the local cooldown timer.
 */
export function useAuthRateLimit() {
  const failCountRef = useRef(0)
  const cooldownSecsRef = useRef(INITIAL_COOLDOWN_SECS)
  const [_lockedUntil, setLockedUntil] = useState<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  /** True when the user must wait before submitting again. */
  const isLocked = remainingSeconds > 0

  const startCooldown = useCallback((seconds: number) => {
    const until = Date.now() + seconds * 1000
    setLockedUntil(until)
    setRemainingSeconds(seconds)

    // Clear any previous timer
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      const left = Math.ceil((until - Date.now()) / 1000)
      if (left <= 0) {
        setRemainingSeconds(0)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
      } else {
        setRemainingSeconds(left)
      }
    }, 1000)
  }, [])

  /**
   * Call after every failed submission.
   * @param retryAfter  Optional backend-provided delay in seconds (from 429 response).
   *                    When provided, this overrides the local exponential cooldown.
   */
  const recordFailure = useCallback(
    (retryAfter?: number) => {
      // Backend 429 retryAfter takes precedence over local logic
      if (retryAfter && retryAfter > 0) {
        startCooldown(retryAfter)
        failCountRef.current = 0
        return
      }

      failCountRef.current += 1
      if (failCountRef.current >= FAILURE_THRESHOLD) {
        startCooldown(cooldownSecsRef.current)
        // Escalate for next round
        cooldownSecsRef.current = Math.min(
          cooldownSecsRef.current * 2,
          MAX_COOLDOWN_SECS,
        )
        failCountRef.current = 0
      }
    },
    [startCooldown],
  )

  /** Call after a successful submission to reset everything. */
  const recordSuccess = useCallback(() => {
    failCountRef.current = 0
    cooldownSecsRef.current = INITIAL_COOLDOWN_SECS
    setRemainingSeconds(0)
    setLockedUntil(0)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Clean up interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return { isLocked, remainingSeconds, recordFailure, recordSuccess }
}
