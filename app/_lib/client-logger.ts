const isProd = process.env.NODE_ENV === "production"
const allowProdLogs = process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGS === "true"

function shouldLog(): boolean {
  return !isProd || allowProdLogs
}

export function clientLog(...args: unknown[]): void {
  if (!shouldLog()) return
  console.log(...args)
}

export function clientDebug(...args: unknown[]): void {
  if (!shouldLog()) return
  console.debug(...args)
}
