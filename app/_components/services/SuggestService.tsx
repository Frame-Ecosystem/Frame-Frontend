"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { apiClient, serviceSuggestionsService } from "../../_services"
import { isAuthError } from "../../_services/api"
import { useAuth } from "../../_providers/auth"
import type { ServiceSuggestion } from "../../_types"
import { validateSuggestionForm } from "./_lib/validate-suggestion"

export default function SuggestService() {
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
      toast.error("Failed to load your suggestions")
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
      toast.success(
        "Service suggestion submitted successfully! It will be reviewed by an administrator and added to available services once approved.",
      )
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
          toast.error(error.message || "Failed to submit suggestion")
        }
      } else {
        toast.error("Failed to submit suggestion")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="default">
          Suggest a service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[100vh] overflow-y-auto md:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {showSuggestions
              ? "My Service Suggestions"
              : "Suggest a New Service"}
          </DialogTitle>
          <DialogDescription>
            {showSuggestions
              ? "Track the status of your service suggestions"
              : "Submit a new service suggestion for review by administrators"}
          </DialogDescription>
        </DialogHeader>

        {showSuggestions ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm"></p>
              <Button onClick={handleBackToForm} variant="default" size="sm">
                Suggest New Service
              </Button>
            </div>

            {loadingSuggestions ? (
              <div className="space-y-3 py-8">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-primary/10 h-8 w-8 animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-primary/10 h-4 w-40 animate-pulse rounded" />
                      <div className="bg-primary/10 h-3 w-24 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userSuggestions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  You haven&apos;t submitted any service suggestions yet.
                </p>
                <Button
                  onClick={handleBackToForm}
                  className="mt-4"
                  variant="default"
                >
                  Suggest Your First Service
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
                        <span>Price: {suggestion.estimatedPrice} dt</span>
                      )}
                      {suggestion.estimatedDuration && (
                        <span>
                          Duration: {suggestion.estimatedDuration} min
                        </span>
                      )}
                      {suggestion.targetGender && (
                        <span>Gender: {suggestion.targetGender}</span>
                      )}
                    </div>
                    {(suggestion as any).adminNote && (
                      <p className="text-muted-foreground bg-muted rounded p-2 text-xs">
                        <strong>Admin note:</strong>{" "}
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
                View My Suggestions
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="s-name">Name *</Label>
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
                <Label htmlFor="s-desc">Description *</Label>
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
                  <Label htmlFor="s-price"> Price (dt) *</Label>
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
                  <Label htmlFor="s-duration">Duration (minutes) *</Label>
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
                <Label htmlFor="s-target">Target Gender *</Label>
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
                  <option value="">No target</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
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
                  Cancel
                </Button>
                <Button type="submit" variant="success">
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
