# Bookings System

Booking creation/management and walk-in queue management for beauty salons and barbershops.

## Architecture

```
types → service → hook (React Query) → components (card / list / wizard / queue)
```

## Modules

| Module                        | Description                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `types/booking.ts`            | `Booking`, `BookingStatus` (6 states), `CreateBookingInput`, `BookingStats`, error messages |
| `types/queue.ts`              | `QueuePerson`, `Queue`, `QueuePersonStatus` (4 states), `AddPersonToQueueInput`             |
| `services/booking.service.ts` | `BookingService` — create, getAll, getHistory, getById, cancel, update                      |
| `services/queue.service.ts`   | `QueueService` — agent/lounge queues, add/update/remove people                              |

## Hooks

| Hook       | Purpose                                                        |
| ---------- | -------------------------------------------------------------- |
| `useQueue` | Queue data fetching and mutations (add, update status, remove) |

## Components

### Booking Card (`components/bookings/card/`)

Individual booking display with actions, agent info, location, services list, status badge, cancel dialog.

### Booking List (`components/bookings/list/`)

Booking list with history view and header controls.

### Booking Wizard (`components/bookings/wizard/`)

Multi-step booking creation — agent selection → datetime picker → preview/confirm.

### Queue (`components/queue/`)

Real-time queue display — agent tabs, queue items with countdown timers, stats, add/book-from-queue dialogs.

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_systems/user` — User, Lounge, Agent types
- `@/app/_systems/service-catalog` — LoungeServiceItem, Service types
