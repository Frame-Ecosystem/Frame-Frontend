// Lounge visitor & service-item types

export interface Lounge {
  id: string
  name: string
  address?: string
  phones?: string[]
  description?: string
  imageUrl?: string
  coverImageUrl?: string
  isOpen?: boolean
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  createdAt?: string
  updatedAt?: string
}

/** @deprecated Use `Lounge` instead */
export type Center = Lounge

export interface ServiceItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
  price: number
  durationMinutes?: number
  loungeId: string
  lounge?: Lounge
}

export type LoungeService = ServiceItem

/** @deprecated Use `LoungeService` instead */
export type CenterService = ServiceItem
