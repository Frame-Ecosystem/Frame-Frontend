# Frame — Posts & Reels Content Module: Frontend Implementation Guide

> **Purpose**: This document is a complete specification for the AI agent building the **React Native (Expo)** frontend for Frame's Posts & Reels social content module. It covers every API endpoint, request/response shape, TypeScript type, UI screen, component, and UX flow required to fully integrate with the backend.

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Architecture & Conventions](#2-architecture--conventions)
3. [TypeScript Types](#3-typescript-types)
4. [API Endpoints — Full Reference](#4-api-endpoints--full-reference)
   - 4.1 [Posts](#41-posts)
   - 4.2 [Reels](#42-reels)
   - 4.3 [Comments](#43-comments)
   - 4.4 [Feed](#44-feed)
   - 4.5 [Reports](#45-reports)
5. [Screens & Navigation](#5-screens--navigation)
6. [Component Breakdown](#6-component-breakdown)
7. [State Management & Caching](#7-state-management--caching)
8. [Media Handling](#8-media-handling)
9. [Interaction Patterns (Like / Save / Comment)](#9-interaction-patterns)
10. [Feed Logic](#10-feed-logic)
11. [Admin Moderation Panel](#11-admin-moderation-panel)
12. [Error Handling & Edge Cases](#12-error-handling--edge-cases)
13. [Rate Limits](#13-rate-limits)
14. [Accessibility & Performance](#14-accessibility--performance)

---

## 1. Module Overview

The content module adds **Instagram-style social features** to Frame:

| Feature | Description |
|---|---|
| **Posts** | Image carousel (up to 10 images) with text and hashtags. Created by clients or lounges. |
| **Reels** | Short-form video (max 60 seconds) with caption, optional thumbnail, and hashtags. |
| **Comments** | Nested comments (top-level + replies) on posts and reels. Likeable. |
| **Likes** | Toggle like on posts, reels, and comments. |
| **Saves/Bookmarks** | Toggle save on posts and reels. Saved items visible in a dedicated tab. |
| **Feed** | Following-based home feed + global explore feed + hashtag-filtered feed. |
| **Hashtags** | Searchable, tappable. Trending hashtags endpoint available. |
| **Reports** | Any user can report a post, reel, or comment. Admin reviews reports. |
| **Admin Moderation** | Admin can hide/unhide/force-delete any content and review reports. |

**Who can create content**: Both `client` and `lounge` user types.

---

## 2. Architecture & Conventions

### Backend

- **Base URL**: `http://<host>:3000` (dev) — all paths start with `/v1/`
- **Auth**: Bearer JWT in `Authorization` header — every endpoint requires authentication
- **Pagination**: Query params `?page=1&limit=10` — response includes `pagination: { total, page, limit }`
- **Standard response envelope**:
  ```json
  {
    "data": { ... },
    "message": "Human-readable message",
    "pagination": { "total": 42, "page": 1, "limit": 10 }
  }
  ```
- **Error response**:
  ```json
  {
    "status": 400,
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  }
  ```

### Frontend expectations

- React Native with Expo
- Use existing API service layer / axios instance with interceptor for JWT
- Use TanStack Query (React Query) for server state
- Optimistic updates for like/save/comment interactions
- Pull-to-refresh and infinite scroll on all feed/list screens

---

## 3. TypeScript Types

Define these in `types/content.ts` (or similar):

```typescript
/* ───────── Enums ───────── */

export enum ContentType {
  POST = 'post',
  REEL = 'reel',
}

export enum AuthorType {
  CLIENT = 'client',
  LOUNGE = 'lounge',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

/* ───────── Author (populated from backend) ───────── */

export interface AuthorSummary {
  _id: string;
  firstName?: string;
  lastName?: string;
  loungeTitle?: string;
  profileImage?: string;
  type: 'client' | 'lounge';
}

/* ───────── Post ───────── */

export interface PostMedia {
  url: string;
  publicId: string;
}

export interface Post {
  _id: string;
  authorId: AuthorSummary;
  authorType: AuthorType;
  text?: string;
  media: PostMedia[];
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isHidden: boolean;
  isLiked?: boolean;   // present when user is authenticated
  isSaved?: boolean;    // present when user is authenticated
  createdAt: string;
  updatedAt: string;
}

/* ───────── Reel ───────── */

export interface Reel {
  _id: string;
  authorId: AuthorSummary;
  authorType: AuthorType;
  caption?: string;
  videoUrl: string;
  videoPublicId: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  duration: number;         // 1–60 seconds
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isHidden: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ───────── Feed Item (union discriminated by contentType) ───────── */

export type FeedItem =
  | (Post & { contentType: 'post' })
  | (Reel & { contentType: 'reel' });

/* ───────── Comment ───────── */

export interface Comment {
  _id: string;
  authorId: AuthorSummary;
  targetId: string;
  targetType: 'post' | 'reel';
  text: string;
  parentCommentId?: string | null;
  likeCount: number;
  isHidden: boolean;
  replyCount?: number;       // only on top-level comments in list
  createdAt: string;
}

/* ───────── Hashtag ───────── */

export interface Hashtag {
  _id: string;
  name: string;
  postCount: number;
}

/* ───────── Report ───────── */

export interface Report {
  _id: string;
  reporterId: AuthorSummary;
  targetId: string;
  targetType: 'post' | 'reel' | 'comment';
  reason: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
}

/* ───────── Pagination ───────── */

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  message: string;
}
```

---

## 4. API Endpoints — Full Reference

> All endpoints require `Authorization: Bearer <accessToken>` header.  
> All IDs are MongoDB ObjectId strings (24 hex chars).

### 4.1 Posts

| Method | Path | Description | Who | Request | Response |
|--------|------|-------------|-----|---------|----------|
| `POST` | `/v1/posts` | Create post | Client/Lounge | `multipart/form-data` | `{ data: Post }` |
| `GET` | `/v1/posts/:postId` | Get single post | Any auth user | — | `{ data: Post }` |
| `GET` | `/v1/posts/user/:userId` | Get user's posts | Any auth user | `?page&limit` | `{ data: Post[], pagination }` |
| `PUT` | `/v1/posts/:postId` | Update post | Owner only | JSON body | `{ data: Post }` |
| `DELETE` | `/v1/posts/:postId` | Delete own post | Owner only | — | `{ message }` |
| `POST` | `/v1/posts/:postId/like` | Toggle like | Any auth user | — | `{ data: { liked: boolean } }` |
| `POST` | `/v1/posts/:postId/save` | Toggle save | Any auth user | — | `{ data: { saved: boolean } }` |
| `PUT` | `/v1/posts/:postId/hide` | Hide post | **Admin** | — | `{ data: Post }` |
| `PUT` | `/v1/posts/:postId/unhide` | Unhide post | **Admin** | — | `{ data: Post }` |
| `DELETE` | `/v1/posts/:postId/admin` | Force delete post | **Admin** | — | `{ message }` |

#### Create Post — `POST /v1/posts`

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `media` | File[] (images) | No* | Up to 10 files. Max 10 MB each. Allowed: jpeg, png, gif, webp. |
| `text` | string | No* | Max 2200 characters. |
| `hashtags` | string[] (JSON stringified) | No | Max 10 items. Sent as JSON array string in form-data. |

> *At least one of `media` or `text` is required. An empty post returns 400.

**Example FormData construction:**
```typescript
const formData = new FormData();
formData.append('text', 'Beautiful day at the lounge ☀️');
formData.append('hashtags', JSON.stringify(['lounge', 'vibes', 'sunset']));
// Append each image
selectedImages.forEach((image, i) => {
  formData.append('media', {
    uri: image.uri,
    type: image.mimeType || 'image/jpeg',
    name: `post-image-${i}.jpg`,
  } as any);
});
```

**Response (201)**:
```json
{
  "data": {
    "_id": "665abc123...",
    "authorId": {
      "_id": "660user...",
      "firstName": "Jane",
      "lastName": "Doe",
      "profileImage": "https://r2.example.com/profiles/...",
      "type": "client"
    },
    "authorType": "client",
    "text": "Beautiful day at the lounge ☀️",
    "media": [
      { "url": "https://r2.example.com/posts/.../img-abc.jpg", "publicId": "posts/.../img-abc" }
    ],
    "hashtags": ["lounge", "vibes", "sunset"],
    "likeCount": 0,
    "commentCount": 0,
    "saveCount": 0,
    "isHidden": false,
    "createdAt": "2026-03-17T10:30:00.000Z",
    "updatedAt": "2026-03-17T10:30:00.000Z"
  },
  "message": "Post created successfully"
}
```

#### Update Post — `PUT /v1/posts/:postId`

**Content-Type**: `application/json`

```json
{
  "text": "Updated caption",
  "hashtags": ["newhashtag"]
}
```
> Note: You cannot add/remove images after creation. Only text and hashtags can be updated.

---

### 4.2 Reels

| Method | Path | Description | Who | Request | Response |
|--------|------|-------------|-----|---------|----------|
| `POST` | `/v1/reels` | Create reel | Client/Lounge | `multipart/form-data` | `{ data: Reel }` |
| `GET` | `/v1/reels/:reelId` | Get single reel | Any auth user | — | `{ data: Reel }` |
| `GET` | `/v1/reels/user/:userId` | Get user's reels | Any auth user | `?page&limit` | `{ data: Reel[], pagination }` |
| `PUT` | `/v1/reels/:reelId` | Update reel | Owner only | JSON body | `{ data: Reel }` |
| `DELETE` | `/v1/reels/:reelId` | Delete own reel | Owner only | — | `{ message }` |
| `POST` | `/v1/reels/:reelId/like` | Toggle like | Any auth user | — | `{ data: { liked: boolean } }` |
| `POST` | `/v1/reels/:reelId/save` | Toggle save | Any auth user | — | `{ data: { saved: boolean } }` |
| `PUT` | `/v1/reels/:reelId/hide` | Hide reel | **Admin** | — | `{ data: Reel }` |
| `PUT` | `/v1/reels/:reelId/unhide` | Unhide reel | **Admin** | — | `{ data: Reel }` |
| `DELETE` | `/v1/reels/:reelId/admin` | Force delete reel | **Admin** | — | `{ message }` |

#### Create Reel — `POST /v1/reels`

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `video` | File (video) | **Yes** | Max 50 MB. Allowed: mp4, quicktime, webm. |
| `thumbnail` | File (image) | No | Max 10 MB. Allowed: jpeg, png, webp. |
| `caption` | string | No | Max 2200 characters. |
| `duration` | number | **Yes** | Integer, 1–60 (seconds). |
| `hashtags` | string[] (JSON stringified) | No | Max 10 items. |

**Example FormData construction:**
```typescript
const formData = new FormData();
formData.append('video', {
  uri: videoUri,
  type: 'video/mp4',
  name: 'reel.mp4',
} as any);
if (thumbnailUri) {
  formData.append('thumbnail', {
    uri: thumbnailUri,
    type: 'image/jpeg',
    name: 'thumb.jpg',
  } as any);
}
formData.append('caption', 'Check this out!');
formData.append('duration', '15');
formData.append('hashtags', JSON.stringify(['trending', 'new']));
```

#### Update Reel — `PUT /v1/reels/:reelId`

**Content-Type**: `application/json`

```json
{
  "caption": "Updated caption",
  "hashtags": ["updated"]
}
```
> Note: Video and thumbnail cannot be changed after creation. Only caption and hashtags.

---

### 4.3 Comments

| Method | Path | Description | Who | Request | Response |
|--------|------|-------------|-----|---------|----------|
| `POST` | `/v1/comments/:targetType/:targetId` | Add comment/reply | Any auth user | JSON body | `{ data: Comment }` |
| `GET` | `/v1/comments/:targetType/:targetId` | List top-level comments | Any auth user | `?page&limit` | `{ data: Comment[], pagination }` |
| `GET` | `/v1/comments/:commentId/replies` | List replies to comment | Any auth user | `?page&limit` | `{ data: Comment[], pagination }` |
| `DELETE` | `/v1/comments/:commentId` | Delete own comment | Owner only | — | `{ message }` |
| `POST` | `/v1/comments/:commentId/like` | Toggle like on comment | Any auth user | — | `{ data: { liked: boolean } }` |
| `PUT` | `/v1/comments/:commentId/hide` | Hide comment | **Admin** | — | `{ data: Comment }` |
| `PUT` | `/v1/comments/:commentId/unhide` | Unhide comment | **Admin** | — | `{ data: Comment }` |
| `DELETE` | `/v1/comments/:commentId/admin` | Force delete comment | **Admin** | — | `{ message }` |

#### Path Parameters

- `targetType`: `"post"` or `"reel"`
- `targetId`: the ObjectId of the post or reel

#### Add Comment — `POST /v1/comments/:targetType/:targetId`

```json
{
  "text": "Love this!",
  "parentCommentId": "665comment..."    // optional — include only for replies
}
```

**Validation**:
- `text`: required, max 1000 characters
- `parentCommentId`: optional, must be a valid MongoDB ObjectId, must belong to the same target

#### List Comments Response

Each top-level comment includes a `replyCount` field:

```json
{
  "data": [
    {
      "_id": "665cmt1...",
      "authorId": { "_id": "...", "firstName": "John", "profileImage": "...", "type": "client" },
      "targetId": "665post...",
      "targetType": "post",
      "text": "Amazing photo!",
      "parentCommentId": null,
      "likeCount": 5,
      "isHidden": false,
      "replyCount": 3,
      "createdAt": "2026-03-17T10:35:00.000Z"
    }
  ],
  "pagination": { "total": 24, "page": 1, "limit": 20 },
  "message": "Comments retrieved"
}
```

#### Replies Response

```json
{
  "data": [
    {
      "_id": "665reply1...",
      "authorId": { ... },
      "text": "Thanks!",
      "parentCommentId": "665cmt1...",
      "likeCount": 1,
      "createdAt": "..."
    }
  ],
  "pagination": { "total": 3, "page": 1, "limit": 20 },
  "message": "Replies retrieved"
}
```

> **Note on deletion**: Deleting a comment also deletes all its replies. The parent content's `commentCount` is decremented by `1 + replyCount`.

---

### 4.4 Feed

| Method | Path | Description | Who | Request | Response |
|--------|------|-------------|-----|---------|----------|
| `GET` | `/v1/feed` | Following-based feed | Any auth user | `?page&limit` | `{ data: FeedItem[], pagination }` |
| `GET` | `/v1/feed/explore` | Global explore feed | Any auth user | `?page&limit` | `{ data: FeedItem[], pagination }` |
| `GET` | `/v1/feed/saved` | Saved/bookmarked content | Any auth user | `?page&limit` | `{ data: FeedItem[], pagination }` |
| `GET` | `/v1/feed/hashtag/:tag` | Hashtag-filtered feed | Any auth user | `?page&limit` | `{ data: FeedItem[], pagination }` |
| `GET` | `/v1/feed/hashtags/trending` | Trending hashtags | Any auth user | `?limit` | `{ data: Hashtag[] }` |
| `GET` | `/v1/feed/hashtags/search` | Search hashtags | Any auth user | `?q&limit` | `{ data: Hashtag[] }` |

#### Feed Item Structure

Every item in a feed response has a `contentType` discriminator:

```json
{
  "contentType": "post",       // or "reel"
  "_id": "665abc...",
  "authorId": { "_id": "...", "firstName": "...", "profileImage": "...", "type": "client" },
  "authorType": "client",
  // Post-specific fields:
  "text": "...",
  "media": [...],
  // OR Reel-specific fields:
  "videoUrl": "...",
  "thumbnailUrl": "...",
  "caption": "...",
  "duration": 15,
  // Common fields:
  "hashtags": ["sunset"],
  "likeCount": 42,
  "commentCount": 7,
  "saveCount": 3,
  "isLiked": true,
  "isSaved": false,
  "createdAt": "2026-03-17T10:30:00.000Z"
}
```

**Use `contentType` to render the correct component** (PostCard vs ReelCard).

#### Feed Sorting

| Feed | Sort Order |
|------|-----------|
| Following (`/v1/feed`) | Newest first (chronological) |
| Explore (`/v1/feed/explore`) | Engagement score (likes + comments) DESC, then recency |
| Hashtag (`/v1/feed/hashtag/:tag`) | Newest first |
| Saved (`/v1/feed/saved`) | Most recently saved first |

#### Trending Hashtags

```
GET /v1/feed/hashtags/trending?limit=20
```

Response:
```json
{
  "data": [
    { "_id": "...", "name": "sunset", "postCount": 142 },
    { "_id": "...", "name": "lounge", "postCount": 98 }
  ],
  "message": "Trending hashtags retrieved"
}
```

#### Search Hashtags

```
GET /v1/feed/hashtags/search?q=sun&limit=10
```

Returns hashtags whose name contains the query string, sorted by `postCount` descending.

---

### 4.5 Reports

| Method | Path | Description | Who | Request | Response |
|--------|------|-------------|-----|---------|----------|
| `POST` | `/v1/reports/:targetType/:targetId` | Report content | Any auth user | JSON body | `{ data: Report }` |
| `GET` | `/v1/reports` | List reports | **Admin** | `?status&page&limit` | `{ data: Report[], pagination }` |
| `PUT` | `/v1/reports/:reportId` | Review report | **Admin** | JSON body | `{ data: Report }` |

#### Create Report — `POST /v1/reports/:targetType/:targetId`

- `targetType`: `"post"`, `"reel"`, or `"comment"`
- Body: `{ "reason": "Inappropriate content" }` (max 500 chars)
- Returns 409 if user already reported the same content

#### Review Report (Admin) — `PUT /v1/reports/:reportId`

```json
{
  "status": "reviewed",        // or "dismissed"
  "adminNote": "Content removed"  // optional
}
```

---

## 5. Screens & Navigation

### Navigation Structure

```
BottomTabs
├── HomeTab
│   ├── FeedScreen (Following feed — default)
│   ├── ExploreScreen (Explore/discover feed)
│   ├── PostDetailScreen
│   ├── ReelViewScreen (fullscreen vertical video)
│   ├── CommentsSheet (bottom sheet)
│   ├── HashtagFeedScreen
│   └── UserProfileScreen (existing — add Posts/Reels tabs)
├── SearchTab (existing — add hashtag search)
├── CreateTab
│   ├── CreatePostScreen (image picker + editor)
│   └── CreateReelScreen (video recorder/picker + editor)
├── SavedTab (or inside profile)
│   └── SavedContentScreen
└── ProfileTab (existing)
    ├── MyPostsTab
    └── MyReelsTab
```

### Screen Specifications

#### 5.1 FeedScreen (Home)

- **Two sub-tabs at top**: "Following" | "Explore"
- **Following tab**: `GET /v1/feed` — content from followed users
- **Explore tab**: `GET /v1/feed/explore` — global trending content
- Each item renders as `PostCard` or `ReelCard` based on `contentType`
- Infinite scroll with pull-to-refresh
- Empty state for Following tab: "Follow users to see their posts here"

#### 5.2 PostDetailScreen

- Full post view with image carousel (swipeable)
- Author avatar + name (tappable → profile)
- Text with tappable #hashtags (→ HashtagFeedScreen)
- Like / Comment / Save action bar
- Comment count as button → opens CommentsSheet
- "time ago" timestamp
- Three-dot menu (owner: Edit, Delete | other: Report)

#### 5.3 ReelViewScreen

- **Fullscreen vertical video player** (like Instagram Reels / TikTok)
- Auto-play on focus, pause on blur
- Overlay on right side: Like (heart + count), Comment (bubble + count), Save (bookmark), Share
- Bottom overlay: Author avatar + name, caption (expandable), hashtags
- Vertical swipe to next reel (in feed context)
- Three-dot menu (owner: Edit caption, Delete | other: Report)

#### 5.4 CommentsSheet (Bottom Sheet)

- Opens as a bottom sheet over any screen
- Header: "Comments (count)" with close button
- Input field pinned at bottom with "Reply to @user" context when replying
- List of top-level comments with:
  - Author avatar + name
  - Comment text
  - Like button + like count
  - "Reply" button
  - "View N replies" expandable (loads from `GET /v1/comments/:commentId/replies`)
  - Long press: Delete (if owner) or Report
- Pagination via "Load more" or infinite scroll

#### 5.5 CreatePostScreen

- Image picker: select up to 10 images from gallery
- Image preview carousel with reorder + remove
- Text input (max 2200 chars) with character counter
- Hashtag input: either inline in text (#tag) or dedicated tag chips
- "Post" button → `POST /v1/posts` with FormData
- Loading indicator during upload
- On success: navigate to FeedScreen and prepend the new post to cache

#### 5.6 CreateReelScreen

- Video picker (gallery) or camera recorder
- Video trimmer: enforce max 60 seconds, display duration
- Optional thumbnail picker (or auto-generate from first frame)
- Caption input (max 2200 chars)
- Hashtag input
- "Share" button → `POST /v1/reels` with FormData
- Upload progress indicator (video files can be large)

#### 5.7 HashtagFeedScreen

- Header: `#tagname` with post count
- Grid or list of posts/reels filtered by hashtag
- `GET /v1/feed/hashtag/:tag`

#### 5.8 SavedContentScreen

- `GET /v1/feed/saved`
- Grid view of saved posts and reels
- Tappable → PostDetailScreen or ReelViewScreen

#### 5.9 User Profile — Posts & Reels Tabs

On existing user profile screens, add two tabs:
- **Posts tab**: Grid of user's posts → `GET /v1/posts/user/:userId`
- **Reels tab**: Grid of user's reels → `GET /v1/reels/user/:userId`

---

## 6. Component Breakdown

### Shared / Atomic

| Component | Purpose |
|-----------|---------|
| `AuthorHeader` | Avatar + name + time ago. Tappable. Used in PostCard, ReelOverlay, Comment. |
| `ActionBar` | Like / Comment / Save buttons with counts. Handles optimistic toggle. |
| `HashtagText` | Renders text with tappable `#hashtag` links. |
| `ImageCarousel` | Swipeable image gallery with dot indicator. |
| `VideoPlayer` | Expo AV or expo-video player with play/pause/mute. |
| `ContentMenu` | Three-dot options: Edit, Delete, Report (conditional on ownership). |
| `ReportModal` | Text input for reason + submit. |
| `EmptyState` | Illustration + message for empty feeds / no results. |
| `HashtagChip` | Tappable tag pill. |

### Composite

| Component | Purpose |
|-----------|---------|
| `PostCard` | Full post in feed: AuthorHeader + ImageCarousel + text + ActionBar. |
| `ReelCard` | Feed thumbnail/preview for reels in grid views. |
| `ReelPlayer` | Fullscreen reel with overlays (used in ReelViewScreen). |
| `CommentItem` | Single comment row: avatar, text, like, reply button, expandable replies. |
| `CommentInput` | Text input with send button. Shows "replying to @name" context. |
| `FeedList` | Virtualized FlatList rendering FeedItems (switches on contentType). |
| `ContentGrid` | Grid layout for profile Posts/Reels tabs and Saved screen. |
| `TrendingHashtags` | Horizontal scroll of trending hashtag chips. |
| `HashtagSearchBar` | Search input → `GET /v1/feed/hashtags/search?q=...` |

---

## 7. State Management & Caching

### React Query Keys

```typescript
// Posts
['posts', postId]                    // single post
['posts', 'user', userId]           // user's posts (paginated)

// Reels
['reels', reelId]                    // single reel
['reels', 'user', userId]           // user's reels (paginated)

// Comments
['comments', targetType, targetId]  // top-level comments
['comments', commentId, 'replies']  // replies to a comment

// Feed
['feed', 'following']               // following feed (paginated)
['feed', 'explore']                 // explore feed (paginated)
['feed', 'saved']                   // saved content (paginated)
['feed', 'hashtag', tag]            // hashtag feed (paginated)

// Hashtags
['hashtags', 'trending']
['hashtags', 'search', query]

// Reports (admin)
['reports', { status }]
```

### Optimistic Updates

For **like**, **save**, and **comment count** — update the cache immediately, rollback on error:

```typescript
// Example: Toggle like on a post
const toggleLikeMutation = useMutation({
  mutationFn: (postId: string) => api.post(`/v1/posts/${postId}/like`),
  onMutate: async (postId) => {
    await queryClient.cancelQueries(['posts', postId]);
    const previous = queryClient.getQueryData<Post>(['posts', postId]);
    if (previous) {
      queryClient.setQueryData(['posts', postId], {
        ...previous,
        isLiked: !previous.isLiked,
        likeCount: previous.isLiked ? previous.likeCount - 1 : previous.likeCount + 1,
      });
    }
    return { previous };
  },
  onError: (_err, postId, context) => {
    if (context?.previous) {
      queryClient.setQueryData(['posts', postId], context.previous);
    }
  },
});
```

Apply the same pattern for:
- `toggleSave` → update `isSaved` and `saveCount`
- `addComment` → increment `commentCount` on the parent post/reel
- `deleteComment` → decrement `commentCount`

### Cache Invalidation

| Action | Invalidate |
|--------|-----------|
| Create post/reel | `['feed', 'following']`, `['feed', 'explore']`, `['posts/reels', 'user', myId]` |
| Delete post/reel | Same as create + `['posts/reels', id]` |
| Add comment | `['comments', targetType, targetId]` |
| Delete comment | `['comments', targetType, targetId]`, parent post/reel query |
| Toggle like/save | Already handled via optimistic update (no extra invalidation needed) |

---

## 8. Media Handling

### Image Upload (Posts)

- Use `expo-image-picker` for gallery selection
- Allow multi-select up to 10 images
- Resize/compress before upload (recommended max 1920px wide, 80% quality)
- Send as `multipart/form-data` with field name `media`
- Show upload progress if possible

### Video Upload (Reels)

- Use `expo-image-picker` with `mediaTypes: 'videos'` for gallery
- Or `expo-camera` for recording
- **Max duration**: 60 seconds — enforce on client side before upload
- **Max file size**: 50 MB
- Consider compressing with `expo-video-thumbnails` or `ffmpeg-kit-react-native`
- Send as `multipart/form-data` with field name `video`
- Optional thumbnail: field name `thumbnail`
- **Show upload progress bar** — video uploads can take time on slow connections
- Send `duration` as a form field (integer seconds)

### Video Playback (Reels)

- Use `expo-av` Video component or `expo-video`
- Auto-play when in viewport, auto-pause when off-screen
- Loop short videos
- Mute by default in feeds, unmute on tap
- Show loading spinner while buffering
- Use `thumbnailUrl` as poster image while loading

### Image Display (Posts)

- Use `expo-image` (or React Native `Image`) with caching
- Carousel with page indicator dots
- Pinch-to-zoom on detail screen
- Progressive loading: show thumbnail/blur → full image

---

## 9. Interaction Patterns

### Like (Posts, Reels, Comments)

```
POST /v1/posts/:postId/like        → { liked: boolean }
POST /v1/reels/:reelId/like        → { liked: boolean }
POST /v1/comments/:commentId/like  → { liked: boolean }
```

- **Toggle** endpoint: one call to like, another call to unlike
- Animate the heart icon (scale bounce)
- **Double-tap to like** on post images and reels (Instagram pattern)
- Show brief heart overlay animation on double-tap
- Update `likeCount` optimistically

### Save/Bookmark (Posts, Reels)

```
POST /v1/posts/:postId/save  → { saved: boolean }
POST /v1/reels/:reelId/save  → { saved: boolean }
```

- Toggle endpoint
- Animate bookmark icon fill
- Saved items appear in `GET /v1/feed/saved`

### Comment

- New comment: `POST /v1/comments/post/:postId` or `POST /v1/comments/reel/:reelId`
- Reply: same endpoint with `parentCommentId` in body
- After posting, prepend to list + increment parent `commentCount`
- Swipe-to-delete on own comments (confirm dialog)

### Report

- Accessed via three-dot menu → "Report"
- Opens `ReportModal` with predefined reasons + custom text
- `POST /v1/reports/:targetType/:targetId` with `{ reason }`
- Show success toast: "Report submitted. We'll review it shortly."
- 409 error → "You've already reported this content"

---

## 10. Feed Logic

### Following Feed

- Shows posts and reels **only from users the current user follows**
- If user follows nobody → empty state: "Follow people to see their content here"
- Each item has `contentType: "post" | "reel"` to determine rendering
- Sorted by `createdAt` descending (newest first)

### Explore Feed

- Shows **all public content** from all users
- Sorted by engagement score (likeCount + commentCount) then recency
- Good place to show a grid of thumbnails (Pinterest/Instagram Explore style)
- Consider showing trending hashtags bar at top

### Hashtag Feed

- Triggered by tapping a hashtag anywhere in the app
- Shows all posts+reels tagged with that hashtag
- Header: `#tagname` with total count
- `GET /v1/feed/hashtag/:tag?page=1&limit=10`

### Hashtag Discovery

- **Trending**: `GET /v1/feed/hashtags/trending?limit=20` — show on explore screen or search
- **Search**: `GET /v1/feed/hashtags/search?q=sun&limit=10` — real-time search as user types
- Each hashtag chip shows `name` and `postCount`

---

## 11. Admin Moderation Panel

> Only visible to users with `type: "admin"`

### Admin Content Actions

Available on every post, reel, and comment viewed by an admin:

| Action | Endpoint | Effect |
|--------|----------|--------|
| Hide content | `PUT /v1/posts/:id/hide` | Content becomes invisible to non-admin users |
| Unhide content | `PUT /v1/posts/:id/unhide` | Content becomes visible again |
| Force delete | `DELETE /v1/posts/:id/admin` | Permanently removes content + media + interactions |

Same pattern for reels (`/v1/reels/:id/hide|unhide|admin`) and comments (`/v1/comments/:id/hide|unhide|admin`).

### Reports Dashboard

| Screen Element | Source |
|---------------|--------|
| Report list (filterable by status) | `GET /v1/reports?status=pending&page=1&limit=20` |
| Report detail | Shows reporter info, target content preview, reason, status |
| Review action | `PUT /v1/reports/:reportId` with `{ status: "reviewed", adminNote: "..." }` |
| Quick actions | "Dismiss Report", "Hide Content", "Delete Content" |

Workflow:
1. Admin sees list of pending reports
2. Taps a report → sees the reported content + reason
3. Takes action: Dismiss (mark as `dismissed`) or Hide/Delete the content (then mark as `reviewed`)
4. Optional: add admin note

---

## 12. Error Handling & Edge Cases

### API Error Codes

| Code | Meaning | UI Action |
|------|---------|-----------|
| `EMPTY_POST` | Post has no text and no images | Show validation message before submit |
| `VIDEO_REQUIRED` | Reel created without video | Show validation message |
| `INVALID_DURATION` | Duration < 1 or > 60 | Enforce on client side |
| `POST_NOT_FOUND` / `REEL_NOT_FOUND` | Content was deleted or hidden | Show "Content unavailable" placeholder |
| `COMMENT_NOT_FOUND` | Comment deleted | Remove from list |
| `TARGET_NOT_FOUND` | Post/reel for comment doesn't exist | Show error toast |
| `PARENT_NOT_FOUND` | Reply to deleted comment | Show error toast |
| `PARENT_MISMATCH` | Parent comment belongs to different content | Should never happen with correct UI |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Show "Slow down" toast with retry-after |
| `ALREADY_REPORTED` (409) | Duplicate report | Show "Already reported" toast |

### Edge Cases to Handle

1. **Deleted content in feed**: If a feed item was deleted by the time user taps it → handle 404 gracefully
2. **Hidden content**: Hidden items won't appear in feeds (backend filters them), but if user has a cached/stale version, handle 404
3. **Own content vs others**: Show edit/delete options only for content where `authorId._id === currentUserId`
4. **Lounge vs client authors**: Display `loungeTitle` for lounges, `firstName lastName` for clients
5. **Empty media**: A post can have text only (no images) — render as text-only card
6. **Network offline**: Queue like/save/comment actions and replay when back online (or disable buttons)
7. **Video loading states**: Show thumbnail + spinner while video buffers
8. **Large carousel**: Posts with 10 images — show page indicator, lazy-load off-screen images

---

## 13. Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| Create post/reel | 20 | 1 hour |
| Like/Save toggle | 30 | 15 minutes |
| Comment | 30 | 15 minutes |
| Report | 10 | 1 hour |
| General reads (feeds, details) | 100 | 15 minutes |

When rate limited, the API returns `429` with:
```json
{
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": "900"
}
```

Use the `retryAfter` value to show countdown or disable the action temporarily.

---

## 14. Accessibility & Performance

### Accessibility

- All images must have alt text (use post `text` or "Post image N of M")
- Video player: provide captions toggle if available
- Like/save/comment buttons: accessible labels ("Like this post", "Save this reel")
- Screen reader: announce like count changes
- Ensure sufficient color contrast on overlays (reel player has text over video)

### Performance

- **Virtualized lists**: Use `FlatList` with `windowSize`, `maxToRenderPerBatch`, `removeClippedSubviews`
- **Image caching**: Use `expo-image` with disk cache
- **Video preloading**: Preload next reel in list for smooth scrolling
- **Pagination**: Never load all content at once — use cursor/offset pagination
- **Debounce** hashtag search input (300ms)
- **Compress** images before upload (reduce upload time and storage cost)
- **Skeleton loaders**: Show content skeletons while loading feeds
- **Memoize** feed items with `React.memo` to avoid unnecessary re-renders

---

## Appendix: Quick API Cheat Sheet

```
# Posts
POST   /v1/posts                          → Create post (multipart/form-data)
GET    /v1/posts/:postId                   → Get post
GET    /v1/posts/user/:userId?page&limit   → User's posts
PUT    /v1/posts/:postId                   → Update post (JSON)
DELETE /v1/posts/:postId                   → Delete post
POST   /v1/posts/:postId/like             → Toggle like
POST   /v1/posts/:postId/save             → Toggle save

# Reels
POST   /v1/reels                          → Create reel (multipart/form-data)
GET    /v1/reels/:reelId                   → Get reel
GET    /v1/reels/user/:userId?page&limit   → User's reels
PUT    /v1/reels/:reelId                   → Update reel (JSON)
DELETE /v1/reels/:reelId                   → Delete reel
POST   /v1/reels/:reelId/like             → Toggle like
POST   /v1/reels/:reelId/save             → Toggle save

# Comments
POST   /v1/comments/:targetType/:targetId  → Add comment/reply (JSON)
GET    /v1/comments/:targetType/:targetId  → List comments
GET    /v1/comments/:commentId/replies     → List replies
DELETE /v1/comments/:commentId             → Delete comment
POST   /v1/comments/:commentId/like        → Toggle like

# Feed
GET    /v1/feed?page&limit                 → Following feed
GET    /v1/feed/explore?page&limit         → Explore feed
GET    /v1/feed/saved?page&limit           → Saved content
GET    /v1/feed/hashtag/:tag?page&limit    → Hashtag feed
GET    /v1/feed/hashtags/trending?limit    → Trending hashtags
GET    /v1/feed/hashtags/search?q&limit    → Search hashtags

# Reports
POST   /v1/reports/:targetType/:targetId   → Report content (JSON)
GET    /v1/reports?status&page&limit       → List reports (admin)
PUT    /v1/reports/:reportId               → Review report (admin)

# Admin Moderation
PUT    /v1/posts/:postId/hide              → Hide post
PUT    /v1/posts/:postId/unhide            → Unhide post
DELETE /v1/posts/:postId/admin             → Force delete post
PUT    /v1/reels/:reelId/hide              → Hide reel
PUT    /v1/reels/:reelId/unhide            → Unhide reel
DELETE /v1/reels/:reelId/admin             → Force delete reel
PUT    /v1/comments/:commentId/hide        → Hide comment
PUT    /v1/comments/:commentId/unhide      → Unhide comment
DELETE /v1/comments/:commentId/admin       → Force delete comment
```
