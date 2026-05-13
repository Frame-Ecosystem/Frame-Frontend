/**
 * @file sessions-manager.ts
 * @description Manages multiple user sessions stored in localStorage.
 * Allows users to maintain multiple authenticated sessions and switch between them.
 *
 * Storage format:
 *   localStorage['frame:sessions'] = [{
 *     id: unique session ID,
 *     user: User object,
 *     timestamp: when session was created/updated,
 *     isActive: whether this is the current active session,
 *     createdAt: ISO timestamp for display,
 *     deviceId: device identifier (iOS, Android, Windows, etc.)
 *   }, ...]
 *
 * Industry Best Practices:
 * - Store session metadata for multi-device tracking
 * - Include device fingerprints to help users identify which device has sessions
 * - Maintain creation timestamps for sorting/display in UI
 * - Support session switching with setActiveSession()
 */

import type { User } from "../../_types"

export interface StoredSession {
  id: string
  user: User
  timestamp: number
  isActive: boolean
  /** ISO timestamp when session was created - for sorting/display */
  createdAt: string
  /** Device/browser identifier - helps user identify which device has this session */
  deviceId?: string
}

const SESSIONS_STORAGE_KEY = "frame:sessions"
const MAX_STORED_SESSIONS = 5

/**
 * Generate unique session ID based on user _id and timestamp
 */
function generateSessionId(user: User): string {
  return `${user._id}-${Date.now()}`
}

/**
 * Generate a device fingerprint for this browser/device
 * Used to help identify which device a session was created on
 */
function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/iPhone|iPad/.test(ua)) return "iOS"
  if (/Android/.test(ua)) return "Android"
  if (/Windows/.test(ua)) return "Windows"
  if (/Macintosh/.test(ua)) return "macOS"
  if (/Linux/.test(ua)) return "Linux"
  return "Web"
}

/**
 * Get all stored sessions from localStorage
 */
export function getAllSessions(): StoredSession[] {
  try {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get active session (marked as isActive = true)
 */
export function getActiveSession(): StoredSession | null {
  const sessions = getAllSessions()
  return sessions.find((s) => s.isActive) || null
}

/**
 * Get session by user ID
 */
export function getSessionByUserId(userId: string): StoredSession | null {
  const sessions = getAllSessions()
  return sessions.find((s) => s.user._id === userId) || null
}

/**
 * Save a new session or update existing one for a user
 * Automatically marks the new session as active
 * Removes old sessions if max limit exceeded
 * Follows industry best practice: store with device info for multi-device tracking
 */
export function saveSession(user: User): StoredSession {
  if (typeof window === "undefined") {
    const now = Date.now()
    return {
      id: generateSessionId(user),
      user,
      timestamp: now,
      isActive: true,
      createdAt: new Date(now).toISOString(),
      deviceId: "unknown",
    }
  }

  const now = Date.now()
  const sessions = getAllSessions()
  const userId = user._id

  // Clean up old sessions for this user to prevent accumulation
  const filteredSessions = sessions.filter((s) => s.user._id !== userId)

  // Mark all remaining sessions as inactive (only new session will be active)
  filteredSessions.forEach((s) => {
    s.isActive = false
  })

  // Get device identifier for this browser
  const deviceId = getDeviceFingerprint()

  // Create new session with metadata
  const newSession: StoredSession = {
    id: generateSessionId(user),
    user,
    timestamp: now,
    isActive: true,
    createdAt: new Date(now).toISOString(),
    deviceId,
  }

  // Sort by creation time (newest first) and keep max sessions
  const allSessions = [newSession, ...filteredSessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_STORED_SESSIONS)

  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(allSessions))
  } catch {
    // localStorage full or unavailable
  }

  return newSession
}

/**
 * Set a session as active by session ID
 * Used when switching to a stored session
 */
export function setActiveSession(sessionId: string): StoredSession | null {
  const sessions = getAllSessions()

  const sessionsUpdated = sessions.map((s) => ({
    ...s,
    isActive: s.id === sessionId,
  }))

  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsUpdated))
  } catch {
    // localStorage full or unavailable
  }

  return sessionsUpdated.find((s) => s.id === sessionId) || null
}

/**
 * Remove a specific session by session ID
 */
export function removeSession(sessionId: string): void {
  if (typeof window === "undefined") return

  const sessions = getAllSessions()
  const filtered = sessions.filter((s) => s.id !== sessionId)

  // If we removed the active session, mark the first remaining as active
  if (filtered.length > 0 && !filtered.some((s) => s.isActive)) {
    filtered[0].isActive = true
  }

  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Clear all stored sessions (logout from all devices)
 */
export function clearAllSessions(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY)
  } catch {
    // localStorage unavailable
  }
}

/**
 * Check if any sessions are stored
 */
export function hasStoredSessions(): boolean {
  return getAllSessions().length > 0
}

/**
 * Get total count of stored sessions
 * Used for UI display (e.g., "2 sessions saved")
 */
export function getSessionCount(): number {
  return getAllSessions().length
}
