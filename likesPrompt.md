# Likes Module — Frontend Integration Prompt

> **Purpose:** This document is the single source of truth for the frontend agent working on the Frame Beauty application. It covers every Like API endpoint, the data model, the like matrix rules, error codes, notification payloads, and recommended frontend patterns. Reference this before implementing any like/heart functionality.

---

## 1. Overview

The Likes Module lets a user **heart** (like) another user's profile. It follows a **toggle** pattern — the same request creates or removes a like. There is no separate "unlike" endpoint.

The backend enforces a **like matrix** that controls which user-type combinations are allowed. The frontend should mirror this matrix for UX (hide the heart button when a like is not possible), but the backend is the source of truth and will reject invalid pairs with `400 INVALID_LIKE_PAIR`.

Every target user document carries a denormalized `likeCount` field that is recalculated on every toggle — read this field directly from user objects in search results, profiles, or detail views; no extra API call is needed to display a count.

**Base path:** `/v1/likes`

---

## 2. Authentication & Security

| Requirement | Details |
|---|---|
| **JWT** | `Authorization: Bearer <token>` header on every request |
| **CSRF** | Write endpoints (`POST`) require a valid CSRF token via `X-CSRF-Token` header **or** `csrf-token` form field |
| **Rate limit** | `POST /v1/likes/:targetId` is limited to **30 requests per 15-minute window** per user. Exceeding returns `429` with `"Too many like requests. Please slow down."` |
| **Role access** | `POST` (toggle), `GET /me`, `GET /check/:targetId` → Client, Lounge, or Agent. `GET /target/:targetId` → any authenticated user. |

---

## 3. Like Matrix

The backend uses the following allowed pairs. Any combination not listed is rejected.

| Liker (authenticated user) | Can Like | Cannot Like |
|---|---|---|
| **Client** | Lounge, Agent | Other Clients, Admins |
| **Lounge** | Agent | Clients, other Lounges, Admins |
| **Agent** | *(nothing)* | Everyone |

**Self-likes are always rejected** regardless of type — returns `400 SELF_LIKE`.

### 3.1 Client-Side Matrix Check

Implement this helper to decide whether to show the heart button:

```typescript
// Allowed combinations — keep in sync with backend ALLOWED_LIKE_PAIRS
const ALLOWED_LIKE_PAIRS = new Set([
  'client→lounge',
  'client→agent',
  'lounge→agent',
]);

function canLike(likerType: string, targetType: string): boolean {
  return ALLOWED_LIKE_PAIRS.has(`${likerType}→${targetType}`);
}

// Usage in a profile view component:
const showHeartButton =
  currentUser._id !== profileUser._id &&            // not own profile
  canLike(currentUser.type, profileUser.type);       // matrix allows it
```

---

## 4. Endpoints

### 4.1 Toggle Like / Unlike

```
POST /v1/likes/:targetId
```

Creates a like if none exists; removes it if one does. This is the **only** write endpoint — there is no separate unlike.

**Middleware chain:** `authMiddleware` → `adminOrLoungeOrClientOrAgentMiddleware` → `csrfMiddleware` → `likeRateLimiter`

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `targetId` | path | ObjectId | yes | ID of the user to like/unlike (must be a Lounge or Agent) |

**200 Response (liked):**
```json
{
  "success": true,
  "data": { "liked": true },
  "message": "Liked"
}
```

**200 Response (unliked):**
```json
{
  "success": true,
  "data": { "liked": false },
  "message": "Unliked"
}
```

**Error responses:**

| Status | `code` | Trigger |
|---|---|---|
| 400 | `SELF_LIKE` | `targetId === userId` |
| 400 | `INVALID_LIKE_PAIR` | Matrix disallows this liker→target combo |
| 400 | `INVALID_LIKEABLE_TARGET` | Target is a Client or Admin (not lounge/agent) |
| 400 | `USER_NOT_FOUND` | Target user does not exist or is blocked |
| 400 | `INVALID_TARGET_ID` | Malformed ObjectId |
| 401 | — | Missing or invalid JWT |
| 403 | — | CSRF token missing/invalid, or role not in allowed list |
| 429 | — | Rate limit exceeded (30 / 15 min) |

---

### 4.2 Get My Likes

```
GET /v1/likes/me?page=1&limit=20
```

Returns every user (Lounges and Agents) the authenticated user has liked. Sorted newest-first. The `targetId` field is **populated** with the target's user profile summary.

| Parameter | In | Type | Default | Description |
|---|---|---|---|---|
| `page` | query | integer | 1 | Page number, min 1 |
| `limit` | query | integer | 20 | Items per page, max 50 |

