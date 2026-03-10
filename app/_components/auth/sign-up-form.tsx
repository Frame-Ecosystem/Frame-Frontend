"use client"

import { useMemo, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { GOOGLE_AUTH_BASE_URL } from "../../_services/api"
import { useAuth } from "../../_providers/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { getLoginRedirectPath } from "../../_lib/profile"
import { Eye, EyeOff } from "lucide-react"
import { useSignUp } from "../../_hooks/queries"
import GoogleButton from "./google-button"
import openGoogleOAuthPopup, {
  handleGoogleAuthResult,
} from "../../_lib/googlePopup"
import { validateSignupPassword } from "../../_lib/signupValidators"

export default function SignUpForm({
  onSuccess,
  selectedType: selectedTypeProp,
  onOpenSignInFlow,
}: {
  onSuccess?: (email?: string) => void // eslint-disable-line no-unused-vars
  selectedType?: "client" | "lounge"
  onOpenSignInFlow?: () => void
}) {
  const searchParams = useSearchParams()
  const selectedTypeParam = searchParams?.get("type")?.toLowerCase() || null
  const selectedTypeFromQuery = useMemo<"client" | "lounge" | null>(() => {
    return selectedTypeParam === "client" || selectedTypeParam === "lounge"
      ? (selectedTypeParam as any)
      : null
  }, [selectedTypeParam])
  const selectedType = selectedTypeProp ?? selectedTypeFromQuery

  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const { setAuth } = useAuth()
  const router = useRouter()
  const signUpMutation = useSignUp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!selectedType) {
        setError("Please select account type (Client or Lounge)")
        setLoading(false)
        return
      }

      // Validate that both email and phone number are provided
      if (!email || !phoneNumber) {
        setError("Please provide both an email address and phone number")
        setLoading(false)
        return
      }

      // Validate phone number format
      let formattedPhoneNumber: string
      // Remove any non-digit characters
      const cleanPhone = phoneNumber.replace(/\D/g, "")
      if (cleanPhone.length !== 8) {
        setError("Phone number must be exactly 8 digits")
        setLoading(false)
        return
      }
      // Send just the 8 digits (country code is handled visually)
      formattedPhoneNumber = cleanPhone

      // Password validation for signup (centralized)
      const validationError = validateSignupPassword(password, confirmPassword)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      setEmailSending(true)

      const response = await signUpMutation.mutateAsync({
        email: email || undefined,
        phoneNumber: formattedPhoneNumber,
        password,
        type: selectedType,
      })

      if (response) {
        // Keep emailSending true briefly to show success state
        setTimeout(() => {
          setEmailSending(false)
          onSuccess?.(email)
        }, 1000)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError(err instanceof Error ? err.message : "Signup failed")
      setEmailSending(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setLoading(true)

    if (!selectedType) {
      setError("Please select account type (Client or Lounge)")
      setLoading(false)
      return
    }

    try {
      const result = await openGoogleOAuthPopup({
        url: `${GOOGLE_AUTH_BASE_URL}/v1/auth/google/signup?type=${selectedType}`,
        mode: "signup",
      })
      await handleGoogleAuthResult(result, {
        setAuth,
        onSuccess,
        redirect: (path) => router.push(path),
        getRedirectPath: getLoginRedirectPath,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Handle phone number input - only allow numbers and limit to 8 digits
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove any non-numeric characters
    const numericValue = value.replace(/\D/g, "")
    // Limit to exactly 8 digits
    const limitedValue = numericValue.slice(0, 8)
    setPhoneNumber(limitedValue)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-1 text-sm">
            <span className="font-medium">+216</span>
            <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 text-xs">
              TN
            </span>
          </div>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="50123456"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="pl-20"
            required
          />
        </div>
        <p className="text-muted-foreground text-xs">
          Enter 8 digits for Tunisia
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

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
            minLength={8}
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || emailSending}
      >
        {emailSending
          ? "Sending verification email..."
          : loading
            ? "Creating account..."
            : "Sign Up"}
      </Button>

      <GoogleButton
        onClick={handleGoogleSignUp}
        disabled={loading || !selectedType}
      />

      {/* Sign in link: redirect to sign-in dialog */}
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => {
            setError("")
            // Close signup flow and open sign-in dialog if provided
            if (onOpenSignInFlow) {
              onOpenSignInFlow()
            } else {
              // Fallback: navigate to home page (where sign-in dialog can be opened)
              router.push("/")
            }
          }}
          className="text-primary hover:underline"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  )
}
