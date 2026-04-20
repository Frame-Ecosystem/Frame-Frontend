"use client"

import { usePathname } from "next/navigation"

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isReelsPage = pathname?.startsWith("/reels") ?? false
  const isAdminPage = pathname?.startsWith("/admin") ?? false

  return (
    <div
      key={pathname}
      className={`animate-in fade-in slide-in-from-bottom-2 flex-1 duration-300 lg:my-0 lg:pt-20 ${
        isReelsPage
          ? "mt-16 mb-0"
          : isAdminPage
            ? "my-16 lg:my-0"
            : "mt-16 mb-0 pb-[calc(var(--mobile-nav-height)+8px)] lg:pb-0"
      }`}
    >
      {children}
    </div>
  )
}
