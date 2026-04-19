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
import { getSocket } from "@/app/_services/socket"

/**
 * Subscribe to Socket.IO room(s) and listen for events.
 * Automatically joins on mount / reconnect, leaves on unmount.
 *
 * @param rooms  Room name(s) to join. Accepts a single string or an array.
 * @param events Record of `{ eventName: handler }` pairs to register.
 */
export function useSocketRoom(
  rooms: string | string[],

  events: Record<string, (data: any) => void>,
) {
  const joinedRoomsRef = useRef<string[]>([])
  const eventsRef = useRef(events)
  eventsRef.current = events

  // Stabilise rooms identity: join a string so the effect only re-runs
  // when the actual room names change, not on every render.
  const roomKey = Array.isArray(rooms)
    ? rooms.filter(Boolean).join(",")
    : rooms || ""

  useEffect(() => {
    const roomList = Array.isArray(rooms) ? rooms : [rooms]
    const validRooms = roomList.filter(Boolean)
    if (validRooms.length === 0) return

    const socket = getSocket()

    // ── Helper to (re-)join rooms ───────────────────────────
    const joinRooms = () => {
      socket.emit("join", validRooms)
    }

    // Join now if already connected
    if (socket.connected) {
      joinRooms()
    }

    // Re-join rooms on every (re)connect so server-side
    // membership is restored after a disconnect.
    socket.on("connect", joinRooms)

    joinedRoomsRef.current = validRooms

    // ── Register event listeners (via ref for fresh handlers) ─
    const entries = Object.entries(eventsRef.current)
    const wrappedHandlers = entries.map(([event, _]) => {
      const handler = (data: any) => eventsRef.current[event]?.(data)
      socket.on(event, handler)
      return [event, handler] as const
    })

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      socket.off("connect", joinRooms)
      socket.emit("leave", joinedRoomsRef.current)
      wrappedHandlers.forEach(([event, handler]) => {
        socket.off(event, handler)
      })
      joinedRoomsRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey])
}
