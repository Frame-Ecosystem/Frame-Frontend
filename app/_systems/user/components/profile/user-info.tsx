"use client"
import { Button } from "@/app/_components/ui/button"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { authService, getUserDisplayName, getUserInitials } from "@/app/_auth"
import type { User } from "@/app/_types"
import { useAuth } from "@/app/_auth"
import { useRouter } from "next/navigation"
import { UserPlusIcon, LogOutIcon, Settings } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface UserProps {
  user: User | null
  onAddAccount?: () => void
  onClose?: () => void
}

const UserInfo = ({ user, onAddAccount, onClose }: UserProps) => {
  const { clearAuth } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  // === EVENT HANDLERS ===

  const handleSignOut = async () => {
    if (onClose) onClose()
    await authService.signOut()
    clearAuth()
    router.push("/")
  }

  const handleAddAccount = () => {
    if (onClose) onClose()
    if (onAddAccount) {
      onAddAccount()
    }
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      {/* User Profile Section - Clickable card that redirects to profile */}
      <button
        onClick={() => {
          if (onClose) onClose()
          router.push("/profile")
        }}
        className="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 rounded-lg border-1 p-3 text-left transition-colors"
      >
        {user && (
          <>
            <div className="flex justify-center">
              <Avatar className="ring-primary/30 h-10 w-10 ring-1">
                {user?.profileImage && (
                  <AvatarImage
                    src={
                      typeof user.profileImage === "string"
                        ? user.profileImage
                        : user.profileImage.url
                    }
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* User name and email */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {getUserDisplayName(user)}
              </div>
              <div className="text-muted-foreground truncate text-xs md:overflow-visible md:whitespace-normal">
                {user?.email}
              </div>
            </div>
          </>
        )}
      </button>

      <div className="border-border my-1 border-t" />

      {/* Action Buttons */}
      <div className="mb-1 flex flex-col gap-2">
        {/* Settings Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-border hover:bg-primary/10 w-full justify-start gap-2 border-1"
          onClick={() => {
            if (onClose) onClose()
            router.push("/settings")
          }}
        >
          <Settings className="h-4 w-4" />
          {t("userInfo.settings")}
        </Button>

        {/* Add Another Account Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-border hover:bg-primary/10 w-full justify-start gap-2 border-1"
          onClick={handleAddAccount}
        >
          <UserPlusIcon className="h-4 w-4" />
          {t("userInfo.addAccount")}
        </Button>

        {/* Sign Out Button - Transparent with red border */}
        <Button
          variant="outline"
          size="sm"
          className="border-destructive hover:bg-destructive/10 w-full justify-start gap-2 border-1"
          onClick={handleSignOut}
        >
          <LogOutIcon className="h-4 w-4" />
          {t("userInfo.logout")}
        </Button>
      </div>
    </div>
  )
}

export default UserInfo
