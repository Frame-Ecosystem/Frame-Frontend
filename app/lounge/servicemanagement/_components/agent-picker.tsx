"use client"

/* eslint-disable no-unused-vars */

import Image from "next/image"
import { Checkbox } from "../../../_components/ui/checkbox"
import { Label } from "../../../_components/ui/label"
import { User } from "lucide-react"
import type { LoungeAgent } from "../../../_types"

interface AgentPickerProps {
  agents: LoungeAgent[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function getAgentImageUrl(
  img: LoungeAgent["profileImage"],
): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img || undefined
  return img.url || undefined
}

export function AgentPicker({
  agents,
  selectedIds,
  onChange,
}: AgentPickerProps) {
  console.log(
    "[AgentPicker] agents:",
    agents.map((a) => a._id),
    "selectedIds:",
    selectedIds,
  )
  if (agents.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Assign Agents</Label>
        <p className="text-muted-foreground text-sm">
          No agents found for this lounge.
        </p>
      </div>
    )
  }

  const toggle = (agentId: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedIds, agentId]
        : selectedIds.filter((id) => id !== agentId),
    )
  }

  return (
    <div className="space-y-2">
      <Label>Assign Agents</Label>
      <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
        {agents.map((agent) => {
          const url = getAgentImageUrl(agent.profileImage)
          return (
            <div key={agent._id} className="flex items-center gap-2">
              <Checkbox
                id={`agent-${agent._id}`}
                checked={selectedIds.includes(agent._id)}
                onCheckedChange={(checked) => toggle(agent._id, !!checked)}
              />
              <label
                htmlFor={`agent-${agent._id}`}
                className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
              >
                {url ? (
                  <Image
                    src={url}
                    alt={agent.agentName}
                    width={24}
                    height={24}
                    unoptimized
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                    <User className="text-muted-foreground h-3 w-3" />
                  </div>
                )}
                <span>{agent.agentName}</span>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
