/**
 * @file pwa-install-prompt.tsx
 * @description Bottom-sheet style prompt encouraging users to install Frame as
 * a PWA. Adapts instructions per platform (Android/Desktop get a one-tap
 * install, iOS shows manual Share → Add to Home Screen steps).
 *
 * Mirrors the push-notification-prompt pattern: fixed overlay, dismiss with
 * cooldown, auto-hides when already installed.
 */

"use client"

import { Download, Share, Plus, X, Monitor, Smartphone } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "@/app/_i18n"
import type { PwaPlatform } from "@/app/_hooks/usePwaInstall"

// ── Component ────────────────────────────────────────────────

interface Props {
  platform: PwaPlatform
  installing: boolean
  onInstall: () => Promise<boolean>
  onDismiss: () => void
}

export default function PwaInstallPrompt({
  platform,
  installing,
  onInstall,
  onDismiss,
}: Props) {
  const { t } = useTranslation()

  const isIos = platform === "ios"

  const PlatformIcon = isIos
    ? Smartphone
    : platform === "desktop"
      ? Monitor
      : Download

  return (
    <div
      className="animate-in slide-in-from-bottom-4 fade-in bg-card fixed bottom-4 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border p-4 shadow-lg"
      role="alert"
    >
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded-full p-1 transition-colors"
        aria-label={t("common.close")}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <PlatformIcon className="text-primary h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm leading-tight font-medium">
            {t("pwa.install.title")}
          </p>
          <p className="text-muted-foreground text-xs">
            {isIos
              ? t("pwa.install.iosDescription")
              : t("pwa.install.description")}
          </p>

          {/* iOS manual steps */}
          {isIos && (
            <div className="text-muted-foreground space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  1
                </span>
                <Share className="h-3.5 w-3.5" />
                <span>{t("pwa.install.iosStep1")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  2
                </span>
                <Plus className="h-3.5 w-3.5" />
                <span>{t("pwa.install.iosStep2")}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {!isIos && (
              <Button size="sm" onClick={onInstall} disabled={installing}>
                {installing
                  ? t("pwa.install.installing")
                  : t("pwa.install.installButton")}
              </Button>
            )}
            <Button
              size="sm"
              variant={isIos ? "default" : "ghost"}
              onClick={onDismiss}
            >
              {isIos ? t("pwa.install.gotIt") : t("pwa.install.notNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
