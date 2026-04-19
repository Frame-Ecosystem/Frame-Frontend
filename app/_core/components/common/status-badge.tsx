import { Badge } from "@/app/_components/ui/badge"

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  completed: { label: "Completed", variant: "default" },
  confirmed: { label: "Confirmed", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  inQueue: { label: "In Queue", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  absent: { label: "Absent", variant: "outline" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "outline" as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
