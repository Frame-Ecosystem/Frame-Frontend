"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { Badge } from "@/app/_components/ui/badge"
import { toast } from "sonner"
import { apiClient, serviceSuggestionsService } from "@/app/_services"
import { isAuthError } from "@/app/_services/api"
import { useAuth } from "@/app/_auth"
import type { ServiceSuggestion } from "@/app/_types"
import { validateSuggestionForm } from "./_lib/validate-suggestion"
import { SuggestServiceSkeleton } from "@/app/_components/skeletons/services"
import { useTranslation } from "@/app/_i18n"

export default function SuggestService() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userSuggestions, setUserSuggestions] = useState<ServiceSuggestion[]>(
    [],
  )
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    estimatedPrice: "",
    estimatedDuration: "",
    targetGender: "unisex",
    // category removed per schema
  })

  const fetchUserSuggestions = async () => {
    if (!user || user.type !== "lounge") return

    setLoadingSuggestions(true)
    try {
      const loungeId = user._id
      const suggestions =
        await serviceSuggestionsService.getMySuggestions(loungeId)
      setUserSuggestions(suggestions)
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to fetch suggestions:", error)
      toast.error(t("services.suggest.loadFailed"))
      setUserSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleViewSuggestions = () => {
    setShowSuggestions(true)
    fetchUserSuggestions()
  }

  const handleBackToForm = () => {
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateSuggestionForm(form)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const trimmedName = form.name.trim()
    const trimmedDescription = form.description.trim()

    try {
      const payload: any = {
        name: trimmedName,
        description: trimmedDescription,
      }
      if (form.estimatedPrice)
        payload.estimatedPrice = Number(form.estimatedPrice)
      if (form.estimatedDuration)
        payload.estimatedDuration = Number(form.estimatedDuration)
      if (form.targetGender) payload.targetGender = form.targetGender
      if (user && user.type === "lounge") {
        payload.loungeId = user._id
      }

      await apiClient.post("/v1/service-suggestions", payload)
      toast.success(t("services.suggest.submitted"))
      setShowSuggestions(true)
      fetchUserSuggestions()
      setForm({
        name: "",
        description: "",
        estimatedPrice: "",
        estimatedDuration: "",
        targetGender: "unisex",
      })
    } catch (err) {
      if (isAuthError(err)) return
      console.error("Failed to submit suggestion", err)

      // Handle specific backend error messages
      if (err instanceof Error) {
        const error = err as any
        if (error.code === "VALIDATION_ERROR" || error.code === "BAD_REQUEST") {
          toast.error(error.message || "Invalid data provided")
        } else if (
          error.code === "DUPLICATE_ERROR" ||
          error.code === "CONFLICT"
        ) {
          toast.error(error.message || "This service suggestion already exists")
        } else if (
          error.code === "UNAUTHORIZED" ||
          error.code === "FORBIDDEN"
        ) {
          toast.error(
            error.message || "You are not authorized to submit suggestions",
          )
        } else if (error.code === "RATE_LIMITED") {
          toast.error(
            error.message ||
              "Too many suggestions submitted. Please try again later",
          )
        } else {
          toast.error(error.message || t("services.suggest.submitFailed"))
        }
      } else {
        toast.error(t("services.suggest.submitFailed"))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          {t("services.suggest.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {showSuggestions
              ? t("services.suggest.myTitle")
              : t("services.suggest.title")}
          </DialogTitle>
          <DialogDescription>
            {showSuggestions
              ? t("services.suggest.myDesc")
              : t("services.suggest.desc")}
          </DialogDescription>
        </DialogHeader>

        {showSuggestions ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm"></p>
              <Button onClick={handleBackToForm} variant="default" size="sm">
                {t("services.suggest.suggestNew")}
              </Button>
            </div>

            {loadingSuggestions ? (
              <SuggestServiceSkeleton count={2} />
            ) : userSuggestions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {t("services.suggest.noSuggestions")}
                </p>
                <Button
                  onClick={handleBackToForm}
                  className="mt-4"
                  variant="default"
                >
                  {t("services.suggest.suggestFirst")}
                </Button>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {userSuggestions.map((suggestion: ServiceSuggestion) => (
                  <div
                    key={suggestion._id}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{suggestion.name}</h3>
                      <Badge
                        variant={
                          suggestion.status === "implemented"
                            ? "default"
                            : suggestion.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {suggestion.status || "pending"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {suggestion.description}
                    </p>
                    <div className="text-muted-foreground flex gap-4 text-xs">
                      {suggestion.estimatedPrice && (
                        <span>
                          {t("services.suggest.price")}{" "}
                          {suggestion.estimatedPrice} dt
                        </span>
                      )}
                      {suggestion.estimatedDuration && (
                        <span>
                          {t("services.suggest.durationLabel")}{" "}
                          {suggestion.estimatedDuration} min
                        </span>
                      )}
                      {suggestion.targetGender && (
                        <span>
                          {t("services.suggest.gender")}{" "}
                          {suggestion.targetGender}
                        </span>
                      )}
                    </div>
                    {(suggestion as any).adminNote && (
                      <p className="text-muted-foreground bg-muted rounded p-2 text-xs">
                        <strong>{t("services.suggest.adminNote")}</strong>{" "}
                        {(suggestion as any).adminNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Button
                onClick={handleViewSuggestions}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                {t("services.suggest.viewMy")}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="s-name">{t("services.suggest.name")}</Label>
                <Input
                  id="s-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="s-desc">
                  {t("services.suggest.description")}
                </Label>
                <Textarea
                  id="s-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="s-price">
                    {t("services.suggest.priceLabel")}
                  </Label>
                  <Input
                    id="s-price"
                    type="number"
                    value={form.estimatedPrice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        estimatedPrice: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="s-duration">
                    {t("services.suggest.duration")}
                  </Label>
                  <Input
                    id="s-duration"
                    type="number"
                    value={form.estimatedDuration}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        estimatedDuration: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="s-target">
                  {t("services.suggest.targetGender")}
                </Label>
                <select
                  id="s-target"
                  value={form.targetGender}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetGender: e.target.value,
                    }))
                  }
                  className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">{t("services.gender.none")}</option>
                  <option value="men">{t("services.gender.men")}</option>
                  <option value="women">{t("services.gender.women")}</option>
                  <option value="unisex">{t("services.gender.unisex")}</option>
                  <option value="kids">{t("services.gender.kids")}</option>
                </select>
              </div>
              {/* category removed per schema */}
              {/* estimatedPrice, estimatedDuration, targetGender removed per schema */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="success">
                  {t("services.suggest.submitSuggestion")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
