# Frame Beauty — Marketplace System

> Full-stack marketplace module enabling clients and lounges to create stores, sell products, and discover/buy from each other. Includes admin moderation, analytics, cart, wishlist, reviews, and order management.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Authorization](#authentication--authorization)
5. [Enums & Constants](#enums--constants)
6. [Store Module](#store-module)
7. [Product Module](#product-module)
8. [Order Module](#order-module)
9. [Cart Module](#cart-module)
10. [Review Module](#review-module)
11. [Wishlist Module](#wishlist-module)
12. [Analytics Module](#analytics-module)
13. [Admin Moderation](#admin-moderation)
14. [Image Handling](#image-handling)
15. [Response Formats](#response-formats)
16. [Error Codes](#error-codes)
17. [Frontend Integration Guide](#frontend-integration-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    MARKETPLACE                       │
├──────────┬──────────┬──────────┬────────────────────┤
│  Stores  │ Products │  Orders  │   Discovery Feed   │
├──────────┼──────────┼──────────┼────────────────────┤
│   Cart   │ Wishlist │ Reviews  │  Analytics/Admin   │
└──────────┴──────────┴──────────┴────────────────────┘
```

**Actors:**
- **Client** (`type: 'client'`) — Can create a store, sell products, buy from other stores
- **Lounge** (`type: 'lounge'`) — Can create a store, sell beauty products/services, buy from other stores
- **Admin** (`type: 'admin'`) — Moderates stores, products, orders, reviews; views marketplace analytics

**Key Rules:**
- Any authenticated user (client or lounge) can create ONE store
- Users cannot buy from their own store
- Orders are per-store (one order = items from one store)
- Reviews require a verified (delivered) order for that product
- Stores start as `pending` and need admin approval to go `active`

---

## Data Models

### Store

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Store ID |
| `ownerId` | ObjectId (ref: User) | Owner of the store |
| `ownerType` | `'client' \| 'lounge'` | Type of the owner |
| `name` | String | Store name (3-100 chars) |
| `slug` | String | URL-safe slug (unique, auto-generated) |
| `description` | String | Store description (max 2000 chars) |
| `category` | StoreCategory enum | Store category |
| `tags` | String[] | Searchable tags (max 20) |
| `logo` | `{ url, publicId }` | Store logo image |
| `banner` | `{ url, publicId }` | Store banner image |
| `contactEmail` | String | Contact email |
| `contactPhone` | String | Contact phone |
| `contactWhatsapp` | String | WhatsApp number |
| `socialLinks` | Object | `{ instagram?, facebook?, twitter?, website?, tiktok? }` |
| `address` | Object | `{ street?, city?, state?, country?, zipCode? }` |
| `location` | Object | `{ type: 'Point', coordinates: [lng, lat] }` |
| `returnPolicy` | String | Return policy text |
| `shippingPolicy` | String | Shipping policy text |
| `status` | StoreStatus enum | Current store status |
| `isVerified` | Boolean | Admin verified badge |
| `badge` | StoreBadge enum | Badge type |
| `stats` | Object | `{ totalProducts, totalOrders, totalRevenue, averageRating, ratingCount, viewCount, followerCount }` |
| `settings` | Object | `{ autoAcceptOrders, notifyOnOrder, notifyOnReview, vacationMode, minOrderAmount }` |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Product

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Product ID |
| `storeId` | ObjectId (ref: Store) | Parent store |
| `name` | String | Product name (3-200 chars) |
| `slug` | String | URL-safe slug (unique per store) |
| `description` | String | Full description (max 5000 chars) |
| `shortDescription` | String | Summary (max 500 chars) |
| `category` | ProductCategory enum | Product category |
| `subcategory` | String | Subcategory |
| `tags` | String[] | Tags (max 30) |
| `price` | Number | Base price (≥ 0) |
| `compareAtPrice` | Number | Original price for showing discounts |
| `costPrice` | Number | Cost (for profit tracking) |
| `currency` | String | Default `'MAD'` |
| `sku` | String | Stock keeping unit |
| `barcode` | String | Barcode |
| `stock` | Number | Available quantity (0 = out of stock) |
| `lowStockThreshold` | Number | Alert threshold (default 5) |
| `trackInventory` | Boolean | Whether to track stock |
| `weight` | Number | Weight in grams |
| `dimensions` | Object | `{ length?, width?, height? }` |
| `images` | Array | `[{ url, publicId, alt?, isPrimary? }]` (max 10) |
| `variants` | Array | `[{ name, options: [{ label, value, priceModifier?, stock? }] }]` |
| `attributes` | Array | `[{ key, value }]` — e.g. `{ key: 'color', value: 'red' }` |
| `seoTitle` | String | SEO title |
| `seoDescription` | String | SEO description |
| `status` | ProductStatus enum | Current status |
| `isDigital` | Boolean | Digital product flag |
| `isFeatured` | Boolean | Featured flag |
| `stats` | Object | `{ viewCount, totalSold, totalRevenue, averageRating, ratingCount, wishlistCount }` |
| `createdAt` | Date | Creation timestamp |

### Order

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Order ID |
| `orderNumber` | String | Unique `ORD-XXXXXX-XX` format |
| `buyerId` | ObjectId (ref: User) | Buyer |
| `storeId` | ObjectId (ref: Store) | Store |
| `items` | Array | `[{ productId, productSnapshot: { name, price, image }, quantity, unitPrice, totalPrice, variantInfo? }]` |
| `subtotal` | Number | Sum of item prices |
| `shippingCost` | Number | Shipping fee |
| `taxAmount` | Number | Tax |
| `discountAmount` | Number | Discount |
| `total` | Number | Final amount |
| `currency` | String | Default `'MAD'` |
| `status` | OrderStatus enum | Current status |
| `statusHistory` | Array | `[{ status, timestamp, note?, changedBy? }]` |
| `shippingAddress` | Object | `{ fullName, phone, street, city, state, country, zipCode }` |
| `trackingNumber` | String | Shipping tracking |
| `trackingUrl` | String | Tracking link |
| `paymentMethod` | PaymentMethod enum | Payment type |
| `paymentStatus` | PaymentStatus enum | Payment status |
| `notes` | String | Buyer notes |
| `cancellationReason` | String | Reason for cancellation |
| `refundAmount` | Number | Refund amount |
| `disputeReason` | String | Dispute reason |
| `disputeResolution` | String | Admin resolution |
| `estimatedDelivery` | Date | Estimated delivery date |
| `deliveredAt` | Date | Actual delivery date |
| `createdAt` | Date | Order placed timestamp |

### Cart

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Cart ID |
| `userId` | ObjectId (ref: User) | Owner (one cart per user) |
| `items` | Array | `[{ productId, storeId, quantity, variantIndex?, addedAt }]` |
| `updatedAt` | Date | Last update |

### ProductReview

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Review ID |
| `productId` | ObjectId (ref: Product) | Reviewed product |
| `storeId` | ObjectId (ref: Store) | Product's store |
| `userId` | ObjectId (ref: User) | Reviewer |
| `orderId` | ObjectId (ref: Order) | Source order |
| `rating` | Number | 1-5 stars |
| `title` | String | Review title (max 200 chars) |
| `comment` | String | Review body (max 2000 chars) |
| `images` | Array | `[{ url, publicId }]` (max 5) |
| `isVerifiedPurchase` | Boolean | Auto-calculated from order |
| `helpfulCount` | Number | Helpful votes |
| `status` | ReviewStatus enum | `active \| hidden \| flagged` |
| `createdAt` | Date | |

### Wishlist

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `userId` | ObjectId (ref: User) | |
| `productId` | ObjectId (ref: Product) | |
| `createdAt` | Date | |

---

## Enums & Constants

### StoreCategory
```
haircare, skincare, makeup, nails, fragrance, tools_accessories,
organic_natural, mens_grooming, spa_wellness, other
```

### StoreStatus
```
pending, active, suspended, closed, rejected
```

### StoreBadge
```
none, verified, premium, top_seller
```

### ProductCategory
```
shampoo, conditioner, hair_oil, hair_mask, hair_serum, hair_spray,
hair_color, hair_tools, face_cream, face_serum, face_mask, cleanser,
toner, sunscreen, moisturizer, foundation, concealer, powder, blush,
bronzer, eyeshadow, eyeliner, mascara, lipstick, lip_gloss, lip_liner,
nail_polish, nail_tools, nail_care, perfume, body_mist, deodorant,
body_lotion, body_oil, body_scrub, bath_bomb, brush_set, sponge,
mirror, organizer, other
```

### ProductStatus
```
draft, active, inactive, out_of_stock, pending_review, rejected
```

### OrderStatus
```
pending, confirmed, processing, shipped, delivered, cancelled,
refunded, disputed, returned
```

### PaymentMethod
```
cash_on_delivery, bank_transfer, card, wallet
```

### PaymentStatus
```
pending, paid, failed, refunded, partially_refunded
```

### ReviewStatus
```
active, hidden, flagged
```

---

## API Endpoints

### Base URL: `/v1/marketplace`

### Store Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/stores/discover` | No | — | Browse/search stores |
| `GET` | `/stores/slug/:slug` | No | — | Get store by slug |
| `GET` | `/stores/:id` | No | — | Get store by ID |
| `POST` | `/stores` | Yes | client/lounge/admin | Create a store |
| `GET` | `/stores/me/store` | Yes | — | Get my store |
| `PUT` | `/stores/me/store` | Yes | — | Update my store |
| `PUT` | `/stores/me/store/logo` | Yes | — | Upload store logo |
| `PUT` | `/stores/me/store/banner` | Yes | — | Upload store banner |
| `DELETE` | `/stores/me/store` | Yes | — | Close my store |
| `GET` | `/stores/admin/all` | Yes | admin | List all stores (admin) |
| `PUT` | `/stores/admin/:id/status` | Yes | admin | Update store status |
| `PUT` | `/stores/admin/:id/verify` | Yes | admin | Verify/badge a store |

### Product Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/products/discover` | No | — | Browse/search products |
| `GET` | `/products/store/:storeId` | No | — | Get products by store |
| `GET` | `/products/:id` | No | — | Get product by ID |
| `POST` | `/products` | Yes | — | Create product (store owner) |
| `PUT` | `/products/:id` | Yes | — | Update product |
| `POST` | `/products/:id/images` | Yes | — | Upload product images (multipart, field: `images`, max 10) |
| `DELETE` | `/products/:id/images/:publicId` | Yes | — | Delete a product image |
| `DELETE` | `/products/:id` | Yes | — | Delete product |
| `GET` | `/products/admin/all` | Yes | admin | List all products |
| `PUT` | `/products/admin/:id/status` | Yes | admin | Update product status |

### Order Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/orders` | Yes | — | Place an order |
| `GET` | `/orders/me` | Yes | — | Get my orders (buyer) |
| `GET` | `/orders/:id` | Yes | — | Get order by ID |
| `GET` | `/orders/store/:storeId` | Yes | — | Get store orders (owner) |
| `PUT` | `/orders/:id/status` | Yes | — | Update order status |
| `GET` | `/orders/admin/all` | Yes | admin | List all orders |
| `PUT` | `/orders/admin/:id/resolve` | Yes | admin | Resolve dispute |

### Cart Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/cart` | Yes | — | Get my cart |
| `POST` | `/cart/items` | Yes | — | Add item to cart |
| `PUT` | `/cart/items/:productId` | Yes | — | Update item quantity |
| `DELETE` | `/cart/items/:productId` | Yes | — | Remove item |
| `DELETE` | `/cart/clear` | Yes | — | Clear entire cart |

### Review Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/reviews/product/:productId` | No | — | Get product reviews |
| `GET` | `/reviews/store/:storeId` | No | — | Get store reviews |
| `POST` | `/reviews` | Yes | — | Create review |
| `PUT` | `/reviews/:id` | Yes | — | Update review |
| `POST` | `/reviews/:id/images` | Yes | — | Upload review images (multipart, field: `images`, max 5) |
| `DELETE` | `/reviews/:id` | Yes | — | Delete review |
| `POST` | `/reviews/:id/helpful` | Yes | — | Mark review as helpful |
| `PUT` | `/reviews/admin/:id/hide` | Yes | admin | Hide a review |

### Wishlist Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/wishlist` | Yes | — | Get my wishlist |
| `POST` | `/wishlist/:productId` | Yes | — | Add to wishlist |
| `DELETE` | `/wishlist/:productId` | Yes | — | Remove from wishlist |

### Analytics Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/analytics/my-store` | Yes | — | My store analytics |
| `GET` | `/analytics/store/:storeId` | Yes | — | Store analytics (owner) |
| `GET` | `/analytics/admin` | Yes | admin | Marketplace-wide analytics |

---

## Authentication & Authorization

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
X-CSRF-Token: <CSRF_TOKEN>    // Required for POST, PUT, DELETE
Content-Type: application/json  // or multipart/form-data for image uploads
```

**Rules:**
- All mutation endpoints require CSRF token
- Store ownership is validated server-side — only the store owner can manage their store/products
- Admin endpoints require `user.type === 'admin'`
- Buyers cannot buy from their own store
- Only users with a delivered order can review a product

---

## Store Module

### Create Store
```json
POST /v1/marketplace/stores
Body:
{
  "name": "Glow Beauty Shop",
  "description": "Premium beauty products...",
  "category": "skincare",
  "tags": ["organic", "cruelty-free"],
  "contactEmail": "shop@example.com",
  "contactPhone": "+212600000000",
  "address": {
    "street": "123 Main St",
    "city": "Casablanca",
    "country": "Morocco"
  },
  "returnPolicy": "30-day returns",
  "shippingPolicy": "Free shipping over 200 MAD"
}

Response 201:
{
  "data": { ...store object with status: "pending" },
  "message": "Store created — pending approval"
}
```

### Discover Stores
```
GET /v1/marketplace/stores/discover?search=beauty&category=skincare&page=1&limit=20&sort=rating
```
**Query params:** `search`, `category` (StoreCategory), `page`, `limit`, `sort` (`newest`, `rating`, `popular`)

### Upload Logo / Banner
```
PUT /v1/marketplace/stores/me/store/logo
Content-Type: multipart/form-data
Field: logo (single image, max 5MB, jpeg/png/gif/webp)
```

---

## Product Module

### Create Product
```json
POST /v1/marketplace/products
Body:
{
  "name": "Argan Oil Hair Serum",
  "description": "Pure moroccan argan oil...",
  "shortDescription": "Nourishing hair serum",
  "category": "hair_serum",
  "price": 149.99,
  "compareAtPrice": 199.99,
  "stock": 100,
  "tags": ["argan", "natural", "hair"],
  "weight": 100,
  "variants": [
    {
      "name": "Size",
      "options": [
        { "label": "50ml", "value": "50ml", "priceModifier": 0 },
        { "label": "100ml", "value": "100ml", "priceModifier": 50 }
      ]
    }
  ],
  "attributes": [
    { "key": "ingredients", "value": "100% argan oil" }
  ]
}
```

### Discover Products
```
GET /v1/marketplace/products/discover?search=argan&category=hair_serum&minPrice=50&maxPrice=300&sort=price_asc&page=1&limit=20
```
**Query params:** `search`, `category`, `storeId`, `minPrice`, `maxPrice`, `inStock` (boolean), `page`, `limit`, `sort` (`newest`, `price_asc`, `price_desc`, `rating`, `popular`, `best_selling`)

### Upload Product Images
```
POST /v1/marketplace/products/:id/images
Content-Type: multipart/form-data
Field: images (multiple files, max 10 per product, 5MB each)
```

---

## Order Module

### Create Order
```json
POST /v1/marketplace/orders
Body:
{
  "storeId": "648a...",
  "items": [
    { "productId": "648b...", "quantity": 2, "variantIndex": 0 },
    { "productId": "648c...", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Ahmed Ben Ali",
    "phone": "+212600000000",
    "street": "123 Avenue Hassan II",
    "city": "Casablanca",
    "state": "Casablanca-Settat",
    "country": "Morocco",
    "zipCode": "20000"
  },
  "paymentMethod": "cash_on_delivery",
  "notes": "Please gift wrap"
}
```

### Order Status Flow
```
pending → confirmed → processing → shipped → delivered
                                              ↘ returned
        → cancelled (by buyer before processing)
                                    → disputed → resolved (by admin)
                                              → refunded
```

**Who can change status:**
- **Store owner**: `pending→confirmed`, `confirmed→processing`, `processing→shipped`, `shipped→delivered`
- **Buyer**: `pending→cancelled`, `delivered→returned`, any→`disputed`
- **Admin**: resolves disputes → `refunded`, `delivered`, or `cancelled`

### Update Order Status
```json
PUT /v1/marketplace/orders/:id/status
Body:
{
  "status": "shipped",
  "trackingNumber": "MA123456789",
  "trackingUrl": "https://track.example.com/MA123456789"
}
```

---

## Cart Module

### Add to Cart
```json
POST /v1/marketplace/cart/items
Body:
{
  "productId": "648b...",
  "quantity": 2,
  "variantIndex": 0
}
```

### Cart Response Structure
```json
{
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [
      {
        "productId": {
          "_id": "...",
          "name": "Argan Oil",
          "price": 149.99,
          "stock": 100,
          "images": [...]
        },
        "storeId": {
          "_id": "...",
          "name": "Glow Beauty Shop",
          "slug": "glow-beauty-shop"
        },
        "quantity": 2,
        "variantIndex": 0,
        "addedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Frontend tip:** Group cart items by `storeId` to display items per store. Orders must be placed per store.

---

## Review Module

### Create Review
```json
POST /v1/marketplace/reviews
Body:
{
  "productId": "648b...",
  "orderId": "648d...",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "Best argan oil I've ever used..."
}
```

**Rules:**
- One review per product per user
- `isVerifiedPurchase` is auto-set if a delivered order exists for that product
- Ratings are 1-5 integers
- After creating/updating/deleting a review, product & store ratings are recalculated

### Get Product Reviews
```
GET /v1/marketplace/reviews/product/:productId?page=1&limit=20&sort=helpful
```
**Sort options:** `newest` (default), `rating_asc`, `rating_desc`, `helpful`

---

## Wishlist Module

Simple toggle. Adding an already-wishlisted product is a no-op (returns existing entry).

```
POST /v1/marketplace/wishlist/:productId    → Add
DELETE /v1/marketplace/wishlist/:productId   → Remove
GET /v1/marketplace/wishlist?page=1&limit=20 → List (populated with product + store)
```

---

## Analytics Module

### Store Owner Dashboard (`GET /analytics/my-store`)
```json
{
  "data": {
    "overview": {
      "totalRevenue": 15000,
      "totalOrders": 42,
      "totalProducts": 15,
      "averageRating": 4.6,
      "ratingCount": 28
    },
    "last30Days": {
      "revenue": 5200,
      "orders": 14,
      "avgOrderValue": 371.43
    },
    "ordersByStatus": {
      "pending": 3,
      "processing": 2,
      "shipped": 4,
      "delivered": 30,
      "cancelled": 3
    },
    "topProducts": [...],
    "recentOrders": [...],
    "dailyRevenue": [
      { "_id": "2024-01-15", "revenue": 800, "orders": 3 },
      ...
    ]
  }
}
```

### Admin Dashboard (`GET /analytics/admin`)
```json
{
  "data": {
    "overview": {
      "totalStores": 120,
      "storesByStatus": { "active": 95, "pending": 15, "suspended": 5, "closed": 5 },
      "totalProducts": 2500,
      "totalOrders": 8000,
      "totalRevenue": 450000
    },
    "topStores": [...],
    "recentDisputes": [...],
    "dailyOrders": [...]
  }
}
```

---

## Admin Moderation

### Store Moderation

| Action | Endpoint | Body |
|--------|----------|------|
| Approve store | `PUT /stores/admin/:id/status` | `{ "status": "active" }` |
| Reject store | `PUT /stores/admin/:id/status` | `{ "status": "rejected", "reason": "..." }` |
| Suspend store | `PUT /stores/admin/:id/status` | `{ "status": "suspended", "reason": "..." }` |
| Verify store | `PUT /stores/admin/:id/verify` | `{ "badge": "verified" }` |
| Premium badge | `PUT /stores/admin/:id/verify` | `{ "badge": "premium" }` |

### Product Moderation

| Action | Endpoint | Body |
|--------|----------|------|
| Approve product | `PUT /products/admin/:id/status` | `{ "status": "active" }` |
| Reject product | `PUT /products/admin/:id/status` | `{ "status": "rejected", "reason": "..." }` |

### Order Dispute Resolution

```json
PUT /v1/marketplace/orders/admin/:id/resolve
Body:
{
  "resolution": "refunded",   // "refunded" | "delivered" | "cancelled"
  "notes": "Refund approved — product was damaged",
  "refundAmount": 149.99
}
```

### Review Moderation

```
PUT /v1/marketplace/reviews/admin/:id/hide
```
Hides a review (removes it from public listings, recalculates ratings).

---

## Image Handling

- **Max file size**: 5MB
- **Accepted formats**: JPEG, PNG, GIF, WebP
- **Magic byte validation**: Server validates actual file bytes, not just MIME type
- **Storage**: Cloudflare R2 (S3-compatible)
- **Response format**: `{ url: "https://...", publicId: "marketplace/products/..." }`

| Upload | Endpoint | Field | Max |
|--------|----------|-------|-----|
| Store logo | `PUT /stores/me/store/logo` | `logo` | 1 |
| Store banner | `PUT /stores/me/store/banner` | `banner` | 1 |
| Product images | `POST /products/:id/images` | `images` | 10 per product |
| Review images | `POST /reviews/:id/images` | `images` | 5 per review |

---

## Response Formats

### Success (single item)
```json
{ "data": { ... }, "message": "..." }
```

### Success (list)
```json
{ "data": [ ... ], "count": 42, "message": "..." }
```

### Error
```json
{ "status": 400, "message": "Error description", "code": "ERROR_CODE" }
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `STORE_NOT_FOUND` | 404 | Store does not exist |
| `STORE_ALREADY_EXISTS` | 409 | User already owns a store |
| `STORE_NOT_ACTIVE` | 400 | Store is not active |
| `PRODUCT_NOT_FOUND` | 404 | Product does not exist |
| `PRODUCT_NOT_ACTIVE` | 400 | Product is not available |
| `INSUFFICIENT_STOCK` | 400 | Not enough stock |
| `CANNOT_BUY_OWN_PRODUCT` | 400 | Cannot buy from own store |
| `REVIEW_NOT_FOUND` | 404 | Review does not exist |
| `INVALID_STATUS_TRANSITION` | 400 | Order status change not allowed |
| `INVALID_PRODUCT_ID` | 400 | Invalid MongoDB ObjectId |
| `INVALID_STORE_ID` | 400 | Invalid MongoDB ObjectId |
| `INVALID_ORDER_ID` | 400 | Invalid MongoDB ObjectId |
| `MAX_IMAGES_EXCEEDED` | 400 | Too many images |
| `ORDER_MINIMUM_NOT_MET` | 400 | Below store minimum order amount |

---

## Frontend Integration Guide

### Pages to Build

1. **Store Discovery** — Grid/list of stores with search, category filter, sort
2. **Store Profile** — Store details, products grid, reviews tab, follow button
3. **Product Discovery** — Product grid with filters (category, price range, stock, sort)
4. **Product Detail** — Images gallery, variants selector, add to cart, reviews, wishlist toggle
5. **My Store Dashboard** — Store settings, product management, order management, analytics
6. **Create/Edit Store** — Form with logo/banner upload
7. **Create/Edit Product** — Form with multi-image upload, variants builder, attributes
8. **Cart Page** — Items grouped by store, quantity controls, proceed to checkout per store
9. **Checkout** — Shipping address form, payment method selection, order summary
10. **My Orders** — Order list with status badges, detail view with timeline
11. **Store Orders** — Incoming orders for store owners, status update actions
12. **Wishlist** — Product grid with remove button
13. **Write Review** — Rating stars, title, comment, image upload
14. **Admin Marketplace Panel** — Store approval queue, product moderation, dispute resolution, analytics dashboard

### Key UX Patterns

- **Cart grouping**: Group items by store since orders are per-store
- **Multi-store checkout**: Create separate orders for each store in cart
- **Optimistic wishlist**: Toggle immediately, sync in background
- **Review eligibility**: Only show "Write Review" button if user has a delivered order for that product
- **Store status indicators**: Show badges (verified ✓, premium ★, top seller 🏆)
- **Stock indicators**: Show "X left" when stock ≤ lowStockThreshold
- **Real-time order updates**: Poll or use socket for order status changes

### Pagination Pattern
All list endpoints support: `?page=1&limit=20`
- Default page: 1, default limit: 20, max limit: 50
- Response includes `count` for total items

### Currency
Default currency is `TD` (Tunisian Dinart). Display prices with `DT` suffix.
