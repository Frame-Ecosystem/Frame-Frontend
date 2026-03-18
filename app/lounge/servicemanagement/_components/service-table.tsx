"use client"

import Image from "next/image"
import { Button } from "../../../_components/ui/button"
import { Badge } from "../../../_components/ui/badge"
import { Edit, Trash2, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../_components/ui/alert-dialog"
import { getImageUrl } from "../../../_lib/image-utils"
import type { LoungeServiceItem, LoungeServiceAgent } from "../../../_types"

function getAgentImageUrl(
  img: LoungeServiceAgent["profileImage"],
): string | undefined {
  if (!img) return undefined
  if (typeof img === "string") return img || undefined
  return img.url || undefined
}

interface ServiceTableProps {
  services: LoungeServiceItem[]
  serviceNames: Record<string, string>
  loading: boolean
  onEdit: (service: LoungeServiceItem) => void
  onDelete: (id: string) => void
}

export function ServiceTable({
  services,
  serviceNames,
  loading,
  onEdit,
  onDelete,
}: ServiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left font-medium">Service</th>
            <th className="p-4 text-left font-medium">Description</th>
            <th className="p-4 text-left font-medium">Price</th>
            <th className="p-4 text-left font-medium">Duration</th>
            <th className="p-4 text-left font-medium">Gender</th>
            <th className="p-4 text-left font-medium">Agents</th>
            <th className="p-4 text-left font-medium">isActive</th>
            <th className="p-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(services) &&
            services.map((service) => {
              const serviceId = (service as any).serviceId
              const serviceName = serviceNames[serviceId] || "Unknown Service"

              return (
                <tr
                  key={`service-${(service as any)._id}`}
                  className="hover:bg-muted/50 border-b"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getImageUrl((service as any).image) ? (
                        <Image
                          src={getImageUrl((service as any).image)!}
                          alt={serviceName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                          <span className="text-muted-foreground text-xs">
                            {serviceName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-center font-medium">
                        {serviceName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{service.description || "-"}</td>
                  <td className="p-4">
                    {(service as any).price
                      ? `${(service as any).price} dt`
                      : "-"}
                  </td>
                  <td className="p-4">
                    {(service as any).duration
                      ? `${(service as any).duration} min`
                      : "-"}
                  </td>
                  <td className="p-4">{(service as any).gender || "-"}</td>
                  <td className="p-4">
                    {Array.isArray(service.agentIds) &&
                    service.agentIds.length > 0 ? (
                      <div className="flex -space-x-1">
                        {(service.agentIds as LoungeServiceAgent[]).map(
                          (agent) => {
                            const url = getAgentImageUrl(agent.profileImage)
                            return url ? (
                              <Image
                                key={agent._id}
                                src={url}
                                alt={agent.agentName}
                                width={28}
                                height={28}
                                unoptimized
                                title={agent.agentName}
                                className="h-7 w-7 rounded-full border-2 border-white object-cover dark:border-gray-900"
                              />
                            ) : (
                              <div
                                key={agent._id}
                                title={agent.agentName}
                                className="bg-muted flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-gray-900"
                              >
                                <User className="text-muted-foreground h-3.5 w-3.5" />
                              </div>
                            )
                          },
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No agents
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <Badge
                        variant={
                          (service as any).status === "active"
                            ? "default"
                            : (service as any).status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {(service as any).status === "active"
                          ? "Active"
                          : (service as any).status === "cancelled"
                            ? "Cancelled"
                            : "Inactive"}
                      </Badge>
                      {(service as any).status === "cancelled" &&
                        (service as any).cancelledBy && (
                          <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                            <span>Cancelled by:</span>
                            <span>{(service as any).cancelledBy}</span>
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Service</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this service? This
                              action cannot be undone and will remove the
                              service from your lounge.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete((service as any)._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Service
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              )
            })}
          {(!Array.isArray(services) || services.length === 0) && (
            <tr>
              <td colSpan={8} className="text-muted-foreground p-8 text-center">
                {loading
                  ? "Loading services..."
                  : "No services found. Create your first service to get started."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
