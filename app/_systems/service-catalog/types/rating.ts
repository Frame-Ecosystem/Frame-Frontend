import type { ProfileImage } from "@/app/_systems/user/types/user"
import type {
  ActiveUserType,
  PopulatedUserSummary,
} from "@/app/_core/types/common"
import { isPopulated } from "@/app/_core/types/common"

export type RatingUserType = ActiveUserType

export interface PopulatedRater extends PopulatedUserSummary {
  profileImage?: ProfileImage
}

/** @deprecated Use PopulatedRater instead */
export type PopulatedClient = PopulatedRater

export interface Rating {
  _id: string
  raterId: string | PopulatedRater
  targetId: string
  raterType: RatingUserType
  targetType: RatingUserType
  score: number
  comment?: string
  createdAt: string
  updatedAt: string
}

export interface RatingSummary {
  averageRating: number
  ratingCount: number
}

export interface PaginatedRatings {
  data: Rating[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SubmitRatingInput {
  targetId: string
  score: number
  comment?: string
}

/** Client-side rating matrix — check before showing rating UI. */
const ALLOWED_PAIRS = new Set<string>([
  "client→lounge",
  "client→agent",
  "agent→lounge",
  "lounge→agent",
])

export function canRate(
  raterType: RatingUserType,
  targetType: RatingUserType,
): boolean {
  return ALLOWED_PAIRS.has(`${raterType}→${targetType}`)
}

/** Type guard: check if a raterId is a populated object (not a plain string). */
export function isPopulatedRater(
  r: string | PopulatedRater,
): r is PopulatedRater {
  return isPopulated<PopulatedRater>(r)
}
