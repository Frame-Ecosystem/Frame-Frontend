"use client"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { authService, getUserDisplayName, getUserInitials } from "../_services/auth.service"
import type { User } from "../_types"
import { useAuth } from "../_providers/auth"
import { useRouter } from "next/navigation"
import { UserPlusIcon, LogOutIcon, Settings } from "lucide-react"


interface UserProps {
  user: User | null
  onAddAccount?: () => void
  onClose?: () => void
}

const UserInfo = ({ user, onAddAccount, onClose }: UserProps) => {
  const { clearAuth } = useAuth()
  const router = useRouter()

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
          router.push('/profile')
        }}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left w-full border-1"
      >
        {user && (
          <>
            <div className="flex justify-center">
              <Avatar className="h-10 w-10 ring-1 ring-primary/30">
                {user?.profileImage && (
                  <AvatarImage src={typeof user.profileImage === 'string' ? user.profileImage : user.profileImage.url} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* User name and email */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{getUserDisplayName(user)}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </>
        )}
      </button>

      <div className="border-t border-border my-1" />

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mb-1">
        {/* Settings Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-1 border-border hover:bg-primary/10"
          onClick={() => {
            if (onClose) onClose()
            router.push('/settings')
          }}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>

        {/* Add Another Account Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-1 border-border hover:bg-primary/10"
          onClick={handleAddAccount}
        >
          <UserPlusIcon className="h-4 w-4" />
          Add Another Account
        </Button>

        {/* Sign Out Button - Transparent with red border */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-1 border-destructive hover:bg-destructive/10 "
          onClick={handleSignOut}
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default UserInfo
