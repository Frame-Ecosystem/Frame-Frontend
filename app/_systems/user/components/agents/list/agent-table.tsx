"use client"

import { Agent } from "@/app/_types"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, UserX } from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/_components/ui/avatar"
import { Checkbox } from "@/app/_components/ui/checkbox"
import { Switch } from "@/app/_components/ui/switch"
import { AgentTableRowsSkeleton } from "@/app/_components/skeletons/agents"
import { useTranslation } from "@/app/_i18n"

interface AgentTableProps {
  agents: Agent[]
  loading: boolean
  isAdmin: boolean
  searchTerm: string
  selectedAgents: string[]
  onSelectAgent: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onView: (agent: Agent) => void
  onEdit: (agent: Agent) => void
  onDelete: (agent: Agent) => void
  /**
   * Optional. When provided, an "Accept bookings" switch column is shown
   * and toggling it calls this handler. Pending agent IDs disable their row
   * switch.
   */
  onToggleAcceptQueueBooking?: (agent: Agent, value: boolean) => void
  togglingAgentIds?: string[]
}

function getInitials(name: string) {
  if (!name || typeof name !== "string") return "A"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

export function AgentTable({
  agents,
  loading,
  isAdmin,
  searchTerm,
  selectedAgents,
  onSelectAgent,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onToggleAcceptQueueBooking,
  togglingAgentIds = [],
}: AgentTableProps) {
  const { t } = useTranslation()
  const showQueueColumn = !!onToggleAcceptQueueBooking
  const colSpan =
    3 + (isAdmin ? 1 : 0) + (showQueueColumn ? 1 : 0) + (isAdmin ? 1 : 0)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isAdmin && (
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedAgents.length === agents.length && agents.length > 0
                }
                onCheckedChange={onSelectAll}
              />
            </TableHead>
          )}
          <TableHead>{t("agents.headerAgent")}</TableHead>
          <TableHead>{t("agents.headerStatus")}</TableHead>
          {showQueueColumn && (
            <TableHead className="whitespace-nowrap">
              {t("agents.headerAcceptBookings") || "Accept bookings"}
            </TableHead>
          )}
          <TableHead>{t("agents.headerCreated")}</TableHead>
          {isAdmin && <TableHead>{t("agents.headerLounge")}</TableHead>}
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <AgentTableRowsSkeleton count={5} isAdmin={isAdmin} />
        ) : agents.length === 0 ? (
          <TableRow key="empty">
            <TableCell colSpan={colSpan} className="py-8 text-center">
              <div className="text-muted-foreground">
                <UserX className="mx-auto mb-4 h-12 w-12" />
                <p>{t("agents.noAgents")}</p>
                {searchTerm && (
                  <p className="text-sm">{t("agents.trySearch")}</p>
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
                      onSelectAgent(agent._id!, checked as boolean)
                    }
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer"
                    onClick={() => onView(agent)}
                    aria-label={`View ${agent.agentName || "agent"} details`}
                  >
                    <Avatar className="h-8 w-8 transition-opacity hover:opacity-80">
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
                  </button>
                  <p className="font-medium">
                    {agent.agentName || t("agents.unnamedAgent")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={agent.isBlocked ? "destructive" : "default"}>
                  {agent.isBlocked ? t("agents.blocked") : t("agents.active")}
                </Badge>
              </TableCell>
              {showQueueColumn && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!agent.acceptQueueBooking}
                      disabled={
                        agent.isBlocked || togglingAgentIds.includes(agent._id!)
                      }
                      onCheckedChange={(checked) =>
                        onToggleAcceptQueueBooking?.(agent, checked)
                      }
                      aria-label={
                        t("agents.headerAcceptBookings") || "Accept bookings"
                      }
                    />
                    <span className="text-muted-foreground text-xs">
                      {agent.acceptQueueBooking
                        ? t("agents.acceptingBookings") || "On"
                        : t("agents.notAcceptingBookings") || "Off"}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-muted-foreground">
                {formatDate(agent.createdAt)}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-muted-foreground">
                  {typeof agent.loungeId === "object" && agent.loungeId
                    ? agent.loungeId.loungeTitle ||
                      agent.loungeId.email ||
                      t("agents.unknownLounge")
                    : agent.loungeId || t("agents.unknownLounge")}
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
                    <DropdownMenuItem onClick={() => onView(agent)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t("agents.viewDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(agent)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("agents.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(agent)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("agents.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