**200 Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0e",
      "likerId": "665f1a2b3c4d5e6f7a8b9c0f",
      "targetId": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "firstName": "Sara",
        "lastName": "Alami",
        "loungeTitle": "Beauty Studio",
        "profileImage": {
          "url": "https://cdn.framebeauty.com/avatars/sara.jpg",
          "publicId": "avatars/sara"
        },
        "coverImage": {
          "url": "https://cdn.framebeauty.com/covers/sara-cover.jpg",
          "publicId": "covers/sara-cover"
        },
        "averageRating": 4.5,
        "ratingCount": 28,
        "likeCount": 142,
        "type": "lounge"
      },
      "likerType": "client",
      "targetType": "lounge",
      "createdAt": "2025-07-12T10:30:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

**Populated `targetId` fields:** `_id`, `firstName`, `lastName`, `loungeTitle`, `profileImage`, `coverImage`, `averageRating`, `ratingCount`, `likeCount`, `type`

---

### 4.3 Check If I Liked a Target

```
GET /v1/likes/check/:targetId
```

Returns a boolean. Use this to render a filled vs outline heart on profile pages.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `targetId` | path | ObjectId | yes | ID of the target user |

**200 Response:**
```json
{
  "success": true,
  "data": { "liked": true }
}
```

---

### 4.4 Get Likers of a Target

```
GET /v1/likes/target/:targetId?page=1&limit=20
```

Returns every user who has liked the given target. Sorted newest-first. The `likerId` field is **populated** with the liker's profile summary. Any authenticated user can call this (no role restriction).

| Parameter | In | Type | Default | Description |
|---|---|---|---|---|
| `targetId` | path | ObjectId | — | ID of the target user |
| `page` | query | integer | 1 | Page number, min 1 |
| `limit` | query | integer | 20 | Items per page, max 50 |

**200 Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0e",
      "likerId": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0f",
        "firstName": "Sara",
        "lastName": "Alami",
        "loungeTitle": "Beauty Studio",
        "profileImage": {
          "url": "https://cdn.framebeauty.com/avatars/sara.jpg",
          "publicId": "avatars/sara"
        },
        "type": "client"
      },
      "targetId": "665f1a2b3c4d5e6f7a8b9c0d",
      "likerType": "client",
      "targetType": "lounge",
      "createdAt": "2025-07-12T10:30:00.000Z"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

**Populated `likerId` fields:** `_id`, `firstName`, `lastName`, `loungeTitle`, `profileImage`, `type`

---

## 5. Data Model

### 5.1 Like Document (MongoDB)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `likerId` | ObjectId → User | The user who liked |
| `targetId` | ObjectId → User | The user who was liked |
| `likerType` | `'client' \| 'lounge' \| 'agent'` | Denormalized type of liker |
| `targetType` | `'client' \| 'lounge' \| 'agent'` | Denormalized type of target |
| `createdAt` | Date | Auto-set on creation (no `updatedAt`) |

**Unique constraint:** `{ likerId, targetId }` — one like per pair.

**Indexes:**
- `{ likerId: 1, targetId: 1 }` unique
- `{ targetId: 1, createdAt: -1 }`
- `{ likerId: 1, createdAt: -1 }`
- `{ targetId: 1, targetType: 1, createdAt: -1 }`
- `{ likerId: 1, targetType: 1, createdAt: -1 }`

### 5.2 Denormalized `likeCount` on User Documents

Every Lounge and Agent user document has a `likeCount` field (number, defaults to 0). It is automatically recalculated by the backend after every toggle. **Read this field directly** from any user object returned by other endpoints (search, profiles, booking details, etc.) — no separate API call is needed.

```typescript
// From any user object (lounge or agent):
const likes = user.likeCount; // e.g., 142
```

---

## 6. Frontend Implementation Patterns

### 6.1 Heart Button on a Profile Page

