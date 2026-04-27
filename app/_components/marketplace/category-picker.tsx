"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, Lightbulb, Loader2, Search } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover"
import { Input } from "@/app/_components/ui/input"
import { Button } from "@/app/_components/ui/button"
import { useProductCategories } from "@/app/_hooks/queries/useMarketplace"
import { SuggestCategoryModal } from "./suggest-category-modal"
import { cn } from "@/app/_lib/utils"
import type { ProductCategory } from "@/app/_types/marketplace"

interface CategoryPickerProps {
  value?: string
  onChange: (categoryId: string, category: ProductCategory) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Show "Suggest a category" footer link (default: true). */
  allowSuggest?: boolean
}

export function CategoryPicker({
  value,
  onChange,
  placeholder = "Select a category…",
  disabled,
  className,
  allowSuggest = true,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [suggestOpen, setSuggestOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useProductCategories({
    activeOnly: true,
  })
  const all = useMemo(() => data?.data ?? [], [data?.data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    )
  }, [all, search])

  const selected = all.find((c) => c._id === value)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "border-input bg-background ring-offset-background flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span
              className={cn(
                "truncate",
                !selected && "text-muted-foreground font-normal",
              )}
            >
              {selected ? selected.name : placeholder}
            </span>
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <div className="border-border border-b p-2">
            <div className="relative">
              <Search
                size={14}
                className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="h-8 pl-8 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : isError ? (
              <div className="space-y-2 py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Couldn&apos;t load categories.
                </p>
                <Button size="sm" variant="ghost" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No matches.
              </p>
            ) : (
              <ul role="listbox" className="space-y-0.5">
                {filtered.map((c) => {
                  const active = c._id === value
                  return (
                    <li key={c._id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(c._id, c)
                          setOpen(false)
                          setSearch("")
                        }}
                        className={cn(
                          "hover:bg-muted flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                          active && "bg-primary/10 text-primary font-medium",
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {c.icon && <span aria-hidden>{c.icon}</span>}
                          <span className="truncate">{c.name}</span>
                        </span>
                        {active && <Check size={14} />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {allowSuggest && (
            <div className="border-border border-t p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setSuggestOpen(true)
                }}
                className="text-primary hover:bg-primary/5 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-medium transition-colors"
              >
                <Lightbulb size={14} />
                Can&apos;t find it? Suggest a category
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {allowSuggest && (
        <SuggestCategoryModal
          open={suggestOpen}
          onOpenChange={setSuggestOpen}
          initialName={search}
        />
      )}
    </>
  )
}
