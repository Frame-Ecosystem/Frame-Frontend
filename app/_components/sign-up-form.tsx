"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { authService } from "../_services/auth.service"
import { API_BASE_URL, apiClient } from "../_services/api"
import { useAuth } from "../_providers/auth"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { getLoginRedirectPath } from "../_lib/profile"
import { Eye, EyeOff } from "lucide-react"
import { useSignUp } from "../_hooks/queries"
import GoogleButton from "./google-button"
import openGoogleOAuthPopup from "../_lib/googlePopup"
import { validateSignupPassword } from "../_lib/signupValidators"

export default function SignUpForm({ onSuccess, selectedType: selectedTypeProp, onOpenSignInFlow }: { onSuccess?: () => void; selectedType?: "client" | "lounge"; onOpenSignInFlow?: () => void }) {
  const searchParams = useSearchParams()
  const selectedTypeParam = searchParams?.get("type")?.toLowerCase() || null
  const selectedTypeFromQuery = useMemo<"client" | "lounge" | null>(() => {
    return selectedTypeParam === "client" || selectedTypeParam === "lounge" ? (selectedTypeParam as any) : null
  }, [selectedTypeParam])
  const selectedType = selectedTypeProp ?? selectedTypeFromQuery

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { setAuth } = useAuth()
  const router = useRouter()
  const signUpMutation = useSignUp()

  // Listen for messages from Google auth error page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        setLoading(false)
        setError(event.data.message || "Authentication failed")
      } else if (event.data.type === 'GOOGLE_AUTH_LOGIN') {
        setLoading(false)
        setError("Account already exists. Please sign in instead.")
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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

      // Password validation for signup (centralized)
      const validationError = validateSignupPassword(password, confirmPassword)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      const response = await signUpMutation.mutateAsync({ email, password, type: selectedType })
      if (response) {
        onSuccess?.()
        const redirectPath = getLoginRedirectPath(response.data)
        if (redirectPath) {
          router.push(redirectPath)
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : "Signup failed")
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
      const url = `${API_BASE_URL}/v1/auth/google/signup?type=${selectedType}`
      const result = await openGoogleOAuthPopup(url, 60000, 5000, { mode: 'signup' })
      const newToken = result.token
      const popupUser = result.user

      if (!newToken) throw new Error("Sign-up failed. Please try again.")

      if (popupUser) {
        if (popupUser.type) {
          setAuth(popupUser, newToken)
          onSuccess?.()
          const redirectPath = getLoginRedirectPath(popupUser)
          if (redirectPath) router.push(redirectPath)
        } else {
          throw new Error("Account created but type not set. Please contact support.")
        }
      } else {
        apiClient.setAccessTokenGetter(() => newToken)
        const userData = await authService.getCurrentUser()
        if (userData) {
          if (userData.type) {
            setAuth(userData, newToken)
            onSuccess?.()
            const redirectPath = getLoginRedirectPath(userData)
            if (redirectPath) router.push(redirectPath)
          } else {
            throw new Error("Account created but type not set. Please contact support.")
          }
        } else {
          throw new Error("Account created but unable to verify. Please try signing in.")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected Type Banner */}
      {selectedType && (
        <div className="flex w-full items-center justify-center mb-2">
          <div className="flex items-center gap-3">
            <Image
              src={selectedType === "lounge" ? "/images/loungeType.png" : "/images/clientType.png"}
              alt={selectedType === "lounge" ? "Lounge" : "Client"}
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="pr-10" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
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
          <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="pr-10" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading..." : "Sign Up"}
      </Button>

      <GoogleButton onClick={handleGoogleSignUp} disabled={loading || !selectedType} />

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
