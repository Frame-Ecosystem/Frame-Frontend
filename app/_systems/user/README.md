# User System

User profiles (client and lounge), agent management, follow system, lounge discovery, and visitor profile viewing.

## Architecture

```
types (4) → services (5) → hooks (4) → components (4 subdirs) → lib + providers
```

## User Types

| Type   | Description                                                       |
| ------ | ----------------------------------------------------------------- |
| Client | End-user who books services, follows lounges, creates posts/reels |
| Lounge | Business profile for a beauty salon or barbershop                 |

## Domains

### Client Profiles

Client profile with stats (bookings, posts, followers), liked lounges, booking history, and ratings given.

### Lounge Profiles

Lounge profile with location, services, agents, operating hours, and social presence.

### Agents

Lounge employees — managed by lounge owners. Each agent has assigned services, availability, and stats.

### Follow System

Follow/unfollow between clients and lounges with paginated follower/following lists.

### Lounge Discovery

Public lounge browsing and visitor profile views.

## Services

| Service                     | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `client.service.ts`         | Client profile CRUD                       |
| `agent.service.ts`          | Agent CRUD (lounge employees)             |
| `follow.service.ts`         | Follow/unfollow, list followers/following |
| `lounge.service.ts`         | Lounge profile + discovery                |
| `lounge-visitor.service.ts` | Public lounge viewing                     |

## Hooks

| Hook                      | Purpose                         |
| ------------------------- | ------------------------------- |
| `useClientProfile`        | Client profile queries          |
| `useClientVisitorProfile` | Visitor view of client profiles |
| `useLoungeProfile`        | Lounge profile queries          |
| `useFollows`              | Follow queries and mutations    |

## Components

### Agents (`components/agents/`)

Agent details, creation/edit form with service assignment and image selection, agent list table.

### Clients (`components/clients/`)

Visitor profile view — bookings tab, overview tab, posts tab, profile header, stats cards.

### Lounges (`components/lounges/`)

Lounge display — location map, info display, lounge item card, popular services, service categories.

### Profile (`components/profile/`)

Account management — user info, posts tab, reels tab, session info, settings (bio, name, phone, password, logout).

## Lib

- `profile.ts` — `getProfilePath()`, `getHomePath()`, `getLoginRedirectPath()`, `isProfilePath()`

## Providers

- `AgentProvider` — React context with useReducer for agent state management (CRUD, pagination, filtering)

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_auth` — Authentication context
