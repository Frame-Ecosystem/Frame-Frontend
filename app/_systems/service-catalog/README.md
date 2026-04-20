# Service Catalog System

The service catalog system manages the beauty service hierarchy — global service categories, global services, lounge-specific service offerings, ratings, and service suggestions.

---

## Architecture Overview

```mermaid
graph TB
    subgraph ServiceCatalog["Service Catalog System"]
        subgraph Services["Services Layer"]
            SS[ServiceService]
            SCS[ServiceCategoryService]
            SSS[ServiceSuggestionsService]
            RS[RatingService]
        end

        subgraph Hooks["React Query Hooks"]
            US[useServices]
            UR[useRatings]
        end

        subgraph Constants
            SC[service.ts constants]
        end

        subgraph Components["UI Components"]
            OS[OurServices]
            SI[ServiceItem]
            SG[SuggestService]
        end
    end

    subgraph External
        API[API Client]
        QC[React Query Cache]
    end

    Services --> API
    Hooks --> Services
    Hooks --> QC
    Components --> Hooks
```

---

## Service Hierarchy

```mermaid
graph TD
    CAT[ServiceCategory] -->|1 to many| SVC[Service]
    SVC -->|1 to many| LS[LoungeServiceItem]
    LS -->|many to many| AG[Agent]
    LS -->|belongs to| LNG[Lounge]

    style CAT fill:#818cf8,stroke:#4338ca,color:#fff
    style SVC fill:#60a5fa,stroke:#1d4ed8,color:#fff
    style LS fill:#34d399,stroke:#059669,color:#fff
```

| Level | Scope | Example |
|-------|-------|---------|
| **ServiceCategory** | Global (admin-managed) | "Hair", "Nails", "Skin" |
| **Service** | Global (admin-managed) | "Haircut", "Manicure", "Facial" |
| **LoungeServiceItem** | Per-lounge customization | "Haircut" at Salon X — 25 TND, 30 min |

---

## Data Model

```mermaid
classDiagram
    class ServiceCategory {
        +string id
        +string name
        +string description
        +string createdAt
    }

    class Service {
        +string id
        +string name
        +string slug
        +string categoryId
        +number baseDuration
        +string status
        +string description
    }

    class LoungeServiceItem {
        +string _id
        +string name
        +string loungeId
        +Service serviceId
        +Agent[] agentIds
        +number price
        +number duration
        +string description
        +boolean isActive
        +Gender gender
        +Image image
    }

    class Rating {
        +string _id
        +PopulatedClient clientId
        +string loungeId
        +number score
        +string comment
        +string createdAt
    }

    class RatingSummary {
        +number averageRating
        +number ratingCount
    }

    class ServiceSuggestion {
        +string _id
        +string name
        +string description
        +number estimatedPrice
        +number estimatedDuration
        +string targetGender
        +SuggestionStatus status
        +string loungeId
        +string adminComment
    }

    ServiceCategory "1" --> "*" Service
    Service "1" --> "*" LoungeServiceItem
    LoungeServiceItem "*" --> "*" Agent : agentIds
    Rating --> RatingSummary
```

---

## Directory Structure

```
app/_systems/service-catalog/
├── index.ts                           Barrel exports
├── types/
│   ├── service.ts                     ServiceCategory, Service, LoungeServiceItem, DTOs
│   └── rating.ts                      Rating, RatingSummary, PaginatedRatings
├── hooks/
│   ├── useServices.ts                 Service & category query hooks
│   └── useRatings.ts                  Rating query & mutation hooks
├── constants/
│   └── service.ts                     Service-related constants
├── services/
│   ├── service.service.ts             Global service CRUD
│   ├── service-category.service.ts    Category CRUD
│   ├── service-suggestions.service.ts Suggestion CRUD + admin
│   └── rating.service.ts              Rating upsert + queries
└── components/
    └── services/
        ├── our-services.tsx            Lounge services display
        ├── service-item.tsx            Single service card
        ├── SuggestService.tsx          Suggestion form modal
        └── _lib/
            └── validate-suggestion.ts  Suggestion validation
```

---

## Service API Endpoints

### Service Categories (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAll` | `GET /v1/service-categories` | All categories (public) |
| `getById` | `GET /v1/service-categories/:id` | Single category |
| `create` | `POST /v1/admin/service-categories` | Create category |
| `update` | `PUT /v1/admin/service-categories/:id` | Update category |
| `delete` | `DELETE /v1/admin/service-categories/:id` | Delete category |
| `search` | `GET /v1/admin/service-categories/search?q=` | Search categories |

