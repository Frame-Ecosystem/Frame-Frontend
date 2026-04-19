import { apiClient } from "./api"
import type {
  Store,
  Product,
  Order,
  Cart,
  Review,
  WishlistItem,
  StoreAnalytics,
  CreateStoreDto,
  UpdateStoreDto,
  CreateProductDto,
  UpdateProductDto,
  CreateOrderDto,
  CreateReviewDto,
  StoreDiscoverParams,
  ProductDiscoverParams,
  MarketplaceListResponse,
  OrderStatus,
  StoreStatus,
  ProductStatus,
  StoreBadge,
} from "../_types/marketplace"

export interface AdminMarketplaceAnalytics {
  overview: {
    totalStores: number
    storesByStatus: Record<string, number>
    totalProducts: number
    totalOrders: number
    totalRevenue: number
  }
  topStores: Store[]
  recentDisputes: Order[]
  dailyOrders: { _id: string; orders: number; revenue: number }[]
}

export interface AdminDisputeResolutionDto {
  resolution: "refunded" | "delivered" | "cancelled"
  notes: string
  refundAmount?: number
}

const BASE = "/v1/marketplace"

class MarketplaceService {
  // ── Stores ──────────────────────────────────────────────────────────────

  async discoverStores(
    params: StoreDiscoverParams = {},
  ): Promise<MarketplaceListResponse<Store>> {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.category) q.set("category", params.category)
    if (params.page) q.set("page", String(params.page))
    if (params.limit) q.set("limit", String(params.limit))
    if (params.sort) q.set("sort", params.sort)
    const qs = q.toString()
    const res = await apiClient.get<any>(
      `${BASE}/stores/discover${qs ? `?${qs}` : ""}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async getStoreBySlug(slug: string): Promise<Store> {
    const res = await apiClient.get<any>(`${BASE}/stores/slug/${slug}`)
    return res?.data ?? res
  }

  async getStoreById(id: string): Promise<Store> {
    const res = await apiClient.get<any>(`${BASE}/stores/${id}`)
    return res?.data ?? res
  }

  async createStore(dto: CreateStoreDto): Promise<Store> {
    const res = await apiClient.post<any>(`${BASE}/stores`, dto)
    return res?.data ?? res
  }

  async getMyStore(): Promise<Store | null> {
    try {
      const res = await apiClient.get<any>(`${BASE}/stores/me/store`)
      return res?.data ?? res
    } catch {
      return null
    }
  }

  async updateMyStore(dto: UpdateStoreDto): Promise<Store> {
    const res = await apiClient.put<any>(`${BASE}/stores/me/store`, dto)
    return res?.data ?? res
  }

  async uploadStoreLogo(file: File): Promise<Store> {
    const form = new FormData()
    form.append("logo", file)
    const res = await apiClient.post<any>(`${BASE}/stores/me/store/logo`, form)
    return res?.data ?? res
  }

  async uploadStoreBanner(file: File): Promise<Store> {
    const form = new FormData()
    form.append("banner", file)
    const res = await apiClient.post<any>(
      `${BASE}/stores/me/store/banner`,
      form,
    )
    return res?.data ?? res
  }

  async closeMyStore(): Promise<void> {
    await apiClient.delete<any>(`${BASE}/stores/me/store`)
  }

  // ── Products ─────────────────────────────────────────────────────────────

  async discoverProducts(
    params: ProductDiscoverParams = {},
  ): Promise<MarketplaceListResponse<Product>> {
    const q = new URLSearchParams()
    if (params.search) q.set("search", params.search)
    if (params.category) q.set("category", params.category)
    if (params.storeId) q.set("storeId", params.storeId)
    if (params.minPrice !== undefined)
      q.set("minPrice", String(params.minPrice))
    if (params.maxPrice !== undefined)
      q.set("maxPrice", String(params.maxPrice))
    if (params.inStock !== undefined) q.set("inStock", String(params.inStock))
    if (params.page) q.set("page", String(params.page))
    if (params.limit) q.set("limit", String(params.limit))
    if (params.sort) q.set("sort", params.sort)
    const qs = q.toString()
    const res = await apiClient.get<any>(
      `${BASE}/products/discover${qs ? `?${qs}` : ""}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async getProductsByStore(
    storeId: string,
    page = 1,
    limit = 20,
  ): Promise<MarketplaceListResponse<Product>> {
    const res = await apiClient.get<any>(
      `${BASE}/products/store/${storeId}?page=${page}&limit=${limit}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<any>(`${BASE}/products/${id}`)
    return res?.data ?? res
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const res = await apiClient.post<any>(`${BASE}/products`, dto)
    return res?.data ?? res
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const res = await apiClient.put<any>(`${BASE}/products/${id}`, dto)
    return res?.data ?? res
  }

  async uploadProductImages(id: string, files: File[]): Promise<Product> {
    const form = new FormData()
    files.forEach((f) => form.append("images", f))
    const res = await apiClient.post<any>(`${BASE}/products/${id}/images`, form)
    return res?.data ?? res
  }

  async deleteProductImage(id: string, publicId: string): Promise<void> {
    await apiClient.delete<any>(
      `${BASE}/products/${id}/images/${encodeURIComponent(publicId)}`,
    )
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete<any>(`${BASE}/products/${id}`)
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const res = await apiClient.post<any>(`${BASE}/orders`, dto)
    return res?.data ?? res
  }

  async getMyOrders(
    page = 1,
    limit = 20,
  ): Promise<MarketplaceListResponse<Order>> {
    const res = await apiClient.get<any>(
      `${BASE}/orders/me?page=${page}&limit=${limit}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient.get<any>(`${BASE}/orders/${id}`)
    return res?.data ?? res
  }

  async getStoreOrders(
    storeId: string,
    page = 1,
    limit = 20,
  ): Promise<MarketplaceListResponse<Order>> {
    const res = await apiClient.get<any>(
      `${BASE}/orders/store/${storeId}?page=${page}&limit=${limit}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    extra?: { trackingNumber?: string; trackingUrl?: string; note?: string },
  ): Promise<Order> {
    const res = await apiClient.put<any>(`${BASE}/orders/${id}/status`, {
      status,
      ...extra,
    })
    return res?.data ?? res
  }

  // ── Cart ─────────────────────────────────────────────────────────────────

  async getCart(): Promise<Cart | null> {
    try {
      const res = await apiClient.get<any>(`${BASE}/cart`)
      return res?.data ?? res
    } catch {
      return null
    }
  }

  async addToCart(
    productId: string,
    quantity: number,
    variantIndex?: number,
  ): Promise<Cart> {
    const res = await apiClient.post<any>(`${BASE}/cart/items`, {
      productId,
      quantity,
      variantIndex,
    })
    return res?.data ?? res
  }

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const res = await apiClient.put<any>(`${BASE}/cart/items/${productId}`, {
      quantity,
    })
    return res?.data ?? res
  }

  async removeFromCart(productId: string): Promise<Cart> {
    const res = await apiClient.delete<any>(`${BASE}/cart/items/${productId}`)
    return res?.data ?? res
  }

  async clearCart(): Promise<void> {
    await apiClient.delete<any>(`${BASE}/cart/clear`)
  }

  // ── Reviews ──────────────────────────────────────────────────────────────

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 20,
    sort = "newest",
  ): Promise<MarketplaceListResponse<Review>> {
    const res = await apiClient.get<any>(
      `${BASE}/reviews/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async getStoreReviews(
    storeId: string,
    page = 1,
    limit = 20,
  ): Promise<MarketplaceListResponse<Review>> {
    const res = await apiClient.get<any>(
      `${BASE}/reviews/store/${storeId}?page=${page}&limit=${limit}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async createReview(dto: CreateReviewDto): Promise<Review> {
    const res = await apiClient.post<any>(`${BASE}/reviews`, dto)
    return res?.data ?? res
  }

  async updateReview(
    id: string,
    dto: Partial<CreateReviewDto>,
  ): Promise<Review> {
    const res = await apiClient.put<any>(`${BASE}/reviews/${id}`, dto)
    return res?.data ?? res
  }

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete<any>(`${BASE}/reviews/${id}`)
  }

  async markReviewHelpful(id: string): Promise<void> {
    await apiClient.post<any>(`${BASE}/reviews/${id}/helpful`, {})
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────

  async getWishlist(
    page = 1,
    limit = 20,
  ): Promise<MarketplaceListResponse<WishlistItem>> {
    const res = await apiClient.get<any>(
      `${BASE}/wishlist?page=${page}&limit=${limit}`,
    )
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async addToWishlist(productId: string): Promise<WishlistItem> {
    const res = await apiClient.post<any>(`${BASE}/wishlist/${productId}`, {})
    return res?.data ?? res
  }

  async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete<any>(`${BASE}/wishlist/${productId}`)
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getMyStoreAnalytics(): Promise<StoreAnalytics> {
    const res = await apiClient.get<any>(`${BASE}/analytics/my-store`)
    return res?.data ?? res
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async adminGetAllStores(
    params: { status?: StoreStatus; page?: number; limit?: number } = {},
  ): Promise<MarketplaceListResponse<Store>> {
    const q = new URLSearchParams()
    if (params.status) q.set("status", params.status)
    q.set("page", String(params.page ?? 1))
    q.set("limit", String(params.limit ?? 20))
    const res = await apiClient.get<any>(`${BASE}/stores/admin/all?${q}`)
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async adminUpdateStoreStatus(
    id: string,
    status: StoreStatus,
    reason?: string,
  ): Promise<Store> {
    const res = await apiClient.put<any>(`${BASE}/stores/admin/${id}/status`, {
      status,
      ...(reason ? { reason } : {}),
    })
    return res?.data ?? res
  }

  async adminVerifyStore(id: string, badge: StoreBadge): Promise<Store> {
    const res = await apiClient.put<any>(`${BASE}/stores/admin/${id}/verify`, {
      badge,
    })
    return res?.data ?? res
  }

  async adminGetAllProducts(
    params: { status?: ProductStatus; page?: number; limit?: number } = {},
  ): Promise<MarketplaceListResponse<Product>> {
    const q = new URLSearchParams()
    if (params.status) q.set("status", params.status)
    q.set("page", String(params.page ?? 1))
    q.set("limit", String(params.limit ?? 20))
    const res = await apiClient.get<any>(`${BASE}/products/admin/all?${q}`)
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async adminUpdateProductStatus(
    id: string,
    status: ProductStatus,
    reason?: string,
  ): Promise<Product> {
    const res = await apiClient.put<any>(
      `${BASE}/products/admin/${id}/status`,
      { status, ...(reason ? { reason } : {}) },
    )
    return res?.data ?? res
  }

  async adminGetAllOrders(
    params: { status?: OrderStatus; page?: number; limit?: number } = {},
  ): Promise<MarketplaceListResponse<Order>> {
    const q = new URLSearchParams()
    if (params.status) q.set("status", params.status)
    q.set("page", String(params.page ?? 1))
    q.set("limit", String(params.limit ?? 20))
    const res = await apiClient.get<any>(`${BASE}/orders/admin/all?${q}`)
    return { data: res?.data ?? [], count: res?.count ?? 0 }
  }

  async adminResolveDispute(
    id: string,
    dto: AdminDisputeResolutionDto,
  ): Promise<Order> {
    const res = await apiClient.put<any>(
      `${BASE}/orders/admin/${id}/resolve`,
      dto,
    )
    return res?.data ?? res
  }

  async adminHideReview(id: string): Promise<Review> {
    const res = await apiClient.put<any>(`${BASE}/reviews/admin/${id}/hide`, {})
    return res?.data ?? res
  }

  async adminGetAnalytics(): Promise<AdminMarketplaceAnalytics> {
    const res = await apiClient.get<any>(`${BASE}/analytics/admin`)
    return res?.data ?? res
  }
}

export const marketplaceService = new MarketplaceService()
