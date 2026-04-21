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
  REJECTED: "rejected",
} as const
export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus]

export const StoreBadge = {
  NONE: "none",
  VERIFIED: "verified",
  PREMIUM: "premium",
  TOP_SELLER: "top_seller",
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
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
  PENDING_REVIEW: "pending_review",
  REJECTED: "rejected",
} as const
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]

export const OrderStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  RETURNED: "returned",
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export type PaymentMethod = "cashOnDelivery" | "bankTransfer" | "inStore"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"

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
  viewCount: number
  followerCount: number
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
  ownerType: "client" | "lounge"
  name: string
  slug: string
  description?: string
  category: StoreCategory
  tags: string[]
  logo?: StoreImage
  banner?: StoreImage
  contactEmail?: string
  contactPhone?: string
  contactWhatsapp?: string
  socialLinks?: StoreSocialLinks
  address?: StoreAddress
  returnPolicy?: string
  shippingPolicy?: string
  status: StoreStatus
  isVerified: boolean
  badge: StoreBadge
  stats: StoreStats
  settings: StoreSettings
  /** @alias stats.totalProducts */
  totalProducts?: number
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

export interface ProductVariantOption {
  label: string
  value: string
  priceModifier?: number
  stock?: number
}

export interface ProductVariant {
  name: string
  options: ProductVariantOption[]
}

export interface ProductAttribute {
  key: string
  value: string
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
  shortDescription?: string
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
  costPrice?: number
  currency: string
  sku?: string
  barcode?: string
  stock: number
  lowStockThreshold: number
  trackInventory: boolean
  weight?: number
  dimensions?: { length?: number; width?: number; height?: number }
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  seoTitle?: string
  seoDescription?: string
  status: ProductStatus
  isDigital: boolean
  isFeatured: boolean
  stats: ProductStats
  /** @alias stats.averageRating */
  averageRating?: number
  /** @alias stats.ratingCount */
  reviewCount?: number
  createdAt: string
}

// ── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string | Product
  /** @alias productId */
  product?: Product
  productSnapshot: {
    name: string
    price: number
    image?: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  /** @alias unitPrice */
  price?: number
  variantInfo?: string
  /** @alias variantInfo */
  variants?: any[]
}

export interface OrderStatusHistory {
  status: OrderStatus
  timestamp: string
  note?: string
  changedBy?: string
}

export interface ShippingAddress {
  fullName?: string
  phone?: string
  street: string
  city: string
  state?: string
  country: string
  zipCode?: string
  /** @alias zipCode */
  postalCode?: string
}

export interface Order {
  _id: string
  orderNumber: string
  /** @alias total */
  totalAmount?: number
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
  taxAmount: number
  discountAmount: number
  total: number
  currency: string
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  shippingAddress: ShippingAddress
  trackingNumber?: string
  trackingUrl?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  cancellationReason?: string
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
  productId: Product
  /** @alias productId */
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
  socialLinks?: StoreSocialLinks
  address?: StoreAddress
  returnPolicy?: string
  shippingPolicy?: string
}

export interface UpdateStoreDto extends Partial<CreateStoreDto> {
  settings?: Partial<StoreSettings>
}

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
  variants?: ProductVariant[]
  attributes?: ProductAttribute[]
  trackInventory?: boolean
  lowStockThreshold?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: "active" | "draft" | "archived" | "out_of_stock"
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
