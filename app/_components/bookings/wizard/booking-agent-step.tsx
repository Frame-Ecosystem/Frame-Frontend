"use client"

import { User, Check, CheckCircle } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import type { LoungeService, LoungeAgent } from "../../../_types"
import Image from "next/image"

/* eslint-disable no-unused-vars */
interface BookingAgentStepProps {
  selectedServices: LoungeService[]
  agents: LoungeAgent[]
  selectedAgent: LoungeAgent | null
  setSelectedAgent: (agent: LoungeAgent | null) => void
  selectedAgents: { [serviceId: string]: LoungeAgent | undefined }
  setSelectedAgents: React.Dispatch<
    React.SetStateAction<{ [serviceId: string]: LoungeAgent | undefined }>
  >
  useMultipleAgents: boolean
  canAgentPerformServices: (agent: LoungeAgent) => boolean
  getUnavailableServices: (agent: LoungeAgent) => LoungeService[]
  getAvailableAgentsForService: (serviceId: string) => LoungeAgent[]
}
/* eslint-enable no-unused-vars */

export function BookingAgentStep({
  selectedServices,
  agents,
  selectedAgent,
  setSelectedAgent,
  selectedAgents,
  setSelectedAgents,
  useMultipleAgents,
  canAgentPerformServices,
  getUnavailableServices,
  getAvailableAgentsForService,
}: BookingAgentStepProps) {
  return (
    <div className="space-y-4">
      <div className="sm:text-left">
        <p className="text-muted-foreground mt-1 text-sm">
          {useMultipleAgents
            ? "No single agent can perform all selected services. Please assign an agent to each service."
            : "Choose your preferred agent or skip to any available agent"}
        </p>
      </div>

      {/* Status Messages */}
      {(() => {
        if (useMultipleAgents) {
          const allServicesAssigned = selectedServices.every(
            (service) => selectedAgents[service.id],
          )
          return allServicesAssigned ? (
            <div className="rounded-xl border border-green-200/50 bg-green-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">
                    All services assigned!
                  </p>
                  <p className="text-sm text-green-600">
                    You can proceed to review your booking.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    Please assign agents to all services
                  </p>
                  <p className="text-sm text-amber-600">
                    Select an agent for each service to continue.
                  </p>
                </div>
              </div>
            </div>
          )
        }

        const availableAgents = agents.filter((agent) =>
          canAgentPerformServices(agent),
        )
        const hasUnavailableAgents =
          agents.length > 0 && availableAgents.length === 0

        if (agents.length === 0) {
          return (
            <div className="bg-primary/5 border-primary/20 rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">No agents available</p>
                  <p className="text-muted-foreground text-sm">
                    You can proceed without selecting an agent.
                  </p>
                </div>
              </div>
            </div>
          )
        }

        if (hasUnavailableAgents && selectedServices.length > 0) {
          return (
            <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    No agents available for selected services
                  </p>
                  <p className="text-sm text-amber-600">
                    The available agents cannot perform all selected services.
                    You can proceed without selecting an agent or go back to
                    change your service selection.
                  </p>
                </div>
              </div>
            </div>
          )
        }

        return null
      })()}

      {useMultipleAgents ? (
        // Multiple agents selection
        <div className="space-y-6">
          {selectedServices.map((service) => {
            const availableAgents = getAvailableAgentsForService(service.id)
            const selectedAgentForService = selectedAgents[service.id]

            return (
              <div key={service.id} className="rounded-lg border p-4">
                <h4 className="mb-3 font-medium">{service.name}</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {availableAgents.length > 0 ? (
                    availableAgents.map((agent) => (
                      <div
                        key={agent._id}
                        onClick={() => {
                          setSelectedAgents((prev) => ({
                            ...prev,
                            [service.id]:
                              selectedAgentForService?._id === agent._id
                                ? undefined
                                : agent,
                          }))
                        }}
                        className={cn(
                          "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all",
                          selectedAgentForService?._id === agent._id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent/50",
                        )}
                      >
                        <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-full">
                          {agent.profileImage ? (
                            <Image
                              src={
                                typeof agent.profileImage === "string"
                                  ? agent.profileImage
                                  : agent.profileImage.url
                              }
                              alt={agent.agentName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="text-muted-foreground h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {agent.agentName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Available
                          </p>
                        </div>
                        {selectedAgentForService?._id === agent._id && (
                          <Check className="text-primary h-4 w-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                      <User className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        No agents available for this service
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // Single agent selection
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {agents.map((agent) => {
            const canPerformServices = canAgentPerformServices(agent)
            const unavailableServices = getUnavailableServices(agent)

            return (
              <div
                key={agent._id}
                onClick={() => {
                  if (canPerformServices) {
                    setSelectedAgent(agent)
                  }
                }}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all duration-200",
                  canPerformServices
                    ? selectedAgent?._id === agent._id
                      ? "border-primary bg-primary/5 ring-primary/20 cursor-pointer shadow-md ring-2 hover:shadow-md active:scale-95"
                      : "border-border bg-card hover:bg-accent/50 cursor-pointer hover:shadow-md active:scale-95"
                    : "cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60",
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-muted relative h-14 w-14 overflow-hidden rounded-full shadow-sm">
                    {agent.profileImage ? (
                      <Image
                        src={
                          typeof agent.profileImage === "string"
                            ? agent.profileImage
                            : agent.profileImage.url
                        }
                        alt={agent.agentName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="text-muted-foreground h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "truncate text-base font-semibold",
                        !canPerformServices && "text-gray-500",
                      )}
                    >
                      {agent.agentName}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        canPerformServices
                          ? "text-muted-foreground"
                          : "text-gray-400",
                      )}
                    >
                      {canPerformServices
                        ? "Professional Agent"
                        : "Unavailable"}
                    </p>
                    {selectedAgent?._id === agent._id && canPerformServices && (
                      <div className="mt-2 flex items-center gap-1">
                        <Check className="text-primary h-4 w-4" />
                        <span className="text-primary text-xs font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                    {!canPerformServices && unavailableServices.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Can&apos;t do:{" "}
                          {unavailableServices.map((s) => s.name).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
