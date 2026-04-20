# Frame Beauty

**Frame Beauty** is a child application of the [Frame Startup](https://github.com/frame-startup) ecosystem — a beauty industry platform connecting clients with salons, barbershops, and beauty product stores.

Built as a progressive web app, Frame Beauty provides social content feeds, real-time booking and queue management, a full e-commerce marketplace, and a multi-layer notification system — all within a mobile-first responsive interface.

## Tech Stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)             |
| Language  | TypeScript (strict)                            |
| UI        | React 19, Tailwind CSS v4, Radix UI, shadcn/ui |
| Data      | TanStack React Query v5                        |
| Real-time | Socket.IO                                      |
| Push      | Firebase Cloud Messaging                       |
| i18n      | Custom zero-dependency engine (EN, AR, FR, TR) |

## Quick Start

```bash
npm install
npm run dev        # http://localhost:2111 (Turbopack)
npm run build      # Production build
npm run typecheck  # tsc --noEmit
```

## Project Structure

```
app/
├── _systems/          # Domain modules (source of truth)
│   ├── admin/         # Admin panel — users, moderation, catalog, marketplace
│   ├── auth/          # Authentication — login, signup, OAuth, guards, CSRF
│   ├── bookings/      # Booking wizard + walk-in queue management
│   ├── feed/          # Social content — posts, reels, comments, likes
│   ├── marketplace/   # E-commerce — stores, products, orders, cart, wishlist
│   ├── notifications/ # 3-layer delivery — MongoDB, Socket.IO, FCM
│   ├── service-catalog/ # Beauty service catalog, categories, ratings
│   └── user/          # Profiles (client + lounge), agents, follows
│
├── _core/             # Shared infrastructure
│   ├── api/           # HTTP client with auth interceptors
│   ├── hooks/         # Shared hooks (scroll, swipe, badge)
│   ├── i18n/          # Internationalization (4 locales, RTL support)
│   ├── providers/     # React Query, theme, swipe navigation
│   └── ui/            # shadcn/ui component library (23 components)
│
├── _components/       # Mirror of _systems components (backward compat)
├── _hooks/            # Re-exports from system hooks
├── _services/         # Re-exports from system services
├── _types/            # Re-exports from system types
├── _providers/        # App-level provider re-exports
├── _i18n/             # i18n context + engine
│
├── admin/             # Admin panel pages
├── store/             # Marketplace pages (products, cart, checkout, wishlist)
├── home/              # Home feed
├── profile/           # User profile pages
├── bookings/          # Booking pages
├── notifications/     # Notification center
├── reels/             # Reels viewer
├── lounge/            # Lounge profile pages
├── settings/          # User settings
└── layout.tsx         # Root layout + provider hierarchy
```

## System Architecture

Each domain module in `_systems/` follows a consistent layered pattern:

```
types → service → hooks (React Query) → components
```

- **Types** define DTOs, entities, and enums aligned to the backend API contracts
- **Services** are singleton class instances wrapping the HTTP client
- **Hooks** provide React Query queries and mutations with optimistic updates
- **Components** are the UI layer consuming hooks

### Provider Hierarchy

```
LanguageProvider → ThemeProvider → QueryProvider → AuthProvider
  → NotificationProvider → PushNotificationProvider
    → SwipeNavigationProvider → ProgressProvider → {pages}
```

## Systems

Each system has its own README with detailed documentation:

| System                                           | Purpose                                  | README                                           |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| [Auth](app/_systems/auth/)                       | Authentication, OAuth, guards, CSRF      | [README](app/_systems/auth/README.md)            |
| [User](app/_systems/user/)                       | Profiles, agents, follows, discovery     | [README](app/_systems/user/README.md)            |
| [Feed](app/_systems/feed/)                       | Posts, reels, comments, likes, hashtags  | [README](app/_systems/feed/README.md)            |
| [Bookings](app/_systems/bookings/)               | Booking wizard, walk-in queues           | [README](app/_systems/bookings/README.md)        |
| [Service Catalog](app/_systems/service-catalog/) | Beauty services, categories, ratings     | [README](app/_systems/service-catalog/README.md) |
| [Marketplace](app/_systems/marketplace/)         | Stores, products, orders, cart, wishlist | [README](app/_systems/marketplace/README.md)     |
| [Notifications](app/_systems/notifications/)     | Real-time + push notification delivery   | [README](app/_systems/notifications/README.md)   |
| [Admin](app/_systems/admin/)                     | User mgmt, moderation, system health     | [README](app/_systems/admin/README.md)           |

## Cross-System Dependencies

```
auth ──────────→ (standalone, used by all systems)
user ──────────→ auth
feed ──────────→ user
bookings ──────→ user + service-catalog
service-catalog → user
marketplace ───→ (standalone)
notifications ─→ auth + user
admin ─────────→ all systems
```

## License

MIT
