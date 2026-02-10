"use client"

import { usePathname } from "next/navigation"

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="animate-in fade-in slide-in-from-bottom-2 my-16 flex-1 duration-300 lg:my-0 lg:pt-20"
    >
      {children}
    </div>
  )
}
