"use client"

import { useState, useEffect } from "react"
import { ImageSelector } from "./ImageSelector"
import { useAgent } from "../../_providers/agent"
import { isAuthError } from "../../_services/api"
import { useAuth } from "../../_providers/auth"
import { Agent, CreateAgentDto, UpdateAgentDto } from "../../_types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Switch } from "../ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { useToast } from "../ui/use-toast"
import { clientService } from "../../_services"

interface AgentFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void // eslint-disable-line no-unused-vars
  agent?: Agent | null
  onSuccess?: () => void
}

export function AgentForm({
  isOpen,
  onOpenChange,
  agent,
  onSuccess,
}: AgentFormProps) {
  const {
    createAgent,
    updateAgent,
    isAdmin,
    loading,
    clearError,
    lounges,
    fetchLounges,
  } = useAgent()
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<
    | CreateAgentDto
    | (UpdateAgentDto & { loungeId?: string; idLoungeService?: string[] })
  >(() => {
    if (agent) {
      // Edit mode - don't pre-populate profileImage to avoid sending object data
      return {
        agentName: agent.agentName,
        password: "", // Don't pre-fill password for security
        isBlocked: agent.isBlocked,
        profileImage: undefined, // Don't pre-populate - only send when user selects new image
      }
    } else {
      // Create mode
      return {
        agentName: "",
        password: "",
        isBlocked: false,
        profileImage: "",
        loungeId: "",
        idLoungeService: [],
      }
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageSelected, setImageSelected] = useState(false)
  const [loungeServices, setLoungeServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Fetch lounges when form opens for admin users
  useEffect(() => {
    if (isOpen && isAdmin && lounges.length === 0) {
      fetchLounges()
    }
  }, [isOpen, isAdmin, lounges.length, fetchLounges])

  // Fetch lounge services when form opens (for lounges) or when lounge is selected (for admins)
  useEffect(() => {
    const fetchLoungeServices = async () => {
      const shouldFetchServices =
        (!agent && isAdmin && formData.loungeId) || (!agent && !isAdmin)

      if (shouldFetchServices) {
        setLoadingServices(true)
        try {
          // For lounges, use their own lounge ID. For admins, use selected lounge ID
          const loungeId = !isAdmin ? user?._id : formData.loungeId
          if (loungeId) {
            const services = await clientService.getLoungeServicesById(loungeId)
            setLoungeServices(
              services.filter((service) => service.isActive !== false),
            )
            // Clear selected services when lounge changes (only for admins)
            if (isAdmin) {
              setFormData((prev) => ({ ...prev, idLoungeService: [] }))
            }
          }
        } catch (error) {
          if (isAuthError(error)) return
          console.error("Failed to fetch lounge services:", error)
          setLoungeServices([])
          if (isAdmin) {
            setFormData((prev) => ({ ...prev, idLoungeService: [] }))
          }
        } finally {
          setLoadingServices(false)
        }
      } else {
        setLoungeServices([])
        if (isAdmin) {
          setFormData((prev) => ({ ...prev, idLoungeService: [] }))
        }
      }
    }

    fetchLoungeServices()
  }, [formData.loungeId, isAdmin, agent, user, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Agent Name validation (format only, uniqueness checked on backend)
    if (!formData.agentName?.trim()) {
      newErrors.agentName = "Agent name is required"
    } else if (formData.agentName.length < 2) {
      newErrors.agentName = "Agent name must be at least 2 characters"
    } else if (formData.agentName.length > 50) {
      newErrors.agentName = "Agent name must be less than 50 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.agentName.trim())) {
      newErrors.agentName = "Agent name can only contain letters and spaces"
    }

    // Password validation
    if (!agent && !formData.password?.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      }
    }

    // Image validation
    if (formData.profileImage) {
      // Check if it's a valid data URL
      if (!formData.profileImage.startsWith("data:image/")) {
        newErrors.profileImage = "Invalid image format"
      } else {
        // Check file size (assuming base64 is roughly 1.37x larger than binary)
        const sizeInBytes =
          formData.profileImage.length * 0.75 -
          (formData.profileImage.endsWith("==")
            ? 2
            : formData.profileImage.endsWith("=")
              ? 1
              : 0)
        const maxSizeInMB = 5
        if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
          newErrors.profileImage = `Image size must be less than ${maxSizeInMB}MB`
        }
      }
    }

    // Lounge ID validation (admin only, create mode)
    if (isAdmin && !agent) {
      const loungeId = formData.loungeId?.trim()
      if (!loungeId) {
        newErrors.loungeId = "Lounge selection is required"
      }
    }

    // Lounge Services validation (create mode for both admins and lounges)
    if (!agent) {
      const selectedServices = formData.idLoungeService || []
      if (!selectedServices || selectedServices.length === 0) {
        newErrors.idLoungeService =
          "At least one lounge service must be selected"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageSelect = (imageData: string) => {
    setFormData((prev) => ({ ...prev, profileImage: imageData }))
    setImageSelected(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (agent) {
        // Update existing agent
        const updateData: UpdateAgentDto = {
          agentName: formData.agentName,
          ...(formData.password && { password: formData.password }),
          isBlocked: formData.isBlocked,
          ...(imageSelected &&
            formData.profileImage && { profileImage: formData.profileImage }),
        }
        await updateAgent(agent._id!, updateData)
        toast({
          title: "Success",
          description: "Agent updated successfully",
        })
      } else {
        // Create new agent
        const createData: CreateAgentDto = {
          agentName: formData.agentName!,
          password: formData.password!,
          loungeId: isAdmin ? formData.loungeId : user?._id, // Use selected lounge for admin, current user for lounge
          ...(formData.idLoungeService && {
            idLoungeService: formData.idLoungeService,
          }),
          isBlocked: formData.isBlocked || false,
          ...(formData.profileImage &&
            formData.profileImage.trim() && {
              profileImage: formData.profileImage,
            }),
        }
        await createAgent(createData)
        toast({
          title: "Success",
          description: "Agent created successfully",
        })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      if (isAuthError(error)) return
      // Handle specific validation errors
      if (error.code === "AGENT_NAME_EXISTS") {
        setErrors({
          agentName:
            "An agent with this name already exists. Please choose a different name.",
        })
        clearError() // Clear the provider error so it doesn't show on the page
        return
      }

      // Show generic error for other issues
      toast({
        title: "Error",
        description: error.message || "Failed to save agent",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {agent ? "Edit Agent" : "Create New Agent"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agent Image */}
            <div className="space-y-2">
              <Label>Agent Image</Label>
              <ImageSelector
                onImageSelect={handleImageSelect}
                currentImage={agent?.profileImage}
                placeholder="Select agent image"
              />
              <p className="text-muted-foreground text-xs">
                Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
              </p>
              {errors.profileImage && (
                <p className="text-destructive text-sm">
                  {errors.profileImage}
                </p>
              )}
            </div>

            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name *</Label>
              <div className="relative">
                <Input
                  id="agentName"
                  value={formData.agentName || ""}
                  onChange={(e) =>
                    handleInputChange("agentName", e.target.value)
                  }
                  onBlur={() => {
                    // Real-time validation on blur
                    if (formData.agentName?.trim()) {
                      const trimmed = formData.agentName.trim()
                      if (trimmed.length < 2) {
                        setErrors((prev) => ({
                          ...prev,
                          agentName: "Agent name must be at least 2 characters",
                        }))
                      } else if (trimmed.length > 50) {
                        setErrors((prev) => ({
                          ...prev,
                          agentName:
                            "Agent name must be less than 50 characters",
                        }))
                      } else if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
                        setErrors((prev) => ({
                          ...prev,
                          agentName:
                            "Agent name can only contain letters and spaces",
                        }))
                      } else {
                        // Clear any existing validation errors for valid input
                        setErrors((prev) => ({ ...prev, agentName: "" }))
                      }
                    }
                  }}
                  placeholder="Enter agent name"
                  className={
                    errors.agentName ? "border-destructive pr-10" : "pr-10"
                  }
                />
                {formData.agentName && !errors.agentName && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.agentName && (
                <p className="text-destructive flex items-center gap-1 text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {errors.agentName}
                </p>
              )}
              {!errors.agentName && formData.agentName && (
                <p className="text-muted-foreground text-xs">
                  Agent name is available
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {agent ? "(leave empty to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => {
                  // Real-time validation on blur
                  if (formData.password) {
                    if (formData.password.length < 8) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "Password must be at least 8 characters",
                      }))
                    } else if (
                      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        password:
                          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                      }))
                    }
                  }
                }}
                placeholder={agent ? "Enter new password" : "Enter password"}
                className={errors.password ? "border-destructive" : ""}
              />
              {formData.password && (
                <div className="text-muted-foreground text-xs">
                  Password strength:{" "}
                  {formData.password.length >= 8 &&
                  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
                    ? "Strong"
                    : formData.password.length >= 6
                      ? "Medium"
                      : "Weak"}
                </div>
              )}
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            {/* Lounge Selection (Admin only) */}
            {isAdmin && !agent && (
              <div className="space-y-2">
                <Label htmlFor="loungeId">Select Lounge *</Label>
                <Select
                  value={formData.loungeId || ""}
                  onValueChange={(value) =>
                    handleInputChange("loungeId", value)
                  }
                >
                  <SelectTrigger
                    className={errors.loungeId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Choose a lounge" />
                  </SelectTrigger>
                  <SelectContent>
                    {lounges.map((lounge) => (
                      <SelectItem key={lounge._id} value={lounge._id}>
                        {lounge.loungeTitle ||
                          lounge.firstName + " " + (lounge.lastName || "") ||
                          "Unnamed Lounge"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.loungeId && (
                  <p className="text-destructive text-sm">{errors.loungeId}</p>
                )}
              </div>
            )}

            {/* Lounge Services Selection */}
            {!agent && (
              <div className="space-y-2">
                <Label>Select Lounge Services *</Label>
                {loadingServices ? (
                  <div className="text-muted-foreground flex items-center space-x-2">
                    <div className="bg-primary/10 h-4 w-4 animate-pulse rounded-full"></div>
                    <span>Loading services...</span>
                  </div>
                ) : loungeServices.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No active services found{" "}
                    {isAdmin ? "for this lounge" : "for your lounge"}
                  </p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                    {loungeServices.map((service) => (
                      <div
                        key={service._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`service-${service._id}`}
                          checked={(formData.idLoungeService || []).includes(
                            service._id,
                          )}
                          onCheckedChange={(checked) => {
                            const currentServices =
                              formData.idLoungeService || []
                            if (checked) {
                              handleInputChange("idLoungeService", [
                                ...currentServices,
                                service._id,
                              ])
                            } else {
                              handleInputChange(
                                "idLoungeService",
                                currentServices.filter(
                                  (id) => id !== service._id,
                                ),
                              )
                            }
                          }}
                        />
                        <Label
                          htmlFor={`service-${service._id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {service.serviceId?.name ||
                            service.name ||
                            "Unnamed Service"}
                          {service.price && (
                            <span className="text-muted-foreground ml-2">
                              ({service.price} dt)
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {errors.idLoungeService && (
                  <p className="text-destructive text-sm">
                    {errors.idLoungeService}
                  </p>
                )}
              </div>
            )}

            {/* Blocked Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="isBlocked">Blocked Status</Label>
                <p className="text-muted-foreground text-sm">
                  Block this agent to prevent login
                </p>
              </div>
              <Switch
                id="isBlocked"
                checked={formData.isBlocked || false}
                onCheckedChange={(checked) =>
                  handleInputChange("isBlocked", checked)
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="success">
                {loading ? (
                  <>
                    <div className="bg-primary/10 mr-2 h-4 w-4 animate-pulse rounded-full"></div>
                    {agent ? "Updating..." : "Creating..."}
                  </>
                ) : agent ? (
                  "Update Agent"
                ) : (
                  "Create Agent"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
