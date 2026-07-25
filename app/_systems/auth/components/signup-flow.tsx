"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import SignUpForm from "./sign-up-form"
import { DialogTitle, DialogDescription } from "@/app/_components/ui/dialog"
import { useAuth } from "@/app/_auth"
import { Mail } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

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
  const { t } = useTranslation()

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
      <div dir="ltr" className="flex flex-col items-center">
        {/* Header — centered for both Latin and Arabic */}
        <div className="w-full text-center">
          <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("auth.signup.chooseAccountType")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-sm">
            {t("auth.signup.pickExperience")}
          </DialogDescription>
        </div>

        <div className="mt-8 w-full">
          <div className="flex flex-row justify-center gap-4 sm:gap-6">
            {/* Client Card */}
            <div className="flex flex-col items-center gap-4">
              <Card
                className={`flex w-auto max-w-[200px] flex-shrink-0 cursor-pointer flex-col items-center gap-4 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg sm:p-8 ${
                  focusedCard === "client"
                    ? "bg-primary/5 ring-primary scale-105 shadow-lg ring-2"
                    : "hover:bg-muted/50 hover:scale-[1.02]"
                }`}
                onClick={() => setFocusedCard("client")}
              >
                <div className="bg-muted/50 flex h-20 w-20 items-center justify-center rounded-2xl sm:h-24 sm:w-24">
                  <Image
                    src="/images/clientType.png"
                    alt="Client"
                    width={80}
                    height={80}
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                </div>
                <p className="text-foreground text-center text-sm font-medium">
                  {t("auth.signup.continueAs")}
                </p>
                <Button
                  className="h-10 w-full rounded-lg text-sm font-medium transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFocusedCard("client")
                  }}
                >
                  {t("auth.signup.client")}
                </Button>
              </Card>
            </div>

            {/* Lounge Card */}
            <div className="flex flex-col items-center gap-4">
              <Card
                className={`flex w-auto max-w-[200px] flex-shrink-0 cursor-pointer flex-col items-center gap-4 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg sm:p-8 ${
                  focusedCard === "lounge"
                    ? "bg-primary/5 ring-primary scale-105 shadow-lg ring-2"
                    : "hover:bg-muted/50 hover:scale-[1.02]"
                }`}
                onClick={() => setFocusedCard("lounge")}
              >
                <div className="bg-muted/50 flex h-20 w-20 items-center justify-center rounded-2xl sm:h-24 sm:w-24">
                  <Image
                    src="/images/loungeType.png"
                    alt="Lounge"
                    width={80}
                    height={80}
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                </div>
                <p className="text-foreground text-center text-sm font-medium">
                  {t("auth.signup.continueAs")}
                </p>
                <Button
                  className="h-10 w-full rounded-lg text-sm font-medium transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFocusedCard("lounge")
                  }}
                >
                  {t("auth.signup.center")}
                </Button>
              </Card>
            </div>
          </div>

          {/* Next button */}
          {focusedCard && (
            <div className="mt-8 flex justify-center">
              <Button
                className="h-11 w-full max-w-xs rounded-lg px-8 text-sm font-semibold tracking-wide transition-all duration-200 sm:max-w-sm"
                onClick={() => setSelectedType(focusedCard)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (waitingForVerification) {
    return (
      <div dir="ltr" className="flex flex-col items-center">
        {/* Header — centered */}
        <div className="w-full text-center">
          <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("auth.signup.checkEmail")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-sm">
            {t("auth.signup.verificationSent", { email: signupEmail })}
          </DialogDescription>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md space-y-5 px-4 text-center sm:space-y-6">
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-5 backdrop-blur-sm sm:p-6 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 sm:mb-5 sm:h-16 sm:w-16 dark:bg-blue-900/50">
              <Mail className="h-7 w-7 text-blue-500 sm:h-8 sm:w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-base font-semibold sm:text-lg">
              {t("auth.signup.verificationEmailSent")}
            </h3>
            <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
              {t("auth.signup.clickLink")}
            </p>
            <div className="text-primary flex items-center justify-center gap-2">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-xs font-medium sm:text-sm">
                {t("auth.signup.waitingVerification")}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t("auth.signup.didntReceive")}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setWaitingForVerification(false)
                setSignupEmail("")
              }}
              className="h-10 w-full rounded-lg text-xs font-medium sm:text-sm"
            >
              {t("auth.signup.tryDifferentEmail")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="ltr" className="flex flex-col items-center">
      {/* Header — centered for both Latin and Arabic */}
      <div className="w-full text-center">
        <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("auth.signup.createAccount")}
        </DialogTitle>
      </div>
      <div className="mx-auto mt-8 w-full max-w-md px-4">
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
    </div>
  )
}
