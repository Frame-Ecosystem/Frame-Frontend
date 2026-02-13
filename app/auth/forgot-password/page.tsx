"use client"

import { useState } from "react"
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
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      if (response) {
        setSuccess(
          "Password reset email sent! Check your inbox for instructions.",
        )
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              {success && <p className="text-sm text-green-600">{success}</p>}

              <Button
                type="submit"
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
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
