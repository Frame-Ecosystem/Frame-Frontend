"use client"

import { Check } from "lucide-react"
import { cn } from "@/app/_lib/utils"

type BookingStep = "datetime" | "agent" | "preview"

interface BookingProgressProps {
  currentStep: BookingStep
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Step 1 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 sm:h-8 sm:w-8",
              currentStep === "datetime"
                ? "bg-primary text-primary-foreground shadow-lg"
                : ["datetime", "agent", "preview"].indexOf(currentStep) > 0
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {["datetime", "agent", "preview"].indexOf(currentStep) >= 0 ? (
              <Check className="h-5 w-5 sm:h-4 sm:w-4" />
            ) : (
              "1"
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span
              className={cn(
                "text-base font-medium sm:text-sm",
                currentStep === "datetime"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              Select Date & Time
            </span>
            <span className="text-muted-foreground text-xs sm:hidden">
              Choose your preferred date and time
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 sm:h-8 sm:w-8",
              currentStep === "agent"
                ? "bg-primary text-primary-foreground shadow-lg"
                : currentStep === "preview"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {["datetime", "agent", "preview"].indexOf(currentStep) >= 1 ? (
              <Check className="h-5 w-5 sm:h-4 sm:w-4" />
            ) : (
              "2"
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span
              className={cn(
                "text-base font-medium sm:text-sm",
                currentStep === "agent"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              Choose Agent
            </span>
            <span className="text-muted-foreground text-xs sm:hidden">
              Select your preferred agent
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 sm:h-8 sm:w-8",
              currentStep === "preview"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-muted text-muted-foreground",
            )}
          >
            3
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span
              className={cn(
                "w-fill text-base font-medium sm:text-sm",
                currentStep === "preview"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              Confirm Booking
            </span>
            <span className="text-muted-foreground text-xs sm:hidden">
              Review and confirm your booking
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-muted h-3 w-full rounded-full shadow-inner">
        <div
          className="bg-primary h-3 rounded-full shadow-sm transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === "datetime"
                ? "33%"
                : currentStep === "agent"
                  ? "66%"
                  : "100%",
          }}
        />
      </div>
    </div>
  )
}
