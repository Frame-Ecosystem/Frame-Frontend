# MarketplaceSystem

Full e-commerce layer enabling lounges and users to run stores, list products, manage orders, and receive reviews.

> **What changed (v2):** Product categories are now **first-class admin-managed documents**, no longer a hard-coded enum. Any authenticated user (buyer or store owner) can submit a **category suggestion** when an appropriate one cannot be found; admins moderate suggestions and **on `IMPLEMENTED` the underlying `ProductCategory` is auto-created**.

---

## Responsibilities

- Store creation and management per lounge / store-owner
- Product listing with **variants**, images, pricing, and inventory
- **Admin-managed product categories** (CRUD with usage protection)
- **User-driven category suggestions** with admin moderation and auto-implementation
- Auto-slug generation for products and categories
- Media upload to **Cloudflare R2** (product images)
- **Shopping cart** — add, update, remove items
- **Order lifecycle** — create, pay, track, cancel
- **Wishlist** — save products for later
- **Product reviews** with star ratings
- **Analytics** — sales, revenue, top products per store
- Admin store suspension / closure

---

## Structure

```
MarketplaceSystem/
├── controllers/
│   ├── product.controller.ts
│   ├── productCategories.controller.ts          ← NEW
│   ├── productCategorySuggestions.controller.ts ← NEW
│   ├── store · cart · order · review · wishlist · analytics
├── services/
│   ├── product.service.ts                       ← validates categoryId
│   ├── productCategories.service.ts             ← NEW
│   ├── productCategorySuggestions.service.ts    ← NEW
│   ├── productCategorySuggestionsAdmin.service.ts ← NEW (auto-implement engine)
│   ├── store · cart · order · review · wishlist · analytics
├── models/
│   ├── product.model.ts                         ← categoryId is now ObjectId ref
│   ├── productCategory.model.ts                 ← NEW
│   ├── productCategorySuggestion.model.ts       ← NEW
│   ├── store · cart · order · review · wishlist
├── routes/
│   ├── productCategories.route.ts               ← NEW (/v1/marketplace/product-categories)
│   ├── productCategorySuggestions.route.ts      ← NEW (/v1/marketplace/product-category-suggestions)
│   ├── product · store · cart · order · review · wishlist · analytics
├── dtos/
│   ├── product.dto.ts                           ← uses categoryId (IsMongoId)
│   ├── productCategories.dto.ts                 ← NEW
│   ├── productCategorySuggestions.dto.ts        ← NEW
│   ├── store · cart · order · review
└── interfaces/
    ├── marketplace.interface.ts                 ← LEGACY_PRODUCT_CATEGORY_TAGS for seeding
    └── productCategory.interface.ts             ← NEW (ProductCategory + Suggestion + status enum)
```

---

## Key Entities

| Entity | Description |
|---|---|
| `Store` | Seller storefront — ownerId, name, status, images, contact |
| `Product` | Item for sale — slug, **categoryId** (ref ProductCategory), variants, price, stock, condition, isDigital |
| `ProductCategory` | Admin-managed marketplace category — name, slug, description, icon, image, isActive, displayOrder, productCount |
| `ProductCategorySuggestion` | User-submitted proposal — name, description, exampleProducts, iconHint, status, suggestedBy, implementedCategoryId, adminNote |
| `Cart` | User's active cart with line items |
| `Order` | Confirmed purchase with status tracking and payment info |
| `Review` | Product review — stars (1-5), comment, verified purchase |
| `Wishlist` | User's saved products |

---

## Status Enums

| Field | Values |
|---|---|
| Product `status` | `DRAFT` → `ACTIVE` \| `ARCHIVED` \| `HIDDEN` |
| Product `condition` | `NEW` \| `LIKE_NEW` \| `USED` |
| Store `status` | `PENDING` \| `ACTIVE` \| `SUSPENDED` \| `CLOSED` |
| ProductCategorySuggestion `status` | `pending` → `approved` \| `rejected` \| `implemented` |

### Suggestion lifecycle

```
                  ┌─────────────┐
   user submits ──►│  PENDING    │
                  └──────┬──────┘
                         │ admin moderation
            ┌────────────┼────────────┐
            ▼            ▼            ▼
       ┌────────┐  ┌──────────┐  ┌──────────┐
       │APPROVED│  │ REJECTED │  │IMPLEMENT.│ ← auto-creates ProductCategory
       └────┬───┘  └──────────┘  └────┬─────┘
            │                         │ implementedCategoryId set
            └────► admin can later ◄──┘
                  PATCH .../status
                  with status=implemented
```

* `APPROVED` is an optional intermediate state (admin endorses but defers implementation).
* `IMPLEMENTED` is **terminal**. The suggestion record stores `implementedCategoryId` so the suggester can navigate to the live category.
* `REJECTED` is **terminal** (re-submit a new suggestion if needed).

---

## API — Product Categories

