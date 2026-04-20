# Bookings System

The bookings system handles appointment scheduling, real-time queue management, and booking lifecycle for the Frame Beauty platform.

---

## Architecture Overview

```mermaid
graph TB
    subgraph BookingsSystem["Bookings System"]
        subgraph Services["Services"]
            BS[BookingService]
            QS[QueueService]
        end

        subgraph Hooks["React Query + Socket Hooks"]
            UQ[useQueue hooks]
            BQ[Booking queries]
        end

        subgraph Components["UI Components"]
            BC[Booking Cards]
            BL[Booking List]
            BW[Booking Wizard]
            QD[Queue Display]
        end
    end

    subgraph RealTime["Real-Time Layer"]
        SK[Socket.IO]
    end

    subgraph External
        API[API Client]
        QC[React Query Cache]
    end

    Services --> API
    Hooks --> Services
    Hooks --> QC
    SK -->|booking:updated| QC
    SK -->|queue:updated| QC
    Components --> Hooks
    BL --> SK
    QD --> SK
```

---

## Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Client creates booking
    pending --> confirmed: Lounge confirms
    pending --> cancelled: Client/Lounge cancels
    confirmed --> inQueue: Added to queue
    confirmed --> cancelled: Client/Lounge cancels
    inQueue --> completed: Service finished
    inQueue --> absent: Client no-show
    completed --> [*]
    cancelled --> [*]
    absent --> [*]
```

---

## Queue Person Status Flow

```mermaid
stateDiagram-v2
    [*] --> waiting: Joins queue
    waiting --> inService: Staff starts service
    waiting --> absent: No-show
    inService --> completed: Service done
    inService --> waiting: Back to waiting
    absent --> waiting: Returned
    completed --> [*]
```

---

## Booking Wizard Flow

```mermaid
flowchart LR
    A[Select Agent] -->|33%| B[Select Date & Time]
    B -->|66%| C[Preview & Confirm]
    C -->|100%| D[Booking Created]

    subgraph AgentStep
        SA[Load lounge agents]
        SB[Check service compatibility]
        SC[Multi-agent toggle]
    end

    subgraph DateTimeStep
        DA[Fetch availability]
        DB[Filter unavailable slots]
        DC[Validate against opening hours]
    end

    subgraph PreviewStep
        PA[Show selected services]
        PB[Show total price & duration]
        PC[Optional notes field]
    end

    A --- AgentStep
    B --- DateTimeStep
    C --- PreviewStep
```

---

## Data Model

```mermaid
classDiagram
    class Booking {
        +string _id
        +User|string clientId
        +string visitorName
        +User|string loungeId
        +string agentId
        +Agent[] agentIds
        +BookingService[] loungeServiceIds
        +BookingStatus status
        +string bookingDate
        +number totalPrice
        +number totalDuration
        +string notes
        +CancelledBy cancelledBy
        +string createdAt
    }

    class BookingService {
        +string loungeServiceId
        +number quantity
        +number price
        +number duration
    }

    class CancelledBy {
        +string idUser
        +string cancelledByName
        +string note
    }

    class Queue {
        +string _id
        +Agent agentId
        +string date
        +QueuePerson[] persons
        +string createdAt
    }

    class QueuePerson {
        +Booking bookingId
        +Client clientId
        +string visitorName
        +number position
        +QueuePersonStatus status
        +string joinedAt
        +string inServiceAt
    }

    class CreateBookingInput {
        +string clientId
        +string loungeId
        +string agentId
        +string[] agentIds
        +string[] loungeServiceIds
        +string bookingDate
        +BookingStatus status
        +number totalPrice
        +number totalDuration
        +string notes
    }

    Booking --> BookingService : 1..*
    Booking --> CancelledBy : 0..1
    Queue --> QueuePerson : 1..*
    QueuePerson --> Booking
