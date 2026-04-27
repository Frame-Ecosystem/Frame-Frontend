import { NextRequest, NextResponse } from "next/server"

/**
 * Next.js 16+ `proxy` (formerly middleware).
 *
 * Only handles production safety for local mock Route Handlers.
 *
 * We intentionally do NOT gate HTML/RSC navigations on the `refreshToken`
 * cookie here: that cookie is set on the API host when the frontend and API
 * are on different origins, so it is often absent on the Next.js origin. A
 * redirect in that case breaks client-side navigation after login (blank
 * main content, headers still client-rendered). Session enforcement stays on
 * the backend; the app uses `AuthGuard` for UX on the client.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/v1") && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Local mock API routes are disabled in production." },
      { status: 404 },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
