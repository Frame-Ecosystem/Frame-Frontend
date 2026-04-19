import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  marketplaceService,
  type AdminDisputeResolutionDto,
} from "../../_services/marketplace.service"
import type {
  StoreDiscoverParams,
  ProductDiscoverParams,
  CreateStoreDto,
  UpdateStoreDto,
  CreateProductDto,
  UpdateProductDto,
  CreateOrderDto,
  CreateReviewDto,
  OrderStatus,
  StoreStatus,
  ProductStatus,
  StoreBadge,
} from "../../_types/marketplace"

/* ═══════════════════════════════════════════════
   Query Key Factory
   ═══════════════════════════════════════════════ */

export const marketplaceKeys = {
  // Stores
  stores: () => ["marketplace", "stores"] as const,
  storeDiscover: (p: StoreDiscoverParams) =>
    [...marketplaceKeys.stores(), "discover", p] as const,
  storeBySlug: (slug: string) =>
    [...marketplaceKeys.stores(), "slug", slug] as const,
  storeById: (id: string) => [...marketplaceKeys.stores(), "id", id] as const,
  myStore: () => [...marketplaceKeys.stores(), "mine"] as const,

  // Products
  products: () => ["marketplace", "products"] as const,
  productDiscover: (p: ProductDiscoverParams) =>
    [...marketplaceKeys.products(), "discover", p] as const,
  productsByStore: (storeId: string, page: number) =>
    [...marketplaceKeys.products(), "store", storeId, page] as const,
  productById: (id: string) =>
    [...marketplaceKeys.products(), "id", id] as const,

  // Orders
  orders: () => ["marketplace", "orders"] as const,
  myOrders: (page: number) =>
    [...marketplaceKeys.orders(), "mine", page] as const,
  orderById: (id: string) => [...marketplaceKeys.orders(), "id", id] as const,
  storeOrders: (storeId: string, page: number) =>
    [...marketplaceKeys.orders(), "store", storeId, page] as const,

  // Cart
  cart: () => ["marketplace", "cart"] as const,

  // Reviews
  reviews: () => ["marketplace", "reviews"] as const,
  productReviews: (productId: string, page: number) =>
    [...marketplaceKeys.reviews(), "product", productId, page] as const,
  storeReviews: (storeId: string, page: number) =>
    [...marketplaceKeys.reviews(), "store", storeId, page] as const,

  // Wishlist
  wishlist: (page: number) => ["marketplace", "wishlist", page] as const,

  // Analytics
  storeAnalytics: () => ["marketplace", "analytics", "store"] as const,
}

/* ═══════════════════════════════════════════════
   Store Queries
   ═══════════════════════════════════════════════ */

export function useDiscoverStores(params: StoreDiscoverParams = {}) {
  return useQuery({
    queryKey: marketplaceKeys.storeDiscover(params),
    queryFn: () => marketplaceService.discoverStores(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useStoreBySlug(slug: string) {
  return useQuery({
    queryKey: marketplaceKeys.storeBySlug(slug),
    queryFn: () => marketplaceService.getStoreBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStoreById(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.storeById(id),
    queryFn: () => marketplaceService.getStoreById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyStore() {
  return useQuery({
    queryKey: marketplaceKeys.myStore(),
    queryFn: () => marketplaceService.getMyStore(),
    staleTime: 5 * 60 * 1000,
  })
}

/* ═══════════════════════════════════════════════
   Store Mutations
   ═══════════════════════════════════════════════ */

export function useCreateStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateStoreDto) => marketplaceService.createStore(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.myStore() })
      qc.invalidateQueries({ queryKey: marketplaceKeys.stores() })
    },
  })
}

export function useUpdateStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateStoreDto) => marketplaceService.updateMyStore(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.myStore() })
    },
  })
}

export function useUploadStoreLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => marketplaceService.uploadStoreLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.myStore() })
    },
  })
}

export function useUploadStoreBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => marketplaceService.uploadStoreBanner(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.myStore() })
    },
  })
}

export function useCloseMyStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => marketplaceService.closeMyStore(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.myStore() })
    },
  })
}

/* ═══════════════════════════════════════════════
   Product Queries
   ═══════════════════════════════════════════════ */

export function useDiscoverProducts(params: ProductDiscoverParams = {}) {
  return useQuery({
    queryKey: marketplaceKeys.productDiscover(params),
    queryFn: () => marketplaceService.discoverProducts(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useProductsByStore(storeId: string, page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.productsByStore(storeId, page),
    queryFn: () => marketplaceService.getProductsByStore(storeId, page),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.productById(id),
    queryFn: () => marketplaceService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/* ═══════════════════════════════════════════════
   Product Mutations
   ═══════════════════════════════════════════════ */

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProductDto) =>
      marketplaceService.createProduct(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.products() })
    },
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateProductDto) =>
      marketplaceService.updateProduct(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.productById(id) })
      qc.invalidateQueries({ queryKey: marketplaceKeys.products() })
    },
  })
}

export function useUploadProductImages(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) =>
      marketplaceService.uploadProductImages(productId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.productById(productId) })
    },
  })
}

export function useDeleteProductImage(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) =>
      marketplaceService.deleteProductImage(productId, publicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.productById(productId) })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.products() })
    },
  })
}

