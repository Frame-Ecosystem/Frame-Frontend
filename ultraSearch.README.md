# UltraSearch Feature — Frontend Implementation Guide

> **Prompt for the Frontend Agent**  
> Use this document to implement the UltraSearch UI — a unified global search
> experience modelled after Instagram / Facebook search.

---

## 1. Overview

UltraSearch lets authenticated users search the entire platform from one input.
Results are returned **grouped by content type** so the UI can render each
section in a native-feeling card/carousel layout.

**Endpoint:** `GET /v1/search`

| Parameter | Type   | Default | Description                                        |
|-----------|--------|---------|----------------------------------------------------|
| `q`       | string | —       | Search query (required, min 1 char)                |
| `type`    | string | `all`   | Scope: `all`, `users`, `lounges`, `posts`, `reels`, `products`, `stores`, `hashtags`, `services` |

**Auth:** Bearer JWT token required.  
**Rate limit:** 60 requests / 15 minutes per user.

---

## 2. Response Shape (type=all)

```json
{
  "data": {
    "query": "hair",
    "type": "all",
    "users": {
      "data": [
        {
          "_id": "...",
          "type": "client",
          "firstName": "Sarah",
          "lastName": "M.",
          "profileImage": { "url": "...", "publicId": "..." },
          "bio": "Hair stylist & colour specialist",
          "followersCount": 1240
        }
      ],
      "total": 3
    },
    "lounges": {
      "data": [
        {
          "_id": "...",
          "loungeTitle": "Glamour Hair Lounge",
          "profileImage": { "url": "...", "publicId": "..." },
          "bio": "Premium hair care services",
          "averageRating": 4.7,
          "followersCount": 8900,
          "location": { "address": "Algiers", "placeName": "Hydra" }
        }
      ],
      "total": 5
    },
    "posts": {
      "data": [
        {
          "_id": "...",
          "contentType": "post",
          "authorId": {
            "_id": "...",
            "firstName": "Sarah",
            "lastName": "M.",
            "profileImage": { "url": "..." },
            "type": "client"
          },
          "text": "New hair colour trend this summer 🔥",
          "media": [{"url": "...", "publicId": "..."}],
          "hashtags": ["hair", "haircolor"],
          "likeCount": 234,
          "commentCount": 12,
          "isLiked": false,
          "isSaved": false,
          "createdAt": "2026-06-30T12:00:00Z"
        }
      ],
      "total": 12
    },
    "reels": { "data": [...], "total": 4 },
    "products": {
      "data": [
        {
          "_id": "...",
          "name": "Argan Oil Shampoo",
          "slug": "argan-oil-shampoo",
          "price": 2500,
          "currency": "DZD",
          "images": [{"url": "...", "publicId": "...", "isPrimary": true}],
          "stats": { "averageRating": 4.5, "ratingCount": 89, "totalSold": 340 },
          "storeId": { "_id": "...", "name": "Beauty Store", "slug": "beauty-store" },
          "createdAt": "2026-06-01T10:00:00Z"
        }
      ],
      "total": 8
    },
    "stores": {
      "data": [
        {
          "_id": "...",
          "name": "Beauty Plus",
          "slug": "beauty-plus",
          "description": "Premium beauty products",
          "logo": { "url": "...", "publicId": "..." },
          "category": "cosmetics",
          "isVerified": true,
          "stats": { "averageRating": 4.3, "totalProducts": 56 },
          "location": { "city": "Algiers", "address": "123 Rue Didouche" }
        }
      ],
      "total": 2
    },
    "hashtags": {
      "data": [
        { "_id": "...", "name": "hair", "postCount": 1520 },
        { "_id": "...", "name": "haircolor", "postCount": 890 }
      ],
      "total": 6
    },
    "services": {
      "data": [
        {
          "_id": "...",
          "name": "Hair Colouring",
          "description": "Professional hair colouring",
          "categoryId": { "_id": "...", "name": "Hair Services" }
        }
      ],
      "total": 3
    }
  },
  "message": "Search completed"
}
```

> When `type` is scoped (e.g. `?type=users`), only that section is returned.

