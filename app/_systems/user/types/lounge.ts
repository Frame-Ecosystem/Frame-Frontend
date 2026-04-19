// Lounge profile type (lounge account listing shape)

export interface Lounge {
  id: string
  _id?: string
  name: string
  loungeTitle?: string
  imageUrl?: string
  profileImage?: string | { url: string; publicId?: string }
  coverImage?: string | { url: string; publicId?: string }
  coverImageUrl?: string
  address?: string
  averageRating?: number
  ratingCount?: number
  likeCount?: number
  bio?: string
  description?: string
  phoneNumber?: string
  phones?: string[]
  email?: string
  isOpen?: boolean
  location?: {
    type?: string
    coordinates?: [number, number]
    address?: string
    latitude?: number
    longitude?: number
    placeName?: string
  }
  verified?: boolean
  type?: string
}
