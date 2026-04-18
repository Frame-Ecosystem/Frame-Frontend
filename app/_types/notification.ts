// Notification types — synced with backend NOTIFICATION_SYSTEM.md

// ── Notification Categories ──────────────────────────────────
export enum NotificationCategory {
  BOOKING = "booking",
  QUEUE = "queue",
  CONTENT = "content",
  SOCIAL = "social",
  ADMIN = "admin",
  SYSTEM = "system",
}

// ── All 24 Notification Types ────────────────────────────────
export enum NotificationType {
  // Booking (6)
  BOOKING_CREATED = "booking:created",
  BOOKING_CONFIRMED = "booking:confirmed",
  BOOKING_CANCELLED = "booking:cancelled",
  BOOKING_IN_QUEUE = "booking:inQueue",
  BOOKING_COMPLETED = "booking:completed",
  BOOKING_ABSENT = "booking:absent",
  // Queue (7)
  QUEUE_IN_SERVICE = "queue:inService",
  QUEUE_AUTO_CANCELLED = "queue:autoCancelled",
  QUEUE_BACK_IN_QUEUE = "queue:backInQueue",
  QUEUE_REMINDER = "queue:reminder",
  QUEUE_POSITION_CHANGED = "queue:positionChanged",
  QUEUE_COMPLETED = "queue:completed",
  QUEUE_ABSENT = "queue:absent",
  // Content (6)
  POST_LIKED = "post:liked",
  POST_COMMENTED = "post:commented",
  REEL_LIKED = "reel:liked",
  REEL_COMMENTED = "reel:commented",
  COMMENT_REPLIED = "comment:replied",
  COMMENT_LIKED = "comment:liked",
  // Social (3)
  NEW_FOLLOWER = "social:newFollower",
  LOUNGE_LIKED = "social:loungeLiked",
  LOUNGE_RATED = "social:loungeRated",
  // Admin (4)
  SUGGESTION_CREATED = "admin:suggestionCreated",
  SUGGESTION_APPROVED = "admin:suggestionApproved",
  SUGGESTION_REJECTED = "admin:suggestionRejected",
  CONTENT_HIDDEN = "admin:contentHidden",
}

// ── Category Map (mirrors backend NOTIFICATION_CATEGORY_MAP) ─
export const NOTIFICATION_CATEGORY_MAP: Record<string, NotificationCategory> = {
  [NotificationType.BOOKING_CREATED]: NotificationCategory.BOOKING,
  [NotificationType.BOOKING_CONFIRMED]: NotificationCategory.BOOKING,
  [NotificationType.BOOKING_CANCELLED]: NotificationCategory.BOOKING,
  [NotificationType.BOOKING_IN_QUEUE]: NotificationCategory.BOOKING,
  [NotificationType.BOOKING_COMPLETED]: NotificationCategory.BOOKING,
  [NotificationType.BOOKING_ABSENT]: NotificationCategory.BOOKING,
  [NotificationType.QUEUE_IN_SERVICE]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_AUTO_CANCELLED]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_BACK_IN_QUEUE]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_REMINDER]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_POSITION_CHANGED]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_COMPLETED]: NotificationCategory.QUEUE,
  [NotificationType.QUEUE_ABSENT]: NotificationCategory.QUEUE,
  [NotificationType.POST_LIKED]: NotificationCategory.CONTENT,
  [NotificationType.POST_COMMENTED]: NotificationCategory.CONTENT,
  [NotificationType.REEL_LIKED]: NotificationCategory.CONTENT,
  [NotificationType.REEL_COMMENTED]: NotificationCategory.CONTENT,
  [NotificationType.COMMENT_REPLIED]: NotificationCategory.CONTENT,
  [NotificationType.COMMENT_LIKED]: NotificationCategory.CONTENT,
  [NotificationType.NEW_FOLLOWER]: NotificationCategory.SOCIAL,
  [NotificationType.LOUNGE_LIKED]: NotificationCategory.SOCIAL,
  [NotificationType.LOUNGE_RATED]: NotificationCategory.SOCIAL,
  [NotificationType.SUGGESTION_CREATED]: NotificationCategory.ADMIN,
  [NotificationType.SUGGESTION_APPROVED]: NotificationCategory.ADMIN,
  [NotificationType.SUGGESTION_REJECTED]: NotificationCategory.ADMIN,
  [NotificationType.CONTENT_HIDDEN]: NotificationCategory.ADMIN,
}

// ── Metadata ─────────────────────────────────────────────────
export interface NotificationMetadata {
  bookingId?: string
  loungeId?: string
  clientId?: string
  agentId?: string
  postId?: string
  reelId?: string
  commentId?: string
  targetType?: "post" | "reel" | "comment"
  followerId?: string
  ratingScore?: number
  suggestionId?: string
  reason?: string
}

// ── Notification Document ────────────────────────────────────
export interface AppNotification {
  _id: string
  userId: string
  actorId?: string
  title: string
  body: string
  type: NotificationType | string
  category: NotificationCategory | string
  isRead: boolean
  metadata?: NotificationMetadata
  actionUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// ── API Responses ────────────────────────────────────────────
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

export interface UnreadCountByCategory {
  [key: string]: number
}

export interface UnreadCountData {
  total: number
  byCategory: UnreadCountByCategory
}

export interface UnreadCountResponse {
  success: boolean
  data: UnreadCountData
  message: string
}
