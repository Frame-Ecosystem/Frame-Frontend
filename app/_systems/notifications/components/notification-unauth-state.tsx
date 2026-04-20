"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"

interface NotificationUnauthStateProps {
  t: (key: string) => string
}

export function NotificationUnauthState({ t }: NotificationUnauthStateProps) {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <Card className="from-card/50 to-card/30 overflow-hidden border-0 bg-linear-to-br backdrop-blur-sm">
          <CardContent className="relative p-8 text-center lg:p-16">
            <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent" />
            <div className="relative z-10">
              <div className="from-primary/20 to-primary/10 mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                <Bell className="text-primary h-16 w-16" />
              </div>
              <h3 className="mb-4 text-2xl font-bold lg:text-3xl">
                {t("notifications.signInTitle")}
              </h3>
              <p className="text-muted-foreground mx-auto mb-8 max-w-md lg:text-lg">
                {t("notifications.signInDesc")}
              </p>
              <Button size="lg" variant="default" className="shadow-lg" asChild>
                <Link href="/">{t("notifications.signIn")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
