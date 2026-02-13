"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card"
import { authService } from "@/app/_services/auth.service"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link.",
      )
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!token) {
      setError("Invalid reset token")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await authService.resetPassword(token, newPassword)
      if (response) {
        setSuccess("Password reset successfully! Redirecting to sign in...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-md px-4 py-12">
          <div className="mb-8">
            <Link
              href="/auth/forgot-password"
              className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to forgot password
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Lock className="text-destructive h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please
                request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Request New Reset Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8">
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to forgot password
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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

              {success && <p className="text-sm text-green-600">{success}</p>}

              <Button
                type="submit"
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
