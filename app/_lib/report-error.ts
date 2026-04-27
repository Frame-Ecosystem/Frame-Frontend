type ErrorContext = Record<string, unknown>

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

export function reportError(error: unknown, context: ErrorContext = {}) {
  const payload = {
    error: serializeError(error),
    context,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[reportError]", payload)
    return
  }

  const endpoint = process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT?.trim()
  if (!endpoint || typeof window === "undefined") return

  try {
    const body = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: "application/json" }),
      )
      return
    }

    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
  } catch {
    // Never let reporting failures affect the user-facing error screen.
  }
}
