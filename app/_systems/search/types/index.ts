export type SearchCategory =
  | "all"
  | "users"
  | "lounges"
  | "posts"
  | "reels"
  | "products"
  | "stores"
  | "hashtags"
  | "services"

export const SEARCH_CATEGORIES: SearchCategory[] = [
  "all",
  "users",
  "lounges",
  "posts",
  "reels",
  "products",
  "stores",
  "hashtags",
  "services",
]

export interface SearchResponse {
  data: SearchResponseData
  message: string
}

export interface SearchResponseData {
  query: string
  type: SearchCategory
  users?: { data: SearchUser[]; total: number }
  lounges?: { data: SearchLounge[]; total: number }
  posts?: { data: SearchPost[]; total: number }
  reels?: { data: SearchReel[]; total: number }
  products?: { data: SearchProduct[]; total: number }
  stores?: { data: SearchStore[]; total: number }
  hashtags?: { data: SearchHashtag[]; total: number }
  services?: { data: SearchService[]; total: number }
}

export interface SearchUser {
  _id: string
  type: "client" | "agent"
  firstName?: string
  lastName?: string
  agentName?: string
  profileImage?: { url?: string; publicId?: string }
  bio?: string
  location?: { address?: string; placeName?: string }
  followersCount?: number
}

export interface SearchLounge {
  _id: string
  loungeTitle?: string
  firstName?: string
  lastName?: string
  profileImage?: { url?: string; publicId?: string }
  bio?: string
  location?: { address?: string; placeName?: string }
  averageRating?: number
  followersCount?: number
}

export interface SearchPost {
  _id: string
  contentType: "post"
  authorId: {
    _id: string
    firstName?: string
    lastName?: string
    loungeTitle?: string
    profileImage?: { url?: string }
    type?: string
  }
  text?: string
  media?: Array<{ url: string; publicId: string }>
  hashtags: string[]
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt: string
}

export interface SearchReel {
  _id: string
  contentType: "reel"
  authorId: {
    _id: string
    firstName?: string
    lastName?: string
    loungeTitle?: string
    profileImage?: { url?: string }
    type?: string
  }
  caption?: string
  videoUrl?: string
  thumbnailUrl?: string
  hashtags: string[]
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt: string
}

export interface SearchProduct {
  _id: string
  name: string
  slug: string
  description?: string
  price: number
  currency: string
  images: Array<{ url: string; publicId: string; isPrimary: boolean }>
  stats: { averageRating: number; ratingCount: number; totalSold: number }
  storeId: { _id: string; name: string; slug: string }
  tags: string[]
  createdAt: string
}

export interface SearchStore {
  _id: string
  name: string
  slug: string
  description?: string
  logo?: { url?: string; publicId?: string }
  category: string
  badge: string
  isVerified: boolean
  stats: { averageRating: number; totalProducts: number }
  location?: { city?: string; address?: string }
  createdAt: string
}

export interface SearchHashtag {
  _id: string
  name: string
  postCount: number
}

export interface SearchService {
  _id: string
  name: string
  description?: string
  categoryId: { _id: string; name: string }
}
