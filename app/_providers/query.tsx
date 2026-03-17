"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"

/** Auth failures are already handled by the ApiClient (redirect to sign-in). */
const isAuthFailure = (err: unknown) =>
  err instanceof Error && err.message === "AUTH_FAILURE"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (isAuthFailure(error)) return false
              return failureCount < 1
            },
            throwOnError: (error) => !isAuthFailure(error),
          },
          mutations: {
            retry: false,
            throwOnError: (error) => !isAuthFailure(error),
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
