"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth"
import { AgentProvider } from "../../_providers/agent"
import { AgentList } from "../../_components/agents/list/agent-list"
import { AgentForm } from "../../_components/agents/form/agent-form"
import { AgentDetails } from "../../_components/agents/agent-details"
import type { Agent } from "../../_types"

/* ------------------------------------------------------------------ */
/* Skeleton shown while auth is resolving                              */
/* ------------------------------------------------------------------ */
const SKELETON_COUNT = 3

function AgentListSkeleton() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-primary/10 h-8 w-56 animate-pulse rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
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

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */
function AgentManagementContent() {
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

  const handleCreateClick = useCallback(() => {
    setEditingAgent(null)
    setFormOpen(true)
  }, [])

  const handleEditClick = useCallback((agent: Agent) => {
    setEditingAgent(agent)
    setFormOpen(true)
  }, [])

  const handleViewClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    setFormOpen(false)
    setDetailsOpen(true)
  }, [])

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false)
    setEditingAgent(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  if (isLoading) return <AgentListSkeleton />
  if (!user || user.type !== "lounge") return null

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

/* ------------------------------------------------------------------ */
/* Page export                                                         */
/* ------------------------------------------------------------------ */
export default function LoungeAgentManagementPage() {
  return (
    <AgentProvider>
      <AgentManagementContent />
    </AgentProvider>
  )
}
