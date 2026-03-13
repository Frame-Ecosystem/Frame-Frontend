// Notification types

/* eslint-disable no-unused-vars */
export enum NotificationType {
  BOOKING_CREATED = "booking:created",
  BOOKING_CONFIRMED = "booking:confirmed",
  BOOKING_CANCELLED = "booking:cancelled",
  BOOKING_IN_QUEUE = "booking:inQueue",
  BOOKING_COMPLETED = "booking:completed",
  BOOKING_ABSENT = "booking:absent",
  QUEUE_IN_SERVICE = "queue:inService",
  QUEUE_COMPLETED = "queue:completed",
  QUEUE_ABSENT = "queue:absent",
  QUEUE_AUTO_CANCELLED = "queue:autoCancelled",
  QUEUE_BACK_IN_QUEUE = "queue:backInQueue",
  QUEUE_REMINDER = "queue:reminder",
  QUEUE_POSITION_CHANGED = "queue:positionChanged",
}
/* eslint-enable no-unused-vars */

export interface NotificationMetadata {
  bookingId?: string
  loungeId?: string
  clientId?: string
  agentId?: string
}

export interface AppNotification {
  _id: string
  userId: string
  title: string
  body: string
  type: NotificationType | string
  isRead: boolean
  metadata?: NotificationMetadata
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  success: boolean
  data: AppNotification[]
  unreadCount: number
  total: number
  page: number
  limit: number
  totalPages: number
  message: string
}

export interface UnreadCountResponse {
  success: boolean
  data: { unreadCount: number }
  message: string
}
