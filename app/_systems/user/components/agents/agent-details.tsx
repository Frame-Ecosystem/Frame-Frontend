"use client"

import Image from "next/image"
import { Agent } from "@/app/_types"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { Separator } from "@/app/_components/ui/separator"
import { User, Calendar, Shield, ShieldCheck, Building } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

interface AgentDetailsProps {
  agent: Agent | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentDetails({
  agent,
  isOpen,
  onOpenChange,
}: AgentDetailsProps) {
  const { t } = useTranslation()
  if (!agent) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "A" // Default initial for agents
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("agents.details.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Agent Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="mb-4 h-24 w-24">
              {agent.profileImage ? (
                <AvatarImage
                  src={
                    typeof agent.profileImage === "string"
                      ? agent.profileImage
                      : agent.profileImage.url
                  }
                  alt={agent.agentName || "Agent"}
                />
              ) : (
                <AvatarFallback className="text-2xl">
                  {getInitials(agent.agentName || "Agent")}
                </AvatarFallback>
              )}
            </Avatar>
            <h3 className="text-xl font-semibold">
              {agent.agentName || t("agents.details.unnamedAgent")}
            </h3>
            <div className="mt-2">
              <Badge variant={agent.isBlocked ? "destructive" : "default"}>
                {agent.isBlocked
                  ? t("agents.details.blocked")
                  : t("agents.details.active")}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Agent Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {t("agents.details.agentName")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {agent.agentName || t("agents.details.unnamedAgent")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {t("agents.details.loungeId")}
                </p>
                <p className="text-muted-foreground font-mono text-sm">
                  {typeof agent.loungeId === "object" && agent.loungeId
                    ? agent.loungeId._id ||
                      agent.loungeId.loungeTitle ||
                      t("agents.details.unknown")
                    : agent.loungeId || t("agents.details.unknown")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {t("agents.details.status")}
                </p>
                <div className="flex items-center gap-2">
                  {agent.isBlocked ? (
                    <>
                      <Shield className="text-destructive h-4 w-4" />
                      <span className="text-muted-foreground text-sm">
                        {t("agents.details.blocked")}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground text-sm">
                        {t("agents.details.active")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {t("agents.details.created")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(agent.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {t("agents.details.lastUpdated")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(agent.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {agent.profileImage && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("agents.details.profileImage")}
                </p>
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={
                      typeof agent.profileImage === "string"
                        ? agent.profileImage
                        : agent.profileImage.url
                    }
                    alt={`${agent.agentName || "Agent"} profile`}
                    width={400}
                    height={128}
                    className="h-32 w-full object-cover"
                    unoptimized={
                      typeof agent.profileImage === "string" &&
                      agent.profileImage.startsWith("data:")
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 pb-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("agents.details.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