```typescript
import { useState, useEffect } from 'react';

function HeartButton({ profileUser, currentUser, csrfToken, authToken }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(profileUser.likeCount ?? 0);
  const [loading, setLoading] = useState(false);

  // Determine if heart button should be shown at all
  const isOwnProfile = currentUser._id === profileUser._id;
  const ALLOWED = new Set(['client→lounge', 'client→agent', 'lounge→agent']);
  const showHeart = !isOwnProfile && ALLOWED.has(`${currentUser.type}→${profileUser.type}`);

  // Fetch current like status on mount
  useEffect(() => {
    if (!showHeart) return;
    fetch(`/v1/likes/check/${profileUser._id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => res.json())
      .then(({ data }) => setLiked(data.liked))
      .catch(console.error);
  }, [profileUser._id, showHeart]);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/v1/likes/${profileUser._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken,
        },
      });
      const result = await res.json();
      if (result.success) {
        setLiked(result.data.liked);
        setLikeCount(prev => result.data.liked ? prev + 1 : prev - 1);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showHeart) return null;

  return (
    <button onClick={toggleLike} disabled={loading} aria-label={liked ? 'Unlike' : 'Like'}>
      {liked ? '❤️' : '🤍'} {likeCount}
    </button>
  );
}
```

### 6.2 "My Likes" List Page

```typescript
function MyLikesPage({ authToken }) {
  const [likes, setLikes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetch(`/v1/likes/me?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => res.json())
      .then(({ data, total: t }) => { setLikes(data); setTotal(t); })
      .catch(console.error);
  }, [page]);

  return (
    <div>
      <h2>My Likes ({total})</h2>
      {likes.map(like => {
        const target = like.targetId; // populated user object
        return (
          <div key={like._id}>
            <img src={target.profileImage?.url} alt="" />
            <span>{target.firstName} {target.lastName}</span>
            <span>{target.type === 'lounge' ? target.loungeTitle : ''}</span>
            <span>⭐ {target.averageRating ?? '—'} ({target.ratingCount ?? 0})</span>
            <span>❤️ {target.likeCount ?? 0}</span>
          </div>
        );
      })}
      {total > limit && <Pagination current={page} total={total} limit={limit} onChange={setPage} />}
    </div>
  );
}
```

### 6.3 "Likers" List on a Profile Page

```typescript
function LikersList({ targetId, authToken }) {
  const [likers, setLikers] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/v1/likes/target/${targetId}?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(res => res.json())
      .then(({ data, total: t }) => { setLikers(data); setTotal(t); })
      .catch(console.error);
  }, [targetId]);

  return (
    <div>
      <h3>Liked by ({total})</h3>
      {likers.map(like => {
        const user = like.likerId; // populated user object
        return (
          <div key={like._id}>
            <img src={user.profileImage?.url} alt="" />
            <span>{user.firstName} {user.lastName}</span>
            <span>{user.type}</span>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 7. Error Handling

Every error follows the standard Frame Backend shape:

```json
{
  "success": false,
  "message": "Human-readable description",
  "code": "MACHINE_READABLE_CODE"
}
```

| HTTP | `code` | Meaning | Suggested frontend action |
|---|---|---|---|
| 400 | `SELF_LIKE` | Liker is target | Hide/disable heart on own profile |
| 400 | `INVALID_LIKE_PAIR` | Matrix violation (e.g., Agent → Lounge) | Don't show heart button; fall back gracefully |
| 400 | `INVALID_LIKEABLE_TARGET` | Target is a Client or Admin | Don't show heart on non-likeable profiles |
| 400 | `USER_NOT_FOUND` | Target missing or blocked | Show "User unavailable" state |
| 400 | `INVALID_TARGET_ID` | Bad ObjectId format | Validate IDs client-side before calling |
| 401 | — | No JWT / expired | Redirect to login |
| 403 | — | CSRF invalid or role denied | Retry with fresh CSRF token or re-auth |
| 429 | — | 30 toggles / 15 min exceeded | Show "Try again later" toast; disable button briefly |

---

## 8. Notifications

On successful like creation (not on unlike), the backend sends a push notification to the target:

| Liker type | Target type | Notification title | Notification body |
|---|---|---|---|
| Client | Lounge | "New Like" | `"{likerName} liked your lounge"` |
| Client | Agent | "New Like" | `"{likerName} liked you"` |
| Lounge | Agent | "New Like" | `"{likerName} liked you"` |

Notification type identifiers:
- `social:loungeLiked` (client → lounge)
- `social:agentLiked` (client → agent, or lounge → agent)

The notification includes `actorId` (the liker), `actionUrl` (liker's profile path), and `imageUrl` (liker's profile image). Frontend should subscribe to real-time notification events to show toast/banner when received.

---

## 9. Complete Route Reference

| Method | Path | Auth roles | CSRF | Rate limit | Description |
|---|---|---|---|---|---|
| `POST` | `/v1/likes/:targetId` | Client, Lounge, Agent | **Yes** | 30 / 15 min | Toggle like/unlike |
| `GET` | `/v1/likes/me` | Client, Lounge, Agent | No | No | Paginated list of users I liked |
| `GET` | `/v1/likes/check/:targetId` | Client, Lounge, Agent | No | No | Boolean: have I liked this target? |
| `GET` | `/v1/likes/target/:targetId` | Any authenticated | No | No | Paginated list of users who liked this target |

---

## 10. Swagger / OpenAPI

- **Standalone spec:** `swagger/likes.yaml`
- **Combined spec:** `swagger.yaml` — search for the `LIKES` tag

---

## 11. Summary of Changes (Client-Only → Multi-Type)

| Aspect | Before | After |
|---|---|---|
| Liker types | Client only | Client, Lounge, Agent |
| Target types | Lounge only | Lounge, Agent |
| Unique key | `{ clientId, loungeId }` | `{ likerId, targetId }` |
| Toggle route | `POST /likes/:loungeId` | `POST /likes/:targetId` |
| Check route | `GET /likes/check/:loungeId` | `GET /likes/check/:targetId` |
| Likers route | `GET /likes/lounge/:loungeId` | `GET /likes/target/:targetId` |
| My likes route | `GET /likes/me` | *(unchanged)* |
| Write auth | `clientMiddleware` | `adminOrLoungeOrClientOrAgentMiddleware` |
| Like count | on Lounge only | on all Lounge and Agent docs |
| Notifications | lounge liked only | lounge liked + agent liked |
