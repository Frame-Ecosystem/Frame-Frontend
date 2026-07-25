# Rating Module — Frontend Integration Prompt

## Overview

The Rating Module allows users to rate other users (Lounges and Agents) on a 1–5 star scale with an optional text comment. Ratings are **generalized** — any supported user type can rate any supported target, as long as the combination is allowed by the backend matrix. Ratings are **upserted**: if a user already rated the same target, the new rating replaces the old one. Users can delete their own ratings.

**Base URL:** `/v1/ratings`
**Auth:** All endpoints require a valid JWT via `Authorization: Bearer <token>` header.
**Write endpoints** also require a valid CSRF token via `X-CSRF-Token` header or `csrf-token` form field.

---

## Rating Matrix

The backend enforces a strict rating matrix. Only these combinations are allowed:

| Rater (you) | Can Rate | Cannot Rate |
|---|---|---|
| **Client** | Lounge, Agent | Other Clients, Admins |
| **Agent** | Lounge | Clients, other Agents, Admins |
| **Lounge** | Agent | Clients, other Lounges, Admins |

**Self-rating is always rejected.** You cannot rate yourself regardless of your type.

If a frontend user attempts to rate a target outside this matrix, the backend returns a `400` with code `INVALID_RATING_PAIR`.

---

## Endpoints

### 1. Create or Update Rating

```
PUT /v1/ratings
```

Create a new rating or update an existing one for the same target. One rating per rater-target pair.

**Auth:** Client, Lounge, or Agent
**CSRF:** Required

#### Request Body

```json
{
  "targetId": "665f1a2b3c4d5e6f7a8b9c0d",
  "score": 5,
  "comment": "Amazing service, very professional!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `targetId` | string (ObjectId) | Yes | ID of the user being rated (must be a Lounge or Agent) |
| `score` | integer | Yes | Rating from 1 to 5 |
| `comment` | string | No | Optional comment, max 1000 characters |

#### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0e",
    "raterId": "665f1a2b3c4d5e6f7a8b9c0f",
    "targetId": "665f1a2b3c4d5e6f7a8b9c0d",
    "raterType": "client",
    "targetType": "lounge",
    "score": 5,
    "comment": "Amazing service, very professional!",
    "createdAt": "2025-07-12T10:30:00.000Z",
    "updatedAt": "2025-07-12T10:30:00.000Z"
  },
  "message": "Rating saved successfully"
}
```

#### Error Responses

| Status | Code | When |
|---|---|---|
| 400 | `SELF_RATING` | Trying to rate yourself |
| 400 | `INVALID_RATING_PAIR` | Rater type cannot rate target type (e.g., Agent → Client) |
| 400 | `INVALID_RATEABLE_TARGET` | Target is not a Lounge or Agent (e.g., rating a Client or Admin) |
| 400 | `USER_NOT_FOUND` | Target user not found or is blocked |
| 400 | validation error | Missing `targetId` or `score`, or invalid values |
| 401 | — | No token or invalid token |
| 403 | — | CSRF token missing/invalid, or user role not allowed |

---

### 2. Delete Rating

```
DELETE /v1/ratings/:targetId
```

Delete your own rating for a specific target. Returns 404 if you haven't rated that target.

**Auth:** Client, Lounge, or Agent
**CSRF:** Required

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `targetId` | string (ObjectId) | ID of the target user whose rating you want to delete |

#### Response (200)

```json
{
  "success": true,
  "message": "Rating deleted successfully"
}
```

#### Error Responses

| Status | Code | When |
|---|---|---|
| 404 | `RATING_NOT_FOUND` | You haven't rated this target |
| 401 | — | No token or invalid token |
| 403 | — | CSRF token missing/invalid |

---

### 3. Get Ratings for a Target

```
GET /v1/ratings/target/:targetId?page=1&limit=20
```

Fetch paginated ratings for any target user (Lounge or Agent). Returns the rater's profile populated on each rating. Sorted newest-first.

**Auth:** Any authenticated user

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `targetId` | string (ObjectId) | ID of the user whose ratings you want to fetch |

#### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (min 1) |
| `limit` | integer | 20 | Items per page (max 50) |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0e",
      "raterId": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0f",
        "firstName": "Sara",
        "lastName": "Alami",
        "profileImage": { "url": "https://cdn.framebeauty.com/avatars/sara.jpg" },
        "type": "client"
      },
      "targetId": "665f1a2b3c4d5e6f7a8b9c0d",
      "raterType": "client",
      "targetType": "lounge",
      "score": 5,
      "comment": "Amazing service, very professional!",
      "createdAt": "2025-07-12T10:30:00.000Z",
      "updatedAt": "2025-07-12T10:30:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "message": "Ratings retrieved successfully"
}
```

**Note:** The `raterId` field is populated with the rater's profile (firstName, lastName, profileImage, type) when reading. When writing, it's just the string ID.

---

### 4. Get My Rating for a Target

```
GET /v1/ratings/me/:targetId
```

Fetch the authenticated user's own rating for a specific target. Returns `null` if you haven't rated them yet.

**Auth:** Client, Lounge, or Agent

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `targetId` | string (ObjectId) | ID of the target user |

#### Response (200) — Has Rated

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0e",
    "raterId": "665f1a2b3c4d5e6f7a8b9c0f",
    "targetId": "665f1a2b3c4d5e6f7a8b9c0d",
    "raterType": "client",
    "targetType": "lounge",
    "score": 4,
    "comment": "Good service",
    "createdAt": "2025-07-10T08:00:00.000Z",
    "updatedAt": "2025-07-12T10:30:00.000Z"
  },
  "message": "Rating found"
}
```

#### Response (200) — Has Not Rated

```json
{
  "success": true,
  "data": null,
  "message": "No rating yet"
}
```

---

## Denormalized Rating Summary

Every Lounge and Agent user document contains denormalized rating fields that are automatically recalculated by the backend whenever a rating is created, updated, or deleted:

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "type": "lounge",
  "loungeTitle": "Beauty Studio",
  "averageRating": 4.5,
  "ratingCount": 28
}
```

| Field | Type | Description |
|---|---|---|
| `averageRating` | number | Rounded to 1 decimal (0.0 – 5.0). 0 if no ratings. |
| `ratingCount` | integer | Total number of ratings received. 0 if none. |

**These fields are already included** in user profiles when fetched via other endpoints (search, likes, profiles). You do not need to call the rating endpoints separately to display stars on a Lounge or Agent card — just read `averageRating` and `ratingCount` from the user object.

---

## Frontend Usage Guide

### Displaying Stars on a Lounge/Agent Card

When rendering a Lounge or Agent in a list (search results, feed, profile), read the `averageRating` and `ratingCount` fields directly from the user object:

```typescript
// From any user object (lounge or agent)
const stars = user.averageRating; // e.g., 4.5
const reviewCount = user.ratingCount; // e.g., 28

// Render: ★★★★½ (4.5) · 28 reviews
```

No API call needed — these are already denormalized on the user document.

### Showing the Rating Breakdown on a Profile Page

Fetch paginated ratings to show individual reviews:

```typescript
// GET /v1/ratings/target/:targetId?page=1&limit=20
const response = await fetch(`/v1/ratings/target/${userId}?page=1&limit=20`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { data: ratings, total, totalPages } = await response.json();
```

### Pre-filling the Rating Form (Edit Mode)

Check if the current user has already rated this target:

```typescript
// GET /v1/ratings/me/:targetId
const response = await fetch(`/v1/ratings/me/${targetId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { data: existingRating } = await response.json();

if (existingRating) {
  // Pre-fill form: score = existingRating.score, comment = existingRating.comment
  // Show "Update Rating" button instead of "Submit Rating"
} else {
  // Show empty form with "Submit Rating" button
}
```

### Submitting a Rating

```typescript
// PUT /v1/ratings
const response = await fetch('/v1/ratings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    targetId: loungeOrAgentId,
    score: selectedStars, // 1-5
    comment: userComment || undefined, // optional
  }),
});

const result = await response.json();
if (result.success) {
  // Rating saved — refresh the profile/ratings list
}
```

### Deleting a Rating

```typescript
// DELETE /v1/ratings/:targetId
const response = await fetch(`/v1/ratings/${targetId}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
  },
});

