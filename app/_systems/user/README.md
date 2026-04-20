# User System

The user system manages user profiles (clients & lounges), agents, follow relationships, and lounge discovery for the Frame Beauty platform.

---

## Architecture Overview

```mermaid
graph TB
    subgraph UserSystem["User System"]
        direction TB
        subgraph Types["Types Layer"]
            UT[user.ts]
            AT[agent.ts]
            FT[follow.ts]
            LT[lounge.ts]
        end

        subgraph Services["Services Layer"]
            AS[AgentService]
            CS[ClientService]
            FS[FollowService]
            LS[LoungeService]
            LVS[LoungeVisitorService]
        end

        subgraph Hooks["React Query Hooks"]
            UCP[useClientProfile]
            UCVP[useClientVisitorProfile]
            UF[useFollows]
            ULP[useLoungeProfile]
        end

        subgraph Providers["State Providers"]
            AGP[AgentProvider]
        end

        subgraph Components["UI Components"]
            AG[Agents Module]
            CL[Clients Module]
            LO[Lounges Module]
            PR[Profile Module]
        end
    end

    subgraph External["External Dependencies"]
        API[API Client]
        AUTH[Auth Context]
        QC[React Query Cache]
    end

    Services --> API
    Hooks --> Services
    Hooks --> QC
    Providers --> Services
    Components --> Hooks
    Components --> Providers
    Components --> AUTH
```

---

## User Type Hierarchy

```mermaid
classDiagram
    class User {
        +string _id
        +string email
        +string phoneNumber
        +string firstName
        +string lastName
        +string loungeTitle
        +string bio
        +ProfileImage profileImage
        +ProfileImage coverImage
        +UserType type
        +Gender gender
        +LocationData location
        +boolean emailVerified
        +boolean verified
        +string theme
        +string language
        +number averageRating
        +number ratingCount
        +number likeCount
        +number followersCount
        +number followingCount
        +boolean isBlocked
        +OpeningHours openingHours
    }

    class ClientProfile {
        +string _id
        +string firstName
        +string lastName
        +ProfileImage profileImage
        +string bio
        +string email
        +boolean emailVerified
    }

    class ClientStats {
        +number totalBookings
        +number completedBookings
        +number cancelledBookings
        +number followersCount
        +number followingCount
    }

    class Lounge {
        +string id
        +string name
        +string loungeTitle
        +string imageUrl
        +string address
        +number averageRating
        +number ratingCount
        +number likeCount
        +string bio
        +string phoneNumber
        +boolean isOpen
        +Location location
        +boolean verified
    }

    class Agent {
        +string _id
        +string agentName
        +string loungeId
        +boolean isBlocked
        +ProfileImage profileImage
        +string[] idLoungeService
        +boolean acceptQueueBooking
        +string createdAt
    }

    User <|-- ClientProfile
    User <|-- Lounge
    User "1" -- "*" Agent : owns
```

---

## Profile Routing Flow

```mermaid
flowchart TD
    A[getProfilePath user] --> B{user.type?}
    B -->|admin| C["/admin"]
    B -->|lounge| D["/profile/lounge"]
    B -->|client| E["/profile/client"]
    B -->|undefined| F["/"]

    G[getHomePath] --> H["/home"]
    I[getLoginRedirectPath] --> H
```

---

## Directory Structure

```
app/_systems/user/
├── index.ts                              Barrel exports
├── types/
│   ├── user.ts                           User, ClientProfile, ClientStats
│   ├── agent.ts                          Agent, CreateAgentDto, AgentFilters
│   ├── follow.ts                         FollowToggleResult, PaginatedFollows
│   └── lounge.ts                         Lounge interface
├── services/
│   ├── agent.service.ts                  Agent CRUD + bulk operations
│   ├── client.service.ts                 Client/lounge discovery
│   ├── follow.service.ts                 Follow/unfollow + counts
│   ├── lounge.service.ts                 Lounge services, hours, agents
│   └── lounge-visitor.service.ts         Public lounge lookup
├── hooks/
│   ├── useClientProfile.ts               Client profile + mutations
│   ├── useClientVisitorProfile.ts        Visitor profile queries
│   ├── useFollows.ts                     Follow state + toggle
│   └── useLoungeProfile.ts              Lounge profile mutations
├── providers/
│   └── agent.tsx                         Agent state (useReducer)
├── lib/
│   └── profile.ts                        Profile routing helpers
└── components/
    ├── agents/                           Agent management UI
    ├── clients/                          Visitor profile views
    ├── lounges/                          Lounge cards & info
    └── profile/                          Own profile & settings
```