### Global Services (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAll` | `GET /v1/services` | All services (public) |
| `getById` | `GET /v1/services/:id` | Single service |
| `create` | `POST /v1/admin/services` | Create service |
| `update` | `PUT /v1/admin/services/:id` | Update service |
| `delete` | `DELETE /v1/admin/services/:id` | Delete service |
| `search` | `GET /v1/admin/services/search?q=` | Search services |
| `getByCategory` | `GET /v1/admin/services/category/:id` | By category |
| `bulkCreate` | `POST /v1/admin/services/bulk` | Bulk create |

### Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `upsert` | `PUT /v1/ratings` | Create or update rating |
| `remove` | `DELETE /v1/ratings/:loungeId` | Remove user's rating |
| `getLoungeRatings` | `GET /v1/ratings/lounge/:id?page&limit` | Lounge's ratings |
| `getMyRating` | `GET /v1/ratings/me/:loungeId` | User's rating for a lounge |

### Service Suggestions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `create` | `POST /v1/service-suggestions` | Submit suggestion |
| `getAll` | `GET /v1/service-suggestions` | List suggestions |
| `getById` | `GET /v1/service-suggestions/:id` | Single suggestion |
| `update` | `PUT /v1/service-suggestions/:id` | Update suggestion |
| `delete` | `DELETE /v1/service-suggestions/:id` | Delete suggestion |
| `adminReview` | `PATCH /v1/admin/service-suggestions/:id` | Admin: approve/reject |

---

## Rating Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant UI as Rating Stars
    participant RS as RatingService
    participant API as /v1/ratings
    participant QC as Query Cache

    C->>UI: Select 1-5 stars + optional comment
    UI->>RS: upsert({ loungeId, score, comment })
    RS->>API: PUT /v1/ratings
    API-->>RS: Rating object
    RS-->>QC: Invalidate lounge ratings
    Note over API: Upsert: creates new or updates existing
```

---

## Service Suggestion Flow

```mermaid
stateDiagram-v2
    [*] --> pending: Lounge submits suggestion
    pending --> rejected: Admin rejects
    pending --> implemented: Admin approves & creates service
    rejected --> [*]
    implemented --> [*]

    note right of pending
        Admin can add adminComment
    end note

    note right of implemented
        New Service auto-created
        from suggestion details
    end note
```

---

## Suggestion Validation

| Field | Rules |
|-------|-------|
| Name | Required, 2-100 characters |
| Description | Required, 10-500 characters |
| Estimated Price | Optional, positive number |
| Estimated Duration | Optional, positive integer (minutes) |
| Target Gender | Optional: "male", "female", "unisex", "kids" |

---

## Error Messages

| Constant | Codes |
|----------|-------|
| `SERVICE_CATEGORY_ERROR_MESSAGES` | `NOT_FOUND`, `ALREADY_EXISTS`, `IN_USE` |
| `SERVICE_ERROR_MESSAGES` | `NOT_FOUND`, `ALREADY_EXISTS`, `INVALID_CATEGORY` |
| `LOUNGE_SERVICE_ERROR_MESSAGES` | `NOT_FOUND`, `ALREADY_EXISTS`, `INVALID_SERVICE` |
| `SUGGESTION_ERROR_MESSAGES` | `NOT_FOUND`, `ALREADY_REVIEWED`, `INVALID_STATUS` |
| `RATING_ERROR_MESSAGES` | `NOT_FOUND`, `ALREADY_RATED`, `INVALID_SCORE` |

---

## Response Handling

All services implement flexible response parsing to handle backend variations:

```mermaid
flowchart TD
    RES[API Response] --> CHECK1{Has .data?}
    CHECK1 -->|Yes| CHECK2{.data is array?}
    CHECK1 -->|No| CHECK3{Has .services?}
    CHECK2 -->|Yes| USE_DATA[Use .data]
    CHECK2 -->|No| CHECK4{.data has .items?}
    CHECK3 -->|Yes| USE_SERVICES[Use .services]
    CHECK3 -->|No| CHECK5{Is direct array?}
    CHECK4 -->|Yes| USE_ITEMS[Use .data.items]
    CHECK5 -->|Yes| USE_DIRECT[Use response directly]
    CHECK5 -->|No| EMPTY[Return empty array]
```

All responses map `_id` → `id` for MongoDB compatibility.
