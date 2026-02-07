"use client"

import { Card, CardContent } from "../ui/card"
import { CalendarIcon } from "lucide-react"

export default function BookingCTA() {
  return (
    <Card className="border-2 border-dashed border-green-500 bg-green-50/50 backdrop-blur-sm">
      <CardContent className="p-4 text-center">
        <h3 className="mb-1 flex items-center justify-center gap-2 text-base font-semibold text-green-700">
          <CalendarIcon aria-hidden="true" />
          Ready to book?
        </h3>
        <p className="text-muted-foreground text-xs">
          Choose one of our services and schedule your appointment
        </p>
      </CardContent>
    </Card>
  )
}
