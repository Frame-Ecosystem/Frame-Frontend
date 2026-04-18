# Admin Module — System Administration

> **Base URL:** `/v1/admin`  
> **Auth:** All endpoints require JWT authentication + admin role  
> **CSRF:** All mutation endpoints (POST/PUT/PATCH/DELETE) require CSRF token

## Architecture

```
src/
├── controllers/admin/
│   ├── userManagement.controller.ts       # User CRUD, blocking, session info
│   ├── systemServices.controller.ts       # System health, dashboard, audit logs
│   ├── contentModeration.controller.ts    # Posts/reels/comments hide/unhide/delete, reports
│   └── catalogManagement.controller.ts    # Services, categories, suggestions, lounge services, queue
├── services/admin/
│   ├── userManagement.service.ts          # User management business logic
│   ├── systemServices.service.ts          # System stats, health checks, audit
│   ├── catalogSuggestions.service.ts      # Suggestion status + auto-implementation
│   └── loungeServices.service.ts          # Lounge services bulk ops & search
└── routes/admin/
    └── admin.route.ts                     # Master route — single entry point
```

## API Endpoints

### User Management — `/v1/admin/users`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/users` | `?page=1&limit=20&search=` | List users (paginated, searchable) |
| `GET` | `/users/:id` | — | Get user by ID |
| `POST` | `/users` | `CreateUserDto` | Create new user |
| `PUT` | `/users/:id` | `UpdateUserDto` | Update user (partial) |
| `DELETE` | `/users/:id` | — | Delete user |
| `PATCH` | `/users/:id/block` | `{ isBlocked: boolean }` | Block/unblock user |
| `GET` | `/session-info` | — | Get online users & sessions |
| `GET` | `/lounges/names` | — | Get all lounge names + IDs |

#### Response Shapes

**GET /users**
```json
{
  "data": [{ "_id": "...", "email": "...", "type": "client|lounge|agent", "isBlocked": false, ... }],
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8,
  "message": "findAll"
}
```

**GET /session-info**
```json
{
  "data": [
    {
      "_id": "userId",
      "email": "user@example.com",
      "sessionTrack": { "online": true, "lastSeen": "ISO" },
      "activeSessions": 2,
      "hasMultipleSessions": true
    }
  ],
  "message": "Online users retrieved"
}
```

**GET /lounges/names**
```json
{
  "data": [{ "_id": "loungeId", "businessName": "Salon ABC" }],
  "count": 25,
  "message": "Lounge names retrieved successfully"
}
```

### CreateUserDto
```typescript
{
  email: string;         // required, valid email
  password: string;      // required, min 8 chars
  type: 'client' | 'lounge' | 'agent';  // required
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
```

### UpdateUserDto
```typescript
{
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  type?: 'client' | 'lounge' | 'agent';
  isBlocked?: boolean;
}
```

---

### System Services — `/v1/admin/system`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/system/stats` | — | Service counts by user type |
| `GET` | `/system/health` | — | System health (DB, memory, uptime) |
| `GET` | `/system/activity-log` | `?limit=100` | Recent user activity |
| `GET` | `/system/dashboard` | — | Dashboard stats (totals + new users this month) |
| `POST` | `/system/users/:userId/clear-sessions` | — | Force-clear user sessions |
| `POST` | `/system/users/:userId/reset-password` | `{ newPassword: string }` | Reset user password |
| `GET` | `/system/users/:userId/export` | — | Export all user data |
| `POST` | `/system/audit-log` | `{ action: string, details?: object }` | Create audit log entry |

#### Response Shapes

**GET /system/stats**
```json
{
  "data": {
    "totalUsers": 500,
    "clients": 350,
    "lounges": 100,
    "agents": 50
  },
  "message": "Admin services retrieved successfully"
}
```

**GET /system/health**
```json
{
  "data": {
    "database": "connected",
    "memoryUsage": { "rss": 150, "heapTotal": 80, "heapUsed": 60 },
    "uptime": 86400
  },
  "message": "System health check completed"
}
```

**GET /system/dashboard**
```json
{
  "data": {
    "totalUsers": 500,
    "totalLounges": 100,
    "totalBookings": 2000,
    "newUsersThisMonth": 45
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

---

### Content Moderation — `/v1/admin/moderation`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `PUT` | `/moderation/posts/:postId/hide` | — | Hide a post |
| `PUT` | `/moderation/posts/:postId/unhide` | — | Unhide a post |
| `DELETE` | `/moderation/posts/:postId` | — | Delete post (admin) |
| `PUT` | `/moderation/reels/:reelId/hide` | — | Hide a reel |
| `PUT` | `/moderation/reels/:reelId/unhide` | — | Unhide a reel |
| `DELETE` | `/moderation/reels/:reelId` | — | Delete reel (admin) |
| `PUT` | `/moderation/comments/:commentId/hide` | — | Hide a comment |
| `PUT` | `/moderation/comments/:commentId/unhide` | — | Unhide a comment |
| `DELETE` | `/moderation/comments/:commentId` | — | Delete comment (admin) |
| `GET` | `/moderation/reports` | `?status=pending&page=1&limit=20` | List reports |
| `PUT` | `/moderation/reports/:reportId` | `ReviewReportDto` | Review a report |

#### ReviewReportDto
```typescript
{
  status: 'reviewed' | 'dismissed' | 'action_taken';
  adminNote?: string;
}
```

#### Response Shapes

**GET /moderation/reports**
```json
{
  "data": [{ "_id": "...", "reporter": {...}, "targetType": "post", "targetId": "...", "reason": "...", "status": "pending" }],
  "pagination": { "total": 30, "page": 1, "limit": 20 },
  "message": "Reports retrieved"
}
```

---

### Catalog — Services CRUD — `/v1/admin/services`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/services` | `?page=1&limit=20` | List services (paginated) |
| `GET` | `/services/search` | `?q=haircut` | Search services |
| `GET` | `/services/category/:categoryId` | — | Services by category |
| `GET` | `/services/:serviceId` | — | Get service by ID |
| `POST` | `/services` | `CreateServiceDto` | Create service |
| `POST` | `/services/bulk` | `CreateServiceDto[]` | Bulk create services |
| `PUT` | `/services/:serviceId` | `UpdateServiceDto` | Update service |
| `DELETE` | `/services/:serviceId` | — | Delete service |

