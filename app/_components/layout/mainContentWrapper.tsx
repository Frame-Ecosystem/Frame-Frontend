"use client"

import { usePathname } from "next/navigation"

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isReelsPage = pathname?.startsWith("/reels") ?? false

  return (
    <div
      key={pathname}
      className={`animate-in fade-in slide-in-from-bottom-2 flex-1 duration-300 lg:my-0 lg:pt-20 ${
        isReelsPage ? "mt-16 mb-0" : "my-16"
      }`}
    >
      {children}
    </div>
  )
}
