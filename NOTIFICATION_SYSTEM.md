# Frame Beauty — Notification System

> **Live Reference File** — This document is the single source of truth for the notification system architecture. Use it when building the frontend notification layer to ensure full backend–frontend synchronization.

---

## Architecture Overview

The notification system uses a **3-layer delivery strategy**:

```
┌──────────────────────────────────────────────────────────────┐
│                    USER ACTION TRIGGER                        │
│  (like, comment, follow, booking, rating, admin action...)   │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              NotificationService.create()                     │
│  • Self-notification guard (actorId === userId → skip)       │
│  • Auto-derives category from NOTIFICATION_CATEGORY_MAP      │
│  • Persists to MongoDB (notifications collection)            │
└──────┬──────────────┬──────────────────┬─────────────────────┘
       │              │                  │
       ▼              ▼                  ▼
┌────────────┐ ┌─────────────┐ ┌──────────────────┐
│  Layer 1   │ │   Layer 2   │ │     Layer 3      │
│  MongoDB   │ │  Socket.IO  │ │   FCM Push       │
│  Persist   │ │  Real-time  │ │   (Background)   │
│            │ │             │ │                   │
│ Paginated  │ │ Instant UI  │ │ Device push when  │
│ history    │ │ update      │ │ app not focused   │
└────────────┘ └─────────────┘ └──────────────────┘
```

### Layer 1 — MongoDB Persistence
- Every notification is stored in the `notifications` collection
- Supports pagination, category filtering, read/unread status
- TTL and de-duplication indexes prevent bloat

### Layer 2 — Socket.IO Real-Time
- Event: `notification:new` emitted to room `notifications:{userId}`
- Payload: full notification object
- Frontend should join the room on connect and listen for this event

### Layer 3 — Firebase Cloud Messaging (FCM) Push
- Fire-and-forget via `PushNotificationService.sendToUser()`
- Rich data payload with `type`, `category`, `actionUrl`, and relevant IDs
- Platform-optimized (Android high priority, iOS content-available)
- Token management with automatic cleanup of stale tokens

---

## Notification Categories

| Category   | Description                                        |
|------------|----------------------------------------------------|
| `booking`  | Booking lifecycle (created, confirmed, cancelled…) |
| `queue`    | Queue management (turn, position, auto-cancel…)    |
| `social`   | Follows, lounge likes, lounge ratings              |
| `content`  | Post/reel likes, comments, replies                 |
| `admin`    | Service suggestions, moderation actions            |
| `system`   | System-wide announcements (future)                 |

---

## Notification Types — Full Catalog

### Booking (category: `booking`)
| Type                | Trigger                              | Recipient         | Actor         |
|---------------------|--------------------------------------|--------------------|---------------|
| `BOOKING_CREATED`   | Client books or joins queue          | Lounge             | Client        |
| `BOOKING_CONFIRMED` | Lounge confirms booking              | Client             | —             |
| `BOOKING_CANCELLED` | Either party cancels                 | The other party    | Canceller     |
| `BOOKING_IN_QUEUE`  | Client placed in queue               | Client             | —             |
| `BOOKING_COMPLETED` | Service marked complete              | Client             | —             |
| `BOOKING_ABSENT`    | Client marked absent                 | Client             | —             |

### Queue (category: `queue`)
| Type                     | Trigger                          | Recipient | Actor |
|--------------------------|----------------------------------|-----------|-------|
| `QUEUE_IN_SERVICE`       | Client's turn arrives            | Client    | —     |
| `QUEUE_AUTO_CANCELLED`   | Day passed, booking auto-cancelled| Client   | —     |
| `QUEUE_BACK_IN_QUEUE`    | Client put back in queue         | Client    | —     |
| `QUEUE_REMINDER`         | Turn approaching (N minutes)     | Client    | —     |
| `QUEUE_POSITION_CHANGED` | Queue position updated           | Client    | —     |

### Content (category: `content`)
| Type              | Trigger                    | Recipient       | Actor          |
|-------------------|----------------------------|-----------------|----------------|
| `POST_LIKED`      | Someone likes a post       | Post author     | Liker          |
| `POST_COMMENTED`  | Someone comments on a post | Post author     | Commenter      |
| `REEL_LIKED`      | Someone likes a reel       | Reel author     | Liker          |
| `REEL_COMMENTED`  | Someone comments on a reel | Reel author     | Commenter      |
| `COMMENT_REPLIED` | Someone replies to comment | Comment author  | Replier        |
| `COMMENT_LIKED`   | Someone likes a comment    | Comment author  | Liker          |

### Social (category: `social`)
| Type            | Trigger                  | Recipient    | Actor    |
|-----------------|--------------------------|--------------|----------|
| `NEW_FOLLOWER`  | Someone follows a user   | Target user  | Follower |
| `LOUNGE_LIKED`  | Client likes a lounge    | Lounge       | Client   |
| `LOUNGE_RATED`  | Client rates a lounge    | Lounge       | Client   |