---

## Follow System

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Follow Button
    participant Hook as useToggleFollow
    participant QC as Query Cache
    participant API as /v1/follows

    U->>UI: Tap Follow
    UI->>Hook: mutate(targetId)
    Hook->>QC: Optimistic update (isFollowing = true)
    Hook->>API: POST /v1/follows/{targetId}
    API-->>Hook: { isFollowing: true }
    Hook->>QC: Invalidate follow counts
    Note over Hook: Rate-limit cooldown: 30s on error
```

### Follow Query Keys

```mermaid
graph LR
    ALL["follows"] --> CHECK["follows.check.{targetId}"]
    ALL --> COUNTS["follows.counts.{userId}"]
    ALL --> FOLLOWERS["follows.followers.{userId}"]
    ALL --> FOLLOWING["follows.following.{userId}"]
```

---

## Agent Management

```mermaid
flowchart TD
    subgraph AgentProvider["AgentProvider (useReducer)"]
        STATE[AgentState]
        DISPATCH[Dispatch Actions]
    end

    subgraph Actions
        SET_AGENTS
        ADD_AGENT
        UPDATE_AGENT
        DELETE_AGENT
        SET_FILTERS
        SET_PAGINATION
        SET_STATS
    end

    subgraph API["Agent API Endpoints"]
        GET[GET /v1/agents]
        POST[POST /v1/agents]
        PUT[PUT /v1/agents/:id]
        DEL[DELETE /v1/agents/:id]
        BULK_B[POST /v1/agents/bulk-block]
        BULK_U[POST /v1/agents/bulk-unblock]
        BULK_D[POST /v1/agents/bulk-delete]
    end

    Actions --> DISPATCH --> STATE
    STATE --> AgentProvider
    API --> AgentProvider
```

### Agent Service Methods

| Method               | Endpoint                           | Description                 |
| -------------------- | ---------------------------------- | --------------------------- |
| `getAllAgents`       | `GET /v1/agents`                   | Paginated list with filters |
| `createAgent`        | `POST /v1/agents`                  | Create new agent            |
| `getAgentById`       | `GET /v1/agents/:id`               | Single agent details        |
| `updateAgent`        | `PUT /v1/agents/:id`               | Update agent fields         |
| `deleteAgent`        | `DELETE /v1/agents/:id`            | Remove agent                |
| `getAgentsByLounge`  | `GET /v1/agents/lounge/:id`        | Agents for a lounge         |
| `bulkBlockAgents`    | `POST /v1/agents/bulk-block`       | Block multiple agents       |
| `bulkUnblockAgents`  | `POST /v1/agents/bulk-unblock`     | Unblock multiple agents     |
| `bulkDeleteAgents`   | `POST /v1/agents/bulk-delete`      | Delete multiple agents      |
| `getAgentStats`      | `GET /v1/agents/stats`             | Agent statistics            |
| `updateQueueBooking` | `PUT /v1/agents/:id/queue-booking` | Toggle walk-in acceptance   |

### Agent Form Validation

| Field      | Rules                                       |
| ---------- | ------------------------------------------- |
| Agent Name | 2-50 chars, letters + spaces only           |
| Password   | 8+ chars, 1 uppercase, 1 lowercase, 1 digit |
| Image      | Max 5MB, image/\* MIME type                 |
| Services   | At least 1 required (create mode)           |

---

## Client Discovery

```mermaid
flowchart LR
    subgraph Filters
        G[Gender Filter]
        S[Service Filter]
        SO[Sort Order]
        PA[Pagination]
    end

    Filters --> CS[ClientService.getAllLounges]
    CS --> API["GET /v1/lounges"]
    API --> RES[Lounge List]

    CS2[ClientService.getLoungesByService] --> API2["GET /v1/lounges/service/:id"]
    CS3[ClientService.getClientProfile] --> API3["GET /v1/clients/:id/profile"]
