// Content module types — Posts, Reels, Comments, Feed, Reports, Hashtags

/* ───────── Enums ───────── */

export enum ContentType {
  POST = "post",
  REEL = "reel",
}

export enum AuthorType {
  CLIENT = "client",
  LOUNGE = "lounge",
}

export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  DISMISSED = "dismissed",
}

/* ───────── Author (populated from backend) ───────── */

export interface AuthorSummary {
  _id: string
  firstName?: string
  lastName?: string
  loungeTitle?: string
  profileImage?: string
  type: "client" | "lounge"
}

/* ───────── Post ───────── */

export interface PostMedia {
  url: string
  publicId: string
}

export interface Post {
  _id: string
  authorId: AuthorSummary
  authorType: AuthorType
  text?: string
  media: PostMedia[]
  hashtags: string[]
  likeCount: number
  commentCount: number
  saveCount: number
  isHidden: boolean
  isLiked?: boolean
  isSaved?: boolean
  createdAt: string
  updatedAt: string
}

/* ───────── Reel ───────── */

export interface Reel {
  _id: string
  authorId: AuthorSummary
  authorType: AuthorType
  caption?: string
  videoUrl: string
  videoPublicId: string
  thumbnailUrl?: string
  thumbnailPublicId?: string
  duration: number // 1–60 seconds
  hashtags: string[]
  likeCount: number
  commentCount: number
  saveCount: number
  isHidden: boolean
  isLiked?: boolean
  isSaved?: boolean
  createdAt: string
  updatedAt: string
}

/* ───────── Feed Item (discriminated union) ───────── */

export type FeedItem =
  | (Post & { contentType: "post" })
  | (Reel & { contentType: "reel" })

/* ───────── Comment ───────── */

export interface Comment {
  _id: string
  authorId: AuthorSummary
  targetId: string
  targetType: "post" | "reel"
  text: string
  parentCommentId?: string | null
  likeCount: number
  isLiked?: boolean
  isHidden: boolean
  replyCount?: number
  createdAt: string
  updatedAt: string
}

/* ───────── Hashtag ───────── */

export interface Hashtag {
  _id: string
  name: string
  postCount: number
  createdAt: string
}

/* ───────── Report ───────── */

export interface Report {
  _id: string
  reporterId: AuthorSummary
  targetId: string
  targetType: "post" | "reel" | "comment"
  reason: string
  description?: string
  status: ReportStatus
  adminNote?: string
  createdAt: string
  updatedAt: string
}

/* ───────── API Response wrappers ───────── */

export interface ContentPagination {
  total: number
  page: number
  limit: number
}

export interface PaginatedContentResponse<T> {
  data: T[]
  pagination: ContentPagination
  message: string
}

export interface SingleContentResponse<T> {
  data: T
  message: string
}

/* ───────── Create / Update DTOs ───────── */

export interface CreatePostInput {
  text?: string
  media?: File[]
  hashtags?: string[]
}

export interface UpdatePostInput {
  text?: string
  hashtags?: string[]
}

export interface CreateReelInput {
  video: File
  thumbnail?: File
  caption?: string
  duration: number
  hashtags?: string[]
}

export interface UpdateReelInput {
  caption?: string
  hashtags?: string[]
}

export interface CreateCommentInput {
  text: string
  parentCommentId?: string
}

export interface CreateReportInput {
  reason: string
}

export interface ReviewReportInput {
  status: "reviewed" | "dismissed"
  adminNote?: string
}
