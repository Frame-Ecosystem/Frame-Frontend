# Notifications System

The notifications system delivers real-time in-app notifications, push notifications (FCM), sound alerts, and deep-link navigation across Frame Beauty.

---

## Architecture Overview

```mermaid
graph TB
    subgraph NotifSystem["Notifications System"]
        subgraph Providers["Provider Layer"]
            NP[NotificationProvider]
            PPP[PushNotificationProvider]
        end

        subgraph Hooks
            UN[useNotifications]
            UPN[usePushNotifications]
            USR[useSocketRoom]
            UNN[useNotificationNavigate]
        end

        subgraph Lib["Engine Layer"]
            NE[NotificationEngine]
            NRG[NotificationRegistry]
            NRT[NotificationRouting]
            SM[SoundManager]
            FB[Firebase FCM]
        end

        subgraph Services
            NS[NotificationService]
            PNS[PushNotificationService]
            SKT[Socket.IO Client]
        end

        subgraph Components
            NR[NotificationRow]
            NCT[CategoryTabs]
            NAB[ActionBar]
        end
    end

    subgraph External
        FCM[Firebase Cloud Messaging]
        SW[Service Worker]
        API[REST API]
        WS[WebSocket Server]
    end

    NP --> USR
    NP --> NE
    PPP --> FB
    PPP --> PNS
    UN --> NS
    USR --> SKT
    SKT --> WS
    FB --> FCM
    FB --> SW
    Components --> UN
    Components --> UNN
```

---

## Notification Categories & Types

```mermaid
graph TD
    subgraph BOOKING["BOOKING"]
        B1[BOOKING_CONFIRMED]
        B2[BOOKING_CANCELLED]
        B3[BOOKING_REMINDER]
    end

    subgraph QUEUE["QUEUE"]
        Q1[QUEUE_IN_SERVICE]
        Q2[QUEUE_POSITION_CHANGED]
        Q3[QUEUE_REMINDER]
        Q4[QUEUE_PERSON_ADDED]
        Q5[QUEUE_PERSON_REMOVED]
        Q6[QUEUE_ADDED_TO_QUEUE]
    end

    subgraph CONTENT["CONTENT"]
        C1[POST_LIKED]
        C2[POST_COMMENTED]
        C3[REEL_LIKED]
        C4[REEL_COMMENTED]
        C5[COMMENT_LIKED]
        C6[COMMENT_REPLIED]
    end

    subgraph SOCIAL["SOCIAL"]
        S1[NEW_FOLLOWER]
        S2[FOLLOW_ACCEPTED]
    end

    subgraph ADMIN["ADMIN"]
        A1[ADMIN_ANNOUNCEMENT]
        A2[REPORT_REVIEWED]
        A3[CONTENT_HIDDEN]
        A4[CONTENT_UNHIDDEN]
    end

    subgraph SYSTEM["SYSTEM"]
        SY1[WELCOME]
        SY2[ACCOUNT_VERIFIED]
        SY3[PASSWORD_CHANGED]
        SY4[MARKETPLACE_ORDER_PLACED]
        SY5[MARKETPLACE_ORDER_STATUS_CHANGED]
        SY6[MARKETPLACE_REVIEW_RECEIVED]
    end
```

---

## Data Model

```mermaid
classDiagram
    class AppNotification {
        +string _id
        +string userId
        +string actorId
        +PopulatedActor actor
        +string title
        +string body
        +NotificationType type
        +NotificationCategory category
        +boolean isRead
        +NotificationMetadata metadata
        +string actionUrl
        +string imageUrl
        +string createdAt
    }

    class NotificationMetadata {
        +string bookingId
        +string loungeId
        +string agentId
        +string postId
        +string reelId
        +string commentId
        +string parentCommentId
        +string followerId
        +string orderId
        +string productId
        +string storeId
        +string reportId
    }

    class NotificationRegistryEntry {
        +string icon
        +string color
        +string sound
        +NotificationCategory category
    }

    AppNotification --> NotificationMetadata
    AppNotification --> NotificationRegistryEntry
```

---

