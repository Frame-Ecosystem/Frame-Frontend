import { Card, CardContent } from "@/app/_components/ui/card"

export function BookingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <div className="bg-muted/30 border-b px-3 py-2">
            <div className="flex justify-center">
              <div className="bg-primary/10 h-12 w-12 animate-pulse rounded-full" />
            </div>
          </div>
          <CardContent className="p-3">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <div className="bg-primary/10 h-4 w-24 animate-pulse rounded" />
                    <div className="bg-primary/10 h-4 w-16 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
