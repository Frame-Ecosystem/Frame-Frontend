import { resolveImageUrl } from "./booking-utils"
import type { Agent } from "../../_types"

interface BookingAgentInfoProps {
  agent?: Agent | null
  agents?: Agent[]
}

function AgentRow({ agent }: { agent: Agent }) {
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
          <span className="text-muted-foreground">No Image</span>
        )}
      </div>
      <div className="leading-tight">
        <p className="text-muted-foreground text-xs">Handled</p>
        <p className="text-sm font-medium">by {agent.agentName}</p>
      </div>
    </div>
  )
}

export function BookingAgentInfo({ agent, agents }: BookingAgentInfoProps) {
  const hasAgents = agents && agents.length > 0
  if (!agent && !hasAgents) return null

  if (hasAgents && agents.length > 1) {
    return (
      <div className="mb-2">
        <div className="mb-1 text-sm font-medium">
          Handled By: ({agents.length} agents)
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
