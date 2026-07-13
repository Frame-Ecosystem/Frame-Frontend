import type { ProfileImage } from "@/app/_systems/user/types/user"
import type {
  ActiveUserType,
  PopulatedUserSummary,
} from "@/app/_core/types/common"

export type LikeUserType = ActiveUserType

/** Populated target summary (lounge or agent) in "my likes" list. */
export interface PopulatedTarget extends PopulatedUserSummary {
  profileImage?: ProfileImage
  coverImage?: ProfileImage | string
  averageRating: number
  ratingCount: number
  likeCount: number
}

/** Populated liker summary in "likers of target" list. */
export type PopulatedLiker = PopulatedUserSummary & {
  profileImage?: ProfileImage
}

/** A single like record with the target populated (my likes list). */
export interface LikedTarget {
  _id: string
  likerId: string
  targetId: PopulatedTarget
  likerType: LikeUserType
  targetType: LikeUserType
  createdAt: string
}

/** A single like record with the liker populated (target likers list). */
export interface TargetLiker {
  _id: string
  likerId: PopulatedLiker
  targetId: string
  likerType: LikeUserType
  targetType: LikeUserType
  createdAt: string
}

/** @deprecated Use LikedTarget instead */
export type LikedLounge = LikedTarget
/** @deprecated Use PopulatedTarget instead */
export type LikedLoungeSummary = PopulatedTarget
/** @deprecated Use TargetLiker instead */
export type LoungeLiker = TargetLiker
/** @deprecated Use PopulatedLiker instead */
export type LikerClient = PopulatedLiker

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

/** Client-side like matrix — check before showing heart button. */
const ALLOWED_LIKE_PAIRS = new Set<string>([
  "client→lounge",
  "client→agent",
  "lounge→agent",
])

export function canLike(
  likerType: LikeUserType,
  targetType: LikeUserType,
): boolean {
  return ALLOWED_LIKE_PAIRS.has(`${likerType}→${targetType}`)
}
