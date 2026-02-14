"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon, User, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/app/_lib/utils"
import { toast } from "sonner"
import { useAuth } from "../../_providers/auth"
import { loungeService } from "../../_services/lounge.service"
import { bookingService } from "../../_services/booking.service"
import type {
  CreateBookingInput,
  CenterService,
  LoungeAgent,
} from "../../_types"
import { BookingProgress } from "./booking-progress"
import { BookingNavigation } from "./booking-navigation"
import Image from "next/image"

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
  const [currentStep, setCurrentStep] = useState<BookingStep>("datetime")
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Date & Time
  const [bookingDate, setBookingDate] = useState<Date>()
  const [bookingTime, setBookingTime] = useState<string>("")
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  // Step 2: Agent Selection
  const [agents, setAgents] = useState<LoungeAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<LoungeAgent | null>(null)

  // Step 3: Preview & Notes
  const [notes, setNotes] = useState("")

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
        console.error("Failed to load agents:", agentsError)
        setAgents([])
      }
    }

    loadAgents()
  }, [loungeId])

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

  const handleSubmit = async () => {
    if (
      !user ||
      !loungeId ||
      !bookingDate ||
      !bookingTime ||
      !selectedAgent ||
      !selectedAgent._id ||
      selectedServices.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and select at least one service",
      )
      return
    }

    const userId = user._id
    if (!userId) {
      toast.error("User ID not found. Please try logging in again.")
      return
    }

    setIsLoading(true)
    try {
      const bookingData: CreateBookingInput = {
        clientId: userId,
        loungeId: loungeId,
        agentId: selectedAgent?._id,
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
      console.error("Failed to create booking:", error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === "datetime" && (!bookingDate || !bookingTime)) {
      toast.error("Please select a date and time")
      return
    }
    if (currentStep === "agent" && agents.length > 0 && !selectedAgent) {
      toast.error("Please select an agent")
      return
    }

    if (currentStep === "datetime") setCurrentStep("agent")
    else if (currentStep === "agent") setCurrentStep("preview")
  }

  const prevStep = () => {
    if (currentStep === "agent") setCurrentStep("datetime")
    else if (currentStep === "preview") setCurrentStep("agent")
  }

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ]

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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Date</Label>
                  <Popover
                    open={isDatePopoverOpen}
                    onOpenChange={setIsDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal shadow-sm transition-all hover:shadow-md",
                          !bookingDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {bookingDate
                          ? format(bookingDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingDate}
                        onSelect={(date) => {
                          setBookingDate(date)
                          setIsDatePopoverOpen(false)
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="rounded-md border shadow-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Time</Label>
                  <Select value={bookingTime} onValueChange={setBookingTime}>
                    <SelectTrigger className="h-12 shadow-sm transition-all hover:shadow-md">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time} className="h-10">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bookingDate && bookingTime && (
                <div className="bg-primary/5 border-primary/20 rounded-xl border p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <CalendarIcon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-primary font-medium">
                        Selected: {format(bookingDate, "PPP")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        at {bookingTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Agent Selection */}
          {currentStep === "agent" && (
            <div className="space-y-4">
              <div className="sm:text-left">
                <p className="text-muted-foreground mt-1 text-sm">
                  Choose your preferred agent or skip to any available agent
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent._id}
                    onClick={() => {
                      setSelectedAgent(agent)
                    }}
                    className={cn(
                      "hover:border-primary cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md active:scale-95",
                      selectedAgent?._id === agent._id
                        ? "border-primary bg-primary/5 ring-primary/20 shadow-md ring-2"
                        : "border-border bg-card hover:bg-accent/50",
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
                        <h3 className="truncate text-base font-semibold">
                          {agent.agentName}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Professional Agent
                        </p>
                        {selectedAgent?._id === agent._id && (
                          <div className="mt-2 flex items-center gap-1">
                            <Check className="text-primary h-4 w-4" />
                            <span className="text-primary text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {agents.length === 0 && (
                <div className="text-muted-foreground rounded-xl border-2 border-dashed py-12 text-center">
                  <User className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p className="font-medium">No agents available</p>
                  <p className="mt-1 text-sm">
                    You can proceed without selecting an agent.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Confirm */}
          {currentStep === "preview" && (
            <div className="space-y-4">
              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="border-border resize-none shadow-sm"
                />
              </div>

              {/* Booking Summary */}
              <div className="space-y-3">
                <div className="border-border bg-card space-y-3 rounded-xl border-2 p-4 shadow-sm">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <span className="text-muted-foreground font-medium">
                      Date & Time:
                    </span>
                    <div className="text-left">
                      <p className="font-medium">
                        {bookingDate && format(bookingDate, "PPP")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        at {bookingTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <span className="text-muted-foreground font-medium">
                      Agent:
                    </span>
                    <span className="font-medium">
                      {selectedAgent?.agentName || "Any available agent"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <span className="text-muted-foreground font-medium">
                      Services:
                    </span>
                    <span className="font-medium">
                      {selectedServices.length} service
                      {selectedServices.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="border-border border-t-2 pt-4">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <span className="text-primary text-lg font-bold">
                        Total:
                      </span>
                      <div className="text-right sm:text-left">
                        <span className="text-primary block text-xl font-bold">
                          {totalPrice} dt
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {totalDuration} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <BookingNavigation
            currentStep={currentStep}
            isLoading={isLoading}
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
