// User-related types

export type UserType = "client" | "lounge" | "admin"

export type Gender = "male" | "female" | "unisex" | "kids"

export interface ProfileImage {
  url: string
  publicId?: string
}

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  placeId: string
  placeName?: string
  _id?: string
}

export interface User {
  _id?: string
  email: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  loungeTitle?: string
  bio?: string
  profileImage?: ProfileImage | string
  coverImage?: ProfileImage | string
  type?: UserType
  gender?: Gender
  createdAt?: string
  location?: LocationData
  emailVerified?: boolean
  verified?: boolean
  email_verified?: boolean
  theme?: string
  language?: string
  averageRating?: number
  ratingCount?: number
  likeCount?: number
}

export interface AuthResponse {
  data: User
  token: string
  expiresIn?: number
  message?: string
}

// ── Client Visitor Profile Types ─────────────────────────────────

export interface ClientProfile {
  _id: string
  firstName: string
  lastName: string
  profileImage?: string
  coverImage?: string
  bio?: string
  gender?: string
  // Lounge + Admin viewers only
  createdAt?: string
  // Admin only
  updatedAt?: string
  email?: string
  phoneNumber?: string
  isBlocked?: boolean
  type?: string
}

export interface ClientStats {
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  absentBookings: number
  likedLounges: number
  ratingsGiven: number
}

export interface ClientProfileResponse {
  profile: ClientProfile
  stats: ClientStats
}

export interface ClientBookingItem {
  _id: string
  clientId: string
  loungeId: {
    _id: string
    loungeTitle: string
    profileImage?: string
  }
  loungeServiceIds: {
    _id: string
    price: number
    duration: number
  }[]
  status:
    | "pending"
    | "confirmed"
    | "inQueue"
    | "completed"
    | "cancelled"
    | "absent"
  bookingDate: string
}

export interface ClientLikedLounge {
  _id: string
  loungeTitle: string
  profileImage?: string
  coverImage?: string
  averageRating: number
  ratingCount: number
  location?: {
    type: "Point"
    coordinates: [number, number]
  }
}

export interface ClientRatingItem {
  _id: string
  clientId: string
  loungeId: {
    _id: string
    loungeTitle: string
    profileImage?: string
  }
  rating: number
  comment?: string
  createdAt: string
}
