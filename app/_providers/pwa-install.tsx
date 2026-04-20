/**
 * @file pwa-install.tsx
 * @description Provider that gates the PWA install prompt behind authentication.
 *
 * Follows the same pattern as PushNotificationProvider:
 *   - Shows nothing for unauthenticated users
 *   - Renders the install prompt only when the user is signed in and the
 *     app is running in a browser (not already installed as a PWA)
 */

"use client"

import React from "react"
import { useAuth } from "@/app/_auth"
import { usePwaInstall } from "@/app/_hooks/usePwaInstall"
import PwaInstallPrompt from "@/app/_components/common/pwa-install-prompt"

// ── Provider ─────────────────────────────────────────────────

export function PwaInstallProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, accessToken } = useAuth()
  const isAuthenticated = !isLoading && !!user && !!accessToken

  return (
    <>
      {children}
      {isAuthenticated && <PwaInstallGate />}
    </>
  )
}

// ── Gate (only mounts when authenticated) ────────────────────

function PwaInstallGate() {
  const { canPrompt, platform, install, dismiss, installing } = usePwaInstall()

  if (!canPrompt) return null

  return (
    <PwaInstallPrompt
      platform={platform}
      installing={installing}
      onInstall={install}
      onDismiss={dismiss}
    />
  )
}
