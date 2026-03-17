// Like-related types

import type { ProfileImage } from "./user"

/** A populated lounge summary returned inside a LikedLounge. */
export interface LikedLoungeSummary {
  _id: string
  firstName: string
  lastName: string
  loungeTitle?: string
  profileImage?: ProfileImage
  coverImage?: ProfileImage | string
  averageRating: number
  ratingCount: number
  likeCount: number
}

/** A single "like" record with the lounge populated (used in my-likes list). */
export interface LikedLounge {
  _id: string
  clientId: string
  loungeId: LikedLoungeSummary
  createdAt: string
}

/** A populated client summary returned inside a LoungeLiker. */
export interface LikerClient {
  _id: string
  firstName: string
  lastName: string
  profileImage?: ProfileImage
}

/** A single "like" record with the client populated (used in lounge-likers list). */
export interface LoungeLiker {
  _id: string
  clientId: LikerClient
  loungeId: string
  createdAt: string
}

/** Shape returned by the toggle endpoint. */
export interface LikeToggleResult {
  liked: boolean
}

/** Paginated likes response. */
export interface PaginatedLikes<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
