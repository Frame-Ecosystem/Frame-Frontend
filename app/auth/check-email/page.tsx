"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../_components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

export default function CheckEmailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  useEffect(() => {
    // If no email provided, redirect to home
    if (!email) {
      router.push("/")
    }
  }, [email, router])

  if (!email) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <Mail className="mx-auto mb-4 h-16 w-16 text-blue-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {t("auth.checkEmail.title")}
          </h1>
          <p className="mb-4 text-gray-600">{t("auth.checkEmail.sentTo")}</p>
          <p className="rounded-lg bg-blue-50 px-4 py-2 text-lg font-semibold text-blue-600">
            {email}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {t("auth.checkEmail.clickLink")}
          </p>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>{t("auth.checkEmail.didntReceive")}</strong>
              <br />
              {t("auth.checkEmail.checkSpam")}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.backToHome")}
            </Button>

            <Button
              onClick={() => router.push("/auth/signup")}
              className="w-full"
            >
              {t("auth.checkEmail.signUpDifferent")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
