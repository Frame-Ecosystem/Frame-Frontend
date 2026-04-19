"use client"

import { Button } from "@/app/_components/ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useTranslation } from "@/app/_i18n"

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
  const { t } = useTranslation()
  return (
    <div className="flex gap-3 pt-4 sm:justify-between sm:gap-4 sm:pt-3">
      <Button
        variant={currentStep === "agent" ? "destructive" : "outline"}
        onClick={currentStep === "agent" ? onCancel || (() => {}) : onPrevStep}
        disabled={isLoading}
        className="h-12 flex-1 font-medium shadow-sm transition-all hover:shadow-md sm:h-10 sm:w-auto sm:flex-none"
      >
        {currentStep === "agent" ? (
          t("booking.nav.cancel")
        ) : (
          <div className="flex w-full items-center justify-between">
            <ChevronLeft className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
            <span className="flex-1 text-center">{t("booking.nav.back")}</span>
          </div>
        )}
      </Button>

      {currentStep === "preview" ? (
        <Button
          variant="success"
          onClick={onSubmit}
          disabled={isLoading}
          className="h-12 flex-1 font-medium shadow-sm transition-all hover:shadow-md sm:h-10 sm:w-auto sm:flex-none"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-pulse rounded-full bg-green-300" />
              {t("booking.nav.creating")}
            </>
          ) : (
            <div className="flex w-full items-center justify-between">
              <span className="flex-1 text-center">
                {t("booking.nav.confirmBooking")}
              </span>
              <Check className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
            </div>
          )}
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={onNextStep}
          disabled={isLoading || !isStepValid}
          className="h-12 flex-1 font-medium shadow-sm transition-all hover:shadow-md sm:h-10 sm:w-auto sm:flex-none"
        >
          <div className="flex w-full items-center justify-between">
            <span className="flex-1 text-center">{t("booking.nav.next")}</span>
            <ChevronRight className="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
          </div>
        </Button>
      )}
    </div>
  )
}
