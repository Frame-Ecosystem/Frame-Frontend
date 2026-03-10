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

/**
 * Subscribe to Socket.IO room(s) and listen for events.
 * Automatically joins on mount / reconnect, leaves on unmount.
 *
 * @param rooms  Room name(s) to join. Accepts a single string or an array.
 * @param events Record of `{ eventName: handler }` pairs to register.
 */
export function useSocketRoom(
  rooms: string | string[],
  // eslint-disable-next-line no-unused-vars
  events: Record<string, (data: any) => void>,
) {
  const joinedRoomsRef = useRef<string[]>([])

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

    // ── Register event listeners ────────────────────────────
    const entries = Object.entries(events)
    entries.forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      socket.off("connect", joinRooms)
      socket.emit("leave", joinedRoomsRef.current)
      entries.forEach(([event, handler]) => {
        socket.off(event, handler)
      })
      joinedRoomsRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rooms)])
}
