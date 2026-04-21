import { LoungeAgent } from "@/app/_types"
import { NextRequest, NextResponse } from "next/server"
import { agentService } from "@/app/_services/agent.service"

// GET /api/v1/lounge-services/lounge/[loungeId]/agents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ loungeId: string }> },
) {
  try {
    const { loungeId } = await params

    // Fetch real agents for this lounge
    let loungeAgents: LoungeAgent[] = []
    try {
      // The new agents API auto-scopes the result to the authenticated user;
      // for a public lounge view we filter the global list client-side.
      const allAgents = await agentService.getAllAgents()
      const filtered = allAgents.filter((a) => {
        const lid =
          typeof a.parentLounge === "string"
            ? a.parentLounge
            : (a.parentLounge?._id ??
              (typeof a.loungeId === "string" ? a.loungeId : a.loungeId?._id))
        return lid === loungeId
      })
      loungeAgents = filtered.map((agent) => ({
        _id: agent._id || "",
        agentName: agent.agentName,
        loungeId:
          typeof agent.loungeId === "string"
            ? agent.loungeId
            : (agent.loungeId?._id ?? loungeId),
        profileImage: agent.profileImage || "/images/placeholder.svg",
        isBlocked: agent.isBlocked,
        // Preserve flags needed by the queue UI (toggle + booking dialog).
        // Stripping these previously made the per-agent "Accept bookings"
        // switch always read `true` after a refresh.
        idLoungeService: Array.isArray(agent.idLoungeService)
          ? (agent.idLoungeService as string[])
          : undefined,
        acceptQueueBooking:
          typeof agent.acceptQueueBooking === "boolean"
            ? agent.acceptQueueBooking
            : true,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }))
    } catch (error) {
      console.error("API: Failed to fetch agents from service:", error)
      // Return empty array if service fails
      loungeAgents = []
    }

    const response = {
      lounge: {
        _id: loungeId,
        loungeTitle: `Lounge ${loungeId}`,
        email: `lounge${loungeId}@example.com`,
      },
      agents: loungeAgents,
      totalAgents: loungeAgents.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching lounge agents:", error)
    return NextResponse.json(
      { error: "Failed to fetch lounge agents" },
      { status: 500 },
    )
  }
}
