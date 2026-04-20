# Service Catalog System

Service catalog for beauty salons — categories, services, lounge-specific services, user-submitted service suggestions, and ratings.

## Architecture

```
types → services (4) → hooks (2) → components → constants
```

## Domains

### Service Categories

Top-level groupings (e.g., Haircuts, Coloring, Nails). Admin-managed.

### Services

Individual beauty services within categories (e.g., "Men's Haircut", "Balayage"). Global catalog shared across all lounges.

### Lounge Services

Lounge-specific instances of catalog services — customized with price, duration, assigned agents, gender restrictions, and images.

### Service Suggestions

Users can suggest new services. Suggestions go through admin review and can be approved into the catalog.

### Ratings

Per-service ratings with star scores, text reviews, and summary aggregation.

## Services

| Service                          | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| `service.service.ts`             | Service CRUD and search                       |
| `service-category.service.ts`    | Category CRUD                                 |
| `service-suggestions.service.ts` | Suggestion submission + admin review/approval |
| `rating.service.ts`              | Submit, list, and aggregate ratings           |

## Hooks

| Hook          | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `useServices` | Service + lounge-service queries and mutations |
| `useRatings`  | Rating queries and mutations                   |

## Components

| Component        | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `our-services`   | Service listing for lounge profile pages                |
| `service-item`   | Individual service display with price, duration, agents |
| `SuggestService` | User-facing service suggestion form                     |

## Constants

- `INITIAL_SERVICE_FORM_STATE` — Default values for service creation forms
- `SERVICE_VALIDATION_RULES` — Validation constraints (name length, price range, etc.)

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_systems/user` — Gender, ProfileImage types
