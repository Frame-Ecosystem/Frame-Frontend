"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { UserIcon, X } from "lucide-react"
import {
  SignInDialog,
  useAuth,
  SignupFlow,
  getUserDisplayName,
  getUserInitials,
} from "@/app/_auth"
import {
  saveSession,
  getAllSessions,
  type StoredSession,
} from "@/app/_auth/lib/sessions-manager"
import { useTranslation } from "@/app/_i18n"
import { Button } from "../ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Dialog, DialogContent } from "../ui/dialog"
import UserInfo from "./user-info"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { toast } from "sonner"

/** Prevent Radix events from closing dialogs. */
const prevent = (e: Event) => e.preventDefault()

/** Noop — Radix cannot change dialog state, only our callbacks can. */
const noop = () => {}

/** Session check timeout in ms — prevents indefinite loading state */
const SESSION_CHECK_TIMEOUT = 5000

const UserSession = ({ compact }: { compact?: boolean } = {}) => {
  // ===== STATE =====
  const { user, isLoading, ensureSession, loadStoredSession } = useAuth()
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(false)
  const [sessionUser, setSessionUser] = useState<typeof user | null>(null)
  const [storedSessions, setStoredSessions] = useState<StoredSession[]>([])
  const [showStoredSessions, setShowStoredSessions] = useState(false)
  const sessionCheckAbortRef = useRef<AbortController | null>(null)
  const sessionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoggedIn = !!user

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      sessionCheckAbortRef.current?.abort()
      if (sessionCheckTimeoutRef.current) {
        clearTimeout(sessionCheckTimeoutRef.current)
      }
    }
  }, [])

  // ===== CLOSE HELPERS =====
  const closeSignIn = useCallback(() => {
    setDialogOpen(false)
    setIsCheckingSession(false)
    setSessionUser(null)
    setShowStoredSessions(false)
    sessionCheckAbortRef.current?.abort()
    if (sessionCheckTimeoutRef.current) {
      clearTimeout(sessionCheckTimeoutRef.current)
    }
  }, [])

  const closeSignUp = useCallback(() => setSignupOpen(false), [])

  // ===== SESSION CHECK LOGIC =====
  /**
   * Check for existing session WITHOUT auto-logging in.
   * This just detects if a session exists and shows it as an option to continue.
   */
  const checkSession = useCallback(async () => {
    // Cancel any previous check
    sessionCheckAbortRef.current?.abort()
    sessionCheckAbortRef.current = new AbortController()

    setIsCheckingSession(true)
    setSessionUser(null)

    try {
      // Race between ensureSession and timeout
      const checkPromise = ensureSession()
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        sessionCheckTimeoutRef.current = setTimeout(() => {
          reject(new Error("Session check timeout"))
        }, SESSION_CHECK_TIMEOUT)
      })

      const restored = await Promise.race([checkPromise, timeoutPromise])

      // Only update state if not aborted
      if (!sessionCheckAbortRef.current?.signal.aborted) {
        if (restored && user) {
          // Found a session — show as "continue with" option
          setSessionUser(user)
        }
      }
    } catch {
      // Timeout or abort — silently fail and show login form
      if (!sessionCheckAbortRef.current?.signal.aborted) {
        setSessionUser(null)
      }
    } finally {
      if (sessionCheckTimeoutRef.current) {
        clearTimeout(sessionCheckTimeoutRef.current)
      }
      setIsCheckingSession(false)
    }
  }, [ensureSession, user])

  // ===== EVENT HANDLERS =====
  const handleAddAccount = useCallback(() => {
    setPopoverOpen(false)

    // Save current session before opening signin
    if (user) {
      saveSession(user)
      // Load all stored sessions to show options
      setStoredSessions(getAllSessions())
      setShowStoredSessions(true)
    }

    setDialogOpen(true)
    // Don't check session when explicitly adding new account
  }, [user])

  const handleOpenSignIn = useCallback(() => {
    if (isLoading) return
    setDialogOpen(true)
    // Check for existing session (will show as "continue with" option if found)
    checkSession()
  }, [isLoading, checkSession])

  const handleContinueSession = useCallback(async () => {
    closeSignIn()
  }, [closeSignIn])

  const handleSignInDifferent = useCallback(() => {
    setSessionUser(null)
    setShowStoredSessions(false)
  }, [])

  const handleSelectStoredSession = useCallback(
    (session: StoredSession) => {
      // Close the current dialog while we attempt to restore the session
      closeSignIn()
      ;(async () => {
        const success = await loadStoredSession(session)
        if (success) {
          // Session restored — auth context updated, dialogs stay closed
        } else {
          // Backend session switching is not supported (GET /v1/auth/sessions → 404)
          // or the stored session has expired. Show the login form so the user
          // can re-authenticate — do NOT re-open the session picker (infinite loop).
          toast.info(
            `Session expired — please sign in as ${getUserDisplayName(session.user)}.`,
          )
          setDialogOpen(true)
          // sessionUser=null forces the full login form to render,
          // not the "Continue as X" shortcut (which would be wrong here).
          setSessionUser(null)
          setShowStoredSessions(false)
        }
      })()
    },
    [closeSignIn, loadStoredSession],
  )

  // ===== SHARED UI ELEMENTS =====
  const userButton = (
    <Button
      variant="ghost"
      className="hover:bg-primary/10 relative flex h-auto w-auto items-center gap-2 rounded-full p-0.5"
    >
      {isLoggedIn ? (
        <div className="relative">
          <Avatar
            className={`${compact ? "h-10 w-10" : "h-12 w-12"} ring-primary/50 ring-2`}
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
  return (
    <>
      {/* ── Trigger area — hidden while auth is loading ── */}
      {!isLoading &&
        (isLoggedIn ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>{userButton}</PopoverTrigger>
            <PopoverContent className="z-[9999] mt-6 w-72 p-0" align="end">
              <UserInfo
                user={user}
                onAddAccount={handleAddAccount}
                onClose={() => setPopoverOpen(false)}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <span onClick={handleOpenSignIn}>{userButton}</span>
        ))}

      {/* ── Sign-in dialog (always mounted, fully controlled) ── */}
      <Dialog open={dialogOpen} onOpenChange={noop}>
        <DialogContent
          className="z-[9999] max-h-[90vh] w-[90%] overflow-y-auto rounded-2xl [&>button:last-child]:hidden"
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

          {/* Show stored sessions browser before signin form */}
          {showStoredSessions && storedSessions.length > 1 && (
            <div className="mb-4 space-y-3">
              <p className="text-muted-foreground text-sm font-medium">
                {t("auth.signin.savedSessions")}
              </p>
              <div className="space-y-2">
                {storedSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectStoredSession(session)}
                    className="border-border hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      {session.user.profileImage &&
                        typeof session.user.profileImage === "string" && (
                          <AvatarImage src={session.user.profileImage} />
                        )}
                      <AvatarFallback className="text-xs">
                        {getUserInitials(session.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">
                        {getUserDisplayName(session.user)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {session.user.email || session.user.phoneNumber}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowStoredSessions(false)}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("auth.signin.signInWithDifferent")}
              </button>
            </div>
          )}

          <SignInDialog
            onSuccess={closeSignIn}
            onClose={closeSignIn}
            onOpenSignUpFlow={() => {
              closeSignIn()
              setSignupOpen(true)
            }}
            isCheckingSession={isCheckingSession}
            sessionUser={sessionUser}
            onContinueSession={handleContinueSession}
            onSignInDifferent={handleSignInDifferent}
          />
        </DialogContent>
      </Dialog>

      {/* ── Sign-up dialog (always mounted, fully controlled) ── */}
      <Dialog open={signupOpen} onOpenChange={noop}>
        <DialogContent
          className="top-[55%] z-[9999] w-[90%] rounded-2xl [&>button:last-child]:hidden"
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
