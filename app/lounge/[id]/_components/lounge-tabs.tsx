"use client"

import { useState } from "react"
import { InfoIcon, Film, Scissors, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import { OpeningHoursDisplay } from "@/app/_core/components/forms/opening-hours-display"
import { LocationCard } from "@/app/_core/components/forms/location-card"
import { ContactCard } from "@/app/_core/components/forms/contact-card"
import { ExtrasCard } from "@/app/_core/components/forms/extras-card"
import { useVisitorLoungeExtras } from "@/app/_systems/extras/hooks/useExtras"
import { useTranslation } from "@/app/_i18n"
import type { LoungeDetail } from "../_lib/use-lounge-data"

// ── Types & Constants ───────────────────────────────────────────

type Tab = "info" | "reels" | "services" | "queue"

const TABS: {
  id: Tab
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "info", labelKey: "lounge.tabInfo", icon: InfoIcon },
  { id: "reels", labelKey: "lounge.tabPortfolio", icon: Film },
  { id: "services", labelKey: "lounge.tabServices", icon: Scissors },
  { id: "queue", labelKey: "lounge.tabQueue", icon: Users },
]

// ── Sub-components ──────────────────────────────────────────────

function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex justify-center gap-1">
      {TABS.map(({ id, labelKey, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          className={`px-4 py-2 ${activeTab === id ? "border-primary border-b-1" : ""}`}
          onClick={() => onTabChange(id)}
        >
          <Icon className="mr-2 h-4 w-4" />
          {t(labelKey)}
        </Button>
      ))}
    </div>
  )
}

function InfoTab({
  lounge,
  loungeId,
}: {
  lounge: LoungeDetail
  loungeId: string
}) {
  const { data: apiExtras, isLoading } = useVisitorLoungeExtras(loungeId)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {lounge.openingHours && (
        <div className="min-w-0 flex-1">
          <OpeningHoursDisplay openingHours={lounge.openingHours} compact />
        </div>
      )}
      {(lounge.latitude || lounge.longitude) && (
        <div className="min-w-0 flex-1">
          <LocationCard
            address={lounge.address || ""}
            latitude={lounge.latitude}
            longitude={lounge.longitude}
          />
        </div>
      )}
      {(lounge.phoneNumber || lounge.phones?.length || lounge.email) && (
        <div className="min-w-0 flex-1">
          <ContactCard
            phone={
              lounge.phoneNumber ||
              (lounge.phones?.length ? lounge.phones[0] : undefined)
            }
            email={lounge.email}
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {apiExtras && apiExtras.length > 0 && <ExtrasCard extras={apiExtras} />}
        {isLoading && (
          <div className="text-muted-foreground flex items-center justify-center rounded-xl border py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

function TabContent({
  activeTab,
  lounge,
  loungeId,
}: {
  activeTab: Tab
  lounge: LoungeDetail
  loungeId: string
}) {
  switch (activeTab) {
    case "info":
      return <InfoTab lounge={lounge} loungeId={loungeId} />
    case "services":
      return <OurServices services={lounge.services} center={lounge} />
    case "reels":
      return <UserReelsTab userId={loungeId} isLounge />
    case "queue":
      return (
        <QueueDisplay
          centerName={lounge.name}
          mode="client"
          loungeId={loungeId}
          key={`queue-${loungeId}`}
        />
      )
  }
}

// ── Main Export ──────────────────────────────────────────────────

export function LoungeTabs({
  lounge,
  loungeId,
}: {
  lounge: LoungeDetail
  loungeId: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>("info")

  const nav = <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
  const content = (
    <TabContent activeTab={activeTab} lounge={lounge} loungeId={loungeId} />
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Card className="border-0 bg-transparent backdrop-blur-sm">
          <CardHeader>
            <div className="mt-4">{nav}</div>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-4">{nav}</div>
        {content}
      </div>
    </>
  )
}