---

## 3. UI / UX Behaviour

### 3.1 Search Input
- **Location:** Top of the main screen / header (like Instagram).
- **Behaviour:**
  - Clicking the search bar navigates to a dedicated search screen.
  - As the user types, debounce 300–400ms then fire `GET /v1/search?q=...`.
  - When `type=all`, render sections as horizontally scrollable rows with a
    "See all" link that navigates to `?type=<section>`.

### 3.2 Section Rendering

| Section    | Card Style                                      | Primary Action          | Secondary Action     |
|------------|-------------------------------------------------|-------------------------|----------------------|
| **Users**  | Circular avatar + full name + "X followers"     | Tap → Profile screen    | Follow button        |
| **Lounges**| Circular avatar + lounge name + ⭐ rating       | Tap → Lounge profile    | Follow button        |
| **Posts**  | Thumbnail grid (1–4 images)                     | Tap → Post detail       | Like / Save icons    |
| **Reels**  | Vertical video thumbnail (9:16)                 | Tap → Reel player       | Like / Save icons    |
| **Products**| Product card (image + name + price + store)    | Tap → Product detail    | Add to cart          |
| **Stores** | Store card (logo + name + rating + city)        | Tap → Store page        | —                    |
| **Hashtags**| Row: `#name` + "X posts"                      | Tap → Hashtag feed      | —                    |
| **Services**| Row: name + category                           | Tap → Service detail    | Book now             |

### 3.3 States

| State      | Behaviour                                                    |
|------------|--------------------------------------------------------------|
| **Empty**  | Placeholder: "Search for people, posts, products and more"   |
| **Typing** | Show recent searches (stored locally) as the user types      |
| **Loading**| Skeleton shimmer per section                                 |
| **Results**| Render sections; empty sections are **hidden**.              |
| **Error**  | Show inline error toast.                                     |
| **No results**| "No results found" with suggestion to try different terms |

### 3.4 Filters / Tabs
- Show horizontal filter chips below the search bar:
  ```
  [All] [Users] [Lounges] [Posts] [Reels] [Products] [Stores] [#Hashtags] [Services]
  ```
- Tapping a chip changes `type` parameter and refetches.

### 3.5 Keyboard & UX
- **Debounce:** 350ms
- **Min query length:** 2 characters
- **Clear button:** Show an `X` icon in the search bar when text is present.
- **Cancel:** Show "Cancel" text to dismiss search.

---

## 4. TypeScript Types (for reference)

```typescript
// Provided by the backend — create matching frontend types

type SearchCategory = 'all' | 'users' | 'lounges' | 'posts' | 'reels'
  | 'products' | 'stores' | 'hashtags' | 'services';

interface SearchResponse {
  data: {
    query: string;
    type: SearchCategory;
    users?:      { data: SearchUser[]; total: number };
    lounges?:    { data: SearchLounge[]; total: number };
    posts?:      { data: SearchPost[]; total: number };
    reels?:      { data: SearchReel[]; total: number };
    products?:   { data: SearchProduct[]; total: number };
    stores?:     { data: SearchStore[]; total: number };
    hashtags?:   { data: SearchHashtag[]; total: number };
    services?:   { data: SearchService[]; total: number };
  };
  message: string;
}

interface SearchUser {
  _id: string;
  type: 'client' | 'agent';
  firstName?: string;
  lastName?: string;
  agentName?: string;
  profileImage?: { url?: string; publicId?: string };
  bio?: string;
  location?: { address?: string; placeName?: string };
  followersCount?: number;
}

interface SearchLounge {
  _id: string;
  loungeTitle?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: { url?: string; publicId?: string };
  bio?: string;
  location?: { address?: string; placeName?: string };
  averageRating?: number;
  followersCount?: number;
}

interface SearchPost {
  _id: string;
  contentType: 'post';
  authorId: { _id: string; firstName?: string; lastName?: string; loungeTitle?: string; profileImage?: { url?: string }; type?: string };
  text?: string;
  media?: Array<{ url: string; publicId: string }>;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

interface SearchReel {
  _id: string;
  contentType: 'reel';
  authorId: { /* same as SearchPost.authorId */ };
  caption?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  images: Array<{ url: string; publicId: string; isPrimary: boolean }>;
  stats: { averageRating: number; ratingCount: number; totalSold: number };
  storeId: { _id: string; name: string; slug: string };
  tags: string[];
  createdAt: string;
}

interface SearchStore {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url?: string; publicId?: string };
  category: string;
  badge: string;
  isVerified: boolean;
  stats: { averageRating: number; totalProducts: number };
  location?: { city?: string; address?: string };
  createdAt: string;
}

interface SearchHashtag {
  _id: string;
  name: string;
  postCount: number;
}

interface SearchService {
  _id: string;
  name: string;
  description?: string;
  categoryId: { _id: string; name: string };
}
```

