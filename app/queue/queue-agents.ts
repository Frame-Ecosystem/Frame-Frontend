"use client"

import { useState, useEffect } from "react"
import { loungeService } from "../_services"
import { LoungeAgent } from "../_types"
import { Queue } from "../_constants/mockQueues"

export function useLoungeAgents(loungeId: string | null) {
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loungeId) {
      setQueues([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchAgentsAndCreateQueues = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await loungeService.getAgentsByLoungeId(loungeId)

        // Handle different response structures
        const responseData = response as any // Handle potential API response wrapping
        const agentsArray =
          responseData?.agents || responseData?.data?.agents || []

        const filteredAgents = agentsArray.filter(
          (agent: any) => !agent.isBlocked,
        )

        // Create main queue with static demo people
        const mainQueue: Queue = {
          id: "main",
          name: "Main Queue",
          people: [
            {
              id: "1",
              name: "John Smith",
              initials: "JS",
              avatarUrl: "/images/placeholder.png",
              position: 1,
              estimatedWaitMinutes: 5,
              service: "Haircut & Styling",
              status: "in-service",
              joinedAt: "2:30 PM",
            },
            {
              id: "2",
              name: "Maria Garcia",
              initials: "MG",
              position: 2,
              estimatedWaitMinutes: 25,
              service: "Hair Coloring",
              status: "waiting",
              joinedAt: "2:45 PM",
            },
            {
              id: "3",
              name: "David Chen",
              initials: "DC",
              position: 3,
              estimatedWaitMinutes: 40,
              service: "Beard Trim",
              status: "waiting",
              joinedAt: "2:50 PM",
            },
          ],
        }

        // Only create agent-specific queues if there are real agents
        const agentQueues: Queue[] = filteredAgents.map((agent: any) => ({
          id: `agent-${agent._id}`,
          name: agent.agentName,
          agentId: agent._id,
          people: [], // Agent queues start empty - no static people
        }))

        setQueues([mainQueue, ...agentQueues])
      } catch (err) {
        console.error("useLoungeAgents: Failed to fetch agents:", err)
        setError("Failed to load agents")
        setQueues([])
      } finally {
        setLoading(false)
      }
    }

    fetchAgentsAndCreateQueues()
  }, [loungeId])

  return { queues, loading, error }
}

export function useDynamicQueues(agents: LoungeAgent[]): Queue[] {
  // Create main queue with static demo people
  const mainQueue: Queue = {
    id: "main",
    name: "Main Queue",
    people: [
      {
        id: "1",
        name: "John Smith",
        initials: "JS",
        avatarUrl: "/images/placeholder.png",
        position: 1,
        estimatedWaitMinutes: 5,
        service: "Haircut & Styling",
        status: "in-service",
        joinedAt: "2:30 PM",
      },
      {
        id: "2",
        name: "Maria Garcia",
        initials: "MG",
        position: 2,
        estimatedWaitMinutes: 25,
        service: "Hair Coloring",
        status: "waiting",
        joinedAt: "2:45 PM",
      },
      {
        id: "3",
        name: "David Chen",
        initials: "DC",
        position: 3,
        estimatedWaitMinutes: 40,
        service: "Beard Trim",
        status: "waiting",
        joinedAt: "2:50 PM",
      },
    ],
  }

  // Only create agent-specific queues if there are real agents
  const agentQueues: Queue[] = agents.map((agent) => ({
    id: `agent-${agent._id}`,
    name: agent.agentName,
    agentId: agent._id,
    people: [], // Agent queues start empty - no static people
  }))

  return [mainQueue, ...agentQueues]
}
