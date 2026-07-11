"use client"

import Link from "next/link"
import { CalendarIcon, Search } from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"

interface EmptyBookingsStateProps {
  mode?: "active" | "history"
}

export function EmptyBookingsState({
  mode = "active",
}: EmptyBookingsStateProps) {
  const { t } = useTranslation()
  const isHistory = mode === "history"

  return (
    <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
      <CardContent className="relative p-8 text-center lg:p-16">
        <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent" />
        <div className="relative z-10">
          <div
            className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br shadow-lg ${
              isHistory
                ? "from-muted/50 to-muted/30"
                : "from-primary/20 to-primary/10"
            }`}
          >
            <CalendarIcon
              className={`h-12 w-12 ${
                isHistory ? "text-muted-foreground" : "text-primary"
              }`}
            />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {isHistory
              ? t("bookings.noBookings")
              : t("bookings.emptyActiveTitle")}
          </h3>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">
            {isHistory
              ? t("bookings.emptyHistoryDesc")
              : t("bookings.emptyActiveDesc")}
          </p>
          {!isHistory && (
            <Button
              size="lg"
              variant="default"
              className="mt-8 shadow-lg"
              asChild
            >
              <Link href="/lounges">
                <Search className="me-2 h-5 w-5" />
                {t("bookings.bookNow")}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
