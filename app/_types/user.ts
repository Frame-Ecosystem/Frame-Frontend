// User-related types

export type UserType = "client" | "lounge" | "admin" | string

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
}

export interface AuthResponse {
  data: User
  token: string
  expiresIn?: number
  message?: string
}