### Admin (category: `admin`)
| Type                   | Trigger                         | Recipient    | Actor  |
|------------------------|---------------------------------|--------------|--------|
| `SUGGESTION_CREATED`   | Lounge suggests new service     | All admins   | Lounge |
| `SUGGESTION_APPROVED`  | Admin approves suggestion       | Lounge       | —      |
| `SUGGESTION_REJECTED`  | Admin rejects suggestion        | Lounge       | —      |
| `CONTENT_HIDDEN`       | Admin hides post/reel/comment   | Author       | —      |

---

## Data Model

### Notification Document

```typescript
interface Notification {
  _id: string;
  userId: string;          // recipient
  actorId?: string;        // who triggered (for social/content notifs)
  title: string;
  body: string;
  type: NotificationType;  // e.g. 'POST_LIKED'
  category: NotificationCategory; // e.g. 'content'
  isRead: boolean;
  metadata: NotificationMetadata;
  actionUrl?: string;      // deep-link path for frontend navigation
  imageUrl?: string;       // actor's profile image
  createdAt: Date;
  updatedAt: Date;
}
```

### NotificationMetadata

```typescript
interface NotificationMetadata {
  bookingId?: string;
  loungeId?: string;
  clientId?: string;
  agentId?: string;
  postId?: string;
  reelId?: string;
  commentId?: string;
  targetType?: 'post' | 'reel' | 'comment';
  followerId?: string;
  ratingScore?: number;
  suggestionId?: string;
  reason?: string;
}
```

---

## API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`).

### `GET /v1/notifications`
Paginated notification list with optional category filter.

**Query Parameters:**
| Param      | Type   | Default | Description                                      |
|------------|--------|---------|--------------------------------------------------|
| `page`     | number | 1       | Page number                                       |
| `limit`    | number | 20      | Items per page                                    |
| `category` | string | —       | Filter by category (`booking`, `queue`, `content`, `social`, `admin`, `system`) |

**Response:**
```json
{
  "success": true,
  "data": [/* notification objects */],
  "unreadCount": 5,
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "message": "Notifications retrieved successfully"
}
```

### `GET /v1/notifications/unread-count`
Get total unread count and per-category breakdown.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "byCategory": {
      "content": 5,
      "social": 3,
      "booking": 4
    }
  },
  "message": "Unread count retrieved successfully"
}
```

### `PATCH /v1/notifications/read`
Mark notifications as read.

**Body:**
```json
{
  "notificationIds": ["id1", "id2"]  // omit to mark ALL as read
}
```

**Response:**
```json
{
  "success": true,
  "data": { "modifiedCount": 2 },
  "message": "Notifications marked as read"
}
```

### `DELETE /v1/notifications/:id`
Delete a single notification.

### `DELETE /v1/notifications`
Delete all notifications for the authenticated user.

### `POST /v1/notifications/push-token`
Register a device push token for FCM.

**Body:**
```json
{
  "token": "fcm-device-token",
  "platform": "ios"  // or "android" or "web"
}
```

### `DELETE /v1/notifications/push-token`
Remove a device push token.

---

## Socket.IO Integration

### Connection & Room Setup

```typescript
// After socket connects with auth token:
socket.emit('join:notifications');
// Server auto-joins the user to room `notifications:{userId}`
```

### Events to Listen For

| Event              | Payload                   | Description                         |
|--------------------|---------------------------|-------------------------------------|
| `notification:new` | `{ data: Notification }`  | New notification received           |

### Frontend Handling Pattern

```typescript
socket.on('notification:new', ({ data }) => {
  // 1. Prepend to notification list
  // 2. Increment badge count
  // 3. Show toast/snackbar with data.title + data.body
  // 4. If data.imageUrl → show actor avatar
  // 5. On tap → navigate to data.actionUrl
});
```

---

## Frontend Integration Guide

### 1. Notification Badge
- On app load: `GET /v1/notifications/unread-count` → set badge to `data.total`
- On `notification:new` socket event: increment badge by 1
- On marking as read: decrement badge accordingly
- Optional: show per-category badges using `data.byCategory`

### 2. Notification List Screen
- Fetch: `GET /v1/notifications?page=1&limit=20`
- Category tabs: use `?category=content`, `?category=social`, etc.
- Infinite scroll pagination
- Swipe-to-delete: `DELETE /v1/notifications/:id`
- "Mark all read" button: `PATCH /v1/notifications/read` (no body)
- Pull-to-refresh

### 3. Notification Item Rendering

```
┌─────────────────────────────────────────────────┐
│ [imageUrl]  title                    timeAgo    │
│             body (truncated)                     │
│             ── unread indicator (blue dot) ──     │
└─────────────────────────────────────────────────┘
```

- `imageUrl` → actor's avatar (falls back to app icon)
- `actionUrl` → navigation target on tap
- `isRead` → blue dot indicator
- `type` → icon selection (heart for likes, chat for comments, etc.)
- `category` → tab filtering

### 4. Navigation Map (actionUrl)

| actionUrl Pattern            | Screen                        |
|------------------------------|-------------------------------|
| `/bookings/:id`              | Booking detail                |
| `/posts/:id`                 | Post detail                   |
| `/reels/:id`                 | Reel detail / player          |
| `/profile/:id`               | User/lounge profile           |
| `/lounge/services`           | Lounge services management    |
| `/lounge/suggestions`        | Lounge suggestions list       |
| `/admin/suggestions/:id`     | Admin suggestion review       |

### 5. Push Notification Handling (FCM)

```typescript
// Background/foreground handler:
messaging().onMessage(remoteMessage => {
  const { type, category, actionUrl, notificationId } = remoteMessage.data;
  // Show local notification or in-app toast
});

