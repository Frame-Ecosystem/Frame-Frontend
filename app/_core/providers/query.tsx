"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { isCsrfError } from "@/app/_core/api/api"

/** Auth failures are already handled by the ApiClient (redirect to sign-in). */
const isAuthFailure = (err: unknown) =>
  err instanceof Error && err.message === "AUTH_FAILURE"

/** CSRF misses are transient in first-load race windows; don't crash UI. */
const isRecoverableMutationError = (err: unknown) =>
  isAuthFailure(err) || isCsrfError(err)

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (isRecoverableMutationError(error)) return false
              return failureCount < 2
            },
            throwOnError: (error) => !isRecoverableMutationError(error),
          },
          mutations: {
            retry: false,
            throwOnError: (error) => !isRecoverableMutationError(error),
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
