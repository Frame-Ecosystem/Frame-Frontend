"use client"

import { useState } from "react"
import { useAuth } from "../../_providers/auth"
import { AgentProvider } from "../../_providers/agent"
import { AgentList } from "../../_components/agents/agent-list"
import { AgentForm } from "../../_components/agents/agent-form"
import { AgentDetails } from "../../_components/agents/agent-details"
import { Agent } from "../../_types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function LoungeAgentManagementContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "lounge")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="space-y-6">
            <div className="bg-primary/10 h-8 w-56 animate-pulse rounded" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 h-10 w-10 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-primary/10 h-4 w-28 animate-pulse rounded" />
                      <div className="bg-primary/10 h-3 w-20 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="bg-primary/10 h-3 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.type !== "lounge") {
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
    setFormOpen(false)
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
            onClick={() => router.push("/lounge/servicemanagement")}
            className="text-primary mb-4 inline-flex items-center hover:underline"
          >
            ← Back to Service Management
          </button>
          <h1 className="text-3xl font-bold lg:text-4xl">Agent Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage agents for your lounge
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

export default function LoungeAgentManagementPage() {
  return (
    <AgentProvider>
      <LoungeAgentManagementContent />
    </AgentProvider>
  )
}
