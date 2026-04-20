"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
import { AgentProvider } from "../../_providers/agent"
import { AgentList } from "../../_components/agents/list/agent-list"
import { AgentForm } from "../../_components/agents/form/agent-form"
import { AgentDetails } from "../../_components/agents/agent-details"
import type { Agent } from "../../_types"
import { AgentListSkeleton } from "../../_components/skeletons/agents"

/* ------------------------------------------------------------------ */
/* Skeleton shown while auth is resolving                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */
function AgentManagementContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { t, dir } = useTranslation()

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
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <button
            onClick={() => router.push("/lounge/servicemanagement")}
            className="text-primary mb-4 inline-flex items-center hover:underline"
          >
            {t("loungeAgents.backToService")}
          </button>
          <h1 className="text-3xl font-bold lg:text-4xl" dir={dir}>
            {t("loungeAgents.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("loungeAgents.subtitle")}
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