## Directory Structure

```
app/_systems/notifications/
├── index.ts
├── types/
│   └── notification.ts                All types, enums, DTOs
├── services/
│   ├── notification.service.ts        REST: getAll, markRead, delete
│   ├── push-notification.service.ts   FCM token register/unregister
│   └── socket.ts                      Socket.IO client singleton
├── lib/
│   ├── firebase.ts                    FCM initialization + token request
│   ├── notification-engine.ts         Sound playback + suppression
│   ├── notification-registry.ts       27 types → icon/color/sound map
│   ├── notification-routing.ts        Deep-link URL + scroll targets
│   ├── sound-manager.ts              Web Audio API (11 sounds)
│   └── time-utils.ts                 timeAgo formatting
├── hooks/
│   ├── useNotifications.ts           Unread count + infinite list
│   ├── useNotificationNavigate.ts    Deep-link navigation
│   ├── usePushNotifications.ts       FCM subscribe/foreground toast
│   └── useSocketRoom.ts             Socket room join/leave/events
├── providers/
│   ├── notification.tsx              Socket-based real-time provider
│   └── push-notification.tsx         FCM registration provider
└── components/
    ├── notification-action-bar.tsx    Mark all read, clear all
    ├── notification-category-tabs.tsx Horizontal scroll category tabs
    ├── notification-row.tsx           Single notification display
    ├── notification-empty-state.tsx   No notifications placeholder
    └── notification-unauth-state.tsx  Login prompt
```

---

## Notification API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAll` | `GET /v1/notifications?page&limit&category` | Paginated, filterable |
| `getUnreadCount` | `GET /v1/notifications/unread-count` | Total unread number |
| `markAsRead` | `PATCH /v1/notifications/:id/read` | Mark single as read |
| `delete` | `DELETE /v1/notifications/:id` | Delete single |
| `deleteAll` | `DELETE /v1/notifications` | Clear all |
| `registerToken` | `POST /v1/push-notifications/register` | Register FCM device token |
| `unregisterToken` | `POST /v1/push-notifications/unregister` | Unregister FCM token |

---

## Real-Time Notification Flow

```mermaid
sequenceDiagram
    participant SRV as Backend
    participant WS as Socket.IO
    participant NP as NotificationProvider
    participant NE as NotificationEngine
    participant QC as Query Cache
    participant UI as Toast/Badge

    SRV->>WS: emit("notification", payload)
    WS->>NP: notification event
    NP->>NP: Check suppression rules
    alt Not suppressed
        NP->>NE: playSound(type)
        NP->>UI: Show toast notification
        NP->>QC: Increment unreadCount (+1)
    end
```

### Socket Rooms

| Room | Joined When | Events |
|------|-------------|--------|
| `notifications:{userId}` | User authenticated | `notification` |
| `queue:agent:{agentId}` | Queue view open | `queue:updated` |
| `queue:lounge:{loungeId}` | Queue view open | `queue:lounge:updated` |

---

## Push Notification Flow (FCM)

```mermaid
sequenceDiagram
    participant U as User
    participant P as PushNotificationProvider
    participant FB as Firebase
    participant SW as Service Worker
    participant API as Backend

    U->>P: App loads (authenticated)
    P->>FB: requestFCMToken(vapidKey)
    FB-->>P: deviceToken
    P->>API: POST /push-notifications/register { token, platform }
    Note over P: Token stored, foreground listener active

    rect rgb(240,240,240)
        Note over SW: Background notification
        API->>FB: Send push payload
        FB->>SW: Push event
        SW->>SW: Show OS notification
    end

    rect rgb(240,255,240)
        Note over P: Foreground notification
        API->>FB: Send push payload
        FB->>P: onMessage callback
        P->>P: Show in-app toast with navigation
    end
```

---

## Sound System

```mermaid
flowchart TD
    NE[NotificationEngine] --> REG[NotificationRegistry]
    REG -->|lookup type → sound name| SM[SoundManager]
    SM --> WA[Web Audio API]
    WA --> SP[Speaker]

    NE --> SUP{Suppression Check}
    SUP -->|Route matches| MUTE[Skip sound]
    SUP -->|800ms cooldown| MUTE
    SUP -->|No match| SM
```

