# Frontend API Integration Guide — Lounge Services & Agents

> Use this guide to integrate the lounge service and agent management APIs into the frontend.

---

## Table of Contents

- [Authentication](#authentication)
- [Lounge Services](#1-lounge-services)
- [Agents](#2-agents)
- [Relationships](#3-key-relationships)
- [Error Handling](#4-error-handling)
- [Role-Based Access](#5-role-based-access)

---

## Authentication

All endpoints require these headers:

```
Authorization: Bearer <jwt_token>
csrf-token: <csrf_token_value>
```

CSRF tokens are required on all mutating requests (POST, PUT, PATCH, DELETE). Obtain the CSRF token from the initial app load or a dedicated endpoint. Check how the app initialises this.

---

## 1. Lounge Services

Base URL: `/v1/lounge-services`

### POST `/v1/lounge-services` — Create

**Auth:** JWT + CSRF. Lounge accounts see only their own data.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `loungeId` | string | Yes | Mongo ObjectId of the lounge |
| `serviceId` | string | Yes | Mongo ObjectId from the global Service catalog |
| `agentIds` | string[] | No | Agent Mongo ObjectIds assigned to this service |
| `price` | number | Yes | Min 0 |
| `duration` | number | Yes | Min 1 (minutes) |
| `gender` | enum | Yes | `men` \| `women` \| `unisex` \| `kids` |
| `status` | enum | No | `active` (default) \| `inactive` |
| `description` | string | No | Max 1000 chars |
| `image` | file | No | Multipart upload |
| `isActive` | boolean | No | Defaults to `true` |

**Response (201):**
```json
{
  "data": { "loungeService document" },
  "message": "Lounge service created successfully"
}
```

**Constraints:**
- Duplicate `{ loungeId, serviceId }` → 409 Conflict.
- `agentIds` must reference agents belonging to this lounge.
- `image` uses `optionalUpload` middleware — only applies for multipart requests.

### PUT `/v1/lounge-services/:serviceId` — Update

**Auth:** JWT + CSRF.

**Request:** `multipart/form-data`

All fields optional (partial update). Types same as create.
- Do NOT send `loungeId` or `serviceId`.
- Sending `agentIds` replaces the entire array.

**Response (200):**
```json
{
  "data": { "sanitized loungeService document" },
  "message": "Lounge service updated successfully"
}
```

### Other Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/v1/lounge-services` | List all (scoped by role) |
| GET | `/v1/lounge-services/:serviceId` | Get by ID |
| GET | `/v1/lounge-services/lounge/:loungeId` | Get services for a lounge |
| DELETE | `/v1/lounge-services/:serviceId` | Delete (JWT + CSRF) |
| PATCH | `/v1/lounge-services/:serviceId/toggle-status` | Toggle active/inactive |

---

## 2. Agents

Base URL: `/v1/agents`

### POST `/v1/agents` — Create

**Auth:** JWT + `adminOrLounge` role. CSRF required.

**Request:** `multipart/form-data`

**Important:**
- `services` field arrives as a **JSON string** (the controller parses it).
- If the logged-in user is a `lounge`, `parentLounge` is **auto-bound** — do not send it.

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Valid email, used as login |
| `password` | string | Yes | 8-64 chars, must have uppercase, lowercase, digit, special char |
| `agentName` | string | No | Display name in queue UI |
| `firstName` | string | No | |
| `lastName` | string | No | |
| `phoneNumber` | string | No | |
| `parentLounge` | string | Admin only | MongoId; ignored/overwritten for lounge callers |
| `services` | string (JSON array) | Yes | JSON-stringified array of LoungeService MongoIds |
| `isBlocked` | boolean | No | |
| `acceptQueueBooking` | boolean | No | |
| `profileImage` | file or base64 string | No | |

**Response (201):**
```json
{
  "data": { "user document with type 'agent'" },
  "message": "Agent created successfully"
}
```

**Server-side validations:**
- All `services` must exist, be active (`isActive: true`, `status: 'active'`), and belong to the same lounge as `parentLounge`.
- Email must be unique across all user types.
- Phone must be unique if provided.
- On success, a daily queue is auto-created for the agent.

### PUT `/v1/agents/:agentId` — Update

**Auth:** JWT + `adminOrLounge` role. CSRF required.

**Request:** JSON body (not multipart — use dedicated image endpoint for photos).

All fields optional:
```json
{
  "agentName": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "password": "string",
  "services": ["mongoId1", "mongoId2"],
  "isBlocked": true,
  "acceptQueueBooking": true
}
```

**Response (200):**
```json
{
  "data": { "updated agent document" },
  "message": "Agent updated successfully"
}
```

**Scoping:** Lounge users can only update agents under their own lounge. Admin can update any agent.

### Image Upload (Separate Endpoint)

```
PUT /v1/agents/:agentId/image
```

Multipart with `image` field. Same auth. Returns updated agent document.

### Other Endpoints

| Method | Path | Auth Role | Description |
|---|---|---|---|
| GET | `/v1/agents` | admin/lounge/client | List agents |
| GET | `/v1/agents/:agentId` | admin/lounge/client | Get by ID |
| DELETE | `/v1/agents/:agentId` | admin/lounge + CSRF | Delete agent |
| GET | `/v1/agents/me` | agent | Get own profile |
| PATCH | `/v1/agents/me` | agent + CSRF | Update own profile (limited fields) |
| PATCH | `/v1/agents/me/availability` | agent + CSRF | Toggle queue availability `{ acceptQueueBooking: bool }` |

---

## 3. Key Relationships

```
User (lounge)
  ├── LoungeService  (created by lounge, references global Service catalog)
  │     └── agentIds[] → User (agent)
  └── User (agent)
        └── services[] → LoungeService
```

**Form building order:**
1. Create **Lounge Services** first (pick global Service, set price/duration/gender).
2. Create **Agents** second, assigning them to existing LoungeServices via `services`.

Agents can only be assigned services that belong to the same lounge and are active.

---

## 4. Error Handling

| Code | Meaning |
|---|---|
| 201 | Created successfully |
| 200 | Updated / retrieved successfully |
| 400 | Validation error — check response body for field-level messages |
| 401 | Missing or invalid JWT |
| 403 | Blocked account or insufficient role |
| 404 | Resource not found |
| 409 | Duplicate lounge-service pair |

All error responses follow: `{ "message": "error description" }`

---

## 5. Role-Based Access

| User Role | Lounge Services | Agents |
|---|---|---|
| **Admin** | Full access to all | Full access; must specify `parentLounge` when creating |
| **Lounge** | Own services only (auto-scoped) | Own agents only (auto-bound) |
| **Client** | Read-only (list/search) | Read-only (list) |
| **Agent** | Associated services (read) | Own profile only |
