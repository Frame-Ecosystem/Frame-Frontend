/**
 * @file socket.ts
 * @description Singleton Socket.IO client for real-time WebSocket subscriptions.
 * Connects to the same backend as the REST API (port 3000).
 */

import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "./api"

let socket: Socket | null = null

/**
 * Get (or lazily create) the singleton Socket.IO connection.
 * Sends the access token from localStorage as an auth credential
 * so the backend can authenticate the socket.
 */
export function getSocket(): Socket {
  if (!socket) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socket.on("connect", () => {
      console.log("[socket] connected", socket?.id)
    })

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason)
    })

    socket.on("connect_error", (err) => {
      console.warn("[socket] connection error:", err.message)
    })

    // Debug: log ALL incoming events so we can see what the server sends
    socket.onAny((eventName, ...args) => {
      console.log("[socket] event received:", eventName, args)
    })
  }

  // If the socket exists but is disconnected, reconnect
  if (!socket.connected) {
    // Update auth token before reconnecting
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    socket.auth = { token }
    socket.connect()
  }

  return socket
}

/**
 * Disconnect and destroy the singleton socket instance.
 * Called on logout / auth failure.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