### Available Sounds (11)

| Sound File | Used For |
|------------|----------|
| `notification-default.mp3` | Generic notifications |
| `notification-booking.mp3` | Booking confirmations |
| `notification-queue.mp3` | Queue updates |
| `notification-like.mp3` | Likes |
| `notification-comment.mp3` | Comments/replies |
| `notification-follow.mp3` | New followers |
| `notification-order.mp3` | Marketplace orders |
| `notification-message.mp3` | Messages |
| `notification-success.mp3` | Success feedback |
| `notification-warning.mp3` | Warnings |
| `notification-admin.mp3` | Admin announcements |

All sounds are preloaded via `AudioContext` on first user interaction and cached as `AudioBuffer` objects.

---

## Route-Based Suppression

Notifications are suppressed when the user is already viewing related content:

| Route Prefix | Suppressed Types |
|--------------|------------------|
| `/bookings` | `booking:*` |
| `/queue` | `queue:*` |
| `/posts` | `post:*` |
| `/reels` | `reel:*` |
| `/notifications` | All types |

---

## Deep-Link Navigation

```mermaid
flowchart TD
    N[Notification Tap] --> R[getRedirectPath]
    R --> CHECK{type?}

    CHECK -->|BOOKING_*| BP["/bookings + bookingId"]
    CHECK -->|QUEUE_*| QP["/queue + agentId"]
    CHECK -->|POST_*| PP["/posts/:postId"]
    CHECK -->|REEL_*| RP["/reels/:reelId"]
    CHECK -->|NEW_FOLLOWER| FP["/profile/:followerId"]
    CHECK -->|COMMENT_*| CP["/posts/:postId#comment-{commentId}"]
    CHECK -->|MARKETPLACE_*| MP["/store/orders/:orderId"]

    CP --> NAV[router.push]
    NAV --> MO[MutationObserver]
    MO --> FIND{Element found?}
    FIND -->|Yes| SCROLL[scrollIntoView + 3.5s pulse animation]
    FIND -->|Timeout 5s| STOP[Stop observing]
```

The `useNotificationNavigate` hook:
1. Calls `getRedirectPath(notification)` for the URL
2. Calls `getTargetElementId(notification)` for the scroll target
3. Pushes the route via `router.push`
4. Starts a `MutationObserver` watching for the target element
5. When found, scrolls into view with `scrollAndHighlight` (3.5s pulse CSS animation)

---

## High-Priority Notification Types

These types show an **8-second** toast instead of the default duration:

- `QUEUE_IN_SERVICE`
- `QUEUE_REMINDER`
- `QUEUE_POSITION_CHANGED`

---

## Notification Registry Mapping (excerpt)

| Type | Icon | Color | Sound | Category |
|------|------|-------|-------|----------|
| `BOOKING_CONFIRMED` | CalendarCheck | green | booking | BOOKING |
| `QUEUE_IN_SERVICE` | UserCheck | blue | queue | QUEUE |
| `POST_LIKED` | Heart | red | like | CONTENT |
| `NEW_FOLLOWER` | UserPlus | purple | follow | SOCIAL |
| `ADMIN_ANNOUNCEMENT` | Megaphone | orange | admin | ADMIN |
| `MARKETPLACE_ORDER_PLACED` | ShoppingBag | green | order | SYSTEM |

---

## Unread Count Polling

```mermaid
flowchart TD
    A[useNotifications hook] --> B[useQuery: unreadCount]
    B --> C{refetchInterval: 60s}
    C -->|Every 60s| D[GET /notifications/unread-count]
    D --> E[Update badge count]

    F[Socket notification event] --> G[Optimistic +1]
    G --> E

    H[markAsRead mutation] --> I[Optimistic -1]
    I --> E
```

The unread count combines:
- **Polling**: 60-second `refetchInterval` as a safety net
- **Socket**: Optimistic `+1` on each `notification` event
- **User action**: Optimistic `-1` on mark-as-read
