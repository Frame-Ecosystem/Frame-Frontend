"use client"

import { LogOutIcon } from "lucide-react"
import { Button } from "@/app/_components/ui/button"
import { useTranslation } from "@/app/_i18n"

interface LogoutSectionProps {
  onLogout: () => void
  onLogoutAll: () => void
}

export function LogoutSection({ onLogout, onLogoutAll }: LogoutSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="border-border border-t pt-4">
      <div className="space-y-3">
        <Button
          onClick={onLogout}
          variant="outline"
          className="border-destructive hover:bg-destructive/10 flex w-full items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          {t("settings.logout")}
        </Button>
        <Button
          onClick={onLogoutAll}
          variant="outline"
          className="border-destructive hover:bg-destructive/10 flex w-full items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          {t("settings.logoutAll")}
        </Button>
      </div>
    </div>
  )
}
