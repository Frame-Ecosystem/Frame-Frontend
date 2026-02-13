import { NextRequest, NextResponse } from "next/server"
import { agentService } from "@/app/_services"

// GET /api/v1/agents/[agentId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  try {
    const { agentId } = await params

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 },
      )
    }

    const agent = await agentService.getAgentById(agentId)

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("API: Failed to fetch agent:", error)
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 },
    )
  }
}
