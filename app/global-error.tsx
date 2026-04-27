"use client"

import NextError from "next/error"
import { reportError } from "@/app/_lib/report-error"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  reportError(error, { source: "global-error", digest: error.digest })

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
