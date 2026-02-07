"use client"

import { Card, CardContent } from "./ui/card"
import { CalendarIcon } from "lucide-react"

export default function BookingCTA() {
  return (
    <Card className="from-primary/10 to-primary/5 border-primary/20 bg-linear-to-br backdrop-blur-sm">
      <CardContent className="p-6 text-center">
        <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold">
          <CalendarIcon aria-hidden="true" />
          Ready to book?
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Choose one of our services and schedule your appointment
        </p>
      </CardContent>
    </Card>
  )
}
