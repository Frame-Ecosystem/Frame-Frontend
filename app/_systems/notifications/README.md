# Notifications System

Three-layer notification delivery — MongoDB persistence, Socket.IO real-time, and Firebase Cloud Messaging (FCM) push.

## Architecture

```
types → services (REST + Socket.IO + FCM) → lib (registry + engine + routing) → providers (context) → hooks → components
```

## Delivery Layers

| Layer       | Technology         | Purpose                                               |
| ----------- | ------------------ | ----------------------------------------------------- |
| Persistence | REST API + MongoDB | Store, query, paginate, mark-read, delete             |
| Real-time   | Socket.IO          | Instant delivery to connected clients, toasts, sounds |
| Push        | FCM                | Reach users when the app is in background or closed   |

## Notification Types

27 notification types organized into 6 categories:

| Category | Examples                                               |
| -------- | ------------------------------------------------------ |
| Booking  | booking_confirmed, booking_cancelled, booking_reminder |
| Queue    | queue_turn_approaching, queue_position_updated         |
| Content  | post_liked, comment_reply, reel_liked                  |
| Social   | new_follower, follow_request                           |
| Admin    | report_reviewed, account_warning                       |
| System   | system_maintenance, feature_announcement               |

## Services

| Service                        | Purpose                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `notification.service.ts`      | REST — getAll (paginated + category filter), getUnreadCount, markAsRead, delete, deleteAll |
| `push-notification.service.ts` | FCM token registration and management                                                      |
| `socket.ts`                    | Singleton Socket.IO client with auth token, auto-reconnection                              |

## Lib (Registry Pattern)

| Module                     | Purpose                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `notification-registry.ts` | Maps each NotificationType → { icon, color, sound, category }. Adding a new type = one entry. |
| `notification-routing.ts`  | Resolves notification → client URL with scroll-to-target hash                                 |
| `notification-engine.ts`   | Mediator — WebSocket event → sound playback with cooldown + page-aware suppression            |
| `sound-manager.ts`         | Audio playback for per-type notification sounds                                               |
| `firebase.ts`              | Firebase app/messaging initialization                                                         |
| `time-utils.ts`            | Relative time formatting                                                                      |

## Providers

| Provider                   | Purpose                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `NotificationProvider`     | Context providing unreadCount + unreadByCategory; listens to Socket.IO events, shows toasts, invalidates React Query caches |
| `PushNotificationProvider` | FCM registration + permission prompt                                                                                        |

## Hooks

| Hook                      | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `useNotifications`        | Notification queries + mutations             |
| `usePushNotifications`    | FCM registration + permission state          |
| `useSocketRoom`           | Join/leave Socket.IO rooms                   |
| `useNotificationNavigate` | Resolve notification → route + scroll target |

## Components

| Component                  | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `NotificationRow`          | Single notification item with icon, message, time |
| `NotificationCategoryTabs` | Category filter tabs with unread counts           |
| `NotificationActionBar`    | Mark-all-read and clear actions                   |
| `NotificationEmptyState`   | Empty state illustration                          |
| `NotificationUnauthState`  | Login prompt for unauthenticated users            |

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_auth` — User context for token-based Socket.IO auth
- `socket.io-client`
- `firebase`
