"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { DialogHeader, DialogTitle } from "@/app/_components/ui/dialog"
import openGoogleOAuthPopup, {
  handleGoogleAuthResult,
} from "../lib/google-popup"
import { getLoginRedirectPath } from "@/app/_lib/profile"
import { useAuth } from "../auth-provider"
import { useSignIn } from "@/app/_hooks/queries"
import GoogleButton from "./google-button"
import { mapAuthError } from "../lib/error-mapper"
import { useAuthRateLimit } from "../hooks/use-rate-limit"
import { useTranslation } from "@/app/_i18n"

const MAX_PHONE_DIGITS = 8
const EMAIL_CHAR_PATTERN = /[a-zA-Z._-]/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** True when the value looks like a phone number (pure digits, ≤ 8 chars). */
function isPhoneInput(value: string): boolean {
  if (!value || value.includes("@") || EMAIL_CHAR_PATTERN.test(value))
    return false
  return value.replace(/\D/g, "").length <= MAX_PHONE_DIGITS
}

/** Strips non-digits for phone numbers; returns the value as-is for emails. */
function formatCredential(value: string): string {
  const trimmed = value.trim()
  if (!isPhoneInput(trimmed)) return trimmed
  return trimmed.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS)
}

function isValidEmailOrPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed.includes("@") || EMAIL_CHAR_PATTERN.test(trimmed)) {
    return EMAIL_RE.test(trimmed)
  }

  const digits = trimmed.replace(/\D/g, "")
  return digits.length === MAX_PHONE_DIGITS
}

interface SignInDialogProps {
  onSuccess?: () => void
  onClose?: () => void
  onOpenSignUpFlow?: () => void
}

const SignInDialog = ({
  onSuccess,
  onClose,
  onOpenSignUpFlow,
}: SignInDialogProps) => {
  const router = useRouter()
  const { setAuth } = useAuth()
  const signInMutation = useSignIn()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, recordSuccess } =
    useAuthRateLimit()

  const signInSchema = useMemo(
    () =>
      z.object({
        emailOrPhone: z
          .string()
          .min(1, "Email or phone number is required")
          .refine(isValidEmailOrPhone, {
            message: "Enter a valid email or an 8-digit phone number",
          }),
        password: z
          .string()
          .min(1, "Password is required")
          .min(8, "Password must be at least 8 characters"),
      }),
    [],
  )

  type SignInValues = z.infer<typeof signInSchema>

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { emailOrPhone: "", password: "" },
  })

  const emailOrPhone = watch("emailOrPhone")
  const isPhone = isPhoneInput(emailOrPhone)

  const handleGoogleSignIn = async () => {
    setFormError("")
    setLoading(true)
    try {
      const result = await openGoogleOAuthPopup({
        url: `/v1/auth/google/login`,
        mode: "signin",
      })
      await handleGoogleAuthResult(result, {
        setAuth,
        onSuccess,
        onClose,
        redirect: (path) => router.push(path),
        getRedirectPath: getLoginRedirectPath,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: SignInValues) => {
    if (isLocked) return
    setFormError("")
    setLoading(true)

    try {
      const response = await signInMutation.mutateAsync({
        emailOrPhone: formatCredential(values.emailOrPhone),
        password: values.password,
      })
      if (response) {
        recordSuccess()
        router.push(getLoginRedirectPath(response.data))
        onSuccess?.()
      }
    } catch (err) {
      const mapped = mapAuthError(err, "signin")
      recordFailure(mapped.retryAfter)
      setFormError(mapped.formError)

      if (mapped.fieldErrors) {
        for (const [field, message] of Object.entries(mapped.fieldErrors)) {
          if (field === "emailOrPhone" || field === "password") {
            setError(field, { type: "server", message })
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setFormError("")
    onClose?.()
    router.push("/auth/forgot-password")
  }

  const handleSignUp = () => {
    setFormError("")
    onClose?.()
    onOpenSignUpFlow ? onOpenSignUpFlow() : router.push("/choose-type")
  }

  return (
    <>
      {/* Desktop header */}
      <div className="hidden w-full items-center justify-center p-5 md:flex">
        <DialogHeader className="flex w-full flex-col items-center">
          <DialogTitle className="w-full text-center text-lg font-bold">
            {t("auth.signin.title")}
          </DialogTitle>
        </DialogHeader>
      </div>

      {/* Mobile header */}
      <DialogHeader className="md:hidden">
        <DialogTitle>{t("auth.signin.title")}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <form
          onSubmit={handleSubmit(onSubmit, () => setSubmitAttempted(true))}
          className="space-y-4"
        >
          {/* Email / Phone */}
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">
              {t("auth.signin.emailOrPhone")}
            </Label>
            <Controller
              control={control}
              name="emailOrPhone"
              render={({ field }) => (
                <div className="relative">
                  {isPhone && (
                    <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1 text-sm">
                      <span className="font-medium">+216</span>
                      <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 text-xs">
                        TN
                      </span>
                    </div>
                  )}
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder={t("auth.signin.emailPhonePlaceholder")}
                    value={field.value}
                    onChange={(e) => {
                      const raw = e.target.value
                      setFormError("")

                      if (raw.includes("@") || EMAIL_CHAR_PATTERN.test(raw)) {
                        field.onChange(raw)
                        return
                      }

                      field.onChange(
                        raw.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS),
                      )
                    }}
                    className={isPhone ? "pl-20" : ""}
                    required
                    autoComplete="username"
                  />
                </div>
              )}
            />
            {errors.emailOrPhone?.message && (
              <p className="text-destructive text-sm">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.signin.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={8}
                className="pr-10"
                autoComplete="current-password"
                {...register("password", {
                  onChange: () => setFormError(""),
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || isLocked || (!isValid && submitAttempted)}
            onClick={() => setSubmitAttempted(true)}
          >
            {isLocked
              ? t("auth.rateLimit", {
                  remainingSeconds: String(remainingSeconds),
                })
              : loading
                ? t("common.loading")
                : t("auth.signin.submit")}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary text-sm hover:underline"
            >
              {t("auth.signin.forgotPassword")}
            </button>
          </div>

          <GoogleButton onClick={handleGoogleSignIn} />

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleSignUp}
              className="text-primary hover:underline"
            >
              {t("auth.signin.noAccount")}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SignInDialog
