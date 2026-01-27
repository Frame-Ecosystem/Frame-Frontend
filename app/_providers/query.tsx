"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const defaultQueryOptions = {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      // Enable suspense and error boundary behavior — cast to any for compatibility
      suspense: true,
      useErrorBoundary: true,
    } as unknown as any

    return new QueryClient({
      defaultOptions: {
        queries: defaultQueryOptions,
      },
    })
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
