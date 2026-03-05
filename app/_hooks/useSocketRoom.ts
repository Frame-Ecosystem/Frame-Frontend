/**
 * @file useSocketRoom.ts
 * @description React hook that joins Socket.IO rooms and listens
 *   for events, automatically cleaning up when rooms/events change
 *   or the component unmounts.
 *
 *   Handles reconnection: rooms are re-joined on every `connect`
 *   event so the server-side room membership is restored.
 */

import { useEffect, useRef } from "react"
import { getSocket } from "../_services/socket"

interface SocketEventHandler {
  /** The event name to listen for, e.g. `queue:updated` */
  event: string
  /** Callback invoked with the event payload */
  // eslint-disable-next-line no-unused-vars
  handler: (...args: any[]) => void
}

/**
 * Join one or more Socket.IO rooms and subscribe to events.
 *
 * @param rooms  Array of room names to join (falsy entries are filtered out).
 * @param events Array of `{ event, handler }` pairs to register.
 * @param enabled Whether the subscriptions should be active (default `true`).
 *
 * The hook automatically:
 * - emits `room:join` for each room on subscribe (and on every reconnect)
 * - emits `room:leave` for each room on cleanup
 * - registers / deregisters event listeners
 */
export function useSocketRoom(
  rooms: (string | null | undefined)[],
  events: SocketEventHandler[],
  enabled = true,
) {
  // Keep a stable ref to the current rooms so the cleanup always
  // leaves the correct set even if `rooms` changes between renders.
  const joinedRoomsRef = useRef<string[]>([])

  useEffect(() => {
    if (!enabled) return

    const validRooms = rooms.filter(Boolean) as string[]
    if (validRooms.length === 0 && events.length === 0) return

    const socket = getSocket()

    // ── Helper to (re-)join rooms ───────────────────────────
    const joinRooms = () => {
      for (const room of validRooms) {
        console.log("[useSocketRoom] joining", room)
        socket.emit("room:join", room)
      }
    }

    // Join now if already connected
    if (socket.connected) {
      joinRooms()
    }

    // Re-join rooms on every (re)connect so server-side
    // membership is restored after a disconnect.
    socket.on("connect", joinRooms)

    joinedRoomsRef.current = validRooms

    // ── Register event listeners ────────────────────────────
    for (const { event, handler } of events) {
      console.log("[useSocketRoom] listening for", event)
      socket.on(event, handler)
    }

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      socket.off("connect", joinRooms)
      for (const room of joinedRoomsRef.current) {
        socket.emit("room:leave", room)
      }
      for (const { event, handler } of events) {
        socket.off(event, handler)
      }
      joinedRoomsRef.current = []
    }
    // We intentionally stringify rooms for a stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    JSON.stringify(rooms),
    JSON.stringify(events.map((e) => e.event)),
  ])
}
