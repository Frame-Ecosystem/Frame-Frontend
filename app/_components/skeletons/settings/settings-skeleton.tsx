import { ErrorBoundary } from "@/app/_components/common/errorBoundary"

export function SettingsPageSkeleton() {
  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-6 p-5 pb-32 lg:px-8 lg:py-12 lg:pb-6">
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="w-full max-w-lg space-y-4">
                <div className="bg-primary/10 h-8 w-48 animate-pulse rounded" />
                <div className="space-y-3">
                  <div className="bg-primary/10 h-12 w-full animate-pulse rounded-lg" />
                  <div className="bg-primary/10 h-12 w-full animate-pulse rounded-lg" />
                  <div className="bg-primary/10 h-12 w-full animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
