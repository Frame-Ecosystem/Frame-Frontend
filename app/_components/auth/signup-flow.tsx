"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import SignUpForm from "./sign-up-form"
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"

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
          <div className="flex flex-row justify-center gap-4">
            <Card className="flex flex-col items-center gap-3 p-4 p-8">
              <Image
                src="/images/clientType.png"
                alt="Client"
                width={88}
                height={88}
                className="rounded-md"
                style={{ height: "auto" }}
              />
              <Button
                className="w-full text-sm"
                onClick={() => setSelectedType("client")}
              >
                {" "}
                Client
              </Button>
            </Card>
            <Card className="flex flex-col items-center gap-3 p-4 p-8">
              <Image
                src="/images/loungeType.png"
                alt="Lounge"
                width={80}
                height={80}
                className="rounded-md pb-0.5"
                style={{ height: "auto" }}
              />
              <Button
                className="w-full text-sm"
                onClick={() => setSelectedType("lounge")}
              >
                Lounge
              </Button>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Create Account</DialogTitle>
        <DialogDescription className="text-center">
          Provide either email or phone number (or both)
        </DialogDescription>
      </DialogHeader>
      <div className="w-full max-w-md">
        <SignUpForm
          onSuccess={onSuccess}
          selectedType={selectedType}
          onOpenSignInFlow={onOpenSignInFlow}
        />
      </div>
    </>
  )
}
