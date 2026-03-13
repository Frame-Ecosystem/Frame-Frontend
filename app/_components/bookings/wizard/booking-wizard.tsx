"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { toast } from "sonner"
import { useAuth } from "../../../_providers/auth"
import { loungeService } from "../../../_services/lounge.service"
import { bookingService } from "../../../_services/booking.service"
import { isAuthError } from "../../../_services/api"
import type {
  CreateBookingInput,
  CenterService,
  LoungeAgent,
} from "../../../_types"
import { BookingProgress } from "./booking-progress"
import { BookingNavigation } from "./booking-navigation"
import { BookingDateTimeStep } from "./booking-datetime-step"
import { BookingAgentStep } from "./booking-agent-step"
import { BookingPreviewStep } from "./booking-preview-step"
import {
  canAgentPerformAllServices,
  getUnavailableServices,
  getAvailableAgentsForService,
} from "./_lib/booking-wizard-utils"

interface BookingWizardProps {
  onSuccess?: () => void
  onCancel?: () => void
  loungeId?: string
  preSelectedServices?: CenterService[]
}

type BookingStep = "datetime" | "agent" | "preview"

export function BookingWizard({
  onSuccess,
  onCancel,
  loungeId,
  preSelectedServices = [],
}: BookingWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<BookingStep>("agent")
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Date & Time
  const [bookingDate, setBookingDate] = useState<Date>()
  const [bookingTime, setBookingTime] = useState<string>("")
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  // Step 2: Agent Selection
  const [agents, setAgents] = useState<LoungeAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<LoungeAgent | null>(null)
  const [selectedAgents, setSelectedAgents] = useState<{
    [serviceId: string]: LoungeAgent | undefined
  }>({})
  const [useMultipleAgents, setUseMultipleAgents] = useState(false)

  // Step 3: Preview & Notes
  const [notes, setNotes] = useState("")

  // Availability data
  const [availability, setAvailability] = useState<{
    unavailableSlots: any[]
    loungeOpeningHours: any
  }>({
    unavailableSlots: [],
    loungeOpeningHours: {},
  })
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)

  // Services data
  const [selectedServices, setSelectedServices] = useState<CenterService[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  // Initialize selected services from pre-selected services
  useEffect(() => {
    if (preSelectedServices.length > 0) {
      setSelectedServices(preSelectedServices)
    }
  }, [preSelectedServices])

  // Load agents for the lounge
  useEffect(() => {
    const loadAgents = async () => {
      if (!loungeId) {
        return
      }

      try {
        const agentsResponse = await loungeService.getAgentsByLoungeId(loungeId)

        if (agentsResponse && agentsResponse.agents) {
          const filteredAgents = agentsResponse.agents.filter(
            (agent) => !agent.isBlocked,
          )
          setAgents(filteredAgents)
        } else {
          console.warn("No agents found for lounge:", loungeId)
          setAgents([])
        }
      } catch (agentsError) {
        if (isAuthError(agentsError)) return
        console.error("Failed to load agents:", agentsError)
        setAgents([])
      }
    }

    loadAgents()
  }, [loungeId])

  // Load availability when agents are selected
  useEffect(() => {
    const loadAvailability = async () => {
      let agentIds: string[] = []

      if (useMultipleAgents) {
        // Get all selected agents for multiple agent mode
        agentIds = Object.values(selectedAgents)
          .filter((agent): agent is LoungeAgent => agent !== undefined)
          .map((agent) => agent._id)
      } else if (selectedAgent) {
        // Get single selected agent
        agentIds = [selectedAgent._id]
      }

      if (agentIds.length === 0) {
        setAvailability({
          unavailableSlots: [],
          loungeOpeningHours: {},
        })
        return
      }

      setIsLoadingAvailability(true)
      try {
        const availabilityData = await bookingService.getAvailability(agentIds)
        setAvailability(availabilityData)
      } catch (error) {
        if (isAuthError(error)) return
        console.error("Failed to load availability:", error)
        setAvailability({
          unavailableSlots: [],
          loungeOpeningHours: {},
        })
      } finally {
        setIsLoadingAvailability(false)
      }
    }

    loadAvailability()
  }, [selectedAgent, selectedAgents, useMultipleAgents])

  // Calculate total price and duration when selected services change
  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0,
    )
    setTotalPrice(total)

    const duration = selectedServices.reduce(
      (sum, service) => sum + (service.durationMinutes || 0),
      0,
    )
    setTotalDuration(duration)
  }, [selectedServices])

  // Helper function to check if agent can perform selected services
  const canAgentPerformServices = useCallback(
    (agent: LoungeAgent): boolean => {
      return canAgentPerformAllServices(agent, selectedServices)
    },
    [selectedServices],
  )

  // Determine if multiple agents are needed
  useEffect(() => {
    if (agents.length > 0 && selectedServices.length > 0) {
      const availableAgents = agents.filter((agent) =>
        canAgentPerformServices(agent),
      )
      setUseMultipleAgents(
        availableAgents.length === 0 && selectedServices.length > 1,
      )
    }
  }, [agents, selectedServices, canAgentPerformServices])

  const handleSubmit = async () => {
    // Basic validation
    if (
      !user ||
      !loungeId ||
      !bookingDate ||
      !bookingTime ||
      selectedServices.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and select at least one service",
      )
      return
    }

    // Agent validation based on mode
    if (useMultipleAgents) {
      // For multiple agents, check if all services have agents assigned
      const allServicesAssigned = selectedServices.every(
        (service) => selectedAgents[service.id],
      )
      if (!allServicesAssigned) {
        toast.error("Please assign an agent to each service")
        return
      }
    } else {
      // For single agent mode, check if an agent is selected
      if (!selectedAgent || !selectedAgent._id) {
        toast.error("Please select an agent")
        return
      }
    }

    const userId = user._id
    if (!userId) {
      toast.error("User ID not found. Please try logging in again.")
      return
    }

    setIsLoading(true)
    try {
      // Prepare agent IDs based on selection mode
      let agentIds: string[] = []
      if (useMultipleAgents) {
        // Multiple agents - one per service
        agentIds = Object.values(selectedAgents)
          .filter((agent): agent is LoungeAgent => agent !== undefined)
          .map((agent) => agent._id)
      } else if (selectedAgent) {
        // Single agent
        if (selectedAgent._id) {
          agentIds = [selectedAgent._id]
        }
      }

      if (agentIds.length === 0) {
        toast.error(
          "No valid agents selected. Please select agents for your booking.",
        )
        setIsLoading(false)
        return
      }

      const bookingData: CreateBookingInput = {
        clientId: userId,
        loungeId: loungeId,
        agentIds: agentIds.length > 0 ? agentIds : undefined,
        loungeServiceIds: selectedServices.map((service) => service.id),
        bookingDate: new Date(
          bookingDate.getFullYear(),
          bookingDate.getMonth(),
          bookingDate.getDate(),
          parseInt(bookingTime.split(":")[0]),
          parseInt(bookingTime.split(":")[1]),
        ).toISOString(),
        notes: notes.trim() || undefined,
      }

      await bookingService.create(bookingData)
      toast.success("Booking created successfully!")
      onSuccess?.()
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to create booking:", error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === "agent") {
      if (useMultipleAgents) {
        // For multiple agents, check if all services have agents assigned
        const allServicesAssigned = selectedServices.every(
          (service) => selectedAgents[service.id],
        )
        if (!allServicesAssigned) {
          toast.error("Please assign an agent to each service")
          return
        }
      } else {
        // For single agent, check if there are available agents
        const availableAgents = agents.filter((agent) =>
          canAgentPerformServices(agent),
        )
        if (availableAgents.length > 0 && !selectedAgent) {
          toast.error("Please select an agent")
          return
        }
      }
    }
    if (currentStep === "datetime" && (!bookingDate || !bookingTime)) {
      toast.error("Please select a date and time")
      return
    }

    if (currentStep === "agent") setCurrentStep("datetime")
    else if (currentStep === "datetime") setCurrentStep("preview")
  }

  const prevStep = () => {
    if (currentStep === "datetime") setCurrentStep("agent")
    else if (currentStep === "preview") setCurrentStep("datetime")
  }

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    switch (currentStep) {
      case "datetime":
        return !!(bookingDate && bookingTime)
      case "agent":
        if (useMultipleAgents) {
          // For multiple agents, check if all services have agents assigned
          return selectedServices.every((service) => selectedAgents[service.id])
        } else {
          // For single agent, check if there are available agents and one is selected
          const availableAgents = agents.filter((agent) =>
            canAgentPerformServices(agent),
          )
          return availableAgents.length === 0 || !!selectedAgent
        }
      case "preview":
        // Preview step is always valid (validation happens on submit)
        return true
      default:
        return false
    }
  }, [
    currentStep,
    bookingDate,
    bookingTime,
    useMultipleAgents,
    selectedServices,
    selectedAgents,
    agents,
    selectedAgent,
    canAgentPerformServices,
  ])

  return (
    <div className="mx-auto mb-20 w-full max-w-sm overflow-x-hidden px-4 sm:max-w-lg sm:px-6 lg:max-w-2xl">
      {/* Progress Indicator - Mobile First */}
      <BookingProgress currentStep={currentStep} />

      {/* Step Content */}
      <Card className="w-full max-w-full shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">
            {currentStep === "datetime" && "Select Date & Time"}
            {currentStep === "agent" && "Choose Your Agent"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Step 1: Date & Time Selection */}
          {currentStep === "datetime" && (
            <BookingDateTimeStep
              bookingDate={bookingDate}
              setBookingDate={setBookingDate}
              bookingTime={bookingTime}
              setBookingTime={setBookingTime}
              isDatePopoverOpen={isDatePopoverOpen}
              setIsDatePopoverOpen={setIsDatePopoverOpen}
              availability={availability}
              isLoadingAvailability={isLoadingAvailability}
            />
          )}

          {/* Step 2: Agent Selection */}
          {currentStep === "agent" && (
            <BookingAgentStep
              selectedServices={selectedServices}
              agents={agents}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              selectedAgents={selectedAgents}
              setSelectedAgents={setSelectedAgents}
              useMultipleAgents={useMultipleAgents}
              canAgentPerformServices={canAgentPerformServices}
              getUnavailableServices={(agent) =>
                getUnavailableServices(agent, selectedServices)
              }
              getAvailableAgentsForService={(serviceId) =>
                getAvailableAgentsForService(agents, serviceId)
              }
            />
          )}

          {/* Step 3: Preview & Confirm */}
          {currentStep === "preview" && (
            <BookingPreviewStep
              bookingDate={bookingDate}
              bookingTime={bookingTime}
              selectedServices={selectedServices}
              selectedAgent={selectedAgent}
              selectedAgents={selectedAgents}
              useMultipleAgents={useMultipleAgents}
              totalPrice={totalPrice}
              totalDuration={totalDuration}
              notes={notes}
              setNotes={setNotes}
            />
          )}

          {/* Navigation Buttons */}
          <BookingNavigation
            currentStep={currentStep}
            isLoading={isLoading}
            isStepValid={isCurrentStepValid()}
            {...(onCancel && { onCancel })}
            onPrevStep={prevStep}
            onNextStep={nextStep}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
