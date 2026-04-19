"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
import {
  authService,
  validateSignupPassword,
  usePasswordRules,
  useAuthRateLimit,
  useAuth,
  mapAuthError,
} from "@/app/_auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Eye, EyeOff, Lock, X } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/app/_i18n"

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, recordSuccess } =
    useAuthRateLimit()
  const { clearAuth } = useAuth()

  useEffect(() => {
    if (!token) {
      setError(t("auth.reset.invalidToken"))
    }
  }, [token])

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z
            .string()
            .min(1, t("auth.reset.passwordRequired"))
            .min(8, t("auth.reset.passwordMinLength"))
            .max(128, t("auth.reset.passwordMaxLength")),
          confirmPassword: z
            .string()
            .min(1, t("auth.reset.confirmRequired"))
            .min(8, t("auth.reset.passwordMinLength")),
        })
        .superRefine(({ newPassword, confirmPassword }, ctx) => {
          if (!newPassword || !confirmPassword) return

          const validationError = validateSignupPassword(
            newPassword,
            confirmPassword,
          )
          if (!validationError) return

          if (
            validationError === "Passwords do not match" ||
            validationError === t("auth.reset.passwordsMismatch")
          ) {
            ctx.addIssue({
              code: "custom",
              path: ["confirmPassword"],
              message: validationError,
            })
            return
          }

          ctx.addIssue({
            code: "custom",
            path: ["newPassword"],
            message: validationError,
          })
        }),
    [],
  )

  type Values = z.infer<typeof schema>

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    register,
    setError: setFieldError,
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const newPassword = watch("newPassword")
  const confirmPassword = watch("confirmPassword")
  const { rules } = usePasswordRules(newPassword, confirmPassword)

  const onSubmit = async (values: Values) => {
    if (isLocked) return
    setError("")
    setSuccess("")
    setLoading(true)

    if (!token) {
      setError("Invalid reset token")
      setLoading(false)
      return
    }

    try {
      const response = await authService.resetPassword(
        token,
        values.newPassword,
      )
      if (response) {
        recordSuccess()
        // Server invalidates all sessions on password reset —
        // clear any local auth state before redirecting.
        clearAuth()
        setSuccess(t("auth.reset.successRedirect"))
        setTimeout(() => {
          router.push("/?signin=true")
        }, 2000)
      }
    } catch (err) {
      recordFailure()
      const mapped = mapAuthError(err, "resetPassword")
      setError(mapped.formError)
      setFieldError("newPassword", {
        type: "server",
        message: mapped.formError,
      })
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
              {t("auth.reset.backToForgot")}
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Lock className="text-destructive h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">
                {t("auth.reset.invalidLink")}
              </CardTitle>
              <CardDescription>
                {t("auth.reset.invalidLinkDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">
                  {t("auth.reset.requestNewLink")}
                </Link>
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
            {t("auth.reset.backToForgot")}
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">{t("auth.reset.title")}</CardTitle>
            <CardDescription>{t("auth.reset.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit, () => setSubmitAttempted(true))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {t("auth.reset.newPassword")}
                </Label>
                <div className="relative">
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field }) => (
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={field.value}
                        onChange={(e) => {
                          setSubmitAttempted(false)
                          field.onChange(e.target.value)
                        }}
                        required
                        minLength={8}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                    )}
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

                <div className="space-y-2">
                  <ul className="space-y-1 text-xs">
                    {rules.map((rule) => (
                      <li
                        key={rule.id}
                        className={
                          rule.met
                            ? "text-green-600 dark:text-green-400"
                            : "text-foreground"
                        }
                        aria-label={rule.label}
                      >
                        <span className="inline-flex items-center gap-2">
                          {rule.met ? (
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <X className="h-3.5 w-3.5" aria-hidden />
                          )}
                          <span>{rule.label}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {errors.newPassword?.message && (
                  <p className="text-destructive text-sm">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.reset.confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="pr-10"
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      onChange: () => setSubmitAttempted(false),
                    })}
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
                {errors.confirmPassword?.message && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

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
                    ? t("auth.reset.resetting")
                    : t("auth.reset.submit")}
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