```

---

## Directory Structure

```
app/_systems/bookings/
├── index.ts
├── types/
│   ├── booking.ts                    Booking, CreateBookingInput, BookingStats
│   └── queue.ts                      Queue, QueuePerson, QueuePersonStatus
├── hooks/
│   └── useQueue.ts                   Queue queries + mutations + WebSocket
├── services/
│   ├── booking.service.ts            Booking CRUD + availability
│   └── queue.service.ts              Queue CRUD + reorder
└── components/
    ├── bookings/
    │   ├── card/
    │   │   ├── BookingCard.tsx        Main booking card
    │   │   ├── booking-avatar.tsx     Client/Lounge avatar
    │   │   ├── BookingActions.tsx     Status action buttons
    │   │   ├── BookingStatusBadge.tsx Colored status badge
    │   │   ├── BookingServicesList.tsx Service items display
    │   │   ├── BookingAgentInfo.tsx   Agent info section
    │   │   ├── BookingTotalSummary.tsx Price & duration totals
    │   │   ├── BookingLocationLink.tsx Map link
    │   │   ├── BookingQueueBanner.tsx Queue position banner
    │   │   ├── BookingSkeleton.tsx    Loading skeleton
    │   │   └── CancelBookingDialog.tsx Cancel with note modal
    │   ├── list/
    │   │   ├── booking-list.tsx       Real-time booking list
    │   │   ├── BookingHistory.tsx     History view
    │   │   └── BookingListHeader.tsx  Header with filters
    │   └── wizard/
    │       ├── booking-wizard.tsx     3-step booking wizard
    │       ├── booking-progress.tsx   Visual progress bar
    │       ├── booking-navigation.tsx Navigation buttons
    │       ├── booking-agent-step.tsx Agent selection step
    │       ├── booking-datetime-step.tsx Date/time picker step
    │       ├── booking-preview-step.tsx Preview & confirm step
    │       └── _lib/
    │           └── booking-wizard-utils.ts Agent-service compatibility
    └── queue/
        ├── queue-display.tsx          Main queue view (drag & drop)
        ├── queue-item.tsx             Single queue person card
        ├── queue-header.tsx           Queue header
        ├── queue-stats.tsx            Statistics display
        ├── queue-details.tsx          Detailed queue info
        ├── queue-utils.ts             Stats calculation helpers
        ├── queue-hooks.ts             Fullscreen & auto-scroll hooks
        ├── queue-agent-tabs.tsx       Agent tab navigation
        ├── add-to-queue-dialog.tsx    Add person dialog
        ├── book-from-queue-dialog.tsx Walk-in booking dialog
        ├── countdown-timer.tsx        Wait time countdown
        └── queue-loading-skeletons.tsx Loading states
```

---

## Booking Service API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `create` | `POST /v1/bookings` | Create new booking |
| `getAll` | `GET /v1/bookings` | List user's bookings |
| `getHistory` | `GET /v1/bookings/history` | Past bookings |
| `getById` | `GET /v1/bookings/:id` | Single booking |
| `update` | `PUT /v1/bookings/:id` | Update status/details |
| `delete` | `DELETE /v1/bookings/:id` | Remove booking |
| `cancel` | `PATCH /v1/bookings/:id/cancel` | Cancel with note |
| `getBookingServices` | `GET /v1/bookings/:id/services` | Booking's services |
| `getClientStats` | `GET /v1/bookings/stats/client/:id` | Client booking stats |
| `getLoungeStats` | `GET /v1/bookings/stats/lounge/:id` | Lounge booking stats |
| `bookFromQueue` | `POST /v1/bookings/queue` | Walk-in booking |
| `loungeBookFromQueue` | `POST /v1/bookings/lounge-queue` | Lounge-initiated walk-in |
| `getAvailability` | `POST /v1/bookings/availability` | Agent availability slots |

---

## Queue Service API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAgentQueue` | `GET /v1/queues/agent/:agentId` | Agent's queue for date |
| `getLoungeQueues` | `GET /v1/queues/lounge/:loungeId` | All queues for lounge |
| `getMyLoungeQueues` | `GET /v1/queues/my-lounge` | Owner's lounge queues |
| `addPersonToQueue` | `POST /v1/queues/agent/:id/persons` | Add person to queue |
| `updatePersonStatus` | `PUT /v1/queues/agent/:id/persons/:bookingId` | Change person status |
| `removePersonFromQueue` | `DELETE /v1/queues/agent/:id/persons/:bookingId` | Remove from queue |
| `reorderPerson` | `PUT /v1/queues/agent/:id/persons/:bookingId/reorder` | Change position |
| `populateDailyQueues` | `POST /v1/queues/populate` | Admin: create daily queues |

