export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-48 bg-muted-foreground/10 rounded"></div>
        <div className="h-4 w-64 bg-muted-foreground/10 rounded"></div>
      </div>
    </div>
  )
}
