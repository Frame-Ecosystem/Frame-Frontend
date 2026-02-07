"use client"

import { useState } from "react"
import { UserIcon } from "lucide-react"
import SignInDialog from "../auth/sign-in-dialog"
import { Button } from "../ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog"
import UserInfo from "./user-info"
import SignupFlow from "../auth/signup-flow"
import { useAuth } from "../../_providers/auth"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import {
  getUserDisplayName,
  getUserInitials,
} from "../../_services/auth.service"

const UserSession = ({ compact }: { compact?: boolean } = {}) => {
  // ===== STATE =====
  const { user, isLoading } = useAuth()
  // Track dialog open state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const isLoggedIn = !!user

  // ===== EARLY RETURNS =====
  // Return null during loading to prevent hydration mismatch
  if (isLoading) {
    return null
  }

  // ===== EVENT HANDLERS =====
  const handleAddAccount = () => {
    setPopoverOpen(false) // Close the popover
    setDialogOpen(true) // Open the sign-in dialog
  }

  // ===== SHARED UI ELEMENTS =====
  const userButton = (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/10 flex items-center gap-2 rounded-full"
    >
      {isLoggedIn ? (
        <Avatar
          className={`${compact ? "h-8 w-8" : "h-12 w-12"} ring-primary/20 ring-1`}
        >
          {user?.profileImage && (
            <AvatarImage
              src={
                typeof user.profileImage === "string"
                  ? user.profileImage
                  : user.profileImage.url
              }
              alt={getUserDisplayName(user)}
            />
          )}
          <AvatarFallback
            className={`bg-primary/10 text-primary font-medium ${compact ? "text-xs" : "text-sm"}`}
          >
            {getUserInitials(user)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={`border-border flex items-center justify-center rounded-full border p-4 ${compact ? "h-10 w-10 p-1" : "h-12 w-12 p-1"}`}
        >
          <UserIcon
            className={`${compact ? "h-4 w-4" : "h-8 w-8"} text-muted-foreground`}
          />
        </div>
      )}
    </Button>
  )

  // ===== RENDER: LOGGED IN STATE =====
  // Show popover with user info when clicked
  if (isLoggedIn) {
    return (
      <>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>{userButton}</PopoverTrigger>
          <PopoverContent className="mt-2 w-72 p-0" align="end">
            <UserInfo
              user={user}
              onAddAccount={handleAddAccount}
              onClose={() => setPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>

        {/* Sign-in dialog for adding another account */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[90%]">
            <SignInDialog
              onSuccess={() => {
                setDialogOpen(false)
              }}
              onClose={() => setDialogOpen(false)}
              onOpenSignUpFlow={() => {
                setDialogOpen(false)
                setSignupOpen(true)
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
          <DialogContent className="w-[90%]">
            <SignupFlow
              onSuccess={() => {
                setSignupOpen(false)
              }}
              onOpenSignInFlow={() => {
                setSignupOpen(false)
                setDialogOpen(true)
              }}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // ===== RENDER: LOGGED OUT STATE =====
  // Show sign-in dialog when clicked
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{userButton}</DialogTrigger>
        <DialogContent className="w-[90%]">
          <SignInDialog
            onSuccess={() => {
              setDialogOpen(false)
            }}
            onClose={() => setDialogOpen(false)}
            onOpenSignUpFlow={() => {
              setDialogOpen(false)
              setSignupOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent className="w-[90%]">
          <SignupFlow
            onSuccess={() => {
              setSignupOpen(false)
            }}
            onOpenSignInFlow={() => {
              setSignupOpen(false)
              setDialogOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserSession
