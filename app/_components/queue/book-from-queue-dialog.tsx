"use client"

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { Scissors, Clock, Loader2, AlertCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { loungeService } from "../../_services/lounge.service"
import clientService from "../../_services/client.service"
import { useAuth } from "../../_providers/auth"
import { useBookFromQueue } from "../../_hooks/queries/useQueue"
import type { LoungeServiceItem } from "../../_types"

interface BookFromQueueDialogProps {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void
  agentId: string
  agentName?: string
  loungeId: string
  /** IDs of lounge-services this agent can perform (from LoungeAgent.idLoungeService) */
  agentServiceIds?: string[]
  mode: "client" | "staff"
}

export default function BookFromQueueDialog({
  open,
  onOpenChange,
  agentId,
  agentName,
  loungeId,
  agentServiceIds,
  mode,
}: BookFromQueueDialogProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const { user } = useAuth()
  const bookFromQueue = useBookFromQueue()

  // ── Fetch lounge services ──────────────────────────────────
  // For lounge owners we use their own endpoint; for clients we use the public endpoint
  const { data: allServices, isLoading: servicesLoading } = useQuery({
    queryKey: ["loungeServicesForQueue", loungeId, mode],
    queryFn: async () => {
      if (mode === "staff") {
        return loungeService.getAll()
      }
      // Client view — use public endpoint
      const services = await clientService.getLoungeServicesById(loungeId)
      return services as LoungeServiceItem[]
    },
    enabled: open && !!loungeId,
    staleTime: 60_000,
  })

  // Filter to only this agent's services (if the agent has a service list)
  const services: LoungeServiceItem[] = useMemo(() => {
    if (!allServices) return []
    if (!agentServiceIds || agentServiceIds.length === 0) return allServices
    return allServices.filter((s) =>
      agentServiceIds.includes(s._id || (s as any).id),
    )
  }, [allServices, agentServiceIds])

  // ── Computed totals ────────────────────────────────────────
  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s._id),
  )
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + (s.price ?? 0),
    0,
  )
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + (s.duration ?? 0),
    0,
  )

  // ── Helpers ────────────────────────────────────────────────
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const getServiceName = (service: LoungeServiceItem): string => {
    if (typeof service.serviceId === "object" && service.serviceId !== null) {
      return (service.serviceId as any).name ?? "Service"
    }
    return service.description ?? "Service"
  }

  const handleSubmit = () => {
    if (selectedServiceIds.length === 0) return

    const clientId = user?._id
    if (!clientId) return

    bookFromQueue.mutate(
      {
        clientId,
        loungeId,
        agentId,
        loungeServiceIds: selectedServiceIds,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedServiceIds([])
          setNotes("")
          onOpenChange(false)
        },
      },
    )
  }

  const resetAndClose = () => {
    setSelectedServiceIds([])
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "staff" ? "Add Client to Queue" : "Join the Queue"}
          </DialogTitle>
          <DialogDescription>
            {agentName
              ? `Select services for ${agentName}'s queue`
              : "Select services and join the queue"}
          </DialogDescription>
        </DialogHeader>

        {/* Service List */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Select Services</Label>

          {servicesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-center">
              <AlertCircle className="text-muted-foreground h-5 w-5" />
              <p className="text-muted-foreground text-sm">
                No services available for this agent.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => {
                const isSelected = selectedServiceIds.includes(service._id)
                return (
                  <label
                    key={service._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service._id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Scissors className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="text-sm font-medium">
                          {getServiceName(service)}
                        </span>
                        {service.gender && (
                          <Badge variant="outline" className="text-[10px]">
                            {service.gender}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        {service.price != null && (
                          <span className="flex items-center gap-1">
                            {service.price} dt
                          </span>
                        )}
                        {service.duration != null && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-muted-foreground text-xs">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {/* Totals summary */}
          {selectedServiceIds.length > 0 && (
            <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">
                {selectedServiceIds.length} service
                {selectedServiceIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">{totalPrice} dt</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {totalDuration} min
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="queueNotes" className="text-sm font-semibold">
              Notes{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="queueNotes"
              placeholder="Any special requests or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                selectedServiceIds.length === 0 || bookFromQueue.isPending
              }
            >
              {bookFromQueue.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "staff" ? "Add to Queue" : "Join Queue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
