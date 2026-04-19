# Frame Beauty — Content & Feed Architecture

> Living reference document for the Frame Beauty social content system.
> **Audience**: Frontend agents and developers integrating with the Frame Beauty API.
> **Last synced with backend**: April 18, 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Models](#2-data-models)
3. [API Reference — Posts](#3-api-reference--posts)
4. [API Reference — Reels](#4-api-reference--reels)
5. [API Reference — Comments](#5-api-reference--comments)
6. [API Reference — Feed](#6-api-reference--feed)
7. [API Reference — Follows](#7-api-reference--follows)
8. [API Reference — Reports](#8-api-reference--reports)
9. [API Reference — Current User Content](#9-api-reference--current-user-content)
10. [Enums & Constants](#10-enums--constants)
11. [Pagination Contract](#11-pagination-contract)
12. [Response Envelope](#12-response-envelope)
13. [Error Codes](#13-error-codes)
14. [Rate Limits](#14-rate-limits)
15. [Media Upload Specs](#15-media-upload-specs)
16. [Entity Relationship Diagram](#16-entity-relationship-diagram)

---

## 1. Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client /  │     │   Lounge    │     │   Admin     │
│   Mobile    │     │   Owner     │     │   Panel     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────┬───────┴───────────────────┘
                   │  HTTPS + JWT Bearer
                   ▼
         ┌─────────────────┐
         │   Nginx Proxy   │   (rate limiting, HSTS, headers)
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │  Express API    │
         │  ┌───────────┐  │
         │  │  Routes    │  │  → validation → auth → rate-limit → controller
         │  │  Control.  │  │  → service (business logic)
         │  │  Service   │  │  → model (Mongoose ODM)
         │  └───────────┘  │
         └────────┬────────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   MongoDB    Cloudflare   Socket.IO
   (data)     R2 (media)   (real-time)
```

### Content Types

| Type | Description | Media | Max per create |
|------|------------|-------|---------------|
| **Post** | Image-based content with text | Up to 10 images | 10 images, 10 MB each |
| **Reel** | Short-form video (1–60 sec) | 1 video + optional thumbnail | 50 MB video |

### Interaction Types

| Interaction | Applies To | Toggle? |
|-------------|-----------|---------|
| **Like** | Post, Reel, Comment | Yes — single endpoint toggles on/off |
| **Save** (bookmark) | Post, Reel | Yes — single endpoint toggles on/off |
| **Comment** | Post, Reel | No — create/delete |
| **Reply** | Comment | No — create/delete (nested 1 level) |
| **Follow** | User (client/lounge) | No — separate follow/unfollow endpoints |
| **Report** | Post, Reel, Comment | No — one report per user per target |

---

## 2. Data Models

### 2.1 Post

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `authorId` | `ObjectId` → User | ✅ | — | Creator reference |
| `authorType` | `string` enum | ✅ | — | `"client"` \| `"lounge"` |
| `text` | `string` | ❌ | `""` | Caption text (max 2200 chars) |
| `media` | `PostMedia[]` | ❌ | `[]` | Array of uploaded images |
| `media[].url` | `string` | ✅ | — | R2 public URL |
| `media[].publicId` | `string` | ✅ | — | R2 storage key |
| `hashtags` | `string[]` | ❌ | `[]` | Normalized lowercase tags (max 10) |
| `likeCount` | `number` | ❌ | `0` | Denormalized like counter |
| `commentCount` | `number` | ❌ | `0` | Denormalized comment counter |
| `saveCount` | `number` | ❌ | `0` | Denormalized save/bookmark counter |
| `isHidden` | `boolean` | ❌ | `false` | Admin moderation flag |
| `createdAt` | `Date` | auto | — | Timestamp |
| `updatedAt` | `Date` | auto | — | Timestamp |

**Indexes**: `{authorId, createdAt↓}`, `{hashtags, createdAt↓}`, `{createdAt↓}`, `{isHidden}`

### 2.2 Reel

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `authorId` | `ObjectId` → User | ✅ | — | Creator reference |
| `authorType` | `string` enum | ✅ | — | `"client"` \| `"lounge"` |
| `caption` | `string` | ❌ | `""` | Caption text (max 2200 chars) |
| `videoUrl` | `string` | ✅ | — | R2 public URL for video |
| `videoPublicId` | `string` | ✅ | — | R2 storage key for video |
| `thumbnailUrl` | `string` | ❌ | `""` | R2 public URL for thumbnail |
| `thumbnailPublicId` | `string` | ❌ | `""` | R2 storage key for thumbnail |
| `duration` | `number` | ✅ | — | Video duration in seconds (1–60) |
| `hashtags` | `string[]` | ❌ | `[]` | Normalized lowercase tags (max 10) |
| `likeCount` | `number` | ❌ | `0` | Denormalized like counter |
| `commentCount` | `number` | ❌ | `0` | Denormalized comment counter |
| `saveCount` | `number` | ❌ | `0` | Denormalized save/bookmark counter |
| `isHidden` | `boolean` | ❌ | `false` | Admin moderation flag |
| `createdAt` | `Date` | auto | — | Timestamp |
| `updatedAt` | `Date` | auto | — | Timestamp |

**Indexes**: `{authorId, createdAt↓}`, `{hashtags, createdAt↓}`, `{createdAt↓}`, `{isHidden}`

### 2.3 Comment

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `authorId` | `ObjectId` → User | ✅ | — | Comment author |
| `targetId` | `ObjectId` | ✅ | — | The post or reel being commented on |
| `targetType` | `string` enum | ✅ | — | `"post"` \| `"reel"` |
| `text` | `string` | ✅ | — | Comment body (max 1000 chars) |
| `parentCommentId` | `ObjectId` → Comment | ❌ | `null` | If set, this is a reply to another comment |
| `likeCount` | `number` | ❌ | `0` | Denormalized like counter |
| `isHidden` | `boolean` | ❌ | `false` | Admin moderation flag |
| `createdAt` | `Date` | auto | — | Timestamp |
| `updatedAt` | `Date` | auto | — | Timestamp |

**Indexes**: `{targetId, targetType, createdAt↓}`, `{parentCommentId, createdAt↑}`, `{authorId, createdAt↓}`

> **Nesting rule**: Comments support a single level of replies. A reply references a top-level comment via `parentCommentId`. Replies to replies are not supported — the parent must always be a top-level comment.

### 2.4 ContentLike

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `userId` | `ObjectId` → User | ✅ | — | User who liked |
| `targetId` | `ObjectId` | ✅ | — | Liked content ID |
| `targetType` | `string` enum | ✅ | — | `"post"` \| `"reel"` \| `"comment"` |
| `createdAt` | `Date` | auto | — | Timestamp (no updatedAt) |

**Indexes**: `{userId, targetId, targetType}` **unique**, `{targetId, targetType, createdAt↓}`, `{userId, createdAt↓}`

### 2.5 ContentSave (Bookmark)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `userId` | `ObjectId` → User | ✅ | — | User who saved/bookmarked |
| `targetId` | `ObjectId` | ✅ | — | Saved content ID |
| `targetType` | `string` enum | ✅ | — | `"post"` \| `"reel"` |
| `createdAt` | `Date` | auto | — | Timestamp (no updatedAt) |

**Indexes**: `{userId, targetId, targetType}` **unique**, `{userId, targetType, createdAt↓}`, `{targetId, targetType}`

### 2.6 Follow

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `followerId` | `ObjectId` → User | ✅ | — | User performing the follow |
| `followingId` | `ObjectId` → User | ✅ | — | User being followed |
| `followerType` | `string` enum | ✅ | — | `"client"` \| `"lounge"` |
| `followingType` | `string` enum | ✅ | — | `"client"` \| `"lounge"` |
| `createdAt` | `Date` | auto | — | Timestamp (no updatedAt) |

**Indexes**: `{followerId, followingId}` **unique**, `{followerId, createdAt↓}`, `{followingId, createdAt↓}`, `{followerId, followingType, createdAt↓}`, `{followingId, followerType, createdAt↓}`

**Allowed follow pairs**: client→client, client→lounge, lounge→client, lounge→lounge

### 2.7 Hashtag

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `name` | `string` | ✅ | — | Unique, lowercase, trimmed tag |
| `postCount` | `number` | ❌ | `0` | Number of posts + reels using this tag |
| `createdAt` | `Date` | auto | — | Timestamp (no updatedAt) |

**Indexes**: `{name}` **unique**, `{postCount↓}`

### 2.8 Report

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | `ObjectId` | auto | — | Primary key |
| `reporterId` | `ObjectId` → User | ✅ | — | User filing the report |
| `targetId` | `ObjectId` | ✅ | — | Reported content ID |
| `targetType` | `string` enum | ✅ | — | `"post"` \| `"reel"` \| `"comment"` |
| `reason` | `string` | ✅ | — | Report reason (max 500 chars) |
| `status` | `string` enum | ❌ | `"pending"` | `"pending"` \| `"reviewed"` \| `"dismissed"` |
| `adminNote` | `string` | ❌ | `""` | Admin's review note |
| `createdAt` | `Date` | auto | — | Timestamp |
| `updatedAt` | `Date` | auto | — | Timestamp |

**Indexes**: `{status, createdAt↓}`, `{targetId, targetType}`, `{reporterId, createdAt↓}`

---

## 3. API Reference — Posts

Base path: **`/v1/posts`**

All endpoints require `Authorization: Bearer <token>`.

### 3.1 Create Post

```
POST /v1/posts
Content-Type: multipart/form-data
Role: client | lounge
Rate Limit: 20 posts/hour
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `media` | `File[]` | ❌* | Up to 10 images (jpeg, png, gif, webp). Max 10 MB each |
| `text` | `string` | ❌* | Caption text, max 2200 chars |
| `hashtags` | `string[]` \| `JSON string` | ❌ | Up to 10 hashtags |

> *At least one of `media` or `text` is required.

**Response** `201`:
```json
{
  "data": {
    "_id": "664a...",
    "authorId": {
      "_id": "663b...",
      "firstName": "John",
      "lastName": "Doe",
      "loungeTitle": null,
      "profileImage": "https://...",
      "type": "client"
    },
    "authorType": "client",
    "text": "My new look ✨",
    "media": [
      { "url": "https://r2.../img1.jpg", "publicId": "posts/abc123" }
    ],
    "hashtags": ["beauty", "salon"],
    "likeCount": 0,
    "commentCount": 0,
    "saveCount": 0,
    "isHidden": false,
    "createdAt": "2026-04-18T10:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z"
  },
  "message": "Post created successfully"
}
```

### 3.2 Get Post by ID

```
GET /v1/posts/:postId
Rate Limit: general (100/15min)
```

**Response** `200`:
```json
{
  "data": {
    "_id": "664a...",
    "authorId": { "_id": "...", "firstName": "...", "lastName": "...", "loungeTitle": null, "profileImage": "...", "type": "client" },
    "authorType": "client",
    "text": "...",
    "media": [...],
    "hashtags": [...],
    "likeCount": 12,
    "commentCount": 3,
    "saveCount": 5,
    "isHidden": false,
    "isLiked": true,
    "isSaved": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Post retrieved successfully"
}
```

> `isLiked` and `isSaved` are computed for the requesting user.

### 3.3 Get User Posts (Paginated)

```
GET /v1/posts/user/:userId?page=1&limit=10
Rate Limit: general (100/15min)
```

**Response** `200`:
```json
{
  "data": [ /* array of Post objects (populated authorId) */ ],
  "pagination": { "total": 42, "page": 1, "limit": 10 },
  "message": "Posts retrieved successfully"
}
```

### 3.4 Update Post

```
PUT /v1/posts/:postId
Content-Type: application/json
Role: owner only
Rate Limit: general
```

```json
{
  "text": "Updated caption",
  "hashtags": ["newlook", "beauty"]
}
```

> Only `text` and `hashtags` can be updated. Media cannot be changed after creation.

**Response** `200`: Same shape as Create Post.

### 3.5 Delete Post

```
DELETE /v1/posts/:postId
Role: owner only
```

**Response** `200`:
```json
{ "message": "Post deleted successfully" }
```

**Side effects**: Deletes all R2 media, all likes, all saves, all comments on this post, updates hashtag counters.

### 3.6 Toggle Like

```
POST /v1/posts/:postId/like
Role: client | lounge
Rate Limit: 30/15min
```

**Response** `200`:
```json
{ "data": { "liked": true }, "message": "Post liked" }
```
or
```json
{ "data": { "liked": false }, "message": "Post unliked" }
```

### 3.7 Toggle Save (Bookmark)

```
POST /v1/posts/:postId/save
Role: client | lounge
Rate Limit: 30/15min
```

**Response** `200`:
```json
{ "data": { "saved": true }, "message": "Post saved" }
```
or
```json
{ "data": { "saved": false }, "message": "Post unsaved" }
```

### 3.8 Admin: Hide Post

```
PUT /v1/posts/:postId/hide
Role: admin only
```

**Response** `200`:
```json
{ "data": { /* post with isHidden: true */ }, "message": "Post hidden" }
```

### 3.9 Admin: Unhide Post

```
PUT /v1/posts/:postId/unhide
Role: admin only
```

**Response** `200`:
```json
{ "data": { /* post with isHidden: false */ }, "message": "Post unhidden" }
```

### 3.10 Admin: Force Delete Post

```
DELETE /v1/posts/:postId/admin
Role: admin only
```

**Response** `200`:
```json
{ "message": "Post deleted by admin" }
```

---

## 4. API Reference — Reels

Base path: **`/v1/reels`**

All endpoints require `Authorization: Bearer <token>`.

### 4.1 Create Reel

```
POST /v1/reels
Content-Type: multipart/form-data
Role: client | lounge
Rate Limit: 20 reels/hour
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | `File` | ✅ | Video file (mp4, quicktime, webm). Max 50 MB |
| `thumbnail` | `File` | ❌ | Thumbnail image (jpeg, png, webp) |
| `caption` | `string` | ❌ | Caption text, max 2200 chars |
| `duration` | `number` | ✅ | Duration in seconds (1–60) |
| `hashtags` | `string[]` \| `JSON string` | ❌ | Up to 10 hashtags |

**Response** `201`:
```json
{
  "data": {
    "_id": "664b...",
    "authorId": {
      "_id": "663b...",
      "firstName": "Studio",
      "lastName": "Elite",
      "loungeTitle": "Elite Beauty Lounge",
      "profileImage": "https://...",
      "type": "lounge"
    },
    "authorType": "lounge",
    "caption": "Quick balayage tutorial 💇‍♀️",
    "videoUrl": "https://r2.../reel.mp4",
    "videoPublicId": "reels/abc123-video",
    "thumbnailUrl": "https://r2.../thumb.jpg",
    "thumbnailPublicId": "reels/abc123-thumbnail",
    "duration": 45,
    "hashtags": ["balayage", "hairtutorial"],
    "likeCount": 0,
    "commentCount": 0,
    "saveCount": 0,
    "isHidden": false,
    "createdAt": "2026-04-18T10:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z"
  },
  "message": "Reel created successfully"
}
```

### 4.2 Get Reel by ID

```
GET /v1/reels/:reelId
Rate Limit: general (100/15min)
```

**Response** `200`:
```json
{
  "data": {
    "_id": "...",
    "authorId": { /* populated user */ },
    "videoUrl": "...",
    "thumbnailUrl": "...",
    "duration": 30,
    "isLiked": false,
    "isSaved": true,
    "likeCount": 88,
    "commentCount": 12,
    "saveCount": 34,
    ...
  },
  "message": "Reel retrieved successfully"
}
```

### 4.3 Get User Reels (Paginated)

```
GET /v1/reels/user/:userId?page=1&limit=10
Rate Limit: general
```

**Response** `200`:
```json
{
  "data": [ /* array of Reel objects */ ],
  "pagination": { "total": 15, "page": 1, "limit": 10 },
  "message": "Reels retrieved successfully"
}
```

### 4.4 Update Reel

```
PUT /v1/reels/:reelId
Content-Type: application/json
Role: owner only
Rate Limit: general
```

```json
{
  "caption": "Updated caption",
  "hashtags": ["beauty", "tutorial"]
}
```

> Only `caption` and `hashtags` can be updated. Video/thumbnail cannot be changed.

**Response** `200`: Same shape as Create Reel.

### 4.5 Delete Reel

```
DELETE /v1/reels/:reelId
Role: owner only
```

**Response** `200`:
```json
{ "message": "Reel deleted successfully" }
```

**Side effects**: Deletes video + thumbnail from R2, all likes, saves, comments, updates hashtag counters.

### 4.6 Toggle Like

```
POST /v1/reels/:reelId/like
Role: client | lounge
Rate Limit: 30/15min
```

**Response** `200`:
```json
{ "data": { "liked": true }, "message": "Reel liked" }
```

### 4.7 Toggle Save

```
POST /v1/reels/:reelId/save
Role: client | lounge
Rate Limit: 30/15min
```

**Response** `200`:
```json
{ "data": { "saved": true }, "message": "Reel saved" }
```

### 4.8 Admin: Hide Reel

```
PUT /v1/reels/:reelId/hide
Role: admin only
```

### 4.9 Admin: Unhide Reel

```
PUT /v1/reels/:reelId/unhide
Role: admin only
```

### 4.10 Admin: Force Delete Reel

```
DELETE /v1/reels/:reelId/admin
Role: admin only
```

---

## 5. API Reference — Comments

Base path: **`/v1/comments`**

All endpoints require `Authorization: Bearer <token>`.

### 5.1 Add Comment (or Reply)

```
POST /v1/comments/:targetType/:targetId
Content-Type: application/json
Role: client | lounge
Rate Limit: 30 comments/15min
```

| URL Param | Values | Description |
|-----------|--------|-------------|
| `targetType` | `"post"` \| `"reel"` | Type of content being commented on |
| `targetId` | `ObjectId` | ID of the post or reel |

**Body**:
```json
{
  "text": "Great work!",
  "parentCommentId": "664c..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | `string` | ✅ | Comment body, max 1000 chars |
| `parentCommentId` | `string` (MongoId) | ❌ | If replying to a top-level comment |

**Response** `201`:
```json
{
  "data": {
    "_id": "664c...",
    "authorId": { "_id": "...", "firstName": "...", "lastName": "...", "profileImage": "...", "type": "client" },
    "targetId": "664a...",
    "targetType": "post",
    "text": "Great work!",
    "parentCommentId": null,
    "likeCount": 0,
    "isHidden": false,
    "createdAt": "..."
  },
  "message": "Comment added successfully"
}
```

### 5.2 List Top-Level Comments

```
GET /v1/comments/:targetType/:targetId?page=1&limit=20
Rate Limit: general
```

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "664c...",
      "authorId": { /* populated */ },
      "text": "Great work!",
      "parentCommentId": null,
      "likeCount": 5,
      "replyCount": 2,
      "createdAt": "..."
    }
  ],
  "pagination": { "total": 30, "page": 1, "limit": 20 },
  "message": "Comments retrieved"
}
```

> Each top-level comment includes a computed `replyCount`.

### 5.3 List Replies to a Comment

```
GET /v1/comments/:commentId/replies?page=1&limit=20
Rate Limit: general
```

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "664d...",
      "authorId": { /* populated */ },
      "text": "Thanks!",
      "parentCommentId": "664c...",
      "likeCount": 1,
      "createdAt": "..."
    }
  ],
  "pagination": { "total": 2, "page": 1, "limit": 20 },
  "message": "Replies retrieved"
}
```

> Replies are sorted oldest-first (chronological) unlike top-level comments which are newest-first.

### 5.4 Delete Comment

```
DELETE /v1/comments/:commentId
Role: owner only
```

**Response** `200`:
```json
{ "message": "Comment deleted successfully" }
```

**Side effects**: Deletes all replies to this comment, all likes on this comment, decrements `commentCount` on the parent post/reel by (1 + reply count).

### 5.5 Toggle Like on Comment

```
POST /v1/comments/:commentId/like
Role: client | lounge
Rate Limit: 30/15min
```

**Response** `200`:
```json
{ "data": { "liked": true }, "message": "Comment liked" }
```

### 5.6 Admin: Hide Comment

```
PUT /v1/comments/:commentId/hide
Role: admin only
```

### 5.7 Admin: Unhide Comment

```
PUT /v1/comments/:commentId/unhide
Role: admin only
```

### 5.8 Admin: Force Delete Comment

```
DELETE /v1/comments/:commentId/admin
Role: admin only
```

---

## 6. API Reference — Feed

Base path: **`/v1/feed`**

All endpoints require `Authorization: Bearer <token>` and role `client | lounge`.

### 6.1 Following Feed

```
GET /v1/feed?page=1&limit=10
Rate Limit: general
```

Returns a reverse-chronological mix of posts and reels from users the current user follows.

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "664a...",
      "contentType": "post",
      "authorId": { /* populated */ },
      "text": "...",
      "media": [...],
      "likeCount": 12,
      "isLiked": true,
      "isSaved": false,
      ...
    },
    {
      "_id": "664b...",
      "contentType": "reel",
      "authorId": { /* populated */ },
      "videoUrl": "...",
      "duration": 30,
      "likeCount": 88,
      "isLiked": false,
      "isSaved": true,
      ...
    }
  ],
  "pagination": { "total": 150, "page": 1, "limit": 10 },
  "message": "Feed retrieved"
}
```

> **Important**: Each item has a `contentType` field (`"post"` or `"reel"`) so the frontend can render the correct component.

> `isLiked` and `isSaved` are computed per-item for the requesting user.

### 6.2 Explore Feed

```
GET /v1/feed/explore?page=1&limit=10
Rate Limit: general
```

Returns global content sorted by engagement (likes + comments), then recency. Same response shape as Following Feed.

### 6.3 Saved Content (Bookmarks)

```
GET /v1/feed/saved?page=1&limit=10
Rate Limit: general
```

Returns the current user's saved/bookmarked posts and reels, newest-saved-first. Each item has `isSaved: true`. Same response shape.

### 6.4 Hashtag Feed

```
GET /v1/feed/hashtag/:tag?page=1&limit=10
Rate Limit: general
```

Returns posts and reels containing the given hashtag, sorted by recency. The `:tag` param should NOT include the `#` prefix.

### 6.5 Trending Hashtags

```
GET /v1/feed/hashtags/trending?limit=20
Rate Limit: general
```

**Response** `200`:
```json
{
  "data": [
    { "_id": "...", "name": "beauty", "postCount": 342, "createdAt": "..." },
    { "_id": "...", "name": "salon", "postCount": 289, "createdAt": "..." }
  ],
  "message": "Trending hashtags retrieved"
}
```

### 6.6 Search Hashtags

```
GET /v1/feed/hashtags/search?q=beau&limit=20
Rate Limit: general
```

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| `q` | `string` | `""` | Search term (case-insensitive prefix match) |
| `limit` | `number` | `20` | Max results |

**Response** `200`: Same shape as Trending Hashtags.

---

## 7. API Reference — Follows

Base path: **`/v1/follows`**

All endpoints require `Authorization: Bearer <token>` and role `client | lounge`.

### 7.1 Follow User

```
POST /v1/follows/:targetId
Rate Limit: 30/15min
```

**Response** `201`:
```json
{ "success": true, "data": { "following": true }, "message": "User followed successfully" }
```

**Error codes**: `SELF_FOLLOW`, `USER_NOT_FOUND`, `INVALID_FOLLOW_PAIR`, `ALREADY_FOLLOWING`

### 7.2 Unfollow User

```
DELETE /v1/follows/:targetId
```

**Response** `200`:
```json
{ "success": true, "data": { "following": false }, "message": "User unfollowed successfully" }
```

**Error codes**: `SELF_FOLLOW`, `NOT_FOLLOWING`

### 7.3 Check Follow Status

```
GET /v1/follows/check/:targetId
```

**Response** `200`:
```json
{ "success": true, "data": { "following": true } }
```

### 7.4 Get Following List (Paginated)

```
GET /v1/follows/following/:userId?page=1&limit=20&type=lounge
```

| Query Param | Type | Required | Description |
|-------------|------|----------|-------------|
| `page` | `number` | ❌ | Default 1 |
| `limit` | `number` | ❌ | Default 20 |
| `type` | `string` | ❌ | Filter by `"client"` or `"lounge"` |

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "firstName": "...",
        "lastName": "...",
        "loungeTitle": "...",
        "profileImage": "...",
        "bio": "...",
        "type": "lounge"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  },
  "message": "Following list retrieved successfully"
}
```

### 7.5 Get Followers List (Paginated)

```
GET /v1/follows/followers/:userId?page=1&limit=20&type=client
```

Same query params and response shape as 7.4.

### 7.6 Get Follow Counts

```
GET /v1/follows/counts/:userId
```

**Response** `200`:
```json
{
  "success": true,
  "data": { "followersCount": 1200, "followingCount": 350 }
}
```

---

## 8. API Reference — Reports

Base path: **`/v1/reports`**

### 8.1 Create Report

```
POST /v1/reports/:targetType/:targetId
Content-Type: application/json
Role: client | lounge
Rate Limit: 10 reports/hour
```

| URL Param | Values |
|-----------|--------|
| `targetType` | `"post"` \| `"reel"` \| `"comment"` |
| `targetId` | `ObjectId` of the content |

**Body**:
```json
{ "reason": "Inappropriate content" }
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `reason` | `string` | ✅ | Max 500 chars |

**Response** `201`:
```json
{
  "data": {
    "_id": "664e...",
    "reporterId": "663b...",
    "targetId": "664a...",
    "targetType": "post",
    "reason": "Inappropriate content",
    "status": "pending",
    "adminNote": "",
    "createdAt": "..."
  },
  "message": "Report submitted successfully"
}
```

**Error codes**: `INVALID_TARGET_TYPE`, `TARGET_NOT_FOUND`, duplicate → `409 Conflict`

### 8.2 Admin: List Reports (Paginated)

```
GET /v1/reports?status=pending&page=1&limit=20
Role: admin only
Rate Limit: general
```

| Query Param | Type | Required | Description |
|-------------|------|----------|-------------|
| `status` | `string` | ❌ | Filter: `"pending"`, `"reviewed"`, `"dismissed"` |
| `page` | `number` | ❌ | Default 1 |
| `limit` | `number` | ❌ | Default 20 |

**Response** `200`:
```json
{
  "data": [
    {
      "_id": "...",
      "reporterId": { "_id": "...", "firstName": "...", ... },
      "targetId": "...",
      "targetType": "post",
      "reason": "...",
      "status": "pending",
      "adminNote": "",
      "createdAt": "..."
    }
  ],
  "pagination": { "total": 8, "page": 1, "limit": 20 },
  "message": "Reports retrieved"
}
```

### 8.3 Admin: Review Report

```
PUT /v1/reports/:reportId
Content-Type: application/json
Role: admin only
```

**Body**:
```json
{
  "status": "reviewed",
  "adminNote": "Content removed"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | `string` | ✅ | `"pending"`, `"reviewed"`, `"dismissed"` |
| `adminNote` | `string` | ❌ | Max 500 chars |

---

## 9. API Reference — Current User Content

Base path: **`/v1/me`**

These endpoints operate on the authenticated user's own content.

### 9.1 Delete My Reel

```
DELETE /v1/me/reels/:reelId
Role: authenticated (owner verified by service layer)
```

**Response** `200`:
```json
{ "message": "Reel deleted successfully" }
```

> Delegates to the same `ReelService.deleteReel` — verifies the reel belongs to the authenticated user, then deletes R2 media, likes, saves, comments, and syncs hashtags.

---

## 10. Enums & Constants

### Content Types
```typescript
enum ContentType {
  POST = 'post',
  REEL = 'reel',
}
```

### Author Types
```typescript
enum AuthorType {
  CLIENT = 'client',
  LOUNGE = 'lounge',
}
```

### Likeable Types
```typescript
type LikeableType = 'post' | 'reel' | 'comment';
```

### Report Statuses
```typescript
enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}
```

---

## 11. Pagination Contract

All paginated endpoints accept these query params:

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `page` | `number` | `1` | — | 1-indexed page number |
| `limit` | `number` | `10` or `20` | — | Items per page |

Response always includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

**Frontend pagination formula**:
- `totalPages = Math.ceil(total / limit)`
- `hasNextPage = page < totalPages`
- `hasPrevPage = page > 1`

---

## 12. Response Envelope

Every API response follows this shape:

### Success
```json
{
  "data": { ... } | [ ... ],
  "message": "Human-readable message",
  "pagination": { "total": 0, "page": 1, "limit": 10 }
}
```

> `pagination` is only present on paginated endpoints. Some follow endpoints use `"success": true` at the top level.

### Error
```json
{
  "status": 400,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

> `code` is present when the error has a specific machine-readable identifier.

---

## 13. Error Codes

| Code | HTTP | Context | Description |
|------|------|---------|-------------|
| `EMPTY_POST` | 400 | Post create | No text and no images provided |
| `VIDEO_REQUIRED` | 400 | Reel create | No video file uploaded |
| `INVALID_DURATION` | 400 | Reel create | Duration not in 1–60 range |
| `POST_NOT_FOUND` | 404 | Post | Post doesn't exist or is hidden |
| `REEL_NOT_FOUND` | 404 | Reel | Reel doesn't exist or is hidden |
| `COMMENT_NOT_FOUND` | 404 | Comment | Comment doesn't exist or is hidden |
| `TARGET_NOT_FOUND` | 404 | Comment/Report | Target post/reel doesn't exist |
| `PARENT_NOT_FOUND` | 404 | Comment reply | Parent comment doesn't exist |
| `PARENT_MISMATCH` | 400 | Comment reply | Parent comment belongs to different content |
| `HASHTAG_NOT_FOUND` | 404 | Feed | Empty hashtag after normalization |
| `REPORT_NOT_FOUND` | 404 | Report | Report doesn't exist |
| `INVALID_TARGET_TYPE` | 400 | Report | Invalid target type value |
| `SELF_FOLLOW` | 400 | Follow | Attempted to follow/unfollow self |
| `USER_NOT_FOUND` | 404 | Follow | Target user doesn't exist or is blocked |
| `INVALID_FOLLOW_PAIR` | 400 | Follow | Follow relationship not allowed between these types |
| `ALREADY_FOLLOWING` | 400 | Follow | Duplicate follow attempt |
| `NOT_FOLLOWING` | 400 | Follow | Unfollow when not following |
| — | 403 | Any | Forbidden — not the owner (no code, just message) |
| — | 409 | Report | Duplicate report for same target |
| — | 429 | Any | Rate limit exceeded |

---

## 14. Rate Limits

| Limiter | Window | Max Requests | Applies To |
|---------|--------|-------------|------------|
| **general** | 15 min | 100 | GET endpoints, updates |
| **contentCreate** | 1 hour | 20 | POST /posts, POST /reels |
| **like** | 15 min | 30 | Like/save toggles |
| **comment** | 15 min | 30 | Adding comments |
| **follow** | 15 min | 30 | Follow/unfollow |
| **report** | 1 hour | 10 | Creating reports |

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1713440400
```

---

## 15. Media Upload Specs

### Post Images

| Spec | Value |
|------|-------|
| Field name | `media` |
| Max files | 10 |
| Max size per file | 10 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Storage | Cloudflare R2 |
| Encoding | `multipart/form-data` |

### Reel Video

| Spec | Value |
|------|-------|
| Video field name | `video` |
| Thumbnail field name | `thumbnail` |
| Max video size | 50 MB |
| Video MIME types | `video/mp4`, `video/quicktime`, `video/webm` |
| Thumbnail MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Duration | 1–60 seconds (validated server-side) |
| Storage | Cloudflare R2 |

---

## 16. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│     User     │       │    Follow    │
│──────────────│       │──────────────│
│ _id          │◄──┐   │ followerId   │──► User
│ type         │   │   │ followingId  │──► User
│ firstName    │   │   │ followerType │
│ lastName     │   │   │ followingType│
│ loungeTitle  │   │   └──────────────┘
│ profileImage │   │
│ followersCount│   │
│ followingCount│   │
└──────┬───────┘   │
       │           │
       │ authorId  │
       ▼           │
┌──────────────┐   │   ┌──────────────┐
│     Post     │   │   │     Reel     │
│──────────────│   │   │──────────────│
│ _id          │   │   │ _id          │
│ authorId ────│───┘   │ authorId ────│───► User
│ authorType   │       │ authorType   │
│ text         │       │ caption      │
│ media[]      │       │ videoUrl     │
│ hashtags[]   │       │ thumbnailUrl │
│ likeCount    │       │ duration     │
│ commentCount │       │ hashtags[]   │
│ saveCount    │       │ likeCount    │
│ isHidden     │       │ commentCount │
└──────┬───────┘       │ saveCount    │
       │               │ isHidden     │
       │               └──────┬───────┘
       │                      │
       └──────────┬───────────┘
                  │ targetId + targetType
                  ▼
       ┌──────────────────┐
       │     Comment      │
       │──────────────────│
       │ _id              │
       │ authorId ────────│──► User
       │ targetId         │
       │ targetType       │    "post" | "reel"
       │ text             │
       │ parentCommentId ─│──► Comment (nullable)
       │ likeCount        │
       │ isHidden         │
       └──────────────────┘
                  │
       ┌──────────┴───────────┐
       ▼                      ▼
┌──────────────┐    ┌──────────────┐
│ ContentLike  │    │ ContentSave  │
│──────────────│    │──────────────│
│ userId ──────│►U  │ userId ──────│►User
│ targetId     │    │ targetId     │
│ targetType   │    │ targetType   │
│ "post"|"reel"│    │ "post"|"reel"│
│ |"comment"   │    └──────────────┘
└──────────────┘
                  ┌──────────────┐
                  │   Hashtag    │
                  │──────────────│
                  │ name (unique)│
                  │ postCount    │
                  └──────────────┘

                  ┌──────────────┐
                  │    Report    │
                  │──────────────│
                  │ reporterId ──│──► User
                  │ targetId     │
                  │ targetType   │
                  │ reason       │
                  │ status       │
                  │ adminNote    │
                  └──────────────┘
```

---

## Quick Reference — All Endpoints

| # | Method | Endpoint | Role | Description |
|---|--------|----------|------|-------------|
| 1 | `POST` | `/v1/posts` | client/lounge | Create post |
| 2 | `GET` | `/v1/posts/:postId` | auth'd | Get post |
| 3 | `GET` | `/v1/posts/user/:userId` | auth'd | User's posts (paginated) |
| 4 | `PUT` | `/v1/posts/:postId` | owner | Update post |
| 5 | `DELETE` | `/v1/posts/:postId` | owner | Delete post |
| 6 | `POST` | `/v1/posts/:postId/like` | client/lounge | Toggle like |
| 7 | `POST` | `/v1/posts/:postId/save` | client/lounge | Toggle save |
| 8 | `PUT` | `/v1/posts/:postId/hide` | admin | Hide post |
| 9 | `PUT` | `/v1/posts/:postId/unhide` | admin | Unhide post |
| 10 | `DELETE` | `/v1/posts/:postId/admin` | admin | Force delete post |
| 11 | `POST` | `/v1/reels` | client/lounge | Create reel |
| 12 | `GET` | `/v1/reels/:reelId` | auth'd | Get reel |
| 13 | `GET` | `/v1/reels/user/:userId` | auth'd | User's reels (paginated) |
| 14 | `PUT` | `/v1/reels/:reelId` | owner | Update reel |
| 15 | `DELETE` | `/v1/reels/:reelId` | owner | Delete reel |
| 16 | `POST` | `/v1/reels/:reelId/like` | client/lounge | Toggle like |
| 17 | `POST` | `/v1/reels/:reelId/save` | client/lounge | Toggle save |
| 18 | `PUT` | `/v1/reels/:reelId/hide` | admin | Hide reel |
| 19 | `PUT` | `/v1/reels/:reelId/unhide` | admin | Unhide reel |
| 20 | `DELETE` | `/v1/reels/:reelId/admin` | admin | Force delete reel |
| 21 | `POST` | `/v1/comments/:targetType/:targetId` | client/lounge | Add comment/reply |
| 22 | `GET` | `/v1/comments/:targetType/:targetId` | auth'd | List comments (paginated) |
| 23 | `GET` | `/v1/comments/:commentId/replies` | auth'd | List replies (paginated) |
| 24 | `DELETE` | `/v1/comments/:commentId` | owner | Delete comment |
| 25 | `POST` | `/v1/comments/:commentId/like` | client/lounge | Toggle like |
| 26 | `PUT` | `/v1/comments/:commentId/hide` | admin | Hide comment |
| 27 | `PUT` | `/v1/comments/:commentId/unhide` | admin | Unhide comment |
| 28 | `DELETE` | `/v1/comments/:commentId/admin` | admin | Force delete comment |
| 29 | `GET` | `/v1/feed` | client/lounge | Following feed |
| 30 | `GET` | `/v1/feed/explore` | client/lounge | Explore feed |
| 31 | `GET` | `/v1/feed/saved` | client/lounge | Saved bookmarks |
| 32 | `GET` | `/v1/feed/hashtag/:tag` | client/lounge | Hashtag feed |
| 33 | `GET` | `/v1/feed/hashtags/trending` | client/lounge | Trending hashtags |
| 34 | `GET` | `/v1/feed/hashtags/search` | client/lounge | Search hashtags |
| 35 | `POST` | `/v1/follows/:targetId` | client/lounge | Follow user |
| 36 | `DELETE` | `/v1/follows/:targetId` | client/lounge | Unfollow user |
| 37 | `GET` | `/v1/follows/check/:targetId` | client/lounge | Check follow status |
| 38 | `GET` | `/v1/follows/following/:userId` | client/lounge | Following list |
| 39 | `GET` | `/v1/follows/followers/:userId` | client/lounge | Followers list |
| 40 | `GET` | `/v1/follows/counts/:userId` | client/lounge | Follow counts |
| 41 | `POST` | `/v1/reports/:targetType/:targetId` | client/lounge | Report content |
| 42 | `GET` | `/v1/reports` | admin | List reports |
| 43 | `PUT` | `/v1/reports/:reportId` | admin | Review report |
| 44 | `DELETE` | `/v1/me/reels/:reelId` | auth'd (owner) | Delete own reel from profile |

**Total: 44 content & feed endpoints**

---

## Populated Author Shape

Whenever `authorId` is populated (posts, reels, comments, follow lists), the shape is:

```json
{
  "_id": "663b...",
  "firstName": "John",
  "lastName": "Doe",
  "loungeTitle": "Elite Beauty Lounge",
  "profileImage": "https://r2.../avatar.jpg",
  "type": "client"
}
```

| Field | Present for client | Present for lounge |
|-------|-------------------|-------------------|
| `firstName` | ✅ | ✅ |
| `lastName` | ✅ | ✅ |
| `loungeTitle` | `null` | ✅ lounge display name |
| `profileImage` | ✅ | ✅ |
| `type` | `"client"` | `"lounge"` |

For follow lists, `bio` is also included.

---

> **Frame Beauty** — Part of the Frame Enterprise Platform
