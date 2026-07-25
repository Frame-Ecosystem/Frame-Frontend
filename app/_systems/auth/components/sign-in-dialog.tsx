"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { DialogTitle } from "@/app/_components/ui/dialog"
import openGoogleOAuthPopup, {
  handleGoogleAuthResult,
} from "../lib/google-popup"
import { getLoginRedirectPath } from "@/app/_lib/profile"
import { useAuth, getUserDisplayName, getUserInitials } from "@/app/_auth"
import { useSignIn } from "@/app/_hooks/queries"
import GoogleButton from "./google-button"
import { mapAuthError } from "../lib/error-mapper"
import { useAuthRateLimit } from "../hooks/use-rate-limit"
import { useTranslation } from "@/app/_i18n"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import type { User } from "@/app/_types"

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
  isCheckingSession?: boolean
  sessionUser?: User | null
  onContinueSession?: () => void | Promise<void>
  onSignInDifferent?: () => void
}

const SignInDialog = ({
  onSuccess,
  onClose,
  onOpenSignUpFlow,
  isCheckingSession = false,
  sessionUser = null,
  onContinueSession,
  onSignInDifferent,
}: SignInDialogProps) => {
  const router = useRouter()
  const { setAuth } = useAuth()
  const signInMutation = useSignIn()
  const { t, isRTL } = useTranslation()

  const [loading, setLoading] = useState(false)
  const [continuingSession, setContinuingSession] = useState(false)
  const [formError, setFormError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, recordSuccess } =
    useAuthRateLimit()

  const handleContinueSession = async () => {
    setContinuingSession(true)
    try {
      await onContinueSession?.()
      onSuccess?.()
    } finally {
      setContinuingSession(false)
    }
  }

  const handleSignInDifferent = () => {
    setFormError("")
    setSubmitAttempted(false)
    onSignInDifferent?.()
  }

  const signInSchema = useMemo(
    () =>
      z.object({
        emailOrPhone: z
          .string()
          .min(1, t("auth.signin.validationEmailOrPhoneRequired"))
          .refine(isValidEmailOrPhone, {
            message: t("auth.signin.validationEmailOrPhoneInvalid"),
          }),
        password: z
          .string()
          .min(1, t("auth.signin.validationPasswordRequired"))
          .min(8, t("auth.signin.validationPasswordMin")),
      }),
    [t],
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
    <div dir="ltr" className="flex flex-col items-center">
      {/* Header — centered for both Latin and Arabic */}
      <div className="w-full text-center">
        <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("auth.signin.title")}
        </DialogTitle>
      </div>

      <div className="mt-8 w-full space-y-5">
        {/* Continue with Session Banner */}
        {!isCheckingSession && sessionUser && (
          <div className="bg-muted/40 border-border/60 space-y-3 rounded-xl border p-4 backdrop-blur-sm">
            <p className="text-muted-foreground text-center text-xs">
              {t("auth.signin.existingSessionFound")}
            </p>
            <Button
              onClick={handleContinueSession}
              disabled={continuingSession}
              className="h-11 w-full rounded-lg text-sm font-medium transition-all duration-200"
              variant="default"
            >
              {continuingSession && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Avatar className="mr-2 h-5 w-5">
                {sessionUser?.profileImage &&
                  typeof sessionUser.profileImage === "string" && (
                    <AvatarImage src={sessionUser.profileImage} />
                  )}
                <AvatarFallback className="text-xs">
                  {getUserInitials(sessionUser)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {t("auth.signin.continueAs", {
                  name: getUserDisplayName(sessionUser),
                })}
              </span>
            </Button>
            <Button
              onClick={handleSignInDifferent}
              disabled={continuingSession}
              className="h-10 w-full rounded-lg text-xs font-medium"
              variant="outline"
              size="sm"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              {t("auth.signin.signInDifferent")}
            </Button>
          </div>
        )}

        {/* Sign-in Form */}
        {!sessionUser && (
          <>
            {isCheckingSession && (
              <div className="bg-muted/40 border-border/60 flex items-center justify-center gap-2 rounded-xl border py-3 backdrop-blur-sm">
                <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                <span className="text-muted-foreground text-xs">
                  {t("auth.signin.checkingSession")}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit, () => setSubmitAttempted(true))}
              className="space-y-4"
            >
              {/* Email / Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="emailOrPhone"
                  className={`text-foreground/80 text-xs font-medium tracking-wider uppercase ${isRTL ? "text-right" : ""}`}
                >
                  {t("auth.signin.emailOrPhone")}
                </Label>
                <Controller
                  control={control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <div className="relative">
                      {isPhone && (
                        <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1.5 text-sm">
                          <span className="font-medium">+216</span>
                          <span className="bg-muted/80 text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase">
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

                          if (
                            raw.includes("@") ||
                            EMAIL_CHAR_PATTERN.test(raw)
                          ) {
                            field.onChange(raw)
                            return
                          }

                          field.onChange(
                            raw.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS),
                          )
                        }}
                        className={`border-border/70 bg-background/50 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-lg text-sm transition-all duration-200 focus:ring-2 ${isRTL ? "text-right placeholder:text-right" : ""} ${isPhone ? "pl-20" : ""}`}
                        required
                        autoComplete="username"
                      />
                    </div>
                  )}
                />
                {errors.emailOrPhone?.message && (
                  <p className="text-destructive flex items-center gap-1.5 text-xs">
                    {errors.emailOrPhone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className={`text-foreground/80 text-xs font-medium tracking-wider uppercase ${isRTL ? "text-right" : ""}`}
                  >
                    {t("auth.signin.password")}
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-primary/80 hover:text-primary text-xs font-medium transition-colors duration-200"
                  >
                    {t("auth.signin.forgotPassword")}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={`border-border/70 bg-background/50 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 h-11 rounded-lg text-sm transition-all duration-200 focus:ring-2 ${isRTL ? "pl-10 text-right placeholder:text-right" : "pr-10"}`}
                    autoComplete="current-password"
                    {...register("password", {
                      onChange: () => setFormError(""),
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`text-muted-foreground hover:text-foreground absolute inset-y-0 flex items-center transition-colors duration-200 ${isRTL ? "left-0 pl-3" : "right-0 pr-3"}`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="text-destructive flex items-center gap-1.5 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Form-level error */}
              {formError && (
                <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2.5 text-xs">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="h-11 w-full rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
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

              <GoogleButton onClick={handleGoogleSignIn} />

              {/* Sign up link */}
              <p className="text-muted-foreground text-center text-sm">
                {t("auth.signin.dontHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
                >
                  {t("auth.signin.signup")}
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default SignInDialog
