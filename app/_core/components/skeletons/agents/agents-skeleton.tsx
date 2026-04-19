export function AgentListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="space-y-6">
          <div className="bg-primary/10 h-8 w-56 animate-pulse rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 h-10 w-10 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-primary/10 h-4 w-28 animate-pulse rounded" />
                    <div className="bg-primary/10 h-3 w-20 animate-pulse rounded" />
                  </div>
                </div>
                <div className="bg-primary/10 h-3 w-full animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AgentTableRowsSkeleton({
  count = 5,
  isAdmin = false,
}: {
  count?: number
  isAdmin?: boolean
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <tr key={`skeleton-${index}`} className="border-b">
          {isAdmin && (
            <td className="p-2 align-middle">
              <div className="bg-muted-foreground/10 h-4 w-4 animate-pulse rounded" />
            </td>
          )}
          <td className="p-2 align-middle">
            <div className="flex items-center gap-3">
              <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded-full" />
              <div className="bg-muted-foreground/10 mb-1 h-4 w-32 animate-pulse rounded" />
            </div>
          </td>
          <td className="p-2 align-middle">
            <div className="bg-muted-foreground/10 h-6 w-16 animate-pulse rounded-full" />
          </td>
          <td className="p-2 align-middle">
            <div className="bg-muted-foreground/10 h-4 w-20 animate-pulse rounded" />
          </td>
          {isAdmin && (
            <td className="p-2 align-middle">
              <div className="bg-muted-foreground/10 h-4 w-24 animate-pulse rounded" />
            </td>
          )}
          <td className="p-2 align-middle">
            <div className="bg-muted-foreground/10 h-8 w-8 animate-pulse rounded" />
          </td>
        </tr>
      ))}
    </>
  )
}
