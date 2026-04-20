/**
 * Centralized API error handling.
 *
 * Backend (Frame Back) throws `HttpException` instances which serialize to
 *   { status, message, code? }
 * The api-client (`app/_core/api/api.ts`) re-throws as a JS `Error` with
 * the `code` field copied onto the error object. This module:
 *   1. Maps known backend `code` values to user-friendly messages.
 *   2. Exposes helpers (`getErrorMessage`, `toastError`) so callers don't
 *      duplicate fallback chains.
 *
 * Add new codes here as backend systems evolve — single source of truth.
 */

import { toast } from "sonner"

/* ── Public types ───────────────────────────────────────────────── */

export interface ApiErrorLike {
  message?: string
  code?: string
  status?: number
  /** Optional field-level errors (when backend uses VALIDATION_ERROR). */
  details?: Record<string, unknown>
}

/* ── Code → friendly message map ────────────────────────────────── */

export const API_ERROR_MESSAGES: Record<string, string> = {
  // ── Auth / Session ────────────────────────────────────────────
  AUTH_FAILURE: "Your session has expired. Please sign in again.",
  UNAUTHORIZED: "You need to sign in to do that.",
  FORBIDDEN: "You don't have permission to perform this action.",
  UNAUTHORIZED_ACCESS: "You don't have permission to perform this action.",
  INVALID_CREDENTIALS: "Wrong email or password.",
  INVALID_PASSWORD: "Incorrect password.",
  PASSWORD_MISMATCH: "Passwords don't match.",
  SAME_PASSWORD: "Your new password must be different from the current one.",
  INVALID_TOKEN: "This link is invalid or has already been used.",
  TOKEN_EXPIRED: "This link has expired. Please request a new one.",
  TOKEN_REUSE:
    "Suspicious activity detected. For your safety, all sessions were revoked — please sign in again.",
  EMAIL_EXISTS: "An account with this email already exists.",
  PHONE_EXISTS: "An account with this phone number already exists.",
  EMAIL_REQUIRED: "An email address is required.",
  DISPOSABLE_EMAIL:
    "Disposable email addresses aren't allowed. Please use a real address.",
  ACCOUNT_BLOCKED:
    "This account has been blocked. Please contact support if you think this is a mistake.",
  ACCOUNT_SUSPENDED: "This account has been suspended. Please contact support.",

  // ── Validation / Generic ──────────────────────────────────────
  VALIDATION_ERROR: "Please check the form and try again.",
  BAD_REQUEST: "That request couldn't be processed.",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields.",
  MISSING_DATA: "Some required data is missing.",
  MISSING_UPDATE_DATA: "There's nothing to update.",
  EMPTY_UPDATE: "There's nothing to update.",
  EMPTY_ARRAY: "Please add at least one item.",
  INVALID_ID_FORMAT: "That identifier doesn't look right.",
  INVALID_PAGINATION: "Pagination parameters are out of range.",
  DUPLICATE_ENTRY: "This item already exists.",
  DUPLICATE_KEY_ERROR: "This item already exists.",
  BULK_WRITE_CONFLICT:
    "Some items couldn't be saved because they conflict with existing data.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again.",

  // ── Users / Follow ────────────────────────────────────────────
  USER_NOT_FOUND: "We couldn't find that user.",
  CLIENT_NOT_FOUND: "We couldn't find that client profile.",
  AGENT_NOT_FOUND: "We couldn't find that agent.",
  AGENT_NAME_EXISTS: "An agent with that name already exists in this lounge.",
  AGENT_LOUNGE_MISMATCH: "That agent doesn't belong to this lounge.",
  AGENT_NOT_ASSIGNED: "That agent isn't assigned to this service.",
  INVALID_USER_ID: "That user identifier isn't valid.",
  INVALID_AGENT_ID: "That agent identifier isn't valid.",
  INVALID_AGENTS: "One or more agents aren't valid.",
  MISSING_AGENT_ID: "An agent identifier is required.",
  MISSING_USER_ID: "A user identifier is required.",
  NOT_LOUNGE_ACCOUNT: "Only lounge accounts can do that.",
  ALREADY_FOLLOWING: "You already follow this user.",
  NOT_FOLLOWING: "You're not following this user.",
  SELF_FOLLOW: "You can't follow yourself.",
  INVALID_FOLLOW_PAIR: "Invalid follow request.",
  AMBIGUOUS_CLIENT_VISITOR:
    "We couldn't determine the client from your request.",
  MISSING_CLIENT_OR_VISITOR: "A client or visitor must be specified.",
  INVALID_CLIENT: "That client isn't valid.",
  INVALID_CLIENT_ID: "That client identifier isn't valid.",

  // ── Lounge / Services / Rating ────────────────────────────────
  LOUNGE_NOT_FOUND: "We couldn't find that lounge.",
  INVALID_LOUNGE: "That lounge isn't valid.",
  INVALID_LOUNGE_ID: "That lounge identifier isn't valid.",
  MISSING_LOUNGE_ID: "A lounge is required.",
  SERVICE_NOT_FOUND: "We couldn't find that service.",
  SERVICE_NAME_EXISTS: "A service with that name already exists.",
  SERVICE_SIMILAR_EXISTS:
    "A very similar service already exists. Please pick it instead.",
  SERVICE_LOUNGE_MISMATCH: "That service isn't offered by this lounge.",
  MISSING_SERVICE_ID: "A service is required.",
  MISSING_SERVICE_NAME: "A service name is required.",
  INVALID_SERVICES: "One or more services aren't valid.",
  LOUNGE_SERVICE_EXISTS: "That service is already on this lounge's catalog.",
  DUPLICATE_LOUNGE_SERVICE: "This service is already in your catalog.",
  INVALID_LOUNGE_SERVICES: "One or more lounge services aren't valid.",
  INVALID_DURATION: "The duration isn't valid.",
  INVALID_GENDER: "Please select a valid gender option.",
  CATEGORY_NOT_FOUND: "We couldn't find that category.",
  CATEGORY_NAME_EXISTS: "A category with that name already exists.",
  MISSING_CATEGORY_NAME: "A category name is required.",
  MISSING_CATEGORY_ID: "A category is required.",
  INVALID_CATEGORY_ID: "Please pick a valid category.",
  INVALID_CATEGORY_ID_FORMAT: "That category identifier isn't valid.",
  RATING_NOT_FOUND: "We couldn't find that rating.",

  // ── Suggestions (service + product category) ───────────────────
  SUGGESTION_NOT_FOUND: "We couldn't find that suggestion.",
  SUGGESTION_ALREADY_EXISTS:
    "There's already a pending suggestion with that name.",
  SUGGESTION_ALREADY_IMPLEMENTED:
    "This suggestion has already been implemented and can't be changed.",
  STATUS_ALREADY_SET: "The status is already set to that value.",
  INVALID_STATUS_FOR_UPDATE: "You can only edit pending suggestions.",
  MISSING_SUGGESTION_ID: "A suggestion identifier is required.",
  MISSING_SUGGESTION_NAME: "A suggestion name is required.",
  MISSING_STATUS: "Please choose a status.",
  CATEGORY_ALREADY_EXISTS:
    "A category with that name already exists — please pick it instead.",

  // ── Marketplace (store / product / cart / order / wishlist) ───
  STORE_NOT_FOUND: "We couldn't find that store.",
  STORE_NOT_ACTIVE: "This store isn't currently accepting orders.",
  NO_STORE: "You don't have a store yet.",
  INVALID_STORE_ID: "That store identifier isn't valid.",
  PRODUCT_NOT_FOUND: "We couldn't find that product.",
  PRODUCT_NOT_ACTIVE: "This product isn't currently available.",
  PRODUCT_STORE_MISMATCH: "That product doesn't belong to this store.",
  INVALID_PRODUCT_ID: "That product identifier isn't valid.",
  INVALID_VARIANT: "That product variant isn't valid.",
  INSUFFICIENT_STOCK:
    "There isn't enough stock for that quantity. Please pick less.",
  CATEGORY_IN_USE:
    "This category is in use by products. Hide it (toggle off) instead of deleting.",
  CATEGORY_INACTIVE: "This category isn't currently available.",
  CATEGORY_NAME_CONFLICT:
    "A category with that name already exists — pick a different name.",
  CATEGORY_CREATION_FAILED:
    "We couldn't create the category. Please try again.",
  CART_NOT_FOUND: "We couldn't find your cart.",
  ITEM_NOT_FOUND: "That item is no longer available.",
  ORDER_NOT_FOUND: "We couldn't find that order.",
  INVALID_ORDER_ID: "That order identifier isn't valid.",
  REVIEW_NOT_FOUND: "We couldn't find that review.",
  INVALID_REVIEW_ID: "That review identifier isn't valid.",
  SELF_PURCHASE: "You can't buy from your own store.",
  IMAGE_NOT_FOUND: "That image is no longer available.",
  MAX_IMAGES_EXCEEDED:
    "You've added too many images. Please remove some and try again.",

  // ── Booking / Queue ───────────────────────────────────────────
  BOOKING_NOT_FOUND: "We couldn't find that booking.",
  INVALID_BOOKING_ID: "That booking identifier isn't valid.",
  MISSING_BOOKING_ID: "A booking is required.",
  INVALID_BOOKING_STATUS:
    "That booking can't be updated to the requested status.",
  INVALID_STATUS_TRANSITION: "That status change isn't allowed.",
  MISSING_CANCELLED_BY: "Please tell us who is cancelling.",
  ALREADY_IN_QUEUE: "You're already in this queue.",
  PERSON_NOT_IN_QUEUE: "That person isn't in the queue.",
  QUEUE_NOT_FOUND: "We couldn't find that queue.",
  QUEUE_ADD_FAILED: "We couldn't add you to the queue. Please try again.",
  QUEUE_BOOKING_DISABLED: "This lounge isn't accepting walk-ins right now.",

  // ── Content (post / reel / comment / report / hashtag) ────────
  POST_NOT_FOUND: "We couldn't find that post.",
  REEL_NOT_FOUND: "We couldn't find that reel.",
  COMMENT_NOT_FOUND: "We couldn't find that comment.",
  REPORT_NOT_FOUND: "We couldn't find that report.",
  TARGET_NOT_FOUND: "We couldn't find what you're trying to act on.",
  PARENT_NOT_FOUND: "The thread you're replying to no longer exists.",
  PARENT_MISMATCH: "This reply doesn't belong to that thread.",
  HASHTAG_NOT_FOUND: "We couldn't find that hashtag.",
  EMPTY_POST: "You can't post empty content.",
  VIDEO_REQUIRED: "Please attach a video.",
  INVALID_TARGET_TYPE: "That content type isn't supported.",
  INVALID_DATA_ARRAY: "Some of the items aren't valid.",
  MISSING_IDS: "Please select at least one item.",
  MISSING_QUERY: "Please type something to search.",
  MISSING_SEARCH_QUERY: "Please type something to search.",
  ADMIN_SELF_DELETE: "You can't delete your own admin account.",
  NOT_DISPUTED: "There's no dispute to act on.",
}

/* ── Helpers ───────────────────────────────────────────────────── */

export function getErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined
  return (err as ApiErrorLike).code
}

export function getErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined
  return (err as ApiErrorLike).status
}

/**
 * Resolve the best human-readable message for an error.
 * Resolution order:
 *   1. `overrides[code]` (caller-supplied per-context overrides)
 *   2. `API_ERROR_MESSAGES[code]` (global friendly map)
 *   3. `err.message` (raw backend message — usually already friendly)
 *   4. `fallback`
 *   5. Generic catch-all
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
  overrides?: Record<string, string>,
): string {
  const code = getErrorCode(err)
  if (code) {
    if (overrides && overrides[code]) return overrides[code]
    if (API_ERROR_MESSAGES[code]) return API_ERROR_MESSAGES[code]
  }
  const raw = (err as Error)?.message
  if (raw && raw !== "AUTH_FAILURE" && !raw.startsWith("API Error")) return raw
  return fallback
}

/**
 * Show a toast for an error using the friendly message resolution above.
 * Returns the message that was shown so callers can re-use it.
 */
export function toastError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
  overrides?: Record<string, string>,
): string {
  const message = getErrorMessage(err, fallback, overrides)
  toast.error(message)
  return message
}
