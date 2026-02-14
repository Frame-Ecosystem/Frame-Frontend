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
import { useAuth } from "../../_providers/auth"
import type { ServiceSuggestion } from "../../_types"

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

    // Name validation
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      toast.error("Service name is required")
      return
    }
    if (trimmedName.length < 2) {
      toast.error("Service name must be at least 2 characters long")
      return
    }
    if (trimmedName.length > 100) {
      toast.error("Service name must be less than 100 characters")
      return
    }
    // Check for potentially harmful characters
    if (/[<>\"'&]/.test(trimmedName)) {
      toast.error("Service name contains invalid characters")
      return
    }

    // Description validation
    const trimmedDescription = form.description.trim()
    if (!trimmedDescription) {
      toast.error("Description is required")
      return
    }
    if (trimmedDescription.length < 10) {
      toast.error("Description must be at least 10 characters long")
      return
    }
    if (trimmedDescription.length > 500) {
      toast.error("Description must be less than 500 characters")
      return
    }
    // Check for potentially harmful characters
    if (/[<>\"'&]/.test(trimmedDescription)) {
      toast.error("Description contains invalid characters")
      return
    }

    // Estimated Price validation (now required)
    if (!form.estimatedPrice || !form.estimatedPrice.trim()) {
      toast.error("Estimated price is required")
      return
    }
    const price = parseFloat(form.estimatedPrice)
    if (isNaN(price) || price < 0) {
      toast.error("Estimated price must be a non-negative number")
      return
    }
    if (price > 1000000) {
      // 1 million dt max
      toast.error("Estimated price cannot exceed 1,000,000 dt")
      return
    }
    // Check for reasonable decimal places (max 2)
    if (!/^\d+(\.\d{1,2})?$/.test(form.estimatedPrice)) {
      toast.error("Estimated price can have at most 2 decimal places")
      return
    }

    // Estimated Duration validation (now required)
    if (!form.estimatedDuration || !form.estimatedDuration.trim()) {
      toast.error("Estimated duration is required")
      return
    }
    const duration = parseInt(form.estimatedDuration)
    if (isNaN(duration) || duration <= 0) {
      toast.error("Estimated duration must be a positive whole number")
      return
    }
    if (duration > 1440) {
      // 24 hours max
      toast.error("Estimated duration cannot exceed 24 hours (1440 minutes)")
      return
    }
    // Ensure it's a whole number
    if (!Number.isInteger(Number(form.estimatedDuration))) {
      toast.error("Estimated duration must be a whole number")
      return
    }

    // Target Gender validation (now required)
    if (!form.targetGender) {
      toast.error("Target gender is required")
      return
    }
    if (!["men", "women", "unisex", "kids"].includes(form.targetGender)) {
      toast.error("Invalid target gender selected")
      return
    }

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
        <Button
          type="button"
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
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
              <Button
                onClick={handleBackToForm}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                Suggest New Service
              </Button>
            </div>

            {loadingSuggestions ? (
              <div className="py-8 text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">
                  Loading your suggestions...
                </p>
              </div>
            ) : userSuggestions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  You haven&apos;t submitted any service suggestions yet.
                </p>
                <Button
                  onClick={handleBackToForm}
                  className="mt-4 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  variant="outline"
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
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                >
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
