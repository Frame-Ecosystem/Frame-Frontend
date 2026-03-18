"use client"

import { useState } from "react"
import { UserIcon, X } from "lucide-react"
import SignInDialog from "../auth/sign-in-dialog"
import { Button } from "../ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Dialog, DialogContent } from "../ui/dialog"
import UserInfo from "./user-info"
import SignupFlow from "../auth/signup-flow"
import { useAuth } from "../../_providers/auth"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import {
  getUserDisplayName,
  getUserInitials,
} from "../../_services/auth.service"

/** Prevent Radix events from closing dialogs. */
const prevent = (e: Event) => e.preventDefault()

/** Noop — Radix cannot change dialog state, only our callbacks can. */
const noop = () => {}

const UserSession = ({ compact }: { compact?: boolean } = {}) => {
  // ===== STATE =====
  const { user, isLoading } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const isLoggedIn = !!user

  // ===== CLOSE HELPERS (the ONLY way dialogs can close) =====
  const closeSignIn = () => setDialogOpen(false)
  const closeSignUp = () => setSignupOpen(false)

  // ===== EVENT HANDLERS =====
  const handleAddAccount = () => {
    setPopoverOpen(false)
    setDialogOpen(true)
  }

  // ===== SHARED UI ELEMENTS =====
  const userButton = (
    <Button
      variant="ghost"
      className="hover:bg-primary/10 relative flex h-auto w-auto items-center gap-2 rounded-full p-0.5"
    >
      {isLoggedIn ? (
        <div className="relative">
          <Avatar
            className={`${compact ? "h-8 w-8" : "h-12 w-12"} ring-primary/50 ring-2`}
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
          {/* Online indicator */}
          <div
            className={`absolute -right-0.5 -bottom-0.5 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"} ring-background rounded-full bg-green-500 ring-1`}
          />
        </div>
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

  // ===== RENDER =====
  // CRITICAL: NO early returns — dialogs must ALWAYS stay in the React tree.
  // The trigger area is hidden during loading, but dialogs are never unmounted.
  return (
    <>
      {/* ── Trigger area — hidden while auth is loading ── */}
      {!isLoading &&
        (isLoggedIn ? (
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
        ) : (
          <span onClick={() => setDialogOpen(true)}>{userButton}</span>
        ))}

      {/* ── Sign-in dialog (always mounted, fully controlled) ── */}
      {/* onOpenChange={noop} → Radix can NEVER close this dialog.            */}
      {/* [&>button:last-child]:hidden → hides broken built-in X button.      */}
      {/* Our own <button> calls closeSignIn() which is the ONLY close path.  */}
      <Dialog open={dialogOpen} onOpenChange={noop}>
        <DialogContent
          className="max-h-[90vh] w-[90%] overflow-y-auto [&>button:last-child]:hidden"
          onInteractOutside={prevent}
          onFocusOutside={prevent}
          onEscapeKeyDown={prevent}
          onPointerDownOutside={prevent}
        >
          <button
            type="button"
            onClick={closeSignIn}
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <SignInDialog
            onSuccess={closeSignIn}
            onClose={closeSignIn}
            onOpenSignUpFlow={() => {
              closeSignIn()
              setSignupOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ── Sign-up dialog (always mounted, fully controlled) ── */}
      <Dialog open={signupOpen} onOpenChange={noop}>
        <DialogContent
          className="w-[90%] [&>button:last-child]:hidden"
          onInteractOutside={prevent}
          onFocusOutside={prevent}
          onEscapeKeyDown={prevent}
          onPointerDownOutside={prevent}
        >
          <button
            type="button"
            onClick={closeSignUp}
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <SignupFlow
            onSuccess={closeSignUp}
            onOpenSignInFlow={() => {
              closeSignUp()
              setDialogOpen(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserSession
