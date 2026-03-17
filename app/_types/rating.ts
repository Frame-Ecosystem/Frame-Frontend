import type { ProfileImage } from "./user"

export interface PopulatedClient {
  _id: string
  firstName: string
  lastName: string
  profileImage?: ProfileImage
}

export interface Rating {
  _id: string
  clientId: string | PopulatedClient
  loungeId: string
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
  loungeId: string
  score: number
  comment?: string
}