Base path: `/v1/marketplace/product-categories`. All routes require `authMiddleware`. Mutations require `adminMiddleware` + `csrfMiddleware`.

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/` | any auth | `?activeOnly=true` | List all categories (sorted by `displayOrder`, then `name`) |
| GET | `/search` | any auth | `?q=…` | Case-insensitive name search |
| GET | `/:categoryId` | any auth | — | Fetch one |
| POST | `/` | admin | `CreateProductCategoryDto` | Create (slug auto-generated, name unique) |
| PUT | `/:categoryId` | admin | `UpdateProductCategoryDto` | Update (slug regenerated if `name` changes) |
| DELETE | `/:categoryId` | admin | — | Delete (rejected with `409 CATEGORY_IN_USE` if any product references it — hide via `isActive=false` instead) |

### `CreateProductCategoryDto`
```ts
{
  name: string;            // required, 2-100
  description?: string;    // 0-500
  icon?: string;           // emoji or short label, 0-100
  image?: { url?: string; publicId?: string };
  isActive?: boolean;      // default true
  displayOrder?: number;   // default 0, lower surfaces first
}
```

### Response envelope (all category endpoints)
```jsonc
{
  "data": { /* ProductCategory or ProductCategory[] */ },
  "count": 12,                     // only on list endpoints
  "message": "Product categories retrieved successfully"
}
```

---

## API — Product Category Suggestions

Base path: `/v1/marketplace/product-category-suggestions`. All routes require `authMiddleware`. Mutations require `csrfMiddleware`.

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| GET | `/` | any auth | `?page=&limit=&status=` | List — admins see all; non-admins see only their own |
| GET | `/stats` | admin | — | `{ total, pending, approved, rejected, implemented }` |
| GET | `/:suggestionId` | owner or admin | — | Fetch one |
| POST | `/` | any auth | `CreateProductCategorySuggestionDto` | Submit a new suggestion |
| PUT | `/:suggestionId` | owner | `UpdateProductCategorySuggestionDto` | Edit while still `pending` |
| PATCH | `/:suggestionId/status` | admin | `UpdateProductCategorySuggestionStatusDto` | Moderation (approve / reject / **implement-with-overrides**) |
| PATCH | `/:suggestionId/admin-approve` | admin | `AdminApproveProductCategorySuggestionDto` | One-shot approve & implement (status defaults to `implemented`) |
| DELETE | `/:suggestionId` | owner or admin | — | Hard delete |

### `CreateProductCategorySuggestionDto`
```ts
{
  name: string;              // required, 2-100
  description: string;       // required, 10-1000 (explain why it's needed)
  exampleProducts?: string[]; // up to 10 strings, each ≤ 200 chars
  iconHint?: string;         // optional emoji / short label
}
```
Validation rules enforced by the service layer:
* Rejects `409 CATEGORY_ALREADY_EXISTS` when a real `ProductCategory` with the same name already exists (the user should select it instead).
* Rejects `409 SUGGESTION_ALREADY_EXISTS` when another **pending** suggestion with the same name exists.

### `UpdateProductCategorySuggestionStatusDto` (admin moderation)
```ts
{
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  adminNote?: string;        // ≤ 500 chars — surfaced back to suggester on approve/reject
  // The fields below are used ONLY when status === 'implemented'
  // (admin can override the suggester's proposed values when creating the real category):
  name?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}
