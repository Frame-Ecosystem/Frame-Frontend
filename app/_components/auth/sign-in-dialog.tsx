"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { authService } from "../../_services/auth.service"
import { GOOGLE_AUTH_BASE_URL, apiClient } from "../../_services/api"
import openGoogleOAuthPopup from "../../_lib/googlePopup"
import { getLoginRedirectPath } from "../../_lib/profile"
import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useSignIn } from "../../_hooks/queries"
import GoogleButton from "./google-button"

const SignInDialog = ({
  onSuccess,
  onClose,
  onOpenSignUpFlow,
}: {
  onSuccess?: () => void
  onClose?: () => void
  onOpenSignUpFlow?: () => void
}) => {
  // === STATE ===
  const router = useRouter()
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { setAuth } = useAuth()
  const signInMutation = useSignIn()

  // Listen for messages from Google auth error page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "GOOGLE_AUTH_ERROR") {
        setLoading(false)
        setError(event.data.message || "Authentication failed")
      } else if (event.data.type === "GOOGLE_AUTH_SIGNUP") {
        setLoading(false)
        setError("Account not found. Please use the sign up option instead.")
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // === EVENT HANDLERS ===

  /**
   * Handles Google OAuth sign-in
   */
  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    const url = `${GOOGLE_AUTH_BASE_URL}/v1/auth/google/login`
    try {
      const result = await openGoogleOAuthPopup(url)
      const newToken = result.token
      const popupUser = result.user

      if (!newToken) throw new Error("Sign-in failed. Please try again.")

      if (popupUser) {
        if (popupUser.type) {
          setAuth(popupUser, newToken)
          onSuccess?.()
          onClose?.()
          router.push(getLoginRedirectPath())
        } else {
          throw new Error(
            "Account found but type not set. Please contact support.",
          )
        }
      } else {
        // Ensure apiClient uses the new token then fetch user
        apiClient.setAccessTokenGetter(() => newToken)
        const userData = await authService.getCurrentUser()
        if (userData) {
          if (userData.type) {
            setAuth(userData, newToken)
            onSuccess?.()
            onClose?.()
            router.push(getLoginRedirectPath())
          } else {
            throw new Error(
              "Account found but type not set. Please contact support.",
            )
          }
        } else {
          throw new Error("Sign-in failed. Please try again.")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles form submission for both sign-in and sign-up
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Check if emailOrPhone looks like a phone number (8 digits)
      let formattedEmailOrPhone = emailOrPhone
      const cleanPhone = emailOrPhone.replace(/\D/g, "")

      if (
        cleanPhone.length === 8 &&
        cleanPhone === emailOrPhone.replace(/\D/g, "")
      ) {
        // It's a phone number, send just the 8 digits (country code is visual only)
        formattedEmailOrPhone = cleanPhone
      }

      const response = await signInMutation.mutateAsync({
        emailOrPhone: formattedEmailOrPhone,
        password,
      })
      if (response) {
        router.push(getLoginRedirectPath())
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  // Handle email/phone input - allow emails or restrict phone numbers to 8 digits
  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Check if the input contains @ symbol (definitely an email)
    if (value.includes("@")) {
      // Allow all email characters
      setEmailOrPhone(value)
    } else {
      // Check if it contains email-like characters (letters, dots, hyphens, underscores)
      const hasEmailChars = /[a-zA-Z._-]/.test(value)

      if (hasEmailChars) {
        // Allow email characters (likely building an email)
        setEmailOrPhone(value)
      } else {
        // Treat as phone number - only allow numbers and limit to 8 digits
        const numericValue = value.replace(/\D/g, "")
        const limitedValue = numericValue.slice(0, 8)
        setEmailOrPhone(limitedValue)
      }
    }
  }

  // === RENDER ===

  return (
    <>
      {/* Desktop Style - Centered layout */}
      <div className="hidden w-full items-center justify-center p-5 md:flex">
        <DialogHeader className="flex w-full flex-col items-center">
          <DialogTitle className="w-full text-center text-lg font-bold">
            Sign In to the platform
          </DialogTitle>
          <DialogDescription className="text-muted-foreground w-full text-center text-sm">
            Sign in with your email or phone number
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Mobile Style - Compact layout */}
      <DialogHeader className="md:hidden">
        <DialogTitle>Sign In to the platform</DialogTitle>
        <DialogDescription>
          Sign in with your email or phone number
        </DialogDescription>
      </DialogHeader>

      {/* Authentication Form */}
      <div className="space-y-4">
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Phone field */}
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
            <div className="relative">
              {emailOrPhone &&
                !emailOrPhone.includes("@") &&
                !/[a-zA-Z._-]/.test(emailOrPhone) &&
                emailOrPhone.replace(/\D/g, "").length <= 8 && (
                  <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1 text-sm">
                    <span className="font-medium">+216</span>
                    <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 text-xs">
                      TN
                    </span>
                  </div>
                )}
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="you@example.com or 50123456"
                value={emailOrPhone}
                onChange={handleEmailOrPhoneChange}
                className={
                  emailOrPhone &&
                  !emailOrPhone.includes("@") &&
                  !/[a-zA-Z._-]/.test(emailOrPhone) &&
                  emailOrPhone.replace(/\D/g, "").length <= 8
                    ? "pl-20"
                    : ""
                }
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && <p className="text-destructive text-sm">{error}</p>}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </Button>

          {/* Forgot password link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setError("")
                onClose?.()
                router.push("/auth/forgot-password")
              }}
              className="text-primary text-sm hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <GoogleButton onClick={handleGoogleSignIn} />

          {/* Signup link: always redirect to type selection first */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setError("")
                // Close dialog and open signup flow dialog if provided
                onClose?.()
                if (onOpenSignUpFlow) {
                  onOpenSignUpFlow()
                } else {
                  // Fallback: navigate to type selection page
                  router.push("/choose-type")
                }
              }}
              className="text-primary hover:underline"
            >
              Don&apos;t have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SignInDialog
