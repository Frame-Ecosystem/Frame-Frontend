# Admin System

Full admin panel for user management, system health monitoring, content moderation, and service catalog CRUD.

## Architecture

```
types → service (class instances) → hook (React Query) → component
```

## Modules

| Module                      | Description                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `types/admin.ts`            | Admin types — paginated responses, user management DTOs, system stats, moderation reports, catalog DTOs   |
| `services/admin.service.ts` | 6 service classes — UserManagement, System, Moderation, CatalogService, CatalogCategory, MarketplaceAdmin |
| `constants/navigation.ts`   | `ADMIN_NAV` — sidebar navigation config with icons, hrefs, and groups                                     |

## Services

| Service                  | Purpose                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `UserManagementService`  | List, create, update, remove, toggle-block users; session info                           |
| `SystemService`          | Dashboard stats, system health, activity logs, audit logs, session clearing, data export |
| `ModerationService`      | Hide/unhide/delete posts, reels, comments; manage reports                                |
| `CatalogServiceService`  | Service CRUD + search for the beauty catalog                                             |
| `CatalogCategoryService` | Service category CRUD                                                                    |
| `MarketplaceAdmin`       | Store approvals, product moderation, order disputes, analytics                           |

## Hooks

| Hook              | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `useAdmin`        | Admin data fetching — users, stats, system health, activity logs |
| `useAdminContent` | Content moderation mutations — hide/delete/review reports        |

## Components

| Component        | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `admin-header`   | Admin panel header bar                               |
| `admin-sidebar`  | Collapsible sidebar with navigation groups           |
| `confirm-dialog` | Reusable confirmation dialog for destructive actions |
| `data-table`     | Generic data table with sorting and pagination       |
| `stat-card`      | Dashboard statistics card                            |

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_systems/user` — Gender type
