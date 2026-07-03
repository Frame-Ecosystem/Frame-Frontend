# Extras Module — Architecture & Implementation Guide

> Admin CRUD, lounge adoption flow. No moderation — admin only manages the global catalog; lounges adopt extras directly.

---

## Table of Contents

- [Data Model](#1-data-model)
- [API Endpoints](#2-api-endpoints)
- [Lounge Adoption Flow](#3-lounge-adoption-flow)
- [Directory Structure](#4-directory-structure)
- [Implementation Checklist](#5-implementation-checklist)
- [Validation Steps](#6-validation-steps)

---

## 1. Data Model

Two collections follow the **Service / LoungeService** pattern already established in the codebase.

### 1.1 Extra (Global Catalog — Admin Managed)

```
┌─────────────────────────────────────────────┐
│                  Extra                       │
├─────────────────────────────────────────────┤
│ _id: ObjectId                                │
│ name: String (required, unique, trimmed)     │
│ description: String (max 1000)               │
│ free: Boolean (required, default: false)     │
│ cost: Number (min 0, default: 0)             │
│   └── required > 0 if free === false         │
│   └── auto-set to 0 if free === true         │
│ category: String (required)                  │
│ image: { url: String, publicId: String }     │
│ createdBy: ObjectId (ref: User - admin)      │
│ isActive: Boolean (default: true)            │
│ createdAt, updatedAt (timestamps)            │
└─────────────────────────────────────────────┘
```

**Constraints:**
- `free === false` → `cost > 0` (required)
- `cost === 0` → `free` forced to `true`
- `free === true` + `cost > 0` → rejected

**Indexes:** `{ name: 1 }` (unique), `{ category: 1 }`, `{ free: 1 }`

### 1.2 LoungeExtra (Adopted Instance — Lounge Managed)

```
┌─────────────────────────────────────────────────┐
│                   LoungeExtra                    │
├─────────────────────────────────────────────────┤
│ _id: ObjectId                                    │
│ loungeId: ObjectId (ref: User - lounge, required)│
│ extraId: ObjectId (ref: Extra, required)         │
│ cost: Number (optional override, min 0)          │
│ description: String (optional lounge-specific)   │
│ isActive: Boolean (default: true)                │
│ createdAt, updatedAt (timestamps)                │
└─────────────────────────────────────────────────┘
```

**Indexes:** `{ loungeId: 1, extraId: 1 }` (unique compound), `{ loungeId: 1 }`, `{ extraId: 1 }`

**Constraint:** A lounge cannot adopt the same global Extra twice (unique compound index).

---

## 2. API Endpoints

### 2.1 Admin — Global Extra CRUD

Base: `/v1/admin/extras` (mounted under AdminSystem's global `authMiddleware` + `adminMiddleware`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/admin/extras` | admin | List all extras (paginated, optional `?category=` filter, `?free=` filter) |
| `GET` | `/v1/admin/extras/:extraId` | admin | Get single extra |
| `POST` | `/v1/admin/extras` | admin + CSRF | Create extra |
| `PUT` | `/v1/admin/extras/:extraId` | admin + CSRF | Update extra |
| `DELETE` | `/v1/admin/extras/:extraId` | admin + CSRF | Delete extra |

### 2.2 Lounge — Browse & Adopt Extras

Base: `/v1/lounge-extras`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/lounge-extras` | lounge | List lounge's adopted extras |
| `GET` | `/v1/lounge-extras/available` | lounge | List global extras available for adoption (not yet adopted by this lounge) |
| `POST` | `/v1/lounge-extras` | lounge + CSRF | Adopt an extra → creates LoungeExtra |
| `PUT` | `/v1/lounge-extras/:adoptedId` | lounge + CSRF | Update lounge-specific cost/description |
| `DELETE` | `/v1/lounge-extras/:adoptedId` | lounge + CSRF | Remove adopted extra (un-adopt) |
| `PATCH` | `/v1/lounge-extras/:adoptedId/toggle` | lounge + CSRF | Toggle `isActive` |

### 2.3 Public — Read Only

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/extras` | auth | List all extras (any authenticated user) |

---

## 3. Lounge Adoption Flow

```
Lounge browses available extras
         │
         ▼
  Lounge selects an Extra
         │
         ▼
  POST /v1/lounge-extras  { extraId, cost?, description? }
         │
         ├── Already adopted? ──► 409 Conflict
         │
         └── Extra exists? ──► No ──► 404 Not Found
              │
              Yes
              │
              ▼
        Creates LoungeExtra (isActive: true)
              │
              ▼
        Extra is now "adopted" (visible in lounge's list)
```

**Lounge can:**
- View their adopted extras (`GET /v1/lounge-extras`)
- View available extras not yet adopted (`GET /v1/lounge-extras/available`)
- Override cost per extra (paid extras only)
- Set lounge-specific description
- Toggle active/inactive (soft enable/disable)
- Un-adopt (delete) an adopted extra

---

## 4. Directory Structure

```
src/systems/ExtrasSystem/
├── controllers/
│   ├── extrasManagement.controller.ts    # Admin CRUD (imported by AdminSystem)
│   ├── loungeExtras.controller.ts        # Lounge-facing adopt/un-adopt/toggle
│   └── publicExtras.controller.ts        # Public read-only listing
├── dtos/
│   └── extras.dto.ts                     # CreateExtraDto, UpdateExtraDto,
│                                         #   AdoptExtraDto, UpdateAdoptedExtraDto
├── interfaces/
│   └── extra.interface.ts                # Extra interface, LoungeExtra interface
├── models/
│   ├── extra.model.ts                    # Mongoose schema for Extra (global catalog)
│   └── loungeExtra.model.ts              # Mongoose schema for LoungeExtra (adopted)
├── routes/
│   ├── extras.route.ts                   # /v1/extras (public read)
│   └── loungeExtras.route.ts             # /v1/lounge-extras (lounge CRUD)
├── services/
│   ├── extras.service.ts                 # Extra CRUD logic (admin)
│   └── loungeExtras.service.ts           # LoungeExtra adoption logic
└── tests/
    └── extras.test.ts
```

### 4.1 Registration in AdminSystem

Admin endpoints are mounted directly in `AdminSystem/routes/admin/catalog.route.ts` (Option A):

```typescript
import ExtrasManagementController from '@systems/ExtrasSystem/controllers/extrasManagement.controller';
import { CreateExtraDto, UpdateExtraDto } from '@systems/ExtrasSystem/dtos/extras.dto';

export const createAdminCatalogRouter = (): Router => {
  const router = Router();
  const extrasCtrl = new ExtrasManagementController();

  // ...
  router.get('/extras', extrasCtrl.getAll);
  router.get('/extras/:extraId', extrasCtrl.getById);
  router.post('/extras', csrfMiddleware, validationMiddleware(CreateExtraDto, 'body'), extrasCtrl.create);
  router.put('/extras/:extraId', csrfMiddleware, validationMiddleware(UpdateExtraDto, 'body', true), extrasCtrl.update);
  router.delete('/extras/:extraId', csrfMiddleware, extrasCtrl.delete);

  return router;
};
```

### 4.2 Registration in server.ts

```typescript
const { default: ExtraRoute } = await import('@systems/ExtrasSystem/routes/extras.route');
const { default: LoungeExtraRoute } = await import('@systems/ExtrasSystem/routes/loungeExtras.route');

const app = new App([
  // ...
  new ExtraRoute(),
  new LoungeExtraRoute(),
]);
```

---

## 5. Implementation Checklist

### 5.1 Models (2 files)
- [x] `models/extra.model.ts`
  - `name`: String, required, unique, trimmed
  - `description`: String, max 1000
  - `free`: Boolean, required, default false
  - `cost`: Number, min 0, default 0 — validated in service (mutual exclusivity with `free`)
  - `category`: String, required
  - `image`: `{ url: String, publicId: String }`
  - `createdBy`: ObjectId ref User
  - `isActive`: Boolean, default true
  - timestamps: true
  - indexes: `{ name: 1 }` unique, `{ category: 1 }`, `{ free: 1 }`

- [x] `models/loungeExtra.model.ts`
  - `loungeId`: ObjectId ref User, required
  - `extraId`: ObjectId ref Extra, required
  - `cost`: Number, min 0 (optional override)
  - `description`: String
  - `isActive`: Boolean, default true
  - timestamps: true
  - compound unique index: `{ loungeId: 1, extraId: 1 }`

### 5.2 Interfaces (1 file)
- [x] `interfaces/extra.interface.ts`
  - `Extra` interface with all fields
  - `LoungeExtra` interface with all fields

### 5.3 DTOs (1 file)
- [x] `CreateExtraDto`:
  - `name`: `@IsString()`, `@MinLength(2)`, `@MaxLength(100)` — required
  - `description`: `@IsOptional()`, `@IsString()`, `@MaxLength(1000)`
  - `free`: `@IsBoolean()` — required
  - `cost`: `@IsOptional()`, `@Min(0)` — validated in service
  - `category`: `@IsString()` — required
  - `image`: `@IsOptional()`, `@IsString()`
- [x] `UpdateExtraDto` — all fields optional, same validators
- [x] `AdoptExtraDto`:
  - `extraId`: `@IsMongoId()` — required
  - `cost`: `@IsOptional()`, `@Min(0)`
  - `description`: `@IsOptional()`, `@IsString()`
- [x] `UpdateAdoptedExtraDto`:
  - `cost`: `@IsOptional()`, `@Min(0)`
  - `description`: `@IsOptional()`, `@IsString()`

### 5.4 Services (2 files)

- [x] `extras.service.ts`:
  - `getAll(page, limit, filter?)` — paginated, filterable by category/free
  - `getById(extraId)` — single extra
  - `create(data)` — validates free/cost constraint, sets `createdBy`
  - `update(extraId, data)` — validates free/cost constraint; auto-clears cost when `free` set to true
  - `delete(extraId)` — hard delete

- [x] `loungeExtras.service.ts`:
  - `getByLounge(loungeId, page, limit)` — list lounge's adopted extras, populate extra details
  - `getAvailable(loungeId, page, limit)` — extras NOT yet adopted by this lounge
  - `adopt(loungeId, data)` — checks extra exists + not already adopted, creates LoungeExtra
  - `update(adoptedId, loungeId, data)` — update cost/description, scoped to lounge
  - `remove(adoptedId, loungeId)` — delete, scoped to lounge
  - `toggle(adoptedId, loungeId)` — flip `isActive`, scoped to lounge

### 5.5 Controllers (3 files)
- [x] `extrasManagement.controller.ts` (admin) — wraps all admin service methods
- [x] `loungeExtras.controller.ts` (lounge) — wraps lounge service methods, auto-binds `loungeId` from `req.user`
- [x] `publicExtras.controller.ts` (public) — paginated listing of extras

### 5.6 Routes (3 files)
- [x] `extras.route.ts` — `GET /v1/extras` (auth only)
- [x] `loungeExtras.route.ts` — lounge CRUD with `authMiddleware`, `loungeMiddleware`, `csrfMiddleware`, `validationMiddleware`
- [x] Admin integration in `AdminSystem/routes/admin/catalog.route.ts` (Option A)

### 5.7 Registration
- [x] Import + instantiate routes in `server.ts`
- [x] Import admin controller in `AdminSystem/routes/admin/catalog.route.ts`

---

## 6. Validation Steps

After implementation, verify each flow:

### 6.1 Admin CRUD

```
Step 1: POST /v1/admin/extras
  Body: { name: "Hair Mask", free: false, cost: 15, category: "treatment" }
  → Expect 201, free: false, cost: 15

Step 2: POST /v1/admin/extras
  Body: { name: "Free Consultation", free: true, category: "consultation" }
  → Expect 201, free: true, cost: 0

Step 3: POST /v1/admin/extras
  Body: { name: "Bad Extra", free: false, category: "other" }
  → Expect 400 (cost required > 0 when free === false)

Step 4: GET /v1/admin/extras?category=treatment
  → Expect the Hair Mask extra, total: 1

Step 5: PUT /v1/admin/extras/:extraId
  Body: { cost: 20 }
  → Expect 200, cost updated to 20

Step 6: DELETE /v1/admin/extras/:extraId
  → Expect 200, extra removed
```

### 6.2 Lounge Browse Available

```
Step 1: GET /v1/lounge-extras/available
  → Expect all non-adopted extras
  → Extra should show its free/cost info
```

### 6.3 Lounge Adoption

```
Step 1: POST /v1/lounge-extras
  Body: { extraId: "<extra ID>", cost: 25 }
  → Expect 201, LoungeExtra created with loungeId auto-bound

Step 2: POST /v1/lounge-extras
  Body: { extraId: "<same extra's ID>" }
  → Expect 409 Conflict (already adopted)

Step 3: GET /v1/lounge-extras
  → Expect the adopted extra in results

Step 4: PUT /v1/lounge-extras/:adoptedId
  Body: { cost: 30 }
  → Expect 200, cost updated

Step 5: PATCH /v1/lounge-extras/:adoptedId/toggle
  → Expect 200, isActive flipped

Step 6: DELETE /v1/lounge-extras/:adoptedId
  → Expect 200, removed
```

### 6.4 Scoping & Security

```
Step 1: Lounge A adopts Extra X
Step 2: Lounge B GET /v1/lounge-extras
  → Expect Lounge B's list (should NOT include Lounge A's adoption)
Step 3: Lounge B tries PUT /v1/lounge-extras/:loungeA's adoption
  → Expect 404 (scoped)
Step 4: Client tries POST /v1/lounge-extras
  → Expect 403 Forbidden
Step 5: Agent tries POST /v1/admin/extras
  → Expect 403 Forbidden
```

### 6.5 Free / Cost Validation

```
Step 1: POST /v1/admin/extras
  Body: { name: "Free Extra", free: true }
  → Expect 201, cost is 0

Step 2: POST /v1/admin/extras
  Body: { name: "Free With Cost", free: true, cost: 10 }
  → Expect 400 (cost must not be set when free === true)

Step 3: POST /v1/admin/extras
  Body: { name: "Paid Extra", free: false, cost: 50 }
  → Expect 201, cost: 50

Step 4: PUT /v1/admin/extras/:paidExtraId
  Body: { free: true }
  → Expect 200, cost auto-set to 0

Step 5: PUT /v1/admin/extras/:freeExtraId
  Body: { free: false }
  → Expect 400 (cost required when switching to paid)
```

### 6.6 Pagination

```
GET /v1/admin/extras?page=1&limit=10
  → Expect { data: [...], page: 1, limit: 10, total: N, totalPages: ceil(N/10) }
```

---

## 7. Key Patterns Followed (from existing codebase)

| Aspect | Pattern | Reference |
|--------|---------|-----------|
| Service class | Class with `public extras = extraModel` | `services.service.ts` |
| Controller | Arrow functions, `RequestWithUser`, try/catch with `next(error)` | `services.controller.ts` |
| DTO validation | `class-validator` decorators, `validationMiddleware` in routes | `services.dto.ts` |
| Route structure | Class implementing `Routes` interface | `services.route.ts` |
| Admin route mount | Factory function imported into AdminSystem `catalog.route.ts` | `CatalogManagementController` |
| Error handling | `HttpException` subclasses + `handleMongooseError()` | Service files throughout |
| Response shape | `{ data, message }` or `{ data, page, limit, total, totalPages, message }` | All controllers |
| Lounge auto-scoping | `loungeId` bound from `req.user._id.toString()` | `loungeServices.controller.ts:33` |
| CSRF | On all mutation routes | All route files |
