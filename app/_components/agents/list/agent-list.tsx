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

interface AgentListProps {
  onCreateClick: () => void
  // eslint-disable-next-line no-unused-vars
  onEditClick: (agent: Agent) => void
  // eslint-disable-next-line no-unused-vars
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
      let msg = "Failed to delete agent"
      if (error.code === "AGENT_NOT_FOUND") {
        msg = isAdmin
          ? "Agent not found or already deleted."
          : "Unable to delete this agent. Please contact support."
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
              Try Again
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
          <h2 className="text-2xl font-bold">Agents</h2>
          <p className="text-muted-foreground">
            Manage {isAdmin ? "all" : "your"} agents
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search agents..."
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
                  Block Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setBulkActionDialog({ open: true, action: "unblock" })
                  }
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unblock Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setBulkActionDialog({ open: true, action: "delete" })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
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
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {agents.length} of {pagination.total} agents
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {agentToDelete?.agentName}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
              {bulkActionDialog.action === "block" && "Block Agents"}
              {bulkActionDialog.action === "unblock" && "Unblock Agents"}
              {bulkActionDialog.action === "delete" && "Delete Agents"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkActionDialog.action}{" "}
              {selectedAgents.length} selected agent
              {selectedAgents.length !== 1 ? "s" : ""}?
              {bulkActionDialog.action === "delete" &&
                " This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={
                bulkActionDialog.action === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {bulkActionDialog.action === "block" && "Block"}
              {bulkActionDialog.action === "unblock" && "Unblock"}
              {bulkActionDialog.action === "delete" && "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