---

## Real-Time WebSocket Integration

```mermaid
sequenceDiagram
    participant C as Client
    participant SK as Socket.IO
    participant API as Backend
    participant QC as Query Cache

    C->>SK: join("bookings:client:{userId}")
    C->>SK: join("queue:agent:{agentId}")
    C->>SK: join("queue:lounge:{loungeId}")

    API->>SK: emit("booking:created", booking)
    SK->>C: booking:created event
    C->>QC: Update booking list cache

    API->>SK: emit("queue:updated", queue)
    SK->>C: queue:updated event
    C->>QC: Update queue cache (setQueryData)
```

### Socket Rooms & Events

| Room Pattern | Events | Description |
|--------------|--------|-------------|
| `bookings:client:{userId}` | `booking:created`, `booking:updated`, `booking:cancelled`, `booking:statusChanged` | Client booking updates |
| `bookings:lounge:{userId}` | Same as above | Lounge booking updates |
| `queue:agent:{agentId}` | `queue:updated` | Single agent queue changes |
| `queue:lounge:{loungeId}` | `queue:lounge:updated` | All queues for a lounge |

---

## Queue Display Features

```mermaid
flowchart TD
    QD[QueueDisplay] --> AT[Agent Tabs]
    AT --> Q1[Agent 1 Queue]
    AT --> Q2[Agent 2 Queue]
    AT --> QN[Agent N Queue]

    Q1 --> DND[Drag & Drop Reorder]
    Q1 --> STATUS[Status Transitions]
    Q1 --> STATS[Queue Statistics]

    QD --> FS[Fullscreen Mode]
    QD --> AS[Auto-Scroll Carousel]
    QD --> DS[Date Selection]
```

### Queue Statistics Calculation

| Metric | Formula |
|--------|---------|
| `totalWaiting` | Count where `status === "waiting"` |
| `totalInService` | Count where `status === "inService"` |
| `totalCompleted` | Count where `status === "completed"` |
| `totalAbsent` | Count where `status === "absent"` |
| `averageWait` | Mean of `(now - joinedAt)` for waiting persons |
| `estimatedWaitTime` | Position × avg service time |

---

## Booking Error Codes

| Code | Description |
|------|-------------|
| `BOOKING_NOT_FOUND` | Booking ID does not exist |
| `BOOKING_ALREADY_CANCELLED` | Cannot cancel twice |
| `BOOKING_ALREADY_COMPLETED` | Cannot modify completed booking |
| `AGENT_NOT_AVAILABLE` | Agent has conflicting booking |
| `INVALID_BOOKING_DATE` | Date in the past or invalid |
| `SERVICE_NOT_FOUND` | Referenced service does not exist |

---

## Booking Wizard Agent-Service Compatibility

```mermaid
flowchart TD
    A[Selected Services] --> B{Single Agent Mode?}
    B -->|Yes| C[Find agent who can do ALL services]
    B -->|No| D[Multi-Agent Mode]
    D --> E[Each agent handles assigned services]

    C --> F{canAgentPerformAllServices?}
    F -->|Yes| G[Show agent as eligible]
    F -->|No| H[Show unavailable services list]
```

Utility functions:
- `canAgentPerformAllServices(agent, services)` — checks `agent.idLoungeService` contains all selected service IDs
- `getUnavailableServices(agent, services)` — returns services the agent cannot perform
- `getAvailableAgentsForService(agents, serviceId)` — filters agents who can do a specific service