```

### Status-update response envelope
```jsonc
{
  "data": {
    "suggestion": { /* updated ProductCategorySuggestion (with implementedCategoryId if implemented) */ },
    "category": { /* the new ProductCategory created on implementation, OR null */ }
  },
  "message": "Category suggestion approved and implemented successfully"
}
```

---

## Product creation (now uses `categoryId`)

`POST /v1/marketplace/products` body:
```ts
{
  storeId: string;     // ObjectId
  name: string;        // 2-200
  categoryId: string;  // ObjectId of an existing ProductCategory  ← was `category: enum`
  price: number;
  // …rest unchanged
}
```
The service layer calls `ProductCategoriesService.assertCategoryExists(categoryId)` on both create and update — invalid IDs return `400 INVALID_CATEGORY_ID`.

Discovery / store-product queries also use `categoryId`:
- `GET /v1/marketplace/products/discover?categoryId=…&minPrice=…`
- `GET /v1/marketplace/products/store/:storeId?categoryId=…`

Responses populate `categoryId` with `{ name, slug, icon }` for direct rendering.

---

## Notifications

Three new `NotificationType` values fire end-to-end via `NotificationService`:

| Event | Type | Recipient | Action URL |
|---|---|---|---|
| Suggestion submitted | `admin:productCategorySuggestionCreated` | all admins | `/admin/marketplace/category-suggestions/:id` |
| Suggestion approved or implemented | `admin:productCategorySuggestionApproved` | suggester | `/marketplace/category-suggestions/:id` |
| Suggestion rejected | `admin:productCategorySuggestionRejected` | suggester | `/marketplace/category-suggestions/:id` |

All map to the `ADMIN` notification category, so they appear in the existing admin/moderation notification feed.

---

## Frontend integration plan

> **Audience:** the agents working on the front layer.

### 1. Replace the hard-coded category dropdown
Wherever the product create/edit form previously used the `ProductCategory` enum:

```diff
- const CATEGORIES = ['skincare','haircare','makeup','tools', …];   // deprecated
+ const { data } = await api.get('/v1/marketplace/product-categories?activeOnly=true');
+ // data: ProductCategory[] sorted by displayOrder
```

Render the icon + name. Submit `categoryId` (the `_id`) instead of the enum string.

### 2. Add a "Suggest a new category" affordance
Below the category dropdown in the product create/edit form (and in the buyer-side discover filters), surface a link or `+` button that opens a `CategorySuggestionModal`:

```tsx
<CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
<button onClick={openSuggestionModal}>Can't find what you need? Suggest a category</button>
```

Modal posts to `POST /v1/marketplace/product-category-suggestions` with `{ name, description, exampleProducts, iconHint }`. On 201, show a success toast: *"Thanks! An admin will review your suggestion shortly."* Surface the 409 errors verbatim — they're user-actionable.

### 3. "My suggestions" dashboard tab
Any authenticated user benefits from a list at `GET /v1/marketplace/product-category-suggestions` (auto-scoped server-side). Show status badge, `adminNote` when present, and a deep link to the implemented category (via `implementedCategoryId`) when the suggestion was approved.

### 4. Admin moderation panel
At `/admin/marketplace/category-suggestions`:
- List with filters (use `?status=pending` for the default work queue).
- Each row shows suggester, name, description, exampleProducts, createdAt.
- **Reject** action → `PATCH /:id/status` with `{ status: 'rejected', adminNote }` (note required for transparency).
- **Approve & implement** action → `PATCH /:id/admin-approve` with `{ name?, description?, icon?, displayOrder?, adminNote? }` (all fields optional — defaults to the suggester's values). Server response includes the newly created `category` so the panel can immediately reflect it in the categories list.

### 5. Admin product-category management
At `/admin/marketplace/categories` build a CRUD table backed by `/v1/marketplace/product-categories`. Notes:
- **Cannot delete** a category in use → server returns `409 CATEGORY_IN_USE` with a friendly message — surface a toast and offer the **Hide (set isActive=false)** action instead.
- Toggling `isActive` immediately removes the category from the buyer-facing dropdown (`?activeOnly=true`) without affecting historical product references.
- `displayOrder` controls dropdown order; UI should expose drag-and-drop reordering.

### 6. Real-time updates
Suggestion notifications are pushed over the existing Socket.IO channel — front-end already subscribes to `admin` category events. No new socket handlers are required; just ensure the notification renderer recognises the three new `type` strings (`admin:productCategorySuggestion*`).

### 7. Migration / seeding (one-shot, dev environments)
The legacy enum values are kept in `marketplace.interface.ts` as `LEGACY_PRODUCT_CATEGORY_TAGS` and can be used by an ops script to seed initial admin-managed categories. For environments with existing products carrying the old string `category` field:
1. Seed admin categories with the same names as the legacy enum.
2. Run a one-shot migration: for each product, look up the matching `ProductCategory` by name and `$set` `categoryId`, `$unset` `category`.

A seed script is intentionally **not** run on boot — admins should curate categories explicitly.

---

## Dependencies

- **Inbound**: `UserManager` (store owner / suggester identity), `AuthSystem`
- **Outbound**: `NotificationSystem` (suggestion + order events), `shared/cloudflareR2` (product / category images)

---

## Error codes (suggestion + category surface)

| Code | When |
|---|---|
| `MISSING_CATEGORY_NAME` / `MISSING_CATEGORY_ID` / `MISSING_SUGGESTION_ID` / `MISSING_STATUS` | Required field omitted |
| `INVALID_CATEGORY_ID` | `categoryId` does not match any `ProductCategory` document |
| `CATEGORY_NAME_EXISTS` | Duplicate category name on create/update |
| `CATEGORY_NAME_CONFLICT` | Implementation conflicts with an existing category name |
| `CATEGORY_IN_USE` | Delete rejected — products reference this category |
| `CATEGORY_ALREADY_EXISTS` | Suggestion submitted for a name that already exists as a real category |
| `SUGGESTION_ALREADY_EXISTS` | Another **pending** suggestion already proposes this name |
| `SUGGESTION_NOT_FOUND` | ID not found |
| `SUGGESTION_ALREADY_IMPLEMENTED` | Cannot re-moderate a terminal suggestion |
| `STATUS_ALREADY_SET` | New status equals current status |
| `INVALID_STATUS_FOR_UPDATE` | Owner edit attempted on a non-pending suggestion |
| `UNAUTHORIZED_ACCESS` | Non-owner attempted to edit/delete |
| `CATEGORY_CREATION_FAILED` | Implementation step failed unexpectedly (server-side error) |
