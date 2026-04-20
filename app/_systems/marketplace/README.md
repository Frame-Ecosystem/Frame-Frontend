# Marketplace System

Full e-commerce module — stores, products, orders, cart, wishlist, reviews, analytics, and product categories with admin moderation.

## Architecture

```
types → service (single class) → hooks (React Query) → components
```

## Domains

### Stores

Create and manage beauty product stores with branding, policies, location, and social links. Stores go through an approval workflow (pending → active/suspended).

### Products

Product listings with images, variants, pricing (with compare-at), stock tracking, and category assignment. Products start as DRAFT and move through moderation.

### Orders

Order lifecycle from placement through fulfillment — supports multiple payment methods (COD, bank transfer, in-store) and dispute resolution.

### Cart

Per-user shopping cart with quantity management and variant selection.

### Wishlist

Save products for later. Backend stores `productId` (populated on fetch), frontend normalizes to `product` field.

### Reviews

Product reviews with star ratings, images, and helpfulness voting. Admin can hide inappropriate reviews.

### Product Categories

Admin-managed category hierarchy. Users can suggest new categories which go through an approval pipeline.

### Analytics

Store-level analytics — revenue, order counts, daily trends, top products.

## Service Methods

| Group     | Methods                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| Stores    | discoverStores, getStoreBySlug, getStoreById, createStore, getMyStore, updateMyStore, uploadStoreLogo/Banner, closeMyStore |
| Products  | discoverProducts, getProductsByStore, getProductById, createProduct, updateProduct, uploadProductImages, deleteProduct     |
| Orders    | createOrder, getMyOrders, getStoreOrders, updateOrderStatus                                                                |
| Cart      | getCart, addToCart, removeFromCart, clearCart                                                                              |
| Wishlist  | getWishlist, addToWishlist, removeFromWishlist                                                                             |
| Reviews   | getProductReviews, createReview                                                                                            |
| Analytics | getMyStoreAnalytics                                                                                                        |
| Admin     | All store/product/order/category/suggestion management                                                                     |

## Components

| Component                        | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `product-card`                   | Product grid card with image, price, wishlist toggle |
| `product-gallery`                | Image gallery with zoom                              |
| `product-variants`               | Variant selector (size, color, etc.)                 |
| `price-display`                  | Price with optional compare-at and discount badge    |
| `stock-indicator`                | Stock level badge                                    |
| `store-card`                     | Store grid card                                      |
| `store-header`                   | Store profile header                                 |
| `cart-item` / `cart-store-group` | Cart item display grouped by store                   |
| `order-card` / `order-timeline`  | Order display with status timeline                   |
| `review-card` / `review-form`    | Review display and submission                        |
| `wishlist-button`                | Heart toggle button                                  |
| `category-picker`                | Category selection dropdown                          |
| `suggest-category-modal`         | User category suggestion form                        |
| `discover-filters`               | Product discovery filters                            |
| `image-uploader`                 | Product image upload with preview                    |

## Dependencies

- `@/app/_core/api/api` — HTTP client
