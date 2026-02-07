"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  CalendarClock,
} from "lucide-react"

interface QueuePerson {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  position: number
  estimatedWaitMinutes: number
  service: string
  status: "waiting" | "in-service" | "completed"
  joinedAt: string
}

// Mock data for demonstration
const MOCK_QUEUE: QueuePerson[] = [
  {
    id: "1",
    name: "John Smith",
    initials: "JS",
    avatarUrl: "/images/placeholder.png",
    position: 1,
    estimatedWaitMinutes: 5,
    service: "Haircut & Styling",
    status: "in-service",
    joinedAt: "2:30 PM",
  },
  {
    id: "2",
    name: "Maria Garcia",
    initials: "MG",
    position: 2,
    estimatedWaitMinutes: 25,
    service: "Hair Coloring",
    status: "waiting",
    joinedAt: "2:45 PM",
  },
  {
    id: "3",
    name: "David Chen",
    initials: "DC",
    position: 3,
    estimatedWaitMinutes: 40,
    service: "Beard Trim",
    status: "waiting",
    joinedAt: "2:50 PM",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    initials: "SJ",
    position: 4,
    estimatedWaitMinutes: 55,
    service: "Full Service",
    status: "waiting",
    joinedAt: "3:00 PM",
  },
  {
    id: "5",
    name: "Michael Brown",
    initials: "MB",
    position: 5,
    estimatedWaitMinutes: 75,
    service: "Haircut",
    status: "waiting",
    joinedAt: "3:10 PM",
  },
]

interface QueueDisplayProps {
  queueData?: QueuePerson[]
  centerName?: string
}

export default function QueueDisplay({
  queueData = MOCK_QUEUE,
  centerName,
}: QueueDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const inService = queueData.filter((p) => p.status === "in-service")
  const waiting = queueData.filter((p) => p.status === "waiting")
  const totalWaiting = waiting.length
  const averageWait =
    totalWaiting > 0
      ? Math.round(
          waiting.reduce((sum, p) => sum + p.estimatedWaitMinutes, 0) /
            totalWaiting,
        )
      : 0

  const getStatusColor = (status: QueuePerson["status"]) => {
    switch (status) {
      case "in-service":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "waiting":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted"
    }
  }

  const getStatusIcon = (status: QueuePerson["status"]) => {
    switch (status) {
      case "in-service":
        return <TrendingUp className="h-3 w-3" />
      case "waiting":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Queue Stats Header */}
      <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-3">
                <Users className="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Live Queue</h3>
                <p className="text-muted-foreground text-sm">
                  {centerName || "Current status"}
                </p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base">
              {totalWaiting} waiting
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-2">
                <Clock className="text-primary h-4 w-4" />
                <p className="text-muted-foreground text-xs font-medium">
                  Avg Wait
                </p>
              </div>
              <p className="text-2xl font-bold">{averageWait} min</p>
            </div>
            <div className="bg-card/50 rounded-lg border p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-muted-foreground text-xs font-medium">
                  In Service
                </p>
              </div>
              <p className="text-2xl font-bold">{inService.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full cursor-pointer items-center justify-between transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="text-primary h-5 w-5" />
              <h3 className="text-lg font-semibold">Queue Details</h3>
            </div>
            <ChevronDown
              className={`text-muted-foreground h-5 w-5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3 pt-0">
            {queueData.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
                <p className="text-muted-foreground">No one in queue</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Be the first to join!
                </p>
              </div>
            ) : (
              queueData.map((person) => (
                <div
                  key={person.id}
                  className={`group relative rounded-xl border p-4 transition-all hover:shadow-md ${
                    person.status === "in-service"
                      ? "border-blue-500/30 bg-blue-500/5"
                      : "bg-card hover:border-primary/30"
                  }`}
                >
                  {/* Position Badge */}
                  <div className="bg-primary text-primary-foreground absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg">
                    #{person.position}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="border-primary/20 h-12 w-12 border-2">
                      <AvatarImage src={person.avatarUrl} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold">
                            {person.name}
                          </h4>
                          <p className="text-muted-foreground truncate text-sm">
                            {person.service}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${getStatusColor(person.status)}`}
                        >
                          {getStatusIcon(person.status)}
                          <span className="ml-1 capitalize">
                            {person.status.replace("-", " ")}
                          </span>
                        </Badge>
                      </div>

                      {/* Wait Time & Joined */}
                      <div className="mt-2 flex items-center gap-4">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            {person.status === "in-service"
                              ? "In progress"
                              : `~${person.estimatedWaitMinutes} min wait`}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Joined at {person.joinedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* Join Queue CTA */}
      <Card className="border-primary/30 bg-primary/5 border-2 border-dashed">
        <CardContent className="p-6 text-center">
          <Users className="text-primary mx-auto mb-3 h-8 w-8" />
          <h3 className="mb-2 font-semibold">Want to join the queue?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Reserve your spot and get real-time updates
          </p>
          <Button className="w-full sm:w-auto">Join Queue Now</Button>
        </CardContent>
      </Card>
    </div>
  )
}