const result = await response.json();
if (result.success) {
  // Rating deleted — refresh UI
}
```

---

## Error Handling Guide

All errors follow the standard Frame Backend error format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

### Common Error Codes

| HTTP Status | Code | Meaning | Frontend Action |
|---|---|---|---|
| 400 | `SELF_RATING` | User trying to rate themselves | Hide/disable rating UI for own profile |
| 400 | `INVALID_RATING_PAIR` | Forbidden combination (e.g., Agent → Client) | Don't show rating UI if matrix disallows |
| 400 | `INVALID_RATEABLE_TARGET` | Target is a Client or Admin | Don't show rating UI on non-rateable profiles |
| 400 | `USER_NOT_FOUND` | Target doesn't exist or is blocked | Show "User not available" message |
| 400 | `INVALID_TARGET_ID` | Malformed ObjectId | Validate ID format before sending |
| 404 | `RATING_NOT_FOUND` | Trying to delete a rating that doesn't exist | Refresh UI, show "No rating to delete" |
| 401 | — | Missing or expired JWT | Redirect to login |
| 403 | — | CSRF token invalid or missing | Retry with fresh CSRF token |

---

## Rating Matrix Logic for Frontend

To determine whether to show the rating UI on a profile page, implement this client-side check:

```typescript
function canRate(raterType: string, targetType: string): boolean {
  const allowedPairs = new Set([
    'client→lounge',
    'client→agent',
    'agent→lounge',
    'lounge→agent',
  ]);
  return allowedPairs.has(`${raterType}→${targetType}`);
}

// Usage
const currentUserType = currentUser.type; // 'client' | 'lounge' | 'agent'
const profileUserType = profileUser.type; // 'client' | 'lounge' | 'agent'

if (currentUser._id === profileUser._id) {
  // Own profile — never show rating UI
} else if (!canRate(currentUserType, profileUserType)) {
  // Not a valid pair — don't show rating UI
} else {
  // Show rating UI (stars + comment input)
}
```

**Note:** Always implement this check client-side for UX, but the backend independently validates and rejects invalid pairs. The client-side check prevents wasted API calls and provides a cleaner user experience.

---

## Notifications

When a rating is created, the backend sends a push notification to the target user:

| Rater → Target | Notification Title | Notification Body |
|---|---|---|
| Client → Lounge | "New Rating" | "{name} rated your lounge {score}/5" |
| Client → Agent | "New Rating" | "{name} rated you {score}/5" |
| Agent → Lounge | "New Rating" | "{name} rated you {score}/5" |
| Lounge → Agent | "New Rating" | "{name} rated you {score}/5" |

Frontend should subscribe to real-time notification events to show toast/banner notifications when a new rating is received.

---

## Swagger / OpenAPI

Full API specification is available at:
- **Standalone:** `swagger/ratings.yaml`
- **Combined:** `swagger.yaml` (search for `RATINGS` section)

---

## Summary of Changes (from Client-Only to Multi-Type)

| Aspect | Before | After |
|---|---|---|
| Rater types | Client only | Client, Lounge, Agent |
| Target types | Lounge only | Lounge, Agent |
| Unique constraint | `{clientId, loungeId}` | `{raterId, targetId}` |
| DTO field | `loungeId` | `targetId` |
| Route path (GET list) | `/v1/ratings/lounge/:loungeId` | `/v1/ratings/target/:targetId` |
| Route path (DELETE) | `/v1/ratings/:loungeId` | `/v1/ratings/:targetId` |
| Route path (GET mine) | `/v1/ratings/me/:loungeId` | `/v1/ratings/me/:targetId` |
| Write auth middleware | `clientMiddleware` | `adminOrLoungeOrClientOrAgentMiddleware` |
| Aggregation | `refreshLoungeSummary` | `refreshTargetSummary` (generic) |
| Notifications | `notifyLoungeRated` only | Context-aware (3 notification types) |
