"use client"

import { useState, useEffect } from "react"
import { ImageSelector } from "./ImageSelector"
import { AgentServiceList } from "./agent-service-list"
import {
  validateAgentForm,
  validateAgentNameOnBlur,
  validatePasswordOnBlur,
  getPasswordStrength,
} from "./validate-agent-form"
import { useAgent } from "../../../_providers/agent"
import { isAuthError } from "../../../_services/api"
import { useAuth } from "@/app/_auth"
import { Agent, CreateAgentDto, UpdateAgentDto } from "../../../_types"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog"
import { Switch } from "../../ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { useToast } from "../../ui/use-toast"
import { clientService } from "../../../_services"

interface AgentFormProps {
  isOpen: boolean

  onOpenChange: (open: boolean) => void
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
  >(() =>
    agent
      ? {
          agentName: agent.agentName,
          password: "",
          isBlocked: agent.isBlocked,
          profileImage: undefined,
          idLoungeService: agent.idLoungeService ?? [],
        }
      : {
          agentName: "",
          password: "",
          isBlocked: false,
          profileImage: "",
          loungeId: "",
          idLoungeService: [],
        },
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageSelected, setImageSelected] = useState(false)
  const [loungeServices, setLoungeServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Reset form data when dialog opens or agent changes
  useEffect(() => {
    if (!isOpen) return
    setErrors({})
    setImageSelected(false)
    if (agent) {
      setFormData({
        agentName: agent.agentName,
        password: "",
        isBlocked: agent.isBlocked,
        profileImage: undefined,
        idLoungeService: agent.idLoungeService ?? [],
      })
    } else {
      setFormData({
        agentName: "",
        password: "",
        isBlocked: false,
        profileImage: "",
        loungeId: "",
        idLoungeService: [],
      })
    }
  }, [isOpen, agent])

  useEffect(() => {
    if (isOpen && isAdmin && lounges.length === 0) fetchLounges()
  }, [isOpen, isAdmin, lounges.length, fetchLounges])

  useEffect(() => {
    const fetchLoungeServices = async () => {
      // Determine the loungeId to use
      let loungeId: string | undefined
      if (agent) {
        // Edit mode — resolve loungeId from the agent
        loungeId =
          typeof agent.loungeId === "object"
            ? agent.loungeId._id
            : agent.loungeId
      } else if (isAdmin && formData.loungeId) {
        loungeId = formData.loungeId
      } else if (!isAdmin) {
        loungeId = user?._id
      }

      if (loungeId) {
        setLoadingServices(true)
        try {
          const services = await clientService.getLoungeServicesById(loungeId)
          setLoungeServices(services.filter((s) => s.isActive !== false))
          // Only reset selection when creating and the lounge changes
          if (!agent && isAdmin)
            setFormData((prev) => ({ ...prev, idLoungeService: [] }))
        } catch (error) {
          if (isAuthError(error)) return
          setLoungeServices([])
          if (!agent && isAdmin)
            setFormData((prev) => ({ ...prev, idLoungeService: [] }))
        } finally {
          setLoadingServices(false)
        }
      } else {
        setLoungeServices([])
        if (!agent && isAdmin)
          setFormData((prev) => ({ ...prev, idLoungeService: [] }))
      }
    }
    fetchLoungeServices()
  }, [formData.loungeId, isAdmin, agent, user, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateAgentForm(formData, agent, isAdmin)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      if (agent) {
        const updateData: UpdateAgentDto = {
          agentName: formData.agentName,
          ...(formData.password && { password: formData.password }),
          isBlocked: formData.isBlocked,
          ...(imageSelected &&
            formData.profileImage && { profileImage: formData.profileImage }),
          idLoungeService: formData.idLoungeService ?? [],
        }
        await updateAgent(agent._id!, updateData)
        toast({ title: "Success", description: "Agent updated successfully" })
      } else {
        const createData: CreateAgentDto = {
          agentName: formData.agentName!,
          password: formData.password!,
          loungeId: isAdmin ? formData.loungeId : user?._id,
          ...(formData.idLoungeService && {
            idLoungeService: formData.idLoungeService,
          }),
          isBlocked: formData.isBlocked || false,
          ...(formData.profileImage?.trim() && {
            profileImage: formData.profileImage,
          }),
        }
        await createAgent(createData)
        toast({ title: "Success", description: "Agent created successfully" })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      if (isAuthError(error)) return
      if (error.code === "AGENT_NAME_EXISTS") {
        setErrors({
          agentName:
            "An agent with this name already exists. Please choose a different name.",
        })
        clearError()
        return
      }
      toast({
        title: "Error",
        description: error.message || "Failed to save agent",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{agent ? "Edit Agent" : "Create New Agent"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent Image */}
          <div className="space-y-2">
            <Label>Agent Image</Label>
            <ImageSelector
              onImageSelect={(img: string) => {
                handleInputChange("profileImage", img)
                setImageSelected(true)
              }}
              currentImage={agent?.profileImage}
              placeholder="Select agent image"
            />
            <p className="text-muted-foreground text-xs">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
            </p>
            {errors.profileImage && (
              <p className="text-destructive text-sm">{errors.profileImage}</p>
            )}
          </div>

          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name *</Label>
            <div className="relative">
              <Input
                id="agentName"
                value={formData.agentName || ""}
                onChange={(e) => handleInputChange("agentName", e.target.value)}
                onBlur={() => {
                  const err = validateAgentNameOnBlur(formData.agentName)
                  setErrors((prev) => ({ ...prev, agentName: err }))
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
                const err = validatePasswordOnBlur(formData.password)
                if (err) setErrors((prev) => ({ ...prev, password: err }))
              }}
              placeholder={agent ? "Enter new password" : "Enter password"}
              className={errors.password ? "border-destructive" : ""}
            />
            {formData.password && (
              <div className="text-muted-foreground text-xs">
                Password strength: {getPasswordStrength(formData.password)}
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
                onValueChange={(v) => handleInputChange("loungeId", v)}
              >
                <SelectTrigger
                  className={errors.loungeId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Choose a lounge" />
                </SelectTrigger>
                <SelectContent>
                  {lounges.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.loungeTitle ||
                        l.firstName + " " + (l.lastName || "") ||
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

          {/* Lounge Services */}
          <AgentServiceList
            services={loungeServices}
            selectedIds={formData.idLoungeService || []}
            loading={loadingServices}
            isAdmin={isAdmin}
            onChange={(ids) => handleInputChange("idLoungeService", ids)}
            error={errors.idLoungeService}
          />

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
  )
}
