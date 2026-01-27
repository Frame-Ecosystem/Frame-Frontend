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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="font-semibold mb-2">Finishing up…</h2>
          <p className="text-muted-foreground text-sm">You can close this window.</p>
        </div>
      </div>
    </div>
  )
}
