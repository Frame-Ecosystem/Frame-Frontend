"use client"

import { useState } from "react"
import { useAuth } from "../../_providers/auth"
import { AgentProvider } from "../../_providers/agent"
import { AgentList } from "../../_components/agents/list/agent-list"
import { AgentForm } from "../../_components/agents/form/agent-form"
import { AgentDetails } from "../../_components/agents/agent-details"
import { Agent } from "../../_types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AgentListSkeleton } from "../../_components/skeletons/agents"

function AgentManagementContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <AgentListSkeleton />
  }

  if (!user || user.type !== "admin") {
    return null
  }

  const handleCreateClick = () => {
    setEditingAgent(null)
    setFormOpen(true)
  }

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent)
    setFormOpen(true)
  }

  const handleViewClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setDetailsOpen(true)
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setEditingAgent(null)
    // Trigger refresh of the agent list
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="text-primary mb-4 inline-flex items-center hover:underline"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold lg:text-4xl">Agent Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage agents across all lounges on the platform
          </p>
        </div>

        <AgentList
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onViewClick={handleViewClick}
          refreshTrigger={refreshTrigger}
        />

        <AgentForm
          isOpen={formOpen}
          onOpenChange={setFormOpen}
          agent={editingAgent}
          onSuccess={handleFormSuccess}
        />

        <AgentDetails
          agent={selectedAgent}
          isOpen={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </div>
  )
}

export default function AgentManagementPage() {
  return (
    <AgentProvider>
      <AgentManagementContent />
    </AgentProvider>
  )
}
