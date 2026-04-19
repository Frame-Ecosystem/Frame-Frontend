"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { AgentProvider } from "../../_providers/agent"
import { AgentList } from "../../_components/agents/list/agent-list"
import { AgentForm } from "../../_components/agents/form/agent-form"
import { AgentDetails } from "../../_components/agents/agent-details"
import { Agent } from "../../_types"
import { AdminHeader } from "../_components/admin-header"

function AgentManagementContent() {
  const { t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <>
      <AdminHeader
        title={t("admin.agents.title")}
        description={t("admin.agents.desc")}
        icon={Users}
      />

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
    </>
  )
}

export default function AgentManagementPage() {
  return (
    <AgentProvider>
      <AgentManagementContent />
    </AgentProvider>
  )
}
