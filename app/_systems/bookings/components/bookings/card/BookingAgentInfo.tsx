"use client"

import { useTranslation } from "@/app/_i18n"
import { resolveImageUrl } from "../booking-utils"
import type { Agent } from "@/app/_types"

interface BookingAgentInfoProps {
  agent?: Agent | null
  agents?: Agent[]
}

function AgentRow({ agent }: { agent: Agent }) {
  const { t } = useTranslation()
  const imgUrl = resolveImageUrl(agent.profileImage)

  return (
    <div className="flex items-center gap-3">
      <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
        {imgUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgUrl}
            alt={agent.agentName || "Agent"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground">{t("common.noImage")}</span>
        )}
      </div>
      <div className="leading-tight">
        <p className="text-muted-foreground text-xs">{t("booking.handled")}</p>
        <p className="text-sm font-medium">
          {t("booking.by", { name: agent.agentName })}
        </p>
      </div>
    </div>
  )
}

export function BookingAgentInfo({ agent, agents }: BookingAgentInfoProps) {
  const { t } = useTranslation()
  const hasAgents = agents && agents.length > 0
  if (!agent && !hasAgents) return null

  if (hasAgents && agents.length > 1) {
    return (
      <div className="mb-2">
        <div className="mb-1 text-sm font-medium">
          {t("booking.handledByLabel")} (
          {t("booking.agentsCount", { count: agents.length })})
        </div>
        <div className="space-y-2">
          {agents.map((a, index) => (
            <AgentRow key={a._id || index} agent={a} />
          ))}
        </div>
      </div>
    )
  }

  const singleAgent = hasAgents ? agents[0] : agent
  if (!singleAgent) return null

  return (
    <div className="mb-2">
      <AgentRow agent={singleAgent} />
    </div>
  )
}
