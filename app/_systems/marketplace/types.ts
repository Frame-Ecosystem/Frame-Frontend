// ── Marketplace Types ────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────────────────

export type StoreCategory =
  | "beauty"
  | "fashion"
  | "wellness"
  | "accessories"
  | "tools"
  | "other"

export const StoreStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CLOSED: "closed",
} as const
export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus]

export const StoreBadge = {
  NONE: "none",
  VERIFIED: "verified",
  PREMIUM: "premium",
  TOP_SELLER: "topSeller",
} as const
export type StoreBadge = (typeof StoreBadge)[keyof typeof StoreBadge]

export type LegacyProductCategoryTag =
  | "shampoo"
  | "conditioner"
  | "hair_oil"
  | "hair_mask"
  | "hair_serum"
  | "hair_spray"
  | "hair_color"
  | "hair_tools"
  | "face_cream"
  | "face_serum"
  | "face_mask"
  | "cleanser"
  | "toner"
  | "sunscreen"
  | "moisturizer"
  | "foundation"
  | "concealer"
  | "powder"
  | "blush"
  | "bronzer"
  | "eyeshadow"
  | "eyeliner"
  | "mascara"
  | "lipstick"
  | "lip_gloss"
  | "lip_liner"
  | "nail_polish"
  | "nail_tools"
  | "nail_care"
  | "perfume"
  | "body_mist"
  | "deodorant"
  | "body_lotion"
  | "body_oil"
  | "body_scrub"
  | "bath_bomb"
  | "brush_set"
  | "sponge"
  | "mirror"
  | "organizer"
  | "other"

/**
 * Admin-managed marketplace product category (v2).
 * Replaces the legacy enum. Backed by `/v1/marketplace/product-categories`.
 */
export interface ProductCategory {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: { url?: string; publicId?: string }
  isActive: boolean
  displayOrder: number
  productCount: number
  createdAt: string
  updatedAt: string
}

/**
 * A category reference as returned by Product responses — either the bare
 * ObjectId string or the populated subset `{ _id, name, slug, icon }`.
 */
export type ProductCategoryRef =
  | string
  | Pick<ProductCategory, "_id" | "name" | "slug" | "icon">

/* ── Product category suggestion (v2) ─────────────────────────── */

export const ProductCategorySuggestionStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  IMPLEMENTED: "implemented",
} as const
export type ProductCategorySuggestionStatus =
  (typeof ProductCategorySuggestionStatus)[keyof typeof ProductCategorySuggestionStatus]

export interface ProductCategorySuggestion {
  _id: string
  name: string
  description: string
  exampleProducts: string[]
  iconHint?: string
  status: ProductCategorySuggestionStatus
  suggestedBy:
    | string
    | {
        _id: string
        firstName?: string
        lastName?: string
        loungeTitle?: string
        profileImage?: { url: string }
      }
  implementedCategoryId?:
    | string
    | Pick<ProductCategory, "_id" | "name" | "slug" | "icon">
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export const ProductStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  HIDDEN: "hidden",
} as const
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]

export const ProductCondition = {
  NEW: "new",
  LIKE_NEW: "likeNew",
  USED: "used",
} as const
export type ProductCondition =
  (typeof ProductCondition)[keyof typeof ProductCondition]

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export type PaymentMethod = "cashOnDelivery" | "bankTransfer" | "inStore"

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed"

export type ReviewStatus = "active" | "hidden" | "flagged"

// ── Store ────────────────────────────────────────────────────────────────────

export interface StoreImage {
  url: string
  publicId: string
}

export interface StoreAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
}

export interface StoreLocation {
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  state?: string
}

export interface StorePolicies {
  returnPolicy?: string
  shippingPolicy?: string
}

export interface StoreSocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  website?: string
  tiktok?: string
}

export interface StoreSettings {
  autoAcceptOrders: boolean
  notifyOnOrder: boolean
  notifyOnReview: boolean
  vacationMode: boolean
  minOrderAmount: number
}

export interface StoreStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageRating: number
  ratingCount: number
}

export interface Store {
  _id: string
  ownerId:
    | string
    | {
        _id: string
        firstName?: string
        lastName?: string
        loungeTitle?: string
        profileImage?: { url: string }
      }
  name: string
  slug: string
  description?: string
  category: StoreCategory
  logo?: StoreImage
  banner?: StoreImage
  contactEmail?: string
  contactPhone?: string
  location?: StoreLocation
  policies?: StorePolicies
  status: StoreStatus
  isVerified: boolean
  badge: StoreBadge
  stats: StoreStats
  createdAt: string
  updatedAt: string
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string
  publicId: string
  alt?: string
  isPrimary?: boolean
}

export interface ProductVariant {
  sku?: string
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  attributes?: Record<string, string>
}

export interface ProductStats {
  viewCount: number
  totalSold: number
  totalRevenue: number
  averageRating: number
  ratingCount: number
  wishlistCount: number
}

export interface Product {
  _id: string
  storeId: string | Store
  name: string
  slug: string
  description?: string
  /** Reference to an admin-managed `ProductCategory` document. */
  categoryId: ProductCategoryRef
  /**
   * @deprecated Replaced by `categoryId` in v2.
   * Some legacy responses may still surface this field; prefer `categoryId`.
   */
  category?: LegacyProductCategoryTag
  subcategory?: string
  tags: string[]
  price: number
  compareAtPrice?: number
  currency: string
  sku?: string
  stock: number
  weight?: number
  dimensions?: { length?: number; width?: number; height?: number }
  images: ProductImage[]
  variants: ProductVariant[]
  status: ProductStatus
  condition: ProductCondition
  isDigital: boolean
  stats: ProductStats
  /** @alias stats.averageRating */
  averageRating?: number
  /** @alias stats.ratingCount */
  reviewCount?: number
  createdAt: string
}

// ── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string
  variantIndex?: number
  name: string
  price: number
  quantity: number
  image?: string
}

export interface ShippingAddress {
  fullName?: string
  phone?: string
  address: string
  city: string
  state?: string
  zipCode?: string
  notes?: string
}

export interface Order {
  _id: string
  orderNumber: string
  buyerId:
    | string
    | {
        _id: string
        firstName?: string
        lastName?: string
        profileImage?: { url: string }
      }
  storeId: string | Store
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  status: OrderStatus
  shippingAddress: ShippingAddress
  trackingNumber?: string
  trackingUrl?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  cancelReason?: string
  refundReason?: string
  refundAmount?: number
  disputeReason?: string
  disputeResolution?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: Product
  /** @alias productId */
  product: Product
  storeId: Store
  quantity: number
  variantIndex?: number
  addedAt: string
  /** @alias unitPrice from API */
  price?: number
  variants?: any[]
}

export interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  updatedAt: string
  totalPrice?: number
}

// ── Review ───────────────────────────────────────────────────────────────────

export interface ReviewImage {
  url: string
  publicId: string
}

export interface Review {
  _id: string
  productId: string | Product
  storeId: string | Store
  userId:
    | string
    | {
        _id: string
        firstName?: string
        lastName?: string
        profileImage?: { url: string }
      }
  orderId: string
  rating: number
  title?: string
  comment?: string
  images: ReviewImage[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  status: ReviewStatus
  createdAt: string
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export interface WishlistItem {
  _id: string
  userId: string
  product: Product
  createdAt: string
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface DailyRevenue {
  _id: string // date string
  /** @alias _id */
  date?: string
  revenue: number
  orders: number
}

export interface StoreAnalytics {
  /** @alias overview.totalRevenue */
  totalRevenue?: number
  /** @alias overview.totalOrders */
  totalOrders?: number
  /** @alias overview.totalProducts */
  totalProducts?: number
  overview: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    averageRating: number
    ratingCount: number
  }
  last30Days: {
    revenue: number
    orders: number
    avgOrderValue: number
  }
  ordersByStatus: Record<OrderStatus, number>
  topProducts: Product[]
  recentOrders: Order[]
  dailyRevenue: DailyRevenue[]
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateStoreDto {
  name: string
  description?: string
  category: StoreCategory
  contactEmail?: string
  contactPhone?: string
  location?: StoreLocation
  policies?: StorePolicies
}

export interface UpdateStoreDto extends Partial<CreateStoreDto> {}

export interface CreateProductDto {
  storeId: string
  name: string
  description?: string
  /** ObjectId of an admin-managed `ProductCategory`. */
  categoryId: string
  price: number
  compareAtPrice?: number
  stock: number
  tags?: string[]
  weight?: number
  sku?: string
  condition?: ProductCondition
  isDigital?: boolean
  variants?: ProductVariant[]
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: "active" | "draft" | "archived"
}

export interface CreateOrderDto {
  storeId: string
  items: Array<{
    productId: string
    quantity: number
    variantIndex?: number
  }>
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  notes?: string
}

export interface CreateReviewDto {
  productId: string
  orderId: string
  rating: number
  title?: string
  comment?: string
}

// ── Discovery Query Params ────────────────────────────────────────────────────

export interface StoreDiscoverParams {
  search?: string
  category?: StoreCategory
  page?: number
  limit?: number
  sort?: "newest" | "rating" | "popular"
}

export interface ProductDiscoverParams {
  search?: string
  /** ObjectId of a `ProductCategory` (replaces legacy enum-string `category`). */
  categoryId?: string
  storeId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  page?: number
  limit?: number
  sort?:
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "popular"
    | "best_selling"
}

// ── Paginated Response ────────────────────────────────────────────────────────

export interface MarketplaceListResponse<T> {
  data: T[]
  count: number
  message?: string
}

// ── Product Category DTOs ────────────────────────────────────────────────────

export interface CreateProductCategoryDto {
  name: string
  description?: string
  icon?: string
  image?: { url?: string; publicId?: string }
  isActive?: boolean
  displayOrder?: number
}

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>

export interface ProductCategoryListParams {
  activeOnly?: boolean
}

// ── Product Category Suggestion DTOs ─────────────────────────────────────────

export interface CreateProductCategorySuggestionDto {
  name: string
  description: string
  exampleProducts?: string[]
  iconHint?: string
}

export interface UpdateProductCategorySuggestionDto {
  name?: string
  description?: string
  exampleProducts?: string[]
  iconHint?: string
}

export interface UpdateProductCategorySuggestionStatusDto {
  status: ProductCategorySuggestionStatus
  adminNote?: string
  /* Used only when status === "implemented" — admin overrides */
  name?: string
  description?: string
  icon?: string
  displayOrder?: number
}

export interface AdminApproveProductCategorySuggestionDto {
  status?: ProductCategorySuggestionStatus
  name?: string
  description?: string
  icon?: string
  displayOrder?: number
  adminNote?: string
}

export interface ProductCategorySuggestionListParams {
  page?: number
  limit?: number
  status?: ProductCategorySuggestionStatus
}

export interface ProductCategorySuggestionStats {
  total: number
  pending: number
  approved: number
  rejected: number
  implemented: number
}

export interface ProductCategorySuggestionMutationResponse {
  suggestion: ProductCategorySuggestion
  category: ProductCategory | null
}
