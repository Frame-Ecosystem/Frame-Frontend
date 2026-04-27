import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE_NAME?.trim() || "refreshToken"

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/google/callback",
  "/auth/google/done",
  "/auth/google/error",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/auth/check-email",
  "/sentry-example-page",
])

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname)
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/firebase-messaging-sw.js" ||
    /\.[a-z0-9]+$/i.test(pathname)
  )
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith("/api/v1")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "Local mock API routes are disabled in production." },
        { status: 404 },
      )
    }

    return NextResponse.next()
  }

  if (isStaticAsset(pathname) || isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  if (hasSession) {
    return NextResponse.next()
  }

  const signInUrl = request.nextUrl.clone()
  signInUrl.pathname = "/"
  signInUrl.searchParams.set("signin", "true")
  signInUrl.searchParams.set("next", `${pathname}${search}`)

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
