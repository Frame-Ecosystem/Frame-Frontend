"use client"

import { Heart } from "lucide-react"
import { useToggleWishlist } from "@/app/_hooks/queries/useMarketplace"
import { toast } from "sonner"

interface WishlistButtonProps {
  productId: string
  isInWishlist: boolean
  className?: string
}

export function WishlistButton({
  productId,
  isInWishlist,
  className = "",
}: WishlistButtonProps) {
  const toggle = useToggleWishlist(productId, isInWishlist)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toggle.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        )
      },
      onError: () => toast.error("Something went wrong"),
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`rounded-full p-2 transition-all disabled:opacity-50 ${
        isInWishlist
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-900/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      } ${className}`}
    >
      <Heart size={18} className={isInWishlist ? "fill-rose-500" : ""} />
    </button>
  )
}
