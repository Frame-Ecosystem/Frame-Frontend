"use client"

import { useState } from "react"
import { InfoIcon, Film, CalendarIcon, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import type { LoungeDetail } from "../_lib/use-lounge-data"

// ── Types & Constants ───────────────────────────────────────────

type Tab = "info" | "reels" | "services" | "queue"

const TABS: {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "info", label: "Info", icon: InfoIcon },
  { id: "reels", label: "Portfolio", icon: Film },
  { id: "services", label: "Services", icon: CalendarIcon },
  { id: "queue", label: "Queue", icon: Users },
]

// ── Sub-components ──────────────────────────────────────────────

function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}) {
  return (
    <div className="flex justify-center gap-1">
      {TABS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          className={`px-4 py-2 ${activeTab === id ? "border-primary border-b-1" : ""}`}
          onClick={() => onTabChange(id)}
        >
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  )
}

function InfoTab() {
  return null
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
      return <InfoTab />
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