```

### Client Profile Query Keys

```mermaid
graph LR
    ALL["clientProfile"] --> PROF["clientProfile.profile.{id}"]
    ALL --> BOOK["clientProfile.bookings.{id}.{page}.{status}"]
    ALL --> LIKES["clientProfile.likes.{id}.{page}"]
    ALL --> RATINGS["clientProfile.ratings.{id}.{page}"]
```

---

## Lounge Service Operations

| Method                  | Endpoint                            | Description                    |
| ----------------------- | ----------------------------------- | ------------------------------ |
| `getAll`                | `GET /v1/lounge-services`           | All lounge services            |
| `getById`               | `GET /v1/lounge-services/:id`       | Single service                 |
| `create`                | `POST /v1/services`                 | Create global service          |
| `createLoungeService`   | `POST /v1/lounge-services`          | Create lounge-specific service |
| `update`                | `PUT /v1/lounge-services/:id`       | Update service                 |
| `delete`                | `DELETE /v1/lounge-services/:id`    | Remove service                 |
| `getServiceSuggestions` | `GET /v1/service-suggestions`       | Service suggestions            |
| `getOpeningHours`       | `GET /v1/lounges/:id/opening-hours` | Opening hours                  |
| `updateOpeningHours`    | `PUT /v1/lounges/:id/opening-hours` | Update hours                   |
| `getAgentsByLoungeId`   | `GET /v1/agents/lounge/:id`         | Lounge agents                  |

---

## Profile Settings

```mermaid
flowchart TD
    SETTINGS[AccountSettings] --> NS[NameSection]
    SETTINGS --> PS[PhoneSection]
    SETTINGS --> BS[BioSection]
    SETTINGS --> PWS[PasswordSection]
    SETTINGS --> LS[LogoutSection]

    NS -->|Client| UNC["updateNameClient(firstName, lastName)"]
    NS -->|Lounge| UNL["updateNameLounge(loungeTitle)"]
    PS --> UP["updatePhone(phoneNumber)"]
    BS --> UB["updateBio(bio)"]
    PWS --> CP["changePassword(current, new, confirm)"]
    LS --> SO["signOut()"]
    LS --> LA["logoutAll()"]
```

### Profile Mutation Hooks

| Hook                          | Mutates               | Invalidates |
| ----------------------------- | --------------------- | ----------- |
| `useUpdateClientName`         | `PUT /v1/me/client`   | currentUser |
| `useUpdatePhone`              | `PUT /v1/me`          | currentUser |
| `useUpdateBio`                | `PUT /v1/me`          | currentUser |
| `useUpdateProfileImage`       | `PUT /v1/me/image`    | currentUser |
| `useUpdateLocation`           | `PUT /v1/me/location` | currentUser |
| `useUpdateGender`             | `PUT /v1/me`          | currentUser |
| `useUpdateLoungeTitle`        | `PUT /v1/me`          | currentUser |
| `useUpdateLoungeProfileImage` | `PUT /v1/me/image`    | currentUser |
| `useUpdateLoungeLocation`     | `PUT /v1/me/location` | currentUser |

---

## Component Modules

### Agents Module

- **AgentList**: Search with 500ms debounce, bulk actions (admin), pagination, delete confirmation
- **AgentTable**: Sortable columns, select-all checkbox, status badges, action dropdown
- **AgentForm**: Create/edit dialog with image upload, service selection, validation
- **AgentDetails**: Read-only dialog with full profile display
- **ImageSelector**: Click or drag-drop image upload with base64 conversion

### Clients Module (Visitor Profile)

- **VisitorProfileHeader**: Cover image, avatar, name, bio, follow button, follower counts
- **VisitorStatsCards**: Booking stats in card grid
- **VisitorOverviewTab**: Profile overview
- **VisitorBookingsTab**: Booking history
- **VisitorPostsTab**: User's posts

### Lounges Module

- **LoungeItem**: Lounge discovery card
- **FavoriteLoungesSection**: Horizontal carousel of favorites
- **DisplayLocation**: Map/address display
- **PopularServicesSection**: Top services carousel
- **ServiceCategoriesSection**: Category carousel

### Profile Module

- **UserInfo**: User menu card with avatar
- **AccountInformation**: Account details section
- **AccountSettings**: Settings tabs coordinator
- **UserSession**: Auth state display with sign-in/sign-up dialogs
- **UserPostsTab**: Infinite scroll user posts
- **UserReelsTab**: Grid display of user reels
