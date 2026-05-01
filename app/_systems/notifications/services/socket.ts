/**
 * @file socket.ts
 * @description Singleton Socket.IO client for real-time WebSocket subscriptions.
 * Connects to the same backend as the REST API (port 3000).
 */

import { io, Socket } from "socket.io-client"
import { API_BASE_URL, apiClient } from "@/app/_core/api/api"
import { clientDebug } from "@/app/_lib/client-logger"

let socket: Socket | null = null

/**
 * Get (or lazily create) the singleton Socket.IO connection.
 * Uses the Socket.IO `auth` option to securely pass the access token
 * (never exposed in URLs or query strings).
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      auth: (cb) => {
        // Dynamically read token at connection time so reconnects use fresh tokens
        cb({ token: apiClient.accessToken })
      },
    })

    socket.on("connect", () => {
      clientDebug("[socket] connected:", socket?.id)
    })

    socket.on("disconnect", (reason) => {
      clientDebug("[socket] disconnected:", reason)
    })

    socket.on("connect_error", (err) => {
      console.warn("[socket] connection error:", err.message)
    })
  }

  // If the socket exists but is disconnected, reconnect (guard against concurrent calls)
  if (!socket.connected && !socket.active) {
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
