"use client"

import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/app/_lib/utils"

type BookingStep = "datetime" | "agent" | "preview"

interface BookingNavigationProps {
  currentStep: BookingStep
  isLoading: boolean
  isStepValid?: boolean
  onCancel?: () => void
  onPrevStep: () => void
  onNextStep: () => void
  onSubmit: () => void
}

export function BookingNavigation({
  currentStep,
  isLoading,
  isStepValid = true,
  onCancel,
  onPrevStep,
  onNextStep,
  onSubmit,
}: BookingNavigationProps) {
  return (
    <div className="flex gap-3 pt-4 sm:justify-between sm:gap-4 sm:pt-3">
      <Button
        variant="outline"
        onClick={currentStep === "agent" ? onCancel || (() => {}) : onPrevStep}
        disabled={isLoading}
        className={cn(
          "h-12 flex-1 font-medium shadow-sm transition-all hover:shadow-md sm:h-10 sm:w-auto sm:flex-none",
          currentStep === "agent"
            ? "border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
            : "border-gray-500 text-gray-600 hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100",
        )}
      >
        {currentStep === "agent" ? (
          "Cancel"
        ) : (
          <div className="flex w-full items-center justify-between">
            <ChevronLeft className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
            <span className="flex-1 text-center">Back</span>
          </div>
        )}
      </Button>

      {currentStep === "preview" ? (
        <Button
          variant="outline"
          onClick={onSubmit}
          disabled={isLoading}
          className="h-12 flex-1 border-green-500 bg-green-50 font-medium text-green-700 shadow-sm transition-all hover:bg-green-100 hover:text-green-800 hover:shadow-md active:bg-green-200 sm:h-10 sm:w-auto sm:flex-none"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
              Creating...
            </>
          ) : (
            <div className="flex w-full items-center justify-between">
              <span className="flex-1 text-center">Confirm Booking</span>
              <Check className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
            </div>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={isLoading || !isStepValid}
          className={cn(
            "h-12 flex-1 font-medium shadow-sm transition-all hover:shadow-md sm:h-10 sm:w-auto sm:flex-none",
            !isStepValid
              ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400"
              : "border-primary bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30",
          )}
        >
          <div className="flex w-full items-center justify-between">
            <span className="flex-1 text-center">Next</span>
            <ChevronRight className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
          </div>
        </Button>
      )}
    </div>
  )
}
