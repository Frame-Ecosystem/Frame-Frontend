"use client"

import { useRef, useState } from "react"
import {
  Camera,
  CheckCircle2,
  Circle,
  Loader2,
  Mail,
  Phone,
  Building2,
  Tag,
} from "lucide-react"

import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Label } from "@/app/_components/ui/label"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar"
import { Separator } from "@/app/_components/ui/separator"
import {
  useMyAgentProfile,
  useUpdateMyAgentProfile,
  useUploadMyAgentImage,
} from "@/app/_systems/user/hooks/useAgents"
import { AgentAvailabilityToggle } from "@/app/_systems/user/components/agents/availability-toggle"
import type {
  Agent,
  AgentLounge,
  UpdateMyAgentProfileDto,
} from "@/app/_systems/user/types/agent"
import { cn } from "@/app/_lib/utils"
import { toast } from "sonner"

// ── Constants ───────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

// ── Helpers ─────────────────────────────────────────────────────

function getProfileImageUrl(image: Agent["profileImage"]): string | undefined {
  if (!image) return undefined
  if (typeof image === "string") return image
  return image.url
}

function getInitials(agent?: Agent | null): string {
  if (!agent) return "A"
  const fromName = [agent.firstName, agent.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()
  const source = agent.agentName?.trim() || fromName || agent.email || "Agent"
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
}

function getLoungeLabel(parentLounge: Agent["parentLounge"]): string {
  if (!parentLounge) return "—"
  if (typeof parentLounge === "string") return parentLounge
  return (parentLounge as AgentLounge).loungeTitle || parentLounge.email || "—"
}

// ── Page ────────────────────────────────────────────────────────

export default function AgentProfilePage() {
  const profileQuery = useMyAgentProfile()
  const updateProfile = useUpdateMyAgentProfile()
  const uploadImage = useUploadMyAgentImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const agent = profileQuery.data

  // Local form state — hydrated from `agent` once it loads, and reset
  // whenever a different agent is loaded. Done via the React-recommended
  // "adjust state during render on prop change" idiom rather than an
  // effect (avoids cascading renders).
  const [form, setForm] = useState<UpdateMyAgentProfileDto>({
    agentName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    bio: "",
  })
  const [hydratedFromAgentId, setHydratedFromAgentId] = useState<string | null>(
    null,
  )

  if (agent && agent._id !== hydratedFromAgentId) {
    setHydratedFromAgentId(agent._id)
    setForm({
      agentName: agent.agentName ?? "",
      firstName: agent.firstName ?? "",
      lastName: agent.lastName ?? "",
      phoneNumber: agent.phoneNumber ?? "",
      bio: agent.bio ?? "",
    })
  }

  const isLoadingProfile = profileQuery.isLoading && !agent

  // ── Derived ────────────────────────────────────────────────────

  const isDirty =
    !!agent &&
    ((form.agentName ?? "") !== (agent.agentName ?? "") ||
      (form.firstName ?? "") !== (agent.firstName ?? "") ||
      (form.lastName ?? "") !== (agent.lastName ?? "") ||
      (form.phoneNumber ?? "") !== (agent.phoneNumber ?? "") ||
      (form.bio ?? "") !== (agent.bio ?? ""))

  const available = !!agent?.acceptQueueBooking

  // ── Handlers ───────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDirty) return
    // Send only changed fields, trimmed.
    const dto: UpdateMyAgentProfileDto = {}
    ;(Object.keys(form) as (keyof UpdateMyAgentProfileDto)[]).forEach((k) => {
      const v = (form[k] ?? "").trim()
      if (v !== ((agent?.[k] as string | undefined) ?? "")) {
        dto[k] = v
      }
    })
    if (Object.keys(dto).length === 0) return
    updateProfile.mutate(dto)
  }

  const handleResetForm = () => {
    if (!agent) return
    setForm({
      agentName: agent.agentName ?? "",
      firstName: agent.firstName ?? "",
      lastName: agent.lastName ?? "",
      phoneNumber: agent.phoneNumber ?? "",
      bio: agent.bio ?? "",
    })
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // allow selecting the same file again later
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be smaller than 5 MB.")
      return
    }
    uploadImage.mutate(file)
  }

  // ── Render ────────────────────────────────────────────────────

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (profileQuery.isError || !agent) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load your profile.
        </p>
        <Button variant="outline" onClick={() => profileQuery.refetch()}>
          Try again
        </Button>
      </Card>
    )
  }

  const profileImageUrl = getProfileImageUrl(agent.profileImage)
  const initials = getInitials(agent)

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          My profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage how clients see you and control your availability.
        </p>
      </header>

      {/* Identity card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div className="relative shrink-0 self-center sm:self-start">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              {profileImageUrl ? (
                <AvatarImage
                  src={profileImageUrl}
                  alt={agent.agentName ?? "Agent"}
                />
              ) : null}
              <AvatarFallback className="text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              aria-label="Change profile image"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className={cn(
                "bg-primary text-primary-foreground ring-background absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full shadow ring-2 transition",
                "hover:scale-105 disabled:opacity-60",
              )}
            >
              {uploadImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleFilePick}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                {agent.agentName ||
                  [agent.firstName, agent.lastName].filter(Boolean).join(" ") ||
                  agent.email ||
                  "Agent"}
              </h2>
              <Badge
                variant="outline"
                className={cn(
                  "border",
                  available
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                )}
              >
                {available ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Available
                  </>
                ) : (
                  <>
                    <Circle className="mr-1.5 h-3.5 w-3.5" />
                    Unavailable
                  </>
                )}
              </Badge>
            </div>

            <div className="text-muted-foreground flex flex-col items-center gap-1 text-sm sm:items-start">
              {agent.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{agent.email}</span>
                </div>
              )}
              {agent.parentLounge && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {getLoungeLabel(agent.parentLounge)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Availability */}
        <AgentAvailabilityToggle
          variant="card"
          className="rounded-none border-0 shadow-none"
        />
      </Card>

      {/* Editable profile form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-base font-semibold">Personal details</h2>
            <p className="text-muted-foreground text-sm">
              These are visible to lounge staff and clients booking with you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="agentName">Display name</Label>
              <Input
                id="agentName"
                value={form.agentName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, agentName: e.target.value }))
                }
                placeholder="e.g. Sarah"
                maxLength={80}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                maxLength={80}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="phoneNumber"
                className="flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5" /> Phone number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                }
                placeholder="+1 555 000 0000"
                inputMode="tel"
                maxLength={20}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                placeholder="Tell clients a bit about your specialities…"
                rows={4}
                maxLength={500}
              />
              <p className="text-muted-foreground text-right text-xs">
                {(form.bio ?? "").length}/500
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || updateProfile.isPending}
              onClick={handleResetForm}
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || updateProfile.isPending}
            >
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Read-only: services managed by lounge */}
      <Card>
        <div className="flex flex-col gap-1 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Services I offer</h2>
            <Badge variant="outline">{agent.services?.length ?? 0}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Managed by your lounge. Contact your lounge manager to update.
          </p>
        </div>
        <Separator />
        {agent.services && agent.services.length > 0 ? (
          <ul className="divide-y">
            {agent.services.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between gap-3 p-4 sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted text-muted-foreground grid h-9 w-9 shrink-0 place-items-center rounded-full">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {s.serviceId?.name ?? "Service"}
                    </p>
                    {s.serviceId?.category && (
                      <p className="text-muted-foreground truncate text-xs">
                        {s.serviceId.category}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {typeof s.price === "number" && (
                    <p className="font-semibold">
                      {s.price.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  )}
                  {typeof s.duration === "number" && (
                    <p className="text-muted-foreground text-xs">
                      {s.duration} min
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Tag className="h-8 w-8 opacity-50" />
            <p className="text-sm">No services assigned yet.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
