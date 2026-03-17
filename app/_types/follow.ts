// Follow-related types

import type { ProfileImage } from "./user"

/** Shape returned by follow / unfollow toggle endpoints. */
export interface FollowToggleResult {
  following: boolean
}

/** Shape returned by the check-following endpoint. */
export interface FollowCheckResult {
  isFollowing: boolean
}

/** Follower / following counts for a user. */
export interface FollowCounts {
  followersCount: number
  followingCount: number
}

/** Populated user summary inside a follow record. */
export interface FollowUser {
  _id: string
  firstName: string
  lastName: string
  loungeTitle?: string
  profileImage?: ProfileImage | string
  coverImage?: ProfileImage | string
  type?: "client" | "lounge"
}

/** A single follow record with the target (followed) user populated. */
export interface FollowingRecord {
  _id: string
  followerId: string
  followingId: FollowUser
  createdAt: string
}

/** A single follow record with the follower user populated. */
export interface FollowerRecord {
  _id: string
  followerId: FollowUser
  followingId: string
  createdAt: string
}

/** Paginated follows response. */
export interface PaginatedFollows<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
