"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { authService } from "@/app/_auth"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useAuthRateLimit } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, recordSuccess } =
    useAuthRateLimit()

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("auth.forgot.emailRequired"))
          .email(t("auth.forgot.invalidEmail")),
      }),
    [],
  )

  type Values = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: Values) => {
    if (isLocked) return
    setSuccess("")
    setLoading(true)

    try {
      const response = await authService.forgotPassword(values.email.trim())
      if (response) {
        recordSuccess()
        setSuccess(t("auth.forgot.successMessage"))
      }
    } catch (err) {
      recordFailure()
      const message =
        err instanceof Error ? err.message : t("auth.forgot.failedToSend")
      setError("email", { type: "server", message })
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
            {t("auth.backToHome")}
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">{t("auth.forgot.title")}</CardTitle>
            <CardDescription>{t("auth.forgot.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit, () => setSubmitAttempted(true))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.forgot.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  {...register("email", {
                    onChange: () => setSubmitAttempted(false),
                  })}
                />
                {errors.email?.message && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {success && <p className="text-sm text-green-600">{success}</p>}

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={loading || isLocked || (!isValid && submitAttempted)}
                onClick={() => setSubmitAttempted(true)}
              >
                {isLocked
                  ? t("auth.rateLimit", {
                      remainingSeconds: String(remainingSeconds),
                    })
                  : loading
                    ? t("auth.forgot.sending")
                    : t("auth.forgot.submit")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link href="/" className="text-primary hover:underline">
                {t("auth.backToSignIn")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
