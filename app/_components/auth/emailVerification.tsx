"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { authService } from "../../_services/auth.service"
import { useAuth } from "../../_providers/auth"

interface EmailVerificationProps {
  email: string
  isVerified?: boolean
}

export function EmailVerification({
  email,
  isVerified = false,
}: EmailVerificationProps) {
  const { setAuth } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleSendCode = async () => {
    setIsSending(true)
    setMessage(null)
    try {
      const response = await authService.sendVerificationCode(email)
      if (response) {
        setMessage({
          type: "success",
          text: "Verification code sent to your email!",
        })
        setShowCodeInput(true)
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setMessage({ type: "error", text: "Please enter the verification code" })
      return
    }

    setIsVerifying(true)
    setMessage(null)
    try {
      const response = await authService.verifyEmail(
        email,
        verificationCode.trim(),
      )
      if (response) {
        setMessage({ type: "success", text: "Email verified successfully!" })
        setShowCodeInput(false)
        setVerificationCode("")

        // Refresh user data from backend to get updated verification status
        const updatedUser = await authService.getCurrentUser()
        if (updatedUser) {
          setAuth(updatedUser, null) // Update the auth context with fresh data
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Invalid verification code",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      {isVerified ? (
        <Button
          disabled
          variant="outline"
          size="sm"
          className="flex cursor-not-allowed items-center gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Verified
        </Button>
      ) : (
        <Button
          onClick={handleSendCode}
          disabled={isSending}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <AlertCircleIcon className="h-4 w-4" />
          {isSending ? "Sending..." : "Verify your email"}
        </Button>
      )}

      {/* Code input section - only show when verification is in progress */}
      {showCodeInput && (
        <div className="bg-muted/50 mt-3 space-y-3 rounded-lg p-3">
          <div>
            <Label htmlFor="verification-code" className="text-xs">
              Enter 6-digit code sent to your email
            </Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              maxLength={6}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
              size="sm"
              className="flex-1"
            >
              {isVerifying ? "Verifying..." : "Verify Code"}
            </Button>
            <Button
              onClick={() => {
                setShowCodeInput(false)
                setVerificationCode("")
                setMessage(null)
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Success/Error messages */}
      {message && (
        <div
          className={`mt-2 flex items-center gap-2 rounded p-2 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <AlertCircleIcon className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </>
  )
}
