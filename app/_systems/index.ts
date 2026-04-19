// System barrel — re-exports from each system.
// NOTE: Import directly from each system's index to avoid naming conflicts.
export * from "./auth/index"
export * from "./user/index"
export * from "./feed/index"
export * from "./notifications/index"
export * from "./bookings/index"
export * from "./marketplace/index"
// service-catalog and admin not re-exported here to avoid duplicate exports
// (ServiceSuggestion, useAdminDeletePost etc. exist in multiple systems)
// Import directly: import { ... } from "@/app/_systems/admin"
// Import directly: import { ... } from "@/app/_systems/service-catalog"
