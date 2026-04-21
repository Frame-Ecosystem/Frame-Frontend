# Agent Layer — Frontend Integration Guide

> **Purpose of this document**
> This guide is written for the frontend engineer / AI agent implementing the client-side changes that correspond to the Agent system refactor on the backend. Read every section before writing a single line of code.

---

## Table of Contents

1. [What Changed & Why](#1-what-changed--why)
2. [Core Data Model](#2-core-data-model)
3. [Authentication — How Agents Log In](#3-authentication--how-agents-log-in)
4. [API Surface — Quick Reference](#4-api-surface--quick-reference)
5. [Management API (Admin / Lounge)](#5-management-api-admin--lounge)
6. [Agent Self-Service API (`/me/*`)](#6-agent-self-service-api-me)
7. [Queue API (`/me/queue/*`)](#7-queue-api-mequeue)
8. [Request & Response Shapes](#8-request--response-shapes)
9. [Error Codes](#9-error-codes)
10. [Role & Permission Matrix](#10-role--permission-matrix)
11. [Migration Checklist for the Frontend](#11-migration-checklist-for-the-frontend)

---

## 1. What Changed & Why

### Before (legacy)
- Agents were a **separate Mongoose collection** (`Agent` model, `agents` MongoDB collection).
- Agents had their own fields: `loungeId`, `idLoungeService`, `agentName`, `password`.
- The frontend may have called a dedicated `/agents` endpoint backed by a standalone agent model.

### After (current — what you must implement against)
- Agents are **regular `User` documents** inside the shared `users` MongoDB collection with `type: "agent"`.
- The standalone `Agent` model/collection is **retired** — it no longer exists.
- Agent-specific fields (`agentName`, `parentLounge`, `services`, `acceptQueueBooking`) are stored directly on the `User` document.
- Agents authenticate via the **standard `/v1/auth/login` endpoint** — no special login flow.
- A new self-service API surface (`/v1/agents/me/*`) lets the authenticated agent manage their own data.

### Key field renames you must handle
| Old field | New field | Notes |
|-----------|-----------|-------|
| `loungeId` | `parentLounge` | Full lounge user object when populated |
| `idLoungeService` | `services` | Array of `LoungeService` objects when populated |
| _(no field)_ | `type: "agent"` | Discriminator present on every User document |
| _(no field)_ | `agentName` | Optional display name for the agent |

---

## 2. Core Data Model

An agent returned from the API will look like this (sensitive fields stripped server-side):

```typescript
interface AgentUser {
  _id: string;                    // MongoDB ObjectId as string
  type: "agent";                  // Always "agent" for agents
  email: string;
  agentName?: string;             // Display name, e.g. "Agent Sarah"
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  isBlocked?: boolean;
  acceptQueueBooking: boolean;    // Availability toggle — core to queue logic
  parentLounge: {                 // Populated: the lounge this agent belongs to
    _id: string;
    loungeTitle: string;
    email: string;
  };
  services: Array<{               // Populated: services the agent is qualified for
    _id: string;
    serviceId: { name: string; category: string };  // further populated
    price: number;
    duration: number;
  }>;
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
}
```

> **Note**: `password`, `refreshTokens`, `emailVerification`, `fcmTokens`, `failedLoginAttempts`, `lockUntil`, `oauth`, and `__v` are **never** returned by any agent endpoint. Do not expect or store them.

---

## 3. Authentication — How Agents Log In

Agents use the **exact same login endpoint as all other users**. There is no special agent login page or endpoint.

```
POST /v1/auth/login
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "Str0ng!Pass"
}
```

**Response**: Standard JWT response with `accessToken` + `refreshToken`. The decoded JWT payload will include `type: "agent"`, which the frontend should use to determine role-based UI rendering.

**No email verification step** — agents are created by a Lounge or Admin and their email is pre-verified, so they can log in immediately after creation.

---

## 4. API Surface — Quick Reference

All endpoints are under the base path `/v1/agents`.

### Self-service (agent token required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/agents/me` | Get own profile |
| `PATCH` | `/v1/agents/me` | Update own profile (name, bio, phone) |
| `PATCH` | `/v1/agents/me/availability` | Toggle `acceptQueueBooking` on/off |
| `PUT` | `/v1/agents/me/image` | Upload/replace own profile image |
| `GET` | `/v1/agents/me/queue` | Get own queue for today (or `?date=YYYY-MM-DD`) |
| `GET` | `/v1/agents/me/queue/stats` | Get today's queue stats (counts by status) |
| `POST` | `/v1/agents/me/queue/persons` | Manually add a booking to own queue |
| `POST` | `/v1/agents/me/queue/next` | Complete current person, call next in line |
| `PATCH` | `/v1/agents/me/queue/persons/:bookingId` | Update a specific person's status |
| `PUT` | `/v1/agents/me/queue/persons/:bookingId/reorder` | Move a person to a new queue position |
| `DELETE` | `/v1/agents/me/queue/persons/:bookingId` | Remove a person (`?markAbsent=true` to mark absent) |

### Management (admin or lounge token required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/agents` | List agents (admin: all; lounge: own agents; client: all) |
| `GET` | `/v1/agents/:agentId` | Get a single agent |
| `POST` | `/v1/agents` | Create an agent (multipart/form-data) |
| `PUT` | `/v1/agents/:agentId` | Update an agent |
| `DELETE` | `/v1/agents/:agentId` | Delete an agent |
| `PUT` | `/v1/agents/:agentId/image` | Upload/replace an agent's profile image (admin/lounge) |

---

## 5. Management API (Admin / Lounge)

### `POST /v1/agents` — Create Agent

**Auth**: Admin or Lounge JWT.  
**Content-Type**: `multipart/form-data` (supports optional profile image upload).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | Unique across all users |
| `password` | string | ✅ | 8–64 chars, upper + lower + digit + special char |
| `agentName` | string | ❌ | Display name shown in queue UI |
| `firstName` | string | ❌ | |
| `lastName` | string | ❌ | |
| `phoneNumber` | string | ❌ | Unique across all users |
| `parentLounge` | MongoId string | ❌ for Lounge caller / ✅ for Admin | Lounge auto-injects own ID; Admin must supply |
| `services` | JSON string OR array of MongoId strings | ✅ | IDs of `LoungeService` documents; must belong to `parentLounge` |
| `acceptQueueBooking` | boolean | ❌ | Defaults to `false` |
| `isBlocked` | boolean | ❌ | Defaults to `false` |
| `image` | File | ❌ | Uploaded as multipart field named `image` |

> **Important for multipart forms**: `services` can be sent either as a native array (multiple form fields with the same key) or as a single JSON string `'["id1","id2"]'`. The backend normalises both forms.

**Success response** `201`:
```json
{
  "data": { /* AgentUser object */ },
  "message": "Agent created successfully"
}
```

---

### `GET /v1/agents` — List Agents

**Auth**: Admin, Lounge, or Client JWT.

- **Admin** sees all agents across all lounges.
- **Lounge** sees only their own agents.
- **Client** sees all agents (read-only listing).

**Success response** `200`:
```json
{
  "data": [ /* AgentUser[] */ ],
  "count": 4,
  "message": "Agents retrieved successfully"
}
```

---

### `GET /v1/agents/:agentId` — Get Single Agent

**Auth**: Admin, Lounge, or Client JWT.  
- A Lounge can only fetch agents that belong to them (returns 404 otherwise).

**Success response** `200`:
```json
{
  "data": { /* AgentUser */ },
  "message": "Agent retrieved successfully"
}
```

---

### `PUT /v1/agents/:agentId` — Update Agent

**Auth**: Admin or Lounge JWT.  
**Content-Type**: `application/json`.

All fields optional:

```json
{
  "agentName": "Sarah",
  "firstName": "Sarah",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "password": "NewStr0ng!Pass",
  "services": ["<loungeServiceId1>", "<loungeServiceId2>"],
  "acceptQueueBooking": true,
  "isBlocked": false
}
```

> A Lounge can only update their own agents. `services` IDs must belong to the agent's `parentLounge`.

**Success response** `200`:
```json
{
  "data": { /* updated AgentUser */ },
  "message": "Agent updated successfully"
}
```

---

### `DELETE /v1/agents/:agentId` — Delete Agent

**Auth**: Admin or Lounge JWT.

**Success response** `200`:
```json
{ "message": "Agent deleted successfully" }
```

---

### `PUT /v1/agents/:agentId/image` — Upload Agent Profile Image (admin/lounge)

**Auth**: Admin or Lounge JWT.  
**Content-Type**: `multipart/form-data`.  
**Form field**: `image` (file).

**Success response** `200`:
```json
{
  "data": { /* updated AgentUser */ },
  "message": "Profile image uploaded successfully"
}
```

---

## 6. Agent Self-Service API (`/me/*`)

These routes are only accessible with a valid **agent** JWT. Calling them with any other user type returns `400 NOT_AN_AGENT`.

---

### `GET /v1/agents/me` — Get Own Profile

**Success response** `200`:
```json
{
  "data": { /* AgentUser */ },
  "message": "Profile retrieved successfully"
}
```

---

### `PATCH /v1/agents/me` — Update Own Profile

**Content-Type**: `application/json`.

```json
{
  "agentName": "Sarah",
  "firstName": "Sarah",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "bio": "Specialist in haircuts and styling"
}
```

> Agents **cannot** change their own `services`, `password`, `parentLounge`, `isBlocked`, or `acceptQueueBooking` via this endpoint. Use `/me/availability` for the availability toggle.

**Success response** `200`:
```json
{
  "data": { /* updated AgentUser */ },
  "message": "Profile updated successfully"
}
```

---

### `PATCH /v1/agents/me/availability` — Toggle Availability

Flips the `acceptQueueBooking` flag. This is the "I'm ready / I'm on break" button in the agent UI.

```json
{ "acceptQueueBooking": true }
```

**Success response** `200`:
```json
{
  "data": {
    "agentId": "<id>",
    "acceptQueueBooking": true
  },
  "message": "Availability enabled"
}
```

The `message` will be `"Availability disabled"` when set to `false`.

---

### `PUT /v1/agents/me/image` — Upload Own Profile Image

**Content-Type**: `multipart/form-data`.  
**Form field**: `image` (file).

**Success response** `200`:
```json
{
  "data": { /* updated AgentUser */ },
  "message": "Profile image updated successfully"
}
```

---

## 7. Queue API (`/me/queue/*`)

Each agent has **one queue per calendar day**, auto-created when the agent is created. The queue holds a list of `persons` representing booked clients waiting for service.

### Queue Person Status Flow

```
WAITING → IN_SERVICE → COMPLETED
                    ↘ ABSENT
```

| Status | Value | Description |
|--------|-------|-------------|
| Waiting | `"waiting"` | In line, not yet served |
| In Service | `"inService"` | Currently being served |
| Completed | `"completed"` | Service finished |
| Absent | `"absent"` | Did not show up |

---

### `GET /v1/agents/me/queue` — Get Own Queue

Optional query param: `?date=2026-04-20` (ISO date). Defaults to today.

**Success response** `200`:
```json
{
  "data": {
    "_id": "<queueId>",
    "agentId": "<agentId>",
    "date": "2026-04-20T00:00:00.000Z",
    "persons": [
      {
        "bookingId": "<bookingId>",
        "clientId": "<userId>",
        "visitorName": null,
        "position": 1,
        "status": "inService",
        "joinedAt": "2026-04-20T09:00:00.000Z",
        "reminderSent": false
      },
      {
        "bookingId": "<bookingId2>",
        "clientId": "<userId2>",
        "visitorName": null,
        "position": 2,
        "status": "waiting",
        "joinedAt": "2026-04-20T09:05:00.000Z",
        "reminderSent": false
      }
    ]
  },
  "message": "Queue retrieved successfully"
}
```

---

### `GET /v1/agents/me/queue/stats` — Get Queue Stats

**Success response** `200`:
```json
{
  "data": {
    "total": 8,
    "waiting": 4,
    "inService": 1,
    "completed": 2,
    "absent": 1
  },
  "message": "Queue stats retrieved successfully"
}
```

---

### `POST /v1/agents/me/queue/next` — Call Next Person

This is the **primary action button** for the agent's queue view. It:
1. Marks the current `inService` person as `completed` (if one exists).
2. Promotes the next `waiting` person (lowest `position`) to `inService`.

No request body required.

**Success response** `200`:
```json
{
  "data": { /* full updated Queue object */ },
  "message": "Next person is now in service"
}
```

If there are no more waiting persons:
```json
{
  "data": { /* queue with no inService person */ },
  "message": "No more waiting persons"
}
```

---

### `POST /v1/agents/me/queue/persons` — Manually Add Person

Add a booking to the queue (e.g. walk-in, or re-adding after removal).

```json
{
  "bookingId": "<bookingId>",
  "position": 3
}
```

`position` is optional. If omitted, the person is appended at the end.

**Success response** `201`:
```json
{
  "data": { /* updated Queue object */ },
  "message": "Person added to queue successfully"
}
```

---

### `PATCH /v1/agents/me/queue/persons/:bookingId` — Update Person Status

Manually set a specific person's status.

```json
{ "status": "absent" }
```

Valid values: `"waiting"`, `"inService"`, `"completed"`, `"absent"`.

**Success response** `200`:
```json
{
  "data": { /* updated Queue object */ },
  "message": "Person status updated successfully"
}
```

---

### `PUT /v1/agents/me/queue/persons/:bookingId/reorder` — Reorder Person

Move a person to a different position in the queue. All other positions are adjusted automatically.

```json
{ "newPosition": 2 }
```

`newPosition` is 1-based and must be ≥ 1.

**Success response** `200`:
```json
{
  "data": { /* updated Queue object */ },
  "message": "Queue person reordered successfully"
}
```

---

### `DELETE /v1/agents/me/queue/persons/:bookingId` — Remove Person

Remove a person from the queue. Optional query param `?markAbsent=true` marks the booking as absent in addition to removing from queue.

```
DELETE /v1/agents/me/queue/persons/<bookingId>?markAbsent=true
```

**Success response** `200`:
```json
{
  "data": { /* updated Queue object */ },
  "message": "Person removed and marked absent"
}
```
or (without `markAbsent`):
```json
{
  "data": { /* updated Queue object */ },
  "message": "Person removed"
}
```

---

## 8. Request & Response Shapes

### Standard success envelope

Every successful response follows this envelope:

```json
{
  "data": { /* payload */ },
  "message": "Human-readable status",
  "count": 5         // only on list responses
}
```

### Standard error envelope

```json
{
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE",
  "status": 400
}
```

### CSRF token

All mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid CSRF token sent in the `x-csrf-token` header. Obtain it from the standard CSRF endpoint before making mutations.

### Image upload

Profile image endpoints expect `multipart/form-data` with the file under the field name `image`. Maximum file size and accepted MIME types are enforced by the existing upload middleware.

---

## 9. Error Codes

| HTTP | Code | Cause |
|------|------|-------|
| 400 | `MISSING_REQUIRED_FIELDS` | `email`, `password`, `parentLounge`, or `services` missing on create |
| 400 | `INVALID_AGENT_ID` | `agentId` is not a valid MongoDB ObjectId |
| 400 | `INVALID_LOUNGE_SERVICES` | One or more service IDs don't exist or don't belong to the agent's lounge |
| 400 | `MISSING_UPDATE_DATA` | Empty body sent to an update endpoint |
| 400 | `NOT_AN_AGENT` | Self-service endpoint called by a non-agent token |
| 400 | `QUEUE_NOT_FOUND` | `POST /me/queue/next` called when no queue exists for today |
| 404 | `AGENT_NOT_FOUND` | Agent ID doesn't exist, or Lounge tried to access another lounge's agent |
| 404 | `LOUNGE_NOT_FOUND` | `parentLounge` ID doesn't point to an existing lounge user |
| 409 | `EMAIL_EXISTS` | Email already registered in the system |
| 409 | `PHONE_EXISTS` | Phone number already registered in the system |
| 401 | — | Missing or expired JWT |
| 403 | `AGENT_ACCESS_DENIED` | Valid JWT but role is not `agent` on a `/me/*` route |
| 403 | `ADMIN_LOUNGE_AGENT_ACCESS_DENIED` | Valid JWT but role is not admin, lounge, or agent |

---

## 10. Role & Permission Matrix

| Action | Admin | Lounge | Agent | Client |
|--------|:-----:|:------:|:-----:|:------:|
| List all agents | ✅ | Own agents only | ❌ | ✅ (read-only) |
| Get agent by ID | ✅ | Own agents only | ❌ | ✅ (read-only) |
| Create agent | ✅ (must supply `parentLounge`) | ✅ (auto-bound to self) | ❌ | ❌ |
| Update agent | ✅ | Own agents only | ❌ | ❌ |
| Delete agent | ✅ | Own agents only | ❌ | ❌ |
| Upload agent image | ✅ | Own agents only | Own image (`/me/image`) | ❌ |
| `GET /me` | ❌ | ❌ | ✅ | ❌ |
| `PATCH /me` | ❌ | ❌ | ✅ | ❌ |
| `PATCH /me/availability` | ❌ | ❌ | ✅ | ❌ |
| All `/me/queue/*` | ❌ | ❌ | ✅ | ❌ |

---

## 11. Migration Checklist for the Frontend

Work through this list top-to-bottom before shipping.

### Data / state layer

- [ ] **Remove** any reference to a standalone `Agent` type or `agentModel` store. Agents are now `User` objects with `type === "agent"`.
- [ ] **Rename** all occurrences of `loungeId` on agent objects to `parentLounge`.
- [ ] **Rename** all occurrences of `idLoungeService` on agent objects to `services`.
- [ ] Update TypeScript/JS interfaces or types to match the `AgentUser` shape defined in [Section 2](#2-core-data-model).
- [ ] When checking if a user is an agent, use `user.type === "agent"` — not a separate flag or collection membership check.

### Auth / login flow

- [ ] **No change needed** to the login form itself — agents use the same `/v1/auth/login` endpoint.
- [ ] After login, read `type` from the decoded JWT to determine which dashboard to render (`"agent"` → agent dashboard).
- [ ] Agents do **not** go through email verification — do not show a "check your email" screen after agent creation.

### API calls

- [ ] **Replace** any old agent CRUD calls that pointed to a standalone `/agents` model route to use `/v1/agents`.
- [ ] On `POST /v1/agents`, send `services` as a JSON array string if using `multipart/form-data` (e.g. `JSON.stringify(selectedServiceIds)`).
- [ ] When a **Lounge** creates an agent, do **not** send `parentLounge` in the body — the backend auto-injects it.
- [ ] When an **Admin** creates an agent, always send `parentLounge`.

### Agent dashboard / self-service UI

- [ ] Implement the availability toggle button that calls `PATCH /v1/agents/me/availability` with `{ "acceptQueueBooking": true/false }`.
- [ ] Display `acceptQueueBooking` state visually (e.g. green "Available" / red "Unavailable" badge).
- [ ] The agent profile edit form should call `PATCH /v1/agents/me` — it must **not** expose `services`, `password`, `isBlocked`, or `parentLounge` fields.
- [ ] Profile image upload from the agent's own settings page must call `PUT /v1/agents/me/image`.

### Queue UI (agent-facing)

- [ ] Build or update the queue view to consume `GET /v1/agents/me/queue`.
- [ ] The **"Call Next"** button calls `POST /v1/agents/me/queue/next` — no body required. Re-fetch the queue after success.
- [ ] The **stats bar** (Waiting / In Service / Completed / Absent counts) should call `GET /v1/agents/me/queue/stats`.
- [ ] Status badge for each person maps as follows:

  | Value | Display label | Suggested colour |
  |-------|--------------|-----------------|
  | `waiting` | Waiting | Yellow |
  | `inService` | In Service | Blue |
  | `completed` | Completed | Green |
  | `absent` | Absent | Red/Grey |

- [ ] The drag-to-reorder (or position input) feature calls `PUT /v1/agents/me/queue/persons/:bookingId/reorder` with `{ "newPosition": N }`.
- [ ] The remove/mark-absent action calls `DELETE /v1/agents/me/queue/persons/:bookingId?markAbsent=true`.
- [ ] Optionally poll or use WebSocket (Socket.IO) for real-time queue updates — the backend emits queue change events on the agent's room.

### Lounge dashboard (managing agents)

- [ ] The "Add Agent" form must use `multipart/form-data` (to support profile image) and send `services` as a JSON string array.
- [ ] The agent list for a lounge is populated by `GET /v1/agents` — the backend automatically scopes it to the lounge's own agents.
- [ ] `parentLounge` in the returned agent object is a populated object `{ _id, loungeTitle, email }` — do not expect a bare ID string.
- [ ] `services` in the returned agent object is a populated array of `LoungeService` objects — do not expect bare ID strings.

### Cleanup

- [ ] Remove any frontend code that calls legacy agent endpoints (if a dedicated `/api/agents` existed before outside of `/v1/agents`).
- [ ] Remove any frontend Mongoose/direct-DB models or mock schemas that referenced the old `Agent` collection.
- [ ] Update API documentation or Postman/Insomnia collections to reflect new routes and field names.
