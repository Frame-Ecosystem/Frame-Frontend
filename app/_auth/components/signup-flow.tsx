"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import SignUpForm from "./sign-up-form"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/_components/ui/dialog"
import { useAuth } from "@/app/_auth"
import { Mail } from "lucide-react"

export default function SignupFlow({
  onSuccess,
  onOpenSignInFlow,
}: {
  onSuccess?: () => void
  onOpenSignInFlow?: () => void
}) {
  const [selectedType, setSelectedType] = useState<"client" | "lounge" | null>(
    null,
  )
  const [focusedCard, setFocusedCard] = useState<"client" | "lounge" | null>(
    null,
  )
  const [waitingForVerification, setWaitingForVerification] = useState(false)
  const [signupEmail, setSignupEmail] = useState("")
  const { user, accessToken, isLoading } = useAuth()

  // Poll for authentication when waiting for verification
  useEffect(() => {
    if (!waitingForVerification || isLoading) return

    const checkAuthStatus = () => {
      if (user && accessToken) {
        // User is now authenticated, complete the flow
        setWaitingForVerification(false)
        onSuccess?.()
      }
    }

    // Check immediately
    checkAuthStatus()

    // Then poll every 1 second for faster detection
    const interval = setInterval(checkAuthStatus, 1000)

    return () => clearInterval(interval)
  }, [waitingForVerification, user, accessToken, isLoading, onSuccess])

  if (!selectedType) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Your Account Type
          </DialogTitle>
          <DialogDescription className="text-center">
            Pick the experience that fits your need
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <div className="flex flex-row justify-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-4">
              <Card
                className={`flex w-auto max-w-[200px] flex-shrink-0 cursor-pointer flex-col items-center gap-4 p-6 transition-all duration-300 hover:shadow-lg sm:p-8 ${
                  focusedCard === "client"
                    ? "ring-primary scale-105 shadow-lg ring-2"
                    : "hover:scale-102"
                }`}
                onClick={() => setFocusedCard("client")}
              >
                <Image
                  src="/images/clientType.png"
                  alt="Client"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-md object-contain sm:h-20 sm:w-20"
                />
                <p className="text-bold text-center">Continue as</p>
                <Button
                  className="w-full text-sm sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFocusedCard("client")
                  }}
                >
                  Client
                </Button>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Card
                className={`flex w-auto max-w-[200px] flex-shrink-0 cursor-pointer flex-col items-center gap-4 p-6 transition-all duration-300 hover:shadow-lg sm:p-8 ${
                  focusedCard === "lounge"
                    ? "ring-primary scale-105 shadow-lg ring-2"
                    : "hover:scale-102"
                }`}
                onClick={() => setFocusedCard("lounge")}
              >
                <Image
                  src="/images/loungeType.png"
                  alt="Lounge"
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-md object-contain sm:h-20 sm:w-20"
                />
                <p className="text-bold text-center">Continue as</p>
                <Button
                  className="color-primary w-full text-sm sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFocusedCard("lounge")
                  }}
                >
                  Center
                </Button>
              </Card>
            </div>
          </div>

          {/* Next button at bottom right */}
          {focusedCard && (
            <div className="mt-6 flex justify-end">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                onClick={() => setSelectedType(focusedCard)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }

  if (waitingForVerification) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-center">Check Your Email</DialogTitle>
          <DialogDescription className="text-center">
            We&apos;ve sent a verification link to {signupEmail}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto w-full max-w-md space-y-4 px-4 text-center sm:space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
            <Mail className="mx-auto mb-3 h-10 w-10 text-blue-500 sm:mb-4 sm:h-12 sm:w-12" />
            <h3 className="mb-2 text-base font-semibold text-blue-900 sm:text-lg">
              Verification Email Sent
            </h3>
            <p className="mb-3 text-xs text-blue-700 sm:mb-4 sm:text-sm">
              Click the link in your email to complete your account setup.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="h-3 w-3 animate-pulse rounded-full bg-blue-400 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">
                Waiting for verification...
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-600 sm:text-sm">
              Didn&apos;t receive the email? Check your spam folder or try
              signing up again.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setWaitingForVerification(false)
                  setSignupEmail("")
                }}
                className="flex-1 text-xs sm:text-sm"
              >
                Try Different Email
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-4 flex justify-center">
        <Image
          src={
            selectedType === "client"
              ? "/images/clientType.png"
              : "/images/loungeType.png"
          }
          alt={selectedType === "client" ? "Client" : "Center"}
          width={60}
          height={60}
          className="rounded-md object-contain"
        />
      </div>
      <DialogHeader>
        <DialogTitle className="text-center">Create Account</DialogTitle>
      </DialogHeader>
      <div className="mx-auto w-full max-w-md px-4">
        <SignUpForm
          onSuccess={(email?: string) => {
            if (email) {
              setSignupEmail(email)
              setWaitingForVerification(true)
            } else {
              onSuccess?.()
            }
          }}
          selectedType={selectedType}
          onOpenSignInFlow={onOpenSignInFlow}
        />
      </div>
    </>
  )
}