// Background tap handler:
messaging().onNotificationOpenedApp(remoteMessage => {
  // Navigate to actionUrl
});
```

### 6. Token Registration
- On app start + on login: `POST /v1/notifications/push-token`
- On logout: `DELETE /v1/notifications/push-token`
- On token refresh (FCM callback): re-register

---

## Design Decisions & Strategy

| Decision                  | Rationale                                                        |
|---------------------------|------------------------------------------------------------------|
| **Self-notification guard** | `actorId === userId` → silently skipped, no DB write            |
| **Fire-and-forget push**  | Push failures never block the main action flow                  |
| **Category auto-derive**  | `NOTIFICATION_CATEGORY_MAP[type]` — no manual category required |
| **De-duplication indexes** | Sparse compound indexes prevent duplicate likes/follows notifs  |
| **Async triggers**        | `.catch(() => {})` pattern — notification errors never crash the API |
| **Single create() entry** | All 24 notification types flow through one method for consistency |
| **Rich metadata**         | Flexible metadata subdoc supports all notification types         |
| **actionUrl convention**  | RESTful paths that map directly to frontend routes               |

---

## Database Indexes

| Index                                           | Purpose                           |
|-------------------------------------------------|-----------------------------------|
| `userId + createdAt (desc)`                     | Fast paginated queries            |
| `userId + category + createdAt (desc)`          | Category-filtered queries         |
| `userId + isRead`                               | Unread count aggregation          |
| `userId + actorId + type + metadata.postId`     | De-duplicate post like notifs     |
| `userId + actorId + type + metadata.commentId`  | De-duplicate comment like notifs  |

---

## File Structure

```
src/
├── interfaces/realtime/notification.interface.ts  — Types, enums, category map
├── models/realtime/notification.model.ts          — Mongoose schema + indexes
├── services/realtime/
│   ├── notification.service.ts                    — Core notification service (all 24 types)
│   ├── socket.service.ts                          — Socket.IO real-time delivery
│   └── push.service.ts                            — FCM push delivery
├── controllers/realtime/notification.controller.ts — REST controller
├── routes/realtime/notification.route.ts          — Express routes
└── dtos/realtime/notification.dto.ts              — Validation DTOs
```

### Services with Integrated Notification Triggers

| Service File                              | Notification Types Triggered                              |
|-------------------------------------------|-----------------------------------------------------------|
| `services/content/post.service.ts`        | `POST_LIKED`, `CONTENT_HIDDEN`                            |
| `services/content/reel.service.ts`        | `REEL_LIKED`, `CONTENT_HIDDEN`                            |
| `services/content/comment.service.ts`     | `POST_COMMENTED`, `REEL_COMMENTED`, `COMMENT_REPLIED`, `COMMENT_LIKED`, `CONTENT_HIDDEN` |
| `services/follow/follow.service.ts`       | `NEW_FOLLOWER`                                            |
| `services/like/like.service.ts`           | `LOUNGE_LIKED`                                            |
| `services/rating/rating.service.ts`       | `LOUNGE_RATED`                                            |
| `services/catalog/serviceSuggestions.service.ts` | `SUGGESTION_CREATED`                               |
| `services/catalog/serviceSuggestionsAdmin.service.ts` | `SUGGESTION_APPROVED`, `SUGGESTION_REJECTED`  |
| `services/booking/booking.service.ts`     | `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_IN_QUEUE`, `BOOKING_COMPLETED`, `BOOKING_ABSENT` |
| `services/queue/queue.service.ts`         | `QUEUE_IN_SERVICE`, `QUEUE_AUTO_CANCELLED`, `QUEUE_BACK_IN_QUEUE`, `QUEUE_REMINDER`, `QUEUE_POSITION_CHANGED` |
