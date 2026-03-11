export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="animate-pulse space-y-2">
        <div className="bg-muted-foreground/10 h-4 w-48 rounded"></div>
        <div className="bg-muted-foreground/10 h-4 w-64 rounded"></div>
      </div>
    </div>
  )
}
