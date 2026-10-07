"use client"

import { useEffect, useRef, useState } from "react"
import {
  Building2,
  Heart,
  Loader2,
  Mail,
  Phone,
  Settings,
  Tag,
} from "lucide-react"

import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { ProfileCover } from "@/app/_components/common/profile-display/profile-cover"
import { RatingSummaryBadge } from "@/app/_components/common/star-rating"
import { ClientProfileSkeleton } from "@/app/_components/skeletons/profile"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { Label } from "@/app/_components/ui/label"
import { Badge } from "@/app/_components/ui/badge"
import { Card } from "@/app/_components/ui/card"
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
import type { User } from "@/app/_types"
import { cn } from "@/app/_lib/utils"
import { toast } from "sonner"

// ── Constants ───────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

// ── Helpers ─────────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState<"account" | "services">("account")
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const tabs = [
    { key: "account" as const, label: "Account", icon: Settings },
    { key: "services" as const, label: "Services", icon: Tag },
  ]

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }, [activeTab])

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

  const handleProfileImageUpdate = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be smaller than 5 MB.")
      return
    }
    await uploadImage.mutateAsync(file)
  }

  // ── Render ────────────────────────────────────────────────────

  if (isLoadingProfile) {
    return <ClientProfileSkeleton />
  }

  if (profileQuery.isError || !agent) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-5xl items-center justify-center px-4">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Couldn&apos;t load your profile.
          </p>
          <Button variant="outline" onClick={() => profileQuery.refetch()}>
            Try again
          </Button>
        </Card>
      </div>
    )
  }

  const profileUser: User = {
    _id: agent._id,
    email: agent.email ?? "",
    type: "agent",
    agentName: agent.agentName,
    firstName: agent.firstName,
    lastName: agent.lastName,
    phoneNumber: agent.phoneNumber,
    bio: agent.bio,
    profileImage: agent.profileImage,
    coverImage: agent.coverImage,
    createdAt: agent.createdAt,
    averageRating: agent.averageRating,
    ratingCount: agent.ratingCount,
    likeCount: agent.likeCount,
  }
  const bioLimit = 120

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <ProfileCover
          user={profileUser}
          editableProfile
          onProfileImageUpdate={handleProfileImageUpdate}
          updatingProfile={uploadImage.isPending}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {agent.email && (
              <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{agent.email}</span>
              </div>
            )}
            {agent.parentLounge && (
              <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {getLoungeLabel(agent.parentLounge)}
                </span>
              </div>
            )}
            <Badge
              variant="outline"
              className={cn(
                "border",
                available
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
              )}
            >
              {available ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div className="mt-2">
            {agent.bio ? (
              <p className="text-foreground/80 text-sm leading-relaxed">
                {isBioExpanded || agent.bio.length <= bioLimit
                  ? agent.bio
                  : `${agent.bio.slice(0, bioLimit).trimEnd()}...`}
                {agent.bio.length > bioLimit && (
                  <button
                    onClick={() => setIsBioExpanded((value) => !value)}
                    className="text-primary hover:text-primary/80 ml-1 text-sm font-medium transition-colors"
                  >
                    {isBioExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </p>
            ) : (
              <button
                onClick={() => setActiveTab("account")}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Add a bio
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <RatingSummaryBadge
              averageRating={agent.averageRating ?? 0}
              ratingCount={agent.ratingCount ?? 0}
            />
            <div className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{agent.likeCount ?? 0} likes</span>
            </div>
          </div>
        </div>

        <div
          data-nav-tabs
          className="to-background/95 sticky top-[var(--header-offset)] z-50 mt-4 bg-gradient-to-b from-transparent shadow-sm backdrop-blur-md lg:top-[var(--header-offset-lg)]"
        >
          <div className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:justify-evenly lg:px-8 [&::-webkit-scrollbar]:hidden">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  ref={isActive ? activeTabRef : undefined}
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {activeTab === "account" && (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-base font-semibold">Availability</h2>
                  <p className="text-muted-foreground text-sm">
                    Control whether clients can book you in the queue.
                  </p>
                </div>
                <Separator />
                <AgentAvailabilityToggle
                  variant="card"
                  className="rounded-none border-0 shadow-none"
                />
              </Card>

              <Card>
                <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
                  <div>
                    <h2 className="text-base font-semibold">
                      Personal details
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      These are visible to lounge staff and clients booking with
                      you.
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
                          setForm((f) => ({
                            ...f,
                            phoneNumber: e.target.value,
                          }))
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
            </div>
          )}

          {activeTab === "services" && (
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
                  {agent.services.map((service) => (
                    <li
                      key={service._id}
                      className="flex items-center justify-between gap-3 p-4 sm:p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-muted text-muted-foreground grid h-9 w-9 shrink-0 place-items-center rounded-full">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {service.serviceId?.name ?? "Service"}
                          </p>
                          {service.serviceId?.category && (
                            <p className="text-muted-foreground truncate text-xs">
                              {service.serviceId.category}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        {typeof service.price === "number" && (
                          <p className="font-semibold">
                            {service.price.toLocaleString(undefined, {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        )}
                        {typeof service.duration === "number" && (
                          <p className="text-muted-foreground text-xs">
                            {service.duration} min
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
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
