"use client"

import { useEffect } from "react"

export default function GoogleDonePage() {
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.close()
      } catch {}
    }, 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-lg border p-6">
          <div className="bg-primary/10 mx-auto mb-4 h-8 w-8 animate-pulse rounded-full"></div>
          <h2 className="mb-2 font-semibold">Finishing up…</h2>
          <p className="text-muted-foreground text-sm">
            You can close this window.
          </p>
        </div>
      </div>
    </div>
  )
}
