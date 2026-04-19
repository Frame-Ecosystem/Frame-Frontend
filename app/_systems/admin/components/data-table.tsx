"use client"

import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/app/_components/ui/skeleton"

interface DataTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

interface DataTablePaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  total,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        {total} result{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 max-w-sm flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border-border flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="text-muted-foreground mb-4 [&_svg]:h-12 [&_svg]:w-12">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
