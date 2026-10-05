"use client"

import Image from "next/image"
import { useTranslation } from "@/app/_i18n"
import "./brand-logo.css"

export function SessionRestoreLoader() {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-5"
    >
      <div
        className="session-logo-loader relative flex h-20 w-20 items-center justify-center"
        aria-hidden="true"
      >
        <Image
          src="/images/logos/fb-dark-icon.png"
          alt="Frame Beauty"
          width={64}
          height={64}
          priority
          unoptimized
          className="fb-brand-icon fb-brand-icon-dark session-logo-loader-mark relative z-10 h-16 w-16 object-contain"
          draggable={false}
        />
        <Image
          src="/images/logos/fb-light-icon.png"
          alt="Frame Beauty"
          width={64}
          height={64}
          priority
          unoptimized
          className="fb-brand-icon fb-brand-icon-light session-logo-loader-mark relative z-10 h-16 w-16 object-contain"
          draggable={false}
        />
      </div>
      <span className="text-muted-foreground text-sm">
        {t("auth.signin.checkingSession")}
      </span>
    </div>
  )
}
