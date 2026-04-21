"use client"

import { useState, useEffect } from "react"
import { useAgent } from "../../../_providers/agent"
import { isAuthError } from "../../../_services/api"
import { Agent } from "../../../_types"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Card, CardContent } from "../../ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import {
  Search,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { AgentTable } from "./agent-table"
import { useTranslation } from "@/app/_i18n"
import { useToggleAgentQueueBooking } from "@/app/_systems/user/hooks/useAgents"

interface AgentListProps {
  onCreateClick: () => void

  onEditClick: (agent: Agent) => void

  onViewClick: (agent: Agent) => void
  refreshTrigger?: number
}

export function AgentList({
  onCreateClick,
  onEditClick,
  onViewClick,
  refreshTrigger = 0,
}: AgentListProps) {
  const {
    agents,
    pagination,
    filters,
    loading,
    error,
    isAdmin,
    fetchAgents,
    setFilters,
    setPage,
    deleteAgent,
    bulkBlock,
    bulkUnblock,
    bulkDelete,
  } = useAgent()
  const { t } = useTranslation()

  const toggleQueueBooking = useToggleAgentQueueBooking()
  const [pendingToggleIds, setPendingToggleIds] = useState<string[]>([])

  useEffect(() => {
    fetchAgents(1, pagination.limit)
  }, [refreshTrigger, fetchAgents, pagination.limit])

  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: "block" | "unblock" | "delete" | null
  }>({ open: false, action: null })

  useEffect(() => {
    fetchAgents()
  }, [filters, pagination.page, fetchAgents])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ ...filters, search: searchTerm })
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, filters, setFilters, setPage])

  const handleSelectAgent = (id: string, checked: boolean) => {
    setSelectedAgents((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id),
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAgents(checked ? agents.map((a) => a._id!) : [])
  }

  const handleDelete = async () => {
    if (!agentToDelete?._id) return
    try {
      await deleteAgent(agentToDelete._id)
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      fetchAgents(pagination.page, pagination.limit)
    } catch (error: any) {
      if (isAuthError(error)) return
      let msg = t("agents.deleteError")
      if (error.code === "AGENT_NOT_FOUND") {
        msg = isAdmin
          ? t("agents.agentNotFound")
          : t("agents.deleteContactSupport")
      } else if (error.message) msg = error.message
      alert(msg)
      fetchAgents(pagination.page, pagination.limit)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkActionDialog.action || selectedAgents.length === 0) return
    try {
      if (bulkActionDialog.action === "block") await bulkBlock(selectedAgents)
      else if (bulkActionDialog.action === "unblock")
        await bulkUnblock(selectedAgents)
      else if (bulkActionDialog.action === "delete")
        await bulkDelete(selectedAgents)
      setSelectedAgents([])
      setBulkActionDialog({ open: false, action: null })
      fetchAgents(pagination.page, pagination.limit)
    } catch {
      /* Error handled by context */
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive text-center">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchAgents()}
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("agents.heading")}</h2>
          <p className="text-muted-foreground">
            {isAdmin ? t("agents.subtitleAdmin") : t("agents.subtitleOwner")}
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          {t("agents.addAgent")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t("agents.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {isAdmin && selectedAgents.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBulkActionDialog({ open: true, action: "block" })
                  }
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {t("agents.blockSelected")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBulkActionDialog({ open: true, action: "unblock" })
                  }
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("agents.unblockSelected")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setBulkActionDialog({ open: true, action: "delete" })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("agents.deleteSelected")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <AgentTable
            agents={agents}
            loading={loading}
            isAdmin={isAdmin}
            searchTerm={searchTerm}
            selectedAgents={selectedAgents}
            onSelectAgent={handleSelectAgent}
            onSelectAll={handleSelectAll}
            onView={onViewClick}
            onEdit={onEditClick}
            onDelete={(agent) => {
              setAgentToDelete(agent)
              setDeleteDialogOpen(true)
            }}
            onToggleAcceptQueueBooking={(agent, value) => {
              if (!agent._id) return
              const id = agent._id
              setPendingToggleIds((prev) => [...prev, id])
              toggleQueueBooking.mutate(
                { agentId: id, acceptQueueBooking: value },
                {
                  onSettled: () => {
                    setPendingToggleIds((prev) => prev.filter((p) => p !== id))
                  },
                },
              )
            }}
            togglingAgentIds={pendingToggleIds}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {t("agents.showingOf", {
              count: agents.length,
              total: pagination.total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <span className="text-sm">
              {t("agents.pageOf", {
                page: pagination.page,
                totalPages: pagination.totalPages,
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("agents.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("agents.deleteConfirm", {
                name: agentToDelete?.agentName ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("agents.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Dialog */}
      <AlertDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog({ open, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionDialog.action === "block" &&
                t("agents.bulkBlockTitle")}
              {bulkActionDialog.action === "unblock" &&
                t("agents.bulkUnblockTitle")}
              {bulkActionDialog.action === "delete" &&
                t("agents.bulkDeleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionDialog.action === "block" &&
                t("agents.bulkBlockConfirm", { count: selectedAgents.length })}
              {bulkActionDialog.action === "unblock" &&
                t("agents.bulkUnblockConfirm", {
                  count: selectedAgents.length,
                })}
              {bulkActionDialog.action === "delete" &&
                t("agents.bulkDeleteConfirm", { count: selectedAgents.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {bulkActionDialog.action === "block" && t("agents.block")}
              {bulkActionDialog.action === "unblock" && t("agents.unblock")}
              {bulkActionDialog.action === "delete" && t("agents.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