/* ═══════════════════════════════════════════════
   Order Queries
   ═══════════════════════════════════════════════ */

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.myOrders(page),
    queryFn: () => marketplaceService.getMyOrders(page),
    staleTime: 1 * 60 * 1000,
  })
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.orderById(id),
    queryFn: () => marketplaceService.getOrderById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export function useStoreOrders(storeId: string, page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.storeOrders(storeId, page),
    queryFn: () => marketplaceService.getStoreOrders(storeId, page),
    enabled: !!storeId,
    staleTime: 1 * 60 * 1000,
  })
}

/* ═══════════════════════════════════════════════
   Order Mutations
   ═══════════════════════════════════════════════ */

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => marketplaceService.createOrder(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.orders() })
      qc.invalidateQueries({ queryKey: marketplaceKeys.cart() })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      extra,
    }: {
      id: string
      status: OrderStatus
      extra?: { trackingNumber?: string; trackingUrl?: string; note?: string }
    }) => marketplaceService.updateOrderStatus(id, status, extra),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.orderById(vars.id) })
      qc.invalidateQueries({ queryKey: marketplaceKeys.orders() })
    },
  })
}

/* ═══════════════════════════════════════════════
   Cart Queries & Mutations
   ═══════════════════════════════════════════════ */

export function useMyCart() {
  return useQuery({
    queryKey: marketplaceKeys.cart(),
    queryFn: () => marketplaceService.getCart(),
    staleTime: 30 * 1000,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantIndex,
    }: {
      productId: string
      quantity: number
      variantIndex?: number
    }) => marketplaceService.addToCart(productId, quantity, variantIndex),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.cart() })
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => marketplaceService.updateCartItem(productId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.cart() })
    },
  })
}

export function useRemoveFromCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) =>
      marketplaceService.removeFromCart(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.cart() })
    },
  })
}

export function useClearCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => marketplaceService.clearCart(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.cart() })
    },
  })
}

/* ═══════════════════════════════════════════════
   Review Queries & Mutations
   ═══════════════════════════════════════════════ */

export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.productReviews(productId, page),
    queryFn: () => marketplaceService.getProductReviews(productId, page),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStoreReviews(storeId: string, page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.storeReviews(storeId, page),
    queryFn: () => marketplaceService.getStoreReviews(storeId, page),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateReviewDto) => marketplaceService.createReview(dto),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.reviews() })
      qc.invalidateQueries({
        queryKey: marketplaceKeys.productById(vars.productId),
      })
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketplaceKeys.reviews() })
    },
  })
}

export function useMarkReviewHelpful() {
  return useMutation({
    mutationFn: (id: string) => marketplaceService.markReviewHelpful(id),
  })
}

/* ═══════════════════════════════════════════════
   Wishlist Queries & Mutations
   ═══════════════════════════════════════════════ */

export function useWishlist(page = 1) {
  return useQuery({
    queryKey: marketplaceKeys.wishlist(page),
    queryFn: () => marketplaceService.getWishlist(page),
    staleTime: 2 * 60 * 1000,
  })
}

export function useToggleWishlist(productId: string, isInWishlist: boolean) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      isInWishlist
        ? marketplaceService.removeFromWishlist(productId)
        : marketplaceService.addToWishlist(productId),
    onMutate: async () => {
      // Optimistic update — invalidate will re-fetch
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace", "wishlist"] })
    },
  })
}

/* ═══════════════════════════════════════════════
   Analytics
   ═══════════════════════════════════════════════ */

export function useMyStoreAnalytics() {
  return useQuery({
    queryKey: marketplaceKeys.storeAnalytics(),
    queryFn: () => marketplaceService.getMyStoreAnalytics(),
    staleTime: 5 * 60 * 1000,
  })
}

/* ═══════════════════════════════════════════════════════
   Admin
   ═══════════════════════════════════════════════════════ */

export function useAdminAllStores(
  params: { status?: StoreStatus; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["marketplace", "admin", "stores", params],
    queryFn: () => marketplaceService.adminGetAllStores(params),
    staleTime: 30 * 1000,
  })
}

export function useAdminUpdateStoreStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string
      status: StoreStatus
      reason?: string
    }) => marketplaceService.adminUpdateStoreStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace", "admin", "stores"] })
    },
  })
}

export function useAdminVerifyStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, badge }: { id: string; badge: StoreBadge }) =>
      marketplaceService.adminVerifyStore(id, badge),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace", "admin", "stores"] })
    },
  })
}

export function useAdminAllProducts(
  params: { status?: ProductStatus; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["marketplace", "admin", "products", params],
    queryFn: () => marketplaceService.adminGetAllProducts(params),
    staleTime: 30 * 1000,
  })
}

export function useAdminUpdateProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string
      status: ProductStatus
      reason?: string
    }) => marketplaceService.adminUpdateProductStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace", "admin", "products"] })
    },
  })
}

export function useAdminAllOrders(
  params: { status?: OrderStatus; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["marketplace", "admin", "orders", params],
    queryFn: () => marketplaceService.adminGetAllOrders(params),
    staleTime: 30 * 1000,
  })
}

export function useAdminResolveDispute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdminDisputeResolutionDto }) =>
      marketplaceService.adminResolveDispute(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace", "admin", "orders"] })
    },
  })
}

export function useAdminHideReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketplaceService.adminHideReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace"] })
    },
  })
}

export function useAdminMarketplaceAnalytics() {
  return useQuery({
    queryKey: ["marketplace", "admin", "analytics"],
    queryFn: () => marketplaceService.adminGetAnalytics(),
    staleTime: 2 * 60 * 1000,
  })
}