#### CreateServiceDto
```typescript
{
  name: string;           // required
  categoryId: string;     // required, ObjectId
  description?: string;
}
```

---

### Catalog — Service Categories — `/v1/admin/service-categories`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/service-categories` | — | List all categories |
| `GET` | `/service-categories/search` | `?q=hair` | Search categories |
| `GET` | `/service-categories/:categoryId` | — | Get category by ID |
| `POST` | `/service-categories` | `CreateServiceCategoryDto` | Create category |
| `PUT` | `/service-categories/:categoryId` | `UpdateServiceCategoryDto` | Update category |
| `DELETE` | `/service-categories/:categoryId` | — | Delete category |

#### CreateServiceCategoryDto
```typescript
{
  name: string;           // required
  description?: string;
  icon?: string;
}
```

#### UpdateServiceCategoryDto
```typescript
{
  name?: string;
  description?: string;
  icon?: string;
}
```

---

### Catalog — Service Suggestions — `/v1/admin/suggestions`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/suggestions/stats` | — | Suggestion statistics |
| `PATCH` | `/suggestions/:suggestionId/status` | `UpdateServiceSuggestionStatusDto` | Update suggestion status |
| `PATCH` | `/suggestions/:suggestionId/approve` | `AdminApproveServiceSuggestionDto` | Approve & implement suggestion |

#### UpdateServiceSuggestionStatusDto
```typescript
{
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  adminNote?: string;
  // Required when status = 'implemented':
  name?: string;          // service name
  categoryId?: string;    // ObjectId
  price?: number;         // cents, non-negative integer
  duration?: number;      // 15–480 minutes
  gender?: 'men' | 'women' | 'unisex' | 'kids';
}
```

#### AdminApproveServiceSuggestionDto
```typescript
{
  status: 'implemented' | 'rejected';
  name?: string;          // required when implementing
  categoryId?: string;
  price?: number;
  duration?: number;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  adminNote?: string;
}
```

**When a suggestion is implemented**, the system automatically:
1. Creates a new service in the catalog
2. Creates a lounge service linking the new service to the suggesting lounge
3. Sends a push notification to the lounge owner

---

### Catalog — Lounge Services — `/v1/admin/lounge-services`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/lounge-services` | `?page=1&limit=20` | List lounge services (paginated) |
| `POST` | `/lounge-services/bulk` | `CreateLoungeServiceDto[]` | Bulk create lounge services |
| `GET` | `/lounge-services/search` | `?q=massage` | Search lounge services |

#### CreateLoungeServiceDto
```typescript
{
  loungeId: string;       // required, ObjectId
  serviceId: string;      // required, ObjectId
  price: number;
  duration: number;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  description?: string;
  isActive?: boolean;     // defaults to true
}
```

---

### Queue — `/v1/admin/queue`

| Method | Path | Body/Params | Description |
|--------|------|-------------|-------------|
| `POST` | `/queue/populate` | — | Populate daily queues from today's bookings |

---

## Error Response Format

All errors follow this shape:
```json
{
  "status": 400,
  "message": "Human-readable error description",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `MISSING_*` — Required field not provided
- `INVALID_*` — Field value is invalid
- `NOT_FOUND` / `*_NOT_FOUND` — Resource doesn't exist
- `CONFLICT` / `*_CONFLICT` — Duplicate resource
- `UNAUTHORIZED` — Not authenticated
- `FORBIDDEN` — Not an admin

## Authentication Headers

```
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>          // required on POST/PUT/PATCH/DELETE
Content-Type: application/json
```

## Notes for Frontend Implementation

1. **Pagination pattern** is consistent: `?page=1&limit=20` → response includes `{ data, page, limit, total, totalPages }`
2. **Sensitive fields** (password, refreshToken, etc.) are stripped from all user responses
3. **Blocking a user** immediately invalidates their sessions
4. **Content moderation** endpoints work on the same data as user-facing content — hidden content is invisible to non-admin users
5. **Suggestion approval** is a two-step flow: first review (`/status`), then approve with implementation details (`/approve`)
6. **Bulk operations** validate all items before inserting any — partial success is not supported
7. **CSRF tokens** are obtained from the auth flow and must be sent as `X-CSRF-Token` header
8. **Real-time notifications** are sent automatically on suggestion approval/rejection — no frontend action needed
