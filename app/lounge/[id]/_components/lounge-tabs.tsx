"use client"

import { useState } from "react"
import { InfoIcon, FileText, Film, CalendarIcon, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import OpeningHours from "@/app/_components/forms/opening-hours"
import DisplayLocation from "@/app/_components/lounges/display-location"
import Extras from "@/app/_components/common/extras"
import ContactInfo from "@/app/_components/common/profile-display/contact-info"
import OurServices from "@/app/_components/services/our-services"
import QueueDisplay from "@/app/_components/queue/queue-display"
import { UserPostsTab } from "@/app/_components/profile/user-posts-tab"
import { UserReelsTab } from "@/app/_components/profile/user-reels-tab"
import type { LoungeDetail } from "../_lib/use-lounge-data"

// ── Types & Constants ───────────────────────────────────────────

type Tab = "info" | "posts" | "reels" | "services" | "queue"

const TABS: {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "info", label: "Info", icon: InfoIcon },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "reels", label: "Reels", icon: Film },
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

function InfoTab({ lounge }: { lounge: LoungeDetail }) {
  const hasContact = (lounge.phones && lounge.phones.length > 0) || lounge.email

  return (
    <div className="space-y-4">
      {hasContact && (
        <ContactInfo phones={lounge.phones} email={lounge.email} />
      )}

      {lounge.openingHours && (
        <OpeningHours openingHours={lounge.openingHours} />
      )}

      {(lounge.latitude || lounge.longitude) && (
        <DisplayLocation
          latitude={lounge.latitude}
          longitude={lounge.longitude}
          address={lounge.address || "No address available"}
        />
      )}

      <Extras />
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
      return <InfoTab lounge={lounge} />
    case "services":
      return <OurServices services={lounge.services} center={lounge} />
    case "posts":
      return <UserPostsTab userId={loungeId} />
    case "reels":
      return <UserReelsTab userId={loungeId} />
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
