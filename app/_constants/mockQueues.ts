export interface QueuePerson {
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

export interface Queue {
  id: string
  name: string
  agentId?: string
  serviceType?: string
  people: QueuePerson[]
}

// Mock data for demonstration
export const MOCK_QUEUES: Queue[] = [
  {
    id: "main",
    name: "Main Queue",
    people: [
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
    ],
  },
]
