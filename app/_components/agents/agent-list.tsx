"use client"

import { useState, useEffect } from "react"
import { useAgent } from "../../_providers/agent"
import { Agent } from "../../_types"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { Checkbox } from "../ui/checkbox"

interface AgentListProps {
  onCreateClick: () => void
  onEditClick: (agent: Agent) => void // eslint-disable-line no-unused-vars
  onViewClick: (agent: Agent) => void // eslint-disable-line no-unused-vars
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

  // Refetch agents on mount and when refresh is triggered
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
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ ...filters, search: searchTerm })
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, filters, setFilters, setPage])

  const handleSelectAgent = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents((prev) => [...prev, agentId])
    } else {
      setSelectedAgents((prev) => prev.filter((id) => id !== agentId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(agents.map((agent) => agent._id!))
    } else {
      setSelectedAgents([])
    }
  }

  const handleDelete = async () => {
    if (!agentToDelete) return

    // Validate that the agent has a valid ID
    const agentId = agentToDelete._id
    if (!agentId) {
      console.error("Agent has no valid ID")
      alert("Cannot delete agent: Invalid agent data")
      return
    }

    try {
      await deleteAgent(agentId)
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      // Refresh the list after successful deletion
      fetchAgents(pagination.page, pagination.limit)
    } catch (error: any) {
      console.error("Delete failed:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      // For lounge users, provide more specific guidance
      let errorMessage = "Failed to delete agent"
      if (error.code === "AGENT_NOT_FOUND") {
        if (isAdmin) {
          errorMessage = "Agent not found or already deleted."
        } else {
          errorMessage =
            "Unable to delete this agent. Please contact support if you believe this is an error."
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      // You could show a toast here or handle the error display
      alert(errorMessage) // Temporary error display

      // Refresh the list to show current state
      fetchAgents(pagination.page, pagination.limit)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkActionDialog.action || selectedAgents.length === 0) return

    try {
      switch (bulkActionDialog.action) {
        case "block":
          await bulkBlock(selectedAgents)
          break
        case "unblock":
          await bulkUnblock(selectedAgents)
          break
        case "delete":
          await bulkDelete(selectedAgents)
          break
      }
      setSelectedAgents([])
      setBulkActionDialog({ open: false, action: null })
      // Refresh the list after bulk action
      fetchAgents(pagination.page, pagination.limit)
    } catch {
      // Error is handled by the context
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "A" // Default initial for agents
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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

      {/* Filters and Search */}
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
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedAgents.length === agents.length &&
                        agents.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead>Lounge</TableHead>}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow key="loading">
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="py-8 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                      <span className="ml-2">Loading agents...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow key="empty">
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="py-8 text-center"
                  >
                    <div className="text-muted-foreground">
                      <UserX className="mx-auto mb-4 h-12 w-12" />
                      <p>No agents found</p>
                      {searchTerm && (
                        <p className="text-sm">
                          Try adjusting your search terms
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent, index) => (
                  <TableRow key={agent._id || `agent-${index}`}>
                    {isAdmin && (
                      <TableCell>
                        <Checkbox
                          checked={selectedAgents.includes(agent._id!)}
                          onCheckedChange={(checked) =>
                            handleSelectAgent(agent._id!, checked as boolean)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {agent.profileImage ? (
                            <AvatarImage
                              src={
                                typeof agent.profileImage === "string"
                                  ? agent.profileImage
                                  : agent.profileImage.url
                              }
                              alt={agent.agentName}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(agent.agentName || "Agent")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {agent.agentName || "Unnamed Agent"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={agent.isBlocked ? "destructive" : "default"}
                      >
                        {agent.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(agent.createdAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-muted-foreground">
                        {typeof agent.loungeId === "object" && agent.loungeId
                          ? agent.loungeId.loungeTitle ||
                            agent.loungeId.email ||
                            "Unknown Lounge"
                          : agent.loungeId || "Unknown Lounge"}
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewClick(agent)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditClick(agent)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setAgentToDelete(agent)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

      {/* Delete Confirmation Dialog */}
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

      {/* Bulk Action Confirmation Dialog */}
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
