"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { useAuth } from "@/app/_auth"
import { loungeService } from "../../_services"
import { isAuthError } from "../../_services/api"
import { useTranslation } from "@/app/_i18n"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

interface TimeSlot {
  from: string
  to: string
}

interface OpeningHours {
  [key: string]: TimeSlot
}

export function OpeningHoursSelector() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [openingHours, setOpeningHours] = useState<OpeningHours>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      // Load opening hours from user object and clean _id field
      const userOpeningHours = (user as any)?.openingHours || {}
      const cleanedEntries = Object.entries(userOpeningHours).filter(
        ([key]) => key !== "_id",
      )
      const cleanedHours = Object.fromEntries(cleanedEntries) as OpeningHours
      setOpeningHours(cleanedHours)
    }
  }, [open, user])

  const handleTimeChange = (
    day: string,
    field: "from" | "to",
    value: string,
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleToggleDay = (day: string) => {
    setOpeningHours((prev) => {
      const newHours = { ...prev }
      const isClosed =
        newHours[day]?.from === "00:00" && newHours[day]?.to === "00:00"
      if (newHours[day] && !isClosed) {
        // Mark as closed with 00:00 - 00:00
        newHours[day] = { from: "00:00", to: "00:00" }
      } else {
        // Open with default hours
        newHours[day] = { from: "09:00", to: "18:00" }
      }
      return newHours
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const loungeId = user?._id
      if (!loungeId) {
        toast.error(t("openingHours.userIdNotFound"))
        return
      }

      // Remove _id field if it exists (from database response)
      const cleanedEntries = Object.entries(openingHours).filter(
        ([key]) => key !== "_id",
      )
      const cleanedOpeningHours = Object.fromEntries(cleanedEntries)

      await loungeService.updateOpeningHours(loungeId, cleanedOpeningHours)

      // Refresh user data to sync opening hours
      await refreshUser()

      toast.success(t("openingHours.updated"))
      setOpen(false)
    } catch (error) {
      if (isAuthError(error)) return
      console.error("Failed to update opening hours:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t("openingHours.updateFailed"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="border-border hover:bg-card/50 flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="text-muted-foreground h-5 w-5" />
            <span className="font-medium">{t("openingHours.title")}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {(() => {
              const userHours = (user as any)?.openingHours || {}
              const cleanEntries = Object.entries(userHours).filter(
                ([key]) => key !== "_id",
              )
              const daysCount = cleanEntries.length
              return daysCount > 0
                ? `${daysCount} days configured`
                : "Not configured"
            })()}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("openingHours.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {DAYS.map((day) => (
            <div key={day} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="capitalize">{day}</Label>
                <Button
                  type="button"
                  variant={
                    openingHours[day]?.from === "00:00" &&
                    openingHours[day]?.to === "00:00"
                      ? "outline"
                      : "default"
                  }
                  size="sm"
                  onClick={() => handleToggleDay(day)}
                >
                  {openingHours[day]?.from === "00:00" &&
                  openingHours[day]?.to === "00:00"
                    ? t("openingHours.closed")
                    : t("openingHours.open")}
                </Button>
              </div>
              {openingHours[day] &&
                openingHours[day].from !== "00:00" &&
                openingHours[day].to !== "00:00" && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">
                        {t("openingHours.from")}
                      </Label>
                      <Input
                        type="time"
                        value={openingHours[day]?.from || "09:00"}
                        onChange={(e) =>
                          handleTimeChange(day, "from", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">{t("openingHours.to")}</Label>
                      <Input
                        type="time"
                        value={openingHours[day]?.to || "18:00"}
                        onChange={(e) =>
                          handleTimeChange(day, "to", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? t("openingHours.saving") : t("openingHours.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
