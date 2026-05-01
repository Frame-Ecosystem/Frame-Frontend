"use client"

import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { useAuth } from "@/app/_auth"
import { useRouter, useSearchParams } from "next/navigation"
import { getLoginRedirectPath } from "@/app/_lib/profile"
import { Check, X, Eye, EyeOff } from "lucide-react"
import { useSignUp } from "@/app/_hooks/queries"
import GoogleButton from "./google-button"
import openGoogleOAuthPopup, {
  handleGoogleAuthResult,
} from "../lib/google-popup"
import { validateSignupPassword } from "../lib/signup-validators"
import { usePasswordRules } from "../hooks/use-password-rules"
import { mapAuthError } from "../lib/error-mapper"
import { useAuthRateLimit } from "../hooks/use-rate-limit"
import { useTranslation } from "@/app/_i18n"

export default function SignUpForm({
  onSuccess,
  selectedType: selectedTypeProp,
  onOpenSignInFlow,
}: {
  onSuccess?: (email?: string) => void
  selectedType?: "client" | "lounge"
  onOpenSignInFlow?: () => void
}) {
  const searchParams = useSearchParams()
  const selectedTypeParam = searchParams?.get("type")?.toLowerCase() || null
  const selectedTypeFromQuery = useMemo<"client" | "lounge" | null>(() => {
    return selectedTypeParam === "client" || selectedTypeParam === "lounge"
      ? (selectedTypeParam as any)
      : null
  }, [selectedTypeParam])
  const selectedType = selectedTypeProp ?? selectedTypeFromQuery

  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, recordSuccess } =
    useAuthRateLimit()
  const { setAuth } = useAuth()
  const router = useRouter()
  const signUpMutation = useSignUp()
  const { t } = useTranslation()

  const signUpSchema = useMemo(
    () =>
      z
        .object({
          phoneNumber: z
            .string()
            .min(1, "Phone number is required")
            .regex(/^\d{8}$/, "Phone number must be exactly 8 digits"),
          email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
          password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must not exceed 128 characters"),
          confirmPassword: z
            .string()
            .min(1, "Confirm password is required")
            .min(8, "Password must be at least 8 characters"),
        })
        .superRefine(({ password, confirmPassword }, ctx) => {
          if (!password || !confirmPassword) return

          const validationError = validateSignupPassword(
            password,
            confirmPassword,
          )
          if (!validationError) return

          if (validationError === "Passwords do not match") {
            ctx.addIssue({
              code: "custom",
              path: ["confirmPassword"],
              message: validationError,
            })
            return
          }

          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: validationError,
          })
        }),
    [],
  )

  type SignUpValues = z.infer<typeof signUpSchema>

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const { rules } = usePasswordRules(password, confirmPassword)

  const onSubmit = async (values: SignUpValues) => {
    if (isLocked) return
    setFormError("")
    setLoading(true)

    try {
      if (!selectedType) {
        setFormError("Please select account type (Client or Lounge)")
        return
      }

      setEmailSending(true)

      const response = await signUpMutation.mutateAsync({
        email: values.email || undefined,
        phoneNumber: values.phoneNumber,
        password: values.password,
        type: selectedType,
      })

      if (response) {
        recordSuccess()
        // Keep emailSending true briefly to show success state
        setTimeout(() => {
          setEmailSending(false)
          onSuccess?.(values.email)
        }, 1000)
      } else {
        setEmailSending(false)
      }
    } catch (err) {
      console.error("Signup error:", err)
      const mapped = mapAuthError(err, "signup")
      recordFailure(mapped.retryAfter)
      setFormError(mapped.formError)

      if (mapped.fieldErrors) {
        for (const [field, message] of Object.entries(mapped.fieldErrors)) {
          if (
            field === "email" ||
            field === "phoneNumber" ||
            field === "password" ||
            field === "confirmPassword"
          ) {
            setError(field, { type: "server", message })
          }
        }
      }

      setEmailSending(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setFormError("")
    setLoading(true)

    if (!selectedType) {
      setFormError("Please select account type (Client or Lounge)")
      setLoading(false)
      return
    }

    try {
      const result = await openGoogleOAuthPopup({
        url: `/v1/auth/google/signup?type=${selectedType}`,
        mode: "signup",
      })
      await handleGoogleAuthResult(result, {
        setAuth,
        onSuccess,
        redirect: (path) => router.push(path),
        getRedirectPath: getLoginRedirectPath,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => setSubmitAttempted(true))}
      className="space-y-1.5"
    >
      <div className="space-y-1">
        <Label htmlFor="phoneNumber">{t("auth.signup.phoneNumber")}</Label>
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-1 text-sm">
            <span className="font-medium">+216</span>
            <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 text-xs">
              TN
            </span>
          </div>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="50123456"
                value={field.value}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, "")
                  const limitedValue = numericValue.slice(0, 8)
                  setFormError("")
                  field.onChange(limitedValue)
                }}
                className="pl-20"
                required
                autoComplete="tel"
              />
            )}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {t("auth.signup.phoneHint")}
        </p>
        {errors.phoneNumber?.message && (
          <p className="text-destructive text-sm">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{t("auth.signup.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.signup.emailPlaceholder")}
          required
          autoComplete="email"
          {...register("email", {
            onChange: () => setFormError(""),
          })}
        />
        {errors.email?.message && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">{t("auth.signup.password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            minLength={8}
            className="pr-10"
            autoComplete="new-password"
            {...register("password", {
              onChange: () => setFormError(""),
            })}
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
        <div>
          <ul className="space-y-0 text-xs">
            {(() => {
              const filtered = rules.filter(
                (rule) => rule.id !== "maxLength" && rule.id !== "match",
              )
              const minLength = filtered.find((r) => r.id === "minLength")
              const digit = filtered.find((r) => r.id === "digit")
              const rest = filtered.filter(
                (r) => r.id !== "minLength" && r.id !== "digit",
              )

              const renderRule = (rule: (typeof filtered)[number]) => (
                <span
                  className={`inline-flex items-center gap-1 ${rule.met ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
                >
                  {rule.met ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <X className="h-3.5 w-3.5" aria-hidden />
                  )}
                  <span>{rule.label}</span>
                </span>
              )

              return (
                <>
                  {minLength && digit && (
                    <li className="flex items-center gap-3">
                      {renderRule(minLength)}
                      {renderRule(digit)}
                    </li>
                  )}
                  {rest.map((rule) => (
                    <li key={rule.id} aria-label={rule.label}>
                      {renderRule(rule)}
                    </li>
                  ))}
                </>
              )
            })()}
          </ul>
        </div>
        {errors.password?.message && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">
          {t("auth.signup.confirmPassword")}
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
              onChange: () => setFormError(""),
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
        {(() => {
          const matchRule = rules.find((r) => r.id === "match")
          if (!matchRule) return null
          return (
            <p
              className={`text-xs ${matchRule.met ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
            >
              <span className="inline-flex items-center gap-2">
                {matchRule.met ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden />
                )}
                <span>{matchRule.label}</span>
              </span>
            </p>
          )
        })()}
        {errors.confirmPassword?.message && (
          <p className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {formError && <p className="text-destructive text-sm">{formError}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          emailSending ||
          isLocked ||
          !selectedType ||
          (!isValid && submitAttempted)
        }
        onClick={() => setSubmitAttempted(true)}
      >
        {isLocked
          ? t("auth.rateLimit", { remainingSeconds: String(remainingSeconds) })
          : emailSending
            ? t("auth.signup.sendingVerification")
            : loading
              ? t("auth.signup.creatingAccount")
              : t("auth.signup.submit")}
      </Button>

      <GoogleButton
        onClick={handleGoogleSignUp}
        disabled={loading || emailSending || !selectedType}
      />

      {/* Sign in link: redirect to sign-in dialog */}
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => {
            setFormError("")
            // Close signup flow and open sign-in dialog if provided
            if (onOpenSignInFlow) {
              onOpenSignInFlow()
            } else {
              // Fallback: navigate to home page (where sign-in dialog can be opened)
              router.push("/")
            }
          }}
          className="text-primary hover:underline"
        >
          {t("auth.signup.hasAccount")}
        </button>
      </div>
    </form>
  )
}
