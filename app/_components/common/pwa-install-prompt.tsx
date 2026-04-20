/**
 * @file pwa-install-prompt.tsx
 * @description Centered modal prompt encouraging users to install Frame as
 * a PWA. Adapts instructions per platform (Android/Desktop get a one-tap
 * install, iOS shows manual Share → Add to Home Screen steps).
 *
 * On confirm the native install dialog fires immediately, which creates
 * the home-screen shortcut automatically on Android / Desktop Chrome & Edge.
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
    <div className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div
        className="animate-in zoom-in-95 fade-in bg-card relative w-full max-w-sm rounded-xl border p-5 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded-full p-1 transition-colors"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <PlatformIcon className="text-primary h-6 w-6" />
          </div>

          <p id="pwa-install-title" className="text-base font-semibold">
            {t("pwa.install.title")}
          </p>
          <p className="text-muted-foreground text-sm">
            {isIos
              ? t("pwa.install.iosDescription")
              : t("pwa.install.description")}
          </p>

          {/* iOS manual steps */}
          {isIos && (
            <div className="text-muted-foreground w-full space-y-2 text-left text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  1
                </span>
                <Share className="h-3.5 w-3.5 shrink-0" />
                <span>{t("pwa.install.iosStep1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                  2
                </span>
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>{t("pwa.install.iosStep2")}</span>
              </div>
            </div>
          )}

          <div className="flex w-full items-center justify-center gap-3 pt-2">
            {!isIos && (
              <Button
                size="sm"
                className="min-w-[120px]"
                onClick={onInstall}
                disabled={installing}
              >
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