---

## 5. API Details

- **Auth:** `Authorization: Bearer <jwt>` header.
- **Rate limit:** 60 requests / 15 min. Handle 429 responses gracefully.
- **Base URL:** `http://<host>:<port>/v1`
- **Swagger:** Available at `/api-docs` in non-production.
- **CORS:** The API handles CORS; no special headers needed.

---

## 6. Search Indexes (Backend — for reference)

The backend uses MongoDB regex queries with proper indexes on:

| Collection | Indexed Fields                |
|------------|-------------------------------|
| users      | `firstName`, `lastName`, `agentName`, `bio`, `loungeTitle`, `location.placeName` |
| posts      | `text`, `hashtags`            |
| reels      | `caption`, `hashtags`         |
| products   | `name`, `description`, `tags` |
| stores     | `name`, `description`, `location.city` |
| hashtags   | `name`                        |
| services   | `name`, `description`         |

---

## 7. Recommended Component Tree

```
SearchScreen
├── SearchBar (text input + clear + cancel)
├── FilterChips (horizontal scroll of SearchCategory)
├── RecentSearches (local storage, shown when query is empty)
│   └── RecentSearchItem
├── LoadingState (skeleton per section)
├── EmptyQueryState ("Search for people, posts, products and more")
├── NoResultsState ("No results for 'xyz'")
└── SearchResults (ScrollView)
    ├── UserSection (horizontal row, "See all")
    │   └── UserCard (avatar + name + followers + follow btn)
    ├── LoungeSection
    │   └── LoungeCard (avatar + name + rating + followers)
    ├── PostSection
    │   └── PostCard (thumbnail(s) + text preview + like/save)
    ├── ReelSection
    │   └── ReelCard (video thumbnail + caption)
    ├── ProductSection
    │   └── ProductCard (image + name + price + store)
    ├── StoreSection
    │   └── StoreCard (logo + name + rating + city)
    ├── HashtagSection
    │   └── HashtagRow (#name + post count)
    └── ServiceSection
        └── ServiceRow (name + category)
```

---

## 8. Local Storage: Recent Searches

Store the last 10 search queries in `AsyncStorage` / `localStorage`:

```typescript
const RECENT_SEARCHES_KEY = 'ultraSearch_recent';

async function getRecentSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function addRecentSearch(query: string): Promise<void> {
  const recent = await getRecentSearches();
  const updated = [query, ...recent.filter(s => s !== query)].slice(0, 10);
  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}
```

---

## 9. Pagination & Infinite Scroll

When viewing a scoped `type` (e.g. `?type=posts`), the backend returns
`total` in each section. For full pagination support on single-type search
the frontend should implement cursor-based or offset pagination.

For `type=all`, the backend returns the top 10 results per section. The "See all"
link navigates to a dedicated screen that loads more results for that single type.

---

## 10. Error Handling

| Code | Meaning                    | Frontend Action               |
|------|----------------------------|-------------------------------|
| 400  | Missing or invalid query   | Show validation error         |
| 401  | JWT expired / invalid      | Redirect to login             |
| 429  | Rate limit exceeded        | Show "Too many searches"      |
| 5xx  | Server error               | Generic error toast           |

---

*End of frontend prompt — implement the UI according to the shapes and behaviours
described above.*
