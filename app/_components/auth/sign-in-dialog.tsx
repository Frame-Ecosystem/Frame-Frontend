"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { DialogHeader, DialogTitle } from "../ui/dialog"
import { GOOGLE_AUTH_BASE_URL } from "../../_services/api"
import openGoogleOAuthPopup, {
  handleGoogleAuthResult,
} from "../../_lib/googlePopup"
import { getLoginRedirectPath } from "../../_lib/profile"
import { useAuth } from "../../_providers/auth"
import { useSignIn } from "../../_hooks/queries"
import GoogleButton from "./google-button"

const MAX_PHONE_DIGITS = 8
const EMAIL_CHAR_PATTERN = /[a-zA-Z._-]/

/** True when the value looks like a phone number (pure digits, ≤ 8 chars). */
function isPhoneInput(value: string): boolean {
  if (!value || value.includes("@") || EMAIL_CHAR_PATTERN.test(value))
    return false
  return value.replace(/\D/g, "").length <= MAX_PHONE_DIGITS
}

/** Strips non-digits for phone numbers; returns the value as-is for emails. */
function formatCredential(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits.length === MAX_PHONE_DIGITS ? digits : value
}

interface SignInDialogProps {
  onSuccess?: () => void
  onClose?: () => void
  onOpenSignUpFlow?: () => void
}

const SignInDialog = ({
  onSuccess,
  onClose,
  onOpenSignUpFlow,
}: SignInDialogProps) => {
  const router = useRouter()
  const { setAuth } = useAuth()
  const signInMutation = useSignIn()

  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPhone = isPhoneInput(emailOrPhone)

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      const result = await openGoogleOAuthPopup({
        url: `${GOOGLE_AUTH_BASE_URL}/v1/auth/google/login`,
        mode: "signin",
      })
      await handleGoogleAuthResult(result, {
        setAuth,
        onSuccess,
        onClose,
        redirect: (path) => router.push(path),
        getRedirectPath: getLoginRedirectPath,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await signInMutation.mutateAsync({
        emailOrPhone: formatCredential(emailOrPhone),
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

  const handleEmailOrPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    if (value.includes("@") || EMAIL_CHAR_PATTERN.test(value)) {
      setEmailOrPhone(value)
      return
    }

    setEmailOrPhone(value.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS))
  }

  const handleForgotPassword = () => {
    setError("")
    onClose?.()
    router.push("/auth/forgot-password")
  }

  const handleSignUp = () => {
    setError("")
    onClose?.()
    onOpenSignUpFlow ? onOpenSignUpFlow() : router.push("/choose-type")
  }

  return (
    <>
      {/* Desktop header */}
      <div className="hidden w-full items-center justify-center p-5 md:flex">
        <DialogHeader className="flex w-full flex-col items-center">
          <DialogTitle className="w-full text-center text-lg font-bold">
            Sign In to Frame
          </DialogTitle>
        </DialogHeader>
      </div>

      {/* Mobile header */}
      <DialogHeader className="md:hidden">
        <DialogTitle>Sign In to Frame</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Phone */}
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
            <div className="relative">
              {isPhone && (
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
                className={isPhone ? "pl-20" : ""}
                required
              />
            </div>
          </div>

          {/* Password */}
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
                onClick={() => setShowPassword((prev) => !prev)}
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

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary text-sm hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <GoogleButton onClick={handleGoogleSignIn} />

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleSignUp}
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
