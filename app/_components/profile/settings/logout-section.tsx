"use client"

import { LogOutIcon } from "lucide-react"
import { Button } from "../../ui/button"

interface LogoutSectionProps {
  onLogout: () => void
  onLogoutAll: () => void
}

export function LogoutSection({ onLogout, onLogoutAll }: LogoutSectionProps) {
  return (
    <div className="border-border border-t pt-4">
      <div className="space-y-3">
        <Button
          onClick={onLogout}
          variant="outline"
          className="border-destructive hover:bg-destructive/10 flex w-full items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </Button>
        <Button
          onClick={onLogoutAll}
          variant="outline"
          className="border-destructive hover:bg-destructive/10 flex w-full items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout from All Devices
        </Button>
      </div>
    </div>
  )
}
