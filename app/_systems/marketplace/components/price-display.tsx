"use client"

interface PriceDisplayProps {
  price: number
  compareAtPrice?: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PriceDisplay({
  price,
  compareAtPrice,
  className = "",
  size = "md",
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: { main: "text-sm font-semibold", old: "text-xs" },
    md: { main: "text-base font-semibold", old: "text-sm" },
    lg: { main: "text-xl font-bold", old: "text-base" },
  }[size]

  return (
    <div className={`flex items-baseline gap-1.5 ${className}`}>
      <span className={`text-primary ${sizeClasses.main}`}>
        {price.toFixed(2)} DT
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span
          className={`text-muted-foreground line-through ${sizeClasses.old}`}
        >
          {compareAtPrice.toFixed(2)} DT
        </span>
      )}
    </div>
  )
}
